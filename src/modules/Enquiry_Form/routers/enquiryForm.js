import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { enquiryFormService } from '../services/enquiryForm.js';

const router = new Router();

router.post(
     '/add-enquireForm',
     httpHandler(async (req, res) => {
          try {
               const result = await enquiryFormService.addForm(req.body);
               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const result = await enquiryFormService.getAllForm();
               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

export default router;
