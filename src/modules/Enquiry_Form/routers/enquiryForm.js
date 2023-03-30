import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { enquiryFormService } from '../services/enquiryForm.js';
import carDetailModel from '../../Inventory/models/carDetails.js';
import leaseTypeModel from '../../Inventory/models/leaseType.js';
import carBrandModel from '../../Inventory/models/carBrand.js';
import puppeteer from 'puppeteer';

const router = new Router();

router.post(
     '/add-enquireForm',
     httpHandler(async (req, res) => {
          try {
               try {
                    // Retrieve car details using relevant query and criteria
                    const { monthlyLeasePrice } = req.query;
                    const { carDetails_id } = req.body;

                    // Retrieve car details using carId from carDetails collection
                    const carDetails = await carDetailModel.findById({
                         _id: carDetails_id,
                    });
                    if (!carDetails) {
                         throw new Error('Car details not found');
                    }

                    // Extract relevant fields from carDetails
                    const { fuelType, gears, leaseType_id, carBrand_id } =
                         carDetails;

                    // Retrieve lease type details using leaseTypeId from leasetypes collection
                    const leaseTypes = await leaseTypeModel.findById({
                         _id: leaseType_id,
                    });

                    if (!leaseTypes) {
                         throw new Error('Lease type details not found');
                    }

                    const { leaseType } = leaseTypes;

                    // Retrieve carBrand name using carBrandId from carbrands collection
                    const carBrand = await carBrandModel.findById({
                         _id: carBrand_id,
                    });

                    if (!carBrand) {
                         throw new Error('Lease type details not found');
                    }

                    const { companyName } = carBrand;

                    const enquiryData = {
                         contractLengthInMonth: req.query.contractLengthInMonth,
                         annualMileage: req.query.annualMileage,
                         upfrontCost: req.query.upfrontCost,
                         upfrontPayment: req.query.upfrontPayment,
                         fuelType,
                         gears,
                         leaseType,
                         companyName,
                         monthlyLeasePrice,
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

//https://www.npmjs.com/package/puppeteer
router.get(
     '/:id/download',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const result = await enquiryFormService.getSingleForm(id);

               const browser = await puppeteer.launch();
               const page = await browser.newPage();

               // Add the HTML code to the page
               await page.setContent(result[0].htmlTemplate);

               const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
               });
               await browser.close();

               res.setHeader('Content-Type', 'application/pdf');

               res.send(pdfBuffer);
          } catch (error) {
               res.status(400).send({ success: false, msg: error.message });
          }
     })
);

export default router;
