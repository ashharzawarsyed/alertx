// Service for hospital dashboard API calls
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const hospitalDashboardApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/hospital-dashboard`,
  headers: { "Content-Type": "application/json" },
});

export const hospitalDashboardService = {
  // Example: fetch dashboard data
  getDashboardData: async () => {
    const { data } = await hospitalDashboardApi.get("/");
    return data;
  },
  // Add more hospital-specific API methods here
};

export default hospitalDashboardService;
