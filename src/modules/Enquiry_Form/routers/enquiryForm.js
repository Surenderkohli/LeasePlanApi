import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { enquiryFormService } from '../services/enquiryForm.js';
import carDetailModel from '../../Inventory/models/carDetails.js';
import carBrandModel from '../../Inventory/models/carBrand.js';
import carOfferModel from '../../Inventory/models/carOffer.js';
import puppeteer from 'puppeteer';

const router = new Router();

router.post(
     '/add-enquireForm',
     httpHandler(async (req, res) => {
          try {
               try {
                    /* 
                    - Need to add the following fields to the enquiryForm collection:
                         -  name : firstName + lastName
                         -  mobileNumber : mobileNumber
                         -  emailAddress : emailAddress
                    */

                    // Retrieve car offers using relevant query and criteria
                    const { carOffers_id } = req.body;

                    // Retrieve car details using carId from carOffers collection
                    const carOffers = await carOfferModel.findById({
                         _id: carOffers_id,
                    });
                    // .populate({
                    //      path: 'leaseType_id',
                    //      model: 'leaseType',
                    // })
                    // .exec();

                    // Extract relevant fields from carOffers documentq
                    const { carBrand_id, carSeries_id, leaseType, term } =
                         carOffers;

                    console.log(carOffers);

                    if (!carOffers) {
                         throw new Error('Car offers not found');
                    }

                    // Extract the leaseType data from the populated carOffer document
                    // const leaseTypes = carOffers.leaseType_id;

                    // const leaseTypeValues = leaseTypes.map(
                    //      (type) => type.leaseType
                    // );

                    //  const term = carOffers.leaseType_id;
                    //  let terms = term.map((type) => type.term);

                    // Use find() method to retrieve the matching carOffers document with populated leaseType data
                    const carDetails = await carDetailModel.findOne({
                         carBrand_id: carBrand_id,
                         carSeries_id: carSeries_id,
                         //yearModel: yearModel,
                    });

                    const { fuelType, gears } = carDetails;

                    if (!carDetails) {
                         throw new Error('Car  details not found');
                    }

                    // Retrieve carBrand name using carBrandId from carbrands collection
                    const carBrand = await carBrandModel.findById({
                         _id: carBrand_id,
                    });

                    if (!carBrand) {
                         throw new Error('Lease type details not found');
                    }

                    const { companyName } = carBrand;

                    const enquiryData = {
                         // upfrontCost: req.query.upfrontCost,
                         // upfrontPayment: req.query.upfrontPayment,
                         fuelType,
                         gears,
                         leaseType,
                         term,
                         // leaseTypeValues,
                         // terms,
                         companyName,
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
                         throw new Error('Error sending enquiry email');
                    }
                    res.status(200).json({
                         success: true,
                         msg: 'Thank you for your enquiry!',
                         enquiryId,
                         data: enquiryData,
                    });
               } catch (error) {
                    console.log(error);
                    res.status(500).send('Error sending enquiry email');
               }
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
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

//https://gitlab.com/plaxoniclabs/projects/leaseplan/api/-/commit/e910bce87c4a043ec75bd7c4ebf479a71c852766 - In this commit, I have changed carDetails_id to carOffers_id in the enquiryForm model
export default router;
