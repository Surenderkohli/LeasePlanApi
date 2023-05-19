import mongoose, { Schema } from 'mongoose';

// const carFeatureCategorySchema = new Schema({
//      makeCode: String,
//      modelCode: String,
//      categoryCode: String,
//      categoryDescription: String,
// });

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
});

// export const CarFeatureCategory = mongoose.model(
//      'CarFeatureCategory',
//      carFeatureCategorySchema
// );

export const carFeatureModel = mongoose.model('carFeature', carFeatureSchema);
