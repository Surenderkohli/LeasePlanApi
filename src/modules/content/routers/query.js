import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { queryDetailsService } from '../services/query.js';

const router = new Router();

router.post(
     '/add-query',
     httpHandler(async (req, res) => {
          try {
               const result = await queryDetailsService.addQueryDetails(
                    req.body
               );

               return res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Enquiry created successfully',
               });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const result = await queryDetailsService.getAllQueryDetails();

               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await queryDetailsService.getAllQueryDetails(id);
          res.send(result);
     })
);

export default router;
