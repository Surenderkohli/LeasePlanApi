import userModel from '../models/user.js';
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

const changePassword = async (
     userId,
     oldPassword,
     newPassword,
     confirmPassword
) => {
     const user = await userModel.findById({ _id: userId });

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

     // Check if new password and confirm password match
     if (newPassword !== confirmPassword) {
          throw new Error('New password and confirm password do not match');
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

const sendOTP = async (email, otp) => {
     // Send OTP to the user (e.g., via email or SMS)
     // Replace the following code with your OTP sending logic

     // Example using SendGrid to send OTP via email
     const msg = {
          to: email,
          from: 'dhananjay@plaxonic.com', // Change to your verified sender
          subject: 'OTP for Account Verification',
          text: `Your OTP is ${otp}`,
          html: `<p>Your OTP is <strong>${otp}</strong></p>`,
     };

     try {
          const response = await sgMail.send(msg);
          console.log('OTP sent:', response);
     } catch (error) {
          console.log('Error sending OTP:', error);
          throw new Error('Failed to send OTP');
     }
};

const verifyOTP = async (OTP) => {
     const user = await userModel.findOne({ otp: OTP });

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

const getUserByEmail = async (email) => {
     const user = await userModel.findOne({ email: email });

     return user;
};

const deleteUser = async (id) => {
     const response = await userModel.findOneAndDelete({
          _id: id,
     });
     return response;
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
     getUserByEmail,
     deleteUser,
     sendOTP,
};
