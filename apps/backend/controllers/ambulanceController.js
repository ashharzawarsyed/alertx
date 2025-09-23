import Ambulance from "../models/Ambulance.js";
import Patient from "../models/Patient.js";
import { RESPONSE_CODES } from "../utils/constants.js";

/**
 * Get ambulance fleet for a hospital
 */
const getAmbulanceFleet = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId || hospitalId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    const ambulances = await Ambulance.find({ hospitalId })
      .populate("currentPatientId", "name condition emergencyType")
      .sort({ vehicleNumber: 1 });

    res.json({
      success: true,
      message: "Ambulance fleet retrieved successfully",
      data: ambulances,
      count: ambulances.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching ambulance fleet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ambulance fleet",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Create a new ambulance
 */
const createAmbulance = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const ambulanceData = req.body;

    const requiredFields = ["vehicleNumber", "type"];
    const missingFields = requiredFields.filter(
      (field) => !ambulanceData[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    // Check if vehicle number already exists
    const existingAmbulance = await Ambulance.findOne({
      vehicleNumber: ambulanceData.vehicleNumber,
    });

    if (existingAmbulance) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already exists",
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    const ambulance = new Ambulance({
      ...ambulanceData,
      hospitalId,
      status: "available",
    });

    await ambulance.save();

    res.status(201).json({
      success: true,
      message: "Ambulance created successfully",
      data: ambulance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating ambulance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ambulance",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Update ambulance status
 */
const updateAmbulanceStatus = async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const { status, currentLocation, fuelLevel, currentPatientId } = req.body;

    const ambulance = await Ambulance.findByIdAndUpdate(
      ambulanceId,
      {
        status,
        currentLocation,
        fuelLevel,
        currentPatientId,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("currentPatientId", "name condition emergencyType");

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
        code: RESPONSE_CODES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      message: "Ambulance status updated successfully",
      data: ambulance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating ambulance status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ambulance status",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Dispatch ambulance to patient
 */
const dispatchAmbulance = async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const { patientId, estimatedArrival } = req.body;

    // Find available ambulance
    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
        code: RESPONSE_CODES.NOT_FOUND,
      });
    }

    if (ambulance.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Ambulance is not available for dispatch",
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    // Find patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
        code: RESPONSE_CODES.NOT_FOUND,
      });
    }

    // Update ambulance status
    ambulance.status = "dispatched";
    ambulance.currentPatientId = patientId;
    ambulance.totalTrips += 1;
    await ambulance.save();

    // Update patient with ambulance assignment
    patient.ambulanceId = ambulanceId;
    patient.status = "en-route";
    if (estimatedArrival) {
      patient.estimatedArrival = new Date(estimatedArrival);
    }
    await patient.save();

    // Populate data for response
    await ambulance.populate(
      "currentPatientId",
      "name condition emergencyType"
    );

    res.json({
      success: true,
      message: "Ambulance dispatched successfully",
      data: {
        ambulance,
        patient,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error dispatching ambulance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dispatch ambulance",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Get ambulance by ID
 */
const getAmbulanceById = async (req, res) => {
  try {
    const { ambulanceId } = req.params;

    const ambulance = await Ambulance.findById(ambulanceId)
      .populate(
        "currentPatientId",
        "name condition emergencyType estimatedArrival"
      )
      .populate("hospitalId", "name");

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
        code: RESPONSE_CODES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      message: "Ambulance retrieved successfully",
      data: ambulance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching ambulance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ambulance",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Get available ambulances
 */
const getAvailableAmbulances = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const ambulances = await Ambulance.find({
      hospitalId,
      status: "available",
      fuelLevel: { $gt: 10 }, // Only ambulances with more than 10% fuel
    }).sort({ vehicleNumber: 1 });

    res.json({
      success: true,
      message: "Available ambulances retrieved successfully",
      data: ambulances,
      count: ambulances.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching available ambulances:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available ambulances",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

export default {
  getAmbulanceFleet,
  createAmbulance,
  updateAmbulanceStatus,
  dispatchAmbulance,
  getAmbulanceById,
  getAvailableAmbulances,
};
