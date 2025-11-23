const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

class HospitalService {
  constructor() {
    this.token = localStorage.getItem("hospital_token");
  }

  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token || localStorage.getItem("hospital_token")}`,
    };
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Get hospital details
  async getHospitalDetails(hospitalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
        headers: this.getAuthHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      throw error;
    }
  }

  // Get hospital statistics
  async getHospitalStats(hospitalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/hospitals/${hospitalId}/stats`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching hospital stats:", error);
      throw error;
    }
  }

  // Update bed availability
  async updateBedAvailability(hospitalId, availableBeds) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/hospitals/${hospitalId}/beds`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ availableBeds }),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating bed availability:", error);
      throw error;
    }
  }

  // Update hospital information
  async updateHospitalInfo(hospitalId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating hospital info:", error);
      throw error;
    }
  }

  // Get all hospitals (for reference)
  async getAllHospitals() {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals`, {
        headers: this.getAuthHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      throw error;
    }
  }
}

export default new HospitalService();
