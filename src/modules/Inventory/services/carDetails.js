import carDetailModel from '../models/carDetails.js';

const getAllCar = async (filter) => {
     try {
          const priceMin = parseInt(filter.priceMin);
          const priceMax = parseInt(filter.priceMax);
          // const companyName = filter.companyName;

          filter = {
               price: { $gte: priceMin, $lte: priceMax },
               bodyType: { $in: filter.bodyType },
               fuelType: { $in: filter.fuelType },
               mileage: { $in: filter.mileage },

               // companyName: { $regex: `.*${companyName}.*`, $options: 'i' },
          };

          const response = await carDetailModel
               .find({ filter })
               .populate('carSeries_id');

          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const addNewCar = async (data, reqfile) => {
     try {
          let carimage = [];
          reqfile.map((img) => {
               carimage.push(img.filename);
          });
          const response = await carDetailModel.create({
               ...data,
               img: reqfile,
          });
          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const getSingleCar = async (id) => {
     const response = await carDetailModel.findById({ _id: id });
     return response;
};

const updateCar = async (id, data) => {
     try {
          const response = await carDetailModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               {
                    new: true,
               }
          );
          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const deleteCar = async (id) => {
     try {
          const response = await carDetailModel.remove(
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

export const CarServices = {
     getAllCar,
     addNewCar,
     getSingleCar,
     updateCar,
     deleteCar,
};
