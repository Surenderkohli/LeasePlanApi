import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carDetailModel from '../models/carDetails.js';
import carOfferModel from '../models/carOffer.js';
// //------------------------------------------------------------------------------------------carDetails.js-----------------------------------------------------------------------------------
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

// // const deleteAllCarDetails = async () => {
// //      try {
// //           await carDetailModel.deleteMany({});
// //      } catch (error) {
// //           console.log(error);
// //           throw new Error('Failed to delete car details');
// //      }
// // };

// //*********************************************************KEEP IT TEMP */ CSV UPLOAD

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

// //------------------------------------------------------------------------------------------carOffer.js-----------------------------------------------------------------------------------

// const createCarOfferManual = async (carOfferData) => {
//      try {
//           const leaseType = await leaseTypeModel.findOne({
//                leaseType: carOfferData.leaseType,
//           });
//           if (!leaseType) {
//                throw new Error(
//                     `Lease type ${carOfferData.leaseType} not found`
//                );
//           }

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

//           const existingCarOffer = await carOfferModel.findOne({
//                leaseType_id: leaseType._id,
//                carBrand_id: companyName._id,
//                carSeries_id: seriesName._id,
//                yearModel: yearModel,
//           });

//           if (existingCarOffer) {
//                // car offer already exists, add new offer to existing group
//                existingCarOffer.offers.push({
//                     leaseType_id: leaseType._id,
//                     duration: carOfferData.duration,
//                     annualMileage: carOfferData.annualMileage,
//                     monthlyCost: carOfferData.monthlyCost,
//                });
//                await existingCarOffer.save();
//                return {
//                     message: 'Car offer updated successfully',
//                     data: existingCarOffer,
//                };
//           } else {
//                // create new car offer with a new group
//                const newCarOffer = await carOfferModel.create({
//                     carBrand_id: companyName._id,
//                     carSeries_id: seriesName._id,
//                     leaseType_id: leaseType._id,
//                     yearModel: yearModel,
//                     offers: [
//                          {
//                               duration: carOfferData.duration,
//                               annualMileage: carOfferData.annualMileage,
//                               monthlyCost: carOfferData.monthlyCost,
//                          },
//                     ],
//                     deals: carOfferData.deals,
//                });
//                return newCarOffer;
//           }
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to create/update car offer.');
//      }
// };

// const createCarOffer = async (carOfferData) => {
//      try {
//           // const leaseType = await leaseTypeModel.findOne({
//           //      leaseType: carOfferData.leaseType,
//           // });
//           // if (!leaseType) {
//           //      throw new Error(
//           //           `Lease type ${carOfferData.leaseType} not found`
//           //      );
//           // }

//           let leaseTypes;
//           if (carOfferData.leaseType) {
//                leaseTypes = await leaseTypeModel.find({
//                     leaseType: carOfferData.leaseType,
//                });
//                if (leaseTypes.length === 0) {
//                     // Create a new leaseType entry in the leaseTypeModel collection
//                     const newLeaseType = new leaseTypeModel({
//                          leaseType: carOfferData.leaseType,
//                     });
//                     const savedLeaseType = await newLeaseType.save();
//                     leaseTypes = [savedLeaseType];
//                }
//           } else {
//                leaseTypes = [];
//           }

//           // const companyName = await carBrandModel.findOne({
//           //      makeCode: carOfferData.makeCode,
//           // });
//           // if (!companyName) {
//           //      throw new Error(
//           //           `Car brand with makeCode ${carOfferData.makeCode} not found`
//           //      );
//           // }

//           if (!carOfferData.companyName) {
//                throw new Error('Missing companyName');
//           }

//           let companyName = await carBrandModel.findOne({
//                companyName: carOfferData.companyName,
//                makeCode: carOfferData.makeCode,
//           });

//           if (!companyName) {
//                companyName = await carBrandModel.create({
//                     companyName: carOfferData.companyName,
//                     makeCode: carOfferData.makeCode,
//                     leaseType_id: leaseTypes,
//                });
//           } else if (leaseTypes.length > 0) {
//                const leaseTypeIdsToAdd = leaseTypes
//                     .map((leaseType) => leaseType._id)
//                     .filter(
//                          (leaseTypeId) =>
//                               !companyName.leaseType_id.includes(leaseTypeId)
//                     );
//                if (leaseTypeIdsToAdd.length > 0) {
//                     companyName.leaseType_id = [
//                          ...companyName.leaseType_id,
//                          ...leaseTypeIdsToAdd,
//                     ];
//                     await companyName.save();
//                }
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

//           /*    const existingCarOffer = await carOfferModel.findOneAndUpdate(
//                {
//                     leaseType_id: leaseType._id,
//                     carBrand_id: companyName._id,
//                     carSeries_id: seriesName._id,
//                     yearModel: yearModel,
//                },
//                {
//                     $push: {
//                          offers: {
//                               duration: carOfferData.duration,
//                               annualMileage: carOfferData.annualMileage,
//                               monthlyCost: carOfferData.monthlyCost,
//                          },
//                     },
//                },
//                { new: true, upsert: true }
//           ); */

//           const existingCarOffer = await carOfferModel.findOne({
//                leaseType_id: leaseTypes,
//                carBrand_id: companyName._id,
//                carSeries_id: seriesName._id,
//                yearModel: yearModel,
//           });

//           if (existingCarOffer) {
//                // car offer already exists, add new offer to existing group
//                existingCarOffer.offers.push({
//                     duration: carOfferData.duration,
//                     annualMileage: carOfferData.annualMileage,
//                     monthlyCost: carOfferData.monthlyCost,
//                     calculationNo: carOfferData.calculationNo,
//                });

//                await existingCarOffer.save();
//                return {
//                     message: 'Car offer updated successfully',
//                     data: existingCarOffer,
//                };
//           } else {
//                // create new car offer with a new group
//                const newCarOffer = await carOfferModel.create({
//                     carBrand_id: companyName._id,
//                     carSeries_id: seriesName._id,
//                     leaseType_id: leaseTypes,
//                     yearModel: yearModel,
//                     offers: [
//                          {
//                               duration: carOfferData.duration,
//                               annualMileage: carOfferData.annualMileage,
//                               monthlyCost: carOfferData.monthlyCost,
//                               calculationNo: carOfferData.calculationNo,
//                          },
//                     ],
//                     deals: carOfferData.deals,
//                });
//                return newCarOffer;
//           }
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to create/update car offer.');
//      }
// };

// const createCarOffers = async (carOfferData) => {
//      try {
//           const leaseType = await leaseTypeModel.findOne({
//                leaseType: carOfferData.leaseType,
//           });
//           if (!leaseType) {
//                throw new Error(
//                     `Lease type ${carOfferData.leaseType} not found`
//                );
//           }

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

//           const existingCarOffer = await carOfferModel.findOne({
//                leaseType_id: leaseType._id,
//                carBrand_id: companyName._id,
//                carSeries_id: seriesName._id,
//                yearModel: yearModel,
//           });

//           if (existingCarOffer) {
//                // car offer already exists, update offer with new values
//                const updatedOffer = {
//                     duration: carOfferData.duration,
//                     annualMileage: carOfferData.annualMileage,
//                     monthlyCost: carOfferData.monthlyCost,
//                };
//                const offerIndex = existingCarOffer.offers.findIndex(
//                     (offer) =>
//                          offer.duration === carOfferData.duration &&
//                          offer.annualMileage === carOfferData.annualMileage
//                );
//                if (offerIndex !== -1) {
//                     // update existing offer
//                     existingCarOffer.offers[offerIndex] = updatedOffer;
//                } else {
//                     // add new offer to offers array
//                     existingCarOffer.offers.push(updatedOffer);
//                }
//                await existingCarOffer.save();
//                return {
//                     message: 'Car offer updated successfully',
//                     data: existingCarOffer,
//                };
//           } else {
//                // create new car offer with a new group
//                const newCarOffer = await carOfferModel.create({
//                     carBrand_id: companyName._id,
//                     carSeries_id: seriesName._id,
//                     leaseType_id: leaseType._id,
//                     yearModel: yearModel,
//                     offers: [
//                          {
//                               duration: carOfferData.duration,
//                               annualMileage: carOfferData.annualMileage,
//                               monthlyCost: carOfferData.monthlyCost,
//                          },
//                     ],
//                     deals: carOfferData.deals,
//                });
//                return newCarOffer;
//           }
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to create/update car offer.');
//      }
// };

// // update carOffer with csv
// const updateOffers = async (offers) => {
//      for (const offer of offers) {
//           // Validate CSV data
//           if (
//                !offer.carBrand_id ||
//                !offer.carSeries_id ||
//                !offer.leaseType_id ||
//                !offer.yearModel
//           ) {
//                throw new Error('Invalid CSV data: missing required fields');
//           }

//           // Find matching car offer document
//           const carOffer = await carOfferModel.findOne({
//                carBrand_id: offer.carBrand_id,
//                carSeries_id: offer.carSeries_id,
//                leaseType_id: offer.leaseType_id,
//                yearModel: offer.yearModel,
//           });

//           if (carOffer) {
//                // Update offers and deals fields
//                carOffer.offers = offer.offers;
//                carOffer.deals = offer.deals;
//                await carOffer.save();
//           }
//      }
// };

// const getBestDealss = async () => {
//      try {
//           const bestDeals = await carOfferModel
//                .find({ deals: 'active' })
//                .sort({ 'offers.monthlyCost': 1 })
//                .limit(10)
//                .populate('carBrand_id', 'companyName')
//                .populate('carSeries_id', 'seriesName')
//                .populate('leaseType_id', 'leaseType');

//           return bestDeals;
//      } catch (err) {
//           console.error(err);
//           throw new Error('Unable to retrieve best deals');
//      }
// };

// //------------------------------------------------------------------------------------------carFeature.js-----------------------------------------------------------------------------------

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

// // const deleteAllCarOffers = async () => {
// //      try {
// //           await carOfferModel.deleteMany({});
// //           console.log('All car offers deleted successfully.');
// //      } catch (error) {
// //           console.log(`Error deleting car offers: ${error}`);
// //           throw error;
// //      }
// // };
// const addFeatureDescription = async (featureDescriptionData) => {
//      try {
//           const { makeCode, modelCode, categoryCode, featureDescription } =
//                featureDescriptionData;

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
//                     categories: [],
//                });
//           }

//           // Find the corresponding category in CarFeatureCategory based on categoryCode
//           const carFeatureCategory = await CarFeatureCategory.findOne({
//                categoryCode,
//           });

//           if (!carFeatureCategory) {
//                throw new Error(
//                     `Invalid categoryCode. Category not found: ${categoryCode}`
//                );
//           }

//           // Check if the category already exists in the carFeature document
//           const category = carFeature.categories.find(
//                (cat) => cat.categoryCode === categoryCode
//           );

//           if (category) {
//                // Category already exists, update the features array
//                category.features.push(featureDescription);
//           } else {
//                // Category does not exist, create a new one
//                carFeature.categories.push({
//                     categoryCode,
//                     categoryDescription: carFeatureCategory.categoryDescription,
//                     features: [featureDescription],
//                });
//           }

//           await carFeature.save();
//           return carFeature;
//      } catch (error) {
//           console.log(error);
//           throw new Error('Failed to add feature description');
//      }
// };
// const updateCarV2 = async (
//      id,
//      carDetailsData,
//      carFeaturesData,
//      carOffersData
// ) => {
//      try {
//           // Validate input
//           if (!carDetailsData || !carFeaturesData || !carOffersData) {
//                throw new Error(
//                     'carDetails, carFeatures, and carOffers must be provided'
//                );
//           }

//           // Update car in CarFeatures collection
//           const carOffer = await carOfferModel.findById(id);

//           const { carBrand_id, carSeries_id } = carOffer;

//           //////////////////////////////// Update carDetails
//           const carDetailsFilter = {
//                carBrand_id,
//                carSeries_id,
//           };

//           const updatedCarDetails = await carDetailsModel.findOneAndUpdate(
//                carDetailsFilter,
//                { ...carDetailsData },
//                { new: true }
//           );

//           //////////////////////////////// Update carFeatures
//           // const carFeaturesFilter = {
//           //      carBrand_id,
//           //      carSeries_id,
//           // };
//           // const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
//           //      carFeaturesFilter,
//           //      { ...carFeaturesData },
//           //      { new: true }
//           // );

//           //////////////////////////////// Update carFeatures
//           const carFeaturesFilter = {
//                carBrand_id,
//                carSeries_id,
//           };
//           const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
//                carFeaturesFilter,
//                { ...carFeaturesData },
//                { new: true }
//           );

//           //////////////////////////////// Update categories and features
//           if (carFeaturesData.categories) {
//                for (const newCategory of carFeaturesData.categories) {
//                     const existingCategory = updatedCarFeatures.categories.find(
//                          (category) =>
//                               category.categoryCode === newCategory.categoryCode
//                     );

//                     if (existingCategory) {
//                          // If the category exists, replace its features with the new features
//                          existingCategory.features = newCategory.features;
//                     } else {
//                          // If the category does not exist, add it to the array
//                          updatedCarFeatures.categories.push(newCategory);
//                     }
//                }
//           }

//           // Save the updated car features
//           await updatedCarFeatures.save();

//           //////////////////////////////// Update inventory
//           const existingOffers = await carOfferModel.findById(id, 'offers');

//           if (carOffersData.offers) {
//                existingOffers.offers = carOffersData.offers;
//           }

//           // Save the updated offers array
//           await existingOffers.save();

//           // Return the updated car object
//           return {
//                carOffers: existingOffers.offers,
//                carFeatures: updatedCarFeatures,
//                inventoryData: updatedCarDetails,
//           };
//      } catch (error) {
//           console.error('Error in updating car:', error);
//           throw new Error(error.message);
//      }
// };

/* const createCarFeature = async (carDetailData) => {
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
}; */


//////Filter car 1st phase changes


// const filterCars = async (filterOptions) => {
//     try {
//         const {
//             leaseType,
//             term,
//             carBrand_id,
//             carSeries_id,
//             priceMin,
//             priceMax,
//             annualMileage,
//             bodyType,
//             querySearch,
//         } = filterOptions;
//
//         const query = {};
//
//         if (leaseType) {
//             query['leaseType_id.leaseType'] = leaseType;
//         }
//
//         if (term) {
//             query['leaseType_id.term'] = term;
//         }
//
//         // if (monthlyCost) {
//         //      query['offers.monthlyCost'] = monthlyCost;
//         // }
//
//         if (priceMin || priceMax) {
//             query['offers.monthlyCost'] = {};
//
//             if (priceMin) {
//                 query['offers.monthlyCost']['$gte'] = priceMin;
//             }
//
//             if (priceMax) {
//                 query['offers.monthlyCost']['$lte'] = priceMax;
//             }
//         }
//
//         if (annualMileage) {
//             query['offers.annualMileage'] = annualMileage;
//         }
//
//         if (carBrand_id) {
//             query.carBrand_id = carBrand_id;
//         }
//
//         if (carSeries_id) {
//             query.carSeries_id = carSeries_id;
//         }
//
//         if (querySearch) {
//             const carBrands = await carBrandModel.find({
//                 companyName: { $regex: querySearch, $options: 'i' },
//             });
//
//             const carBrandIds = carBrands.map((brand) => brand._id);
//
//             const carSeries = await carSeriesModel.find({
//                 seriesName: { $regex: querySearch, $options: 'i' },
//             });
//
//             const carSeriesIds = carSeries.map((series) => series._id);
//
//             query.$or = [
//                 { carBrand_id: { $in: carBrandIds } },
//                 { carSeries_id: { $in: carSeriesIds } },
//             ];
//         }
//
//         const carOffers = await carOfferModel
//             .find({
//                 ...query,
//                 isDeleted: false, //  line to filter based on isDeleted property
//             })
//             .populate({
//                 path: 'carBrand_id',
//                 select: 'makeCode companyName',
//             })
//             .populate({
//                 path: 'carSeries_id',
//                 select: 'modelCode seriesName',
//             });
//
//         const cars = [];
//
//         for (const carOffer of carOffers) {
//             const car = carOffer.toObject();
//             const carDetails = await carDetailModel.find({
//                 carBrand_id: car.carBrand_id,
//                 carSeries_id: car.carSeries_id,
//             });
//             // .populate('carBrand_id')
//             // .populate('carSeries_id');
//
//             car.details = carDetails[0]; // Assuming there is only one matching car detail
//
//             if (!leaseType || carOffer.leaseType === leaseType) {
//                 if (!term || carOffer.term === term) {
//                     cars.push(car);
//                 }
//             }
//         }
//
//         if (bodyType) {
//             const carsWithBodyType = cars.filter(
//                 (car) => car.details.bodyType === bodyType
//             );
//             return carsWithBodyType;
//         }
//
//         // if (fuelType) {
//         //      const carsWithFuelType = cars.filter(
//         //           (car) => car.details.fuelType === fuelType
//         //      );
//         //      return carsWithFuelType;
//         // }
//
//         // if (fuelType && bodyType) {
//         //      const carsWithFuelAndBodyType = cars.filter(
//         //           (car) =>
//         //                car.details.fuelType === fuelType &&
//         //                car.details.bodyType === bodyType
//         //      );
//         //      return carsWithFuelAndBodyType;
//         // }
//
//         // if (fuelType && bodyType) {
//         //      const carsWithFuelAndBodyType = cars.filter(
//         //           (car) =>
//         //                car.details.fuelType === fuelType &&
//         //                car.details.bodyType === bodyType
//         //      );
//         //      return carsWithFuelAndBodyType;
//         // } else if (fuelType) {
//         //      const carsWithFuelType = cars.filter(
//         //           (car) => car.details.fuelType === fuelType
//         //      );
//         //      return carsWithFuelType;
//         // } else if (bodyType) {
//         //      const carsWithBodyType = cars.filter(
//         //           (car) => car.details.bodyType === bodyType
//         //      );
//         //      return carsWithBodyType;
//         // }
//
//         return cars;
//     } catch (error) {
//         throw error;
//     }
// };

const getAllCarWithOffersV2 = async (
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
        const filter = {};

        // Apply price range filter
        if (priceMin || priceMax) {
            filter['offers.monthlyCost'] = {};
            if (priceMin) {
                filter['offers.monthlyCost'].$gte = parseInt(priceMin);
            }
            if (priceMax) {
                filter['offers.monthlyCost'].$lte = parseInt(priceMax);
            }
        }

        // Apply annual mileage filter
        if (annualMileage) {
            filter['offers.annualMileage'] = parseInt(annualMileage);
        }

        // Apply search query filter for car brands and car series
        if (querySrch) {
            // Find car brand IDs matching the search query
            const carBrandIds = await carBrandModel.find(
                {
                    companyName: {
                        $regex: `.*${querySrch}.*`,
                        $options: 'i',
                    },
                },
                '_id'
            );

            // Find car series IDs matching the search query
            const carSeriesIds = await carSeriesModel.find(
                {
                    seriesName: {
                        $regex: `.*${querySrch}.*`,
                        $options: 'i',
                    },
                },
                '_id'
            );

            // Apply the $or condition to match either car brand or car series
            filter.$or = [
                {
                    carBrand_id: {
                        $in: carBrandIds,
                    },
                },
                {
                    carSeries_id: {
                        $in: carSeriesIds,
                    },
                },
            ];
        }

        if (fuelType) {
            const carDetailsFilter = { fuelType: fuelType };
            const carDetails = await carDetailModel.find(carDetailsFilter);
            const carSeriesIds = carDetails.map(
                (detail) => detail.carSeries_id
            );
            filter.carSeries_id = { $in: carSeriesIds };
        }

        if (bodyType) {
            const carDetailsFilter = { bodyType: bodyType };
            const carDetails = await carDetailModel.find(carDetailsFilter);
            const carSeriesIds = carDetails.map(
                (detail) => detail.carSeries_id
            );
            filter.carSeries_id = { $in: carSeriesIds };
        }

        if (yearModel) {
            filter['yearModel'] = parseInt(yearModel);
        }

        let query = carOfferModel.find(filter);

        if (Object.keys(filter).length > 0) {
            query = query
                .populate({
                    path: 'carBrand_id',
                    model: 'carBrand',
                })
                .populate({
                    path: 'carSeries_id',
                    model: 'carSeries',
                });
        }

        const response = await query.skip(skip).limit(limit).exec();

        return response;
    } catch (error) {
        console.log(error);
    }
};
