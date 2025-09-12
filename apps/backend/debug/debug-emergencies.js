// Debug emergency fetching
import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";
const TEST_USER = {
  email: "testpatient3@example.com",
  password: "Password123",
};

async function debugEmergencies() {
  try {
    // Authenticate first
    console.log("🔐 Authenticating...");
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!authResponse.ok) {
      throw new Error("Authentication failed");
    }

    const authData = await authResponse.json();
    const token = authData.data.token;
    console.log("✅ Authenticated successfully");

    // Get all emergencies for the user
    console.log("📋 Fetching user emergencies...");
    const emergenciesResponse = await fetch(`${API_BASE}/emergencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🌐 Response status:", emergenciesResponse.status);
    console.log(
      "🔧 Response headers:",
      Object.fromEntries(emergenciesResponse.headers)
    );

    const emergenciesData = await emergenciesResponse.json();
    console.log("📄 Response body:", JSON.stringify(emergenciesData, null, 2));

    if (emergenciesData.data && emergenciesData.data.emergencies) {
      console.log(
        `📊 Found ${emergenciesData.data.emergencies.length} emergencies`
      );
      emergenciesData.data.emergencies.forEach((emergency, index) => {
        console.log(
          `  ${index + 1}. ID: ${emergency._id}, Status: ${
            emergency.status
          }, Severity: ${emergency.severityLevel}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugEmergencies().catch(console.error);
