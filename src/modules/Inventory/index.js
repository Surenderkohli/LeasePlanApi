import { Router } from 'express';
import inventoryRouter from './routers/leaseType.js';
import carbrandRouter from './routers/carBrand.js';
import carseriesRouter from './routers/carSeries.js';
import carRouter from './routers/carDetails.js';

const router = Router();
router.use(`/leasetype`, inventoryRouter);
router.use(`/carbrand`, carbrandRouter);
router.use(`/carseries`, carseriesRouter);
router.use(`/cardetails`, carRouter);

const InventoryModule = {
     init: (app) => {
          app.use(router);
          console.log('Inventory is added.....');
     },
};

export default InventoryModule;
