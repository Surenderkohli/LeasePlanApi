import mongoose, { Schema } from 'mongoose';

const carFeatureSchema = new Schema({
     carSeries_id: {
          type: Schema.ObjectId,
          ref: 'carseries',
     },
     carBrand_id: {
          type: Schema.ObjectId,
          ref: 'carbrands',
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

const carFeatureModel = mongoose.model('carfeatures', carFeatureSchema);

export default carFeatureModel;
