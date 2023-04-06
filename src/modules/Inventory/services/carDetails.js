import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';

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

const getSingleCars = async (id) => {
     try {
          const car = await carDetailModel
               .find({ _id: id })
               .populate('carBrand_id')
               .populate('carSeries_id')
               .populate('leaseType_id');

          return car;
     } catch (error) {
          console.log(error);
     }
};

// const createCarDetail = async (carDetailData) => {
//      try {
//           let leaseType;
//           let carBrand;
//           let carSeries;
//           var images = [];

//           // Query the database for matching records based on the names provided
//           if (carDetailData.leaseType) {
//                leaseType = await leaseTypeModel.findOne({
//                     leaseType: carDetailData.leaseType,
//                });
//           }
//           // if (carDetailData.companyName) {
//           //      if (leaseType) {
//           //           companyName = await carBrandModel.findOneAndUpdate(
//           //                {
//           //                     companyName: carDetailData.companyName,
//           //                     leaseType_id: leaseType._id,
//           //                },
//           //                { $setOnInsert: { leaseType_id: leaseType._id } },
//           //                { upsert: true, new: true }
//           //           );
//           //      } else {
//           //           companyName = await carBrandModel.findOneAndUpdate(
//           //                {
//           //                     companyName: carDetailData.companyName,
//           //                     leaseType_id: null,
//           //                },
//           //                { $setOnInsert: { leaseType_id: null } },
//           //                { upsert: true, new: true }
//           //           );
//           //      }
//           // }

//           // if (carDetailData.seriesName) {
//           //      const query = {
//           //           seriesName: carDetailData.seriesName,
//           //           carBrand_id: companyName ? companyName._id : null,
//           //      };

//           //      seriesName = await carSeriesModel.findOneAndUpdate(
//           //           query,
//           //           {
//           //                $setOnInsert: {
//           //                     carBrand_id: companyName ? companyName._id : null,
//           //                     makeCode: carDetailData.makeCode,
//           //                     modelCode: carDetailData.modelCode,
//           //                },
//           //           },
//           //           { upsert: true, new: true }
//           //      );
//           // }

//           if (carDetailData.makeCode) {
//                carBrand = await carBrandModel.findOne({
//                     makeCode: carDetailData.makeCode,
//                });
//           }

//           if (carDetailData.modelCode) {
//                carSeries = await carSeriesModel.findOne({
//                     modelCode: carDetailData.modelCode,
//                });
//           }

//           // If carBrand doesn't exist, create a new entry in carbrands collection
//           if (!carBrand) {
//                if (carDetailData.companyName) {
//                     carBrand = await carBrandModel.create({
//                          companyName: carDetailData.companyName,
//                          makeCode: carDetailData.makeCode,
//                          leaseType_id: leaseType ? leaseType._id : null,
//                     });
//                } else {
//                     throw new Error('Missing companyName');
//                }
//           }

//           // If carSeries doesn't exist, create a new entry in carseries collection
//           if (!carSeries) {
//                if (carDetailData.seriesName) {
//                     carSeries = await carSeriesModel.create({
//                          seriesName: carDetailData.seriesName,
//                          modelCode: carDetailData.modelCode,
//                          carBrand_id: carBrand._id,
//                     });
//                } else {
//                     throw new Error('Missing seriesName');
//                }
//           }

//           // Save the image URLs into an array of objects

//           for (let i = 1; i <= 6; i++) {
//                if (carDetailData[`image_${i}_url`]) {
//                     images.push({
//                          imageUrl: carDetailData[`image_${i}_url`],
//                     });
//                }
//           }

//           // Create the new car detail entry using the retrieved IDs
//           const newCarDetail = new carDetailModel({
//                leaseType_id: leaseType ? leaseType._id : null,
//                carBrand_id: carBrand ? carBrand._id : null,
//                carSeries_id: carSeries ? carSeries._id : null,
//                makeCode: carDetailData.makeCode,
//                modelCode: carDetailData.modelCode,
//                yearModel: carDetailData.yearModel,
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

const createCarDetail = async (carDetailData) => {
     try {
          let leaseTypes = [];
          let carBrand;
          let carSeries;
          var images = [];

          // Query the database for matching records based on the makeCode and modelCode provided
          if (carDetailData.leaseType) {
               leaseTypes = await leaseTypeModel.find({
                    leaseType: carDetailData.leaseType,
               });
          }

          // If carBrand doesn't exist, create a new entry in carbrands collection
          if (!carDetailData.companyName) {
               throw new Error('Missing companyName');
          }

          // Check if the companyName exists in multiple lease types in carbrands collection
          const existingCarBrands = await carBrandModel.find({
               companyName: carDetailData.companyName,
               makeCode: carDetailData.makeCode,
          });

          // Set the leaseTypes based on the existing carBrand records
          if (existingCarBrands.length > 0) {
               existingCarBrands.forEach((brand) => {
                    if (brand.leaseType_id) {
                         leaseTypes.push(brand.leaseType_id);
                    }
               });
          }

          // If carBrand doesn't exist for any of the given leaseTypes, create a new entry in carbrands collection
          if (
               !existingCarBrands.some((brand) =>
                    leaseTypes.includes(brand.leaseType_id)
               )
          ) {
               carBrand = await carBrandModel.create({
                    companyName: carDetailData.companyName,
                    makeCode: carDetailData.makeCode,
                    leaseType_id: leaseTypes,
               });
          } else {
               carBrand = existingCarBrands.find((brand) =>
                    leaseTypes.includes(brand.leaseType_id)
               );
          }

          // Check if the modelCode exists in carseries collection for the given carBrand
          carSeries = await carSeriesModel.findOne({
               modelCode: carDetailData.modelCode,
               carBrand_id: carBrand._id,
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
          // Save the image URLs into an array of objects

          for (let i = 1; i <= 6; i++) {
               if (carDetailData[`image_${i}_url`]) {
                    images.push({
                         imageUrl: carDetailData[`image_${i}_url`],
                    });
               }
          }

          // Create the new car detail entry using the retrieved IDs
          const newCarDetail = new carDetailModel({
               leaseType_id: leaseTypes,
               carBrand_id: carBrand._id,
               carSeries_id: carSeries._id,
               makeCode: carDetailData.makeCode,
               modelCode: carDetailData.modelCode,
               yearModel: carDetailData.yearModel,
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

const bulkUpdateCarDetails = async (bulkOps) => {
     try {
          const result = await carDetailModel.bulkWrite(bulkOps);
          return result;
     } catch (error) {
          console.log(error);
          throw new Error('Bulk update failed');
     }
};

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
     bulkUpdateCarDetails,
};
