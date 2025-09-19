/**
 * Ambulance API Service
 * Comprehensive API service for ambulance operations with error handling, caching, and real-time updates
 */

import { sampleAmbulanceData, AMBULANCE_STATUS } from "../types/ambulanceTypes";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_ENDPOINTS = {
  ambulances: "/ambulances",
  ambulanceById: (id) => `/ambulances/${id}`,
  updateStatus: (id) => `/ambulances/${id}/status`,
  updateLocation: (id) => `/ambulances/${id}/location`,
  updateEquipment: (id) => `/ambulances/${id}/equipment`,
  assignCall: (id) => `/ambulances/${id}/assign-call`,
  completeCall: (id) => `/ambulances/${id}/complete-call`,
  crew: (id) => `/ambulances/${id}/crew`,
  metrics: (id) => `/ambulances/${id}/metrics`,
  realTimeUpdates: "/ambulances/real-time",
};

// Error classes for better error handling
class AmbulanceAPIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "AmbulanceAPIError";
    this.status = status;
    this.code = code;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
}

// Utility function for API calls with error handling
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
      const errorData = await response.json().catch(() => ({}));
      throw new AmbulanceAPIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code,
      );
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    if (error instanceof AmbulanceAPIError) {
      throw error;
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new NetworkError(
        "Network connection failed. Please check your internet connection.",
      );
    }

    throw new AmbulanceAPIError(
      error.message || "An unexpected error occurred",
      500,
      "UNKNOWN_ERROR",
    );
  }
};

// Mock data for development (will be replaced with real API calls)
const generateMockAmbulances = () => {
  const statuses = Object.values(AMBULANCE_STATUS);
  const callSigns = [
    "Alpha-1",
    "Bravo-2",
    "Charlie-3",
    "Delta-4",
    "Echo-5",
    "Foxtrot-6",
  ];

  return Array.from({ length: 6 }, (_, index) => ({
    ...sampleAmbulanceData,
    id: `AMB-${String(index + 1).padStart(3, "0")}`,
    callSign: `Unit ${callSigns[index]}`,
    status: statuses[index % statuses.length],
    location: {
      ...sampleAmbulanceData.location,
      coordinates: [
        40.7589 + (Math.random() - 0.5) * 0.1,
        -73.9851 + (Math.random() - 0.5) * 0.1,
      ],
    },
    crew: sampleAmbulanceData.crew.map((member) => ({
      ...member,
      id: `crew-${index + 1}-${member.role}`,
    })),
    currentCall:
      index < 3
        ? {
            ...sampleAmbulanceData.currentCall,
            id: `CALL-${String(index + 1).padStart(3, "0")}`,
          }
        : null,
    metrics: {
      ...sampleAmbulanceData.metrics,
      totalCallsToday: Math.floor(Math.random() * 12) + 1,
      responseTime: Math.round((Math.random() * 5 + 4) * 10) / 10,
    },
  }));
};

// Ambulance API Service
export const ambulanceAPI = {
  // Get all ambulances
  getAll: async (filters = {}) => {
    try {
      // For development, return mock data
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        const mockData = generateMockAmbulances();

        // Apply filters if provided
        let filteredData = mockData;
        if (filters.status) {
          filteredData = mockData.filter(
            (ambulance) => ambulance.status === filters.status,
          );
        }
        if (filters.priority) {
          filteredData = filteredData.filter(
            (ambulance) => ambulance.currentCall?.priority === filters.priority,
          );
        }

        return { success: true, data: filteredData };
      }

      // Production API call
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.ambulances}${queryParams ? `?${queryParams}` : ""}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error("Failed to fetch ambulances:", error);
      throw error;
    }
  },

  // Get single ambulance by ID
  getById: async (id) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const mockData = generateMockAmbulances();
        const ambulance = mockData.find((amb) => amb.id === id);

        if (!ambulance) {
          throw new AmbulanceAPIError(
            `Ambulance with ID ${id} not found`,
            404,
            "NOT_FOUND",
          );
        }

        return { success: true, data: ambulance };
      }

      return await apiCall(API_ENDPOINTS.ambulanceById(id));
    } catch (error) {
      console.error(`Failed to fetch ambulance ${id}:`, error);
      throw error;
    }
  },

  // Update ambulance status
  updateStatus: async (id, status, metadata = {}) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
          success: true,
          data: {
            id,
            status,
            updatedAt: new Date().toISOString(),
            ...metadata,
          },
        };
      }

      return await apiCall(API_ENDPOINTS.updateStatus(id), {
        method: "PATCH",
        body: JSON.stringify({ status, metadata }),
      });
    } catch (error) {
      console.error(`Failed to update ambulance ${id} status:`, error);
      throw error;
    }
  },

  // Update ambulance location
  updateLocation: async (id, coordinates, address = null) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return {
          success: true,
          data: {
            id,
            location: {
              coordinates,
              address,
              lastUpdated: new Date().toISOString(),
            },
          },
        };
      }

      return await apiCall(API_ENDPOINTS.updateLocation(id), {
        method: "PATCH",
        body: JSON.stringify({ coordinates, address }),
      });
    } catch (error) {
      console.error(`Failed to update ambulance ${id} location:`, error);
      throw error;
    }
  },

  // Update equipment status
  updateEquipment: async (id, equipmentUpdates) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          success: true,
          data: {
            id,
            equipment: equipmentUpdates,
            updatedAt: new Date().toISOString(),
          },
        };
      }

      return await apiCall(API_ENDPOINTS.updateEquipment(id), {
        method: "PATCH",
        body: JSON.stringify({ equipment: equipmentUpdates }),
      });
    } catch (error) {
      console.error(`Failed to update ambulance ${id} equipment:`, error);
      throw error;
    }
  },

  // Assign call to ambulance
  assignCall: async (ambulanceId, callData) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          success: true,
          data: {
            ambulanceId,
            call: { ...callData, assignedAt: new Date().toISOString() },
          },
        };
      }

      return await apiCall(API_ENDPOINTS.assignCall(ambulanceId), {
        method: "POST",
        body: JSON.stringify(callData),
      });
    } catch (error) {
      console.error(
        `Failed to assign call to ambulance ${ambulanceId}:`,
        error,
      );
      throw error;
    }
  },

  // Complete current call
  completeCall: async (ambulanceId, completionData) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          success: true,
          data: {
            ambulanceId,
            completedAt: new Date().toISOString(),
            ...completionData,
          },
        };
      }

      return await apiCall(API_ENDPOINTS.completeCall(ambulanceId), {
        method: "POST",
        body: JSON.stringify(completionData),
      });
    } catch (error) {
      console.error(
        `Failed to complete call for ambulance ${ambulanceId}:`,
        error,
      );
      throw error;
    }
  },

  // Get ambulance crew information
  getCrew: async (ambulanceId) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const mockData = generateMockAmbulances();
        const ambulance = mockData.find((amb) => amb.id === ambulanceId);

        return {
          success: true,
          data: ambulance?.crew || [],
        };
      }

      return await apiCall(API_ENDPOINTS.crew(ambulanceId));
    } catch (error) {
      console.error(
        `Failed to fetch crew for ambulance ${ambulanceId}:`,
        error,
      );
      throw error;
    }
  },

  // Get ambulance metrics
  getMetrics: async (ambulanceId, timeRange = "24h") => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const mockData = generateMockAmbulances();
        const ambulance = mockData.find((amb) => amb.id === ambulanceId);

        return {
          success: true,
          data: ambulance?.metrics || {},
        };
      }

      return await apiCall(
        `${API_ENDPOINTS.metrics(ambulanceId)}?timeRange=${timeRange}`,
      );
    } catch (error) {
      console.error(
        `Failed to fetch metrics for ambulance ${ambulanceId}:`,
        error,
      );
      throw error;
    }
  },

  // Real-time updates subscription (WebSocket)
  subscribeToUpdates: (callback, filters = {}) => {
    if (import.meta.env.DEV) {
      // Mock real-time updates for development
      const interval = setInterval(() => {
        const mockData = generateMockAmbulances();
        callback({ type: "update", data: mockData });
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }

    // Production WebSocket connection
    try {
      const ws = new WebSocket(
        `${API_BASE_URL.replace("http", "ws")}${API_ENDPOINTS.realTimeUpdates}`,
      );

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "subscribe", filters }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        callback({ type: "error", error: "WebSocket connection failed" });
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
      return () => {}; // Return empty cleanup function
    }
  },
};

// Export error classes for use in components
export { AmbulanceAPIError, NetworkError };
