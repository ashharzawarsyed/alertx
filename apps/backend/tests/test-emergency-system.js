// Test script for Emergency System Integration
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

// Test user credentials (create unique user each time to avoid conflicts)
const TEST_USER = {
  email: `testpatient${Date.now()}@example.com`,
  password: "Password123",
};

let authToken = null;

async function authenticateUser() {
  try {
    console.log("🔐 Creating and authenticating test user...");

    // First register a new user
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Patient",
        email: TEST_USER.email,
        password: TEST_USER.password,
        role: "patient",
        phone: `+123456${Date.now().toString().slice(-4)}`, // Unique phone
        location: {
          lat: 40.7128,
          lng: -74.006,
          address: "123 Test Street, New York, NY",
        },
      }),
    });

    if (!registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.error("Registration failed:", registerData.message);
      return false;
    }

    console.log("✅ User registered successfully");

    // Now login with the new user
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.data.token;

    console.log("✅ User authenticated successfully");
    return true;
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    return false;
  }
}

async function testEmergencyCreation(scenario) {
  try {
    console.log(`\n🚨 Testing: ${scenario.name}`);
    console.log("📋 Payload:", JSON.stringify(scenario.payload, null, 2));

    const endpoint = scenario.isEmergencyButton
      ? `${API_BASE}/emergencies/emergency-button`
      : `${API_BASE}/emergencies`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(scenario.payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || "Unknown error"}`
      );
    }

    const result = await response.json();
    const emergency = result.data.emergency;
    const aiAnalysis = result.data.aiAnalysis;

    console.log("✅ Emergency created successfully");
    console.log("📊 Emergency Details:");
    console.log(`   ID: ${emergency._id}`);
    console.log(`   Severity: ${emergency.severityLevel}`);
    console.log(`   Status: ${emergency.status}`);
    console.log(`   Triage Score: ${emergency.triageScore}/10`);

    if (aiAnalysis) {
      console.log("🤖 AI Analysis:");
      console.log(
        `   Severity: ${aiAnalysis.severity} (expected: ${scenario.expectedSeverity})`
      );
      console.log(`   Confidence: ${aiAnalysis.confidence}%`);
      console.log(`   Priority: ${aiAnalysis.priority}/5`);
      console.log(
        `   Detected Symptoms: ${
          aiAnalysis.detectedSymptoms?.join(", ") || "None"
        }`
      );
      console.log(
        `   Recommendations: ${
          aiAnalysis.recommendations?.slice(0, 2).join("; ") || "None"
        }`
      );

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
      aiAnalysis,
    };
  } catch (error) {
    console.error("❌ Emergency creation failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testEmergencySystem() {
  console.log("🏥 Starting Emergency System Integration Test...\n");

  // Step 1: Authenticate
  const authenticated = await authenticateUser();
  if (!authenticated) {
    console.log("\n❌ Cannot proceed without authentication");
    return;
  }

  // Step 2: Test emergency creation scenarios
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

  // Step 3: Summary
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

  console.log("\n🔄 Integration Status:");
  console.log(
    `   Backend: ${successful.length > 0 ? "✅ Working" : "❌ Issues"}`
  );
  console.log(
    `   AI Service: ${
      successful.some((r) => r.aiAnalysis)
        ? "✅ Integrated"
        : "⚠️  Not integrated or failing"
    }`
  );
  console.log(
    `   Emergency Button: ${
      successful.some((r) => r.scenario.includes("Emergency Button"))
        ? "✅ Working"
        : "⚠️  Not tested or failing"
    }`
  );

  console.log("\n🏁 Emergency System Test Completed!");
}

// Helper function to test AI service directly
async function testAIServiceDirect() {
  console.log("\n🔍 Testing AI Service Direct Connection...");

  try {
    const response = await fetch("http://localhost:8000/health");
    if (response.ok) {
      const data = await response.json();
      console.log("✅ AI Service Health:", data.status);
    } else {
      console.log("⚠️  AI Service health check failed");
    }
  } catch (error) {
    console.log("❌ AI Service not accessible:", error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testAIServiceDirect();
  await testEmergencySystem();
}

runAllTests().catch(console.error);
