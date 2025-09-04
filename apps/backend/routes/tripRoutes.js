import express from "express";
import {
  getAllTrips,
  getTripById,
  updateTripStatus,
  updateTripLocation,
  addPatientUpdate,
  completeTrip,
  getMyTrips,
  rateTrip,
  getTripStats,
} from "../controllers/tripController.js";
import { validateObjectId } from "../middlewares/validation.js";
import { authenticate, authorize, driverOrAdmin } from "../middlewares/auth.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

/**
 * @route   GET /api/v1/trips
 * @desc    Get trips (filtered by user role)
 * @access  Private
 */
router.get("/", authenticate, getAllTrips);

/**
 * @route   GET /api/v1/trips/:id
 * @desc    Get trip by ID
 * @access  Private
 */
router.get("/:id", authenticate, validateObjectId("id"), getTripById);

/**
 * @route   PUT /api/v1/trips/:id/status
 * @desc    Update trip status
 * @access  Private (Driver or Admin)
 */
router.put(
  "/:id/status",
  authenticate,
  driverOrAdmin,
  validateObjectId("id"),
  updateTripStatus
);

/**
 * @route   PUT /api/v1/trips/:id/location
 * @desc    Update trip location
 * @access  Private (Driver only)
 */
router.put(
  "/:id/location",
  authenticate,
  authorize(USER_ROLES.DRIVER),
  validateObjectId("id"),
  updateTripLocation
);

/**
 * @route   POST /api/v1/trips/:id/patient-update
 * @desc    Add patient condition update
 * @access  Private (Driver or Hospital staff)
 */
router.post(
  "/:id/patient-update",
  authenticate,
  authorize(USER_ROLES.DRIVER, USER_ROLES.HOSPITAL_STAFF),
  validateObjectId("id"),
  addPatientUpdate
);

/**
 * @route   PUT /api/v1/trips/:id/complete
 * @desc    Complete trip
 * @access  Private (Driver or Hospital staff)
 */
router.put(
  "/:id/complete",
  authenticate,
  authorize(USER_ROLES.DRIVER, USER_ROLES.HOSPITAL_STAFF),
  validateObjectId("id"),
  completeTrip
);

/**
 * @route   POST /api/v1/trips/:id/rate
 * @desc    Rate trip
 * @access  Private (Patient only)
 */
router.post(
  "/:id/rate",
  authenticate,
  authorize(USER_ROLES.PATIENT),
  validateObjectId("id"),
  rateTrip
);

/**
 * @route   GET /api/v1/trips/my
 * @desc    Get my trips
 * @access  Private
 */
router.get("/my", authenticate, getMyTrips);

/**
 * @route   GET /api/v1/trips/stats
 * @desc    Get trip statistics
 * @access  Private (Admin only)
 */
router.get("/stats", authenticate, authorize(USER_ROLES.ADMIN), getTripStats);

export default router;
