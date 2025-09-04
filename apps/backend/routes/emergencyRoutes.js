import express from "express";
import {
  createEmergency,
  getEmergencies,
  getEmergency,
  acceptEmergency,
  updateEmergencyStatus,
  addNote,
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
 * @route   POST /api/v1/emergencies/:id/notes
 * @desc    Add note to emergency
 * @access  Private
 */
router.post("/:id/notes", authenticate, validateObjectId("id"), addNote);

export default router;
