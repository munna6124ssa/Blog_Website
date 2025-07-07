import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    img: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    if (e.target.name === 'img') {
      const file = e.target.files[0];
      
      if (file) {
        try {
          const result = await handleImageCompression(file);
          
          setFormData({
            ...formData,
            img: result.file
          });
          
          setPreview(result.preview);
          
        } catch (error) {
          toast.error(error);
          e.target.value = ''; // Clear the input
          setPreview(null);
        }
      } else {
        setFormData({
          ...formData,
          img: null
        });
        setPreview(null);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
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
      await postAPI.createPost(formData);
      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      // Error handled
      const message = error.response?.data || 'Failed to create post. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
              <button
                onClick={handleCancel}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="Enter an engaging title for your post..."
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows="8"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="Share your thoughts, ideas, or story..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="img" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  id="img"
                  name="img"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Images will be automatically optimized and compressed to under 100KB
                </p>
                
                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-auto object-cover rounded-lg border border-gray-200 dark:border-slate-600 max-h-96"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, img: null });
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </div>
                ) : (
                  'Publish Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
