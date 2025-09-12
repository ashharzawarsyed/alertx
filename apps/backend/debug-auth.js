// Debug authentication issues
import fetch from "node-fetch";

async function debugAuth() {
  console.log("🔍 Debugging authentication...\n");

  const credentials = {
    email: "testpatient3@example.com",
    password: "Password123",
  };

  // First, try to register the user
  console.log("📝 Testing registration first...");
  try {
    const registerResponse = await fetch(
      "http://localhost:5000/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Patient 3",
          email: "testpatient3@example.com",
          password: "Password123",
          role: "patient",
          phone: "+1234567892",
          location: {
            lat: 40.7128,
            lng: -74.006,
            address: "123 Test Street, New York, NY",
          },
        }),
      }
    );

    const registerData = await registerResponse.json();
    console.log("� Registration status:", registerResponse.status);

    if (registerResponse.ok) {
      console.log("✅ Registration successful");
      console.log(
        "🔑 Token received from registration:",
        registerData.data?.token?.substring(0, 30) + "..."
      );
    } else {
      console.log(
        "⚠️ Registration failed or user exists:",
        registerData.message
      );
    }
  } catch (error) {
    console.error("🚨 Registration error:", error.message);
  }

  // Now try to login with the same credentials
  console.log("\n� Testing login with credentials:", credentials);
  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    console.log("🌐 Response status:", response.status);
    console.log("🔧 Response headers:", Object.fromEntries(response.headers));

    const data = await response.json();
    console.log("📄 Response body:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Authentication successful!");
      console.log("🔑 Token:", data.data?.token?.substring(0, 20) + "...");
    } else {
      console.log("❌ Authentication failed");
      console.log("� Error message:", data.message);
      console.log("� Validation errors:", data.errors);
    }
  } catch (error) {
    console.error("🚨 Network error:", error.message);
  }
}

debugAuth().catch(console.error);
