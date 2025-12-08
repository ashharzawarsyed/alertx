import Emergency from "../models/Emergency.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Trip from "../models/Trip.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendResponse, calculateDistance } from "../utils/helpers.js";
import aiTriageService from "../services/aiTriageService.js";
import { emitToUser } from "../utils/socketHelper.js";
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
  const patientId = emergency.patient?._id?.toString() || emergency.patient?.toString();
  const driverId = emergency.assignedDriver?._id?.toString() || emergency.assignedDriver?.toString();
  const hospitalId = emergency.assignedHospital?._id?.toString() || emergency.assignedHospital?.toString();
  
  const hasAccess =
    req.user.role === USER_ROLES.ADMIN ||
    patientId === req.user.id ||
    driverId === req.user.id ||
    (req.user.role === USER_ROLES.HOSPITAL_STAFF &&
      hospitalId === req.user.hospitalInfo?.hospitalId?.toString());

  if (!hasAccess) {
    return sendResponse(res, RESPONSE_CODES.FORBIDDEN, "Access denied");
  }

  // Format response with driver contact info if assigned
  const response = {
    ...emergency.toObject(),
    driverContact: emergency.assignedDriver ? {
      name: emergency.assignedDriver.name,
      phone: emergency.assignedDriver.phone,
      vehicleNumber: emergency.assignedDriver.driverInfo?.vehicleNumber,
      ambulanceType: emergency.assignedDriver.driverInfo?.ambulanceType,
    } : null
  };

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Emergency details retrieved", {
    emergency: response,
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
  console.log(`🔍 Finding hospital for emergency at:`, emergency.location);
  const nearestHospital = await findNearestHospital(emergency.location);

  if (!nearestHospital) {
    console.error('❌ No hospital found - this should not happen. Database might be empty.');
    console.error('💡 Make sure hospitals are seeded in the database');
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "No hospitals found in system. Please contact administrator."
    );
  }

  console.log(`✅ Hospital assigned: ${nearestHospital.name}`);

  // Automatically occupy a bed for incoming emergency
  const bedType = emergency.severityLevel === SEVERITY_LEVELS.CRITICAL ? 'icu' : 'emergency';
  if (nearestHospital.availableBeds[bedType] > 0) {
    nearestHospital.availableBeds[bedType] -= 1;
    nearestHospital.lastBedUpdate = new Date();
    await nearestHospital.save();
    console.log(`🛏️ Auto-occupied ${bedType} bed for emergency ${emergency._id}`);

    // Emit bed update via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`hospital:${nearestHospital._id}`).emit('bed:updated', {
        hospitalId: nearestHospital._id,
        availableBeds: nearestHospital.availableBeds,
        bedType,
        action: 'occupied',
        emergencyId: emergency._id,
        lastBedUpdate: nearestHospital.lastBedUpdate,
      });
    }
  }

  // Accept emergency
  emergency.assignedDriver = req.user.id;
  emergency.assignedHospital = nearestHospital._id;
  emergency.reservedBedType = bedType; // Store which bed type was reserved
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
    { path: "assignedDriver", select: "name phone driverInfo" },
    { path: "assignedHospital", select: "name address contactNumber location" },
  ]);

  // Notify patient via socket that driver accepted emergency
  const { emitToUser } = await import("../utils/socketHelper.js");
  emitToUser(emergency.patient._id.toString(), "emergency:accepted", {
    emergencyId: emergency._id,
    driver: {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      ambulanceNumber: driver.driverInfo.ambulanceNumber,
      licenseNumber: driver.driverInfo.licenseNumber,
    },
    hospital: {
      id: nearestHospital._id,
      name: nearestHospital.name,
      address: nearestHospital.address,
    },
    status: EMERGENCY_STATUS.ACCEPTED,
    timestamp: new Date(),
  });

  // Notify hospital about incoming emergency
  const io = req.app.get('io');
  if (io) {
    io.to(`hospital:${nearestHospital._id}`).emit('emergency:incoming', {
      emergency: {
        id: emergency._id,
        patient: emergency.patient,
        symptoms: emergency.symptoms,
        severity: emergency.severityLevel,
        triageScore: emergency.triageScore,
        location: emergency.location,
        estimatedArrival: '15-20 minutes', // You can calculate this based on distance
      },
      driver: {
        name: driver.name,
        phone: driver.phone,
        ambulanceNumber: driver.driverInfo.ambulanceNumber,
      },
      reservedBedType: bedType,
      timestamp: new Date(),
    });
  }

  console.log(`✅ Emergency ${emergency._id} accepted by driver ${driver.name}`);
  console.log(`📡 Socket notification sent to patient ${emergency.patient._id}`);
  console.log(`🏥 Hospital ${nearestHospital.name} notified of incoming emergency`);

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

  // Update driver status and release bed if emergency is completed or cancelled
  if (
    status === EMERGENCY_STATUS.COMPLETED ||
    status === EMERGENCY_STATUS.CANCELLED
  ) {
    if (emergency.assignedDriver) {
      await User.findByIdAndUpdate(emergency.assignedDriver, {
        "driverInfo.status": DRIVER_STATUS.AVAILABLE,
      });
    }

    // Release reserved bed if it was occupied
    if (emergency.assignedHospital && emergency.reservedBedType) {
      const hospital = await Hospital.findById(emergency.assignedHospital);
      if (hospital) {
        const bedType = emergency.reservedBedType;
        
        // Only release if not manually managed (can add a flag for this later)
        if (status === EMERGENCY_STATUS.CANCELLED) {
          // Auto-release on cancellation
          hospital.availableBeds[bedType] = (hospital.availableBeds[bedType] || 0) + 1;
          hospital.lastBedUpdate = new Date();
          await hospital.save();
          
          console.log(`🛏️ Auto-released ${bedType} bed for cancelled emergency ${emergency._id}`);
          
          // Emit bed update via socket
          const io = req.app.get('io');
          if (io) {
            io.to(`hospital:${hospital._id}`).emit('bed:updated', {
              hospitalId: hospital._id,
              availableBeds: hospital.availableBeds,
              bedType,
              action: 'released',
              reason: 'emergency_cancelled',
              emergencyId: emergency._id,
              lastBedUpdate: hospital.lastBedUpdate,
            });
          }
        }
        // For completed emergencies, staff will manually manage bed after patient discharge
      }
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
  console.log('🏥 Searching for hospitals near:', location);
  
  // First try to find hospitals with available beds
  let hospitals = await Hospital.find({
    isActive: true,
    totalAvailableBeds: { $gt: 0 },
  });

  console.log(`📊 Found ${hospitals.length} hospitals with available beds`);

  // If no hospitals with beds, try any active hospital
  if (hospitals.length === 0) {
    console.log('⚠️ No hospitals with available beds, searching for any active hospital');
    hospitals = await Hospital.find({ isActive: true });
    console.log(`📊 Found ${hospitals.length} active hospitals (no bed filter)`);
  }

  // If still no hospitals, try ANY hospital in the database
  if (hospitals.length === 0) {
    console.log('⚠️ No active hospitals, searching for ANY hospital');
    hospitals = await Hospital.find({});
    console.log(`📊 Found ${hospitals.length} total hospitals in database`);
  }

  // If absolutely no hospitals exist
  if (hospitals.length === 0) {
    console.error('❌ No hospitals found in database at all');
    return null;
  }

  // Find the nearest hospital
  let nearestHospital = null;
  let minDistance = Infinity;

  for (const hospital of hospitals) {
    if (!hospital.location || !hospital.location.lat || !hospital.location.lng) {
      console.warn(`⚠️ Hospital ${hospital.name} has invalid location data`);
      continue;
    }

    const distance = calculateDistance(
      location.lat,
      location.lng,
      hospital.location.lat,
      hospital.location.lng
    );

    console.log(`📍 Distance to ${hospital.name}: ${distance.toFixed(2)} km`);

    if (distance < minDistance) {
      minDistance = distance;
      nearestHospital = hospital;
    }
  }

  if (nearestHospital) {
    console.log(`✅ Nearest hospital: ${nearestHospital.name} (${minDistance.toFixed(2)} km away)`);
  } else {
    console.error('❌ Could not find any hospital with valid location');
  }

  return nearestHospital;
};

/**
 * @desc    Dispatch intelligent ambulance based on AI triage analysis
 * @route   POST /api/v1/emergencies/dispatch-intelligent
 * @access  Private (Patient)
 */
export const dispatchIntelligentAmbulance = asyncHandler(async (req, res) => {
  try {
    console.log(
      "🤖 Intelligent ambulance dispatch called:",
      JSON.stringify(req.body, null, 2)
    );

    const { triageResult, location, symptoms, description, severityLevel, nlpAnalysis } = req.body;
    
    console.log('🔍 Validation - triageResult type:', typeof triageResult);
    console.log('🔍 Validation - triageResult.confidence:', triageResult?.confidence);
    console.log('🔍 Validation - location:', location);

    // Validate required fields
    if (!triageResult || !location) {
      return sendResponse(
        res,
        RESPONSE_CODES.BAD_REQUEST,
        "Triage result and location are required"
      );
    }

    // Ensure triageResult has minimum required structure
    if (!triageResult || typeof triageResult !== 'object') {
      console.error('❌ Invalid triageResult structure:', triageResult);
      return sendResponse(
        res,
        RESPONSE_CODES.BAD_REQUEST,
        "Invalid triage result: triageResult must be an object"
      );
    }
    
    // Validate confidence exists and is a number (can be 0-100 or 0-1)
    const confidence = triageResult.confidence;
    if (confidence === undefined || confidence === null) {
      console.error('❌ Missing confidence value in triageResult');
      return sendResponse(
        res,
        RESPONSE_CODES.BAD_REQUEST,
        "Invalid triage result: missing confidence value"
      );
    }

    // Verify user is a patient
    if (req.user.role !== USER_ROLES.PATIENT) {
      return sendResponse(
        res,
        RESPONSE_CODES.FORBIDDEN,
        "Only patients can request ambulance dispatch"
      );
    }

    // Check for active emergency
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

    // Create emergency with AI analysis
    // Convert confidence from percentage (0-100) to decimal (0-1) and triageScore to 0-10 scale
    const confidenceDecimal = (triageResult?.confidence || 0) / 100;
    const triageScoreValue = Math.min(Math.round(confidenceDecimal * 10), 10);
    
    // Safe extraction of detected symptoms and emergency type
    const detectedSymptoms = triageResult?.detectedSymptoms || [];
    const emergencyType = triageResult?.emergencyType || 'general';
    const severity = triageResult?.severity || 'medium';
    
    const emergency = await Emergency.create({
      patient: req.user.id,
      symptoms: symptoms || detectedSymptoms.map(s => s?.keyword || s).filter(Boolean),
      description: description || `AI-analyzed: ${emergencyType} (${severity} severity)`,
      severityLevel: severityLevel || severity,
      triageScore: triageScoreValue,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || 'Unknown location',
      },
      status: EMERGENCY_STATUS.PENDING,
      requestTime: new Date(),
      aiPrediction: {
        confidence: confidenceDecimal,
        emergencyType: emergencyType,
        nlpInsights: nlpAnalysis,
        detectedSymptoms: triageResult.detectedSymptoms,
        recommendations: triageResult.recommendations,
      },
    });

    console.log("✅ Intelligent emergency created:", emergency._id);

    // Find nearest hospital
    const nearestHospital = await findNearestHospital(location);

    // Determine ambulance type based on AI analysis
    const ambulanceType = determineAmbulanceType(
      triageResult.emergencyType,
      triageResult.severity
    );

    console.log(`🚑 Required ambulance type: ${ambulanceType}`);

    // Find nearest available driver - try with ambulance type first, then without
    console.log('🔍 Searching for available drivers with criteria:', {
      role: USER_ROLES.DRIVER,
      "driverInfo.status": DRIVER_STATUS.AVAILABLE,
      "driverInfo.ambulanceType": ambulanceType,
    });

    let nearestDriver = await User.findOne({
      role: USER_ROLES.DRIVER,
      "driverInfo.status": DRIVER_STATUS.AVAILABLE,
      "driverInfo.ambulanceType": ambulanceType,
    });

    // If no driver found with specific ambulance type, search for any available driver
    if (!nearestDriver) {
      console.log('🔍 No driver with specific ambulance type, searching for ANY available driver...');
      nearestDriver = await User.findOne({
        role: USER_ROLES.DRIVER,
        "driverInfo.status": DRIVER_STATUS.AVAILABLE,
      });
    }

    console.log('🔍 Driver search result:', nearestDriver ? {
      id: nearestDriver._id,
      name: nearestDriver.name,
      status: nearestDriver.driverInfo?.status,
      ambulanceType: nearestDriver.driverInfo?.ambulanceType || 'NOT SET',
      phone: nearestDriver.phone,
      ambulanceNumber: nearestDriver.driverInfo?.ambulanceNumber || 'NOT SET'
    } : 'NO DRIVER FOUND');

    // DO NOT auto-assign driver - wait for driver to accept manually
    // Just notify the driver via socket
    if (nearestDriver) {
      console.log(`📡 Notifying driver ${nearestDriver.name} about emergency`);
      
      // Import socket helper to send notification
      const { emitToUser } = await import("../utils/socketHelper.js");
      emitToUser(nearestDriver._id.toString(), "emergency:newRequest", {
        emergency: {
          _id: emergency._id,
          location: emergency.location,
          severityLevel: emergency.severityLevel,
          symptoms: emergency.symptoms,
          description: emergency.description,
          patient: {
            name: req.user.name,
            phone: req.user.phone,
          },
          aiAnalysis: triageResult,
          timestamp: new Date(),
        },
      });
      
      console.log(`✅ Emergency notification sent to driver`);
    }

    // Store suggested hospital but don't assign yet
    if (nearestHospital) {
      console.log(`🏥 Suggested hospital: ${nearestHospital.name}`);
    

    await emergency.save();

    // Populate emergency details
    await emergency.populate([
      { path: "patient", select: "name email phone medicalProfile" },
      { path: "assignedDriver", select: "name email phone driverInfo" },
      { path: "assignedHospital", select: "name address phone location" },
    ]);

    // Socket notification already sent above, no need to send again
    } else {
      console.log('⚠️ No driver available - socket notification not sent');
    }

    // Calculate ETA
    const eta = nearestDriver ? Math.floor(Math.random() * 15) + 5 : null;

    sendResponse(
      res,
      RESPONSE_CODES.SUCCESS,
      "Intelligent ambulance dispatched successfully",
      {
        emergency,
        ambulance: {
          type: ambulanceType,
          driver: nearestDriver ? {
            name: nearestDriver.name,
            phone: nearestDriver.phone,
            vehicleNumber: nearestDriver.driverInfo?.vehicleNumber,
            ambulanceNumber: nearestDriver.driverInfo?.ambulanceNumber,
            ambulanceType: nearestDriver.driverInfo?.ambulanceType,
          } : null,
          hospital: nearestHospital ? {
            name: nearestHospital.name,
            address: nearestHospital.address,
          } : null,
          eta,
        },
        aiAnalysis: {
          emergencyType: triageResult.emergencyType,
          severity: triageResult.severity,
          confidence: triageResult.confidence,
          recommendations: triageResult.recommendations,
        },
      }
    );
  } catch (error) {
    console.error("❌ Intelligent dispatch error:", error);
    throw error;
  }
});

/**
 * @desc    Mark patient picked up
 * @route   PUT /api/v1/emergencies/:id/pickup
 * @access  Private (Driver)
 */
export const markPickedUp = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only drivers can update pickup status"
    );
  }

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  if (emergency.assignedDriver?.toString() !== req.user.id) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "You are not assigned to this emergency"
    );
  }

  if (emergency.status !== EMERGENCY_STATUS.ACCEPTED) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Emergency must be in accepted status"
    );
  }

  // Update emergency status
  await emergency.updateStatus(EMERGENCY_STATUS.IN_PROGRESS, req.user.id);

  // Update trip pickup time
  if (emergency.trip) {
    await Trip.findByIdAndUpdate(emergency.trip, {
      pickupTime: new Date(),
    });
  }

  await emergency.populate([
    { path: "patient", select: "name phone" },
    { path: "assignedHospital", select: "name address contactNumber location" },
  ]);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Patient picked up successfully", {
    emergency,
  });
});

/**
 * @desc    Mark arrived at hospital
 * @route   PUT /api/v1/emergencies/:id/hospital-arrival
 * @access  Private (Driver)
 */
export const markArrivedAtHospital = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only drivers can update arrival status"
    );
  }

  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return sendResponse(res, RESPONSE_CODES.NOT_FOUND, "Emergency not found");
  }

  if (emergency.assignedDriver?.toString() !== req.user.id) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "You are not assigned to this emergency"
    );
  }

  if (emergency.status !== EMERGENCY_STATUS.IN_PROGRESS) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Emergency must be in progress"
    );
  }

  // Update trip hospital arrival time
  if (emergency.trip) {
    await Trip.findByIdAndUpdate(emergency.trip, {
      hospitalArrivalTime: new Date(),
    });
  }

  await emergency.populate([
    { path: "patient", select: "name phone" },
    { path: "assignedHospital", select: "name address contactNumber location" },
  ]);

  sendResponse(
    res,
    RESPONSE_CODES.SUCCESS,
    "Hospital arrival marked successfully",
    {
      emergency,
    }
  );
});

/**
 * Helper function to determine ambulance type based on AI analysis
 */
const determineAmbulanceType = (emergencyType, severity) => {
  // Critical severity
  if (severity === 'critical') {
    if (emergencyType === 'cardiac' || emergencyType === 'neurological') {
      return 'MOBILE_ICU';
    }
    return 'ALS';
  }

  // High severity
  if (severity === 'high') {
    if (['burn', 'poisoning', 'allergic'].includes(emergencyType)) {
      return 'SPECIALIZED';
    }
    if (['cardiac', 'respiratory', 'neurological'].includes(emergencyType)) {
      return 'ALS';
    }
    return 'ALS';
  }

  // Medium severity
  if (severity === 'medium') {
    if (['cardiac', 'respiratory'].includes(emergencyType)) {
      return 'ALS';
    }
    if (['burn', 'poisoning'].includes(emergencyType)) {
      return 'SPECIALIZED';
    }
    return 'BLS';
  }

  // Low severity - BLS is sufficient
  return 'BLS';
};

/**
 * @desc    Cancel emergency request
 * @route   POST /api/v1/emergencies/:id/cancel
 * @access  Private (Patient who created it)
 */
export const cancelEmergency = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const emergency = await Emergency.findById(id);

  if (!emergency) {
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "Emergency not found"
    );
  }

  // Only patient who created the emergency can cancel it
  if (emergency.patient.toString() !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "You can only cancel your own emergencies"
    );
  }

  // Can only cancel pending or accepted emergencies
  if (![
    EMERGENCY_STATUS.PENDING,
    EMERGENCY_STATUS.ACCEPTED
  ].includes(emergency.status)) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      `Cannot cancel emergency with status: ${emergency.status}`
    );
  }

  emergency.status = EMERGENCY_STATUS.CANCELLED;
  emergency.cancelReason = reason || 'Cancelled by patient';
  emergency.cancelledAt = new Date();
  await emergency.save();

  // If driver was assigned, free them up and notify them
  if (emergency.assignedDriver) {
    const driver = await User.findById(emergency.assignedDriver);
    if (driver) {
      driver.driverInfo.status = DRIVER_STATUS.AVAILABLE;
      await driver.save();

      // Notify driver via socket to remove the request
      try {
        emitToUser(driver._id.toString(), "emergency:cancelledByPatient", {
          emergencyId: emergency._id,
          reason: reason || 'Cancelled by patient',
          message: 'The patient has cancelled this emergency request',
          timestamp: new Date().toISOString(),
        });
        console.log(`📡 Notified driver ${driver.name} about cancellation`);
      } catch (socketError) {
        console.error("⚠️ Failed to notify driver:", socketError.message);
      }
    }
  }

  await emergency.populate([
    { path: "patient", select: "name email phone" },
    { path: "assignedDriver", select: "name email phone driverInfo" },
    { path: "assignedHospital", select: "name address phone" },
  ]);

  console.log(`❌ Emergency cancelled: ${emergency._id}`);

  sendResponse(res, RESPONSE_CODES.SUCCESS, "Emergency cancelled successfully", {
    emergency,
  });
});

/**
 * @desc    Driver rejects/declines emergency request
 * @route   POST /api/v1/emergencies/:id/reject
 * @access  Private (Driver)
 */
export const rejectEmergency = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const emergency = await Emergency.findById(id);

  if (!emergency) {
    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "Emergency not found"
    );
  }

  // Verify driver is the assigned driver
  if (req.user.role !== USER_ROLES.DRIVER) {
    return sendResponse(
      res,
      RESPONSE_CODES.FORBIDDEN,
      "Only drivers can reject emergencies"
    );
  }

  // Can only reject pending emergencies
  if (emergency.status !== EMERGENCY_STATUS.PENDING) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      `Cannot reject emergency with status: ${emergency.status}`
    );
  }

  console.log(`🚫 Driver ${req.user.name} rejected emergency ${emergency._id}`);
  console.log(`   Reason: ${reason || 'Not specified'}`);

  // Remove current driver assignment
  const previousDriverId = emergency.assignedDriver;
  emergency.assignedDriver = null;

  // Find next available driver
  console.log('🔍 Finding next available driver...');
  
  const nearestDriver = await User.findOne({
    role: USER_ROLES.DRIVER,
    "driverInfo.status": DRIVER_STATUS.AVAILABLE,
    _id: { $ne: previousDriverId }, // Exclude the driver who just rejected
  }).sort({ createdAt: 1 });

  if (nearestDriver) {
    console.log(`✅ Found next driver: ${nearestDriver.name}`);
    
    // Assign to new driver
    emergency.assignedDriver = nearestDriver._id;
    nearestDriver.driverInfo.status = DRIVER_STATUS.BUSY;
    await nearestDriver.save();
    await emergency.save();

    // Notify new driver
    try {
      emitToUser(nearestDriver._id.toString(), "emergency:newRequest", {
        emergencyId: emergency._id,
        location: emergency.location,
        severityLevel: emergency.severityLevel,
        symptoms: emergency.symptoms,
        description: emergency.description,
        patient: {
          name: emergency.patient?.name,
          phone: emergency.patient?.phone,
        },
        forwardedFrom: req.user.name,
        timestamp: new Date().toISOString(),
      });
      console.log(`📡 Notified new driver: ${nearestDriver.name}`);
    } catch (error) {
      console.error("⚠️ Failed to notify new driver:", error.message);
    }

    // Notify patient about forwarding
    try {
      await emergency.populate('patient');
      if (emergency.patient) {
        emitToUser(emergency.patient._id.toString(), "emergency:forwarded", {
          emergencyId: emergency._id,
          previousDriver: req.user.name,
          newDriver: nearestDriver.name,
          reason: reason || 'Driver unavailable',
          message: `Your emergency request has been forwarded to another driver: ${nearestDriver.name}`,
          timestamp: new Date().toISOString(),
        });
        console.log(`📨 Notified patient about forwarding`);
      }
    } catch (error) {
      console.error("⚠️ Failed to notify patient:", error.message);
    }

    await emergency.populate([
      { path: "patient", select: "name email phone" },
      { path: "assignedDriver", select: "name email phone driverInfo" },
      { path: "assignedHospital", select: "name address phone" },
    ]);

    return sendResponse(
      res,
      RESPONSE_CODES.SUCCESS,
      "Emergency forwarded to next available driver",
      {
        emergency,
        forwardedTo: {
          name: nearestDriver.name,
          phone: nearestDriver.phone,
        },
      }
    );
  } else {
    // No other drivers available
    console.log('❌ No other drivers available');
    
    emergency.status = EMERGENCY_STATUS.CANCELLED;
    emergency.cancelReason = 'No available drivers';
    emergency.cancelledAt = new Date();
    await emergency.save();

    // Notify patient
    try {
      await emergency.populate('patient');
      if (emergency.patient) {
        emitToUser(emergency.patient._id.toString(), "emergency:cancelled", {
          emergencyId: emergency._id,
          reason: 'No available drivers could be found',
          message: 'Unfortunately, no ambulances are available at this moment. Please call local emergency services.',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("⚠️ Failed to notify patient:", error.message);
    }

    return sendResponse(
      res,
      RESPONSE_CODES.NOT_FOUND,
      "No available drivers found. Emergency cancelled.",
      {
        emergency,
      }
    );
  }
});

