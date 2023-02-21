import { Router } from "express";
import inventoryrouter from './routers/inventoryrouter.js'

const router = Router();
router.use(`/inventory`, inventoryrouter);
 
 const InventoryModule={
    init: (app) => {
        app.use(router);
            console.log('Inventory is added.....')
     },
}


export default InventoryModule;