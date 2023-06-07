//------------------------------------------------------------------------------------------carDetails.js-----------------------------------------------------------------------------------

// // Check if carBrand_id is provided and valid
// if (!carBrand_id) {
//      throw new Error('carBrand_id is required');
// } else if (!mongoose.Types.ObjectId.isValid(carBrand_id)) {
//      throw new Error('carBrand_id is invalid');
// }

// // Check if carBrand_id exists
// const carBrand = await carBrandModel.findOne({
//      _id: carBrand_id,
// });
// if (!carBrand) {
//      return res.status(404).json({
//           success: false,
//           msg: 'carBrand not found',
//      });
// }

/* router.get('/fetch-single/:id', async (req, res) => {
     try {
          const { id } = req.params;

          let {
               contractLengthInMonth,
               annualMileage,
               upfrontPayment,
               includeMaintenance,
               monthlyLeasePrice,
          } = req.query;

          const result = await CarServices.getSingleCar(
               id,
               contractLengthInMonth,
               annualMileage,
               upfrontPayment,
               includeMaintenance,
               monthlyLeasePrice
          );
          if (!result) {
               res.status(404).json({
                    success: false,
                    message: 'No car found with the specified id.',
               });
          }
          res.send(result);
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
});

router.get('/cars/:companyName/:seriesName', async (req, res) => {
     try {
          const { companyName, seriesName } = req.params;
          const cars = await CarServices.getCarsByBrandAndSeries(
               companyName,
               seriesName
          );
          res.status(200).json(cars);
     } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
     }
});

router.get('/cars-with-offers', async (req, res) => {
     const { companyName, seriesName, yearModels } = req.query;

     try {
          const carOffers = await CarServices.getCarsWithOffers(
               companyName,
               seriesName,
               yearModels
          );

          res.json(carOffers);
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Server error' });
     }
});

router.get(
     '/best-deals',
     httpHandler(async (req, res) => {
          try {
               const { limit = 3, skip = 0 } = req.query;
               const result = await CarServices.getBestDeals(
                    parseInt(limit),
                    parseInt(skip)
               );
               if (result) {
                    res.status(200).json({ success: true, data: result });
               } else {
                    res.status(404).json({
                         success: false,
                         message: 'Not found any best deals',
                    });
               }
          } catch (error) {
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.put(
     '/update/:id',
     carUpload.array('image', 6),
     httpHandler(async (req, res) => {
          try {
               // check if there are new files uploaded
               const { id } = req.params;

               const { deals } = req.body;
               if (deals && !['active', 'inactive'].includes(deals)) {
                    throw new Error('Invalid deals status');
               }

               const data = req.body;
               const images = [];

               // check if there are new files uploaded
               if (req.files && req.files.length > 0) {
                    // delete old images from cloudinary
                    const carImage = await CarServices.getSingleCar(id);

                    if (carImage && carImage.image) {
                         for (const image of carImage.image) {
                              await cloudinary.uploader.destroy(image.publicId);
                         }
                    }

                    // upload new image files to cloudinary
                    for (const file of req.files) {
                         const result = await cloudinary.uploader.upload(
                              file.path
                         );

                         images.push({
                              imageUrl: result.secure_url,
                              publicId: result.public_id,
                         });
                    }

                    // update the images array in the request body
                    data.image = images;
               }

               const result = await CarServices.updateCar(id, data);

               res.send(result);
          } catch (error) {
               console.error('Error in updating  carDetails:', error);
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.post(
     '/add',
     carUpload.array('image', 6),
     httpHandler(async (req, res) => {
          try {
               const { deals } = req.body;
               if (deals && !['active', 'inactive'].includes(deals)) {
                    throw new Error('Invalid deals status');
               }

               const carDetailsData = req.body;
               const files = req.files; // Get the image files from the request

               const carFeaturesData = {
                    carSeries_id: carDetailsData.carSeries_id,
                    carBrand_id: carDetailsData.carBrand_id,
                    modelCode: carDetailsData.modelCode, // Map modelCode from carDetailsData to carFeaturesData
                    makeCode: carDetailsData.makeCode, // Map makeCode from carDetailsData to carFeaturesData
                    yearModel: carDetailsData.yearModel,
                    exteriorFeatures: req.body.exteriorFeatures,
                    interiorFeatures: req.body.interiorFeatures,
                    safetySecurityFeatures: req.body.safetySecurityFeatures,
               };

               // let leaseTypes;
               // if (carDetailsData.leaseType) {
               //      leaseTypes = await leaseTypeModel.find({
               //           leaseType: carDetailsData.leaseType,
               //      });
               //      if (leaseTypes.length === 0) {
               //           // Create a new leaseType entry in the leaseTypeModel collection
               //           const newLeaseType = new leaseTypeModel({
               //                leaseType: carDetailsData.leaseType,
               //           });
               //           const savedLeaseType = await newLeaseType.save();
               //           leaseTypes = [savedLeaseType];
               //      }
               // } else {
               //      leaseTypes = [];
               // }

               // // Find the car brand
               // const carBrand = await carBrandModel.findOne({
               //      _id: carDetailsData.carBrand_id,
               //      // makeCode: carDetailsData.makeCode,
               // });

               // if (!carBrand) {
               //      throw new Error('Invalid carBrand_id');
               // }

               // if (leaseTypes.length > 0) {
               //      const leaseTypeIdsToAdd = leaseTypes
               //           .map((leaseType) => leaseType._id)
               //           .filter(
               //                (leaseTypeId) =>
               //                     !carBrand.leaseType_id.includes(leaseTypeId)
               //           );
               //      if (leaseTypeIdsToAdd.length > 0) {
               //           carBrand.leaseType_id = [
               //                ...carBrand.leaseType_id,
               //                ...leaseTypeIdsToAdd,
               //           ];
               //           await carBrand.save();
               //      }
               // }

               const carOffersData = {
                    carBrand_id: carDetailsData.carBrand_id,
                    carSeries_id: carDetailsData.carSeries_id,
                    yearModel: carDetailsData.yearModel,
                    //leaseType_id: leaseTypes.map((leaseType) => leaseType._id),
                    //leaseType_id: carDetailsData.leaseType_id,
                    offers: [],
               };

               for (let i = 1; i <= 20; i++) {
                    const duration = req.body[`duration${i}`];
                    const annualMileage = req.body[`annualMileage${i}`];
                    const monthlyCost = req.body[`monthlyCost${i}`];
                    const calculationNo = req.body[`calculationNo${i}`];

                    if (
                         duration &&
                         annualMileage &&
                         monthlyCost &&
                         calculationNo
                    ) {
                         carOffersData.offers.push({
                              duration: duration,
                              annualMileage: annualMileage,
                              monthlyCost: monthlyCost,
                              calculationNo: req.body[`calculationNo${i}`],
                         });
                    }
               }

               const carImage = [];
               if (files) {
                    const uploadPromises = files.map((file) => {
                         return cloudinary.uploader.upload(file.path);
                    });

                    const uploadResults = await Promise.all(uploadPromises); // Wait for all image uploads to finish

                    uploadResults.forEach((result) => {
                         let imageUrl = result.secure_url;
                         let publicId = result.public_id;
                         const carDetailsData = { imageUrl, publicId };
                         carImage.push(carDetailsData); // For each upload result, push the secure URL to the carImage array
                    });
               }
               // Check if id is a valid ObjectId
               // const fieldsToCheck = [
               //      'carBrand_id',
               //      'carSeries_id',
               //      'leaseType_id',
               // ];
               // for (let field of fieldsToCheck) {
               //      if (!mongoose.Types.ObjectId.isValid(data[field])) {
               //           return res.status(400).send({
               //                success: false,
               //                msg: `Invalid ObjectId `,
               //           });
               //      }
               // }

               const result = await CarServices.addNewCar(
                    carDetailsData,
                    carImage,
                    carFeaturesData,
                    carOffersData
               );
               res.send(result);
          } catch (error) {
               console.error('Error in adding new carDetails:', error);
               res.send({ status: 400, success: false, msg: error.message });
          }
     })
);

router.get(
     '/count',
     httpHandler(async (req, res) => {
          try {
               const counts = await CarServices.getCount();
               res.status(200).json({
                    success: true,
                    privateLeaseCount: counts.privateLeaseCount,
                    flexiPlanCount: counts.flexiPlanCount,
                    businessLeaseCount: counts.businessLeaseCount,
               });
          } catch (error) {
               res.status(400).json({ success: false, error: error.message });
          }
     })
);
 */
//------------------------------------------------------------------------------------------carFeature.js-----------------------------------------------------------------------------------

/* router.post(
     '/add-carFeature',
     httpHandler(async (req, res) => {
          try {
               const carFeatureData = req.body;
               const carFeature = await carFeatureService.addCarFeature(
                    carFeatureData
               );
               res.status(201).json({ success: true, data: carFeature });
          } catch (error) {
               console.error(error);
               res.status(500).send('Server error');
          }
     })
);
 */
//------------------------------------------------------------------------------------------carOffer.js-----------------------------------------------------------------------------------

/* // POST /car-offers

router.post('/car-offers-manual', async (req, res) => {
     try {
          const carOffer = await carOfferService.createCarOfferManual(req.body);
          res.status(201).json({
               message: 'Car offer added successfully',
               data: carOffer, D
          });
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
});

//calculation no. unqiue
router.post('/car-offers', upload.single('file'), async (req, res) => {
     try {
          let carOffers = [];

          if (req.file && req.file.mimetype === 'text/csv') {
               // CSV upload
               const csvString = req.file.buffer.toString('utf8');
               const carOfferData = await csvtojson().fromString(csvString);

               // delete existing car offers from database
               // await carOfferService.deleteAllCarOffers();

               const calculationNos = new Set();

               for (let i = 0; i < carOfferData.length; i++) {
                    const { calculationNo } = carOfferData[i];

                    if (calculationNos.has(calculationNo)) {
                         return res.status(400).json({
                              message: `calculationNo '${calculationNo}' already exists in the uploaded CSV file`,
                         });
                    }

                    calculationNos.add(calculationNo);

                    const carOffer = await carOfferService.createCarOffer(
                         carOfferData[i]
                    );
                    carOffers.push(carOffer);
               }
          }

          res.status(201).json({
               message: 'Car offers added successfully',
               data: carOffers,
          });
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
}); */

///////////
/////////////////////
/* 

   const carFeaturesData = {
               exteriorFeatures: req.body.exteriorFeatures,
               interiorFeatures: req.body.interiorFeatures,
               safetySecurityFeatures: req.body.safetySecurityFeatures,
               comfortConvenienceFeatures: req.body.comfortConvenienceFeatures,
               audioEntertainmentFeatures: req.body.audioEntertainmentFeatures,
          };
          const carOffersData = {
               offers: [],
          };

          for (let i = 1; i <= 20; i++) {
               const duration = req.body[`duration${i}`];
               const annualMileage = req.body[`annualMileage${i}`];
               const monthlyCost = req.body[`monthlyCost${i}`];
               const calculationNo = req.body[`calculationNo${i}`];
               if (duration && annualMileage && monthlyCost && calculationNo) {
                    const offerIndex = carOffersData.offers.findIndex(
                         (offer) => offer.calculationNo === calculationNo
                    );
                    if (offerIndex !== -1) {
                         carOffersData.offers[offerIndex].duration = duration;
                         carOffersData.offers[offerIndex].annualMileage =
                              annualMileage;
                         carOffersData.offers[offerIndex].monthlyCost =
                              monthlyCost;
                    } else {
                         carOffersData.offers.push({
                              duration: duration,
                              annualMileage: annualMileage,
                              monthlyCost: monthlyCost,
                              calculationNo: calculationNo,
                         });
                    }
               }
          } 
          
       */
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
// const filter = {
//      carBrand_id,
//      carSeries_id,
//      //yearModel,
// };

// const updateFields = {};

// for (const [key, value] of Object.entries(carDetailsData)) {
//      if (key.endsWith('Features') && Array.isArray(value)) {
//           const featureIndex = key.slice(0, -8);
//           value.forEach((featureValue, index) => {
//                updateFields[`${featureIndex}Features.${index}`] =
//                     featureValue;
//           });
//      } else {
//           updateFields[key] = value;
//      }
// }

// const updatedCarFeatures = await carFeatureModel.findOneAndUpdate(
//      filter,
//      updateFields,
//      { new: true }
// );

/* router.get('/fetch-single/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const { chosenDuration, chosenAnnualMileage } = req.query;

          const result = await carOfferService.getSingleCar(id);
          let monthlyCost = null;

          result.carOffer.offers.forEach((offer) => {
               if (
                    offer.duration == chosenDuration &&
                    offer.annualMileage == chosenAnnualMileage
               ) {
                    monthlyCost = offer.monthlyCost;
               }
          });

          if (monthlyCost !== null) {
               res.status(200).json({
                    success: true,
                    monthlyCost: monthlyCost,
               });
          } else {
               res.status(404).json({
                    success: false,
                    msg: 'No matching offer found',
               });
          }
     } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
     }
});
 */
