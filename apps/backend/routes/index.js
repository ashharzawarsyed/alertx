import express from "express";
import authRoutes from "./authRoutes.js";
import medicalProfileRoutes from "./medicalProfileRoutes.js";
import emergencyRoutes from "./emergencyRoutes.js";
import hospitalRoutes from "./hospitalRoutes.js";
import hospitalApprovalRoutes from "./hospitalApprovalRoutes.js";
import userRoutes from "./userRoutes.js";
import tripRoutes from "./tripRoutes.js";
import debugRoutes from "./debugRoutes.js";
import globalSearchRoutes from "./globalSearchRoutes.js";
import patientRoutes from "./patientRoutes.js";
import ambulanceRoutes from "./ambulanceRoutes.js";
import firstAidRoutes from "./firstAidRoutes.js";

const router = express.Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/medical-profile", medicalProfileRoutes);
router.use("/emergencies", emergencyRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/admin/hospitals", hospitalApprovalRoutes);
router.use("/users", userRoutes);
router.use("/trips", tripRoutes);
router.use("/debug", debugRoutes);
router.use("/global-search", globalSearchRoutes);
router.use("/patients", patientRoutes);
router.use("/ambulances", ambulanceRoutes);
router.use("/first-aid", firstAidRoutes);

// API Info
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AlertX API v1",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      "medical-profile": "/api/v1/medical-profile",
      emergencies: "/api/v1/emergencies",
      hospitals: "/api/v1/hospitals",
      users: "/api/v1/users",
      trips: "/api/v1/trips",
      patients: "/api/v1/patients",
      ambulances: "/api/v1/ambulances",
      "first-aid": "/api/v1/first-aid",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
