import { io } from "socket.io-client";

import api from "./api";

class TrackingService {
  constructor() {
    this.socket = null;
    this.ambulances = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize Socket.IO connection
  connect(hospitalId, token) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5001";

    this.socket = io(socketUrl, {
      auth: {
        token,
        hospitalId,
        role: "hospital",
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Tracking socket connected");
      this.reconnectAttempts = 0;
      this.socket.emit("hospital:join", hospitalId);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Tracking socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("✅ Reconnected after", attemptNumber, "attempts");
      // Rejoin hospital room
      this.socket.emit("hospital:join", hospitalId);
    });

    return this.socket;
  }

  // Fetch initial ambulance tracking data
  async getAmbulances(hospitalId) {
    try {
      const response = await api.get(
        `/hospitals/${hospitalId}/ambulances/tracking`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching ambulances:", error);
      throw error;
    }
  }

  // Get single ambulance details
  async getAmbulanceDetails(ambulanceId) {
    try {
      const response = await api.get(`/ambulances/${ambulanceId}/details`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ambulance details:", error);
      throw error;
    }
  }

  // Get route between two points
  async getRoute(from, to) {
    try {
      const response = await api.get(
        `/maps/route?from=${from.lat},${from.lng}&to=${to.lat},${to.lng}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching route:", error);
      throw error;
    }
  }

  // Mark ambulance as arrived
  async markArrived(ambulanceId, hospitalId) {
    try {
      const response = await api.put(`/ambulances/${ambulanceId}/arrived`, {
        hospitalId,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Error marking ambulance as arrived:", error);
      throw error;
    }
  }

  // Subscribe to location updates
  onLocationUpdate(callback) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.on("ambulance:location", callback);
  }

  // Subscribe to status updates
  onStatusUpdate(callback) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.on("ambulance:status", callback);
  }

  // Subscribe to new dispatches
  onNewDispatch(callback) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.on("emergency:dispatched", callback);
  }

  // Subscribe to ambulance arrival notifications
  onAmbulanceArrived(callback) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.on("ambulance:arrived", callback);
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.off("ambulance:location");
      this.socket.off("ambulance:status");
      this.socket.off("emergency:dispatched");
      this.socket.off("ambulance:arrived");
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new TrackingService();
