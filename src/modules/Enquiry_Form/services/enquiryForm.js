import enquiryFormModel from '../models/enquiryForm.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const addForm = async (data) => {
     const response = await enquiryFormModel.create(data);
     return response;
};

const getAllForm = async () => {
     const response = await enquiryFormModel.find();
     return response;
};

const getSingleForm = async (id) => {
     const aggregateFilter = [
          {
               $match: {
                    _id: mongoose.Types.ObjectId(id),
               },
          },
          {
               $lookup: {
                    from: 'cardetails',
                    localField: 'carDetails_id',
                    foreignField: '_id',
                    as: 'carDetails',
               },
          },
     ];

     const result = await enquiryFormModel.aggregate(aggregateFilter);

     return result;
};

const sendEnquiryEmail = async (enquiryData, enquireFormData) => {
     try {
          // Create a transporter object for sending emails
          let transporter = nodemailer.createTransport({
               host: 'smtp.ethereal.email',
               port: 587,
               auth: {
                    user: 'cecelia.kemmer82@ethereal.email',
                    pass: 'ec2PXdMBXBPAuDHyhq',
               },
          });

          const message = `
          <html>
               <head>
                    <style>
                         body {
                              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                              font-size: 16px;
                              color: #333;
                         }
                         h1 {
                              font-size: 28px;
                              font-weight: bold;
                              margin-bottom: 32px;
                         }
                         h2 {
                              font-size: 24px;
                              font-weight: bold;
                              margin-bottom: 16px;
                         }
                         ul {
                              list-style: none;
                              margin: 0;
                              padding: 0;
                         }
                         li {
                              margin-bottom: 16px;
                         }
                         .header {
                              background-color: #F7D488;
                              color: #333;
                              padding: 32px;
                              text-align: center;
                              border-radius: 8px 8px 0 0;
                         }
                         .content {
                              padding: 32px;
                              background-color: #FFF9EB;
                              border-radius: 0 0 8px 8px;
                         }
                         .label {
                              font-size: 20px;
                              font-weight: bold;
                              margin-right: 16px;
                         }
                    </style>
               </head>
               <body>
                    <div class="header">
                         <h1>Car Lease Enquiry</h1>
                         <p>Thank you for your interest in our car lease services. Please find below the details of your enquiry:</p>
                    </div>
                    <div class="content">
                         <h2>Enquiry Details</h2>
                         <ul>
                              <li>
                                   <span class="label">Lease Type:</span> ${enquiryData.leaseType}
                              </li>
                              <li>
                                   <span class="label">Contract Type:</span> ${enquiryData.contractLengthInMonth} months
                              </li>
                              <li>
                                   <span class="label">Annual Mileage:</span> ${enquiryData.annualMileage} miles
                              </li>
                              <li>
                                   <span class="label">Upfront Payment:</span> ${enquiryData.upfrontPayment}
                              </li>
                              <li>
                                   <span class="label">Fuel Type:</span> ${enquiryData.fuelType}
                              </li>
                              <li>
                                   <span class="label">Gearbox Type:</span> ${enquiryData.gears}
                              </li>
                              <li>
                                   <span class="label">Upfront Cost:</span> ${enquiryData.upfrontCost}
                              </li> 
                         </ul>
                    </div>
               </body>
          </html>
     `;

          // Construct the email message with the car details
          let mailOptions = {
               from: 'cecelia.kemmer82@ethereal.email',
               to: 'dhananjay@plaxonic.com',
               subject: 'Enquiry Form Submission',
               html: message,
          };

          // Send the email using the transporter object
          await transporter.sendMail(mailOptions);

          //Save the enquiry data to MongoDB
          const enquiry = new enquiryFormModel(enquireFormData);
          await enquiry.save();

          return 'Thank you for your enquiry!';
     } catch (error) {
          console.error(error);
          return false;
     }
};

export const enquiryFormService = {
     addForm,
     getAllForm,
     getSingleForm,
     sendEnquiryEmail,
};
