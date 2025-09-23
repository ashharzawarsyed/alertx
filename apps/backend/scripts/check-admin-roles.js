import mongoose from "mongoose";
import User from "../models/User.js";
import { dbConnect } from "../config/db.js";
import { USER_ROLES } from "../utils/constants.js";
import dotenv from "dotenv";
dotenv.config();

const checkAdminRoles = async () => {
  try {
    await dbConnect();

    const admins = await User.find({
      role: { $in: ["admin", USER_ROLES.ADMIN] },
    });

    console.log("\nFound admins:", admins.length);

    admins.forEach((admin) => {
      console.log("\nAdmin details:");
      console.log("ID:", admin._id);
      console.log("Email:", admin.email);
      console.log("Role:", admin.role);
      console.log("Role type:", typeof admin.role);
      console.log("Is role 'admin'?", admin.role === "admin");
      console.log("Is role USER_ROLES.ADMIN?", admin.role === USER_ROLES.ADMIN);
      console.log("Approval Status:", admin.approvalStatus);
      console.log("Is Active:", admin.isActive);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkAdminRoles();
