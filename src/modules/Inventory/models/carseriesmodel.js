import mongoose from 'mongoose';

const cardetailSchema = new mongoose.Schema(
     {
        series_id:String,
        series_name:{
            name:String,
        },
        description:String,
        img:{
            type:String,
            data:buffer
        },
        price:Number,
        door:Number,
        seat:Number,
        mileage:Double,
        co2:Double,
        fueltype:{
            type:String,
            enum:['petrol',"electic","hybrid","diesel"]
        },
        transmission:{
            type:String,
            enum:['automatic','manual']
        },

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



export default mongoose.model('cardetail', carseriesSchema);

