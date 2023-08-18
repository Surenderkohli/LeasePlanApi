import queryDetailModel from '../models/query.js';

const addQueryDetails = async (data) => {
     const response = await queryDetailModel.create(data);
     return response;
};

const getAllQueryDetails = async () => {
     const response = await queryDetailModel.find();
     return response;
};

const getSingleQueryDetails = async (id) => {
     const response = await queryDetailModel.findById(id);
     return response;
};

const deleteQueryDetails = async (id) => {
     const response = await queryDetailModel.findOneAndDelete(
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
