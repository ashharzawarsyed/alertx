import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      minlength: [2, "Hospital name must be at least 2 characters long"],
      maxlength: [100, "Hospital name cannot exceed 100 characters"],
    },

    address: {
      type: String,
      required: [true, "Hospital address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters long"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },

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
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^\+[1-9]\d{1,14}$/, "Please provide a valid contact number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    // Total bed capacity
    totalBeds: {
      general: {
        type: Number,
        required: [true, "General bed count is required"],
        min: [0, "General beds cannot be negative"],
      },
      icu: {
        type: Number,
        required: [true, "ICU bed count is required"],
        min: [0, "ICU beds cannot be negative"],
      },
      emergency: {
        type: Number,
        required: [true, "Emergency bed count is required"],
        min: [0, "Emergency beds cannot be negative"],
      },
      operation: {
        type: Number,
        default: 0,
        min: [0, "Operation beds cannot be negative"],
      },
    },

    // Available beds (updated in real-time)
    availableBeds: {
      general: {
        type: Number,
        required: true,
        min: [0, "Available general beds cannot be negative"],
      },
      icu: {
        type: Number,
        required: true,
        min: [0, "Available ICU beds cannot be negative"],
      },
      emergency: {
        type: Number,
        required: true,
        min: [0, "Available emergency beds cannot be negative"],
      },
      operation: {
        type: Number,
        default: 0,
        min: [0, "Available operation beds cannot be negative"],
      },
    },

    // Hospital facilities and specializations
    facilities: [
      {
        type: String,
        enum: [
          "cardiology",
          "neurology",
          "orthopedics",
          "pediatrics",
          "gynecology",
          "oncology",
          "emergency",
          "trauma_center",
          "burn_unit",
          "psychiatric",
          "radiology",
          "laboratory",
        ],
      },
    ],

    // Operating hours
    operatingHours: {
      isOpen24x7: {
        type: Boolean,
        default: true,
      },
      hours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
      },
    },

    // Hospital status
    isActive: {
      type: Boolean,
      default: false, // Requires admin approval
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Admin approval
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    // Hospital rating and statistics
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Statistics
    statistics: {
      totalPatientsServed: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number, // in minutes
        default: 0,
      },
    },

    lastBedUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial queries
hospitalSchema.index({ location: "2dsphere" });

// Virtual for total available beds
hospitalSchema.virtual("totalAvailableBeds").get(function () {
  return (
    this.availableBeds.general +
    this.availableBeds.icu +
    this.availableBeds.emergency +
    this.availableBeds.operation
  );
});

// Virtual for bed utilization percentage
hospitalSchema.virtual("bedUtilization").get(function () {
  const total =
    this.totalBeds.general +
    this.totalBeds.icu +
    this.totalBeds.emergency +
    this.totalBeds.operation;
  const available = this.totalAvailableBeds;
  return total > 0 ? Math.round(((total - available) / total) * 100) : 0;
});

// Pre-save middleware to initialize available beds
hospitalSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableBeds = {
      general: this.totalBeds.general,
      icu: this.totalBeds.icu,
      emergency: this.totalBeds.emergency,
      operation: this.totalBeds.operation,
    };
  }
  next();
});

// Method to update bed availability
hospitalSchema.methods.updateBedAvailability = function (bedType, count) {
  if (this.availableBeds[bedType] !== undefined) {
    this.availableBeds[bedType] = Math.max(
      0,
      Math.min(this.totalBeds[bedType], count)
    );
    this.lastBedUpdate = new Date();
    return this.save();
  }
  throw new Error("Invalid bed type");
};

export default mongoose.model("Hospital", hospitalSchema);
