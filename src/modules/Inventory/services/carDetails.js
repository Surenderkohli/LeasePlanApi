import PDFDocument from 'pdfkit';
import fs from 'fs';
import carDetailModel from '../models/carDetails.js';
import leaseTypeModel from '../models/leaseType.js';
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
     companyName,
     seriesName
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

          if (companyName || seriesName) {
               aggregateFilter.push({
                    $match: {
                         $or: [
                              {
                                   'carBrand.companyName': {
                                        $regex: `.*${companyName}.*`,
                                        $options: 'i',
                                   },
                              },
                              {
                                   'carSeries.seriesName': {
                                        $regex: `.*${seriesName}.*`,
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
          const images = carImage.map((image) => ({
               imageUrl: image.imageUrl,
               publicId: image.publicId,
          }));
          const response = await carDetailModel.create({
               ...data,
               image: images,
          });
          return response;
     } catch (error) {
          console.log(error);
          res.send({ status: 400, success: false, msg: error.message });
     }
};

// const getSingleCar = async (id) => {
//      const aggregateFilter = [
//           {
//                $match: {
//                     _id: mongoose.Types.ObjectId(id), // convert the string id to an ObjectId
//                },
//           },
//           {
//                $lookup: {
//                     from: 'carfeatures', // the name of the collection to join with
//                     localField: 'carFeatures_id',
//                     foreignField: '_id',
//                     as: 'carFeature', // the name of the array to store the joined documents
//                },
//           },
//           {
//                $lookup: {
//                     from: 'carbrands',
//                     localField: 'carBrand_id',
//                     foreignField: '_id',
//                     as: 'carBrand',
//                },
//           },
//           {
//                $lookup: {
//                     from: 'leasetypes',
//                     localField: 'leaseType_id',
//                     foreignField: '_id',
//                     as: 'leaseType',
//                },
//           },
//      ];

//      const result = await carDetailModel.aggregate(aggregateFilter);

//      return result;
// };

const getSingleCar = async (
     id,
     contractLengthInMonth,
     annualMileage,
     upfrontPayment,
     includeMaintenance
) => {
     try {
          // // Find the car in the database using its ID
          const carDetails = await carDetailModel.findById({ _id: id });

          const { leaseType_id, price } = carDetails;

          // calculate base price
          let basePrice = price;

          // Retrieve lease type details using leaseTypeId from leasetypes collection
          const leaseTypes = await leaseTypeModel.findById({
               _id: leaseType_id,
          });

          if (!leaseTypes) {
               throw new Error('Lease type details not found');
          }
          const { leaseType } = leaseTypes;

          switch (leaseType) {
               case 'flexi':
                    if (contractLengthInMonth === 6) {
                         basePrice *= 0.8;
                    } else if (contractLengthInMonth === 12) {
                         basePrice *= 0.7;
                    } else if (contractLengthInMonth === 24) {
                         basePrice *= 0.6;
                    } else if (contractLengthInMonth === 36) {
                         basePrice *= 0.5;
                    }
                    break;
               case 'longTerm':
                    if (contractLengthInMonth === 12) {
                         basePrice *= 0.6;
                    } else if (contractLengthInMonth === 24) {
                         basePrice *= 0.5;
                    } else if (contractLengthInMonth === 36) {
                         basePrice *= 0.4;
                    } else if (contractLengthInMonth === 48) {
                         basePrice *= 0.4;
                    }
                    break;
          }

          // convert to monthly price
          let perMonthPrice = basePrice / contractLengthInMonth;

          // apply annualMileage factor
          switch (annualMileage) {
               case 4000:
                    perMonthPrice *= 0.9; // 10% discount for 4,000 annual mileage
                    break;
               case 6000:
                    // no discount or markup for 6,000 annual mileage
                    break;
               case 8000:
                    perMonthPrice *= 1.05; // 5% markup for 8,000 annual mileage
                    break;
               case 10000:
                    perMonthPrice *= 1.1; // 10% markup for 10,000 annual mileage
                    break;
               case 12000:
                    perMonthPrice *= 1.2; // 20% markup for 12,000 annual mileage
                    break;
          }

          // apply upfrontPayment factor
          switch (upfrontPayment) {
               case 1:
                    perMonthPrice *= 1.1; // 10% markup for 1-month upfront payment
                    break;
               case 3:
                    // no discount or markup for 3-month upfront payment
                    break;
               case 6:
                    perMonthPrice *= 0.95; // 5% discount for 6-month upfront payment
                    break;
               case 9:
                    perMonthPrice *= 0.9; // 10% discount for 9-month upfront payment
                    break;
               case 12:
                    perMonthPrice *= 0.85; // 15% discount for 12-month upfront payment
                    break;
               default:
                    throw new Error('Invalid upfront payment.');
          }

          if (upfrontPayment > 0) {
               let remainingLeaseMonths =
                    contractLengthInMonth - upfrontPayment;
               if (remainingLeaseMonths > 0) {
                    let remainingLeasePrice =
                         perMonthPrice * remainingLeaseMonths;
                    perMonthPrice = remainingLeasePrice / remainingLeaseMonths;
               }
          }

          // apply maintenance factor
          if (includeMaintenance) {
               perMonthPrice *= 1.1; // 10% markup for maintenance inclusion
          }

          // return total price
          let monthlyLeasePrice = perMonthPrice.toFixed();

          return {
               carDetails: carDetails,
               leaseType: leaseType,
               contractLengthInMonth: contractLengthInMonth,
               annualMileage: annualMileage,
               upfrontPayment: upfrontPayment,
               includeMaintenance: includeMaintenance,
               monthlyLeasePrice: monthlyLeasePrice,
          };
     } catch (error) {
          throw new Error(error.message);
     }
};

const generatePdf = async (
     id,
     leaseType,
     contractLengthInMonth,
     annualMileage,
     upfrontPayment,
     includeMaintenance,
     monthlyLeasePrice
) => {
     try {
          // Find the car in the database using its ID
          const car = await carDetailModel.findById({ _id: id });
          const pdfDoc = new PDFDocument({ margin: 50 });

          pdfDoc.image('public/LeasePlan_Logo.jpg', 50, 50, {
               fit: [100, 100],
          });

          pdfDoc.fontSize(20).text('Lease Plan Emirates LLC', {
               align: 'center',
          });
          pdfDoc.fontSize(12).text('Abu Dhabi - United Arab Emirates', {
               align: 'center',
          });
          pdfDoc.moveDown();

          pdfDoc
               .fontSize(16)
               .text('Car Lease Summary', { align: 'center' })
               .fontSize(12)
               .text(`Dated: ${new Date().toLocaleDateString()}`, {
                    align: 'right',
               });

          pdfDoc.moveDown();

          // Set the column styling
          pdfDoc.lineWidth(0.5);
          pdfDoc.fillColor('#000000');
          pdfDoc.strokeColor('#000000');
          pdfDoc.font('Helvetica-Bold');

          const column1X = 50;
          const column2X = 350;
          const rowSpacing = 25;

          // Add the data in a column-wise form
          pdfDoc.text('Fuel Type:', column1X, pdfDoc.y);
          pdfDoc.text(car.fuelType, column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Price:', column1X, pdfDoc.y);
          pdfDoc.text(car.price + ' AED', column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Lease Type:', column1X, pdfDoc.y);
          pdfDoc.text(leaseType, column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Contract Length:', column1X, pdfDoc.y);
          pdfDoc.text(contractLengthInMonth + ' months', column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Annual Mileage:', column1X, pdfDoc.y);
          pdfDoc.text(annualMileage + ' km', column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Upfront Payment:', column1X, pdfDoc.y);
          pdfDoc.text(upfrontPayment + ' AED', column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Include Maintenance:', column1X, pdfDoc.y);
          pdfDoc.text(includeMaintenance ? 'Yes' : 'No', column2X, pdfDoc.y);

          pdfDoc.moveDown();
          pdfDoc.text('Monthly Lease Price:', column1X, pdfDoc.y);
          pdfDoc.text(monthlyLeasePrice + ' AED', column2X, pdfDoc.y);

          // End and save the PDF document
          pdfDoc.end();
          pdfDoc.pipe(fs.createWriteStream('car_lease_summary.pdf'));

          // Wait for the PDF document to be fully written
          const pdfBuffer = await new Promise((resolve, reject) => {
               const chunks = [];
               pdfDoc.on('data', (chunk) => {
                    chunks.push(chunk);
               });
               pdfDoc.on('end', () => {
                    resolve(Buffer.concat(chunks));
               });
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
          const carDetail = await carDetailModel.findById(id);
          const currentImages = carDetail.image;

          // If new images were provided, update them in the data object
          if (data.image && Array.isArray(data.image)) {
               // Replace old images with new ones
               data.image.forEach((newImage, index) => {
                    if (newImage.publicId) {
                         // Check if new image has a public ID (i.e. it was uploaded to Cloudinary)
                         const matchingImage = currentImages.find(
                              (oldImage) =>
                                   oldImage.publicId === newImage.publicId
                         );
                         if (matchingImage) {
                              // If a matching image was found, replace it with the new image
                              currentImages.splice(
                                   currentImages.indexOf(matchingImage),
                                   1,
                                   newImage
                              );
                              data.image[index] = matchingImage;
                         } else {
                              // Otherwise, add the new image to the array
                              currentImages.push(newImage);
                         }
                    }
               });
          } else {
               data.image = currentImages;
          }
          // Update the document with the new data
          const response = await carDetailModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               { new: true }
          );
          return response;
     } catch (error) {
          console.log(error);
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

const getCount = async (query) => {
     const count = await carDetailModel.countDocuments(query);

     return count;
};

export const CarServices = {
     getAllCar,
     addNewCar,
     generatePdf,
     updateCar,
     deleteCar,
     getSingleCar,
     getCount,
};
