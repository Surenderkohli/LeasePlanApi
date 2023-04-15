import leaseTypeModel from '../models/leaseType.js';
import carBrandModel from '../models/carBrand.js';
import carSeriesModel from '../models/carSeries.js';
import carOfferModel from '../models/carOffer.js';

/* 
const createCarOfferManual = async (carOfferData) => {
  try {
    const leaseType = await leaseTypeModel.findOne({
      leaseType: carOfferData.leaseType,
    });
    if (!leaseType) {
      throw new Error(`Lease type ${carOfferData.leaseType} not found`);
    }

    const companyName = await carBrandModel.findOne({
      makeCode: carOfferData.makeCode,
    });
    if (!companyName) {
      throw new Error(
        `Car brand with makeCode ${carOfferData.makeCode} not found`
      );
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
      leaseType_id: leaseType._id,
      carBrand_id: companyName._id,
      carSeries_id: seriesName._id,
      yearModel: yearModel,
    });

    if (existingCarOffer) {
      // car offer already exists, add new offer to existing group
      existingCarOffer.offers.push({
        leaseType_id: leaseType._id,
        duration: carOfferData.duration,
        annualMileage: carOfferData.annualMileage,
        monthlyCost: carOfferData.monthlyCost,
      });
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
        leaseType_id: leaseType._id,
        yearModel: yearModel,
        offers: [
          {
            duration: carOfferData.duration,
            annualMileage: carOfferData.annualMileage,
            monthlyCost: carOfferData.monthlyCost,
          },
        ],
        deals: carOfferData.deals,
      });
      return newCarOffer;
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create/update car offer.');
  }
};
*/

const createCarOffer = async (carOfferData) => {
     try {
          // const leaseType = await leaseTypeModel.findOne({
          //      leaseType: carOfferData.leaseType,
          // });
          // if (!leaseType) {
          //      throw new Error(
          //           `Lease type ${carOfferData.leaseType} not found`
          //      );
          // }

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

          // const companyName = await carBrandModel.findOne({
          //      makeCode: carOfferData.makeCode,
          // });
          // if (!companyName) {
          //      throw new Error(
          //           `Car brand with makeCode ${carOfferData.makeCode} not found`
          //      );
          // }

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

          /*    const existingCarOffer = await carOfferModel.findOneAndUpdate(
               {
                    leaseType_id: leaseType._id,
                    carBrand_id: companyName._id,
                    carSeries_id: seriesName._id,
                    yearModel: yearModel,
               },
               {
                    $push: {
                         offers: {
                              duration: carOfferData.duration,
                              annualMileage: carOfferData.annualMileage,
                              monthlyCost: carOfferData.monthlyCost,
                         },
                    },
               },
               { new: true, upsert: true }
          ); */

          const existingCarOffer = await carOfferModel.findOne({
               leaseType_id: leaseTypes,
               carBrand_id: companyName._id,
               carSeries_id: seriesName._id,
               yearModel: yearModel,
          });

          if (existingCarOffer) {
               // car offer already exists, add new offer to existing group
               existingCarOffer.offers.push({
                    duration: carOfferData.duration,
                    annualMileage: carOfferData.annualMileage,
                    monthlyCost: carOfferData.monthlyCost,
               });
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
                         },
                    ],
                    deals: carOfferData.deals,
               });
               return newCarOffer;
          }
     } catch (error) {
          console.log(error);
          throw new Error('Failed to create/update car offer.');
     }
};

const updateOffersAndDeals = async (
     carBrand_id,
     carSeries_id,
     leaseType_id,
     yearModel,
     offers,
     deals
) => {
     try {
          const result = await CarOffer.findOneAndUpdate(
               {
                    carBrand_id,
                    carSeries_id,
                    leaseType_id,
                    yearModel,
               },
               {
                    offers,
                    deals,
               }
          );

          return result ? true : false;
     } catch (error) {
          throw error;
     }
};

/* 


const createCarOffer = async (carOfferData) => {
     try {
          const leaseType = await leaseTypeModel.findOne({
               leaseType: carOfferData.leaseType,
          });
          if (!leaseType) {
               throw new Error(
                    `Lease type ${carOfferData.leaseType} not found`
               );
          }

          const companyName = await carBrandModel.findOne({
               makeCode: carOfferData.makeCode,
          });
          if (!companyName) {
               throw new Error(
                    `Car brand with makeCode ${carOfferData.makeCode} not found`
               );
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
               leaseType_id: leaseType._id,
               carBrand_id: companyName._id,
               carSeries_id: seriesName._id,
               yearModel: yearModel,
          });

          if (existingCarOffer) {
               // car offer already exists, update offer with new values
               const updatedOffer = {
                    duration: carOfferData.duration,
                    annualMileage: carOfferData.annualMileage,
                    monthlyCost: carOfferData.monthlyCost,
               };
               const offerIndex = existingCarOffer.offers.findIndex(
                    (offer) =>
                         offer.duration === carOfferData.duration &&
                         offer.annualMileage === carOfferData.annualMileage
               );
               if (offerIndex !== -1) {
                    // update existing offer
                    existingCarOffer.offers[offerIndex] = updatedOffer;
               } else {
                    // add new offer to offers array
                    existingCarOffer.offers.push(updatedOffer);
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
                    leaseType_id: leaseType._id,
                    yearModel: yearModel,
                    offers: [
                         {
                              duration: carOfferData.duration,
                              annualMileage: carOfferData.annualMileage,
                              monthlyCost: carOfferData.monthlyCost,
                         },
                    ],
                    deals: carOfferData.deals,
               });
               return newCarOffer;
          }
     } catch (error) {
          console.log(error);
          throw new Error('Failed to create/update car offer.');
     }
};

// update carOffer with csv
const updateOffers = async (offers) => {
     for (const offer of offers) {
          // Validate CSV data
          if (
               !offer.carBrand_id ||
               !offer.carSeries_id ||
               !offer.leaseType_id ||
               !offer.yearModel
          ) {
               throw new Error('Invalid CSV data: missing required fields');
          }

          // Find matching car offer document
          const carOffer = await carOfferModel.findOne({
               carBrand_id: offer.carBrand_id,
               carSeries_id: offer.carSeries_id,
               leaseType_id: offer.leaseType_id,
               yearModel: offer.yearModel,
          });

          if (carOffer) {
               // Update offers and deals fields
               carOffer.offers = offer.offers;
               carOffer.deals = offer.deals;
               await carOffer.save();
          }
     }
};

*/

const getAllOffer = async () => {
     const response = await carOfferModel.find();
     return response;
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

const getBestDeals = async () => {
     try {
          const bestDeals = await carOfferModel
               .find({ deals: 'active' })
               .sort({ 'offers.monthlyCost': 1 })
               .limit(10)
               .populate('carBrand_id', 'companyName')
               .populate('carSeries_id', 'seriesName')
               .populate('leaseType_id', 'leaseType');

          return bestDeals;
     } catch (err) {
          console.error(err);
          throw new Error('Unable to retrieve best deals');
     }
};

export const carOfferService = {
     createCarOffer,
     getAllOffer,
     getBestDeals,
     updateOffersAndDeals,
     getCount,
};
