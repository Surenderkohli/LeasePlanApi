
import userRegister from "../models/userRegister.js"


const getAllUser = async()=>{
    const response = await userRegister.find()
    return response;
}

const getSingleUser = async(id)=>{
    const response = await userRegister.findById({_id:id})
    return response;
}

const addNewUser = async (data, reqfile) => {
    const response = await userRegister.create({...data, profile: reqfile })
    return response;
}




export const userServices = {
    addNewUser,getAllUser,getSingleUser
}