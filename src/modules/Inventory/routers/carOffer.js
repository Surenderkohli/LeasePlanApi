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

export default router;
