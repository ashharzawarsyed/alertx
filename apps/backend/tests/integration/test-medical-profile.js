// Test script for Medical Profile System
const API_BASE = "http://localhost:5001/api/v1";

// You'll need to get the token from logging in first
let authToken = "";

// Test patient registration and login
async function createAndLoginTestPatient() {
  try {
    // First try to register a test patient
    console.log("👤 Creating test patient...");

    const registrationData = {
      name: "John Medical Test",
      email: "john.medical@test.com",
      password: "Password123!",
      phone: "+1234567890",
      role: "patient",
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });

    if (registerResponse.ok) {
      console.log("✅ Test patient registered successfully");
    } else {
      console.log("ℹ️  Test patient already exists, proceeding to login");
    }

    // Now login
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "john.medical@test.com",
        password: "Password123!",
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const result = await response.json();
    authToken = result.data.token;
    console.log("✅ Login successful, token obtained");
    return result.data;
  } catch (error) {
    console.log("❌ Login failed:", error.message);
    return null;
  }
}

// Test medical profile creation
async function testMedicalProfile() {
  console.log("🏥 Testing Medical Profile System...\n");

  // First login to get token
  const loginResult = await createAndLoginTestPatient();
  if (!loginResult) {
    console.log("❌ Cannot proceed without authentication");
    return;
  }

  // Test 1: Get current medical profile
  await testGetMedicalProfile();

  // Test 2: Update basic medical information
  await testUpdateBasicInfo();

  // Test 3: Add allergies
  await testAddAllergies();

  // Test 4: Add medications
  await testAddMedications();

  // Test 5: Add medical conditions
  await testAddMedicalConditions();

  // Test 6: Add emergency contacts
  await testAddEmergencyContacts();

  // Test 7: Update emergency instructions
  await testUpdateEmergencyInstructions();

  console.log("\n🎯 Medical Profile System testing completed!");
}

async function testGetMedicalProfile() {
  try {
    console.log("\n📋 Testing: Get Medical Profile");

    const response = await fetch(`${API_BASE}/medical-profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Medical profile retrieved successfully");
    console.log(`Profile completion: ${result.data.profileCompletion}%`);
  } catch (error) {
    console.log("❌ Get medical profile failed:", error.message);
  }
}

async function testUpdateBasicInfo() {
  try {
    console.log("\n🩺 Testing: Update Basic Medical Info");

    const basicInfo = {
      bloodType: "O+",
      height: {
        feet: 5,
        inches: 10,
      },
      weight: {
        value: 180,
        unit: "lbs",
      },
      dateOfBirth: "1980-05-15",
      lifestyle: {
        smokingStatus: "never",
        alcoholConsumption: "occasional",
        exerciseFrequency: "weekly",
        dietaryRestrictions: ["none"],
        occupation: "Software Engineer",
      },
    };

    const response = await fetch(`${API_BASE}/medical-profile/basic-info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(basicInfo),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Basic medical info updated successfully");
    console.log(`Blood type: ${result.data.bloodType}`);
    console.log(
      `Height: ${result.data.height.feet}'${result.data.height.inches}"`
    );
  } catch (error) {
    console.log("❌ Update basic info failed:", error.message);
  }
}

async function testAddAllergies() {
  try {
    console.log("\n🤧 Testing: Add Allergies");

    const allergies = [
      {
        allergen: "Penicillin",
        severity: "severe",
        reaction: "Rash and difficulty breathing",
        dateDiscovered: "2015-03-20",
      },
      {
        allergen: "Shellfish",
        severity: "moderate",
        reaction: "Hives and swelling",
        dateDiscovered: "2018-07-10",
      },
    ];

    const response = await fetch(`${API_BASE}/medical-profile/allergies`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ allergies }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Allergies added successfully");
    console.log(`Total allergies: ${result.data.length}`);
  } catch (error) {
    console.log("❌ Add allergies failed:", error.message);
  }
}

async function testAddMedications() {
  try {
    console.log("\n💊 Testing: Add Medications");

    const medications = [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        prescribedBy: "Dr. Smith",
        startDate: "2023-01-15",
        isActive: true,
        notes: "For high blood pressure",
      },
      {
        name: "Vitamin D3",
        dosage: "2000 IU",
        frequency: "Daily",
        isActive: true,
        notes: "Supplement",
      },
    ];

    const response = await fetch(`${API_BASE}/medical-profile/medications`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ medications }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Medications added successfully");
    console.log(`Total medications: ${result.data.length}`);
  } catch (error) {
    console.log("❌ Add medications failed:", error.message);
  }
}

async function testAddMedicalConditions() {
  try {
    console.log("\n🩺 Testing: Add Medical Conditions");

    const conditions = [
      {
        condition: "Hypertension",
        diagnosedDate: "2022-08-10",
        severity: "moderate",
        treatingPhysician: "Dr. Smith",
        isActive: true,
        notes: "Well controlled with medication",
      },
    ];

    const response = await fetch(`${API_BASE}/medical-profile/conditions`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ medicalConditions: conditions }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Medical conditions added successfully");
    console.log(`Total conditions: ${result.data.length}`);
  } catch (error) {
    console.log("❌ Add medical conditions failed:", error.message);
  }
}

async function testAddEmergencyContacts() {
  try {
    console.log("\n📞 Testing: Add Emergency Contacts");

    const contacts = [
      {
        name: "Jane Smith",
        relationship: "Spouse",
        phone: "+1234567890",
        email: "jane.smith@example.com",
        address: "123 Main St, City, State",
      },
      {
        name: "Bob Smith",
        relationship: "Brother",
        phone: "+1234567891",
        email: "bob.smith@example.com",
      },
    ];

    const response = await fetch(
      `${API_BASE}/medical-profile/emergency-contacts`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ emergencyContacts: contacts }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Emergency contacts added successfully");
    console.log(`Total contacts: ${result.data.length}`);
    console.log(`Primary contact: ${result.data[0].name}`);
  } catch (error) {
    console.log("❌ Add emergency contacts failed:", error.message);
  }
}

async function testUpdateEmergencyInstructions() {
  try {
    console.log("\n📝 Testing: Update Emergency Instructions");

    const instructions = {
      emergencyInstructions: {
        generalInstructions:
          "Patient has severe penicillin allergy. Notify medical staff immediately.",
        allergicReactionProtocol:
          "Administer epinephrine if available. Call 911 immediately.",
        medicationInstructions:
          "Currently taking Lisinopril for blood pressure.",
        doNotResuscitate: false,
        organDonor: true,
        religiousConsiderations: "None",
        languagePreference: "English",
      },
    };

    const response = await fetch(
      `${API_BASE}/medical-profile/emergency-instructions`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(instructions),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Emergency instructions updated successfully");
    console.log(`Organ donor: ${result.data.organDonor}`);
  } catch (error) {
    console.log("❌ Update emergency instructions failed:", error.message);
  }
}

// Run the tests
testMedicalProfile();
