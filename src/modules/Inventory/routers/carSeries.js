import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carSeriesService } from '../services/carSeries.js';
import carBrandModel from '../models/carBrand.js';
import multer from 'multer';
import mongoose from 'mongoose';

const upload = multer(); // Create an instance of the multer middleware

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          // const {id} = req.params
          const result = await carSeriesService.getAllCarSeries();
          res.send(result);
     })
);

router.get(
     '/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await carSeriesService.getSingleCarSeries(id);
          res.send(result);
     })
);

// router.post(
//      '/add-carseries',
//      upload.none(),
//      httpHandler(async (req, res) => {
//           try {
//                const trimmedData = {
//                     ...req.body,
//                     seriesName: req.body.seriesName.trim(),
//                     modelCode: req.body.modelCode.trim(),
//                };
//                const result = await carSeriesService.addCarSeries(trimmedData);
//                res.json(result);
//           } catch (error) {
//                res.status(400).json({
//                     success: false,
//                     msg: error.message,
//                });
//           }
//      })
// );
router.post(
     '/add-carseries',
     upload.none(),
     httpHandler(async (req, res) => {
          try {
               const { carBrand_id, seriesName, modelCode } = req.body;
               const missingFields = [];

               // Check if any of the fields is missing
               if (!carBrand_id) {
                    missingFields.push('carBrand_id');
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

router.get(
     '/get-carBrand_id/:carBrand_id',
     httpHandler(async (req, res) => {
          try {
               const { carBrand_id } = req.params;

               const result = await carSeriesService.getAllCarSeriesByBrandId(
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
     '/get-carBrand_id_V2/:carBrand_id',
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

// router.get(
//      '/cars/:carBrand_id',
//      httpHandler(async (req, res) => {
//           try {
//                const { carBrand_id } = req.params;
//                const { leaseType, term } = req.query;

//                const result = await carSeriesService.AllCarSeriesByBrandId(
//                     carBrand_id,
//                     leaseType,
//                     term
//                );

//                res.status(200).json({
//                     success: true,
//                     msg: 'carSeries retrieved successfully',
//                     seriesList: result,
//                });
//           } catch (error) {
//                console.log(error);
//                res.status(500).json({
//                     success: false,
//                     message: 'Server Error',
//                });
//           }
//      })
// );
export default router;
