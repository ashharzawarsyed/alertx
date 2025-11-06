// Simple network connectivity test for debugging
const fetch = require("node-fetch");

async function testConnectivity() {
  const urls = [
    "http://localhost:5001/api/v1/",
    "http://127.0.0.1:5001/api/v1/",
    "http://10.0.2.2:5001/api/v1/",
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, { timeout: 5000 });
      const data = await response.json();
      console.log(`✅ Success: ${url} - ${response.status}`);
      console.log(`Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error.message}`);
    }
    console.log("---");
  }
}

testConnectivity().catch(console.error);
