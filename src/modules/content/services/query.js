import queryDetailsModel from '../models/query.js';

const addQueryDetails = async (data) => {
     const response = await queryDetailsModel.create(data);
     return response;
};

const getAllQueryDetails = async () => {
     const response = await queryDetailsModel.find();
     return response;
};

const getSingleQueryDetails = async (id) => {
     const response = await queryDetailsModel.findById(id);
     return response;
};

export const queryDetailsService = {
     addQueryDetails,
     getAllQueryDetails,
     getSingleQueryDetails,
};
