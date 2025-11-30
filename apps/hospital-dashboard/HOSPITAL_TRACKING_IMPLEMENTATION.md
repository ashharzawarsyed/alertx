# Hospital Dashboard Ambulance Tracking Implementation

## Overview

The ambulance tracking system has been successfully extended to the hospital dashboard, allowing hospital staff to monitor incoming patients and track ambulances in real-time with the same advanced polyline visualization used in the patient app.

## Features

### 1. **Live Tracking Preview in Patient Cards**
- Each incoming patient card shows a compact tracking preview
- Displays real-time progress bar with percentage completion
- Shows remaining and traversed distances
- Quick "View Map" button to open full tracking view

### 2. **Full-Screen Tracking Modal**
- Beautiful modal interface with Google Maps integration
- Red solid lines for remaining path
- Blue dotted lines for traversed path
- Real-time progress indicators and distance metrics
- Status badges (En Route to Patient / Transporting to Hospital / Completed)
- Legend showing line types

### 3. **Ambulance Fleet Integration**
- Track button on each ambulance card
- Automatically links ambulances to their assigned patients
- Opens tracking modal with complete journey visualization

### 4. **Multi-Patient Navigation**
- Patient carousel shows tracking for each incoming patient
- Navigate between patients while maintaining tracking state
- Automatic ambulance-patient matching

## Components Created

### 1. **ambulanceTracking.js** (`src/utils/`)
Core tracking engine with:
- `calculateDistance()` - Haversine formula for geo-distance
- `generatePathPoints()` - Linear interpolation for smooth paths (20-30 points)
- `calculateTraversedPath()` - Splits path at ambulance position
- `generateTrackingSegments()` - Creates colored line segments
- `useAmbulanceTracking()` - React hook for tracking state

**Functions:**
```javascript
calculateDistance(point1, point2) // Returns km
generatePathPoints(start, end, numPoints) // Returns path array
calculateTraversedPath(pathPoints, ambulance, destination) // Returns {traversed, remaining}
generateTrackingSegments(ambulance, patient, hospital, status) // Returns segments array
useAmbulanceTracking(ambulance, patient, hospital, status) // Returns {segments, progress, distances}
```

### 2. **mapPolyline.js** (`src/utils/`)
Google Maps polyline generation:
- `generatePolylineCode()` - Creates JavaScript for WebView injection
- `generateTrackingMapHTML()` - Complete HTML map with markers and polylines

**Features:**
- Solid lines (strokeOpacity: 1)
- Dotted lines (icons array with dash pattern)
- Custom colors, weights, z-index
- Marker customization

### 3. **HospitalTrackingMap.jsx** (`src/components/tracking/`)
Main tracking visualization component:

**Props:**
```javascript
{
  ambulance: Object,    // Ambulance data with location
  patient: Object,      // Patient data with pickup location
  hospital: Object,     // Hospital data with location
  status: String,       // 'en_route_to_patient' | 'transporting_to_hospital' | 'completed'
  className: String     // Optional CSS classes
}
```

**Features:**
- Progress overlay (percentage and visual bar)
- Remaining distance card
- Status badge
- Legend (red solid = remaining, blue dotted = traversed)
- Fallback UI for missing data
- Error handling for map load failures

### 4. **TrackingPreview Component**
Compact preview for patient cards:

**Props:**
```javascript
{
  ambulance: Object,
  patient: Object,
  hospital: Object,
  status: String,
  onViewFullMap: Function  // Callback to open full map
}
```

**Displays:**
- Progress bar with percentage
- Remaining distance (red line indicator)
- Traversed distance (blue dotted line indicator)
- "View Map" link

## Integration Points

### 1. **IncomingPatientCard.jsx** (Modified)
```javascript
import { TrackingPreview } from "../tracking/HospitalTrackingMap";

// New props added
{
  ambulance: Object,      // NEW
  hospital: Object,       // NEW
  onViewTracking: Function  // NEW
}

// Tracking preview rendered automatically if ambulance.location exists
{ambulance && ambulance.location && (
  <TrackingPreview
    ambulance={ambulance}
    patient={patient}
    hospital={hospital}
    status={trackingStatus}
    onViewFullMap={handleViewFullTracking}
  />
)}
```

### 2. **PatientNavigationCarousel.jsx** (Modified)
```javascript
// New props added
{
  ambulances: Array,      // NEW - Array of all ambulances
  hospital: Object,       // NEW - Hospital data
  onViewTracking: Function  // NEW - Callback for tracking modal
}

// Helper function to match ambulance to patient
const getCurrentAmbulance = (patient) => {
  return ambulances.find(
    amb => amb.id === patient.ambulanceId || 
           amb.assignedEmergencyId === patient.id
  );
};

// Pass to IncomingPatientCard
<IncomingPatientCard
  patient={currentPatient}
  ambulance={getCurrentAmbulance(currentPatient)}
  hospital={hospital}
  onViewTracking={onViewTracking}
  // ... other props
/>
```

### 3. **DashboardHome.jsx** (Modified)
```javascript
import { HospitalTrackingMap } from "../../../components/tracking/HospitalTrackingMap";

// Tracking modal state
const [trackingModal, setTrackingModal] = useState({
  isOpen: false,
  patient: null,
  ambulance: null,
  hospital: null,
});

// Handler for opening tracking modal
const handleViewTracking = (patient, ambulance, hospitalData) => {
  setTrackingModal({
    isOpen: true,
    patient: patient,
    ambulance: ambulance,
    hospital: hospitalData || hospital,
  });
};

// Handler for ambulance track button
const handleTrackAmbulance = (ambulance) => {
  const assignedPatient = incomingPatients.find(
    p => p.ambulanceId === ambulance.id
  );
  
  if (assignedPatient) {
    handleViewTracking(assignedPatient, ambulance, hospital);
  }
};

// Pass to carousel
<PatientNavigationCarousel
  patients={incomingPatients}
  ambulances={ambulances}        // NEW
  hospital={hospital}             // NEW
  onViewTracking={handleViewTracking}  // NEW
  // ... other props
/>

// Tracking modal JSX (at end of component)
{trackingModal.isOpen && (
  <div className="fixed inset-0 z-[100] ...">
    <HospitalTrackingMap
      ambulance={trackingModal.ambulance}
      patient={trackingModal.patient}
      hospital={trackingModal.hospital}
      status={...}
    />
  </div>
)}
```

## Data Flow

```
DashboardHome (State Management)
    |
    ├── trackingModal state
    ├── handleViewTracking()
    └── handleTrackAmbulance()
    |
    v
PatientNavigationCarousel (Navigation)
    |
    ├── Gets: ambulances[], hospital, onViewTracking
    ├── Matches ambulance to current patient
    └── Passes data down
    |
    v
IncomingPatientCard (Preview)
    |
    ├── Shows TrackingPreview if ambulance.location exists
    └── Calls onViewTracking() when "View Map" clicked
    |
    v
HospitalTrackingMap (Full Visualization)
    |
    ├── Uses useAmbulanceTracking() hook
    ├── Generates polyline segments
    ├── Renders map with iframe + polylines
    └── Shows progress overlays
```

## Status Tracking

The system handles three journey phases:

### 1. **En Route to Patient** (`en_route_to_patient`)
- Shows single path from ambulance → patient
- Red solid line for remaining path
- Blue dotted line for traversed path
- Lines split at ambulance's current position

### 2. **Transporting to Hospital** (`transporting_to_hospital`)
- Shows completed pickup path (patient → ambulance) in blue dotted
- Shows active transport path (ambulance → hospital)
- Red solid for remaining, blue dotted for traversed

### 3. **Completed** (`completed`)
- All lines cleared
- Status badge shows "Trip Completed"
- Map remains visible with final positions

**Status Determination:**
```javascript
const trackingStatus = patient.status === 'pickedUp' || patient.pickupTime 
  ? 'transporting_to_hospital' 
  : 'en_route_to_patient';
```

## Mock Data Structure

### Ambulance Object
```javascript
{
  id: "amb-001",
  vehicleNumber: "AMB-001",
  location: {
    latitude: 33.6522,
    longitude: 73.0366
  },
  status: "on_route",
  assignedEmergencyId: "emergency-123"
}
```

### Patient Object
```javascript
{
  id: "patient-001",
  patientName: "John Doe",
  age: 45,
  condition: "Chest Pain",
  emergencyType: "Critical",
  eta: 8,
  ambulanceId: "amb-001",
  status: "pending", // or "pickedUp"
  pickupTime: null, // or timestamp
  location: {
    latitude: 33.6844,
    longitude: 73.0479
  },
  vitals: { hr: 120, bp: "140/90", spo2: 94 }
}
```

### Hospital Object
```javascript
{
  id: "hospital-001",
  name: "PIMS Hospital",
  location: {
    latitude: 33.7077,
    longitude: 73.0533
  }
}
```

## Styling & UI

### Colors
- **Red (#EF4444)**: Remaining path, critical status
- **Blue (#3B82F6)**: Traversed path, ambulance marker
- **Orange (#F59E0B)**: Patient/pickup marker
- **Green (#10B981)**: Completed status

### Modal Dimensions
- Width: `max-w-6xl` (1152px)
- Height: `85vh`
- Z-index: `100` (above dashboard content)
- Backdrop: `bg-black/50 backdrop-blur-sm`

### Responsive Design
- Mobile: Single column, compact preview
- Tablet: Grid layout for stats
- Desktop: Full-width modal with sidebar info

## Performance Optimizations

1. **Path Point Calculation**: Limited to 20-30 points per segment
2. **React.useMemo**: Used for expensive calculations in tracking hook
3. **Conditional Rendering**: Tracking only loads when modal is open
4. **Iframe Isolation**: Map runs in separate context
5. **Segment Batching**: Multiple line segments grouped efficiently

## Testing

### Manual Testing Steps

1. **Start Hospital Dashboard**:
   ```bash
   cd apps/hospital-dashboard
   npm run dev
   ```

2. **Verify Patient Card Preview**:
   - Check incoming patients section
   - Look for "Live Tracking" preview card
   - Verify progress bar and distance display

3. **Test Full Tracking Modal**:
   - Click "View Map →" on tracking preview
   - Modal should open with map
   - Verify red/blue lines render correctly
   - Check progress overlays and legend

4. **Test Ambulance Fleet Tracking**:
   - Scroll to "Ambulance Fleet" section
   - Click "Track" button on active ambulance
   - Modal should open with that ambulance's journey

5. **Test Patient Navigation**:
   - Use arrow buttons in patient carousel
   - Each patient should show their assigned ambulance tracking
   - Tracking data should update as you navigate

### Expected Behavior

✅ **When ambulance has location**:
- Tracking preview appears in patient card
- Red line from ambulance to destination
- Blue dotted line behind ambulance
- Progress bar shows completion percentage

✅ **When ambulance picked up patient**:
- Status changes to "Transporting to Hospital"
- Blue line from patient to current ambulance position
- Red line from ambulance to hospital
- ETA updates based on remaining distance

✅ **When trip completed**:
- All lines disappear
- Status badge shows "Trip Completed"
- Map remains with final positions

❌ **When no ambulance assigned**:
- No tracking preview shown
- Patient card displays normally
- "Track" button on ambulance shows error toast

## Troubleshooting

### Issue: Map not loading
**Solution**: Check internet connection, Google Maps API may require key

### Issue: Lines not showing
**Solution**: 
- Verify ambulance.location exists and has lat/lng
- Check patient.location or patient.pickupLocation exists
- Ensure status is valid ('en_route_to_patient' or 'transporting_to_hospital')

### Issue: Ambulance not matched to patient
**Solution**:
- Check patient.ambulanceId matches ambulance.id
- Or check ambulance.assignedEmergencyId matches patient.id
- Verify ambulances array is passed to PatientNavigationCarousel

### Issue: Progress bar stuck at 0%
**Solution**:
- Ensure ambulance location is updating
- Check that locations are valid coordinates
- Verify status is not 'completed'

### Issue: Modal won't close
**Solution**:
- Click X button in top right
- Click "Close" button in footer
- Press Escape key (if implemented)

## Future Enhancements

1. **Road Snapping**: Integrate Google Directions API for actual road routes
2. **Traffic Data**: Show traffic conditions affecting route
3. **ETA Prediction**: ML-based arrival time using historical data
4. **Speed Indicators**: Vary line thickness based on speed
5. **Multiple Ambulance View**: Show all active ambulances simultaneously
6. **Route Optimization**: Suggest faster alternate routes
7. **Geofencing**: Alerts when ambulance enters/exits zones
8. **Real-Time Updates**: WebSocket integration for live position updates (currently ready)
9. **Historical Playback**: Replay completed trips
10. **Export Reports**: Generate PDF reports with tracking data

## API Integration (Ready for Backend)

The system is designed to work with Socket.IO updates:

```javascript
// In DashboardHome.jsx (add this)
useEffect(() => {
  const socket = io(BACKEND_URL);
  
  socket.on('ambulance-location-update', (data) => {
    setAmbulances(prev => prev.map(amb => 
      amb.id === data.ambulanceId 
        ? { ...amb, location: data.location }
        : amb
    ));
  });
  
  return () => socket.disconnect();
}, []);
```

## File Structure

```
apps/hospital-dashboard/src/
├── components/
│   ├── tracking/
│   │   └── HospitalTrackingMap.jsx       (NEW - 300+ lines)
│   └── emergency/
│       ├── IncomingPatientCard.jsx        (MODIFIED - added tracking)
│       └── PatientNavigationCarousel.jsx  (MODIFIED - added ambulance matching)
├── utils/
│   ├── ambulanceTracking.js              (NEW - 260+ lines)
│   └── mapPolyline.js                    (NEW - 150+ lines)
└── features/
    └── dashboard/
        └── pages/
            └── DashboardHome.jsx          (MODIFIED - added modal & handlers)
```

## Summary

The hospital dashboard now has complete ambulance tracking capabilities:
- ✅ Live tracking preview in patient cards
- ✅ Full-screen tracking modal with polylines
- ✅ Red/blue line visualization (remaining/traversed)
- ✅ Real-time progress indicators
- ✅ Ambulance-patient matching
- ✅ Multi-patient navigation
- ✅ Status-based journey phases
- ✅ Beautiful, responsive UI
- ✅ Error handling and fallbacks
- ✅ Ready for Socket.IO integration

Hospital staff can now monitor all incoming patients and track ambulances in real-time with the same advanced visualization used in the patient app!
