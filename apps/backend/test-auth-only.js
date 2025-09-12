// Test authentication endpoints specifically
const API_BASE = "http://localhost:5001/api/v1";

async function testAuth() {
  console.log("🔐 Testing Authentication System...\n");

  // Test 1: Register a new patient
  await testRegister();

  // Test 2: Login with the patient
  await testLogin();
}

async function testRegister() {
  try {
    console.log("👤 Testing Patient Registration...");

    const registrationData = {
      name: "John Medical Test New",
      email: "john.medical.new@test.com",
      password: "Password123!", // Fixed: uppercase, lowercase, number, special char
      phone: "+1234567891",
      role: "patient",
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
      medicalProfile: {
        bloodType: "O+",
        dateOfBirth: "1985-06-15",
      },
    };

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });

    console.log("Registration status:", response.status);
    const responseText = await response.text();
    console.log("Registration response:", responseText);

    if (response.ok) {
      console.log("✅ Patient registered successfully");
    } else {
      console.log("ℹ️  Registration response (may already exist)");
    }
  } catch (error) {
    console.log("❌ Registration error:", error.message);
  }
}

async function testLogin() {
  try {
    console.log("\n🔑 Testing Patient Login...");

    const loginData = {
      email: "john.medical.new@test.com",
      password: "Password123!",
    };

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    console.log("Login status:", response.status);
    const responseText = await response.text();
    console.log("Login response:", responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log("✅ Login successful");
      console.log("Token received:", result.data?.token ? "Yes" : "No");
      console.log("User role:", result.data?.user?.role);
      return result.data?.token;
    } else {
      console.log("❌ Login failed");
      return null;
    }
  } catch (error) {
    console.log("❌ Login error:", error.message);
    return null;
  }
}

// Run the test
testAuth();
