import express from "express";
import {
  registerHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  updateBedAvailability,
  getHospitalStats,
  approveHospital,
  getPendingHospitals,
  getHospitalAmbulancesTracking,
} from "../controllers/hospitalController.js";
import {
  validateHospital,
  validateObjectId,
} from "../middlewares/validation.js";
import {
  authenticate,
  adminOnly,
  hospitalOrAdmin,
} from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/v1/hospitals
 * @desc    Register new hospital
 * @access  Public
 */
router.post("/", validateHospital, registerHospital);

/**
 * @route   GET /api/v1/hospitals
 * @desc    Get all hospitals
 * @access  Public
 */
router.get("/", getAllHospitals);

/**
 * @route   GET /api/v1/hospitals/:id
 * @desc    Get hospital by ID
 * @access  Public
 */
router.get("/:id", validateObjectId("id"), getHospitalById);

/**
 * @route   PUT /api/v1/hospitals/:id
 * @desc    Update hospital information
 * @access  Private (Hospital or Admin)
 */
router.put(
  "/:id",
  authenticate,
  hospitalOrAdmin,
  validateObjectId("id"),
  updateHospital
);

/**
 * @route   PUT /api/v1/hospitals/:id/beds
 * @desc    Update bed availability
 * @access  Private (Hospital staff or Admin)
 */
router.put(
  "/:id/beds",
  authenticate,
  hospitalOrAdmin,
  validateObjectId("id"),
  updateBedAvailability
);

/**
 * @route   GET /api/v1/hospitals/pending
 * @desc    Get pending hospital approvals
 * @access  Private (Admin only)
 */
router.get("/pending", authenticate, adminOnly, getPendingHospitals);

/**
 * @route   GET /api/v1/hospitals/:id/stats
 * @desc    Get hospital statistics
 * @access  Private (Hospital or Admin)
 */
router.get(
  "/:id/stats",
  authenticate,
  hospitalOrAdmin,
  validateObjectId("id"),
  getHospitalStats
);

/**
 * @route   PUT /api/v1/hospitals/:id/approve
 * @desc    Approve hospital registration
 * @access  Private (Admin only)
 */
router.put(
  "/:id/approve",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  approveHospital
);

/**
 * @route   GET /api/v1/hospitals/:id/ambulances/tracking
 * @desc    Get ambulance tracking data for hospital
 * @access  Private (Hospital)
 */
router.get(
  "/:id/ambulances/tracking",
  authenticate,
  validateObjectId("id"),
  getHospitalAmbulancesTracking
);

export default router;
