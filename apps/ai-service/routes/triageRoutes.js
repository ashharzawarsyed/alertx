import express from "express";
import { analyzeSymptoms } from "../controllers/triageController.js";

const router = express.Router();

// POST /api/triage/analyze
router.post("/analyze", analyzeSymptoms);

// GET /api/triage/test - for testing
router.get("/test", (req, res) => {
  res.json({
    message: "AI Triage Service is working!",
    availableEndpoints: [
      "POST /api/triage/analyze - Analyze symptoms and return severity",
    ],
  });
});

export default router;
