import { Router } from 'express';
import mongoose from 'mongoose';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carBrandService } from '../services/carBrand.js';
import leaseTypeModel from '../models/leaseType.js';

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
     httpHandler(async (req, res) => {
          try {
               const { leaseType_id, companyName } = req.body;

               // Validate input data
               if (
                    !leaseType_id ||
                    !mongoose.Types.ObjectId.isValid(leaseType_id)
               ) {
                    return res.status(400).send({
                         success: false,
                         msg: 'Invalid leaseType_id',
                    });
               }

               if (!companyName || typeof companyName !== 'string') {
                    return res.status(400).send('Invalid company name');
               }

               // Check if leaseType_id exists
               const leaseType = await leaseTypeModel.findOne({
                    _id: leaseType_id,
               });
               if (!leaseType) {
                    return res.status(404).send({
                         success: false,
                         msg: 'LeaseType not found',
                    });
               }

               const result = await carBrandService.addCarBrand(req.body);

               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

export default router;
