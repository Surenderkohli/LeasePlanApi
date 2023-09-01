import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { enquiryFormService } from '../services/enquiryForm.js';
import carDetailModel from '../../Inventory/models/carDetails.js';
import carBrandModel from '../../Inventory/models/carBrand.js';
import carOfferModel from '../../Inventory/models/carOffer.js';
import puppeteer from 'puppeteer';
import carSeriesModel from '../../Inventory/models/carSeries.js';


const router = new Router();

router.post(
     '/add-enquireForm',
     httpHandler(async (req, res) => {
          try {
               // Validate incoming data
               const { carOffers_id } = req.body;
               if (!carOffers_id) {
                    return res.status(400).json({
                         success: false,
                         msg: 'Missing carOffers_id in the request body',
                    });
               }

               // Retrieve car offers using relevant query and criteria
               const carOffers = await carOfferModel.findById({
                    _id: carOffers_id,
               });

               if (!carOffers) {
                    return res.status(400).json({
                         success: false,
                         msg: 'Car offers not found with the provided carOffers_id',
                    });
               }

               const { carBrand_id, carSeries_id, leaseType, term } = carOffers;

               const carDetails = await carDetailModel.findOne({
                    carBrand_id: carBrand_id,
                    carSeries_id: carSeries_id,
               });

               if (!carDetails) {
                    return res.status(400).json({
                         success: false,
                         msg: 'Car details not found for the given carBrand_id and carSeries_id',
                    });
               }

               const carBrand = await carBrandModel.findById({
                    _id: carBrand_id,
               });

               if (!carBrand) {
                    return res.status(400).json({
                         success: false,
                         msg: 'Car brand not found with the provided carBrand_id',
                    });
               }

               const carSeries = await carSeriesModel.findById({
                    _id:carSeries_id
               })

               if(!carSeries){
                    return res.status(400).json({
                         success: false,
                         msg: 'Car series not found with the provided carSeries_id',
                    });

               }

               const { fuelType, gears } = carDetails;
               const { companyName } = carBrand;
               const { seriesName } = carSeries;

               const enquiryData = {
                    fuelType,
                    gears,
                    leaseType,
                    term,
                    companyName,
                    seriesName,
                    duration: req.query.duration,
                    annualMileage: req.query.annualMileage,
                    monthlyCost: req.query.monthlyCost,
               };
               const enquireFormData = req.body;

               const enquiryId = await enquiryFormService.sendEnquiryEmail(
                    enquiryData,
                    enquireFormData
               );
               if (!enquiryId) {
                    return res.status(400).json({
                         success: false,
                         msg: 'Error sending enquiry email, Missing Enquiry Id',
                    });
               }
               return res.status(200).json({
                    success: true,
                    msg: 'Thank you for your enquiry!',
                    enquiryId,
                    data: enquiryData,
               });
          } catch (error) {
               console.log(error);
               return res.status(500).send('Error sending enquiry email');
          }
     })
);

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const result = await enquiryFormService.getAllForm();

               res.status(200).json({ success: true, data: result });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/:id',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const result = await enquiryFormService.getSingleForm(id);
               res.status(200).json({ success: true, data: result[0] });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/forms/count',
     httpHandler(async (req, res) => {
          try {
               const count = await enquiryFormService.getCount();
               res.status(200).json({ success: true, count });
          } catch (error) {
               res.status(400).json({ success: false, error: error.message });
          }
     })
);

//https://www.npmjs.com/package/puppeteer[ https://pptr.dev/troubleshooting ]

router.get(
     '/:id/download',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const result = await enquiryFormService.getSingleForm(id);

               const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add these arguments to prevent errors in production
                    headless: true, // Run Puppeteer in headless mode on the server
               });

               const page = await browser.newPage();

               // Set the viewport size to ensure that the content fits on the page
               await page.setViewport({
                    width: 1920,
                    height: 1080,
                    deviceScaleFactor: 1,
               });

               // Add the HTML code to the page
               await page.setContent(result[0].htmlTemplate);

               const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    scale: 0.75, // Adjust the scale factor to fit more content onto a single page
               });

               await browser.close();

               res.setHeader('Content-Type', 'application/pdf');
               res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=download.pdf'
               );
               res.setHeader('Content-Length', pdfBuffer.length);

               res.send(pdfBuffer);
          } catch (error) {
               res.status(400).send({ success: false, msg: error.message });
          }
     })
);

router.put('/status/:formId', async (req, res) => {
     const { formId } = req.params;
     const { status } = req.body; // Changed variable name to "status"

     try {
          const updatedForm = await enquiryFormService.updateEnquiryStatus(
               formId,
               status
          );
          res.status(200).json({ success: true, data: updatedForm });
     } catch (error) {
          res.status(400).json({ success: false, error: error.message });
     }
});

// Get enquiry forms by status route
router.get('/enquiry-status/list', async (req, res) => {
     const { status } = req.query;

     try {
          const forms = await enquiryFormService.getEnquiryFormsByStatus(
               status
          );
          res.status(200).json({ success: true, data: forms });
     } catch (error) {
          res.status(400).json({ success: false, error: error.message });
     }
});

export default router;
