import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import "dotenv/config";

const MONGODB_URI = process.env.MONGO_URI;

// New hospitals in Wah Cantt
const wahHospitals = [
  {
    name: "POF Hospital Wah Cantt",
    type: "General Hospital",
    licenseNumber: "WAH-POF-2024-001",
    address: "POF Colony, Wah Cantt, Rawalpindi",
    location: { lat: 33.7794, lng: 72.7489 }, // Wah Cantt coordinates
    contactNumber: "+92519314051",
    email: "info@pofhospital.com.pk",
    emergencyContact: "+92519314911",
    totalBeds: {
      general: 280,
      icu: 40,
      emergency: 30,
      operation: 15,
    },
    availableBeds: {
      general: 140,
      icu: 20,
      emergency: 15,
      operation: 8,
    },
    facilities: ["cardiology", "emergency", "radiology", "neurology", "pediatrics", "orthopedics", "laboratory"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Noori Hospital Wah Cantt",
    type: "General Hospital",
    licenseNumber: "WAH-NOORI-2024-002",
    address: "GT Road, Wah Cantt, Rawalpindi",
    location: { lat: 33.7850, lng: 72.7550 }, // Wah Cantt coordinates
    contactNumber: "+92519314444",
    email: "info@noorihospital.com.pk",
    emergencyContact: "+92519314999",
    totalBeds: {
      general: 150,
      icu: 25,
      emergency: 20,
      operation: 10,
    },
    availableBeds: {
      general: 75,
      icu: 12,
      emergency: 10,
      operation: 5,
    },
    facilities: ["emergency", "radiology", "pediatrics", "gynecology", "laboratory", "cardiology"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
];

async function addWahHospitals() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Update ALL existing hospitals to be active and verified
    console.log("🔄 Step 1: Activating all existing hospitals...");
    const updateResult = await Hospital.updateMany(
      {}, // Update all hospitals
      {
        $set: {
          isActive: true,
          isVerified: true,
          approvalStatus: "approved"
        }
      }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} existing hospitals`);
    console.log(`📊 Total hospitals matched: ${updateResult.matchedCount}\n`);

    // Step 2: Check if Wah hospitals already exist
    console.log("🔍 Step 2: Checking for existing Wah Cantt hospitals...");
    const existingPOF = await Hospital.findOne({ licenseNumber: "WAH-POF-2024-001" });
    const existingNoori = await Hospital.findOne({ licenseNumber: "WAH-NOORI-2024-002" });
    
    const hospitalsToAdd = [];
    if (!existingPOF) {
      hospitalsToAdd.push(wahHospitals[0]);
      console.log("  - POF Hospital: Will be added ✨");
    } else {
      console.log("  - POF Hospital: Already exists ✓");
      // Update existing to ensure it's active
      await Hospital.updateOne(
        { licenseNumber: "WAH-POF-2024-001" },
        { $set: { isActive: true, isVerified: true, approvalStatus: "approved" } }
      );
    }
    
    if (!existingNoori) {
      hospitalsToAdd.push(wahHospitals[1]);
      console.log("  - Noori Hospital: Will be added ✨");
    } else {
      console.log("  - Noori Hospital: Already exists ✓");
      // Update existing to ensure it's active
      await Hospital.updateOne(
        { licenseNumber: "WAH-NOORI-2024-002" },
        { $set: { isActive: true, isVerified: true, approvalStatus: "approved" } }
      );
    }

    // Step 3: Add new hospitals if needed
    if (hospitalsToAdd.length > 0) {
      console.log(`\n🌱 Step 3: Adding ${hospitalsToAdd.length} new hospital(s)...`);
      const createdHospitals = await Hospital.insertMany(hospitalsToAdd);
      console.log(`✅ Successfully added ${createdHospitals.length} hospital(s):`);
      createdHospitals.forEach((hospital, index) => {
        console.log(`  ${index + 1}. ${hospital.name}`);
        console.log(`     📍 Location: ${hospital.location.lat}, ${hospital.location.lng}`);
        console.log(`     🛏️  Total Beds: ${hospital.totalBeds.general + hospital.totalBeds.icu + hospital.totalBeds.emergency}`);
        console.log(`     ✅ Active: ${hospital.isActive}, Verified: ${hospital.isVerified}`);
      });
    } else {
      console.log("\n✓ All Wah Cantt hospitals already exist");
    }

    // Step 4: Display all hospitals
    console.log("\n📋 Step 4: All hospitals in database:");
    const allHospitals = await Hospital.find({}).select('name isActive isVerified location').sort({ name: 1 });
    allHospitals.forEach((hospital, index) => {
      const status = hospital.isActive && hospital.isVerified ? "✅" : "❌";
      console.log(`  ${index + 1}. ${status} ${hospital.name}`);
      console.log(`     Active: ${hospital.isActive}, Verified: ${hospital.isVerified}`);
      console.log(`     Location: ${hospital.location.lat}, ${hospital.location.lng}`);
    });

    console.log(`\n📊 Total hospitals in database: ${allHospitals.length}`);
    console.log(`✅ Active & Verified: ${allHospitals.filter(h => h.isActive && h.isVerified).length}`);
    console.log(`❌ Inactive or Unverified: ${allHospitals.filter(h => !h.isActive || !h.isVerified).length}`);

    console.log("\n🎉 All operations completed successfully!");
    console.log("💡 Hospitals are now ready to be displayed in the app");
    
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addWahHospitals();
