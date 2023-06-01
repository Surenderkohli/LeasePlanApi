import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import { carFeatureModel } from '../models/carFeatures.js';
import carOfferModel from '../models/carOffer.js';

const getAllCar = async (
     //leaseType,
     carBrand,
     carSeries,
     fuelType,
     priceMin,
     priceMax,
     bodyType,
     annualMileage,
     yearModel,
     querySrch,
     limit,
     skip
) => {
     try {
          const preFilter = {};

          // if (leaseType) {
          //      preFilter.leaseType_id = leaseType;
          // }

          if (carBrand) {
               preFilter.carBrand_id = carBrand;
          }

          if (carSeries) {
               preFilter.carSeries_id = carSeries;
          }

          const carDetails = await carDetailModel.find(preFilter);

          const carDetailIds = carDetails.map((car) => car._id);

          const aggregateFilter = [
               {
                    $match: {
                         _id: {
                              $in: carDetailIds,
                         },
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
                    $lookup: {
                         from: 'carseries',
                         localField: 'carSeries_id',
                         foreignField: '_id',
                         as: 'carSeries',
                    },
               },
               {
                    $lookup: {
                         from: 'caroffers',
                         let: {
                              carBrandId: '$carBrand_id',
                              carSeriesId: '$carSeries_id',
                              leaseTypeId: '$leaseType_id',
                              // yearModel: '$yearModel',
                         },
                         pipeline: [
                              {
                                   $match: {
                                        $expr: {
                                             $and: [
                                                  {
                                                       $eq: [
                                                            '$carBrand_id',
                                                            '$$carBrandId',
                                                       ],
                                                  },
                                                  {
                                                       $eq: [
                                                            '$carSeries_id',
                                                            '$$carSeriesId',
                                                       ],
                                                  },
                                                  // {
                                                  //      $in: [
                                                  //           {
                                                  //                $arrayElemAt: [
                                                  //                     '$leaseType_id',
                                                  //                     0,
                                                  //                ],
                                                  //           },
                                                  //           '$$leaseTypeId',
                                                  //      ],
                                                  // },
                                                  // {
                                                  //      $eq: [
                                                  //           '$yearModel',
                                                  //           '$$yearModel',
                                                  //      ],
                                                  // },
                                             ],
                                        },
                                   },
                              },
                              // {
                              //      $lookup: {
                              //           from: 'leasetypes',
                              //           localField: 'leaseType_id',
                              //           foreignField: '_id',
                              //           as: 'leaseType',
                              //      },
                              // },
                         ],
                         as: 'offers',
                    },
               },

               {
                    $unwind: '$carBrand',
               },
               {
                    $unwind: '$carSeries',
               },
               {
                    $unwind: '$offers',
               },
               {
                    $skip: skip,
               },
               {
                    $limit: limit,
               },
          ];

          if (priceMin || priceMax) {
               const priceFilter = {};

               if (priceMin) {
                    priceFilter.$gte = parseInt(priceMin);
               }

               if (priceMax) {
                    priceFilter.$lte = parseInt(priceMax);
               }

               aggregateFilter.push({
                    $match: {
                         'offers.offers.monthlyCost': priceFilter,
                    },
               });
          }

          if (annualMileage) {
               aggregateFilter.push({
                    $match: {
                         'offers.offers.annualMileage': parseInt(annualMileage),
                    },
               });
          }

          // i(ignore case): Case insensitivity to match upper and lower cases.https://www.mongodb.com/docs/manual/reference/operator/query/regex/#std-label-regex-case-insensitive

          if (querySrch) {
               aggregateFilter.push({
                    $match: {
                         $or: [
                              {
                                   'carBrand.companyName': {
                                        $regex: `.*${querySrch}.*`,
                                        $options: 'i',
                                   },
                              },
                              {
                                   'carSeries.seriesName': {
                                        $regex: `.*${querySrch}.*`,
                                        $options: 'i',
                                   },
                              },
                         ],
                    },
               });
          }

          if (fuelType) {
               aggregateFilter.push({
                    $match: {
                         fuelType: fuelType,
                    },
               });
          }

          if (bodyType) {
               aggregateFilter.push({
                    $match: {
                         bodyType,
                    },
               });
          }

          if (yearModel) {
               aggregateFilter.push({
                    $match: {
                         yearModel: parseInt(yearModel),
                    },
               });
          }

          //const response = await carDetailModel.aggregate(aggregateFilter);
          const documents = await carDetailModel
               .aggregate(aggregateFilter)
               .exec();
          const uniqueIds = {};
          for (const document of documents) {
               if (!uniqueIds[document._id]) {
                    uniqueIds[document._id] = document;
               }
          }
          const response = Object.values(uniqueIds);

          return response;
     } catch (error) {
          console.log(error);
     }
};

// const addNewCar = async (
//      carDetailsData,
//      carImage,
//      carFeaturesData,
//      carOffersData
// ) => {
//      try {
//           // Validate input
//           if (!carDetailsData || !carFeaturesData) {
//                throw new Error(
//                     'Both carDetails and carFeatures must be provided'
//                );
//           }

//           const images = carImage.map((image) => ({
//                imageUrl: image.imageUrl,
//                publicId: image.publicId,
//           }));

//           // Create car in CarDetails collection
//           const newCarDetails = await carDetailModel.create({
//                ...carDetailsData,
//                image: images,
//           });
//           // Extract categories data from carFeaturesData
//           const { categories } = carFeaturesData;

//           // Create an array to store the modified categories data
//           const modifiedCategories = [];

//           // Iterate over the categories and push the required fields to modifiedCategories array
//           for (const category of categories) {
//                modifiedCategories.push({
//                     categoryCode: category.categoryCode,
//                     categoryDescription: category.categoryDescription,
//                     features: category.features,
//                });
//           }

//           // Update carFeaturesData with modified categories
//           carFeaturesData.categories = modifiedCategories;

//           // Create carFeatureModel in CarFeatureModel collection
//           const newCarFeatures = await carFeatureModel.create({
//                ...carFeaturesData,
//           });

//           // // Find or create a carBrand entry in the carBrandModel collection
//           // let carBrand = await carBrandModel
//           //      .findOne({
//           //           _id: carDetailsData.carBrand_id,
//           //      })
//           //      .populate('leaseType_id');

//           // if (!carBrand) {
//           //      // Create new carBrand if not found
//           //      carBrand = await carBrandModel.create({
//           //           //companyName: carDetailsData.companyName,
//           //           makeCode: carDetailsData.makeCode,
//           //           leaseType_id: carOffersData.leaseType_id,
//           //      });
//           // } else {
//           //      // Check if leaseType already exists in leaseType collection
//           //      let leaseType = await leaseTypeModel.findOne({
//           //           leaseType: carOffersData.leaseType_id[0].leaseType,
//           //           term: carOffersData.leaseType_id[0].term,
//           //      });

//           //      if (!leaseType) {
//           //           // Create new leaseType if not found
//           //           leaseType = await leaseTypeModel.create({
//           //                leaseType: carOffersData.leaseType_id[0].leaseType,
//           //                term: carOffersData.leaseType_id[0].term,
//           //           });
//           //      }
//           //      // Update carOffersData with existing or new leaseType _id
//           //      carOffersData.leaseType_id[0]._id = leaseType._id;

//           //      // Add new leaseType to carBrand if it doesn't already exist
//           //      const existingLeaseTypeIds = carBrand.leaseType_id.map((lt) =>
//           //           String(lt._id)
//           //      );
//           //      if (!existingLeaseTypeIds.includes(String(leaseType._id))) {
//           //           carBrand.leaseType_id.push(leaseType._id);
//           //           await carBrand.save();
//           //      }
//           // }

//           // // Find or create a carSeries entry in the carSeriesModel collection
//           // let carSeries = await carSeriesModel
//           //      .findOne({
//           //           _id: carDetailsData.carSeries_id,
//           //      })
//           //      .populate('leaseType_id');

//           // if (!carSeries) {
//           //      // Create new carSeries if not found
//           //      carSeries = await carSeriesModel.create({
//           //           carBrand_id: carDetailsData.carBrand_id,
//           //           leaseType_id: carOffersData.leaseType_id,
//           //           seriesName: carDetailsData.seriesName,
//           //           modelCode: carDetailsData.modelCode,
//           //      });
//           // } else {
//           //      // Check if leaseType already exists in leaseType collection
//           //      let leaseType = await leaseTypeModel.findOne({
//           //           leaseType: carOffersData.leaseType_id[0].leaseType,
//           //           term: carOffersData.leaseType_id[0].term,
//           //      });

//           //      if (!leaseType) {
//           //           // Create new leaseType if not found
//           //           leaseType = await leaseTypeModel.create({
//           //                leaseType: carOffersData.leaseType_id[0].leaseType,
//           //                term: carOffersData.leaseType_id[0].term,
//           //           });
//           //      }
//           //      // Update carOffersData with existing or new leaseType _id
//           //      carOffersData.leaseType_id[0]._id = leaseType._id;

//           //      // Add new leaseType to carSeries if it doesn't already exist
//           //      const existingLeaseTypeIds = carSeries.leaseType_id.map((lt) =>
//           //           String(lt._id)
//           //      );
//           //      if (!existingLeaseTypeIds.includes(String(leaseType._id))) {
//           //           carSeries.leaseType_id.push(leaseType._id);
//           //           await carSeries.save();
//           //      }
//           // }

//           // const carOffer = await carOfferModel.create({
//           //      ...carOffersData,
//           //      carBrand_id: carBrand._id,
//           // });

//           let carBrand = await carBrandModel
//                .findOne({
//                     _id: carDetailsData.carBrand_id,
//                })
//                .populate('leaseType_id');

//           if (!carBrand) {
//                carBrand = await carBrandModel.create({
//                     makeCode: carDetailsData.makeCode,
//                     leaseType_id: [],
//                });
//           }

//           let leaseType = carBrand.leaseType_id.find(
//                (lt) =>
//                     lt.leaseType === carOffersData.leaseType &&
//                     lt.term === carOffersData.term
//           );

//           if (!leaseType) {
//                leaseType = await leaseTypeModel.create({
//                     leaseType: carOffersData.leaseType,
//                     term: carOffersData.term,
//                });
//                carBrand.leaseType_id.push(leaseType._id);
//                await carBrand.save();
//           }

//           let carSeries = await carSeriesModel
//                .findOne({
//                     _id: carDetailsData.carSeries_id,
//                })
//                .populate('leaseType_id');

//           if (!carSeries) {
//                carSeries = await carSeriesModel.create({
//                     carBrand_id: carDetailsData.carBrand_id,
//                     leaseType_id: [],
//                     seriesName: carDetailsData.seriesName,
//                     modelCode: carDetailsData.modelCode,
//                });
//           }

//           const existingLeaseType = carSeries.leaseType_id.find(
//                (lt) =>
//                     lt.leaseType === carOffersData.leaseType &&
//                     lt.term === carOffersData.term
//           );

//           if (!existingLeaseType) {
//                carSeries.leaseType_id.push(leaseType._id);
//                await carSeries.save();
//           }

//           const carOffer = await carOfferModel.create({
//                ...carOffersData,
//                carBrand_id: carBrand._id,
//           });

//           // Update corresponding car brand's leaseType_id array
//           // const carBrand = await carBrandModel.findOneAndUpdate(
//           //      { _id: carDetailsData.carBrand_id },
//           //      { $addToSet: { leaseType_id: carOffersData.leaseType_id } },
//           //      { new: true }
//           // );

//           // Return the new car object
//           return {
//                carDetails: newCarDetails,
//                carFeatures: newCarFeatures,
//                carOffers: carOffer,
//                // carBrand: carBrand,
//           };
//      } catch (error) {
//           console.log(error);
//           //res.send({ status: 400, success: false, msg: error.message });
//      }
// };
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
          for (const category of categories) {
               modifiedCategories.push({
                    categoryCode: category.categoryCode,
                    categoryDescription: category.categoryDescription,
                    features: category.features,
               });
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

          let leaseType = carBrand.leaseType_id.find(
               (lt) =>
                    lt.leaseType === carOffersData.leaseType &&
                    lt.term === carOffersData.term
          );

          if (!leaseType) {
               // Check if leaseType and term already exist in leaseTypes collection
               const existingLeaseType = await leaseTypeModel.findOne({
                    leaseType: carOffersData.leaseType,
                    term: carOffersData.term,
               });

               if (existingLeaseType) {
                    leaseType = existingLeaseType;
               } else {
                    leaseType = await leaseTypeModel.create({
                         leaseType: carOffersData.leaseType,
                         term: carOffersData.term,
                    });
               }

               carBrand.leaseType_id.push(leaseType._id);
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
               (lt) =>
                    lt.leaseType === carOffersData.leaseType &&
                    lt.term === carOffersData.term
          );

          if (!existingLeaseType) {
               carSeries.leaseType_id.push(leaseType._id);
               await carSeries.save();
          }

          const carOffer = await carOfferModel.create({
               ...carOffersData,
               carBrand_id: carBrand._id,
          });

          // Return the new car object
          return {
               carDetails: newCarDetails,
               carFeatures: newCarFeatures,
               carOffers: carOffer,
          };
     } catch (error) {
          console.log(error);
     }
};

const updateCar = async (
     carId,
     carDetailsData,
     carFeaturesData,
     carOffersData
) => {
     try {
          // Validate input
          if (!carDetailsData || !carFeaturesData || !carOffersData) {
               throw new Error(
                    'carDetails, carFeatures, and carOffers must be provided'
               );
          }

          // Update car in CarDetails collection
          const updatedCarDetails = await carDetailModel.findByIdAndUpdate(
               carId,
               { ...carDetailsData },
               { new: true }
          );

          // Update car in CarFeatures collection
          const carDetails = await carDetailModel.findById(carId);
          const { carBrand_id, carSeries_id, yearModel } = carDetails;

          const filter = {
               carBrand_id,
               carSeries_id,
               yearModel,
          };

          const updateFields = {};

          for (const [key, value] of Object.entries(carDetailsData)) {
               if (key.endsWith('Features') && Array.isArray(value)) {
                    const featureIndex = key.slice(0, -8);
                    value.forEach((featureValue, index) => {
                         updateFields[`${featureIndex}Features.${index}`] =
                              featureValue;
                    });
               } else {
                    updateFields[key] = value;
               }
          }

          const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
               filter,
               updateFields,
               { new: true }
          );
          // Create an empty array to store all the updated car offers
          const updatedCarOffers = [];

          // Update carOffers
          for (const offer of carOffersData.offers) {
               const filter = {
                    carSeries_id: updatedCarDetails.carSeries_id,
                    carBrand_id: updatedCarDetails.carBrand_id,
                    yearModel: updatedCarDetails.yearModel,
                    'offers.calculationNo': offer.calculationNo,
               };

               const update = {
                    $set: {
                         'offers.$.duration': offer.duration,
                         'offers.$.annualMileage': offer.annualMileage,
                         'offers.$.monthlyCost': offer.monthlyCost,
                    },
               };

               const updatedOffer = await carOfferModel.findOneAndUpdate(
                    filter,
                    update,
                    { new: true }
               );

               // Push the updated offer to the array
               updatedCarOffers.push(updatedOffer);
          }
          // Return the updated car object
          return {
               carDetails: updatedCarDetails,
               carFeatures: updatedCarFeatures,
               carOffers: updatedCarOffers,
          };
     } catch (error) {
          console.error('Error in updating car:', error);
          throw new Error(error.message);
     }
};

const getDeals = async (query) => {
     try {
          const carDetails = await carDetailModel
               .find({
                    deals: 'active',
                    ...query,
               })
               .populate(['carBrand_id', 'carSeries_id']);

          const carOffers = await carOfferModel
               .find({
                    carBrand_id: {
                         $in: carDetails.map(
                              (detail) => detail.carBrand_id._id
                         ),
                    },
                    carSeries_id: {
                         $in: carDetails.map(
                              (detail) => detail.carSeries_id._id
                         ),
                    },
                    yearModel: {
                         $in: carDetails.map((detail) => detail.yearModel),
                    },
               })
               .populate('leaseType_id');

          const result = {
               carDetails,
               carOffers,
          };

          return result;
     } catch (error) {
          throw new Error(error.message);
     }
};

// <----------------------------------------------------------------@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-------------------------------------------------------->

const getSingleCars = async (id, leaseTypeId) => {
     try {
          const car = await carDetailModel
               .findOne({ _id: id })
               .populate('carBrand_id')
               .populate('carSeries_id');

          if (!car) {
               throw new Error('Car not found');
          }

          const carFeatures = await carFeatureModel.findOne({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               // yearModel: car.yearModel,
          });
          let clause = {
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               // yearModel: car.yearModel,
          };
          if (leaseTypeId) {
               clause.leaseType_id = leaseTypeId;
          }
          const carOffers = await carOfferModel
               .find(clause)
               .populate('leaseType_id');

          carOffers.forEach((carOffer) => {
               // Call the `isExpired` method on each individual car offer document
               carOffer.isExpired();
          });

          const result = {
               car,
               features: carFeatures || [],
               offers: carOffers || [],
          };

          return result;
     } catch (error) {
          console.log(error);
          throw error;
     }
};

const getCarsByBrandSeriesLeaseType = async (carBrand_id, carSeries_id) => {
     try {
          const cars = await carDetailModel
               .find({
                    carBrand_id,
                    carSeries_id,
                    // leaseType_id,
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

const deletedCar = async (id) => {
     try {
          const car = await carDetailModel.findOne({ _id: id });
          if (!car) {
               throw new Error('Car not found');
          }

          // Delete associated car offers
          await carOfferModel.deleteMany({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
          });

          // Delete associated car features
          await carFeatureModel.deleteMany({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
          });

          car.isDeleted = true;
          await car.save();
          return car;
     } catch (error) {
          console.log(error);
          throw error;
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

/* const getSingleCar = async (
     id,
     contractLengthInMonthStr,
     annualMileageStr,
     upfrontPaymentStr,
     includeMaintenanceStr
) => {
     try {
          // const leaseType = car.leaseType.leaseType; // Extracting the leaseType value from the car object
          // // Find the car in the database using its ID
          const carDetails = await carDetailModel.findById({ _id: id });

          const { leaseType_id, price } = carDetails;

          // calculate base price
          let basePrice = price;

          // Retrieve lease type details using leaseTypeId from leasetypes collection
          const leaseType = await leaseTypeModel.findOne({
               _id: leaseType_id,
               isDeleted: false, // Assuming you have a isDeleted field to mark records as deleted
          });

          if (!leaseType) {
               throw new Error('Lease type details not found');
          }

          const { leaseType: leaseTypeName } = leaseType;

          let contractLengthInMonth = contractLengthInMonthStr
               ? parseInt(contractLengthInMonthStr)
               : null;

          let annualMileage = annualMileageStr
               ? parseInt(annualMileageStr)
               : null;

          let upfrontPayment = upfrontPaymentStr
               ? parseInt(upfrontPaymentStr)
               : null;

          let includeMaintenance = includeMaintenanceStr
               ? parseInt(includeMaintenanceStr)
               : null;

          if (leaseTypeName === 'flexi') {
               contractLengthInMonth = contractLengthInMonth
                    ? contractLengthInMonth
                    : 12;
               annualMileage = annualMileage ? annualMileage : 4000;
               upfrontPayment = upfrontPayment ? upfrontPayment : 3;
               includeMaintenance = includeMaintenance ? includeMaintenance : 0;
          } else {
               contractLengthInMonth = contractLengthInMonth
                    ? contractLengthInMonth
                    : 36;
               annualMileage = annualMileage ? annualMileage : 8000;
               upfrontPayment = upfrontPayment ? upfrontPayment : 6;
               includeMaintenance = includeMaintenance ? includeMaintenance : 0;
          }

          switch (leaseTypeName) {
               case 'Private Lease':
                    if (contractLengthInMonth === 6) {
                         basePrice *= 0.8;
                    } else if (contractLengthInMonth === 12) {
                         basePrice *= 0.7;
                    } else if (contractLengthInMonth === 24) {
                         basePrice *= 0.6;
                    } else if (contractLengthInMonth === 36) {
                         basePrice *= 0.5;
                    } else {
                         throw new Error(
                              'Invalid contract length for flexi lease'
                         );
                    }
                    break;
               case 'FlexiPlan':
                    if (contractLengthInMonth === 12) {
                         basePrice *= 0.6;
                    } else if (contractLengthInMonth === 24) {
                         basePrice *= 0.5;
                    } else if (contractLengthInMonth === 36) {
                         basePrice *= 0.4;
                    } else if (contractLengthInMonth === 48) {
                         basePrice *= 0.4;
                    } else {
                         throw new Error(
                              'Invalid contract length for long term lease'
                         );
                    }
                    break;
               default:
                    throw new Error('Invalid lease type');
          }

          // convert to monthly price
          let perMonthPrice = basePrice / contractLengthInMonth;

          // apply annualMileage factor
          switch (leaseTypeName) {
               case 'flexi':
                    switch (annualMileage) {
                         case 4000:
                              perMonthPrice *= 0.9; // 10% discount for 4,000 annual mileage
                              break;
                         case 6000:
                              // no discount or markup for 6,000 annual mileage
                              break;
                         case 8000:
                              perMonthPrice *= 1.05; // 5% markup for 8,000 annual mileage
                              break;
                         case 10000:
                              perMonthPrice *= 1.1; // 10% markup for 10,000 annual mileage
                              break;
                         case 12000:
                              perMonthPrice *= 1.2; // 20% markup for 12,000 annual mileage
                              break;
                         default:
                              throw new Error(
                                   'Invalid annual mileage for flexi lease.'
                              );
                    }
                    break;

               case 'longTerm':
                    switch (annualMileage) {
                         case 4000:
                              perMonthPrice *= 0.9; // 10% discount for 4,000 annual mileage
                              break;
                         case 6000:
                              // no discount or markup for 6,000 annual mileage
                              break;
                         case 8000:
                              perMonthPrice *= 1.05; // 5% markup for 8,000 annual mileage
                              break;
                         case 10000:
                              perMonthPrice *= 1.1; // 10% markup for 10,000 annual mileage
                              break;
                         case 12000:
                              perMonthPrice *= 1.2; // 20% markup for 12,000 annual mileage
                              break;
                         default:
                              throw new Error(
                                   'Invalid annual mileage for longTerm lease.'
                              );
                    }
                    break;
          }

          // apply upfrontPayment factor
          switch (upfrontPayment) {
               case 1:
                    perMonthPrice *= 1.1; // 10% markup for 1-month upfront payment
                    break;
               case 3:
                    // no discount or markup for 3-month upfront payment
                    break;
               case 6:
                    perMonthPrice *= 0.95; // 5% discount for 6-month upfront payment
                    break;
               case 9:
                    perMonthPrice *= 0.9; // 10% discount for 9-month upfront payment
                    break;
               case 12:
                    perMonthPrice *= 0.85; // 15% discount for 12-month upfront payment
                    break;
               default:
                    throw new Error('Invalid upfront payment.');
          }

          if (upfrontPayment > 0) {
               var remainingLeaseMonths =
                    contractLengthInMonth - upfrontPayment;
               if (remainingLeaseMonths > 0) {
                    let remainingLeasePrice =
                         perMonthPrice * remainingLeaseMonths;
                    perMonthPrice = remainingLeasePrice / remainingLeaseMonths;
               }
          }

          // apply maintenance factor
          if (includeMaintenance) {
               perMonthPrice *= 1.1; // 10% markup for maintenance inclusion
          }

          // return total price
          let monthlyLeasePrice = perMonthPrice.toFixed();

          let upfrontCost = perMonthPrice.toFixed() * remainingLeaseMonths;

          return {
               carDetails: carDetails,
               leaseType: leaseTypeName,
               contractLengthInMonth: contractLengthInMonth,
               annualMileage: annualMileage,
               upfrontPayment: upfrontPayment,
               includeMaintenance: includeMaintenance,
               monthlyLeasePrice: monthlyLeasePrice,
               upfrontCost: upfrontCost,
               roadFundLicense: carDetails.roadFundLicense,
               roadSideAssist: carDetails.roadSideAssist,
               standardDelivery: carDetails.standardDelivery,
          };
     } catch (error) {
          throw new Error(error.message);
     }
}; */

export const CarServices = {
     getAllCar,
     addNewCar,
     updateCar,
     getSingleCars,
     getDeals,
     getCarsByBrandSeriesLeaseType,
     deletedCar,
     createCarDetailUpdateExistingCar,
};
