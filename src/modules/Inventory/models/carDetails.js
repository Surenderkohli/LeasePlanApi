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
          imageUrls: [
               {
                    type: String,
                    required: false,
               },
          ],
          price: Number,
          // bodyType: {
          //      type: String,
          //      enum: [
          //           'city-car',
          //           'coupe',
          //           'estate',
          //           'sedan',
          //           'hatchback',
          //           'mpv',
          //           'saloon',
          //           'sports',
          //      ],
          // },
          yearModel: {
               type: Number,
               required: false,
          },
          // door: Number,
          // seat: Number,
          // gears: {
          //      type: String,
          //      required: false,
          //      default: '6 SPEED',
          // },
          // milesPerGallon: Number,
          annualMileage: {
               type: Number,
               enum: [4000, 6000, 8000, 10000, 12000],
          },
          acceleration: {
               type: String,
               required: false,
               default: '0-62 mph 9.4 seconds',
          },
          co2: Number,
          fuelType: {
               type: String,
               enum: ['petrol', 'diesel', 'hybrid', 'electric'],
          },
          // transmission: {
          //      type: String,
          //      enum: ['automatic', 'manual'],
          // },
          contractLengthInMonth: {
               type: Number,
               enum: [6, 12, 24, 36, 48, 60],
          },
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
          monthlyCost: {
               type: Number,
               required: false,
          },
     },

     { timestamps: true }
);

export default mongoose.model('carDetails', carDetailSchema);
