import mongoose from 'mongoose';

const QueryDetailsSchema = new mongoose.Schema({
     longTerm: String,
     flexi: String,
     is_deleted: {
          type: Boolean,
          default: false,
     },
});

export default mongoose.model('queryDetails', QueryDetailsSchema);
