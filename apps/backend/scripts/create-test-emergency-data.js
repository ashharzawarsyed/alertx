// Simple test data creator using API endpoints
const API_BASE_URL = "http://localhost:5001/api/v1";

// Test hospital credentials
const loginData = {
  email: "ashharzawarsyedwork@gmail.com",
  password: "Hospital123!@#",
};

async function createTestData() {
  try {
    console.log("🔐 Logging in to get authentication token...");

    // Login to get token
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!loginResponse.ok) {
      throw new Error("Failed to login");
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.data.token;
    const hospitalId =
      loginResult.data.user.hospitalInfo?.hospitalId ||
      loginResult.data.user._id;

    console.log(`✅ Logged in successfully. Hospital ID: ${hospitalId}`);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Create test ambulances
    console.log("\n🚑 Creating test ambulances...");

    const ambulances = [
      {
        vehicleNumber: "AMB-001",
        type: "Advanced Life Support",
        status: "available",
        currentLocation: {
          address: "Main Street Hospital",
          coordinates: [73.8567, 18.5204],
        },
        crew: [
          { name: "Dr. Smith", role: "Paramedic", certification: "EMT-P" },
          { name: "Nurse Johnson", role: "Nurse", certification: "RN" },
        ],
        equipment: [
          { name: "Defibrillator", status: "operational" },
          { name: "Oxygen Tank", status: "operational" },
          { name: "Stretcher", status: "operational" },
        ],
        fuelLevel: 85,
      },
      {
        vehicleNumber: "AMB-002",
        type: "Basic Life Support",
        status: "dispatched",
        currentLocation: {
          address: "Highway 101, Mile 15",
          coordinates: [73.8567, 18.5304],
        },
        crew: [
          { name: "EMT Davis", role: "EMT", certification: "EMT-B" },
          { name: "EMT Wilson", role: "EMT", certification: "EMT-B" },
        ],
        equipment: [
          { name: "First Aid Kit", status: "operational" },
          { name: "Oxygen Tank", status: "operational" },
        ],
        fuelLevel: 92,
      },
      {
        vehicleNumber: "AMB-003",
        type: "Advanced Life Support",
        status: "en-route",
        currentLocation: {
          address: "Downtown Emergency Site",
          coordinates: [73.8467, 18.5404],
        },
        crew: [
          { name: "Dr. Brown", role: "Paramedic", certification: "EMT-P" },
          { name: "EMT Garcia", role: "EMT", certification: "EMT-I" },
        ],
        equipment: [
          { name: "Cardiac Monitor", status: "operational" },
          { name: "Ventilator", status: "operational" },
          { name: "IV Equipment", status: "operational" },
        ],
        fuelLevel: 78,
      },
    ];

    // Create ambulances
    const createdAmbulances = [];
    for (const ambulance of ambulances) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/ambulances/hospital/${hospitalId}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(ambulance),
          }
        );

        if (response.ok) {
          const result = await response.json();
          createdAmbulances.push(result.data);
          console.log(`✅ Created ambulance: ${ambulance.vehicleNumber}`);
        } else {
          console.error(
            `❌ Failed to create ambulance ${ambulance.vehicleNumber}:`,
            await response.text()
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating ambulance ${ambulance.vehicleNumber}:`,
          error.message
        );
      }
    }

    // Create test patients
    console.log("\n🏥 Creating test patients...");

    const patients = [
      {
        name: "John Doe",
        age: 45,
        gender: "Male",
        emergencyType: "Critical",
        condition: "Cardiac Arrest",
        description: "Patient found unconscious, CPR in progress",
        status: "incoming",
        location: {
          address: "123 Emergency Lane, City Center",
          coordinates: [73.8567, 18.5204],
        },
        contactInfo: {
          phone: "+1-555-0123",
          emergencyContact: {
            name: "Jane Doe",
            relationship: "Wife",
            phone: "+1-555-0124",
          },
        },
        vitals: {
          heartRate: 0,
          bloodPressure: "N/A",
          oxygenSaturation: 85,
          temperature: 98.2,
          respiratoryRate: 0,
        },
        medicalHistory: ["Hypertension", "Previous MI"],
        estimatedArrival: new Date(Date.now() + 8 * 60000).toISOString(),
      },
      {
        name: "Sarah Johnson",
        age: 28,
        gender: "Female",
        emergencyType: "High",
        condition: "Severe Trauma",
        description: "Motor vehicle accident, multiple injuries",
        status: "en-route",
        location: {
          address: "Highway 95, Mile Marker 23",
          coordinates: [73.8467, 18.5304],
        },
        contactInfo: {
          phone: "+1-555-0234",
          emergencyContact: {
            name: "Mike Johnson",
            relationship: "Husband",
            phone: "+1-555-0235",
          },
        },
        vitals: {
          heartRate: 120,
          bloodPressure: "90/60",
          oxygenSaturation: 94,
          temperature: 98.8,
          respiratoryRate: 22,
        },
        medicalHistory: ["No known allergies"],
        estimatedArrival: new Date(Date.now() + 15 * 60000).toISOString(),
      },
      {
        name: "Robert Martinez",
        age: 62,
        gender: "Male",
        emergencyType: "Medium",
        condition: "Chest Pain",
        description: "Patient experiencing severe chest pain, possible MI",
        status: "incoming",
        location: {
          address: "456 Oak Street, Residential Area",
          coordinates: [73.8667, 18.5104],
        },
        contactInfo: {
          phone: "+1-555-0345",
          emergencyContact: {
            name: "Maria Martinez",
            relationship: "Wife",
            phone: "+1-555-0346",
          },
        },
        vitals: {
          heartRate: 105,
          bloodPressure: "140/95",
          oxygenSaturation: 97,
          temperature: 98.6,
          respiratoryRate: 18,
        },
        medicalHistory: ["Diabetes Type 2", "High Cholesterol"],
        estimatedArrival: new Date(Date.now() + 12 * 60000).toISOString(),
      },
      {
        name: "Emily Chen",
        age: 34,
        gender: "Female",
        emergencyType: "Critical",
        condition: "Severe Allergic Reaction",
        description: "Anaphylactic shock, administered EpiPen",
        status: "en-route",
        location: {
          address: "Restaurant District, Main Plaza",
          coordinates: [73.8367, 18.5404],
        },
        contactInfo: {
          phone: "+1-555-0456",
          emergencyContact: {
            name: "David Chen",
            relationship: "Brother",
            phone: "+1-555-0457",
          },
        },
        vitals: {
          heartRate: 130,
          bloodPressure: "80/50",
          oxygenSaturation: 91,
          temperature: 99.1,
          respiratoryRate: 26,
        },
        medicalHistory: ["Severe peanut allergy", "Asthma"],
        estimatedArrival: new Date(Date.now() + 6 * 60000).toISOString(),
      },
    ];

    // Create patients
    const createdPatients = [];
    for (const patient of patients) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/patients/hospital/${hospitalId}/incoming`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(patient),
          }
        );

        if (response.ok) {
          const result = await response.json();
          createdPatients.push(result.data);
          console.log(
            `✅ Created patient: ${patient.name} (${patient.emergencyType} priority)`
          );
        } else {
          console.error(
            `❌ Failed to create patient ${patient.name}:`,
            await response.text()
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating patient ${patient.name}:`,
          error.message
        );
      }
    }

    console.log(`\n🎉 Test data creation completed!`);
    console.log(`📊 Summary:`);
    console.log(`  - Ambulances created: ${createdAmbulances.length}`);
    console.log(`  - Patients created: ${createdPatients.length}`);
    console.log(
      `\n🚀 You can now refresh your hospital dashboard to see the real data!`
    );
  } catch (error) {
    console.error("❌ Error creating test data:", error);
  }
}

// Run the script
createTestData();
