import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function debugPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: "test@hospital.com" }).select(
      "+password"
    );

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
      return;
    }

    console.log("\n✅ User found:");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Approval Status:", user.approvalStatus);
    console.log("Is Active:", user.isActive);
    console.log("Password hash:", user.password.substring(0, 30) + "...");

    // Test password comparison
    const testPassword = "Test@123";
    const isValid = await bcrypt.compare(testPassword, user.password);

    console.log("\n🔐 Password Test:");
    console.log("Test password:", testPassword);
    console.log("Match result:", isValid);

    if (!isValid) {
      console.log("\n❌ Password doesn't match! Creating new hash...");

      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash("Test@123", salt);

      // Directly update the password without triggering pre-save hook
      await User.updateOne(
        { email: "test@hospital.com" },
        { $set: { password: newHash } }
      );

      console.log("✅ Password updated!");
      console.log("\nPlease try logging in again with:");
      console.log("Email: test@hospital.com");
      console.log("Password: Test@123");
    } else {
      console.log("\n✅ Password is correct!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugPassword();
