import { Router } from 'express';
import { carOfferService } from '../services/carOffer.js';
import multer from 'multer';
import csvtojson from 'csvtojson';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

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

router.post('/car-offers', upload.single('file'), async (req, res) => {
     try {
          let carOffers = [];

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carOfferData = await csvtojson().fromString(csvString);

               // Validate the CSV data for car offers
               const validation = isValidCarOfferData(carOfferData);
               if (!validation.isValid) {
                    throw new Error(`Invalid CSV format. ${validation.error}`);
               }

               // delete existing car offers from database
               // await carOfferService.deleteAllCarOffers();

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
     const result = await carOfferService.getAllOffer();
     res.send(result);
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

router.get('/fetch-single/:id', async (req, res) => {
     try {
          const { id } = req.params;

          const result = await carOfferService.getSingleCar(id);
          res.status(200).json({ success: true, data: result });
     } catch (error) {
          if (error.message === 'Car not found') {
               res.status(404).json({ success: false, msg: 'Car not found' });
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

          const result = await carOfferService.updateCar(
               id,
               carDetailsData,
               carOffersData,
               carFeaturesData
          );
          res.send(result);
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
               error: 'No car offer data provided',
          };
     }

     const validationErrors = [];

     for (let i = 0; i < carOfferData.length; i++) {
          const carOffer = carOfferData[i];

          if (!carOffer.calculationNo) {
               validationErrors.push('Missing calculationNo');
          }

          if (!carOffer.duration) {
               validationErrors.push('Missing duration');
          }

          if (!carOffer.annualMileage) {
               validationErrors.push('Missing annualMileage');
          }

          if (!carOffer.monthlyCost) {
               validationErrors.push('Missing monthlyCost');
          }

          if (
               typeof carOffer.duration !== 'string' ||
               isNaN(Number(carOffer.duration)) ||
               Number(carOffer.duration) <= 0
          ) {
               validationErrors.push('Invalid duration');
          }

          if (
               typeof carOffer.annualMileage !== 'string' ||
               isNaN(Number(carOffer.annualMileage)) ||
               Number(carOffer.annualMileage) <= 0
          ) {
               validationErrors.push('Invalid annualMileage');
          }

          if (
               typeof carOffer.monthlyCost !== 'string' ||
               isNaN(Number(carOffer.monthlyCost)) ||
               Number(carOffer.monthlyCost) <= 0
          ) {
               validationErrors.push('Invalid monthlyCost');
          }
     }

     if (validationErrors.length > 0) {
          return {
               isValid: false,
               error: 'Invalid car offer data',
          };
     }

     return {
          isValid: true,
     };
}

export default router;
