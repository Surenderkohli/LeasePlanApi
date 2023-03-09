import { Router } from 'express';

import userRouter from './routers/user.js';

const router = Router();
router.use(`/user`, userRouter);

const userModule = {
     init: (app) => {
          app.use(router);
          console.log('User added successfully');
     },
};

export default userModule;
