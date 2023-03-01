import mongoose from 'mongoose';

const leasetypeSchema = new mongoose.Schema({

    leasetypename:{
        type:String
    },
    
    is_deleted: {
        type: Boolean,
        default: false,
    },
  
},
    { timestamps: true }
);



export default mongoose.model('leasetype', leasetypeSchema);





