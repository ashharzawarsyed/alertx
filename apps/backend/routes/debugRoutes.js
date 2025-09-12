// Debug endpoint to test AI integration without middleware
import express from "express";
import aiTriageService from "../services/aiTriageService.js";

const router = express.Router();

// Simple test endpoint that bypasses all auth and validation
router.post("/test-ai-direct", async (req, res) => {
  try {
    console.log("🔍 Direct AI test endpoint called");
    console.log("📝 Request body:", JSON.stringify(req.body, null, 2));

    const { symptoms } = req.body;
    const symptomsText = Array.isArray(symptoms)
      ? symptoms.join(", ")
      : symptoms || "test symptom";

    console.log("🚨 Testing AI analysis for:", symptomsText);

    const result = await aiTriageService.analyzeSymptoms(symptomsText, {
      age: 30,
      chronicConditions: [],
      allergies: [],
      medications: [],
    });

    console.log("✅ AI analysis result:", JSON.stringify(result, null, 2));

    return res.json({
      success: true,
      message: "AI test successful",
      result: result,
    });
  } catch (error) {
    console.error("❌ AI test error:", error);
    return res.status(500).json({
      success: false,
      message: "AI test failed",
      error: error.message,
    });
  }
});

// Test emergency creation without auth
router.post("/test-emergency-simple", async (req, res) => {
  try {
    console.log("🔍 Simple emergency test endpoint called");
    console.log("📝 Request body:", JSON.stringify(req.body, null, 2));

    // Mock successful emergency creation
    return res.json({
      success: true,
      message: "Test emergency endpoint working",
      data: {
        id: "test123",
        symptoms: req.body.symptoms,
        severity: "test",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Test emergency error:", error);
    return res.status(500).json({
      success: false,
      message: "Test emergency failed",
      error: error.message,
    });
  }
});

export default router;
