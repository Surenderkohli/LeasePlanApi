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
                    leaseType: {
                         type: String,
                         required: true,
                    },
                    term: {
                         type: String,
                         enum: ['Short Term', 'Long Term'],
                         required: false,
                    },
               },
          ],
          // yearModel: {
          //      type: Number,
          //      required: false,
          // },
          offers: [
               {
                    duration: Number,
                    annualMileage: Number,
                    monthlyCost: Number,
                    calculationNo: Number,
                    bestDeals: {
                         type: String,
                         enum: ['Yes', 'No'],
                         default: 'No',
                    },
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
          expired: {
               type: Boolean,
               default: false,
          },
          // deals: {
          //      type: String,
          //      enum: ['active', 'inactive'],
          //      default: 'inactive',
          // },
     },

     { timestamps: true }
);

carOfferSchema.methods.isExpired = function () {
     if (this.validTo && this.validTo < Date.now()) {
          this.expired = true;
     }
     this.offers.forEach((offer) => {
          if (offer.validTo && offer.validTo < Date.now()) {
               offer.expired = true;
          }
     });
};

export default mongoose.model('carOffer', carOfferSchema);
