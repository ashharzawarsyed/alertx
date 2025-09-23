import { 
  sendHospitalRegistrationConfirmation, 
  sendHospitalApprovalRequest,
  sendHospitalApprovalConfirmation 
} from './services/emailService.js';

async function testEmailTemplates() {
  console.log("📧 Testing Professional Email Templates\n");

  // Test data
  const hospitalData = {
    name: "Test Medical Center",
    email: "test@example.com",
    hospitalType: "General Hospital"
  };

  const adminData = {
    name: "System Administrator",
    email: "admin@alertx.com"
  };

  const fullHospitalData = {
    hospitalName: "Test Medical Center",
    email: "test@example.com", 
    hospitalType: "General Hospital",
    licenseNumber: "TMC-2025-001",
    address: "123 Medical Plaza, Health City, HC 12345, USA",
    contactNumber: "+1-555-0123",
    registrationDate: new Date(),
    hospitalId: "test123"
  };

  try {
    console.log("1️⃣ Testing Hospital Registration Confirmation Email...");
    await sendHospitalRegistrationConfirmation(hospitalData);
    console.log("✅ Hospital registration email template test completed\n");

    console.log("2️⃣ Testing Admin Notification Email...");
    await sendHospitalApprovalRequest(fullHospitalData);
    console.log("✅ Admin notification email template test completed\n");

    console.log("3️⃣ Testing Hospital Approval Confirmation Email...");
    await sendHospitalApprovalConfirmation(hospitalData, adminData);
    console.log("✅ Hospital approval email template test completed\n");

    console.log("🎉 All email templates tested successfully!");
    console.log("📧 Check the configured email address for test emails");
    console.log(`📮 Email configured to send from: ${process.env.EMAIL_FROM || 'noreply@alertx.com'}`);
    console.log(`📬 SMTP Host: ${process.env.EMAIL_HOST || 'Not configured'}`);
    console.log(`📫 SMTP User: ${process.env.EMAIL_USER || 'Not configured'}`);

  } catch (error) {
    console.error("❌ Email template test failed:", error.message);
    
    // Check email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("\n⚠️  Email configuration missing in .env file:");
      console.error("   EMAIL_HOST, EMAIL_USER, EMAIL_PASS are required");
    }
  }
}

testEmailTemplates();