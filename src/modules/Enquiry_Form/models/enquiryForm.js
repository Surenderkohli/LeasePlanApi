import mongoose from 'mongoose';

const EnquiryFormSchema = new mongoose.Schema(
     {
          title: {
               type: String,
               enum: ['mr', 'mrs', 'miss', 'ms'],
          },
          firstName: String,
          lastName: String,
          mobileNumber: Number,
          emailAddress: String,
          questions: String,
          receiveUpdates: { type: Boolean, default: false },
          carOffers_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'caroffers',
               required: false,
          },
          htmlTemplate: String,
     },
     {
          timestamps: true,
     }
);

const enquiryFormModel = mongoose.model('enquiryforms', EnquiryFormSchema);

export default enquiryFormModel;
