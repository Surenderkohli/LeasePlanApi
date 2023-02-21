import { Router } from "express";
// import bannerhome from './router/homebanner_router.js'

import userRouter from './routers/userRouter.js'


const router = Router();
router.use(`/user`,userRouter );
 
 const userModule = {
    
    init: (app) => {
        app.use(router);
            console.log('User added successfully')
     },

}


export default userModule;