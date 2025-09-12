import User from "../models/User.js";
import {
  uploadDocuments,
  uploadVoiceRecording,
  deleteFromCloudinary,
  extractPublicId,
} from "../middlewares/uploadMiddleware.js";
import { validationResult } from "express-validator";

// Get user's medical profile
export const getMedicalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "medicalProfile name email phone role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        profile: user.medicalProfile,
        profileCompletion: calculateProfileCompletion(user.medicalProfile),
      },
    });
  } catch (error) {
    console.error("Get medical profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve medical profile",
    });
  }
};

// Update basic medical information
export const updateBasicMedicalInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { bloodType, height, weight, dateOfBirth, lifestyle } = req.body;

    const updateData = {
      "medicalProfile.bloodType": bloodType,
      "medicalProfile.height": height,
      "medicalProfile.weight": weight,
      "medicalProfile.dateOfBirth": dateOfBirth,
      "medicalProfile.lifestyle": lifestyle,
      "medicalProfile.profileCompletion.basicInfo": true,
      "medicalProfile.profileCompletion.lastUpdated": new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("medicalProfile");

    res.json({
      success: true,
      message: "Basic medical information updated successfully",
      data: user.medicalProfile,
    });
  } catch (error) {
    console.error("Update basic medical info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update basic medical information",
    });
  }
};

// Add/Update allergies
export const updateAllergies = async (req, res) => {
  try {
    const { allergies } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "medicalProfile.allergies": allergies,
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.allergies");

    res.json({
      success: true,
      message: "Allergies updated successfully",
      data: user.medicalProfile.allergies,
    });
  } catch (error) {
    console.error("Update allergies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update allergies",
    });
  }
};

// Add/Update medications
export const updateMedications = async (req, res) => {
  try {
    const { medications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "medicalProfile.medications": medications,
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.medications");

    res.json({
      success: true,
      message: "Medications updated successfully",
      data: user.medicalProfile.medications,
    });
  } catch (error) {
    console.error("Update medications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update medications",
    });
  }
};

// Add/Update medical conditions
export const updateMedicalConditions = async (req, res) => {
  try {
    const { medicalConditions } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "medicalProfile.medicalConditions": medicalConditions,
          "medicalProfile.profileCompletion.medicalHistory": true,
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.medicalConditions");

    res.json({
      success: true,
      message: "Medical conditions updated successfully",
      data: user.medicalProfile.medicalConditions,
    });
  } catch (error) {
    console.error("Update medical conditions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update medical conditions",
    });
  }
};

// Add/Update emergency contacts
export const updateEmergencyContacts = async (req, res) => {
  try {
    const { emergencyContacts } = req.body;

    // Ensure only one primary contact
    const contacts = emergencyContacts.map((contact, index) => ({
      ...contact,
      isPrimary: index === 0, // First contact is primary
    }));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "medicalProfile.emergencyContacts": contacts,
          "medicalProfile.profileCompletion.emergencyContacts": true,
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.emergencyContacts");

    res.json({
      success: true,
      message: "Emergency contacts updated successfully",
      data: user.medicalProfile.emergencyContacts,
    });
  } catch (error) {
    console.error("Update emergency contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update emergency contacts",
    });
  }
};

// Upload medical document
export const uploadMedicalDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { type, description } = req.body;

    const documentData = {
      type,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: req.file.path,
      description: description || "",
      uploadDate: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { "medicalProfile.documents": documentData },
        $set: {
          "medicalProfile.profileCompletion.documents": true,
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.documents");

    res.json({
      success: true,
      message: "Medical document uploaded successfully",
      data: user.medicalProfile.documents[
        user.medicalProfile.documents.length - 1
      ],
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};

// Upload voice recording
export const uploadVoiceRecordingFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No voice recording uploaded",
      });
    }

    const { type, description, duration } = req.body;

    const voiceData = {
      type,
      filename: req.file.filename,
      fileUrl: req.file.path,
      duration: parseInt(duration) || 0,
      description: description || "",
      recordingDate: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { "medicalProfile.voiceRecordings": voiceData },
        $set: {
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.voiceRecordings");

    res.json({
      success: true,
      message: "Voice recording uploaded successfully",
      data: user.medicalProfile.voiceRecordings[
        user.medicalProfile.voiceRecordings.length - 1
      ],
    });
  } catch (error) {
    console.error("Upload voice recording error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload voice recording",
    });
  }
};

// Delete medical document
export const deleteMedicalDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const user = await User.findById(req.user.id);
    const document = user.medicalProfile.documents.id(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete from cloud storage
    const publicId = extractPublicId(document.fileUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Remove from database
    user.medicalProfile.documents.pull(documentId);
    user.medicalProfile.profileCompletion.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};

// Delete voice recording
export const deleteVoiceRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;

    const user = await User.findById(req.user.id);
    const recording = user.medicalProfile.voiceRecordings.id(recordingId);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Voice recording not found",
      });
    }

    // Delete from cloud storage
    const publicId = extractPublicId(recording.fileUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "video"); // Cloudinary treats audio as video
    }

    // Remove from database
    user.medicalProfile.voiceRecordings.pull(recordingId);
    user.medicalProfile.profileCompletion.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Voice recording deleted successfully",
    });
  } catch (error) {
    console.error("Delete voice recording error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete voice recording",
    });
  }
};

// Update emergency instructions
export const updateEmergencyInstructions = async (req, res) => {
  try {
    const { emergencyInstructions } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "medicalProfile.emergencyInstructions": emergencyInstructions,
          "medicalProfile.profileCompletion.lastUpdated": new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("medicalProfile.emergencyInstructions");

    res.json({
      success: true,
      message: "Emergency instructions updated successfully",
      data: user.medicalProfile.emergencyInstructions,
    });
  } catch (error) {
    console.error("Update emergency instructions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update emergency instructions",
    });
  }
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const sections = {
    basicInfo: profile.bloodType && profile.dateOfBirth,
    medicalHistory:
      profile.allergies?.length > 0 ||
      profile.medications?.length > 0 ||
      profile.medicalConditions?.length > 0,
    emergencyContacts: profile.emergencyContacts?.length > 0,
    documents: profile.documents?.length > 0,
    emergencyInstructions: profile.emergencyInstructions?.generalInstructions,
  };

  const completedSections = Object.values(sections).filter(Boolean).length;
  const totalSections = Object.keys(sections).length;

  return Math.round((completedSections / totalSections) * 100);
};
