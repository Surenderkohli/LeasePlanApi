import mongoose from 'mongoose';

const carBrandSchema = new mongoose.Schema(
     {
          leaseType_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'leaseType',
               required: true,
          },
          companyName: String,
          isDeleted: {
               type: Boolean,
               default: false,
          },
          isDeactivated: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

export default mongoose.model('carBrand', carBrandSchema);
