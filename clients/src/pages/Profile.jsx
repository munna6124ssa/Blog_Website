import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import { toast } from 'react-toastify';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    gender: '',
    about: '',
    location: '',
    website: '',
    profile: null,
    coverImage: null
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);

  const fetchUserPosts = async () => {
    try {
      const response = await postAPI.getUserPosts();
      setUserPosts(response.data);
    } catch (error) {
      // Error handled
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
    if (user) {
      setEditForm({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || '',
        about: user.about || '',
        location: user.location || '',
        website: user.website || '',
        profile: null,
        coverImage: null
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setProfilePreview(null);
    setCoverPreview(null);
    setRemoveCoverImage(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Create canvas to optimize the image and auto-compress to under 100KB
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let targetWidth, targetHeight;
          
          if (type === 'profile') {
            // Square aspect ratio for profile images
            const size = Math.min(img.width, img.height);
            targetWidth = targetHeight = Math.min(size, 400); // Max 400x400 for profile
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, targetWidth, targetHeight);
          } else {
            // Cover image - maintain aspect ratio, optimize for wide format
            const aspectRatio = img.width / img.height;
            
            if (aspectRatio > 3) {
              // Very wide image
              targetWidth = Math.min(img.width, 1200);
              targetHeight = targetWidth / aspectRatio;
            } else if (aspectRatio < 1.8) {
              // Too tall image - adjust to reasonable aspect ratio
              targetHeight = Math.min(img.height, 600);
              targetWidth = targetHeight * 2.5;
            } else {
              // Good aspect ratio
              targetWidth = Math.min(img.width, 1200);
              targetHeight = targetWidth / aspectRatio;
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          }
          
          // Function to compress image iteratively until under 100KB
          const compressImage = (quality = 0.9) => {
            canvas.toBlob((blob) => {
              if (blob.size <= 100 * 1024 || quality <= 0.1) {
                // Size is acceptable or quality too low, use this version
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                setEditForm(prev => ({
                  ...prev,
                  [type]: optimizedFile
                }));
                
                // Clear remove cover image flag if uploading new cover image
                if (type === 'coverImage') {
                  setRemoveCoverImage(false);
                }
                
                // Set preview
                const previewUrl = canvas.toDataURL('image/jpeg', quality);
                if (type === 'profile') {
                  setProfilePreview(previewUrl);
                } else {
                  setCoverPreview(previewUrl);
                }
                
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
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Create form data with removeCoverImage flag
      const formDataToSend = {
        ...editForm,
        removeCoverImage: removeCoverImage
      };
      
      const response = await userAPI.updateProfile(formDataToSend);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        updateUser(response.data.data);
        
        // Force re-fetch user profile to ensure cover image is updated
        try {
          const profileResponse = await userAPI.getUserProfile();
          if (profileResponse.data.success) {
            updateUser(profileResponse.data.data);
          }
        } catch (fetchError) {
          // Handle profile fetch error silently
        }
        
        setIsEditing(false);
        setProfilePreview(null);
        setCoverPreview(null);
        setRemoveCoverImage(false);
      }
    } catch (error) {
      // Error handled
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await postAPI.likePost(postId);
      fetchUserPosts();
    } catch (error) {
      // Error handled
      toast.error('Failed to like post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl mb-8 overflow-hidden">
          {/* Cover Image Section */}
          <div className="relative">
            <div 
              className="h-64 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: user?.coverImage 
                  ? `url(${user.coverImage})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
            
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                {user?.profile ? (
                  <img
                    src={user.profile}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-4 border-white shadow-xl flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-8 pt-20 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user?.name}</h1>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">@{user?.userName}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1H6V9a2 2 0 012-2h3zM2 21V9a2 2 0 012-2h1m15 0h1a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                    </svg>
                    Joined {formatDate(user?.createdAt)}
                  </div>
                  
                  {user?.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {user.location}
                    </div>
                  )}
                  
                  {user?.website && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>

                {user?.about && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.about}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-8 lg:gap-12 mt-6 lg:mt-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userPosts.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userPosts.reduce((total, post) => total + (post.likes?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Comments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <button
                    onClick={handleEditToggle}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={editForm.age}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                    <textarea
                      name="about"
                      value={editForm.about}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{editForm.about.length}/500 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profile')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {profilePreview && (
                        <img src={profilePreview} alt="Profile preview" className="mt-2 w-20 h-20 rounded-full object-cover" />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
                      
                      {/* Show current cover image if exists and not removing */}
                      {user?.coverImage && !removeCoverImage && !coverPreview && (
                        <div className="mb-3">
                          <img src={user.coverImage} alt="Current cover" className="w-full h-20 rounded object-cover border border-gray-300 dark:border-slate-600" />
                          <button
                            type="button"
                            onClick={() => setRemoveCoverImage(true)}
                            className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          >
                            Remove Cover Image
                          </button>
                        </div>
                      )}
                      
                      {/* Show remove confirmation */}
                      {removeCoverImage && (
                        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">Cover image will be removed when you save.</p>
                          <button
                            type="button"
                            onClick={() => setRemoveCoverImage(false)}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Keep Cover Image
                          </button>
                        </div>
                      )}
                      
                      {/* File input - only show if not removing cover image */}
                      {!removeCoverImage && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'coverImage')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      )}
                      
                      {/* Show new cover image preview */}
                      {coverPreview && (
                        <div className="mt-2">
                          <img src={coverPreview} alt="Cover preview" className="w-full h-20 rounded object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm({ ...editForm, coverImage: null });
                              setCoverPreview(null);
                            }}
                            className="mt-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          >
                            Remove Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'posts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'about'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                {userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start sharing your thoughts with the world!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onLike={handleLike}
                        onUpdate={fetchUserPosts}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 w-20">Name:</span>
                        <span className="text-gray-900 font-medium">{user?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 w-20">Email:</span>
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                      {user?.age && (
                        <div className="flex items-center">
                          <span className="text-gray-600 w-20">Age:</span>
                          <span className="text-gray-900">{user.age}</span>
                        </div>
                      )}
                      {user?.gender && (
                        <div className="flex items-center">
                          <span className="text-gray-600 w-20">Gender:</span>
                          <span className="text-gray-900 capitalize">{user.gender}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Stats</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Posts:</span>
                        <span className="text-gray-900 font-medium">{userPosts.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Likes:</span>
                        <span className="text-gray-900 font-medium">
                          {userPosts.reduce((total, post) => total + (post.likes?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Comments:</span>
                        <span className="text-gray-900 font-medium">
                          {userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
