import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  requestPasswordReset,
  getPendingAdmins,
  approveAdmin,
  registerHospital,
  requestRegistrationOTP,
  validateRegistrationOTP,
  verifyOTPAndRegister,
} from "../controllers/authController.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateHospitalRegistration,
  validateOTPRequest,
  validateOTPCode,
  validateOTPVerification,
} from "../middlewares/validation.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateUserRegistration, register);

/**
 * @route   POST /api/v1/auth/register/otp/request
 * @desc    Request OTP for email verification during registration
 * @access  Public
 */
router.post(
  "/register/otp/request",
  validateOTPRequest,
  requestRegistrationOTP
);

router.post("/register/otp/validate", validateOTPCode, validateRegistrationOTP);

/**
 * @route   POST /api/v1/auth/register/otp/verify
 * @desc    Verify OTP and complete user registration
 * @access  Public
 */
router.post(
  "/register/otp/verify",
  validateOTPVerification,
  verifyOTPAndRegister
);

/**
 * @route   POST /api/v1/auth/register/hospital
 * @desc    Register a new hospital with admin account
 * @access  Public
 */
router.post(
  "/register/hospital",
  validateHospitalRegistration,
  registerHospital
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validateUserLogin, login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, getMe);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", authenticate, validateUpdateProfile, updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
  "/change-password",
  authenticate,
  validateChangePassword,
  changePassword
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post("/forgot-password", validateForgotPassword, forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password", validateResetPassword, resetPassword);

/**
 * @route   GET /api/v1/auth/admin/pending
 * @desc    Get pending admin approvals
 * @access  Private (Admin)
 */
router.get("/admin/pending", authenticate, getPendingAdmins);

/**
 * @route   PUT /api/v1/auth/admin/:id/approve
 * @desc    Approve/Reject admin account
 * @access  Private (Admin)
 */
router.put("/admin/:id/approve", authenticate, approveAdmin);

export default router;

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AlertX API v1 AuthRoutes is Opened",
  });
});
