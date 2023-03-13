import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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
     limits: { fileSize: 2 * 1024 * 1024 },

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
                    companyName
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

               const result = await CarServices.addNewCar(data, carImage);
               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get('/fetch-single/:id/pdf', async (req, res) => {
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
          const result = await CarServices.generatePdf(
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
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.get('/fetch-single/:id', async (req, res) => {
     try {
          const { id } = req.params;

          const response = await CarServices.getSingleCar(id);

          res.status(200).json({ success: true, data: response });
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.put(
     '/update/:id',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;

               const result = await CarServices.updateCar(id, req.body);
               res.send(result);
          } catch (error) {
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
