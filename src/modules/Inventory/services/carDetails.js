import PDFDocument from 'pdfkit';
import fs from 'fs';
import carDetailModel from '../models/carDetails.js';
import mongoose from 'mongoose';

const getAllCar = async (
     leaseType,
     carBrand,
     carSeries,
     fuelType,
     priceMin,
     priceMax,
     bodyType,
     annualMileage,
     companyName
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
          ];

          if (companyName) {
               aggregateFilter.push({
                    $match: {
                         'carBrand.companyName': {
                              $regex: `.*${companyName}.*`,
                              $options: 'i',
                         },
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

          const response = await carDetailModel.aggregate(aggregateFilter);

          return response;
     } catch (error) {
          console.log(error);
     }
};

const addNewCar = async (data, carImage) => {
     try {
          const response = await carDetailModel.create({
               ...data,
               image: carImage,
          });
          return response;
     } catch (error) {
          console.log(error);
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const getSingleCar = async (id) => {
     const aggregateFilter = [
          {
               $match: {
                    _id: mongoose.Types.ObjectId(id), // convert the string id to an ObjectId
               },
          },
          {
               $lookup: {
                    from: 'carfeatures', // the name of the collection to join with
                    localField: 'carFeatures_id',
                    foreignField: '_id',
                    as: 'carFeature', // the name of the array to store the joined documents
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
     ];

     const result = await carDetailModel.aggregate(aggregateFilter);

     return result;
};

const generatePdf = async (
     id,
     leaseType,
     contractLengthInMonth,
     annualMileage,
     includeMaintenance,
     upfrontPayment,
     monthlyLeasePrice
) => {
     try {
          // Find the car in the database using its ID
          const car = await carDetailModel.findById({ _id: id });

          // Generate a PDF summary of the selected options
          const pdfDoc = new PDFDocument({ margin: 30 });
          pdfDoc.pipe(
               fs.createWriteStream(
                    `public/pdf/summary_${car._id}_${Date.now()}.pdf`
               )
          );
          // Add an image/logo to the PDF
          pdfDoc.rect(55, 10, 500, 120).fillAndStroke('#fff', '#000');
          pdfDoc.fill('black').stroke();
          pdfDoc.image('public/LeasePlan_Logo.jpg', 60, 20, {
               fit: [100, 100],
          });
          pdfDoc
               .fontSize(16)
               .text('Leaseplan Emirates LLC', 200, 30, { align: 'center' })
               .fontSize(12)
               .text('Abu Dhabi - United Arab Emirates', { align: 'center' })
               .text('Musaffah Industrial', { align: 'center' })
               .text('Musaffah', { align: 'center' })
               .text('Street # 10', { align: 'center' })
               .moveDown();

          pdfDoc.text('Car Lease Summary', 235, 150).text('Dated', 500, 160);

          pdfDoc
               .text(`Contract length: ${contractLengthInMonth}`, 70, 220)
               .moveDown(0.3)
               .text(`fuelType: ${car.fuelType}`)
               .moveDown(0.3)
               .text(`Price: ${car.price}`)
               .moveDown(0.3)
               .text(`Lease Type: ${leaseType}`)
               .moveDown(0.3)
               .text(`Contract length: ${contractLengthInMonth}`)
               .moveDown(0.3)
               .text(`Annual Mileage: ${annualMileage}`)
               .moveDown(0.3)
               .text(`Upfront Payment: ${upfrontPayment}`)
               .moveDown(0.3)
               .text(`Include Maintenance: ${includeMaintenance}`)
               .moveDown(0.3);
          pdfDoc
               .fontSize(14)
               .text(`Monthly Lease Price: ${monthlyLeasePrice}`)
               .moveDown(0.3);

          // pdfDoc.end();
          const pdfBuffer = await new Promise((resolve, reject) => {
               const chunks = [];
               pdfDoc.on('data', (chunk) => {
                    chunks.push(chunk);
               });
               pdfDoc.on('end', () => {
                    resolve(Buffer.concat(chunks));
               });
               pdfDoc.end();
          });

          const summaryDoc = {
               id,
               leaseType,
               contractLengthInMonth,
               annualMileage,
               upfrontPayment,
               includeMaintenance,
               monthlyLeasePrice,
               summary: pdfBuffer,
          };
          await carDetailModel.create(summaryDoc);

          return pdfBuffer;
     } catch (error) {
          throw new Error(error.message);
     }
};

const updateCar = async (id, data) => {
     try {
          const response = await carDetailModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               {
                    new: true,
               }
          );
          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const deleteCar = async (id) => {
     try {
          const response = await carDetailModel.remove(
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

export const CarServices = {
     getAllCar,
     addNewCar,
     generatePdf,
     updateCar,
     deleteCar,
     getSingleCar,
};
