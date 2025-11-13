# Quick Setup Guide - Emergency Tracking

## Prerequisites
✅ All dependencies installed
✅ Tracking screen created
✅ Navigation configured
✅ Backend running

## Setup Steps

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS  
   - Directions API
4. Create credentials → API Key
5. Copy the API key

### 2. Configure API Key

**File: `app.json`**
Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key:
```json
"ios": {
  "config": {
    "googleMapsApiKey": "AIza..."
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "AIza..."
    }
  }
}
```

**File: `src/screens/emergency/EmergencyTrackingScreen.tsx` (line ~315)**
Replace in MapViewDirections:
```tsx
apikey="AIza..." // Your actual Google Maps API key
```

### 3. Test the Implementation

1. Start the backend:
   ```bash
   cd apps/backend
   npm run dev
   ```

2. Start the app:
   ```bash
   cd apps/emergency-user-app
   npx expo start
   ```

3. Test flow:
   - Sign in as patient
   - Create emergency (slide button on home)
   - Tap "Active Emergency" banner
   - Should see tracking screen with map

## Troubleshooting

### Map not loading?
- Check if API key is valid
- Ensure billing is enabled in Google Cloud
- Check API restrictions

### "Directions error" in console?
- Verify Directions API is enabled
- Check API key in MapViewDirections

### Driver location not showing?
- This is expected - driver location is simulated
- Will show once backend implements real-time tracking

## Next Steps
- Module #2: Triage System Integration
- Module #3: Maps & Location Services Enhancement
- Module #4: Notifications System
