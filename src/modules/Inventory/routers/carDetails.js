import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.API_KEY,
     api_secret: process.env.API_SECRET,
});

const carStorage = multer.diskStorage({
     destination: 'public/images/car',
     filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() + file.originalname);
     },
});
const carUpload = multer({
     storage: carStorage,
     limits: { fileSize: 5 * 1024 * 1024 },

     fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
               cb(
                    new Error(
                         'Please upload an image file with .png, .jpg, or .jpeg extension.'
                    )
               );
          }

          cb(undefined, true);
     },
});

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const {
                    leaseType,
                    carBrand,
                    carSeries,
                    fuelType,
                    priceMin,
                    priceMax,
                    bodyType,
                    annualMileage,
                    companyName,
                    seriesName,
               } = req.query;

               const result = await CarServices.getAllCar(
                    leaseType,
                    carBrand,
                    carSeries,
                    fuelType,
                    priceMin,
                    priceMax,
                    bodyType,
                    annualMileage,
                    companyName,
                    seriesName
               );

               if (result.length) {
                    res.status(200).json({ success: true, data: result });
               } else {
                    res.status(404).json({
                         success: false,
                         message: 'No cars found with the given filters.',
                    });
               }
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get('/fetch-single/:id/:pdf?', async (req, res) => {
     try {
          const { id } = req.params;

          const {
               leaseType,
               contractLengthInMonth,
               annualMileage,
               upfrontPayment,
               includeMaintenance,
               monthlyLeasePrice,
          } = req.query;

          let result;

          if (req.params.pdf) {
               // If the user wants a PDF, generate the PDF
               result = await CarServices.generatePdf(
                    id,
                    leaseType,
                    contractLengthInMonth,
                    annualMileage,
                    upfrontPayment,
                    includeMaintenance,
                    monthlyLeasePrice
               );

               res.setHeader('Content-Type', 'application/pdf');
               res.send(result);
          } else {
               // Otherwise, return the car details as JSON
               result = await CarServices.getSingleCar(
                    id,
                    contractLengthInMonth,
                    annualMileage,
                    upfrontPayment,
                    includeMaintenance
               );

               if (result) {
                    res.status(200).json({ success: true, data: result });
               } else {
                    res.status(404).json({
                         success: false,
                         message: 'No car found with the specified id.',
                    });
               }
          }
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.post(
     '/add',
     carUpload.array('image', 6),
     httpHandler(async (req, res) => {
          try {
               const data = req.body;
               const files = req.files; // Get the image files from the request

               const carImage = [];
               if (files) {
                    const uploadPromises = files.map((file) => {
                         return cloudinary.uploader.upload(file.path);
                    });

                    const uploadResults = await Promise.all(uploadPromises); // Wait for all image uploads to finish

                    uploadResults.forEach((result) => {
                         let imageUrl = result.secure_url;
                         let publicId = result.public_id;
                         const carDetailsData = { imageUrl, publicId };
                         carImage.push(carDetailsData); // For each upload result, push the secure URL to the carImage array
                    });
               }
               // Check if id is a valid ObjectId
               const fieldsToCheck = [
                    'carBrand_id',
                    'carSeries_id',
                    'leaseType_id',
               ];
               for (let field of fieldsToCheck) {
                    if (!mongoose.Types.ObjectId.isValid(data[field])) {
                         return res.status(400).send({
                              success: false,
                              msg: `Invalid ObjectId `,
                         });
                    }
               }

               const result = await CarServices.addNewCar(data, carImage);
               res.send(result);
          } catch (error) {
               console.error('Error in adding new carDetails:', error);
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.put(
     '/update/:id',
     carUpload.array('image', 6),
     httpHandler(async (req, res) => {
          try {
               // check if there are new files uploaded
               const { id } = req.params;
               const data = req.body;
               const images = [];

               // check if there are new files uploaded
               if (req.files && req.files.length > 0) {
                    // delete old images from cloudinary
                    const carImage = await CarServices.getSingleCar(id);

                    if (carImage && carImage.image) {
                         for (const image of carImage.image) {
                              await cloudinary.uploader.destroy(image.publicId);
                         }
                    }

                    // upload new image files to cloudinary
                    for (const file of req.files) {
                         const result = await cloudinary.uploader.upload(
                              file.path
                         );

                         images.push({
                              imageUrl: result.secure_url,
                              publicId: result.public_id,
                         });
                    }

                    // update the images array in the request body
                    data.image = images;
               }

               const result = await CarServices.updateCar(id, data);

               res.send(result);
          } catch (error) {
               console.error('Error in updating  carDetails:', error);
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          const data = req.body;
          const { id } = req.params;
          const result = await CarServices.deleteCar(id, req.body);
          res.send(result);
     })
);

export default router;
