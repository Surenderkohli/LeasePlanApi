import { Router } from "express";
import inventoryRouter from './routers/leasetyperouter.js'
import carbrandRouter from './routers/carbrandrouter.js'
import carseriesRouter from './routers/carseriesrouter.js'
import carRouter from './routers/cardetailrouter.js'


const router = Router();
router.use(`/leasetype`, inventoryRouter);
router.use(`/carbrand`, carbrandRouter);
router.use(`/carseries`,carseriesRouter);
router.use(`/cardetails`, carRouter);

const InventoryModule = {
    init: (app) => {
        app.use(router);
        console.log('Inventory is added.....')
    },
}


export default InventoryModule;