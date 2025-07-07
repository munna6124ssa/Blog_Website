import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditPostModal = ({ post, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        image: null
      });
      setPreview(post.image || null);
    }
  }, [post]);

  const handleImageCompression = (file) => {
    return new Promise((resolve, reject) => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        reject('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Keep original aspect ratio, just optimize size
          let targetWidth = img.width;
          let targetHeight = img.height;
          
          // Scale down if image is too large (max 1200px width)
          if (targetWidth > 1200) {
            const scaleFactor = 1200 / targetWidth;
            targetWidth = 1200;
            targetHeight = targetHeight * scaleFactor;
          }
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // Function to compress image iteratively until under 100KB
          const compressImage = (quality = 0.9) => {
            canvas.toBlob((blob) => {
              if (blob.size <= 100 * 1024 || quality <= 0.1) {
                // Size is acceptable or quality too low, use this version
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                const previewUrl = canvas.toDataURL('image/jpeg', quality);
                
                resolve({
                  file: optimizedFile,
                  preview: previewUrl,
                  originalSize: file.size,
                  compressedSize: blob.size
                });
                
                if (blob.size > 100 * 1024) {
                  toast.warn(`Image was compressed to fit 100KB limit (${Math.round(blob.size / 1024)}KB)`);
                } else {
                  toast.success(`Image optimized successfully (${Math.round(blob.size / 1024)}KB)`);
                }
              } else {
                // Still too large, reduce quality and try again
                compressImage(quality - 0.1);
              }
            }, 'image/jpeg', quality);
          };
          
          compressImage();
        };
        img.onerror = () => reject('Invalid image file');
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      // Check file size (100KB limit)
      if (file.size > 100 * 1024) {
        reject('Image must be smaller than 100KB');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const targetRatio = 3 / 2; // 1.5
        const tolerance = 0.1;
        
        // Check if aspect ratio is close to 3:2
        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          reject('Image must have a 3:2 aspect ratio (recommended: 1200x800px)');
          return;
        }
        
        resolve();
      };
      img.onerror = () => reject('Invalid image file');
      img.src = URL.createObjectURL(file);
    });
  };

  const handleChange = async (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      
      if (file) {
        try {
          const result = await handleImageCompression(file);
          
          setFormData({
            ...formData,
            image: result.file,
          });
          
          setPreview(result.preview);
          
        } catch (error) {
          toast.error(error);
          e.target.value = ''; // Clear the input
        }
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
      };
      
      // Only include image if a new one was selected
      if (formData.image) {
        submitData.img = formData.image;
      }

      const response = await postAPI.editPost(post._id, submitData);
      
      if (response.data?.success) {
        toast.success('Post updated successfully!');
        onUpdate(); // Refresh the posts
        onClose(); // Close the modal
      }
    } catch (error) {
      // Error handled
      const message = error.response?.data?.message || 'Failed to update post. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter post title..."
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="What's on your mind?"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Update Image (optional)
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Images will be automatically optimized and compressed to under 100KB
              </p>
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto object-cover rounded-lg border border-gray-300 max-h-96"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
