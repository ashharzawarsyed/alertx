import mongoose from "mongoose";
import User from "./models/User.js";
import Hospital from "./models/Hospital.js";
import dotenv from "dotenv";

dotenv.config();

async function checkHospitals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all hospital users
    const hospitalUsers = await User.find({ role: "hospital" });

    console.log(`\nFound ${hospitalUsers.length} hospital user(s):`);

    if (hospitalUsers.length > 0) {
      for (const user of hospitalUsers) {
        console.log("\n----------------------------");
        console.log("Email:", user.email);
        console.log("Name:", user.name);
        console.log("Role:", user.role);
        console.log("Approval Status:", user.approvalStatus);
        console.log("Is Verified:", user.isVerified);
        console.log("Hospital ID:", user.hospitalInfo?.hospitalId);

        if (user.hospitalInfo?.hospitalId) {
          const hospital = await Hospital.findById(
            user.hospitalInfo.hospitalId
          );
          if (hospital) {
            console.log("Hospital Name:", hospital.name);
            console.log("Total Beds:", hospital.totalBeds);
            console.log("Available Beds:", hospital.availableBeds);
          }
        }
      }
    } else {
      console.log("\n⚠️  No hospital accounts found!");
      console.log("\nTo create a hospital account, use the signup page at:");
      console.log("http://localhost:5173/signup");
    }

    // Also check Hospital collection
    const hospitals = await Hospital.find();
    console.log(
      `\n\nFound ${hospitals.length} hospital(s) in Hospital collection:`
    );

    for (const hospital of hospitals) {
      console.log("\n----------------------------");
      console.log("Hospital Name:", hospital.name);
      console.log("License Number:", hospital.licenseNumber);
      console.log("Contact:", hospital.contactNumber);
      console.log("Email:", hospital.email);
      console.log("Approval Status:", hospital.approvalStatus);
      console.log("Total Beds:", hospital.totalBeds);
      console.log("Available Beds:", hospital.availableBeds);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkHospitals();
