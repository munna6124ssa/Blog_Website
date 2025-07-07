require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./models/connectDB.js");
const userRouter = require('./routes/user.js');
const postRouter = require('./routes/post.js');
const emailRouter = require('./routes/email.js');

const app = express();

connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user",userRouter);
app.use("/api/post",postRouter);
app.use("/api/email",emailRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});