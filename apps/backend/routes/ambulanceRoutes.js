import express from "express";
import ambulanceController from "../controllers/ambulanceController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Get ambulance fleet for a hospital
router.get(
  "/hospital/:hospitalId",
  authenticate,
  ambulanceController.getAmbulanceFleet
);

// Create a new ambulance
router.post(
  "/hospital/:hospitalId",
  authenticate,
  ambulanceController.createAmbulance
);

// Update ambulance status
router.put(
  "/:ambulanceId/status",
  authenticate,
  ambulanceController.updateAmbulanceStatus
);

// Dispatch ambulance to patient
router.post(
  "/:ambulanceId/dispatch",
  authenticate,
  ambulanceController.dispatchAmbulance
);

// Get ambulance by ID
router.get("/:ambulanceId", authenticate, ambulanceController.getAmbulanceById);

// Get available ambulances for a hospital
router.get(
  "/hospital/:hospitalId/available",
  authenticate,
  ambulanceController.getAvailableAmbulances
);

export default router;
