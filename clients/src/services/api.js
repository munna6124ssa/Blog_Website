import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blogToken');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('blogToken');
      localStorage.removeItem('blogUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    return api.post('/user/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  login: (credentials) => api.post('/user/login', credentials),
  
  // OTP verification functions
  verifyOTP: (data) => api.post('/user/verify-otp', data),
  resendOTP: (data) => api.post('/user/resend-otp', data),
};

// Post API functions
export const postAPI = {
  getAllPosts: () => api.get('/post/allPost'),
  getPublicPosts: () => {
    // Use axios directly without auth interceptor for public posts
    return axios.get(`${API_BASE_URL}/post/public`);
  },
  getUserPosts: () => api.get('/post/userFeed'),
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    
    // Remove the default JSON content-type header for FormData
    return api.post('/post/create', formData, {
      headers: {
        'Content-Type': undefined
      }
    });
  },
  editPost: (postId, postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    return api.put(`/post/edit/${postId}`, formData, {
      headers: {
        'Content-Type': undefined
      }
    });
  },
  deletePost: (postId) => api.delete(`/post/delete/${postId}`),
  likePost: (postId) => api.patch('/post/like', { postId }),
  addComment: (commentData) => api.post('/post/comment', commentData),
  getComments: (postId) => api.get(`/post/comment?id=${postId}`),
  getPublicComments: (postId) => {
    return axios.get(`${API_BASE_URL}/post/public/comments/${postId}`);
  },
  deleteComment: (commentId) => api.delete(`/post/comment/${commentId}`),
  likeComment: (commentId) => api.patch('/post/comment/like', { commentId }),
};

// User API endpoints
export const userAPI = {
  updateProfile: (profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    
    // Don't set Content-Type header manually - let browser set it with boundary
    // Also remove the default JSON content type header
    return api.put('/user/profile', formData, {
      headers: {
        'Content-Type': undefined
      }
    });
  },
  getUserProfile: (userId) => {
    const endpoint = userId ? `/user/profile/${userId}` : '/user/profile';
    return api.get(endpoint);
  },
  sendVerificationEmail: () => api.post('/user/send-verification'),
  updateNotificationSettings: (settings) => api.put('/user/notifications', settings),
};

// Email API functions (public endpoints)
export const emailAPI = {
  forgotPassword: (email) => {
    return axios.post(`${API_BASE_URL}/user/forgot-password`, { email });
  },
  resetPassword: (token, password) => {
    return axios.post(`${API_BASE_URL}/user/reset-password/${token}`, { password });
  },
  verifyEmail: (token) => {
    return axios.get(`${API_BASE_URL}/user/verify-email/${token}`);
  },
};

export default api;
