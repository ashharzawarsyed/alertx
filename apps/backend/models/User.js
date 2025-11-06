import mongoose from "mongoose";
import { hashPassword } from "../utils/helpers.js";
import { USER_ROLES } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [
        /^\+[1-9]\d{1,14}$/,
        "Please provide a valid phone number with country code",
      ],
    },

    role: {
      type: String,
      required: [true, "User role is required"],
      enum: {
        values: Object.values(USER_ROLES),
        message: "Invalid user role",
      },
      default: USER_ROLES.PATIENT,
    },

    location: {
      lat: {
        type: Number,
        // Location can be captured later via geolocation
        // required: function () {
        //   return this.role === USER_ROLES.PATIENT;
        // },
        min: [-90, "Invalid latitude"],
        max: [90, "Invalid latitude"],
      },
      lng: {
        type: Number,
        // Location can be captured later via geolocation
        // required: function () {
        //   return this.role === USER_ROLES.PATIENT;
        // },
        min: [-180, "Invalid longitude"],
        max: [180, "Invalid longitude"],
      },
    },

    // For patients - emergency contact numbers
    notifiers: [
      {
        type: String,
        match: [/^\+[1-9]\d{1,14}$/, "Invalid notifier phone number"],
      },
    ],

    // For drivers - additional info
    driverInfo: {
      licenseNumber: {
        type: String,
        required: function () {
          return this.role === USER_ROLES.DRIVER;
        },
      },
      ambulanceNumber: {
        type: String,
        required: function () {
          return this.role === USER_ROLES.DRIVER;
        },
      },
      currentLocation: {
        lat: Number,
        lng: Number,
      },
      status: {
        type: String,
        enum: ["available", "busy", "offline"],
        default: "offline",
      },
    },

    // For hospital registration
    hospitalInfo: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: function () {
          return this.role === USER_ROLES.HOSPITAL;
        },
      },
    },

    // Comprehensive Medical Profile (mainly for patients)
    medicalProfile: {
      // Basic Medical Information
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
        // Made optional during registration - will be required when completing profile
      },
      height: {
        feet: { type: Number, min: 1, max: 8 },
        inches: { type: Number, min: 0, max: 11 },
      },
      weight: {
        value: { type: Number, min: 1, max: 1000 },
        unit: { type: String, enum: ["lbs", "kg"], default: "lbs" },
      },
      dateOfBirth: {
        type: Date,
        // Made optional during registration - will be required when completing profile
      },

      // Medical History
      allergies: [
        {
          allergen: { type: String, required: true },
          severity: {
            type: String,
            enum: ["mild", "moderate", "severe", "life-threatening"],
            required: true,
          },
          reaction: String,
          dateDiscovered: Date,
        },
      ],

      medications: [
        {
          name: { type: String, required: true },
          dosage: String,
          frequency: String,
          prescribedBy: String,
          startDate: Date,
          endDate: Date,
          isActive: { type: Boolean, default: true },
          notes: String,
        },
      ],

      medicalConditions: [
        {
          condition: { type: String, required: true },
          diagnosedDate: Date,
          severity: { type: String, enum: ["mild", "moderate", "severe"] },
          treatingPhysician: String,
          notes: String,
          isActive: { type: Boolean, default: true },
        },
      ],

      surgeries: [
        {
          procedure: { type: String, required: true },
          date: Date,
          hospital: String,
          surgeon: String,
          complications: String,
          notes: String,
        },
      ],

      // Family Medical History
      familyHistory: [
        {
          relationship: { type: String, required: true }, // mother, father, sibling, etc.
          condition: { type: String, required: true },
          ageOfOnset: Number,
          notes: String,
        },
      ],

      // Lifestyle Information
      lifestyle: {
        smokingStatus: {
          type: String,
          enum: ["never", "former", "current", "unknown"],
        },
        alcoholConsumption: {
          type: String,
          enum: ["none", "occasional", "moderate", "heavy"],
        },
        exerciseFrequency: {
          type: String,
          enum: ["none", "rarely", "weekly", "daily"],
        },
        dietaryRestrictions: [String],
        occupation: String,
      },

      // Emergency Information
      emergencyContacts: [
        {
          name: { type: String, required: true },
          relationship: { type: String, required: true },
          phone: { type: String, required: true },
          email: String,
          address: String,
          isPrimary: { type: Boolean, default: false },
        },
      ],

      healthcareProviders: [
        {
          type: {
            type: String,
            enum: ["primary", "specialist", "dentist", "pharmacy"],
            required: true,
          },
          name: { type: String, required: true },
          specialty: String,
          phone: String,
          address: String,
          notes: String,
        },
      ],

      // Insurance Information
      insurance: [
        {
          provider: { type: String, required: true },
          policyNumber: String,
          groupNumber: String,
          subscriberName: String,
          relationship: {
            type: String,
            enum: ["self", "spouse", "child", "other"],
          },
          effectiveDate: Date,
          expirationDate: Date,
          isPrimary: { type: Boolean, default: false },
        },
      ],

      // Hospital Preferences
      preferredHospitals: [
        {
          name: { type: String, required: true },
          address: String,
          phone: String,
          specialties: [String],
          insuranceAccepted: [String],
          isPrimary: { type: Boolean, default: false },
        },
      ],

      // Medical Documents and Images
      documents: [
        {
          type: {
            type: String,
            enum: [
              "insurance_card",
              "id_card",
              "medical_record",
              "prescription",
              "lab_result",
              "xray",
              "other",
            ],
            required: true,
          },
          filename: { type: String, required: true },
          originalName: String,
          fileUrl: { type: String, required: true },
          uploadDate: { type: Date, default: Date.now },
          description: String,
          isActive: { type: Boolean, default: true },
        },
      ],

      // Voice Recordings
      voiceRecordings: [
        {
          type: {
            type: String,
            enum: [
              "medical_history",
              "symptoms_description",
              "emergency_instructions",
              "other",
            ],
            required: true,
          },
          filename: { type: String, required: true },
          fileUrl: { type: String, required: true },
          duration: Number, // in seconds
          recordingDate: { type: Date, default: Date.now },
          transcription: String, // AI-generated transcription
          description: String,
          isActive: { type: Boolean, default: true },
        },
      ],

      // Emergency Instructions
      emergencyInstructions: {
        generalInstructions: String,
        allergicReactionProtocol: String,
        medicationInstructions: String,
        doNotResuscitate: { type: Boolean, default: false },
        organDonor: { type: Boolean, default: false },
        religiousConsiderations: String,
        languagePreference: { type: String, default: "English" },
      },

      // Profile Completion and Updates
      profileCompletion: {
        basicInfo: { type: Boolean, default: false },
        medicalHistory: { type: Boolean, default: false },
        emergencyContacts: { type: Boolean, default: false },
        documents: { type: Boolean, default: false },
        lastUpdated: { type: Date, default: Date.now },
      },
    },

    isActive: {
      type: Boolean,
      default: true, // All users are active by default
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Admin approval system
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Default to approved for all users
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    rejectionReason: String,

    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Email verification with OTP
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: {
      type: String,
      select: false, // Don't include in queries by default
    },
    emailVerificationOTPExpires: {
      type: Date,
      select: false,
    },

    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial queries
userSchema.index({ location: "2dsphere" });
userSchema.index({ "driverInfo.currentLocation": "2dsphere" });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hashPassword(this.password);
  next();
});

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationOTP;
  delete user.emailVerificationOTPExpires;
  return user;
};

export default mongoose.model("User", userSchema);
