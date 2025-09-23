// Test validation middleware without database
import { body, validationResult } from "express-validator";

// Mock the middleware validation function to test locally
const validateHospitalWithAdmin = [
  // Hospital details
  body("hospitalName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Hospital name must be between 2 and 100 characters"),

  body("hospitalType").notEmpty().withMessage("Hospital type is required"),

  body("licenseNumber").notEmpty().withMessage("License number is required"),

  body("address")
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("Address must be between 10 and 200 characters"),

  body("city").notEmpty().withMessage("City is required"),

  body("state").notEmpty().withMessage("State is required"),

  body("zipCode").notEmpty().withMessage("ZIP code is required"),

  body("country").notEmpty().withMessage("Country is required"),

  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),

  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),

  body("contactNumber")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid contact number with country code"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("totalBeds.general")
    .isInt({ min: 0 })
    .withMessage("General beds must be a non-negative integer"),

  body("totalBeds.icu")
    .isInt({ min: 0 })
    .withMessage("ICU beds must be a non-negative integer"),

  body("totalBeds.emergency")
    .isInt({ min: 0 })
    .withMessage("Emergency beds must be a non-negative integer"),

  body("totalBeds.operation")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Operation beds must be a non-negative integer"),

  body("emergencyContact")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage(
      "Please provide a valid emergency contact number with country code"
    ),

  // Admin details
  body("adminName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Admin name must be between 2 and 50 characters"),

  body("adminPosition").notEmpty().withMessage("Admin position is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Test cases
const validData = {
  hospitalName: "Test General Hospital",
  hospitalType: "General Hospital",
  licenseNumber: "HL-2024-001",
  address: "123 Hospital Street, Medical District",
  city: "Medical City",
  state: "California",
  zipCode: "90210",
  country: "USA",
  latitude: 34.0522,
  longitude: -118.2437,
  contactNumber: "+12345678901",
  email: "admin@testgeneral.com",
  totalBeds: {
    general: 100,
    icu: 20,
    emergency: 15,
    operation: 10,
  },
  emergencyContact: "+12345678902",
  adminName: "Dr. John Smith",
  adminPosition: "Chief Administrator",
  password: "Test123!@#",
};

const invalidData = {
  hospitalName: "T", // Too short
  hospitalType: "", // Empty
  licenseNumber: "", // Empty
  address: "123", // Too short
  city: "", // Empty
  state: "", // Empty
  zipCode: "", // Empty
  country: "", // Empty
  contactNumber: "123", // Invalid format
  email: "invalid-email", // Invalid email
  totalBeds: {
    general: -1, // Negative
    icu: "abc", // Not a number
    emergency: null, // Required but null
  },
  emergencyContact: "456", // Invalid format
  adminName: "A", // Too short
  adminPosition: "", // Empty
  password: "weak", // Too short, no uppercase, no number
};

async function testValidation(data, description) {
  console.log(`\n=== Testing ${description} ===`);

  // Mock express request object
  const req = {
    body: data,
  };

  // Mock express response object
  const res = {};

  // Mock next function
  const next = () => {};

  try {
    // Run all validators
    for (const validator of validateHospitalWithAdmin) {
      await validator(req, res, next);
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation failed:");
      errors.array().forEach((error) => {
        console.log(`  - ${error.path}: ${error.msg}`);
      });
    } else {
      console.log("✅ Validation passed");
    }
  } catch (error) {
    console.log("❌ Validation error:", error.message);
  }
}

// Run tests
async function runTests() {
  await testValidation(validData, "Valid Data");
  await testValidation(invalidData, "Invalid Data");

  console.log("\n🎉 Middleware validation tests completed!");
}

runTests();
