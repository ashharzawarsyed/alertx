import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";

// Driver test data
const driverData = {
  name: "John Driver",
  email: "driver@alertx.com",
  phone: "+1987654321",
  password: "DriverPass123",
  role: "driver",
  driverInfo: {
    licenseNumber: "DL987654321",
    ambulanceNumber: "AMB001",
  },
};

async function testDriverAuth() {
  try {
    console.log("🚑 Testing Driver Authentication System...\n");

    // Test 1: Driver Registration
    console.log("1. Testing Driver Registration...");
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driverData),
    });

    const registerResult = await registerRes.json();
    console.log("Status:", registerRes.status);
    console.log("Success:", registerResult.success);

    if (registerResult.success) {
      console.log("✅ Driver registered successfully");
      console.log("Driver ID:", registerResult.data.user._id);
      console.log(
        "License Number:",
        registerResult.data.user.driverInfo?.licenseNumber
      );
      console.log(
        "Ambulance Number:",
        registerResult.data.user.driverInfo?.ambulanceNumber
      );
      console.log("Status:", registerResult.data.user.driverInfo?.status);

      const driverToken = registerResult.data.token;

      // Test 2: Driver Login
      console.log("\n2. Testing Driver Login...");
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: driverData.email,
          password: driverData.password,
        }),
      });

      const loginResult = await loginRes.json();
      console.log("Status:", loginRes.status);
      console.log("Success:", loginResult.success);

      if (loginResult.success) {
        console.log("✅ Driver login successful");
        console.log("Role:", loginResult.data.user.role);
        console.log("Driver Status:", loginResult.data.user.driverInfo?.status);

        const authToken = loginResult.data.token;

        // Test 3: Get Driver Profile
        console.log("\n3. Testing Driver Profile Retrieval...");
        const profileRes = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const profileResult = await profileRes.json();
        console.log("Status:", profileRes.status);
        console.log("Success:", profileResult.success);

        if (profileResult.success) {
          console.log("✅ Driver profile retrieved");
          console.log("Driver Info:", profileResult.data.user.driverInfo);

          // Test 4: Update Driver Profile
          console.log("\n4. Testing Driver Profile Update...");
          const updateRes = await fetch(`${API_BASE}/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              name: "John Updated Driver",
            }),
          });

          const updateResult = await updateRes.json();
          console.log("Status:", updateRes.status);
          console.log("Success:", updateResult.success);

          if (updateResult.success) {
            console.log("✅ Driver profile updated");
            console.log("Updated name:", updateResult.data.user.name);
          }
        }
      }
    } else {
      console.log("❌ Driver registration failed:", registerResult.message);
      if (registerResult.error) {
        console.log("Errors:", registerResult.error);
      }
    }

    console.log("\n✅ Driver authentication tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Test driver registration without required driverInfo
async function testDriverValidation() {
  console.log("\n🔍 Testing Driver Validation...\n");

  const invalidDriverData = {
    name: "Invalid Driver",
    email: "invalid@example.com",
    phone: "+1111111111",
    password: "InvalidPass123",
    role: "driver",
    // Missing driverInfo
  };

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidDriverData),
  });

  const result = await res.json();
  console.log("Invalid driver registration status:", res.status);
  console.log("Expected validation errors:", result.error || result.message);
}

// Run tests
testDriverAuth().then(() => {
  return testDriverValidation();
});
