import carFeatureModel from '../models/carFeatures.js';
import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';

const createCarOffer = async (carDetailData) => {
     try {
          let leaseType;
          let companyName;
          let seriesName;

          // Query the database for matching records based on the names provided
          if (carDetailData.leaseType) {
               leaseType = await leaseTypeModel.findOne({
                    leaseType: carDetailData.leaseType,
               });
          }

          if (carDetailData.companyName) {
               if (leaseType) {
                    companyName = await carBrandModel.findOneAndUpdate(
                         {
                              companyName: carDetailData.companyName,
                              leaseType_id: leaseType._id,
                         },
                         { $setOnInsert: { leaseType_id: leaseType._id } },
                         { upsert: true, new: true }
                    );
               } else {
                    companyName = await carBrandModel.findOneAndUpdate(
                         {
                              companyName: carDetailData.companyName,
                              leaseType_id: null,
                         },
                         { $setOnInsert: { leaseType_id: null } },
                         { upsert: true, new: true }
                    );
               }
          }

          if (carDetailData.seriesName) {
               const query = {
                    seriesName: carDetailData.seriesName,
                    carBrand_id: companyName ? companyName._id : null,
               };

               seriesName = await carSeriesModel.findOneAndUpdate(
                    query,
                    {
                         $setOnInsert: {
                              carBrand_id: companyName ? companyName._id : null,
                              makeCode: carDetailData.makeCode,
                              modelCode: carDetailData.modelCode,
                         },
                    },
                    { upsert: true, new: true }
               );
          }

          // Create the new car detail entry using the retrieved IDs
          const newCarOffer = new carOfferModel({
               leaseType_id: leaseType ? leaseType._id : null,
               carBrand_id: companyName ? companyName._id : null,
               carSeries_id: seriesName ? seriesName._id : null,
               makeCode: carDetailData.makeCode,
               modelCode: carDetailData.modelCode,
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
