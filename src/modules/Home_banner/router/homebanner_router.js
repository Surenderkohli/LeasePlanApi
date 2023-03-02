import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { bannerService } from '../services/homebanner_services.js';

const bannerStorage = multer.diskStorage({
     destination: 'public/images',
     filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() + file.originalname);
     },
});
const bannerUpload = multer({
     storage: bannerStorage,
     limits: {
          fileSize: 2000000,
     },
     fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
               cb(new Error('Please upload a Image'));
          }
          cb(undefined, true);
     },
});

const router = Router();

router.get('/get-banner', async (req, res) => {
     const result = await bannerService.getAllBanner();
     res.send(result);
});

router.post(
     '/upload-banner',
     bannerUpload.single('banner'),
     httpHandler(async (req, res) => {
          const reqfile = req.file.filename;
          const data = req.body;

          const result = await bannerService.addNewBanner(data, reqfile);
          res.send(result);
     })
);

router.get(
     '/single-banner/:id',
     httpHandler(async (req, res) => {
          const { id } = req.params;
          const result = await bannerService.getSingleBanner(id);
          res.send(result);
     })
);

router.put(
     '/update/:id',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const result = await bannerService.updateBanner(id, req.body);

               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          const data = req.body;
          const { id } = req.params;
          const result = await bannerService.deleteBanner(id, data);
          res.send(result);
     })
);

export default router;
