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
     },
     {
          timestamps: true,
     }
);

export default mongoose.model('enquiryForm', EnquiryFormSchema);
