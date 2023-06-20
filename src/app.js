import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
     errorHandler,
     notFoundHandler,
} from './helpers/error-middleware-handler.js';
import InventoryModule from './modules/Inventory/index.js';
import BannerModule from './modules/Home_banner/index.js';
import userModule from './modules/Auth/index.js';
import EnquiryFormModule from './modules/Enquiry_Form/index.js';
import QueryDetailsModule from './modules/content/index.js';

const modules = [
     InventoryModule,
     BannerModule,
     userModule,
     EnquiryFormModule,
     QueryDetailsModule,
];

export const CreateApp = () => {
     const app = express();
     app.set('trust proxy', true);
     app.use(express.json());
     app.use(bodyParser.urlencoded({ extended: true }));
     app.use(
          cors({
               origin: '*',
               methods: 'GET,POST,PUT,DELETE',
               //credentials: true,
          })
     );
     app.use('/static', express.static('errorFile'));
     return app;
};

export const finishApp = (app) => {
     app.use(notFoundHandler);
     app.use(errorHandler);
};

export const useModules = (app) => {
     modules.map((module) => module.init(app));
};
