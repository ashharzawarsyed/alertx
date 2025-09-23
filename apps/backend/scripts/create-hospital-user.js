import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function createHospitalUser() {
  try {
    console.log("🔧 Creating hospital user for dashboard login...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({
      email: "ashharzawarsyedwork@gmail.com",
    });
    if (existingUser) {
      console.log("👤 User already exists, updating password...");

      // Update password
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash("Hospital123!", salt);
      existingUser.role = "hospital";
      existingUser.isApproved = true;
      existingUser.hospitalName = "AlertX Medical Center";

      await existingUser.save();
      console.log("✅ User updated successfully");
    } else {
      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Hospital123!", salt);

      const hospitalUser = new User({
        name: "Hospital Administrator",
        email: "ashharzawarsyedwork@gmail.com",
        password: hashedPassword,
        role: "hospital",
        phone: "+1555987654",
        isApproved: true,
        hospitalName: "AlertX Medical Center",
        hospitalAddress: "123 Medical District, Healthcare City",
        hospitalPhone: "+1555HOSPITAL",
        emergencyCapacity: 50,
        specialties: ["Emergency Medicine", "Cardiology", "Trauma"],
      });

      await hospitalUser.save();
      console.log("✅ Hospital user created successfully");
    }

    console.log("\n🎯 Login Credentials:");
    console.log("📧 Email: ashharzawarsyedwork@gmail.com");
    console.log("🔑 Password: Hospital123!");
    console.log("👤 Role: hospital");
    console.log("🏥 Hospital: AlertX Medical Center");
    console.log("\n🚀 You can now login to the hospital dashboard!");
  } catch (error) {
    console.error("💥 Error creating hospital user:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createHospitalUser();
