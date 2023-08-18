import leaseTypeModel from '../models/leaseType.js';

const getAllLeaseType = async () => {
     const response = await leaseTypeModel.find();
     return response;
};

const addLeaseType = async (data) => {
     const response = await leaseTypeModel.create({
          leaseType: data.leaseType,
          term: data.term,
     });
     return response;
};

const getSingleLeaseType = async (id) => {
     const response = await leaseTypeModel.findById({ _id: id });
     return response;
};

const getCount = async (query) => {
     const count = await leaseTypeModel.countDocuments(query);

     return count;
};

const deleteLeaseType = async (id) => {
     const response = await leaseTypeModel.deleteOne(
          { _id: id },
          { isDeleted: true }
     );
     return response;
};

export const leaseTypeService = {
     getAllLeaseType,
     getSingleLeaseType,

     deleteLeaseType,
     addLeaseType,
     getCount,
};
