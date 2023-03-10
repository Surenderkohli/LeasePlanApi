import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { leaseTypeService } from '../services/leaseType.js';
import multer from 'multer';

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          // const {id} = req.params
          const result = await leaseTypeService.getAllLeaseType();
          res.send(result);
     })
);

router.post(
     '/add',
     httpHandler(async (req, res) => {
          const result = await leaseTypeService.addLeaseType(req.body);
          res.send(result);
     })
);

router.get('/fetch-single/:id', async (req, res) => {
     const { id } = req.params;
     // const data = req.body;
     const result = await leaseTypeService.getSingleLeaseType(id);
     res.send(result);
});

router.put('/update', async (req, res) => {
     const data = req.body;
     const result = await leaseTypeService.updateLeaseType(data);
     res.send(result);
});

// // router.delete(
// //     '/delete',
// //     (async (req, res) => {
// //         const result = await leasetypeService.deleteleasetype(req.body);
// //         res.send(result)
// //     })
// // );

export default router;
