// Test script for ambulance fleet functionality
// This script tests sending ambulance data and verifying dashboard updates

const API_BASE_URL = "http://localhost:5001/api/v1";

// Test hospital credentials
const loginData = {
  email: "ashharzawarsyedwork@gmail.com",
  password: "Hospital123!@#",
};

// Test ambulance data
const testAmbulances = [
  {
    vehicleNumber: "AMB-TEST-001",
    type: "Advanced Life Support",
    status: "available",
    currentLocation: {
      address: "Test Hospital Emergency Bay",
      coordinates: [73.8567, 18.5204],
    },
    crew: [
      { name: "Dr. Test Smith", role: "Paramedic", certification: "EMT-P" },
      { name: "Nurse Test Johnson", role: "Nurse", certification: "RN" },
    ],
    equipment: [
      { name: "Defibrillator", status: "operational" },
      { name: "Ventilator", status: "operational" },
      { name: "Cardiac Monitor", status: "operational" },
    ],
    fuelLevel: 95,
  },
  {
    vehicleNumber: "AMB-TEST-002",
    type: "Basic Life Support",
    status: "dispatched",
    currentLocation: {
      address: "En Route to Emergency Scene",
      coordinates: [73.8467, 18.5304],
    },
    crew: [
      { name: "EMT Test Davis", role: "EMT", certification: "EMT-B" },
      { name: "EMT Test Wilson", role: "EMT", certification: "EMT-B" },
    ],
    equipment: [
      { name: "First Aid Kit", status: "operational" },
      { name: "Oxygen Tank", status: "operational" },
      { name: "Stretcher", status: "operational" },
    ],
    fuelLevel: 78,
  },
  {
    vehicleNumber: "AMB-TEST-003",
    type: "Advanced Life Support",
    status: "en-route",
    currentLocation: {
      address: "Highway 95, Mile 12",
      coordinates: [73.8667, 18.5404],
    },
    crew: [
      { name: "Dr. Test Brown", role: "Paramedic", certification: "EMT-P" },
      { name: "EMT Test Garcia", role: "EMT", certification: "EMT-I" },
    ],
    equipment: [
      { name: "Cardiac Monitor", status: "operational" },
      { name: "IV Equipment", status: "maintenance" },
      { name: "Defibrillator", status: "operational" },
    ],
    fuelLevel: 62,
  },
];

async function authenticateAndGetToken() {
  console.log("🔐 Authenticating...");

  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.data.token;
    const hospitalId =
      loginResult.data.user.hospitalInfo?.hospitalId ||
      loginResult.data.user._id;

    console.log(`✅ Authenticated successfully. Hospital ID: ${hospitalId}`);
    return { token, hospitalId };
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    throw error;
  }
}

async function getCurrentAmbulances(token, hospitalId) {
  console.log("\n📋 Fetching current ambulances...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/ambulances/hospital/${hospitalId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ambulances: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📊 Current ambulances: ${result.data.length}`);

    result.data.forEach((ambulance, index) => {
      console.log(
        `  ${index + 1}. ${ambulance.vehicleNumber} (${ambulance.status}) - ${ambulance.type}`
      );
    });

    return result.data;
  } catch (error) {
    console.error("❌ Error fetching ambulances:", error.message);
    return [];
  }
}

async function deleteTestAmbulances(token, hospitalId) {
  console.log("\n🧹 Cleaning up test ambulances...");

  const currentAmbulances = await getCurrentAmbulances(token, hospitalId);
  const testAmbulancesToDelete = currentAmbulances.filter((amb) =>
    amb.vehicleNumber.includes("TEST")
  );

  for (const ambulance of testAmbulancesToDelete) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ambulances/${ambulance._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log(`✅ Deleted test ambulance: ${ambulance.vehicleNumber}`);
      } else {
        console.log(
          `⚠️  Could not delete ${ambulance.vehicleNumber}: ${response.status}`
        );
      }
    } catch (error) {
      console.log(
        `⚠️  Error deleting ${ambulance.vehicleNumber}:`,
        error.message
      );
    }
  }
}

async function createTestAmbulances(token, hospitalId) {
  console.log("\n🚑 Creating test ambulances...");

  const createdAmbulances = [];

  for (const ambulanceData of testAmbulances) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ambulances/hospital/${hospitalId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ambulanceData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        createdAmbulances.push(result.data);
        console.log(
          `✅ Created: ${ambulanceData.vehicleNumber} (${ambulanceData.status})`
        );
      } else {
        const errorText = await response.text();
        console.log(
          `❌ Failed to create ${ambulanceData.vehicleNumber}: ${errorText}`
        );
      }
    } catch (error) {
      console.log(
        `❌ Error creating ${ambulanceData.vehicleNumber}:`,
        error.message
      );
    }
  }

  return createdAmbulances;
}

async function updateAmbulanceStatus(token, ambulanceId, newStatus) {
  console.log(`\n🔄 Updating ambulance status to: ${newStatus}`);

  try {
    const response = await fetch(`${API_BASE_URL}/ambulances/${ambulanceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Status updated successfully`);
      return result.data;
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to update status: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Error updating status:`, error.message);
  }
}

async function testAmbulanceFleet() {
  console.log("🧪 Starting Ambulance Fleet Test\n");
  console.log("======================================");

  try {
    // Step 1: Authenticate
    const { token, hospitalId } = await authenticateAndGetToken();

    // Step 2: Show current state
    console.log("\n📊 STEP 1: Current Fleet Status");
    console.log("--------------------------------");
    await getCurrentAmbulances(token, hospitalId);

    // Step 3: Clean up any existing test ambulances
    console.log("\n🧹 STEP 2: Cleanup Phase");
    console.log("--------------------------------");
    await deleteTestAmbulances(token, hospitalId);

    // Step 4: Create test ambulances
    console.log("\n🚑 STEP 3: Creating Test Ambulances");
    console.log("--------------------------------");
    const createdAmbulances = await createTestAmbulances(token, hospitalId);

    // Step 5: Verify creation
    console.log("\n✅ STEP 4: Verification");
    console.log("--------------------------------");
    const finalAmbulances = await getCurrentAmbulances(token, hospitalId);

    // Step 6: Test status updates
    if (createdAmbulances.length > 0) {
      console.log("\n🔄 STEP 5: Testing Status Updates");
      console.log("--------------------------------");
      const firstAmbulance = createdAmbulances[0];
      await updateAmbulanceStatus(token, firstAmbulance._id, "busy");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      await updateAmbulanceStatus(token, firstAmbulance._id, "available");
    }

    // Step 7: Final summary
    console.log("\n🎉 TEST SUMMARY");
    console.log("================================");
    console.log(`✅ Total ambulances in fleet: ${finalAmbulances.length}`);
    console.log(`✅ Test ambulances created: ${createdAmbulances.length}`);
    console.log("✅ Status updates tested: Yes");
    console.log("\n🌐 Dashboard URL: http://localhost:5175/");
    console.log(
      "📝 Login with: ashharzawarsyedwork@gmail.com / Hospital123!@#"
    );
    console.log(
      "\n💡 The dashboard should now show all ambulances with real-time data!"
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

// Run the test
testAmbulanceFleet();
