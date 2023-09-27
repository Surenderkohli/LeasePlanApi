import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { carFeatureService } from '../services/carFeatures.js';
import multer from 'multer';
import csvtojson from 'csvtojson';
import carFeatureModel from '../models/carFeatures.js';
import { createObjectCsvWriter } from 'csv-writer';
import carDetailModel from '../models/carDetails.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function generateErrorCSV(errorList) {
     const errorFolder = 'errorFile'; // Update with the correct folder name
     const csvWriter = createObjectCsvWriter({
          //  path: 'error_list.csv', // Set the file path to save the CSV file
          path: `${errorFolder}/error_list_carfeatures.csv`,
          header: [
               { id: 'column', title: 'Fields' },
               { id: 'cell', title: 'CellAddress' },
               { id: 'message', title: 'Message' },
          ],
     });

     try {
          await csvWriter.writeRecords(errorList);
          return console.log('CSV file generated successfully');
     } catch (error) {
          return console.log('Error generating CSV file:', error);
     }
}

router.post('/feature-description', upload.single('file'), async (req, res) => {
     try {
          let featureDescriptions = [];
          let errorList = [];

          if (!req.file || req.file.mimetype !== 'text/csv') {
               return res.status(400).json({
                    message: 'Invalid CSV format. Please upload a valid car features CSV file.',
                    source: 'manual', // Set the source to 'manual' when not uploading a CSV file
               });
          }

          const csvString = req.file.buffer.toString('utf8');
          const featureDescriptionData = await csvtojson().fromString(
               csvString
          );

          // Check if the carDetails document exists for any of the feature descriptions
          const missingCarDetails = [];

          for (let i = 0; i < featureDescriptionData.length; i++) {
               const featureDescription = featureDescriptionData[i];

               const carDetails = await carDetailModel.findOne({
                    makeCode: featureDescription.makeCode,
                    modelCode: featureDescription.modelCode,
               });

               if (!carDetails) {
                    const columnIndexMakeCode = getHeaderIndex('makeCode');
                    const columnIndexModelCode = getHeaderIndex('modelCode');
                    const cellAddress = getCellAddress(columnIndexMakeCode, i);
                    missingCarDetails.push({
                         column: 'makeCode, modelCode',
                         cell: cellAddress,
                         message: `Car details not found for makeCode '${featureDescription.makeCode}' and modelCode '${featureDescription.modelCode}'`,
                    });
               }
          }

          if (missingCarDetails.length > 0) {
               errorList = missingCarDetails.map((missingCarDetail) => ({
                    column: missingCarDetail.column,
                    cell: missingCarDetail.cell,
                    message: missingCarDetail.message,
               }));
          }

          // Validate the CSV data for car features
          const validationResult = isValidFeatureDescriptionData(
               featureDescriptionData
          );
          if (!validationResult.isValid) {
               errorList = validationResult.errors.slice(0, 30); // Limiting to maximum 30 errors
          }

          if (req.body.source === 'manual') {
               // If the source is 'manual', delete existing feature descriptions based on makeCode and modelCode
               const { makeCode, modelCode } = req.body;
               await carFeatureModel.deleteMany({
                    source: 'manual',
                    makeCode,
                    modelCode,
               });
          }

          // Delete existing feature descriptions with source type 'csv'
          await carFeatureModel.deleteMany({ source: 'csv' });

          if (errorList.length > 0) {
               // Generate the error CSV file
               await generateErrorCSV(errorList);

               // Return the CSV file as a download link
               return res.status(400).json({
                    message: 'Invalid car features CSV file',
                    errorFile: 'error_list_carfeatures.csv', // Provide the file name to be downloaded
               });
          }

          for (let i = 0; i < featureDescriptionData.length; i++) {
               const featureDescription =
                    await carFeatureService.addOrUpdateFeatureDescription(
                         featureDescriptionData[i],
                         'csv' // Set the source parameter to the request body's source value for all feature descriptions
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

function isValidFeatureDescriptionData(featureDescriptionData) {
     if (
          !Array.isArray(featureDescriptionData) ||
          featureDescriptionData.length === 0
     ) {
          return {
               isValid: false,
               errors: ['No feature description data provided'],
          };
     }

     const errors = [];
     const missingFields = new Set();

     const validCategoryCodes = {
          1: 'Exterior',
          2: 'Interior',
          3: 'Safety',
          4: 'Audio And Entertainment System',
     };

     for (let i = 0; i < featureDescriptionData.length; i++) {
          const featureDescription = featureDescriptionData[i];

          const missingFieldsInfo = [
               { field: 'makeCode', header: 'makeCode' },
               { field: 'modelCode', header: 'modelCode' },
               { field: 'categoryCode', header: 'categoryCode' },
               { field: 'featureDescription', header: 'featureDescription' },
          ];

          for (const { field, header } of missingFieldsInfo) {
               if (!featureDescription[field]) {
                    const columnIndex = getHeaderIndex(header);
                    const cellAddress = getCellAddress(columnIndex, i);
                    missingFields.add({
                         column: header,
                         cell: cellAddress,
                         message: `Missing ${field} at index ${i}`,
                    });
               }
          }

          const categoryCode = featureDescription.categoryCode;
          const categoryDescription = featureDescription.categoryDescription;
          const expectedCategoryDescription = validCategoryCodes[categoryCode];

          if (
               expectedCategoryDescription &&
               categoryDescription !== expectedCategoryDescription
          ) {
               const columnIndex = getHeaderIndex('categoryCode');
               const cellAddress = getCellAddress(columnIndex, i);
               errors.push({
                    column: 'categoryCode',
                    cell: cellAddress,
                    message: `Invalid categoryCode '${categoryCode}' for categoryDescription '${categoryDescription}'. Expected: ${expectedCategoryDescription}`,
               });
          } else if (!expectedCategoryDescription) {
               const columnIndex = getHeaderIndex('categoryCode');
               const cellAddress = getCellAddress(columnIndex, i);
               errors.push({
                    column: 'categoryCode',
                    cell: cellAddress,
                    message: `Invalid categoryCode '${categoryCode}'. No expected category description found.`,
               });
          }
     }

     if (missingFields.size > 0) {
          missingFields.forEach((missingField) => {
               errors.push(missingField);
          });
     }

     return {
          isValid: errors.length === 0,
          errors,
     };
}

// Function to get the cell address based on the column index and row number
function getCellAddress(columnIndex, rowNumber) {
     const columnName = getColumnName(columnIndex);
     const adjustedRowNumber = rowNumber + 2; // Adding 2 to row number to account for header row
     return columnName + adjustedRowNumber;
}

// Function to get the column name based on the column index
function getColumnName(columnIndex) {
     let dividend = columnIndex;
     let columnName = '';

     while (dividend >= 0) {
          let modulo = dividend % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26) - 1;
     }

     return columnName;
}

// Function to get the index of the header field in the CSV
function getHeaderIndex(fieldName) {
     // Replace this logic with your CSV header extraction logic
     const headers = [
          'makeCode',
          'modelCode',
          'categoryCode',
          'categoryDescription',
          'featureDescription',
     ];
     return headers.indexOf(fieldName);
}

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
export default router;
