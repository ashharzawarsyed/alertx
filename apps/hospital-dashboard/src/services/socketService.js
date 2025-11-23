import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(hospitalId, token) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    console.log("Connecting to Socket.IO server:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
        hospitalId,
        role: "hospital",
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupDefaultListeners();

    return this.socket;
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });

    this.socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });
  }

  // Bed update events
  onBedUpdate(callback) {
    if (!this.socket) return;
    this.socket.on("bed:updated", callback);
    this.listeners.set("bed:updated", callback);
  }

  onBedStatusChange(callback) {
    if (!this.socket) return;
    this.socket.on("bed:status_changed", callback);
    this.listeners.set("bed:status_changed", callback);
  }

  // Emergency events
  onNewEmergency(callback) {
    if (!this.socket) return;
    this.socket.on("emergency:new", callback);
    this.listeners.set("emergency:new", callback);
  }

  onEmergencyUpdate(callback) {
    if (!this.socket) return;
    this.socket.on("emergency:updated", callback);
    this.listeners.set("emergency:updated", callback);
  }

  onEmergencyAssigned(callback) {
    if (!this.socket) return;
    this.socket.on("emergency:assigned", callback);
    this.listeners.set("emergency:assigned", callback);
  }

  // Patient events
  onPatientAdmitted(callback) {
    if (!this.socket) return;
    this.socket.on("patient:admitted", callback);
    this.listeners.set("patient:admitted", callback);
  }

  onPatientDischarged(callback) {
    if (!this.socket) return;
    this.socket.on("patient:discharged", callback);
    this.listeners.set("patient:discharged", callback);
  }

  // Emit events
  emitBedUpdate(bedData) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, cannot emit bed update");
      return;
    }
    this.socket.emit("bed:update", bedData);
  }

  emitEmergencyAccept(emergencyId, bedId) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, cannot emit emergency accept");
      return;
    }
    this.socket.emit("emergency:accept", { emergencyId, bedId });
  }

  emitPatientAdmit(patientData) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, cannot emit patient admit");
      return;
    }
    this.socket.emit("patient:admit", patientData);
  }

  // Join hospital room for targeted events
  joinHospitalRoom(hospitalId) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, cannot join hospital room");
      return;
    }
    this.socket.emit("hospital:join", hospitalId);
    console.log(`Joined hospital room: ${hospitalId}`);
  }

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) return;

    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });

    this.listeners.clear();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("Socket.IO disconnected");
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

// Export singleton instance
export default new SocketService();
