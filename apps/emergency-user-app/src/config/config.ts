import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Get backend API URL based on environment
 * Automatically detects local IP for development
 */
let cachedApiUrl: string | null = null;

export const getApiUrl = (): string => {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }

  // Production URL (replace with your actual production URL)
  const PRODUCTION_URL = "https://your-production-api.com/api/v1";

  // Development - use expo debugger host IP
  if (__DEV__) {
    // Get the device IP from Expo's debugger connection
    const debuggerHost = Constants.expoConfig?.hostUri;

    if (debuggerHost) {
      // Extract IP from debuggerHost (format: "192.168.x.x:8081")
      const ip = debuggerHost.split(":")[0];
      const apiUrl = `http://${ip}:5001/api/v1`;
      console.log("🌐 API URL (Auto-detected):", apiUrl);
      cachedApiUrl = apiUrl;
      return apiUrl;
    }

    // Fallback to localhost for web or if debuggerHost is not available
    if (Platform.OS === "web") {
      const webUrl = "http://localhost:5001/api/v1";
      console.log("🌐 API URL (Web):", webUrl);
      cachedApiUrl = webUrl;
      return webUrl;
    }

    // Final fallback (should rarely be used)
    const fallbackUrl = "http://192.168.100.23:5001/api/v1";
    console.log("🌐 API URL (Fallback):", fallbackUrl);
    cachedApiUrl = fallbackUrl;
    return fallbackUrl;
  }

  // Production
  console.log("🌐 API URL (Production):", PRODUCTION_URL);
  cachedApiUrl = PRODUCTION_URL;
  return PRODUCTION_URL;
};

/**
 * Get Socket URL (same host as API)
 */
export const getSocketUrl = (): string => {
  const apiUrl = getApiUrl();
  // Remove /api/v1 from the end to get base URL
  return apiUrl.replace('/api/v1', '');
};

/**
 * Configuration object
 */
export const Config = {
  API_URL: getApiUrl(),
  SOCKET_URL: getSocketUrl(),
  API_TIMEOUT: 10000,
  GOOGLE_MAPS_API_KEY: "AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI",
};

export default Config;
