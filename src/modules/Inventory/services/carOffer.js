import carFeatureModel from '../models/carFeatures.js';
import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';

// const createCarOffer = async (carOfferData) => {
//      try {
//           const leaseType = await leaseTypeModel.findOne({
//                leaseType: carOfferData.leaseType,
//           });

//           const companyName = await carBrandModel.findOne({
//                makeCode: carOfferData.makeCode,
//           });
//           if (!companyName) {
//                throw new Error(
//                     `Car brand with makeCode ${carOfferData.makeCode} not found`
//                );
//           }

//           const seriesName = await carSeriesModel.findOne({
//                modelCode: carOfferData.modelCode,
//                carBrand_id: companyName._id,
//           });
//           if (!seriesName) {
//                throw new Error(
//                     `Car series with modelCode ${carOfferData.modelCode} not found`
//                );
//           }

//           const yearModel = carOfferData.yearModel;

//           const carOffers = await carOfferModel.find({
//                carBrand_id: companyName._id,
//                carSeries_id: seriesName._id,

//                yearModel: yearModel,
//           });

//           const groupedOffers = {
//                carBrand_id: companyName._id,
//                carSeries_id: seriesName._id,
//                leaseType_id: leaseType._id,
//                yearModel: yearModel,
//                offers: [],
//                deals: 'inactive',
//           };

//           carOffers.forEach((offer) => {
//                groupedOffers.offers.push({
//                     duration: offer.offers.duration,
//                     annualMileage: offer.offers.annualMileage,
//                     monthlyCost: offer.offers.monthlyCost,
//                });
//           });

//           return groupedOffers;
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to create car offer.');
//      }
// };

const createCarOffer = async (carOfferData) => {
     try {
          const leaseType = await leaseTypeModel.findOne({
               leaseType: carOfferData.leaseType,
          });
          if (!leaseType) {
               throw new Error(
                    `Lease type ${carOfferData.leaseType} not found`
               );
          }

          const companyName = await carBrandModel.findOne({
               makeCode: carOfferData.makeCode,
          });
          if (!companyName) {
               throw new Error(
                    `Car brand with makeCode ${carOfferData.makeCode} not found`
               );
          }

          const seriesName = await carSeriesModel.findOne({
               modelCode: carOfferData.modelCode,
               carBrand_id: companyName._id,
          });
          if (!seriesName) {
               throw new Error(
                    `Car series with modelCode ${carOfferData.modelCode} not found`
               );
          }

          const yearModel = carOfferData.yearModel;

          const existingCarOffer = await carOfferModel.findOne({
               carBrand_id: companyName._id,
               carSeries_id: seriesName._id,
               yearModel: yearModel,
          });

          if (existingCarOffer) {
               // car offer already exists, add new offer to existing group
               existingCarOffer.offers.push({
                    leaseType_id: leaseType._id,
                    duration: carOfferData.duration,
                    annualMileage: carOfferData.annualMileage,
                    monthlyCost: carOfferData.monthlyCost,
               });
               await existingCarOffer.save();
               return {
                    message: 'Car offer updated successfully',
                    data: existingCarOffer,
               };
          } else {
               // create new car offer with a new group
               const newCarOffer = await carOfferModel.create({
                    carBrand_id: companyName._id,
                    carSeries_id: seriesName._id,
                    leaseType_id: leaseType._id,
                    yearModel: yearModel,
                    offers: [
                         {
                              duration: carOfferData.duration,
                              annualMileage: carOfferData.annualMileage,
                              monthlyCost: carOfferData.monthlyCost,
                         },
                    ],
                    deals: 'inactive',
               });
               return newCarOffer;
          }
     } catch (error) {
          console.log(error);
          throw new Error('Failed to create/update car offer.');
     }
};

const getAllOffer = async () => {
     const response = await carOfferModel.find();
     return response;
};

export const carOfferService = {
     createCarOffer,
     getAllOffer,
};
