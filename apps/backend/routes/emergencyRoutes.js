import express from "express";
import {
  createEmergency,
  emergencyButton,
  getEmergencies,
  getEmergency,
  acceptEmergency,
  updateEmergencyStatus,
  addNote,
  dispatchIntelligentAmbulance,
  markPickedUp,
  markArrivedAtHospital,
  cancelEmergency,
} from "../controllers/emergencyController.js";
import {
  validateEmergencyRequest,
  validateObjectId,
} from "../middlewares/validation.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

/**
 * @route   POST /api/v1/emergencies
 * @desc    Create new emergency request
 * @access  Private (Patients only)
 */
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.PATIENT),
  validateEmergencyRequest,
  createEmergency
);

/**
 * @route   POST /api/v1/emergencies/emergency-button
 * @desc    Emergency button - Create critical emergency
 * @access  Private (Patients only)
 */
router.post(
  "/emergency-button",
  authenticate,
  authorize(USER_ROLES.PATIENT),
  emergencyButton
);

/**
 * @route   POST /api/v1/emergencies/dispatch-intelligent
 * @desc    Dispatch intelligent ambulance based on AI triage analysis
 * @access  Private (Patients only)
 */
router.post(
  "/dispatch-intelligent",
  authenticate,
  authorize(USER_ROLES.PATIENT),
  dispatchIntelligentAmbulance
);

/**
 * @route   GET /api/v1/emergencies
 * @desc    Get emergencies (filtered by user role)
 * @access  Private
 */
router.get("/", authenticate, getEmergencies);

/**
 * @route   GET /api/v1/emergencies/:id
 * @desc    Get emergency by ID
 * @access  Private
 */
router.get("/:id", authenticate, validateObjectId("id"), getEmergency);

/**
 * @route   PUT /api/v1/emergencies/:id/status
 * @desc    Update emergency status
 * @access  Private (Drivers and Admins)
 */
router.put(
  "/:id/status",
  authenticate,
  authorize(USER_ROLES.DRIVER, USER_ROLES.ADMIN),
  validateObjectId("id"),
  updateEmergencyStatus
);

/**
 * @route   POST /api/v1/emergencies/:id/accept
 * @desc    Driver accepts emergency
 * @access  Private (Drivers only)
 */
router.post(
  "/:id/accept",
  authenticate,
  authorize(USER_ROLES.DRIVER),
  validateObjectId("id"),
  acceptEmergency
);

/**
 * @route   PUT /api/v1/emergencies/:id/pickup
 * @desc    Mark patient picked up
 * @access  Private (Drivers only)
 */
router.put(
  "/:id/pickup",
  authenticate,
  authorize(USER_ROLES.DRIVER),
  validateObjectId("id"),
  markPickedUp
);

/**
 * @route   PUT /api/v1/emergencies/:id/hospital-arrival
 * @desc    Mark arrived at hospital
 * @access  Private (Drivers only)
 */
router.put(
  "/:id/hospital-arrival",
  authenticate,
  authorize(USER_ROLES.DRIVER),
  validateObjectId("id"),
  markArrivedAtHospital
);

/**
 * @route   POST /api/v1/emergencies/:id/notes
 * @desc    Add note to emergency
 * @access  Private
 */
router.post("/:id/notes", authenticate, validateObjectId("id"), addNote);

/**
 * @route   POST /api/v1/emergencies/:id/cancel
 * @desc    Cancel emergency request
 * @access  Private (Patient who created it)
 */
router.post(
  "/:id/cancel",
  authenticate,
  validateObjectId("id"),
  cancelEmergency
);

export default router;
