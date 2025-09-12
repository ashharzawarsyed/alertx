// Test script for AI Triage Service
const API_BASE = "http://localhost:8000";

// Test cases with expected results
const testCases = [
  {
    name: "Critical - Chest Pain",
    symptoms: "severe chest pain and difficulty breathing",
    expectedSeverity: "critical",
  },
  {
    name: "Critical - Stroke Symptoms",
    symptoms: "slurred speech, paralysis on left side, severe headache",
    expectedSeverity: "critical",
  },
  {
    name: "High - Severe Abdominal Pain",
    symptoms: "severe abdominal pain with fever and vomiting",
    expectedSeverity: "high",
  },
  {
    name: "Medium - Flu Symptoms",
    symptoms: "fever, headache, body aches and cough",
    expectedSeverity: "medium",
  },
  {
    name: "Low - Minor Cold",
    symptoms: "runny nose and slight cough",
    expectedSeverity: "low",
  },
];

async function testTriageService() {
  console.log("🤖 Testing AI Triage Service...\n");

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health Check:", healthData.status);
  } catch (error) {
    console.log("❌ Health Check Failed:", error.message);
    return;
  }

  // Test each case
  for (const testCase of testCases) {
    try {
      console.log(`\n📊 Testing: ${testCase.name}`);
      console.log(`Symptoms: "${testCase.symptoms}"`);

      const response = await fetch(`${API_BASE}/api/triage/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: testCase.symptoms,
          patientInfo: { age: 35 }, // Sample patient info
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const { analysis } = result;

      console.log(
        `Severity: ${analysis.severity} (expected: ${testCase.expectedSeverity})`
      );
      console.log(`Confidence: ${analysis.confidence}%`);
      console.log(
        `Detected: ${analysis.detectedSymptoms
          .map((s) => s.keyword)
          .join(", ")}`
      );

      // Check if result matches expectation
      const match = analysis.severity === testCase.expectedSeverity;
      console.log(match ? "✅ PASS" : "⚠️  Different result");
    } catch (error) {
      console.log("❌ Test Failed:", error.message);
    }
  }

  console.log("\n🎯 AI Triage Service testing completed!");
}

// Run tests
testTriageService();
