import mongoose from 'mongoose';

const homebannerSchema = new mongoose.Schema(
     {
          homebanner_id: {
               type: Number,
          },

          banner: {
               type: String,
               data: Buffer,
          },
          title: {
               type: String,
          },
          description: {
               type: String,
          },

          is_deleted: {
               type: Boolean,
               default: false,
          },
          is_deactivated: {
               type: Boolean,
               default: false,
          },
          from: {
               type: Number,
          },
          to: {
               type: Number,
          },
     },
     { timestamps: true }
);

export default mongoose.model('homeBanner', homebannerSchema);
