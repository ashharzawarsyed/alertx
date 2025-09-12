import Emergency from "../models/Emergency.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Trip from "../models/Trip.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse, calculateDistance } from "../utils/helpers.js";
import aiTriageService from "../services/aiTriageService.js";
import {
  RESPONSE_CODES,
  EMERGENCY_STATUS,
  USER_ROLES,
  DRIVER_STATUS,
  DISTANCE_LIMITS,
  SEVERITY_LEVELS,
} from "../utils/constants.js";

/**
 * @desc    Create emergency request
 * @route   POST /api/v1/emergencies
 * @access  Private (Patient)
 */
export const createEmergency = asyncHandler(async (req, res) => {
  try {
    console.log(
      "🚨 createEmergency called with body:",
      JSON.stringify(req.body, null, 2)
    );

    const { symptoms, description, location } = req.body;

    // Verify user is a patient
    if (req.user.role !== USER_ROLES.PATIENT) {
      console.log("❌ User role check failed:", req.user.role);
      return sendResponse(
        res,
        RESPONSE_CODES.FORBIDDEN,
        "Only patients can create emergency requests"
      );
    }

    // Check if patient has any active emergency
    const activeEmergency = await Emergency.findOne({
      patient: req.user.id,
      status: {
        $in: [
          EMERGENCY_STATUS.PENDING,
          EMERGENCY_STATUS.ACCEPTED,
          EMERGENCY_STATUS.IN_PROGRESS,
        ],
      },
    });

    if (activeEmergency) {
      return sendResponse(
        res,
        RESPONSE_CODES.CONFLICT,
        "You already have an active emergency request"
      );
    }

    // Get patient's medical profile for AI analysis context
    console.log("📋 Getting patient medical profile...");
    const patient = await User.findById(req.user.id);
    const patientInfo = {
      age: patient.medicalProfile?.basicInfo?.age,
      chronicConditions: patient.medicalProfile?.conditions?.chronic || [],
      allergies: patient.medicalProfile?.allergies || [],
      medications: patient.medicalProfile?.medications?.current || [],
    };
    console.log("👤 Patient info prepared:", patientInfo);

    // Analyze symptoms with AI service
    console.log("🚨 Emergency request received, analyzing symptoms...");
    // Convert symptoms array to string for AI analysis
    const symptomsText = Array.isArray(symptoms)
      ? symptoms.join(", ")
      : symptoms;

    let analysis;
    let aiResult;

    try {
      aiResult = await aiTriageService.analyzeSymptoms(
        symptomsText,
        patientInfo
      );

      if (!aiResult.success || !aiResult.analysis) {
        console.error("❌ AI analysis failed, using fallback classification");
        analysis = {
          severity: SEVERITY_LEVELS.MEDIUM,
          confidence: 60,
          detectedSymptoms: [symptomsText],
          recommendations: ["Seek medical attention"],
          analysisDetails: {
            source: "fallback",
            note: "AI service unavailable",
          },
        };
      } else {
        // The AI service returns nested analysis: aiResult.analysis.analysis
        analysis = aiResult.analysis.analysis || aiResult.analysis;
        console.log(
          "✅ AI analysis successful:",
          analysis.severity,
          `(${analysis.confidence}%)`
        );
      }
    } catch (error) {
      console.error("❌ AI service error:", error.message);
      // Fallback analysis when AI service fails
      analysis = {
        severity: SEVERITY_LEVELS.MEDIUM,
        confidence: 50,
        detectedSymptoms: [symptomsText],
        recommendations: ["Seek medical attention"],
        analysisDetails: {
          source: "fallback",
          error: error.message,
        },
      };
    }

    const priority = aiTriageService.calculatePriority(
      analysis.severity,
      patientInfo
    );

    // Ensure valid numeric values for database
    const triageScore =
      analysis.confidence && !isNaN(analysis.confidence)
        ? Math.round((analysis.confidence / 100) * 10)
        : 5; // Default to medium score if confidence is invalid

    const aiConfidence =
      analysis.confidence && !isNaN(analysis.confidence)
        ? analysis.confidence / 100
        : 0.5; // Default to 50% confidence

    // Create emergency record with AI analysis
    const emergency = await Emergency.create({
      patient: req.user.id,
      symptoms: symptoms, // Keep as array as expected by the model
      description,
      location,
      status: EMERGENCY_STATUS.PENDING,
      severityLevel: analysis.severity || SEVERITY_LEVELS.MEDIUM,
      triageScore: triageScore,
      aiPrediction: {
        confidence: aiConfidence,
        suggestedSpecialty: analysis.suggestedSpecialty || "Emergency Medicine",
        estimatedTime: analysis.estimatedTime || 30, // Default 30 minutes
      },
    });

    // Store detailed AI analysis in notes for reference
    try {
      const detectedSymptoms = analysis.detectedSymptoms || [];
      const recommendations = analysis.recommendations || [
        "Seek medical attention",
      ];

      const noteText = `AI Analysis - Detected: ${
        Array.isArray(detectedSymptoms)
          ? detectedSymptoms.join(", ")
          : detectedSymptoms
      }. Recommendations: ${
        Array.isArray(recommendations)
          ? recommendations.join("; ")
          : recommendations
      }`;

      await emergency.addNote(noteText, req.user.id);
    } catch (noteError) {
      console.error("❌ Failed to add AI analysis note:", noteError.message);
      // Don't fail the entire request if note fails
    }

    console.log(
      `✅ Emergency created with ${analysis.severity} severity (confidence: ${analysis.confidence}%)`
    );

    // TODO: Start ambulance dispatch process based on severity
    // if (analysis.severity === SEVERITY_LEVELS.CRITICAL) {
    //   await dispatchCriticalEmergency(emergency);
    // }

    // TODO: Notify emergency contacts based on severity
    // await notifyEmergencyContacts(emergency, analysis.severity);

    await emergency.populate("patient", "name phone location");

    sendResponse(
      res,
      RESPONSE_CODES.CREATED,
      "Emergency request created and analyzed successfully",
      {
        emergency,
        aiAnalysis: {
          severity: analysis.severity,
          confidence: analysis.confidence,
          priority,
          detectedSymptoms: analysis.detectedSymptoms,
          recommendations: analysis.recommendations,
        },
      }
    );
  } catch (error) {
    console.error("❌ Critical error in createEmergency:", error);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal server error during emergency creation",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
});

/**
 * @desc    Emergency button - Create critical emergency without AI analysis
 * @route   POST /api/v1/emergencies/emergency-button
 * @access  Private (Patient)
 */
export const emergencyButton = asyncHandler(async (req, res) => {
  const { location, notes } = req.body;

  // Verify user is a patient
  if (req.user.role !== USER_ROLES.PATIENT) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only patients can trigger emergency button"
    );
  }

  // Check if patient has any active emergency
  const activeEmergency = await Emergency.findOne({
    patient: req.user.id,
    status: {
      $in: [
        EMERGENCY_STATUS.PENDING,
        EMERGENCY_STATUS.ACCEPTED,
        EMERGENCY_STATUS.IN_PROGRESS,
      ],
    },
  });

  if (activeEmergency) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "You already have an active emergency request"
    );
  }

  console.log("🆘 EMERGENCY BUTTON ACTIVATED for user:", req.user.id);

  // Create critical emergency immediately without AI analysis
  const emergency = await Emergency.create({
    patient: req.user.id,
    symptoms: ["Emergency button activated"],
    description:
      notes || "Emergency button pressed - immediate assistance required",
    location,
    status: EMERGENCY_STATUS.PENDING,
    severityLevel: SEVERITY_LEVELS.CRITICAL,
    triageScore: 10, // Maximum urgency
    aiPrediction: {
      confidence: 1.0,
      suggestedSpecialty: "Emergency Medicine",
      estimatedTime: 5, // 5 minutes for critical emergency
    },
  });

  // Add emergency button note
  await emergency.addNote(
    "EMERGENCY BUTTON ACTIVATED - Immediate critical response required",
    req.user.id
  );

  console.log("🚨 Critical emergency created via emergency button");

  // TODO: Immediately dispatch nearest ambulance
  // await dispatchCriticalEmergency(emergency);

  // TODO: Notify all emergency contacts immediately
  // await notifyAllEmergencyContacts(emergency);

  // TODO: Alert emergency services
  // await alertEmergencyServices(emergency);

  await emergency.populate("patient", "name phone location");

  sendResponse(
    res,
    RESPONSE_CODES.CREATED,
    "Emergency alert sent - help is on the way",
    {
      emergency,
      message: "Critical emergency response initiated",
      estimatedResponse: "5-10 minutes",
    }
  );
});

/**
 * @desc    Get all emergencies (with filters)
 * @route   GET /api/v1/emergencies
 * @access  Private
 */
export const getEmergencies = asyncHandler(async (req, res) => {
  const { status, severity, page = 1, limit = 10 } = req.query;

  // Build filter based on user role
  let filter = {};

  if (req.user.role === USER_ROLES.PATIENT) {
    filter.patient = req.user.id;
  } else if (req.user.role === USER_ROLES.DRIVER) {
    filter.assignedDriver = req.user.id;
  } else if (req.user.role === USER_ROLES.HOSPITAL_STAFF) {
    const user = await User.findById(req.user.id).populate(
      "hospitalInfo.hospitalId"
    );
    if (user.hospitalInfo && user.hospitalInfo.hospitalId) {
      filter.assignedHospital = user.hospitalInfo.hospitalId._id;
    }
  }

  // Add additional filters
  if (status) filter.status = status;
  if (severity) filter.severityLevel = severity;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "patient", select: "name phone" },
      { path: "assignedDriver", select: "name phone driverInfo" },
      { path: "assignedHospital", select: "name address contactNumber" },
    ],
  };

  const emergencies = await Emergency.paginate(filter, options);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Emergencies retrieved successfully",
    {
      emergencies: emergencies.docs,
      pagination: {
        currentPage: emergencies.page,
        totalPages: emergencies.totalPages,
        totalItems: emergencies.totalDocs,
        hasNext: emergencies.hasNextPage,
        hasPrev: emergencies.hasPrevPage,
      },
    }
  );
});

/**
 * @desc    Get emergency by ID
 * @route   GET /api/v1/emergencies/:id
 * @access  Private
 */
export const getEmergency = asyncHandler(async (req, res) => {
  const emergency = await Emergency.findById(req.params.id)
    .populate("patient", "name phone location")
    .populate("assignedDriver", "name phone driverInfo")
    .populate("assignedHospital", "name address contactNumber location")
    .populate("trip")
    .populate("notes.addedBy", "name role");

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  // Check access permissions
  const hasAccess =
    req.user.role === USER_ROLES.ADMIN ||
    emergency.patient.toString() === req.user.id ||
    emergency.assignedDriver?.toString() === req.user.id ||
    (req.user.role === USER_ROLES.HOSPITAL_STAFF &&
      emergency.assignedHospital?.toString() ===
        req.user.hospitalInfo?.hospitalId?.toString());

  if (!hasAccess) {
    return sendResponse(res, RESPONSE_CODES.FORBIDDEN, "Access denied");
  }

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Emergency details retrieved", {
    emergency,
  });
});

/**
 * @desc    Accept emergency (Driver)
 * @route   PUT /api/v1/emergencies/:id/accept
 * @access  Private (Driver)
 */
export const acceptEmergency = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only drivers can accept emergencies"
    );
  }

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  if (emergency.status !== EMERGENCY_STATUS.PENDING) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Emergency is not available for acceptance"
    );
  }

  // Check if driver is available
  const driver = await User.findById(req.user.id);
  if (driver.driverInfo.status !== DRIVER_STATUS.AVAILABLE) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Driver is not available"
    );
  }

  // Check if driver has any active emergency
  const activeEmergency = await Emergency.findOne({
    assignedDriver: req.user.id,
    status: { $in: [EMERGENCY_STATUS.ACCEPTED, EMERGENCY_STATUS.IN_PROGRESS] },
  });

  if (activeEmergency) {
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      "Driver already has an active emergency"
    );
  }

  // Find nearest hospital with available beds
  const nearestHospital = await findNearestHospital(emergency.location);

  if (!nearestHospital) {
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "No available hospital found nearby"
    );
  }

  // Accept emergency
  emergency.assignedDriver = req.user.id;
  emergency.assignedHospital = nearestHospital._id;
  await emergency.updateStatus(EMERGENCY_STATUS.ACCEPTED);

  // Update driver status
  driver.driverInfo.status = DRIVER_STATUS.BUSY;
  await driver.save();

  // Create trip
  const trip = await Trip.create({
    emergency: emergency._id,
    driver: req.user.id,
    patient: emergency.patient,
    hospital: nearestHospital._id,
    pickupLocation: emergency.location,
    hospitalLocation: nearestHospital.location,
    ambulanceDetails: {
      vehicleNumber: driver.driverInfo.ambulanceNumber,
      driverName: driver.name,
      driverPhone: driver.phone,
    },
  });

  emergency.trip = trip._id;
  await emergency.save();

  await emergency.populate([
    { path: "patient", select: "name phone" },
    { path: "assignedHospital", select: "name address contactNumber location" },
  ]);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Emergency accepted successfully", {
    emergency,
    trip,
  });
});

/**
 * @desc    Update emergency status
 * @route   PUT /api/v1/emergencies/:id/status
 * @access  Private
 */
export const updateEmergencyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  // Check permissions
  const canUpdate =
    req.user.role === USER_ROLES.ADMIN ||
    emergency.assignedDriver?.toString() === req.user.id ||
    (req.user.role === USER_ROLES.HOSPITAL_STAFF &&
      emergency.assignedHospital?.toString() ===
        req.user.hospitalInfo?.hospitalId?.toString());

  if (!canUpdate) {
    return sendResponse(res, RESPONSE_CODES.FORBIDDEN, "Permission denied");
  }

  await emergency.updateStatus(status, req.user.id);

  // Update driver status if emergency is completed or cancelled
  if (
    status === EMERGENCY_STATUS.COMPLETED ||
    status === EMERGENCY_STATUS.CANCELLED
  ) {
    if (emergency.assignedDriver) {
      await User.findByIdAndUpdate(emergency.assignedDriver, {
        "driverInfo.status": DRIVER_STATUS.AVAILABLE,
      });
    }
  }

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Emergency status updated successfully",
    {
      emergency,
    }
  );
});

/**
 * @desc    Add note to emergency
 * @route   POST /api/v1/emergencies/:id/notes
 * @access  Private
 */
export const addNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  await emergency.addNote(note, req.user.id);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Note added successfully", {
    emergency,
  });
});

/**
 * Helper function to find nearest hospital
 */
const findNearestHospital = async (location) => {
  const hospitals = await Hospital.find({
    isActive: true,
    totalAvailableBeds: { $gt: 0 },
  });

  let nearestHospital = null;
  let minDistance = Infinity;

  for (const hospital of hospitals) {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      hospital.location.lat,
      hospital.location.lng
    );

    if (
      distance < minDistance &&
      distance <= DISTANCE_LIMITS.MAX_HOSPITAL_SEARCH_RADIUS
    ) {
      minDistance = distance;
      nearestHospital = hospital;
    }
  }

  return nearestHospital;
};
