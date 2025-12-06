import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function resetTestPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find test hospital user
    const user = await User.findOne({ email: "test@hospital.com" });

    if (!user) {
      console.log("❌ Test hospital user not found!");
      console.log("Run create-test-hospital.js first to create the account.");
      process.exit(1);
      return;
    }

    console.log("✅ Found test hospital user");
    console.log("Current approval status:", user.approvalStatus);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Test@123", salt);

    // Update user
    user.password = hashedPassword;
    user.approvalStatus = "approved";
    user.isVerified = true;
    user.isActive = true;

    await user.save();

    console.log("\n========================================");
    console.log("✅ Password Reset Complete!");
    console.log("========================================");
    console.log("Email: test@hospital.com");
    console.log("Password: Test@123");
    console.log("Approval Status: approved");
    console.log("\nYou can now login at the hospital dashboard!");
    console.log("========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

resetTestPassword();
