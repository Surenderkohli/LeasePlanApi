import mongoose from 'mongoose';

const userRegisterSchema = new mongoose.Schema({
   
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    phonenumber:Number,
    address:String,
     profile:{
        type:String,
        data:Buffer
    },
    
    roles:{
        type:String,
        enum:['superadmin','admin','user'],
        default: 'user'
    },

    is_deleted:{
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



export default mongoose.model('userregister', userRegisterSchema);





