import mongoose from 'mongoose';

const carSeriesSchema = new mongoose.Schema(
     {
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carbrands',
          },
          leaseType_id: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'leasetypes',
                    required: false,
               },
          ],
          seriesName: {
               type: String,
               required: true,
          },
          modelCode: {
               type: Number,
               unique: true,
               required: false,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

const carSeriesModel = mongoose.model('carseries', carSeriesSchema);

export default carSeriesModel;
