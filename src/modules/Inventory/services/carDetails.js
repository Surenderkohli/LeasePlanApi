import cardetailmodel from "../models/cardetailmodel.js";

const getAllCar = async () => {
    const response = await cardetailmodel.find().populate("carseries_id")
    return response
};

const addNewCar = async (data) => {
    // let carimage = []
    // reqfile.map((img) => {
    //     carimage.push(img.filename)
    // })
    const response = await cardetailmodel.create(data);
    return response;
};

const getSingleCar = async (id) => {
    const response = await cardetailmodel.findById({ _id: id });
    return response
};


const updateCar = async (id, data) => {
    const response = await cardetailmodel.updateOne({ Car_id: data.Car_id }, { data });
    return response;

};

const deleteCar = async (id) => {
    const response = await cardetailmodel.remove({ _id: id }, { is_deleted: true });
    return response;

};

export const CarServices = {
    getAllCar, addNewCar, getSingleCar, updateCar, deleteCar

};
