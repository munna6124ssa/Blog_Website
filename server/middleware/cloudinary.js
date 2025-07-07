const  { v2:cloudinary } = require("cloudinary");
const fs = require('fs');

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUplaod = async (path) => {
  try {
    if (!path) return null;
    
    const response = await cloudinary.uploader.upload(path, {
      resource_type: 'auto',
    });
    
    // Clean up the local file after successful upload
    if (response?.url && fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    
    return response;
  } catch (error) {
    // Clean up the local file even if upload fails
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    throw error;
  }
};

module.exports = { cloudinaryUplaod };