import userModel from '../models/user.js';
import generateToken from '../utils/generateToken.js';

const getAllUser = async () => {
     const response = await userModel.find();
     return response;
};

const getSingleUser = async (id) => {
     const response = await userModel.findById({ _id: id });
     return response;
};

const register = async (data, reqfile) => {
     try {
          const user = await userModel.create({
               ...data,
               profile: reqfile,
          });

          return user;
     } catch (error) {
          console.error(error);
     }
};

const login = async (data) => {
     const user = await userModel.findOne({ email });

     if (user && (await user.matchPassword(password))) {
          res.json({
               _id: user._id,
               name: user.name,
               email: user.email,
               isAdmin: user.isAdmin,
               pic: user.pic,
               token: generateToken(user._id),
          });
     } else {
          res.status(401);
          throw new Error('Invalid Email or Password');
     }
};

const updateUser = async (id, data) => {
     try {
          const user = await userModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               {
                    new: true,
               }
          );
          return user;
     } catch (error) {
          console.error(error);
     }
};

export const userService = {
     register,
     login,
     updateUser,
     getAllUser,
     getSingleUser,
};
