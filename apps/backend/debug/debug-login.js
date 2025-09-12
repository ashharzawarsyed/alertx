// Quick test to debug login issue
const API_BASE = "http://localhost:5001/api/v1";

async function debugLogin() {
  try {
    console.log("🔍 Testing login endpoint...");

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "john.medical@test.com",
        password: "password123",
      }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Response body:", responseText);

    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log("Parsed JSON:", jsonData);
    } catch (e) {
      console.log("Response is not valid JSON");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

debugLogin();
