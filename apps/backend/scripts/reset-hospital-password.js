// Reset hospital password for your account
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { hashPassword } from "../utils/helpers.js";

async function resetHospitalPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📊 Connected to MongoDB");

    const email = "ashharzawarsyedwork@gmail.com";
    const newPassword = "Hospital123!@#";

    // Find the hospital user
    const user = await User.findOne({ email, role: "hospital" });

    if (!user) {
      console.log("❌ Hospital user not found");
      return;
    }

    console.log("👤 Found user:", user.name);
    console.log("📧 Email:", user.email);
    console.log("🏥 Role:", user.role);

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    await User.updateOne(
      { email, role: "hospital" },
      {
        password: hashedPassword,
        isActive: true, // Make sure account is active
      }
    );

    console.log("✅ Hospital password reset successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 New Password:", newPassword);
    console.log("🏥 Role: hospital");
    console.log(
      "\n🎯 You can now login to the dashboard with these credentials"
    );
  } catch (error) {
    console.error("💥 Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

resetHospitalPassword();
