import PDFDocument from 'pdfkit';
import fs from 'fs';
import carDetailModel from '../models/carDetails.js';

const getAllCar = async (
     fuelType,
     priceMin,
     priceMax,
     bodyType,
     mileage,
     companyName
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
                    $unwind: '$carBrand',
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

          const response = await carDetailModel.aggregate(aggregateFilter);

          return response;
     } catch (error) {
          console.log(error);
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const addNewCar = async (data, reqfile) => {
     try {
          let carimage = [];
          reqfile.map((img) => {
               carimage.push(img.filename);
          });
          const response = await carDetailModel.create({
               ...data,
               img: reqfile,
          });
          return response;
     } catch (error) {
          console.log(error);
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const getSingleCar = async (id, leaseType, mileage, maintenanceOption) => {
     try {
          // Find the car in the database using its ID
          const car = await carDetailModel.findById({ _id: id });

          // calculate the base price of the car based on lease type and contract lengths
          let basePrice;
          if (leaseType === 'flexi') {
               basePrice = car.flexiPrice * contractLength;
          } else if (leaseType === 'long-term') {
               basePrice = car.longTermPrice * contractLength;
          } else {
               throw new Error('Invalid lease type');
          }

          // calculate the price based on annual mileage
          if (annualMileage > 0) {
               basePrice += car.pricePerMile * annualMileage * contractLength;
          }

          // calculate the price based on upfront payment
          if (upfrontPayment > 0) {
               basePrice -= (upfrontPayment / 100) * basePrice;
          }

          // add maintenance cost if it is included
          if (includeMaintenance) {
               basePrice += car.maintenanceCost * contractLength;
          }

          return {
               car: car,
               leaseType: leaseType,
               contractLength: contractLength,
               annualMileage: annualMileage,
               upfrontPayment: upfrontPayment,
               includeMaintenance: includeMaintenance,
               totalPrice: basePrice,
          };
     } catch (error) {
          // res.send({ status: 400, success: false, msg: error.message });
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

// const getPdf = async (id) => {
//      try {
//           // Generate a PDF summary of the selected options
//           const doc = new PDFDocument();
//           doc.pipe(fs.createWriteStream(`./summary_${car._id}.pdf`));
//           doc.fontSize(16).text('Car Summary');
//           doc.text(`Car Details - ${car.model}`);
//           doc.text(`Lease Type: ${car.leaseType}`);
//           doc.text(`Lease Term: ${car.minLeaseTerm} - ${car.maxLeaseTerm}`);
//           doc.text(`Annual Mileage: ${car.mileage}`);
//           doc.text(`Maintenance: ${car.maintenanceOption}`);
//           doc.text(`Total Price: $${car.totalPrice.toFixed(2)}`);
//           doc.end();

//           // Save the PDF summary in MongoDB
//           const summary = fs.readFileSync(`summary_${id}.pdf`);
//           const summaryDoc = {
//                id,
//                leaseType,
//                contractLength,
//                mileage,
//                upfrontPayment,
//                maintenanceOption,
//                summary,
//           };
//           await carDetailModel.create(summaryDoc);

//           return {
//                price: car.price,
//                summary: car.summary,
//                maintenanceOption: car.maintenanceOption,
//                upfrontPayment: car.upfrontPayment,
//                totalPrice: totalPrice.toFixed(2),
//           };
//      } catch (error) {
//           res.send({ status: 400, success: false, msg: error.message });
//      }
// };

export const CarServices = {
     getAllCar,
     addNewCar,
     getSingleCar,
     updateCar,
     deleteCar,
};
