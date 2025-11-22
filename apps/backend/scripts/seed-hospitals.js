import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import "dotenv/config";

const MONGODB_URI = process.env.MONGO_URI;

const hospitals = [
  {
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    type: "General Hospital",
    licenseNumber: "ISB-PIMS-2024-001",
    address: "G-8/3, Islamabad Capital Territory",
    location: { lat: 33.6844, lng: 73.0479 },
    contactNumber: "+92519261170",
    email: "info@pims.gov.pk",
    emergencyContact: "+92519261100",
    totalBeds: {
      general: 500,
      icu: 80,
      emergency: 50,
      operation: 25,
    },
    availableBeds: {
      general: 250,
      icu: 40,
      emergency: 25,
      operation: 12,
    },
    facilities: ["cardiology", "emergency", "radiology", "neurology", "pediatrics", "orthopedics"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Shifa International Hospital",
    type: "General Hospital",
    licenseNumber: "ISB-SHIFA-2024-002",
    address: "Pitras Bukhari Road, H-8/4, Islamabad",
    location: { lat: 33.6640, lng: 73.0778 },
    contactNumber: "+92514603643",
    email: "info@shifa.com.pk",
    emergencyContact: "+92514603911",
    totalBeds: {
      general: 350,
      icu: 60,
      emergency: 40,
      operation: 20,
    },
    availableBeds: {
      general: 175,
      icu: 30,
      emergency: 20,
      operation: 10,
    },
    facilities: ["cardiology", "emergency", "radiology", "oncology", "neurology", "gynecology"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Federal Government Poly Clinic Hospital",
    type: "General Hospital",
    licenseNumber: "ISB-FGPC-2024-003",
    address: "Shahrah-e-Islamabad, G-6/2, Islamabad",
    location: { lat: 33.6994, lng: 73.0470 },
    contactNumber: "+92519205561",
    email: "info@fgpolyclinic.gov.pk",
    emergencyContact: "+92519205999",
    totalBeds: {
      general: 300,
      icu: 40,
      emergency: 30,
      operation: 15,
    },
    availableBeds: {
      general: 150,
      icu: 20,
      emergency: 15,
      operation: 8,
    },
    facilities: ["emergency", "radiology", "pediatrics"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Maroof International Hospital",
    type: "General Hospital",
    licenseNumber: "ISB-MAROOF-2024-004",
    address: "Main Lehtrar Road, G-9 Markaz, Islamabad",
    location: { lat: 33.6885, lng: 73.0285 },
    contactNumber: "+92512265466",
    email: "info@maroofhospital.com",
    emergencyContact: "+92512265911",
    totalBeds: {
      general: 200,
      icu: 35,
      emergency: 25,
      operation: 12,
    },
    availableBeds: {
      general: 100,
      icu: 18,
      emergency: 12,
      operation: 6,
    },
    facilities: ["cardiology", "emergency", "radiology", "orthopedics"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Kulsum International Hospital",
    type: "General Hospital",
    licenseNumber: "ISB-KULSUM-2024-005",
    address: "F-11 Markaz, Islamabad",
    location: { lat: 33.6521, lng: 72.9816 },
    contactNumber: "+92512261812",
    email: "info@kulsumhospital.com",
    emergencyContact: "+92512261900",
    totalBeds: {
      general: 180,
      icu: 30,
      emergency: 20,
      operation: 10,
    },
    availableBeds: {
      general: 90,
      icu: 15,
      emergency: 10,
      operation: 5,
    },
    facilities: ["emergency", "gynecology", "pediatrics"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Quaid-e-Azam International Hospital",
    type: "General Hospital",
    licenseNumber: "ISB-QAIH-2024-006",
    address: "Plot No. 10, Main Boulevard, DHA Phase 2, Islamabad",
    location: { lat: 33.5344, lng: 73.0928 },
    contactNumber: "+92519265000",
    email: "info@qaih.com.pk",
    emergencyContact: "+92519265911",
    totalBeds: {
      general: 250,
      icu: 45,
      emergency: 30,
      operation: 15,
    },
    availableBeds: {
      general: 125,
      icu: 22,
      emergency: 15,
      operation: 8,
    },
    facilities: ["cardiology", "emergency", "radiology", "neurology", "orthopedics"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Al-Shifa Eye Trust Hospital",
    type: "Specialty Hospital",
    licenseNumber: "ISB-ALSHIFA-2024-007",
    address: "Jinnah Avenue, Sector F-8, Islamabad",
    location: { lat: 33.7078, lng: 73.0615 },
    contactNumber: "+92519251632",
    email: "info@alshifaeye.org",
    emergencyContact: "+92519251900",
    totalBeds: {
      general: 150,
      icu: 20,
      emergency: 15,
      operation: 10,
    },
    availableBeds: {
      general: 75,
      icu: 10,
      emergency: 8,
      operation: 5,
    },
    facilities: ["emergency", "radiology"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Islamabad Diagnostic Center (IDC)",
    type: "General Hospital",
    licenseNumber: "ISB-IDC-2024-008",
    address: "G-9/1, Islamabad",
    location: { lat: 33.6891, lng: 73.0349 },
    contactNumber: "+92512250842",
    email: "info@idc.net.pk",
    emergencyContact: "+92512250911",
    totalBeds: {
      general: 120,
      icu: 25,
      emergency: 18,
      operation: 8,
    },
    availableBeds: {
      general: 60,
      icu: 12,
      emergency: 9,
      operation: 4,
    },
    facilities: ["emergency", "radiology", "laboratory"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Ali Medical Centre",
    type: "General Hospital",
    licenseNumber: "ISB-ALI-2024-009",
    address: "Blue Area, Islamabad",
    location: { lat: 33.7151, lng: 73.0559 },
    contactNumber: "+92512871351",
    email: "info@alimedicalcentre.com",
    emergencyContact: "+92512871900",
    totalBeds: {
      general: 100,
      icu: 20,
      emergency: 15,
      operation: 8,
    },
    availableBeds: {
      general: 50,
      icu: 10,
      emergency: 8,
      operation: 4,
    },
    facilities: ["emergency", "cardiology"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
  {
    name: "Capital Hospital",
    type: "General Hospital",
    licenseNumber: "ISB-CAPITAL-2024-010",
    address: "G-6/4, Islamabad",
    location: { lat: 33.6973, lng: 73.0627 },
    contactNumber: "+92512260294",
    email: "info@capitalhospital.com.pk",
    emergencyContact: "+92512260911",
    totalBeds: {
      general: 220,
      icu: 35,
      emergency: 25,
      operation: 12,
    },
    availableBeds: {
      general: 110,
      icu: 18,
      emergency: 12,
      operation: 6,
    },
    facilities: ["cardiology", "emergency", "radiology", "pediatrics", "orthopedics"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  },
];

async function seedHospitals() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check existing hospitals
    const existingCount = await Hospital.countDocuments();
    console.log(`📊 Current hospitals in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log("⚠️  Hospitals already exist. Do you want to:");
      console.log("  1. Skip seeding (default)");
      console.log("  2. Clear and reseed (set FORCE=true or use --force)");
      
      const shouldForce = process.env.FORCE === 'true' || process.argv.includes('--force');
      
      if (!shouldForce) {
        console.log("✋ Skipping seeding. Use FORCE=true or --force to clear and reseed.");
        await mongoose.disconnect();
        return;
      }

      console.log("🗑️  Clearing existing hospitals...");
      const deleteResult = await Hospital.deleteMany({});
      console.log(`✅ Cleared ${deleteResult.deletedCount} hospitals`);
    }

    console.log("🌱 Seeding hospitals...");
    const createdHospitals = await Hospital.insertMany(hospitals);
    
    console.log(`✅ Successfully seeded ${createdHospitals.length} hospitals:`);
    createdHospitals.forEach((hospital, index) => {
      console.log(`  ${index + 1}. ${hospital.name}`);
      console.log(`     Location: ${hospital.location.lat}, ${hospital.location.lng}`);
      console.log(`     Available Beds: ${hospital.totalAvailableBeds}`);
    });

    console.log("\n🎉 Seeding completed successfully!");
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding hospitals:", error);
    process.exit(1);
  }
}

seedHospitals();
