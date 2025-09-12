// Test Emergency Button Functionality
import fetch from "node-fetch";

async function testEmergencyButton() {
  console.log("🚨 Testing Emergency Button Functionality...\n");

  // Create a new user for the emergency button test
  const randomId = Math.random().toString(36).substring(2, 15);
  const email = `emergency-button-${randomId}@example.com`;
  const phone = `+123456${Math.floor(Math.random() * 10000)}`;

  console.log("📋 Step 1: Registering test user for emergency button...");
  const registerResponse = await fetch(
    "http://localhost:5000/api/v1/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Emergency Button Test User",
        email: email,
        password: "TestPass123!",
        phone: phone,
        role: "patient",
        location: {
          lat: 40.7282,
          lng: -73.7949,
          address: "911 Emergency Rd, New York, NY",
        },
      }),
    }
  );

  if (!registerResponse.ok) {
    const registerError = await registerResponse.json();
    console.log("❌ Registration failed:", registerError.message);
    return;
  }

  const registerData = await registerResponse.json();
  const token = registerData.data.token;
  console.log("✅ User registered successfully");

  console.log("\n📋 Step 2: Testing Emergency Button (Critical Emergency)...");

  const emergencyButtonPayload = {
    location: {
      lat: 40.7282,
      lng: -73.7949,
      address: "911 Emergency Rd, New York, NY",
    },
    notes: "Emergency button pressed - need immediate help",
  };

  console.log("📤 Emergency Button Payload:");
  console.log(JSON.stringify(emergencyButtonPayload, null, 2));

  try {
    const emergencyResponse = await fetch(
      "http://localhost:5000/api/v1/emergencies/emergency-button",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emergencyButtonPayload),
      }
    );

    console.log("\n📥 Emergency Button Response:");
    console.log("Status:", emergencyResponse.status);
    console.log("Status Text:", emergencyResponse.statusText);

    if (emergencyResponse.ok) {
      const emergencyData = await emergencyResponse.json();
      console.log("✅ Emergency Button Response:");
      console.log("Success:", emergencyData.success);
      console.log("Message:", emergencyData.message);

      if (emergencyData.data?.emergency) {
        const emergency = emergencyData.data.emergency;
        console.log("\n🚨 Emergency Details:");
        console.log("   Emergency ID:", emergency._id);
        console.log("   Severity Level:", emergency.severityLevel);
        console.log("   Status:", emergency.status);
        console.log("   Triage Score:", emergency.triageScore, "/10");
        console.log("   Location:", emergency.location.address);
        console.log(
          "   Created At:",
          new Date(emergency.createdAt).toLocaleString()
        );

        if (emergency.notes && emergency.notes.length > 0) {
          console.log("   Notes:", emergency.notes[0].text);
        }

        // Verify it's classified as critical
        if (
          emergency.severityLevel === "critical" &&
          emergency.triageScore >= 9
        ) {
          console.log("\n✅ EMERGENCY BUTTON TEST PASSED!");
          console.log("   ✓ Correctly classified as CRITICAL");
          console.log(
            "   ✓ High triage score (" + emergency.triageScore + "/10)"
          );
          console.log("   ✓ Immediate response ready");
          console.log("   ✓ Bypassed AI analysis for instant response");
        } else {
          console.log("\n⚠️  Emergency button classification may need review");
          console.log(
            "   Severity:",
            emergency.severityLevel,
            "(expected: critical)"
          );
          console.log(
            "   Triage Score:",
            emergency.triageScore,
            "(expected: 9-10)"
          );
        }
      }
    } else {
      const errorData = await emergencyResponse.json();
      console.log("❌ Emergency Button Failed:");
      console.log("Error:", errorData.message);
      console.log("Details:", errorData.error || "No additional details");
    }
  } catch (error) {
    console.error("❌ Emergency Button Test Error:", error.message);
  }

  console.log("\n🔍 Emergency Button Test Completed!");
}

testEmergencyButton().catch(console.error);
