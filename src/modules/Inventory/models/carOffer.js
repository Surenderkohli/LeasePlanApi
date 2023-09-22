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

// carOfferSchema.methods.isExpired = async function () {
//     try {
//         const carOffers = await this.constructor.find({}); // Fetch all documents
//
//         const currentDate = Date.now();
//
//         for (const offer of carOffers) {
//             offer.offers.forEach(offerItem => {
//                 if (offerItem.validTo) {
//                     const validTo = new Date(offerItem.validTo);
//                   // validTo.setHours(23, 59, 59, 999); // Set to end of day
//                     if (validTo >= currentDate) {
//                         offerItem.expired = false;
//                     } else {
//                         offerItem.expired = true;
//                     }
//                 }
//             });
//
//             await offer.save();
//         }
//
//         console.log('Expired field updated successfully for all documents.');
//     } catch (error) {
//         throw new Error(`Error updating expiry: ${error.message}`);
//     }
// };
//
//
const carOfferModel = mongoose.model('caroffers', carOfferSchema);
//
// cron.schedule('0 0 * * *', async () => {
//     try {
//         const carOffers = await carOfferModel.find({});
//         await Promise.all(carOffers.map(async offer => {
//             await offer.isExpired();
//         }));
//         console.log('Expired field updated successfully.');
//     } catch (error) {
//         console.error('Error updating expiry:', error);
//     }
// }, {
//     scheduled: true,
//   //  timezone: "Asia/Kolkata"
// });

export default carOfferModel;
