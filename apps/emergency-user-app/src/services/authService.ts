import { Alert, Platform } from "react-native";
import Config from "../config/config";

const API_BASE_URL = Config.API_URL;

export interface SignUpData {
  email: string;
  password: string;
  name: string; // Combined full name for backend
  // Basic Info (frontend only)
  firstName?: string;
  lastName?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  role?: string;

  // Address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Emergency Contacts
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }[];

  // Medical Information
  medicalProfile: {
    bloodType?: string;
    height?: { feet: number; inches: number };
    weight?: { value: number; unit: string };
    allergies?: {
      allergen: string;
      severity: string;
      reaction?: string;
    }[];
    medications?: {
      name: string;
      dosage?: string;
      frequency?: string;
    }[];
    medicalConditions?: {
      condition: string;
      severity?: string;
      notes?: string;
    }[];
    primaryPhysician?: {
      name: string;
      phone: string;
      specialty?: string;
    };
    insurance?: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
    };
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`🌐 Making API request to: ${url}`);
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`🔧 Request options:`, {
        method: options.method || "GET",
        headers: options.headers,
        body: options.body ? "present" : "none",
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Request timeout after 25 seconds")),
          25000
        );
      });

      // Race between fetch and timeout
      const response = (await Promise.race([
        fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        }),
        timeoutPromise,
      ])) as Response;

      console.log(
        `📊 Response status: ${response.status} ${response.statusText}`
      );

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Backend returned HTML or non-JSON response
        const text = await response.text();
        console.error(`❌ Non-JSON response received:`, text.substring(0, 500));
        throw new Error(
          `Server error: Expected JSON but received ${contentType || "unknown"} content. This usually means a server crash or misconfiguration.`
        );
      }

      if (!response.ok) {
        console.error(`❌ API Error Response:`, data);
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      }

      console.log(`✅ Successful API request to: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`🚨 API request failed for ${endpoint}:`, error);

      const errorDetails = error as Error;
      console.error(`🔍 Error details:`, {
        name: errorDetails.name || "Unknown",
        message: errorDetails.message || "No message",
        stack: errorDetails.stack?.split("\n")[0] || "No stack trace",
      });

      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        throw new Error(
          `Cannot connect to server at ${API_BASE_URL}. Please ensure:\n1. Backend server is running\n2. Network connectivity is available\n3. No firewall blocking connections`
        );
      }

      throw error;
    }
  }

  async signUp(userData: SignUpData) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials: SignInData) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async requestOTP(email: string, name?: string) {
    return this.makeRequest("/auth/register/otp/request", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  }

  async validateOTP(email: string, otp: string) {
    return this.makeRequest("/auth/register/otp/validate", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  }

  async verifyOTPAndRegister(data: SignUpData & { otp: string }) {
    console.log("📤 Sending registration data:", {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      hasPassword: !!data.password,
      hasOTP: !!data.otp,
      hasAddress: !!data.address,
      hasEmergencyContacts: !!data.emergencyContacts,
      emergencyContactsCount: data.emergencyContacts?.length,
    });
    return this.makeRequest("/auth/register/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOTP(email: string, name?: string) {
    return this.makeRequest("/auth/register/otp/request", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  }

  async requestPasswordReset(email: string) {
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.makeRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    });
  }

  async updateProfile(
    userId: string,
    profileData: Partial<SignUpData>,
    token: string
  ) {
    return this.makeRequest(`/users/${userId}/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  // Helper method to handle API errors with user-friendly messages
  static handleError(error: any) {
    let message = "An unexpected error occurred. Please try again.";

    if (error.message) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    Alert.alert("Error", message);
    return message;
  }
}

export const authService = new AuthService();
