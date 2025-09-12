import { triageService } from "../services/triageService.js";

export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, patientInfo } = req.body;

    // Basic validation
    if (
      !symptoms ||
      typeof symptoms !== "string" ||
      symptoms.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Symptoms description is required",
        message: "Please provide a valid symptoms description",
      });
    }

    // Analyze symptoms using triage service
    const analysis = await triageService.analyze(symptoms, patientInfo);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Triage analysis error:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: "Unable to analyze symptoms at this time",
    });
  }
};
