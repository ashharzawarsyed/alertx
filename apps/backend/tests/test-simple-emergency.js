// Simple emergency creation test to see server logs
import fetch from "node-fetch";

async function testSingleEmergency() {
  console.log("🔄 Testing single emergency creation...");

  // First authenticate
  console.log("🔑 Authenticating...");
  const authResponse = await fetch("http://localhost:5000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Test123!",
    }),
  });

  if (!authResponse.ok) {
    console.log("❌ Auth failed, registering user...");

    const registerResponse = await fetch(
      "http://localhost:5000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "Test123!",
          phone: "+1234567890",
          role: "patient",
        }),
      }
    );

    if (!registerResponse.ok) {
      console.log("❌ Registration failed");
      return;
    }
    console.log("✅ User registered");
  }

  const authData = await authResponse.json();
  const token = authData.data?.token;

  if (!token) {
    console.log("❌ No token received");
    return;
  }

  console.log("✅ Authenticated successfully");

  // Now create emergency
  console.log("🚨 Creating emergency...");

  const emergencyPayload = {
    symptoms: ["severe chest pain"],
    description: "Test chest pain",
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: "123 Test St",
    },
  };

  console.log("📤 Sending payload:", JSON.stringify(emergencyPayload, null, 2));

  try {
    const response = await fetch("http://localhost:5000/api/v1/emergencies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(emergencyPayload),
    });

    console.log("📥 Response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📥 Raw response:", responseText.substring(0, 500) + "...");

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log("✅ Parsed JSON:", data);
    } catch (jsonError) {
      console.log(
        "❌ Failed to parse JSON, response is:",
        responseText.substring(0, 200)
      );
    }
  } catch (error) {
    console.error("❌ Request error:", error.message);
  }
}

testSingleEmergency().catch(console.error);
