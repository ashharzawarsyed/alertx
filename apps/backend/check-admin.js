import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the admin user
    const admin = await User.findOne({ email: "fdsjkahfdhasfhh@gmail.com" });
    
    if (!admin) {
      console.log("Admin user not found");
      return;
    }

    console.log("Admin Details:");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("isActive:", admin.isActive);
    console.log("approvalStatus:", admin.approvalStatus);
    console.log("isVerified:", admin.isVerified);
    console.log("Created:", admin.createdAt);
    console.log("Updated:", admin.updatedAt);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAdmin();