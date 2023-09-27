import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carSeriesService } from '../services/carSeries.js';

import multer from 'multer';

const upload = multer(); // Create an instance of the multer middleware

const router = Router();

router.post(
     '/add-carseries',
     upload.none(),
     httpHandler(async (req, res) => {
          try {
               const { carBrand_id, seriesName, modelCode } = req.body;
               const missingFields = [];

               // Check if any of the fields is missing
               if (!carBrand_id) {
                    missingFields.push('carBrand');
               }
               if (!seriesName) {
                    missingFields.push('seriesName');
               }
               if (!modelCode) {
                    missingFields.push('modelCode');
               }

               if (missingFields.length > 0) {
                    throw new Error(
                         `Missing required fields: ${missingFields.join(', ')}`
                    );
               }

               const trimmedData = {
                    carBrand_id: carBrand_id,
                    seriesName: seriesName.trim(),
                    modelCode: modelCode.trim(),
               };

               const result = await carSeriesService.addCarSeries(trimmedData);
               res.json(result);
          } catch (error) {
               res.status(400).json({
                    success: false,
                    msg: error.message,
               });
          }
     })
);

//Get carseries by carbrand_id whose cardetails has not been filled
router.get(
     '/carbrand/:carBrand_id',
     httpHandler(async (req, res) => {
          try {
               const { carBrand_id } = req.params;

               const result = await carSeriesService.getAllCarSeriesByBrandIdV2(
                    carBrand_id
               );

               res.status(200).json({
                    success: true,
                    data: result,
               });
          } catch (error) {
               console.log(error);
               res.status(500).json({
                    success: false,
                    message: 'Server Error',
               });
          }
     })
);

router.get(
    '/',
    httpHandler(async (req, res) => {
        try {
            const result = await carSeriesService.getAllCarSeries();
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    })
);

router.get('/fetch-single/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await carSeriesService.getSingleCarSeries(id);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete(
    '/delete/:id',
    httpHandler(async (req, res) => {
        try {
            const data = req.body;
            const { id } = req.params;
            const result = await carSeriesService.deleteCarSeries(id, data);
            res.status(200).json({
                success: true,
                msg: 'carSeries deleted successfully',
            });
        } catch (error) {
            res.send({ status: 400, success: false, msg: error.message });
        }
    })
);
export default router;
