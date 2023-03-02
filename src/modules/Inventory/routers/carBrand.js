import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carbrandService } from '../services/carBrand.js';

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          // const {id} = req.params
          const result = await carbrandService.getAllCarbrand();
          res.send(result);
     })
);

router.get(
     '/carbrand-single/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await carbrandService.getSingleCarbrand(id);
          res.send(result);
     })
);

router.post(
     '/add-carbrand',
     httpHandler(async (req, res) => {
          const result = await carbrandService.addNewCarbrand(req.body);

          res.send(result);
     })
);

export default router;
