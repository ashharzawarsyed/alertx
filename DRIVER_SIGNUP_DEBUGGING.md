# Driver App Signup Debugging Guide

## Problem Summary
The driver app signup feature was experiencing issues. This document explains the fixes implemented and common troubleshooting steps.

## Fixes Implemented

### 1. Enhanced Backend Validation (`authController.js`)
**Location**: `apps/backend/controllers/authController.js` (Lines 58-88)

**Changes**:
- Added robust extraction of `driverInfo` fields with fallback logic
- Added explicit validation for `licenseNumber` and `ambulanceNumber`
- Added comprehensive logging for debugging registration attempts
- Added `.trim()` to prevent whitespace issues

```javascript
if (role === USER_ROLES.DRIVER) {
  const { driverInfo } = req.body;
  
  // Extract driver info - try from driverInfo object first, then from req.body directly
  const licenseNumber = driverInfo?.licenseNumber || req.body.licenseNumber;
  const ambulanceNumber = driverInfo?.ambulanceNumber || req.body.ambulanceNumber;
  
  // Validation - should already be handled by middleware, but double-check
  if (!licenseNumber || !ambulanceNumber) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "License number and ambulance number are required for drivers"
    );
  }
  
  userData.driverInfo = {
    licenseNumber: licenseNumber.trim(),
    ambulanceNumber: ambulanceNumber.trim(),
    status: driverInfo?.status || "offline",
  };
}
```

### 2. Added Debugging Logs
**Locations**:
- `apps/backend/controllers/authController.js` (Lines 26-32, 93-98, 102-106)
- `apps/backend/middlewares/validation.js` (Lines 12-19)

**Purpose**: Track registration attempts and validation failures in real-time

## Common Signup Issues & Solutions

### Issue 1: Phone Number Format
**Symptom**: "Please provide a valid phone number with country code"

**Required Format**: `+[country_code][phone_number]`
- ✅ Correct: `+923001234567` (Pakistan)
- ✅ Correct: `+14155552671` (USA)
- ❌ Wrong: `03001234567` (missing +92)
- ❌ Wrong: `+92 300 123 4567` (spaces - frontend removes these)

**Frontend Validation**: `apps/emergency-driver-app/app/register.tsx` (Line 113)
```typescript
phone: formData.phone.replace(/[\s-]/g, '').trim()
```

**Backend Validation**: `apps/backend/middlewares/validation.js` (Line 38)
```javascript
body("phone")
  .matches(/^\+[1-9]\d{1,14}$/)
  .withMessage("Please provide a valid phone number with country code")
```

### Issue 2: Missing Driver Info
**Symptom**: "License number and ambulance number are required for drivers"

**Required Fields**:
- `name` (2-50 characters)
- `email` (valid email format)
- `phone` (with country code)
- `password` (8+ chars, uppercase, lowercase, number)
- `role` must be `"driver"`
- `driverInfo.licenseNumber` (not empty)
- `driverInfo.ambulanceNumber` (not empty)

**Payload Structure**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+923001234567",
  "password": "Pass1234",
  "role": "driver",
  "driverInfo": {
    "licenseNumber": "DL123456",
    "ambulanceNumber": "AMB789",
    "status": "offline"
  }
}
```

### Issue 3: Password Requirements
**Symptom**: "Password must contain at least one uppercase letter, one lowercase letter, and one number"

**Requirements**:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Examples**:
- ✅ `Password123`
- ✅ `Driver@2024`
- ❌ `password` (no uppercase, no number)
- ❌ `PASSWORD123` (no lowercase)
- ❌ `Pass123` (only 7 characters)

### Issue 4: Duplicate Email/Phone
**Symptom**: "User already exists with this email or phone"

**Solution**:
- Use a unique email address
- Use a unique phone number
- Check if you already registered with this email/phone

### Issue 5: Network Connection
**Symptom**: "Unable to connect to the remote server" or "Network error"

**Solutions**:
1. **Check Backend is Running**:
   ```powershell
   cd apps/backend
   npm start
   ```
   Should show: `🚀 AlertX Backend Server Started` on port 5001

2. **Check API URL Configuration**:
   - **Physical Device**: Ensure your phone and computer are on the same Wi-Fi network
   - **Android Emulator**: Use `http://10.0.2.2:5001`
   - **iOS Simulator**: Use `http://localhost:5001`
   
3. **Verify API_URL** in console logs when the driver app starts:
   ```
   🌐 Driver API URL (Auto-detected): http://192.168.x.x:5001/api/v1
   ```

4. **Test Backend Connectivity**:
   ```powershell
   # From PowerShell
   Invoke-WebRequest -Uri "http://localhost:5001/health" -Method GET
   ```
   Should return: `"success": true`

## Testing Driver Registration

### PowerShell Test Script
Use the test script created at the root: `test-driver-registration.ps1`

```powershell
cd C:\Users\PMLS\Desktop\FYP\alertx
.\test-driver-registration.ps1
```

**Tests Included**:
1. Valid driver registration
2. Missing licenseNumber validation
3. Missing ambulanceNumber validation
4. Phone without country code validation

### Manual Testing with curl (if available)
```bash
curl -X POST "http://localhost:5001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Driver",
    "email": "testdriver@test.com",
    "phone": "+923001234567",
    "password": "Test1234",
    "role": "driver",
    "driverInfo": {
      "licenseNumber": "DL123456",
      "ambulanceNumber": "AMB789",
      "status": "offline"
    }
  }'
```

## Debugging Steps

### 1. Check Backend Logs
When registration is attempted, you should see:
```
📝 Registration attempt: {
  role: 'driver',
  email: 'driver@example.com',
  phone: '+923001234567',
  hasDriverInfo: true,
  driverInfo: { licenseNumber: 'DL123456', ambulanceNumber: 'AMB789', status: 'offline' }
}
Creating user with data: { role: 'driver', email: '...', phone: '...', hasDriverInfo: true }
✅ User created successfully: { id: '...', role: 'driver', email: '...' }
```

### 2. Check for Validation Errors
If validation fails, you'll see:
```
❌ Validation errors: {
  endpoint: '/auth/register',
  errors: ['License number is required for drivers'],
  body: { role: 'driver', email: '...', phone: '...', hasDriverInfo: false }
}
```

### 3. Check Frontend Logs
In Metro bundler / Expo console:
```
📝 Registering new driver...
📤 Registration data: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+923001234567",
  ...
}
```

### 4. Check for MongoDB Errors
If there's a database issue:
```
❌ Registration error: [Error details]
```

## Code References

### Frontend Files
- **Registration Screen**: `apps/emergency-driver-app/app/register.tsx`
- **Auth Service**: `apps/emergency-driver-app/src/services/authService.ts`
- **Config**: `apps/emergency-driver-app/src/config/config.ts`

### Backend Files
- **Controller**: `apps/backend/controllers/authController.js` (register function at line 22)
- **Validation**: `apps/backend/middlewares/validation.js` (validateUserRegistration at line 37)
- **Routes**: `apps/backend/routes/authRoutes.js` (line 41)
- **User Model**: `apps/backend/models/User.js` (driverInfo schema at line 81)

## Expected Registration Flow

1. **User fills form** → Frontend validation in `register.tsx` (lines 36-101)
2. **Form submission** → `handleRegister` (lines 103-147)
3. **API call** → `authService.register()` (authService.ts line 208)
4. **Backend receives** → POST `/api/v1/auth/register`
5. **Validation middleware** → `validateUserRegistration` checks all fields
6. **Controller logic** → `register` function creates user
7. **Database** → MongoDB saves user with driverInfo
8. **Response** → Success message + token returned to frontend
9. **Navigation** → User redirected to login screen

## Success Indicators

### Backend Console
```
📝 Registration attempt: { role: 'driver', ... }
Creating user with data: { role: 'driver', ... }
✅ User created successfully: { id: '65abc123...', role: 'driver', email: 'driver@example.com' }
POST /api/v1/auth/register 201 450.123 ms - 987
```

### Frontend Alert
```
Registration Successful! 🎉
Your driver account has been created. Please login to continue.
[Login Now button]
```

### MongoDB Document
```json
{
  "_id": "65abc123...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+923001234567",
  "role": "driver",
  "driverInfo": {
    "licenseNumber": "DL123456",
    "ambulanceNumber": "AMB789",
    "status": "offline"
  },
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Still Having Issues?

1. **Clear Metro bundler cache**:
   ```bash
   cd apps/emergency-driver-app
   npx expo start --clear
   ```

2. **Restart backend**:
   ```powershell
   cd apps/backend
   npm start
   ```

3. **Check logs** in both Metro bundler and backend terminal

4. **Verify MongoDB connection** - Backend should log:
   ```
   MongoDB connected successfully: ac-suhfpfy-shard...
   ```

5. **Test with the PowerShell script** to isolate frontend vs backend issues

6. **Check firewall** - Ensure port 5001 is accessible

## Contact
If issues persist after following this guide, check the backend logs for specific error messages and share them for further debugging.
