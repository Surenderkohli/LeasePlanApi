import carFeatureModel from '../models/carFeatures.js';
import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';

const createCarOffer = async (carDetailData) => {
     try {
          // Find the car brand using the makeCode
          const companyName = await carBrandModel.findOne({
               makeCode: carDetailData.makeCode,
          });
          if (!companyName) {
               throw new Error(
                    `Car brand with makeCode ${carDetailData.makeCode} not found`
               );
          }

          // Find the car series using the modelCode and the car brand ID
          const seriesName = await carSeriesModel.findOne({
               modelCode: carDetailData.modelCode,
               carBrand_id: companyName._id,
          });
          if (!seriesName) {
               throw new Error(
                    `Car series with modelCode ${carDetailData.modelCode} not found`
               );
          }

          // Find the lease type using the leaseTypeName
          const leaseType = await leaseTypeModel.findOne({
               name: carDetailData.leaseTypeName,
          });
          if (!leaseType) {
               throw new Error(
                    `Lease type with name ${carDetailData.leaseTypeName} not found`
               );
          }

          // Create the new car detail entry using the retrieved IDs
          const newCarOffer = new carOfferModel({
               leaseType_id: leaseType._id,
               carBrand_id: companyName._id,
               carSeries_id: seriesName._id,
               yearModel: carDetailData.yearModel,
               duration: carDetailData.duration,
               annualMileage: carDetailData.annualMileage,
               monthlyCost: carDetailData.monthlyCost,
               deals: carDetailData.deals,
          });

          const savedCarOffer = await newCarOffer.save();

          return savedCarOffer;
     } catch (error) {
          console.log(error);
          throw new Error('Car features upload failed');
     }
};

export const carOfferService = {
     createCarOffer,
};
