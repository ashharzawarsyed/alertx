import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import "dotenv/config";
const MONGODB_URI = process.env.MONGO_URI;

async function createHospital() {
  await mongoose.connect(MONGODB_URI);

  const hospital = await Hospital.create({
    name: "Test General Hospital",
    address: "123 Main St, Cityville",
    location: { lat: 40.7128, lng: -74.006 },
    contactNumber: "+15551234567",
    email: "testhospital@example.com",
    totalBeds: {
      general: 60,
      icu: 20,
      emergency: 15,
      operation: 5,
    },
    availableBeds: {
      general: 30,
      icu: 10,
      emergency: 5,
      operation: 2,
    },
    facilities: ["cardiology", "emergency", "radiology"],
    operatingHours: { isOpen24x7: true },
    isActive: true,
    isVerified: true,
    approvalStatus: "approved",
  });

  console.log("Created hospital:", hospital);
  await mongoose.disconnect();
}

createHospital().catch(console.error);
