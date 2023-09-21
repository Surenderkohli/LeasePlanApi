import mongoose from 'mongoose';
import cron from 'node-cron';

const carOfferSchema = new mongoose.Schema(
     {
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carbrands',
          },
          carSeries_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carseries',
          },
          leaseType: {
               type: String,
               required: false,
          },
          term: {
               type: String,
               enum: ['Short Term', 'Long Term'],
               required: false,
          },
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
                         validate: {
                              validator: function (value) {
                                   return /^(yes|no)$/i.test(value);
                              },
                              message: 'Best deals value must be "Yes" or "No".',
                         },
                         default: 'No',
                    },
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
               },
          ],
          isDeleted: {
               type: Boolean,
               default: false,
          },
     },

     { timestamps: true }
);

carOfferSchema.methods.isExpired = async function () {
    const currentDate = Date.now();

    this.offers.forEach((offer) => {
        if (offer.validTo && offer.validTo < currentDate) {
            offer.expired = true;
        }
    });
    // Save the updated document
    await this.save();
};

const carOfferModel = mongoose.model('caroffers', carOfferSchema);


cron.schedule('0 0 * * *',async()=>{
    try {
        const carOffers = await carOfferModel.find({})
        carOffers.forEach(async (offer)=>{
            await offer.isExpired()
        })
        console.log('Expired field updated successfully.');
    }catch (error){
        console.error('Error updating expiry:', error);
    }
}, {
    scheduled: true,
    timezone:"Asia/Kolkata"
   // timezone: "Asia/Dubai"
})

export default carOfferModel;
