import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carFeatureService } from '../services/carFeatures.js';

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const carFeatures = await carFeatureService.getAllCarFeature();
               res.status(200).json(carFeatures);
          } catch (error) {
               console.error(error);
               res.status(500).send('Server error');
          }
     })
);

router.get(
     '/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await carFeatureService.getSingleCarFeature(id);
          res.send(result);
     })
);

router.post(
     '/add-carFeature',
     httpHandler(async (req, res) => {
          try {
               const carFeatureData = req.body;
               const carFeature = await carFeatureService.addCarFeature(
                    carFeatureData
               );
               res.status(201).json(carFeature);
          } catch (error) {
               console.error(error);
               res.status(500).send('Server error');
          }
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          const data = req.body;
          const { id } = req.params;
          const result = await carFeatureService.deleteCarFeatures(
               id,
               req.body
          );
          res.send(result);
     })
);

export default router;
