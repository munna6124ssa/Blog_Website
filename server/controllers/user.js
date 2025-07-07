const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { cloudinaryUplaod } = require("../middleware/cloudinary.js");
const emailService = require("../utils/emailService.js"); // Add email service
const { generateOTP, generateOTPExpiration, isOTPExpired, isValidOTPFormat } = require("../utils/otpUtils.js"); // Add OTP utilities



const registerUser = async (req, res) => {
  try {
    const { name, password, email, age, gender } = req.body;
    
    // Validation
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Generate username from email
    const dataArr = email.split("@");
    const userName = dataArr[0];
    
    // Handle profile image upload (optional)
    let profileUrl = "";
    if (req.file?.path) {
      try {
        const response = await cloudinaryUplaod(req.file.path);
        profileUrl = response.url;
      } catch (uploadError) {
        // Continue without profile image if upload fails
      }
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = generateOTPExpiration();

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hash,
      gender: gender || undefined,
      age: age || undefined,
      userName,
      profile: profileUrl,
      isEmailVerified: false, // User needs to verify email with OTP
      emailOTP: otp,
      emailOTPExpires: otpExpires,
    });

    // Send OTP email
    try {
      await emailService.sendVerificationOtpEmail(email, name, otp);
    } catch (emailError) {
      // If email fails, still create user but let them know
      const user = await User.findById(newUser._id).select("-password -emailOTP");
      return res.status(201).json({ 
        success: true,
        message: "User registered successfully, but verification email failed to send. Please try to resend OTP.", 
        data: user,
        emailSent: false
      });
    }

    // Return user without password and OTP
    const user = await User.findById(newUser._id).select("-password -emailOTP");
    return res.status(201).json({ 
      success: true,
      message: "User registered successfully. Please check your email for OTP verification.", 
      data: user,
      emailSent: true
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error during registration",
      error: error.message 
    });
  }
};


const logInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user
    const isUser = await User.findOne({ email: email });
    if (!isUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid password" 
      });
    }

    // Check if email is verified
    if (!isUser.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Please verify your email before logging in. Check your email for OTP.",
        emailVerified: false,
        email: isUser.email
      });
    }

    // Generate token
    const token = await jwt.sign({
      id: isUser._id,
      email: isUser.email
    },
    process.env.JWT_SECRET, 
    { expiresIn: "1d" });

    // Return user data with token
    const loggedInUser = { ...isUser.toObject(), token };
    delete loggedInUser.password;
    delete loggedInUser.emailOTP; // Don't send OTP in login response
    
    return res.status(200).json({ 
      success: true,
      message: "Login successful", 
      data: loggedInUser 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error during login",
      error: error.message 
    });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const { name, age, gender, about, location, website, removeCoverImage } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Prepare update object
    const updateData = {};
    if (name?.trim()) updateData.name = name.trim();
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (about !== undefined) updateData.about = about.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (website !== undefined) updateData.website = website.trim();

    // Handle profile image upload
    if (req.files?.profile?.[0]) {
      try {
        const response = await cloudinaryUplaod(req.files.profile[0].path);
        updateData.profile = response.url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile image"
        });
      }
    }

    // Handle cover image removal
    if (removeCoverImage === 'true') {
      updateData.coverImage = null;
    }
    // Handle cover image upload (only if not removing)
    else if (req.files?.coverImage?.[0]) {
      try {
        const response = await cloudinaryUplaod(req.files.coverImage[0].path);
        updateData.coverImage = response.url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload cover image"
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    return res.status(200).json({ 
      success: true,
      message: "Profile updated successfully", 
      data: updatedUser 
    });

  } catch (error) {
    
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: 'posts',
        populate: {
          path: 'createdBy',
          select: 'name userName profile'
        }
      });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      success: true,
      data: user 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Send email verification
const sendEmailVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Email is already verified" 
      });
    }

    // Generate verification token
    const verificationToken = emailService.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with verification token
    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: expiresAt
    });

    // Send verification email
    const result = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (result.success) {
      return res.status(200).json({ 
        success: true,
        message: "Verification email sent successfully" 
      });
    } else {
      return res.status(500).json({ 
        success: false,
        message: "Failed to send verification email" 
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired verification token" 
      });
    }

    // Update user as verified
    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: "",
      emailVerificationExpires: null
    });

    return res.status(200).json({ 
      success: true,
      message: "Email verified successfully" 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found with this email" 
      });
    }

    // Generate reset token
    const resetToken = emailService.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: expiresAt
    });

    // Send reset email
    const result = await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (result.success) {
      return res.status(200).json({ 
        success: true,
        message: "Password reset email sent successfully" 
      });
    } else {
      return res.status(500).json({ 
        success: false,
        message: "Failed to send password reset email" 
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password?.trim() || password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long" 
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hash,
      passwordResetToken: "",
      passwordResetExpires: null
    });

    return res.status(200).json({ 
      success: true,
      message: "Password reset successfully" 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Update notification preferences
const updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true
    });

    return res.status(200).json({ 
      success: true,
      message: "Notification settings updated successfully" 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Verify OTP for email verification
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid OTP format. OTP must be 6 digits." 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found with this email" 
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Email is already verified" 
      });
    }

    // Check if OTP exists
    if (!user.emailOTP) {
      return res.status(400).json({ 
        success: false,
        message: "No OTP found. Please request a new OTP." 
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.emailOTPExpires)) {
      return res.status(400).json({ 
        success: false,
        message: "OTP has expired. Please request a new OTP." 
      });
    }

    // Verify OTP
    if (user.emailOTP !== otp) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid OTP. Please check and try again." 
      });
    }

    // OTP is valid - verify the user
    user.isEmailVerified = true;
    user.emailOTP = ""; // Clear OTP
    user.emailOTPExpires = null; // Clear expiration
    await user.save();

    // Send welcome email after successful verification
    try {
      await emailService.sendWelcomeEmail(email, user.name, 'BlogSite');
    } catch (emailError) {
      // Don't fail verification if welcome email fails
    }

    return res.status(200).json({ 
      success: true,
      message: "Email verified successfully! Welcome to BlogSite." 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error during OTP verification",
      error: error.message 
    });
  }
};

// Resend OTP for email verification
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found with this email" 
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Email is already verified" 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = generateOTPExpiration();

    // Update user with new OTP
    user.emailOTP = otp;
    user.emailOTPExpires = otpExpires;
    await user.save();

    // Send new OTP email
    try {
      await emailService.sendVerificationOtpEmail(email, user.name, otp);
      
      return res.status(200).json({ 
        success: true,
        message: "New OTP sent successfully. Please check your email." 
      });
    } catch (emailError) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to send OTP email. Please try again later." 
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Internal server error during OTP resend",
      error: error.message 
    });
  }
};


module.exports = { 
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
};
