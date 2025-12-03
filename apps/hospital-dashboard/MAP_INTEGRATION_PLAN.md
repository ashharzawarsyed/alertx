# Hospital Dashboard - Map Integration & Real-Time Sync Implementation Plan

## 🎯 **Overview**

Implement a comprehensive real-time map system for the hospital dashboard that displays:

- Hospital's own ambulance fleet with live GPS tracking
- Incoming ambulances dispatched from other hospitals
- Driver crew information, ETA, patient details
- Real-time updates via Socket.IO
- Interactive map with beautiful UI/UX matching dark glassmorphism theme

---

## 📋 **PRIORITY 1: Core Map Infrastructure & Live Tracking**

**Goal:** Build the foundation - map display, real-time ambulance tracking, and Socket.IO integration

### 1.1 Map Display Component

**File:** `src/features/dashboard/pages/LiveTracking.jsx`

**Features:**

- ✅ Google Maps integration with dark theme
- ✅ Hospital location as center point
- ✅ Custom ambulance markers (different colors for own vs incoming)
- ✅ Smooth marker animations for movement
- ✅ Auto-zoom to fit all ambulances
- ✅ Map controls (zoom, pan, fullscreen)

**Technology:**

```javascript
- @react-google-maps/api
- Google Maps JavaScript API (already configured in project)
- Custom map styles for dark theme
```

**Map Layers:**

1. **Hospital Marker** - Purple/Pink gradient (home base)
2. **Own Ambulances** - Blue markers (hospital's fleet)
3. **Incoming Ambulances** - Green markers (dispatched to this hospital)
4. **Routes** - Dotted lines showing ambulance paths

### 1.2 Real-Time Location Tracking

**Backend Integration:**

**Endpoint:** `GET /api/v1/ambulances/hospital/:hospitalId/tracking`

```javascript
Response: {
  ownAmbulances: [
    {
      id: "amb_123",
      vehicleNumber: "AMB-001",
      currentLocation: { lat: 37.7749, lng: -122.4194 },
      status: "available" | "dispatched" | "en-route" | "at-scene",
      driver: {
        name: "John Doe",
        phone: "+1234567890",
        employeeId: "DRV001"
      },
      crew: [
        { name: "Sarah Smith", role: "Paramedic", certification: "EMT-P" },
        { name: "Mike Johnson", role: "Nurse", certification: "RN" }
      ],
      heading: 45, // degrees for rotation
      speed: 60, // km/h
      lastUpdated: "2024-01-15T10:30:00Z"
    }
  ],
  incomingAmbulances: [
    {
      id: "amb_456",
      vehicleNumber: "AMB-Hospital-B-005",
      fromHospital: "City General Hospital",
      currentLocation: { lat: 37.7849, lng: -122.4294 },
      status: "en-route",
      eta: 12, // minutes
      distance: 5.2, // km
      emergency: {
        id: "emg_789",
        patientName: "Alice Brown",
        age: 45,
        gender: "Female",
        condition: "Heart Attack",
        severity: "critical",
        vitals: {
          heartRate: "110 bpm",
          bloodPressure: "160/95",
          oxygenSaturation: "92%"
        }
      },
      driver: { ... },
      crew: [ ... ],
      assignedBed: "ICU-5"
    }
  ]
}
```

**Socket.IO Events:**

```javascript
// Listen for ambulance location updates
socket.on("ambulance:location", (data) => {
  // Update marker position
  // data: { ambulanceId, location: { lat, lng }, heading, speed }
});

// Listen for ambulance status changes
socket.on("ambulance:status", (data) => {
  // Update marker color/icon
  // data: { ambulanceId, status, timestamp }
});

// Listen for new emergency dispatches
socket.on("emergency:dispatched", (data) => {
  // Add new incoming ambulance marker
  // data: { ambulance, emergency, eta }
});

// Listen for ambulance arrival
socket.on("ambulance:arrived", (data) => {
  // Show arrival notification
  // data: { ambulanceId, hospitalId, timestamp }
});
```

### 1.3 Ambulance Info Sidebar

**Component:** `AmbulanceInfoPanel.jsx`

**Features:**

- ✅ Slides in from right when ambulance clicked
- ✅ Shows detailed crew information
- ✅ Live ETA countdown
- ✅ Patient vitals (for incoming ambulances)
- ✅ Call driver button (integrates with phone)
- ✅ View route button (shows polyline on map)
- ✅ Assigned bed display
- ✅ Beautiful glassmorphic design

**UI Sections:**

1. **Header:** Ambulance number, status badge, hospital name
2. **ETA Card:** Large countdown timer with distance
3. **Driver Info:** Name, photo, phone, rating
4. **Crew List:** Role, name, certification badges
5. **Patient Info** (incoming only): Name, age, condition, vitals
6. **Assigned Bed** (incoming only): Bed type, room number
7. **Actions:** Call Driver, View Route, Mark as Arrived

### 1.4 Map Statistics Overlay

**Component:** Top-left overlay cards

**Stats:**

- Total Ambulances (own + incoming)
- En Route Count
- Available Count
- Average ETA
- Critical Patients Incoming

---

## 📋 **PRIORITY 2: Backend API & Socket.IO Integration**

**Goal:** Connect hospital dashboard to backend with real-time data flow

### 2.1 Ambulance Tracking API

**New Backend Endpoints:**

```javascript
// Get all ambulances for a hospital
GET /api/v1/hospitals/:hospitalId/ambulances/tracking

// Get single ambulance details
GET /api/v1/ambulances/:ambulanceId/details

// Update ambulance location (called by driver app)
PUT /api/v1/ambulances/:ambulanceId/location
Body: { lat: Number, lng: Number, heading: Number, speed: Number }

// Get route between two points
GET /api/v1/maps/route?from=lat,lng&to=lat,lng
Response: { polyline: String, distance: Number, duration: Number }

// Mark ambulance as arrived
PUT /api/v1/ambulances/:ambulanceId/arrived
Body: { hospitalId: String, timestamp: Date }
```

### 2.2 Socket.IO Room Structure

**Rooms:**

```javascript
// Hospital-specific room for targeted events
`hospital:${hospitalId}`
// Ambulance-specific room
`ambulance:${ambulanceId}`
// Emergency-specific room
`emergency:${emergencyId}`;
```

**Event Emitters (Backend):**

```javascript
// Emit when driver app updates location
io.to(`hospital:${hospitalId}`).emit('ambulance:location', {
  ambulanceId,
  location: { lat, lng },
  heading,
  speed,
  timestamp
});

// Emit when ambulance status changes
io.to(`hospital:${hospitalId}`).emit('ambulance:status', {
  ambulanceId,
  status: 'en-route',
  timestamp
});

// Emit when emergency is dispatched
io.to(`hospital:${destinationHospitalId}`).emit('emergency:dispatched', {
  ambulance: { ... },
  emergency: { ... },
  eta: 15
});
```

### 2.3 Database Schema Updates

**Ambulance Model Enhancement:**

```javascript
{
  hospitalId: ObjectId,
  vehicleNumber: String,
  vehicleType: String, // "Basic", "ALS", "Critical Care"
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number, Number], // [lng, lat] for GeoJSON
    heading: Number,
    speed: Number,
    lastUpdated: Date
  },
  status: String, // "available", "dispatched", "en-route", "at-scene", "returning", "maintenance"
  driver: {
    userId: ObjectId,
    name: String,
    phone: String,
    licenseNumber: String
  },
  crew: [{
    userId: ObjectId,
    name: String,
    role: String,
    certification: String
  }],
  currentEmergency: ObjectId,
  features: [String], // ["Oxygen", "Defibrillator", "Ventilator"]
  lastMaintenance: Date,
  mileage: Number
}

// Add geospatial index for location queries
ambulanceSchema.index({ 'currentLocation': '2dsphere' });
```

**Emergency Model Update:**

```javascript
{
  // ... existing fields
  assignedAmbulance: {
    ambulanceId: ObjectId,
    vehicleNumber: String,
    dispatchTime: Date,
    estimatedArrival: Date,
    actualArrival: Date
  },
  destinationHospital: {
    hospitalId: ObjectId,
    name: String,
    assignedBed: String,
    eta: Number // minutes
  },
  route: {
    distance: Number, // km
    duration: Number, // minutes
    polyline: String // encoded polyline for map display
  }
}
```

### 2.4 Service Layer

**File:** `src/services/trackingService.js`

```javascript
import io from "socket.io-client";
import api from "./api";

class TrackingService {
  constructor() {
    this.socket = null;
    this.ambulances = new Map();
  }

  // Initialize Socket.IO connection
  connect(hospitalId, token) {
    this.socket = io(process.env.REACT_APP_API_URL, {
      auth: { token, hospitalId, role: "hospital" },
    });

    this.socket.on("connect", () => {
      console.log("✅ Tracking socket connected");
      this.socket.emit("hospital:join", hospitalId);
    });

    return this.socket;
  }

  // Fetch initial ambulance data
  async getAmbulances(hospitalId) {
    const response = await api.get(
      `/hospitals/${hospitalId}/ambulances/tracking`
    );
    return response.data;
  }

  // Subscribe to location updates
  onLocationUpdate(callback) {
    this.socket?.on("ambulance:location", callback);
  }

  // Subscribe to status updates
  onStatusUpdate(callback) {
    this.socket?.on("ambulance:status", callback);
  }

  // Subscribe to new dispatches
  onNewDispatch(callback) {
    this.socket?.on("emergency:dispatched", callback);
  }

  // Get route between two points
  async getRoute(from, to) {
    const response = await api.get(
      `/maps/route?from=${from.lat},${from.lng}&to=${to.lat},${to.lng}`
    );
    return response.data;
  }

  // Mark ambulance as arrived
  async markArrived(ambulanceId, hospitalId) {
    const response = await api.put(`/ambulances/${ambulanceId}/arrived`, {
      hospitalId,
    });
    return response.data;
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new TrackingService();
```

---

## 📋 **PRIORITY 3: Emergency User App & Driver App Integration**

**Goal:** Create seamless data flow between all three apps (User → Driver → Hospital)

### 3.1 Emergency User App Integration

**What's Already Done:**

- ✅ Emergency creation API
- ✅ Location tracking
- ✅ Emergency status display

**What's Needed:**

**A. Real-time Emergency Status Updates**

**File:** `apps/emergency-user-app/src/screens/EmergencyTrackingScreen.tsx`

**Enhancements:**

```typescript
// Add Socket.IO listener for emergency updates
useEffect(() => {
  const socket = io(Config.API_URL, {
    auth: { token: userToken },
  });

  socket.emit("emergency:track", emergencyId);

  // Listen for ambulance dispatch
  socket.on("emergency:ambulance_assigned", (data) => {
    setAmbulance(data.ambulance);
    setETA(data.eta);
  });

  // Listen for ambulance location updates
  socket.on("emergency:ambulance_location", (data) => {
    updateAmbulanceMarker(data.location);
    setETA(data.eta);
  });

  // Listen for ambulance status
  socket.on("emergency:status_update", (data) => {
    setStatus(data.status); // "dispatched", "en-route", "arrived"
    if (data.status === "arrived") {
      showArrivalNotification();
    }
  });

  return () => socket.disconnect();
}, [emergencyId]);
```

**B. Hospital Selection Enhancement**

Show hospital bed availability when selecting hospital:

```typescript
// Display available beds in hospital selection
<HospitalCard>
  <BedAvailability>
    ICU: {hospital.availableBeds.icu}
    Emergency: {hospital.availableBeds.emergency}
    General: {hospital.availableBeds.general}
  </BedAvailability>
</HospitalCard>
```

### 3.2 Driver App Integration

**What's Already Done:**

- ✅ Emergency acceptance
- ✅ Location tracking every 5 seconds

**What's Needed:**

**A. Enhanced Location Tracking**

**File:** `apps/emergency-driver-app/src/services/locationService.ts`

```typescript
// Add heading and speed to location updates
const updateLocation = async (location: Location) => {
  const ambulanceUpdate = {
    location: {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    },
    heading: location.coords.heading || 0,
    speed: location.coords.speed || 0,
    timestamp: Date.now(),
  };

  // Update via API
  await api.put(`/ambulances/${ambulanceId}/location`, ambulanceUpdate);

  // Emit via Socket.IO for real-time
  socket.emit("ambulance:location_update", {
    ambulanceId,
    ...ambulanceUpdate,
  });
};
```

**B. Status Management**

Add status updates at each stage:

```typescript
// When accepting emergency
socket.emit("ambulance:status", { status: "dispatched" });

// When starting navigation
socket.emit("ambulance:status", { status: "en-route" });

// At patient location
socket.emit("ambulance:status", { status: "at-scene" });

// Heading to hospital
socket.emit("ambulance:status", { status: "returning" });

// At hospital
socket.emit("ambulance:status", { status: "arrived" });
```

**C. Crew Information Update**

**File:** `apps/emergency-driver-app/src/screens/ProfileScreen.tsx`

Add crew management:

```typescript
// Driver can add/edit crew members for current shift
<CrewManagement>
  <AddCrewMember>
    Name, Role, Certification
  </AddCrewMember>
  <CurrentCrew>
    List of crew members
  </CurrentCrew>
</CrewManagement>
```

### 3.3 Backend Orchestration

**File:** `apps/backend/services/emergencyOrchestrationService.js`

**Complete Emergency Flow:**

```javascript
class EmergencyOrchestrationService {
  // 1. User creates emergency
  async createEmergency(emergencyData, userId) {
    const emergency = await Emergency.create(emergencyData);

    // Find nearest available ambulance
    const ambulance = await this.findNearestAmbulance(
      emergencyData.location,
      emergencyData.severity
    );

    if (ambulance) {
      // Assign ambulance
      await this.assignAmbulance(emergency._id, ambulance._id);

      // Notify driver app
      io.to(`driver:${ambulance.driverId}`).emit("emergency:new", {
        emergency,
        distance: calculateDistance(ambulance.location, emergencyData.location),
      });
    }

    return emergency;
  }

  // 2. Driver accepts emergency
  async acceptEmergency(emergencyId, ambulanceId) {
    const emergency = await Emergency.findById(emergencyId);
    const ambulance = await Ambulance.findById(ambulanceId);

    // Update emergency
    emergency.status = "accepted";
    emergency.assignedAmbulance = {
      ambulanceId: ambulance._id,
      vehicleNumber: ambulance.vehicleNumber,
      dispatchTime: new Date(),
    };
    await emergency.save();

    // Update ambulance
    ambulance.status = "dispatched";
    ambulance.currentEmergency = emergencyId;
    await ambulance.save();

    // Calculate route
    const route = await this.calculateRoute(
      ambulance.currentLocation,
      emergency.location
    );

    emergency.route = route;
    await emergency.save();

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:ambulance_assigned", {
      ambulance: {
        vehicleNumber: ambulance.vehicleNumber,
        driver: ambulance.driver,
        crew: ambulance.crew,
      },
      eta: route.duration,
    });

    // Notify destination hospital
    io.to(`hospital:${emergency.destinationHospital.hospitalId}`).emit(
      "emergency:dispatched",
      {
        emergency,
        ambulance,
        eta: route.duration,
      }
    );
  }

  // 3. Driver updates location
  async updateAmbulanceLocation(ambulanceId, locationData) {
    const ambulance = await Ambulance.findById(ambulanceId);

    ambulance.currentLocation = {
      type: "Point",
      coordinates: [locationData.lng, locationData.lat],
      heading: locationData.heading,
      speed: locationData.speed,
      lastUpdated: new Date(),
    };
    await ambulance.save();

    // Recalculate ETA if en-route to hospital
    if (ambulance.status === "returning" && ambulance.currentEmergency) {
      const emergency = await Emergency.findById(ambulance.currentEmergency);
      const route = await this.calculateRoute(
        { lat: locationData.lat, lng: locationData.lng },
        emergency.destinationHospital.location
      );

      // Notify hospital of updated ETA
      io.to(`hospital:${emergency.destinationHospital.hospitalId}`).emit(
        "ambulance:location",
        {
          ambulanceId,
          location: locationData,
          eta: route.duration,
        }
      );

      // Notify user
      io.to(`user:${emergency.userId}`).emit("emergency:ambulance_location", {
        location: locationData,
        eta: route.duration,
      });
    }
  }

  // 4. Ambulance arrives at hospital
  async markArrived(ambulanceId, hospitalId) {
    const ambulance = await Ambulance.findById(ambulanceId);
    const emergency = await Emergency.findById(ambulance.currentEmergency);

    // Update emergency
    emergency.status = "arrived";
    emergency.assignedAmbulance.actualArrival = new Date();
    await emergency.save();

    // Update ambulance
    ambulance.status = "available";
    ambulance.currentEmergency = null;
    await ambulance.save();

    // Notify hospital
    io.to(`hospital:${hospitalId}`).emit("ambulance:arrived", {
      ambulance,
      emergency,
      patient: emergency.patient,
    });

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:completed", {
      hospital: emergency.destinationHospital,
      assignedBed: emergency.destinationHospital.assignedBed,
    });
  }
}
```

---

## 🎨 **UI/UX Design Specifications**

### Map Theme (Dark Mode)

```javascript
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#16213e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d3748" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a202c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  // ... more styles
];
```

### Custom Markers

- **Hospital:** Purple/pink gradient marker with + icon
- **Own Ambulances (Available):** Blue marker with ambulance icon
- **Own Ambulances (En-route):** Animated blue marker with pulse
- **Incoming Ambulances:** Green marker with directional arrow
- **Patient Location:** Red marker with person icon

### Ambulance Info Panel Design

```
┌─────────────────────────────────────┐
│ 🚑 AMB-001 [🟢 En Route]           │
│ City General Hospital               │
├─────────────────────────────────────┤
│ ⏱️ ETA: 8 mins • 3.2 km            │
├─────────────────────────────────────┤
│ 👤 Driver: John Doe                │
│    📞 +1-234-567-8900               │
│    ⭐ 4.8 rating                    │
├─────────────────────────────────────┤
│ 👥 Crew Members                     │
│    • Sarah Smith (Paramedic EMT-P)  │
│    • Mike Johnson (Nurse RN)        │
├─────────────────────────────────────┤
│ 🏥 Patient: Alice Brown             │
│    45 years • Female                │
│    ❤️ Heart Attack (Critical)       │
│                                     │
│    Vitals:                          │
│    • HR: 110 bpm                    │
│    • BP: 160/95                     │
│    • O2: 92%                        │
├─────────────────────────────────────┤
│ 🛏️ Assigned: ICU Bed 5             │
├─────────────────────────────────────┤
│ [📞 Call Driver] [🗺️ View Route]   │
│ [✅ Mark as Arrived]                │
└─────────────────────────────────────┘
```

---

## 📊 **Implementation Timeline**

### Priority 1: 2-3 Days

- Day 1: Map component, markers, basic tracking
- Day 2: Ambulance info panel, statistics overlay
- Day 3: Socket.IO integration, real-time updates

### Priority 2: 2-3 Days

- Day 1: Backend API endpoints
- Day 2: Database schema updates, Socket.IO events
- Day 3: Service layer, testing

### Priority 3: 3-4 Days

- Day 1: User app integration
- Day 2: Driver app enhancements
- Day 3: Backend orchestration service
- Day 4: End-to-end testing

**Total Estimate:** 7-10 days for complete implementation

---

## 🧪 **Testing Strategy**

### Unit Tests

- Map component rendering
- Marker positioning
- Socket.IO event handlers
- API service methods

### Integration Tests

- User creates emergency → Driver notified
- Driver accepts → Hospital notified
- Location updates → Map updates
- Ambulance arrives → All apps notified

### E2E Testing Scenarios

1. **Emergency Dispatch Flow:**
   - User creates emergency
   - Driver receives notification
   - Driver accepts
   - Hospital sees incoming ambulance
   - Real-time tracking on all apps
   - Arrival confirmation

2. **Multi-Ambulance Tracking:**
   - Multiple ambulances on map
   - Different statuses displayed
   - No marker collisions
   - Smooth animations

3. **Network Resilience:**
   - Socket reconnection
   - Offline handling
   - Data sync on reconnect

---

## 🚀 **Future Enhancements**

### Phase 2 (Post-MVP)

- Historical route playback
- Heat maps for busy areas
- Predictive ETA using traffic data
- Driver performance analytics
- Ambulance maintenance scheduling
- Multi-hospital coordination
- Emergency hotspot identification

---

## 📦 **Dependencies to Install**

### Hospital Dashboard

```bash
npm install @react-google-maps/api
npm install @googlemaps/js-api-loader
```

### Backend

```bash
npm install @googlemaps/google-maps-services-js
npm install geolib  # For distance calculations
```

---

## 🔐 **Security Considerations**

1. **API Key Protection:** Use server-side proxy for Google Maps API
2. **Location Privacy:** Encrypt location data in transit
3. **Socket.IO Auth:** JWT token validation on each connection
4. **Rate Limiting:** Prevent location update spam
5. **HTTPS Only:** All WebSocket connections over WSS

---

## 📱 **Mobile Responsiveness**

- Full-screen map on mobile
- Swipeable ambulance info panel
- Touch-friendly markers (larger touch targets)
- Responsive statistics cards
- Portrait/landscape optimization

---

This plan ensures **real-time, production-ready** map tracking across all three applications with beautiful UI, robust backend, and seamless data flow! 🎯
