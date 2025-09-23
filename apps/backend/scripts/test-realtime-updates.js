// Script to test real-time status updates for ambulances
const API_BASE_URL = "http://localhost:5001/api/v1";

const loginData = {
  email: "ashharzawarsyedwork@gmail.com",
  password: "Hospital123!@#",
};

const statusOptions = [
  "available",
  "dispatched",
  "en-route",
  "busy",
  "maintenance",
];

async function testRealTimeUpdates() {
  console.log("🔄 Testing Real-Time Ambulance Status Updates\n");

  try {
    // Authenticate
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const loginResult = await loginResponse.json();
    const token = loginResult.data.token;
    const hospitalId =
      loginResult.data.user.hospitalInfo?.hospitalId ||
      loginResult.data.user._id;

    console.log(`✅ Authenticated. Hospital ID: ${hospitalId}`);

    // Get ambulances
    const ambulancesResponse = await fetch(
      `${API_BASE_URL}/ambulances/hospital/${hospitalId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const ambulancesResult = await ambulancesResponse.json();
    const ambulances = ambulancesResult.data || [];

    if (ambulances.length === 0) {
      console.log("❌ No ambulances found to test with");
      return;
    }

    const testAmbulance = ambulances[0];
    console.log(`\n🚑 Testing with: ${testAmbulance.vehicleNumber}`);
    console.log(`   Current status: ${testAmbulance.status}`);

    console.log("\n🎯 Starting status change cycle...");
    console.log(
      "👀 Watch the dashboard at http://localhost:5175/ to see real-time updates!"
    );
    console.log("🔄 Status will change every 3 seconds...\n");

    // Cycle through different statuses
    for (let i = 0; i < statusOptions.length; i++) {
      const newStatus = statusOptions[i];

      console.log(`${i + 1}. Changing to: ${newStatus.toUpperCase()}`);

      try {
        const updateResponse = await fetch(
          `${API_BASE_URL}/ambulances/${testAmbulance._id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (updateResponse.ok) {
          console.log(`   ✅ Updated successfully`);
        } else {
          console.log(`   ❌ Update failed: ${updateResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }

      // Wait 3 seconds before next update
      if (i < statusOptions.length - 1) {
        console.log("   ⏳ Waiting 3 seconds...\n");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Return to original status
    console.log(`\n🔄 Returning to original status: ${testAmbulance.status}`);
    await fetch(`${API_BASE_URL}/ambulances/${testAmbulance._id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: testAmbulance.status }),
    });

    console.log("\n✅ Real-time update test completed!");
    console.log("\n📊 Test Summary:");
    console.log(`- Ambulance tested: ${testAmbulance.vehicleNumber}`);
    console.log(`- Status changes: ${statusOptions.length}`);
    console.log("- Dashboard polling: Every 30 seconds (automatic)");
    console.log("\n💡 Tips:");
    console.log("- Dashboard updates automatically every 30 seconds");
    console.log("- Refresh the page to see immediate updates");
    console.log("- Status colors change based on ambulance state");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testRealTimeUpdates();
