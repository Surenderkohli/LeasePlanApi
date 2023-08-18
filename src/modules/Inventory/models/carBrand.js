import mongoose from 'mongoose';

const carBrandSchema = new mongoose.Schema(
     {
          leaseType_id: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'leasetypes',
                    required: false,
               },
          ],
          companyName: String,
          makeCode: {
               type: Number,
               unique: true,
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

const carBrandModel = mongoose.model('carbrands', carBrandSchema);

export default carBrandModel;
