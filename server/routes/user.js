const express = require("express");
const { 
  registerUser, 
  logInUser, 
  updateUserProfile, 
  getUserProfile,
  sendEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  updateNotificationSettings,
  verifyOTP,
  resendOTP
} = require("../controllers/user.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { upload, handleMulterError } = require("../middleware/multer.js");
const router = express.Router();

// Public routes
router.post("/register", upload.single("profile"), handleMulterError, registerUser);
router.post("/login", logInUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected routes
router.put("/profile", isLoggedIn, upload.fields([
  { name: 'profile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), handleMulterError, updateUserProfile);
router.get("/profile/:userId?", isLoggedIn, getUserProfile);
router.post("/send-verification", isLoggedIn, sendEmailVerification);
router.put("/notifications", isLoggedIn, updateNotificationSettings);

module.exports = router; 