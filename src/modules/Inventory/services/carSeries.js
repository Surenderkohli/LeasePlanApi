import carSeriesModel from '../models/carSeries.js';
import mongoose from 'mongoose';


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

const getAllCarSeries = async () => {
     try {
          const response = await carSeriesModel.find().populate('carBrand_id');
          return response;
     } catch (error) {

          console.error(error);
          throw new Error('Error getting all car series');
     }
};

const getSingleCarSeries = async (id) => {
     try {
          const response = await carSeriesModel.findById(id);
          return response;
     } catch (error) {
          console.error(error);
          throw new Error('Error getting single car series');
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
                         from: 'cardetails',
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
     try {
          const response = await carSeriesModel.findOneAndDelete(
              { _id: id },
              { is_deleted: true }
          );
          return response;
     } catch (error) {
          console.error(error);
          throw new Error('Error deleting car series');
     }
};


export const carSeriesService = {
     addCarSeries,
     getAllCarSeries,
     getSingleCarSeries,
     getAllCarSeriesByBrandIdV2,
     deleteCarSeries,
};
