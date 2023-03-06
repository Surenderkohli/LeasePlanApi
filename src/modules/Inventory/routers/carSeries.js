import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carSeriesService } from '../services/carSeries.js';

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
     httpHandler(async (req, res) => {
          const result = await carSeriesService.addCarSeries(req.body);
          res.send(result);
     })
);

export default router;
