import { Router } from 'express';
import bannerhome from './router/homeBanner.js';

const router = Router();
router.use(`/banner`, bannerhome);

const BannerModule = {
     init: (app) => {
          app.use(router);
          console.log('Banner is added.....');
     },
};

export default BannerModule;
