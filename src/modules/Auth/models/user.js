import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          email: {
               type: String,
               required: true,
          },
          password: {
               type: String,
               required: true,
          },
          encry_password: {
               type: String,
               required: false,
          },
          salt: String,
          mobileNumber: Number,
          address: String,
          profile: {
               type: String,
               data: Buffer,
          },
          imageUrl: {
               type: String,
               required: false,
          },
          publicId: {
               type: String,
               required: false,
          },
          roles: {
               type: String,
               enum: ['superadmin', 'admin', 'user'],
               default: 'user',
               required: false,
          },
          is_deleted: {
               type: Boolean,
               default: false,
          },
          is_deactivated: {
               type: Boolean,
               default: false,
          },
          otp: Number,
     },
     { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
     return await bcrypt.compare(enteredPassword, this.password);
};

// will encrypt password everytime its saved
userSchema.pre('save', async function (next) {
     if (!this.isModified('password')) {
          next();
     }
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
});

const userModel = mongoose.model('users', userSchema);

export default userModel;
