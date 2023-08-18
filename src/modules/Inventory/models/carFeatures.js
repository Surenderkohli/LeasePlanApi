import mongoose, { Schema } from 'mongoose';

const carFeatureSchema = new Schema({
     carSeries_id: {
          type: Schema.ObjectId,
          ref: 'carSeries',
     },
     carBrand_id: {
          type: Schema.ObjectId,
          ref: 'carBrand',
     },
     modelCode: String,
     makeCode: String,
     yearModel: {
          type: Number,
          required: false,
     },
     categories: [
          {
               categoryCode: String,
               categoryDescription: String,
               features: [String],
          },
     ],
     isDeleted: {
          type: Boolean,
          default: false,
     },
     source: {
          type: String,
          enum: ['csv', 'manual'],
          required: false,
     },
});

export const carFeatureModel = mongoose.model('carFeature', carFeatureSchema);
