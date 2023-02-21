import inventorymodel from "../models/inventorymodel.js";


const getAllInventory = async () => {
    const response = await inventorymodel.find();
    return response

};

const addNewInventory = async (data,reqfile) => {
    const response = await inventorymodel.create({...data,img:reqfile});
   return response;
};

const getSingleInventory = async (id) => {
    const response = await inventorymodel.findById({_id:id});
    return response
};


const updateInventory = async (id,data) => {
    const response = await inventorymodel.updateOne({ inventory_id:data.inventory_id}, {data});
    return response;

};

const deleteInventory = async (id) => {
    const response = await inventorymodel.remove({_id:id},{is_deleted:true});
    return response;

};

export const inventoryService = {
    getAllInventory, addNewInventory, getSingleInventory,updateInventory,deleteInventory

};



