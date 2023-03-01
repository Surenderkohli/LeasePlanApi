import mongoose from 'mongoose';

const carbrandSchema = new mongoose.Schema(
    {
       
        carbrand_id:{
            type: mongoose.Schema.ObjectId,
            ref: "carbrand"
        },
        series_id: String,
        seriesname: {
            type: String,
            required: true
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
      
    },
    { timestamps: true }
);

export default mongoose.model('carseries', carbrandSchema);