import mongoose from 'mongoose';

const carDetailSchema = new mongoose.Schema(
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
          description: String,
          image: {
               type: [],
               data: Buffer,
               required: false,
          },
          imageUrl: {
               type: String,
               required: false,
          },
          publicId: {
               type: String,
               required: false,
          },
          // price: Number,
          bodyType: {
               type: String,
               enum: [
                    'city-car',
                    'coupe',
                    'estate',
                    'sedan',
                    'hatchback',
                    'mpv',
                    'saloon',
                    'sports',
               ],
          },
          // yearModel: {
          //      type: Number,
          //      required: false,
          // },
          door: Number,
          seat: Number,
          gears: {
               type: String,
               required: false,
               default: '6 SPEED',
          },
          // milesPerGallon: Number,
          //annualMileage: Number,
          // annualMileage: {
          //      type: Number,
          //      enum: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000],
          // },
          acceleration: {
               type: String,
               required: false,
               default: '0-62 mph 9.4 seconds',
          },
          co2: String,
          fuelType: {
               type: String,
               enum: ['petrol', 'diesel', 'hybrid', 'electric'],
          },
          transmission: {
               type: String,
               enum: ['automatic', 'manual'],
          },
          tankCapacity: String,
          // contractLengthInMonth: {
          //      type: Number,
          //      enum: [6, 12, 24, 36, 48, 60],
          // },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          priceMin: {
               type: Number,
               required: false,
          },
          priceMax: {
               type: Number,
               required: false,
          },
          // deals: {
          //      type: String,
          //      enum: ['active', 'inactive'],
          //      default: 'inactive',
          // },
     },

     { timestamps: true }
);

export default mongoose.model('carDetails', carDetailSchema);
