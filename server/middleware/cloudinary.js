const  { v2:cloudinary } = require("cloudinary");
const fs = require('fs');

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUplaod = async (path, options = {}) => {
  try {
    if (!path) return null;
    
    // Default optimization settings
    const defaultOptions = {
      resource_type: 'auto',
      quality: 'auto:good', // Automatically optimize quality
      fetch_format: 'auto', // Automatically choose best format (WebP, AVIF, etc.)
      transformation: [
        {
          width: 1200, // Max width
          height: 1200, // Max height
          crop: 'limit', // Don't upscale, only downscale if needed
          quality: 'auto:good',
          format: 'auto'
        }
      ],
      ...options // Allow custom options to override defaults
    };

    const response = await cloudinary.uploader.upload(path, defaultOptions);
    
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