import carSeriesModel from '../models/carSeries.js';
import mongoose from 'mongoose';

const getAllCarSeries = async () => {
     const response = await carSeriesModel.find().populate('carBrand_id');
     return response;
};

const addCarSeries = async (data) => {
     try {
          const existingCarSeries = await carSeriesModel.findOne({
               modelCode: data.modelCode,
          });

          if (existingCarSeries) {
               throw new Error(
                    `Car series with modelCode '${data.modelCode}' already exists.`
               );
          }

          // Find car series by seriesName and modelCode combination (case-insensitive)
          const carSeriesWithSameName = await carSeriesModel.findOne({
               seriesName: { $regex: new RegExp(`^${data.seriesName}$`, 'i') },
               modelCode: { $ne: data.modelCode }, // Exclude the current modelCode from the search
          });

          if (carSeriesWithSameName) {
               throw new Error(
                    `Car series with seriesName '${data.seriesName}' already exists with a different modelCode.`
               );
          }

          const response = await carSeriesModel.create(data);
          return response;
     } catch (error) {
          if (
               error.code === 11000 &&
               error.keyValue &&
               error.keyValue.modelCode
          ) {
               const duplicateModelCode = error.keyValue.modelCode;
               throw new Error(
                    `Car series with modelCode '${duplicateModelCode}' already exists.`
               );
          }
          throw error;
     }
};
const getSingleCarSeries = async (id) => {
     const response = await carSeriesModel.findById(id);
     return response;
};

const getAllCarSeriesByBrandId = async (carBrand_id) => {
     try {
          const response = await carSeriesModel
               .find({ carBrand_id })
               .populate('carBrand_id');

          return response;
     } catch (error) {
          throw new Error('Unable to retrieve car Brand');
     }
};

const getAllCarSeriesByBrandIdV2 = async (carBrand_id) => {
     try {
          const response = await carSeriesModel.aggregate([
               {
                    $match: {
                         carBrand_id: mongoose.Types.ObjectId(carBrand_id),
                    },
               },
               {
                    $lookup: {
                         from: 'cardetails', // Assuming the collection name is 'cardetails'
                         localField: '_id',
                         foreignField: 'carSeries_id',
                         as: 'carDetails',
                    },
               },
               {
                    $match: {
                         carDetails: {
                              $size: 0, // Exclude car series with any car details
                         },
                    },
               },
          ]);

          return response;
     } catch (error) {
          throw new Error('Unable to retrieve car series');
     }
};

const deleteCarSeries = async (id) => {
     const response = await carSeriesModel.findOneAndDelete(
          { _id: id },
          { is_deleted: true }
     );
     return response;
};

export const carSeriesService = {
     getSingleCarSeries,
     addCarSeries,
     getAllCarSeries,
     getAllCarSeriesByBrandId,
     deleteCarSeries,
     getAllCarSeriesByBrandIdV2,
};
