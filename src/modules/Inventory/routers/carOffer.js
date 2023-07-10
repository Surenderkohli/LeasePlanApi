import { Router } from 'express';
import { carOfferService } from '../services/carOffer.js';
import multer from 'multer';
import csvtojson from 'csvtojson';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { createObjectCsvWriter } from 'csv-writer';
import carDetailModel from '../models/carDetails.js';
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

const storage = multer.memoryStorage();

const upload = multer({ storage });

// router.post('/car-offers', upload.single('file'), async (req, res) => {
//      try {
//           let carOffers = [];

//           if (req.file && req.file.mimetype === 'text/csv') {
//                // CSV upload
//                const csvString = req.file.buffer.toString('utf8');
//                const carOfferData = await csvtojson().fromString(csvString);

//                // delete existing car offers from database
//                // await carOfferService.deleteAllCarOffers();

//                for (let i = 0; i < carOfferData.length; i++) {
//                     const carOffer = await carOfferService.createCarOffer(
//                          carOfferData[i]
//                     );
//                     carOffers.push(carOffer);
//                }
//           }

//           res.status(201).json({
//                message: 'Car offers added successfully',
//                data: carOffers,
//           });
//      } catch (error) {
//           console.log(error);
//           res.status(400).json({ message: error.message });
//      }
// });

async function generateErrorCSV(errorList) {
     const errorFolder = 'errorFile'; // Update with the correct folder name
     const csvWriter = createObjectCsvWriter({
          path: `${errorFolder}/error_list_caroffers.csv`,
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
          console.log('Error generating CSV file', error);
     }
}

router.post('/car-offers', upload.single('file'), async (req, res) => {
     try {
          let carOffers = [];
          let errorList = []; // Array to store the errors

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carOfferData = await csvtojson().fromString(csvString);

               // Check if the carDetails document exists for any of the feature descriptions
               const missingCarDetails = [];

               for (let i = 0; i < carOfferData.length; i++) {
                    const carOffer = carOfferData[i];

                    const carDetails = await carDetailModel.findOne({
                         makeCode: carOffer.makeCode,
                         modelCode: carOffer.modelCode,
                    });

                    if (!carDetails) {
                         const columnIndexMakeCode = getHeaderIndex('makeCode');
                         const columnIndexModelCode =
                              getHeaderIndex('modelCode');
                         const cellAddress = getCellAddress(
                              columnIndexMakeCode,
                              i
                         );
                         missingCarDetails.push({
                              column: 'makeCode, modelCode',
                              cell: cellAddress,
                              message: `Car details not found for makeCode '${carOffer.makeCode}' and modelCode '${carOffer.modelCode}'`,
                         });
                    }
               }

               if (missingCarDetails.length > 0) {
                    errorList = errorList.concat(
                         missingCarDetails.map((missingCarDetail) => ({
                              column: missingCarDetail.column,
                              cell: missingCarDetail.cell,
                              message: missingCarDetail.message,
                         }))
                    );
               }

               // Validate the CSV data for car offers
               const validation = isValidCarOfferData(carOfferData);

               if (!validation.isValid) {
                    // Push the errors to the errorList array
                    errorList = errorList.concat(
                         validation.errors.slice(0, 30)
                    ); // Limiting to maximum 30 errors
               } else {
                    const calculationNos = new Set();

                    for (let i = 0; i < carOfferData.length; i++) {
                         const { calculationNo } = carOfferData[i];

                         if (calculationNos.has(calculationNo)) {
                              return res.status(400).json({
                                   message: `calculationNo '${calculationNo}' already exists in the uploaded CSV file`,
                              });
                         }

                         calculationNos.add(calculationNo);

                         const carOffer = await carOfferService.createCarOffer(
                              carOfferData[i]
                         );
                         carOffers.push(carOffer);
                    }
               }
          }

          if (errorList.length > 0) {
               // Generate the error CSV file
               await generateErrorCSV(errorList);

               // Set the appropriate response headers
               // res.setHeader('Content-Type', 'text/csv');
               // res.setHeader(
               //      'Content-Disposition',
               //      'attachment; filename="error_list_caroffers.csv"'
               // );

               // Return the CSV file as a download link
               return res.status(400).json({
                    message: 'Invalid car offers CSV file',
                    errorFile: 'error_list_caroffers.csv', // Provide the file name to be downloaded
               });
          } else {
               res.status(201).json({
                    message: 'Car offers added successfully',
                    data: carOffers,
               });
          }
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
});

router.get('/', async (req, res) => {
     try {
          const result = await carOfferService.getAllOffer();
          const transformedResult = result.map((offer) => {
               const makeCode = offer.carBrand_id
                    ? offer.carBrand_id.makeCode
                    : null;
               const modelCode = offer.carSeries_id
                    ? offer.carSeries_id.modelCode
                    : null;
               return { ...offer.toObject(), makeCode, modelCode };
          });
          res.send(transformedResult);
     } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
     }
});

router.get('/all-cars', async (req, res) => {
     try {
          const {
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

          const result = await carOfferService.getAllCarWithOffers(
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
});

router.get('/counts', async (req, res) => {
     try {
          const counts = await carOfferService.getCount();
          res.status(200).json({
               success: true,
               privateLeaseCount: counts.privateLeaseCount,
               businessLeaseCount: counts.businessLeaseCount,
               totalInventoryCount: counts.totalInventoryCount,
          });
     } catch (error) {
          res.status(400).json({ success: false, error: error.message });
     }
});

// router.get('/fetch-single/:id', async (req, res) => {
//      try {
//           const { id } = req.params;

//           const result = await carOfferService.getSingleCar(id);
//           res.status(200).json({ success: true, data: result });
//      } catch (error) {
//           if (error.message === 'Car not found') {
//                res.status(404).json({ success: false, msg: 'Car not found' });
//           } else {
//                res.status(400).json({ success: false, msg: error.message });
//           }
//      }
// });

router.get('/fetch-single/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const { duration, annualMileage } = req.query;

          const result = await carOfferService.getSingleCar(
               id,
               duration,
               annualMileage
          );
          res.status(200).json({ success: true, data: result });
     } catch (error) {
          if (error.message === 'Car not found') {
               res.status(404).json({ success: false, msg: 'Car not found' });
          } else if (error.message === 'Offer not found') {
               res.status(404).json({ success: false, msg: 'Offer not found' });
          } else {
               res.status(400).json({ success: false, msg: error.message });
          }
     }
});

router.get('/fetch-single_V2/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const { duration, annualMileage } = req.query;

          const result = await carOfferService.getSingleCarV2(
               id,
               duration,
               annualMileage
          );
          res.status(200).json({ success: true, data: result });
     } catch (error) {
          if (error.message === 'Car not found') {
               res.status(404).json({ success: false, msg: 'Car not found' });
          } else if (error.message === 'Offer not found') {
               res.status(404).json({ success: false, msg: 'Offer not found' });
          } else {
               res.status(400).json({ success: false, msg: error.message });
          }
     }
});

router.put('/updated/:id', carUpload.array('image', 6), async (req, res) => {
     try {
          const id = req.params.id;
          const carDetailsData = req.body;

          const carOffersData = req.body;
          const carFeaturesData = req.body;

          const offers = req.body.offers; // Get the offers array from the request body

          // Check if any other offer has the same calculationNo
          const calculationNos = offers.map((offer) => offer.calculationNo);
          const carWithCalculationNo = await carOfferModel.findOne({
               _id: { $ne: id }, // Exclude the current offer being updated
               'offers.calculationNo': { $in: calculationNos },
          });

          if (carWithCalculationNo) {
               return res.status(400).json({
                    success: false,
                    msg: 'Calculation number already exists in other offers.',
               });
          }

          const images = [];

          // check if there are new files uploaded
          if (req.files && req.files.length > 0) {
               // delete old images from cloudinary
               const car = await carOfferService.getSingleCar(id);

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

          const result = await carOfferService.updateCarV3(
               id,
               carDetailsData,
               carOffersData,
               carFeaturesData
          );
          // res.send(result);
          res.status(200).json({ success: true, data: result });
     } catch (error) {
          console.error('Error in updating car details:', error);
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.get('/best-deal', async (req, res) => {
     try {
          const { limit = 5, skip = 0 } = req.query;
          const result = await carOfferService.getDeals(
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

// Helper function to validate the CSV data for car offers
function isValidCarOfferData(carOfferData) {
     if (!Array.isArray(carOfferData) || carOfferData.length === 0) {
          return {
               isValid: false,
               errors: ['No car offer data provided'],
          };
     }

     const errors = [];
     const calculationNos = [];
     const makeModelCombinations = {};

     carOfferData.forEach((carOffer, index) => {
          const missingFields = [];

          // Validate makeCode and modelCode
          const makeCode = carOffer.makeCode.toString();
          const modelCode = carOffer.modelCode.toString();
          const combinationKey = `${makeCode}-${modelCode}`;

          if (!makeModelCombinations[combinationKey]) {
               makeModelCombinations[combinationKey] = {
                    companyName: carOffer.companyName,
                    seriesName: carOffer.seriesName,
               };
          } else if (
               makeModelCombinations[combinationKey].companyName !==
                    carOffer.companyName ||
               makeModelCombinations[combinationKey].seriesName !==
                    carOffer.seriesName
          ) {
               const columnIndex = getHeaderIndex('makeCode');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'makeCode',
                    cell: cellAddress,
                    message: `Combination of makeCode (${makeCode}) and modelCode (${modelCode}) already exists with a different companyName and seriesName`,
               });
          }

          if (!carOffer.duration) {
               const columnIndex = getHeaderIndex('duration');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'duration',
                    cell: cellAddress,
                    message: `Missing duration`,
               });
          }
          if (!carOffer.annualMileage) {
               const columnIndex = getHeaderIndex('annualMileage');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'annualMileage',
                    cell: cellAddress,
                    message: `Missing annualMileage at index ${index}`,
               });
          }
          if (!carOffer.monthlyCost) {
               const columnIndex = getHeaderIndex('monthlyCost');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'monthlyCost',
                    cell: cellAddress,
                    message: `Missing monthlyCost`,
               });
          }
          if (!carOffer.calculationNo) {
               const columnIndex = getHeaderIndex('calculationNo');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'calculationNo',
                    cell: cellAddress,
                    message: `Missing calculationNo`,
               });
          } else if (calculationNos.includes(carOffer.calculationNo)) {
               const columnIndex = getHeaderIndex('calculationNo');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'calculationNo',
                    cell: cellAddress,
                    message: `Duplicate calculationNo: ${carOffer.calculationNo}`,
               });
          } else {
               calculationNos.push(carOffer.calculationNo);
          }

          if (!carOffer.leaseType) {
               const columnIndex = getHeaderIndex('leaseType');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'leaseType',
                    cell: cellAddress,
                    message: `Missing leaseType`,
               });
          }

          if (!carOffer.term) {
               const columnIndex = getHeaderIndex('term');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'term',
                    cell: cellAddress,
                    message: `Missing term`,
               });
          }

          if (
               typeof carOffer.makeCode !== 'string' ||
               isNaN(Number(carOffer.makeCode)) ||
               Number(carOffer.makeCode) <= 0
          ) {
               const columnIndex = getHeaderIndex('makeCode');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'makeCode',
                    cell: cellAddress,
                    message: `Invalid makeCode`,
               });
          }

          if (
               typeof carOffer.modelCode !== 'string' ||
               isNaN(Number(carOffer.modelCode)) ||
               Number(carOffer.modelCode) <= 0
          ) {
               const columnIndex = getHeaderIndex('modelCode');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'modelCode',
                    cell: cellAddress,
                    message: `Invalid modelCode`,
               });
          }

          if (!carOffer.companyName) {
               const columnIndex = getHeaderIndex('companyName');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'companyName',
                    cell: cellAddress,
                    message: `Missing companyName`,
               });
          }

          if (!carOffer.seriesName) {
               const columnIndex = getHeaderIndex('seriesName');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'seriesName',
                    cell: cellAddress,
                    message: `Missing seriesName`,
               });
          }

          if (missingFields.length > 0) {
               missingFields.forEach((missingField) => {
                    errors.push(missingField);
               });
          }

          const duration = parseFloat(carOffer.duration);
          if (isNaN(duration) || duration <= 0) {
               const columnIndex = getHeaderIndex('duration');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'duration',
                    cell: cellAddress,
                    message: `Invalid duration`,
               });
          }

          if (
               typeof carOffer.annualMileage !== 'string' ||
               isNaN(Number(carOffer.annualMileage)) ||
               Number(carOffer.annualMileage) <= 0
          ) {
               const columnIndex = getHeaderIndex('annualMileage');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'annualMileage',
                    cell: cellAddress,
                    message: `Invalid annualMileage`,
               });
          }
          const monthlyCost = parseFloat(carOffer.monthlyCost);
          if (isNaN(monthlyCost) || monthlyCost <= 0) {
               const columnIndex = getHeaderIndex('monthlyCost');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'monthlyCost',
                    cell: cellAddress,
                    message: `Invalid monthlyCost`,
               });
          }

          const calculationNo = parseFloat(carOffer.calculationNo);
          if (isNaN(calculationNo) || calculationNo <= 0) {
               const columnIndex = getHeaderIndex('calculationNo');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'calculationNo',
                    cell: cellAddress,
                    message: `Invalid calculationNo`,
               });
          }
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

/* 

     console.log('columnName -', columnName);                                         || columnName - I
     console.log('adjustedRowNumber -', adjustedRowNumber);                           || adjustedRowNumber - 9
     console.log(
          'columnIndex + adjustedRowNumber', columnName + adjustedRowNumber );        || columnIndex + adjustedRowNumber I9    || columnIndex + adjustedRowNumber G11

*/

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

/* 
        console.log('columnName:', columnName);              columnName : I        ||     columnName : G    ||    columnName : B

*/

// Function to get the index of the header field in the CSV
function getHeaderIndex(fieldName) {
     // Replace this logic with your CSV header extraction logic
     const headers = [
          'leaseType',
          'term',
          'makeCode',
          'modelCode',
          'companyName',
          'seriesName',
          'duration',
          'annualMileage',
          'monthlyCost',
          'calculationNo',
          'bestDeals',
     ];

     return headers.indexOf(fieldName);
}

/* 
        console.log('indexing :', headers.indexOf(fieldName))      indexing : 0               ||        indexing 9

        console.log('fieldName : ', fieldName)                      fieldName :  leaseType      ||        fieldName calculationNo
 */

router.get('/filter_cars', async (req, res) => {
     try {
          const {
               leaseType,
               term,
               carBrand_id,
               carSeries_id,
               // monthlyCost,
               priceMin,
               priceMax,
               annualMileage,
               fuelType,
               bodyType,
               querySearch,
          } = req.query;

          const filterOptions = {
               leaseType,
               term,
               carBrand_id,
               carSeries_id,
               // monthlyCost,
               priceMin,
               priceMax,
               annualMileage,
               fuelType,
               bodyType,
               querySearch,
          };

          const cars = await carOfferService.filterCars(filterOptions);

          if (cars.length > 0) {
               res.status(200).json({ success: true, data: cars });
          } else {
               res.status(200).json({
                    success: false,
                    message: 'No cars found with the given filters.',
                    data: [],
               });
          }
     } catch (error) {
          res.status(400).json({ success: false, message: error.message });
     }
});

router.delete('/delete_offers/:id', async (req, res) => {
     const { id } = req.params;
     const result = await carOfferService.deletedCarV2(id, req.body);
     res.send({
          success: true,
          message: 'Car with offers and features deleted successfully',
          data: result,
     });
});

router.get('/list_not_offers', async (req, res) => {
     try {
          const result = await carOfferService.getAllCarWithoutOffers();

          res.status(200).json({ success: true, carWithoutOffer: result });
     } catch (error) {
          console.log(error);
          res.status(500).send('Internal Server Error');
     }
});

export default router;
