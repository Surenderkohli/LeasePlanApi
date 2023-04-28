import enquiryFormModel from '../models/enquiryForm.js';
import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';

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
          <html>
          <head>
               <style>
               body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 16px;
                    color: #333;
                    margin: 0;
                    padding: 0;
                  }
                  /* Add your custom styles for the header */
                  .header {
                    background-color: #EF700F;
                    color: #FFF; /* change text color to white for better contrast */
                    padding: 32px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                  }           
                  /* Add your custom styles for the logo */
                  .logo {
                    display: block;
                    margin: 0 auto;
                    width: 200px;
                    height: auto;
                    margin-bottom: 32px;
                     /* invert the logo color to white for better contrast filter: invert(100%);*/
                  }
                  /* Add your custom styles for the main content */
                  .content {
                    padding: 32px;
                    background-color: #FFF9EB;
                    border-radius: 0 0 8px 8px;
                  }
                  /* Add your custom styles for the enquiry details */
                  .details {
                    margin-top: 32px;
                    font-size: 20px;
                    line-height: 1.5;
                    border-collapse: collapse;
                    width: 100%;
                  }
                  .details th,
                  .details td {
                    padding: 10px;
                    text-align: left;
                  }
                  .details th {
                    background-color: #F7D488;
                    color: #333;
                    font-weight: bold;
                  }
                  /* Add your custom styles for the thank you message */
                  .thank-you {
                    background-color: #FFF9EB;
                    color: #333;
                    padding: 32px;
                    text-align: center;
                    border-radius: 8px;
                    margin-top: 32px;
                  }
                  .thank-you h2 {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 16px;
                  }
                  .thank-you p {
                    font-size: 20px;
                    line-height: 1.5;
                  }
                  .message {
                    color: #FFF; /* change text color to white for better contrast */
                  }
       
               </style>
          </head>
          <body>
               <div class="header">
                    <img class="logo" src="https://res.cloudinary.com/dqkag6b79/image/upload/v1678857402/geuhjim76t6gl22havg3.jpg" alt="LeasePlan Logo">
                    <h1>Car Lease Enquiry</h1>
                    <p class="message">Thank you for your interest in our car lease services. Please find below the details of your enquiry:</p>
               </div>
               <div class="content">
               <table class="details">
               <tr>
                 <th>Enquiry Details</th>
                 <th></th>
               </tr>
               <tr>
                 <td>Car Brand Name:</td>
                 <td>${enquiryData.companyName}</td>
               </tr>
               <tr>
                 <td>Lease Type:</td>
                 <td>${enquiryData.leaseTypeValues}</td>
               </tr>
              <tr>
               <td>Fuel Type:</td>
               <td>${enquiryData.fuelType} </td>
             </tr>
             <tr>
             <td>Gearbox Type:</td>
             <td>${enquiryData.gears} </td>
           </tr>
               <tr>
                 <td>Contract Type:</td>
                 <td>${enquiryData.duration} months</td>
               </tr>
               <tr>
                 <td>Annual Mileage:</td>
                 <td>${enquiryData.annualMileage} miles</td>
               </tr>
               <tr>
               <td>Monthly Payment:</td>
               <td>${enquiryData.monthlyCost} DHS </td>
             </tr>
        
           </table>      
               </div>
               <div class="thank-you">
               <h2>Thank you for your enquiry!</h2>
               <p>We appreciate your interest in our car lease services. Our team will get back to you shortly with more information.</p>
           </div>
          </body>
     
        `;

          let mailOptions = {
               from: 'dhananjay@plaxonic.com',
               to: [enquireFormData.emailAddress],
               subject: 'Enquiry Form Submission',
               html: message,
          };

          // Send the email using the transporter object
          await sgMail.send(mailOptions);

          //Save the enquiry data to MongoDB
          enquireFormData.htmlTemplate = message;
          const enquiry = new enquiryFormModel(enquireFormData);
          const res = await enquiry.save();
          return res.id;
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
