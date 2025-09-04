import express from "express";
import authRoutes from "./authRoutes.js";
import emergencyRoutes from "./emergencyRoutes.js";
import hospitalRoutes from "./hospitalRoutes.js";
import userRoutes from "./userRoutes.js";
import tripRoutes from "./tripRoutes.js";

const router = express.Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/emergencies", emergencyRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/users", userRoutes);
router.use("/trips", tripRoutes);

// API Info
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AlertX API v1",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      emergencies: "/api/v1/emergencies",
      hospitals: "/api/v1/hospitals",
      users: "/api/v1/users",
      trips: "/api/v1/trips",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
