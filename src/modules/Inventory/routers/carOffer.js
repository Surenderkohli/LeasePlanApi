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

router.post('/car-offers', upload.single('file'), async (req, res) => {
     try {
          let carOffers = [];

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carOfferData = await csvtojson().fromString(csvString);

               // delete existing car offers from database
               await carOfferService.deleteAllCarOffers();

               for (let i = 0; i < carOfferData.length; i++) {
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

          if (result) {
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

router.get('/count', async (req, res) => {
     try {
          const counts = await carOfferService.getCount();
          res.status(200).json({
               success: true,
               privateLeaseCount: counts.privateLeaseCount,
               flexiPlanCount: counts.flexiPlanCount,
               businessLeaseCount: counts.businessLeaseCount,
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

          const inventoryData = {
               bodyType: req.body.bodyType,
               door: req.body.door,
               seat: req.body.seat,
               gears: req.body.gears,
               acceleration: req.body.acceleration,
               co2: req.body.co2,
               fuelType: req.body.fuelType,
               transmission: req.body.transmission,
               tankCapacity: req.body.tankCapacity,
               image: req.body.image,
               imageUrl: req.body.imageUrl,
               publicId: req.body.publicId,
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
               const car = await carOfferService.getSingleCar(carId);

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
               inventoryData.image = images;
          }

          const result = await carOfferService.updateCar(
               carId,
               carDetailsData,
               carFeaturesData,
               inventoryData
          );
          res.send(result);
     } catch (error) {
          console.error('Error in updating car details:', error);
          res.send({ status: 400, success: false, msg: error.message });
     }
});

export default router;
