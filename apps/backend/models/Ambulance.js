import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
  {
    // Vehicle identification
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
    },

    // Vehicle details
    make: {
      type: String,
      required: [true, "Vehicle make is required"],
      trim: true,
    },

    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },

    year: {
      type: Number,
      required: [true, "Manufacturing year is required"],
      min: [1990, "Vehicle year must be 1990 or later"],
      max: [new Date().getFullYear() + 1, "Invalid manufacturing year"],
    },

    // Ambulance type and capabilities
    type: {
      type: String,
      required: [true, "Ambulance type is required"],
      enum: [
        "basic_life_support", // BLS
        "advanced_life_support", // ALS
        "critical_care", // CCT
        "emergency_response", // Emergency response vehicle
        "air_ambulance", // Helicopter/airplane
      ],
    },

    capacity: {
      patients: {
        type: Number,
        default: 1,
        min: [1, "Patient capacity must be at least 1"],
        max: [4, "Maximum patient capacity is 4"],
      },
      crew: {
        type: Number,
        default: 2,
        min: [1, "Crew capacity must be at least 1"],
        max: [6, "Maximum crew capacity is 6"],
      },
    },

    // Medical equipment and capabilities
    equipment: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        condition: {
          type: String,
          enum: [
            "excellent",
            "good",
            "fair",
            "needs_maintenance",
            "out_of_service",
          ],
          default: "good",
        },
        lastInspected: Date,
        expirationDate: Date,
      },
    ],

    medicalSupplies: [
      {
        item: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, "Quantity cannot be negative"],
        },
        unit: {
          type: String,
          required: true,
          trim: true,
        },
        expirationDate: Date,
        minimumStock: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Assigned crew
    assignedCrew: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["driver", "paramedic", "emt", "nurse", "doctor"],
          required: true,
        },
        certificationLevel: {
          type: String,
          enum: ["basic", "intermediate", "advanced", "paramedic"],
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Current location and status
    currentLocation: {
      lat: {
        type: Number,
        min: [-90, "Invalid latitude"],
        max: [90, "Invalid latitude"],
      },
      lng: {
        type: Number,
        min: [-180, "Invalid longitude"],
        max: [180, "Invalid longitude"],
      },
      address: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },

    // Status tracking
    status: {
      type: String,
      enum: [
        "available", // Ready for dispatch
        "dispatched", // Assigned to emergency
        "en_route_to_patient", // Going to pick up patient
        "on_scene", // At patient location
        "en_route_to_hospital", // Transporting patient
        "at_hospital", // Arrived at hospital
        "out_of_service", // Maintenance, refueling, etc.
        "offline", // Not in service
      ],
      default: "offline",
    },

    // Current assignment
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },

    currentEmergency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Emergency",
    },

    assignedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    // Service area
    serviceArea: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
      },
      coordinates: {
        type: [[[Number]]], // GeoJSON Polygon format
        default: undefined,
      },
    },

    baseLocation: {
      lat: {
        type: Number,
        required: [true, "Base latitude is required"],
        min: [-90, "Invalid latitude"],
        max: [90, "Invalid latitude"],
      },
      lng: {
        type: Number,
        required: [true, "Base longitude is required"],
        min: [-180, "Invalid longitude"],
        max: [180, "Invalid longitude"],
      },
      address: {
        type: String,
        required: [true, "Base address is required"],
        trim: true,
      },
    },

    // Vehicle maintenance
    maintenance: {
      lastService: Date,
      nextService: Date,
      mileage: {
        type: Number,
        min: [0, "Mileage cannot be negative"],
      },
      fuelLevel: {
        type: Number,
        min: [0, "Fuel level cannot be negative"],
        max: [100, "Fuel level cannot exceed 100%"],
      },
      batteryLevel: {
        type: Number,
        min: [0, "Battery level cannot be negative"],
        max: [100, "Battery level cannot exceed 100%"],
      },
    },

    // Insurance and registration
    insurance: {
      provider: String,
      policyNumber: String,
      expirationDate: Date,
    },

    registration: {
      number: String,
      expirationDate: Date,
    },

    // Communication
    radioCallSign: {
      type: String,
      trim: true,
      uppercase: true,
    },

    communicationEquipment: [
      {
        type: {
          type: String,
          enum: ["radio", "cellular", "satellite", "gps"],
        },
        model: String,
        serialNumber: String,
        status: {
          type: String,
          enum: ["operational", "needs_repair", "out_of_service"],
          default: "operational",
        },
      },
    ],

    // Performance metrics
    metrics: {
      totalCalls: {
        type: Number,
        default: 0,
      },
      totalMiles: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number, // in minutes
        default: 0,
      },
      lastCallCompleted: Date,
    },

    // Administrative
    isActive: {
      type: Boolean,
      default: true,
    },

    notes: [
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
          enum: ["maintenance", "incident", "inspection", "general"],
          default: "general",
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
ambulanceSchema.index({ status: 1 });
// vehicleNumber index already created by unique: true in schema
ambulanceSchema.index({ currentLocation: "2dsphere" });
ambulanceSchema.index({ "assignedCrew.userId": 1 });
ambulanceSchema.index({ currentPatient: 1 });
ambulanceSchema.index({ isActive: 1, status: 1 });

// Virtual for display name
ambulanceSchema.virtual("displayName").get(function () {
  return `${this.vehicleNumber} (${this.make} ${this.model})`;
});

// Virtual for crew count
ambulanceSchema.virtual("crewCount").get(function () {
  return this.assignedCrew ? this.assignedCrew.length : 0;
});

// Method to update location
ambulanceSchema.methods.updateLocation = function (lat, lng, address = null) {
  this.currentLocation = {
    lat,
    lng,
    address,
    timestamp: new Date(),
  };
  return this.save();
};

// Method to update status
ambulanceSchema.methods.updateStatus = function (newStatus) {
  const oldStatus = this.status;
  this.status = newStatus;

  // Update metrics based on status changes
  if (oldStatus === "dispatched" && newStatus === "available") {
    this.metrics.totalCalls += 1;
    this.metrics.lastCallCompleted = new Date();
  }

  return this.save();
};

// Method to assign crew
ambulanceSchema.methods.assignCrew = function (
  userId,
  role,
  certificationLevel = null
) {
  // Remove user if already assigned
  this.assignedCrew = this.assignedCrew.filter(
    (member) => !member.userId.equals(userId)
  );

  // Add new assignment
  this.assignedCrew.push({
    userId,
    role,
    certificationLevel,
    assignedAt: new Date(),
  });

  return this.save();
};

// Method to remove crew member
ambulanceSchema.methods.removeCrew = function (userId) {
  this.assignedCrew = this.assignedCrew.filter(
    (member) => !member.userId.equals(userId)
  );
  return this.save();
};

// Method to check if available for dispatch
ambulanceSchema.methods.isAvailableForDispatch = function () {
  return (
    this.isActive &&
    this.status === "available" &&
    this.assignedCrew.length > 0 &&
    (!this.maintenance.nextService || this.maintenance.nextService > new Date())
  );
};

// Static method to find nearby ambulances
ambulanceSchema.statics.findNearby = function (lat, lng, maxDistance = 50000) {
  // 50km default
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance,
      },
    },
    status: "available",
    isActive: true,
  });
};

const Ambulance = mongoose.model("Ambulance", ambulanceSchema);

export default Ambulance;
