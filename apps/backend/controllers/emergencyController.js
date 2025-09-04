import Emergency from "../models/Emergency.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Trip from "../models/Trip.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse, calculateDistance } from "../utils/helpers.js";
import {
  RESPONSE_CODES,
  EMERGENCY_STATUS,
  USER_ROLES,
  DRIVER_STATUS,
  DISTANCE_LIMITS,
  SEVERITY_LEVELS,
} from "../utils/constants.js";

/**
 * @desc    Create emergency request
 * @route   POST /api/v1/emergencies
 * @access  Private (Patient)
 */
export const createEmergency = asyncHandler(async (req, res) => {
  const { symptoms, description, location } = req.body;

  // Verify user is a patient
  if (req.user.role !== USER_ROLES.PATIENT) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only patients can create emergency requests"
    );
  }

  // Check if patient has any active emergency
  const activeEmergency = await Emergency.findOne({
    patient: req.user.id,
    status: {
      $in: [
        EMERGENCY_STATUS.PENDING,
        EMERGENCY_STATUS.ACCEPTED,
        EMERGENCY_STATUS.IN_PROGRESS,
      ],
    },
  });

  if (activeEmergency) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "You already have an active emergency request"
    );
  }

  // Create emergency
  const emergency = await Emergency.create({
    patient: req.user.id,
    symptoms,
    description,
    location,
    status: EMERGENCY_STATUS.PENDING,
  });

  // TODO: Integrate with AI service for triage
  // For now, assign medium severity as default
  emergency.severityLevel = SEVERITY_LEVELS.MEDIUM;
  emergency.triageScore = 5;

  await emergency.save();

  // TODO: Start ambulance dispatch process
  // findAndDispatchAmbulance(emergency);

  // TODO: Notify emergency contacts
  // notifyEmergencyContacts(emergency);

  await emergency.populate("patient", "name phone location");

  sendResponse(
    res,
    RESPONSE_CODES.CREATED,
    "Emergency request created successfully",
    {
      emergency,
    }
  );
});

/**
 * @desc    Get all emergencies (with filters)
 * @route   GET /api/v1/emergencies
 * @access  Private
 */
export const getEmergencies = asyncHandler(async (req, res) => {
  const { status, severity, page = 1, limit = 10 } = req.query;

  // Build filter based on user role
  let filter = {};

  if (req.user.role === USER_ROLES.PATIENT) {
    filter.patient = req.user.id;
  } else if (req.user.role === USER_ROLES.DRIVER) {
    filter.assignedDriver = req.user.id;
  } else if (req.user.role === USER_ROLES.HOSPITAL_STAFF) {
    const user = await User.findById(req.user.id).populate(
      "hospitalInfo.hospitalId"
    );
    if (user.hospitalInfo && user.hospitalInfo.hospitalId) {
      filter.assignedHospital = user.hospitalInfo.hospitalId._id;
    }
  }

  // Add additional filters
  if (status) filter.status = status;
  if (severity) filter.severityLevel = severity;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "patient", select: "name phone" },
      { path: "assignedDriver", select: "name phone driverInfo" },
      { path: "assignedHospital", select: "name address contactNumber" },
    ],
  };

  const emergencies = await Emergency.paginate(filter, options);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Emergencies retrieved successfully",
    {
      emergencies: emergencies.docs,
      pagination: {
        currentPage: emergencies.page,
        totalPages: emergencies.totalPages,
        totalItems: emergencies.totalDocs,
        hasNext: emergencies.hasNextPage,
        hasPrev: emergencies.hasPrevPage,
      },
    }
  );
});

/**
 * @desc    Get emergency by ID
 * @route   GET /api/v1/emergencies/:id
 * @access  Private
 */
export const getEmergency = asyncHandler(async (req, res) => {
  const emergency = await Emergency.findById(req.params.id)
    .populate("patient", "name phone location")
    .populate("assignedDriver", "name phone driverInfo")
    .populate("assignedHospital", "name address contactNumber location")
    .populate("trip")
    .populate("notes.addedBy", "name role");

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  // Check access permissions
  const hasAccess =
    req.user.role === USER_ROLES.ADMIN ||
    emergency.patient.toString() === req.user.id ||
    emergency.assignedDriver?.toString() === req.user.id ||
    (req.user.role === USER_ROLES.HOSPITAL_STAFF &&
      emergency.assignedHospital?.toString() ===
        req.user.hospitalInfo?.hospitalId?.toString());

  if (!hasAccess) {
    return sendResponse(res, RESPONSE_CODES.FORBIDDEN, "Access denied");
  }

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Emergency details retrieved", {
    emergency,
  });
});

/**
 * @desc    Accept emergency (Driver)
 * @route   PUT /api/v1/emergencies/:id/accept
 * @access  Private (Driver)
 */
export const acceptEmergency = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only drivers can accept emergencies"
    );
  }

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  if (emergency.status !== EMERGENCY_STATUS.PENDING) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Emergency is not available for acceptance"
    );
  }

  // Check if driver is available
  const driver = await User.findById(req.user.id);
  if (driver.driverInfo.status !== DRIVER_STATUS.AVAILABLE) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Driver is not available"
    );
  }

  // Check if driver has any active emergency
  const activeEmergency = await Emergency.findOne({
    assignedDriver: req.user.id,
    status: { $in: [EMERGENCY_STATUS.ACCEPTED, EMERGENCY_STATUS.IN_PROGRESS] },
  });

  if (activeEmergency) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "Driver already has an active emergency"
    );
  }

  // Find nearest hospital with available beds
  const nearestHospital = await findNearestHospital(emergency.location);

  if (!nearestHospital) {
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "No available hospital found nearby"
    );
  }

  // Accept emergency
  emergency.assignedDriver = req.user.id;
  emergency.assignedHospital = nearestHospital._id;
  await emergency.updateStatus(EMERGENCY_STATUS.ACCEPTED);

  // Update driver status
  driver.driverInfo.status = DRIVER_STATUS.BUSY;
  await driver.save();

  // Create trip
  const trip = await Trip.create({
    emergency: emergency._id,
    driver: req.user.id,
    patient: emergency.patient,
    hospital: nearestHospital._id,
    pickupLocation: emergency.location,
    hospitalLocation: nearestHospital.location,
    ambulanceDetails: {
      vehicleNumber: driver.driverInfo.ambulanceNumber,
      driverName: driver.name,
      driverPhone: driver.phone,
    },
  });

  emergency.trip = trip._id;
  await emergency.save();

  await emergency.populate([
    { path: "patient", select: "name phone" },
    { path: "assignedHospital", select: "name address contactNumber location" },
  ]);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Emergency accepted successfully", {
    emergency,
    trip,
  });
});

/**
 * @desc    Update emergency status
 * @route   PUT /api/v1/emergencies/:id/status
 * @access  Private
 */
export const updateEmergencyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  // Check permissions
  const canUpdate =
    req.user.role === USER_ROLES.ADMIN ||
    emergency.assignedDriver?.toString() === req.user.id ||
    (req.user.role === USER_ROLES.HOSPITAL_STAFF &&
      emergency.assignedHospital?.toString() ===
        req.user.hospitalInfo?.hospitalId?.toString());

  if (!canUpdate) {
    return sendResponse(res, RESPONSE_CODES.FORBIDDEN, "Permission denied");
  }

  await emergency.updateStatus(status, req.user.id);

  // Update driver status if emergency is completed or cancelled
  if (
    status === EMERGENCY_STATUS.COMPLETED ||
    status === EMERGENCY_STATUS.CANCELLED
  ) {
    if (emergency.assignedDriver) {
      await User.findByIdAndUpdate(emergency.assignedDriver, {
        "driverInfo.status": DRIVER_STATUS.AVAILABLE,
      });
    }
  }

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Emergency status updated successfully",
    {
      emergency,
    }
  );
});

/**
 * @desc    Add note to emergency
 * @route   POST /api/v1/emergencies/:id/notes
 * @access  Private
 */
export const addNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  await emergency.addNote(note, req.user.id);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Note added successfully", {
    emergency,
  });
});

/**
 * Helper function to find nearest hospital
 */
const findNearestHospital = async (location) => {
  const hospitals = await Hospital.find({
    isActive: true,
    totalAvailableBeds: { $gt: 0 },
  });

  let nearestHospital = null;
  let minDistance = Infinity;

  for (const hospital of hospitals) {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      hospital.location.lat,
      hospital.location.lng
    );

    if (
      distance < minDistance &&
      distance <= DISTANCE_LIMITS.MAX_HOSPITAL_SEARCH_RADIUS
    ) {
      minDistance = distance;
      nearestHospital = hospital;
    }
  }

  return nearestHospital;
};
