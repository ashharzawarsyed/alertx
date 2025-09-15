import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("alertx_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("alertx_admin_token");
      localStorage.removeItem("alertx_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", {
      ...credentials,
      role: "admin", // Ensure only admin login
    });
    return response.data.data; // Extract data from response wrapper
  },

  register: async (userData) => {
    const response = await api.post("/api/v1/auth/register", {
      ...userData,
      role: "admin", // Set role as admin
      status: "pending", // Mark as pending approval
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // Continue logout even if API call fails
    } finally {
      localStorage.removeItem("alertx_admin_token");
      localStorage.removeItem("alertx_admin_user");
    }
  },

  getProfile: async () => {
    const response = await api.get("/api/v1/auth/profile");
    return response.data.data; // Extract data from response wrapper
  },

  refreshToken: async () => {
    const response = await api.post("/api/v1/auth/refresh");
    return response.data;
  },
};

export default api;
