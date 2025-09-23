// Replicate the exact test that's failing
import fetch from "node-fetch";

async function replicateFailingTest() {
  console.log("🔍 Replicating the exact failing test scenario...\n");

  try {
    // Step 1: Register user (exactly like the test script)
    console.log("📋 Step 1: Registering user...");
    const registerResponse = await fetch(
      "http://localhost:5000/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Emergency Test User",
          email: "emergency.test.debug@example.com",
          password: "TestPass123!",
          phone: "+1234567890",
          role: "patient",
          location: {
            lat: 40.7589,
            lng: -73.9851,
            address: "123 Test St, New York, NY",
          },
        }),
      }
    );

    let registerText = await registerResponse.text();
    console.log("Register response status:", registerResponse.status);
    console.log("Register response:", registerText.substring(0, 300));

    // Step 2: Login user
    console.log("\n📋 Step 2: Logging in user...");
    const loginResponse = await fetch(
      "http://localhost:5000/api/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "emergency.test.debug@example.com",
          password: "TestPass123!",
        }),
      }
    );

    const loginText = await loginResponse.text();
    console.log("Login response status:", loginResponse.status);
    console.log("Login response:", loginText.substring(0, 300));

    let loginData;
    try {
      loginData = JSON.parse(loginText);
    } catch (e) {
      console.log("❌ Failed to parse login response as JSON");
      return;
    }

    const token = loginData.data?.token;
    if (!token) {
      console.log("❌ No token received from login");
      return;
    }

    console.log("✅ Token received:", token.substring(0, 20) + "...");

    // Step 3: Create emergency (the failing part)
    console.log("\n📋 Step 3: Creating emergency (the failing part)...");
    const emergencyPayload = {
      symptoms: ["severe chest pain and difficulty breathing"],
      description:
        "Patient experiencing crushing chest pain and shortness of breath",
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: "123 Emergency St, New York, NY",
      },
    };

    console.log(
      "Payload being sent:",
      JSON.stringify(emergencyPayload, null, 2)
    );

    const emergencyResponse = await fetch(
      "http://localhost:5000/api/v1/emergencies",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emergencyPayload),
      }
    );

    console.log("\n📥 Emergency Response Details:");
    console.log("Status:", emergencyResponse.status);
    console.log("Status Text:", emergencyResponse.statusText);
    console.log(
      "Headers:",
      Object.fromEntries(emergencyResponse.headers.entries())
    );

    const emergencyText = await emergencyResponse.text();
    console.log("Raw Response Length:", emergencyText.length);
    console.log("First 500 chars:", emergencyText.substring(0, 500));
    console.log(
      "Response starts with HTML?",
      emergencyText.startsWith("<!DOCTYPE")
    );

    if (emergencyText.startsWith("<!DOCTYPE")) {
      console.log(
        "\n❌ PROBLEM IDENTIFIED: Server is returning HTML error page instead of JSON"
      );
      console.log(
        "This suggests an unhandled server error that bypassed Express JSON error handling"
      );

      // Look for error details in the HTML
      const titleMatch = emergencyText.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) {
        console.log("HTML Error Title:", titleMatch[1]);
      }

      const h1Match = emergencyText.match(/<h1>(.*?)<\/h1>/i);
      if (h1Match) {
        console.log("HTML Error Heading:", h1Match[1]);
      }
    } else {
      console.log("✅ Response is not HTML, attempting JSON parse...");
      try {
        const emergencyData = JSON.parse(emergencyText);
        console.log("Parsed JSON:", emergencyData);
      } catch (e) {
        console.log("❌ Failed to parse as JSON:", e.message);
      }
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    console.error("Stack:", error.stack);
  }
}

replicateFailingTest().catch(console.error);
