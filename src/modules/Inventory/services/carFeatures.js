import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import { carFeatureModel } from '../models/carFeatures.js';
// import { CarFeatureCategory, carFeatureModel } from '../models/carFeatures.js';

const getAllCarFeature = async () => {
     const response = await carFeatureModel.find();
     // const response = await carFeatureModel.find().populate('leaseType_id');
     return response;
};

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

const createCarFeature = async (carDetailData) => {
     try {
          // Extract the exterior and interior features from the row
          const exteriorFeatures = [];
          const interiorFeatures = [];
          const safetySecurityFeatures = [];
          const comfortConvenienceFeatures = [];
          const audioEntertainmentFeatures = [];

          Object.keys(carDetailData).forEach((key) => {
               if (key.startsWith('exterior_')) {
                    exteriorFeatures.push({
                         value: carDetailData[key],
                         categoryCode: 1,
                    });
               } else if (key.startsWith('interior_')) {
                    interiorFeatures.push({
                         value: carDetailData[key],
                         categoryCode: 2,
                    });
               } else if (key.startsWith('safety_security_')) {
                    safetySecurityFeatures.push({
                         value: carDetailData[key],
                         categoryCode: 3,
                    });
               } else if (key.startsWith('comfort_convenience_')) {
                    comfortConvenienceFeatures.push({
                         value: carDetailData[key],
                         categoryCode: 4,
                    });
               } else if (key.startsWith('audio_entertainment_')) {
                    audioEntertainmentFeatures.push({
                         value: carDetailData[key],
                         categoryCode: 5,
                    });
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
               exteriorFeatures: exteriorFeatures,
               interiorFeatures: interiorFeatures,
               safetySecurityFeatures: safetySecurityFeatures,
               comfortConvenienceFeatures: comfortConvenienceFeatures,
               audioEntertainmentFeatures: audioEntertainmentFeatures,
          });

          const savedCarFeature = await newCarFeature.save();

          return savedCarFeature;
     } catch (error) {
          console.log(error);
          throw new Error('Car features upload failed');
     }
};
// const upsertCarFeature = async (carDetailData) => {
//      try {
//           // Extract the exterior and interior features from the row
//           const exteriorFeatures = [];
//           const interiorFeatures = [];
//           const safetySecurityFeatures = [];
//           const comfortConvenienceFeatures = [];
//           const audioEntertainmentFeatures = [];

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

//           // Query the database for matching carBrand and carSeries documents
//           const carBrand = await carBrandModel.findOne({
//                makeCode: carDetailData.makeCode,
//           });
//           const carSeries = await carSeriesModel.findOne({
//                modelCode: carDetailData.modelCode,
//           });

//           // Query the database for an existing car feature entry
//           let carFeature = await carFeatureModel.findOne({
//                makeCode: carDetailData.makeCode,
//                modelCode: carDetailData.modelCode,
//                yearModel: carDetailData.yearModel,
//           });

//           // If an existing car feature entry is found, update it; otherwise, create a new entry
//           if (carFeature) {
//                carFeature.carBrand_id = carBrand ? carBrand._id : null;
//                carFeature.carSeries_id = carSeries ? carSeries._id : null;
//                carFeature.exteriorFeatures = exteriorFeatures
//                     ? exteriorFeatures
//                     : [];
//                carFeature.interiorFeatures = interiorFeatures
//                     ? interiorFeatures
//                     : [];
//                carFeature.safetySecurityFeatures = safetySecurityFeatures
//                     ? safetySecurityFeatures
//                     : [];
//                carFeature.comfortConvenienceFeatures =
//                     comfortConvenienceFeatures
//                          ? comfortConvenienceFeatures
//                          : [];
//                carFeature.audioEntertainmentFeatures =
//                     audioEntertainmentFeatures
//                          ? audioEntertainmentFeatures
//                          : [];
//           } else {
//                carFeature = new carFeatureModel({
//                     carBrand_id: carBrand ? carBrand._id : null,
//                     carSeries_id: carSeries ? carSeries._id : null,
//                     makeCode: carDetailData.makeCode,
//                     modelCode: carDetailData.modelCode,
//                     yearModel: carDetailData.yearModel,
//                     exteriorFeatures: exteriorFeatures ? exteriorFeatures : [],
//                     interiorFeatures: interiorFeatures ? interiorFeatures : [],
//                     safetySecurityFeatures: safetySecurityFeatures
//                          ? safetySecurityFeatures
//                          : [],
//                     comfortConvenienceFeatures: comfortConvenienceFeatures
//                          ? comfortConvenienceFeatures
//                          : [],
//                     audioEntertainmentFeatures: audioEntertainmentFeatures
//                          ? audioEntertainmentFeatures
//                          : [],
//                });
//           }

//           const savedCarFeature = await carFeature.save();

//           return savedCarFeature;
//      } catch (error) {
//           console.log(error);
//           throw new Error('Car features upload failed');
//      }
// };

const createCarFeatureCategory = async (carFeatureCategoryData) => {
     try {
          const { makeCode, modelCode, categoryCode, categoryDescription } =
               carFeatureCategoryData;

          // Find all car feature category documents based on makeCode, modelCode, and categoryCode
          let carFeatureCategories = await CarFeatureCategory.find({
               makeCode,
               modelCode,
               categoryCode,
          });

          // Update the categoryDescription for all matching car feature category documents
          carFeatureCategories = carFeatureCategories.map((category) => {
               category.categoryDescription = categoryDescription;
               return category;
          });

          // If no matching car feature category documents found, create a new one
          if (carFeatureCategories.length === 0) {
               const carFeatureCategory = new CarFeatureCategory({
                    makeCode,
                    modelCode,
                    categoryCode,
                    categoryDescription,
               });
               carFeatureCategories.push(carFeatureCategory);
          }

          // Save all car feature category documents
          await Promise.all(
               carFeatureCategories.map((category) => category.save())
          );

          return carFeatureCategories;
     } catch (error) {
          console.log(error);
          throw new Error('Failed to create car feature category');
     }
};

const deleteAllCarFeaturesDescription = async () => {
     try {
          await carFeatureModel.deleteMany({});
          console.log(
               'Existing car features description deleted successfully.'
          );
     } catch (error) {
          console.log(`Error deleting car features description: ${error}`);
          throw error;
     }
};

// const addFeatureDescription = async (featureDescriptionData) => {
//      try {
//           const {
//                makeCode,
//                modelCode,
//                categoryCode,
//                categoryDescription,
//                featureDescription,
//           } = featureDescriptionData;

//           // Find the corresponding carBrand document based on makeCode
//           const carBrand = await carBrandModel.findOne({ makeCode });

//           if (!carBrand) {
//                throw new Error('Invalid makeCode. Car brand not found.');
//           }

//           // Find the corresponding carSeries document based on modelCode
//           const carSeries = await carSeriesModel.findOne({ modelCode });

//           if (!carSeries) {
//                throw new Error('Invalid modelCode. Car series not found.');
//           }

//           // Find the corresponding carFeature document based on makeCode, modelCode, and categoryCode
//           let carFeature = await carFeatureModel.findOne({
//                makeCode,
//                modelCode,
//           });

//           if (!carFeature) {
//                // If the carFeature document does not exist, create a new one
//                carFeature = new carFeatureModel({
//                     carSeries_id: carSeries._id,
//                     carBrand_id: carBrand._id,
//                     modelCode,
//                     makeCode,
//                     categories: [
//                          {
//                               categoryCode,
//                               categoryDescription,
//                               features: [featureDescription],
//                          },
//                     ],
//                });
//           } else {
//                // If the carFeature document exists, find the category based on categoryCode and categoryDescription
//                let category = carFeature.categories.find((category) => {
//                     return (
//                          category.categoryCode === categoryCode &&
//                          category.categoryDescription === categoryDescription
//                     );
//                });

//                if (!category) {
//                     // If the category does not exist, create a new one
//                     category = {
//                          categoryCode,
//                          categoryDescription,
//                          features: [featureDescription],
//                     };
//                     carFeature.categories.push(category);
//                } else {
//                     // If the category exists, push the featureDescription into the features array
//                     category.features.push(featureDescription);
//                }
//           }

//           await carFeature.save();
//           return carFeature;
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to add feature description');
//      }
// };

const addOrUpdateFeatureDescription = async (featureDescriptionData) => {
     try {
          const {
               makeCode,
               modelCode,
               categoryCode,
               categoryDescription,
               featureDescription,
          } = featureDescriptionData;

          // Find the corresponding carBrand document based on makeCode
          const carBrand = await carBrandModel.findOne({ makeCode });

          if (!carBrand) {
               throw new Error('Invalid makeCode. Car brand not found.');
          }

          // Find the corresponding carSeries document based on modelCode
          const carSeries = await carSeriesModel.findOne({ modelCode });

          if (!carSeries) {
               throw new Error('Invalid modelCode. Car series not found.');
          }

          // Find the corresponding carFeature document based on makeCode, modelCode, and categoryCode
          let carFeature = await carFeatureModel.findOne({
               makeCode,
               modelCode,
          });

          if (!carFeature) {
               // If the carFeature document does not exist, create a new one
               carFeature = new carFeatureModel({
                    carSeries_id: carSeries._id,
                    carBrand_id: carBrand._id,
                    modelCode,
                    makeCode,
                    categories: [
                         {
                              categoryCode,
                              categoryDescription,
                              features: [featureDescription],
                         },
                    ],
               });
          } else {
               // If the carFeature document exists, find the category based on categoryCode and categoryDescription
               let category = carFeature.categories.find((category) => {
                    return (
                         category.categoryCode === categoryCode &&
                         category.categoryDescription === categoryDescription
                    );
               });

               if (!category) {
                    // If the category does not exist, create a new one
                    category = {
                         categoryCode,
                         categoryDescription,
                         features: [featureDescription],
                    };
                    carFeature.categories.push(category);
               } else {
                    // If the category exists, check if the featureDescription already exists
                    const featureIndex = category.features.findIndex(
                         (feature) => feature === featureDescription
                    );

                    if (featureIndex !== -1) {
                         // If the featureDescription already exists, remove it from the array
                         category.features.splice(featureIndex, 1);
                    }

                    // Add the updated featureDescription
                    category.features.push(featureDescription);
               }
          }

          await carFeature.save();
          return carFeature;
     } catch (error) {
          console.log(error);
          throw new Error('Failed to add/update feature description');
     }
};

export const carFeatureService = {
     getAllCarFeature,
     createCarFeatureManual,
     getSingleCarFeature,
     deleteCarFeatures,
     updateCarFeatures,
     // upsertCarFeature,
     createCarFeature,
     createCarFeatureCategory,
     // addFeatureDescription,
     addOrUpdateFeatureDescription,
     deleteAllCarFeaturesDescription,
};
