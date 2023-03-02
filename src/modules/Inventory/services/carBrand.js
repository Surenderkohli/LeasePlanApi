
import carbrandmodel from "../models/carbrandmodel.js";

const getAllCarbrand = async () => {
    const response = await carbrandmodel.find().populate("leasetype_id");
    return response

};

const addNewCarbrand = async (data) => {
    const response = await carbrandmodel.create(data);
    return response;
}

const getSingleCarbrand = async (id) => {
    const response = await carbrandmodel.findById(id);
    return response
};




export const carbrandService = {
    getAllCarbrand, addNewCarbrand, getSingleCarbrand
};
