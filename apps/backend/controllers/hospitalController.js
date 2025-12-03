import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import Emergency from "../models/Emergency.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse, calculateDistance } from "../utils/helpers.js";
import { RESPONSE_CODES, USER_ROLES } from "../utils/constants.js";

/**
 * @desc    Register new hospital
 * @route   POST /api/v1/hospitals/register
 * @access  Public
 */
export const registerHospital = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    location,
    contactNumber,
    email,
    totalBeds,
    facilities,
    operatingHours,
  } = req.body;

  // Check if hospital already exists
  const existingHospital = await Hospital.findOne({
    $or: [
      { email },
      { name, "location.lat": location.lat, "location.lng": location.lng },
    ],
  });

  if (existingHospital) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "Hospital with this email or location already exists"
    );
  }

  // Create hospital
  const hospital = await Hospital.create({
    name,
    address,
    location,
    contactNumber,
    email,
    totalBeds,
    facilities: facilities || [],
    operatingHours: operatingHours || { isOpen24x7: true },
  });

  sendResponse(
    res,
    RESPONSE_CODES.CREATED,
    "Hospital registration submitted for approval",
    hospital
  );
});

/**
 * @desc    Get all hospitals
 * @route   GET /api/v1/hospitals
 * @access  Public
 */
export const getAllHospitals = asyncHandler(async (req, res) => {
  const {
    lat,
    lng,
    radius = 50,
    facilities,
    availableBeds,
    page = 1,
    limit = 10,
  } = req.query;

  let query = { isActive: true, isVerified: true };

  // Filter by facilities
  if (facilities) {
    const facilitiesArray = facilities.split(",");
    query.facilities = { $in: facilitiesArray };
  }

  // Filter by available beds
  if (availableBeds === "true") {
    query.$or = [
      { "availableBeds.general": { $gt: 0 } },
      { "availableBeds.icu": { $gt: 0 } },
      { "availableBeds.emergency": { $gt: 0 } },
    ];
  }

  // Get all hospitals matching the query first
  let hospitals = await Hospital.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit) * 10); // Get more to filter by distance

  const total = await Hospital.countDocuments(query);

  // Add distance and filter by radius if location provided
  if (lat && lng) {
    hospitals = hospitals
      .map((hospital) => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          hospital.location.lat,
          hospital.location.lng
        );
        return {
          ...hospital.toObject(),
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        };
      })
      .filter((hospital) => hospital.distance <= radius) // Filter by radius
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, parseInt(limit)); // Limit results
  }

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospitals retrieved successfully",
    {
      hospitals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    }
  );
});

/**
 * @desc    Get hospital by ID
 * @route   GET /api/v1/hospitals/:id
 * @access  Public
 */
export const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospital retrieved successfully",
    hospital
  );
});

/**
 * @desc    Update hospital bed availability
 * @route   PUT /api/v1/hospitals/:id/beds
 * @access  Private (Hospital Staff/Admin)
 */
export const updateBedAvailability = asyncHandler(async (req, res) => {
  const hospitalId = req.params.id;
  const { availableBeds } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  // Check permissions
  if (userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.HOSPITAL) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only hospital admin can update bed availability"
    );
  }

  // If hospital user, check if they belong to this hospital
  if (userRole === USER_ROLES.HOSPITAL) {
    const user = await User.findById(userId);
    if (user.hospitalInfo.hospitalId.toString() !== hospitalId) {
      return sendResponse(
        res,
        RESPONSE_CODES.FORBIDDEN,
        "You can only update your own hospital's bed availability"
      );
    }
  }

  // Validate bed counts don't exceed total beds
  for (const [bedType, count] of Object.entries(availableBeds)) {
    if (count > hospital.totalBeds[bedType]) {
      return sendResponse(
        res,
        RESPONSE_CODES.BAD_REQUEST,
        `Available ${bedType} beds cannot exceed total ${bedType} beds`
      );
    }
  }

  // Update bed availability
  hospital.availableBeds = { ...hospital.availableBeds, ...availableBeds };
  hospital.lastBedUpdate = new Date();
  await hospital.save();

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Bed availability updated successfully",
    hospital
  );
});

/**
 * @desc    Approve/Reject hospital (Admin only)
 * @route   PUT /api/v1/hospitals/:id/approve
 * @access  Private (Admin)
 */
export const approveHospital = asyncHandler(async (req, res) => {
  const hospitalId = req.params.id;
  const { approved, reason } = req.body;
  const adminId = req.user.id;

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  if (hospital.approvalStatus !== "pending") {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Hospital has already been processed"
    );
  }

  hospital.approvalStatus = approved ? "approved" : "rejected";
  hospital.isActive = approved;
  hospital.isVerified = approved;
  hospital.approvedBy = adminId;
  hospital.approvedAt = new Date();

  if (!approved && reason) {
    hospital.rejectionReason = reason;
  }

  await hospital.save();

  const message = approved
    ? "Hospital approved successfully"
    : "Hospital rejected successfully";

  sendResponse(res, RESPONSE_CODES.SUCCESS, message, hospital);
});

/**
 * @desc    Get pending hospitals (Admin only)
 * @route   GET /api/v1/hospitals/pending
 * @access  Private (Admin)
 */
export const getPendingHospitals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const hospitals = await Hospital.find({ approvalStatus: "pending" })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Hospital.countDocuments({ approvalStatus: "pending" });

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Pending hospitals retrieved successfully",
    {
      hospitals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    }
  );
});

/**
 * @desc    Update hospital profile
 * @route   PUT /api/v1/hospitals/:id
 * @access  Private (Hospital Staff/Admin)
 */
export const updateHospital = asyncHandler(async (req, res) => {
  const hospitalId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  // Check permissions
  if (userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.HOSPITAL) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Not authorized to update hospital"
    );
  }

  // If hospital, check if they belong to this hospital
  if (userRole === USER_ROLES.HOSPITAL) {
    const user = await User.findById(userId);
    if (user.hospitalInfo.hospitalId.toString() !== hospitalId) {
      return sendResponse(
        res,
        RESPONSE_CODES.FORBIDDEN,
        "You can only update your own hospital"
      );
    }
  }

  // Fields that can be updated
  const allowedUpdates = [
    "contactNumber",
    "facilities",
    "operatingHours",
    "totalBeds",
    "address",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // If total beds are updated, adjust available beds accordingly
  if (updates.totalBeds) {
    for (const [bedType, newTotal] of Object.entries(updates.totalBeds)) {
      if (newTotal < hospital.availableBeds[bedType]) {
        hospital.availableBeds[bedType] = newTotal;
      }
    }
  }

  Object.assign(hospital, updates);
  await hospital.save();

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospital updated successfully",
    hospital
  );
});

/**
 * @desc    Get hospital statistics
 * @route   GET /api/v1/hospitals/:id/stats
 * @access  Private (Hospital Staff/Admin)
 */
export const getHospitalStats = asyncHandler(async (req, res) => {
  const hospitalId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Check permissions
  if (userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.HOSPITAL) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Not authorized to view hospital statistics"
    );
  }

  // If hospital, check if they belong to this hospital
  if (userRole === USER_ROLES.HOSPITAL) {
    const user = await User.findById(userId);
    if (user.hospitalInfo.hospitalId.toString() !== hospitalId) {
      return sendResponse(
        res,
        RESPONSE_CODES.FORBIDDEN,
        "You can only view your own hospital statistics"
      );
    }
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Hospital not found");
  }

  // Get emergency statistics for this hospital
  const emergencyStats = await Emergency.aggregate([
    { $match: { assignedHospital: hospital._id } },
    {
      $group: {
        _id: null,
        totalEmergencies: { $sum: 1 },
        completedEmergencies: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        averageResponseTime: { $avg: "$totalResponseTime" },
      },
    },
  ]);

  const stats = {
    hospital: {
      name: hospital.name,
      totalBeds: hospital.totalBeds,
      availableBeds: hospital.availableBeds,
      bedUtilization: hospital.bedUtilization,
      rating: hospital.rating,
    },
    emergencies: emergencyStats[0] || {
      totalEmergencies: 0,
      completedEmergencies: 0,
      averageResponseTime: 0,
    },
  };

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospital statistics retrieved successfully",
    stats
  );
});
