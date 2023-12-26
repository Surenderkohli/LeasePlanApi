import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';
import carDetailModel from '../models/carDetails.js';
import carFeatureModel from '../models/carFeatures.js';
import mongoose from 'mongoose';

const convertAndCheckDate = async (dateString) => {
     try {
          const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;

          const match = dateString.match(dateRegex);

          if (match) {
               const day = parseInt(match[1], 10);
               const month = parseInt(match[2], 10) - 1;
               const year = parseInt(match[3], 10) + 2000;
               
               const date = new Date(Date.UTC(year, month, day, 0, 0, 0)); //Date 2023-09-15T00:00:00.000Z
              // console.log('date.toISOString()',date.toISOString());
               //date.toISOString() 2023-09-21T00:00:00.000Z

               return {
                    date: date.toISOString(), // Store as UTC ISO string
               };
          } else {
               throw new Error(`Invalid date format: ${dateString}`);
          }
     } catch (error) {
          throw new Error(`Error processing date: ${error.message}`);
     }
};

const createCarOffer = async (carOfferData) => {
     try {
          let leaseTypes = [];

               const currentDate = new Date();
          const validFromResult = await convertAndCheckDate(carOfferData.validFrom);

          const validToResult = await convertAndCheckDate(carOfferData.validTo);


          const validFrom = new Date(validFromResult.date);
          const validTo = new Date(validToResult.date);

          const isSameYear = currentDate.getUTCFullYear() === validTo.getUTCFullYear();
          const isSameMonth = currentDate.getUTCMonth() === validTo.getUTCMonth();
          const isSameDay = currentDate.getUTCDate() === validTo.getUTCDate();

          const expired = currentDate >= validTo && !(isSameYear && isSameMonth && isSameDay);


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
                    existingOffer.validFrom = validFrom
                    existingOffer.validTo = validTo,
                    existingOffer.expired= expired

               } else {
                    const newOffer = {
                         duration: carOfferData.duration,
                         annualMileage: carOfferData.annualMileage,
                         monthlyCost: carOfferData.monthlyCost,
                         calculationNo: carOfferData.calculationNo,
                         bestDeals: carOfferData.bestDeals
                              ? carOfferData.bestDeals
                              : 'No',
                          validFrom :validFrom,
                          validTo : validTo,
                          expired: expired,

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
                              validFrom:  validFrom,
                              validTo:  validTo,
                              expired: expired,
                         },
                    ],

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
          .populate(['carBrand_id', 'carSeries_id']);
     return response;
};

const filterOffersDirect = (offers, query) => {
     const { calculationNo, makeCode, modelCode } = query;

     return offers.filter((offer) => {
          return (!calculationNo || offer.offers.some(o => o.calculationNo == calculationNo)) &&
              (!makeCode || offer.makeCode == makeCode) &&
              (!modelCode || offer.modelCode == modelCode);
     });
};

const getOfferById = async (id) => {
     try {
          const allDocuments = await carOfferModel.find({}); // Get all documents

          let matchingOffers = [];

          allDocuments.forEach(document => {
               const matchingOffer = document.offers.find(offer => offer._id.toString() == id);
               

               if (matchingOffer) {
                    matchingOffers.push(matchingOffer);
               }
          });

          if (matchingOffers.length === 0) {
               throw new Error('Offer by id not found');
          }

          return matchingOffers[0];
     } catch (error) {
          console.log(error);
          throw error;
     }
}

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
          const carOffer = await carOfferModel
              .findOne({ _id: id })
              .populate('carBrand_id')
              .populate('carSeries_id');

          if (!carOffer) {
               throw new Error('Car not found');
          }

          // Filter out expired offers
          carOffer.offers = carOffer.offers.filter(offer => !offer.expired)

          let result = {
               carOffer,
               carDetails: null,
               // features: [],
               availableMileages: [], // Changed from 'annualMileages'
               durations : [],
               monthlyCost: null,
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
          } else if(annualMileage){
               // If only annualMileage is provided, return all associated durations values
               result.durations = carOffer.offers.filter((offer) =>offer.annualMileage === Number(annualMileage)).map((offer)=>offer.duration)
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
          result.carFeatures = carFeatures || [];

          return result;
     } catch (error) {
          console.log(error);
          throw error;
     }
};

const getSingleCarDashboard = async (id, duration, annualMileage) => {
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
               availableMileages: [], // Changed from 'annualMileages'
               monthlyCost: null,
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
                         (offer) =>
                         {
                              return /^yes$/i.test(offer.bestDeals) && !offer.expired; // Check for bestDeals and expired
                         } // Case-insensitive matching
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

const editOffer = async (offerId, newData) => {
     try {
          const updateFields = {};

          const fieldMappings = {
               duration: "offers.$.duration",
               annualMileage: "offers.$.annualMileage",
               monthlyCost: "offers.$.monthlyCost",
               validFrom: "offers.$.validFrom",
               validTo: "offers.$.validTo",
               bestDeals: "offers.$.bestDeals",
          };

          for (const [newDataKey, updateField] of Object.entries(fieldMappings)) {
               if (newData[newDataKey]) {
                    if (newDataKey === 'validFrom' || newDataKey === 'validTo') {
                         const dateResult = await convertAndCheckDate(newData[newDataKey]);
                         updateFields[updateField] = new Date(dateResult.date);
                    } else {
                         updateFields[updateField] = newData[newDataKey];
                    }
               }
          }

          if (newData.validTo) {
               const validToResult = await convertAndCheckDate(newData.validTo);
               const validToParsed = new Date(validToResult.date);
               const currentDate = new Date();

               const isSameYear = currentDate.getUTCFullYear() === validToParsed.getUTCFullYear();
               const isSameMonth = currentDate.getUTCMonth() === validToParsed.getUTCMonth();
               const isSameDay = currentDate.getUTCDate() === validToParsed.getUTCDate();

               const expired = currentDate >= validToParsed && !(isSameYear && isSameMonth && isSameDay);
               updateFields["offers.$.expired"] = expired;
          }

          if (newData.validFrom) {
               const validFromResult = await convertAndCheckDate(newData.validFrom);
               const validFromParsed = new Date(validFromResult.date);
               updateFields["offers.$.validFrom"] = validFromParsed;
          }

          const carOffer = await carOfferModel.findOneAndUpdate(
              { "offers._id": offerId },
              { $set: updateFields },
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


// Function to edit an offer by _id
// const editOffer = async (offerId, newData) => {
//      try {
//           const updateFields = {};
//
//           if (newData.duration) updateFields["offers.$.duration"] = newData.duration;
//           if (newData.annualMileage) updateFields["offers.$.annualMileage"] = newData.annualMileage;
//           if (newData.monthlyCost) updateFields["offers.$.monthlyCost"] = newData.monthlyCost;
//           if (newData.validFrom) {
//                const validFromResult = await convertAndCheckDate(newData.validFrom);
//                const validFromParsed = new Date(validFromResult.date);
//                updateFields["offers.$.validFrom"] = validFromParsed;
//           }
//           if (newData.validTo) {
//                const validToResult = await convertAndCheckDate(newData.validTo);
//                const validToParsed = new Date(validToResult.date);
//                const currentDate = new Date();
//
//                const isSameYear = currentDate.getUTCFullYear() === validToParsed.getUTCFullYear();
//                const isSameMonth = currentDate.getUTCMonth() === validToParsed.getUTCMonth();
//                const isSameDay = currentDate.getUTCDate() === validToParsed.getUTCDate();
//
//                const expired = currentDate >= validToParsed && !(isSameYear && isSameMonth && isSameDay);
//
//                updateFields["offers.$.validTo"] = validToParsed;
//                updateFields["offers.$.expired"] = expired;
//           }
//
//           console.log('validFrom', newData.validFrom);
//           console.log('updatedFields', updateFields);
//
//           const carOffer = await carOfferModel.findOneAndUpdate(
//               { "offers._id": offerId },
//
//               { $set: updateFields },
//               { new: true }
//           );
//           console.log('carOffer', carOffer.offers);
//
//           if (!carOffer) {
//                throw new Error('Offer not found');
//           }
//
//           return carOffer;
//      } catch (error) {
//           throw error;
//      }
// };


// Function to delete an offer
const deleteOffer = async (offerId) => {
     try {
          const carOffer = await carOfferModel.findOneAndUpdate(
              { "offers._id": offerId },
              { $pull: { offers: { _id: offerId } } },
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


const filterCarsV1 = async (filterOptions) => {
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

               if (bodyType) {
                    query['details.bodyType'] = bodyType;
               }

               if (annualMileage) {
                    query['offers.annualMileage'] = annualMileage;
               }

               if (priceMin || priceMax) {
                    query['offers.monthlyCost'] = {};

                    if (priceMin) {
                         query['offers.monthlyCost']['$gte'] = priceMin;
                    }

                    if (priceMax) {
                         query['offers.monthlyCost']['$lte'] = priceMax;
                    }
               }
          } else {
               // Apply global filters if querySearch is not provided
               if (bodyType) {
                    query['details.bodyType'] = bodyType;
               }

               if (annualMileage) {
                    query['offers.annualMileage'] = annualMileage;
               }

               if (priceMin || priceMax) {
                    query['offers.monthlyCost'] = {};

                    if (priceMin) {
                         query['offers.monthlyCost']['$gte'] = priceMin;
                    }

                    if (priceMax) {
                         query['offers.monthlyCost']['$lte'] = priceMax;
                    }
               }
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

               car.details = carDetails[0]; // Assuming there is only one matching car detail

               if (!leaseType || carOffer.leaseType === leaseType) {
                    if (!term || carOffer.term === term) {
                         // Check if any offer for the specified term is expired
                         const hasActiveOffer = carOffer.offers.some(offer => !offer.expired);

                         if (hasActiveOffer) {
                              cars.push(car);
                         }
                    }
               }
          }

          if (bodyType) {
               const carsWithBodyType = cars.filter(
                   (car) => car.details.bodyType === bodyType
               );
               return carsWithBodyType;
          }


          return cars;
     } catch (error) {
          throw error;
     }
};

const filterCarsV2 = async (filterOptions) => {
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

               if (bodyType) {
                    query['details.bodyType'] = bodyType;
               }

               if (annualMileage) {
                    query['offers.annualMileage'] = annualMileage;
               }

               if (priceMin || priceMax) {
                    query['offers.monthlyCost'] = {};

                    if (priceMin) {
                         query['offers.monthlyCost']['$gte'] = priceMin;
                    }

                    if (priceMax) {
                         query['offers.monthlyCost']['$lte'] = priceMax;
                    }
               }
          } else {
               // Apply global filters if querySearch is not provided
               if (bodyType) {
                    query['details.bodyType'] = bodyType;
               }

               if (annualMileage) {
                    query['offers.annualMileage'] = annualMileage;
               }

               if (priceMin || priceMax) {
                    query['offers.monthlyCost'] = {};

                    if (priceMin) {
                         query['offers.monthlyCost']['$gte'] = priceMin;
                    }

                    if (priceMax) {
                         query['offers.monthlyCost']['$lte'] = priceMax;
                    }
               }
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

               car.details = carDetails[0]; // Assuming there is only one matching car detail

               if (!leaseType || carOffer.leaseType === leaseType) {
                    if (!term || carOffer.term === term) {
                         // Check if any offer for the specified term is expired
                         // const hasActiveOffer = carOffer.offers.some(offer => !offer.expired);
                         //
                         // if (hasActiveOffer) {
                         //      cars.push(car);
                         // }

                         cars.push(car)
                    }
               }
          }

          if (bodyType) {
               const carsWithBodyType = cars.filter(
                   (car) => car.details.bodyType === bodyType
               );
               return carsWithBodyType;
          }


          return cars;
     } catch (error) {
          throw error;
     }
};
export const carOfferService = {
     createCarOffer,
     getAllOffer,
     getCount,
     updateCar,
     getDeals,
     deletedCarV2,
     getAllCarWithoutOffers,
     getSingleCar,
     updateCarV3,
     editOffer,
     deleteOffer,
     filterCarsV1,
     filterCarsV2,
     filterOffersDirect,
     getOfferById,
     getSingleCarDashboard
};
