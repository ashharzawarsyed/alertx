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
      console.log("✅ [SOCKET] Already connected");
      return this.socket;
    }

    console.log("📡 [SOCKET] Connecting to Socket.IO server:", SOCKET_URL);
    console.log("📡 [SOCKET] Hospital ID:", hospitalId);
    console.log("📡 [SOCKET] Token present:", !!token);

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
      console.log("✅ [SOCKET] Connected successfully!");
      console.log("📡 [SOCKET] Socket ID:", this.socket.id);
      console.log("📡 [SOCKET] Transport:", this.socket.io.engine.transport.name);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ [SOCKET] Disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ [SOCKET] Connection error:", error.message);
      console.error("❌ [SOCKET] Error details:", error);
    });

    this.socket.on("error", (error) => {
      console.error("❌ [SOCKET] Socket error:", error);
    });

    // Listen for hospital join confirmation
    this.socket.on("hospital:joined", (data) => {
      console.log("✅ [SOCKET] Hospital room joined:", data);
    });
  }

  // Bed update events
  onBedUpdate(callback) {
    if (!this.socket) return;
    
    console.log("📡 [SOCKET] Registering listener: bed:updated");
    
    const wrappedCallback = (data) => {
      console.log("🛏️ [EVENT] bed:updated received:", data);
      callback(data);
    };
    
    this.socket.on("bed:updated", wrappedCallback);
    this.listeners.set("bed:updated", wrappedCallback);
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

  onEmergencyIncoming(callback) {
    if (!this.socket) return;
    
    console.log("📡 [SOCKET] Registering listener: emergency:incoming");
    
    const wrappedCallback = (data) => {
      console.log("🚨 [EVENT] emergency:incoming received:", data);
      callback(data);
    };
    
    this.socket.on("emergency:incoming", wrappedCallback);
    this.listeners.set("emergency:incoming", wrappedCallback);
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

  onEmergencyCompleted(callback) {
    if (!this.socket) return;
    this.socket.on("emergency:completed", callback);
    this.listeners.set("emergency:completed", callback);
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
      console.warn("⚠️ [SOCKET] Socket not connected, cannot join hospital room");
      return;
    }
    
    console.log(`📡 [SOCKET] Joining hospital room: hospital:${hospitalId}`);
    this.socket.emit("hospital:join", hospitalId);
    console.log(`✅ [SOCKET] Emitted hospital:join event for: ${hospitalId}`);
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
