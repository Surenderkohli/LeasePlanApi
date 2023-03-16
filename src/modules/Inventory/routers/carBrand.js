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
               if (!leaseType_id) {
                    throw new Error('leaseType_id is required');
               } else if (!mongoose.Types.ObjectId.isValid(leaseType_id)) {
                    throw new Error('leaseType_id is invalid');
               }

               // Check if leaseType_id exists
               const leaseType = await leaseTypeModel.findOne({
                    _id: leaseType_id,
               });
               if (!leaseType) {
                    return res.status(404).json({
                         success: false,
                         msg: 'LeaseType not found',
                    });
               }

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

export default router;
