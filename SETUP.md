# 🚀 Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

## Installation Steps

### 1. Clone and Install
```bash
# Navigate to project directory
cd "Blog Website"

# Install dependencies for both client and server
npm run install-all
# OR manually:
# cd server && npm install
# cd ../clients && npm install
```

### 2. Database Setup
- **Option A**: Install MongoDB locally
- **Option B**: Use MongoDB Atlas (cloud)
- Update `DB_URL` in `server/.env`

### 3. Environment Configuration
1. Copy `server/.env.example` to `server/.env`
2. Update the following variables:
   ```
   DB_URL=mongodb://127.0.0.1:27017/blog_website
   JWT_SECRET=your_secure_jwt_secret_here
   ```

### 4. Optional Services
**For Image Uploads (Cloudinary):**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**For Email/OTP (Gmail):**
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 5. Run the Application
```bash
# Development mode (both client & server)
npm run dev

# Production mode
npm run build
npm start
```

### 6. Access the Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Features
✅ User Registration with OTP Email Verification  
✅ Login/Logout with JWT Authentication  
✅ Create, Edit, Delete Posts with Image Upload  
✅ Like/Unlike Posts and Comments  
✅ Real-time Comment System  
✅ Dark/Light Mode Toggle  
✅ Social Media Sharing  
✅ Email Notifications  
✅ Password Reset via Email  
✅ Profile Management with Cover Images  
✅ Infinite Scroll with Skeleton Loading  
✅ Responsive Design  

## Troubleshooting
- **Database Connection Error**: Check MongoDB is running and `DB_URL` is correct
- **Email Not Working**: Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- **Images Not Uploading**: Configure Cloudinary credentials
- **Port Conflicts**: Change `PORT` in `server/.env`

Happy Blogging! 🎉
