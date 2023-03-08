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
          leaseType_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'leaseType',
          },
          description: String,
          img: {
               type: [],
               data: Buffer,
          },
          price: Number,
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
          door: Number,
          seat: Number,
          mileage: Number,
          co2: Number,
          milesPerGallon: Number,
          fuelType: {
               type: String,
               enum: ['petrol', 'diesel', 'hybrid', 'electric'],
          },
          transmission: {
               type: String,
               enum: ['automatic', 'manual'],
          },
          upfrontPayment: {
               type: Number,
               enum: [1, 3, 6, 9, 12],
          },
          includeMaintenance: {
               type: Boolean,
               default: false,
          },
          contractLengthInMonth: {
               type: Number,
               enum: [6, 12, 24, 36, 48, 60],
          },
          annualMileageInThousands: {
               type: Number,
               enum: [4, 6, 8, 10, 12, 15, 20],
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          priceMin: {
               type: Number,
          },
          priceMax: {
               type: Number,
          },
     },
     { timestamps: true }
);

export default mongoose.model('carDetails', carDetailSchema);
