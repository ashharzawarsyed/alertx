# AlertX - Main Screen Testing Guide

## 🚀 Quick Start

### Step 1: Start Backend

```bash
cd apps/backend
npm start
```

**Expected output:**

```
🚀 AlertX Backend Server Started
📍 Environment: development
🌐 Port: 5001
MongoDB connected successfully
```

### Step 2: Start Frontend

```bash
cd apps/emergency-user-app
npx expo start
```

**Expected output:**

```
Starting Metro Bundler
› Metro waiting on exp://192.168.100.23:8081
› Scan the QR code above with Expo Go
```

### Step 3: Open on Device

1. Open Expo Go app on your Android/iOS device
2. Scan the QR code displayed in terminal
3. Wait for app to load

## 📱 Testing Checklist

### Home Screen Tests

#### ✅ Test 1: View Home Screen

1. After sign-in, you should see the HomeScreen
2. Verify:
   - [ ] Red gradient header with "Good Morning/Afternoon/Evening"
   - [ ] Your name displayed
   - [ ] Profile button in top-right
   - [ ] Large red circular SOS button (180x180px)
   - [ ] 4 quick action cards with gradients
   - [ ] Safety tips card at bottom

#### ✅ Test 2: SOS Emergency Button

1. Tap the large red SOS button
2. Should see alert: "🚨 Emergency Alert"
3. Tap "Confirm Emergency"
4. Grant location permission if prompted
5. Wait for API response (3-5 seconds)
6. Verify:
   - [ ] Success alert with emergency ID and severity
   - [ ] Active emergency banner appears in header
   - [ ] Emergency appears in recent list (if visible)

**Backend logs should show:**

```
🆘 EMERGENCY BUTTON ACTIVATED for user: <user_id>
📍 Getting current location...
✅ Location obtained: { lat: ..., lng: ... }
🚨 Creating emergency...
✅ Emergency created with severity: critical
```

#### ✅ Test 3: Pull to Refresh

1. Pull down on HomeScreen
2. Verify:
   - [ ] Spinner appears
   - [ ] Recent emergencies update
   - [ ] Spinner disappears

#### ✅ Test 4: Quick Actions

1. Tap each quick action card:
   - **Request Ambulance**: Shows alert (feature upcoming)
   - **Emergency History**: Navigates to Emergencies tab
   - **Medical Profile**: Navigates to Profile tab
   - **Emergency Contacts**: Shows alert (feature upcoming)

2. Verify:
   - [ ] All cards are tappable
   - [ ] Navigation works for History and Profile
   - [ ] Alerts show for upcoming features

#### ✅ Test 5: Recent Emergencies

1. If you have emergencies, verify:
   - [ ] Up to 3 most recent emergencies shown
   - [ ] Each card shows: symptoms, severity, status, time
   - [ ] Tapping card shows details in alert
   - [ ] Status badges are color-coded correctly

### Emergencies Screen Tests

#### ✅ Test 6: View Emergency History

1. Tap "Emergencies" tab
2. Verify:
   - [ ] Red gradient header
   - [ ] Total count shown ("X total requests")
   - [ ] Filter chips (All, Active, Completed, Cancelled)
   - [ ] List of all emergencies

#### ✅ Test 7: Filter Emergencies

1. Tap each filter:
   - **All**: Shows all emergencies
   - **Active**: Shows pending/accepted/in_progress only
   - **Completed**: Shows completed only
   - **Cancelled**: Shows cancelled only

2. Verify:
   - [ ] Active filter highlighted in red
   - [ ] List updates correctly
   - [ ] Empty state shows if no matches

#### ✅ Test 8: Emergency Card Details

1. Tap any emergency card
2. Verify alert shows:
   - [ ] Emergency ID
   - [ ] Status
   - [ ] Severity level
   - [ ] Triage score
   - [ ] All symptoms listed
   - [ ] Location address

### Profile Screen Tests

#### ✅ Test 9: View Profile

1. Tap "Profile" tab
2. Verify:
   - [ ] Red gradient header
   - [ ] Large profile icon
   - [ ] Your name and role
   - [ ] Personal information card with email, phone, role
   - [ ] Medical Profile section
   - [ ] Emergency Contacts section
   - [ ] Settings section

#### ✅ Test 10: Profile Actions

1. Tap "View Details" on Medical Profile
   - [ ] Shows alert (feature upcoming)
2. Tap "Manage Contacts" on Emergency Contacts
   - [ ] Shows alert (feature upcoming)
3. Tap each setting:
   - Notifications → [ ] Shows alert
   - Privacy & Security → [ ] Shows alert
   - Help & Support → [ ] Shows alert

#### ✅ Test 11: Sign Out

1. Tap "Sign Out" button
2. Verify:
   - [ ] Confirmation alert appears
   - [ ] Tap "Sign Out" confirms
   - [ ] Returns to Sign In screen
   - [ ] Token cleared from storage

### Navigation Tests

#### ✅ Test 12: Tab Switching

1. Switch between tabs:
   - Home → Emergencies → Profile → Home
2. Verify:
   - [ ] Active tab is red
   - [ ] Inactive tabs are gray
   - [ ] Tab icons change correctly
   - [ ] Screen content loads properly

#### ✅ Test 13: State Persistence

1. Create an emergency
2. Switch to Emergencies tab
3. Switch back to Home tab
4. Verify:
   - [ ] Active emergency banner still visible
   - [ ] SOS button is disabled
   - [ ] Recent list includes new emergency

## 🧪 API Integration Tests

### Test 14: Emergency Creation

**Endpoint:** `POST /api/v1/emergencies/emergency-button`

**Request:**

```json
{
  "location": {
    "lat": 31.5204,
    "lng": 74.3587,
    "address": "Lahore, Pakistan"
  },
  "notes": "Emergency button activated from home screen"
}
```

**Expected Response (201):**

```json
{
  "success": true,
  "message": "Emergency created successfully",
  "data": {
    "emergency": {
      "_id": "...",
      "severityLevel": "critical",
      "status": "pending",
      "symptoms": ["Critical emergency - immediate assistance needed"],
      ...
    }
  }
}
```

### Test 15: Get Emergencies

**Endpoint:** `GET /api/v1/emergencies?page=1&limit=20`

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Emergencies retrieved successfully",
  "data": {
    "emergencies": [...],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Network request failed"

**Solution:**

- Check backend is running: `curl http://localhost:5001/`
- Verify IP address in `emergencyService.ts` matches your LAN IP
- For real device: Use `192.168.100.23:5001`
- For emulator: Use `10.0.2.2:5001`

### Issue 2: "Location permission denied"

**Solution:**

- Enable location permissions in device settings
- Settings > Apps > Expo Go > Permissions > Location > Allow

### Issue 3: "Token expired" / "Unauthorized"

**Solution:**

- Sign out and sign in again
- Check AsyncStorage has "auth-token" key
- Backend JWT expiry is 7 days

### Issue 4: App crashes on startup

**Solution:**

- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check all imports are correct

### Issue 5: "No emergencies" even after creating one

**Solution:**

- Pull to refresh on HomeScreen and Emergencies screen
- Check backend logs for errors
- Verify user ID matches in MongoDB

## 🎯 Success Criteria

After completing all tests, you should have:

✅ Beautiful main screen with gradient UI
✅ Functional SOS emergency button
✅ Emergency history with filtering
✅ Profile management
✅ Tab navigation working
✅ Backend integration complete
✅ All API calls successful
✅ No compile errors
✅ Smooth user experience

## 📊 Performance Metrics

Expected performance:

- App startup: < 3 seconds
- Screen transitions: < 300ms
- SOS button response: 3-5 seconds (includes location + API)
- Pull-to-refresh: 1-2 seconds
- Tab switching: Instant

## 🎉 Next Steps

After successful testing:

1. ✅ Create emergency detail screen
2. ✅ Implement ambulance request with symptoms
3. ✅ Add medical profile management
4. ✅ Build emergency contacts CRUD
5. ✅ Integrate real-time tracking
6. ✅ Add push notifications
7. ✅ Implement voice recording
8. ✅ Add offline support

---

## 📝 Test Results Template

```
Testing Date: ___________
Tester: ___________

Home Screen: [ ] Pass [ ] Fail
- SOS Button: [ ] Pass [ ] Fail
- Quick Actions: [ ] Pass [ ] Fail
- Recent List: [ ] Pass [ ] Fail

Emergencies Screen: [ ] Pass [ ] Fail
- Filters: [ ] Pass [ ] Fail
- List View: [ ] Pass [ ] Fail

Profile Screen: [ ] Pass [ ] Fail
- Info Display: [ ] Pass [ ] Fail
- Sign Out: [ ] Pass [ ] Fail

Navigation: [ ] Pass [ ] Fail

API Integration: [ ] Pass [ ] Fail

Overall Result: [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Happy Testing! 🚀**
