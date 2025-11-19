import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dynamic IP detection like user app
const getApiUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com/api/v1';
  }
  
  // Get the device IP from Expo's debugger connection
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (debuggerHost) {
    // Extract IP from debuggerHost (format: "192.168.x.x:8081")
    const ip = debuggerHost.split(':')[0];
    const apiUrl = `http://${ip}:5001/api/v1`;
    console.log('🌐 Driver API URL (Auto-detected):', apiUrl);
    return apiUrl;
  }
  
  // Fallback for emulator/simulator
  if (Platform.OS === 'android') {
    const androidUrl = 'http://10.0.2.2:5001/api/v1';
    console.log('🌐 Driver API URL (Android Emulator):', androidUrl);
    return androidUrl;
  }
  
  // Final fallback
  const fallbackUrl = 'http://localhost:5001/api/v1';
  console.log('🌐 Driver API URL (Fallback):', fallbackUrl);
  return fallbackUrl;
};

const getSocketUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }
  
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    const socketUrl = `http://${ip}:5001`;
    console.log('🔧 Driver Socket URL (Auto-detected):', socketUrl);
    return socketUrl;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }
  
  return 'http://localhost:5001';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

export default {
  API_URL,
  SOCKET_URL,
};
