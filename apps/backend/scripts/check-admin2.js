import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/User.js";

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await User.findOne({
    email: "ashharzawarsyed@gmail.com",
  }).select("email role approvalStatus isActive password");
  if (!admin) {
    console.log("No admin found with email ashharzawarsyed@gmail.com");
  } else {
    console.log("Admin found:", {
      email: admin.email,
      role: admin.role,
      approvalStatus: admin.approvalStatus,
      isActive: admin.isActive,
      password: admin.password,
    });
  }
  await mongoose.disconnect();
  process.exit(0);
})();
