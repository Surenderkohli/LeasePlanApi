import mongoose from 'mongoose';

const QueryDetailsSchema = new mongoose.Schema({
     longTerm: String,
     flexi: String,
     is_deleted: {
          type: Boolean,
          default: false,
     },
});

const queryDetailModel = mongoose.model('querydetails', QueryDetailsSchema);

export default queryDetailModel;
