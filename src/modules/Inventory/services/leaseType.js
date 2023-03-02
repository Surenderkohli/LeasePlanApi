import leaseTypeModel from '../models/leaseType.js';

const getAllLeaseType = async () => {
     const response = await leaseTypeModel.find();
     return response;
};

// const addNewleasetype = async (data,reqfile) => {
//     let carimage = []
//      reqfile.map((img)=>{
//            carimage.push(img.filename)
//     })
//     const response = await leasetypemodel.create({...data,img:carimage});
//    return response;
// };

const addLeaseType = async (data) => {
     const response = await leaseTypeModel.create({
          leaseType: data.leaseType,
     });
     return response;
};

const getSingleLeaseType = async (id) => {
     const response = await leaseTypeModel.findById({ _id: id });
     return response;
};

const updateLeaseType = async (id, data) => {
     const response = await leaseTypeModel.updateOne(
          { leaseType_id: data.leaseType_id },
          { data }
     );
     return response;
};

const deleteLeaseType = async (id) => {
     const response = await leaseTypeModel.remove(
          { _id: id },
          { isDeleted: true }
     );
     return response;
};

export const leasetypeService = {
     getAllLeaseType,
     getSingleLeaseType,
     updateLeaseType,
     deleteLeaseType,
     addLeaseType,
};
