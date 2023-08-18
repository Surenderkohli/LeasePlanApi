import { Router } from 'express';
import leaseTypeRouter from './routers/leaseType.js';
import carbrandRouter from './routers/carBrand.js';
import carseriesRouter from './routers/carSeries.js';
import carRouter from './routers/carDetails.js';
import carFeature from './routers/carFeatures.js';
import carOffer from './routers/carOffer.js';

const router = Router();
router.use(`/leasetype`, leaseTypeRouter);
router.use(`/carbrand`, carbrandRouter);
router.use(`/carseries`, carseriesRouter);
router.use(`/cardetails`, carRouter);
router.use('/carFeature', carFeature);
router.use('/carOffer', carOffer);

const InventoryModule = {
     init: (app) => {
          app.use(router);
          console.log('Inventory is added.....');
     },
};

export default InventoryModule;
