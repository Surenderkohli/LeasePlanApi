import homeBannerModel from '../model/homebanner_model.js';

const getAllBanner = async () => {
     const response = await homeBannerModel.find({ is_deactivated: false });
     return response;
};

const addNewBanner = async (data, reqfile) => {
     const response = await homeBannerModel.create({
          ...data,
          banner: reqfile,
     });
     return response;
};

const getSingleBanner = async (id) => {
     const response = await homeBannerModel.findById({ _id: id });
     return response;
};

const updateBanner = async (id, data) => {
     try {
          const response = await homeBannerModel.findByIdAndUpdate(
               { _id: id },
               data,
               {
                    new: true,
               }
          );

          return response;
     } catch (error) {
          res.send({ status: 400, success: false, msg: error.message });
     }
};

const deleteBanner = async (id) => {
     const response = await homeBannerModel.findOneAndDelete(
          { _id: id },
          { is_deleted: true }
     );
     return response;
};

export const bannerService = {
     addNewBanner,
     getAllBanner,
     getSingleBanner,
     updateBanner,
     deleteBanner,
};
