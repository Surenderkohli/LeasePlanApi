import mongoose from 'mongoose';

const carSeriesSchema = new mongoose.Schema(
     {
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carBrand',
          },
          leaseType_id: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'leaseType',
                    required: false,
               },
          ],
          seriesName: {
               type: String,
               required: true,
          },
          modelCode: {
               type: Number,
               unique: true, // Specify unique constraint
               required: false,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

export default mongoose.model('carSeries', carSeriesSchema);
