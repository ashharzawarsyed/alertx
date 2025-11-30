# Hospital Dashboard Tracking - Quick Start Guide

## 🎯 What's New?

The hospital dashboard now displays **live ambulance tracking** with the same advanced polyline visualization as the patient app!

## ✨ Key Features

### 1. **Tracking Preview in Patient Cards**
```
┌─────────────────────────────────────┐
│ Patient: John Doe                   │
│ Condition: Chest Pain (Critical)    │
│                                     │
│ ┌─ Live Tracking ──────── View Map →│
│ │ Progress: ████████░░░░ 78%       │
│ │ ━━ 2.1 km remaining               │
│ │ ┈┈ 7.3 km done                   │
│ └─────────────────────────────────  │
└─────────────────────────────────────┘
```

### 2. **Full-Screen Tracking Modal**
```
┌────────────────────────────────────────────────┐
│ 🚑 Live Ambulance Tracking            [X]      │
│ Patient: John Doe • Ambulance: AMB-001         │
├────────────────────────────────────────────────┤
│                                                │
│  ┌───────────┐  ┌──────────┐                  │
│  │ Progress  │  │ Distance │                  │
│  │ 78% ████  │  │ 2.1 km   │                  │
│  └───────────┘  └──────────┘                  │
│                                                │
│     🏥 [Hospital]                              │
│      ║                                         │
│      ║ ━━━━ Red (remaining)                   │
│      ║                                         │
│      🚑 [Ambulance]                            │
│      ║                                         │
│      ║ ┈┈┈┈ Blue (traversed)                  │
│      ║                                         │
│      🤕 [Patient]                              │
│                                                │
│  Legend: ━━ Remaining  ┈┈ Traversed           │
│                                                │
│  Status: 🚑 Transporting to Hospital           │
├────────────────────────────────────────────────┤
│ Condition: Chest Pain • ETA: 8 minutes  [Close]│
└────────────────────────────────────────────────┘
```

### 3. **Ambulance Fleet Integration**
```
┌─────────────────────────┐
│ Ambulance Fleet         │
├─────────────────────────┤
│ AMB-001 🚑 On Route    │
│ Status: Active          │
│ [Assign] [Track] ←──── Click to open tracking
└─────────────────────────┘
```

## 🚀 How to Use

### View Tracking from Patient Card
1. Look for incoming patients section
2. Find the **"Live Tracking"** preview box
3. Click **"View Map →"** to open full tracking modal

### View Tracking from Ambulance Fleet
1. Scroll to **"Ambulance Fleet"** section
2. Find ambulance with **"On Route"** status
3. Click **"Track"** button

### Navigate Between Patients
1. Use **◀ ▶** arrow buttons in patient carousel
2. Each patient shows their ambulance tracking
3. Tracking updates automatically

## 📊 What You'll See

### Journey Phases

**Phase 1: En Route to Patient**
- Status: `🚑 En Route to Patient`
- Red line: Ambulance → Patient (remaining)
- Blue dotted: Behind ambulance (traversed)

**Phase 2: Transporting to Hospital**
- Status: `🏥 Transporting to Hospital`
- Blue dotted: Patient → Ambulance (completed pickup)
- Red line: Ambulance → Hospital (remaining)
- Blue dotted: Behind ambulance (traversed)

**Phase 3: Completed**
- Status: `✅ Trip Completed`
- All lines cleared
- Map shows final positions

## 🎨 Visual Indicators

### Colors
- 🔴 **Red solid line** = Path remaining ahead
- 🔵 **Blue dotted line** = Path already traversed
- 🟠 **Orange marker** = Patient pickup location
- 🔵 **Blue marker** = Ambulance current position
- 🔴 **Red marker** = Hospital destination

### Progress Bar
```
Progress: ████████████░░░ 78%
```
- Filled (blue) = Distance covered
- Empty (gray) = Distance remaining
- Percentage = Overall completion

### Distance Metrics
```
━━ 2.1 km remaining  (red indicator)
┈┈ 7.3 km done       (blue dotted indicator)
```

## 🔧 Data Requirements

For tracking to work, ensure:

### Ambulance Object
```javascript
{
  id: "amb-001",
  vehicleNumber: "AMB-001",
  location: {              // ← Required!
    latitude: 33.6522,
    longitude: 73.0366
  },
  assignedEmergencyId: "patient-123"
}
```

### Patient Object
```javascript
{
  id: "patient-123",
  ambulanceId: "amb-001",  // ← Links to ambulance
  location: {              // ← Required!
    latitude: 33.6844,
    longitude: 73.0479
  },
  status: "pending"        // or "pickedUp"
}
```

## ⚡ Real-Time Updates

The system is ready for live updates via Socket.IO:

```javascript
// Ambulance location updates every 5 seconds
socket.on('ambulance-location-update', (data) => {
  // Tracking automatically recalculates
  // Lines update in real-time
  // Progress bar animates smoothly
});
```

## 🐛 Troubleshooting

### No tracking preview showing?
- Check if ambulance has `location` property with `lat`/`lng`
- Verify ambulance is assigned to patient

### Map not loading?
- Check internet connection
- Google Maps may require API key for production

### Wrong ambulance shown?
- Verify `patient.ambulanceId` matches `ambulance.id`
- Or check `ambulance.assignedEmergencyId` matches `patient.id`

## 📁 Files Created/Modified

### New Files ✨
- `src/components/tracking/HospitalTrackingMap.jsx` (300+ lines)
- `src/utils/ambulanceTracking.js` (260+ lines)
- `src/utils/mapPolyline.js` (150+ lines)

### Modified Files 🔧
- `src/components/emergency/IncomingPatientCard.jsx` (added tracking preview)
- `src/components/emergency/PatientNavigationCarousel.jsx` (added ambulance matching)
- `src/features/dashboard/pages/DashboardHome.jsx` (added modal & handlers)

## 🎉 Benefits

✅ **Real-time visibility** into ambulance locations
✅ **Better preparation** - see ETA and patient condition
✅ **Improved coordination** - track multiple ambulances
✅ **Enhanced patient care** - prepare teams before arrival
✅ **Professional UI** - matches modern healthcare standards
✅ **Mobile responsive** - works on tablets and desktops

## 📚 Full Documentation

For complete technical details, see:
- `HOSPITAL_TRACKING_IMPLEMENTATION.md` (this directory)
- `apps/emergency-user-app/AMBULANCE_TRACKING_DOCUMENTATION.md` (patient app reference)

---

**Ready to track!** 🚑 The hospital dashboard now provides comprehensive ambulance tracking for all incoming patients!
