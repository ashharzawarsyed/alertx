import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
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
  sendHospitalRegistrationConfirmation,
  sendHospitalApprovalRequest,
  sendRegistrationOTP,
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

  // Create user
  const user = await User.create(userData);

  // If admin registration, set as pending and notify existing admins
  if (role === USER_ROLES.ADMIN) {
    console.log("Registering new admin user:", {
      name,
      email,
      role,
      id: user._id,
    });

    user.approvalStatus = "pending";
    user.isActive = false;
    await user.save();

    console.log("Admin user saved with status:", {
      approvalStatus: user.approvalStatus,
      isActive: user.isActive,
      id: user._id,
    });

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
      console.log("Admin registration notifications sent successfully");
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

  // Find user and include password field (which is excluded by default)
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
          ? `Account has been rejected. Reason: ${
              user.rejectionReason || "Contact administrator"
            }`
          : "Account approval required";

    return sendResponse(res, RESPONSE_CODES.UNAUTHORIZED, message);
  }

  // Check hospital approval status
  if (user.role === USER_ROLES.HOSPITAL && user.approvalStatus !== "approved") {
    const message =
      user.approvalStatus === "pending"
        ? "Your hospital registration is pending approval. You'll receive an email once your account is activated."
        : user.approvalStatus === "rejected"
          ? `Your hospital registration has been rejected. Reason: ${
              user.rejectionReason ||
              "Please contact support for more information."
            }`
          : "Hospital approval required";

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
  console.log("getPendingAdmins called with user:", {
    id: req.user?.id,
    email: req.user?.email,
    role: req.user?.role,
  });

  // Only admins can approve other admins
  console.log("Checking user role:", {
    userRole: req.user.role,
    expectedRole: USER_ROLES.ADMIN,
    isAdmin: req.user.role === USER_ROLES.ADMIN,
    userRoleType: typeof req.user.role,
    adminRoleType: typeof USER_ROLES.ADMIN,
  });

  if (req.user.role !== USER_ROLES.ADMIN) {
    console.log("Access denied. User role is not admin:", req.user.role);
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Access denied. Admin privileges required."
    );
  }

  console.log("Searching for pending admins with role:", USER_ROLES.ADMIN);

  const pendingAdmins = await User.find({
    role: USER_ROLES.ADMIN,
    approvalStatus: "pending",
    isActive: false,
  })
    .select("-password")
    .sort({ createdAt: -1 });

  console.log("Found pending admins:", pendingAdmins);

  // Debug log to check if any admins exist at all
  const allAdmins = await User.find({ role: USER_ROLES.ADMIN }).select(
    "-password"
  );
  console.log("All admins in system:", allAdmins.length);
  console.log(
    "Admin details:",
    allAdmins.map((admin) => ({
      id: admin._id,
      email: admin.email,
      status: admin.approvalStatus,
      isActive: admin.isActive,
    }))
  );

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

/**
 * @desc    Register hospital with admin account
 * @route   POST /api/v1/auth/register/hospital
 * @access  Public
 */
export const registerHospital = asyncHandler(async (req, res) => {
  const {
    // Hospital details
    hospitalName,
    hospitalType,
    licenseNumber,
    address,
    city,
    state,
    zipCode,
    country,
    latitude,
    longitude,
    contactNumber,
    email,
    totalBeds,
    facilities,
    emergencyContact,
    operatingHours,
    password,
  } = req.body;

  // Check if hospital already exists
  const existingHospital = await Hospital.findOne({
    $or: [{ email }, { name: hospitalName }],
  });

  if (existingHospital) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "Hospital with this email or name already exists"
    );
  }

  // Check if admin user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "User already exists with this email"
    );
  }

  // Create hospital data object
  const hospitalData = {
    name: hospitalName,
    type: hospitalType,
    licenseNumber,
    address: `${address}, ${city}, ${state} ${zipCode}, ${country}`,
    contactNumber,
    email,
    totalBeds: {
      general: parseInt(totalBeds.general),
      icu: parseInt(totalBeds.icu),
      emergency: parseInt(totalBeds.emergency),
      operation: parseInt(totalBeds.operation) || 0,
    },
    availableBeds: {
      general: parseInt(totalBeds.general),
      icu: parseInt(totalBeds.icu),
      emergency: parseInt(totalBeds.emergency),
      operation: parseInt(totalBeds.operation) || 0,
    },
    facilities: facilities || [],
    emergencyContact,
    operatingHours: operatingHours || { isOpen24x7: true },
    isActive: false, // Pending approval
    isVerified: false,
  };

  // Add location only if provided
  if (latitude && longitude) {
    hospitalData.location = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    };
  }

  // Create hospital first
  const hospital = await Hospital.create(hospitalData);

  // Create hospital user account
  const userData = {
    name: hospitalName, // Use hospital name as user name
    email,
    phone: contactNumber,
    password,
    role: USER_ROLES.HOSPITAL,
    hospitalInfo: {
      hospitalId: hospital._id,
    },
    isActive: false, // Pending approval
    approvalStatus: "pending",
  };

  const user = await User.create(userData);

  // Send email notifications
  try {
    // Send confirmation email to hospital
    await sendHospitalRegistrationConfirmation({
      name: hospitalName,
      email: email,
      hospitalType: hospitalType,
    });

    // Send approval request to all active admins
    await sendHospitalApprovalRequest({
      hospitalName,
      email,
      hospitalType,
      licenseNumber,
      address: `${address}, ${city}, ${state} ${zipCode}, ${country}`,
      contactNumber,
      registrationDate: new Date(),
      hospitalId: hospital._id,
    });
  } catch (emailError) {
    console.error("Email notification failed:", emailError);
    // Don't fail the registration if email fails
  }

  sendResponse(
    res,
    RESPONSE_CODES.CREATED,
    "Hospital registration submitted successfully. You'll receive an email once your account is activated.",
    {
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.approvalStatus,
      },
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    }
  );
});

// Send OTP for email verification during registration
export const requestRegistrationOTP = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.emailVerified) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "User already exists with this email"
    );
  }

  // Generate OTP
  const otp = generateOTP(6);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Send OTP email
    await sendRegistrationOTP({
      name: name || "User",
      email,
      otp,
    });

    // Store OTP temporarily (either create temp user or update existing unverified user)
    if (existingUser && !existingUser.emailVerified) {
      existingUser.emailVerificationOTP = otp;
      existingUser.emailVerificationOTPExpires = otpExpires;
      await existingUser.save();
    } else {
      // Create a temporary user record to store OTP
      // Use email-based unique temp phone to avoid duplicates
      const tempPhone = `+temp${Date.now()}`;
      await User.findOneAndUpdate(
        { email },
        {
          email,
          name: name || "User",
          emailVerificationOTP: otp,
          emailVerificationOTPExpires: otpExpires,
          emailVerified: false,
          // Set temporary values for required fields
          password: "temp", // Will be replaced during actual registration
          phone: tempPhone, // Unique temporary phone to avoid duplicate key errors
        },
        { upsert: true, new: true }
      );
    }

    sendResponse(
      res,
      RESPONSE_CODES.SUCCESS,
      "OTP sent to your email successfully",
      {
        message: "Please check your email for the verification code",
        email,
      }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    sendResponse(
      res,
      RESPONSE_CODES.SERVER_ERROR,
      "Failed to send verification email"
    );
  }
});

// Validate registration OTP without completing registration
export const validateRegistrationOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    emailVerificationOTP: otp,
    emailVerificationOTPExpires: { $gt: new Date() },
  }).select("+emailVerificationOTP +emailVerificationOTPExpires");

  if (!user) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Invalid or expired OTP"
    );
  }

  sendResponse(res, RESPONSE_CODES.SUCCESS, "OTP verified successfully", {
    email,
  });
});

// Verify OTP and complete registration
export const verifyOTPAndRegister = asyncHandler(async (req, res) => {
  const {
    email,
    otp,
    name,
    phone,
    password,
    role,
    location,
    notifiers,
    emergencyContacts,
    medicalProfile,
    address,
  } = req.body;

  // Find user with matching email and OTP
  const user = await User.findOne({
    email,
    emailVerificationOTP: otp,
    emailVerificationOTPExpires: { $gt: new Date() },
  }).select("+emailVerificationOTP +emailVerificationOTPExpires");

  if (!user) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Invalid or expired OTP"
    );
  }

  // Check if user already exists and is verified
  const existingVerifiedUser = await User.findOne({
    $or: [{ email }, { phone }],
    emailVerified: true,
  });

  if (existingVerifiedUser) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "User already exists with this email or phone"
    );
  }

  try {
    // Update user with complete registration data
    const userData = {
      name,
      phone,
      password,
      role: role || USER_ROLES.PATIENT,
      emailVerified: true,
      emailVerificationOTP: undefined,
      emailVerificationOTPExpires: undefined,
    };

    // Add role-specific data
    if (role === USER_ROLES.PATIENT) {
      if (location) userData.location = location;
      if (notifiers) userData.notifiers = notifiers;
      if (emergencyContacts) userData.emergencyContacts = emergencyContacts;
      if (address) userData.address = address;
      if (medicalProfile) userData.medicalProfile = medicalProfile;
    }

    if (role === USER_ROLES.DRIVER) {
      const { driverInfo } = req.body;
      if (driverInfo) {
        userData.driverInfo = {
          ...driverInfo,
          status: "offline",
        };
      }
    }

    // Update the user
    Object.assign(user, userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    sendResponse(
      res,
      RESPONSE_CODES.CREATED,
      "Registration completed successfully",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    sendResponse(
      res,
      RESPONSE_CODES.SERVER_ERROR,
      "Registration failed. Please try again."
    );
  }
});
