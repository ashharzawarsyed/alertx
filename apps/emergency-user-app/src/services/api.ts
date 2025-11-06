import axios, { AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse } from "../types";

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use your backend URL here - replace with actual backend URL
    this.baseURL = __DEV__
      ? "http://192.168.100.23:5001/api/v1"
      : "https://your-production-api.com/api/v1";

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
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
        const token = await AsyncStorage.getItem("auth-token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle common errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          await AsyncStorage.removeItem("auth-token");
          // You can add navigation logic here
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API responses
  private handleResponse<T>(
    response: AxiosResponse<ApiResponse<T>>
  ): ApiResponse<T> {
    return response.data;
  }

  private handleError(error: any): ApiResponse<any> {
    if (error.response?.data) {
      return error.response.data;
    }

    return {
      success: false,
      message: error.message || "Network error occurred",
      errors: [error.message || "Unknown error"],
    };
  }

  // Auth endpoints
  async signIn(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      const response = await this.api.post("/auth/login", { email, password });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async signUp(
    userData: any
  ): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      const response = await this.api.post("/auth/register", userData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refreshProfile(): Promise<ApiResponse<{ user: any }>> {
    try {
      const response = await this.api.get("/auth/profile");
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // User endpoints
  async updateProfile(userData: any): Promise<ApiResponse<{ user: any }>> {
    try {
      const response = await this.api.put("/users/profile", userData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Emergency endpoints
  async createEmergency(
    emergencyData: any
  ): Promise<ApiResponse<{ emergency: any }>> {
    try {
      const response = await this.api.post("/emergencies", emergencyData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getEmergencies(): Promise<ApiResponse<{ emergencies: any[] }>> {
    try {
      const response = await this.api.get("/emergencies");
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // File upload for medical records
  async uploadMedicalDocument(
    formData: FormData
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      const response = await this.api.post(
        "/users/upload-medical-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.api.get("/");
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Hospital endpoints
  async getHospitals(queryParams?: string): Promise<ApiResponse<any>> {
    try {
      const url = queryParams ? `/hospitals?${queryParams}` : "/hospitals";
      const response = await this.api.get(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getHospitalById(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/hospitals/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
