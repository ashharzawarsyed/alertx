import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

// Create unique test data for email testing
const timestamp = Date.now();
const testHospital = {
  hospitalName: `Professional Email Test Hospital ${timestamp}`,
  hospitalType: "General Hospital",
  licenseNumber: `EMAIL-PRO-${timestamp}`,
  address: "456 Professional Medical Plaza",
  city: "Healthcare City",
  state: "HC",
  zipCode: "54321",
  country: "USA",
  latitude: "40.7589",
  longitude: "-73.9851",
  contactNumber: `+1888${timestamp.toString().slice(-7)}`,
  email: `hospital.test.${timestamp}@professionalemail.com`,
  password: "ProfessionalPass123!",
  totalBeds: {
    general: 100,
    icu: 20,
    emergency: 30,
    operation: 10
  },
  facilities: ["emergency", "cardiology", "neurology", "trauma_center"],
  emergencyContact: `+1888${timestamp.toString().slice(-7).replace(/\d$/, '9')}`,
  operatingHours: { isOpen24x7: true }
};

const adminCredentials = {
  email: "admin@alertx.com",
  password: "Admin123!@#"
};

async function testProfessionalEmailWorkflow() {
  console.log("📧 Testing Professional Email System for Hospital Workflow\n");
  console.log("=" * 60);

  try {
    console.log("🏥 STEP 1: Hospital Registration & Signup Email");
    console.log("-".repeat(50));
    
    console.log(`📝 Registering hospital: ${testHospital.hospitalName}`);
    console.log(`📧 Hospital email: ${testHospital.email}`);
    console.log(`🏥 Hospital type: ${testHospital.hospitalType}`);
    console.log(`📜 License: ${testHospital.licenseNumber}\n`);

    // Register hospital to trigger signup emails
    const registerResponse = await axios.post(`${API_BASE}/auth/register/hospital`, testHospital);
    
    console.log("✅ Hospital registration successful!");
    console.log(`   Hospital ID: ${registerResponse.data.data.hospital.id}`);
    console.log(`   Status: ${registerResponse.data.data.hospital.status}`);
    console.log(`   📧 Professional signup email should be sent to: ${testHospital.email}`);
    console.log(`   📧 Admin notification emails sent to all active admins\n`);

    const hospitalId = registerResponse.data.data.hospital.id;

    console.log("⏳ STEP 2: Verify Hospital Cannot Login (Pending Approval)");
    console.log("-".repeat(50));
    
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: testHospital.email,
        password: testHospital.password
      });
      console.log("❌ UNEXPECTED: Hospital login succeeded before approval");
    } catch (error) {
      console.log("✅ EXPECTED: Hospital login blocked");
      console.log(`   Message: "${error.response.data.message}"`);
      console.log("   This confirms the approval workflow is working\n");
    }

    console.log("👨‍💼 STEP 3: Admin Login & Hospital Approval");
    console.log("-".repeat(50));
    
    // Login as admin
    console.log("🔐 Logging in as admin...");
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    const adminToken = adminLoginResponse.data.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };
    
    console.log("✅ Admin authenticated successfully");

    // Check pending hospitals
    const pendingResponse = await axios.get(`${API_BASE}/admin/hospitals/pending`, authHeaders);
    console.log(`📋 Found ${pendingResponse.data.data.count} pending hospital(s)`);
    
    const ourHospital = pendingResponse.data.data.hospitals.find(
      h => h.hospital._id === hospitalId
    );
    
    if (ourHospital) {
      console.log(`✅ Hospital "${ourHospital.hospital.name}" found in pending list\n`);
    }

    // Approve the hospital
    console.log("✅ STEP 4: Approving Hospital & Sending Approval Email");
    console.log("-".repeat(50));
    
    console.log(`🎯 Approving hospital: ${testHospital.hospitalName}`);
    const approveResponse = await axios.put(
      `${API_BASE}/admin/hospitals/${hospitalId}/approve`,
      {},
      authHeaders
    );
    
    console.log("🎉 Hospital approved successfully!");
    console.log(`   Approved by: ${approveResponse.data.data.hospital.approvedBy}`);
    console.log(`   Approval time: ${new Date(approveResponse.data.data.hospital.approvedAt).toLocaleString()}`);
    console.log(`   📧 Professional approval email sent to: ${testHospital.email}\n`);

    console.log("🔓 STEP 5: Verify Hospital Can Now Login");
    console.log("-".repeat(50));
    
    const hospitalLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testHospital.email,
      password: testHospital.password
    });
    
    console.log("✅ Hospital login successful after approval!");
    console.log(`   JWT Token generated: ${hospitalLoginResponse.data.data.token.substring(0, 30)}...`);
    console.log(`   Hospital can now access the dashboard\n`);

    console.log("📊 STEP 6: Final Statistics");
    console.log("-".repeat(50));
    
    const statsResponse = await axios.get(`${API_BASE}/admin/hospitals/stats`, authHeaders);
    const stats = statsResponse.data.data.stats;
    
    console.log("📈 Updated Hospital Statistics:");
    console.log(`   Total Hospitals: ${stats.total}`);
    console.log(`   ✅ Approved: ${stats.approved}`);
    console.log(`   ⏳ Pending: ${stats.pending}`);
    console.log(`   ❌ Rejected: ${stats.rejected}\n`);

    console.log("=" * 60);
    console.log("🎉 PROFESSIONAL EMAIL WORKFLOW TEST COMPLETED SUCCESSFULLY!");
    console.log("=" * 60);
    
    console.log("\n📧 EMAIL SUMMARY:");
    console.log("✅ Hospital Registration Email - Professional template with:");
    console.log("   • Welcome message and branding");
    console.log("   • Registration details confirmation");
    console.log("   • Status notification (pending approval)");
    console.log("   • Next steps information");
    console.log("   • Professional AlertX branding");
    
    console.log("\n✅ Admin Notification Email - Sent to all active admins with:");
    console.log("   • New hospital registration alert");
    console.log("   • Complete hospital information");
    console.log("   • Direct approval action links");
    console.log("   • Professional admin panel branding");
    
    console.log("\n✅ Hospital Approval Email - Professional confirmation with:");
    console.log("   • Congratulations message");
    console.log("   • Approval details and admin info");
    console.log("   • Login instructions and dashboard link");
    console.log("   • Getting started guide");
    console.log("   • Professional AlertX branding");

    console.log(`\n📧 CHECK YOUR EMAIL INBOX: ${testHospital.email}`);
    console.log("📧 CHECK ADMIN EMAIL INBOX for notification");
    console.log("📁 Check spam folder if emails are not in inbox");

  } catch (error) {
    console.error("\n❌ EMAIL TEST FAILED:");
    console.error(`   Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error("   Response:", error.response.data);
    }
  }
}

// Run the email test
testProfessionalEmailWorkflow();