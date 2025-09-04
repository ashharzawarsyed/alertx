import mongoose from "mongoose";
import { TRIP_STATUS } from "../utils/constants.js";

const tripSchema = new mongoose.Schema(
  {
    // Related emergency
    emergency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Emergency",
      required: [true, "Emergency ID is required"],
    },

    // Trip participants
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Driver ID is required"],
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
    },

    // Trip status
    status: {
      type: String,
      enum: Object.values(TRIP_STATUS),
      default: TRIP_STATUS.STARTED,
    },

    // Locations
    pickupLocation: {
      lat: {
        type: Number,
        required: [true, "Pickup latitude is required"],
      },
      lng: {
        type: Number,
        required: [true, "Pickup longitude is required"],
      },
      address: String,
    },

    hospitalLocation: {
      lat: {
        type: Number,
        required: [true, "Hospital latitude is required"],
      },
      lng: {
        type: Number,
        required: [true, "Hospital longitude is required"],
      },
      address: String,
    },

    // Real-time tracking
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },

    // Route information
    route: {
      distance: Number, // in kilometers
      estimatedTime: Number, // in minutes
      actualTime: Number, // in minutes
    },

    // Trip timeline
    timestamps: {
      started: {
        type: Date,
        default: Date.now,
      },
      driverEnRoute: Date,
      arrivedAtPickup: Date,
      patientPickedUp: Date,
      enRouteToHospital: Date,
      arrivedAtHospital: Date,
      completed: Date,
    },

    // Location tracking history
    locationHistory: [
      {
        lat: Number,
        lng: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        speed: Number, // km/h
        heading: Number, // degrees
      },
    ],

    // Trip details
    ambulanceDetails: {
      vehicleNumber: String,
      driverName: String,
      driverPhone: String,
    },

    // Patient condition updates during trip
    patientUpdates: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        condition: {
          type: String,
          enum: ["stable", "improving", "worsening", "critical"],
        },
        vitals: {
          heartRate: Number,
          bloodPressure: String,
          temperature: Number,
          oxygenSaturation: Number,
        },
        notes: String,
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Communication logs
    communications: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["call", "message", "status_update"],
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
      },
    ],

    // Trip completion details
    completion: {
      handoverTime: Date,
      handoverNotes: String,
      hospitalStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      patientCondition: String,
    },

    // Rating and feedback
    rating: {
      patientRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      hospitalRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
tripSchema.index({ driver: 1, createdAt: -1 });
tripSchema.index({ patient: 1, createdAt: -1 });
tripSchema.index({ hospital: 1, createdAt: -1 });
tripSchema.index({ status: 1, createdAt: -1 });
tripSchema.index({ emergency: 1 });

// Virtual for trip duration
tripSchema.virtual("duration").get(function () {
  if (this.timestamps.completed && this.timestamps.started) {
    return Math.round(
      (this.timestamps.completed - this.timestamps.started) / (1000 * 60)
    );
  }
  return null;
});

// Virtual for pickup time
tripSchema.virtual("pickupDuration").get(function () {
  if (this.timestamps.arrivedAtPickup && this.timestamps.started) {
    return Math.round(
      (this.timestamps.arrivedAtPickup - this.timestamps.started) / (1000 * 60)
    );
  }
  return null;
});

// Method to update trip status
tripSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;

  switch (newStatus) {
    case TRIP_STATUS.PICKING_UP:
      this.timestamps.driverEnRoute = new Date();
      break;
    case TRIP_STATUS.PATIENT_PICKED:
      this.timestamps.patientPickedUp = new Date();
      break;
    case TRIP_STATUS.EN_ROUTE_HOSPITAL:
      this.timestamps.enRouteToHospital = new Date();
      break;
    case TRIP_STATUS.ARRIVED_HOSPITAL:
      this.timestamps.arrivedAtHospital = new Date();
      break;
    case TRIP_STATUS.COMPLETED:
      this.timestamps.completed = new Date();
      if (this.route && this.timestamps.started) {
        this.route.actualTime = Math.round(
          (new Date() - this.timestamps.started) / (1000 * 60)
        );
      }
      break;
  }

  return this.save();
};

// Method to update current location
tripSchema.methods.updateLocation = function (
  lat,
  lng,
  speed = null,
  heading = null
) {
  this.currentLocation = {
    lat,
    lng,
    timestamp: new Date(),
  };

  // Add to location history
  this.locationHistory.push({
    lat,
    lng,
    timestamp: new Date(),
    speed,
    heading,
  });

  // Keep only last 100 location points to prevent document from growing too large
  if (this.locationHistory.length > 100) {
    this.locationHistory = this.locationHistory.slice(-100);
  }

  return this.save();
};

// Method to add patient update
tripSchema.methods.addPatientUpdate = function (
  condition,
  vitals,
  notes,
  reportedBy
) {
  this.patientUpdates.push({
    condition,
    vitals,
    notes,
    reportedBy,
    timestamp: new Date(),
  });

  return this.save();
};

export default mongoose.model("Trip", tripSchema);
