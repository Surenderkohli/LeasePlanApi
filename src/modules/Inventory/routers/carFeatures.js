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
               });
          }

          const csvString = req.file.buffer.toString('utf8');
          const featureDescriptionData = await csvtojson().fromString(
               csvString
          );

          const existingFeatures = await carFeatureModel.find({});

          // Delete existing car features only if they exist
          if (existingFeatures.length > 0) {
               await carFeatureService.deleteAllCarFeaturesDescription();
          }

          for (let i = 0; i < featureDescriptionData.length; i++) {
               const featureDescription =
                    await carFeatureService.addFeatureDescription(
                         featureDescriptionData[i]
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

export default router;
