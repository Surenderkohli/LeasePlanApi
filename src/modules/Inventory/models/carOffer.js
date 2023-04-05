import mongoose from 'mongoose';

const carOfferSchema = new mongoose.Schema(
     {
          carSeries_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carSeries',
          },
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carBrand',
          },
          leaseType_id: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'leaseType',
               },
          ],
          carFeatures_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carFeature',
          },
          yearModel: {
               type: Number,
               required: false,
          },
          annualMileage: Number,
          duration: {
               type: Number,
               enum: [6, 12, 24, 36, 48, 60],
          },
          monthlyCost: Number,
          deals: {
               type: String,
               enum: ['active', 'inactive'],
               default: 'inactive',
          },
     },

     { timestamps: true }
);

export default mongoose.model('carOffer', carOfferSchema);
