import mongoose from 'mongoose';

const carOfferSchema = new mongoose.Schema(
     {
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carBrand',
          },
          carSeries_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carSeries',
          },
          leaseType_id: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'leaseType',
               },
          ],
          yearModel: {
               type: Number,
               required: false,
          },
          offers: [
               {
                    duration: Number,
                    annualMileage: Number,
                    monthlyCost: Number,
                    calculationNo: Number,
               },
          ],
          validFrom: {
               type: Date,
               required: false,
          },
          validTo: {
               type: Date,
               required: false,
          },
     },

     { timestamps: true }
);

export default mongoose.model('carOffer', carOfferSchema);
