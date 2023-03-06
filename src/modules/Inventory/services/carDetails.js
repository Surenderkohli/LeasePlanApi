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

const getSingleCar = async (
     id,
     leaseType,
     contractLengthInMonth,
     annualMileage,
     includeMaintenance,
     upfrontPayment
) => {
     try {
          // Find the car in the database using its ID
          const car = await carDetailModel.findById({ _id: id });

          // calculate base price
          let basePrice = car.price;

          if (leaseType === 'flexi') {
               if (![6, 12, 24, 36].includes(contractLengthInMonth)) {
                    throw new Error(
                         'Invalid contractLengthInMonth for flexi lease'
                    );
               }
          } else if (leaseType === 'long-term') {
               if (![12, 24, 36, 48].includes(contractLengthInMonth)) {
                    throw new Error(
                         'Invalid contractLengthInMonth for long-term lease'
                    );
               }
          } else {
               throw new Error('Invalid leaseType');
          }

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
               case 'long-term':
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
               default:
                    throw new Error(
                         'Invalid contractLengthInMonth or leaseType'
                    );
          }

          // apply annualMileageInThousands factor
          switch (annualMileage) {
               case 4:
                    basePrice *= 0.9; // 10% discount for 4,000 annual mileage
                    break;
               case 6:
                    // no discount or markup for 6,000 annual mileage
                    break;
               case 8:
                    basePrice *= 1.05; // 5% markup for 8,000 annual mileage
                    break;
               case 10:
                    basePrice *= 1.1; // 10% markup for 10,000 annual mileage
                    break;
               case 12:
                    basePrice *= 1.2; // 20% markup for 12,000 annual mileage
                    break;
               default:
                    throw new Error('Invalid annualMileage');
          }

          // apply upfrontPayment factor
          switch (upfrontPayment) {
               case 1:
                    basePrice *= 1.1; // 10% markup for 1-month upfront payment
                    break;
               case 3:
                    // no discount or markup for 3-month upfront payment
                    break;
               case 9:
                    basePrice *= 0.95; // 5% discount for 9-month upfront payment
                    break;
               case 12:
                    basePrice *= 0.9; // 10% discount for 12-month upfront payment
                    break;
               default:
                    throw new Error('Invalid upfrontPayment');
          }

          // apply maintenance factor
          if (includeMaintenance) {
               basePrice *= 1.1; // 10% markup for maintenance inclusion
          }

          // return total price
          let sumAll = basePrice.toFixed(2);

          return {
               car: car,
               leaseType: leaseType,
               contractLengthInMonth: contractLengthInMonth,
               annualMileage: annualMileage,
               upfrontPayment: upfrontPayment,
               includeMaintenance: includeMaintenance,
               totalPrice: sumAll,
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
