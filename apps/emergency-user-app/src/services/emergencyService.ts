import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

// Get backend URL based on environment
const getBaseURL = () => {
  if (__DEV__) {
    // For local development
    return "http://192.168.100.23:5001/api/v1"; // Works on real devices
  }
  return "https://your-production-api.com/api/v1";
};

export interface EmergencyData {
  symptoms: string[];
  description?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  voiceRecording?: string;
  images?: string[];
}

export interface Emergency {
  _id: string;
  patient: string;
  symptoms: string[];
  description?: string;
  severityLevel: "low" | "medium" | "high" | "critical";
  triageScore: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  assignedDriver?: {
    _id: string;
    name: string;
    phone: string;
    driverInfo: {
      ambulanceNumber: string;
      licenseNumber: string;
    };
  };
  assignedHospital?: {
    _id: string;
    name: string;
    address: string;
    phone: string;
  };
  requestTime: string;
  responseTime?: string;
  pickupTime?: string;
  hospitalTime?: string;
  completedTime?: string;
  aiPrediction?: {
    confidence: number;
    suggestedSpecialty: string;
    estimatedTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyResponse {
  success: boolean;
  message: string;
  data?: {
    emergency: Emergency;
  };
  errors?: string[];
}

export interface EmergenciesListResponse {
  success: boolean;
  message: string;
  data?: {
    emergencies: Emergency[];
    total: number;
    page: number;
    limit: number;
  };
  errors?: string[];
}

class EmergencyService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = getBaseURL();
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 25000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem("auth-token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Silent fail - auth will handle redirect
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - completely silent for 401 errors
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear storage silently
          try {
            await AsyncStorage.removeItem("auth-token");
          } catch {
            // Ignore
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get current location from device
   */
  async getCurrentLocation(): Promise<{
    lat: number;
    lng: number;
    address?: string;
  }> {
    try {
      console.log("📍 Requesting location permission...");

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      console.log("📍 Getting current location...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log("✅ Location obtained:", location.coords);

      // Reverse geocode to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addresses.length > 0) {
          const addr = addresses[0];
          const address =
            `${addr.name || ""}, ${addr.street || ""}, ${addr.city || ""}, ${addr.region || ""}, ${addr.country || ""}`.replace(
              /^,\s*|,\s*$/g,
              ""
            );

          return {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            address: address,
          };
        }
      } catch (geocodeError) {
        console.warn("⚠️ Reverse geocoding failed:", geocodeError);
      }

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (error) {
      console.error("❌ Error getting location:", error);
      throw error;
    }
  }

  /**
   * Create a new emergency request with symptoms
   */
  async createEmergency(
    emergencyData: EmergencyData
  ): Promise<EmergencyResponse> {
    try {
      console.log("🚨 Creating emergency with data:", {
        symptoms: emergencyData.symptoms,
        description: emergencyData.description?.substring(0, 50),
        location: emergencyData.location,
      });

      const response = await this.api.post<EmergencyResponse>(
        "/emergencies",
        emergencyData
      );

      console.log("✅ Emergency created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Create emergency error:",
        error.response?.data || error.message
      );

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || "Failed to create emergency request",
        errors: [error.message || "Network error"],
      };
    }
  }

  /**
   * Trigger emergency button - instant critical emergency
   */
  async triggerEmergencyButton(notes?: string): Promise<EmergencyResponse> {
    try {
      // Get current location
      const location = await this.getCurrentLocation();

      const response = await this.api.post<EmergencyResponse>(
        "/emergencies/emergency-button",
        {
          location,
          notes:
            notes || "Emergency button activated - immediate assistance needed",
        }
      );

      return response.data;
    } catch (error: any) {
      // Only log if it's not a 401 error
      if (error.response?.status !== 401) {
        console.error(
          "❌ Emergency button error:",
          error.response?.data || error.message
        );
      }

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || "Failed to trigger emergency",
        errors: [error.message || "Network error"],
      };
    }
  }

  /**
   * Get all emergencies for the current user
   */
  async getEmergencies(
    page: number = 1,
    limit: number = 20
  ): Promise<EmergenciesListResponse> {
    try {
      const response = await this.api.get<EmergenciesListResponse>(
        `/emergencies?page=${page}&limit=${limit}`
      );

      return response.data;
    } catch (error: any) {
      // Completely silent - auth errors are expected when not logged in
      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || "Failed to fetch emergencies",
        errors: [error.message || "Network error"],
      };
    }
  }

  /**
   * Get a specific emergency by ID
   */
  async getEmergencyById(emergencyId: string): Promise<EmergencyResponse> {
    try {
      console.log("📋 Fetching emergency:", emergencyId);

      const response = await this.api.get<EmergencyResponse>(
        `/emergencies/${emergencyId}`
      );

      console.log("✅ Emergency fetched");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Get emergency error:",
        error.response?.data || error.message
      );

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || "Failed to fetch emergency",
        errors: [error.message || "Network error"],
      };
    }
  }

  /**
   * Cancel an emergency request
   */
  async cancelEmergency(
    emergencyId: string,
    reason: string
  ): Promise<EmergencyResponse> {
    try {
      console.log("❌ Cancelling emergency:", emergencyId);

      const response = await this.api.post<EmergencyResponse>(
        `/emergencies/${emergencyId}/cancel`,
        { reason }
      );

      console.log("✅ Emergency cancelled");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Cancel emergency error:",
        error.response?.data || error.message
      );

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || "Failed to cancel emergency",
        errors: [error.message || "Network error"],
      };
    }
  }

  /**
   * Get active emergency (if any)
   */
  async getActiveEmergency(): Promise<EmergencyResponse | null> {
    try {
      const response = await this.getEmergencies(1, 1);

      if (response.success && response.data?.emergencies.length) {
        const emergency = response.data.emergencies[0];

        // Check if emergency is active (not completed or cancelled)
        if (["pending", "accepted", "in_progress"].includes(emergency.status)) {
          return {
            success: true,
            message: "Active emergency found",
            data: { emergency },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Get active emergency error:", error);
      return null;
    }
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
