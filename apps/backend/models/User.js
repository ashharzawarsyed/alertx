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
        required: function () {
          return this.role === USER_ROLES.PATIENT;
        },
        min: [-90, "Invalid latitude"],
        max: [90, "Invalid latitude"],
      },
      lng: {
        type: Number,
        required: function () {
          return this.role === USER_ROLES.PATIENT;
        },
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

    // For hospital staff
    hospitalInfo: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: function () {
          return this.role === USER_ROLES.HOSPITAL_STAFF;
        },
      },
      position: {
        type: String,
        required: function () {
          return this.role === USER_ROLES.HOSPITAL_STAFF;
        },
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

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
  return user;
};

export default mongoose.model("User", userSchema);
