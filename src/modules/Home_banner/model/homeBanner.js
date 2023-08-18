import mongoose from 'mongoose';

const homebannerSchema = new mongoose.Schema(
     {
          homebanner_id: {
               type: Number,
          },

          image: {
               type: String,
               data: Buffer,
          },
          imageUrl: {
               type: String,
               required: false,
          },
          publicId: {
               type: String,
               required: false,
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
          link: {
               type: String,
               required: false,
          },
          status: {
               type: String,
               enum: ['active', 'inactive'],
               default: 'inactive',
          },
     },
     { timestamps: true }
);

const homeBannerModel = mongoose.model('homebanners', homebannerSchema);

export default homeBannerModel;
