import carFeatureModel from '../models/carFeatures.js';

const getAllCarFeature = async () => {
     const response = await carFeatureModel.find();
     // const response = await carFeatureModel.find().populate('leaseType_id');
     return response;
};

const addCarFeature = async (data) => {
     const response = await carFeatureModel.create(data);
     return response;
};

const getSingleCarFeature = async (id) => {
     const response = await carFeatureModel.findById(id);
     return response;
};

export const carFeatureService = {
     getAllCarFeature,
     addCarFeature,
     getSingleCarFeature,
};
