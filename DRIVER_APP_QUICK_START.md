# Quick Start Guide - Emergency Driver App

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Backend
```bash
cd apps/backend
npm start
```
**Expected:** Backend running on `http://localhost:5000`

---

### Step 2: Create a Test Driver Account

**Option A: Using existing admin tools**
```bash
cd apps/backend
node scripts/create-driver.js
```

**Option B: Manual registration (if script doesn't exist)**
Use Postman/Thunder Client to send:
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Driver",
  "email": "driver@test.com",
  "password": "driver123",
  "phone": "+1234567890",
  "role": "driver",
  "driverInfo": {
    "licenseNumber": "DL123456",
    "ambulanceNumber": "AMB-001",
    "status": "available",
    "location": {
      "lat": 37.7749,
      "lng": -122.4194
    }
  }
}
```

---

### Step 3: Start the Driver App
```bash
cd apps/emergency-driver-app
npm start
```

**Expected:** Expo QR code appears

---

### Step 4: Login to Driver App

1. Scan QR code with Expo Go app
2. App opens to login screen
3. Enter credentials:
   - Email: `driver@test.com`
   - Password: `driver123`
4. Tap "Sign In"

**Expected:** Navigate to home screen with "Emergency Requests" header

---

### Step 5: Test Emergency Dispatch

**Option A: From User App**
1. Open emergency-user-app
2. Login as patient
3. Swipe emergency slider
4. Enter symptoms: "chest pain, difficulty breathing"
5. Submit emergency

**Option B: Manual API Call**
```http
POST http://localhost:5000/api/v1/emergencies/dispatch-intelligent
Authorization: Bearer YOUR_PATIENT_JWT_TOKEN
Content-Type: application/json

{
  "symptoms": ["chest pain", "difficulty breathing"],
  "location": {
    "lat": 37.7750,
    "lng": -122.4195,
    "address": "123 Main St, San Francisco, CA"
  },
  "severity": "high",
  "aiPrediction": {
    "emergencyType": "cardiac",
    "confidence": 85,
    "detectedSymptoms": [
      {
        "category": "cardiac",
        "symptoms": ["chest pain"]
      }
    ]
  }
}
```

---

### Step 6: Accept Emergency

1. Driver app shows alert: "🚨 New Emergency"
2. Tap "View" or check home screen
3. See emergency card with patient info
4. Toggle "Availability" to ON (green)
5. Tap "Accept Emergency"

**Expected:** Navigate to Active Emergency Screen

---

### Step 7: Complete Trip Workflow

1. **En Route to Patient**
   - See status banner: "🚑 En Route to Patient"
   - GPS tracking starts automatically
   - Tap "Arrived at Location"

2. **Pickup Patient**
   - Status changes to "📍 Arrived at Location"
   - Tap "Patient Picked Up"
   - API call to `/emergencies/:id/pickup`

3. **Transport to Hospital**
   - Status: "🏥 Transporting to Hospital"
   - See assigned hospital details
   - Tap "Arrived at Hospital"

4. **Complete**
   - Alert: "Complete the trip?"
   - Tap "Complete"
   - Navigate back to home screen

**Expected:** Emergency completed, driver status returns to "available"

---

## ✅ Verification Checklist

- [ ] Backend running without errors
- [ ] Driver account created with role "driver"
- [ ] Driver app installed on device
- [ ] Login successful
- [ ] Socket.IO connected (check console logs)
- [ ] Location permissions granted
- [ ] Availability toggle works
- [ ] Emergency notification received
- [ ] Emergency card displays correctly
- [ ] Accept emergency successful
- [ ] GPS tracking active (location updates every 5s)
- [ ] Status workflow works (En Route → Pickup → Hospital → Complete)
- [ ] Trip completes and returns to home screen

---

## 🐛 Troubleshooting

### Driver App Won't Connect to Backend
**Issue:** Cannot reach `http://localhost:5000`

**Solution:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig | grep inet
   ```

2. Update `apps/emergency-driver-app/src/config/config.ts`:
   ```typescript
   const DEV_CONFIG = {
     API_URL: 'http://192.168.1.100:5000/api/v1', // Use your IP
     SOCKET_URL: 'http://192.168.1.100:5000',
   };
   ```

3. Restart app: `npm start -- --clear`

---

### Socket.IO Not Connecting
**Issue:** No real-time updates

**Check:**
1. Backend logs show: "✅ Socket.IO initialized"
2. Driver app console shows: "🔌 Connecting to Socket.IO..."
3. JWT token is valid

**Solution:**
```typescript
// In socketService.ts, add more debug logs
console.log('Socket URL:', Config.SOCKET_URL);
console.log('Token:', token);
```

---

### Location Permissions Denied
**Issue:** GPS tracking not working

**Solution:**
- **iOS**: Settings → Privacy → Location Services → Expo Go → "Always"
- **Android**: Settings → Apps → Expo Go → Permissions → Location → "Allow all the time"

Then restart the app.

---

### Emergency Not Showing
**Issue:** Dispatched emergency but driver doesn't receive it

**Check:**
1. Driver status is "available"
2. Driver has correct ambulance type
3. Backend dispatch succeeded (check logs)
4. Socket.IO connected

**Debug:**
```bash
# Manually fetch emergencies
# In driver app, pull down to refresh
# Or check backend:
curl -H "Authorization: Bearer DRIVER_JWT" \
  http://localhost:5000/api/v1/emergencies
```

---

## 📱 Device Testing

### iOS (Simulator or Device)
```bash
cd apps/emergency-driver-app
npm run ios
```

### Android (Emulator or Device)
```bash
cd apps/emergency-driver-app
npm run android
```

### Expo Go (Physical Device)
```bash
npm start
# Scan QR code with Expo Go app
```

---

## 🔑 Test Credentials

**Driver:**
- Email: `driver@test.com`
- Password: `driver123`

**Patient (for testing dispatch):**
- Create via user app or backend registration
- Role must be "patient"

---

## 🎯 Success Indicators

**Console Logs (Driver App):**
```
🔐 Attempting login...
✅ Login successful
🔌 Connecting to Socket.IO...
✅ Socket connected: abc123
📍 Requesting location permissions...
✅ Location permissions granted
📋 Fetching driver emergencies...
✅ Driver emergencies fetched

[When emergency dispatched]
🚨 New emergency received: { emergency: {...} }

[When accepted]
✅ Notifying emergency accepted: 123abc
🚀 Starting location tracking...
✅ Location tracking started
📍 Location update: { lat: 37.7749, lng: -122.4194 }
```

**Console Logs (Backend):**
```
✅ Socket.IO initialized
Driver connected: socket-id
New emergency created: emergency-id
Finding nearest driver...
✅ Driver assigned: driver-id
Emitting emergency:newRequest to driver
Driver accepted emergency: emergency-id
Driver location updated: { lat, lng }
```

---

## 📊 Expected Response Times

- **Login:** < 1 second
- **Socket.IO Connection:** < 2 seconds
- **Emergency Notification:** < 1 second after dispatch
- **Accept Emergency:** < 2 seconds
- **Location Update:** Every 5 seconds
- **Status Update:** < 1 second

---

## 🎉 You're Ready!

Your emergency driver app is now fully functional and ready for production testing.

**Next:** Test the complete flow from user app → driver app → hospital dashboard to verify all three systems are communicating correctly.

**Documentation:**
- Full implementation details: `DRIVER_APP_IMPLEMENTATION_COMPLETE.md`
- User app fixes: `ERROR_FIXES_SUMMARY.md`
- Backend setup: `apps/backend/README.md`

**Need Help?** Check console logs and backend API responses for detailed error messages.
