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
                    duration: {
                         type: String,
                         enum: ['6', '12', '24', '36', '48', '60'],
                    },
                    annualMileage: Number,
                    monthlyCost: Number,
               },
          ],
          deals: {
               type: String,
               enum: ['active', 'inactive'],
               default: 'inactive',
          },
     },

     { timestamps: true }
);

export default mongoose.model('carOffer', carOfferSchema);

/* 

{
     message: 'Car offers added successfully',
     data: [
          {
               carBrand_id: '642f90e94f157f0997c04674',
               carSeries_id: '642f90e94f157f0997c04678',
               yearModel: 2023,
               offers: [
                    {
                         leaseType_id: [ '642baab6a0232843b82ccbf3' ],
                         duration: '24',
                         annualMileage: 25000,
                         monthlyCost: 2200,
                    },
                    {
                         leaseType_id: [ '642baab6a0232843b82ccbf3' ],
                         duration: '36',
                         annualMileage: 25000,
                         monthlyCost: 2100,
                    },
               ],
               deals: 'inactive',
          },
     ],
}






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
 */
