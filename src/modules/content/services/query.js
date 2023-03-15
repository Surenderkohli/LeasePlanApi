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

const deleteQueryDetails = async (id) => {
     const response = await queryDetailsModel.findOneAndDelete(
          {
               _id: id,
          },
          {
               is_deleted: true,
          }
     );
     return response;
};

export const queryDetailsService = {
     addQueryDetails,
     getAllQueryDetails,
     getSingleQueryDetails,
     deleteQueryDetails,
};
