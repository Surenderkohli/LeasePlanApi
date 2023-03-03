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
          // const filter = { $text: { $search: companyName } };

          // const filter = { $regex: `.*${companyName}.*`, $options: 'i' };
          const filter = {};

          if (fuelType) {
               filter['fuelType'] = fuelType;
          }
          if (priceMin || priceMax) {
               filter['price'] = {};
               if (priceMin) {
                    filter['price'].$gte = parseInt(priceMin);
               }
               if (priceMax) {
                    filter['price'].$lte = parseInt(priceMax);
               }
          }

          if (bodyType) filter['bodyType'] = bodyType;

          // const response = await carDetailModel
          //      .find(filter)
          //      .populate(['carSeries_id', 'carBrand_id']);

          const response = await carDetailModel.aggregate([
               { $unwind: '$carBrand_id' },
               { $match: filter },
               {
                    $lookup: {
                         from: 'carbrands',
                         localField: 'carBrand_id',
                         foreignField: '_id',
                         as: 'carBrand',
                    },
               },
               {
                    $unwind: '$carBrand',
               },
               {
                    $match: {
                         'carBrand.companyName': {
                              $regex: `.*${companyName}.*`,
                              $options: 'i',
                         },
                    },
               },
          ]);

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

          // Apply filters to the lease type
          if (leaseType === 'flexi') {
               car.leaseType = 'Flexi';
               car.minLeaseTerm = '6 months';
               car.maxLeaseTerm = '12 months';
          } else if (leaseType === 'long-term') {
               car.leaseType = 'Long-Term';
               car.minLeaseTerm = '12 months';
               car.maxLeaseTerm = '24 months';
               throw new Error('Invalid lease type');
          }

          if (maintenanceOption) {
               // car.maintenanceOption = 'With Maintenance';
               car.maintenanceOption = 500; // Add a fixed charge of $500 for maintenance
          } else {
               // car.maintenanceOption = 'No Maintenance';
               car.maintenanceOption = 0; // No additional charge for no maintenance
          }

          // Calculate the total price
          car.totalPrice = car.leasePrice + car.maintenanceOption;

          // Generate a PDF summary of the selected options
          const doc = new PDFDocument();
          doc.pipe(fs.createWriteStream(`./summary_${car._id}.pdf`));
          doc.fontSize(16).text('Car Summary');
          doc.text(`Car Details - ${car.model}`);
          doc.text(`Lease Type: ${car.leaseType}`);
          doc.text(`Lease Term: ${car.minLeaseTerm} - ${car.maxLeaseTerm}`);
          doc.text(`Annual Mileage: ${car.mileage}`);
          doc.text(`Maintenance: ${car.maintenanceOption}`);
          doc.text(`Total Price: $${car.totalPrice.toFixed(2)}`);
          doc.end();

          // Save the PDF summary in MongoDB
          const summary = fs.readFileSync(`summary_${id}.pdf`);
          const summaryDoc = {
               id,
               leaseType,
               contractLength,
               mileage,
               upfrontPayment,
               maintenanceOption,
               summary,
          };
          await carDetailModel.create(summaryDoc);

          return {
               price: car.price,
               summary: car.summary,
               maintenanceOption: car.maintenanceOption,
               upfrontPayment: car.upfrontPayment,
               totalPrice: totalPrice.toFixed(2),
          };
     } catch (error) {
          // res.send({ status: 400, success: false, msg: error.message });
          console.log(error);
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
     getSingleCar,
     updateCar,
     deleteCar,
};
