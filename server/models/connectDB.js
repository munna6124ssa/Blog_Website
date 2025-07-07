const mongoose = require("mongoose");

const connectDB = async()=>{
    try {
        const dbUrl = process.env.DB_URL;
        console.log("🔗 Attempting to connect to:", dbUrl ? `${dbUrl.substring(0, 20)}...` : 'No DB_URL found');
        
        if (!dbUrl) {
            throw new Error("DB_URL environment variable is not set");
        }
        
        await mongoose.connect(dbUrl);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        console.error("📝 DB_URL:", process.env.DB_URL ? "Set" : "Not set");
        console.error("📝 Environment:", process.env.NODE_ENV);
        process.exit(1);
    }
}

module.exports = connectDB;