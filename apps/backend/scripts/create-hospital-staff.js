import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import "dotenv/config";

const MONGODB_URI = process.env.MONGO_URI;

async function createHospitalStaff() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the test hospital
    const hospital = await Hospital.findOne({
      email: "testhospital@example.com",
    });
    if (!hospital) {
      console.error("Test hospital not found!");
      process.exit(1);
    }

    console.log("Found hospital:", hospital.name, "ID:", hospital._id);

    // Check if hospital staff user already exists
    const existingUser = await User.findOne({
      email: "hospitalstaff@example.com",
    });
    if (existingUser) {
      console.log("Hospital staff user already exists:", existingUser.email);
      await mongoose.disconnect();
      return;
    }

    // Create hospital staff user
    const hashedPassword = await bcrypt.hash("Password123", 12);

    const hospitalStaff = await User.create({
      name: "Test Hospital Admin",
      email: "hospitalstaff@example.com",
      password: hashedPassword,
      phone: "+15551234567",
      role: "hospital_staff",
      isActive: true,
      approvalStatus: "approved", // Pre-approved for testing
      hospitalInfo: {
        hospitalId: hospital._id,
        position: "Administrator",
        department: "Administration",
      },
    });

    console.log("✅ Hospital staff user created successfully!");
    console.log("📧 Email: hospitalstaff@example.com");
    console.log("🔑 Password: Password123");
    console.log("🏥 Hospital:", hospital.name);
    console.log("👤 User ID:", hospitalStaff._id);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating hospital staff:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createHospitalStaff();
