const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter configuration with validation
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com') {
    console.warn('Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    return null;
  }

  // Check if using Ethereal Email (test service)
  if (emailUser.includes('@ethereal.email')) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Default to Gmail configuration
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (name, blogName) => ({
    subject: `🎉 Welcome to ${blogName}! Your Journey Begins Now`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        
        <!-- Header Section -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px; text-align: center; border-bottom: 3px solid #667eea;">
          <div style="background: linear-gradient(45deg, #667eea, #764ba2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);">
            <span style="font-size: 36px; color: white;">✨</span>
          </div>
          <h1 style="color: #333; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">Welcome to ${blogName}!</h1>
          <p style="color: #666; font-size: 16px; margin: 0; font-weight: 500;">Your blogging adventure starts here</p>
        </div>
        
        <!-- Main Content -->
        <div style="background-color: #f8f9fa; padding: 40px 30px;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 22px; text-align: center;">Hi ${name}! 👋</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
              Thank you for joining our amazing blogging community! We're absolutely <strong>thrilled</strong> to have you on board. 
              Your creative journey begins now! 🚀
            </p>
          </div>
          
          <!-- Features Section -->
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 25px;">
            <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🎯 What You Can Do Now</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
              <!-- Feature 1 -->
              <div style="flex: 1; min-width: 250px; background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 15px;">
                <div style="font-size: 32px; margin-bottom: 10px;">📝</div>
                <h4 style="color: white; margin: 0 0 8px 0; font-size: 16px;">Create Amazing Posts</h4>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; line-height: 1.4;">Share your thoughts, stories, and expertise with the world</p>
              </div>
              
              <!-- Feature 2 -->
              <div style="flex: 1; min-width: 250px; background: linear-gradient(135deg, #f093fb, #f5576c); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 15px;">
                <div style="font-size: 32px; margin-bottom: 10px;">❤️</div>
                <h4 style="color: white; margin: 0 0 8px 0; font-size: 16px;">Engage & Connect</h4>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; line-height: 1.4;">Like, comment, and build meaningful connections</p>
              </div>
              
              <!-- Feature 3 -->
              <div style="flex: 1; min-width: 250px; background: linear-gradient(135deg, #4facfe, #00f2fe); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 15px;">
                <div style="font-size: 32px; margin-bottom: 10px;">🌟</div>
                <h4 style="color: white; margin: 0 0 8px 0; font-size: 16px;">Build Your Profile</h4>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; line-height: 1.4;">Customize your profile and showcase your personality</p>
              </div>
            </div>
          </div>
          
          <!-- Tips Section -->
          <div style="background: linear-gradient(135deg, #ffecd2, #fcb69f); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #ff9a56;">
            <h3 style="color: #d63384; margin: 0 0 15px 0; font-size: 18px;">💡 Pro Tips for Getting Started</h3>
            <ul style="color: #8d4f00; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Complete your profile with a photo and bio</li>
              <li style="margin-bottom: 8px;">Write your first post about what inspires you</li>
              <li style="margin-bottom: 8px;">Explore and engage with other creators' content</li>
              <li style="margin-bottom: 0;">Follow topics and bloggers that interest you</li>
            </ul>
          </div>
          
          <!-- CTA Section -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(45deg, #667eea, #764ba2); padding: 15px 30px; border-radius: 50px; display: inline-block; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);">
              <span style="color: white; font-size: 18px; font-weight: 600;">🎉 Ready to Start Blogging? 🎉</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
            Welcome to the ${blogName} family! 🌟
          </p>
          <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0; font-size: 14px;">
            We're here to support your creative journey every step of the way.
          </p>
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; margin-top: 20px;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
              Happy blogging! 🚀<br>
              <strong>The ${blogName} Team</strong>
            </p>
          </div>
        </div>
        
        <!-- Bottom Note -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            You're receiving this email because you just joined ${blogName}. We're excited to have you!
          </p>
        </div>
      </div>
    `
  }),

  emailVerification: (name, verificationToken, baseUrl) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Welcome! To complete your account setup, please verify your email address by following these steps:</p>
        <ol>
          <li><strong>Copy the link below</strong></li>
          <li><strong>Open a new browser tab</strong></li>
          <li><strong>Paste the link in the address bar</strong></li>
          <li><strong>Press Enter to verify your email</strong></li>
        </ol>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/verify-email/${verificationToken}" 
             target="_blank" rel="noopener noreferrer"
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email (Click to Open in New Tab)
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666; margin: 10px 0;">
          <em>Note: This link will open in a new tab. If it opens in the same tab, please copy the link below and paste it in a new browser tab.</em>
        </p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border: 1px solid #dee2e6; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold; color: #333;">Verification Link (Copy this):</p>
          <p style="margin: 10px 0 0 0; word-break: break-all; font-family: monospace; font-size: 12px; color: #0066cc; background-color: white; padding: 10px; border: 1px solid #ccc; border-radius: 3px;">
            ${baseUrl}/verify-email/${verificationToken}
          </p>
        </div>
        <p style="color: #007bff; font-weight: bold;">⚠️ Important: This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `
  }),

  // OTP Email Verification Template
  emailVerificationOTP: (name, otp) => ({
    subject: 'Verify Your Email - OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Email Verification</h1>
          <p style="color: #666; font-size: 16px;">Complete your registration</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
            Welcome to our blog platform! To complete your registration and verify your email address, 
            please use the OTP code below:
          </p>
          
          <div style="background-color: #fff; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #333; font-size: 14px; margin-bottom: 10px; font-weight: bold;">Your OTP Code:</p>
            <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; font-size: 14px; margin: 0;">
              ⏰ <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong> for security reasons.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Simply enter this code on the verification page to activate your account and start blogging!
          </p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background-color: #f1f3f4; border-radius: 5px;">
          <p style="color: #666; font-size: 13px; margin: 0;">
            <strong>Security Tips:</strong>
          </p>
          <ul style="color: #666; font-size: 13px; margin: 10px 0 0 20px;">
            <li>Never share this OTP with anyone</li>
            <li>Our team will never ask for your OTP via phone or email</li>
            <li>If you didn't request this verification, please ignore this email</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (name, resetToken, baseUrl) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. To reset your password, please follow these steps:</p>
        <ol>
          <li><strong>Copy the link below</strong></li>
          <li><strong>Open a new browser tab</strong></li>
          <li><strong>Paste the link in the address bar</strong></li>
          <li><strong>Press Enter to go to the reset page</strong></li>
        </ol>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/reset-password/${resetToken}" 
             target="_blank" rel="noopener noreferrer"
             style="background-color: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password (Click to Open in New Tab)
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666; margin: 10px 0;">
          <em>Note: This link will open in a new tab. If it opens in the same tab, please copy the link below and paste it in a new browser tab.</em>
        </p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border: 1px solid #dee2e6; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold; color: #333;">Reset Link (Copy this):</p>
          <p style="margin: 10px 0 0 0; word-break: break-all; font-family: monospace; font-size: 12px; color: #0066cc; background-color: white; padding: 10px; border: 1px solid #ccc; border-radius: 3px;">
            ${baseUrl}/reset-password/${resetToken}
          </p>
        </div>
        <p style="color: #dc3545; font-weight: bold;">⚠️ Important: This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
      </div>
    `
  }),

  newComment: (postAuthor, commenterName, postTitle, commentText, postUrl) => ({
    subject: `New comment on your post: ${postTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Comment on Your Post</h2>
        <p>Hi ${postAuthor},</p>
        <p><strong>${commenterName}</strong> commented on your post "<strong>${postTitle}</strong>":</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p style="margin: 0;">${commentText}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${postUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Comment
          </a>
        </div>
      </div>
    `
  }),

  newLike: (postAuthor, likerName, postTitle, postUrl) => ({
    subject: `${likerName} liked your post: ${postTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Someone Liked Your Post! ❤️</h2>
        <p>Hi ${postAuthor},</p>
        <p><strong>${likerName}</strong> liked your post "<strong>${postTitle}</strong>"</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${postUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Post
          </a>
        </div>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  // Send welcome email
  async sendWelcomeEmail(userEmail, userName, blogName = 'BlogSphere') {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        return { success: false, error: 'Email service not configured' };
      }
      
      const template = emailTemplates.welcome(userName, blogName);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: template.subject,
        html: template.html
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send email verification
  async sendVerificationEmail(userEmail, userName, verificationToken, baseUrl = null) {
    // Determine the correct base URL based on environment
    if (!baseUrl) {
      baseUrl = process.env.FRONTEND_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://blog-website-frontend-s1r8.onrender.com' 
                  : 'http://localhost:5173');
    }
    
    try {
      const transporter = createTransporter();
      if (!transporter) {
        return { success: false, error: 'Email service not configured' };
      }
      
      const template = emailTemplates.emailVerification(userName, verificationToken, baseUrl);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: template.subject,
        html: template.html
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send OTP email verification
  async sendVerificationOtpEmail(userEmail, userName, otp) {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        return { success: false, error: 'Email service not configured' };
      }
      
      const template = emailTemplates.emailVerificationOTP(userName, otp);
      
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: template.subject,
        html: template.html
      });
      
      // Log preview URL for Ethereal emails
      if (process.env.EMAIL_USER?.includes('@ethereal.email')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`📧 OTP Email sent! View at: ${previewUrl}`);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(userEmail, userName, resetToken, baseUrl = null) {
    // Determine the correct base URL based on environment
    if (!baseUrl) {
      baseUrl = process.env.FRONTEND_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://blog-website-frontend-s1r8.onrender.com' 
                  : 'http://localhost:5173');
    }
    
    try {
      const transporter = createTransporter();
      const template = emailTemplates.passwordReset(userName, resetToken, baseUrl);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: template.subject,
        html: template.html
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send comment notification
  async sendCommentNotification(postAuthorEmail, postAuthorName, commenterName, postTitle, commentText, postUrl) {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.newComment(postAuthorName, commenterName, postTitle, commentText, postUrl);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: postAuthorEmail,
        subject: template.subject,
        html: template.html
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send like notification
  async sendLikeNotification(postAuthorEmail, postAuthorName, likerName, postTitle, postUrl) {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.newLike(postAuthorName, likerName, postTitle, postUrl);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: postAuthorEmail,
        subject: template.subject,
        html: template.html
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Generate verification token
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  },

  // Test email configuration
  async testEmailConfiguration() {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        return {
          success: false,
          error: 'Email service not configured'
        };
      }

      // Verify SMTP connection
      await transporter.verify();
      
      return {
        success: true,
        message: 'Email configuration is working',
        config: {
          user: process.env.EMAIL_USER,
          service: process.env.EMAIL_USER?.includes('@ethereal.email') ? 'Ethereal (Test)' : 'Gmail'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send test email
  async sendTestEmail(toEmail = 'test@example.com') {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        return {
          success: false,
          error: 'Email service not configured'
        };
      }

      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Test Email from BlogSite',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Service Test</h2>
            <p>This is a test email to verify that the email service is working correctly.</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
            <p>If you receive this email, the email service is configured properly!</p>
          </div>
        `
      });

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) // Only works with Ethereal
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check if email service is configured
  isConfigured() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    return emailUser && emailPass && emailUser !== 'your-email@gmail.com' && emailPass !== 'your-app-password';
  },

  // Test email configuration
  async testConfiguration() {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        return { 
          success: false, 
          error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env file',
          configured: false
        };
      }

      // Verify connection
      await transporter.verify();
      
      return { 
        success: true, 
        message: 'Email service is properly configured and working',
        configured: true,
        emailUser: process.env.EMAIL_USER
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Email configuration test failed: ${error.message}`,
        configured: this.isConfigured()
      };
    }
  }
};

module.exports = emailService;
