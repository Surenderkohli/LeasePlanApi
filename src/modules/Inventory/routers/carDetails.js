import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { CarServices } from '../services/carDetails.js';
import multer from 'multer';

const carStorage = multer.diskStorage({
     destination: 'public/images/car',
     filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() + file.originalname);
     },
});
const carUpload = multer({
     storage: carStorage,
     limits: { fileSize: 2 * 1024 * 1024 },

     fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
               cb(new Error('Please upload a Image'));
          }
          cb(undefined, true);
     },
});

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const {
                    fuelType,
                    priceMin,
                    priceMax,
                    bodyType,
                    mileage,
                    companyName,
               } = req.query;

               const result = await CarServices.getAllCar(
                    fuelType,
                    priceMin,
                    priceMax,
                    bodyType,
                    mileage,
                    companyName
               );

               if (result.length) {
                    res.status(200).json({ success: true, data: result });
               } else {
                    res.status(404).json({
                         success: false,
                         message: 'No cars found with the given filters.',
                    });
               }
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.post(
     '/add',
     carUpload.array('img', 6),
     httpHandler(async (req, res) => {
          const reqfile = req.files;
          const data = req.body;
          const result = await CarServices.addNewCar(data, reqfile);
          res.send(result);
     })
);

router.get('/fetch-single/:id', async (req, res) => {
     try {
          const { id } = req.params;

          const {
               leaseType,
               contractLength,
               annualMileage,
               upfrontPayment,
               maintenanceOption,
          } = req.body;
          const result = await CarServices.getSingleCar(
               id,
               leaseType,
               contractLength,
               annualMileage,
               upfrontPayment,
               maintenanceOption
          );
          res.send(result);
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.put(
     '/update/:id',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;

               const result = await CarServices.updateCar(id, req.body);
               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          const data = req.body;
          const { id } = req.params;
          const result = await CarServices.deleteCar(id, req.body);
          res.send(result);
     })
);

export default router;
