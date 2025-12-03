import mongoose from "mongoose";
import User from "./models/User.js";
import Hospital from "./models/Hospital.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function createTestHospital() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if test hospital already exists
    const existingUser = await User.findOne({ email: "test@hospital.com" });
    if (existingUser) {
      console.log("\n✅ Test hospital user already exists!");
      console.log("Email: test@hospital.com");
      console.log("Password: Test@123");
      console.log("Approval Status:", existingUser.approvalStatus);

      // Update to approved if pending
      if (existingUser.approvalStatus !== "approved") {
        existingUser.approvalStatus = "approved";
        await existingUser.save();
        console.log("✅ Updated approval status to 'approved'");
      }

      process.exit(0);
      return;
    }

    // Create Hospital first
    const hospital = new Hospital({
      name: "Test General Hospital",
      type: "General Hospital",
      licenseNumber: "TEST-2024-001",
      location: {
        lat: 33.6844,
        lng: 73.0479,
      },
      address: "F-8 Markaz, Islamabad",
      contactNumber: "+923009999999",
      email: "test@hospital.com",
      emergencyContact: "+923009999999",
      totalBeds: {
        general: 100,
        icu: 20,
        emergency: 15,
        operation: 10,
      },
      availableBeds: {
        general: 50,
        icu: 10,
        emergency: 8,
        operation: 5,
      },
      facilities: [
        "emergency",
        "cardiology",
        "neurology",
        "laboratory",
        "radiology",
      ],
      operatingHours: {
        isOpen24x7: true,
      },
      approvalStatus: "approved",
      isActive: true,
      isVerified: true,
    });

    await hospital.save();
    console.log("✅ Hospital created:", hospital.name);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Test@123", salt);

    // Create User
    const user = new User({
      name: "Test General Hospital",
      email: "test@hospital.com",
      password: hashedPassword,
      phone: "+923009999999",
      role: "hospital",
      hospitalInfo: {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        licenseNumber: hospital.licenseNumber,
      },
      approvalStatus: "approved",
      isVerified: true,
      isActive: true,
    });

    await user.save();
    console.log("✅ User created:", user.email);

    console.log("\n========================================");
    console.log("✅ Test Hospital Account Created!");
    console.log("========================================");
    console.log("Email: test@hospital.com");
    console.log("Password: Test@123");
    console.log("Hospital Name:", hospital.name);
    console.log("Total Beds:", hospital.totalBeds);
    console.log("Available Beds:", hospital.availableBeds);
    console.log("Approval Status: approved");
    console.log("\nYou can now login at: http://localhost:5173");
    console.log("========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createTestHospital();
