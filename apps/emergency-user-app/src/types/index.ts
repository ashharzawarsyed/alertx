export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "patient" | "driver" | "hospital" | "admin";
  location: {
    lat: number;
    lng: number;
  };
  notifiers: string[];
  medicalProfile?: MedicalProfile;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalProfile {
  basicInfo: {
    age: number;
    gender: "male" | "female" | "other";
    bloodType: string;
    height?: number;
    weight?: number;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };

  conditions: {
    chronic: string[];
    past: string[];
    current: string[];
  };

  allergies: {
    medications: string[];
    food: string[];
    environmental: string[];
  };

  medications: {
    current: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    past: {
      name: string;
      reason: string;
    }[];
  };

  documents: {
    type:
      | "prescription"
      | "lab_result"
      | "medical_record"
      | "insurance"
      | "other";
    url: string;
    description: string;
    uploadedAt: string;
  }[];

  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface SignUpData {
  // Step 1: Basic Info
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  // Step 2: Location
  location: {
    lat: number;
    lng: number;
  };

  // Step 3: Medical Info
  medicalProfile: Partial<MedicalProfile>;

  // Step 4: Emergency Contacts
  emergencyContacts: EmergencyContact[];
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  formData: Partial<SignUpData>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface Emergency {
  _id: string;
  patient: string;
  symptoms: string[];
  description?: string;
  severityLevel: "low" | "medium" | "high" | "critical";
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  assignedDriver?: string;
  assignedHospital?: string;
  requestTime: string;
  responseTime?: string;
  pickupTime?: string;
  hospitalTime?: string;
  completedTime?: string;
}

export type NavigationParamList = {
  Onboarding: undefined;
  Splash: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  Emergency: undefined;
  Profile: undefined;
};
