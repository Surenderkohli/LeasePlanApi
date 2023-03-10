import { Router } from 'express';
import multer from 'multer';
import { httpHandler } from '../../../helpers/error-handler.js';
import { userService } from '../services/user.js';
import generateToken from '../utils/generateToken.js';
import userModel from '../models/user.js';
import { isAdmin, protect, isAuthenticated } from '../middleware/auth.js';

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
               const { filename } = req.file || { filename: null };
               const { name, email, password, roles } = req.body;
               const data = { name, email, password, roles };

               const userExists = await userModel.findOne({ email });

               if (userExists) {
                    res.status(409); // Conflict status code for existing resource
                    throw new Error('User already exists');
               }

               const user = await userService.register(data, filename);

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
     protect,
     isAuthenticated,
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;

               const result = await userService.updateUser(id, req.body);

               res.send({ status: 200, success: true, data: result });
          } catch (error) {
               res.send({ status: 500, success: false, msg: error.message });
          }
     })
);

export default router;
