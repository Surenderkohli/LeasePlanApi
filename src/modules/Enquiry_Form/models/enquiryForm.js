import mongoose from 'mongoose';

const EnquiryFormSchema = new mongoose.Schema(
     {
          title: {
               type: String,
               enum: ['mr', 'mrs', 'miss', 'ms'],
          },
          firstName: String,
          lastName: String,
          mobileNumber: String,
          emailAddress: String,
          questions: String,
          receiveUpdates: { type: Boolean, default: false },
          carOffers_id: {
               type: mongoose.Schema.ObjectId,
               ref: 'caroffers',
               required: false,
          },
          htmlTemplate: String,
          status: {
               type: String,
               // enum: ['active', 'inactive'],
               enum: ['pending', 'approved', 'rejected'],
               default: 'pending',
          },
     },
     {
          timestamps: true,
     }
);

const enquiryFormModel = mongoose.model('enquiryforms', EnquiryFormSchema);

export default enquiryFormModel;
