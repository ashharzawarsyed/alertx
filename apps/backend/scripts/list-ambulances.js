// Simple script to list all ambulances in the database
import mongoose from "mongoose";
import dotenv from "dotenv";
import Ambulance from "../models/Ambulance.js";

dotenv.config();

async function listAmbulances() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://ashharzawarsyed:alertx123@cluster0.krkaqh4.mongodb.net/alertx?retryWrites=true&w=majority"
    );
    console.log("📊 Connected to MongoDB");

    // Get all ambulances
    const ambulances = await Ambulance.find({});
    console.log(`\n🚑 Found ${ambulances.length} ambulances in database:`);

    if (ambulances.length === 0) {
      console.log("❌ No ambulances found! Need to create test data.");
    } else {
      ambulances.forEach((ambulance, index) => {
        console.log(`\n${index + 1}. Vehicle: ${ambulance.vehicleNumber}`);
        console.log(`   ID: ${ambulance._id}`);
        console.log(`   Hospital ID: ${ambulance.hospitalId}`);
        console.log(`   Type: ${ambulance.type}`);
        console.log(`   Status: ${ambulance.status}`);
        console.log(
          `   Location: ${ambulance.currentLocation?.address || "Unknown"}`
        );
        console.log(`   Crew: ${ambulance.crew?.length || 0} members`);
        console.log(`   Equipment: ${ambulance.equipment?.length || 0} items`);
      });
    }

    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listAmbulances();
