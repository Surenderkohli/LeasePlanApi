import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { leaseTypeService } from '../services/leaseType.js';

const router = Router();


router.post(
    '/add',
    httpHandler(async (req, res) => {
        try {
            const result = await leaseTypeService.addLeaseType(req.body);
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    })
);

router.get(
    '/',
    httpHandler(async (req, res) => {
        try {
            const result = await leaseTypeService.getAllLeaseType();
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    })
);


router.get('/fetch-single/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await leaseTypeService.getSingleLeaseType(id);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get(
     '/count',
     httpHandler(async (req, res) => {
          try {
               const count = await leaseTypeService.getCount({
                    is_deactivated: false,
               });
               res.status(200).json({ success: true, count });
          } catch (error) {
               res.status(400).json({ success: false, error: error.message });
          }
     })
);

router.delete('/delete/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const result = await leaseTypeService.deleteLeaseType(id);
          res.send(result);
     } catch (error) {
          res.status(400).json({ success: false, error: error.message });
     }
});

export default router;
