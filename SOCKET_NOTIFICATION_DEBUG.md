# Socket Notification Debugging Guide

## Issue Summary

When a patient creates an emergency in the user app, the emergency is successfully created in the database, but the driver app (which has an active socket connection) does not receive the notification about the new emergency.

### Current Behavior
✅ Emergency created successfully (HTTP 200)
✅ Driver app connected to socket
✅ Socket connection shows as active: `rnNQ0wYmEQqxop4rAAAL`
❌ Driver does not receive `emergency:newRequest` event

### Expected Behavior
1. Patient creates emergency
2. Backend finds available driver
3. Backend emits `emergency:newRequest` to driver's socket room
4. Driver app receives notification and updates UI

## Enhanced Logging Added

### 1. Emergency Controller (`emergencyController.js`)

**Driver Search Logging** (Lines ~730):
```javascript
console.log('🔍 Searching for available drivers with criteria:', {
  role: USER_ROLES.DRIVER,
  "driverInfo.status": DRIVER_STATUS.AVAILABLE,
  "driverInfo.ambulanceType": ambulanceType,
});

console.log('🔍 Driver search result:', nearestDriver ? {
  id: nearestDriver._id,
  name: nearestDriver.name,
  status: nearestDriver.driverInfo?.status,
  ambulanceType: nearestDriver.driverInfo?.ambulanceType
} : 'NO DRIVER FOUND');
```

**Socket Emission Logging** (Lines ~770):
```javascript
console.log(`📲 Attempting socket emission to driver:`, {
  driverId: nearestDriver._id.toString(),
  event: 'emergency:newRequest',
  room: `user_${nearestDriver._id}`,
  emergencyId: emergency._id.toString()
});

console.log(`✅ Socket notification sent to driver: ${nearestDriver._id}`);
```

### 2. Socket Helper (`socketHelper.js`)

**Room Join Confirmation** (Lines ~85):
```javascript
console.log(`✅ Driver joined rooms:`, {
  driverId: socket.userId,
  rooms: [`user_${socket.userId}`, 'role_driver', 'drivers_location']
});
```

**Driver Connection Event** (Lines ~91):
```javascript
socket.on("driver:connected", (data) => {
  console.log(`👋 Driver connected event received:`, {
    driverId: socket.userId,
    timestamp: data.timestamp
  });
  
  socket.emit("connection:confirmed", {
    userId: socket.userId,
    timestamp: new Date().toISOString()
  });
});
```

**Emit to User Detailed Logging** (Lines ~207):
```javascript
export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error('❌ Socket.IO not initialized - cannot emit to user');
    return;
  }
  
  const room = `user_${userId}`;
  const socketsInRoom = io.sockets.adapter.rooms.get(room);
  
  console.log(`📡 emitToUser called:`, {
    userId,
    event,
    room,
    socketsInRoom: socketsInRoom ? Array.from(socketsInRoom) : 'none',
    connectedCount: socketsInRoom?.size || 0
  });
  
  io.to(room).emit(event, data);
  
  console.log(`✅ Event '${event}' emitted to room '${room}'`);
};
```

## Testing Steps

### Step 1: Start Backend with Logging
```powershell
cd apps/backend
npm start
```

Watch for:
- ✅ Socket.io server initialized
- ✅ MongoDB connected

### Step 2: Connect Driver App
Open driver app and login with: `fociro9669@aikunkun.com`

**Expected Backend Logs:**
```
User connected: <driverId> (driver)
✅ Driver joined rooms: { driverId: '...', rooms: [...] }
👋 Driver connected event received: { driverId: '...', timestamp: '...' }
```

**Expected Driver App Logs:**
```
🔌 Socket connected
✅ Socket connected: rnNQ0wYmEQqxop4rAAAL
👋 Notifying server of driver connection
```

### Step 3: Create Emergency from User App

**Expected Backend Logs:**
```
🤖 Intelligent ambulance dispatch called: { triageResult: {...}, location: {...} }
✅ Intelligent emergency created: new ObjectId('...')
🚑 Required ambulance type: MOBILE_ICU
🔍 Searching for available drivers with criteria: { role: 'driver', ... }
🔍 Driver search result: { id: '...', name: '...', status: 'available', ambulanceType: 'MOBILE_ICU' }
📲 Attempting socket emission to driver: { driverId: '...', event: 'emergency:newRequest', room: 'user_...', emergencyId: '...' }
📡 emitToUser called: { userId: '...', event: 'emergency:newRequest', room: 'user_...', socketsInRoom: [...], connectedCount: 1 }
✅ Event 'emergency:newRequest' emitted to room 'user_...'
✅ Socket notification sent to driver: ...
```

**Expected Driver App Logs:**
```
🚨 New emergency notification: { emergency: {...}, message: '...', timestamp: '...' }
```

## Potential Issues to Check

### Issue 1: Driver Not Found
**Symptom**: Backend logs show `NO DRIVER FOUND`

**Possible Causes:**
- Driver status is not "available" (check Profile tab)
- Driver ambulance type doesn't match required type
- No drivers in database

**Solution:**
Check driver's status in driver app Profile tab:
```typescript
// Should show: Status: Available (green)
// If not, update status manually
```

### Issue 2: Wrong User ID in Socket
**Symptom**: Driver connects but `userId` doesn't match database `_id`

**Possible Causes:**
- JWT token has wrong ID
- Driver logged in with different account

**Solution:**
Compare IDs:
- Backend log: `User connected: <userId> (driver)`
- Backend log: `Driver search result: { id: '<driverId>' }`
- These should match!

### Issue 3: Socket Room Mismatch
**Symptom**: Driver joins room `user_ABC` but emission goes to `user_XYZ`

**Possible Causes:**
- Multiple driver accounts
- Wrong driver selected by search query

**Check:**
Backend logs should show:
```
✅ Driver joined rooms: { driverId: 'ABC', rooms: ['user_ABC', ...] }
...
📡 emitToUser called: { userId: 'ABC', room: 'user_ABC', socketsInRoom: ['...'], connectedCount: 1 }
```

### Issue 4: Socket Not Connected
**Symptom**: `connectedCount: 0` in emit logs

**Possible Causes:**
- Driver disconnected before emergency created
- Socket authentication failed
- Network issue

**Solution:**
1. Check driver app shows "Socket connected"
2. Try disconnecting and reconnecting driver
3. Check for socket errors in backend logs

### Issue 5: Ambulance Type Mismatch
**Symptom**: Driver found but wrong ambulance type

**Check:**
```javascript
// Backend determines required type
🚑 Required ambulance type: MOBILE_ICU

// Driver must have matching type
🔍 Driver search result: { ambulanceType: 'MOBILE_ICU' }
```

**Solution:**
Update driver's ambulance type during registration or profile update

## Quick Diagnostic Commands

### Check Driver in Database
```javascript
// In backend debug console
const driver = await User.findOne({ email: 'fociro9669@aikunkun.com' });
console.log({
  _id: driver._id,
  status: driver.driverInfo?.status,
  ambulanceType: driver.driverInfo?.ambulanceType
});
```

### Check Socket Rooms
```javascript
// In backend (add to socketHelper.js temporarily)
console.log('All rooms:', Array.from(io.sockets.adapter.rooms.keys()));
console.log('All sockets:', Array.from(io.sockets.sockets.keys()));
```

### Force Status Update
```javascript
// In driver app Profile screen, add button:
await authService.updateDriverStatus('available');
```

## Next Steps

1. **Start backend** with new logging
2. **Connect driver app** - verify connection logs appear
3. **Create emergency** from user app
4. **Watch backend logs** for the diagnostic output
5. **Compare driver ID** in connection log vs. search result log
6. **Check socket room** has connected sockets
7. **Verify ambulance type** matches

## Expected Resolution

Once we see the logs, we'll know exactly which step is failing:
- ❌ Driver not found → Check status/ambulance type
- ❌ Wrong user ID → Check JWT token/login
- ❌ No sockets in room → Check connection timing
- ❌ Socket not initialized → Check server startup
- ❌ Event not received → Check driver app listener

---

**Status**: Backend ready with enhanced logging
**Next Action**: Test emergency creation and analyze logs
