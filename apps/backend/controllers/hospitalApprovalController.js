import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse } from "../utils/helpers.js";
import { RESPONSE_CODES, USER_ROLES } from "../utils/constants.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import { sendHospitalApprovalConfirmation } from "../services/emailService.js";

/**
 * @desc    Get all pending hospital registrations
 * @route   GET /api/v1/admin/hospitals/pending
 * @access  Admin only
 */
export const getPendingHospitals = asyncHandler(async (req, res) => {
  const pendingHospitals = await Hospital.find({
    approvalStatus: "pending",
  })
    .populate({
      path: "approvedBy",
      select: "name email",
    })
    .sort({ createdAt: -1 });

  // Get associated user data for each hospital
  const hospitalsWithUsers = await Promise.all(
    pendingHospitals.map(async (hospital) => {
      const user = await User.findOne({
        "hospitalInfo.hospitalId": hospital._id,
      }).select("name email phone createdAt");

      return {
        hospital: hospital.toObject(),
        user: user ? user.toObject() : null,
      };
    })
  );

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Pending hospitals retrieved successfully",
    {
      hospitals: hospitalsWithUsers,
      count: hospitalsWithUsers.length,
    }
  );
});

/**
 * @desc    Get all hospitals (pending, approved, rejected)
 * @route   GET /api/v1/admin/hospitals
 * @access  Admin only
 */
export const getAllHospitals = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query.approvalStatus = status;
  }

  const skip = (page - 1) * limit;

  const hospitals = await Hospital.find(query)
    .populate({
      path: "approvedBy",
      select: "name email",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Hospital.countDocuments(query);

  // Get associated user data for each hospital
  const hospitalsWithUsers = await Promise.all(
    hospitals.map(async (hospital) => {
      const user = await User.findOne({
        "hospitalInfo.hospitalId": hospital._id,
      }).select("name email phone createdAt");

      return {
        hospital: hospital.toObject(),
        user: user ? user.toObject() : null,
      };
    })
  );

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospitals retrieved successfully",
    {
      hospitals: hospitalsWithUsers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: hospitalsWithUsers.length,
        totalRecords: total,
      },
    }
  );
});

/**
 * @desc    Approve hospital registration
 * @route   PUT /api/v1/admin/hospitals/:id/approve
 * @access  Admin only
 */
export const approveHospital = asyncHandler(async (req, res) => {
  const { id: hospitalId } = req.params;
  const adminId = req.user.id;

  // Find the hospital
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  // Check if already approved
  if (hospital.approvalStatus === "approved") {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Hospital is already approved"
    );
  }

  // Find and update the associated user
  const user = await User.findOne({
    "hospitalInfo.hospitalId": hospitalId,
  });

  if (!user) {
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "Associated user not found"
    );
  }

  // Update hospital status
  hospital.approvalStatus = "approved";
  hospital.isActive = true;
  hospital.isVerified = true;
  hospital.approvedBy = adminId;
  hospital.approvedAt = new Date();
  await hospital.save();

  // Update user status
  user.approvalStatus = "approved";
  user.isActive = true;
  user.approvedBy = adminId;
  user.approvedAt = new Date();
  await user.save();

  // Get admin details for email
  const admin = await User.findById(adminId).select("name email");

  // Send approval confirmation email
  try {
    await sendHospitalApprovalConfirmation(
      {
        name: hospital.name,
        email: hospital.email,
      },
      {
        name: admin.name,
        email: admin.email,
      }
    );
  } catch (emailError) {
    console.error("Failed to send approval confirmation email:", emailError);
    // Don't fail the approval if email fails
  }

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Hospital approved successfully", {
    hospital: {
      id: hospital._id,
      name: hospital.name,
      email: hospital.email,
      approvalStatus: hospital.approvalStatus,
      approvedBy: admin.name,
      approvedAt: hospital.approvedAt,
    },
  });
});

/**
 * @desc    Reject hospital registration
 * @route   PUT /api/v1/admin/hospitals/:id/reject
 * @access  Admin only
 */
export const rejectHospital = asyncHandler(async (req, res) => {
  const { id: hospitalId } = req.params;
  const { reason } = req.body;
  const adminId = req.user.id;

  if (!reason || reason.trim().length < 10) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Rejection reason is required (minimum 10 characters)"
    );
  }

  // Find the hospital
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  // Check if already processed
  if (hospital.approvalStatus !== "pending") {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Hospital registration has already been processed"
    );
  }

  // Find and update the associated user
  const user = await User.findOne({
    "hospitalInfo.hospitalId": hospitalId,
  });

  if (!user) {
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "Associated user not found"
    );
  }

  // Update hospital status
  hospital.approvalStatus = "rejected";
  hospital.isActive = false;
  hospital.rejectionReason = reason.trim();
  hospital.approvedBy = adminId;
  hospital.approvedAt = new Date();
  await hospital.save();

  // Update user status
  user.approvalStatus = "rejected";
  user.isActive = false;
  user.rejectionReason = reason.trim();
  user.approvedBy = adminId;
  user.approvedAt = new Date();
  await user.save();

  // Get admin details
  const admin = await User.findById(adminId).select("name email");

  // TODO: Send rejection email to hospital (optional)
  // For now, we'll just log it
  console.log(
    `Hospital ${hospital.name} rejected by ${admin.name}. Reason: ${reason}`
  );

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Hospital registration rejected", {
    hospital: {
      id: hospital._id,
      name: hospital.name,
      email: hospital.email,
      approvalStatus: hospital.approvalStatus,
      rejectionReason: hospital.rejectionReason,
      rejectedBy: admin.name,
      rejectedAt: hospital.approvedAt,
    },
  });
});

/**
 * @desc    Get hospital details by ID
 * @route   GET /api/v1/admin/hospitals/:id
 * @access  Admin only
 */
export const getHospitalById = asyncHandler(async (req, res) => {
  const { id: hospitalId } = req.params;

  const hospital = await Hospital.findById(hospitalId).populate({
    path: "approvedBy",
    select: "name email",
  });

  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  // Get associated user data
  const user = await User.findOne({
    "hospitalInfo.hospitalId": hospitalId,
  }).select("name email phone createdAt approvalStatus isActive");

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospital details retrieved successfully",
    {
      hospital: hospital.toObject(),
      user: user ? user.toObject() : null,
    }
  );
});

/**
 * @desc    Get hospital approval statistics
 * @route   GET /api/v1/admin/hospitals/stats
 * @access  Admin only
 */
export const getHospitalStats = asyncHandler(async (req, res) => {
  const stats = await Hospital.aggregate([
    {
      $group: {
        _id: "$approvalStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const formattedStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };

  stats.forEach((stat) => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });

  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRegistrations = await Hospital.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospital statistics retrieved successfully",
    {
      stats: formattedStats,
      recentRegistrations: {
        count: recentRegistrations,
        period: "Last 30 days",
      },
    }
  );
});
