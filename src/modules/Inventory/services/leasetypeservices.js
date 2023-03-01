import leasetypemodel from "../models/leaseTypemodel.js";


const getAllleasetype = async () => {
    const response = await leasetypemodel.find();
    return response;

};

// const addNewleasetype = async (data,reqfile) => {
//     let carimage = []
//      reqfile.map((img)=>{
//            carimage.push(img.filename)
//     })
//     const response = await leasetypemodel.create({...data,img:carimage});
//    return response;
// };

const addNewleasetype = async(data)=>{
    const response = await leasetypemodel.create({leasetypename:data.leasetypename});
    return response;
}

const getSingleleasetype = async (id) => {
    const response = await leasetypemodel.findById({_id:id});
    return response
};


const updateleasetype = async (id,data) => {
    const response = await leasetypemodel.updateOne({leasetype_id:data.leasetype_id}, {data});
    return response;
};

const deleteleasetype = async (id) => {
    const response = await leasetypemodel.remove({_id:id},{is_deleted:true});
    return response;
};

export const leasetypeService = {
    getAllleasetype, getSingleleasetype,updateleasetype,deleteleasetype,addNewleasetype

};



