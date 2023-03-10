import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { bannerService } from '../services/homeBanner.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.API_KEY,
     api_secret: process.env.API_SECRET,
});

const bannerStorage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
          folder: 'public/images',
          format: async (req, file) => 'png', //set the format of the image
          public_id: (req, file) => Date.now() + file.originalname,
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
     bannerUpload.single('image'),
     httpHandler(async (req, res) => {
          try {
               let result = await cloudinary.uploader.upload(req.file.path); // Upload image to Cloudinary
               const imageUrl = result.secure_url; // Get the URL of the uploaded image
               const publicId = result.public_id; // Get the public ID of the uploaded image

               // Save Cloudinary image URL and public ID in the database
               const data = req.body;
               const bannerData = { imageUrl, publicId };

               result = await bannerService.addNewBanner(data, bannerData);
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
