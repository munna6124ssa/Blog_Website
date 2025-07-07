const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');
const auth = require('../middleware/auth');

// Test email configuration
router.get('/test-config', async (req, res) => {
  try {
    const result = await emailService.testEmailConfiguration();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        config: result.config
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test email configuration',
      error: error.message
    });
  }
});

// Send test email
router.post('/send-test', async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = email || 'test@example.com';
    
    const result = await emailService.sendTestEmail(targetEmail);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${targetEmail}`,
        messageId: result.messageId,
        previewUrl: result.previewUrl // For Ethereal Email
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Manually verify all users (for testing)
router.post('/verify-all-users', async (req, res) => {
  try {
    const User = require('../models/user');
    const result = await User.updateMany({}, { 
      isEmailVerified: true,
      emailNotifications: true 
    });
    
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} users`,
      modified: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
