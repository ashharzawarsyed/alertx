require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    name: "emergency-driver-app",
    slug: "emergency-driver-app",
    ios: {
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY
        }
      }
    },
    extra: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY
    }
  }
};
