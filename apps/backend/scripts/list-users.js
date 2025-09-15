// List all users in the database
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📊 Connected to MongoDB");

    // Find all users
    const users = await User.find({}, "name email role phone isActive").lean();

    console.log(`\n👥 Found ${users.length} users in database:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Active: ${user.isActive}`);
      console.log("");
    });
  } catch (error) {
    console.error("💥 Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

listUsers();
