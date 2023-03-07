import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { userService } from '../services/user.js';
import { check } from 'express-validator';
import generateToken from '../utils/generateToken.js';
import userModel from '../models/user.js';
import { protect } from '../middleware/auth.js';

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
               cb(new Error('Plz upload profile picture'));
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
               const { filename } = req.file;
               const { name, email, password, roles } = req.body;
               const data = { name, email, password, roles };

               const userExists = await userModel.findOne({ email });

               if (userExists) {
                    res.status(404);
                    throw new Error('User already exists');
               }

               const user = await userService.register(data, filename);

               if (user) {
                    res.status(201).json({
                         success: true,
                         data: user,
                         token: generateToken(user._id),
                    });
               } else {
                    res.status(400);
                    throw new Error('User not found');
               }
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

               const user = await userModel.findOne({ email });

               if (user && (await user.matchPassword(password))) {
                    res.json({
                         _id: user._id,
                         name: user.name,
                         email: user.email,
                         token: generateToken(user._id),
                    });
               } else {
                    res.status(401);
                    throw new Error('Invalid Email or Password');
               }
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get('/get-user', async (req, res) => {
     const result = await userService.getAllUser();
     res.send(result);
});

router.get('/get-single-user/:id', async (req, res) => {
     const { id } = req.params;
     const result = await userService.getSingleUser(id);
     res.send(result);
});

router.put(
     '/profile-update/:id',
     protect,
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;

               const result = await userService.updateUser(id, req.body);

               res.send(result);
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

export default router;
