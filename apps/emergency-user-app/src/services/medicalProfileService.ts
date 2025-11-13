import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../config/config";

// Types for Medical Profile
export interface BasicMedicalInfo {
  bloodType?:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | "Unknown";
  height?: {
    feet: number;
    inches: number;
  };
  weight?: {
    value: number;
    unit: "lbs" | "kg";
  };
  dateOfBirth?: string;
}

export interface Allergy {
  _id?: string;
  allergen: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening";
  reaction?: string;
  dateDiscovered?: string;
}

export interface Medication {
  _id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  notes?: string;
}

export interface MedicalCondition {
  _id?: string;
  condition: string;
  diagnosedDate?: string;
  severity?: "mild" | "moderate" | "severe";
  treatingPhysician?: string;
  notes?: string;
  isActive?: boolean;
}

export interface Surgery {
  _id?: string;
  procedure: string;
  date?: string;
  hospital?: string;
  surgeon?: string;
  complications?: string;
  notes?: string;
}

export interface EmergencyContact {
  _id?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
}

export interface HealthcareProvider {
  _id?: string;
  type: "primary" | "specialist" | "dentist" | "pharmacy";
  name: string;
  specialty?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Insurance {
  _id?: string;
  provider: string;
  policyNumber?: string;
  groupNumber?: string;
  subscriberName?: string;
  relationship?: "self" | "spouse" | "child" | "other";
  effectiveDate?: string;
  expirationDate?: string;
  isPrimary?: boolean;
}

export interface MedicalDocument {
  _id?: string;
  type:
    | "insurance_card"
    | "id_card"
    | "medical_record"
    | "prescription"
    | "lab_result"
    | "xray"
    | "other";
  filename: string;
  originalName?: string;
  fileUrl: string;
  uploadDate?: string;
  description?: string;
  isActive?: boolean;
}

export interface EmergencyInstructions {
  generalInstructions?: string;
  allergicReactionProtocol?: string;
  medicationInstructions?: string;
  doNotResuscitate?: boolean;
  organDonor?: boolean;
  religiousConsiderations?: string;
  languagePreference?: string;
}

export interface MedicalProfile {
  bloodType?: string;
  height?: { feet: number; inches: number };
  weight?: { value: number; unit: string };
  dateOfBirth?: string;
  allergies?: Allergy[];
  medications?: Medication[];
  medicalConditions?: MedicalCondition[];
  surgeries?: Surgery[];
  emergencyContacts?: EmergencyContact[];
  healthcareProviders?: HealthcareProvider[];
  insurance?: Insurance[];
  documents?: MedicalDocument[];
  emergencyInstructions?: EmergencyInstructions;
  profileCompletion?: {
    basicInfo: boolean;
    medicalHistory: boolean;
    emergencyContacts: boolean;
    documents: boolean;
    lastUpdated: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

class MedicalProfileService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_URL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
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
          // Silent fail
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
          await AsyncStorage.removeItem("auth-token");
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get complete medical profile
   */
  async getMedicalProfile(): Promise<ApiResponse<MedicalProfile>> {
    try {
      const response =
        await this.api.get<ApiResponse<MedicalProfile>>("/medical-profile");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch medical profile",
        errors: [error.message],
      };
    }
  }

  /**
   * Update basic medical information
   */
  async updateBasicInfo(
    data: BasicMedicalInfo
  ): Promise<ApiResponse<BasicMedicalInfo>> {
    try {
      const response = await this.api.put<ApiResponse<BasicMedicalInfo>>(
        "/medical-profile/basic-info",
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update basic information",
        errors: [error.message],
      };
    }
  }

  /**
   * Update allergies (replaces all)
   */
  async updateAllergies(allergies: Allergy[]): Promise<ApiResponse<Allergy[]>> {
    try {
      const response = await this.api.post<ApiResponse<Allergy[]>>(
        "/medical-profile/allergies",
        { allergies }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update allergies",
        errors: [error.message],
      };
    }
  }

  /**
   * Update medications (replaces all)
   */
  async updateMedications(
    medications: Medication[]
  ): Promise<ApiResponse<Medication[]>> {
    try {
      const response = await this.api.post<ApiResponse<Medication[]>>(
        "/medical-profile/medications",
        { medications }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update medications",
        errors: [error.message],
      };
    }
  }

  /**
   * Update medical conditions (replaces all)
   */
  async updateMedicalConditions(
    conditions: MedicalCondition[]
  ): Promise<ApiResponse<MedicalCondition[]>> {
    try {
      const response = await this.api.post<ApiResponse<MedicalCondition[]>>(
        "/medical-profile/conditions",
        { conditions }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update medical conditions",
        errors: [error.message],
      };
    }
  }

  /**
   * Update surgeries (replaces all)
   */
  async updateSurgeries(surgeries: Surgery[]): Promise<ApiResponse<Surgery[]>> {
    try {
      const response = await this.api.post<ApiResponse<Surgery[]>>(
        "/medical-profile/surgeries",
        { surgeries }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update surgeries",
        errors: [error.message],
      };
    }
  }

  /**
   * Update emergency contacts (replaces all)
   */
  async updateEmergencyContacts(
    contacts: EmergencyContact[]
  ): Promise<ApiResponse<EmergencyContact[]>> {
    try {
      const response = await this.api.post<ApiResponse<EmergencyContact[]>>(
        "/medical-profile/emergency-contacts",
        { contacts }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update emergency contacts",
        errors: [error.message],
      };
    }
  }

  /**
   * Update healthcare providers
   */
  async updateHealthcareProviders(
    providers: HealthcareProvider[]
  ): Promise<ApiResponse<HealthcareProvider[]>> {
    try {
      const response = await this.api.post<ApiResponse<HealthcareProvider[]>>(
        "/medical-profile/healthcare-providers",
        { providers }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update healthcare providers",
        errors: [error.message],
      };
    }
  }

  /**
   * Update insurance information
   */
  async updateInsurance(
    insurance: Insurance[]
  ): Promise<ApiResponse<Insurance[]>> {
    try {
      const response = await this.api.post<ApiResponse<Insurance[]>>(
        "/medical-profile/insurance",
        { insurance }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update insurance",
        errors: [error.message],
      };
    }
  }

  /**
   * Update emergency instructions
   */
  async updateEmergencyInstructions(
    instructions: EmergencyInstructions
  ): Promise<ApiResponse<EmergencyInstructions>> {
    try {
      const response = await this.api.put<ApiResponse<EmergencyInstructions>>(
        "/medical-profile/emergency-instructions",
        instructions
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update emergency instructions",
        errors: [error.message],
      };
    }
  }

  /**
   * Upload medical document
   */
  async uploadDocument(
    formData: FormData
  ): Promise<ApiResponse<MedicalDocument>> {
    try {
      const response = await this.api.post<ApiResponse<MedicalDocument>>(
        "/medical-profile/documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload document",
        errors: [error.message],
      };
    }
  }

  /**
   * Delete medical document
   */
  async deleteDocument(documentId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete<ApiResponse>(
        `/medical-profile/documents/${documentId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete document",
        errors: [error.message],
      };
    }
  }
}

export const medicalProfileService = new MedicalProfileService();
export default medicalProfileService;
