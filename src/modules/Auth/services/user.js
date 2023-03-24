import userModel from '../models/user.js';
import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

const changePassword = async (email, oldPassword, newPassword) => {
     const user = await userModel.findOne({ email });
     if (!user) {
          throw new Error('User not found');
     }
     const isMatch = await user.matchPassword(oldPassword);
     if (!isMatch) {
          throw new Error('Old password is incorrect');
     }

     if (oldPassword === newPassword) {
          throw new Error('New password must be different from old password');
     }

     // Update password
     user.password = newPassword;
     await user.save();

     return { message: 'Password changed successfully' };
};

const forgotPassword = async (email) => {
     //Generate a 6 digit OTP
     const OTP = Math.floor(100000 + Math.random() * 900000);

     //Save the OTP in the user's document
     const user = await userModel.findOneAndUpdate({ email }, { otp: OTP });

     if (!user) {
          throw new Error('User not found');
     }

     //Send email with OTP using SendGrid
     const msg = {
          to: [email],
          from: 'dhananjay@plaxonic.com', // Change to your verified sender
          subject: 'Password Reset Request',
          text: `Your OTP is ${OTP}`,
          html: `Your OTP is <strong>${OTP}</strong>`,
     };

     const response = await sgMail.send(msg);
     return response;
};

const verifyOTP = async (email, OTP) => {
     const user = await userModel.findOne({ email });

     if (!user || user.otp !== parseInt(OTP)) {
          return null;
     }

     return user;
};

const resetPassword = async (user, newPassword) => {
     user.password = newPassword;
     user.otp = null;
     await user.save();
};

export const userService = {
     register,
     login,
     updateUser,
     getAllUsers,
     getSingleUser,
     changePassword,
     forgotPassword,
     verifyOTP,
     resetPassword,
};
