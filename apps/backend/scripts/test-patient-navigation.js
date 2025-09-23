const API_BASE_URL = "http://localhost:5001/api/v1";

async function createTestPatients() {
  try {
    // Login first
    const loginData = {
      email: "ashharzawarsyedwork@gmail.com",
      password: "Hospital123!@#",
    };

    console.log("🔐 Logging in...");
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

    console.log("✅ Login successful");
    console.log("🏥 Hospital ID:", hospitalId);

    // Create multiple test patients for navigation testing
    const testPatients = [
      {
        name: "John Emergency",
        age: 45,
        gender: "Male",
        condition: "Heart Attack",
        emergencyType: "critical",
        description: "Severe chest pain, shortness of breath",
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          address: "123 Emergency Ave, Critical District",
        },
        contactInfo: {
          phone: "+1-555-0001",
          emergencyContact: {
            name: "Jane Emergency",
            relationship: "Spouse",
            phone: "+1-555-0002",
          },
        },
        medicalHistory: ["Hypertension", "Diabetes"],
        vitals: {
          heartRate: 142,
          bloodPressure: "180/110",
          oxygenSaturation: 88,
          temperature: 99.2,
        },
        priority: "critical",
        estimatedArrival: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      },
      {
        name: "Sarah Trauma",
        age: 28,
        gender: "Female",
        condition: "Car Accident Injuries",
        emergencyType: "urgent",
        description: "Multiple lacerations, possible broken ribs",
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: "456 Accident Blvd, Trauma Zone",
        },
        contactInfo: {
          phone: "+1-555-0003",
          emergencyContact: {
            name: "Mike Trauma",
            relationship: "Brother",
            phone: "+1-555-0004",
          },
        },
        medicalHistory: ["No known conditions"],
        vitals: {
          heartRate: 95,
          bloodPressure: "110/70",
          oxygenSaturation: 96,
          temperature: 98.6,
        },
        priority: "urgent",
        estimatedArrival: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
      },
      {
        name: "Robert Stroke",
        age: 67,
        gender: "Male",
        condition: "Suspected Stroke",
        emergencyType: "critical",
        description: "Sudden weakness on left side, difficulty speaking",
        location: {
          latitude: 40.7282,
          longitude: -73.7949,
          address: "789 Stroke Street, Neurological District",
        },
        contactInfo: {
          phone: "+1-555-0005",
          emergencyContact: {
            name: "Mary Stroke",
            relationship: "Wife",
            phone: "+1-555-0006",
          },
        },
        medicalHistory: ["Atrial Fibrillation", "High Cholesterol"],
        vitals: {
          heartRate: 78,
          bloodPressure: "160/95",
          oxygenSaturation: 94,
          temperature: 98.1,
        },
        priority: "critical",
        estimatedArrival: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      {
        name: "Lisa Asthma",
        age: 34,
        gender: "Female",
        condition: "Severe Asthma Attack",
        emergencyType: "urgent",
        description: "Difficulty breathing, wheezing, chest tightness",
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: "321 Respiratory Road, Breathing Borough",
        },
        contactInfo: {
          phone: "+1-555-0007",
          emergencyContact: {
            name: "Tom Asthma",
            relationship: "Husband",
            phone: "+1-555-0008",
          },
        },
        medicalHistory: ["Chronic Asthma", "Allergies to peanuts"],
        vitals: {
          heartRate: 108,
          bloodPressure: "120/80",
          oxygenSaturation: 89,
          temperature: 98.4,
        },
        priority: "urgent",
        estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
      {
        name: "David Fall",
        age: 82,
        gender: "Male",
        condition: "Fall with Hip Injury",
        emergencyType: "moderate",
        description: "Elderly fall, possible hip fracture, conscious and alert",
        location: {
          latitude: 40.7411,
          longitude: -74.0012,
          address: "654 Senior Street, Elder Care District",
        },
        contactInfo: {
          phone: "+1-555-0009",
          emergencyContact: {
            name: "Susan Fall",
            relationship: "Daughter",
            phone: "+1-555-0010",
          },
        },
        medicalHistory: ["Osteoporosis", "Hypertension", "Diabetes"],
        vitals: {
          heartRate: 85,
          bloodPressure: "140/85",
          oxygenSaturation: 97,
          temperature: 98.0,
        },
        priority: "moderate",
        estimatedArrival: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      },
    ];

    console.log(
      `\\n📋 Creating ${testPatients.length} test patients for navigation testing...`
    );

    // Create emergencies for each test patient
    for (let i = 0; i < testPatients.length; i++) {
      const patient = testPatients[i];
      console.log(`\\n${i + 1}. Creating emergency for ${patient.name}...`);

      const emergencyData = {
        patientInfo: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          medicalHistory: patient.medicalHistory,
        },
        emergencyType: patient.emergencyType,
        description: patient.description,
        location: patient.location,
        contactInfo: patient.contactInfo,
        hospitalId: hospitalId,
        priority: patient.priority,
        vitals: patient.vitals,
        estimatedArrival: patient.estimatedArrival,
        condition: patient.condition,
      };

      const response = await fetch(`${API_BASE_URL}/emergencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emergencyData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Created emergency ID: ${result.data._id}`);
        console.log(`   🚨 Priority: ${patient.priority.toUpperCase()}`);
        console.log(
          `   ⏰ ETA: ${Math.round((new Date(patient.estimatedArrival) - new Date()) / (1000 * 60))} minutes`
        );
      } else {
        console.log(`   ❌ Failed to create emergency for ${patient.name}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("\\n🎯 **NAVIGATION TESTING READY!**");
    console.log("\\n📊 **Test Features:**");
    console.log("   • Full-width patient display");
    console.log("   • Carousel navigation with arrow buttons");
    console.log("   • Keyboard navigation (←/→ arrow keys)");
    console.log("   • Pagination dots with priority color coding");
    console.log("   • Patient counter (X of Y display)");
    console.log("   • Quick stats bar showing critical/arriving soon counts");
    console.log("   • Smooth slide animations between patients");
    console.log("\\n🌐 **Access Dashboard:**");
    console.log("   URL: http://localhost:5175/");
    console.log("   Login: ashharzawarsyedwork@gmail.com");
    console.log("   Password: Hospital123!@#");
    console.log("\\n🔧 **Testing Instructions:**");
    console.log("   1. Navigate between patients using arrow buttons");
    console.log("   2. Use keyboard arrow keys for navigation");
    console.log("   3. Click pagination dots to jump to specific patients");
    console.log(
      "   4. Observe priority color coding (red=critical, yellow=urgent, blue=moderate)"
    );
    console.log(
      "   5. Test with different screen sizes to verify responsive layout"
    );
    console.log("   6. Verify smooth animations and transitions");
    console.log("\\n📈 **Performance Testing:**");
    console.log("   • Navigation should be instant with no lag");
    console.log("   • Animations should be smooth at 60fps");
    console.log(
      "   • Keyboard navigation should work from any focused element"
    );
    console.log(
      "   • Priority colors should update correctly in pagination dots"
    );
  } catch (error) {
    console.error("❌ Error creating test patients:", error.message);
  }
}

// Run the test
createTestPatients();
