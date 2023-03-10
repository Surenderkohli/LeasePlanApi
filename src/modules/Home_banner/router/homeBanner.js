import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { bannerService } from '../services/homeBanner.js';

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
               cb(
                    new Error(
                         'Please upload an image file with .png, .jpg, or .jpeg extension.'
                    )
               );
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
          try {
               const { filename } = req.file || { filename: null };
               const data = req.body;

               const result = await bannerService.addNewBanner(data, filename);
               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/single-banner/:id',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const result = await bannerService.getSingleBanner(id);
               res.status(200).json({ success: true, data: result });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.put(
     '/update/:id',
     bannerUpload.single('banner'),
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const { filename } = req.file || { filename: null };
               const data = req.body;

               const result = await bannerService.updateBanner(
                    id,
                    data,
                    filename
               );
               console.log(result);
               res.send(result);
          } catch (error) {
               res.status(400).json({ success: false, msg: error.message });
          }
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          try {
               const data = req.body;
               const { id } = req.params;
               const result = await bannerService.deleteBanner(id, data);
               res.status(200).json({
                    success: true,
                    msg: 'Banner deleted successfully',
               });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

export default router;
