import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";

// Test data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  phone: "+1234567890",
  password: "TestPass123",
  role: "patient",
  location: {
    lat: 40.7128,
    lng: -74.006,
  },
};

async function testAuthentication() {
  try {
    console.log("🧪 Testing Authentication System...\n");

    // Test 1: Registration
    console.log("1. Testing Registration...");
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerRes.json();
    console.log("Status:", registerRes.status);
    console.log("Response:", JSON.stringify(registerData, null, 2));

    if (registerData.success) {
      const token = registerData.data.token;

      // Test 2: Login
      console.log("\n2. Testing Login...");
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginRes.json();
      console.log("Status:", loginRes.status);
      console.log("Response:", JSON.stringify(loginData, null, 2));

      if (loginData.success) {
        const authToken = loginData.data.token;

        // Test 3: Get Profile
        console.log("\n3. Testing Get Profile...");
        const profileRes = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const profileData = await profileRes.json();
        console.log("Status:", profileRes.status);
        console.log("Response:", JSON.stringify(profileData, null, 2));
      }
    }

    console.log("\n✅ Authentication tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAuthentication();
