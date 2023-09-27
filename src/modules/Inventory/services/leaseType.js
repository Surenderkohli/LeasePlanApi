import leaseTypeModel from '../models/leaseType.js';


const addLeaseType = async (data) => {
     try {
          const response = await leaseTypeModel.create({
               leaseType: data.leaseType,
               term: data.term,
          });
          return response;
     } catch (error) {
          console.error(error);
          throw new Error('Error adding lease type');
     }
};

const getAllLeaseType = async () => {
     try {
          const response = await leaseTypeModel.find();
          return response;
     } catch (error) {
          console.error(error);
          throw new Error('Error getting all lease types');
     }
};

const getSingleLeaseType = async (id) => {
     try {
          const response = await leaseTypeModel.findById({ _id: id });
          return response;
     } catch (error) {

          console.error(error);
          throw new Error('Error getting single lease type');
     }
};

const getCount = async (query) => {
     try {
          const count = await leaseTypeModel.countDocuments(query);
          return count;
     } catch (error) {

          console.error(error);
          throw new Error('Error getting count of lease types');
     }
};

const deleteLeaseType = async (id) => {
     try {
          const response = await leaseTypeModel.deleteOne(
              { _id: id },
              { isDeleted: true }
          );
          return response;
     } catch (error) {
          console.error(error);
          throw new Error('Error deleting lease type');
     }
};

export const leaseTypeService = {
     getAllLeaseType,
     getSingleLeaseType,
     deleteLeaseType,
     addLeaseType,
     getCount,
};
