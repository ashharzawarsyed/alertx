// Test the debug endpoints
import fetch from "node-fetch";

async function testDebugEndpoints() {
  console.log("🔍 Testing debug endpoints...\n");

  // Test 1: Simple test endpoint (no AI)
  console.log("📋 Test 1: Simple endpoint without AI");
  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/debug/test-emergency-simple",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: ["test symptom"],
          description: "Test description",
        }),
      }
    );

    const data = await response.text();
    console.log("✅ Simple test response:", data);
  } catch (error) {
    console.log("❌ Simple test failed:", error.message);
  }

  // Test 2: AI integration test
  console.log("\n📋 Test 2: AI integration test");
  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/debug/test-ai-direct",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: ["severe chest pain"],
        }),
      }
    );

    const data = await response.text();
    console.log("✅ AI test response:", data);
  } catch (error) {
    console.log("❌ AI test failed:", error.message);
  }

  console.log("\n🔍 Debug tests completed!");
}

testDebugEndpoints().catch(console.error);
