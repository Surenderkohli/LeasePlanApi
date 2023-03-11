import userModel from '../models/user.js';

const getAllUsers = async (query) => {
     try {
          const users = await userModel.find(query);
          return users;
     } catch (error) {
          console.error(error);
          throw new Error('Failed to get users');
     }
};

const getSingleUser = async (id) => {
     const user = await userModel.findById({ _id: id });
     return user;
};

const register = async (data, profileData) => {
     try {
          const user = await userModel.create({
               ...data,
               ...profileData,
          });

          return user;
     } catch (error) {
          throw new Error('An error occurred while creating user');
     }
};

const login = async (email, password) => {
     try {
          const user = await userModel.findOne({ email });

          if (!user || !(await user.matchPassword(password))) {
               throw { status: 401, message: 'Invalid email or password' };
          }
          return user;
     } catch (error) {
          throw new Error(`Error in login service: ${error.message}`);
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
     getAllUsers,
     getSingleUser,
};
