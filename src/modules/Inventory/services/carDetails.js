import carDetailModel from '../models/carDetails.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carFeatureModel from '../models/carFeatures.js';
import carOfferModel from '../models/carOffer.js';
import leaseTypeModel from '../models/leaseType.js';

const addNewCar = async (
     carDetailsData,
     carImage,
     carFeaturesData,
     carOffersData
) => {
     try {
          // Validate input
          if (!carDetailsData || !carFeaturesData) {
               throw new Error(
                    'Both carDetails and carFeatures must be provided'
               );
          }

          const images = carImage.map((image) => ({
               imageUrl: image.imageUrl,
               publicId: image.publicId,
          }));

          // Create car in CarDetails collection
          const newCarDetails = await carDetailModel.create({
               ...carDetailsData,
               image: images,
          });

          // Extract categories data from carFeaturesData
          const { categories } = carFeaturesData;

          // Create an array to store the modified categories data
          const modifiedCategories = [];

          // Iterate over the categories and push the required fields to modifiedCategories array
          if (categories && Array.isArray(categories)) {
               for (const category of categories) {
                    modifiedCategories.push({
                         categoryCode: category.categoryCode,
                         categoryDescription: category.categoryDescription,
                         features: category.features,
                    });
               }
          }

          // Update carFeaturesData with modified categories
          carFeaturesData.categories = modifiedCategories;

          // Create carFeatureModel in CarFeatureModel collection
          const newCarFeatures = await carFeatureModel.create({
               ...carFeaturesData,
          });

          let carBrand = await carBrandModel
               .findOne({
                    _id: carDetailsData.carBrand_id,
               })
               .populate('leaseType_id');

          if (!carBrand) {
               carBrand = await carBrandModel.create({
                    makeCode: carDetailsData.makeCode,
                    leaseType_id: [],
               });
          }

          let carOfferResults = [];

          for (let i = 0; i < carOffersData.length; i++) {
               const leaseType = carOffersData[i].leaseType;
               const term = carOffersData[i].term;

               let leaseTypeDoc = carBrand.leaseType_id.find(
                    (lt) => lt.leaseType === leaseType && lt.term === term
               );

               if (!leaseTypeDoc) {
                    // Check if leaseType and term combination already exists in leaseTypes collection
                    leaseTypeDoc = await leaseTypeModel.findOne({
                         leaseType: leaseType,
                         term: term,
                    });

                    if (!leaseTypeDoc) {
                         // Create a new document in leaseTypes collection
                         leaseTypeDoc = await leaseTypeModel.create({
                              leaseType: leaseType,
                              term: term,
                         });
                    }

                    carBrand.leaseType_id.push(leaseTypeDoc._id);
                    await carBrand.save();
               }

               let carSeries = await carSeriesModel
                    .findOne({
                         _id: carDetailsData.carSeries_id,
                    })
                    .populate('leaseType_id');

               if (!carSeries) {
                    carSeries = await carSeriesModel.create({
                         carBrand_id: carDetailsData.carBrand_id,
                         leaseType_id: [],
                         seriesName: carDetailsData.seriesName,
                         modelCode: carDetailsData.modelCode,
                    });
               }

               const existingLeaseType = carSeries.leaseType_id.find(
                    (lt) => lt.leaseType === leaseType && lt.term === term
               );

               if (!existingLeaseType) {
                    carSeries.leaseType_id.push(leaseTypeDoc._id);
                    await carSeries.save();
               }

               const carOffer = await carOfferModel.create(carOffersData[i]);
               carOfferResults.push(carOffer);
          }


          // Return the new car object
          return {
               carDetails: newCarDetails,
               carFeatures: newCarFeatures,
               carOffers: carOfferResults,
          };

     } catch (error) {
          console.log(error);
     }
};
const createCarDetailUpdateExistingCar = async (carDetailData) => {
     try {
          if (!carDetailData.companyName) {
               throw new Error('Missing companyName');
          }

          let carBrand = await carBrandModel.findOne({
               companyName: carDetailData.companyName,
               makeCode: carDetailData.makeCode,
          });

          if (!carBrand) {
               carBrand = await carBrandModel.create({
                    companyName: carDetailData.companyName,
                    makeCode: carDetailData.makeCode,
               });
          }

          const existingCarBrands = await carBrandModel.find({
               makeCode: carDetailData.makeCode,
          });

          let carSeries = await carSeriesModel.findOne({
               modelCode: carDetailData.modelCode,
               carBrand_id: {
                    $in: existingCarBrands.map((brand) => brand._id),
               },
          });

          if (!carSeries) {
               if (!carDetailData.seriesName) {
                    throw new Error('Missing seriesName');
               }
               carSeries = await carSeriesModel.create({
                    seriesName: carDetailData.seriesName,
                    modelCode: carDetailData.modelCode,
                    carBrand_id: carBrand._id,
               });
          }

          const existingCarDetail = await carDetailModel.findOne({
               makeCode: carDetailData.makeCode,
               modelCode: carDetailData.modelCode,
               yearModel: carDetailData.yearModel,
               carBrand_id: carBrand._id,
               carSeries_id: carSeries._id,
          });

          let images = [];
          for (let i = 1; i <= 6; i++) {
               if (carDetailData[`image_${i}_url`]) {
                    images.push({ imageUrl: carDetailData[`image_${i}_url`] });
               }
          }

          if (existingCarDetail) {
               // If car with the same carBrand_id, carSeries_id, makeCode, modelCode and yearModel exists, update the fields
               existingCarDetail.description =
                    carDetailData.description || existingCarDetail.description;
               existingCarDetail.image =
                    images.length > 0 ? images : existingCarDetail.image;
               existingCarDetail.acceleration =
                    carDetailData.acceleration ||
                    existingCarDetail.acceleration;
               existingCarDetail.fuelType =
                    carDetailData.fuelType || existingCarDetail.fuelType;
               existingCarDetail.seat =
                    carDetailData.seat || existingCarDetail.seat;
               existingCarDetail.door =
                    carDetailData.door || existingCarDetail.door;
               existingCarDetail.bodyType =
                    carDetailData.bodyType || existingCarDetail.bodyType;
               existingCarDetail.transmission =
                    carDetailData.transmission ||
                    existingCarDetail.transmission;
               existingCarDetail.gears =
                    carDetailData.gears || existingCarDetail.gears;
               existingCarDetail.tankCapacity =
                    carDetailData.tankCapacity ||
                    existingCarDetail.tankCapacity;
               existingCarDetail.co2 =
                    carDetailData.co2 || existingCarDetail.co2;

               const updatedCarDetail = await existingCarDetail.save();
               return updatedCarDetail;
          } else {
               // If car does not exist, create a new entry in the carDetail collection
               const newCarDetail = new carDetailModel({
                    carBrand_id: carBrand._id,
                    carSeries_id: carSeries._id,
                    makeCode: carDetailData.makeCode,
                    modelCode: carDetailData.modelCode,
                    yearModel: carDetailData.yearModel,
                    description: carDetailData.description,
                    image: images.length > 0 ? images : [],
                    acceleration: carDetailData.acceleration,
                    fuelType: carDetailData.fuelType,
                    seat: carDetailData.seat,
                    door: carDetailData.door,
                    bodyType: carDetailData.bodyType,
                    transmission: carDetailData.transmission,
                    gears: carDetailData.gears,
                    tankCapacity: carDetailData.tankCapacity,
                    co2: carDetailData.co2,
               });
               const savedCarDetail = await newCarDetail.save();
               return savedCarDetail;
          }
     } catch (error) {
          console.log(error);
          throw new Error('Car details upload failed');
     }
};

const getCarsByBrandSeriesLeaseType = async (carBrand_id, carSeries_id) => {
     try {
          const cars = await carDetailModel
              .find({
                   carBrand_id,
                   carSeries_id,
              })
              .sort({ yearModel: 1 });
          const uniqueYears = Array.from(
              new Set(cars.map((car) => car.yearModel))
          );
          const result = uniqueYears.map((year) => {
               const carsWithSameYear = cars.filter(
                   (car) => car.yearModel === year
               );
               return {
                    companyName: carsWithSameYear[0].carBrand_id.companyName,
                    seriesName: carsWithSameYear[0].carSeries_id.seriesName,
                    yearModel: year,
                    cars: carsWithSameYear,
               };
          });
          return result;
     } catch (err) {
          console.error(err);
          throw new Error(
              'Error getting cars by brand, series, and lease type'
          );
     }
};


export const CarServices = {
     addNewCar,
     createCarDetailUpdateExistingCar,
     getCarsByBrandSeriesLeaseType,
};
