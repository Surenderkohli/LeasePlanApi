import carSeriesModel from '../models/carSeries.js';

const getAllCarSeries = async () => {
     const response = await carSeriesModel.find().populate('carBrand_id');
     return response;
};

const addCarSeries = async (data) => {
     const response = await carSeriesModel.create(data);
     return response;
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
};
