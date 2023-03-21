import mongoose from 'mongoose';

const StandardEquipmentSchema = new mongoose.Schema({
     exteriorFeatures: {
          type: [String],
          required: false,
     },
     interiorFeatures: {
          type: [String],
          required: false,
     },
     entertainment: {
          type: [String],
          required: false,
     },
     safetyFeatures: {
          type: [String],
          required: false,
     },
     driverConvenienceAndSecurity: {
          type: [String],
          required: false,
     },
});

const TechnicalSpecsSchema = new mongoose.Schema({
     entertainment: {
          type: [String],
          required: false,
     },
     safety: {
          type: [String],
          required: false,
     },
     fuelEconomy: {
          type: Number,
          required: false,
     },
     horsepower: {
          type: Number,
          required: false,
     },
     engine: {
          type: String,
          required: false,
     },
});

const carFeatureSchema = new mongoose.Schema({
     standardEquipment: {
          type: StandardEquipmentSchema,
          required: false,
     },
     technicalSpecs: {
          type: TechnicalSpecsSchema,
          required: false,
     },
     isDeleted: {
          type: Boolean,
          default: false,
     },
});

export default mongoose.model('carFeature', carFeatureSchema);
