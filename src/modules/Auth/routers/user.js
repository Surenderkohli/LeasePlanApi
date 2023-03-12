import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { userService } from '../services/user.js';
import generateToken from '../utils/generateToken.js';
import userModel from '../models/user.js';
import { isAdmin, protect, isAuthenticated } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';

import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.API_KEY,
     api_secret: process.env.API_SECRET,
});

const userProfileStorage = multer.diskStorage({
     destination: 'public/images/profile',
     filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() + file.originalname);
     },
});

const profileUpload = multer({
     storage: userProfileStorage,
     limits: {
          fileSize: 1000000,
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

router.post(
     '/register',
     profileUpload.single('profile'),
     httpHandler(async (req, res) => {
          try {
               let result = await cloudinary.uploader.upload(req.file.path); // Upload image to Cloudinary

               const imageUrl = result.secure_url; // Get the URL of the uploaded image
               const publicId = result.public_id; // Get the public ID of the uploaded image

               const { name, email, password, roles } = req.body;
               const data = { name, email, password, roles };

               const userExists = await userModel.findOne({ email });

               if (userExists) {
                    res.status(409); // Conflict status code for existing resource
                    throw new Error('User already exists');
               }

               const profileData = { imageUrl, publicId };

               const user = await userService.register(data, profileData);

               res.status(201).send({
                    success: true,
                    data: user,
                    token: generateToken(user._id, user.roles),
               });
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.post(
     '/login',
     httpHandler(async (req, res) => {
          try {
               const { email, password } = req.body;

               const user = await userService.login(email, password);

               res.status(200).send({
                    success: true,
                    data: {
                         _id: user._id,
                         name: user.name,
                         email: user.email,
                         token: generateToken(user._id, user.roles),
                    },
               });
          } catch (error) {
               res.send({ status: 500, success: false, msg: error.message });
          }
     })
);

router.get('/get-users', protect, isAdmin, async (req, res) => {
     try {
          let query = {};

          // If the user is not an admin, only return users with 'user' role
          if (req.query) {
               query = { roles: 'user' };
          }

          const users = await userService.getAllUsers(query);

          res.send({ status: 200, success: true, data: users });
     } catch (error) {
          res.send({ status: 500, success: false, msg: error.message });
     }
});

router.get(
     '/get-single-user/:id',
     protect,
     isAuthenticated,
     async (req, res) => {
          try {
               const { id } = req.params;
               const user = await userService.getSingleUser(id);

               res.send({ status: 200, success: true, data: user });
          } catch (error) {
               res.send({ status: 500, success: false, msg: error.message });
          }
     }
);

router.put(
     '/profile-update/:id',
     profileUpload.single('profile'),
     protect,
     isAuthenticated,
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;

               // retrieve the data to be updated
               const data = req.body;

               // check if there's a new file uploaded
               if (req.file) {
                    // delete the old image from cloudinary
                    const profile = await userService.getSingleUser(id);

                    if (profile && profile.publicId) {
                         await cloudinary.uploader.destroy(profile.publicId);
                    }

                    // upload the new image file to cloudinary
                    const result = await cloudinary.uploader.upload(
                         req.file.path
                    );

                    // update the image URL in the request body
                    data.imageUrl = result.secure_url;
                    data.publicId = result.public_id;
               }

               const response = await userService.updateUser(id, data);

               res.send({ status: 200, success: true, data: response });
          } catch (error) {
               res.send({ status: 500, success: false, msg: error.message });
          }
     })
);

export default router;
