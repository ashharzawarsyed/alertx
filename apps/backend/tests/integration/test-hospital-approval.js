import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

// Test data
const timestamp = Date.now();
const hospitalData = {
  hospitalName: `City General Hospital Test ${timestamp}`,
  hospitalType: "General Hospital",
  licenseNumber: `CGH-2025-${timestamp}`,
  address: "123 Medical Center Drive",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  country: "USA",
  latitude: "40.7128",
  longitude: "-74.0060",
  contactNumber: `+1234567${timestamp.toString().slice(-3)}`,
  email: `admin${timestamp}@citygeneraltest.com`,
  password: "SecurePass123!",
  totalBeds: {
    general: 50,
    icu: 10,
    emergency: 15,
    operation: 5
  },
  facilities: ["emergency", "cardiology", "trauma_center"],
  emergencyContact: "+1234567891",
  operatingHours: { isOpen24x7: true }
};

const adminCredentials = {
  email: "admin@alertx.com",
  password: "Admin123!@#"
};

async function testHospitalApprovalWorkflow() {
  console.log("🏥 Testing Hospital Approval Workflow\n");

  try {
    // Step 1: Register a new hospital
    console.log("1️⃣ Registering hospital...");
    const registerResponse = await axios.post(`${API_BASE}/auth/register/hospital`, hospitalData);
    console.log("✅ Hospital registered successfully");
    console.log(`   Hospital ID: ${registerResponse.data.data.hospital.id}`);
    console.log(`   Status: ${registerResponse.data.data.hospital.status}\n`);

    const hospitalId = registerResponse.data.data.hospital.id;

    // Step 2: Try to login as hospital (should fail - pending approval)
    console.log("2️⃣ Attempting hospital login (should fail)...");
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: hospitalData.email,
        password: hospitalData.password
      });
      console.log("❌ Unexpected: Hospital login succeeded");
    } catch (error) {
      console.log("✅ Expected: Hospital login failed");
      console.log(`   Message: ${error.response.data.message}\n`);
    }

    // Step 3: Login as admin
    console.log("3️⃣ Logging in as admin...");
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    const adminToken = adminLoginResponse.data.data.token;
    console.log("✅ Admin logged in successfully\n");

    const authHeaders = {
      headers: { Authorization: `Bearer ${adminToken}` }
    };

    // Step 4: Check pending hospitals
    console.log("4️⃣ Checking pending hospitals...");
    const pendingResponse = await axios.get(`${API_BASE}/admin/hospitals/pending`, authHeaders);
    console.log(`✅ Found ${pendingResponse.data.data.count} pending hospital(s)`);
    
    const pendingHospital = pendingResponse.data.data.hospitals.find(
      h => h.hospital._id === hospitalId
    );
    
    if (pendingHospital) {
      console.log(`   Hospital "${pendingHospital.hospital.name}" is pending approval\n`);
    } else {
      console.log("❌ Test hospital not found in pending list\n");
      return;
    }

    // Step 5: Approve the hospital
    console.log("5️⃣ Approving hospital...");
    const approveResponse = await axios.put(
      `${API_BASE}/admin/hospitals/${hospitalId}/approve`,
      {},
      authHeaders
    );
    console.log("✅ Hospital approved successfully");
    console.log(`   Approved by: ${approveResponse.data.data.hospital.approvedBy}`);
    console.log(`   Approval date: ${approveResponse.data.data.hospital.approvedAt}\n`);

    // Step 6: Try to login as hospital (should succeed now)
    console.log("6️⃣ Attempting hospital login (should succeed)...");
    const hospitalLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: hospitalData.email,
      password: hospitalData.password
    });
    console.log("✅ Hospital login successful after approval");
    console.log(`   Hospital token received: ${hospitalLoginResponse.data.data.token.substring(0, 20)}...\n`);

    // Step 7: Check hospital stats
    console.log("7️⃣ Checking hospital statistics...");
    const statsResponse = await axios.get(`${API_BASE}/admin/hospitals/stats`, authHeaders);
    console.log("✅ Hospital statistics:");
    console.log(`   Total: ${statsResponse.data.data.stats.total}`);
    console.log(`   Approved: ${statsResponse.data.data.stats.approved}`);
    console.log(`   Pending: ${statsResponse.data.data.stats.pending}`);
    console.log(`   Rejected: ${statsResponse.data.data.stats.rejected}\n`);

    console.log("🎉 Hospital Approval Workflow Test Completed Successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error("Response data:", error.response.data);
    }
  }
}

// Test rejection workflow
async function testHospitalRejectionWorkflow() {
  console.log("\n🚫 Testing Hospital Rejection Workflow\n");

  const rejectionHospitalData = {
    ...hospitalData,
    hospitalName: `Test Rejection Hospital ${timestamp}`,
    email: `rejection${timestamp}@testhosp.com`,
    licenseNumber: `REJECT-${timestamp}`,
    contactNumber: `+1234568${timestamp.toString().slice(-3)}`
  };

  try {
    // Register another hospital
    console.log("1️⃣ Registering hospital for rejection test...");
    const registerResponse = await axios.post(`${API_BASE}/auth/register/hospital`, rejectionHospitalData);
    const hospitalId = registerResponse.data.data.hospital.id;
    console.log("✅ Hospital registered for rejection test\n");

    // Login as admin
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    const adminToken = adminLoginResponse.data.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // Reject the hospital
    console.log("2️⃣ Rejecting hospital...");
    const rejectResponse = await axios.put(
      `${API_BASE}/admin/hospitals/${hospitalId}/reject`,
      { reason: "Invalid license documentation provided for testing purposes" },
      authHeaders
    );
    console.log("✅ Hospital rejected successfully");
    console.log(`   Rejection reason: ${rejectResponse.data.data.hospital.rejectionReason}\n`);

    // Try to login as rejected hospital
    console.log("3️⃣ Attempting rejected hospital login...");
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: rejectionHospitalData.email,
        password: rejectionHospitalData.password
      });
      console.log("❌ Unexpected: Rejected hospital login succeeded");
    } catch (error) {
      console.log("✅ Expected: Rejected hospital login failed");
      console.log(`   Message: ${error.response.data.message}\n`);
    }

    console.log("🎉 Hospital Rejection Workflow Test Completed Successfully!");

  } catch (error) {
    console.error("❌ Rejection test failed:", error.response?.data?.message || error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testHospitalApprovalWorkflow();
  await testHospitalRejectionWorkflow();
}

runAllTests();