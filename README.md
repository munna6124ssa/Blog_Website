# BlogSphere - Modern Blog Website

A full-stack blog website built with React.js, Node.js, Express.js, MongoDB, and Tailwind CSS.

## 🚀 Features

### Frontend Features
- **Modern UI/UX**: Beautiful, responsive design using Tailwind CSS
- **User Authentication**: Secure login and registration with JWT
- **Create & Share Posts**: Rich text editor with image upload support
- **Interactive Posts**: Like, comment, and share functionality
- **User Profiles**: Personalized user profiles with stats
- **Real-time Updates**: Dynamic content updates
- **Mobile Responsive**: Optimized for all device sizes
- **Toast Notifications**: User-friendly feedback system

### Backend Features
- **RESTful API**: Well-structured API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Image Upload**: Cloudinary integration for image storage
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for handling file uploads
- **Email Integration**: Nodemailer for email functionality
- **CORS Support**: Cross-origin resource sharing enabled

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage and delivery
- **Multer** - File upload middleware
- **Nodemailer** - Email sending

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blog-website
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Environment Variables
Copy the `.env.example` file to `server/.env` and configure your credentials:
```bash
cp .env.example server/.env
```

Edit `server/.env` with your actual credentials:
```env
# Server Configuration
PORT=3001
DB_URL=mongodb://127.0.0.1:27017/blog_website
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for OTP verification & password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Important**: See `.env.example` for detailed setup instructions and credential requirements.

### 4. Frontend Setup
```bash
cd ../clients
npm install
```

### 5. Start the Application

#### Start Backend Server
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5000`

#### Start Frontend
```bash
cd clients
npm run dev
```
The client will run on `http://localhost:5173`

## 📁 Project Structure

```
blog-website/
├── clients/                 # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── CreatePost.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── server/                  # Backend Node.js app
    ├── controllers/         # Route controllers
    │   ├── user.js
    │   └── post.js
    ├── middleware/          # Custom middleware
    │   ├── auth.js
    │   ├── cloudinary.js
    │   └── multer.js
    ├── models/              # Database models
    │   ├── user.js
    │   ├── post.js
    │   ├── comment.js
    │   └── connectDB.js
    ├── routes/              # API routes
    │   ├── user.js
    │   └── post.js
    ├── uploads/             # Temporary file storage
    ├── utils/               # Utility functions
    │   └── nodeMailer.js
    ├── index.js
    ├── package.json
    └── .env.example
```

## 🔗 API Endpoints

### Authentication
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login

### Posts
- `GET /api/post/allPost` - Get all posts
- `GET /api/post/userFeed` - Get user's posts
- `POST /api/post/create` - Create new post
- `PATCH /api/post/like` - Like/unlike post
- `POST /api/post/comment` - Add comment
- `GET /api/post/comment` - Get post comments

## 🎨 UI Features

### Design Highlights
- **Modern Color Scheme**: Indigo and purple gradients
- **Responsive Layout**: Mobile-first design approach
- **Interactive Elements**: Hover effects and smooth transitions
- **Clean Typography**: Readable fonts and proper spacing
- **Card-based Layout**: Clean content presentation
- **Loading States**: Beautiful loading animations
- **Toast Notifications**: User-friendly feedback

### Component Features
- **Navbar**: Fixed navigation with user profile
- **PostCard**: Interactive post display with like/comment
- **CommentSection**: Nested comments with replies
- **Profile Page**: User stats and personal posts
- **Create Post**: Rich post creation with image upload

## 🚦 Getting Started

1. **Register**: Create a new account with profile picture
2. **Login**: Sign in to your account
3. **Create Posts**: Share your thoughts with images
4. **Interact**: Like and comment on posts
5. **Profile**: View your posts and stats

## 🔧 Configuration

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### MongoDB Setup
- **Local**: Install MongoDB locally
- **Cloud**: Use MongoDB Atlas for cloud database

### Email Configuration
1. Use Gmail or any SMTP service
2. Generate app password for Gmail
3. Add credentials to `.env` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [ ] Real-time chat functionality
- [ ] Post categories and tags
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Dark mode theme
- [ ] Rich text editor
- [ ] Post bookmarking
- [ ] User following system
- [ ] Admin dashboard

## 🐛 Known Issues

- None currently known

## 📞 Support

For support, email support@blogsphere.com or create an issue in the repository.

---

Made with ❤️ by [Munna Kumar]
