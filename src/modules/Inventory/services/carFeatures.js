import carFeatureModel from '../models/carFeatures.js';
import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';

const getAllCarFeature = async () => {
     const response = await carFeatureModel.find();
     // const response = await carFeatureModel.find().populate('leaseType_id');
     return response;
};

// const addCarFeature = async (data) => {
//      const response = await carFeatureModel.create(data);
//      return response;
// };

const createCarFeatureManual = async (carFeatureData) => {
     try {
          // Extract the features from the carFeatureData object
          const {
               modelCode,
               makeCode,
               yearModel,
               exteriorFeatures,
               interiorFeatures,
               safetySecurityFeatures,
               comfortConvenienceFeatures,
               audioEntertainmentFeatures,
          } = carFeatureData;

          // Query the database for matching carBrand and carSeries documents
          const carBrand = await CarBrand.findOne({
               makeCode: makeCode,
          });
          const carSeries = await CarSeries.findOne({
               modelCode: modelCode,
          });

          // Create the new car feature entry using the retrieved IDs
          const newCarFeature = new carFeatureModel({
               carBrand_id: carBrand ? carBrand._id : null,
               carSeries_id: carSeries ? carSeries._id : null,
               makeCode: makeCode,
               modelCode: modelCode,
               yearModel: yearModel,
               exteriorFeatures: exteriorFeatures ? exteriorFeatures : [],
               interiorFeatures: interiorFeatures ? interiorFeatures : [],
               safetySecurityFeatures: safetySecurityFeatures
                    ? safetySecurityFeatures
                    : [],
               comfortConvenienceFeatures: comfortConvenienceFeatures
                    ? comfortConvenienceFeatures
                    : [],
               audioEntertainmentFeatures: audioEntertainmentFeatures
                    ? audioEntertainmentFeatures
                    : [],
          });

          const savedCarFeature = await newCarFeature.save();

          return savedCarFeature;
     } catch (error) {
          console.log(error);
          throw new Error('Car feature creation failed');
     }
};

const getSingleCarFeature = async (id) => {
     const response = await carFeatureModel.findById(id);
     return response;
};

const updateCarFeatures = async (id, data) => {
     const response = await carFeatureModel.findByIdAndUpdate(
          { _id: id },
          { $set: data },
          { new: true }
     );
     return response;
};

const deleteCarFeatures = async (id) => {
     try {
          const response = await carFeatureModel.deleteOne(
               { _id: id },
               { isDeleted: true }
          );
          return response;
     } catch (error) {
          console.log(error);
     }
};

// const createCarFeautre = async (carDetailData) => {
//      try {
//           let companyName;
//           let seriesName;

//           // Extract the exterior and interior features from the row
//           const exteriorFeatures = [];
//           const interiorFeatures = [];
//           const safetySecurityFeatures = [];
//           const comfortConvenienceFeatures = [];
//           const audioEntertainmentFeatures = [];

//           // Query the database for matching records based on the names provided

//           Object.keys(carDetailData).forEach((key) => {
//                if (key.startsWith('exterior_')) {
//                     exteriorFeatures.push(carDetailData[key]);
//                } else if (key.startsWith('interior_')) {
//                     interiorFeatures.push(carDetailData[key]);
//                } else if (key.startsWith('safety_security_')) {
//                     safetySecurityFeatures.push(carDetailData[key]);
//                } else if (key.startsWith('comfort_convenience_')) {
//                     comfortConvenienceFeatures.push(carDetailData[key]);
//                } else if (key.startsWith('audio_entertainment_')) {
//                     audioEntertainmentFeatures.push(carDetailData[key]);
//                }
//           });

//           // Create the new car detail entry using the retrieved IDs
//           const newCarFeature = new carFeatureModel({
//                carBrand_id: companyName ? companyName._id : null,
//                carSeries_id: seriesName ? seriesName._id : null,
//                makeCode: carDetailData.makeCode,
//                modelCode: carDetailData.modelCode,
//                yearModel: carDetailData.yearModel,
//                exteriorFeatures: exteriorFeatures ? exteriorFeatures : [],
//                interiorFeatures: interiorFeatures ? interiorFeatures : [],
//                safetySecurityFeatures: safetySecurityFeatures
//                     ? safetySecurityFeatures
//                     : [],
//                comfortConvenienceFeatures: comfortConvenienceFeatures
//                     ? comfortConvenienceFeatures
//                     : [],
//                audioEntertainmentFeatures: audioEntertainmentFeatures
//                     ? audioEntertainmentFeatures
//                     : [],
//           });

//           const savedCarFeature = await newCarFeature.save();

//           return savedCarFeature;
//      } catch (error) {
//           console.log(error);
//           throw new Error('Car features upload failed');
//      }
// };

const createCarFeautre = async (carDetailData) => {
     try {
          // Extract the exterior and interior features from the row
          const exteriorFeatures = [];
          const interiorFeatures = [];
          const safetySecurityFeatures = [];
          const comfortConvenienceFeatures = [];
          const audioEntertainmentFeatures = [];

          Object.keys(carDetailData).forEach((key) => {
               if (key.startsWith('exterior_')) {
                    exteriorFeatures.push(carDetailData[key]);
               } else if (key.startsWith('interior_')) {
                    interiorFeatures.push(carDetailData[key]);
               } else if (key.startsWith('safety_security_')) {
                    safetySecurityFeatures.push(carDetailData[key]);
               } else if (key.startsWith('comfort_convenience_')) {
                    comfortConvenienceFeatures.push(carDetailData[key]);
               } else if (key.startsWith('audio_entertainment_')) {
                    audioEntertainmentFeatures.push(carDetailData[key]);
               }
          });

          // Query the database for matching carBrand and carSeries documents
          const carBrand = await carBrandModel.findOne({
               makeCode: carDetailData.makeCode,
          });
          const carSeries = await carSeriesModel.findOne({
               modelCode: carDetailData.modelCode,
          });

          // Create the new car feature entry using the retrieved IDs
          const newCarFeature = new carFeatureModel({
               carBrand_id: carBrand ? carBrand._id : null,
               carSeries_id: carSeries ? carSeries._id : null,
               makeCode: carDetailData.makeCode,
               modelCode: carDetailData.modelCode,
               yearModel: carDetailData.yearModel,
               exteriorFeatures: exteriorFeatures ? exteriorFeatures : [],
               interiorFeatures: interiorFeatures ? interiorFeatures : [],
               safetySecurityFeatures: safetySecurityFeatures
                    ? safetySecurityFeatures
                    : [],
               comfortConvenienceFeatures: comfortConvenienceFeatures
                    ? comfortConvenienceFeatures
                    : [],
               audioEntertainmentFeatures: audioEntertainmentFeatures
                    ? audioEntertainmentFeatures
                    : [],
          });

          const savedCarFeature = await newCarFeature.save();

          return savedCarFeature;
     } catch (error) {
          console.log(error);
          throw new Error('Car features upload failed');
     }
};

export const carFeatureService = {
     getAllCarFeature,
     createCarFeatureManual,
     getSingleCarFeature,
     deleteCarFeatures,
     updateCarFeatures,
     createCarFeautre,
};
