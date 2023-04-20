import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carFeatureModel from '../models/carFeatures.js';
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
               // {
               //      $lookup: {
               //           from: 'leasetypes',
               //           localField: 'leaseType_id',
               //           foreignField: '_id',
               //           as: 'leaseType',
               //      },
               // },
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
                              yearModel: '$yearModel',
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
                                                  {
                                                       $eq: [
                                                            '$yearModel',
                                                            '$$yearModel',
                                                       ],
                                                  },
                                             ],
                                        },
                                   },
                              },
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
               // {
               //      $unwind: '$leaseType',
               // },
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

          const response = await carDetailModel.aggregate(aggregateFilter);

          return response;
     } catch (error) {
          console.log(error);
     }
};

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

          // Check if car with same carBrand_id, carSeries_id, and yearModel already exists
          // const existingCar = await carDetailModel.findOne({
          //      carBrand_id: carDetailsData.carBrand_id,
          //      carSeries_id: carDetailsData.carSeries_id,
          //      // yearModel: carDetailsData.yearModel,
          // });
          // if (existingCar) {
          //      throw new Error('Car already exists');
          // }

          const images = carImage.map((image) => ({
               imageUrl: image.imageUrl,
               publicId: image.publicId,
          }));

          // Create car in CarDetails collection
          const newCarDetails = await carDetailModel.create({
               ...carDetailsData,
               image: images,
          });

          // Create car in CarFeatures collection
          const newCarFeatures = await carFeatureModel.create(carFeaturesData);

          const carOffer = await carOfferModel.create(carOffersData);

          // Return the new car object
          return {
               carDetails: newCarDetails,
               carFeatures: newCarFeatures,
               carOffers: carOffer,
          };
     } catch (error) {
          console.log(error);
          //res.send({ status: 400, success: false, msg: error.message });
     }
};

const updateCar = async (id, data) => {
     try {
          const response = await carDetailModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               { new: true }
          );
          return response;
     } catch (error) {
          console.log(error);
     }
};

// const getCount = async () => {
//      const counts = await carDetailModel.aggregate([
//           {
//                $match: { isDeleted: false },
//           },
//           {
//                $lookup: {
//                     from: 'leasetypes',
//                     localField: 'leaseType_id',
//                     foreignField: '_id',
//                     as: 'leaseType',
//                },
//           },
//           {
//                $unwind: '$leaseType',
//           },
//           {
//                $group: {
//                     _id: '$leaseType.leaseType',
//                     count: { $sum: 1 },
//                },
//           },
//      ]);

//      const countObject = {
//           privateLeaseCount: 0,
//           flexiPlanCount: 0,
//           businessLeaseCount: 0,
//      };
//      counts.forEach((count) => {
//           if (count._id === 'Private Lease')
//                countObject.privateLeaseCount = count.count;
//           if (count._id === 'FlexiPlan')
//                countObject.flexiPlanCount = count.count;
//           if (count._id === 'Business Lease')
//                countObject.businessLeaseCount = count.count;
//      });

//      return countObject;
// };

// const getDeals = async (query) => {
//      try {
//           const carDetails = await carDetailModel
//                .find({ deals: 'active', ...query })
//                .populate(['carBrand_id', 'carSeries_id']);
//           const carOffers = await carOfferModel.find({
//                carBrand_id: {
//                     $in: carDetails.map((detail) => detail.carBrand_id._id),
//                },
//                carSeries_id: {
//                     $in: carDetails.map((detail) => detail.carSeries_id._id),
//                },
//                yearModel: { $in: carDetails.map((detail) => detail.yearModel) },
//           });
//           return carOffers;
//      } catch (error) {
//           throw new Error(error.message);
//      }
// };
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

const deleteCar = async (id) => {
     try {
          const response = await carDetailModel.deleteOne(
               { _id: id },
               { isDeleted: true }
          );
          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
     const response = await carDetailModel.remove(
          { _id: id },
          { isDeleted: true }
     );
     return response;
};

// const getSingleCar = async (
//      id,
//      contractLengthInMonthStr,
//      annualMileageStr,
//      upfrontPaymentStr,
//      includeMaintenanceStr
// ) => {
//      try {
//           // const leaseType = car.leaseType.leaseType; // Extracting the leaseType value from the car object
//           // // Find the car in the database using its ID
//           const carDetails = await carDetailModel.findById({ _id: id });

//           const { leaseType_id, price } = carDetails;

//           // calculate base price
//           let basePrice = price;

//           // Retrieve lease type details using leaseTypeId from leasetypes collection
//           const leaseType = await leaseTypeModel.findOne({
//                _id: leaseType_id,
//                isDeleted: false, // Assuming you have a isDeleted field to mark records as deleted
//           });

//           if (!leaseType) {
//                throw new Error('Lease type details not found');
//           }

//           const { leaseType: leaseTypeName } = leaseType;

//           let contractLengthInMonth = contractLengthInMonthStr
//                ? parseInt(contractLengthInMonthStr)
//                : null;

//           let annualMileage = annualMileageStr
//                ? parseInt(annualMileageStr)
//                : null;

//           let upfrontPayment = upfrontPaymentStr
//                ? parseInt(upfrontPaymentStr)
//                : null;

//           let includeMaintenance = includeMaintenanceStr
//                ? parseInt(includeMaintenanceStr)
//                : null;

//           if (leaseTypeName === 'flexi') {
//                contractLengthInMonth = contractLengthInMonth
//                     ? contractLengthInMonth
//                     : 12;
//                annualMileage = annualMileage ? annualMileage : 4000;
//                upfrontPayment = upfrontPayment ? upfrontPayment : 3;
//                includeMaintenance = includeMaintenance ? includeMaintenance : 0;
//           } else {
//                contractLengthInMonth = contractLengthInMonth
//                     ? contractLengthInMonth
//                     : 36;
//                annualMileage = annualMileage ? annualMileage : 8000;
//                upfrontPayment = upfrontPayment ? upfrontPayment : 6;
//                includeMaintenance = includeMaintenance ? includeMaintenance : 0;
//           }

//           switch (leaseTypeName) {
//                case 'Private Lease':
//                     if (contractLengthInMonth === 6) {
//                          basePrice *= 0.8;
//                     } else if (contractLengthInMonth === 12) {
//                          basePrice *= 0.7;
//                     } else if (contractLengthInMonth === 24) {
//                          basePrice *= 0.6;
//                     } else if (contractLengthInMonth === 36) {
//                          basePrice *= 0.5;
//                     } else {
//                          throw new Error(
//                               'Invalid contract length for flexi lease'
//                          );
//                     }
//                     break;
//                case 'FlexiPlan':
//                     if (contractLengthInMonth === 12) {
//                          basePrice *= 0.6;
//                     } else if (contractLengthInMonth === 24) {
//                          basePrice *= 0.5;
//                     } else if (contractLengthInMonth === 36) {
//                          basePrice *= 0.4;
//                     } else if (contractLengthInMonth === 48) {
//                          basePrice *= 0.4;
//                     } else {
//                          throw new Error(
//                               'Invalid contract length for long term lease'
//                          );
//                     }
//                     break;
//                default:
//                     throw new Error('Invalid lease type');
//           }

//           // convert to monthly price
//           let perMonthPrice = basePrice / contractLengthInMonth;

//           // apply annualMileage factor
//           switch (leaseTypeName) {
//                case 'flexi':
//                     switch (annualMileage) {
//                          case 4000:
//                               perMonthPrice *= 0.9; // 10% discount for 4,000 annual mileage
//                               break;
//                          case 6000:
//                               // no discount or markup for 6,000 annual mileage
//                               break;
//                          case 8000:
//                               perMonthPrice *= 1.05; // 5% markup for 8,000 annual mileage
//                               break;
//                          case 10000:
//                               perMonthPrice *= 1.1; // 10% markup for 10,000 annual mileage
//                               break;
//                          case 12000:
//                               perMonthPrice *= 1.2; // 20% markup for 12,000 annual mileage
//                               break;
//                          default:
//                               throw new Error(
//                                    'Invalid annual mileage for flexi lease.'
//                               );
//                     }
//                     break;

//                case 'longTerm':
//                     switch (annualMileage) {
//                          case 4000:
//                               perMonthPrice *= 0.9; // 10% discount for 4,000 annual mileage
//                               break;
//                          case 6000:
//                               // no discount or markup for 6,000 annual mileage
//                               break;
//                          case 8000:
//                               perMonthPrice *= 1.05; // 5% markup for 8,000 annual mileage
//                               break;
//                          case 10000:
//                               perMonthPrice *= 1.1; // 10% markup for 10,000 annual mileage
//                               break;
//                          case 12000:
//                               perMonthPrice *= 1.2; // 20% markup for 12,000 annual mileage
//                               break;
//                          default:
//                               throw new Error(
//                                    'Invalid annual mileage for longTerm lease.'
//                               );
//                     }
//                     break;
//           }

//           // apply upfrontPayment factor
//           switch (upfrontPayment) {
//                case 1:
//                     perMonthPrice *= 1.1; // 10% markup for 1-month upfront payment
//                     break;
//                case 3:
//                     // no discount or markup for 3-month upfront payment
//                     break;
//                case 6:
//                     perMonthPrice *= 0.95; // 5% discount for 6-month upfront payment
//                     break;
//                case 9:
//                     perMonthPrice *= 0.9; // 10% discount for 9-month upfront payment
//                     break;
//                case 12:
//                     perMonthPrice *= 0.85; // 15% discount for 12-month upfront payment
//                     break;
//                default:
//                     throw new Error('Invalid upfront payment.');
//           }

//           if (upfrontPayment > 0) {
//                var remainingLeaseMonths =
//                     contractLengthInMonth - upfrontPayment;
//                if (remainingLeaseMonths > 0) {
//                     let remainingLeasePrice =
//                          perMonthPrice * remainingLeaseMonths;
//                     perMonthPrice = remainingLeasePrice / remainingLeaseMonths;
//                }
//           }

//           // apply maintenance factor
//           if (includeMaintenance) {
//                perMonthPrice *= 1.1; // 10% markup for maintenance inclusion
//           }

//           // return total price
//           let monthlyLeasePrice = perMonthPrice.toFixed();

//           let upfrontCost = perMonthPrice.toFixed() * remainingLeaseMonths;

//           return {
//                carDetails: carDetails,
//                leaseType: leaseTypeName,
//                contractLengthInMonth: contractLengthInMonth,
//                annualMileage: annualMileage,
//                upfrontPayment: upfrontPayment,
//                includeMaintenance: includeMaintenance,
//                monthlyLeasePrice: monthlyLeasePrice,
//                upfrontCost: upfrontCost,
//                roadFundLicense: carDetails.roadFundLicense,
//                roadSideAssist: carDetails.roadSideAssist,
//                standardDelivery: carDetails.standardDelivery,
//           };
//      } catch (error) {
//           throw new Error(error.message);
//      }
// };

// const updateCar = async (id, data) => {
//      try {
//           const carDetail = await carDetailModel.findById(id);
//           const currentImages = carDetail.image;

//           // If new images were provided, update them in the data object
//           if (data.image && Array.isArray(data.image)) {
//                // Replace old images with new ones
//                data.image.forEach((newImage, index) => {
//                     if (newImage.publicId) {
//                          // Check if new image has a public ID (i.e. it was uploaded to Cloudinary)
//                          const matchingImage = currentImages.find(
//                               (oldImage) =>
//                                    oldImage.publicId === newImage.publicId
//                          );
//                          if (matchingImage) {
//                               // If a matching image was found, replace it with the new image
//                               currentImages.splice(
//                                    currentImages.indexOf(matchingImage),
//                                    1,
//                                    newImage
//                               );
//                               data.image[index] = matchingImage;
//                          } else {
//                               // Otherwise, add the new image to the array
//                               currentImages.push(newImage);
//                          }
//                     }
//                });
//           } else {
//                data.image = currentImages;
//           }
//           // Update the document with the new data
//           const response = await carDetailModel.findByIdAndUpdate(
//                { _id: id },
//                { $set: data },
//                { new: true }
//           );
//           return response;
//      } catch (error) {
//           console.log(error);
//      }
// };

// const getBestDeals = async (query) => {
//      const cars = await carDetailModel
//           .find({ query })
//           .populate('carBrand_id')
//           .populate('carSeries_id')
//           .sort({ price: -1 })
//           .limit(5);

//      return cars;
// };

// const getSingleCars = async (id) => {
//      try {
//           const car = await carDetailModel
//                .find({ _id: id })
//                .populate('carBrand_id')
//                .populate('carSeries_id')
//                .populate('leaseType_id');

//           return car;
//      } catch (error) {
//           console.log(error);
//      }
// };
// async function getCarsByBrandAndSeries(companyName, seriesName) {
//      try {
//           const cars = await carDetailModel
//                .find({
//                     'carBrand_id.companyName': companyName,
//                     'carSeries_id.seriesName': seriesName,
//                })
//                .select('yearModel carSeries_id carBrand_id')
//                .populate('carSeries_id', 'seriesName')
//                .populate('carBrand_id', 'companyName');

//           const filteredCars = [];
//           const uniqueYears = new Set();

//           cars.forEach((car) => {
//                if (!uniqueYears.has(car.yearModel)) {
//                     uniqueYears.add(car.yearModel);
//                     filteredCars.push({
//                          yearModel: car.yearModel,
//                          carSeries: car.carSeries_id,
//                          carBrand: car.carBrand_id,
//                     });
//                }
//           });

//           return filteredCars;
//      } catch (err) {
//           console.error(err);
//           throw new Error('Error fetching cars');
//      }
// }

// async function getCarsWithOffers(companyName, seriesName, yearModels) {
//      try {
//           const carDetails = await CarDetail.find({
//                companyName: companyName,
//                seriesName: seriesName,
//                yearModel: { $in: yearModels },
//           })
//                .populate('carBrand_id', 'companyName')
//                .populate('carSeries_id', 'seriesName');

//           const carDetailIds = carDetails.map((carDetail) => carDetail._id);

//           const carOffers = await CarOffer.aggregate([
//                { $match: { carDetail_id: { $in: carDetailIds } } },
//                { $unwind: '$leaseType_id' },
//                {
//                     $lookup: {
//                          from: 'leasetypes',
//                          localField: 'leaseType_id',
//                          foreignField: '_id',
//                          as: 'leaseType',
//                     },
//                },
//                { $unwind: '$leaseType' },
//                {
//                     $group: {
//                          _id: '$carDetail_id',
//                          offers: {
//                               $push: {
//                                    leaseType: '$leaseType.leaseType',
//                                    annualMileage: '$annualMileage',
//                                    duration: '$duration',
//                                    monthlyCost: '$monthlyCost',
//                                    deals: '$deals',
//                               },
//                          },
//                     },
//                },
//                {
//                     $lookup: {
//                          from: 'cardetails',
//                          localField: '_id',
//                          foreignField: '_id',
//                          as: 'carDetails',
//                     },
//                },
//                { $unwind: '$carDetails' },
//                {
//                     $project: {
//                          _id: '$carDetails._id',
//                          makeCode: '$carDetails.makeCode',
//                          modelCode: '$carDetails.modelCode',
//                          companyName: '$carDetails.carBrand_id.companyName',
//                          seriesName: '$carDetails.carSeries_id.seriesName',
//                          yearModel: '$carDetails.yearModel',
//                          offers: 1,
//                     },
//                },
//           ]);

//           return carOffers;
//      } catch (err) {
//           console.error(err);
//           throw err;
//      }
// }
// <----------------------------------------------------------------@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-------------------------------------------------------->

// const deleteAllCarDetails = async () => {
//      try {
//           await carDetailModel.deleteMany({});
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to delete car details');
//      }
// };

//*********************************************************KEEP IT TEMP */

// const createCarDetail = async (carDetailData) => {
//      try {
//           /*
//           const { makeCode, modelCode, yearModel } = carDetailData;
//           let carDetail = await carDetailModel.findOne({ makeCode, modelCode, yearModel });
//           if (carDetail) {
//                // Car detail already exists, update it with the new data
//                Object.assign(carDetail, carDetailData);
//                await carDetail.save();
//           } else {
//                // Car detail does not exist, create a new entry
//                from line 720 to end------
//          */

//           // const leaseTypes = carDetailData.leaseType
//           //      ? await leaseTypeModel.find({
//           //             leaseType: carDetailData.leaseType,
//           //        })
//           //      : [];

//           // let leaseTypes;
//           // if (carDetailData.leaseType) {
//           //      leaseTypes = await leaseTypeModel.find({
//           //           leaseType: carDetailData.leaseType,
//           //      });
//           //      if (leaseTypes.length === 0) {
//           //           // Create a new leaseType entry in the leaseTypeModel collection
//           //           const newLeaseType = new leaseTypeModel({
//           //                leaseType: carDetailData.leaseType,
//           //           });
//           //           const savedLeaseType = await newLeaseType.save();
//           //           leaseTypes = [savedLeaseType];
//           //      }
//           // } else {
//           //      leaseTypes = [];
//           // }

//           if (!carDetailData.companyName) {
//                throw new Error('Missing companyName');
//           }

//           let carBrand = await carBrandModel.findOne({
//                companyName: carDetailData.companyName,
//                makeCode: carDetailData.makeCode,
//           });

//           if (!carBrand) {
//                carBrand = await carBrandModel.create({
//                     companyName: carDetailData.companyName,
//                     makeCode: carDetailData.makeCode,
//                     // leaseType_id: leaseTypes,
//                });
//           }
//           // else if (leaseTypes.length > 0) {
//           //      const leaseTypeIdsToAdd = leaseTypes
//           //           .map((leaseType) => leaseType._id)
//           //           .filter(
//           //                (leaseTypeId) =>
//           //                     !carBrand.leaseType_id.includes(leaseTypeId)
//           //           );
//           //      if (leaseTypeIdsToAdd.length > 0) {
//           //           carBrand.leaseType_id = [
//           //                ...carBrand.leaseType_id,
//           //                ...leaseTypeIdsToAdd,
//           //           ];
//           //           await carBrand.save();
//           //      }
//           // }

//           const existingCarBrands = await carBrandModel.find({
//                makeCode: carDetailData.makeCode,
//                // leaseType_id: {
//                //      $in: leaseTypes.map((leaseType) => leaseType._id),
//                // },
//           });

//           let carSeries = await carSeriesModel.findOne({
//                modelCode: carDetailData.modelCode,
//                carBrand_id: {
//                     $in: existingCarBrands.map((brand) => brand._id),
//                },
//           });

//           // If carSeries doesn't exist, create a new entry in carseries collection
//           if (!carSeries) {
//                if (!carDetailData.seriesName) {
//                     throw new Error('Missing seriesName');
//                }
//                carSeries = await carSeriesModel.create({
//                     seriesName: carDetailData.seriesName,
//                     modelCode: carDetailData.modelCode,
//                     carBrand_id: carBrand._id,
//                });
//           }

//           const images = [];
//           for (let i = 1; i <= 6; i++) {
//                if (carDetailData[`image_${i}_url`]) {
//                     images.push({ imageUrl: carDetailData[`image_${i}_url`] });
//                }
//           }

//           // Create the new car detail entry using the retrieved IDs
//           const newCarDetail = new carDetailModel({
//                // leaseType_id: leaseTypes,
//                carBrand_id: carBrand._id,
//                carSeries_id: carSeries._id,
//                makeCode: carDetailData.makeCode,
//                modelCode: carDetailData.modelCode,
//                yearModel: carDetailData.yearModel,
//                description: carDetailData.description,
//                image: images ? images : [],
//                acceleration: carDetailData.acceleration,
//                fuelType: carDetailData.fuelType,
//                seat: carDetailData.seat,
//                door: carDetailData.door,
//                bodyType: carDetailData.bodyType,
//                transmission: carDetailData.transmission,
//                gears: carDetailData.gears,
//                tankCapacity: carDetailData.tankCapacity,
//                c02: carDetailData.co2,
//           });

//           const savedCarDetail = await newCarDetail.save();

//           return savedCarDetail;
//      } catch (error) {
//           console.log(error);
//           throw new Error('Car details upload failed');
//      }
// };

const getSingleCars = async (id) => {
     try {
          const car = await carDetailModel
               .findOne({ _id: id })
               // .populate('leaseType_id')
               .populate('carBrand_id')
               .populate('carSeries_id');

          if (!car) {
               throw new Error('Car not found');
          }

          //  const { leaseType_id } = car;
          // Retrieve lease type details using leaseType_id from leasetypes collection
          // const leaseType = await leaseTypeModel.findOne({
          //      _id: leaseType_id,
          //      isDeleted: false,
          // });

          const carFeatures = await carFeatureModel.findOne({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               yearModel: car.yearModel,
          });

          const carOffers = await carOfferModel
               .find({
                    // leaseType_id: car.leaseType_id,
                    carBrand_id: car.carBrand_id,
                    carSeries_id: car.carSeries_id,
                    yearModel: car.yearModel,
               })
               .populate('leaseType_id');

          const result = {
               car,
               features: carFeatures || [],
               offers: carOffers || [],
               // leaseType: carOffers[0].leaseType,
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
               yearModel: car.yearModel,
          });

          // Delete associated car features
          await carFeatureModel.deleteMany({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               yearModel: car.yearModel,
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
          //                description: carDetailData.description,
          //                image: images ? images : [],
          //                acceleration: carDetailData.acceleration,
          //                fuelType: carDetailData.fuelType,
          //                seat: carDetailData.seat,
          //                door: carDetailData.door,
          //                bodyType: carDetailData.bodyType,
          //                transmission: carDetailData.transmission,
          //                gears: carDetailData.gears,
          //                tankCapacity: carDetailData.tankCapacity,
          //                c02: carDetailData.co2,
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
                    c02: carDetailData.co2,
               });
               const savedCarDetail = await newCarDetail.save();
               return savedCarDetail;
          }
     } catch (error) {
          console.log(error);
          throw new Error('Car details upload failed');
     }
};
export const CarServices = {
     getAllCar,
     addNewCar,
     updateCar,
     deleteCar,
     // getCount,
     getSingleCars,
     getDeals,
     // createCarDetail,
     getCarsByBrandSeriesLeaseType,
     deletedCar,
     // deleteAllCarDetails,
     createCarDetailUpdateExistingCar,
};
