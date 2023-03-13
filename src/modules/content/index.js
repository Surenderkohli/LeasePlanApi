import { Router } from 'express';
import queryDetails from './routers/query.js';

const router = Router();
router.use(`/query-details`, queryDetails);

const queryDetailsModule = {
     init: (app) => {
          app.use(router);
          console.log('QueryForm is added.....');
     },
};

export default queryDetailsModule;
