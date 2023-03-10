import homeBannerModel from '../model/homeBanner.js';

const getAllBanner = async () => {
     const response = await homeBannerModel.find({ is_deactivated: false });
     return response;
};

const addNewBanner = async (data, bannerData) => {
     try {
          const response = await homeBannerModel.create({
               ...data,
               ...bannerData,
          });
          return response;
     } catch (error) {
          throw new Error('An error occurred while creating ');
     }
};

const getSingleBanner = async (id) => {
     const response = await homeBannerModel.findById({ _id: id });
     return response;
};

const updateBanner = async (id, data) => {
     try {
          const response = await homeBannerModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               {
                    new: true,
               }
          );

          return response;
     } catch (error) {
          console.log(error);
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
