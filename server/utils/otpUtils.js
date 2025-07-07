// Utility functions for OTP generation and validation

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP expiration time (10 minutes from now)
 * @returns {Date} Expiration date
 */
function generateOTPExpiration() {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

/**
 * Check if OTP is expired
 * @param {Date} expirationDate 
 * @returns {boolean} True if expired
 */
function isOTPExpired(expirationDate) {
  return new Date() > new Date(expirationDate);
}

/**
 * Validate OTP format (6 digits)
 * @param {string} otp 
 * @returns {boolean} True if valid format
 */
function isValidOTPFormat(otp) {
  return /^\d{6}$/.test(otp);
}

module.exports = {
  generateOTP,
  generateOTPExpiration,
  isOTPExpired,
  isValidOTPFormat
};
