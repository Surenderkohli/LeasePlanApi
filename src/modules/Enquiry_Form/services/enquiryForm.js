import enquiryFormModel from '../models/enquiryForm.js';
import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';
import puppeteer from 'puppeteer';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
                    from: 'caroffers',
                    localField: 'carOffers_id',
                    foreignField: '_id',
                    as: 'carOffers',
               },
          },
          {
               $unwind: '$carOffers',
          },
     ];

     const result = await enquiryFormModel.aggregate(aggregateFilter);

     return result;
};

const sendEnquiryEmail = async (enquiryData, enquireFormData) => {
     try {
          const message = `
         
          <!DOCTYPE html>
          <html>
               <head>
                    <meta charset="UTF-8" />
                    <title>Car Lease Enquiry</title>
               </head>
               <body
                    style="
                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                         background-color: #fef2e6;
                         font-size: 16px;
                         color: #333;
                         margin: 0;
                         padding: 0;
                    "
               >
                    <div class="comp-part" style="padding: 10%">
                         <div
                              class="header"
                              style="
                                   color: black;
                                   padding: 32px;
                                   text-align: center;
                                   border-radius: 8px 8px 0 0;
                              "
                         >
                              <img
                                   class="logo"
                                   src="https://res.cloudinary.com/dqkag6b79/image/upload/v1683703490/logos_xolxnt.png"
                                   alt="LeasePlan Logo"
                                   style="
                                        display: block;
                                        margin: 0 auto;
                                        width: 200px;
                                        height: auto;
                                        margin-bottom: 32px;
                                   "
                              />
                              <h1>Car Lease Enquiry</h1>
                              <p class="message" style="font-size: 20px; color: black">
                                   Thank you for your interest in our car lease services.
                                   Please find below the details of your enquiry:
                              </p>
                         </div>
                         <div
                              class="content"
                              style="
                                   width: 80%;
                                   padding: 32px;
                                   background-color: #fef2e6;
                                   border-radius: 0 0 8px 8px;
                                   margin: auto;
                              "
                         >
                              <div
                                   class="head-query"
                                   style="
                                        background-color: #fee7cd;
                                        padding: 2px;
                                        padding-left: 10px;
                                   "
                              >
                                   <h2>Enquiry Details</h2>
                              </div>
                              <table
                                   class="details"
                                   style="
                                        margin-top: 32px;
                                        font-size: 20px;
                                        line-height: 1.5;
                                        border-collapse: collapse;
                                        width: 100%;
                                   "
                              >
                              <tr  class="detail"
                              style="
                                  text-align: left;
                              ">
                                   <th>Name:</th>
                                   <td>${enquireFormData.firstName} ${enquireFormData.lastName}</td>
                              </tr>
                              <tr  class="detail"
                              style="
                                  text-align: left;
                              ">
                                   <th>Mobile Number:</th>
                                   <td>${enquireFormData.mobileNumber}</td>
                              </tr>
                                   <tr  class="detail"
                                   style="
                                       text-align: left;
                                   ">
                                        <th>Car Brand Name:</th>
                                        <td>${enquiryData.companyName}</td>
                                   </tr>
                                   <tr  class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Lease Type:</th>
                                        <td>${enquiryData.leaseType}</td>
                                   </tr>

                                    <tr  class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Lease Term:</th>
                                        <td>${enquiryData.term}</td>
                                   </tr>
                                   <tr class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Fuel Type:</th>
                                        <td>${enquiryData.fuelType}</td>
                                   </tr>
                                   <tr class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Gearbox Type::</th>
                                        <td>${enquiryData.gears} </td>
                                   </tr>
                                   <tr class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Contract Type:</th>
                                        <td>${enquiryData.duration} </td>
                                   </tr>
                                   <tr class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Annual Mileage:</th>
                                        <td>${enquiryData.annualMileage} </td>
                                   </tr>
                                   <tr class="detail"
                                   style="
                                   text-align: left;
                               ">
                                        <th>Monthly Payment:</th>
                                        <td>${enquiryData.monthlyCost} DHS</td>
                                   </tr>
                              </table>
                         </div>
                         <div
                              class="thank-you"
                              style="
                                   background-color: #fef2e6;
                                   color: #333;
                                   padding: 32px;
                                   text-align: center;
                                   border-radius: 8px;
                                   margin-top: 25px;
                              "
                         >
                              <h2>Thank you for your enquiry!</h2>
                              <p style="font-size: 20px; line-height: 1.5">
                              <p id="download-date"></p>
                              We appreciate your interest in our car lease services.
                              Our team will get back to you shortly with more
                              information.
                              </p>
                         </div>
                    </div>
                    <script>
                      var today = new Date();
                      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                      var dateTime = date+' '+time;
                      document.getElementById("download-date").innerHTML = "PDF downloaded on: " + dateTime;
                   </script>
               </body>
          </html>

        `;

          const messageTwo = `
          <!DOCTYPE html>
          <html>
             <head>
                <title>LeasePlan Car Reference</title>
                <style>
                   body {
                   font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                   font-size: 16px;
                   /* background-color: rgb(240, 228, 215); */
                   }
                   .lastLogo {
                   height: 140px;
                   }
                   .lastLogo {
                   display: flex;
                   align-items: center;
                   }
                   .lastLogo img {
                   width: 140px;
                   height: 100px;
                   padding-right: 15px;
                   margin-top: 25px;
                   border-right: 2px solid red;
                   }
                   .address {
                   margin-left: 15px;
                   height: 100px;
                   }
                   .address p {
                   line-height: 3px;
                   }
                   .para-1 {
                   font-size: 25px;
                   font-weight: 500;
                   }
                   .address span{
                   color: brown;
                   font-size: 18px;
                   font-weight: 600;
                   }
                </style>
             </head>
             <body>
                <div>
                   <h2>LeasePlan Car Reference</h2>
                   <p>Dear ${enquireFormData.firstName} ${enquireFormData.lastName} ,</p>
                   <p>
                      Thank you for your interest in LeasePlan! We have received your car
                      inquiry and would like to provide you with a personalized reference
                      regarding your request.
                   </p>
                   <p>
                      Please find the attached PDF for detailed information regarding your car
                      inquiry.
                   </p>
                   <p>
                      If you have any further questions or require assistance, please don't
                      hesitate to contact our dedicated team. We are here to help you make an
                      informed decision and ensure a seamless car leasing experience.
                   </p>
                   <p>
                      Thank you for considering LeasePlan. We look forward to serving you!
                   </p>
                   <p>
                   <p style="font-size: 19px; font-weight: 500;">Best regards,</p>
                   [Emirates]<br />
                   LeasePlan
                   </p>
                </div>
                <div class="lastLogo">
                   <div>
                      <img
                         src="https://res.cloudinary.com/dqkag6b79/image/upload/v1683703490/logos_xolxnt.png"
                         alt="" />
                   </div>
                   <div class="address">
                      <p class="para-1">LeasePlan Emirates</p>
                      <p><span>M: </span> 1860 500 5050 | 1860 419 5050</p>
                      <p><span>A: </span> Al Fahim HQ 1st Floor Abu Dhabi PO Box 36679, AE</p>
                      <p><span>E: </span> customercare@leaseplan.com</p>
                   </div>
                </div>
             </body>
          </html>
         
          `;

          // Generate the PDF using Puppeteer
          const browser = await puppeteer.launch({
               args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add these arguments to prevent errors in production
               headless: true, // Run Puppeteer in headless mode on the server
          });

          const page = await browser.newPage();

          await page.setContent(message);
          const pdfBuffer = await page.pdf({
               format: 'A4',
               printBackground: true,
               scale: 0.75, // Adjust the scale factor to fit more content onto a single page
          });

          await browser.close();

          const attachment = {
               content: pdfBuffer.toString('base64'),
               filename: 'attachment.pdf',
               type: 'application/pdf',
               disposition: 'attachment',
          };

          const mailOptions = {
               from: 'dhananjay@plaxonic.com',
               to: [enquireFormData.emailAddress],
               subject: 'Enquiry Form Submission',
               html: messageTwo,
               // text: 'Please find the attachment.', // Add a text property for a plain text message
               attachments: [attachment],
          };

          // Send the email using the transporter object
          await sgMail.send(mailOptions);

          // Save the enquiry data to MongoDB
          enquireFormData.htmlTemplate = message;
          const enquiry = new enquiryFormModel(enquireFormData);
          const res = await enquiry.save();
          return res.id;

          // let mailOptions = {
          //      from: 'dhananjay@plaxonic.com',
          //      to: [enquireFormData.emailAddress],
          //      subject: 'Enquiry Form Submission',
          //      html: message,
          // };

          // // Send the email using the transporter object
          // await sgMail.send(mailOptions);

          // //Save the enquiry data to MongoDB
          // enquireFormData.htmlTemplate = message;
          // const enquiry = new enquiryFormModel(enquireFormData);
          // const res = await enquiry.save();
          // return res.id;
     } catch (error) {
          console.error(error);
          return false;
     }
};

const getCount = async (query) => {
     const count = await enquiryFormModel.countDocuments(query);

     return count;
};

export const enquiryFormService = {
     addForm,
     getAllForm,
     getSingleForm,
     sendEnquiryEmail,
     getCount,
};
