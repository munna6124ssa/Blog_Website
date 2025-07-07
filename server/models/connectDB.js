const mongoose = require("mongoose");

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        console.error("📝 Make sure MongoDB is running locally or update DB_URL in .env file");
        process.exit(1);
    }
}

module.exports = connectDB;