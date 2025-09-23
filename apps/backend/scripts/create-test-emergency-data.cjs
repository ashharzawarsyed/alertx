const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Ambulance = require("../models/Ambulance");
const User = require("../models/User");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/alertx", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log("Creating test data...");

    // First, let's find a hospital user to get the hospital ID
    const hospitalUser = await User.findOne({ role: "hospital" });
    if (!hospitalUser) {
      console.error(
        "No hospital user found. Please create a hospital user first."
      );
      return;
    }

    const hospitalId = hospitalUser._id;
    console.log("Using hospital ID:", hospitalId);

    // Create test ambulances
    const ambulances = [
      {
        vehicleNumber: "AMB-001",
        type: "ALS",
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
        hospitalId: hospitalId,
      },
      {
        vehicleNumber: "AMB-002",
        type: "BLS",
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
        hospitalId: hospitalId,
      },
      {
        vehicleNumber: "AMB-003",
        type: "ALS",
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
        hospitalId: hospitalId,
      },
    ];

    // Create test patients
    const patients = [
      {
        name: "John Doe",
        age: 45,
        gender: "male",
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
        estimatedArrival: new Date(Date.now() + 8 * 60000), // 8 minutes from now
        hospitalId: hospitalId,
      },
      {
        name: "Sarah Johnson",
        age: 28,
        gender: "female",
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
        estimatedArrival: new Date(Date.now() + 15 * 60000), // 15 minutes from now
        hospitalId: hospitalId,
      },
      {
        name: "Robert Martinez",
        age: 62,
        gender: "male",
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
        estimatedArrival: new Date(Date.now() + 12 * 60000), // 12 minutes from now
        hospitalId: hospitalId,
      },
      {
        name: "Emily Chen",
        age: 34,
        gender: "female",
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
        estimatedArrival: new Date(Date.now() + 6 * 60000), // 6 minutes from now
        hospitalId: hospitalId,
      },
    ];

    // Clear existing test data
    await Patient.deleteMany({ hospitalId: hospitalId });
    await Ambulance.deleteMany({ hospitalId: hospitalId });

    // Insert new test data
    const createdAmbulances = await Ambulance.insertMany(ambulances);
    const createdPatients = await Patient.insertMany(patients);

    // Assign ambulances to some patients
    const assignments = [
      { patientIndex: 0, ambulanceIndex: 1 }, // John Doe -> AMB-002
      { patientIndex: 1, ambulanceIndex: 2 }, // Sarah Johnson -> AMB-003
      { patientIndex: 3, ambulanceIndex: 0 }, // Emily Chen -> AMB-001
    ];

    for (const assignment of assignments) {
      const patient = createdPatients[assignment.patientIndex];
      const ambulance = createdAmbulances[assignment.ambulanceIndex];

      patient.ambulanceId = ambulance._id;
      ambulance.currentPatientId = patient._id;

      await patient.save();
      await ambulance.save();
    }

    console.log(`✅ Created ${createdAmbulances.length} ambulances`);
    console.log(`✅ Created ${createdPatients.length} patients`);
    console.log(`✅ Assigned ${assignments.length} patients to ambulances`);

    console.log("\n📊 Test Data Summary:");
    console.log("Ambulances:");
    createdAmbulances.forEach((amb) => {
      console.log(
        `  - ${amb.vehicleNumber} (${amb.type}) - Status: ${amb.status}`
      );
    });

    console.log("\nPatients:");
    createdPatients.forEach((pat) => {
      console.log(
        `  - ${pat.name} (${pat.age}y) - ${pat.emergencyType} Priority - ${pat.condition}`
      );
    });
  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createTestData();
