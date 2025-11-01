# Network Connection Fix Summary

## Problem

The mobile app's "Send Verification Code" button was getting stuck in a loading state ("Sending Code") and never completing.

## Root Cause

The app was configured to use `http://10.0.2.2:5001` for Android devices, which only works for Android **emulators**. When testing on a **real Android device** via Expo Go, it couldn't reach the backend server.

## Solution Applied

### 1. Fixed Backend OTP Endpoint (authController.js)

**Issue:** MongoDB duplicate key error on `phone` field

```javascript
// OLD CODE (caused error):
phone: "temp"; // Multiple users had same "temp" value

// NEW CODE (fixed):
phone: `+temp${Date.now()}`; // Unique temporary phone per user
```

### 2. Updated Mobile App Network Configuration (authService.ts)

**Changed from:**

```typescript
if (Platform.OS === "android") {
  return "http://10.0.2.2:5001/api/v1"; // Only works in emulator
}
```

**Changed to:**

```typescript
if (Platform.OS === "android") {
  return "http://192.168.100.23:5001/api/v1"; // Works on real devices (your LAN IP)
}
```

### 3. Added Timeout Protection (SignUpScreen.tsx)

- Added 30-second timeout to prevent infinite loading
- Clear error messages if connection fails
- Better console logging for debugging

### 4. Added Request Timeout (authService.ts)

- Added 25-second timeout to fetch requests
- Race condition between fetch and timeout
- Prevents hanging network requests

## Testing Results

✅ **Backend Health Check:** Working on port 5001
✅ **Localhost Connection:** 30ms response time (iOS simulator)
✅ **LAN IP Connection:** 6ms response time (real devices)
❌ **Emulator IP (10.0.2.2):** Timeout (not accessible from host)

## How to Test

### 1. Ensure Backend is Running

```bash
cd apps/backend
npm start
# Should see: "Backend Started on port 5001"
```

### 2. Start Expo App

```bash
cd apps/emergency-user-app
npx expo start --clear
```

### 3. Test on Your Device

1. Scan QR code with Expo Go app
2. Go to Sign Up screen
3. Enter email: `test@example.com`
4. Click "Send Verification Code"
5. Should see success alert within 2-3 seconds

### 4. Check Logs

**Backend logs should show:**

```
✅ OTP verification email sent to: test@example.com
POST /api/v1/auth/register/otp/request 200
```

**Mobile app console should show:**

```
📧 Requesting OTP for: test@example.com
🌐 Making API request to: http://192.168.100.23:5001/api/v1/auth/register/otp/request
📊 Response status: 200 OK
✅ Successful API request
```

## Network Connectivity Test Script

Created `test-backend-connection.js` to diagnose network issues:

```bash
cd apps/emergency-user-app
node test-backend-connection.js
```

This tests all possible backend URLs and shows which one works.

## Important Notes

### For Different Network Environments

**Your Home Network:** `192.168.100.23:5001`
**Other Networks:** Update `LOCAL_NETWORK_IP` in `authService.ts` with your new IP

To find your computer's IP address:

- **Windows:** `ipconfig` (look for IPv4 Address)
- **Mac/Linux:** `ifconfig` or `ip addr`

### For Android Emulator (not Expo Go)

If testing in Android Studio emulator, uncomment this line in `authService.ts`:

```typescript
return "http://10.0.2.2:5001/api/v1";
```

### For iOS Simulator

Already configured correctly with `http://localhost:5001/api/v1`

## Files Modified

1. ✅ `apps/backend/controllers/authController.js` - Fixed duplicate phone error
2. ✅ `apps/emergency-user-app/src/services/authService.ts` - Updated API URL + timeout
3. ✅ `apps/emergency-user-app/src/screens/auth/SignUpScreen.tsx` - Added timeout handling
4. ✅ `apps/emergency-user-app/test-backend-connection.js` - Network diagnostic tool

## Expected Behavior Now

1. **Click "Send Verification Code"**
   - Button shows "Sending Code..." (grey, disabled)
   - Request completes in 2-3 seconds
2. **Success Case:**
   - Alert: "OTP Sent! 📧"
   - Auto-advances to OTP entry screen
   - Button returns to normal state
3. **Error Case:**
   - Alert shows specific error message
   - Button returns to normal state
   - User can retry
4. **Timeout Case (30s):**
   - Alert: "Connection Timeout" with troubleshooting steps
   - Button returns to normal state

## Next Steps

1. ✅ Backend fixed and running
2. ✅ Network configuration updated
3. ✅ Error handling improved
4. ⏳ **Ready to test on real device**
5. ⏳ Test complete sign-up flow (OTP → Registration)
6. ⏳ Test sign-in flow
7. ⏳ Test forgot password flow

## Troubleshooting

### Button Still Stuck?

**Check Backend is Running:**

```bash
curl http://localhost:5001/health
# Should return: {"success":true,...}
```

**Check Firewall:**

- Windows Defender might block port 5001
- Temporarily disable to test
- Add exception for Node.js

**Check Network:**

```bash
node apps/emergency-user-app/test-backend-connection.js
```

**Check Expo Dev Tools:**

- Open Chrome DevTools (press `j` in Expo terminal)
- Look for network errors in Console tab
- Check if request URL is correct

### Still Having Issues?

1. Restart backend server
2. Restart Expo with `--clear` flag
3. Check your computer's firewall settings
4. Verify your phone and computer are on same WiFi network
5. Try using your computer's IP address directly in a mobile browser: `http://192.168.100.23:5001/health`

---

**Status:** ✅ Fixed and ready for testing
**Date:** October 26, 2025
