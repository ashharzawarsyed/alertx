import express from "express";
import {
  getPendingHospitals,
  getAllHospitals,
  approveHospital,
  rejectHospital,
  getHospitalById,
  getHospitalStats,
} from "../controllers/hospitalApprovalController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(requireAuth);
router.use(requireAdmin);

// Hospital management routes
router.get("/pending", getPendingHospitals); // GET /api/v1/admin/hospitals/pending
router.get("/stats", getHospitalStats); // GET /api/v1/admin/hospitals/stats
router.get("/", getAllHospitals); // GET /api/v1/admin/hospitals
router.get("/:id", getHospitalById); // GET /api/v1/admin/hospitals/:id
router.put("/:id/approve", approveHospital); // PUT /api/v1/admin/hospitals/:id/approve
router.put("/:id/reject", rejectHospital); // PUT /api/v1/admin/hospitals/:id/reject

export default router;
