const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

class PatientService {
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

  // Get all patients for a hospital
  async getHospitalPatients(hospitalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/patients?hospitalId=${hospitalId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching hospital patients:", error);
      throw error;
    }
  }

  // Get patient details
  async getPatientDetails(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        headers: this.getAuthHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      throw error;
    }
  }

  // Admit patient to bed
  async admitPatient(patientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/admit`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(patientData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error admitting patient:", error);
      throw error;
    }
  }

  // Discharge patient
  async dischargePatient(patientId, dischargeData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/patients/${patientId}/discharge`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(dischargeData),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error discharging patient:", error);
      throw error;
    }
  }

  // Transfer patient to different bed
  async transferPatient(patientId, newBedData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/patients/${patientId}/transfer`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(newBedData),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error transferring patient:", error);
      throw error;
    }
  }

  // Update patient information
  async updatePatient(patientId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating patient:", error);
      throw error;
    }
  }
}

export default new PatientService();
