import enquiryFormModel from '../models/enquiryForm.js';

const addForm = async (data) => {
     const response = await enquiryFormModel.create(data);
     return response;
};

const getAllForm = async () => {
     const response = await enquiryFormModel.find();
     return response;
};

const getSingleForm = async (id) => {
     const response = await enquiryFormModel.findById(id);
     return response;
};

export const enquiryFormService = {
     addForm,
     getAllForm,
     getSingleForm,
};
