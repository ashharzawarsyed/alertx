import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    // Basic patient information
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    age: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [0, "Age cannot be negative"],
      max: [150, "Invalid age"],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^\+[1-9]\d{1,14}$/,
        "Please provide a valid phone number with country code",
      ],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    // Medical information
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },

    allergies: [
      {
        type: String,
        trim: true,
      },
    ],

    medications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        dosage: String,
        frequency: String,
      },
    ],

    medicalConditions: [
      {
        type: String,
        trim: true,
      },
    ],

    // Emergency contact
    emergencyContact: {
      name: {
        type: String,
        required: [true, "Emergency contact name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Emergency contact phone is required"],
        match: [
          /^\+[1-9]\d{1,14}$/,
          "Please provide a valid emergency contact phone number",
        ],
      },
      relationship: {
        type: String,
        required: [true, "Relationship is required"],
        trim: true,
      },
    },

    // Current emergency details
    currentCondition: {
      type: String,
      enum: ["stable", "critical", "improving", "deteriorating"],
      default: "stable",
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    triageLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Hospital assignment
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital assignment is required"],
    },

    // Ambulance assignment
    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
    },

    // Location information
    pickupLocation: {
      lat: {
        type: Number,
        required: [true, "Pickup latitude is required"],
        min: [-90, "Invalid latitude"],
        max: [90, "Invalid latitude"],
      },
      lng: {
        type: Number,
        required: [true, "Pickup longitude is required"],
        min: [-180, "Invalid longitude"],
        max: [180, "Invalid longitude"],
      },
      address: {
        type: String,
        trim: true,
      },
    },

    // Status tracking
    status: {
      type: String,
      enum: [
        "pending", // Waiting for ambulance assignment
        "assigned", // Ambulance assigned
        "en-route", // Ambulance on the way to patient
        "picked-up", // Patient picked up
        "incoming", // On the way to hospital
        "arrived", // Arrived at hospital
        "admitted", // Admitted to hospital
        "discharged", // Discharged from hospital
        "cancelled", // Emergency cancelled
      ],
      default: "pending",
    },

    // Timestamps
    requestTime: {
      type: Date,
      default: Date.now,
    },

    estimatedArrival: {
      type: Date,
    },

    actualArrival: {
      type: Date,
    },

    // Vital signs (updated during transport)
    vitals: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        heartRate: Number,
        bloodPressure: {
          systolic: Number,
          diastolic: Number,
        },
        temperature: Number, // in Celsius
        respiratoryRate: Number,
        oxygenSaturation: Number,
        glucoseLevel: Number,
        notes: String,
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Medical notes from healthcare providers
    medicalNotes: [
      {
        note: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["assessment", "treatment", "medication", "general"],
          default: "general",
        },
      },
    ],

    // Insurance information
    insurance: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
    },

    // Additional metadata
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
patientSchema.index({ hospitalId: 1, status: 1 });
patientSchema.index({ ambulanceId: 1 });
patientSchema.index({ status: 1, createdAt: -1 });
patientSchema.index({ requestTime: -1 });
patientSchema.index({ pickupLocation: "2dsphere" });

// Virtual for full name display
patientSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.age}${this.gender.charAt(0).toUpperCase()})`;
});

// Virtual for time since request
patientSchema.virtual("timeSinceRequest").get(function () {
  if (this.requestTime) {
    return Math.round((Date.now() - this.requestTime.getTime()) / (1000 * 60)); // in minutes
  }
  return null;
});

// Method to update status
patientSchema.methods.updateStatus = function (newStatus, userId = null) {
  this.status = newStatus;

  // Set timestamps based on status
  switch (newStatus) {
    case "picked-up":
      // Patient has been picked up
      break;
    case "arrived":
      this.actualArrival = new Date();
      break;
    case "admitted":
      // Patient admitted to hospital
      break;
  }

  return this.save();
};

// Method to add vital signs
patientSchema.methods.addVitals = function (vitalsData, recordedBy) {
  this.vitals.push({
    ...vitalsData,
    recordedBy,
    timestamp: new Date(),
  });
  return this.save();
};

// Method to add medical note
patientSchema.methods.addMedicalNote = function (
  note,
  addedBy,
  type = "general"
) {
  this.medicalNotes.push({
    note,
    addedBy,
    type,
    timestamp: new Date(),
  });
  return this.save();
};

// Pre-save middleware to set estimated arrival
patientSchema.pre("save", function (next) {
  if (this.isNew && this.status === "assigned") {
    // Set estimated arrival time (default 30 minutes from now)
    this.estimatedArrival = new Date(Date.now() + 30 * 60 * 1000);
  }
  next();
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
