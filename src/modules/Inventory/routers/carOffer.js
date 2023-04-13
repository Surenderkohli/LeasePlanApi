import { Router } from 'express';
import { carOfferService } from '../services/carOffer.js';
import multer from 'multer';
import csvtojson from 'csvtojson';

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

/* 
// POST /car-offers

router.post('/car-offers-manual', async (req, res) => {
  try {
    const carOffer = await carOfferService.createCarOfferManual(req.body);
    res.status(201).json({
      message: 'Car offer added successfully',
      data: carOffer,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});
 */

router.post('/car-offers', upload.single('file'), async (req, res) => {
     try {
          let carOffers = [];

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carOfferData = await csvtojson().fromString(csvString);

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

router.post('/update-offers-and-deals', async (req, res) => {
     const {
          carBrand_id,
          carSeries_id,
          leaseType_id,
          yearModel,
          offers,
          deals,
     } = req.body;

     try {
          const result = await updateOffersAndDeals(
               carBrand_id,
               carSeries_id,
               leaseType_id,
               yearModel,
               offers,
               deals
          );

          if (result) {
               res.status(200).send('Offers and deals updated successfully.');
          } else {
               res.status(400).send('Could not update offers and deals.');
          }
     } catch (error) {
          res.status(500).send(error.message);
     }
});

router.get('/', async (req, res) => {
     const result = await carOfferService.getAllOffer();
     res.send(result);
});

router.get('/best-deals', async (req, res) => {
     try {
          const bestDeals = await carOfferService.getBestDeals();
          res.json(bestDeals);
     } catch (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
     }
});

export default router;
