import carseriesmodel from '../models/car-series.js';

const getAllCarseries = async () => {
     const response = await carseriesmodel.find().populate('carbrand_id');
     return response;
};

const addNewCarseries = async (data) => {
     const response = await carseriesmodel.create(data);
     return response;
};

const getSingleCarseries = async (id) => {
     const response = await carseriesmodel.findById(id);
     return response;
};

export const carSeriesServices = {
     getSingleCarseries,
     addNewCarseries,
     getAllCarseries,
};
