import carBrandModel from '../models/carBrand.js';

const getAllCarBrand = async () => {
     const response = await carBrandModel.find().populate('leaseType_id');
     return response;
};

// const addCarBrand = async (data) => {
//      const response = await carBrandModel.create(data);
//      return response;
// };

const addCarBrand = async (data) => {
     try {
          // Find car brand by makeCode
          const existingCarBrand = await carBrandModel.findOne({
               makeCode: data.makeCode,
          });

          if (existingCarBrand) {
               throw new Error(
                    `Car brand with makeCode '${data.makeCode}' already exists.`
               );
          }

          // Find car brand by companyName and makeCode combination (case-insensitive)
          const carBrandWithSameCompanyName = await carBrandModel.findOne({
               companyName: {
                    $regex: new RegExp(`^${data.companyName}$`, 'i'),
               },
               makeCode: { $ne: data.makeCode }, // Exclude the current makeCode from the search
          });

          if (carBrandWithSameCompanyName) {
               throw new Error(
                    `Car brand with companyName '${data.companyName}' already exists with a different makeCode.`
               );
          }

          const response = await carBrandModel.create(data);
          return response;
     } catch (error) {
          if (
               error.code === 11000 &&
               error.keyValue &&
               error.keyValue.makeCode
          ) {
               const duplicateMakeCode = error.keyValue.makeCode;
               throw new Error(
                    `Car brand with makeCode '${duplicateMakeCode}' already exists.`
               );
          }
          throw error;
     }
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

// const getCarsByLeaseTypeAndTerm = async (leaseType, term) => {
//      const carBrands = await carBrandModel.find().populate({
//           path: 'leaseType_id',
//           match: {
//                leaseType: leaseType,
//                term: term,
//           },
//      });

//      const filteredCars = carBrands.filter(
//           (carBrand) => carBrand.leaseType_id !== null
//      );

//      return filteredCars;
// };

const getCarsByLeaseTypeAndTerm = async (leaseType, term) => {
     const cars = await carBrandModel.aggregate([
          {
               $lookup: {
                    from: 'leasetypes',
                    localField: 'leaseType_id',
                    foreignField: '_id',
                    as: 'leaseType',
               },
          },
          {
               $unwind: '$leaseType',
          },
          {
               $match: {
                    'leaseType.leaseType': leaseType,
                    'leaseType.term': term,
               },
          },
     ]);

     return cars;
};

export const carBrandService = {
     getAllCarBrand,
     addCarBrand,
     getSingleCarBrand,
     deleteCarBrand,
     getAllCarBrandByLeaseType,
     getCarsByLeaseTypeAndTerm,
};
