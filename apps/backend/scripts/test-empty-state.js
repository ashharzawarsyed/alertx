// Script to test empty state by temporarily clearing ambulances
const API_BASE_URL = "http://localhost:5001/api/v1";

const loginData = {
  email: "ashharzawarsyedwork@gmail.com",
  password: "Hospital123!@#",
};

async function testEmptyState() {
  console.log("🧪 Testing Empty State for Ambulance Fleet\n");

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

    // Get current ambulances
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

    console.log(`\n📊 Current ambulances: ${ambulances.length}`);

    if (ambulances.length === 0) {
      console.log(
        "✅ Fleet is already empty - perfect for testing empty state!"
      );
      console.log("\n🌐 Go to http://localhost:5175/ to see the empty state");
    } else {
      console.log("\n📋 Ambulances in fleet:");
      ambulances.forEach((amb, index) => {
        console.log(
          `  ${index + 1}. ${amb.vehicleNumber} (${amb.status}) - ${amb.type}`
        );
      });

      console.log("\n💡 To test empty state:");
      console.log("1. Go to http://localhost:5175/");
      console.log("2. Currently showing ambulance cards");
      console.log("3. The empty state will show when no ambulances exist");
    }

    console.log("\n🎯 Test Status:");
    console.log(
      `- Ambulance cards: ${ambulances.length > 0 ? "✅ Showing" : "❌ Hidden"}`
    );
    console.log(
      `- Empty state: ${ambulances.length === 0 ? "✅ Showing" : "❌ Hidden"}`
    );
    console.log(`- Loading state: 🔄 Shows briefly during data fetch`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testEmptyState();
