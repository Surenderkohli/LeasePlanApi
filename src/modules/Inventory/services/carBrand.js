import carBrandModel from '../models/carBrand.js';

const getAllCarBrand = async () => {
     const response = await carBrandModel.find().populate('leaseType_id');
     return response;
};

const addCarBrand = async (data) => {
     const response = await carBrandModel.create(data);
     return response;
};

const getSingleCarBrand = async (id) => {
     const response = await carBrandModel.findById(id);
     return response;
};

const deleteCarBrand = async (id) => {
     const response = await carBrandModel.findOneAndDelete(
          { _id: id },
          { is_deleted: true }
     );
     return response;
};

const getAllCarBrandByLeaseType = async (leaseType_id) => {
     try {
          const carBrands = await carBrandModel
               .find({ leaseType_id })
               .populate('leaseType_id');

          return carBrands;
     } catch (error) {
          throw new Error('Unable to retrieve car brands by lease type');
     }
};

export const carBrandService = {
     getAllCarBrand,
     addCarBrand,
     getSingleCarBrand,
     deleteCarBrand,
     getAllCarBrandByLeaseType,
};
