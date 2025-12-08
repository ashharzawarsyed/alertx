import Patient from "../models/Patient.js";
import Ambulance from "../models/Ambulance.js";
import { RESPONSE_CODES } from "../utils/constants.js";

/**
 * Get all patients for a hospital (query param version)
 */
const getAllHospitalPatients = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    // Validate hospital ID
    if (!hospitalId || hospitalId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    console.log(`📋 [PATIENTS] Fetching all patients for hospital: ${hospitalId}`);

    // Get all patients for the hospital (admitted, incoming, etc.)
    const patients = await Patient.find({
      hospitalId,
      status: { $in: ["admitted", "incoming", "en-route", "in-treatment"] },
    })
      .populate("ambulanceId", "vehicleNumber status currentLocation")
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ [PATIENTS] Found ${patients.length} patients for hospital ${hospitalId}`);

    res.json({
      success: true,
      message: "Hospital patients retrieved successfully",
      data: {
        patients,
        total: patients.length,
        admitted: patients.filter(p => p.status === "admitted").length,
        incoming: patients.filter(p => p.status === "incoming" || p.status === "en-route").length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [PATIENTS] Error fetching hospital patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospital patients",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Get all incoming patients for a hospital
 */
const getIncomingPatients = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    // Validate hospital ID
    if (!hospitalId || hospitalId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    // Get incoming patients for the hospital
    const patients = await Patient.find({
      hospitalId,
      status: { $in: ["incoming", "en-route"] },
    })
      .populate("ambulanceId", "vehicleNumber status currentLocation")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      message: "Incoming patients retrieved successfully",
      data: patients,
      count: patients.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching incoming patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incoming patients",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Create a new incoming patient
 */
const createIncomingPatient = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const patientData = req.body;

    // Validate required fields
    const requiredFields = [
      "name",
      "age",
      "gender",
      "emergencyType",
      "condition",
    ];
    const missingFields = requiredFields.filter((field) => !patientData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        code: RESPONSE_CODES.VALIDATION_ERROR,
      });
    }

    // Create new patient
    const patient = new Patient({
      ...patientData,
      hospitalId,
      status: "incoming",
    });

    // Set estimated arrival time (random between 5-30 minutes)
    const estimatedMinutes = Math.floor(Math.random() * 25) + 5;
    patient.estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000);

    // Auto-assign priority based on emergency type
    const priorityMap = {
      Critical: 5,
      High: 4,
      Medium: 3,
      Low: 2,
    };
    patient.priority = priorityMap[patient.emergencyType] || 3;

    await patient.save();

    // Populate ambulance data if assigned
    await patient.populate(
      "ambulanceId",
      "vehicleNumber status currentLocation"
    );

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create patient",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Update patient status
 */
const updatePatientStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, actualArrival, vitals, notes } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      {
        status,
        actualArrival,
        vitals,
        notes,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("ambulanceId", "vehicleNumber status");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
        code: RESPONSE_CODES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      message: "Patient status updated successfully",
      data: patient,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating patient status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update patient status",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Get patient by ID
 */
const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate("ambulanceId", "vehicleNumber status currentLocation crew")
      .populate("hospitalId", "name");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
        code: RESPONSE_CODES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

/**
 * Get critical alerts for hospital
 */
const getCriticalAlerts = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    // Get critical patients
    const criticalPatients = await Patient.find({
      hospitalId,
      emergencyType: "Critical",
      status: { $in: ["incoming", "en-route"] },
    })
      .populate("ambulanceId", "vehicleNumber status")
      .sort({ createdAt: -1 });

    // Format alerts
    const alerts = criticalPatients.map((patient) => ({
      id: patient._id,
      type: "critical_patient",
      title: `Critical Patient: ${patient.name}`,
      message: `${patient.condition} - ETA: ${patient.estimatedArrival ? new Date(patient.estimatedArrival).toLocaleTimeString() : "Unknown"}`,
      severity: "critical",
      timestamp: patient.createdAt,
      patientId: patient._id,
      ambulanceId: patient.ambulanceId?._id,
    }));

    res.json({
      success: true,
      message: "Critical alerts retrieved successfully",
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching critical alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch critical alerts",
      error: error.message,
      code: RESPONSE_CODES.SERVER_ERROR,
    });
  }
};

export default {
  getAllHospitalPatients,
  getIncomingPatients,
  createIncomingPatient,
  updatePatientStatus,
  getPatientById,
  getCriticalAlerts,
};
