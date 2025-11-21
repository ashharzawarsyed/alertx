import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'driver';
  driverInfo: {
    licenseNumber: string;
    ambulanceNumber: string;
    status: 'available' | 'busy' | 'offline';
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token: string;
  };
  errors?: string[];
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

// Alias for backward compatibility
export type AuthResponse = LoginResponse;

class AuthService {
  private api: AxiosInstance;

  constructor() {
    console.log('🔧 AuthService initializing with API_URL:', Config.API_URL);
    console.log('🔧 Socket URL:', Config.SOCKET_URL);
    
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
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('driver-auth-token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
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
   * Get stored token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('driver-auth-token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Login driver
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Logging in driver...');
      console.log('🌐 API Base URL:', this.api.defaults.baseURL);
      console.log('📧 Email:', credentials.email);

      const response = await this.api.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      if (response.data.success && response.data.data) {
        // Verify user is a driver
        if (response.data.data.user.role !== 'driver') {
          return {
            success: false,
            message: 'Only drivers can use this app',
            errors: ['Invalid role'],
          };
        }

        // Store token
        await AsyncStorage.setItem(
          'driver-auth-token',
          response.data.data.token
        );

        console.log('✅ Driver logged in successfully');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Login failed',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Logout driver
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('driver-auth-token');
      console.log('✅ Driver logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  /**
   * Get stored auth token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('driver-auth-token');
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  /**
   * Verify token and get user data
   */
  async verifyToken(): Promise<AuthResponse> {
    try {
      // Check if token exists first
      const token = await AsyncStorage.getItem('driver-auth-token');
      if (!token) {
        console.log('ℹ️ No token found, skipping verification');
        return {
          success: false,
          message: 'No token found',
        };
      }

      console.log('🔍 Verifying token...');
      const response = await this.api.get<AuthResponse>('/auth/profile');
      console.log('✅ Token verified successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Token verification error:', error.response?.status, error.message);
      // Clear invalid token
      await AsyncStorage.removeItem('driver-auth-token');
      return {
        success: false,
        message: 'Token verification failed',
      };
    }
  }

  /**
   * Request OTP for registration
   */
  async requestRegistrationOTP(data: { name: string; email: string }): Promise<RegisterResponse> {
    try {
      console.log('📧 Requesting registration OTP...');
      console.log('📤 Email:', data.email);

      const response = await this.api.post<RegisterResponse>('/auth/register/otp/request', data);

      console.log('✅ OTP sent successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ OTP request error:', error);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response data:', JSON.stringify(error.response?.data, null, 2));

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Failed to send OTP',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Validate OTP code
   */
  async validateRegistrationOTP(data: { email: string; otp: string }): Promise<RegisterResponse> {
    try {
      console.log('🔍 Validating OTP...');

      const response = await this.api.post<RegisterResponse>('/auth/register/otp/validate', data);

      console.log('✅ OTP validated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ OTP validation error:', error);

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Invalid or expired OTP',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Verify OTP and register driver
   */
  async verifyOTPAndRegister(data: {
    email: string;
    otp: string;
    name: string;
    phone: string;
    password: string;
    role: 'driver';
    driverInfo: {
      licenseNumber: string;
      ambulanceNumber: string;
      status: 'available' | 'busy' | 'offline';
    };
  }): Promise<RegisterResponse> {
    try {
      console.log('📝 Verifying OTP and registering driver...');
      console.log('📤 Registration data:', JSON.stringify({ ...data, password: '***' }, null, 2));

      const response = await this.api.post<RegisterResponse>('/auth/register/otp/verify', data);

      console.log('✅ Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response data:', JSON.stringify(error.response?.data, null, 2));

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Registration failed',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Register new driver (legacy method - direct registration without OTP)
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      console.log('📝 Registering new driver...');
      console.log('📤 Registration data:', JSON.stringify(data, null, 2));

      const response = await this.api.post<RegisterResponse>('/auth/register', data);

      console.log('✅ Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response data:', JSON.stringify(error.response?.data, null, 2));

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: error.message || 'Registration failed',
        errors: [error.message || 'Network error'],
      };
    }
  }

  /**
   * Request password reset code
   */
  async requestPasswordReset(email: string): Promise<any> {
    try {
      console.log('📧 Requesting password reset for:', email);

      const response = await this.api.post('/auth/forgot-password', { email });

      console.log('✅ Reset code sent');
      return response.data;
    } catch (error: any) {
      console.error('❌ Password reset request error:', error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw new Error(error.message || 'Failed to send reset code');
    }
  }

  /**
   * Reset password with code
   */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<any> {
    try {
      console.log('🔒 Resetting password...');

      const response = await this.api.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });

      console.log('✅ Password reset successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Password reset error:', error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw new Error(error.message || 'Failed to reset password');
    }
  }

  /**
   * Update driver status
   */
  async updateStatus(status: 'available' | 'busy' | 'offline') {
    try {
      const response = await this.api.put('/drivers/status', { status });
      return response.data;
    } catch (error: any) {
      console.error('❌ Update status error:', error);
      throw error;
    }
  }

  /**
   * Update driver status (new endpoint with database persistence)
   */
  async updateDriverStatus(status: 'available' | 'busy' | 'offline'): Promise<any> {
    try {
      console.log(`🔄 Updating driver status to: ${status}`);
      
      const response = await this.api.put('/users/driver/status', { status });
      
      if (response.data.success) {
        console.log('✅ Driver status updated in database');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('❌ Update driver status error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
