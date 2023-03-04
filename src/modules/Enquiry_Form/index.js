import { Router } from 'express';
import enquiryForm from './routers/enquiryForm.js';

const router = Router();
router.use(`/enquiry-form`, enquiryForm);

const EnquiryFormModule = {
     init: (app) => {
          app.use(router);
          console.log('EnquireForm is added.....');
     },
};

export default EnquiryFormModule;
