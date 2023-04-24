import { Router } from 'express';
import { carOfferService } from '../services/carOffer.js';
import multer from 'multer';
import csvtojson from 'csvtojson';

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

          const result = await carOfferService.getAllCarWithOffers(
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

export default router;
