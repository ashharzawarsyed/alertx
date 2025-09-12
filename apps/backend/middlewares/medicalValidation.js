import { body } from "express-validator";

// Validation for basic medical information
export const validateBasicMedicalInfo = [
  body("bloodType")
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"])
    .withMessage("Invalid blood type"),

  body("height.feet")
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage("Height (feet) must be between 1 and 8"),

  body("height.inches")
    .optional()
    .isInt({ min: 0, max: 11 })
    .withMessage("Height (inches) must be between 0 and 11"),

  body("weight.value")
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage("Weight must be between 1 and 1000"),

  body("weight.unit")
    .optional()
    .isIn(["lbs", "kg"])
    .withMessage("Weight unit must be lbs or kg"),

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Invalid date of birth format")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error("Age must be between 0 and 150 years");
      }
      return true;
    }),

  body("lifestyle.smokingStatus")
    .optional()
    .isIn(["never", "former", "current", "unknown"])
    .withMessage("Invalid smoking status"),

  body("lifestyle.alcoholConsumption")
    .optional()
    .isIn(["none", "occasional", "moderate", "heavy"])
    .withMessage("Invalid alcohol consumption level"),

  body("lifestyle.exerciseFrequency")
    .optional()
    .isIn(["none", "rarely", "weekly", "daily"])
    .withMessage("Invalid exercise frequency"),
];

// Validation for allergies
export const validateAllergies = [
  body("allergies").isArray().withMessage("Allergies must be an array"),

  body("allergies.*.allergen")
    .notEmpty()
    .withMessage("Allergen name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Allergen name must be between 1 and 100 characters"),

  body("allergies.*.severity")
    .isIn(["mild", "moderate", "severe", "life-threatening"])
    .withMessage("Invalid allergy severity level"),

  body("allergies.*.reaction")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reaction description cannot exceed 500 characters"),

  body("allergies.*.dateDiscovered")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for date discovered"),
];

// Validation for medications
export const validateMedications = [
  body("medications").isArray().withMessage("Medications must be an array"),

  body("medications.*.name")
    .notEmpty()
    .withMessage("Medication name is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Medication name must be between 1 and 200 characters"),

  body("medications.*.dosage")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Dosage cannot exceed 100 characters"),

  body("medications.*.frequency")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Frequency cannot exceed 100 characters"),

  body("medications.*.prescribedBy")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Prescribing doctor name cannot exceed 200 characters"),

  body("medications.*.startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format"),

  body("medications.*.endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format"),

  body("medications.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// Validation for medical conditions
export const validateMedicalConditions = [
  body("medicalConditions")
    .isArray()
    .withMessage("Medical conditions must be an array"),

  body("medicalConditions.*.condition")
    .notEmpty()
    .withMessage("Condition name is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Condition name must be between 1 and 200 characters"),

  body("medicalConditions.*.diagnosedDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid diagnosed date format"),

  body("medicalConditions.*.severity")
    .optional()
    .isIn(["mild", "moderate", "severe"])
    .withMessage("Invalid condition severity level"),

  body("medicalConditions.*.treatingPhysician")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Treating physician name cannot exceed 200 characters"),

  body("medicalConditions.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// Validation for emergency contacts
export const validateEmergencyContacts = [
  body("emergencyContacts")
    .isArray({ min: 1 })
    .withMessage("At least one emergency contact is required"),

  body("emergencyContacts.*.name")
    .notEmpty()
    .withMessage("Contact name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Contact name must be between 1 and 100 characters"),

  body("emergencyContacts.*.relationship")
    .notEmpty()
    .withMessage("Relationship is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Relationship must be between 1 and 50 characters"),

  body("emergencyContacts.*.phone")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number with country code"),

  body("emergencyContacts.*.email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("emergencyContacts.*.address")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Address cannot exceed 300 characters"),
];

// Validation for document upload
export const validateDocumentUpload = [
  body("type")
    .isIn([
      "insurance_card",
      "id_card",
      "medical_record",
      "prescription",
      "lab_result",
      "xray",
      "other",
    ])
    .withMessage("Invalid document type"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

// Validation for voice recording upload
export const validateVoiceUpload = [
  body("type")
    .isIn([
      "medical_history",
      "symptoms_description",
      "emergency_instructions",
      "other",
    ])
    .withMessage("Invalid voice recording type"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("duration")
    .optional()
    .isInt({ min: 1, max: 1800 }) // Max 30 minutes
    .withMessage("Duration must be between 1 and 1800 seconds"),
];

// Validation for emergency instructions
export const validateEmergencyInstructions = [
  body("emergencyInstructions.generalInstructions")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("General instructions cannot exceed 2000 characters"),

  body("emergencyInstructions.allergicReactionProtocol")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Allergic reaction protocol cannot exceed 1000 characters"),

  body("emergencyInstructions.medicationInstructions")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Medication instructions cannot exceed 1000 characters"),

  body("emergencyInstructions.doNotResuscitate")
    .optional()
    .isBoolean()
    .withMessage("DNR must be a boolean value"),

  body("emergencyInstructions.organDonor")
    .optional()
    .isBoolean()
    .withMessage("Organ donor must be a boolean value"),

  body("emergencyInstructions.religiousConsiderations")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Religious considerations cannot exceed 500 characters"),

  body("emergencyInstructions.languagePreference")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Language preference must be between 1 and 50 characters"),
];
