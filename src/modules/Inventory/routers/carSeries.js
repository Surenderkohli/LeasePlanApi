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

router.post(
     '/add-carseries',
     upload.none(),
     httpHandler(async (req, res) => {
          try {
               const carBrand_id = req.body.carBrand_id;

               // // Check if carBrand_id is provided and valid
               // if (!carBrand_id) {
               //      throw new Error('carBrand_id is required');
               // } else if (!mongoose.Types.ObjectId.isValid(carBrand_id)) {
               //      throw new Error('carBrand_id is invalid');
               // }

               // // Check if carBrand_id exists
               // const carBrand = await carBrandModel.findOne({
               //      _id: carBrand_id,
               // });
               // if (!carBrand) {
               //      return res.status(404).json({
               //           success: false,
               //           msg: 'carBrand not found',
               //      });
               // }

               const result = await carSeriesService.addCarSeries(req.body);
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
