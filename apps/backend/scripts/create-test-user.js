// Create test user for emergency system testing
import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";

async function createTestUser() {
  console.log("🔧 Creating test user for emergency system...");

  const testUser = {
    name: "Test Patient",
    email: "testpatient@example.com",
    password: "Password123",
    role: "patient",
    phone: "+1234567890",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "123 Test Street, New York, NY",
    },
  };

  try {
    // Register the test user
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    const registerResult = await registerResponse.json();

    if (registerResponse.ok) {
      console.log("✅ Test user created successfully");
      console.log("📧 Email:", testUser.email);
      console.log("🔑 Password:", testUser.password);

      // Now add medical profile information
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testUser.email,
          password: "Password123",
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.ok) {
        const token = loginResult.data.token;

        // Add some medical profile data
        const medicalProfile = {
          allergies: [
            {
              allergen: "Penicillin",
              severity: "severe",
              reaction: "Anaphylaxis",
              notes: "Avoid all penicillin-based antibiotics",
            },
          ],
          basicInfo: {
            age: 35,
            bloodType: "O+",
            height: "175 cm",
            weight: "70 kg",
          },
          conditions: {
            chronic: ["Hypertension", "Diabetes Type 2"],
          },
          emergencyContacts: [
            {
              name: "John Doe",
              relationship: "Spouse",
              phone: "+1987654321",
              isPrimary: true,
            },
          ],
        };

        // Update allergies
        await fetch(`${API_BASE}/medical-profile/allergies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(medicalProfile.allergies[0]),
        });

        // Update basic info
        await fetch(`${API_BASE}/medical-profile/basic-info`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(medicalProfile.basicInfo),
        });

        // Add emergency contact
        await fetch(`${API_BASE}/medical-profile/emergency-contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(medicalProfile.emergencyContacts[0]),
        });

        console.log("✅ Medical profile data added");
        console.log("🏥 Test user is ready for emergency testing");
      } else {
        console.log("⚠️ User created but login failed:", loginResult.message);
      }
    } else if (registerResponse.status === 409) {
      console.log("ℹ️ Test user already exists");
      console.log("📧 Email:", testUser.email);
      console.log("🔑 Password:", testUser.password);
    } else {
      console.log("❌ Failed to create user:", registerResult.message);
    }
  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
  }
}

createTestUser();
