import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configure Cloudinary (you'll need to set these environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for medical documents (images)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "alertx/medical-documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    transformation: [
      { width: 1500, height: 1500, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      return `${req.user._id}_${uuidv4()}_${Date.now()}`;
    },
  },
});

// Storage configuration for voice recordings
const voiceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "alertx/voice-recordings",
    resource_type: "video", // Cloudinary uses 'video' for audio files
    allowed_formats: ["mp3", "wav", "ogg", "webm", "m4a"],
    public_id: (req, file) => {
      return `voice_${req.user._id}_${uuidv4()}_${Date.now()}`;
    },
  },
});

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  };
};

// Document upload configuration
export const uploadDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
});

// Voice recording upload configuration
export const uploadVoiceRecording = multer({
  storage: voiceStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for voice recordings
  },
  fileFilter: fileFilter([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/mp4",
    "audio/x-m4a",
  ]),
});

// Local storage fallback (for development without Cloudinary)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith("audio/")
      ? "uploads/voice-recordings"
      : "uploads/medical-documents";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}_${uniqueSuffix}${ext}`);
  },
});

// Development upload configuration (local storage)
export const uploadDocumentsLocal = multer({
  storage: localStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ]),
});

export const uploadVoiceLocal = multer({
  storage: localStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: fileFilter([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
  ]),
});

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url) => {
  const matches = url.match(/\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
};
