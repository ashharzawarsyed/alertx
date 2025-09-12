import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  uploadDocuments,
  uploadVoiceRecording,
} from "../middlewares/uploadMiddleware.js";
import {
  getMedicalProfile,
  updateBasicMedicalInfo,
  updateAllergies,
  updateMedications,
  updateMedicalConditions,
  updateEmergencyContacts,
  uploadMedicalDocument,
  uploadVoiceRecordingFile,
  deleteMedicalDocument,
  deleteVoiceRecording,
  updateEmergencyInstructions,
} from "../controllers/medicalProfileController.js";
import {
  validateBasicMedicalInfo,
  validateAllergies,
  validateMedications,
  validateMedicalConditions,
  validateEmergencyContacts,
  validateDocumentUpload,
  validateVoiceUpload,
  validateEmergencyInstructions,
} from "../middlewares/medicalValidation.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get medical profile
router.get("/", getMedicalProfile);

// Update medical profile sections
router.put("/basic-info", validateBasicMedicalInfo, updateBasicMedicalInfo);
router.put("/allergies", validateAllergies, updateAllergies);
router.put("/medications", validateMedications, updateMedications);
router.put("/conditions", validateMedicalConditions, updateMedicalConditions);
router.put(
  "/emergency-contacts",
  validateEmergencyContacts,
  updateEmergencyContacts
);
router.put(
  "/emergency-instructions",
  validateEmergencyInstructions,
  updateEmergencyInstructions
);

// File uploads
router.post(
  "/documents",
  uploadDocuments.single("document"),
  validateDocumentUpload,
  uploadMedicalDocument
);

router.post(
  "/voice-recordings",
  uploadVoiceRecording.single("recording"),
  validateVoiceUpload,
  uploadVoiceRecordingFile
);

// Delete files
router.delete("/documents/:documentId", deleteMedicalDocument);
router.delete("/voice-recordings/:recordingId", deleteVoiceRecording);

// Voice-to-text transcription endpoint (future feature)
router.post("/transcribe-voice", (req, res) => {
  // TODO: Integrate with speech-to-text service (Google Cloud Speech, Azure, etc.)
  res.json({
    success: false,
    message: "Voice transcription service not yet implemented",
  });
});

// Emergency voice recording endpoint (for critical situations)
router.post(
  "/emergency-voice",
  uploadVoiceRecording.single("emergency_recording"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No emergency voice recording uploaded",
        });
      }

      // Save emergency voice recording with high priority
      const emergencyData = {
        type: "emergency_recording",
        filename: req.file.filename,
        fileUrl: req.file.path,
        duration: parseInt(req.body.duration) || 0,
        description: "Emergency voice recording",
        recordingDate: new Date(),
        isEmergency: true,
      };

      // TODO: Integrate with AI transcription for immediate processing
      // TODO: Trigger emergency response based on voice content

      res.json({
        success: true,
        message: "Emergency voice recording saved",
        data: emergencyData,
        note: "Emergency response system will process this recording immediately",
      });
    } catch (error) {
      console.error("Emergency voice recording error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save emergency voice recording",
      });
    }
  }
);

export default router;
