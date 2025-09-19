// Import ambulance API for real data integration
import { ambulanceAPI } from "../../ambulances/services/ambulanceAPI";

// Transform ambulance data from detailed structure to maps format
const transformAmbulanceForMaps = (ambulance) => {
  return {
    id: ambulance.id,
    status: ambulance.status,
    eta: ambulance.currentCall?.eta || null,
    coords: ambulance.location?.coordinates || [40.7589, -73.9851],
    route: [], // Can be calculated from current call destination
    crew:
      ambulance.crew?.map((member) => ({
        name: member.name,
        role: member.role,
        avatar: member.avatar || null,
      })) || [],
    capacity: ambulance.vehicle?.fuelLevel || 100,
    speed: ambulance.status === "on_route" ? 65 : 0,
  };
};

// Mock data - Enhanced for appealing icons and real-time features (fallback)
const mockAmbulances = [
  {
    id: "AMB123",
    status: "On Route",
    eta: 12,
    coords: [40.7589, -73.9851],
    route: [
      [40.7589, -73.9851],
      [40.7614, -73.9776],
      [40.7505, -73.9934],
    ],
    crew: [
      {
        name: "Erin Vaccaro",
        role: "Nurse",
        avatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      },
      {
        name: "Justin Press",
        role: "Driver",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      },
    ],
    capacity: 85,
    speed: 65, // km/h
  },
  {
    id: "AMB456",
    status: "Idle",
    eta: null,
    coords: [40.7505, -73.9934],
    route: [],
    crew: [
      {
        name: "Sarah Chen",
        role: "Paramedic",
        avatar:
          "https://images.unsplash.com/photo-1594824475967-5dd83ea645a6?w=100&h=100&fit=crop&crop=face",
      },
      {
        name: "Mike Torres",
        role: "Driver",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
    ],
    capacity: 100,
    speed: 0,
  },
  {
    id: "AMB789",
    status: "Busy",
    eta: 8,
    coords: [40.7614, -73.9776],
    route: [
      [40.7614, -73.9776],
      [40.7749, -73.9656],
      [40.7831, -73.9712],
    ],
    crew: [
      {
        name: "David Kim",
        role: "Nurse",
        avatar:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
      },
      {
        name: "Lisa Wang",
        role: "Driver",
        avatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      },
    ],
    capacity: 92,
    speed: 45,
  },
];

const mockHospitals = [
  {
    id: "HOSP42",
    name: "City General Hospital",
    address: "123 Medical Center Dr, New York, NY",
    coords: [40.7505, -73.9934],
    beds: { available: 12, icu: 2, total: 50, icuTotal: 10 },
    status: "Online",
    incomingEmergencies: 3,
    available: true,
    capacity: 76, // 76% capacity
  },
  {
    id: "HOSP43",
    name: "Metropolitan Health Center",
    address: "456 Healthcare Ave, New York, NY",
    coords: [40.7749, -73.9656],
    beds: { available: 0, icu: 0, total: 35, icuTotal: 8 },
    status: "Online",
    incomingEmergencies: 5,
    available: false,
    capacity: 100, // Full capacity
  },
  {
    id: "HOSP44",
    name: "St. Mary's Medical Complex",
    address: "789 Wellness Blvd, New York, NY",
    coords: [40.7831, -73.9712],
    beds: { available: 8, icu: 1, total: 42, icuTotal: 6 },
    status: "Online",
    incomingEmergencies: 2,
    available: true,
    capacity: 81, // 81% capacity
  },
];

const mockHotspots = [
  {
    id: "HS1",
    coords: [40.7589, -73.9851],
    emergencies: 14,
    radius: 500,
    severity: "high",
    coverage: true,
  },
  {
    id: "HS2",
    coords: [40.7614, -73.9776],
    emergencies: 8,
    radius: 300,
    severity: "medium",
    coverage: true,
  },
  {
    id: "HS3",
    coords: [40.7831, -73.9712],
    emergencies: 3,
    radius: 200,
    severity: "low",
    coverage: true,
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API service functions
export const mapsAPI = {
  // Fetch all ambulances - Enhanced with real ambulance API integration
  async fetchAmbulances() {
    try {
      // Try to fetch from real ambulance API first
      const ambulanceResult = await ambulanceAPI.getAll();

      if (ambulanceResult.success && ambulanceResult.data.length > 0) {
        // Transform detailed ambulance data to maps format
        const transformedAmbulances = ambulanceResult.data.map(
          transformAmbulanceForMaps,
        );
        return { data: transformedAmbulances, success: true };
      }
    } catch (error) {
      // Fall back to mock data if API fails - silent fallback in development
    }

    // Fallback to mock data
    await delay(500); // Simulate network delay
    return { data: mockAmbulances, success: true };
  },

  // Fetch all hospitals
  async fetchHospitals() {
    await delay(500);
    return { data: mockHospitals, success: true };
  },

  // Fetch all hotspots
  async fetchHotspots() {
    await delay(300);
    return { data: mockHotspots, success: true };
  },

  // Update ambulance status
  async updateAmbulanceStatus(ambulanceId, status) {
    await delay(200);
    return {
      success: true,
      message: `Ambulance ${ambulanceId} status updated to ${status}`,
    };
  },

  // Update hospital status
  async updateHospitalStatus(hospitalId, status) {
    await delay(200);
    return {
      success: true,
      message: `Hospital ${hospitalId} status updated to ${status}`,
    };
  },

  // Fetch real-time updates (would be WebSocket in real app)
  async fetchRealTimeUpdates() {
    await delay(100);
    return {
      ambulanceUpdates: mockAmbulances.map((amb) => ({
        id: amb.id,
        coords: amb.coords,
        eta: amb.eta ? Math.max(0, amb.eta - 1) : null,
      })),
      hospitalUpdates: mockHospitals.map((hosp) => ({
        id: hosp.id,
        beds: {
          ...hosp.beds,
          available: Math.max(
            0,
            Math.min(
              hosp.beds.total,
              hosp.beds.available + Math.floor(Math.random() * 3) - 1,
            ),
          ),
        },
      })),
    };
  },

  // Initialize real-time data fetching
  async initializeData() {
    try {
      const [ambulancesResult, hospitalsResult, hotspotsResult] =
        await Promise.all([
          this.fetchAmbulances(),
          this.fetchHospitals(),
          this.fetchHotspots(),
        ]);

      return {
        ambulances: ambulancesResult.data,
        hospitals: hospitalsResult.data,
        hotspots: hotspotsResult.data,
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to initialize data",
      };
    }
  },
};
