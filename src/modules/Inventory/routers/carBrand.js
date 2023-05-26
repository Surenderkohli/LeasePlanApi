import { Router } from 'express';
import mongoose from 'mongoose';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carBrandService } from '../services/carBrand.js';
import leaseTypeModel from '../models/leaseType.js';
import multer from 'multer';

const upload = multer(); // Create an instance of the multer middleware

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          // const {id} = req.params
          const result = await carBrandService.getAllCarBrand();
          res.send(result);
     })
);

router.get(
     '/carbrand-single/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await carBrandService.getSingleCarBrand(id);
          res.send(result);
     })
);

router.post(
     '/add-carbrand',
     upload.none(), // Use the `none()` function to accept form-data with no file uploads
     httpHandler(async (req, res) => {
          try {
               const leaseType_id = req.body.leaseType_id;
               const companyName = req.body.companyName;

               // Check if leaseType_id is provided and valid
               // if (!leaseType_id) {
               //      throw new Error('leaseType_id is required');
               // } else if (!mongoose.Types.ObjectId.isValid(leaseType_id)) {
               //      throw new Error('leaseType_id is invalid');
               // }

               // Check if leaseType_id exists
               // const leaseType = await leaseTypeModel.findOne({
               //      _id: leaseType_id,
               // });
               // if (!leaseType) {
               //      return res.status(404).json({
               //           success: false,
               //           msg: 'LeaseType not found',
               //      });
               // }

               // Call the carBrandService to add the car brand
               const result = await carBrandService.addCarBrand(req.body);
               res.json(result);
          } catch (error) {
               res.status(400).json({
                    success: false,
                    msg: error.message,
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
               const result = await carBrandService.deleteCarBrand(id, data);
               res.status(200).json({
                    success: true,
                    msg: 'carBrand deleted successfully',
               });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/leaseType_id/:leaseType_id',
     httpHandler(async (req, res) => {
          try {
               const { leaseType_id } = req.params;

               const result = await carBrandService.getAllCarBrandByLeaseType(
                    leaseType_id
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

// GET /cars?leaseType=:leaseType&term=:term
router.get('/list', async (req, res) => {
     try {
          const { leaseType, term } = req.query;
          const cars = await carBrandService.getCarsByLeaseTypeAndTerm(
               leaseType,
               term
          );
          res.json({
               success: true,
               msg: 'Successfully retrieved cars',
               list: cars,
          });
     } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
     }
});
export default router;
