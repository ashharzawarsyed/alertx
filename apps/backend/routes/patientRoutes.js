import express from "express";
import patientController from "../controllers/patientController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Get incoming patients for a hospital
router.get(
  "/hospital/:hospitalId/incoming",
  authenticate,
  patientController.getIncomingPatients
);

// Create a new incoming patient
router.post(
  "/hospital/:hospitalId/incoming",
  authenticate,
  patientController.createIncomingPatient
);

// Update patient status
router.put(
  "/:patientId/status",
  authenticate,
  patientController.updatePatientStatus
);

// Get patient by ID
router.get("/:patientId", authenticate, patientController.getPatientById);

// Get critical alerts for a hospital
router.get(
  "/hospital/:hospitalId/critical",
  authenticate,
  patientController.getCriticalAlerts
);

export default router;
