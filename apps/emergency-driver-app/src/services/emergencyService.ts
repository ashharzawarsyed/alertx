import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

export interface Emergency {
  _id: string;
  patient: {
    _id: string;
    name: string;
    phone: string;
    medicalProfile?: any;
  };
  symptoms: string[];
  description?: string;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  triageScore: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
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
  aiPrediction?: {
    confidence: number;
    emergencyType: string;
    nlpInsights?: any;
    detectedSymptoms?: any[];
    recommendations?: string[];
  };
  requestTime: string;
  responseTime?: string;
  pickupTime?: string;
  hospitalTime?: string;
  completedTime?: string;
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

  constructor() {
    this.api = axios.create({
      baseURL: Config.API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('driver-auth-token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Silent
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('driver-auth-token');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get emergencies assigned to driver
   */
  async getDriverEmergencies(
    page: number = 1,
    limit: number = 20
  ): Promise<EmergenciesListResponse> {
    try {
      console.log('📋 Fetching driver emergencies...');

      const response = await this.api.get<EmergenciesListResponse>(
        `/emergencies?page=${page}&limit=${limit}`
      );

      console.log('✅ Driver emergencies fetched');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get emergencies error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to fetch emergencies',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Get emergency by ID
   */
  async getEmergencyById(emergencyId: string): Promise<EmergencyResponse> {
    try {
      console.log('📋 Fetching emergency:', emergencyId);

      const response = await this.api.get<EmergencyResponse>(
        `/emergencies/${emergencyId}`
      );

      console.log('✅ Emergency fetched');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get emergency error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to fetch emergency',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Accept emergency
   */
  async acceptEmergency(emergencyId: string): Promise<EmergencyResponse> {
    try {
      console.log('✅ Accepting emergency:', emergencyId);

      const response = await this.api.post<EmergencyResponse>(
        `/emergencies/${emergencyId}/accept`
      );

      console.log('✅ Emergency accepted');
      return response.data;
    } catch (error: any) {
      console.error('❌ Accept emergency error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to accept emergency',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Reject/Decline emergency (forwards to next driver)
   */
  async rejectEmergency(
    emergencyId: string,
    reason?: string
  ): Promise<EmergencyResponse> {
    try {
      console.log('🚫 Rejecting emergency:', emergencyId);

      const response = await this.api.post<EmergencyResponse>(
        `/emergencies/${emergencyId}/reject`,
        { reason }
      );

      console.log('✅ Emergency rejected');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reject emergency error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to reject emergency',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Update emergency status
   */
  async updateEmergencyStatus(
    emergencyId: string,
    status: 'in_progress' | 'completed' | 'cancelled',
    note?: string
  ): Promise<EmergencyResponse> {
    try {
      console.log('🔄 Updating emergency status:', status);

      const response = await this.api.put<EmergencyResponse>(
        `/emergencies/${emergencyId}/status`,
        { status, note }
      );

      console.log('✅ Emergency status updated');
      return response.data;
    } catch (error: any) {
      console.error('❌ Update status error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to update status',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Mark patient picked up
   */
  async markPickedUp(emergencyId: string): Promise<EmergencyResponse> {
    try {
      const response = await this.api.put<EmergencyResponse>(
        `/emergencies/${emergencyId}/pickup`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Pickup error:', error);
      throw error;
    }
  }

  /**
   * Mark arrived at hospital
   */
  async markArrivedAtHospital(
    emergencyId: string
  ): Promise<EmergencyResponse> {
    try {
      const response = await this.api.put<EmergencyResponse>(
        `/emergencies/${emergencyId}/hospital-arrival`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Hospital arrival error:', error);
      throw error;
    }
  }

  /**
   * Complete emergency
   */
  async completeEmergency(emergencyId: string): Promise<EmergencyResponse> {
    return this.updateEmergencyStatus(emergencyId, 'completed');
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
