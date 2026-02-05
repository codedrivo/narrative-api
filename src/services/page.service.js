const ApiError = require('../helpers/apiErrorConverter');
const Page = require('../models/page.model');
const Settings = require('../models/setting.model');

const viewPage = async (slug) => {
  try {
    const result = await Page.findOne({ slug: slug });
    if (!result) {
      throw new ApiError('Data not found', 404);
    }
    return result;
  } catch (e) {
    throw new ApiError(e.message, 500);
  }
};

const viewSettings = async () => {
  const result = await Settings.findOne().select('bannerLeftPersonImage bannerRightPersonImage bannerLeftPersonEvent bannerLeftPersonName bannerRightPersonName bannerRightPersonEvent -_id');
  if (result.length === 0) {
    throw new ApiError('Data not found', 404);
  }
  return result;
};

module.exports = {
  viewPage,
  viewSettings
};
