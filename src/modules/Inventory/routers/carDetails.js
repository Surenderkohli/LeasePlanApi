import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import csvtojson from 'csvtojson';
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
                    //  leaseType,
                    carBrand,
                    carSeries,
                    fuelType,
                    priceMin,
                    priceMax,
                    bodyType,
                    annualMileage,
                    yearModel,
                    querySrch,
               } = req.query;

               const limit = parseInt(req.query.limit) || 1000000;
               const skip = parseInt(req.query.skip) || 0;

               const result = await CarServices.getAllCar(
                    //  leaseType,
                    carBrand,
                    carSeries,
                    fuelType,
                    priceMin,
                    priceMax,
                    bodyType,
                    annualMileage,
                    yearModel,
                    querySrch,
                    limit,
                    skip
               );

               if (result.length) {
                    res.status(200).json({ success: true, data: result });
               } else {
                    res.status(200).json({
                         success: false,
                         message: 'No cars found with the given filters.',
                         data: [],
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
               const { deals } = req.body;
               if (deals && !['active', 'inactive'].includes(deals)) {
                    throw new Error('Invalid deals status');
               }

               const carDetailsData = req.body;
               const files = req.files; // Get the image files from the request

               const carFeaturesData = {
                    carSeries_id: carDetailsData.carSeries_id,
                    carBrand_id: carDetailsData.carBrand_id,
                    modelCode: carDetailsData.modelCode,
                    makeCode: carDetailsData.makeCode,
                    yearModel: carDetailsData.yearModel,
                    exteriorFeatures: req.body.exteriorFeatures,
                    interiorFeatures: req.body.interiorFeatures,
                    safetySecurityFeatures: req.body.safetySecurityFeatures,
                    comfortConvenienceFeatures:
                         req.body.comfortConvenienceFeatures,
                    audioEntertainmentFeatures:
                         req.body.audioEntertainmentFeatures,
               };

               const carOffersData = {
                    carBrand_id: carDetailsData.carBrand_id,
                    carSeries_id: carDetailsData.carSeries_id,
                    yearModel: carDetailsData.yearModel,
                    //leaseType_id: leaseTypes.map((leaseType) => leaseType._id),
                    leaseType_id: carDetailsData.leaseType_id,
                    offers: [],
               };

               for (let i = 1; i <= 20; i++) {
                    const duration = req.body[`duration${i}`];
                    const annualMileage = req.body[`annualMileage${i}`];
                    const monthlyCost = req.body[`monthlyCost${i}`];
                    const calculationNo = req.body[`calculationNo${i}`];

                    if (
                         duration &&
                         annualMileage &&
                         monthlyCost &&
                         calculationNo
                    ) {
                         carOffersData.offers.push({
                              duration: duration,
                              annualMileage: annualMileage,
                              monthlyCost: monthlyCost,
                              calculationNo: req.body[`calculationNo${i}`],
                         });
                    }
               }

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
               const fieldsToCheck = ['carBrand_id', 'carSeries_id'];
               for (let field of fieldsToCheck) {
                    if (!mongoose.Types.ObjectId.isValid(data[field])) {
                         return res.status(400).send({
                              success: false,
                              msg: `Invalid ObjectId `,
                         });
                    }
               }

               const result = await CarServices.addNewCar(
                    carDetailsData,
                    carImage,
                    carFeaturesData,
                    carOffersData
               );
               res.send(result);
          } catch (error) {
               console.error('Error in adding new carDetails:', error);
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.put('/update/:id', carUpload.array('image', 6), async (req, res) => {
     try {
          const carId = req.params.id;
          const carDetailsData = req.body;

          const carFeaturesData = {
               carSeries_id: carDetailsData.carSeries_id,
               carBrand_id: carDetailsData.carBrand_id,
               yearModel: carDetailsData.yearModel,
               exteriorFeatures: req.body.exteriorFeatures,
               interiorFeatures: req.body.interiorFeatures,
               safetySecurityFeatures: req.body.safetySecurityFeatures,
               comfortConvenienceFeatures: req.body.comfortConvenienceFeatures,
               audioEntertainmentFeatures: req.body.audioEntertainmentFeatures,
          };

          const carOffersData = {
               carBrand_id: carDetailsData.carBrand_id,
               carSeries_id: carDetailsData.carSeries_id,
               yearModel: carDetailsData.yearModel,
               leaseType_id: carDetailsData.leaseType_id,
               offers: [],
          };

          for (let i = 1; i <= 20; i++) {
               const duration = req.body[`duration${i}`];
               const annualMileage = req.body[`annualMileage${i}`];
               const monthlyCost = req.body[`monthlyCost${i}`];
               const calculationNo = req.body[`calculationNo${i}`];
               if (duration && annualMileage && monthlyCost && calculationNo) {
                    const offerIndex = carOffersData.offers.findIndex(
                         (offer) => offer.calculationNo === calculationNo
                    );
                    if (offerIndex !== -1) {
                         carOffersData.offers[offerIndex].duration = duration;
                         carOffersData.offers[offerIndex].annualMileage =
                              annualMileage;
                         carOffersData.offers[offerIndex].monthlyCost =
                              monthlyCost;
                    } else {
                         carOffersData.offers.push({
                              duration: duration,
                              annualMileage: annualMileage,
                              monthlyCost: monthlyCost,
                              calculationNo: calculationNo,
                         });
                    }
               }
          }

          const images = [];

          // check if there are new files uploaded
          if (req.files && req.files.length > 0) {
               // delete old images from cloudinary
               const car = await CarServices.getSingleCars(carId);

               if (car && car.image) {
                    for (const image of car.image) {
                         await cloudinary.uploader.destroy(image.publicId);
                    }
               }

               // upload new image files to cloudinary
               for (const file of req.files) {
                    const result = await cloudinary.uploader.upload(file.path);

                    images.push({
                         imageUrl: result.secure_url,
                         publicId: result.public_id,
                    });
               }

               // update the images array in the request body
               carDetailsData.image = images;
          }

          const result = await CarServices.updateCar(
               carId,
               carDetailsData,
               carFeaturesData,
               carOffersData
          );
          res.send(result);
     } catch (error) {
          console.error('Error in updating car details:', error);
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.get('/best-deals', async (req, res) => {
     try {
          const { limit = 5, skip = 0 } = req.query;
          const result = await CarServices.getDeals(
               parseInt(limit),
               parseInt(skip)
          );

          if (result) {
               res.status(200).json({ success: true, data: result });
          } else {
               res.status(200).json({
                    success: false,
                    message: 'Not found any best deals',
                    data: [],
               });
          }
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
});

// ---------------------------------------------------------------- >>>>>>>>>>>  CSV upload

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post('/car-details', upload.single('file'), async (req, res) => {
     try {
          let carDetails = [];

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carDetailData = await csvtojson().fromString(csvString);

               // delete existing car details from database
               //await CarServices.deleteAllCarDetails();

               for (let i = 0; i < carDetailData.length; i++) {
                    const carDetail =
                         await CarServices.createCarDetailUpdateExistingCar(
                              carDetailData[i]
                         );
                    carDetails.push(carDetail);
               }
          } else if (req.body) {
               // Manual upload
               const carDetailData = req.body;
               const carDetail =
                    await CarServices.createCarDetailUpdateExistingCar(
                         carDetailData
                    );
               carDetails.push(carDetail);
          } else {
               throw new Error('No file or data provided');
          }

          res.status(201).json({
               message: 'Car details added successfully',
               data: carDetails,
          });
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
});

router.get('/fetch-singles/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const { leaseTypeId } = req.query;

          const result = await CarServices.getSingleCars(id, leaseTypeId);
          res.status(200).json({ success: true, data: result });
     } catch (error) {
          if (error.message === 'Car not found') {
               res.status(404).json({ success: false, msg: 'Car not found' });
          } else {
               res.status(400).json({ success: false, msg: error.message });
          }
     }
});

//get all cars by brand, series and lease type but different yearModel
router.get('/list', async (req, res) => {
     const { carBrand_id, carSeries_id } = req.query;
     try {
          const cars = await CarServices.getCarsByBrandSeriesLeaseType(
               carBrand_id,
               carSeries_id
               //leaseType_id
          );
          res.json(cars);
     } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
     }
});

router.delete(
     '/deleteCd/:id',
     httpHandler(async (req, res) => {
          const data = req.body;
          const { id } = req.params;
          const result = await CarServices.deletedCar(id, req.body);
          res.send({
               success: true,
               message: 'Car with offers and features deleted successfully',
               data: result,
          });
     })
);

export default router;
