import fetch from "node-fetch";
import { SEVERITY_LEVELS } from "../utils/constants.js";

class AITriageService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || "http://localhost:8000";
    this.timeout = 10000; // 10 seconds timeout
  }

  /**
   * Analyze symptoms using AI triage service
   * @param {string|Array} symptoms - Patient's symptoms description (string or array)
   * @param {object} patientInfo - Optional patient information for context
   * @returns {Promise<object>} AI analysis results
   */
  async analyzeSymptoms(symptoms, patientInfo = {}) {
    try {
      // Ensure symptoms is a string for the AI service
      const symptomsText = Array.isArray(symptoms)
        ? symptoms.join(", ")
        : symptoms || "";
      console.log("🤖 Analyzing symptoms with AI service:", symptomsText);

      const response = await fetch(`${this.baseURL}/api/triage/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptomsText,
          patientInfo,
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status: ${response.status}`);
      }

      const result = await response.json();

      console.log("✅ AI analysis completed:", {
        severity: result.severity,
        confidence: result.confidence,
        detectedSymptoms: result.detectedSymptoms?.length || 0,
      });

      return {
        success: true,
        analysis: result,
      };
    } catch (error) {
      console.error("❌ AI service error:", error.message);

      // Fallback to rule-based classification if AI service fails
      return this.fallbackAnalysis(symptoms);
    }
  }

  /**
   * Fallback analysis when AI service is unavailable
   * @param {string} symptoms - Patient's symptoms
   * @returns {object} Basic severity classification
   */
  fallbackAnalysis(symptoms) {
    console.log("⚠️ Using fallback analysis for symptoms");

    // Ensure symptoms is a string (handle both string and array inputs)
    const symptomsText = Array.isArray(symptoms)
      ? symptoms.join(", ")
      : symptoms || "";
    const lowerSymptoms = symptomsText.toLowerCase();

    // Critical keywords
    const criticalKeywords = [
      "chest pain",
      "difficulty breathing",
      "unconscious",
      "severe bleeding",
      "stroke",
      "heart attack",
      "paralysis",
      "seizure",
      "overdose",
    ];

    // High priority keywords
    const highKeywords = [
      "severe pain",
      "high fever",
      "vomiting blood",
      "severe abdominal pain",
      "breathing problems",
      "allergic reaction",
    ];

    // Check for critical symptoms
    if (criticalKeywords.some((keyword) => lowerSymptoms.includes(keyword))) {
      return {
        success: true,
        analysis: {
          severity: SEVERITY_LEVELS.CRITICAL,
          confidence: 85,
          detectedSymptoms: ["Critical symptoms detected"],
          recommendations: ["Call emergency services immediately"],
          analysisDetails: {
            source: "fallback",
            criticalKeywords: criticalKeywords.filter((k) =>
              lowerSymptoms.includes(k)
            ),
          },
        },
      };
    }

    // Check for high priority symptoms
    if (highKeywords.some((keyword) => lowerSymptoms.includes(keyword))) {
      return {
        success: true,
        analysis: {
          severity: SEVERITY_LEVELS.HIGH,
          confidence: 75,
          detectedSymptoms: ["High priority symptoms detected"],
          recommendations: ["Seek immediate medical attention"],
          analysisDetails: {
            source: "fallback",
            urgentKeywords: highKeywords.filter((k) =>
              lowerSymptoms.includes(k)
            ),
          },
        },
      };
    }

    // Default to medium severity
    return {
      success: true,
      analysis: {
        severity: SEVERITY_LEVELS.MEDIUM,
        confidence: 60,
        detectedSymptoms: ["General symptoms"],
        recommendations: ["Consult healthcare provider"],
        analysisDetails: {
          source: "fallback",
          note: "Default classification due to AI service unavailability",
        },
      },
    };
  }

  /**
   * Check if AI service is healthy
   * @returns {Promise<boolean>} Service health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        timeout: 5000,
      });

      return response.ok;
    } catch (error) {
      console.error("AI service health check failed:", error.message);
      return false;
    }
  }

  /**
   * Calculate priority score based on severity and patient factors
   * @param {string} severity - AI determined severity
   * @param {object} patientInfo - Patient information
   * @returns {number} Priority score (1-5, 5 being highest)
   */
  calculatePriority(severity, patientInfo = {}) {
    let priority = 3; // Default priority

    // Base priority on severity
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        priority = 5;
        break;
      case SEVERITY_LEVELS.HIGH:
        priority = 4;
        break;
      case SEVERITY_LEVELS.MEDIUM:
        priority = 3;
        break;
      case SEVERITY_LEVELS.LOW:
        priority = 2;
        break;
      default:
        priority = 3;
    }

    // Adjust for age (elderly and children get higher priority)
    if (patientInfo.age) {
      if (patientInfo.age >= 65 || patientInfo.age <= 5) {
        priority = Math.min(5, priority + 1);
      }
    }

    // Adjust for chronic conditions
    if (
      patientInfo.chronicConditions &&
      patientInfo.chronicConditions.length > 0
    ) {
      priority = Math.min(5, priority + 1);
    }

    return priority;
  }

  /**
   * Generate emergency recommendations based on severity
   * @param {string} severity - Emergency severity level
   * @returns {array} Array of recommendation strings
   */
  getEmergencyRecommendations(severity) {
    const recommendations = {
      [SEVERITY_LEVELS.CRITICAL]: [
        "Call emergency services immediately (911)",
        "Do not move the patient unless absolutely necessary",
        "Monitor vital signs continuously",
        "Be prepared to perform CPR if needed",
      ],
      [SEVERITY_LEVELS.HIGH]: [
        "Seek immediate medical attention",
        "Go to emergency room or call ambulance",
        "Monitor symptoms closely",
        "Notify emergency contacts",
      ],
      [SEVERITY_LEVELS.MEDIUM]: [
        "Schedule appointment with healthcare provider",
        "Monitor symptoms for changes",
        "Consider urgent care if symptoms worsen",
        "Stay hydrated and rest",
      ],
      [SEVERITY_LEVELS.LOW]: [
        "Rest and monitor symptoms",
        "Consider home remedies if appropriate",
        "Consult healthcare provider if symptoms persist",
        "Maintain normal activities unless uncomfortable",
      ],
    };

    return recommendations[severity] || recommendations[SEVERITY_LEVELS.MEDIUM];
  }
}

// Create singleton instance
export const aiTriageService = new AITriageService();
export default aiTriageService;
