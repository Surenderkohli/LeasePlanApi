import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carFeatureModel from '../models/carFeatures.js';
import carOfferModel from '../models/carOffer.js';

const getAllCar = async (
     leaseType,
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

          if (leaseType) {
               preFilter.leaseType_id = leaseType;
          }

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
                         from: 'leasetypes',
                         localField: 'leaseType_id',
                         foreignField: '_id',
                         as: 'leaseType',
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
                    $unwind: '$carBrand',
               },
               {
                    $unwind: '$carSeries',
               },
               {
                    $unwind: '$leaseType',
               },

               {
                    $skip: skip,
               },
               {
                    $limit: limit,
               },
          ];

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

          if (priceMin) {
               aggregateFilter.push({
                    $match: {
                         price: {
                              $gte: parseInt(priceMin),
                         },
                    },
               });
          }
          if (priceMax) {
               aggregateFilter.push({
                    $match: {
                         price: {
                              $lte: parseInt(priceMax),
                         },
                    },
               });
          }
          if (annualMileage) {
               aggregateFilter.push({
                    $match: {
                         annualMileage: parseInt(annualMileage),
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

          // if (Array.isArray(yearModels) && yearModels.length > 0) {
          //      // Use the $in operator to filter by multiple yearModel values
          //      aggregateFilter.push({
          //           $match: {
          //                yearModel: {
          //                     $in: yearModels.map(yearModel),
          //                },
          //           },
          //      });
          // } else if (yearModel) {
          //      // Use the $eq operator to filter by a single yearModel value
          //      aggregateFilter.push({
          //           $match: {
          //                yearModel: parseInt(yearModel),
          //           },
          //      });
          // }

          const response = await carDetailModel.aggregate(aggregateFilter);

          return response;
     } catch (error) {
          console.log(error);
     }
};

const addNewCar = async (data, carImage) => {
     try {
          const images = carImage.map((image) => ({
               imageUrl: image.imageUrl,
               publicId: image.publicId,
          }));
          const response = await carDetailModel.create({
               ...data,
               image: images,
          });
          return response;
     } catch (error) {
          console.log(error);
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const getSingleCar = async (
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

const getCount = async () => {
     const counts = await carDetailModel.aggregate([
          {
               $match: { isDeleted: false },
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
               $group: {
                    _id: '$leaseType.leaseType',
                    count: { $sum: 1 },
               },
          },
     ]);

     const countObject = { flexiCount: 0, longTermCount: 0 };
     counts.forEach((count) => {
          if (count._id === 'flexi') countObject.flexiCount = count.count;
          if (count._id === 'longTerm') countObject.longTermCount = count.count;
     });

     return countObject;
};

// const getBestDeals = async (query) => {
//      const cars = await carDetailModel
//           .find({ query })
//           .populate('carBrand_id')
//           .populate('carSeries_id')
//           .sort({ price: -1 })
//           .limit(5);

//      return cars;
// };

const getDeals = async (query) => {
     try {
          const carDetails = await carDetailModel.find({
               deals: 'active',
               ...query, // any other filters specified in the query parameter
          });
          return carDetails;
     } catch (error) {
          throw new Error(error.message);
     }
};

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

const getSingleCars = async (id) => {
     try {
          const car = await carDetailModel.findOne({ _id: id });

          if (!car) {
               throw new Error('Car not found');
          }

          const carFeatures = await carFeatureModel.findOne({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               yearModel: car.yearModel,
          });

          const carOffers = await carOfferModel.find({
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               yearModel: car.yearModel,
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

const createCarDetail = async (carDetailData) => {
     try {
          const leaseTypes = carDetailData.leaseType
               ? await leaseTypeModel.find({
                      leaseType: carDetailData.leaseType,
                 })
               : [];

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
                    leaseType_id: leaseTypes,
               });
          } else if (leaseTypes.length > 0) {
               const leaseTypeIdsToAdd = leaseTypes
                    .map((leaseType) => leaseType._id)
                    .filter(
                         (leaseTypeId) =>
                              !carBrand.leaseType_id.includes(leaseTypeId)
                    );
               if (leaseTypeIdsToAdd.length > 0) {
                    carBrand.leaseType_id = [
                         ...carBrand.leaseType_id,
                         ...leaseTypeIdsToAdd,
                    ];
                    await carBrand.save();
               }
          }

          const existingCarBrands = await carBrandModel.find({
               makeCode: carDetailData.makeCode,
               leaseType_id: {
                    $in: leaseTypes.map((leaseType) => leaseType._id),
               },
          });

          let carSeries = await carSeriesModel.findOne({
               modelCode: carDetailData.modelCode,
               carBrand_id: {
                    $in: existingCarBrands.map((brand) => brand._id),
               },
          });

          // If carSeries doesn't exist, create a new entry in carseries collection
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

          const images = [];
          for (let i = 1; i <= 6; i++) {
               if (carDetailData[`image_${i}_url`]) {
                    images.push({ imageUrl: carDetailData[`image_${i}_url`] });
               }
          }

          // Create the new car detail entry using the retrieved IDs
          const newCarDetail = new carDetailModel({
               leaseType_id: leaseTypes,
               carBrand_id: carBrand._id,
               carSeries_id: carSeries._id,
               makeCode: carDetailData.makeCode,
               modelCode: carDetailData.modelCode,
               image: images ? images : [],
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
     } catch (error) {
          console.log(error);
          throw new Error('Car details upload failed');
     }
};

async function getCarsByBrandAndSeries(companyName, seriesName) {
     try {
          const cars = await carDetailModel
               .find({
                    'carBrand_id.companyName': companyName,
                    'carSeries_id.seriesName': seriesName,
               })
               .select('yearModel carSeries_id carBrand_id')
               .populate('carSeries_id', 'seriesName')
               .populate('carBrand_id', 'companyName');

          const filteredCars = [];
          const uniqueYears = new Set();

          cars.forEach((car) => {
               if (!uniqueYears.has(car.yearModel)) {
                    uniqueYears.add(car.yearModel);
                    filteredCars.push({
                         yearModel: car.yearModel,
                         carSeries: car.carSeries_id,
                         carBrand: car.carBrand_id,
                    });
               }
          });

          return filteredCars;
     } catch (err) {
          console.error(err);
          throw new Error('Error fetching cars');
     }
}

async function getCarsWithOffers(companyName, seriesName, yearModels) {
     try {
          const carDetails = await CarDetail.find({
               companyName: companyName,
               seriesName: seriesName,
               yearModel: { $in: yearModels },
          })
               .populate('carBrand_id', 'companyName')
               .populate('carSeries_id', 'seriesName');

          const carDetailIds = carDetails.map((carDetail) => carDetail._id);

          const carOffers = await CarOffer.aggregate([
               { $match: { carDetail_id: { $in: carDetailIds } } },
               { $unwind: '$leaseType_id' },
               {
                    $lookup: {
                         from: 'leasetypes',
                         localField: 'leaseType_id',
                         foreignField: '_id',
                         as: 'leaseType',
                    },
               },
               { $unwind: '$leaseType' },
               {
                    $group: {
                         _id: '$carDetail_id',
                         offers: {
                              $push: {
                                   leaseType: '$leaseType.leaseType',
                                   annualMileage: '$annualMileage',
                                   duration: '$duration',
                                   monthlyCost: '$monthlyCost',
                                   deals: '$deals',
                              },
                         },
                    },
               },
               {
                    $lookup: {
                         from: 'cardetails',
                         localField: '_id',
                         foreignField: '_id',
                         as: 'carDetails',
                    },
               },
               { $unwind: '$carDetails' },
               {
                    $project: {
                         _id: '$carDetails._id',
                         makeCode: '$carDetails.makeCode',
                         modelCode: '$carDetails.modelCode',
                         companyName: '$carDetails.carBrand_id.companyName',
                         seriesName: '$carDetails.carSeries_id.seriesName',
                         yearModel: '$carDetails.yearModel',
                         offers: 1,
                    },
               },
          ]);

          return carOffers;
     } catch (err) {
          console.error(err);
          throw err;
     }
}

export const CarServices = {
     getAllCar,
     addNewCar,
     updateCar,
     deleteCar,
     getSingleCar,
     getCount,
     getSingleCars,
     getDeals,
     createCarDetail,
     getCarsByBrandAndSeries,
     getCarsWithOffers,
};
