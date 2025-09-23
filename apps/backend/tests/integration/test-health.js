// Simple health check test
async function testHealthCheck() {
  try {
    console.log("🔍 Testing health endpoint...");

    const response = await fetch("http://localhost:5000/health");
    console.log("Health check status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Server is responding:", data.message);
      return true;
    } else {
      console.log("❌ Health check failed");
      return false;
    }
  } catch (error) {
    console.log("❌ Connection error:", error.message);
    return false;
  }
}

testHealthCheck();
