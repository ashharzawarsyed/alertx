// Re-export from specialized helper files
export {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generateUserTokenPayload,
} from "./jwtHelper.js";

export {
  hashPassword,
  comparePassword,
  generateRandomPassword,
  generateResetToken,
  generateVerificationToken,
  validatePasswordStrength,
} from "./passwordHelper.js";

export {
  sendSMS,
  sendPushNotification,
  sendEmail,
  notifyEmergencyContacts,
  notifyDriverNewEmergency,
  notifyPatientAmbulanceAssigned,
  notifyHospitalIncomingPatient,
  sendBulkNotifications,
} from "./notificationHelper.js";

export {
  initializeSocket,
  getSocketInstance,
  emitToUser,
  emitToRole,
  emitToEmergency,
  emitToTrip,
  emitToHospital,
  broadcastEmergencyToDrivers,
} from "./socketHelper.js";

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

/**
 * Standard API response format
 */
export const sendResponse = (
  res,
  statusCode,
  message,
  data = null,
  error = null
) => {
  const response = {
    success: statusCode < 400,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data) response.data = data;
  if (error) response.error = error;

  return res.status(statusCode).json(response);
};

/**
 * Generate random OTP
 */
export const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Generate unique ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
