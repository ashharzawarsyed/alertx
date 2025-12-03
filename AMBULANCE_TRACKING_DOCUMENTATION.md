# Ambulance Real-Time Tracking System

## Overview
Advanced ambulance tracking system with dynamic polyline visualization showing real-time progress from ambulance → patient → hospital with progressive color transitions.

## Features

### 🎨 Visual Tracking
- **Red Solid Line**: Remaining path ahead of ambulance
- **Blue Dotted Line**: Traversed path behind ambulance
- **Progressive Erasure**: Lines dynamically update as ambulance moves
- **Dual Phase Tracking**: 
  - Phase 1: Ambulance → Patient
  - Phase 2: Patient → Hospital
- **Auto-Clear**: All lines disappear when trip completes

### 📊 Technical Implementation

#### 1. **AmbulanceTrackingPolyline.tsx**
Core tracking engine with:
- **Haversine Formula**: Accurate distance calculations
- **Path Interpolation**: Generates 20-30 smooth path points
- **Closest Point Algorithm**: Finds ambulance position on route
- **Segment Generation**: Creates colored line segments
- **React Hook**: `useAmbulanceTracking` for state management

#### 2. **MapPolyline.tsx**
Google Maps integration:
- Generates JavaScript for WebView injection
- Supports solid and dotted lines
- Custom colors, weights, opacity
- zIndex layering for proper overlap

#### 3. **ambulanceTrackingSimulation.test.ts**
Comprehensive test suite with 5 test cases:
1. En Route to Patient (10 steps)
2. Transporting to Hospital (10 steps)
3. Path Calculation Verification
4. Color Transition Testing
5. Trip Completion Validation

## Usage

### In Emergency Tracking Screen

```typescript
import { useAmbulanceTracking } from '@/components/maps/AmbulanceTrackingPolyline';
import { generatePolylineCode, PolylineSegment } from '@/components/maps/MapPolyline';

// Track status
const [trackingStatus, setTrackingStatus] = useState<
  'en_route_to_patient' | 'transporting_to_hospital' | 'completed'
>('en_route_to_patient');

// Get tracking segments
const ambulanceTracking = useAmbulanceTracking(
  ambulanceLocation, // Current ambulance position
  patientLocation,   // Patient pickup location
  hospitalLocation,  // Hospital destination
  trackingStatus     // Current phase
);

// Convert to polyline format
const polylineSegments: PolylineSegment[] = ambulanceTracking.segments.map(segment => ({
  coordinates: [segment.from, segment.to],
  color: segment.color,
  weight: 4,
  opacity: 1.0,
  dashArray: segment.dashArray,
  zIndex: segment.zIndex,
}));

// Generate code for map
const polylineCode = generatePolylineCode(polylineSegments);

// Inject into map
<CrossPlatformMap
  customMapScript={polylineCode}
  {...otherProps}
/>
```

### Update Status Based on Emergency State

```typescript
useEffect(() => {
  if (emergency.status === 'completed') {
    setTrackingStatus('completed');
  } else if (emergency.status === 'in_progress' || emergency.pickupTime) {
    setTrackingStatus('transporting_to_hospital');
  } else {
    setTrackingStatus('en_route_to_patient');
  }
}, [emergency]);
```

## Running Mock Tests

```typescript
import { runAmbulanceTrackingTests } from '@/tests/ambulanceTrackingSimulation.test';

// Run all tests
runAmbulanceTrackingTests();

// Or run individual tests
import tests from '@/tests/ambulanceTrackingSimulation.test';
tests.testEnRouteToPatient();
tests.testTransportingToHospital();
tests.testPathCalculations();
tests.testSegmentColorTransitions();
tests.testTripCompletion();
```

### Expected Test Output

```
🚨 AMBULANCE TRACKING SIMULATION TESTS
================================================
Testing tracking polyline behavior with mock Islamabad data

📍 TEST CASE 1: Ambulance En Route to Patient
================================================

⏱️  Step 1/11 - 3.58km to patient (0% complete)
   🔴 Red solid segments (remaining): 29
   🔵 Blue dotted segments (traversed): 0

⏱️  Step 6/11 - 1.79km to patient (50% complete)
   🔴 Red solid segments (remaining): 14
   🔵 Blue dotted segments (traversed): 15

⏱️  Step 11/11 - 0.00km to patient (100% complete)
   🔴 Red solid segments (remaining): 0
   🔵 Blue dotted segments (traversed): 30

✅ Test Case 1 Complete
```

## Mock Data (Islamabad)

```typescript
ambulanceStart: { lat: 33.6522, lng: 73.0366 }  // Blue Area
patient: { lat: 33.6844, lng: 73.0479 }         // F-7 Markaz
hospital: { lat: 33.7077, lng: 73.0533 }        // PIMS Hospital
```

## Algorithm Details

### Distance Calculation (Haversine Formula)
```typescript
const R = 6371; // Earth's radius in km
const dLat = ((lat2 - lat1) * Math.PI) / 180;
const dLon = ((lng2 - lng1) * Math.PI) / 180;

const a = Math.sin(dLat/2)² + 
          cos(lat1) * cos(lat2) * 
          Math.sin(dLon/2)²;

const c = 2 * atan2(√a, √(1-a));
distance = R * c;
```

### Path Interpolation
Generates smooth paths between two points:
```typescript
for (let i = 0; i <= numPoints; i++) {
  const ratio = i / numPoints;
  points.push({
    lat: start.lat + (end.lat - start.lat) * ratio,
    lng: start.lng + (end.lng - start.lng) * ratio,
  });
}
```

### Traversed/Remaining Split
Finds closest point on path to ambulance:
```typescript
let closestIndex = 0;
let minDistance = Infinity;

pathPoints.forEach((point, index) => {
  const distance = calculateDistance(point, ambulanceLocation);
  if (distance < minDistance) {
    minDistance = distance;
    closestIndex = index;
  }
});

traversed = pathPoints.slice(0, closestIndex + 1);
remaining = pathPoints.slice(closestIndex);
```

## Color Scheme

- **Red (#EF4444)**: Remaining path (solid line)
- **Blue (#3B82F6)**: Traversed path (dotted line, dash pattern: "5, 10")

## Status Phases

### 1. En Route to Patient
- Shows one path: Ambulance → Patient
- Red ahead, blue behind
- Updates in real-time as ambulance moves

### 2. Transporting to Hospital
- Shows two paths:
  - Ambulance → Patient (all blue, completed)
  - Ambulance → Hospital (red ahead, blue behind)
- Patient location marked as waypoint

### 3. Completed
- All paths cleared
- No polylines displayed
- Trip finished

## Performance Optimization

- **React.useMemo**: Prevents unnecessary polyline recalculations
- **Segment Batching**: Groups small segments for efficiency
- **Interpolation Limit**: 20-30 points max per path
- **zIndex Layering**: Blue (1) under Red (2) for proper overlap

## Integration with Hospital Dashboard

Same components can be used in hospital dashboard:

```typescript
// In hospital dashboard
import { useAmbulanceTracking } from '@emergency-user-app/components/maps/AmbulanceTrackingPolyline';

// Track multiple ambulances
ambulances.map(ambulance => {
  const tracking = useAmbulanceTracking(
    ambulance.location,
    ambulance.pickupLocation,
    hospitalLocation,
    ambulance.status
  );
  
  return <AmbulancePolylines segments={tracking.segments} />;
});
```

## Real-Time Updates

Tracking automatically updates when:
- Ambulance location changes (via Socket.IO)
- Status changes (pickup complete, arrived, etc.)
- Emergency state updates

Socket integration:
```typescript
socketService.on('ambulance:locationUpdate', (data) => {
  if (data.emergencyId === currentEmergencyId) {
    setDriverLocation({
      latitude: data.location.lat,
      longitude: data.location.lng,
    });
    // Tracking hook will auto-update polylines
  }
});
```

## Best Practices

1. **Always use absolute coordinates** (lat/lng pairs)
2. **Update tracking status** when emergency state changes
3. **Clear polylines** on trip completion
4. **Test with mock data** before deployment
5. **Monitor performance** with large path segments
6. **Handle edge cases** (no location data, GPS errors)
7. **Provide fallback** for hospitals without coordinates

## Files Modified/Created

### Created:
1. `src/components/maps/AmbulanceTrackingPolyline.tsx` (234 lines)
2. `src/components/maps/MapPolyline.tsx` (74 lines)
3. `src/tests/ambulanceTrackingSimulation.test.ts` (380 lines)

### Modified:
1. `src/screens/emergency/EmergencyTrackingScreen.tsx`
   - Added tracking imports
   - Integrated useAmbulanceTracking hook
   - Added status tracking
   - Injected polylines into map

2. `src/components/CrossPlatformMap.tsx`
   - Added `customMapScript` prop
   - Enabled custom code injection into WebView

## Future Enhancements

1. **Road Snapping**: Use Google Directions API for actual roads
2. **Traffic Data**: Show delays in red segments
3. **ETA Prediction**: ML-based arrival time
4. **Multiple Ambulances**: Track fleet simultaneously
5. **Historical Playback**: Replay completed trips
6. **Geofencing**: Alert when entering/exiting zones
7. **Speed Indicators**: Color intensity based on speed
8. **Route Optimization**: Suggest faster routes

## Troubleshooting

**Polylines not showing:**
- Check if `customMapScript` is being generated
- Verify coordinates are valid
- Ensure status is not 'completed'
- Check WebView console logs

**Lines not updating:**
- Verify ambulance location is changing
- Check tracking status updates
- Ensure useAmbulanceTracking dependencies are correct

**Performance issues:**
- Reduce path interpolation points
- Batch segment updates
- Use React.memo for polyline components

## License & Credits

Part of AlertX Emergency Response System
Uses Google Maps JavaScript API
Haversine formula for geographic calculations
Mock data based on Islamabad, Pakistan coordinates

---

**Status**: ✅ Production Ready
**Last Updated**: November 30, 2025
**Version**: 1.0.0
