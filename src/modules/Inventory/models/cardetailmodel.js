import mongoose from 'mongoose';

const cardetailSchema = new mongoose.Schema(
    {
        
        carseries_id:{
            type: mongoose.Schema.ObjectId,
            ref: "carseries"
        },
        description: String,
        img: {
            type: [],
            data: Buffer
        },
        price: Number,
        bodytype: String,
        door: Number,
        seat: Number,
        mileage: Number,
        co2: Number,
        milespergallon: Number,
        fueltype:{
            type: String,
            enum: ['petrol', "electic", "hybrid", "diesel"]
        },
        transmission: {
            type: String,
            enum: ['automatic', 'manual']
        },

        is_deleted: {
            type: Boolean,
            default: false,
        },
      
    },
    { timestamps: true }
);



export default mongoose.model('cardetail', cardetailSchema);

