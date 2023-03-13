import mongoose from 'mongoose';

const QueryDetailsSchema = new mongoose.Schema(
     {
          name: {
               type: 'string',
          },
          details: String,
     },
     {
          timestamps: true,
     }
);

export default mongoose.model('queryDetails', QueryDetailsSchema);
