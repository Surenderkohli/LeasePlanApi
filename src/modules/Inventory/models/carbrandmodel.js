import mongoose from 'mongoose';

const carbrandSchema = new mongoose.Schema(
    {
        leasetype_id:{
            type:mongoose.Schema.ObjectId,
            ref:"leasetype",
            required:true,
        },
        companyname: String,
        is_deleted: {
            type: Boolean,
            default: false,
        },
        is_deactivated: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('carbrand', carbrandSchema);

