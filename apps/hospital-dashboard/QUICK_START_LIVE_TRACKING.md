# Quick Start Guide: Live Tracking

## ✅ What's Ready

All **frontend** code for Priority 1 (Live Map Tracking) is complete and ready to use!

### Files Created:
1. ✅ `src/pages/LiveTracking.jsx` - Main map component
2. ✅ `src/components/AmbulanceInfoPanel.jsx` - Info sidebar
3. ✅ `src/services/trackingService.js` - Real-time data service
4. ✅ `src/services/api.js` - HTTP API client
5. ✅ `.env` - Google Maps API key configured
6. ✅ `src/layouts/DashboardLayout.jsx` - Route added
7. ✅ `src/components/SidebarNew.jsx` - Navigation added

### Dependencies Installed:
- ✅ `@react-google-maps/api` - Maps
- ✅ `socket.io-client` - Real-time
- ✅ `framer-motion` - Animations
- ✅ `phosphor-react` - Icons
- ✅ `recharts` - Charts (for other features)

## 🚀 How to Run

### 1. Start the Hospital Dashboard

```bash
cd /c/Users/ashha/OneDrive/Desktop/alertx/apps/hospital-dashboard
npm run dev
```

The dashboard will start at: **http://localhost:5173**

### 2. Access Live Tracking

Navigate to: **http://localhost:5173/dashboard/tracking**

Or click "Live Tracking" in the sidebar after logging in.

## ⚠️ What You'll See (Without Backend)

Since backend endpoints aren't created yet, you'll see:

1. ✅ Google Maps loads with dark theme
2. ✅ 4 statistics cards (showing zeros)
3. ❌ No hospital marker (needs hospital data from backend)
4. ❌ No ambulance markers (needs backend API)
5. ⚠️ Connection status shows "Disconnected" (Socket.IO not running)

## 🛠️ Backend Implementation Needed

To make the tracking functional, implement these backend endpoints:

### Required API Endpoints:

```javascript
// 1. Get hospital-specific ambulances
GET /api/v1/hospitals/:hospitalId/ambulances/tracking
Response: {
  ownAmbulances: [...],
  incomingAmbulances: [...]
}

// 2. Get single ambulance details
GET /api/v1/ambulances/:id/details

// 3. Get route between two points
GET /api/v1/maps/route?from=lat,lng&to=lat,lng

// 4. Mark ambulance as arrived
PUT /api/v1/ambulances/:id/arrived
```

### Required Socket.IO Events:

```javascript
// Hospital joins room
socket.on('hospital:join', (hospitalId) => {
  socket.join(`hospital:${hospitalId}`);
});

// Emit location updates
io.to(`hospital:${hospitalId}`).emit('ambulance:location', {
  ambulanceId, location, heading, speed
});

// Emit status updates
io.to(`hospital:${hospitalId}`).emit('ambulance:status', {
  ambulanceId, status
});

// Emit new dispatch
io.to(`hospital:${hospitalId}`).emit('emergency:dispatched', {
  ambulance, destinationHospitalId
});

// Emit arrival
io.to(`hospital:${hospitalId}`).emit('ambulance:arrived', {
  ambulanceId, hospitalId
});
```

## 🧪 Testing with Mock Data

For quick testing, you can modify `LiveTracking.jsx` to use mock data:

```javascript
// Add this after line 121 in LiveTracking.jsx
const mockAmbulances = [
  {
    _id: 'amb1',
    vehicleNumber: 'AMB-001',
    status: 'en-route',
    currentLocation: {
      type: 'Point',
      coordinates: [-74.006, 40.7128] // [lng, lat]
    },
    heading: 45,
    speed: 60,
    driver: {
      name: 'John Doe',
      phone: '+1234567890'
    },
    currentEmergency: {
      priority: 'critical',
      eta: new Date(Date.now() + 10 * 60000).toISOString(),
      patient: { age: 45, gender: 'male' },
      vitals: {
        heartRate: 85,
        bloodPressure: '120/80',
        oxygenLevel: 98
      }
    }
  }
];

const mockHospital = {
  _id: 'hosp123',
  name: 'City General Hospital',
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060
  }
};

// Replace the API call on line 137
// const data = await trackingService.getAmbulances(hospitalData._id);
// With:
const data = {
  ownAmbulances: mockAmbulances,
  incomingAmbulances: []
};
```

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| LiveTracking.jsx | ✅ Complete | 515 lines, full functionality |
| AmbulanceInfoPanel.jsx | ✅ Complete | 304 lines, all features |
| trackingService.js | ✅ Complete | Socket.IO + API ready |
| api.js | ✅ Complete | Axios with interceptors |
| Navigation | ✅ Complete | Route + sidebar added |
| .env Config | ✅ Complete | Google Maps key set |
| Backend APIs | ❌ Pending | Needs implementation |
| Socket.IO Server | ❌ Pending | Needs configuration |
| Database Schema | ❌ Pending | Add geolocation fields |

## 🐛 Known Issues

### Non-Blocking (ESLint Warnings):
- Import order warnings (cosmetic)
- Unused variable warnings (will be used when backend connects)
- Form label accessibility warnings (in other files)

### Blocking (Need Backend):
- No real ambulance data
- Socket.IO connection fails (server not running)
- API calls return 404
- Map doesn't show hospital/ambulances

## 🎯 Next Actions

1. **Start Backend Server** (if not running):
   ```bash
   cd /c/Users/ashha/OneDrive/Desktop/alertx/apps/backend
   npm start
   ```

2. **Implement Backend Endpoints** (see PRIORITY_1_COMPLETE.md)

3. **Test Full Flow**:
   - Login to hospital dashboard
   - Navigate to Live Tracking
   - Verify map shows hospital and ambulances
   - Click ambulance marker → info panel opens
   - Verify ETA countdown works
   - Test "Call Driver" button
   - Test "Mark as Arrived" button

## 📚 Documentation

- **Full Implementation Details**: `PRIORITY_1_COMPLETE.md`
- **Map Integration Plan**: `MAP_INTEGRATION_PLAN.md`
- **Complete Roadmap**: `COMPLETE_INTEGRATION_ROADMAP.md`
- **Implementation Checklist**: `IMPLEMENTATION_CHECKLIST.md`

## 🆘 Troubleshooting

### Map doesn't load:
- Check Google Maps API key in `.env`
- Check browser console for errors
- Verify internet connection

### Connection status shows "Disconnected":
- Backend Socket.IO server not running
- Check `VITE_SOCKET_URL` in `.env`
- Verify backend is running on port 5001

### No ambulances appear:
- Backend endpoints not implemented
- Check Network tab in DevTools
- Verify API returns data

### Markers don't update:
- Socket.IO not configured on backend
- Hospital room not joined
- Events not emitted from backend

## 💡 Tips

- Use browser DevTools → Network tab to debug API calls
- Use Console tab to see Socket.IO connection logs
- Green "Live" badge = Socket.IO connected
- Red "Disconnected" = Backend not running

---

**Status**: ✅ Frontend Complete | ❌ Backend Pending

Once backend is ready, the live tracking will be fully operational!
