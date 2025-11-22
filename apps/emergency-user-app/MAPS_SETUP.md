# Google Maps API Key Setup (WebView-based - Expo Go Compatible!)

## ✅ Works in Expo Go without native builds!

The app now uses **Google Maps JavaScript API via WebView** which is fully compatible with Expo Go.

## Setup Instructions:

### 1. **Get your Google Maps API Key:**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable **Maps JavaScript API** (NOT Maps SDK for Android/iOS)
   - Create credentials → API Key

### 2. **Add the key to your local environment:**
   - Open `apps/emergency-user-app/.env`
   - Add your API key:
     ```
     EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC...your_actual_key
     ```

### 3. **Restart Expo:**
   ```bash
   cd apps/emergency-user-app
   npx expo start --clear
   ```

### 4. **Restrict your API key (Important for security):**
   - In Google Cloud Console → Credentials
   - Click on your API key
   - Under "API restrictions": 
     - Select "Restrict key"
     - Check only **Maps JavaScript API**
   - Under "Application restrictions":
     - For development: Select "None"
     - For production: Add your domain/app restrictions

## How it Works:

- Uses `react-native-webview` to render Google Maps
- Loads Google Maps JavaScript API via HTML
- Fully interactive map with markers
- Works in Expo Go (no native build required!)
- Uses your Google Maps API key from `.env`

## Files:
- `.env` - Your local API key (git ignored) ⚠️ **NEVER commit this!**
- `.env.example` - Template file (tracked in git)
- `app.config.js` - Reads from env variables safely

## Benefits:
✅ Works in Expo Go immediately
✅ No native builds needed for testing
✅ Interactive maps with markers
✅ Secure API key handling
✅ Easy to update and test

## Note:
The Google Maps JavaScript API has different pricing than Maps SDKs. Check pricing at: https://developers.google.com/maps/billing-and-pricing/pricing
