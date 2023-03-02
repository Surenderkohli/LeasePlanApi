import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carBrandService } from '../services/carBrand.js';

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
          const result = await carBrandService.addCarBrand(req.body);

          res.send(result);
     })
);

export default router;
