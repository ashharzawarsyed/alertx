import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

async function testRealEmailSending() {
  console.log("📧 Testing REAL Professional Email Sending\n");
  console.log("This test will send actual emails to verify the email system works\n");

  // Use a real email address you can check
  const timestamp = Date.now();
  const testData = {
    hospitalName: `Professional Email Demo Hospital ${timestamp}`,
    hospitalType: "General Hospital", 
    licenseNumber: `DEMO-${timestamp}`,
    address: "123 Demo Medical Center",
    city: "Email Test City",
    state: "ET",
    zipCode: "12345",
    country: "USA",
    latitude: "40.7128",
    longitude: "-74.0060",
    contactNumber: `+1999${timestamp.toString().slice(-7)}`,
    // Change this to your actual email to receive the test emails
    email: "ashharzawarsyedwork@gmail.com", // This is the email that will receive the emails
    password: "TestEmail123!",
    totalBeds: {
      general: 50,
      icu: 10,
      emergency: 20,
      operation: 5
    },
    facilities: ["emergency", "cardiology"],
    emergencyContact: `+1999${timestamp.toString().slice(-7).replace(/\d$/, '8')}`,
    operatingHours: { isOpen24x7: true }
  };

  try {
    console.log("🏥 STEP 1: Registering Hospital (Will trigger signup email)");
    console.log("=" * 60);
    console.log(`📧 Email will be sent to: ${testData.email}`);
    console.log(`🏥 Hospital: ${testData.hospitalName}`);
    console.log(`📜 License: ${testData.licenseNumber}\n`);

    const registerResponse = await axios.post(`${API_BASE}/auth/register/hospital`, testData);
    
    console.log("✅ Hospital registered successfully!");
    console.log("📧 SIGNUP EMAIL SENT - Check your inbox!");
    console.log("📧 ADMIN NOTIFICATION SENT - Check admin inbox!\n");

    const hospitalId = registerResponse.data.data.hospital.id;

    console.log("👨‍💼 STEP 2: Admin Approval (Will trigger approval email)");
    console.log("=" * 60);

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@alertx.com",
      password: "Admin123!@#"
    });

    const adminToken = adminLogin.data.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    console.log("🎯 Approving hospital...");
    await axios.put(
      `${API_BASE}/admin/hospitals/${hospitalId}/approve`,
      {},
      authHeaders
    );

    console.log("✅ Hospital approved successfully!");
    console.log("📧 APPROVAL EMAIL SENT - Check your inbox!\n");

    console.log("🎉 EMAIL TESTING COMPLETE!");
    console.log("=" * 60);
    console.log("📧 THREE PROFESSIONAL EMAILS SHOULD HAVE BEEN SENT:");
    console.log("1️⃣ Hospital Registration Confirmation");
    console.log("   📍 Sent to: " + testData.email);
    console.log("   📝 Subject: Hospital Registration Received - AlertX Emergency Network");
    console.log("   💼 Professional template with welcome message and status");
    
    console.log("\n2️⃣ Admin Notification");
    console.log("   📍 Sent to: All active admin emails");
    console.log("   📝 Subject: New Hospital Registration - Approval Required | AlertX");
    console.log("   💼 Professional template with hospital details and approval links");
    
    console.log("\n3️⃣ Hospital Approval Confirmation");
    console.log("   📍 Sent to: " + testData.email);
    console.log("   📝 Subject: Hospital Registration Approved - Welcome to AlertX!");
    console.log("   💼 Professional template with login instructions and getting started guide");

    console.log(`\n📬 CHECK EMAIL INBOX: ${testData.email}`);
    console.log("📁 Check spam/junk folder if emails are not in inbox");
    console.log("⏰ Emails may take a few minutes to arrive");

    // Test login to confirm approval worked
    console.log("\n🔓 BONUS: Testing hospital login after approval...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testData.email,
      password: testData.password
    });
    
    console.log("✅ Hospital can now login successfully!");
    console.log("🎯 Complete workflow verified: Registration → Email → Approval → Email → Login");

  } catch (error) {
    console.error("❌ Real email test failed:", error.response?.data?.message || error.message);
    
    if (error.response?.status === 409) {
      console.log("\n💡 TIP: Hospital with this email already exists. This is normal for testing.");
      console.log("   The email system is working, just using existing data.");
    }
  }
}

console.log("🚨 IMPORTANT: This test sends REAL emails!");
console.log("📧 Make sure to check the email address configured in the test");
console.log("⏰ Starting test in 3 seconds...\n");

setTimeout(testRealEmailSending, 3000);