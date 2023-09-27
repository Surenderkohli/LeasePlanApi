import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carBrandService } from '../services/carBrand.js';

import multer from 'multer';

const upload = multer(); // Create an instance of the multer middleware

const router = Router();

router.post(
     '/add-carbrand',
     upload.none(), // Use the `none()` function to accept form-data with no file uploads
     httpHandler(async (req, res) => {
          try {
               const trimmedData = {
                    ...req.body,
                    companyName: req.body.companyName.trim(),
                    makeCode: req.body.makeCode.trim(),
               };

               const result = await carBrandService.addCarBrand(trimmedData);
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
    '/',
    httpHandler(async (req, res) => {
        try {
            const result = await carBrandService.getAllCarBrand();
            res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    })
);


router.get(
     '/fetch-single/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await carBrandService.getSingleCarBrand(id);
          res.send(result);
     })
);

router.get(
     '/leasetype/:leaseType_id',
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

// GET /cars?leaseType=:leaseType&term=:term   **NOT-IN-USE
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
export default router;
