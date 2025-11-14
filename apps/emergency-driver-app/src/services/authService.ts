import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token: string;
  };
  errors?: string[];
}

class AuthService {
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
   * Login driver
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Logging in driver...');

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
      const response = await this.api.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('❌ Token verification error:', error);
      return {
        success: false,
        message: 'Token verification failed',
      };
    }
  }

  /**
   * Update driver status
   */
  async updateStatus(status: 'available' | 'busy' | 'offline'): Promise<any> {
    try {
      const response = await this.api.put('/users/driver/status', { status });
      return response.data;
    } catch (error: any) {
      console.error('❌ Status update error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
