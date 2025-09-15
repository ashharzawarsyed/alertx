// Reset admin password for dashboard testing
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { hashPassword } from "../utils/helpers.js";

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📊 Connected to MongoDB");

    const email = "admin@alertx.com";
    const newPassword = "Admin123!@#";

    // Find the admin user
    const user = await User.findOne({ email, role: "admin" });

    if (!user) {
      console.log("❌ Admin user not found");
      return;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    await User.updateOne(
      { email, role: "admin" },
      {
        password: hashedPassword,
        isActive: true, // Make sure account is active
      }
    );

    console.log("✅ Admin password reset successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 New Password:", newPassword);
    console.log("👤 Role: admin");
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

resetAdminPassword();
