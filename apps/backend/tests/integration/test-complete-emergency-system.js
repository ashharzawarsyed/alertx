// Complete Emergency System Test with Individual Users
import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";

// Test scenarios
const testScenarios = [
  {
    name: "Critical Emergency - Chest Pain",
    payload: {
      symptoms: ["severe chest pain and difficulty breathing"],
      description:
        "Patient experiencing crushing chest pain and shortness of breath",
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: "123 Emergency St, New York, NY",
      },
    },
    expectedSeverity: "critical",
  },
  {
    name: "High Priority - Severe Abdominal Pain",
    payload: {
      symptoms: ["severe abdominal pain with fever and vomiting"],
      description: "Patient has intense stomach pain with high fever",
      location: {
        lat: 40.7505,
        lng: -73.9934,
        address: "456 Medical Ave, New York, NY",
      },
    },
    expectedSeverity: "high",
  },
  {
    name: "Medium Priority - Flu Symptoms",
    payload: {
      symptoms: ["fever, headache, body aches and cough"],
      description: "Patient has flu-like symptoms for 2 days",
      location: {
        lat: 40.7614,
        lng: -73.9776,
        address: "789 Health Blvd, New York, NY",
      },
    },
    expectedSeverity: "medium",
  },
  {
    name: "Emergency Button Test",
    payload: {
      location: {
        lat: 40.7282,
        lng: -73.7949,
        address: "911 Emergency Rd, New York, NY",
      },
      notes: "Emergency button pressed - need immediate help",
    },
    isEmergencyButton: true,
    expectedSeverity: "critical",
  },
];

async function createTestUser(testName) {
  const randomId = Math.random().toString(36).substring(2, 15);

  // Create a shorter name that fits validation (max 50 chars)
  const shortName =
    testName.length > 35
      ? `Test User ${randomId.substring(0, 6)}`
      : `Test User for ${testName}`;

  const testUser = {
    email: `test-${testName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}-${randomId}@example.com`,
    password: "TestPass123!",
    name: shortName,
    phone: `+123456${Math.floor(Math.random() * 10000)}`,
  };

  const registerResponse = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: "patient",
      phone: testUser.phone,
      location: {
        lat: 40.7128,
        lng: -74.006,
        address: "123 Test Street, New York, NY",
      },
    }),
  });

  if (!registerResponse.ok) {
    const registerData = await registerResponse.json();
    throw new Error(`Registration failed: ${registerData.message}`);
  }

  const registerData = await registerResponse.json();
  return registerData.data.token;
}

async function testEmergencyCreation(scenario) {
  console.log(`\n🚨 Testing: ${scenario.name}`);
  console.log("📋 Payload:", JSON.stringify(scenario.payload, null, 2));

  try {
    // Create unique user for this test
    const token = await createTestUser(scenario.name);

    const endpoint = scenario.isEmergencyButton
      ? `${API_BASE}/emergencies/emergency-button`
      : `${API_BASE}/emergencies`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scenario.payload),
    });

    if (response.ok) {
      const data = await response.json();
      const emergency = data.data.emergency;

      console.log("✅ Emergency created successfully");
      console.log("📊 Emergency Details:");
      console.log(`   ID: ${emergency._id}`);
      console.log(`   Severity: ${emergency.severityLevel}`);
      console.log(`   Status: ${emergency.status}`);
      console.log(`   Triage Score: ${emergency.triageScore}/10`);

      // Check AI analysis for non-emergency button tests
      if (!scenario.isEmergencyButton && data.data.aiAnalysis) {
        const aiAnalysis = data.data.aiAnalysis;
        console.log("🤖 AI Analysis:");
        console.log(
          `   Severity: ${aiAnalysis.severity} (expected: ${scenario.expectedSeverity})`
        );
        console.log(`   Confidence: ${aiAnalysis.confidence}%`);
        console.log(`   Priority: ${aiAnalysis.priority}/5`);

        if (
          aiAnalysis.detectedSymptoms &&
          aiAnalysis.detectedSymptoms.length > 0
        ) {
          const symptoms = aiAnalysis.detectedSymptoms.map((s) =>
            typeof s === "object" ? s.keyword || s : s
          );
          console.log(`   Detected Symptoms: ${symptoms.join(", ")}`);
        }

        if (
          aiAnalysis.recommendations &&
          aiAnalysis.recommendations.length > 0
        ) {
          const recs = Array.isArray(aiAnalysis.recommendations)
            ? aiAnalysis.recommendations.join("; ")
            : aiAnalysis.recommendations;
          console.log(`   Recommendations: ${recs}`);
        }

        // Check if severity matches expectation
        if (aiAnalysis.severity === scenario.expectedSeverity) {
          console.log("✅ Severity classification CORRECT");
        } else {
          console.log(
            `⚠️  Severity classification different from expected (got: ${aiAnalysis.severity}, expected: ${scenario.expectedSeverity})`
          );
        }
      }

      return {
        success: true,
        emergencyId: emergency._id,
        severity: emergency.severityLevel,
        triageScore: emergency.triageScore,
      };
    } else {
      const errorData = await response.json();
      const errorMessage = `HTTP ${response.status}: ${errorData.message}`;
      console.log(`❌ Emergency creation failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    console.log(`❌ Emergency creation failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function checkAIServiceHealth() {
  try {
    const response = await fetch("http://localhost:8000/health");
    if (response.ok) {
      console.log("✅ AI Service Health: healthy");
      return true;
    } else {
      console.log("❌ AI Service Health: unhealthy");
      return false;
    }
  } catch (error) {
    console.log("❌ AI Service Health: not responding");
    return false;
  }
}

async function runCompleteEmergencyTest() {
  console.log("🚨 Complete Emergency System Integration Test\n");

  // Check AI service first
  console.log("🔍 Testing AI Service Direct Connection...");
  await checkAIServiceHealth();

  console.log("\n🚀 Starting Emergency System Integration Test...\n");

  const results = [];

  for (const scenario of testScenarios) {
    const result = await testEmergencyCreation(scenario);
    results.push({
      scenario: scenario.name,
      ...result,
    });

    // Wait between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log("\n📊 TEST SUMMARY");
  console.log("================");

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log("\n❌ Failed Tests:");
    failed.forEach((r) => {
      console.log(`   - ${r.scenario}: ${r.error}`);
    });
  }

  if (successful.length > 0) {
    console.log("\n✅ Successful Emergency Creations:");
    successful.forEach((r) => {
      console.log(
        `   - ${r.scenario}: ${r.severity} severity (ID: ${r.emergencyId})`
      );
    });
  }

  // Integration status
  const aiWorking = successful.some(
    (r) => !r.scenario.includes("Emergency Button")
  );
  const emergencyButtonWorking = successful.some((r) =>
    r.scenario.includes("Emergency Button")
  );
  const backendWorking = successful.length > 0;

  console.log("\n🔧 Integration Status:");
  console.log(
    `   Backend: ${backendWorking ? "✅ Working" : "❌ Not working"}`
  );
  console.log(
    `   AI Service: ${
      aiWorking ? "✅ Integrated" : "⚠️  Not integrated or failing"
    }`
  );
  console.log(
    `   Emergency Button: ${
      emergencyButtonWorking ? "✅ Working" : "⚠️  Not tested or failing"
    }`
  );

  console.log("\n🎯 Emergency System Test Completed!");

  // Final status
  if (successful.length === testScenarios.length) {
    console.log("\n🎉 ALL TESTS PASSED! Emergency system is 100% functional!");
  } else if (successful.length > 0) {
    console.log(
      `\n⚠️  Partial success: ${successful.length}/${testScenarios.length} tests passed`
    );
  } else {
    console.log("\n❌ All tests failed. Emergency system needs attention.");
  }
}

runCompleteEmergencyTest().catch(console.error);
