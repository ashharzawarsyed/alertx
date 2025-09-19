import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import {
  generateToken,
  comparePassword,
  sendResponse,
  generateOTP,
} from "../utils/helpers.js";
import { RESPONSE_CODES, USER_ROLES } from "../utils/constants.js";

import {
  sendAdminRegistrationConfirmation,
  sendAdminApprovalRequest,
  sendAdminApprovalConfirmation,
} from "../services/emailService.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, location, notifiers } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (existingUser) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "User already exists with this email or phone"
    );
  }

  // Create user object
  const userData = {
    name,
    email,
    phone,
    password,
    role: role || USER_ROLES.PATIENT,
  };

  // Add role-specific data
  if (role === USER_ROLES.PATIENT && location) {
    userData.location = location;
    if (notifiers) userData.notifiers = notifiers;

    // Handle medical profile data if provided
    const { medicalProfile } = req.body;
    if (medicalProfile) {
      userData.medicalProfile = medicalProfile;
    }
  }

  if (role === USER_ROLES.DRIVER) {
    const { driverInfo } = req.body;
    const { licenseNumber, ambulanceNumber } = driverInfo || req.body;
    userData.driverInfo = {
      licenseNumber,
      ambulanceNumber,
      status: "offline",
    };
  }

  if (role === USER_ROLES.HOSPITAL_STAFF) {
    const { hospitalInfo } = req.body;
    const { hospitalId, position } = hospitalInfo || req.body;
    userData.hospitalInfo = {
      hospitalId,
      position,
    };
  }

  // Create user
  const user = await User.create(userData);

  // If admin registration, set as pending and notify existing admins
  if (role === USER_ROLES.ADMIN) {
    user.approvalStatus = "pending";
    user.isActive = false;
    await user.save();
    try {
      await sendAdminRegistrationConfirmation({
        name: user.name,
        email: user.email,
      });
      await sendAdminApprovalRequest({
        name: user.name,
        email: user.email,
        phone: user.phone,
        id: user._id,
      });
    } catch (emailError) {
      console.error(
        "Failed to send admin registration/approval notification:",
        emailError
      );
      // Don't fail registration if email fails
    }
  }

  // Generate token
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const message =
    role === USER_ROLES.ADMIN
      ? "Admin registration submitted successfully. You'll receive an email once your account is activated."
      : "User registered successfully";

  sendResponse(res, RESPONSE_CODES.CREATED, message, {
    user,
    token,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return sendResponse(
      res,
      RESPONSE_CODES.UNAUTHORIZED,
      "Invalid credentials"
    );
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return sendResponse(
      res,
      RESPONSE_CODES.UNAUTHORIZED,
      "Invalid credentials"
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return sendResponse(
      res,
      RESPONSE_CODES.UNAUTHORIZED,
      "Account is deactivated"
    );
  }

  // Check admin approval status
  if (user.role === USER_ROLES.ADMIN && user.approvalStatus !== "approved") {
    const message =
      user.approvalStatus === "pending"
        ? "Account is pending approval. You'll receive an email once activated."
        : user.approvalStatus === "rejected"
          ? `Account has been rejected. Reason: ${user.rejectionReason || "Contact administrator"}`
          : "Account approval required";

    return sendResponse(res, RESPONSE_CODES.UNAUTHORIZED, message);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Login successful", {
    user,
    token,
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("hospitalInfo.hospitalId", "name address")
    .select("-password");

  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  sendResponse(res, RESPONSE_CODES.SUCCESS, "User profile retrieved", { user });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location, notifiers } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  // Update allowed fields
  if (name) user.name = name;
  if (phone && phone !== user.phone) {
    // Check if phone is already taken
    const existingUser = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existingUser) {
      return sendResponse(
        res,
        RESPONSE_CODES.CONFLICT,
        "Phone number already in use"
      );
    }
    user.phone = phone;
  }

  // Update role-specific data
  if (user.role === USER_ROLES.PATIENT) {
    if (location) user.location = location;
    if (notifiers) user.notifiers = notifiers;
  }

  await user.save();

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Profile updated successfully", {
    user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Current password is incorrect"
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Password changed successfully");
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  sendResponse(res, RESPONSE_CODES.SUCCESS, "Logged out successfully");
});

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  // Generate reset token (in production, send via email)
  const resetToken = generateOTP(6);
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // TODO: Send reset token via email
  console.log(`Password reset token for ${email}: ${resetToken}`);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Password reset token sent to email"
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;

  const user = await User.findOne({
    email,
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Invalid or expired reset token"
    );
  }

  // Update password and clear reset token
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Password reset successful");
});

/**
 * @desc    Get pending admin approvals (Admin only)
 * @route   GET /api/v1/auth/admin/pending
 * @access  Private (Admin)
 */
export const getPendingAdmins = asyncHandler(async (req, res) => {
  // Only admins can approve other admins
  if (req.user.role !== USER_ROLES.ADMIN) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Access denied. Admin privileges required."
    );
  }

  const pendingAdmins = await User.find({
    role: USER_ROLES.ADMIN,
    approvalStatus: "pending",
  }).select("-password");

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Pending admin approvals retrieved",
    {
      admins: pendingAdmins,
      count: pendingAdmins.length,
    }
  );
});

/**
 * @desc    Approve/Reject admin account (Admin only)
 * @route   PUT /api/v1/auth/admin/:id/approve
 * @access  Private (Admin)
 */
export const approveAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approved, reason } = req.body;

  // Only admins can approve other admins
  if (req.user.role !== USER_ROLES.ADMIN) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Access denied. Admin privileges required."
    );
  }

  const admin = await User.findById(id);

  if (!admin) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Admin not found");
  }

  if (admin.role !== USER_ROLES.ADMIN) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "User is not an admin"
    );
  }

  if (admin.approvalStatus !== "pending") {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Admin approval has already been processed"
    );
  }

  // Update approval status
  admin.approvalStatus = approved ? "approved" : "rejected";
  admin.approvedBy = req.user.id;
  admin.approvedAt = new Date();
  admin.isActive = approved; // Activate account if approved

  if (!approved && reason) {
    admin.rejectionReason = reason;
  }

  await admin.save();

  // Send email notification to the admin
  try {
    await sendAdminApprovalConfirmation(
      {
        name: admin.name,
        email: admin.email,
      },
      approved
    );
  } catch (emailError) {
    console.error("Failed to send approval confirmation email:", emailError);
    // Don't fail the approval process if email fails
  }

  const message = approved
    ? "Admin account approved successfully"
    : "Admin account rejected";

  sendResponse(res, RESPONSE_CODES.SUCCESS, message, { admin });
});
