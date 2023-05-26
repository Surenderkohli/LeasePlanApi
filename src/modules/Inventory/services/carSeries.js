import carSeriesModel from '../models/carSeries.js';
import mongoose from 'mongoose';

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

const AllCarSeriesByBrandId = async (carBrand_id, leaseType, term) => {
     try {
          const response = await carSeriesModel.aggregate([
               {
                    $match: {
                         carBrand_id: mongoose.Types.ObjectId(carBrand_id),
                    },
               },
               {
                    $lookup: {
                         from: 'carbrands',
                         localField: 'carBrand_id',
                         foreignField: '_id',
                         as: 'carBrand',
                    },
               },
               {
                    $unwind: '$carBrand',
               },
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

          return response;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to retrieve car series');
     }
};

export const carSeriesService = {
     getSingleCarSeries,
     addCarSeries,
     getAllCarSeries,
     getAllCarSeriesByBrandId,
     deleteCarSeries,
     AllCarSeriesByBrandId,
};
