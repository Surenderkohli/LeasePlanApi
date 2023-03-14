import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { enquiryFormService } from '../services/enquiryForm.js';

const router = new Router();

router.post(
     '/add-enquireForm',
     httpHandler(async (req, res) => {
          try {
               try {
                    const enquiryData = {
                         leaseType: req.query.leaseType,
                         contractLengthInMonth: req.query.contractLengthInMonth,
                         annualMileage: req.query.annualMileage,
                         upfrontCost: req.query.upfrontCost,
                         fuelType: req.query.fuelType,
                         gears: req.query.gears,
                         upfrontPayment: req.query.upfrontPayment,
                    };
                    const enquireFormData = req.body;

                    const emailSent = await enquiryFormService.sendEnquiryEmail(
                         enquiryData,
                         enquireFormData
                    );

                    if (emailSent) {
                         res.status(200).json({
                              success: true,
                              msg: 'Thank you for your enquiry!',
                         });
                    } else {
                         throw new Error('Error sending enquiry email');
                    }
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

               res.status(200).json({ success: true, data: result });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

export default router;
