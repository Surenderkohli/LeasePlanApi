import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import csvtojson from 'csvtojson';
import { createObjectCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';
import carOfferModel from '../models/carOffer.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';

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
const convertAndCheckDate = async (dateString) => {
     try {
          const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;

          const match = dateString.match(dateRegex);

          if (match) {
               const day = parseInt(match[1], 10);
               const month = parseInt(match[2], 10) - 1;
               const year = parseInt(match[3], 10) + 2000;
               console.log('day',day);
               console.log('month',month);


               const date = new Date(Date.UTC(year, month, day, 0, 0, 0)); //Date 2023-09-15T00:00:00.000Z
               //date.toISOString() 2023-09-21T00:00:00.000Z
               return {
                    date: date.toISOString(), // Store as UTC ISO string
               };
          } else {
               throw new Error(`Invalid date format: ${dateString}`);
          }
     } catch (error) {
          throw new Error(`Error processing date: ${error.message}`);
     }
};

//Manually car details ,features and offers upload
router.post(
     '/add',
     carUpload.array('image', 6),
     httpHandler(async (req, res) => {
          try {
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
                              const validFrom =
                                   req.body.carOffersData[i].offers[j].validFrom;
                              const validTo =
                                  req.body.carOffersData[i].offers[j].validTo

                              const validFromResult = await convertAndCheckDate(validFrom);
                              const validToResult = await convertAndCheckDate(validTo);

                              const validFromParsed = new Date(validFromResult.date);
                              const validToParsed = new Date(validToResult.date);


                              const currentDate = new Date();

                              const isSameYear = currentDate.getUTCFullYear() === validToParsed.getUTCFullYear();
                              const isSameMonth = currentDate.getUTCMonth() === validToParsed.getUTCMonth();
                              const isSameDay = currentDate.getUTCDate() === validToParsed.getUTCDate();

                              const expired = currentDate >= validToParsed && !(isSameYear && isSameMonth && isSameDay);

                              if (
                                   duration &&
                                   annualMileage &&
                                   monthlyCost &&
                                   calculationNo &&
                                   validFrom &&
                                   validTo
                              ) {
                                   offers.push({
                                        duration: duration,
                                        annualMileage: annualMileage,
                                        monthlyCost: monthlyCost,
                                        calculationNo: calculationNo,
                                        validFrom: validFromParsed,
                                        validTo: validToParsed,
                                        expired:expired

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

               res.status(400).json({ success: false, error: error.message });
          }
     })
);

//   CSV upload
const storage = multer.memoryStorage();

const upload = multer({ storage });

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

//CSV Upload
router.post('/car-details', upload.single('file'), async (req, res) => {
     try {
          let carDetails = [];
          let errorList = []; // Array to store the errors

          if (req.file && req.file.mimetype === 'text/csv') {
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
               // Generate the error CSV file with the provided errorFilePath
               await generateErrorCSV(errorList);

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
     const validBodyTypes = [
          'city-car',
          'coupe',
          'estate',
          'sedan',
          'hatchback',
          'mpv',
          'saloon',
          'sports',
     ];
     const validFuelTypes = ['petrol', 'diesel', 'hybrid', 'electric'];
     const validTransmissions = ['automatic', 'manual'];

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

          // Validate bodyType
          if (!validBodyTypes.includes(carDetail.bodyType)) {
               const columnIndex = getHeaderIndex('bodyType');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'bodyType',
                    cell: cellAddress,
                    message: `Invalid body type '${carDetail.bodyType}'.`,
               });
          }

          // Validate transmission
          if (!validTransmissions.includes(carDetail.transmission)) {
               const columnIndex = getHeaderIndex('transmission');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'transmission',
                    cell: cellAddress,
                    message: `Invalid transmission value '${carDetail.transmission}'.`,
               });
          }

          // Validate fuelType
          if (!validFuelTypes.includes(carDetail.fuelType)) {
               const columnIndex = getHeaderIndex('fuelType');
               const cellAddress = getCellAddress(columnIndex, rowNumber);
               errors.push({
                    column: 'fuelType',
                    cell: cellAddress,
                    message: `Invalid fuelType value '${carDetail.fuelType}'.`,
               });
          }


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

//get all cars by brand, series and lease type but different yearModel  **NOT-IN-USE
router.get('/list', async (req, res) => {
     const { carBrand_id, carSeries_id } = req.query;
     try {
          const cars = await CarServices.getCarsByBrandSeriesLeaseType(
               carBrand_id,
               carSeries_id
          );
          res.json(cars);
     } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
     }
});

export default router;
