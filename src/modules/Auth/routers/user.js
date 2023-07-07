import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { userService } from '../services/user.js';
import generateToken from '../utils/generateToken.js';
import userModel from '../models/user.js';
import { isAdmin, protect, isAuthenticated } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

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
               const { name, email, password, roles } = req.body;

               const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

               if (!emailRegex.test(email)) {
                    res.status(400).json({
                         success: false,
                         error: 'Invalid email',
                    });
                    return;
               }

               let imageUrl, publicId;

               if (req.file && req.file.path) {
                    const result = await cloudinary.uploader.upload(
                         req.file.path
                    );
                    imageUrl = result.secure_url;
                    publicId = result.public_id;
               }

               const data = { name, email, password, roles };

               const userExists = await userModel.findOne({ email });

               if (userExists) {
                    res.status(409).json({
                         success: false,
                         error: 'User already exists',
                    });
                    return;
               }

               const profileData = { imageUrl, publicId };

               const user = await userService.register(data, profileData);

               res.status(201).send({
                    success: true,
                    data: user,
                    token: generateToken(user._id, user.roles),
               });
          } catch (error) {
               console.error(error);
               res.status(500).json({
                    success: false,
                    error: 'Internal server error',
               });
          }
     })
);

router.post(
     '/login',
     httpHandler(async (req, res) => {
          try {
               const { email, password } = req.body;

               const user = await userService.login(email, password);

               if (!user || !(await user.matchPassword(password))) {
                    throw new Error('Invalid email or password');
               }

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
               res.status(400).send({ success: false, msg: error.message });
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

router.post(
     '/change_password',
     profileUpload.none(),
     protect,
     async (req, res) => {
          try {
               const { oldPassword, newPassword, confirmPassword } = req.body;

               // // Check if any of the required fields are empty
               // if (!oldPassword || !newPassword || !confirmPassword) {
               //      return res.status(400).send({
               //           success: false,
               //           msg: 'All fields must be filled',
               //      });
               // }

               // Check if any of the required fields are empty
               if (!oldPassword) {
                    return res.status(400).send({
                         success: false,
                         msg: 'Please provide the old password',
                    });
               }

               if (!newPassword) {
                    return res.status(400).send({
                         success: false,
                         msg: 'Please provide the new password',
                    });
               }

               if (!confirmPassword) {
                    return res.status(400).send({
                         success: false,
                         msg: 'Please provide the confirmation password',
                    });
               }

               const response = await userService.changePassword(
                    req.user.id,
                    oldPassword,
                    newPassword,
                    confirmPassword
               );

               res.send(response);
          } catch (error) {
               console.log(error);
               if (error.message === 'User not found') {
                    res.status(404).send({
                         success: false,
                         msg: 'User not found',
                    });
               } else if (error.message === 'Old password is incorrect') {
                    res.status(401).send({
                         success: false,
                         msg: 'Old password is incorrect',
                    });
               } else if (
                    error.message ===
                    'New password must be different from old password'
               ) {
                    res.status(400).send({
                         success: false,
                         msg: 'New password must be different from old password',
                    });
               } else if (
                    error.message ===
                    'New password and confirm password do not match'
               ) {
                    res.status(400).send({
                         success: false,
                         msg: 'New password and confirm password do not match',
                    });
               } else {
                    res.status(500).send('An unexpected error occurred');
               }
          }
     }
);

router.post('/forgot_password', profileUpload.none(), async (req, res) => {
     try {
          const { email } = req.body;

          // Check if email is empty
          if (!email) {
               return res.status(400).send({
                    success: false,
                    msg: 'Email address is required',
               });
          }

          await userService.forgotPassword(email);

          res.status(200).send({
               success: true,
               msg: 'An email with the OTP has been sent to your email address',
          });
     } catch (error) {
          if (error.message === 'User not found') {
               res.status(404).send({
                    success: false,
                    msg: 'User not found',
               });
          } else {
               console.log(error);
               res.status(500).send('An unexpected error occurred');
          }
     }
});

router.post('/reset_password', profileUpload.none(), async (req, res) => {
     try {
          const { otp, newPassword } = req.body;

          const user = await userService.verifyOTP(otp);

          if (!user) {
               return res.status(400).send({
                    success: false,
                    msg: 'Invalid OTP',
               });
          }

          await userService.resetPassword(user, newPassword);

          res.status(200).send({
               success: true,
               msg: 'Password reset successful',
          });
     } catch (error) {
          if (error.message === 'User not found') {
               res.status(404).send({
                    success: false,
                    msg: 'User not found',
               });
          } else {
               console.log(error);
               res.status(500).send('An unexpected error occurred');
          }
     }
});

let otpTimestamp = 0; // Define otpTimestamp as a global variable outside the endpoint

router.post('/resend_otp', profileUpload.none(), async (req, res) => {
     try {
          const { email } = req.body;

          const user = await userService.getUserByEmail(email);

          if (!user) {
               return res.status(404).send({
                    success: false,
                    msg: 'User not found',
               });
          }

          const currentTime = Date.now();
          // const currentTime = new Date();
          const timeDiff = currentTime - otpTimestamp;

          if (timeDiff < 30000) {
               // Less than 30 seconds since the last OTP was sent
               return res.status(429).send({
                    success: false,
                    msg: 'Please wait before resending OTP',
               });
          }

          // const otp = generateOTP(); // Replace generateOTP() with your own OTP generation logic
          const otp = Math.floor(100000 + Math.random() * 900000);
          user.otp = otp;
          await user.save();

          otpTimestamp = currentTime; // Update the OTP timestamp to the current time
          console.log('otpTimestamp', otpTimestamp);
          // Send the OTP to the user (e.g., via email or SMS)
          await userService.sendOTP(user.email, otp);

          res.status(200).send({
               success: true,
               msg: 'OTP resent successfully',
          });
     } catch (error) {
          console.log(error);
          res.status(500).send('An unexpected error occurred');
     }
});

router.delete('/delete/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const user = await userService.deleteUser(id);

          res.status(200).send({
               success: true,
               msg: 'User deleted successfully',
          });
     } catch (error) {
          res.status(400).send({
               success: false,
               error: error.message,
          });
     }
});

router.delete('/delete-multiple-collections', async (req, res) => {
     try {
          const collectionsToDelete =
               typeof req.query.collections === 'string'
                    ? req.query.collections.split(',')
                    : [];

          if (collectionsToDelete.length === 0) {
               return res
                    .status(400)
                    .json({ message: 'No collections provided' });
          } //['caroffers', 'cardetails', 'carfeatures']

          const promises = collectionsToDelete.map((collectionName) =>
               mongoose.connection.dropCollection(collectionName)
          );
          await Promise.all(promises);

          res.status(200).json({ message: 'Collections deleted successfully' });
     } catch (error) {
          res.status(500).json({ error: 'Failed to delete collections' });
     }
});

export default router;
