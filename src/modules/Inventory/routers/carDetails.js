import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import csvtojson from 'csvtojson';
import dotenv from 'dotenv';
import carOfferModel from '../models/carOffer.js';

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
     limits: { fileSize: 20 * 1024 * 1024 },

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
                    categories: carDetailsData.categories,
               };

               // const leaseType = req.body.leaseType;
               // const term = req.body.term;

               // const carOffersData = {
               //      carBrand_id: carDetailsData.carBrand_id,
               //      carSeries_id: carDetailsData.carSeries_id,
               //      leaseType: leaseType,
               //      term: term,
               //      offers: [],
               //      deals: req.body.deals,
               // };

               // for (let i = 1; i <= 20; i++) {
               //      const duration = req.body[`duration${i}`];
               //      const annualMileage = req.body[`annualMileage${i}`];
               //      const monthlyCost = req.body[`monthlyCost${i}`];
               //      const calculationNo = req.body[`calculationNo${i}`];

               //      if (
               //           duration &&
               //           annualMileage &&
               //           monthlyCost &&
               //           calculationNo
               //      ) {
               //           carOffersData.offers.push({
               //                duration: duration,
               //                annualMileage: annualMileage,
               //                monthlyCost: monthlyCost,
               //                calculationNo: req.body[`calculationNo${i}`],
               //           });
               //      }
               // }
               const carOffersData = [];

               // Iterate over carOffersData objects
               for (let i = 0; i < req.body.carOffersData.length; i++) {
                    const leaseType = req.body.carOffersData[i].leaseType;
                    const term = req.body.carOffersData[i].term;

                    if (leaseType && term) {
                         const offers = [];

                         // Iterate over offers within each carOffersData object
                         for (
                              let j = 0;
                              j < req.body.carOffersData[i].offers.length;
                              j++
                         ) {
                              const duration =
                                   req.body.carOffersData[i].offers[j].duration;
                              const annualMileage =
                                   req.body.carOffersData[i].offers[j]
                                        .annualMileage;
                              const monthlyCost =
                                   req.body.carOffersData[i].offers[j]
                                        .monthlyCost;
                              const calculationNo =
                                   req.body.carOffersData[i].offers[j]
                                        .calculationNo;

                              if (
                                   duration &&
                                   annualMileage &&
                                   monthlyCost &&
                                   calculationNo
                              ) {
                                   offers.push({
                                        duration: duration,
                                        annualMileage: annualMileage,
                                        monthlyCost: monthlyCost,
                                        calculationNo: calculationNo,
                                   });
                              }
                         }

                         carOffersData.push({
                              carBrand_id: carDetailsData.carBrand_id,
                              carSeries_id: carDetailsData.carSeries_id,
                              leaseType: leaseType,
                              term: term,
                              offers: offers,
                         });
                    }
               }

               // Check if calculationNo already exists
               // const calculationNos = carOffersData.offers.map(
               //      (offer) => offer.calculationNo
               // );
               // const existingCalculationNos = await carOfferModel.find({
               //      'offers.calculationNo': { $in: calculationNos },
               // });

               // if (existingCalculationNos.length > 0) {
               //      return res.status(400).json({
               //           success: false,
               //           msg: 'calculationNo already exists',
               //      });
               // }

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
               // const fieldsToCheck = ['carBrand_id', 'carSeries_id'];
               // for (let field of fieldsToCheck) {
               //      if (
               //           !mongoose.Types.ObjectId.isValid(carDetailsData[field])
               //      ) {
               //           return res.status(400).send({g
               //                success: false,
               //                msg: `Invalid ObjectId `,
               //           });
               //      }
               // }
               //const carOffer = await carOfferModel.create(carOffersData[i]);

               const result = await CarServices.addNewCar(
                    carDetailsData,
                    carImage,
                    carFeaturesData,
                    carOffersData
               );
               res.status(200).json({ success: true, data: result });
          } catch (error) {
               console.log(error);
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
               exteriorFeatures: req.body.exteriorFeatures,
               interiorFeatures: req.body.interiorFeatures,
               safetySecurityFeatures: req.body.safetySecurityFeatures,
               comfortConvenienceFeatures: req.body.comfortConvenienceFeatures,
               audioEntertainmentFeatures: req.body.audioEntertainmentFeatures,
          };

          const carOffersData = req.body;

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

               // Check if the CSV data is valid
               if (!isValidCarDetailData(carDetailData)) {
                    throw new Error(
                         'Invalid CSV format. Please upload a valid CSV file.'
                    );
               }

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
     g;
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
     '/deleted/:id',
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

// Helper function to validate the CSV data for car details
function isValidCarDetailData(carDetailData) {
     if (!Array.isArray(carDetailData) || carDetailData.length === 0) {
          return false;
     }

     // Iterate over each car detail record and validate the fields
     for (let i = 0; i < carDetailData.length; i++) {
          const carDetail = carDetailData[i];

          // Check if required fields exist
          if (
               !carDetail.modelCode ||
               !carDetail.makeCode ||
               !carDetail.companyName ||
               !carDetail.seriesName ||
               !carDetail.yearModel ||
               !carDetail.tankCapacity ||
               !carDetail.fuelType ||
               !carDetail.transmission
          ) {
               return false;
          }

          // Validate the enum values
          if (
               ![
                    'city-car',
                    'coupe',
                    'estate',
                    'sedan',
                    'hatchback',
                    'mpv',
                    'saloon',
                    'sports',
               ].includes(carDetail.bodyType)
          ) {
               return false;
          }

          // // Example validation for numeric fields
          if (carDetail.yearModel && typeof carDetail.yearModel !== 'string') {
               return false;
          }

          if (carDetail.door && typeof carDetail.door !== 'string') {
               return false;
          }

          if (carDetail.seat && typeof carDetail.seat !== 'string') {
               return false;
          }

          // // Example validation for string fields
          if (
               carDetail.acceleration &&
               typeof carDetail.acceleration !== 'string'
          ) {
               return false;
          }

          // Add more validation checks as per your requirements
     }

     return true;
}

export default router;
