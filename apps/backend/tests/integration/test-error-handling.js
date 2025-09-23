import mongoose from "mongoose";
import "dotenv/config";
import Hospital from "./models/Hospital.js";
import User from "./models/User.js";

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function testErrorHandling() {
  try {
    console.log("Testing error handling scenarios...");

    // Test 1: Missing required fields
    console.log("\n1. Testing missing required fields...");
    try {
      await Hospital.create({
        name: "Incomplete Hospital",
        // Missing required fields like type, licenseNumber, etc.
      });
      console.log("❌ Should have failed with missing fields");
    } catch (error) {
      console.log(
        "✅ Correctly rejected missing fields:",
        error.message.includes("required")
      );
    }

    // Test 2: Duplicate hospital name
    console.log("\n2. Testing duplicate hospital name...");
    try {
      // First create a hospital
      await Hospital.create({
        name: "Duplicate Test Hospital",
        type: "General Hospital",
        licenseNumber: "HL-2024-DUP-001",
        address: "123 Test Street, Test City, CA 90210, USA",
        contactNumber: "+15551111111",
        email: "dup1@test.com",
        totalBeds: { general: 10, icu: 5, emergency: 3 },
        availableBeds: { general: 10, icu: 5, emergency: 3 },
        emergencyContact: "+15551111112",
      });

      // Try to create another with same name
      await Hospital.create({
        name: "Duplicate Test Hospital", // Same name
        type: "Emergency Center",
        licenseNumber: "HL-2024-DUP-002", // Different license
        address: "456 Another Street, Test City, CA 90211, USA",
        contactNumber: "+15551111113",
        email: "dup2@test.com", // Different email
        totalBeds: { general: 20, icu: 10, emergency: 5 },
        availableBeds: { general: 20, icu: 10, emergency: 5 },
        emergencyContact: "+15551111114",
      });
      console.log("❌ Should have failed with duplicate name");
    } catch (error) {
      console.log("✅ Correctly rejected duplicate name");
    }

    // Test 3: Invalid hospital type enum
    console.log("\n3. Testing invalid hospital type...");
    try {
      await Hospital.create({
        name: "Invalid Type Hospital",
        type: "Invalid Type", // Not in enum
        licenseNumber: "HL-2024-INV-001",
        address: "789 Invalid Street, Test City, CA 90212, USA",
        contactNumber: "+15551111115",
        email: "invalid@test.com",
        totalBeds: { general: 10, icu: 5, emergency: 3 },
        availableBeds: { general: 10, icu: 5, emergency: 3 },
        emergencyContact: "+15551111116",
      });
      console.log("❌ Should have failed with invalid type");
    } catch (error) {
      console.log(
        "✅ Correctly rejected invalid hospital type:",
        error.message.includes("enum")
      );
    }

    // Test 4: Invalid user role
    console.log("\n4. Testing invalid user role...");
    try {
      await User.create({
        name: "Invalid Role User",
        email: "invalidrole@test.com",
        phone: "+15551111117",
        password: "TestPass123!",
        role: "invalid_role", // Not in enum
      });
      console.log("❌ Should have failed with invalid role");
    } catch (error) {
      console.log(
        "✅ Correctly rejected invalid user role:",
        error.message.includes("Invalid user role")
      );
    }

    // Test 5: Duplicate email
    console.log("\n5. Testing duplicate email...");
    try {
      // Create first user
      await User.create({
        name: "First User",
        email: "duplicate@test.com",
        phone: "+15551111118",
        password: "TestPass123!",
        role: "patient",
      });

      // Try to create second user with same email
      await User.create({
        name: "Second User",
        email: "duplicate@test.com", // Same email
        phone: "+15551111119", // Different phone
        password: "TestPass123!",
        role: "patient",
      });
      console.log("❌ Should have failed with duplicate email");
    } catch (error) {
      console.log(
        "✅ Correctly rejected duplicate email:",
        error.message.includes("duplicate")
      );
    }

    console.log("\n🎉 Error handling tests completed successfully!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  } finally {
    // Cleanup test data
    try {
      await Hospital.deleteMany({
        name: { $in: ["Duplicate Test Hospital", "Invalid Type Hospital"] },
      });
      await User.deleteMany({
        email: { $in: ["invalidrole@test.com", "duplicate@test.com"] },
      });
      console.log("✅ Cleanup completed");
    } catch (cleanupError) {
      console.log("Warning: Cleanup failed:", cleanupError.message);
    }

    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

testErrorHandling();
