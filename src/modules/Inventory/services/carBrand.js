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

export const carBrandService = {
     getAllCarBrand,
     addCarBrand,
     getSingleCarBrand,
};
