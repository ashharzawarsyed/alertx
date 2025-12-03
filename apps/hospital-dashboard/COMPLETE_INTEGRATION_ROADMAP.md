# Hospital Dashboard - Complete Integration Roadmap

## Connecting Hospital Dashboard with User App, Driver App & Backend

---

## 🎯 **PRIORITY 1: LIVE MAP TRACKING SYSTEM**

**Timeline:** 3-4 days  
**Focus:** Real-time ambulance tracking with beautiful UI

### What Will Be Built:

#### 1. **Live Tracking Page** (`LiveTracking.jsx`)

- Google Maps with dark theme
- Real-time ambulance markers (own fleet + incoming)
- Hospital location marker (purple/pink gradient)
- Smooth marker animations
- Auto-zoom to show all ambulances
- Statistics overlay (Total, En Route, Available, Critical)

#### 2. **Ambulance Info Sidebar** (`AmbulanceInfoPanel.jsx`)

- Slides in when clicking ambulance marker
- Shows:
  - Vehicle number and status
  - ETA countdown with distance
  - Driver info (name, phone, photo, rating)
  - Crew members (name, role, certification)
  - Patient details (for incoming ambulances)
  - Vitals (heart rate, BP, oxygen)
  - Assigned bed
- Actions: Call Driver, View Route, Mark as Arrived

#### 3. **Map Features**

- Custom markers with color coding:
  - Blue: Own ambulances (available)
  - Blue pulsing: Own ambulances (dispatched)
  - Green: Incoming ambulances
  - Purple: Hospital location
- Polyline routes (dotted lines)
- Cluster markers when zoomed out
- Fullscreen mode

#### 4. **Socket.IO Integration**

- Real-time location updates (every 5 seconds)
- Status change notifications
- New dispatch alerts
- Arrival notifications
- Auto-reconnect on disconnect

### Backend Requirements:

**New API Endpoints:**

```
GET    /api/v1/hospitals/:id/ambulances/tracking
GET    /api/v1/ambulances/:id/details
GET    /api/v1/maps/route?from=lat,lng&to=lat,lng
PUT    /api/v1/ambulances/:id/arrived
```

**Socket.IO Events:**

```javascript
// Listen
socket.on("ambulance:location", updateMarker);
socket.on("ambulance:status", updateStatus);
socket.on("emergency:dispatched", showNewIncoming);
socket.on("ambulance:arrived", showArrivalNotification);

// Emit
socket.emit("hospital:join", hospitalId);
socket.emit("ambulance:track", ambulanceId);
```

**Database Updates:**

```javascript
// Ambulance schema enhancement
currentLocation: {
  type: { type: String, default: 'Point' },
  coordinates: [Number, Number], // [lng, lat]
  heading: Number,  // Direction in degrees
  speed: Number,    // km/h
  lastUpdated: Date
}

// Add geospatial index
ambulanceSchema.index({ 'currentLocation': '2dsphere' });
```

### Dependencies to Install:

```bash
cd apps/hospital-dashboard
npm install @react-google-maps/api @googlemaps/js-api-loader
```

---

## 🎯 **PRIORITY 2: EMERGENCY QUEUE ↔ LIVE TRACKING INTEGRATION**

**Timeline:** 2-3 days  
**Focus:** Connect emergency requests to real-time ambulance dispatch

### What Will Be Built:

#### 1. **Enhanced Emergency Queue** (Update existing `EmergencyQueue.jsx`)

- Add "Track Ambulance" button for accepted emergencies
- Show ambulance details in emergency card
- Display real-time ETA
- Show ambulance crew information
- Link to Live Tracking map (focus on specific ambulance)

#### 2. **Emergency → Ambulance Assignment Flow**

**When Hospital Accepts Emergency:**

```javascript
// User flow:
1. Hospital clicks "Accept & Assign Bed"
2. Modal shows available beds + available ambulances
3. Hospital selects bed type and ambulance
4. Backend assigns ambulance to emergency
5. Driver app gets notification
6. Driver accepts
7. Hospital dashboard shows ambulance en route
8. Real-time tracking begins
```

**Updated Accept Modal:**

```javascript
<AcceptEmergencyModal>
  <BedSelection>
    Select Bed Type: ICU, General, Emergency, Operation
  </BedSelection>

  <AmbulanceSelection>
    Available Ambulances: • AMB-001 (2.5 km away) - Driver: John Doe • AMB-002
    (3.8 km away) - Driver: Sarah Smith [Auto-assign nearest] [Manual select]
  </AmbulanceSelection>

  <ConfirmButton>Assign & Dispatch</ConfirmButton>
</AcceptEmergencyModal>
```

#### 3. **Real-Time Status Updates**

**Emergency Card Enhancement:**

```javascript
// Before acceptance: Show patient info only
<EmergencyCard status="pending">
  Patient, Condition, Symptoms, Location
  [Accept] [Reject]
</EmergencyCard>

// After acceptance: Show ambulance tracking
<EmergencyCard status="accepted">
  Patient Info
  + Ambulance: AMB-001 (En Route)
  + ETA: 8 minutes • 3.2 km
  + Driver: John Doe
  + [Track on Map] [Call Driver]
</EmergencyCard>
```

#### 4. **Backend Integration**

**New Service:** `emergencyAmbulanceService.js`

```javascript
class EmergencyAmbulanceService {
  // Assign ambulance to emergency
  async assignAmbulance(emergencyId, ambulanceId, hospitalId) {
    // 1. Update emergency with ambulance
    // 2. Update ambulance status to "dispatched"
    // 3. Calculate route and ETA
    // 4. Notify driver via Socket.IO
    // 5. Notify hospital via Socket.IO
    // 6. Return updated emergency
  }

  // Get available ambulances for hospital
  async getAvailableAmbulances(hospitalId, location) {
    // Find ambulances where:
    // - status = "available"
    // - hospitalId matches
    // Sort by distance from emergency location
  }

  // Track emergency ambulance
  async trackEmergencyAmbulance(emergencyId) {
    // Get ambulance assigned to emergency
    // Return real-time location and ETA
  }
}
```

### Backend Requirements:

**API Endpoints:**

```
POST   /api/v1/emergencies/:id/assign-ambulance
Body: { ambulanceId, bedType, bedNumber }

GET    /api/v1/emergencies/:id/ambulance
Response: { ambulance, location, eta, crew }

GET    /api/v1/hospitals/:id/ambulances/available
Response: [{ ambulance, distance, eta }]
```

**Socket Events:**

```javascript
// Hospital dashboard listens
socket.on("emergency:ambulance_assigned", (data) => {
  // Update emergency card with ambulance info
});

socket.on("emergency:ambulance_location", (data) => {
  // Update ETA in emergency card
});

socket.on("ambulance:arrived", (data) => {
  // Show arrival notification
  // Update emergency status to "arrived"
});
```

---

## 🎯 **PRIORITY 3: COMPLETE END-TO-END INTEGRATION**

**Timeline:** 3-4 days  
**Focus:** User App → Driver App → Hospital Dashboard data flow

### What Will Be Built:

#### 1. **User App Integration** (Emergency User App)

**Update `EmergencyTrackingScreen.tsx`:**

```typescript
// Add real-time tracking of assigned ambulance
useEffect(() => {
  socket.on("emergency:ambulance_assigned", (data) => {
    setAmbulance(data.ambulance);
    setDriver(data.driver);
    setCrew(data.crew);
    setETA(data.eta);
  });

  socket.on("emergency:ambulance_location", (data) => {
    updateAmbulanceMarker(data.location);
    setETA(data.eta);
  });

  socket.on("emergency:status", (data) => {
    if (data.status === "arrived") {
      navigation.navigate("ArrivalConfirmation");
    }
  });
}, [emergencyId]);
```

**Add Ambulance Tracking View:**

```typescript
<MapView>
  <PatientMarker location={patientLocation} />
  <AmbulanceMarker location={ambulanceLocation} />
  <HospitalMarker location={hospitalLocation} />
  <Polyline route={route} />
</MapView>

<AmbulanceInfo>
  Vehicle: {ambulance.number}
  Driver: {driver.name}
  Crew: {crew.map(c => c.name).join(', ')}
  ETA: {eta} minutes
  [Call Driver] [Call Hospital]
</AmbulanceInfo>
```

#### 2. **Driver App Integration** (Emergency Driver App)

**Update `ActiveEmergencyScreen.tsx`:**

```typescript
// Enhanced location tracking
const startLocationTracking = () => {
  const watchId = Geolocation.watchPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        heading: position.coords.heading || 0,
        speed: position.coords.speed || 0,
      };

      // Update via API
      ambulanceService.updateLocation(ambulanceId, location);

      // Emit via Socket.IO
      socket.emit("ambulance:location_update", {
        ambulanceId,
        location,
        emergencyId,
      });
    },
    { enableHighAccuracy: true, interval: 5000 }
  );
};

// Status updates
const updateStatus = (status) => {
  socket.emit("ambulance:status", {
    ambulanceId,
    status, // "dispatched", "en-route", "at-scene", "returning"
    emergencyId,
  });
};
```

**Add Crew Management:**

```typescript
<CrewSection>
  <AddCrewMember>
    Name: [Input]
    Role: [Paramedic/Nurse/EMT]
    Certification: [Input]
    [Add to Crew]
  </AddCrewMember>

  <CurrentCrew>
    {crew.map(member => (
      <CrewCard>
        {member.name} - {member.role}
        Cert: {member.certification}
        [Remove]
      </CrewCard>
    ))}
  </CurrentCrew>
</CrewSection>
```

#### 3. **Backend Orchestration Service**

**File:** `apps/backend/services/emergencyOrchestrationService.js`

**Complete Flow Implementation:**

```javascript
class EmergencyOrchestrationService {
  // STEP 1: User creates emergency
  async createEmergency(data, userId) {
    const emergency = await Emergency.create({
      userId,
      location: data.location,
      condition: data.condition,
      severity: data.severity,
      status: "pending",
    });

    // AI Triage
    const triageResult = await aiTriageService.analyze(data);
    emergency.aiScore = triageResult.score;
    emergency.priority = triageResult.priority;
    await emergency.save();

    // Find nearby hospitals
    const hospitals = await this.findNearbyHospitals(
      data.location,
      triageResult.severity
    );

    // Notify hospitals
    hospitals.forEach((hospital) => {
      io.to(`hospital:${hospital._id}`).emit("emergency:new", {
        emergency,
        distance: calculateDistance(hospital.location, data.location),
      });
    });

    return emergency;
  }

  // STEP 2: Hospital accepts emergency
  async acceptEmergency(emergencyId, hospitalId, bedType) {
    const emergency = await Emergency.findById(emergencyId);

    emergency.status = "accepted";
    emergency.destinationHospital = {
      hospitalId,
      bedType,
      acceptedAt: new Date(),
    };
    await emergency.save();

    // Find available ambulance
    const ambulance = await this.findNearestAmbulance(
      hospitalId,
      emergency.location
    );

    if (ambulance) {
      // Assign ambulance
      await this.assignAmbulance(emergencyId, ambulance._id);
    }

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:accepted", {
      hospital: await Hospital.findById(hospitalId),
      ambulance: ambulance || null,
      bedType,
    });

    return emergency;
  }

  // STEP 3: Assign ambulance to emergency
  async assignAmbulance(emergencyId, ambulanceId) {
    const emergency = await Emergency.findById(emergencyId);
    const ambulance = await Ambulance.findById(ambulanceId);

    // Calculate route
    const route = await googleMapsService.getRoute(
      ambulance.currentLocation,
      emergency.location
    );

    // Update emergency
    emergency.assignedAmbulance = {
      ambulanceId,
      vehicleNumber: ambulance.vehicleNumber,
      driver: ambulance.driver,
      crew: ambulance.crew,
      dispatchTime: new Date(),
      estimatedArrival: new Date(Date.now() + route.duration * 60000),
    };
    emergency.route = {
      distance: route.distance,
      duration: route.duration,
      polyline: route.polyline,
    };
    await emergency.save();

    // Update ambulance
    ambulance.status = "dispatched";
    ambulance.currentEmergency = emergencyId;
    await ambulance.save();

    // Notify driver
    io.to(`driver:${ambulance.driver.userId}`).emit("emergency:assigned", {
      emergency,
      route,
      patient: {
        name: emergency.patientName,
        age: emergency.patientAge,
        condition: emergency.condition,
      },
    });

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:ambulance_assigned", {
      ambulance: {
        vehicleNumber: ambulance.vehicleNumber,
        driver: ambulance.driver,
        crew: ambulance.crew,
      },
      eta: route.duration,
    });

    // Notify hospital
    io.to(`hospital:${emergency.destinationHospital.hospitalId}`).emit(
      "emergency:ambulance_dispatched",
      {
        emergencyId,
        ambulance,
        eta: route.duration,
      }
    );
  }

  // STEP 4: Driver accepts emergency
  async driverAcceptEmergency(ambulanceId, emergencyId) {
    const ambulance = await Ambulance.findById(ambulanceId);

    ambulance.status = "en-route";
    await ambulance.save();

    const emergency = await Emergency.findById(emergencyId);
    emergency.status = "en-route";
    await emergency.save();

    // Start location tracking
    // Notify all parties
    io.to(`user:${emergency.userId}`).emit("emergency:driver_on_way", {
      driver: ambulance.driver,
      eta: emergency.route.duration,
    });
  }

  // STEP 5: Real-time location updates
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

    if (ambulance.currentEmergency) {
      const emergency = await Emergency.findById(ambulance.currentEmergency);

      // Recalculate ETA
      const destination =
        emergency.status === "returning"
          ? emergency.destinationHospital.location
          : emergency.location;

      const route = await googleMapsService.getRoute(
        { lat: locationData.lat, lng: locationData.lng },
        destination
      );

      // Broadcast to all parties
      io.to(`user:${emergency.userId}`).emit("emergency:ambulance_location", {
        location: locationData,
        eta: route.duration,
      });

      io.to(`hospital:${emergency.destinationHospital.hospitalId}`).emit(
        "ambulance:location",
        {
          ambulanceId,
          emergencyId: emergency._id,
          location: locationData,
          eta: route.duration,
        }
      );
    }
  }

  // STEP 6: Ambulance picks up patient
  async pickupPatient(ambulanceId, emergencyId) {
    const ambulance = await Ambulance.findById(ambulanceId);
    const emergency = await Emergency.findById(emergencyId);

    ambulance.status = "returning";
    await ambulance.save();

    emergency.status = "in-transit";
    emergency.pickupTime = new Date();
    await emergency.save();

    // Calculate route to hospital
    const route = await googleMapsService.getRoute(
      emergency.location,
      emergency.destinationHospital.location
    );

    // Notify hospital
    io.to(`hospital:${emergency.destinationHospital.hospitalId}`).emit(
      "emergency:patient_picked_up",
      {
        emergencyId,
        ambulance,
        eta: route.duration,
      }
    );

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:on_way_to_hospital", {
      hospital: await Hospital.findById(
        emergency.destinationHospital.hospitalId
      ),
      eta: route.duration,
    });
  }

  // STEP 7: Ambulance arrives at hospital
  async arriveAtHospital(ambulanceId, hospitalId, emergencyId) {
    const ambulance = await Ambulance.findById(ambulanceId);
    const emergency = await Emergency.findById(emergencyId);

    ambulance.status = "available";
    ambulance.currentEmergency = null;
    await ambulance.save();

    emergency.status = "completed";
    emergency.completedAt = new Date();
    await emergency.save();

    // Update hospital bed availability
    await Hospital.findByIdAndUpdate(hospitalId, {
      $inc: {
        [`availableBeds.${emergency.destinationHospital.bedType}`]: -1,
      },
    });

    // Notify hospital
    io.to(`hospital:${hospitalId}`).emit("ambulance:arrived", {
      ambulance,
      emergency,
      patient: {
        name: emergency.patientName,
        age: emergency.patientAge,
        condition: emergency.condition,
        vitals: emergency.vitals,
      },
      assignedBed: emergency.destinationHospital.bedType,
    });

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:completed", {
      hospital: await Hospital.findById(hospitalId),
      bedAssigned: emergency.destinationHospital.bedType,
      completedAt: emergency.completedAt,
    });
  }
}
```

#### 4. **Data Synchronization Service**

**File:** `apps/backend/services/dataSyncService.js`

```javascript
class DataSyncService {
  // Sync hospital bed availability
  async syncBedAvailability(hospitalId) {
    const hospital = await Hospital.findById(hospitalId);

    // Broadcast to all connected clients
    io.to(`hospital:${hospitalId}`).emit("bed:updated", {
      availableBeds: hospital.availableBeds,
      totalBeds: hospital.totalBeds,
    });

    // Broadcast to user apps searching for hospitals
    io.emit("hospitals:bed_update", {
      hospitalId,
      availableBeds: hospital.availableBeds,
    });
  }

  // Sync emergency status across all apps
  async syncEmergencyStatus(emergencyId) {
    const emergency = await Emergency.findById(emergencyId)
      .populate("destinationHospital.hospitalId")
      .populate("assignedAmbulance.ambulanceId");

    // Notify user
    io.to(`user:${emergency.userId}`).emit("emergency:sync", {
      status: emergency.status,
      ambulance: emergency.assignedAmbulance,
      hospital: emergency.destinationHospital,
    });

    // Notify hospital
    if (emergency.destinationHospital?.hospitalId) {
      io.to(`hospital:${emergency.destinationHospital.hospitalId}`).emit(
        "emergency:sync",
        emergency
      );
    }

    // Notify driver
    if (emergency.assignedAmbulance?.driver?.userId) {
      io.to(`driver:${emergency.assignedAmbulance.driver.userId}`).emit(
        "emergency:sync",
        emergency
      );
    }
  }

  // Sync ambulance status
  async syncAmbulanceStatus(ambulanceId) {
    const ambulance = await Ambulance.findById(ambulanceId);

    // Notify hospital
    io.to(`hospital:${ambulance.hospitalId}`).emit("ambulance:status_sync", {
      ambulanceId,
      status: ambulance.status,
      location: ambulance.currentLocation,
      currentEmergency: ambulance.currentEmergency,
    });
  }
}
```

---

## 📊 **Complete Integration Flow Diagram**

```
USER APP                  BACKEND                    DRIVER APP                 HOSPITAL DASHBOARD
   │                         │                           │                             │
   │─────Emergency────────>│                           │                             │
   │      Created           │                           │                             │
   │                         │──AI Triage──────────>│                             │
   │                         │                           │                             │
   │                         │────New Emergency─────────────────────────────────────>│
   │                         │     Broadcast             │                             │
   │                         │                           │                             │
   │                         │<────Accept Emergency──────────────────────────────────│
   │                         │   (+ Assign Ambulance)    │                             │
   │                         │                           │                             │
   │<─────Accepted───────│─────Emergency Assigned────>│                             │
   │   (Hospital Info)      │   (Route, Patient)        │                             │
   │                         │                           │                             │
   │                         │<────Driver Accepts───────│                             │
   │                         │     Emergency             │                             │
   │                         │                           │                             │
   │<─Driver En Route────│────Status: En Route──────────────────────────────────>│
   │   (ETA, Driver)         │                           │                             │
   │                         │                           │                             │
   │<──Location Update───│<───GPS Location Update───│                             │
   │   (Every 5s)            │   (Every 5s)              │                             │
   │                         │────Location Broadcast─────────────────────────────>│
   │                         │   (Update Map)            │                             │
   │                         │                           │                             │
   │                         │<────Pickup Patient───────│                             │
   │<─Patient Picked Up──│────Status: In Transit────────────────────────────────>│
   │   (New ETA)             │                           │                             │
   │                         │                           │                             │
   │                         │<────Arrived──────────────│                             │
   │                         │   at Hospital             │                             │
   │                         │────Arrival Notification──────────────────────────>│
   │<─Emergency Complete─│                           │                             │
   │   (Bed Assigned)        │                           │                             │
```

---

## 🔧 **Configuration & Setup**

### Environment Variables

**Hospital Dashboard (.env):**

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
REACT_APP_GOOGLE_MAPS_KEY=AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI
```

**Backend (.env):**

```env
GOOGLE_MAPS_API_KEY=AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI
SOCKET_PORT=5001
```

**User App (Config.ts):**

```typescript
API_URL: "http://192.168.100.23:5001";
SOCKET_URL: "http://192.168.100.23:5001";
GOOGLE_MAPS_KEY: "AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI";
```

**Driver App (Config.ts):**

```typescript
API_URL: "http://192.168.100.23:5001";
SOCKET_URL: "http://192.168.100.23:5001";
LOCATION_UPDATE_INTERVAL: 5000; // 5 seconds
```

---

## 🧪 **Testing Checklist**

### Priority 1 Testing

- [ ] Map displays with dark theme
- [ ] Hospital marker shows at correct location
- [ ] Ambulance markers display correctly
- [ ] Clicking marker opens info panel
- [ ] Statistics update in real-time
- [ ] Socket.IO connection establishes
- [ ] Location updates reflect on map

### Priority 2 Testing

- [ ] Emergency queue shows incoming requests
- [ ] Accept modal displays available ambulances
- [ ] Assigning ambulance updates emergency card
- [ ] Emergency card shows real-time ETA
- [ ] "Track on Map" button works
- [ ] Ambulance arrival updates emergency status

### Priority 3 Testing

- [ ] User creates emergency → Hospitals notified
- [ ] Hospital accepts → User notified
- [ ] Driver accepts → All parties notified
- [ ] Location updates → Map updates in all apps
- [ ] Pickup → Status syncs everywhere
- [ ] Arrival → Emergency completes in all apps
- [ ] Bed availability updates correctly

---

## 📦 **Deployment Checklist**

### Backend

- [ ] Google Maps API key configured
- [ ] Socket.IO CORS settings correct
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] SSL/TLS certificates installed

### Hospital Dashboard

- [ ] Google Maps API key in .env
- [ ] Socket.IO URL points to production
- [ ] Build optimized for production
- [ ] Deployed to hosting (Vercel/Netlify)

### Mobile Apps

- [ ] API URLs point to production
- [ ] Google Maps configured in app.json
- [ ] Location permissions requested
- [ ] Background location enabled (Driver app)
- [ ] Published to stores

---

This comprehensive plan ensures **seamless real-time integration** across all three applications with production-ready code! 🚀
