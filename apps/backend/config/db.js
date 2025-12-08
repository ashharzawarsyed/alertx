import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // load environment variables

const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    console.log(`🔄 [MONGODB] Connection attempt ${retryCount + 1}/${maxRetries + 1}...`);
    
    // Use alternative connection string format to bypass DNS issues
    const mongoUri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;
    console.log(`📡 [MONGODB] Using connection: ${mongoUri.includes('@') ? mongoUri.substring(0, mongoUri.indexOf('@') + 1) + '...' : 'Direct IP'}`);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      family: 4, // Force IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
      // Bypass DNS resolution issues
      directConnection: false,
      maxPoolSize: 10,
    });
    
    console.log(`✅ [MONGODB] Connected successfully: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ [MONGODB] Connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ [MONGODB] Disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ [MONGODB] Reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error(`❌ [MONGODB] Connection attempt ${retryCount + 1} failed:`, err.message);
    
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      console.log(`⏳ [MONGODB] Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    }
    
    console.error("💡 [MONGODB] Troubleshooting tips:");
    console.error("   1. Check your internet connection");
    console.error("   2. Verify MongoDB Atlas cluster is running");
    console.error("   3. Check if your IP is whitelisted (0.0.0.0/0 for development)");
    console.error("   4. Verify MONGO_URI in .env file");
    console.error("   5. Try: ping alertx-cluster.krkaqh4.mongodb.net");
    
    // Don't exit in development, allow server to run
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log("⚠️ [MONGODB] Running without database connection (development mode)");
      console.log("⚠️ [MONGODB] API endpoints requiring DB will return errors");
    }
  }
};

export default connectDB;
