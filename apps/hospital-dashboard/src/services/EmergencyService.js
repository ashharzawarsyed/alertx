// Emergency Management API Service
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

// TEMPORARY: Use mock data while API endpoints are being fixed
const USE_MOCK_DATA = false;

// Block ALL API calls when hospital ID is undefined
const BLOCK_UNDEFINED_HOSPITAL_CALLS = true;

// Cache buster to ensure latest code is loaded
console.log("EmergencyService loaded at:", new Date().toISOString());

class EmergencyService {
  constructor() {
    this.token =
      localStorage.getItem("hospital_token") || localStorage.getItem("token");
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  // Get all active emergencies
  async getActiveEmergencies() {
    if (USE_MOCK_DATA) {
      return this.getMockEmergencies();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/emergencies/active`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emergencies");
      }

      const result = await response.json();
      return result.data || []; // Extract the data array from the API response
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      // Return mock data as fallback
      return this.getMockEmergencies();
    }
  }

  // Get ambulance fleet status
  async getAmbulanceFleet(hospitalId) {
    if (USE_MOCK_DATA || !hospitalId || hospitalId === "undefined") {
      return this.getMockAmbulances();
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/ambulances/hospital/${hospitalId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ambulances");
      }

      const result = await response.json();
      return result.data || []; // Extract the data array from the API response
    } catch (error) {
      console.error("Error fetching ambulances:", error);
      // Return mock data as fallback
      return this.getMockAmbulances();
    }
  }

  // Get hospital metrics
  async getHospitalMetrics() {
    if (USE_MOCK_DATA) {
      return this.getMockMetrics();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/metrics`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching metrics:", error);
      // Return mock data as fallback
      return this.getMockMetrics();
    }
  }

  // Dispatch ambulance to emergency
  async dispatchAmbulance(emergencyId, ambulanceId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/emergencies/${emergencyId}/dispatch`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ ambulanceId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to dispatch ambulance");
      }

      return await response.json();
    } catch (error) {
      console.error("Error dispatching ambulance:", error);
      throw error;
    }
  }

  // Get incoming patients for specific hospital
  async getIncomingPatients(hospitalId) {
    if (USE_MOCK_DATA || !hospitalId || hospitalId === "undefined") {
      return this.getMockIncomingPatients();
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/patients/hospital/${hospitalId}/incoming`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch incoming patients");
      }

      const result = await response.json();
      return result.data || []; // Extract the data array from the API response
    } catch (error) {
      console.error("Error fetching incoming patients:", error);
      // Return mock data as fallback
      return this.getMockIncomingPatients();
    }
  }

  // Get critical alerts for hospital
  async getCriticalAlerts(hospitalId) {
    if (USE_MOCK_DATA || !hospitalId || hospitalId === "undefined") {
      return this.getMockCriticalAlerts();
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/patients/hospital/${hospitalId}/critical`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return this.getMockCriticalAlerts();
    }
  }

  // Accept incoming patient
  async acceptIncomingPatient(patientId, bedAssignment) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/patients/${patientId}/accept`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ bedAssignment }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept patient");
      }

      return await response.json();
    } catch (error) {
      console.error("Error accepting patient:", error);
      throw error;
    }
  }
  async updateEmergencyStatus(emergencyId, status) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/emergencies/${emergencyId}/status`,
        {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update emergency status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating emergency status:", error);
      throw error;
    }
  }

  // Mock data methods (fallbacks)
  getMockEmergencies() {
    return [
      {
        id: "E001",
        patientName: "Sarah Johnson",
        patientAge: 34,
        patientGender: "Female",
        condition: "Chest pain with shortness of breath",
        priority: "critical",
        status: "pending",
        location: "123 Main St, Downtown",
        createdAt: new Date(Date.now() - 10 * 60000),
        symptoms: ["Chest pain", "Shortness of breath", "Dizziness"],
        vitals: {
          heartRate: "110 bpm",
          bloodPressure: "140/90",
          temperature: "99.2°F",
        },
      },
      {
        id: "E002",
        patientName: "Michael Chen",
        patientAge: 28,
        patientGender: "Male",
        condition: "Motor vehicle accident - possible fractures",
        priority: "high",
        status: "dispatched",
        location: "456 Oak Avenue, Westside",
        createdAt: new Date(Date.now() - 25 * 60000),
        assignedAmbulance: { id: "A102" },
        estimatedResponseTime: 8,
        symptoms: ["Leg pain", "Back pain", "Confusion"],
      },
      {
        id: "E003",
        patientName: "Emma Rodriguez",
        patientAge: 45,
        patientGender: "Female",
        condition: "Severe allergic reaction",
        priority: "high",
        status: "enroute",
        location: "789 Pine Street, Northside",
        createdAt: new Date(Date.now() - 40 * 60000),
        assignedAmbulance: { id: "A101" },
        estimatedResponseTime: 3,
        symptoms: ["Swelling", "Difficulty breathing", "Hives"],
      },
      {
        id: "E004",
        patientName: "Robert Williams",
        patientAge: 67,
        patientGender: "Male",
        condition: "Suspected stroke - left side weakness",
        priority: "critical",
        status: "pending",
        location: "321 Elm Street, Eastside",
        createdAt: new Date(Date.now() - 5 * 60000),
        symptoms: ["Left side weakness", "Slurred speech", "Confusion"],
        vitals: {
          heartRate: "88 bpm",
          bloodPressure: "180/110",
          temperature: "98.6°F",
        },
      },
      {
        id: "E005",
        patientName: "Jessica Taylor",
        patientAge: 29,
        patientGender: "Female",
        condition: "Pregnancy complications - preterm labor",
        priority: "high",
        status: "pending",
        location: "987 Maple Drive, Southside",
        createdAt: new Date(Date.now() - 15 * 60000),
        symptoms: ["Contractions", "Bleeding", "Abdominal pain"],
        vitals: {
          heartRate: "95 bpm",
          bloodPressure: "130/85",
          temperature: "99.1°F",
        },
      },
      {
        id: "E006",
        patientName: "David Smith",
        patientAge: 52,
        patientGender: "Male",
        condition: "Industrial accident - chemical burns",
        priority: "high",
        status: "dispatched",
        location: "Industrial District, Factory 15",
        createdAt: new Date(Date.now() - 35 * 60000),
        assignedAmbulance: { id: "A104" },
        estimatedResponseTime: 12,
        symptoms: ["Chemical burns", "Eye irritation", "Breathing difficulty"],
      },
    ];
  }

  getMockAmbulances() {
    return [
      {
        id: "A101",
        callSign: "Unit Alpha-1",
        status: "enroute",
        driver: { name: "James Wilson" },
        location: "Pine Street Area",
        currentAssignment: { id: "E003" },
        estimatedArrival: 3,
        equipment: ["AED", "Oxygen", "IV Kit", "Stretcher"],
      },
      {
        id: "A102",
        callSign: "Unit Beta-2",
        status: "dispatched",
        driver: { name: "Maria Garcia" },
        location: "Oak Avenue Area",
        currentAssignment: { id: "E002" },
        estimatedArrival: 8,
        equipment: ["AED", "Oxygen", "Trauma Kit", "Stretcher"],
      },
      {
        id: "A103",
        callSign: "Unit Gamma-3",
        status: "available",
        driver: { name: "David Kumar" },
        location: "Central Station",
        equipment: ["AED", "Oxygen", "IV Kit", "Stretcher"],
      },
      {
        id: "A104",
        callSign: "Unit Delta-4",
        status: "dispatched",
        driver: { name: "Lisa Thompson" },
        location: "Industrial District",
        currentAssignment: { id: "E006" },
        estimatedArrival: 12,
        equipment: ["AED", "Oxygen", "HAZMAT Kit", "Stretcher"],
      },
      {
        id: "A105",
        callSign: "Unit Echo-5",
        status: "available",
        driver: { name: "Robert Chen" },
        location: "Hospital Base",
        equipment: ["AED", "Oxygen", "Advanced Life Support", "Stretcher"],
      },
      {
        id: "A106",
        callSign: "Unit Foxtrot-6",
        status: "maintenance",
        driver: { name: "Sarah Anderson" },
        location: "Maintenance Bay",
        equipment: ["Basic Kit"],
      },
      {
        id: "A107",
        callSign: "Unit Golf-7",
        status: "available",
        driver: { name: "Michael Torres" },
        location: "Southside Station",
        equipment: ["AED", "Oxygen", "Pediatric Kit", "Stretcher"],
      },
    ];
  }

  getMockMetrics() {
    const emergencies = this.getMockEmergencies();
    const ambulances = this.getMockAmbulances();

    return {
      activeEmergencies: emergencies.filter((e) =>
        ["pending", "dispatched", "enroute"].includes(e.status)
      ).length,
      availableAmbulances: ambulances.filter((a) => a.status === "available")
        .length,
      totalAmbulances: ambulances.length,
      averageResponseTime: 9,
      completedToday: 23,
      hospitalCapacity: {
        emergency: { total: 25, available: 8 },
        icu: { total: 18, available: 4 },
        general: { total: 180, available: 52 },
      },
    };
  }

  // Mock incoming patients data
  getMockIncomingPatients() {
    return [
      {
        id: "IP001",
        patientName: "Sarah Johnson",
        patientAge: 34,
        patientGender: "Female",
        condition: "Chest pain with shortness of breath",
        priority: "critical",
        ambulanceId: "A101",
        estimatedArrival: 3,
        vitals: {
          heartRate: "110 bpm",
          bloodPressure: "140/90",
          oxygenSaturation: "92%",
          temperature: "99.2°F",
          consciousness: "Alert",
        },
        symptoms: ["Chest pain", "Shortness of breath", "Dizziness"],
        allergies: ["Penicillin"],
        medications: ["Aspirin 81mg daily"],
        emergencyContact: {
          name: "John Johnson",
          relationship: "Husband",
          phone: "(555) 123-4567",
        },
        paramedic: {
          name: "Dr. James Wilson",
          phone: "(555) 911-0001",
        },
        location: {
          current: "Pine Street Area",
          pickup: "123 Main St, Downtown",
        },
        notes:
          "Patient reports crushing chest pain started 45 minutes ago. ECG shows ST elevation. Administered oxygen and aspirin.",
      },
      {
        id: "IP002",
        patientName: "Robert Williams",
        patientAge: 67,
        patientGender: "Male",
        condition: "Suspected stroke - left side weakness",
        priority: "critical",
        ambulanceId: "A103",
        estimatedArrival: 8,
        vitals: {
          heartRate: "88 bpm",
          bloodPressure: "180/110",
          oxygenSaturation: "96%",
          temperature: "98.6°F",
          consciousness: "Confused",
        },
        symptoms: ["Left side weakness", "Slurred speech", "Facial drooping"],
        allergies: ["None known"],
        medications: ["Metformin", "Lisinopril"],
        emergencyContact: {
          name: "Mary Williams",
          relationship: "Wife",
          phone: "(555) 234-5678",
        },
        paramedic: {
          name: "Dr. Maria Garcia",
          phone: "(555) 911-0003",
        },
        location: {
          current: "Central Station",
          pickup: "321 Elm Street, Eastside",
        },
        notes:
          "Symptoms started 2 hours ago. Last known normal time 14:30. FAST scale positive. IV established.",
      },
    ];
  }

  // Mock critical alerts
  getMockCriticalAlerts() {
    return [
      {
        id: "CA001",
        type: "incoming_critical",
        priority: "critical",
        title: "Critical Patient Incoming",
        message:
          "Chest pain patient (Sarah Johnson) arriving in 3 minutes. Prepare cardiac team.",
        timestamp: new Date(Date.now() - 2 * 60000),
        patientId: "IP001",
        action: "prepare_team",
      },
      {
        id: "CA002",
        type: "bed_shortage",
        priority: "high",
        title: "ICU Bed Capacity Critical",
        message: "Only 2 ICU beds available. Consider transfers or discharges.",
        timestamp: new Date(Date.now() - 10 * 60000),
        action: "manage_capacity",
      },
      {
        id: "CA003",
        type: "incoming_stroke",
        priority: "critical",
        title: "Stroke Alert",
        message:
          "Suspected stroke patient (Robert Williams) arriving in 8 minutes. Activate stroke protocol.",
        timestamp: new Date(Date.now() - 1 * 60000),
        patientId: "IP002",
        action: "activate_protocol",
      },
    ];
  }
}

export default new EmergencyService();
