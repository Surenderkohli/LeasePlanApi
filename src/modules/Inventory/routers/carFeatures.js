import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carFeatureService } from '../services/carFeatures.js';
import multer from 'multer';
import csvtojson from 'csvtojson';
import { carFeatureModel } from '../models/carFeatures.js';

const router = Router();

router.get(
     '/',
     httpHandler(async (req, res) => {
          try {
               const carFeatures = await carFeatureService.getAllCarFeature();

               res.status(200).json({ success: true, data: carFeatures });
          } catch (error) {
               console.log(error);
               res.status(500).send('Server error');
          }
     })
);

router.get(
     '/:id',
     httpHandler(async (req, res) => {
          try {
               const { id } = req.params;
               const result = await carFeatureService.getSingleCarFeature(id);
               res.status(200).json({
                    success: true,
                    data: result,
               });
          } catch (error) {
               console.error(error);
               res.status(400).json({ success: false, error: error.message });
          }
     })
);

router.post('/car-features-manual', async (req, res) => {
     try {
          const carFeatureData = req.body;
          const carFeature = await carFeatureService.createCarFeatureManual(
               carFeatureData
          );
          res.status(201).json({
               message: 'Car feature added successfully',
               data: carFeature,
          });
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
});

router.put(
     '/update/:id',
     httpHandler(async (req, res) => {
          try {
               const data = req.body;
               const { id } = req.params;

               const result = await carFeatureService.updateCarFeatures(
                    id,
                    data
               );
               res.status(200).json({ success: true, data: result });
          } catch {
               console.log(error);
               res.status(500).send('Server error');
          }
     })
);

router.delete(
     '/delete/:id',
     httpHandler(async (req, res) => {
          const data = req.body;
          const { id } = req.params;
          const result = await carFeatureService.deleteCarFeatures(
               id,
               req.body
          );
          res.send(result);
     })
);

const storage = multer.memoryStorage();

const upload = multer({ storage });

// router.post('/car-features', upload.single('file'), async (req, res) => {
//      try {
//           let carFeatures = [];

//           if (req.file && req.file.mimetype === 'text/csv') {
//                // CSV upload
//                const csvString = req.file.buffer.toString('utf8');
//                const carFeatureData = await csvtojson().fromString(csvString);

//                for (let i = 0; i < carFeatureData.length; i++) {
//                     const carDetail = await carFeatureService.createCarFeature(
//                          carFeatureData[i]
//                     );
//                     carFeatures.push(carDetail);
//                }
//           }

//           res.status(201).json({
//                message: 'Car features added successfully',
//                data: carFeatures,
//           });
//      } catch (error) {
//           console.log(error);
//           res.status(400).json({ message: error.message });
//      }
// });

// Route for uploading car feature category CSV file
router.post(
     '/car-feature-category',
     upload.single('file'),
     async (req, res) => {
          try {
               if (!req.file || req.file.mimetype !== 'text/csv') {
                    return res.status(400).json({
                         message: 'Invalid file format. Please upload a CSV file',
                    });
               }

               const csvString = req.file.buffer.toString('utf8');
               const carFeatureCategoryData = await csvtojson().fromString(
                    csvString
               );

               // Validate the CSV data for car feature categories
               const validation = isValidCarFeatureCategoryData(
                    carFeatureCategoryData
               );
               if (!validation.isValid) {
                    return res.status(400).json({
                         message: `Invalid CSV format. ${validation.error}`,
                    });
               }

               for (const data of carFeatureCategoryData) {
                    await carFeatureService.createCarFeatureCategory(data);
               }

               res.status(201).json({
                    message: 'Car feature categories added successfully',
                    data: carFeatureCategoryData,
               });
          } catch (error) {
               console.log(error);
               res.status(400).json({ message: error.message });
          }
     }
);

// Route for uploading feature description CSV file
router.post('/feature-description', upload.single('file'), async (req, res) => {
     try {
          let featureDescriptions = [];

          if (!req.file || req.file.mimetype !== 'text/csv') {
               return res.status(400).json({
                    message: 'Invalid file format. Please upload a CSV file',
                    source: 'manual', // Set the source to 'manual' when not uploading a CSV file
               });
          }

          const csvString = req.file.buffer.toString('utf8');
          const featureDescriptionData = await csvtojson().fromString(
               csvString
          );

          // Validate the CSV data for car features
          const validation = isValidFeatureDescriptionData(
               featureDescriptionData
          );
          if (!validation.isValid) {
               return res.status(400).json({
                    message: `Invalid CSV format. ${validation.error}`,
                    source: 'csv', // Set the source to 'csv' when uploading a valid CSV file
               });
          }

          if (req.body.source === 'manual') {
               // If the source is 'manual', delete existing feature descriptions based on makeCode and modelCode
               const { makeCode, modelCode } = req.body;
               await carFeatureModel.deleteMany({
                    source: 'manual',
                    makeCode,
                    modelCode,
               });
          } else if (req.body.source === 'csv') {
               // If the source is 'csv', delete existing feature descriptions with source type 'csv'
               await carFeatureModel.deleteMany({ source: 'csv' });
          }

          for (let i = 0; i < featureDescriptionData.length; i++) {
               const featureDescription =
                    await carFeatureService.addOrUpdateFeatureDescription(
                         featureDescriptionData[i],
                         'csv' // Set the source parameter to 'csv' for all feature descriptions
                    );
               featureDescriptions.push(featureDescription);
          }

          res.status(201).json({
               message: 'Feature descriptions added successfully',
               data: featureDescriptions,
          });
     } catch (error) {
          console.log(error);
          res.status(400).json({ message: error.message });
     }
});

// Helper function to validate the CSV data for car feature categories
function isValidCarFeatureCategoryData(carFeatureCategoryData) {
     if (
          !Array.isArray(carFeatureCategoryData) ||
          carFeatureCategoryData.length === 0
     ) {
          return {
               isValid: false,
               error: 'No car feature category data provided',
          };
     }

     const missingFields = new Set();

     for (let i = 0; i < carFeatureCategoryData.length; i++) {
          const carFeatureCategory = carFeatureCategoryData[i];

          if (!carFeatureCategory.makeCode) {
               missingFields.add('makeCode');
          }

          if (!carFeatureCategory.modelCode) {
               missingFields.add('modelCode');
          }

          if (!carFeatureCategory.categoryCode) {
               missingFields.add('categoryCode');
          }

          if (!carFeatureCategory.categoryDescription) {
               missingFields.add('categoryDescription');
          }
     }

     if (missingFields.size > 0) {
          const missingFieldsList = Array.from(missingFields).join(', ');
          return {
               isValid: false,
               error: `Missing or invalid fields: ${missingFieldsList}`,
          };
     }

     return {
          isValid: true,
     };
}

// Helper function to validate the CSV data for feature descriptions
function isValidFeatureDescriptionData(featureDescriptionData) {
     if (
          !Array.isArray(featureDescriptionData) ||
          featureDescriptionData.length === 0
     ) {
          return {
               isValid: false,
               error: 'No feature description data provided',
          };
     }

     const missingFields = new Set();

     for (let i = 0; i < featureDescriptionData.length; i++) {
          const featureDescription = featureDescriptionData[i];

          if (!featureDescription.makeCode) {
               missingFields.add('makeCode');
          }

          if (!featureDescription.modelCode) {
               missingFields.add('modelCode');
          }

          if (!featureDescription.categoryCode) {
               missingFields.add('categoryCode');
          }

          if (!featureDescription.featureDescription) {
               missingFields.add('featureDescription');
          }
     }

     if (missingFields.size > 0) {
          const missingFieldsList = Array.from(missingFields).join(', ');
          return {
               isValid: false,
               error: `Missing or invalid fields: ${missingFieldsList}`,
          };
     }

     return {
          isValid: true,
     };
}

export default router;
