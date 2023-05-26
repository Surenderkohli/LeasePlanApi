import mongoose from 'mongoose';

const leaseTypeSchema = new mongoose.Schema(
     {
          leaseType: {
               type: String,
               required: false,
               enum: ['Private Lease', 'Business Lease'],
          },
          term: {
               type: String,
               enum: ['Short Term', 'Long Term'],
               required: true,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

export default mongoose.model('leaseType', leaseTypeSchema);
