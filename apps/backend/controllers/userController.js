import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse } from "../utils/helpers.js";
import {
  RESPONSE_CODES,
  USER_ROLES,
  DRIVER_STATUS,
} from "../utils/constants.js";

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status) query.isActive = status === "active";

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Users retrieved successfully", {
    users,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin/Self)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  // Check if user can access this profile
  if (requesterRole !== USER_ROLES.ADMIN && id !== requesterId) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Not authorized to view this user"
    );
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "User retrieved successfully",
    user
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin/Self)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  // Check permissions
  if (requesterRole !== USER_ROLES.ADMIN && id !== requesterId) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Not authorized to update this user"
    );
  }

  const user = await User.findById(id);
  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  // Fields that can be updated
  const allowedUpdates = ["name", "phone", "location", "notifiers"];

  // Admin can update additional fields
  if (requesterRole === USER_ROLES.ADMIN) {
    allowedUpdates.push("isActive", "isVerified", "role");
  }

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  Object.assign(user, updates);
  await user.save();

  sendResponse(res, RESPONSE_CODES.SUCCESS, "User updated successfully", user);
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "User not found");
  }

  // Soft delete - deactivate user
  user.isActive = false;
  await user.save();

  sendResponse(res, RESPONSE_CODES.SUCCESS, "User deactivated successfully");
});

/**
 * @desc    Get all drivers
 * @route   GET /api/v1/users/drivers
 * @access  Private (Admin/Hospital Staff)
 */
export const getDrivers = asyncHandler(async (req, res) => {
  const { status, available, page = 1, limit = 10 } = req.query;

  const query = { role: USER_ROLES.DRIVER };

  if (status) query["driverInfo.status"] = status;
  if (available === "true")
    query["driverInfo.status"] = DRIVER_STATUS.AVAILABLE;

  const skip = (page - 1) * limit;

  const drivers = await User.find(query)
    .select("-password")
    .sort({ "driverInfo.status": 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Drivers retrieved successfully", {
    drivers,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

/**
 * @desc    Get drivers near location
 * @route   GET /api/v1/users/drivers/nearby
 * @access  Private (Admin/Hospital Staff)
 */
export const getNearbyDrivers = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;

  if (!lat || !lng) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Latitude and longitude are required"
    );
  }

  const drivers = await User.find({
    role: USER_ROLES.DRIVER,
    "driverInfo.status": DRIVER_STATUS.AVAILABLE,
    "driverInfo.currentLocation": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: radius * 1000, // Convert km to meters
      },
    },
  })
    .select("-password")
    .limit(10);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Nearby drivers retrieved successfully",
    drivers
  );
});

/**
 * @desc    Approve driver (Admin only)
 * @route   PUT /api/v1/users/:id/approve
 * @access  Private (Admin)
 */
export const approveDriver = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approved, reason } = req.body;

  const driver = await User.findById(id);
  if (!driver) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Driver not found");
  }

  if (driver.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "User is not a driver"
    );
  }

  driver.isVerified = approved;
  driver.isActive = approved;

  if (!approved && reason) {
    driver.rejectionReason = reason;
  }

  await driver.save();

  const message = approved
    ? "Driver approved successfully"
    : "Driver rejected successfully";
  sendResponse(res, RESPONSE_CODES.SUCCESS, message, driver);
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private (Admin)
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        active: { $sum: { $cond: ["$isActive", 1, 0] } },
        verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
      },
    },
  ]);

  // Get driver status breakdown
  const driverStats = await User.aggregate([
    { $match: { role: USER_ROLES.DRIVER } },
    {
      $group: {
        _id: "$driverInfo.status",
        count: { $sum: 1 },
      },
    },
  ]);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "User statistics retrieved successfully",
    {
      usersByRole: stats,
      driverStatus: driverStats,
    }
  );
});

/**
 * @desc    Update driver status (available/busy/offline)
 * @route   PUT /api/v1/users/driver/status
 * @access  Private (Driver only)
 */
export const updateDriverStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const userId = req.user.id;

  // Validate user is a driver
  if (req.user.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only drivers can update driver status"
    );
  }

  // Validate status value
  const validStatuses = Object.values(DRIVER_STATUS);
  if (!status || !validStatuses.includes(status)) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Update driver status in database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { "driverInfo.status": status },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Driver not found");
  }

  console.log(`✅ Driver status updated in database: ${updatedUser.name} (${updatedUser._id}) -> ${status}`);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Driver status updated successfully",
    { user: updatedUser }
  );
});
