import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    inventory_id:String,
    longtermPlan: {
        duration: {
            type: Number,
            enum: [12, 24, 36, 48]
        },
        carprice: {
            type: Number,
        },
    },

    shorttermPlan: {
        duration: {
            type: Number,
            enum: [6, 12, 18, 24]
        },
        carprice: {
            type: Number
        },
    },
    company_name:String,
    series_name:String, 
    description: String,
    img: {
        type: String,
        data: Buffer
    },
    bodytype:String,
    door: Number,
    seat: Number,
    mileage: Number,
    co2: Number,
    milespergallon:Number,
    fueltype: {
        type: String,
        enum: ['petrol', "electic", "hybrid", "diesel"]
    },
    transmission: {
        type: String,
        enum: ['automatic', 'manual']
    },

    islongtermPlan: false,

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



export default mongoose.model('inventory', inventorySchema);





