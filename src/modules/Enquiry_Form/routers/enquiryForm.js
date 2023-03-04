import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { enquiryFormService } from '../services/enquiryForm.js';

const router = new Router();

router.post(
     '/add-enquireForm',
     httpHandler(async (req, res) => {
          try {
               const result = await enquiryFormService.addForm(req.body);
               if (result.receiveUpdates) {
                    sendEmail(result);
               }
               return res
                    .status(201)
                    .json({
                         success: true,
                         data: result,
                         message: 'Enquiry created successfully',
                    });
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

               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

const sendEmail = (enquiry) => {
     const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
               user: 'your-email@gmail.com',
               pass: 'your-password',
          },
     });

     const mailOptions = {
          from: 'your-email@gmail.com',
          to: enquiry.email,
          subject: 'Thank you for your enquiry',
          text: 'Thank you for your enquiry. We will get back to you as soon as possible.',
     };

     transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
               console.log(err);
          } else {
               console.log('Email sent: ' + info.response);
          }
     });
};

export default router;
