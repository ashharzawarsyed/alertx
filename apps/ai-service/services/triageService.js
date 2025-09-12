import { keywordMatcher } from "../utils/keywordMatcher.js";
import { scoringService } from "./scoringService.js";

class TriageService {
  async analyze(symptoms, patientInfo = {}) {
    try {
      // Clean and prepare input
      const cleanSymptoms = symptoms.toLowerCase().trim();

      // Step 1: Keyword matching
      const keywordAnalysis = keywordMatcher.analyze(cleanSymptoms);

      // Step 2: Calculate severity score
      const severity = scoringService.calculateSeverity(
        keywordAnalysis,
        patientInfo
      );

      // Step 3: Generate confidence score (dummy for now)
      const confidence = this.calculateConfidence(keywordAnalysis);

      // Step 4: Generate recommendations
      const recommendations = this.generateRecommendations(
        severity,
        keywordAnalysis
      );

      return {
        severity,
        confidence,
        detectedSymptoms: keywordAnalysis.matchedKeywords,
        recommendations,
        analysisDetails: {
          criticalKeywords: keywordAnalysis.critical,
          urgentKeywords: keywordAnalysis.urgent,
          moderateKeywords: keywordAnalysis.moderate,
          totalMatches: keywordAnalysis.totalMatches,
        },
      };
    } catch (error) {
      console.error("Triage analysis error:", error);
      throw new Error("Failed to analyze symptoms");
    }
  }

  calculateConfidence(keywordAnalysis) {
    // Dummy confidence calculation based on keyword matches
    const { totalMatches, critical, urgent, moderate } = keywordAnalysis;

    if (critical.length > 0) return Math.min(95, 80 + critical.length * 5);
    if (urgent.length > 0) return Math.min(90, 70 + urgent.length * 5);
    if (moderate.length > 0) return Math.min(85, 60 + moderate.length * 5);
    if (totalMatches > 0) return 50;

    return 25; // Low confidence for no matches
  }

  generateRecommendations(severity, keywordAnalysis) {
    const recommendations = [];

    switch (severity) {
      case "critical":
        recommendations.push("Call emergency services immediately (911)");
        recommendations.push(
          "Do not move the patient unless absolutely necessary"
        );
        recommendations.push("Monitor vital signs continuously");
        break;

      case "high":
        recommendations.push("Seek immediate medical attention");
        recommendations.push("Go to emergency room or urgent care");
        recommendations.push("Monitor symptoms closely");
        break;

      case "medium":
        recommendations.push("Schedule appointment with healthcare provider");
        recommendations.push("Monitor symptoms for changes");
        recommendations.push(
          "Consider over-the-counter treatment if appropriate"
        );
        break;

      case "low":
        recommendations.push("Rest and monitor symptoms");
        recommendations.push("Consider home remedies");
        recommendations.push("Consult healthcare provider if symptoms persist");
        break;

      default:
        recommendations.push(
          "Consult healthcare provider for proper evaluation"
        );
    }

    return recommendations;
  }
}

export const triageService = new TriageService();
