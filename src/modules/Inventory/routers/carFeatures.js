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
          try {
               const { id } = req.params;
               const result = await carFeatureService.getSingleCarFeature(id);
               res.status(200).json({
                    success: true,
                    data: result,
               });
          } catch (error) {
               console.error(error);
               res.status(400).json({ success: false, error: error.message });
          }
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
