/**
 * Ambulance Types and Data Structures
 * Comprehensive type definitions for ambulance management system
 */

// Ambulance Status Enums
export const AMBULANCE_STATUS = {
  IDLE: "idle",
  ON_ROUTE: "on_route",
  AT_SCENE: "at_scene",
  TRANSPORTING: "transporting",
  AT_HOSPITAL: "at_hospital",
  MAINTENANCE: "maintenance",
  OUT_OF_SERVICE: "out_of_service",
};

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const EQUIPMENT_STATUS = {
  OPERATIONAL: "operational",
  NEEDS_MAINTENANCE: "needs_maintenance",
  OUT_OF_ORDER: "out_of_order",
};

export const CREW_ROLES = {
  PARAMEDIC: "paramedic",
  EMT: "emt",
  DRIVER: "driver",
  NURSE: "nurse",
};

// Sample Ambulance Data Structure
export const sampleAmbulanceData = {
  id: "AMB-001",
  callSign: "Unit Alpha-1",
  status: AMBULANCE_STATUS.ON_ROUTE,
  priority: PRIORITY_LEVELS.HIGH,
  location: {
    coordinates: [40.7589, -73.9851], // [lat, lng]
    address: "123 Emergency St, New York, NY",
    lastUpdated: new Date().toISOString(),
  },
  crew: [
    {
      id: "crew-001",
      name: "Dr. Sarah Johnson",
      role: CREW_ROLES.PARAMEDIC,
      certificationLevel: "Advanced Life Support",
      phoneNumber: "+1-555-0123",
      avatar: null,
      experienceYears: 8,
      specializations: ["Cardiac Care", "Trauma"],
    },
    {
      id: "crew-002",
      name: "Mike Rodriguez",
      role: CREW_ROLES.EMT,
      certificationLevel: "Basic Life Support",
      phoneNumber: "+1-555-0124",
      avatar: null,
      experienceYears: 4,
      specializations: ["First Aid", "Transport"],
    },
  ],
  equipment: {
    defibrillator: {
      status: EQUIPMENT_STATUS.OPERATIONAL,
      lastChecked: "2024-01-15T10:00:00Z",
    },
    oxygenTanks: {
      status: EQUIPMENT_STATUS.OPERATIONAL,
      level: 85, // percentage
      lastChecked: "2024-01-15T10:00:00Z",
    },
    stretcher: {
      status: EQUIPMENT_STATUS.OPERATIONAL,
      lastChecked: "2024-01-15T10:00:00Z",
    },
    medicationKit: {
      status: EQUIPMENT_STATUS.OPERATIONAL,
      expirationCheck: "2024-06-15",
      lastChecked: "2024-01-15T10:00:00Z",
    },
    ventilator: {
      status: EQUIPMENT_STATUS.OPERATIONAL,
      lastChecked: "2024-01-15T10:00:00Z",
    },
    ecgMonitor: {
      status: EQUIPMENT_STATUS.OPERATIONAL,
      lastChecked: "2024-01-15T10:00:00Z",
    },
  },
  currentCall: {
    id: "CALL-001",
    type: "Medical Emergency",
    description: "Cardiac arrest - Male, 65 years old",
    dispatchTime: "2024-01-15T14:30:00Z",
    eta: "8 mins",
    destination: {
      type: "scene", // or 'hospital'
      address: "456 Main St, New York, NY",
      coordinates: [40.7614, -73.9776],
    },
    patient: {
      age: 65,
      gender: "Male",
      condition: "Cardiac Arrest",
      vitals: {
        heartRate: 0,
        bloodPressure: "0/0",
        oxygenSaturation: 0,
        lastUpdated: "2024-01-15T14:45:00Z",
      },
    },
  },
  vehicle: {
    licensePlate: "AMB-001-NY",
    model: "Ford F-450 Ambulance",
    year: 2022,
    mileage: 45000,
    fuelLevel: 75, // percentage
    lastMaintenance: "2024-01-01T00:00:00Z",
    nextMaintenanceDue: "2024-02-01T00:00:00Z",
  },
  metrics: {
    responseTime: 6.5, // minutes
    totalCallsToday: 8,
    totalCallsThisWeek: 42,
    averageResponseTime: 7.2,
    successfulTransports: 38,
    onDutyHours: 10.5,
  },
  communication: {
    radioChannel: "Channel 3",
    lastContact: "2024-01-15T14:45:00Z",
    emergencyButton: false,
    gpsTracking: true,
  },
};

// Status color mappings for UI
export const STATUS_COLORS = {
  [AMBULANCE_STATUS.IDLE]: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  [AMBULANCE_STATUS.ON_ROUTE]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  [AMBULANCE_STATUS.AT_SCENE]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  [AMBULANCE_STATUS.TRANSPORTING]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  [AMBULANCE_STATUS.AT_HOSPITAL]: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  [AMBULANCE_STATUS.MAINTENANCE]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  [AMBULANCE_STATUS.OUT_OF_SERVICE]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  },
  [PRIORITY_LEVELS.MEDIUM]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  [PRIORITY_LEVELS.HIGH]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  [PRIORITY_LEVELS.CRITICAL]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
};
