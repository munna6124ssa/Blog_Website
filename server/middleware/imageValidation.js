const sharp = require('sharp');
const fs = require('fs');

const validateImageAspectRatio = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // No file uploaded, skip validation
    }

    const { path: filePath } = req.file;
    
    // Get image metadata using Sharp
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;
    
    if (!width || !height) {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid image file'
      });
    }
    
    const aspectRatio = width / height;
    const targetRatio = 3 / 2; // 1.5
    const tolerance = 0.1;
    
    // Check if aspect ratio is close to 3:2
    if (Math.abs(aspectRatio - targetRatio) > tolerance) {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Image must have a 3:2 aspect ratio (recommended: 1200x800px). Current ratio: ${aspectRatio.toFixed(2)}`
      });
    }
    
    // Also enforce minimum dimensions
    if (width < 600 || height < 400) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Image dimensions too small. Minimum: 600x400px'
      });
    }
    
    // Optionally resize to optimal dimensions (1200x800) while maintaining quality
    if (width > 1200 || height > 800) {
      try {
        await sharp(filePath)
          .resize(1200, 800, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toFile(filePath + '_resized');
        
        // Replace original with resized
        fs.unlinkSync(filePath);
        fs.renameSync(filePath + '_resized', filePath);
      } catch (resizeError) {
        // Continue with original image if resize fails
      }
    }
    
    next();
  } catch (error) {
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error validating image'
    });
  }
};

module.exports = { validateImageAspectRatio };
