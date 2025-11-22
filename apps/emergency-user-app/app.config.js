// app.config.js - Dynamic configuration with environment variables
const IS_DEV = process.env.APP_VARIANT === 'development';
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    name: IS_DEV ? 'AlertX (Dev)' : 'emergency-user-app',
    slug: 'emergency-user-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'emergencyuserapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    androidStatusBar: {
      barStyle: 'dark-content',
      backgroundColor: '#FFFFFF',
    },
    ios: {
      supportsTablet: true,
      userInterfaceStyle: 'light',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow AlertX to access your location for emergency dispatch.',
          locationAlwaysPermission:
            'Allow AlertX to access your location even when the app is in the background.',
          locationWhenInUsePermission:
            'Allow AlertX to access your location while using the app.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: 'your-eas-project-id-here',
      },
    },
  },
};
