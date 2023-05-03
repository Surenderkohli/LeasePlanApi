import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';
import carDetailsModel from '../models/carDetails.js';
import carFeaturesModel from '../models/carFeatures.js';

// const createCarOffer = async (carOfferData) => {
//      try {
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

//           // const existingCarOffer = await carOfferModel.findOne({
//           //      leaseType_id: leaseTypes,
//           //      carBrand_id: companyName._id,
//           //      carSeries_id: seriesName._id,
//           //      yearModel: yearModel,
//           //      'offers.calculationNo': carOfferData.calculationNo,
//           // });

//           // if (existingCarOffer) {
//           //      // car offer already exists with the given calculationNo, update the offer
//           //      const offerIndex = existingCarOffer.offers.findIndex(
//           //           (offer) =>
//           //                offer.calculationNo === carOfferData.calculationNo
//           //      );
//           //      existingCarOffer.offers[offerIndex].duration =
//           //           carOfferData.duration;
//           //      existingCarOffer.offers[offerIndex].annualMileage =
//           //           carOfferData.annualMileage;
//           //      existingCarOffer.offers[offerIndex].monthlyCost =
//           //           carOfferData.monthlyCost;

//           //      await existingCarOffer.save();
//           //      return {
//           //           message: 'Car offer updated successfully',
//           //           data: existingCarOffer,
//           //      };

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

const createCarOffer = async (carOfferData) => {
     try {
          let leaseTypes;
          if (carOfferData.leaseType) {
               leaseTypes = await leaseTypeModel.find({
                    leaseType: carOfferData.leaseType,
               });
               if (leaseTypes.length === 0) {
                    // Create a new leaseType entry in the leaseTypeModel collection
                    const newLeaseType = new leaseTypeModel({
                         leaseType: carOfferData.leaseType,
                    });
                    const savedLeaseType = await newLeaseType.save();
                    leaseTypes = [savedLeaseType];
               }
          } else {
               leaseTypes = [];
          }

          if (!carOfferData.companyName) {
               throw new Error('Missing companyName');
          }

          let companyName = await carBrandModel.findOne({
               companyName: carOfferData.companyName,
               makeCode: carOfferData.makeCode,
          });

          if (!companyName) {
               companyName = await carBrandModel.create({
                    companyName: carOfferData.companyName,
                    makeCode: carOfferData.makeCode,
                    leaseType_id: leaseTypes,
               });
          } else if (leaseTypes.length > 0) {
               const leaseTypeIdsToAdd = leaseTypes
                    .map((leaseType) => leaseType._id)
                    .filter(
                         (leaseTypeId) =>
                              !companyName.leaseType_id.includes(leaseTypeId)
                    );
               if (leaseTypeIdsToAdd.length > 0) {
                    companyName.leaseType_id = [
                         ...companyName.leaseType_id,
                         ...leaseTypeIdsToAdd,
                    ];
                    await companyName.save();
               }
          }

          const seriesName = await carSeriesModel.findOne({
               modelCode: carOfferData.modelCode,
               carBrand_id: companyName._id,
          });
          if (!seriesName) {
               throw new Error(
                    `Car series with modelCode ${carOfferData.modelCode} not found`
               );
          }

          const yearModel = carOfferData.yearModel;

          const existingCarOffer = await carOfferModel.findOne({
               leaseType_id: leaseTypes,
               carBrand_id: companyName._id,
               carSeries_id: seriesName._id,
               yearModel: yearModel,
          });

          if (existingCarOffer) {
               // car offer already exists with the given calculationNo, update the offer
               const existingOffer = existingCarOffer.offers.find(
                    (offer) =>
                         offer.calculationNo.toString() ===
                         carOfferData.calculationNo
               );
               if (existingOffer) {
                    // update only the changed values
                    existingOffer.duration = carOfferData.duration;
                    existingOffer.annualMileage = carOfferData.annualMileage;
                    existingOffer.monthlyCost = carOfferData.monthlyCost;
               } else {
                    // add a new offer object with the same calculationNo
                    existingCarOffer.offers.push({
                         duration: carOfferData.duration,
                         annualMileage: carOfferData.annualMileage,
                         monthlyCost: carOfferData.monthlyCost,
                         calculationNo: carOfferData.calculationNo,
                    });
               }

               await existingCarOffer.save();
               return {
                    message: 'Car offer updated successfully',
                    data: existingCarOffer,
               };
          } else {
               // create new car offer with a new group
               const newCarOffer = await carOfferModel.create({
                    carBrand_id: companyName._id,
                    carSeries_id: seriesName._id,
                    leaseType_id: leaseTypes,
                    yearModel: yearModel,
                    offers: [
                         {
                              duration: carOfferData.duration,
                              annualMileage: carOfferData.annualMileage,
                              monthlyCost: carOfferData.monthlyCost,
                              calculationNo: carOfferData.calculationNo,
                         },
                    ],
                    deals: carOfferData.deals,
                    validFrom: carOfferData.validFrom,
                    validTo: carOfferData.validTo,
               });
               return newCarOffer;
          }
     } catch (error) {
          console.log(error);
          throw new Error('Failed to create/update car offer.');
     }
};

const getAllOffer = async () => {
     const response = await carOfferModel
          .find()
          .populate(['carBrand_id', 'carSeries_id', 'leaseType_id']);
     return response;
};

const getAllCarWithOffers = async (
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
          const aggregateFilter = [
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
                    $lookup: {
                         from: 'cardetails',
                         let: {
                              carBrandId: '$carBrand_id',
                              carSeriesId: '$carSeries_id',
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
                         as: 'details',
                    },
               },

               {
                    $unwind: '$carBrand',
               },
               {
                    $unwind: '$carSeries',
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
                         'offers.monthlyCost': priceFilter,
                    },
               });
          }

          if (annualMileage) {
               aggregateFilter.push({
                    $match: {
                         'offers.annualMileage': parseInt(annualMileage),
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
                         'details.fuelType': fuelType,
                    },
               });
          }

          if (bodyType) {
               aggregateFilter.push({
                    $match: {
                         'details.bodyType': bodyType,
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

          const response = await carOfferModel.aggregate(aggregateFilter);

          return response;
     } catch (error) {
          console.log(error);
     }
};

const getCount = async () => {
     const counts = await carOfferModel.aggregate([
          {
               $unwind: '$leaseType_id',
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

     const countObject = {
          privateLeaseCount: 0,
          flexiPlanCount: 0,
          businessLeaseCount: 0,
     };

     counts.forEach((count) => {
          if (count._id === 'Private Lease') {
               countObject.privateLeaseCount += count.count;
          } else if (count._id === 'FlexiPlan') {
               countObject.flexiPlanCount += count.count;
          } else if (count._id === 'Business Lease') {
               countObject.businessLeaseCount += count.count;
          }
     });

     return countObject;
};

const getSingleCar = async (id) => {
     try {
          const carOffer = await carOfferModel
               .findOne({ _id: id })
               .populate('leaseType_id')
               .populate('carBrand_id')
               .populate('carSeries_id');

          if (!carOffer) {
               throw new Error('Car not found');
          }

          //  const { leaseType_id } = car;
          // Retrieve lease type details using leaseType_id from leasetypes collection
          // const leaseType = await leaseTypeModel.findOne({
          //      _id: leaseType_id,
          //      isDeleted: false,
          // });

          const carFeatures = await carFeaturesModel.findOne({
               carBrand_id: carOffer.carBrand_id,
               carSeries_id: carOffer.carSeries_id,
               yearModel: carOffer.yearModel,
          });

          const carDetails = await carDetailsModel.findOne({
               carBrand_id: carOffer.carBrand_id,
               carSeries_id: carOffer.carSeries_id,
               yearModel: carOffer.yearModel,
          });

          const result = {
               carOffer,
               carDetails,
               features: carFeatures || [],
          };

          return result;
     } catch (error) {
          console.log(error);
          throw error;
     }
};

const updateCar = async (
     id,
     carDetailsData,
     carFeaturesData,
     inventoryData,
     carOffersData
) => {
     try {
          // Validate input
          if (!carDetailsData || !carFeaturesData || !inventoryData) {
               throw new Error(
                    'carDetails, carFeatures, and carOffers must be provided'
               );
          }

          // Update car in CarFeatures collection
          const carDetails = await carOfferModel.findById(id);

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

          const updatedCarFeatures = await carFeaturesModel.findOneAndUpdate(
               filter,
               updateFields,
               { new: true }
          );

          // update the car in the CarOffers collection
          const updatedInventoryData = await carDetailsModel.findOneAndUpdate(
               filter,
               inventoryData,
               { new: true }
          );

          const updatedCarOffers = [];

          for (const offer of carOffersData.offers) {
               const filter = {
                    _id: id,
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
               updatedCarOffers.push(updatedOffer);
          }

          /* 

      // Update car in CarOffers collection
          const filters = {
               _id: id,
          };

          const update = {
               $set: {},
               arrayFilters: [],
          };

          for (const offer of carOffersData.offers) {
               const existingOffer = await carOfferModel.findOne({
                    ...filters,
                    'offers.calculationNo': offer.calculationNo,
               });

               if (existingOffer) {
                    update.$set['offers.$[o].duration'] = offer.duration;
                    update.$set['offers.$[o].annualMileage'] =
                         offer.annualMileage;
                    update.$set['offers.$[o].monthlyCost'] = offer.monthlyCost;
                    update.arrayFilters.push({
                         'o.calculationNo': offer.calculationNo,
                    });
               } else {
                    update.$push = { offers: offer };
               }
          }
             

          Example of update object
             {
               '$set': {
                         'offers.$[o].duration': '61',
                         'offers.$[o].annualMileage': '25001',
                         'offers.$[o].monthlyCost': '3801'
             },
              arrayFilters: [ { 'o.calculationNo': '1248516' } ]
             }

*/

          // Return the updated car object
          return {
               carOffers: updatedCarOffers,
               carFeatures: updatedCarFeatures,
               inventoryData: updatedInventoryData,
          };
     } catch (error) {
          console.error('Error in updating car:', error);
          throw new Error(error.message);
     }
};
export const carOfferService = {
     createCarOffer,
     getAllOffer,
     getCount,
     getAllCarWithOffers,
     getSingleCar,
     updateCar,
};
