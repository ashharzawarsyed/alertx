# 🎯 IMPLEMENTATION CHECKLIST

## 📍 **PRIORITY 1: LIVE MAP TRACKING SYSTEM**

### Hospital Dashboard - Frontend

#### Map Component
- [ ] Create `src/features/dashboard/pages/LiveTracking.jsx`
  - [ ] Google Maps integration with `@react-google-maps/api`
  - [ ] Dark theme map styles
  - [ ] Hospital marker (purple/pink gradient)
  - [ ] Ambulance markers (blue for own, green for incoming)
  - [ ] Custom marker icons
  - [ ] Auto-zoom to fit all markers
  - [ ] Map controls (zoom, pan, fullscreen)

#### Ambulance Info Sidebar
- [ ] Create `src/components/AmbulanceInfoPanel.jsx`
  - [ ] Slide-in animation from right
  - [ ] Vehicle number and status badge
  - [ ] ETA countdown timer (updates every second)
  - [ ] Distance display
  - [ ] Driver information card
  - [ ] Crew members list with roles
  - [ ] Patient information (for incoming)
  - [ ] Vitals display (heart rate, BP, oxygen)
  - [ ] Assigned bed display
  - [ ] Call driver button
  - [ ] View route button
  - [ ] Mark as arrived button
  - [ ] Glassmorphic dark theme design

#### Statistics Overlay
- [ ] Create statistics cards overlay
  - [ ] Total ambulances count
  - [ ] En route count
  - [ ] Available count
  - [ ] Average ETA
  - [ ] Critical patients count
  - [ ] Real-time updates

#### Tracking Service
- [ ] Create `src/services/trackingService.js`
  - [ ] Socket.IO connection setup
  - [ ] Hospital room joining
  - [ ] Ambulance location listener
  - [ ] Status update listener
  - [ ] New dispatch listener
  - [ ] Arrival notification listener
  - [ ] API methods for ambulance data
  - [ ] Route calculation method
  - [ ] Mark arrived method

#### Custom Markers
- [ ] Create `src/components/AmbulanceMarker.jsx`
  - [ ] Rotating ambulance icon based on heading
  - [ ] Color coding by status
  - [ ] Pulsing animation for en-route
  - [ ] Smooth position transitions
  - [ ] Click handler for info panel

#### Route Display
- [ ] Polyline component for routes
  - [ ] Dotted line style
  - [ ] Color by status
  - [ ] Animation along route

### Backend - API Endpoints

#### Ambulance Tracking
- [ ] `GET /api/v1/hospitals/:id/ambulances/tracking`
  - [ ] Get hospital's own ambulances
  - [ ] Get incoming ambulances to hospital
  - [ ] Include crew information
  - [ ] Include current location
  - [ ] Include emergency details (for incoming)
  - [ ] Calculate ETA for incoming

- [ ] `GET /api/v1/ambulances/:id/details`
  - [ ] Vehicle information
  - [ ] Driver details
  - [ ] Crew list
  - [ ] Current status
  - [ ] Current location
  - [ ] Current emergency (if any)

- [ ] `GET /api/v1/maps/route?from=lat,lng&to=lat,lng`
  - [ ] Google Maps Directions API integration
  - [ ] Return encoded polyline
  - [ ] Return distance in km
  - [ ] Return duration in minutes
  - [ ] Consider traffic (optional)

- [ ] `PUT /api/v1/ambulances/:id/arrived`
  - [ ] Mark ambulance as arrived
  - [ ] Update emergency status
  - [ ] Update ambulance status to available
  - [ ] Emit arrival notification
  - [ ] Update bed availability

#### Database Schema
- [ ] Update Ambulance model
  - [ ] Add `currentLocation` with GeoJSON Point
  - [ ] Add `heading` (Number, degrees)
  - [ ] Add `speed` (Number, km/h)
  - [ ] Add `lastUpdated` (Date)
  - [ ] Add `crew` array with user references
  - [ ] Add `currentEmergency` reference

- [ ] Create geospatial index
  - [ ] `db.ambulances.createIndex({ "currentLocation": "2dsphere" })`

- [ ] Update Emergency model
  - [ ] Add `assignedAmbulance` object
  - [ ] Add `route` object (polyline, distance, duration)
  - [ ] Add `destinationHospital` details
  - [ ] Add `assignedBed`

#### Socket.IO Events
- [ ] Implement ambulance location broadcast
  - [ ] Listen for driver location updates
  - [ ] Broadcast to hospital room
  - [ ] Include ambulance ID, location, heading, speed
  - [ ] Calculate and include ETA

- [ ] Implement status change broadcast
  - [ ] Listen for status changes
  - [ ] Broadcast to hospital room
  - [ ] Update database

- [ ] Implement new dispatch notification
  - [ ] When emergency assigned to hospital
  - [ ] Broadcast incoming ambulance details
  - [ ] Include patient information

- [ ] Implement arrival notification
  - [ ] When ambulance marks arrived
  - [ ] Broadcast to hospital
  - [ ] Include patient for admission

### Testing Priority 1
- [ ] Map loads correctly
- [ ] Hospital marker appears at correct location
- [ ] Ambulance markers display
- [ ] Clicking marker opens info panel
- [ ] Info panel shows correct data
- [ ] Statistics cards display correctly
- [ ] Socket.IO connection establishes
- [ ] Real-time location updates work
- [ ] Markers move smoothly
- [ ] ETA countdown updates
- [ ] Call driver button works
- [ ] Route displays on map
- [ ] Mark arrived updates status

---

## 🚨 **PRIORITY 2: EMERGENCY QUEUE INTEGRATION**

### Hospital Dashboard - Emergency Queue Updates

#### Enhanced Accept Modal
- [ ] Update `src/features/dashboard/pages/EmergencyQueue.jsx`
  - [ ] Add ambulance selection section
  - [ ] Fetch available ambulances
  - [ ] Display ambulance cards with:
    - [ ] Vehicle number
    - [ ] Driver name
    - [ ] Distance from emergency
    - [ ] Estimated arrival time
    - [ ] Status indicator
  - [ ] Auto-select nearest ambulance option
  - [ ] Manual selection option
  - [ ] Combined bed + ambulance assignment

#### Emergency Card Enhancement
- [ ] Add ambulance info section (after acceptance)
  - [ ] Ambulance vehicle number
  - [ ] Driver name and photo
  - [ ] Real-time ETA display
  - [ ] Distance remaining
  - [ ] Status badge
  - [ ] "Track on Map" button
  - [ ] "Call Driver" button
  - [ ] Crew information tooltip

#### Real-time Updates
- [ ] Socket.IO listeners for emergency
  - [ ] Ambulance assigned event
  - [ ] Location update event
  - [ ] Status change event
  - [ ] Arrival event
  - [ ] Update emergency card UI

#### Navigation Integration
- [ ] "Track on Map" button
  - [ ] Navigate to Live Tracking page
  - [ ] Focus map on specific ambulance
  - [ ] Open ambulance info panel automatically

### Backend - Emergency-Ambulance Integration

#### New Endpoints
- [ ] `POST /api/v1/emergencies/:id/assign-ambulance`
  - [ ] Validate ambulance availability
  - [ ] Assign ambulance to emergency
  - [ ] Update emergency with ambulance details
  - [ ] Update ambulance with emergency reference
  - [ ] Calculate route
  - [ ] Calculate ETA
  - [ ] Emit Socket.IO events
  - [ ] Return updated emergency

- [ ] `GET /api/v1/emergencies/:id/ambulance`
  - [ ] Get ambulance assigned to emergency
  - [ ] Include current location
  - [ ] Include crew information
  - [ ] Calculate current ETA
  - [ ] Return route information

- [ ] `GET /api/v1/hospitals/:id/ambulances/available`
  - [ ] Find ambulances with status "available"
  - [ ] Belonging to hospital
  - [ ] Calculate distance from emergency location
  - [ ] Sort by distance
  - [ ] Include driver information
  - [ ] Return list with ETAs

#### Emergency-Ambulance Service
- [ ] Create `services/emergencyAmbulanceService.js`
  - [ ] `assignAmbulance(emergencyId, ambulanceId, bedType)`
  - [ ] `getAvailableAmbulances(hospitalId, location)`
  - [ ] `trackEmergencyAmbulance(emergencyId)`
  - [ ] `calculateETA(from, to)`
  - [ ] `unassignAmbulance(emergencyId)`

#### Socket.IO Events
- [ ] Emergency ambulance assignment
  - [ ] Emit to hospital: `emergency:ambulance_dispatched`
  - [ ] Emit to driver: `emergency:assigned`
  - [ ] Emit to user: `emergency:ambulance_assigned`

- [ ] Ambulance location for emergency
  - [ ] Emit to hospital: `emergency:ambulance_location`
  - [ ] Emit to user: `emergency:ambulance_location`
  - [ ] Include updated ETA

### Testing Priority 2
- [ ] Accept modal shows available ambulances
- [ ] Ambulances sorted by distance
- [ ] Can assign ambulance to emergency
- [ ] Emergency card updates after assignment
- [ ] Real-time ETA updates in emergency card
- [ ] "Track on Map" opens Live Tracking
- [ ] Map focuses on correct ambulance
- [ ] Ambulance info panel opens automatically
- [ ] Status changes update emergency card
- [ ] Arrival completes emergency

---

## 🔗 **PRIORITY 3: COMPLETE APP INTEGRATION**

### Emergency User App Updates

#### Emergency Tracking Screen
- [ ] Update `src/screens/EmergencyTrackingScreen.tsx`
  - [ ] Add Socket.IO connection
  - [ ] Listen for ambulance assignment
  - [ ] Listen for location updates
  - [ ] Listen for status updates
  - [ ] Display ambulance on map
  - [ ] Show route polyline
  - [ ] Update marker position real-time
  - [ ] Display ETA countdown

#### Ambulance Info Display
- [ ] Add ambulance information card
  - [ ] Vehicle number
  - [ ] Driver name and photo
  - [ ] Crew members list
  - [ ] ETA and distance
  - [ ] Status indicator
  - [ ] Call driver button
  - [ ] Call hospital button

#### Map Markers
- [ ] Patient location marker (red)
- [ ] Ambulance location marker (blue, updating)
- [ ] Hospital location marker (purple)
- [ ] Route polyline between points

### Emergency Driver App Updates

#### Enhanced Location Tracking
- [ ] Update `src/services/locationService.ts`
  - [ ] Use `watchPosition` with 5-second interval
  - [ ] Extract latitude, longitude
  - [ ] Extract heading (direction)
  - [ ] Extract speed
  - [ ] Send to API endpoint
  - [ ] Emit via Socket.IO

#### Status Management
- [ ] Create status update flow
  - [ ] Dispatched (on accept)
  - [ ] En Route (start navigation)
  - [ ] At Scene (arrive at patient)
  - [ ] Returning (patient picked up)
  - [ ] Arrived (at hospital)
  - [ ] Emit Socket.IO event for each status

#### Crew Management
- [ ] Create `src/screens/CrewManagementScreen.tsx`
  - [ ] Add crew member form
  - [ ] Current crew list
  - [ ] Update crew before accepting emergency
  - [ ] Send crew data with emergency acceptance

#### Active Emergency Screen
- [ ] Update `src/screens/ActiveEmergencyScreen.tsx`
  - [ ] Show patient information
  - [ ] Show destination hospital
  - [ ] Show route on map
  - [ ] Navigation integration
  - [ ] Status update buttons
  - [ ] Pickup patient button
  - [ ] Arrived at hospital button

### Backend - Orchestration Service

#### Emergency Orchestration Service
- [ ] Create `services/emergencyOrchestrationService.js`

- [ ] Step 1: User creates emergency
  - [ ] Save emergency to database
  - [ ] Run AI triage
  - [ ] Find nearby hospitals
  - [ ] Emit to hospitals: `emergency:new`

- [ ] Step 2: Hospital accepts
  - [ ] Update emergency status
  - [ ] Find available ambulance
  - [ ] Assign ambulance
  - [ ] Emit to user: `emergency:accepted`
  - [ ] Emit to driver: `emergency:assigned`

- [ ] Step 3: Driver accepts
  - [ ] Update ambulance status
  - [ ] Update emergency status
  - [ ] Calculate route
  - [ ] Emit to all parties: status update

- [ ] Step 4: Location updates
  - [ ] Receive from driver app
  - [ ] Update ambulance location
  - [ ] Recalculate ETA
  - [ ] Broadcast to hospital and user

- [ ] Step 5: Patient pickup
  - [ ] Update status to "in-transit"
  - [ ] Calculate route to hospital
  - [ ] Emit to hospital and user

- [ ] Step 6: Hospital arrival
  - [ ] Update emergency status to "completed"
  - [ ] Update ambulance status to "available"
  - [ ] Update bed availability (-1)
  - [ ] Emit to all parties: completion

#### Data Sync Service
- [ ] Create `services/dataSyncService.js`
  - [ ] Sync bed availability across apps
  - [ ] Sync emergency status everywhere
  - [ ] Sync ambulance status
  - [ ] Handle reconnections
  - [ ] Queue updates during offline

#### Google Maps Service
- [ ] Create `services/googleMapsService.js`
  - [ ] Calculate route between two points
  - [ ] Get directions
  - [ ] Encode polyline
  - [ ] Calculate distance
  - [ ] Calculate duration
  - [ ] Consider traffic (optional)

### Testing Priority 3

#### User App Testing
- [ ] User creates emergency
- [ ] Receives hospital acceptance notification
- [ ] Sees ambulance details
- [ ] Sees driver information
- [ ] Map shows ambulance location
- [ ] Ambulance marker updates every 5s
- [ ] ETA countdown updates
- [ ] Status changes reflect
- [ ] Receives arrival notification
- [ ] Sees bed assignment

#### Driver App Testing
- [ ] Receives emergency notification
- [ ] Sees patient details
- [ ] Sees route to patient
- [ ] Location updates send correctly
- [ ] Status updates work
- [ ] Pickup patient updates all apps
- [ ] Route to hospital shows
- [ ] Arrival updates all apps

#### Hospital Dashboard Testing
- [ ] Receives emergency request
- [ ] Can assign ambulance
- [ ] Sees incoming ambulance on map
- [ ] Real-time location updates
- [ ] ETA updates in emergency queue
- [ ] Track on map works
- [ ] Receives arrival notification
- [ ] Bed count updates

#### End-to-End Testing
- [ ] User → Emergency → Hospitals notified
- [ ] Hospital → Accept → User notified
- [ ] Hospital → Assign Ambulance → Driver notified
- [ ] Driver → Accept → All apps update
- [ ] Driver → Location Updates → Maps update everywhere
- [ ] Driver → Pickup → Status syncs everywhere
- [ ] Driver → Arrive → Emergency completes everywhere
- [ ] Bed availability syncs across all apps
- [ ] No data inconsistencies

---

## 📦 **DEPENDENCIES CHECKLIST**

### Hospital Dashboard
- [ ] `npm install @react-google-maps/api`
- [ ] `npm install @googlemaps/js-api-loader`
- [ ] Verify `socket.io-client` is installed

### Backend
- [ ] `npm install @googlemaps/google-maps-services-js`
- [ ] `npm install geolib`
- [ ] Verify `socket.io` is installed

### User App
- [ ] Verify `socket.io-client` is installed
- [ ] Verify Google Maps configured in `app.json`

### Driver App
- [ ] Verify `@react-native-community/geolocation` is installed
- [ ] Verify background location permissions
- [ ] Verify `socket.io-client` is installed

---

## 🔧 **CONFIGURATION CHECKLIST**

### Environment Variables
- [ ] Hospital Dashboard `.env`:
  ```
  REACT_APP_API_URL=http://localhost:5001
  REACT_APP_SOCKET_URL=http://localhost:5001
  REACT_APP_GOOGLE_MAPS_KEY=AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI
  ```

- [ ] Backend `.env`:
  ```
  GOOGLE_MAPS_API_KEY=AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI
  ```

- [ ] User App `Config.ts`:
  ```typescript
  API_URL: "http://192.168.100.23:5001"
  GOOGLE_MAPS_KEY: "AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI"
  ```

- [ ] Driver App `Config.ts`:
  ```typescript
  API_URL: "http://192.168.100.23:5001"
  LOCATION_UPDATE_INTERVAL: 5000
  ```

### Database
- [ ] Create geospatial index on ambulances
- [ ] Update Ambulance schema
- [ ] Update Emergency schema
- [ ] Test geospatial queries

### Google Maps API
- [ ] Enable Maps JavaScript API
- [ ] Enable Directions API
- [ ] Enable Distance Matrix API (optional)
- [ ] Configure API key restrictions
- [ ] Test API calls

---

## 🎯 **SUCCESS CRITERIA**

### Priority 1 Success
✅ Map displays with ambulances in real-time  
✅ Clicking ambulance shows detailed info  
✅ ETA updates every 5 seconds  
✅ Socket.IO connection stable  
✅ Smooth marker animations  

### Priority 2 Success
✅ Hospital can assign ambulance to emergency  
✅ Emergency card shows ambulance tracking  
✅ Real-time ETA in emergency queue  
✅ "Track on Map" navigation works  
✅ Status changes sync immediately  

### Priority 3 Success
✅ User sees ambulance after hospital accepts  
✅ Driver receives emergency assignment  
✅ Location updates in all 3 apps  
✅ Status syncs across all apps  
✅ Emergency completes when ambulance arrives  
✅ Bed availability updates correctly  
✅ No stale data anywhere  

---

**Use this checklist to track your implementation progress!** ✅
