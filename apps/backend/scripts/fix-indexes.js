import mongoose from "mongoose";
import Hospital from "./models/Hospital.js";

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/alertx");

async function dropIndexes() {
  try {
    console.log("Dropping existing indexes on hospitals collection...");
    await Hospital.collection.dropIndexes();
    console.log("All indexes dropped successfully");

    console.log("Creating new indexes...");
    await Hospital.createIndexes();
    console.log("New indexes created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

dropIndexes();
