// Simple test for medical profile system
const API_BASE = "http://localhost:5002/api/v1";
let authToken = "";

async function testMedicalProfileSystem() {
  console.log("🏥 Testing Medical Profile System...\n");

  // Step 1: Register and login
  const token = await registerAndLogin();
  if (!token) {
    console.log("❌ Cannot proceed without authentication");
    return;
  }

  // Step 2: Test medical profile endpoints
  await testMedicalProfileEndpoints(token);

  console.log("\n🎯 Medical Profile System testing completed!");
}

async function registerAndLogin() {
  try {
    // Use unique timestamp to avoid conflicts
    const timestamp = Date.now();

    console.log("👤 Registering test patient...");

    const registrationData = {
      name: `Test Patient ${timestamp}`,
      email: `patient${timestamp}@test.com`,
      password: "Password123!",
      phone: `+123456${timestamp.toString().slice(-4)}`,
      role: "patient",
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData),
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log("✅ Patient registered successfully");
      console.log(`User ID: ${registerResult.data.user._id}`);
      console.log(
        `Token: ${registerResult.data.token ? "Received" : "Missing"}`
      );
      return registerResult.data.token;
    } else {
      const errorText = await registerResponse.text();
      console.log("❌ Registration failed:", errorText);
      return null;
    }
  } catch (error) {
    console.log("❌ Registration error:", error.message);
    return null;
  }
}

async function testMedicalProfileEndpoints(token) {
  console.log("\n📋 Testing Medical Profile Endpoints...");

  // Test 1: Get current profile
  await testGetProfile(token);

  // Test 2: Update basic medical info
  await testUpdateBasicInfo(token);

  // Test 3: Add allergies
  await testAddAllergies(token);

  // Test 4: Add emergency contacts
  await testAddEmergencyContacts(token);
}

async function testGetProfile(token) {
  try {
    console.log("\n📄 Testing: Get Medical Profile");

    const response = await fetch(`${API_BASE}/medical-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Profile retrieved successfully");
      console.log(`Profile completion: ${result.data.profileCompletion}%`);
    } else {
      const errorText = await response.text();
      console.log("❌ Get profile failed:", errorText);
    }
  } catch (error) {
    console.log("❌ Get profile error:", error.message);
  }
}

async function testUpdateBasicInfo(token) {
  try {
    console.log("\n🩺 Testing: Update Basic Medical Info");

    const basicInfo = {
      bloodType: "O+",
      height: { feet: 5, inches: 10 },
      weight: { value: 180, unit: "lbs" },
      dateOfBirth: "1985-06-15",
      lifestyle: {
        smokingStatus: "never",
        alcoholConsumption: "occasional",
        exerciseFrequency: "weekly",
      },
    };

    const response = await fetch(`${API_BASE}/medical-profile/basic-info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(basicInfo),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Basic info updated successfully");
      console.log(`Blood type: ${result.data.bloodType}`);
    } else {
      const errorText = await response.text();
      console.log("❌ Update basic info failed:", errorText);
    }
  } catch (error) {
    console.log("❌ Update basic info error:", error.message);
  }
}

async function testAddAllergies(token) {
  try {
    console.log("\n🤧 Testing: Add Allergies");

    const allergies = [
      {
        allergen: "Penicillin",
        severity: "severe",
        reaction: "Rash and difficulty breathing",
      },
    ];

    const response = await fetch(`${API_BASE}/medical-profile/allergies`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ allergies }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Allergies added successfully");
      console.log(`Total allergies: ${result.data.length}`);
    } else {
      const errorText = await response.text();
      console.log("❌ Add allergies failed:", errorText);
    }
  } catch (error) {
    console.log("❌ Add allergies error:", error.message);
  }
}

async function testAddEmergencyContacts(token) {
  try {
    console.log("\n📞 Testing: Add Emergency Contacts");

    const contacts = [
      {
        name: "Jane Smith",
        relationship: "Spouse",
        phone: "+1234567890",
        email: "jane@example.com",
      },
    ];

    const response = await fetch(
      `${API_BASE}/medical-profile/emergency-contacts`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContacts: contacts }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Emergency contacts added successfully");
      console.log(`Primary contact: ${result.data[0].name}`);
    } else {
      const errorText = await response.text();
      console.log("❌ Add emergency contacts failed:", errorText);
    }
  } catch (error) {
    console.log("❌ Add emergency contacts error:", error.message);
  }
}

// Run the test
testMedicalProfileSystem();
