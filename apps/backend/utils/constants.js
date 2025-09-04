// User roles
export const USER_ROLES = {
  PATIENT: "patient",
  DRIVER: "driver",
  HOSPITAL_STAFF: "hospital_staff",
  ADMIN: "admin",
};

// Emergency status
export const EMERGENCY_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Driver status
export const DRIVER_STATUS = {
  AVAILABLE: "available",
  BUSY: "busy",
  OFFLINE: "offline",
};

// Trip status
export const TRIP_STATUS = {
  STARTED: "started",
  PICKING_UP: "picking_up",
  PATIENT_PICKED: "patient_picked",
  EN_ROUTE_HOSPITAL: "en_route_hospital",
  ARRIVED_HOSPITAL: "arrived_hospital",
  COMPLETED: "completed",
};

// Hospital bed types
export const BED_TYPES = {
  GENERAL: "general",
  ICU: "icu",
  EMERGENCY: "emergency",
  OPERATION: "operation",
};

// Emergency severity levels (for AI triage)
export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Response codes
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  PHONE: /^\+[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Distance calculations (in kilometers)
export const DISTANCE_LIMITS = {
  MAX_AMBULANCE_SEARCH_RADIUS: 50, // km
  MAX_HOSPITAL_SEARCH_RADIUS: 100, // km
};
