import { keywordMatcher } from "../utils/keywordMatcher.js";
import { scoringService } from "./scoringService.js";
import { nlpService } from "./nlpService.js";

class TriageService {
  async analyze(symptoms, patientInfo = {}, useNLP = true) {
    try {
      // Clean and prepare input
      const cleanSymptoms = symptoms.toLowerCase().trim();

      let keywordAnalysis;
      let nlpInsights = null;
      let enhancedSeverity = null;

      if (useNLP) {
        // Step 1: NLP-Enhanced Analysis
        const nlpAnalysis = nlpService.analyze(cleanSymptoms);
        nlpInsights = nlpAnalysis;

        // Step 2: Enhanced keyword matching with NLP
        keywordAnalysis = keywordMatcher.analyzeWithNLP(cleanSymptoms, nlpAnalysis);

        // Step 3: Calculate severity with NLP adjustments
        enhancedSeverity = scoringService.calculateSeverityWithNLP(
          keywordAnalysis,
          nlpAnalysis,
          patientInfo
        );
      } else {
        // Fallback to basic keyword matching
        keywordAnalysis = keywordMatcher.analyze(cleanSymptoms);
      }

      // Step 4: Calculate base severity score
      const severity = enhancedSeverity || scoringService.calculateSeverity(
        keywordAnalysis,
        patientInfo
      );

      // Step 5: Generate confidence score with NLP insights
      const confidence = this.calculateConfidence(keywordAnalysis, nlpInsights);

      // Step 6: Generate recommendations
      const recommendations = this.generateRecommendations(
        severity,
        keywordAnalysis,
        nlpInsights
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
        // Include NLP insights if available
        ...(nlpInsights && {
          nlpInsights: {
            entities: nlpInsights.entities,
            severity: nlpInsights.severity,
            temporal: nlpInsights.temporal,
            sentiment: nlpInsights.sentiment,
            negations: nlpInsights.negations,
            expandedTerms: nlpInsights.expandedSymptoms.addedTerms,
          },
        }),
      };
    } catch (error) {
      console.error("Triage analysis error:", error);
      throw new Error("Failed to analyze symptoms");
    }
  }

  calculateConfidence(keywordAnalysis, nlpInsights = null) {
    // Base confidence from keyword matches
    const { totalMatches, critical, urgent, moderate } = keywordAnalysis;

    let baseConfidence = 25; // Default low confidence

    if (critical.length > 0) baseConfidence = Math.min(95, 80 + critical.length * 5);
    else if (urgent.length > 0) baseConfidence = Math.min(90, 70 + urgent.length * 5);
    else if (moderate.length > 0) baseConfidence = Math.min(85, 60 + moderate.length * 5);
    else if (totalMatches > 0) baseConfidence = 50;

    // Enhance with NLP insights if available
    if (nlpInsights) {
      // Adjust based on medical entities detected
      if (nlpInsights.entities.symptoms.length > 2) {
        baseConfidence += 5;
      }

      // Adjust based on negations (reduce confidence if many negations)
      if (nlpInsights.negations.hasNegations) {
        baseConfidence -= 10;
      }

      // Adjust based on severity modifiers
      if (nlpInsights.severity.multiplier > 1.5) {
        baseConfidence += 10;
      } else if (nlpInsights.severity.multiplier < 0.7) {
        baseConfidence -= 5;
      }

      // Adjust based on temporal info (acute onset = higher confidence)
      if (nlpInsights.temporal.onset === 'acute') {
        baseConfidence += 5;
      }

      // Adjust based on sentiment (high distress = higher confidence)
      if (nlpInsights.sentiment.distressLevel === 'high') {
        baseConfidence += 5;
      }
    }

    return Math.max(10, Math.min(baseConfidence, 99)); // Clamp between 10-99
  }

  generateRecommendations(severity, keywordAnalysis, nlpInsights = null) {
    const recommendations = [];

    // Add temporal-based recommendations
    if (nlpInsights?.temporal.onset === 'acute') {
      recommendations.push("⚠️ Sudden onset detected - seek immediate evaluation");
    }

    // Add distress-based recommendations
    if (nlpInsights?.sentiment.distressLevel === 'high') {
      recommendations.push("📞 High distress level detected - consider calling for support");
    }

    switch (severity) {
      case "critical":
        recommendations.push("🚨 Call emergency services immediately (911)");
        recommendations.push(
          "🛑 Do not move the patient unless absolutely necessary"
        );
        recommendations.push("💓 Monitor vital signs continuously");
        if (nlpInsights?.entities.bodyParts.length > 0) {
          recommendations.push(`📍 Affected areas: ${nlpInsights.entities.bodyParts.join(', ')}`);
        }
        break;

      case "high":
        recommendations.push("🏥 Seek immediate medical attention");
        recommendations.push("🚑 Go to emergency room or urgent care");
        recommendations.push("👁️ Monitor symptoms closely");
        if (nlpInsights?.temporal.duration) {
          recommendations.push(`⏱️ Symptom duration: ${nlpInsights.temporal.duration}`);
        }
        break;

      case "medium":
        recommendations.push("📅 Schedule appointment with healthcare provider within 24-48 hours");
        recommendations.push("📊 Monitor symptoms for changes");
        recommendations.push(
          "💊 Consider over-the-counter treatment if appropriate"
        );
        if (nlpInsights?.entities.symptoms.length > 0) {
          recommendations.push(`🔍 Primary symptoms: ${nlpInsights.entities.symptoms.slice(0, 3).join(', ')}`);
        }
        break;

      case "low":
        recommendations.push("😌 Rest and monitor symptoms");
        recommendations.push("🏠 Consider home remedies");
        recommendations.push("📞 Consult healthcare provider if symptoms persist beyond 2-3 days");
        break;

      default:
        recommendations.push(
          "🩺 Consult healthcare provider for proper evaluation"
        );
    }

    return recommendations;
  }
}

export const triageService = new TriageService();
