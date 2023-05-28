import mongoose from 'mongoose';

const carBrandSchema = new mongoose.Schema(
     {
          leaseType_id: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'leaseType',
                    required: false,
               },
          ],
          companyName: String,
          makeCode: {
               type: Number,
               unique: true, // Specify unique constraint
               required: false,
          },
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
