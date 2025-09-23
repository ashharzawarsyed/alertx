import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

// Create unique test data
const timestamp = Date.now();
const testHospital = {
  hospitalName: `Email Test Hospital ${timestamp}`,
  hospitalType: "General Hospital",
  licenseNumber: `EMAIL-TEST-${timestamp}`,
  address: "123 Email Test Drive",
  city: "Test City",
  state: "TC",
  zipCode: "12345",
  country: "USA",
  latitude: "40.7128",
  longitude: "-74.0060",
  contactNumber: `+1555${timestamp.toString().slice(-7)}`,
  email: `emailtest${timestamp}@example.com`,
  password: "TestPass123!",
  totalBeds: {
    general: 20,
    icu: 5,
    emergency: 8,
    operation: 2
  },
  facilities: ["emergency", "cardiology"],
  emergencyContact: `+1555${timestamp.toString().slice(-7).replace(/\d$/, '9')}`,
  operatingHours: { isOpen24x7: true }
};

async function testEmailFunctionality() {
  console.log("📧 Testing Email Functionality\n");

  try {
    // Register hospital to trigger emails
    console.log("1️⃣ Registering hospital to test emails...");
    const registerResponse = await axios.post(`${API_BASE}/auth/register/hospital`, testHospital);
    
    console.log("✅ Hospital registered successfully");
    console.log(`   Check console logs for email notifications`);
    console.log(`   Hospital email: ${testHospital.email}`);
    console.log(`   Check spam folder if needed\n`);

    // Login as admin to approve and test approval email
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@alertx.com",
      password: "Admin123!@#"
    });

    const adminToken = adminLogin.data.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };
    
    console.log("2️⃣ Approving hospital to test approval email...");
    await axios.put(
      `${API_BASE}/admin/hospitals/${registerResponse.data.data.hospital.id}/approve`,
      {},
      authHeaders
    );
    
    console.log("✅ Hospital approved - check for approval email");
    console.log("📧 Email tests completed! Check server logs and email inbox.");

  } catch (error) {
    console.error("❌ Email test failed:", error.response?.data?.message || error.message);
  }
}

testEmailFunctionality();