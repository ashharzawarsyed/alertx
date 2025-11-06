#!/usr/bin/env node

/**
 * Test Backend Connection Script
 *
 * This script tests the connection from your device/emulator to the backend server.
 * Run this to diagnose network connectivity issues.
 */

const https = require("http");

const endpoints = [
  { name: "Localhost (iOS Simulator)", url: "http://localhost:5001/health" },
  { name: "Android Emulator", url: "http://10.0.2.2:5001/health" },
  { name: "Network IP (LAN)", url: "http://192.168.100.23:5001/health" }, // Your computer's local IP
];

console.log("\n🔍 Testing Backend Connections...\n");

async function testConnection(endpoint) {
  return new Promise((resolve) => {
    console.log(`Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);

    const startTime = Date.now();

    const req = https.get(endpoint.url, (res) => {
      const duration = Date.now() - startTime;
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`✅ SUCCESS - Response in ${duration}ms`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Data: ${data.substring(0, 100)}...`);
        console.log("");
        resolve({ success: true, endpoint: endpoint.name, duration });
      });
    });

    req.on("error", (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ FAILED - ${error.message}`);
      console.log(`   Time: ${duration}ms`);
      console.log("");
      resolve({
        success: false,
        endpoint: endpoint.name,
        error: error.message,
      });
    });

    req.setTimeout(5000, () => {
      console.log(`⏱️  TIMEOUT - No response after 5 seconds`);
      console.log("");
      req.destroy();
      resolve({ success: false, endpoint: endpoint.name, error: "Timeout" });
    });
  });
}

async function runTests() {
  const results = [];

  for (const endpoint of endpoints) {
    const result = await testConnection(endpoint);
    results.push(result);
  }

  console.log("\n📊 Test Summary:");
  console.log("═".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    console.log("\n✅ Successful Connections:");
    successful.forEach((r) => {
      console.log(`   • ${r.endpoint} (${r.duration}ms)`);
    });
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed Connections:");
    failed.forEach((r) => {
      console.log(`   • ${r.endpoint}: ${r.error}`);
    });
  }

  console.log("\n💡 Recommendations:");
  console.log("═".repeat(50));

  if (successful.length === 0) {
    console.log("❌ No connections successful!");
    console.log("");
    console.log("1. Make sure backend is running:");
    console.log("   cd apps/backend && npm start");
    console.log("");
    console.log("2. Check if port 5001 is open:");
    console.log("   netstat -ano | findstr :5001");
    console.log("");
    console.log("3. Disable firewall temporarily to test");
  } else {
    console.log("✅ Backend is reachable!");
    console.log("");
    console.log("Update your authService.ts API URL to use:");
    successful.forEach((r) => {
      const endpoint = endpoints.find((e) => e.name === r.endpoint);
      if (endpoint) {
        const baseUrl = endpoint.url.replace("/health", "");
        console.log(`   ${r.endpoint}: ${baseUrl}/api/v1`);
      }
    });
  }

  console.log("\n");
}

runTests().catch(console.error);
