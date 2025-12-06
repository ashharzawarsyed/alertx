import mongoose from "mongoose";
import User from "./models/User.js";
import Hospital from "./models/Hospital.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function createUserOnly() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ email: "test@hospital.com" });
    if (existingUser) {
      console.log("\n✅ User already exists!");
      console.log("Email: test@hospital.com");
      console.log("Resetting password...");

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Test@123", salt);

      existingUser.password = hashedPassword;
      existingUser.approvalStatus = "approved";
      existingUser.isVerified = true;
      existingUser.isActive = true;

      await existingUser.save();

      console.log("\n========================================");
      console.log("✅ Password Reset Complete!");
      console.log("========================================");
      console.log("Email: test@hospital.com");
      console.log("Password: Test@123");
      console.log("========================================");

      process.exit(0);
      return;
    }

    // Find the hospital
    const hospital = await Hospital.findOne({ email: "test@hospital.com" });

    if (!hospital) {
      console.log("❌ Hospital not found. Creating new hospital...");

      // Create Hospital first
      const newHospital = new Hospital({
        name: "Test General Hospital",
        type: "General Hospital",
        licenseNumber: "TEST-DEMO-2024",
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

      await newHospital.save();
      console.log("✅ Hospital created:", newHospital.name);

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
          hospitalId: newHospital._id,
          hospitalName: newHospital.name,
          licenseNumber: newHospital.licenseNumber,
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
      console.log("========================================");

      process.exit(0);
      return;
    }

    console.log("✅ Found hospital:", hospital.name);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Test@123", salt);

    // Create User
    const user = new User({
      name: hospital.name,
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
    console.log("Hospital:", hospital.name);
    console.log("========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createUserOnly();
