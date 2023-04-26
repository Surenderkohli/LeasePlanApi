import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { bannerService } from '../services/homeBanner.js';
import { v2 as cloudinary } from 'cloudinary';

import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.API_KEY,
     api_secret: process.env.API_SECRET,
});

const bannerStorage = multer.diskStorage({
     destination: 'public/images/car',
     filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() + file.originalname);
     },
});

// Configure Multer upload middleware
const upload = multer({
     storage: bannerStorage,
     limits: { fileSize: 20 * 1024 * 1024 },
     fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
               cb(
                    new Error(
                         'Please upload an image file with .png, .jpg, or .jpeg extension.'
                    )
               );
          }
          // Only accept one file with the field name 'image'
          if (req.files && req.files.length >= 1) {
               cb(new Error('Only one file allowed.'));
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
     upload.single('image'),
     httpHandler(async (req, res) => {
          try {
               if (!req.file || !req.file.path) {
                    throw new Error('Image not provided or invalid');
               }

               let result = await cloudinary.uploader.upload(req.file.path); // Upload image to Cloudinary
               const imageUrl = result.secure_url; // Get the URL of the uploaded image
               const publicId = result.public_id; // Get the public ID of the uploaded image

               //Check whether the status value is valid
               const { status } = req.body;
               if (status && !['active', 'inactive'].includes(status)) {
                    throw new Error('Invalid status value');
               }

               // Save Cloudinary image URL and public ID in the database
               const data = req.body;
               const bannerData = { imageUrl, publicId, status };

               result = await bannerService.addNewBanner(data, bannerData);
               res.send(result);
          } catch (error) {
               let statusCode = 500; // Default status code
               let message = 'Internal server error'; // Default error message
               if (
                    error.message === 'Image not provided or invalid' ||
                    error.message === 'Invalid status value'
               ) {
                    statusCode = 400; // Bad Request status code
                    message = error.message;
               }
               res.status(statusCode).json({
                    success: false,
                    error: message,
               });
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
     upload.single('image'),
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;

               //Check whether the status value is valid
               const { status } = req.body;
               if (status && !['active', 'inactive'].includes(status)) {
                    throw new Error('Invalid status value');
               }

               // retrieve the data to be updated
               const data = req.body;

               // check if there's a new file uploaded
               if (req.file) {
                    // delete the old image from cloudinary
                    const banner = await bannerService.getSingleBanner(id);

                    if (banner && banner.publicId) {
                         await cloudinary.uploader.destroy(banner.publicId);
                    }

                    // upload the new image file to cloudinary
                    const result = await cloudinary.uploader.upload(
                         req.file.path
                    );

                    // update the image URL in the request body
                    data.imageUrl = result.secure_url;
                    data.publicId = result.public_id;
               }

               // update the data in the database
               const response = await bannerService.updateBanner(id, data);

               // return the updated data
               res.send(response);
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

router.get(
     '/count',
     httpHandler(async (req, res) => {
          try {
               const count = await bannerService.getCount({
                    status: 'active',
               });
               res.status(200).json({ success: true, count });
          } catch (error) {
               res.status(400).json({ success: false, error: error.message });
          }
     })
);

router.get('/status/:id', async (req, res) => {
     try {
          const { id } = req.params;

          const banner = await bannerService.getBanner(id);

          if (banner) {
               // If the banner is active, return the banner
               res.json({
                    status: 'success',
                    banner: banner,
               });
          } else {
               // If the banner is inactive or not found, disable the banner
               res.json({
                    status: 'success',
                    banner: null,
               });
          }
     } catch (error) {
          res.status(500).json({
               status: 'error',
               message: error.message,
          });
     }
});

export default router;
