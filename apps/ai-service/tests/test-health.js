// Simple AI service health test
async function testAIHealth() {
  try {
    console.log("🔍 Testing AI service health...");

    const response = await fetch("http://localhost:8000/health");
    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ AI service is healthy:", data.service);
      return true;
    } else {
      console.log("❌ AI service not responding properly");
      return false;
    }
  } catch (error) {
    console.log("❌ Connection error:", error.message);
    return false;
  }
}

testAIHealth();
