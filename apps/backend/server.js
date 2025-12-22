import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { startScheduler } from "./services/schedulerService.js";
import { initializeSocket } from "./utils/socketHelper.js";

const PORT = process.env.PORT || 5000;

// Start server function - only called after MongoDB connection
const startServer = () => {
  // Start server - listen on all interfaces for emulator connectivity
  const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  🚀 AlertX Backend Server Started
  📍 Environment: ${process.env.NODE_ENV}
  🌐 Port: ${PORT}
  📱 API: http://localhost:${PORT}
  📊 Health: http://localhost:${PORT}/
  🔗 Emulator: http://10.0.2.2:${PORT}
  `);
  
  // Initialize Socket.IO server and attach to app
  const io = initializeSocket(server);
  app.set('io', io);
  console.log("✅ [SOCKET] IO instance attached to Express app");
  
    // Start the emergency timeout scheduler
    startScheduler();
  });

/**
 * Graceful Shutdown Logic
 * -----------------------
 * This code ensures the Node.js server shuts down safely when the process
 * receives termination signals (SIGINT or SIGTERM).
 *
 * - SIGINT  → Sent when the user presses Ctrl + C in the terminal
 * - SIGTERM → Sent by external systems (like Docker, Kubernetes, PM2)
 *
 * Why we need this:
 * Without graceful shutdown, the app would exit immediately and:
 *   ❌ Drop in-flight HTTP requests
 *   ❌ Leave MongoDB connections hanging
 *   ❌ Risk corrupted data or memory leaks
 *
 * With this shutdown function:
 *   ✅ Stop accepting new requests
 *   ✅ Allow ongoing requests to finish
 *   ✅ Disconnect cleanly from MongoDB
 *   ✅ Exit with status code 0 (success)
 */

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    // Stop accepting new HTTP requests, wait for ongoing ones to finish
    server.close(async () => {
      console.log("✅ Closed out remaining HTTP connections");

      // Disconnect MongoDB client
      await mongoose.disconnect();
      console.log("✅ MongoDB connection closed");

      // Exit process with success code
      process.exit(0);
    });
  };

  // Listen for termination signals from OS or user
  process.on("SIGTERM", () => shutdown("SIGTERM")); // e.g., Docker stop, Kubernetes pod shutdown
  process.on("SIGINT", () => shutdown("SIGINT")); // e.g., Ctrl + C in terminal
  
  return server;
};

// Connect to MongoDB first, then start server
console.log("🚀 [STARTUP] Connecting to MongoDB before starting server...");
connectDB()
  .then(() => {
    console.log("✅ [STARTUP] MongoDB connected, starting Express server...");
    startServer();
  })
  .catch((err) => {
    console.error("❌ [STARTUP] Failed to connect to MongoDB:", err.message);
    console.error("💡 [STARTUP] Server not started due to database connection failure");
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log("⚠️ [STARTUP] Starting server anyway in development mode...");
      startServer();
    }
  });
