import mongoose from "mongoose";
import "dotenv/config";
import Hospital from "./models/Hospital.js";
import User from "./models/User.js";

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function testHospitalRegistration() {
  try {
    console.log("Testing hospital registration...");

    // Test data
    const testData = {
      hospitalName: "Test City Hospital",
      hospitalType: "General Hospital",
      licenseNumber: "HL-2024-TEST-001",
      address: "123 Test Street",
      city: "Test City",
      state: "California",
      zipCode: "90210",
      country: "USA",
      contactNumber: "+15551234567",
      email: "admin@testcityhospital.com",
      totalBeds: {
        general: 50,
        icu: 10,
        emergency: 8,
        operation: 5,
      },
      emergencyContact: "+15551234568",
      password: "TestPass123!@#",
    };

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({
      $or: [{ email: testData.email }, { name: testData.hospitalName }],
    });

    if (existingHospital) {
      console.log("Hospital already exists, deleting for fresh test...");
      await Hospital.deleteOne({ email: testData.email });
      await User.deleteOne({ email: testData.email });
    }

    // Also check for existing user by phone
    const existingUser = await User.findOne({ phone: testData.contactNumber });
    if (existingUser) {
      console.log("User with phone already exists, deleting...");
      await User.deleteOne({ phone: testData.contactNumber });
    }

    // Create hospital
    const hospitalData = {
      name: testData.hospitalName,
      type: testData.hospitalType,
      licenseNumber: testData.licenseNumber,
      address: `${testData.address}, ${testData.city}, ${testData.state} ${testData.zipCode}, ${testData.country}`,
      contactNumber: testData.contactNumber,
      email: testData.email,
      totalBeds: testData.totalBeds,
      availableBeds: testData.totalBeds,
      facilities: [],
      emergencyContact: testData.emergencyContact,
      operatingHours: { isOpen24x7: true },
      isActive: false,
      isVerified: false,
    };

    console.log("Creating hospital...");
    const hospital = await Hospital.create(hospitalData);
    console.log("✅ Hospital created:", hospital.name);

    // Create hospital user account
    const userData = {
      name: testData.hospitalName, // Use hospital name as user name
      email: testData.email,
      phone: testData.contactNumber,
      password: testData.password,
      role: "hospital",
      hospitalInfo: {
        hospitalId: hospital._id,
      },
    };

    console.log("Creating hospital user...");
    const user = await User.create(userData);
    console.log("✅ Hospital user created:", user.name);

    console.log("\n🎉 Hospital registration test completed successfully!");
    console.log("Hospital ID:", hospital._id);
    console.log("Hospital User ID:", user._id);

    // Test login credentials
    console.log("\nTesting login...");
    const loginUser = await User.findOne({ email: testData.email });
    if (loginUser) {
      console.log("✅ User found for login");
      console.log("User role:", loginUser.role);
      console.log("Hospital ID:", loginUser.hospitalInfo?.hospitalId);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

testHospitalRegistration();
