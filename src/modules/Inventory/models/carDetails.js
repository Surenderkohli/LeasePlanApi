import mongoose from 'mongoose';

const carDetailSchema = new mongoose.Schema(
     {
          carSeries_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carSeries',
          },
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carBrand',
          },
          leaseType_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'leaseType',
          },
          carFeatures_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carFeature',
          },
          description: String,
          imageUrls: [
               {
                    type: String,
                    required: false,
               },
          ],
          price: Number,
          // bodyType: {
          //      type: String,
          //      enum: [
          //           'city-car',
          //           'coupe',
          //           'estate',
          //           'sedan',
          //           'hatchback',
          //           'mpv',
          //           'saloon',
          //           'sports',
          //      ],
          // },
          yearModel: {
               type: Number,
               required: false,
          },
          // door: Number,
          // seat: Number,
          // gears: {
          //      type: String,
          //      required: false,
          //      default: '6 SPEED',
          // },
          // milesPerGallon: Number,
          annualMileage: {
               type: Number,
               enum: [4000, 6000, 8000, 10000, 12000],
          },
          acceleration: {
               type: String,
               required: false,
               default: '0-62 mph 9.4 seconds',
          },
          co2: Number,
          fuelType: {
               type: String,
               enum: ['petrol', 'diesel', 'hybrid', 'electric'],
          },
          // transmission: {
          //      type: String,
          //      enum: ['automatic', 'manual'],
          // },
          contractLengthInMonth: {
               type: Number,
               enum: [6, 12, 24, 36, 48, 60],
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          priceMin: {
               type: Number,
               required: false,
          },
          priceMax: {
               type: Number,
               required: false,
          },
          // deals: {
          //      type: String,
          //      enum: ['active', 'inactive'],
          //      default: 'inactive',
          // },
          monthlyCost: {
               type: Number,
               required: false,
          },
     },

     { timestamps: true }
);

export default mongoose.model('carDetails', carDetailSchema);

/* 
const carSchema = new mongoose.Schema({
     leaseType: {
          type: String,
          enum: ['Private Lease', 'FlexiPlan', 'Business Lease'],
          required: true,
     },
     makeCode: {
          type: Number,
          required: true,
     },
     modelCode: {
          type: Number,
          required: true,
     },
     makeDescription: {
          type: String,
          required: true,
     },
     modelDescription: {
          type: String,
          required: true,
     },
     yearModel: {
          type: Number,
          required: true,
     },
     duration: {
          type: Number,
          required: true,
     },
     mileagePerYear: {
          type: Number,
          required: true,
          min: 0,
     },
     monthlyCost: {
          type: Number,
          required: true,
          min: 0,
     },
     calculationNo: {
          type: Number,
          required: true,
     },
     imageUrls: [
          {
               type: String,
               required: false,
          },
     ],
});
 */

/* 
const carDetailSchema = new mongoose.Schema(
     {
          carSeries_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carSeries',
          },
          carBrand_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carBrand',
          },
          leaseType_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'leaseType',
          },
          carFeatures_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'carFeature',
          },
          description: String,
          image: {
               type: [],
               data: Buffer,
               required: false,
          },
          imageUrl: {
               type: String,
               required: false,
          },
          publicId: {
               type: String,
               required: false,
          },
          price: Number,
          bodyType: {
               type: String,
               enum: [
                    'city-car',
                    'coupe',
                    'estate',
                    'sedan',
                    'hatchback',
                    'mpv',
                    'saloon',
                    'sports',
               ],
          },
          door: Number,
          seat: Number,
          gears: {
               type: String,
               required: false,
               default: '6 SPEED',
          },
          milesPerGallon: Number,

          co2: Number,
          fuelType: {
               type: String,
               enum: ['petrol', 'diesel', 'hybrid', 'electric'],
          },
     },

     { timestamps: true }
);
 */
/* 


// Multer configuration for CSV upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.post('/car-details', upload.single('csv'), async (req, res) => {
  try {
    let carDetails = [];

    if (req.file && req.file.mimetype === 'text/csv') {
      // CSV upload
      const csvString = req.file.buffer.toString('utf8');
      const carDetailData = await csv().fromString(csvString);

      for (let i = 0; i < carDetailData.length; i++) {
        const carDetail = await createCarDetail(carDetailData[i]);
        carDetails.push(carDetail);
      }
    } else {
      // Manual upload
      const carDetailData = req.body;
      const carDetail = await createCarDetail(carDetailData);
      carDetails.push(carDetail);
    }

    res.status(201).json({ message: 'Car details added successfully', data: carDetails });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});
*/

/* 


const CarDetail = require('../models/carDetail');
const LeaseType = require('../models/leaseType');
const CarBrand = require('../models/carBrand');
const CarSeries = require('../models/carSeries');

const createCarDetail = async (carDetailData) => {
 try {
    const jsonArray = await csv().fromFile(file.path);

    for (let i = 0; i < jsonArray.length; i++) {
      const carDetailData = jsonArray[i];

      // Query the database for matching records based on the names provided in the CSV file
      const leaseType = await LeaseType.findOne({ name: carDetailData.leaseType });
      const carBrand = await CarBrand.findOne({ name: carDetailData.carBrand });
      const carSeries = await CarSeries.findOne({ name: carDetailData.carSeries });

      // Create the new car detail entry using the retrieved IDs
      const newCarDetail = new CarDetail({
        leaseType_id: leaseType._id,
        carBrand_id: carBrand._id,
        carSeries_id: carSeries._id,
        description: carDetailData.description,
        image: carDetailData.image,
        imageUrl: carDetailData.imageUrl,
        publicId: carDetailData.publicId,
        price: carDetailData.price,
        bodyType: carDetailData.bodyType,
        door: carDetailData.door,
        seat: carDetailData.seat,
        gears: carDetailData.gears,
        milesPerGallon: carDetailData.milesPerGallon,
        co2: carDetailData.co2,
        fuelType: carDetailData.fuelType,
      });

      await newCarDetail.save();
    }

    return 'Car details uploaded successfully';
  } catch (error) {
    console.log(error);
    throw new Error('Car details upload failed');
  }
};

module.exports = {
  createCarDetail,
};
*/

/*
No, the code snippet you provided maps the carSeries_id, carBrand_id, and leaseType_id fields to their respective ObjectId references in the carSeries, carBrand, and leaseType collections in MongoDB.

If you have a CSV file with the names of these entities (i.e., carSeries, carBrand, and leaseType) and you want to map them to their respective ObjectId references in your code, you would need to perform a lookup in the corresponding collections and retrieve the _id field of the matching document.

For example, if you have a CSV file with the name of a carSeries called "Toyota Corolla", you would need to perform a lookup in the carSeries collection to find the corresponding document with the name field equal to "Toyota Corolla", retrieve its _id field, and assign that value to the carSeries_id field in your code. The same process would apply for carBrand and leaseType entities. 

¸ˀ*/
