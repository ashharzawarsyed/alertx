import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config(); // load environment variables

// Configure DNS to use Google's public DNS servers as fallback
// This helps when system DNS is slow or unreliable
dns.setServers([
  '8.8.8.8',       // Google Public DNS
  '8.8.4.4',       // Google Public DNS Secondary
  '1.1.1.1',       // Cloudflare DNS
  '1.0.0.1',       // Cloudflare DNS Secondary
  ...dns.getServers() // Keep system DNS as last resort
]);

console.log(`🌐 [DNS] Using DNS servers: ${dns.getServers().slice(0, 4).join(', ')}, ...`);

const connectDB = async (retryCount = 0, useDirect = false) => {
  const maxRetries = 3;
  
  try {
    console.log(`🔄 [MONGODB] Connection attempt ${retryCount + 1}/${maxRetries + 1}...`);
    
    // ALWAYS prefer direct connection if available (bypasses slow DNS SRV lookup)
    let mongoUri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;
    
    if (process.env.MONGO_URI_DIRECT) {
      console.log(`📡 [MONGODB] Using DIRECT connection (bypassing DNS SRV for faster connection)`);
    } else {
      console.log(`📡 [MONGODB] Using SRV connection (DNS lookup required)`);
    }
    
    console.log(`📡 [MONGODB] Connection type: ${mongoUri.includes('mongodb+srv') ? 'SRV (DNS lookup)' : 'Direct (no DNS)'}`);
    console.log(`📡 [MONGODB] Host: ${mongoUri.includes('@') ? '...' + mongoUri.substring(mongoUri.indexOf('@') + 1, mongoUri.indexOf('/', mongoUri.indexOf('@'))).substring(0, 30) + '...' : 'configured'}`);
    
    // Enhanced connection options to handle DNS and network issues
    const connectionOptions = {
      // Timeouts - reduced since IP is now whitelisted
      serverSelectionTimeoutMS: 10000, // 10 seconds to find server
      socketTimeoutMS: 30000, // 30 seconds for socket operations
      connectTimeoutMS: 10000, // 10 seconds to establish connection
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      
      // Network settings
      family: 4, // Force IPv4 to avoid IPv6 DNS issues
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Stability settings
      directConnection: false,
      
      // Additional options for mongodb+srv URIs
      ...(mongoUri.includes('mongodb+srv') ? {
        // These options help with DNS resolution in some environments
      } : {})
    };

    const conn = await mongoose.connect(mongoUri, connectionOptions);
    
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
      
      // Try direct connection on next retry if we have it configured
      const shouldTryDirect = !useDirect && process.env.MONGO_URI_DIRECT && retryCount >= 1;
      return connectDB(retryCount + 1, shouldTryDirect);
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
