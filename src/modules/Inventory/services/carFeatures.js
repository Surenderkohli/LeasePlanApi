import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carFeatureModel from '../models/carFeatures.js';

const addOrUpdateFeatureDescription = async (
     featureDescriptionData,
     source
) => {
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
                    source, // Set the source field
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

                    // Add the updated featureDescription if it's present in the data
                    if (featureDescription) {
                         category.features.push(featureDescription);
                    }
               }

               // Remove the entire category if it has no feature descriptions
               if (category.features.length === 0) {
                    const categoryIndex = carFeature.categories.findIndex(
                         (cat) =>
                              cat.categoryCode === categoryCode &&
                              cat.categoryDescription === categoryDescription
                    );

                    if (categoryIndex !== -1) {
                         carFeature.categories.splice(categoryIndex, 1);
                    }
               }
               carFeature.source = source; // Update the source field
          }

          await carFeature.save();
          return carFeature;
     } catch (error) {
          console.log(error);
          throw new Error('Failed to add/update feature description');
     }
};

const getAllCarFeature = async () => {
     try {
          const response = await carFeatureModel.find();
          return response;
     } catch (error) {
          console.error(error);
          throw new Error('Error getting all car features');
     }
};

export const carFeatureService = {
     addOrUpdateFeatureDescription,
     getAllCarFeature,
};
