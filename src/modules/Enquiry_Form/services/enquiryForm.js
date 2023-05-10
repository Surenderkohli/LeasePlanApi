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
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #fef2e6;
        font-size: 16px;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .comp-part {
        padding: 10%;
      }
      /* Add your custom styles for the header */
      .header {
        /* background-color: #EF700F; */
        color: black; /* change text color to white for better contrast */
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
        width: 80%;
        padding: 32px;
        background-color: #fef2e6;
        border-radius: 0 0 8px 8px;
        margin: auto;
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
      .head-query {
        background-color: #fee7cd;
        padding: 2px;
        padding-left: 10px;
      }
      .details th {
        font-weight: 500;
      }
      /* .details th {
        background-color: #f7d488;
        color: #333;
        font-weight: bold;
      } */
      .details tr {
        display: flex;
        justify-content: space-between;
      }

      /* Add your custom styles for the thank you message */
      .thank-you {
        background-color: #fef2e6;
        color: #333;
        padding: 32px;
        text-align: center;
        border-radius: 8px;
        margin-top: 25px;
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
        font-size: 20px;
        color: black; /* change text color to white for better contrast */
      }
    </style>
  </head>
  <body>
    <div class="comp-part">
      <div class="header">
        <img
          class="logo"
          src="https://res.cloudinary.com/dqkag6b79/image/upload/v1683703490/logos_xolxnt.png"
          alt="LeasePlan Logo"
        />
        <h1>Car Lease Enquiry</h1>
        <p class="message">
          Thank you for your interest in our car lease services. Please find
          below the details of your enquiry:
        </p>
      </div>
      <div class="content">
        <div class="head-query"><h2>Enquiry Details</h2></div>
        <table class="details">
          <tr>
            <th>Car Brand Name:</th>
            <td>${enquiryData.companyName}</td>
          </tr>
          <tr>
            <th>Lease Type:</th>
            <td>${enquiryData.leaseTypeValues}</td>
          </tr>
          <tr>
            <th>Fuel Type:</th>
            <td>${enquiryData.fuelType}</td>
          </tr>
          <tr>
            <th>Gearbox Type:</th>
            <td>${enquiryData.gears}</td>
          </tr>
          <tr>
            <th>Contract Type:</th>
            <td>${enquiryData.duration} months</td>
          </tr>
          <tr>
            <th>Annual Mileage:</th>
            <td>${enquiryData.annualMileage} miles</td>
          </tr>
          <tr>
            <th>Monthly Payment:</th>
            <td>${enquiryData.monthlyCost} DHS</td>
          </tr>
        </table>
      </div>
      <div class="thank-you">
        <h2>Thank you for your enquiry!</h2>
        <p>
          We appreciate your interest in our car lease services. Our team will
          get back to you shortly with more information.
        </p>
      </div>
    </div>
  </body>
</html>
     
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
