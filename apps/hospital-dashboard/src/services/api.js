import axios from "axios";

// Get the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hospital_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("hospital_token");
        localStorage.removeItem("hospital_data");
        window.location.href = "/login";
      } else if (status === 403) {
        console.error("Access forbidden:", data.message);
      } else if (status === 500) {
        console.error("Server error:", data.message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network error - no response received");
    } else {
      // Error setting up request
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
