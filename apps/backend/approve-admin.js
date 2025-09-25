import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function approveAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the admin user we just created
    const admin = await User.findOne({ email: "fdsjkahfdhasfhh@gmail.com" });

    if (!admin) {
      console.log("Admin user not found");
      return;
    }

    console.log("Found admin:", admin.email, "Status:", admin.approvalStatus);

    // Approve the admin
    admin.approvalStatus = "approved";
    admin.isActive = true;
    admin.approvedAt = new Date();

    await admin.save();

    console.log("Admin approved successfully!");
    console.log(
      "Updated status:",
      admin.approvalStatus,
      "Active:",
      admin.isActive
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

approveAdmin();
