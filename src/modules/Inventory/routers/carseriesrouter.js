import { Router } from "express";
import { httpHandler } from "../../../helpers/error-handler.js";
import { carSeriesServices } from "../services/carSeriesServices.js";

const router = Router()

router.get('/',
    httpHandler(async (req, res) => {
        // const {id} = req.params
        const result = await carSeriesServices.getAllCarseries();
        res.send(result);
    })
)


router.post('/add-carseries',    
    httpHandler(async (req, res) => {
        const result = await carSeriesServices.addNewCarseries(req.body);
        res.send(result);
    })

)

export default router;