import { Router } from 'express';
import { carOfferService } from '../services/carOffer.js';
import multer from 'multer';
import csvtojson from 'csvtojson';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { createObjectCsvWriter } from 'csv-writer';

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
     const errorFile = '/Users/Plaxonic/leaseplan-api/errorFile';
     const csvWriter = createObjectCsvWriter({
          path: `${errorFile}/error_list_caroffers.csv`,
          header: [
               { id: 'column', title: 'Fields' },
               { id: 'cell', title: 'CellAddress' },
               { id: 'message', title: 'Message' },
          ],
     });

     try {
          await csvWriter.writeRecords(errorList);

          console.log('CSV file generated successfully');
          return true; // Indicate successful generation
     } catch (error) {
          console.log('Error generating CSV file', error);
          throw error; // Throw the error to be caught and handled
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

               // Validate the CSV data for car offers
               const validation = isValidCarOfferData(carOfferData);

               if (!validation.isValid) {
                    // Push the errors to the errorList array
                    errorList = validation.errors.slice(0, 30); // Limiting to maximum 30 errors
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
               const isCSVGenerated = await generateErrorCSV(errorList);

               if (isCSVGenerated) {
                    // Set the appropriate response headers
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader(
                         'Content-Disposition',
                         'attachment; filename="error_list.csv"'
                    );

                    // Return the CSV file as a download link
                    return res.status(400).json({
                         message: 'Invalid car offers CSV file',
                         errorFile: 'error_list_caroffers.csv', // Provide the file name to be downloaded
                    });
               } else {
                    // Handle the error if CSV generation fails
                    return res.status(500).json({
                         message: 'Error generating error CSV',
                    });
               }
          }

          res.status(201).json({
               message: 'Car offers added successfully',
               data: carOffers,
          });
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

router.put('/updated/:id', carUpload.array('image', 6), async (req, res) => {
     try {
          const id = req.params.id;
          const carDetailsData = req.body;

          // const inventoryData = {
          //      bodyType: req.body.bodyType,
          //      door: req.body.door,
          //      seat: req.body.seat,
          //      gears: req.body.gears,
          //      acceleration: req.body.acceleration,
          //      co2: req.body.co2,
          //      fuelType: req.body.fuelType,
          //      transmission: req.body.transmission,
          //      tankCapacity: req.body.tankCapacity,
          //      image: req.body.image,
          //      imageUrl: req.body.imageUrl,
          //      publicId: req.body.publicId,
          // };

          const carOffersData = req.body;
          const carFeaturesData = req.body;

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

          const result = await carOfferService.updateCarV2(
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

     carOfferData.forEach((carOffer, index) => {
          const missingFields = [];

          if (!carOffer.duration) {
               const columnIndex = getHeaderIndex('duration');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'duration',
                    cell: cellAddress,
                    message: `Missing duration at index ${index}`,
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
                    message: `Missing monthlyCost at index ${index}`,
               });
          }
          if (!carOffer.calculationNo) {
               const columnIndex = getHeaderIndex('calculationNo');
               const cellAddress = getCellAddress(columnIndex, index);
               missingFields.push({
                    column: 'calculationNo',
                    cell: cellAddress,
                    message: `Missing calculationNo at index ${index}`,
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
                    message: `Invalid duration at index ${index}`,
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
                    message: `Invalid annualMileage at index ${index}`,
               });
          }
          const monthlyCost = parseFloat(carOffer.monthlyCost);
          if (isNaN(monthlyCost) || monthlyCost <= 0) {
               const columnIndex = getHeaderIndex('monthlyCost');
               const cellAddress = getCellAddress(columnIndex, index);
               errors.push({
                    column: 'monthlyCost',
                    cell: cellAddress,
                    message: `Invalid monthlyCost at index ${index}`,
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

router.get('/filter_cars', async (req, res) => {
     try {
          const {
               leaseType,
               term,
               carBrand_id,
               carSeries_id,
               monthlyCost,
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
               monthlyCost,
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
