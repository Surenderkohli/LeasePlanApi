// // git commit -m "Add comment.js file in models inventory v-1"
// //------------------------------------------------------------------------------------------carDetails.js-----------------------------------------------------------------------------------
// //enum: ['Private Lease', 'FlexiPlan', 'Business Lease'],

// const carDetailSchema = new mongoose.Schema({
//      carSeries_id: {
//           type: mongoose.Schema.ObjectId,
//           ref: 'carSeries',
//      },
//      carBrand_id: {
//           type: mongoose.Schema.ObjectId,
//           ref: 'carBrand',
//      },
//      // leaseType_id: [
//      //      {
//      //           type: mongoose.Schema.ObjectId,
//      //           ref: 'leaseType',
//      //      },
//      // ],
//      yearModel: {
//           type: Number,
//           required: false,
//      },
//      // carFeatures_id: {
//      //      type: mongoose.Schema.ObjectId,
//      //      ref: 'carFeature',
//      // },
//      description: String,
//      // price: Number,
//      door: Number,

//      // milesPerGallon: Number,
// });

// export default mongoose.model('carDetails', carDetailSchema);

// //------------------------------------------------------------------------------------------carDetails.js-----------------------------------------------------------------------------------

// const carOfferSchema = new mongoose.Schema(
//      {
//           carSeries_id: {
//                type: mongoose.Schema.ObjectId,
//                ref: 'carSeries',
//           },
//           carBrand_id: {
//                type: mongoose.Schema.ObjectId,
//                ref: 'carBrand',
//           },
//           leaseType_id: [
//                {
//                     type: mongoose.Schema.ObjectId,
//                     ref: 'leaseType',
//                },
//           ],
//           yearModel: {
//                type: Number,
//                required: false,
//           },
//           annualMileage: Number,
//           duration: {
//                type: Number,
//                enum: [6, 12, 24, 36, 48, 60],
//           },
//           monthlyCost: Number,
//           deals: {
//                type: String,
//                enum: ['active', 'inactive'],
//                default: 'inactive',
//           },
//      },

//      { timestamps: true }
// );
