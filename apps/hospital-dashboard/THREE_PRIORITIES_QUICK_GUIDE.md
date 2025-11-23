# 🎯 THREE PRIORITIES - QUICK REFERENCE GUIDE

## **PRIORITY 1: LIVE MAP TRACKING** ⏱️ 3-4 Days

### What You'll Build:
**Hospital Dashboard - Live Tracking Page with Real-time Ambulances**

### Files to Create:
1. `src/features/dashboard/pages/LiveTracking.jsx` (Main map component)
2. `src/components/AmbulanceInfoPanel.jsx` (Sidebar with ambulance details)
3. `src/services/trackingService.js` (API & Socket.IO integration)
4. `src/components/AmbulanceMarker.jsx` (Custom map marker)

### Key Features:
- ✅ Google Maps with dark theme
- ✅ Real-time ambulance markers (blue = own, green = incoming)
- ✅ Click ambulance → Beautiful sidebar shows:
  - Vehicle number, status, ETA
  - Driver name, phone, photo
  - Crew members (Paramedic, Nurse, etc.)
  - Patient info (for incoming ambulances)
  - Vitals (heart rate, BP, oxygen)
- ✅ Statistics cards (Total, En Route, Available, Critical)
- ✅ Socket.IO for live updates every 5 seconds
- ✅ Smooth marker animations

### Backend Work:
**New Endpoints:**
```javascript
GET /api/v1/hospitals/:id/ambulances/tracking
GET /api/v1/ambulances/:id/details
GET /api/v1/maps/route?from=lat,lng&to=lat,lng
PUT /api/v1/ambulances/:id/arrived
```

**Database Update:**
```javascript
// Add to Ambulance model
currentLocation: {
  coordinates: [lng, lat],
  heading: Number,
  speed: Number,
  lastUpdated: Date
}

// Create geospatial index
db.ambulances.createIndex({ "currentLocation": "2dsphere" })
```

**Socket.IO Events:**
```javascript
// Emit from backend when driver updates location
io.to(`hospital:${hospitalId}`).emit('ambulance:location', {
  ambulanceId,
  location: { lat, lng },
  heading,
  speed,
  eta
});
```

### Install Dependencies:
```bash
cd apps/hospital-dashboard
npm install @react-google-maps/api @googlemaps/js-api-loader

cd apps/backend
npm install @googlemaps/google-maps-services-js geolib
```

### Success Criteria:
- [ ] Map loads with hospital at center
- [ ] Ambulances display as colored markers
- [ ] Clicking marker shows detailed info panel
- [ ] Real-time location updates (markers move smoothly)
- [ ] ETA countdown updates live
- [ ] Can call driver from info panel

---

## **PRIORITY 2: EMERGENCY QUEUE ↔ TRACKING INTEGRATION** ⏱️ 2-3 Days

### What You'll Build:
**Connect Emergency Queue to Ambulance Tracking**

### Files to Update:
1. `src/features/dashboard/pages/EmergencyQueue.jsx` (Add ambulance info)
2. `src/services/emergencyService.js` (Add ambulance assignment)

### Key Features:
- ✅ Enhanced "Accept Emergency" modal:
  - Shows available ambulances
  - Select bed + ambulance together
  - Shows distance and ETA for each ambulance
- ✅ Emergency card shows ambulance after acceptance:
  - Vehicle number
  - Driver name
  - Real-time ETA (updates every 5s)
  - "Track on Map" button (opens Live Tracking)
  - "Call Driver" button
- ✅ Status badges: Pending → Dispatched → En Route → Arrived
- ✅ Arrival notification when ambulance reaches hospital

### Backend Work:
**New Endpoints:**
```javascript
POST /api/v1/emergencies/:id/assign-ambulance
Body: { ambulanceId, bedType, bedNumber }

GET /api/v1/emergencies/:id/ambulance
Response: { ambulance, location, eta, crew }

GET /api/v1/hospitals/:id/ambulances/available
Response: [{ id, number, distance, eta, driver }]
```

**New Service:**
`apps/backend/services/emergencyAmbulanceService.js`
```javascript
// Handles:
- assignAmbulance(emergencyId, ambulanceId)
- getAvailableAmbulances(hospitalId, location)
- trackEmergencyAmbulance(emergencyId)
- calculateETA(from, to)
```

**Socket.IO Events:**
```javascript
// When hospital assigns ambulance
socket.emit('emergency:assign_ambulance', { emergencyId, ambulanceId });

// Backend broadcasts to driver
io.to(`driver:${driverId}`).emit('emergency:assigned', {
  emergency,
  route,
  patient
});

// Backend broadcasts to hospital
io.to(`hospital:${hospitalId}`).emit('emergency:ambulance_dispatched', {
  emergencyId,
  ambulance,
  eta
});
```

### Success Criteria:
- [ ] Accept modal shows available ambulances with distances
- [ ] Ambulance assignment works end-to-end
- [ ] Emergency card displays ambulance info after acceptance
- [ ] ETA updates in real-time
- [ ] "Track on Map" opens Live Tracking page focused on ambulance
- [ ] Status changes reflect immediately

---

## **PRIORITY 3: COMPLETE APP INTEGRATION** ⏱️ 3-4 Days

### What You'll Build:
**Connect User App ↔ Driver App ↔ Hospital Dashboard**

### User App Updates:
**File:** `apps/emergency-user-app/src/screens/EmergencyTrackingScreen.tsx`

**Add:**
```typescript
// Real-time ambulance tracking
socket.on('emergency:ambulance_assigned', (data) => {
  setAmbulance(data.ambulance);
  setDriver(data.driver);
  setETA(data.eta);
});

socket.on('emergency:ambulance_location', (data) => {
  updateAmbulanceMarker(data.location);
  setETA(data.eta);
});

// Show on map:
- Patient location (red marker)
- Ambulance location (blue marker, updates every 5s)
- Hospital location (purple marker)
- Route polyline
```

**Display:**
```typescript
<AmbulanceTrackingView>
  <Map>
    Patient, Ambulance, Hospital markers
    Route polyline
  </Map>
  
  <InfoCard>
    Vehicle: AMB-001
    Driver: John Doe
    Crew: Sarah (Paramedic), Mike (Nurse)
    ETA: 8 minutes • 3.2 km
    [Call Driver] [Call Hospital]
  </InfoCard>
</AmbulanceTrackingView>
```

### Driver App Updates:
**File:** `apps/emergency-driver-app/src/screens/ActiveEmergencyScreen.tsx`

**Enhanced Location Tracking:**
```typescript
// Update location every 5 seconds
const watchId = Geolocation.watchPosition(
  (position) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      heading: position.coords.heading,
      speed: position.coords.speed
    };

    // Send to backend
    ambulanceService.updateLocation(ambulanceId, location);

    // Emit via Socket.IO
    socket.emit('ambulance:location_update', {
      ambulanceId,
      location,
      emergencyId
    });
  },
  { interval: 5000, enableHighAccuracy: true }
);
```

**Status Updates:**
```typescript
// Driver workflow
1. Accept Emergency → status: "dispatched"
2. Start Navigation → status: "en-route"
3. Arrive at Patient → status: "at-scene"
4. Pickup Patient → status: "returning"
5. Arrive at Hospital → status: "arrived"

// Each status emits Socket.IO event
socket.emit('ambulance:status', { ambulanceId, status });
```

**Add Crew Management:**
```typescript
<CrewManagement>
  <AddCrew>
    Name: [Input]
    Role: [Paramedic/Nurse/EMT]
    Certification: [Input]
  </AddCrew>
  
  <CurrentCrew>
    {crew.map(member => (
      <CrewCard>{member.name} - {member.role}</CrewCard>
    ))}
  </CurrentCrew>
</CrewManagement>
```

### Backend Orchestration:
**File:** `apps/backend/services/emergencyOrchestrationService.js`

**Complete Flow:**
```javascript
1. User creates emergency
   → AI triage
   → Notify nearby hospitals
   
2. Hospital accepts
   → Assign ambulance
   → Calculate route
   → Notify driver
   
3. Driver accepts
   → Start GPS tracking
   → Notify user & hospital
   
4. Real-time updates
   → Location every 5s
   → ETA recalculation
   → Broadcast to all parties
   
5. Pickup patient
   → New route to hospital
   → Update status
   
6. Arrive at hospital
   → Complete emergency
   → Update bed availability
   → Notify everyone
```

**Key Socket.IO Events:**
```javascript
// User → Backend → Hospital
'emergency:create' → 'emergency:new'

// Hospital → Backend → Driver
'emergency:accept' → 'emergency:assigned'

// Driver → Backend → User & Hospital
'ambulance:location_update' → 'ambulance:location'

// Driver → Backend → User & Hospital
'ambulance:arrived' → 'emergency:completed'
```

### Database Sync Service:
**File:** `apps/backend/services/dataSyncService.js`

**Ensures:**
- Bed availability syncs to all apps
- Emergency status syncs everywhere
- Ambulance location updates all clients
- No stale data anywhere

### Success Criteria:
- [ ] User creates emergency → Hospitals receive notification
- [ ] Hospital accepts → User sees hospital info
- [ ] Hospital assigns ambulance → Driver gets notification
- [ ] Driver accepts → User sees ambulance & driver info
- [ ] Location updates → All apps show moving ambulance
- [ ] Pickup → All apps update status
- [ ] Arrival → Emergency completes everywhere
- [ ] Bed count decreases in hospital dashboard
- [ ] All three apps stay synchronized

---

## 📊 **COMPLETE FLOW SUMMARY**

```
USER APP                    BACKEND                    DRIVER APP              HOSPITAL DASHBOARD
   │                           │                           │                           │
   │─1. Create Emergency────>│                           │                           │
   │                           │─2. AI Triage──────────>│                           │
   │                           │─3. Notify Hospitals───────────────────────────────>│
   │                           │                           │                           │
   │                           │<─4. Accept + Assign───────────────────────────────│
   │                           │    Ambulance              │                           │
   │                           │─5. Notify Driver──────>│                           │
   │<─6. Hospital Info───────│                           │                           │
   │                           │<─7. Accept Emergency──│                           │
   │                           │                           │                           │
   │<─8. Ambulance Details───│─9. Notify Hospital────────────────────────────────>│
   │   (Driver, ETA)           │                           │                           │
   │                           │<─10. GPS Every 5s──────│                           │
   │<─11. Location Update────│─12. Broadcast Location────────────────────────────>│
   │   (Map Updates)           │    (Map Updates)          │                           │
   │                           │                           │                           │
   │                           │<─13. Pickup Patient────│                           │
   │<─14. In Transit─────────│─15. Notify Hospital───────────────────────────────>│
   │   (New ETA)               │                           │                           │
   │                           │<─16. Arrived───────────│                           │
   │<─17. Completed──────────│─18. Notify Hospital───────────────────────────────>│
   │   (Bed Info)              │   (Bed -1)                │                           │
```

---

## 🚀 **IMPLEMENTATION ORDER**

### Week 1: Priority 1
**Days 1-2:** Map component, markers, Google Maps integration  
**Days 3-4:** Socket.IO, real-time updates, ambulance info panel

### Week 2: Priority 2
**Days 1-2:** Emergency-ambulance assignment flow, backend endpoints  
**Day 3:** Emergency queue integration, testing

### Week 3: Priority 3
**Days 1-2:** User app tracking, driver app location updates  
**Days 3-4:** Backend orchestration, data sync, end-to-end testing

---

## 📦 **QUICK START COMMANDS**

```bash
# Priority 1: Install dependencies
cd apps/hospital-dashboard
npm install @react-google-maps/api @googlemaps/js-api-loader

cd apps/backend
npm install @googlemaps/google-maps-services-js geolib

# Priority 2: No new dependencies

# Priority 3: Update existing apps
cd apps/emergency-user-app
npm install socket.io-client (already installed)

cd apps/emergency-driver-app
npm install @react-native-community/geolocation (already installed)
```

---

## ✅ **FINAL CHECKLIST**

### Priority 1 Complete When:
- [ ] Map displays ambulances in real-time
- [ ] Clicking ambulance shows detailed info
- [ ] ETA updates every 5 seconds
- [ ] Can call driver from dashboard

### Priority 2 Complete When:
- [ ] Hospital can assign ambulance to emergency
- [ ] Emergency card shows ambulance tracking
- [ ] "Track on Map" button works
- [ ] Status syncs (Pending → En Route → Arrived)

### Priority 3 Complete When:
- [ ] User creates emergency → Driver notified
- [ ] Driver accepts → User sees ambulance
- [ ] Location updates in all 3 apps
- [ ] Ambulance arrives → Emergency completes
- [ ] All apps stay synchronized

---

## 🎯 **SUCCESS METRICS**

- **Real-time Accuracy:** Location updates within 5 seconds
- **Data Sync:** No stale data across apps
- **ETA Precision:** ±2 minutes accuracy
- **User Experience:** Smooth animations, no lag
- **Reliability:** 99.9% Socket.IO uptime
- **Performance:** Map loads in <2 seconds

---

**This is your roadmap to a production-ready, real-time emergency management system!** 🚀
