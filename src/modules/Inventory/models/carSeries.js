import mongoose from 'mongoose';

const carBrandSchema = new mongoose.Schema(
     {
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carBrand',
          },
          seriesName: {
               type: String,
               required: true,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

export default mongoose.model('carSeries', carBrandSchema);
