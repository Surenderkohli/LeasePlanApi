import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { queryDetailsService } from '../services/query.js';
import multer from 'multer';

const router = new Router();

const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, 'uploads/');
     },
     filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname);
     },
});

const upload = multer({ storage: storage });

router.post(
     '/add-query',
     upload.none(),
     httpHandler(async (req, res) => {
          try {
               const { longTerm, flexi } = req.body;

               const result = await queryDetailsService.addQueryDetails({
                    longTerm,
                    flexi,
               });

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
               res.status(200).json({ success: true, data: result });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await queryDetailsService.getSingleQueryDetails(id);
          res.status(200).json({ success: true, data: result });
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const data = req.body;
          const result = await queryDetailsService.deleteQueryDetails(id, data);
          res.status(200).json({
               success: true,
               msg: 'Enquiry deleted successfully',
          });
     })
);

export default router;
