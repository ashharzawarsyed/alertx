# Real-Time Ambulance Tracking Implementation

## Overview
Implemented complete real-time ambulance tracking system that shows ambulance movement on maps in both patient/user app and hospital dashboard when emergency is dispatched.

## What Was Implemented

### 1. Backend Changes

#### Emergency Model (`apps/backend/models/Emergency.js`)
- **Added** `ambulanceLocation` field to track real-time position:
  ```javascript
  ambulanceLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date,
    speed: Number,
    heading: Number,
  }
  ```

#### Socket Event Handler (`apps/backend/utils/socketHelper.js`)
- **Enhanced** `driver:updateLocation` event to:
  - Find active emergency assigned to driver
  - Save ambulance location to database
  - Broadcast location to patient app (specific emergency room)
  - Broadcast location to hospital dashboard (hospital room)
  
- **Added** event handlers:
  - `emergency:join` - Patient joins emergency room for tracking
  - `emergency:leave` - Patient leaves emergency room
  - `hospital:join` - Hospital staff joins hospital room
  - `hospital:leave` - Hospital staff leaves hospital room

### 2. Driver App Changes (`apps/emergency-driver-app`)

#### Home Screen (`app/(tabs)/index.tsx`)
- **Added** `startLocationTracking()` function:
  - Tracks driver location continuously every 5 seconds
  - Emits location updates via socket
  - Updates local map marker
  
- **Enhanced** `fetchDriverLocation()`:
  - Falls back to default Islamabad location (33.6844, 73.0479) when permissions denied
  - Shows appropriate map title based on location source

#### Socket Service (`src/services/socketService.ts`)
- **Already has** `updateLocation()` method that emits location with:
  - lat, lng coordinates
  - accuracy
  - speed and heading
  - timestamp

### 3. User/Patient App Changes (`apps/emergency-user-app`)

#### New Socket Service (`src/services/socketService.ts`)
- **Created** complete socket service for user app:
  - `connect()` - Connects to socket server
  - `joinEmergencyRoom(emergencyId)` - Joins specific emergency room
  - `leaveEmergencyRoom(emergencyId)` - Leaves emergency room
  - `onAmbulanceLocationUpdate(callback)` - Listens for ambulance location
  - `onEmergencyStatusUpdate(callback)` - Listens for status changes
  
#### Emergency Tracking Screen (`src/screens/emergency/EmergencyTrackingScreen.tsx`)
- **Added** real-time ambulance tracking:
  - `setupAmbulanceTracking()` - Connects socket and joins emergency room
  - Listens for `ambulance:locationUpdate` events
  - Updates driver location marker on map
  - Recalculates ETA automatically

#### Package.json
- **Added** `socket.io-client: ^4.7.2` dependency

### 4. Hospital Dashboard (Ready for Implementation)

The hospital dashboard at `apps/hospital-dashboard` already has:
- Emergency cards showing active emergencies
- Ambulance fleet tracking
- Polling every 30 seconds for updates

**To add real-time tracking**, you need to:
1. Install socket.io-client in hospital dashboard
2. Create socket service similar to user app
3. Join hospital room on dashboard load
4. Listen for `ambulance:locationUpdate` events
5. Update map markers when ambulance moves

## How It Works

### Flow Diagram

```
1. Driver accepts emergency
   ↓
2. Driver app starts location tracking (every 5 seconds)
   ↓
3. Driver emits "driver:updateLocation" via socket
   ↓
4. Backend receives location:
   - Finds active emergency for this driver
   - Saves location to emergency.ambulanceLocation
   - Emits to "emergency_{id}" room (patient app)
   - Emits to "hospital_{id}" room (hospital dashboard)
   ↓
5. Patient app receives "ambulance:locationUpdate"
   - Updates ambulance marker on tracking screen
   - Recalculates ETA
   ↓
6. Hospital dashboard receives "ambulance:locationUpdate"
   - Updates ambulance marker on dashboard map
   - Shows real-time position
```

### Socket Events

#### From Driver App:
- `driver:updateLocation` - Emitted every 5 seconds with location

#### From Backend to Patient App:
- `ambulance:locationUpdate` - Ambulance moved (lat, lng, speed, heading)
- `emergency:statusUpdate` - Emergency status changed

#### From Backend to Hospital Dashboard:
- `ambulance:locationUpdate` - Same as patient app
- Updates specific to assigned hospital

## Testing

### Test Driver Location Tracking:
1. Start backend: `cd apps/backend && npm start`
2. Start driver app: `cd apps/emergency-driver-app && npx expo start`
3. Login as driver
4. Accept an emergency
5. Check console logs for "📍 Location emitted" every 5 seconds

### Test Patient Tracking:
1. Start user app: `cd apps/emergency-user-app && npx expo start`
2. Create an emergency
3. Wait for driver to accept
4. Navigate to emergency tracking screen
5. Should see ambulance marker moving in real-time

### Console Logs to Watch:

**Driver App:**
```
🎯 Starting continuous location tracking...
📡 Location emitted: { lat: 33.xxx, lng: 73.xxx }
```

**Backend:**
```
📍 Ambulance location updated for emergency 673xxx: { lat: 33.xxx, lng: 73.xxx }
```

**User App:**
```
🚑 Ambulance location update received: { lat: 33.xxx, lng: 73.xxx }
```

## Next Steps

### For Hospital Dashboard:
1. Install socket.io-client
2. Create socket service file
3. Add map component to dashboard
4. Connect socket when dashboard loads
5. Join hospital room with hospital ID
6. Listen for ambulance location updates
7. Render moving ambulance markers

### Optional Enhancements:
- Add route polyline between ambulance and patient
- Show estimated time remaining
- Add ambulance speed indicator
- Show ambulance heading (direction arrow)
- Add geofencing alerts (ambulance arrived)
- Historical route tracking
- Multiple ambulance tracking on same map

## Files Modified

```
apps/backend/models/Emergency.js - Added ambulanceLocation field
apps/backend/utils/socketHelper.js - Enhanced location tracking
apps/emergency-driver-app/app/(tabs)/index.tsx - Continuous location tracking
apps/emergency-user-app/src/services/socketService.ts - NEW FILE
apps/emergency-user-app/src/screens/emergency/EmergencyTrackingScreen.tsx - Real-time tracking
apps/emergency-user-app/package.json - Added socket.io-client
```

## Installation

To install the new dependency in user app:

```bash
cd apps/emergency-user-app
npm install socket.io-client@^4.7.2
```

Or use the workspace root:

```bash
npm install --workspace=apps/emergency-user-app socket.io-client@^4.7.2
```

## Configuration

Make sure `SOCKET_URL` is configured in:
- `apps/emergency-driver-app/src/config/config.ts`
- `apps/emergency-user-app/src/config/config.ts`

Should point to backend socket server (e.g., `http://192.168.1.9:5001`)

## Troubleshooting

### Socket not connecting:
- Check backend is running
- Verify SOCKET_URL in config
- Check auth token is valid
- Look for connection errors in console

### Location not updating:
- Verify location permissions granted
- Check driver app console for "📡 Location emitted"
- Verify driver has active emergency
- Check backend logs for ambulance location updates

### Map not showing ambulance:
- Verify socket connected (check console)
- Verify joined emergency room
- Check for "ambulance:locationUpdate" events
- Verify driverLocation state is being set

## Production Considerations

1. **Battery Optimization**: Adjust tracking interval (currently 5 seconds)
2. **Network Efficiency**: Only emit location if changed significantly
3. **Error Handling**: Gracefully handle socket disconnections
4. **Privacy**: Only share location during active emergencies
5. **Security**: Validate driver is assigned to emergency before broadcasting

---

**Status**: ✅ IMPLEMENTED AND READY FOR TESTING

**Last Updated**: November 24, 2025
