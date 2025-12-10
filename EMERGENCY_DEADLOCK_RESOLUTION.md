# Emergency Deadlock Resolution Guide

## Problem Resolved
Driver app crashed during active emergency, causing a deadlock where:
- Emergency stuck in "accepted" or "in_progress" status
- Driver can't access the emergency after reopening app
- Patient can't cancel the emergency
- New emergencies can't be dispatched

## Solutions Implemented

### 1. Manual Resolution Script (Backend)
Use this to immediately resolve the current stuck emergency.

**Run the script:**
```bash
cd apps/backend
node scripts/resolve-stuck-emergency.js
```

**This will:**
- List all stuck emergencies (older than 30 minutes, in "accepted" or "in_progress")
- Show emergency details (patient, ambulance, hospital)

**To resolve a specific emergency:**
```bash
# Cancel the emergency
node scripts/resolve-stuck-emergency.js <emergency-id> cancel

# Or mark as completed
node scripts/resolve-stuck-emergency.js <emergency-id> complete
```

**Example:**
```bash
node scripts/resolve-stuck-emergency.js 6938685acf2ae3ec88d316ef cancel
```

### 2. Backend API Endpoints (NEW)

**GET /api/v1/emergencies/driver/active**
- Fetches driver's active emergency
- Used for automatic recovery when app restarts

**PUT /api/v1/emergencies/:id/force-complete**
- Force mark emergency as completed
- Available to both driver and patient
- Use when technical issue prevents normal completion

**PUT /api/v1/emergencies/:id/force-cancel**
- Force cancel emergency even if in progress
- Available to both driver and patient
- Releases reserved hospital bed

### 3. Driver App Features (NEW)

**Automatic Emergency Recovery:**
- When driver opens the app, it checks for active emergencies
- If found, shows alert: "Continue" or "Cancel Emergency"
- Prevents stuck emergencies from being forgotten

**Emergency Action Buttons (in active-emergency screen):**
- **Force Complete**: Mark emergency as complete (use if can't complete normally)
- **Cancel Emergency**: Cancel the emergency (use if technical issue)
- Both buttons show at bottom of screen under "Emergency Actions" section

### 4. Tracking Endpoint Fix (BONUS)

Fixed hospital dashboard tracking endpoint to show emergencies with correct statuses:
- Changed from `["dispatched", "on_route", "arrived"]` 
- To `["accepted", "in_progress"]` (matches actual emergency statuses)
- Dashboard now shows active emergencies immediately

## How to Resolve Your Current Stuck Emergency

### Option A: Use the Script (Recommended)
```bash
cd C:\Users\PMLS\Desktop\FYP\alertx\apps\backend
node scripts/resolve-stuck-emergency.js
```

Look for your emergency in the list, then:
```bash
node scripts/resolve-stuck-emergency.js <emergency-id> cancel
```

### Option B: Use the Driver App
1. Restart backend server (with new code)
2. Open driver app
3. Should see "Active Emergency Found" alert
4. Tap "Cancel Emergency"

### Option C: Use API Directly (Postman/Thunder Client)
```
PUT http://localhost:5001/api/v1/emergencies/<emergency-id>/force-cancel
Headers:
  Authorization: Bearer <your-driver-token>
Body:
  { "reason": "Manual resolution of stuck emergency" }
```

## Prevention

The following changes prevent this from happening again:

1. **App Restart Recovery**: Driver app automatically detects and offers to recover stuck emergencies
2. **Emergency Buttons**: Driver can manually force complete/cancel from active emergency screen
3. **Patient Cancellation**: Patient can force cancel even in-progress emergencies (already implemented, now works for in-progress too)
4. **Backend Validation**: Emergency statuses properly tracked and exposed via API

## Testing the Fix

1. **Start Backend:**
```bash
cd apps/backend
node server.js
```

2. **Resolve Current Emergency:**
```bash
node scripts/resolve-stuck-emergency.js
```

3. **Test Recovery:**
   - Dispatch new emergency
   - Accept it on driver app
   - Force close driver app
   - Reopen driver app → Should see recovery alert

4. **Test Force Buttons:**
   - Accept an emergency
   - Scroll down to "Emergency Actions"
   - Try "Force Complete" or "Cancel Emergency"

## Files Changed

**Backend:**
- `apps/backend/controllers/emergencyController.js` - Added 3 new endpoints
- `apps/backend/routes/emergencyRoutes.js` - Added routes for new endpoints
- `apps/backend/controllers/hospitalController.js` - Fixed tracking status filter
- `apps/backend/scripts/resolve-stuck-emergency.js` - NEW: Manual resolution script

**Driver App:**
- `apps/emergency-driver-app/src/services/emergencyService.ts` - Added 3 new methods
- `apps/emergency-driver-app/app/(tabs)/index.tsx` - Added recovery check on launch
- `apps/emergency-driver-app/app/active-emergency.tsx` - Added force complete/cancel buttons

## Notes

- Force complete/cancel should only be used when there's a technical issue
- The script shows emergencies older than 30 minutes to avoid interfering with active ones
- Recovery alert only shows if emergency is in "accepted" or "in_progress" status
- All actions properly release reserved hospital beds
