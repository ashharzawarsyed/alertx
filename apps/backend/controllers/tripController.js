import Trip from "../models/Trip.js";
import Emergency from "../models/Emergency.js";
import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse } from "../utils/helpers.js";
import { RESPONSE_CODES, TRIP_STATUS, USER_ROLES } from "../utils/constants.js";

/**
 * @desc    Get all trips
 * @route   GET /api/v1/trips
 * @access  Private (Admin/Hospital Staff)
 */
export const getAllTrips = asyncHandler(async (req, res) => {
  const { status, driverId, hospitalId, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (driverId) query.driver = driverId;
  if (hospitalId) query.hospital = hospitalId;

  const skip = (page - 1) * limit;

  const trips = await Trip.find(query)
    .populate("driver", "name phone driverInfo.ambulanceNumber")
    .populate("patient", "name phone")
    .populate("hospital", "name address contactNumber")
    .populate("emergency", "symptoms severityLevel")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Trip.countDocuments(query);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Trips retrieved successfully", {
    trips,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

/**
 * @desc    Get trip by ID
 * @route   GET /api/v1/trips/:id
 * @access  Private
 */
export const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate("driver", "name phone driverInfo")
    .populate("patient", "name phone")
    .populate("hospital", "name address contactNumber location")
    .populate("emergency", "symptoms severityLevel location");

  if (!trip) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Trip not found");
  }

  // Check permissions
  const userId = req.user.id;
  const userRole = req.user.role;

  if (
    userRole !== USER_ROLES.ADMIN &&
    userRole !== USER_ROLES.HOSPITAL_STAFF &&
    trip.patient._id.toString() !== userId &&
    trip.driver._id.toString() !== userId
  ) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Not authorized to view this trip"
    );
  }

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Trip retrieved successfully",
    trip
  );
});

/**
 * @desc    Update trip status
 * @route   PUT /api/v1/trips/:id/status
 * @access  Private (Driver)
 */
export const updateTripStatus = asyncHandler(async (req, res) => {
  const tripId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Trip not found");
  }

  // Only driver can update trip status
  if (trip.driver.toString() !== userId) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only the assigned driver can update trip status"
    );
  }

  // Validate status transition
  const validTransitions = {
    [TRIP_STATUS.STARTED]: [TRIP_STATUS.PICKING_UP],
    [TRIP_STATUS.PICKING_UP]: [TRIP_STATUS.PATIENT_PICKED],
    [TRIP_STATUS.PATIENT_PICKED]: [TRIP_STATUS.EN_ROUTE_HOSPITAL],
    [TRIP_STATUS.EN_ROUTE_HOSPITAL]: [TRIP_STATUS.ARRIVED_HOSPITAL],
    [TRIP_STATUS.ARRIVED_HOSPITAL]: [TRIP_STATUS.COMPLETED],
  };

  if (!validTransitions[trip.status]?.includes(status)) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Invalid status transition"
    );
  }

  await trip.updateStatus(status);

  // TODO: Emit socket event for real-time updates
  // TODO: Send notifications

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Trip status updated successfully",
    trip
  );
});

/**
 * @desc    Update trip location
 * @route   PUT /api/v1/trips/:id/location
 * @access  Private (Driver)
 */
export const updateTripLocation = asyncHandler(async (req, res) => {
  const tripId = req.params.id;
  const { lat, lng, speed, heading } = req.body;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Trip not found");
  }

  // Only driver can update location
  if (trip.driver.toString() !== userId) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only the assigned driver can update location"
    );
  }

  await trip.updateLocation(lat, lng, speed, heading);

  // TODO: Emit socket event for real-time tracking

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Location updated successfully");
});

/**
 * @desc    Add patient update during trip
 * @route   POST /api/v1/trips/:id/patient-update
 * @access  Private (Driver)
 */
export const addPatientUpdate = asyncHandler(async (req, res) => {
  const tripId = req.params.id;
  const { condition, vitals, notes } = req.body;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Trip not found");
  }

  // Only driver can add patient updates
  if (trip.driver.toString() !== userId) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only the assigned driver can add patient updates"
    );
  }

  await trip.addPatientUpdate(condition, vitals, notes, userId);

  // TODO: Notify hospital about patient condition

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Patient update added successfully"
  );
});

/**
 * @desc    Complete trip with handover details
 * @route   PUT /api/v1/trips/:id/complete
 * @access  Private (Driver/Hospital Staff)
 */
export const completeTrip = asyncHandler(async (req, res) => {
  const tripId = req.params.id;
  const { handoverNotes, patientCondition } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Trip not found");
  }

  // Only driver or hospital staff can complete trip
  if (
    userRole !== USER_ROLES.HOSPITAL_STAFF &&
    trip.driver.toString() !== userId
  ) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Not authorized to complete this trip"
    );
  }

  // Update trip completion details
  trip.completion = {
    handoverTime: new Date(),
    handoverNotes,
    hospitalStaff: userRole === USER_ROLES.HOSPITAL_STAFF ? userId : null,
    patientCondition,
  };

  await trip.updateStatus(TRIP_STATUS.COMPLETED);

  // Update driver status to available
  await User.findByIdAndUpdate(trip.driver, {
    "driverInfo.status": "available",
  });

  // Update emergency status
  await Emergency.findByIdAndUpdate(trip.emergency, {
    status: "completed",
    completedTime: new Date(),
  });

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Trip completed successfully",
    trip
  );
});

/**
 * @desc    Get driver's trips
 * @route   GET /api/v1/trips/my
 * @access  Private (Driver)
 */
export const getMyTrips = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { driver: driverId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const trips = await Trip.find(query)
    .populate("patient", "name phone")
    .populate("hospital", "name address contactNumber")
    .populate("emergency", "symptoms severityLevel")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Trip.countDocuments(query);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Your trips retrieved successfully",
    {
      trips,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    }
  );
});

/**
 * @desc    Rate trip (Patient)
 * @route   PUT /api/v1/trips/:id/rate
 * @access  Private (Patient)
 */
export const rateTrip = asyncHandler(async (req, res) => {
  const tripId = req.params.id;
  const { patientRating, hospitalRating, feedback } = req.body;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Trip not found");
  }

  // Only patient can rate the trip
  if (trip.patient.toString() !== userId) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only the patient can rate this trip"
    );
  }

  if (trip.status !== TRIP_STATUS.COMPLETED) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Trip must be completed before rating"
    );
  }

  trip.rating = {
    patientRating,
    hospitalRating,
    feedback,
    ratedAt: new Date(),
  };

  await trip.save();

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Trip rated successfully", trip);
});

/**
 * @desc    Get trip statistics
 * @route   GET /api/v1/trips/stats
 * @access  Private (Admin)
 */
export const getTripStats = asyncHandler(async (req, res) => {
  const stats = await Trip.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        averageDuration: { $avg: "$duration" },
      },
    },
  ]);

  // Get average ratings
  const ratingStats = await Trip.aggregate([
    { $match: { "rating.patientRating": { $exists: true } } },
    {
      $group: {
        _id: null,
        averagePatientRating: { $avg: "$rating.patientRating" },
        averageHospitalRating: { $avg: "$rating.hospitalRating" },
        totalRatedTrips: { $sum: 1 },
      },
    },
  ]);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Trip statistics retrieved successfully",
    {
      statusBreakdown: stats,
      ratings: ratingStats[0] || {
        averagePatientRating: 0,
        averageHospitalRating: 0,
        totalRatedTrips: 0,
      },
    }
  );
});
