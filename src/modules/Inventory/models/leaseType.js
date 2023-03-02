import mongoose from 'mongoose';

const leaseTypeSchema = new mongoose.Schema(
     {
          leaseType: {
               type: String,
          },

          isDeleted: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

export default mongoose.model('leaseType', leaseTypeSchema);
