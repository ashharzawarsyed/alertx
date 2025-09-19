import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import mongoose from "mongoose";
import { sendAdminApprovalRequest } from "../services/emailService.js";

(async () => {
  try {
    await connectDB();
    await sendAdminApprovalRequest({
      name: "Test User",
      email: "meyoxi9145@anysilo.com",
      phone: "+1234567890",
      id: "testid123",
    });
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
