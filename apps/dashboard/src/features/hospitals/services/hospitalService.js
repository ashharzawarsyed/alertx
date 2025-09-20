import axios from "axios";


// API Base URL - should come from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const hospitalApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/hospitals`,
  headers: {
    "Content-Type": "application/json",
  },
});

// For development/testing - use mock data when backend is not available
// For production - use real backend API only



// Request interceptor to add auth token
hospitalApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
hospitalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      // Removed forced reload. Let UI handle navigation.
    }
    return Promise.reject(error);
  },
);

// Hospital API Service
export const hospitalService = {
  // Get all hospitals
  getHospitals: async (params = {}) => {
    const { data } = await hospitalApi.get("/", { params });
    // The backend returns { success, message, timestamp, data: { hospitals, pagination } }
    return data.data?.hospitals || [];
  },

  // Get hospital by ID
  getHospital: async (id) => {
    const { data } = await hospitalApi.get(`/${id}`);
    return data;
  },

  // Create new hospital
  createHospital: async (hospitalData) => {
    const { data } = await hospitalApi.post("/", hospitalData);
    return data;
  },

  // Update hospital
  updateHospital: async (id, hospitalData) => {
    const { data } = await hospitalApi.put(`/${id}`, hospitalData);
    return data;
  },

  // Delete hospital
  deleteHospital: async (id) => {
    const { data } = await hospitalApi.delete(`/${id}`);
    return data;
  },

  // Get hospital statistics
  getHospitalStats: async () => {
    const { data } = await hospitalApi.get("/stats");
    return data;
  },

  // Search hospitals
  searchHospitals: async (searchParams) => {
    const { data } = await hospitalApi.get("/search", { params: searchParams });
    return data;
  },

  // Update hospital status
  updateHospitalStatus: async (id, status) => {
    const { data } = await hospitalApi.patch(`/${id}/status`, { status });
    return data;
  },

  // Update bed capacity
  updateBedCapacity: async (id, bedData) => {
    const { data } = await hospitalApi.patch(`/${id}/beds`, bedData);
    return data;
  },
};

export default hospitalService;
