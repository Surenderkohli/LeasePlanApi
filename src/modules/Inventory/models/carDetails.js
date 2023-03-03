import mongoose from 'mongoose';

const carDetailSchema = new mongoose.Schema(
     {
          carSeries_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carseries',
          },
          description: String,
          img: {
               type: [],
               data: Buffer,
          },
          price: Number,
          bodyType: String,
          door: Number,
          seat: Number,
          mileage: Number,
          co2: Number,
          milesPerGallon: Number,
          fuelType: {
               type: String,
               enum: ['petrol', 'electic', 'hybrid', 'diesel'],
          },
          transmission: {
               type: String,
               enum: ['automatic', 'manual'],
          },
          upfrontPayment: {
               type: Number,
          },
          maintenanceOption: {
               type: Boolean,
          },
          contractLength: {
               type: Number,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
     },
     { timestamps: true }
);

export default mongoose.model('cardetail', carDetailSchema);
