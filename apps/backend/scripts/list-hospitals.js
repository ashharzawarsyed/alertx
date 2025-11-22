import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import "dotenv/config";

const MONGODB_URI = process.env.MONGO_URI;

async function listHospitals() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const hospitals = await Hospital.find({}).sort({ name: 1 });
    
    console.log(`📊 Total Hospitals: ${hospitals.length}\n`);
    console.log("═".repeat(80));

    hospitals.forEach((hospital, index) => {
      console.log(`\n${index + 1}. ${hospital.name}`);
      console.log(`   📍 Address: ${hospital.address}`);
      console.log(`   📞 Contact: ${hospital.contactNumber}`);
      console.log(`   📧 Email: ${hospital.email}`);
      console.log(`   🌍 Location: Lat ${hospital.location.lat}, Lng ${hospital.location.lng}`);
      console.log(`   🏥 Total Beds: ${hospital.totalAvailableBeds}`);
      console.log(`   ✅ Active: ${hospital.isActive ? 'Yes' : 'No'}`);
      console.log(`   ✔️  Verified: ${hospital.isVerified ? 'Yes' : 'No'}`);
      console.log(`   📋 Status: ${hospital.approvalStatus}`);
      console.log(`   🏷️  Facilities: ${hospital.facilities.join(', ')}`);
      
      if (hospital.availableBeds) {
        console.log(`   🛏️  Available Beds:`);
        console.log(`      - General: ${hospital.availableBeds.general}`);
        console.log(`      - ICU: ${hospital.availableBeds.icu}`);
        console.log(`      - Emergency: ${hospital.availableBeds.emergency}`);
        console.log(`      - Operation: ${hospital.availableBeds.operation}`);
      }
    });

    console.log("\n" + "═".repeat(80));
    console.log("\n📈 Summary:");
    const activeCount = await Hospital.countDocuments({ isActive: true });
    const verifiedCount = await Hospital.countDocuments({ isVerified: true });
    const approvedCount = await Hospital.countDocuments({ approvalStatus: "approved" });
    const withBeds = await Hospital.countDocuments({ totalAvailableBeds: { $gt: 0 } });

    console.log(`   Active: ${activeCount}`);
    console.log(`   Verified: ${verifiedCount}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   With Available Beds: ${withBeds}`);

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error listing hospitals:", error);
    process.exit(1);
  }
}

listHospitals();
