import { body, param, query, validationResult } from "express-validator";
import { sendResponse } from "../utils/helpers.js";
import { RESPONSE_CODES, USER_ROLES } from "../utils/constants.js";

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Validation failed",
      null,
      errorMessages
    );
  }
  next();
};

/**
 * User registration validation
 */
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("phone")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number with country code"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("role").isIn(Object.values(USER_ROLES)).withMessage("Invalid user role"),

  // Conditional validation for patient location
  body("location.lat")
    .if(body("role").equals(USER_ROLES.PATIENT))
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required for patients"),

  body("location.lng")
    .if(body("role").equals(USER_ROLES.PATIENT))
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required for patients"),

  // Conditional validation for driver info
  body("driverInfo.licenseNumber")
    .if(body("role").equals(USER_ROLES.DRIVER))
    .notEmpty()
    .withMessage("License number is required for drivers"),

  body("driverInfo.ambulanceNumber")
    .if(body("role").equals(USER_ROLES.DRIVER))
    .notEmpty()
    .withMessage("Ambulance number is required for drivers"),

  handleValidationErrors,
];

/**
 * User login validation
 */
export const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

/**
 * Emergency request validation
 */
export const validateEmergencyRequest = [
  body("symptoms")
    .isArray({ min: 1 })
    .withMessage("At least one symptom is required"),

  body("location.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("location.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  body("notifiers")
    .optional()
    .isArray()
    .withMessage("Notifiers must be an array"),

  body("notifiers.*")
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Invalid phone number in notifiers"),

  handleValidationErrors,
];

/**
 * Hospital validation
 */
export const validateHospital = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Hospital name must be between 2 and 100 characters"),

  body("address")
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("Address must be between 10 and 200 characters"),

  body("location.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("location.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  body("contactNumber")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid contact number"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("totalBeds.general")
    .isInt({ min: 0 })
    .withMessage("General beds must be a non-negative integer"),

  body("totalBeds.icu")
    .isInt({ min: 0 })
    .withMessage("ICU beds must be a non-negative integer"),

  body("totalBeds.emergency")
    .isInt({ min: 0 })
    .withMessage("Emergency beds must be a non-negative integer"),

  body("totalBeds.operation")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Operation beds must be a non-negative integer"),

  body("facilities")
    .optional()
    .isArray()
    .withMessage("Facilities must be an array"),

  body("operatingHours.isOpen24x7")
    .optional()
    .isBoolean()
    .withMessage("isOpen24x7 must be a boolean"),

  body("operatingHours.openTime")
    .if(body("operatingHours.isOpen24x7").equals(false))
    .notEmpty()
    .withMessage("Open time is required when not open 24x7"),

  body("operatingHours.closeTime")
    .if(body("operatingHours.isOpen24x7").equals(false))
    .notEmpty()
    .withMessage("Close time is required when not open 24x7"),

  handleValidationErrors,
];

/**
 * Hospital registration with admin validation
 */
export const validateHospitalRegistration = [
  // Hospital details
  body("hospitalName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Hospital name must be between 2 and 100 characters"),

  body("hospitalType").notEmpty().withMessage("Hospital type is required"),

  body("licenseNumber").notEmpty().withMessage("License number is required"),

  body("address")
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("Address must be between 10 and 200 characters"),

  body("city").notEmpty().withMessage("City is required"),

  body("state").notEmpty().withMessage("State is required"),

  body("zipCode").notEmpty().withMessage("ZIP code is required"),

  body("country").notEmpty().withMessage("Country is required"),

  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),

  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),

  body("contactNumber")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid contact number with country code"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("totalBeds.general")
    .isInt({ min: 0 })
    .withMessage("General beds must be a non-negative integer"),

  body("totalBeds.icu")
    .isInt({ min: 0 })
    .withMessage("ICU beds must be a non-negative integer"),

  body("totalBeds.emergency")
    .isInt({ min: 0 })
    .withMessage("Emergency beds must be a non-negative integer"),

  body("totalBeds.operation")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Operation beds must be a non-negative integer"),

  body("emergencyContact")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage(
      "Please provide a valid emergency contact number with country code"
    ),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

/**
 * MongoDB ObjectId validation
 */
export const validateObjectId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage("Invalid ID format"),

  handleValidationErrors,
];

/**
 * Pagination validation
 */
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

/**
 * Change password validation
 */
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

/**
 * Forgot password validation
 */
export const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  handleValidationErrors,
];

/**
 * Reset password validation
 */
export const validateResetPassword = [
  body("token").notEmpty().withMessage("Reset token is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

/**
 * Update profile validation
 */
export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number with country code"),

  body("location.lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("location.lng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  handleValidationErrors,
];

/**
 * OTP request validation
 */
export const validateOTPRequest = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  handleValidationErrors,
];

export const validateOTPCode = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be a 6-digit number"),

  handleValidationErrors,
];

/**
 * OTP verification and registration validation
 */
export const validateOTPVerification = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be a 6-digit number"),

  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phone")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number with country code"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("role")
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage("Invalid user role"),

  // Location validation for patients
  body("location.lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("location.lng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  // Address validation
  body("address.street")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Street address must be between 1 and 100 characters"),

  body("address.city")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("City must be between 1 and 50 characters"),

  body("address.state")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("State must be between 1 and 50 characters"),

  body("address.zipCode")
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage("Zip code must be between 5 and 10 characters"),

  body("address.country")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Country must be between 1 and 50 characters"),

  handleValidationErrors,
];
