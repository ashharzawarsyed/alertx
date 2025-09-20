import mongoose from "mongoose";
import User from "./models/User.js";
import { USER_ROLES } from "./utils/constants.js";
import "dotenv/config";
// MongoDB connection string (from .env file only)
const MONGODB_URI = process.env.MONGO_URI;

async function migrateExistingAdmins() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all existing admin users
    const existingAdmins = await User.find({ role: USER_ROLES.ADMIN });
    console.log(`Found ${existingAdmins.length} existing admin users`);

    for (const admin of existingAdmins) {
      console.log(`Updating admin: ${admin.email}`);
      console.log(
        `  Current status - Active: ${admin.isActive}, Approval: ${admin.approvalStatus}`
      );

      // Update to approved status
      admin.approvalStatus = "approved";
      admin.isActive = true;
      admin.approvedAt = new Date();
      await admin.save();

      console.log(
        `  Updated to - Active: ${admin.isActive}, Approval: ${admin.approvalStatus}`
      );
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateExistingAdmins();
