import mongoose from 'mongoose';

const carFeatureSchema = new mongoose.Schema({
     carSeries_id: {
          type: mongoose.Schema.ObjectId,
          ref: 'carSeries',
     },
     carBrand_id: {
          type: mongoose.Schema.ObjectId,
          ref: 'carBrand',
     },
     modelCode: String,
     makeCode: String,
     yearModel: {
          type: Number,
          required: false,
     },
     exteriorFeatures: [String],
     interiorFeatures: [String],
     safetySecurityFeatures: [String],
     comfortConvenienceFeatures: [String],
     audioEntertainmentFeatures: [String],
     isDeleted: {
          type: Boolean,
          default: false,
     },
});

export default mongoose.model('carFeature', carFeatureSchema);
