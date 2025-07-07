require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./models/connectDB.js");
const userRouter = require('./routes/user.js');
const postRouter = require('./routes/post.js');
const emailRouter = require('./routes/email.js');

const app = express();

connectDb();

// Middleware - CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:3000',
        'https://blog-website-frontend.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user",userRouter);
app.use("/api/post",postRouter);
app.use("/api/email",emailRouter);

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: 'BlogSphere API is running!',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});