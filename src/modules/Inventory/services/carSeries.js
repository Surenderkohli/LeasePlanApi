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

export const carSeriesService = {
     getSingleCarSeries,
     addCarSeries,
     getAllCarSeries,
};
