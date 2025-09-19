/**
 * Driver API Service
 * Handles driver registration, approval, and management operations
 */

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Driver API endpoints
const API_ENDPOINTS = {
  pendingDrivers: "/drivers/pending",
  allDrivers: "/drivers",
  driverById: (id) => `/drivers/${id}`,
  approveDriver: (id) => `/drivers/${id}/approve`,
  rejectDriver: (id) => `/drivers/${id}/reject`,
  updateDriverStatus: (id) => `/drivers/${id}/status`,
  assignAmbulance: (id) => `/drivers/${id}/assign-ambulance`,
};

// Mock data for development
const generateMockDrivers = () => {
  return [
    {
      id: "USR001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1-555-0101",
      role: "driver",
      driverInfo: {
        licenseNumber: "D1234567890",
        ambulanceNumber: "AMB-001",
        status: "offline",
        currentLocation: null,
      },
      registrationDate: "2024-01-15T10:00:00Z",
      approvalStatus: "pending",
      documents: [
        {
          type: "license",
          url: "/documents/john_license.pdf",
          status: "verified",
        },
        {
          type: "certification",
          url: "/documents/john_cert.pdf",
          status: "pending",
        },
      ],
      experience: {
        years: 3,
        previousEmployer: "City Emergency Services",
        certifications: ["EMT-Basic", "Defensive Driving"],
      },
      background: {
        criminalCheck: "clear",
        drugTest: "passed",
        medicalClearance: "approved",
      },
    },
    {
      id: "USR002",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1-555-0102",
      role: "driver",
      driverInfo: {
        licenseNumber: "D2345678901",
        ambulanceNumber: "AMB-002",
        status: "available",
        currentLocation: { lat: 40.7589, lng: -73.9851 },
      },
      registrationDate: "2024-01-10T08:30:00Z",
      approvalStatus: "approved",
      documents: [
        {
          type: "license",
          url: "/documents/sarah_license.pdf",
          status: "verified",
        },
        {
          type: "certification",
          url: "/documents/sarah_cert.pdf",
          status: "verified",
        },
      ],
      experience: {
        years: 5,
        previousEmployer: "Metro Health Services",
        certifications: [
          "EMT-Paramedic",
          "Advanced Life Support",
          "Defensive Driving",
        ],
      },
      background: {
        criminalCheck: "clear",
        drugTest: "passed",
        medicalClearance: "approved",
      },
    },
    {
      id: "USR003",
      name: "Mike Rodriguez",
      email: "mike.rodriguez@example.com",
      phone: "+1-555-0103",
      role: "driver",
      driverInfo: {
        licenseNumber: "D3456789012",
        ambulanceNumber: "AMB-003",
        status: "busy",
        currentLocation: { lat: 40.7614, lng: -73.9776 },
      },
      registrationDate: "2024-01-12T14:15:00Z",
      approvalStatus: "approved",
      documents: [
        {
          type: "license",
          url: "/documents/mike_license.pdf",
          status: "verified",
        },
        {
          type: "certification",
          url: "/documents/mike_cert.pdf",
          status: "verified",
        },
      ],
      experience: {
        years: 2,
        previousEmployer: "Regional Ambulance Corp",
        certifications: ["EMT-Basic", "Defensive Driving"],
      },
      background: {
        criminalCheck: "clear",
        drugTest: "passed",
        medicalClearance: "approved",
      },
    },
    {
      id: "USR004",
      name: "Emily Chen",
      email: "emily.chen@example.com",
      phone: "+1-555-0104",
      role: "driver",
      driverInfo: {
        licenseNumber: "D4567890123",
        ambulanceNumber: null, // Not assigned yet
        status: "offline",
        currentLocation: null,
      },
      registrationDate: "2024-01-18T09:45:00Z",
      approvalStatus: "pending",
      documents: [
        {
          type: "license",
          url: "/documents/emily_license.pdf",
          status: "pending",
        },
        {
          type: "certification",
          url: "/documents/emily_cert.pdf",
          status: "pending",
        },
      ],
      experience: {
        years: 4,
        previousEmployer: "Private Medical Transport",
        certifications: ["EMT-Intermediate", "CPR", "Defensive Driving"],
      },
      background: {
        criminalCheck: "pending",
        drugTest: "scheduled",
        medicalClearance: "pending",
      },
    },
    {
      id: "USR005",
      name: "David Brown",
      email: "david.brown@example.com",
      phone: "+1-555-0105",
      role: "driver",
      driverInfo: {
        licenseNumber: "D5678901234",
        ambulanceNumber: null,
        status: "offline",
        currentLocation: null,
      },
      registrationDate: "2024-01-20T11:20:00Z",
      approvalStatus: "rejected",
      documents: [
        {
          type: "license",
          url: "/documents/david_license.pdf",
          status: "rejected",
        },
        {
          type: "certification",
          url: "/documents/david_cert.pdf",
          status: "expired",
        },
      ],
      experience: {
        years: 1,
        previousEmployer: "Local Transport",
        certifications: ["Basic First Aid"],
      },
      background: {
        criminalCheck: "issues_found",
        drugTest: "failed",
        medicalClearance: "rejected",
      },
    },
    {
      id: "USR006",
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      phone: "+1-555-0106",
      role: "driver",
      driverInfo: {
        licenseNumber: "D6789012345",
        ambulanceNumber: "AMB-004",
        status: "offline",
        currentLocation: null,
      },
      registrationDate: "2024-01-08T16:30:00Z",
      approvalStatus: "blocked",
      documents: [
        {
          type: "license",
          url: "/documents/lisa_license.pdf",
          status: "verified",
        },
        {
          type: "certification",
          url: "/documents/lisa_cert.pdf",
          status: "verified",
        },
      ],
      experience: {
        years: 6,
        previousEmployer: "Emergency Response Team",
        certifications: ["EMT-Paramedic", "Advanced Life Support"],
      },
      background: {
        criminalCheck: "clear",
        drugTest: "passed",
        medicalClearance: "approved",
      },
    },
    {
      id: "USR007",
      name: "Robert Wilson",
      email: "robert.wilson@example.com",
      phone: "+1-555-0107",
      role: "driver",
      driverInfo: {
        licenseNumber: "D7890123456",
        ambulanceNumber: null,
        status: "offline",
        currentLocation: null,
      },
      registrationDate: "2024-01-22T13:45:00Z",
      approvalStatus: "rejected",
      documents: [
        {
          type: "license",
          url: "/documents/robert_license.pdf",
          status: "pending",
        },
        {
          type: "certification",
          url: "/documents/robert_cert.pdf",
          status: "insufficient",
        },
      ],
      experience: {
        years: 0,
        previousEmployer: "None",
        certifications: [],
      },
      background: {
        criminalCheck: "pending",
        drugTest: "pending",
        medicalClearance: "pending",
      },
    },
  ];
};

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network request failed");
  }
};

// Driver API Service
export const driverAPI = {
  // Get all pending driver registrations
  getPendingDrivers: async () => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockData = generateMockDrivers();
        const pendingDrivers = mockData.filter(
          (driver) => driver.approvalStatus === "pending",
        );
        return { success: true, data: pendingDrivers };
      }

      const result = await apiCall(API_ENDPOINTS.pendingDrivers);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get all drivers
  getAllDrivers: async (filters = {}) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        let mockData = generateMockDrivers();

        // Apply filters
        if (filters.status) {
          mockData = mockData.filter(
            (driver) => driver.driverInfo.status === filters.status,
          );
        }
        if (filters.approvalStatus) {
          mockData = mockData.filter(
            (driver) => driver.approvalStatus === filters.approvalStatus,
          );
        }

        return { success: true, data: mockData };
      }

      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.allDrivers}${queryParams ? `?${queryParams}` : ""}`;
      const result = await apiCall(endpoint);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get driver by ID
  getDriverById: async (id) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const mockData = generateMockDrivers();
        const driver = mockData.find((d) => d.id === id);

        if (!driver) {
          throw new Error(`Driver with ID ${id} not found`);
        }

        return { success: true, data: driver };
      }

      const result = await apiCall(API_ENDPOINTS.driverById(id));
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Approve driver registration
  approveDriver: async (driverId, assignedAmbulance = null) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          success: true,
          data: {
            id: driverId,
            approvalStatus: "approved",
            assignedAmbulance,
            approvedAt: new Date().toISOString(),
          },
        };
      }

      const result = await apiCall(API_ENDPOINTS.approveDriver(driverId), {
        method: "POST",
        body: JSON.stringify({ assignedAmbulance }),
      });
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reject driver registration
  rejectDriver: async (driverId, reason = "") => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          success: true,
          data: {
            id: driverId,
            approvalStatus: "rejected",
            rejectionReason: reason,
            rejectedAt: new Date().toISOString(),
          },
        };
      }

      const result = await apiCall(API_ENDPOINTS.rejectDriver(driverId), {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update driver status (available, busy, offline)
  updateDriverStatus: async (driverId, status, location = null) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
          success: true,
          data: {
            id: driverId,
            status,
            location,
            updatedAt: new Date().toISOString(),
          },
        };
      }

      const result = await apiCall(API_ENDPOINTS.updateDriverStatus(driverId), {
        method: "PATCH",
        body: JSON.stringify({ status, location }),
      });
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Assign ambulance to driver
  assignAmbulance: async (driverId, ambulanceNumber) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          success: true,
          data: {
            id: driverId,
            ambulanceNumber,
            assignedAt: new Date().toISOString(),
          },
        };
      }

      const result = await apiCall(API_ENDPOINTS.assignAmbulance(driverId), {
        method: "POST",
        body: JSON.stringify({ ambulanceNumber }),
      });
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
