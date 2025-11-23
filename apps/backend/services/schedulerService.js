import mongoose from "mongoose";
import Emergency from "../models/Emergency.js";

/**
 * Scheduler for periodic emergency system tasks
 */

// Auto-cancel emergencies that have been pending for more than 1 hour
export const autoCancelTimedOutEmergencies = async () => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("[Scheduler] MongoDB not connected yet, skipping scheduled task");
      return null;
    }

    const result = await Emergency.autoCancelTimedOut();
    
    if (result.modifiedCount > 0) {
      console.log(
        `[Scheduler] Auto-cancelled ${result.modifiedCount} timed-out emergenc${
          result.modifiedCount === 1 ? "y" : "ies"
        }`
      );
    }
    
    return result;
  } catch (error) {
    console.error("[Scheduler] Error auto-cancelling timed-out emergencies:", error);
    // Don't throw error to prevent server crash
    return null;
  }
};

// Start all scheduled tasks
export const startScheduler = () => {
  console.log("[Scheduler] Starting emergency timeout scheduler...");
  
  // Run every 5 minutes
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  setInterval(autoCancelTimedOutEmergencies, FIVE_MINUTES);
  
  // Run first check after 10 seconds (give MongoDB time to connect)
  setTimeout(() => {
    console.log("[Scheduler] Running initial emergency timeout check...");
    autoCancelTimedOutEmergencies();
  }, 10000);
  
  console.log("[Scheduler] Emergency timeout scheduler started (runs every 5 minutes)");
};

export default {
  startScheduler,
  autoCancelTimedOutEmergencies,
};
