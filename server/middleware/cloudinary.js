const  { v2:cloudinary } = require("cloudinary");
const fs = require('fs');

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudinaryUplaod = async (path) => {
  if(!path) return null
  const response = await cloudinary.uploader.upload(path, {
    resource_type: 'auto',
  });
  if(response?.url){
    fs.unlinkSync(path)
  }
  return response;
};

module.exports = { cloudinaryUplaod };