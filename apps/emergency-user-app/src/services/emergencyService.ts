import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import Config from "../config/config";

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
    this.baseURL = Config.API_URL;
    console.log('🔧 EmergencyService initialized with baseURL:', this.baseURL);
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

  /**
   * Get emergency details with driver and hospital info
   */
  async getEmergencyDetails(
    emergencyId: string
  ): Promise<EmergencyResponse> {
    try {
      console.log("🔍 Fetching emergency details:", emergencyId);

      const response = await this.api.get<EmergencyResponse>(
        `/emergencies/${emergencyId}`
      );

      console.log("✅ Emergency details fetched");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Get emergency details error:",
        error.response?.data || error.message
      );

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || "Failed to fetch emergency details",
        errors: [error.message || "Network error"],
      };
    }
  }

  /**
   * Get driver's current location (simulated for now)
   * TODO: Replace with Socket.IO or polling when backend supports it
   */
  async getDriverLocation(
    driverId: string
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      // In production, this would be a real-time API or Socket.IO
      // For now, we'll simulate driver location near the patient
      console.log("📍 Getting driver location (simulated):", driverId);

      // Return simulated location
      // TODO: Implement actual driver location tracking
      return null;
    } catch (error) {
      console.error("❌ Get driver location error:", error);
      return null;
    }
  }

  /**
   * Calculate ETA based on current locations
   */
  calculateETA(
    driverLocation: { lat: number; lng: number },
    patientLocation: { lat: number; lng: number }
  ): number {
    // Simple distance calculation using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(patientLocation.lat - driverLocation.lat);
    const dLng = this.toRad(patientLocation.lng - driverLocation.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(driverLocation.lat)) *
        Math.cos(this.toRad(patientLocation.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Assume average speed of 40 km/h in city
    const eta = (distance / 40) * 60; // Convert to minutes

    return Math.round(eta);
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Analyze symptoms using NLP AI service
   */
  async analyzeSymptoms(
    symptoms: string,
    patientInfo?: {
      age?: number;
      gender?: string;
      medicalHistory?: string[];
    }
  ): Promise<any> {
    try {
      console.log('🔍 Analyzing symptoms with NLP...');

      const response = await axios.post(
        'http://localhost:3001/api/triage/analyze',
        {
          symptoms,
          patientInfo: patientInfo || {},
        },
        {
          timeout: 5000,
        }
      );

      console.log('✅ NLP analysis complete');
      return {
        success: true,
        data: response.data.analysis,
      };
    } catch (error: any) {
      console.error('❌ NLP analysis error:', error);
      return {
        success: false,
        message: error.message || 'Failed to analyze symptoms',
      };
    }
  }

  /**
   * Dispatch intelligent ambulance based on AI triage analysis
   */
  async dispatchIntelligentAmbulance(
    triageResult: any,
    userLocation: { lat: number; lng: number },
    additionalData?: {
      symptoms?: string;
      description?: string;
    }
  ): Promise<EmergencyResponse> {
    try {
      console.log('🚑 Dispatching intelligent ambulance...');
      console.log('📍 API baseURL:', this.baseURL);
      console.log('📍 Full URL will be:', this.baseURL + '/emergencies/dispatch-intelligent');

      // Prepare symptoms array
      const symptomsArray = additionalData?.symptoms 
        ? additionalData.symptoms.split(', ') 
        : triageResult.detectedSymptoms?.map((s: any) => s.keyword) || ['Unknown symptoms'];

      const response = await this.api.post<EmergencyResponse>(
        '/emergencies/dispatch-intelligent',
        {
          triageResult,
          location: userLocation,
          symptoms: symptomsArray,
          description: additionalData?.description || `AI-analyzed: ${triageResult.emergencyType}`,
          severityLevel: triageResult.severity,
          nlpAnalysis: triageResult.nlpInsights,
        }
      );

      console.log('✅ Intelligent ambulance dispatched');
      return response.data;
    } catch (error: any) {
      console.error('❌ Dispatch error:', error.response?.data || error.message);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to dispatch ambulance',
        errors: [error.message || 'Network error'],
      };
    }
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
