import mongoose from 'mongoose';

const QueryDetailsSchema = new mongoose.Schema({
     longTerm: {
          details: String,
          required: false,
     },
     flexi: {
          details: String,
          required: false,
     },
});

export default mongoose.model('queryDetails', QueryDetailsSchema);
