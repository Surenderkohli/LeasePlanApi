import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';
import carDetailModel from '../models/carDetails.js';
import carFeatureModel from '../models/carFeatures.js';



// Function to convert "dd/mm/yy" format to "YYYY-MM-DD"
function convertDateToYYYYMMDD(dateString) {
     const parts = dateString.split('/');
     if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1];
          const year = `20${parts[2]}`; // Assuming the year is in "yy" format
          return `${year}-${month}-${day}`;
     }
     throw new Error('Invalid date format. Please use "dd/mm/yy".');
}
const createCarOffer = async (carOfferData) => {
     try {
          let leaseTypes = [];

          if (carOfferData.leaseType && carOfferData.term) {
               const existingLeaseType = await leaseTypeModel.findOne({
                    leaseType: carOfferData.leaseType,
                    term: carOfferData.term,
               });

               if (existingLeaseType) {
                    leaseTypes.push(existingLeaseType);
               } else {
                    const newLeaseType = new leaseTypeModel({
                         leaseType: carOfferData.leaseType,
                         term: carOfferData.term,
                    });
                    const savedLeaseType = await newLeaseType.save();
                    leaseTypes.push(savedLeaseType);
               }
          }

          if (!carOfferData.companyName) {
               throw new Error('Missing companyName');
          }

          let companyName = await carBrandModel.findOne({
               companyName: carOfferData.companyName,
               makeCode: carOfferData.makeCode,
          });

          if (!companyName) {
               // companyName = await carBrandModel.create({
               //      companyName: carOfferData.companyName,
               //      makeCode: carOfferData.makeCode,
               //      leaseType_id: leaseTypes,
               // });
               return {
                    message: `Invalid companyName: ${carOfferData.companyName}`,
                    data: null,
               };
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

          let seriesName = await carSeriesModel.findOne({
               carBrand_id: companyName._id,
               seriesName: carOfferData.seriesName,
               modelCode: carOfferData.modelCode, // Cross-Check modelCode as well
          });

          if (!seriesName) {
               // seriesName = await carSeriesModel.create({
               //      carBrand_id: companyName._id,
               //      leaseType_id: leaseTypes,
               //      seriesName: carOfferData.seriesName,
               //      modelCode: carOfferData.modelCode,
               // });
               return {
                    message: `Invalid seriesName: ${carOfferData.seriesName}`,
                    data: null,
               };
          } else if (leaseTypes.length > 0) {
               const leaseTypeIdsToAdd = leaseTypes
                    .map((leaseType) => leaseType._id)
                    .filter(
                         (leaseTypeId) =>
                              !seriesName.leaseType_id.includes(leaseTypeId)
                    );

               if (leaseTypeIdsToAdd.length > 0) {
                    seriesName.leaseType_id = [
                         ...seriesName.leaseType_id,
                         ...leaseTypeIdsToAdd,
                    ];
                    await seriesName.save();
               }
          }

          const existingCarOffer = await carOfferModel.findOne({
               carBrand_id: companyName._id,
               carSeries_id: seriesName._id,
               leaseType: carOfferData.leaseType,
               term: carOfferData.term,
          });

          if (existingCarOffer) {
               const existingOffer = existingCarOffer.offers.find(
                    (offer) =>
                         // offer.leaseType === carOfferData.leaseType &&
                         // offer.term === carOfferData.term &&
                         offer.calculationNo.toString() ===
                         carOfferData.calculationNo
               );

               if (existingOffer) {
                    existingOffer.duration = carOfferData.duration;
                    existingOffer.annualMileage = carOfferData.annualMileage;
                    existingOffer.monthlyCost = carOfferData.monthlyCost;
                    existingOffer.bestDeals = carOfferData.bestDeals
                         ? carOfferData.bestDeals
                         : 'No';
                    existingOffer.validFrom = convertDateToYYYYMMDD(carOfferData.validFrom)
                    existingOffer.validTo = convertDateToYYYYMMDD(carOfferData.validTo)

                    // Call isExpired here to update expired field
                    existingCarOffer.isExpired();
               } else {
                    const newOffer = {
                         duration: carOfferData.duration,
                         annualMileage: carOfferData.annualMileage,
                         monthlyCost: carOfferData.monthlyCost,
                         calculationNo: carOfferData.calculationNo,
                         bestDeals: carOfferData.bestDeals
                              ? carOfferData.bestDeals
                              : 'No',
                         validFrom : convertDateToYYYYMMDD(carOfferData.validFrom),
                         validTo : convertDateToYYYYMMDD(carOfferData.validTo)
                    };

                    if (carOfferData.leaseType && carOfferData.term) {
                         newOffer.leaseType = carOfferData.leaseType;
                         newOffer.term = carOfferData.term;
                    }

                    existingCarOffer.offers.push(newOffer);
               }

               await existingCarOffer.save();
               return {
                    message: 'Car offer updated successfully',
                    data: existingCarOffer,
               };
          } else {
               const newCarOffer = await carOfferModel.create({
                    carBrand_id: companyName._id,
                    carSeries_id: seriesName._id,
                    leaseType: carOfferData.leaseType,
                    term: carOfferData.term,
                    offers: [
                         {
                              duration: carOfferData.duration,
                              annualMileage: carOfferData.annualMileage,
                              monthlyCost: carOfferData.monthlyCost,
                              calculationNo: carOfferData.calculationNo,
                              bestDeals: carOfferData.bestDeals
                                   ? carOfferData.bestDeals
                                   : 'No',
                              validFrom:  convertDateToYYYYMMDD(carOfferData.validFrom),
                              validTo:  convertDateToYYYYMMDD(carOfferData.validTo),
                         },
                    ],

               });

               // Call isExpired here to update expired field
               newCarOffer.isExpired();
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
          .populate(['carBrand_id', 'carSeries_id']);
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
                         from: 'cardetails',
                         let: {
                              carBrandId: '$carBrand_id',
                              carSeriesId: '$carSeries_id',
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
                                                  //      $eq: [
                                                  //           '$yearModel',
                                                  //           '$$yearModel',
                                                  //      ],
                                                  // },
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

const getCount = async () => {
     const counts = await carOfferModel.aggregate([
          {
               $group: {
                    _id: {
                         leaseType: '$leaseType',
                         term: '$term',
                    },
                    count: { $sum: 1 },
               },
          },
     ]);

     let totalInventoryCount = 0;

     const countObject = {
          privateLeaseCount: {
               shortTerm: 0,
               longTerm: 0,
               total: 0,
          },

          businessLeaseCount: {
               shortTerm: 0,
               longTerm: 0,
               total: 0,
          },
     };

     counts.forEach((count) => {
          if (count._id.leaseType === 'Private Lease') {
               if (count._id.term === 'Short Term') {
                    countObject.privateLeaseCount.shortTerm += count.count;
                    countObject.privateLeaseCount.total += count.count;
               } else if (count._id.term === 'Long Term') {
                    countObject.privateLeaseCount.longTerm += count.count;
                    countObject.privateLeaseCount.total += count.count;
               }
          } else if (count._id.leaseType === 'Business Lease') {
               if (count._id.term === 'Short Term') {
                    countObject.businessLeaseCount.shortTerm += count.count;
                    countObject.businessLeaseCount.total += count.count;
               } else if (count._id.term === 'Long Term') {
                    countObject.businessLeaseCount.longTerm += count.count;
                    countObject.businessLeaseCount.total += count.count;
               }
          }
     });

     if (countObject.businessLeaseCount.total === 0) {
          countObject.businessLeaseCount = {
               shortTerm: 0,
               longTerm: 0,
               total: 0,
          };
     }

     totalInventoryCount =
          countObject.privateLeaseCount.total +
          countObject.businessLeaseCount.total;

     return {
          ...countObject,
          totalInventoryCount,
     };
};

const getSingleCar = async (id, duration, annualMileage) => {
     try {
          // Retrieve the car offer based on the provided id
          const carOffer = await carOfferModel
               .findOne({ _id: id })
               .populate({
                    path: 'carBrand_id',
                    select: 'makeCode companyName',
               })
               .populate({
                    path: 'carSeries_id',
                    select: 'modelCode seriesName',
               });

          if (!carOffer) {
               throw new Error('Car not found');
          }

          const carFeatures = await carFeatureModel.findOne({
               carBrand_id: carOffer.carBrand_id,
               carSeries_id: carOffer.carSeries_id,
          });

          const carDetails = await carDetailModel.findOne({
               carBrand_id: carOffer.carBrand_id,
               carSeries_id: carOffer.carSeries_id,
          });

          const result = {
               carOffer,
               carDetails,
               carFeatures: carFeatures || [],
          };

          if (duration && annualMileage) {
               // If both duration and annualMileage are provided, find the matching offer
               const selectedOffer = carOffer.offers.find(
                    (offer) =>
                         offer.duration === Number(duration) &&
                         offer.annualMileage === Number(annualMileage)
               );

               if (!selectedOffer) {
                    throw new Error('Offer not found');
               }

               result.monthlyCost = selectedOffer.monthlyCost;
          } else if (duration) {
               // If only duration is provided, return all associated annualMileage values
               result.availableMileages = carOffer.offers
                    .filter((offer) => offer.duration === Number(duration))
                    .map((offer) => offer.annualMileage);
          }

          return result;
     } catch (error) {
          console.log(error);
          throw error;
     }
};

const getSingleCarV2 = async (id, duration, annualMileage) => {
     try {
          const carOffer = await carOfferModel
               .findOne({ _id: id })
               .populate('carBrand_id')
               .populate('carSeries_id');

          if (!carOffer) {
               throw new Error('Car not found');
          }

          let result = {
               carOffer,
               carDetails: null,
               features: [],
               monthlyCost: [],
          };

          if (duration) {
               const selectedOffers = carOffer.offers.filter(
                    (offer) => offer.duration === Number(duration)
               );

               if (selectedOffers.length === 0) {
                    throw new Error('Offer not found');
               }

               if (annualMileage) {
                    const selectedOffer = selectedOffers.find(
                         (offer) =>
                              offer.annualMileage === Number(annualMileage)
                    );

                    if (!selectedOffer) {
                         throw new Error('Offer not found');
                    }

                    result.monthlyCost.push({
                         annualMileage: selectedOffer.annualMileage,
                         monthlyCost: selectedOffer.monthlyCost,
                    });
               } else {
                    result.monthlyCost = selectedOffers.map((offer) => ({
                         annualMileage: offer.annualMileage,
                         monthlyCost: offer.monthlyCost,
                    }));
               }
          }

          const carFeatures = await carFeatureModel.findOne({
               carBrand_id: carOffer.carBrand_id,
               carSeries_id: carOffer.carSeries_id,
          });

          const carDetails = await carDetailModel.findOne({
               carBrand_id: carOffer.carBrand_id,
               carSeries_id: carOffer.carSeries_id,
          });

          result.carDetails = carDetails;
          result.features = carFeatures || [];

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
     carOffersData
) => {
     try {
          // Validate input
          if (!carDetailsData || !carFeaturesData || !carOffersData) {
               throw new Error(
                    'carDetails, carFeatures, and carOffers must be provided'
               );
          }

          // Update car in CarFeatures collection
          const carOffer = await carOfferModel.findById(id);

          const { carBrand_id, carSeries_id } = carOffer;

          //// Update carDetails
          const carDetailsFilter = {
               carBrand_id,
               carSeries_id,
          };

          const updatedCarDetails = await carDetailModel.findOneAndUpdate(
               carDetailsFilter,
               { ...carDetailsData },
               { new: true }
          );

          //// Update carFeatures
          const carFeaturesFilter = {
               carBrand_id,
               carSeries_id,
          };
          const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
               carFeaturesFilter,
               { ...carFeaturesData },
               { new: true }
          );

          //// Update inventory
          const updatedCarOffers = [];

          if (carOffersData.offers) {
               const existingOffers = await carOfferModel.findById(
                    id,
                    'offers'
               );

               for (const offer of carOffersData.offers) {
                    const existingOffer = existingOffers.offers.find(
                         (o) =>
                              o.calculationNo.toString() === offer.calculationNo
                    );

                    if (existingOffer) {
                         // If the offer exists, update it
                         const offerFilter = {
                              _id: id,
                              'offers.calculationNo': offer.calculationNo,
                         };

                         const offerUpdate = {
                              $set: {
                                   'offers.$.duration': offer.duration,
                                   'offers.$.annualMileage':
                                        offer.annualMileage,
                                   'offers.$.monthlyCost': offer.monthlyCost,
                                   'offers.$.bestDeals': offer.bestDeals,
                              },
                         };

                         const updatedOffer =
                              await carOfferModel.findOneAndUpdate(
                                   offerFilter,
                                   offerUpdate,
                                   { new: true }
                              );
                         updatedCarOffers.push(updatedOffer);
                    } else {
                         // If the offer does not exist, add it to the array
                         const newOffer = {
                              calculationNo: offer.calculationNo,
                              duration: offer.duration,
                              annualMileage: offer.annualMileage,
                              monthlyCost: offer.monthlyCost,
                              bestDeals: offer.bestDeals,
                         };
                         existingOffers.offers.push(newOffer);

                         const updatedOffer =
                              await carOfferModel.findByIdAndUpdate(
                                   id,
                                   { offers: existingOffers.offers },
                                   { new: true }
                              );
                         updatedCarOffers.push(updatedOffer);
                    }
               }
          }

          // Return the updated car object
          return {
               carOffers: updatedCarOffers,
               carFeatures: updatedCarFeatures,
               inventoryData: updatedCarDetails,
          };
     } catch (error) {
          console.error('Error in updating car:', error);
          throw new Error(error.message);
     }
};

const updateCarV2 = async (
     id,
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

          // Update car in CarFeatures collection
          const carOffer = await carOfferModel.findById(id);

          const { carBrand_id, carSeries_id } = carOffer;

          //////////////////////////////// Update carDetails
          const carDetailsFilter = {
               carBrand_id,
               carSeries_id,
          };

          const updatedCarDetails = await carDetailModel.findOneAndUpdate(
               carDetailsFilter,
               { ...carDetailsData },
               { new: true }
          );

          //////////////////////////////// Update carFeatures
          const carFeaturesFilter = {
               carBrand_id,
               carSeries_id,
          };
          const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
               carFeaturesFilter,
               { ...carFeaturesData },
               { new: true }
          );

          //////////////////////////////// Update categories and features
          if (carFeaturesData.categories) {
               // Remove null categories
               updatedCarFeatures.categories =
                    updatedCarFeatures.categories.filter(
                         (category) => category !== null
                    );

               for (const newCategory of carFeaturesData.categories) {
                    if (!newCategory) {
                         continue; // Skip null categories
                    }

                    const existingCategory = updatedCarFeatures.categories.find(
                         (category) =>
                              category.categoryCode === newCategory.categoryCode
                    );

                    if (existingCategory) {
                         // If the category exists, replace its features with the new features
                         existingCategory.features = newCategory.features;
                    } else {
                         // If the category does not exist, add it to the array
                         updatedCarFeatures.categories.push(newCategory);
                    }
               }
          }

          // Save the updated car features
          await updatedCarFeatures.save();

          //////////////////////////////// Update inventory
          const existingOffers = await carOfferModel.findById(id, 'offers');

          if (carOffersData.offers) {
               existingOffers.offers = carOffersData.offers;
          } else {
               // existingOffers.offers = []; // Set empty offers array
          }

          // Save the updated offers array
          await existingOffers.save();

          // Prepare offers response
          let carOffersResponse;

          if (existingOffers.offers.length > 0) {
               carOffersResponse = existingOffers.offers;
          } else {
               carOffersResponse = 'No offers available';
          }

          // Prepare car features response
          let carFeaturesResponse;
          if (updatedCarFeatures.categories.length > 0) {
               carFeaturesResponse = updatedCarFeatures;
          } else {
               carFeaturesResponse = 'No car features available';
          }

          // Return the updated car object
          return {
               carOffers: carOffersResponse,
               carFeatures: carFeaturesResponse,
               inventoryData: updatedCarDetails,
          };
     } catch (error) {
          console.error('Error in updating car:', error);
          throw new Error(error.message);
     }
};

const updateCarV3 = async (
     id,
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

          // Update car in CarFeatures collection
          const carOffer = await carOfferModel.findById(id);

          const { carBrand_id, carSeries_id, leaseType, term } = carOffer;

          //////////////////////////////// Update carDetails
          const carDetailsFilter = {
               carBrand_id,
               carSeries_id,
          };

          const updatedCarDetails = await carDetailModel.findOneAndUpdate(
               carDetailsFilter,
               { ...carDetailsData },
               { new: true }
          );

          //////////////////////////////// Update carFeatures
          const carFeaturesFilter = {
               carBrand_id,
               carSeries_id,
          };
          const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
               carFeaturesFilter,
               { ...carFeaturesData },
               { new: true }
          );

          //////////////////////////////// Update categories and features
          if (carFeaturesData.categories) {
               // Remove null categories
               updatedCarFeatures.categories =
                    updatedCarFeatures.categories.filter(
                         (category) => category !== null
                    );

               for (const newCategory of carFeaturesData.categories) {
                    if (!newCategory) {
                         continue; // Skip null categories
                    }

                    const existingCategory = updatedCarFeatures.categories.find(
                         (category) =>
                              category.categoryCode === newCategory.categoryCode
                    );

                    if (existingCategory) {
                         // If the category exists, replace its features with the new features
                         existingCategory.features = newCategory.features;
                    } else {
                         // If the category does not exist, add it to the array
                         updatedCarFeatures.categories.push(newCategory);
                    }
               }
          }

          // Save the updated car features
          await updatedCarFeatures.save();

          //////////////////////////////// Update carOffers
          const existingOffers = await carOfferModel.findById(id, 'offers');

          // Check if leaseType and term are provided
          if (carOffersData.leaseType && carOffersData.term) {
               // Create a new document in the carOffers collection
               const newCarOffers = {
                    carBrand_id,
                    carSeries_id,
                    leaseType: carOffersData.leaseType,
                    term: carOffersData.term,
                    offers: carOffersData.offers,
               };

               await carOfferModel.create(newCarOffers);
          } else {
               // Update the existing offers with the provided offers data
               if (existingOffers) {
                    existingOffers.offers = carOffersData.offers || [];
                    await existingOffers.save();
               }
          }

          // Prepare offers response
          let carOffersResponse;

          if (existingOffers.offers.length > 0) {
               carOffersResponse = existingOffers.offers;
          } else {
               carOffersResponse = 'No offers available';
          }

          // Prepare car features response
          let carFeaturesResponse;
          if (updatedCarFeatures.categories.length > 0) {
               carFeaturesResponse = updatedCarFeatures;
          } else {
               carFeaturesResponse = 'No car features available';
          }

          // Return the updated car object
          return {
               carOffers: carOffersResponse,
               carFeatures: carFeaturesResponse,
               inventoryData: updatedCarDetails,
          };
     } catch (error) {
          console.error('Error in updating car:', error);
          throw new Error(error.message);
     }
};

const getDeals = async (query) => {
     try {
          const carOffers = await carOfferModel
               .find({
                    'offers.bestDeals': { $regex: /^yes$/i }, // Case-insensitive matching
                    ...query,
               })
               .populate(['carBrand_id', 'carSeries_id']);

          const offersWithBestDeals = carOffers
               .map((carOffer) => {
                    const offers = carOffer.offers.filter(
                         (offer) => /^yes$/i.test(offer.bestDeals) // Case-insensitive matching
                    );
                    return {
                         ...carOffer.toObject(),
                         offers,
                         totalBestDeals: offers.length,
                    };
               })
               .filter((carOffer) => carOffer.offers.length > 0);

          const totalBestDeals = offersWithBestDeals.reduce(
               (acc, carOffer) => acc + carOffer.totalBestDeals,
               0
          );

          const result = {
               carOffers: offersWithBestDeals,
               totalBestDeals,
          };

          // Retrieve car details for each car offer
          const carsWithDetails = [];
          for (const carOffer of offersWithBestDeals) {
               const car = carOffer;
               const carDetails = await carDetailModel.find({
                    carBrand_id: car.carBrand_id,
                    carSeries_id: car.carSeries_id,
               });

               if (carDetails.length > 0) {
                    car.details = carDetails[0]; // Assuming there is only one matching car detail
                    carsWithDetails.push(car);
               }
          }

          result.carOffers = carsWithDetails;

          return result;
     } catch (error) {
          throw new Error(error.message);
     }
};

const filterCars = async (filterOptions) => {
     try {
          const {
               leaseType,
               term,
               carBrand_id,
               carSeries_id,
               priceMin,
               priceMax,
               annualMileage,
               bodyType,
               querySearch,
          } = filterOptions;

          const query = {};

          if (leaseType) {
               query['leaseType_id.leaseType'] = leaseType;
          }

          if (term) {
               query['leaseType_id.term'] = term;
          }

          // if (monthlyCost) {
          //      query['offers.monthlyCost'] = monthlyCost;
          // }

          if (priceMin || priceMax) {
               query['offers.monthlyCost'] = {};

               if (priceMin) {
                    query['offers.monthlyCost']['$gte'] = priceMin;
               }

               if (priceMax) {
                    query['offers.monthlyCost']['$lte'] = priceMax;
               }
          }

          if (annualMileage) {
               query['offers.annualMileage'] = annualMileage;
          }

          if (carBrand_id) {
               query.carBrand_id = carBrand_id;
          }

          if (carSeries_id) {
               query.carSeries_id = carSeries_id;
          }

          if (querySearch) {
               const carBrands = await carBrandModel.find({
                    companyName: { $regex: querySearch, $options: 'i' },
               });

               const carBrandIds = carBrands.map((brand) => brand._id);

               const carSeries = await carSeriesModel.find({
                    seriesName: { $regex: querySearch, $options: 'i' },
               });

               const carSeriesIds = carSeries.map((series) => series._id);

               query.$or = [
                    { carBrand_id: { $in: carBrandIds } },
                    { carSeries_id: { $in: carSeriesIds } },
               ];
          }

          const carOffers = await carOfferModel
               .find({
                    ...query,
                    isDeleted: false, //  line to filter based on isDeleted property
               })
               .populate({
                    path: 'carBrand_id',
                    select: 'makeCode companyName',
               })
               .populate({
                    path: 'carSeries_id',
                    select: 'modelCode seriesName',
               });

          const cars = [];

          for (const carOffer of carOffers) {
               const car = carOffer.toObject();
               const carDetails = await carDetailModel.find({
                    carBrand_id: car.carBrand_id,
                    carSeries_id: car.carSeries_id,
               });
               // .populate('carBrand_id')
               // .populate('carSeries_id');

               car.details = carDetails[0]; // Assuming there is only one matching car detail

               if (!leaseType || carOffer.leaseType === leaseType) {
                    if (!term || carOffer.term === term) {
                         cars.push(car);
                    }
               }
          }

          if (bodyType) {
               const carsWithBodyType = cars.filter(
                    (car) => car.details.bodyType === bodyType
               );
               return carsWithBodyType;
          }w

          // if (fuelType) {
          //      const carsWithFuelType = cars.filter(
          //           (car) => car.details.fuelType === fuelType
          //      );
          //      return carsWithFuelType;
          // }

          // if (fuelType && bodyType) {
          //      const carsWithFuelAndBodyType = cars.filter(
          //           (car) =>
          //                car.details.fuelType === fuelType &&
          //                car.details.bodyType === bodyType
          //      );
          //      return carsWithFuelAndBodyType;
          // }

          // if (fuelType && bodyType) {
          //      const carsWithFuelAndBodyType = cars.filter(
          //           (car) =>
          //                car.details.fuelType === fuelType &&
          //                car.details.bodyType === bodyType
          //      );
          //      return carsWithFuelAndBodyType;
          // } else if (fuelType) {
          //      const carsWithFuelType = cars.filter(
          //           (car) => car.details.fuelType === fuelType
          //      );
          //      return carsWithFuelType;
          // } else if (bodyType) {
          //      const carsWithBodyType = cars.filter(
          //           (car) => car.details.bodyType === bodyType
          //      );
          //      return carsWithBodyType;
          // }

          return cars;
     } catch (error) {
          throw error;
     }
};

const deletedCarV2 = async (id) => {
     try {
          const car = await carOfferModel.findOne({ _id: id });
          if (!car) {
               throw new Error('Car not found');
          }

          const otherCars = await carOfferModel.find({
               makeCode: car.makeCode,
               modelCode: car.modelCode,
               carBrand_id: car.carBrand_id,
               carSeries_id: car.carSeries_id,
               _id: { $ne: id },
          });

          const sameCarExists = otherCars.some((otherCar) => {
               return (
                    otherCar.leaseType !== car.leaseType ||
                    otherCar.term !== car.term
               );
          });

          if (!sameCarExists) {
               // Delete associated car offers
               await carDetailModel.deleteOne({
                    carBrand_id: car.carBrand_id,
                    carSeries_id: car.carSeries_id,
               });

               // Delete associated car features
               await carFeatureModel.deleteOne({
                    carBrand_id: car.carBrand_id,
                    carSeries_id: car.carSeries_id,
               });

               // Delete associated car series if no other car offers exist
               const otherCarOffersExist = await carOfferModel.exists({
                    carBrand_id: car.carBrand_id,
                    carSeries_id: car.carSeries_id,
                    _id: { $ne: id },
               });

               if (!otherCarOffersExist) {
                    await carSeriesModel.deleteOne({
                         carBrand_id: car.carBrand_id,
                         carSeries_id: car.carSeries_id,
                    });
               }
          }

          await car.remove();
          return car;
     } catch (error) {
          console.log(error);
          throw error;
     }
};

const getAllCarWithoutOffers = async () => {
     try {
          const carDetails = await carDetailModel.find({}, '-_id');
          const carFeatures = await carFeatureModel.find({}, '-_id');
          const carOffers = await carOfferModel.find(
               {},
               'carBrand_id carSeries_id'
          );

          const carDetailsIds = carDetails.map(
               (detail) => `${detail.carBrand_id}_${detail.carSeries_id}`
          );
          const carFeaturesIds = carFeatures.map(
               (feature) => `${feature.carBrand_id}_${feature.carSeries_id}`
          );
          const carOffersIds = carOffers.map(
               (offer) => `${offer.carBrand_id}_${offer.carSeries_id}`
          );

          const carsWithoutOffersIds = carDetailsIds.filter(
               (id) => !carOffersIds.includes(id) && carFeaturesIds.includes(id)
          );

          const carsWithoutOffers = carDetails.filter((detail) => {
               const carId = `${detail.carBrand_id}_${detail.carSeries_id}`;
               return carsWithoutOffersIds.includes(carId);
          });

          const carsWithoutOffersWithFeatures = carsWithoutOffers.map((car) => {
               const carFeature = carFeatures.find(
                    (feature) =>
                         feature.carBrand_id.toString() ===
                              car.carBrand_id.toString() &&
                         feature.carSeries_id.toString() ===
                              car.carSeries_id.toString()
               );

               return {
                    carDetails: car,
                    carFeature: carFeature || {}, // Set empty object if carFeature is undefined
               };
          });

          return carsWithoutOffersWithFeatures;
     } catch (error) {
          throw new Error('Failed to get offers without cars');
     }
};


// Function to edit an offer by _id
const editOffer = async (offerId, newData) => {
     try {
          const updateFields = {};

          if (newData.duration) updateFields["offers.$.duration"] = newData.duration;
          if (newData.annualMileage) updateFields["offers.$.annualMileage"] = newData.annualMileage;
          if (newData.monthlyCost) updateFields["offers.$.monthlyCost"] = newData.monthlyCost;
          if (newData.validFrom) updateFields["offers.$.validFrom"] = newData.validFrom;
          if (newData.validTo) updateFields["offers.$.validTo"] = newData.validTo;

          const carOffer = await carOfferModel.findOneAndUpdate(
              { "offers._id": offerId },
              { "$set": updateFields },
              { new: true }
          );

          if (!carOffer) {
               throw new Error('Offer not found');
          }

          return carOffer;
     } catch (error) {
          throw error;
     }
};
// Function to delete an offer
const deleteOffer = async (offerId) => {
     try {
          const carOffer = await carOfferModel.findOneAndUpdate(
              { "offers._id": offerId },
              { $pull: { "offers": { "_id": offerId } } },
              { new: true }
          );

          if (!carOffer) {
               throw new Error('Offer not found');
          }

          return carOffer;
     } catch (error) {
          throw error;
     }
};


export const carOfferService = {
     createCarOffer,
     getAllOffer,
     getCount,
     getAllCarWithOffers,
     getSingleCar,
     updateCar,
     getDeals,
     filterCars,
     getAllCarWithOffersV2,
     updateCarV2,
     deletedCarV2,
     getAllCarWithoutOffers,
     getSingleCarV2,
     updateCarV3,
     editOffer,
     deleteOffer
};
