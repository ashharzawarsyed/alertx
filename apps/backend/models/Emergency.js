import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { EMERGENCY_STATUS, SEVERITY_LEVELS } from "../utils/constants.js";

const emergencySchema = new mongoose.Schema(
  {
    // Patient information
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    // Emergency details
    symptoms: [
      {
        type: String,
        required: [true, "At least one symptom is required"],
        trim: true,
      },
    ],

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // AI triage results
    severityLevel: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.MEDIUM,
    },

    triageScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    aiPrediction: {
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      suggestedSpecialty: String,
      estimatedTime: Number, // in minutes
    },

    // Location where emergency occurred
    location: {
      lat: {
        type: Number,
        required: [true, "Latitude is required"],
        min: [-90, "Invalid latitude"],
        max: [90, "Invalid latitude"],
      },
      lng: {
        type: Number,
        required: [true, "Longitude is required"],
        min: [-180, "Invalid longitude"],
        max: [180, "Invalid longitude"],
      },
      address: String,
    },

    // Emergency status tracking
    status: {
      type: String,
      enum: Object.values(EMERGENCY_STATUS),
      default: EMERGENCY_STATUS.PENDING,
    },

    // Assigned driver and hospital
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    // Timing information
    requestTime: {
      type: Date,
      default: Date.now,
    },

    responseTime: Date, // When driver accepts
    pickupTime: Date, // When driver reaches patient
    hospitalTime: Date, // When reaches hospital
    completedTime: Date,

    // Emergency contacts that were notified
    notifiedContacts: [
      {
        phone: String,
        notifiedAt: Date,
        method: {
          type: String,
          enum: ["sms", "push", "call"],
          default: "sms",
        },
      },
    ],

    // Trip information
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    // Additional notes
    notes: [
      {
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        note: {
          type: String,
          required: true,
          maxlength: 500,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Cancellation information
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: false, // Prevent automatic index creation
  }
);

// Indexes for efficient queries
emergencySchema.index({ patient: 1, createdAt: -1 });
emergencySchema.index({ status: 1, createdAt: -1 });
emergencySchema.index({ assignedDriver: 1, status: 1 });
emergencySchema.index({ severityLevel: 1, status: 1 });

// Virtual for total response time
emergencySchema.virtual("totalResponseTime").get(function () {
  if (this.responseTime && this.requestTime) {
    return Math.round((this.responseTime - this.requestTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for total duration
emergencySchema.virtual("totalDuration").get(function () {
  if (this.completedTime && this.requestTime) {
    return Math.round((this.completedTime - this.requestTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Method to update status with timestamp
emergencySchema.methods.updateStatus = function (newStatus, userId = null) {
  this.status = newStatus;

  switch (newStatus) {
    case EMERGENCY_STATUS.ACCEPTED:
      this.responseTime = new Date();
      break;
    case EMERGENCY_STATUS.IN_PROGRESS:
      this.pickupTime = new Date();
      break;
    case EMERGENCY_STATUS.COMPLETED:
      this.completedTime = new Date();
      break;
    case EMERGENCY_STATUS.CANCELLED:
      this.cancelledAt = new Date();
      if (userId) this.cancelledBy = userId;
      break;
  }

  return this.save();
};

// Method to add note
emergencySchema.methods.addNote = function (note, userId) {
  this.notes.push({
    addedBy: userId,
    note: note,
    timestamp: new Date(),
  });
  return this.save();
};

// Method to check if emergency has timed out (1 hour)
emergencySchema.methods.checkTimeout = function () {
  const oneHourInMs = 60 * 60 * 1000;
  const timeSinceRequest = Date.now() - this.requestTime.getTime();
  
  if (
    this.status === EMERGENCY_STATUS.PENDING &&
    timeSinceRequest > oneHourInMs
  ) {
    this.status = EMERGENCY_STATUS.CANCELLED;
    this.cancelledAt = new Date();
    this.cancellationReason = "Auto-cancelled: No response after 1 hour";
    return true;
  }
  return false;
};

// Static method to auto-cancel timed out emergencies
emergencySchema.statics.autoCancelTimedOut = async function () {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const result = await this.updateMany(
    {
      status: EMERGENCY_STATUS.PENDING,
      requestTime: { $lte: oneHourAgo },
    },
    {
      $set: {
        status: EMERGENCY_STATUS.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: "Auto-cancelled: No response after 1 hour",
      },
    }
  );

  return result;
};

// Add pagination plugin
emergencySchema.plugin(mongoosePaginate);

export default mongoose.model("Emergency", emergencySchema);
