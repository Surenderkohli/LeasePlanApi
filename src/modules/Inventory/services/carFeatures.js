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
const deleteCarFeatures = async (id) => {
     try {
          const response = await carFeatureModel.remove(
               { _id: id },
               { isDeleted: true }
          );
          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
     const response = await carDetailModel.remove(
          { _id: id },
          { isDeleted: true }
     );
     return response;
};

export const carFeatureService = {
     getAllCarFeature,
     addCarFeature,
     getSingleCarFeature,
     deleteCarFeatures,
};
