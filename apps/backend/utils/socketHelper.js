import { Server } from "socket.io";
import { verifyToken } from "./jwtHelper.js";
import Emergency from "../models/Emergency.js";

let io;

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' 
        ? '*' // Allow all origins in development for React Native
        : (process.env.FRONTEND_URLS?.split(",") || ["http://localhost:3000"]),
      credentials: true,
    },
    transports: ['websocket', 'polling'], // Support both transports
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      next();
    } catch {
      next(new Error("Invalid authentication token"));
    }
  });

  // Connection handling
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);
    console.log(`🔍 [SOCKET] User role check: "${socket.userRole}" === "hospital"? ${socket.userRole === "hospital"}`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Join role-specific rooms
    socket.join(`role_${socket.userRole}`);

    // Driver-specific events
    if (socket.userRole === "driver") {
      handleDriverEvents(socket);
    }

    // Patient-specific events
    if (socket.userRole === "patient") {
      handlePatientEvents(socket);
    }

    // Hospital staff events
    if (socket.userRole === "hospital") {
      handleHospitalEvents(socket);
      console.log(`✅ [SOCKET] Hospital user ${socket.userId} - handleHospitalEvents enabled`);
    }

    // Admin events
    if (socket.userRole === "admin") {
      handleAdminEvents(socket);
    }

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  console.log("✅ [SOCKET] Socket.io server initialized");
  console.log("📡 [SOCKET] Transports: websocket, polling");
  console.log("📡 [SOCKET] CORS: enabled for all origins (development)");
  
  return io;
};

/**
 * Handle driver-specific events
 */
const handleDriverEvents = (socket) => {
  // Join driver location updates room
  socket.join("drivers_location");
  
  console.log(`✅ Driver joined rooms:`, {
    driverId: socket.userId,
    rooms: [`user_${socket.userId}`, 'role_driver', 'drivers_location']
  });

  // Driver connected notification
  socket.on("driver:connected", (data) => {
    console.log(`👋 Driver connected event received:`, {
      driverId: socket.userId,
      timestamp: data.timestamp
    });
    
    // Confirm connection by emitting back
    socket.emit("connection:confirmed", {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Location update
  socket.on("driver:updateLocation", async (data) => {
    const { location, timestamp } = data;
    const { lat, lng, speed, heading, accuracy } = location;

    try {
      // Find active emergency assigned to this driver
      const activeEmergency = await Emergency.findOne({
        assignedDriver: socket.userId,
        status: { $in: ["accepted", "in_progress"] },
      });

      if (activeEmergency) {
        // Update ambulance location in emergency document
        activeEmergency.ambulanceLocation = {
          lat,
          lng,
          lastUpdated: new Date(),
          speed: speed || 0,
          heading: heading || 0,
        };
        await activeEmergency.save();

        // Broadcast to patient app (specific emergency room)
        io.to(`emergency_${activeEmergency._id}`).emit("ambulance:locationUpdate", {
          emergencyId: activeEmergency._id.toString(),
          location: { lat, lng },
          speed: speed || 0,
          heading: heading || 0,
          timestamp: new Date(),
        });

        // Broadcast to hospital dashboard
        if (activeEmergency.assignedHospital) {
          io.to(`hospital_${activeEmergency.assignedHospital}`).emit("ambulance:locationUpdate", {
            emergencyId: activeEmergency._id.toString(),
            location: { lat, lng },
            speed: speed || 0,
            heading: heading || 0,
            timestamp: new Date(),
          });
        }

        console.log(`📍 Ambulance location updated for emergency ${activeEmergency._id}:`, { lat, lng });
      }
    } catch (error) {
      console.error("Error updating ambulance location:", error);
    }

    // Also broadcast to general emergency tracking room
    socket.broadcast.to("emergency_tracking").emit("driver:locationUpdate", {
      driverId: socket.userId,
      location: { lat, lng },
      speed: speed || 0,
      heading: heading || 0,
      timestamp: new Date(),
    });
  });

  // Status update
  socket.on("driver:updateStatus", (data) => {
    const { status } = data;

    // Broadcast to admin dashboard
    socket.broadcast.to("role_admin").emit("driver:statusUpdate", {
      driverId: socket.userId,
      status,
      timestamp: new Date(),
    });
  });

  // Trip status update
  socket.on("trip:updateStatus", (data) => {
    const { tripId, status } = data;

    // Emit to specific trip room
    socket.broadcast.to(`trip_${tripId}`).emit("trip:statusUpdate", {
      tripId,
      status,
      timestamp: new Date(),
    });
  });
};

/**
 * Handle patient-specific events
 */
const handlePatientEvents = (socket) => {
  // Join emergency tracking when patient creates emergency
  socket.on("emergency:created", (data) => {
    const { emergencyId } = data;
    socket.join(`emergency_${emergencyId}`);
    socket.join("emergency_tracking");
  });

  // Join emergency room for tracking
  socket.on("emergency:join", (data) => {
    const { emergencyId } = data;
    console.log(`🚪 Patient joining emergency room: ${emergencyId}`);
    socket.join(`emergency_${emergencyId}`);
  });

  // Leave emergency room
  socket.on("emergency:leave", (data) => {
    const { emergencyId } = data;
    console.log(`🚪 Patient leaving emergency room: ${emergencyId}`);
    socket.leave(`emergency_${emergencyId}`);
  });

  // Patient location update during emergency
  socket.on("patient:updateLocation", (data) => {
    const { emergencyId, lat, lng } = data;

    // Broadcast to drivers and emergency room
    socket.broadcast
      .to(`emergency_${emergencyId}`)
      .emit("patient:locationUpdate", {
        emergencyId,
        patientId: socket.userId,
        location: { lat, lng },
        timestamp: new Date(),
      });
  });
};

/**
 * Handle hospital staff events
 */
const handleHospitalEvents = (socket) => {
  console.log(`🏥 [HOSPITAL] Setting up hospital event handlers for user: ${socket.userId}`);
  
  // Join hospital-specific room
  socket.on("hospital:join", (hospitalId) => {
    console.log(`🏥 [HOSPITAL] Staff ${socket.userId} joining room: hospital:${hospitalId}`);
    socket.join(`hospital:${hospitalId}`);
    
    // Confirm join
    socket.emit("hospital:joined", {
      hospitalId,
      message: "Successfully joined hospital room",
      timestamp: new Date(),
    });
    
    console.log(`✅ [HOSPITAL] Staff ${socket.userId} joined hospital:${hospitalId}`);
  });

  // Leave hospital room
  socket.on("hospital:leave", (data) => {
    const { hospitalId } = data;
    console.log(`🚪 [HOSPITAL] Staff leaving hospital room: ${hospitalId}`);
    socket.leave(`hospital:${hospitalId}`);
  });

  // Bed availability update
  socket.on("hospital:updateBeds", (data) => {
    const { hospitalId, availableBeds } = data;
    console.log(`🛏️ [HOSPITAL] Bed update from staff ${socket.userId}:`, { hospitalId, availableBeds });

    // Broadcast to all users tracking hospital availability
    io.emit("hospital:bedUpdate", {
      hospitalId,
      availableBeds,
      timestamp: new Date(),
    });
  });

  // Listen for bed updates request
  socket.on("bed:update", (data) => {
    console.log(`🛏️ [HOSPITAL] Manual bed update received:`, data);
  });
};

/**
 * Handle admin events
 */
const handleAdminEvents = (socket) => {
  // Join admin dashboard room
  socket.join("admin_dashboard");

  // System monitoring
  socket.on("admin:requestSystemStats", () => {
    // Emit current system statistics
    socket.emit("admin:systemStats", {
      connectedUsers: io.engine.clientsCount,
      activeEmergencies: 0, // This would come from database
      activeDrivers: 0, // This would come from database
      timestamp: new Date(),
    });
  });
};

/**
 * Get Socket.io instance
 */
export const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error('❌ Socket.IO not initialized - cannot emit to user');
    return;
  }
  
  const room = `user_${userId}`;
  const socketsInRoom = io.sockets.adapter.rooms.get(room);
  
  console.log(`📡 emitToUser called:`, {
    userId,
    event,
    room,
    socketsInRoom: socketsInRoom ? Array.from(socketsInRoom) : 'none',
    connectedCount: socketsInRoom?.size || 0
  });
  
  io.to(room).emit(event, data);
  
  console.log(`✅ Event '${event}' emitted to room '${room}'`);
};

/**
 * Emit event to all users with specific role
 */
export const emitToRole = (role, event, data) => {
  if (!io) return;
  io.to(`role_${role}`).emit(event, data);
};

/**
 * Emit event to specific emergency
 */
export const emitToEmergency = (emergencyId, event, data) => {
  if (!io) return;
  io.to(`emergency_${emergencyId}`).emit(event, data);
};

/**
 * Emit event to specific trip
 */
export const emitToTrip = (tripId, event, data) => {
  if (!io) return;
  io.to(`trip_${tripId}`).emit(event, data);
};

/**
 * Emit event to specific hospital
 */
export const emitToHospital = (hospitalId, event, data) => {
  if (!io) return;
  io.to(`hospital_${hospitalId}`).emit(event, data);
};

/**
 * Broadcast emergency alert to nearby drivers
 */
export const broadcastEmergencyToDrivers = (emergency, nearbyDriverIds) => {
  if (!io) return;

  nearbyDriverIds.forEach((driverId) => {
    io.to(`user_${driverId}`).emit("emergency:newRequest", {
      emergencyId: emergency._id,
      location: emergency.location,
      severity: emergency.severityLevel,
      symptoms: emergency.symptoms,
      distance: emergency.distance, // calculated distance
      timestamp: new Date(),
    });
  });
};
