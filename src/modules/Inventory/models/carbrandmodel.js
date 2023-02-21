import mongoose from 'mongoose';

const carbrandSchema = new mongoose.Schema(
    {
        carbrand_id:String,
        companyname:String,
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

