import homebanner_model from "../model/homebanner_model.js";


const getAllBanner = async()=>{
    const response = await homebanner_model.find({is_deactivated:true});
    return response;
}

const addNewBanner = async (data,reqfile) => {
    const response = await homebanner_model.create({...data,banner:reqfile});
    return response;
};

const getSingleBanner = async(id)=>{
    const response = await homebanner_model.findById({_id:id})
    return response;
}

const updateBanner = async(id,data)=>{
    const response = await homebanner_model.findByIdAndUpdate( 
        { _id: id },
        { $set:data},
        {newbanner:true}
     )
    return response;
}

const deleteBanner = async(id)=>{
    const response = await homebanner_model.findOneAndDelete({_id:id},{is_deleted:true})
    return response;
}

export const bannerService = {
    addNewBanner,getAllBanner,getSingleBanner,updateBanner,deleteBanner
};
