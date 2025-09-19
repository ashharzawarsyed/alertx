import axios from "axios";
import { mockHospitals, mockStats } from "../data/mockData";

// API Base URL - should come from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const hospitalApi = axios.create({
  baseURL: `${API_BASE_URL}/hospitals`,
  headers: {
    "Content-Type": "application/json",
  },
});

// For development/testing - use mock data when backend is not available
const USE_MOCK_DATA = true; // Set to false when backend is ready

// Mock API delay to simulate real API calls
const mockDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { hospitals: mockHospitals, total: mockHospitals.length };
    }
    const { data } = await hospitalApi.get("/", { params });
    return data;
  },

  // Get hospital by ID
  getHospital: async (id) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const hospital = mockHospitals.find((h) => h.id === parseInt(id));
      if (!hospital) throw new Error("Hospital not found");
      return hospital;
    }
    const { data } = await hospitalApi.get(`/${id}`);
    return data;
  },

  // Create new hospital
  createHospital: async (hospitalData) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const newHospital = {
        ...hospitalData,
        id: Math.max(...mockHospitals.map((h) => h.id)) + 1,
        lastUpdated: "just now",
      };
      mockHospitals.push(newHospital);
      return newHospital;
    }
    const { data } = await hospitalApi.post("/", hospitalData);
    return data;
  },

  // Update hospital
  updateHospital: async (id, hospitalData) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = mockHospitals.findIndex((h) => h.id === parseInt(id));
      if (index === -1) throw new Error("Hospital not found");
      const updatedHospital = {
        ...mockHospitals[index],
        ...hospitalData,
        lastUpdated: "just now",
      };
      mockHospitals[index] = updatedHospital;
      return updatedHospital;
    }
    const { data } = await hospitalApi.put(`/${id}`, hospitalData);
    return data;
  },

  // Delete hospital
  deleteHospital: async (id) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = mockHospitals.findIndex((h) => h.id === parseInt(id));
      if (index === -1) throw new Error("Hospital not found");
      const deletedHospital = mockHospitals.splice(index, 1)[0];
      return { success: true, hospital: deletedHospital };
    }
    const { data } = await hospitalApi.delete(`/${id}`);
    return data;
  },

  // Get hospital statistics
  getHospitalStats: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return mockStats;
    }
    const { data } = await hospitalApi.get("/stats");
    return data;
  },

  // Search hospitals
  searchHospitals: async (searchParams) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const { query } = searchParams;
      const filteredHospitals = mockHospitals.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(query.toLowerCase()) ||
          hospital.location.toLowerCase().includes(query.toLowerCase()),
      );
      return { hospitals: filteredHospitals, total: filteredHospitals.length };
    }
    const { data } = await hospitalApi.get("/search", { params: searchParams });
    return data;
  },

  // Update hospital status
  updateHospitalStatus: async (id, status) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = mockHospitals.findIndex((h) => h.id === parseInt(id));
      if (index === -1) throw new Error("Hospital not found");
      mockHospitals[index].status = status;
      mockHospitals[index].lastUpdated = "just now";
      return mockHospitals[index];
    }
    const { data } = await hospitalApi.patch(`/${id}/status`, { status });
    return data;
  },

  // Update bed capacity
  updateBedCapacity: async (id, bedData) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = mockHospitals.findIndex((h) => h.id === parseInt(id));
      if (index === -1) throw new Error("Hospital not found");
      mockHospitals[index] = {
        ...mockHospitals[index],
        ...bedData,
        lastUpdated: "just now",
      };
      return mockHospitals[index];
    }
    const { data } = await hospitalApi.patch(`/${id}/beds`, bedData);
    return data;
  },
};

export default hospitalService;
