// Test AI service integration directly
import aiTriageService from "../services/aiTriageService.js";

async function testAIIntegration() {
  console.log("🔍 Testing AI Service Integration...\n");

  const testSymptoms = "severe chest pain and difficulty breathing";
  const testPatientInfo = {
    age: 45,
    chronicConditions: [],
    allergies: [],
    medications: [],
  };

  try {
    console.log("📝 Test symptoms:", testSymptoms);
    console.log("👤 Patient info:", testPatientInfo);

    const result = await aiTriageService.analyzeSymptoms(
      testSymptoms,
      testPatientInfo
    );

    console.log("\n📊 AI Service Result:");
    console.log("Success:", result.success);
    console.log("Analysis:", JSON.stringify(result.analysis, null, 2));

    if (result.success && result.analysis) {
      const priority = aiTriageService.calculatePriority(
        result.analysis.severity,
        testPatientInfo
      );
      console.log("Priority Score:", priority);

      const recommendations = aiTriageService.getEmergencyRecommendations(
        result.analysis.severity
      );
      console.log("Recommendations:", recommendations);

      console.log("\n✅ AI Integration working correctly!");
    } else {
      console.log("\n❌ AI Integration has issues");
    }
  } catch (error) {
    console.error("\n❌ AI Integration Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAIIntegration().catch(console.error);
