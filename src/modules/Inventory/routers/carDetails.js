import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose, { model } from 'mongoose';
import csvtojson from 'csvtojson';
import { createObjectCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';
import carOfferModel from '../models/carOffer.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import fs from 'fs';

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
               // const { deals } = req.body;
               // if (deals && !['active', 'inactive'].includes(deals)) {
               //      throw new Error('Invalid deals status');
               // }

               const { carBrand_id, carSeries_id } = req.body;

               // Retrieve makeCode and modelCode based on carBrand_id and carSeries_id
               const carBrand = await carBrandModel.findById(carBrand_id);
               const makeCode = carBrand.makeCode;

               const carSeries = await carSeriesModel.findById(carSeries_id);
               const modelCode = carSeries.modelCode;

               const carDetailsData = req.body;

               const files = req.files; // Get the image files from the request

               const carFeaturesData = {
                    carSeries_id: carDetailsData.carSeries_id,
                    carBrand_id: carDetailsData.carBrand_id,
                    modelCode: modelCode,
                    makeCode: makeCode,
                    categories: carDetailsData.categories,
                    source: 'manual', // Set the source to 'manual' for manual upload
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

               /* 
               The issue occurs because carOffersData is an array, not an object. Therefore, you cannot directly access carOffersData.offers as it is undefined. To resolve this, you can use the flatMap() method to flatten the array of offers and retrieve the calculationNo values.

               By using carOffersData.flatMap(), you iterate over each carOffersData object and map it to an array of calculationNo values. This ensures that you have a flattened array of all the calculationNo values from the offers array within each carOffersData object.

        */
               // Check if calculationNo already exists
               const calculationNos = carOffersData.flatMap((data) =>
                    data.offers.map((offer) => offer.calculationNo)
               );
               const existingCalculationNos = await carOfferModel.find({
                    'offers.calculationNo': { $in: calculationNos },
               });

               if (existingCalculationNos.length > 0) {
                    return res.status(400).json({
                         success: false,
                         msg: 'calculationNo already exists',
                    });
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
               // const fieldsToCheck = ['carBrand_id', 'carSeries_id'];
               // for (let field of fieldsToCheck) {
               //      if (
               //           !mongoose.Types.ObjectId.isValid(carDetailsData[field])
               //      ) {
               //           return res.status(400).send({
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

               if (!result) {
                    return res.status(400).json({
                         success: false,
                         error: 'Failed to add new car',
                    });
               }

               res.status(200).json({ success: true, data: result });
          } catch (error) {
               console.log(error);
               console.error('Error in adding new carDetails:', error);
               //  res.send({ status: 400, success: false, msg: error.message });
               res.status(400).json({ success: false, error: error.message });
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
// const errorFilePath = '../../../../errorFile';

// async function generateErrorCSV(errorList) {
//      const csvWriter = createObjectCsvWriter({
//           //  path: 'error_list.csv', // Set the file path to save the CSV file
//           path: `${errorFile}/error_list_cardetails.csv`,
//           header: [
//                { id: 'column', title: 'Fields' },
//                { id: 'cell', title: 'CellAddress' },
//                { id: 'message', title: 'Message' },
//           ],
//      });

//      try {
//           await csvWriter.writeRecords(errorList);
//           return console.log('CSV file generated successfully');
//      } catch (error) {
//           return console.log('Error generating CSV file:', error);
//      }
// }

async function generateErrorCSV(errorList) {
     const errorFolder = 'errorFile'; // Update with the correct folder name
     const csvWriter = createObjectCsvWriter({
          path: `${errorFolder}/error_list_cardetails.csv`,
          header: [
               { id: 'column', title: 'Fields' },
               { id: 'cell', title: 'CellAddress' },
               { id: 'message', title: 'Message' },
          ],
     });

     try {
          await csvWriter.writeRecords(errorList);
          return console.log('CSV file generated successfully');
     } catch (error) {
          return console.log('Error generating CSV file:', error);
     }
}

router.post('/car-details', upload.single('file'), async (req, res) => {
     try {
          let carDetails = [];
          let errorList = []; // Array to store the errors

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carDetailData = await csvtojson().fromString(csvString);

               // delete existing car details from database
               //await CarServices.deleteAllCarDetails();

               // Check if the CSV data is valid
               const validationResult = isValidCarDetailData(carDetailData);

               if (!validationResult.isValid) {
                    // Push the errors to the errorList array
                    errorList = validationResult.errors.slice(0, 30); // Limiting to maximum 30 errors
               } else {
                    for (let i = 0; i < carDetailData.length; i++) {
                         const carDetail =
                              await CarServices.createCarDetailUpdateExistingCar(
                                   carDetailData[i]
                              );
                         carDetails.push(carDetail);
                    }
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

          if (errorList.length > 0) {
               // res.status(400).json({
               //      message: 'Invalid car details CSV file',
               //      errors: errorList,
               // });

               // Generate the error CSV file with the provided errorFilePath
               await generateErrorCSV(errorList);

               // Set the appropriate response headers
               // res.setHeader('Content-Type', 'text/csv');
               // res.setHeader(
               //      'Content-Disposition',
               //      'attachment; filename="error_list_cardetails.csv"'
               // );

               // Return the CSV file as a download link
               res.status(400).json({
                    message: 'Invalid car details CSV file',
                    errorFile: 'error_list_cardetails.csv', // Provide the file name to be downloaded
               });
          } else {
               res.status(201).json({
                    message: 'Car details added successfully',
                    data: carDetails,
               });
          }
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
});

router.get('/fetch-singles/:id', async (req, res) => {
     try {
          const { id } = req.params;
          // const { leaseTypeId } = req.query;

          const result = await CarServices.getSingleCars(id);

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
// function isValidCarDetailData(carDetailData) {
//      if (!Array.isArray(carDetailData) || carDetailData.length === 0) {
//           return false;
//      }

//      const companyCodes = {}; // Object to store the assigned company codes

//      // Iterate over each car detail record and validate the fields
//      for (let i = 0; i < carDetailData.length; i++) {
//           const carDetail = carDetailData[i];

//           // Check if required fields exist
//           if (
//                !carDetail.modelCode ||
//                !carDetail.makeCode ||
//                !carDetail.companyName ||
//                !carDetail.seriesName ||
//                !carDetail.yearModel ||
//                !carDetail.tankCapacity ||
//                !carDetail.fuelType ||
//                !carDetail.transmission
//           ) {
//                return false;
//           }

//           // Validate the enum values
//           if (
//                ![
//                     'city-car',
//                     'coupe',
//                     'estate',
//                     'sedan',
//                     'hatchback',
//                     'mpv',
//                     'saloon',
//                     'sports',
//                ].includes(carDetail.bodyType)
//           ) {
//                return false;
//           }

//           // Example validation for numeric fields
//           if (carDetail.yearModel && typeof carDetail.yearModel !== 'string') {
//                return false;
//           }

//           if (carDetail.door && typeof carDetail.door !== 'string') {
//                return false;
//           }

//           if (carDetail.seat && typeof carDetail.seat !== 'string') {
//                return false;
//           }

//           // Example validation for string fields
//           if (
//                carDetail.acceleration &&
//                typeof carDetail.acceleration !== 'string'
//           ) {
//                return false;
//           }

//           // Check if the companyName is already assigned to a different makeCode
//           if (
//                companyCodes[carDetail.companyName] &&
//                companyCodes[carDetail.companyName] !== carDetail.makeCode
//           ) {
//                return false;
//           }

//           // Store the companyName and makeCode in the companyCodes object
//           companyCodes[carDetail.companyName] = carDetail.makeCode;
//      }

//      return true;
// }
function isValidCarDetailData(carDetailData) {
     if (!Array.isArray(carDetailData) || carDetailData.length === 0) {
          return {
               isValid: false,
               errors: ['No data found in the CSV file.'],
          };
     }

     const companyCodes = {};
     const modelCodes = {};
     const errors = [];
     const makeCodeToCompanyName = {};

     carDetailData.forEach((carDetail, rowNumber) => {
          const missingFields = [];

          // Check for missing fields
          if (!carDetail.makeCode) {
               missingFields.push('makeCode');
          }
          if (!carDetail.modelCode) {
               missingFields.push('modelCode');
          }
          if (!carDetail.companyName) {
               missingFields.push('companyName');
          }
          if (!carDetail.seriesName) {
               missingFields.push('seriesName');
          }
          if (!carDetail.yearModel) {
               missingFields.push('yearModel');
          }
          if (!carDetail.description) {
               missingFields.push('description');
          }
          if (!carDetail.transmission) {
               missingFields.push('transmission');
          }
          if (!carDetail.bodyType) {
               missingFields.push('bodyType');
          }
          if (!carDetail.co2) {
               missingFields.push('co2');
          }
          if (!carDetail.door) {
               missingFields.push('door');
          }
          if (!carDetail.seat) {
               missingFields.push('seat');
          }
          if (!carDetail.acceleration) {
               missingFields.push('acceleration');
          }
          if (!carDetail.tankCapacity) {
               missingFields.push('tankCapacity');
          }
          if (!carDetail.fuelType) {
               missingFields.push('fuelType');
          }
          if (!carDetail.gears) {
               missingFields.push('gears');
          }

          if (missingFields.length > 0) {
               missingFields.forEach((fieldName) => {
                    const columnIndex = getHeaderIndex(fieldName);
                    const cellAddress = getCellAddress(columnIndex, rowNumber);
                    errors.push({
                         column: fieldName,
                         cell: cellAddress,
                         message: ` '${fieldName}' is missing.`,
                    });
               });
          }

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
               const columnIndex = getHeaderIndex('bodyType');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'bodyType',
                    cell: cellAddress,
                    message: 'Invalid body type.',
               });
          }

          if (
               carDetail.transmission &&
               typeof carDetail.transmission !== 'string'
          ) {
               const columnIndex = getHeaderIndex('transmission');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'transmission',
                    cell: cellAddress,
                    message: 'Invalid transmission value.',
               });
          }

          if (carDetail.fuelType && typeof carDetail.fuelType !== 'string') {
               const columnIndex = getHeaderIndex('fuelType');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'fuelType',
                    cell: cellAddress,
                    message: 'Invalid fuelType value.',
               });
          }

          if (
               typeof carDetail.yearModel !== 'string' ||
               isNaN(Number(carDetail.yearModel)) ||
               Number(carDetail.yearModel) <= 0
          ) {
               const columnIndex = getHeaderIndex('yearModel');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'yearModel',
                    cell: cellAddress,
                    message: `Invalid yearModel as ${carDetail.yearModel}`,
               });
          }

          if (
               typeof carDetail.door !== 'string' ||
               isNaN(Number(carDetail.door)) ||
               Number(carDetail.door) <= 0
          ) {
               const columnIndex = getHeaderIndex('door');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'door',
                    cell: cellAddress,
                    message: `Invalid door as ${carDetail.door}`,
               });
          }

          if (
               typeof carDetail.seat !== 'string' ||
               isNaN(Number(carDetail.seat)) ||
               Number(carDetail.seat) <= 0
          ) {
               const columnIndex = getHeaderIndex('seat');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'seat',
                    cell: cellAddress,
                    message: `Invalid seat as ${carDetail.seat}`,
               });
          }

          // Other field validations...

          // Check if makeCode is already assigned to a different companyName
          if (
               carDetail.makeCode &&
               makeCodeToCompanyName[carDetail.makeCode] &&
               makeCodeToCompanyName[carDetail.makeCode] !==
                    carDetail.companyName
          ) {
               const columnIndex = getHeaderIndex('makeCode');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'makeCode',
                    cell: cellAddress,
                    message: `Make Code ${carDetail.makeCode} is already assigned to a different Company Name.`,
               });
          }

          // Check if companyName is already assigned to a different makeCode
          if (
               carDetail.companyName &&
               companyCodes[carDetail.companyName] &&
               companyCodes[carDetail.companyName] !== carDetail.makeCode
          ) {
               const assignedMakeCode = companyCodes[carDetail.companyName];
               const columnIndex = getHeaderIndex('companyName');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'companyName',
                    cell: cellAddress,
                    message: `Company Name ${carDetail.companyName} is already assigned to Make Code ${assignedMakeCode}.`,
               });
          }

          // ...

          // Track assigned makeCode to companyName
          if (carDetail.makeCode && carDetail.companyName) {
               makeCodeToCompanyName[carDetail.makeCode] =
                    carDetail.companyName;
          }

          if (modelCodes[carDetail.modelCode]) {
               const columnIndex = getHeaderIndex('modelCode');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'modelCode',
                    cell: cellAddress,
                    message: `Model Code ${carDetail.modelCode} is already assigned.`,
               });
          }

          companyCodes[carDetail.companyName] = carDetail.makeCode;
          modelCodes[carDetail.modelCode] = true;
     });

     if (errors.length > 0) {
          return {
               isValid: false,
               errors,
          };
     }

     return {
          isValid: true,
          errors: [],
     };
}

// Function to get the cell address based on the column index and row number
function getCellAddress(columnIndex, rowNumber) {
     const columnName = getColumnName(columnIndex);
     const adjustedRowNumber = rowNumber + 2; // Adding 2 to row number to account for header row
     return columnName + adjustedRowNumber;
}

// Function to get the column name based on the column index
function getColumnName(columnIndex) {
     let dividend = columnIndex;
     let columnName = '';

     while (dividend >= 0) {
          let modulo = dividend % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26) - 1;
     }

     return columnName;
}

// Function to get the index of the header field in the CSV
function getHeaderIndex(fieldName) {
     // Replace this logic with your CSV header extraction logic
     const headers = [
          'makeCode',
          'modelCode',
          'companyName',
          'seriesName',
          'yearModel',
          'description',
          'transmission',
          'bodyType',
          'co2',
          'door',
          'seat',
          'acceleration',
          'tankCapacity',
          'fuelType',
          'gears',
     ];
     return headers.indexOf(fieldName);
}

export default router;
