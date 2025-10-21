# Backend Status & Testing Guide

## Summary of Fixes Applied

### 1. Enhanced tRPC Client (`lib/trpc.ts`)
- Added better logging for debugging
- Added custom fetch handler to catch and log HTTP errors
- Improved error messages to show response status and body

### 2. Improved Backend Error Handling (`backend/hono.ts`)
- Enhanced CORS configuration with explicit settings
- Added `onError` handler to tRPC server
- Added global error handler for Hono app
- Added health check endpoint logging

### 3. Enhanced Child Monitoring (`services/childMonitoring.ts`)
- Added detailed logging for all operations
- Improved error handling with detailed error messages
- Added success logging for device status updates

### 4. Fixed Child Pairing (`app/child-pairing.tsx`)
- Now properly saves connection config after pairing
- Starts child monitoring automatically after successful pairing
- Stores all required data (device ID, user role, etc.)

## How to Test

### Test 1: Backend Health Check
1. Start the app with `npm start` or `bun start`
2. Open browser console (F12)
3. Check for `[Backend] Health check` logs
4. Navigate to: `http://localhost:8081/api` in browser
5. Should see: `{"status":"ok","message":"API is running","timestamp":"..."}`

### Test 2: tRPC Connection
1. Open the app
2. Check console for `[tRPC] Using window origin:` or `[tRPC] Using localhost URL:`
3. Look for `[tRPC] Fetching:` logs
4. If errors occur, check for:
   - `[tRPC] Response not OK:` (backend is running but returning errors)
   - `[tRPC] Response body:` (shows what the backend actually returned)

### Test 3: Child Device Setup
1. Fresh install: Clear app data
2. Select "Child" role on consent screen
3. Enter parent/guardian name and child name
4. Agree to terms and continue
5. On setup screen, click "Continue"
6. Should redirect to child-pairing screen
7. Check console for:
   - `[ChildPairing] Generating pairing code`
   - `[ChildPairing] Pairing code generated: XXXXXX`
8. Should see 6-digit pairing code displayed

### Test 4: Parent Device Setup
1. Fresh install on different device/browser
2. Select "Parent/Guardian" role
3. Enter your name and agree to terms
4. Set a parent PIN (e.g., "1234")
5. Should redirect to parent dashboard
6. Look for "Connected Devices" section
7. Try generating a pairing code to pair with child device

### Test 5: Device Pairing
1. Have child device showing pairing code
2. On parent device, enter the pairing code
3. Set calculator PIN for child device
4. Submit pairing
5. Child device should show "Connected!" alert
6. Check console on child device for:
   - `[ChildPairing] Device paired successfully!`
   - `[ChildPairing] Starting child monitoring...`
   - `[ChildMonitoring] Starting monitoring for device: ...`
   - `[ChildMonitoring] Updating device status...`
   - `[ChildMonitoring] Device status updated successfully:`

### Test 6: Child Monitoring
1. After pairing, child device should automatically start monitoring
2. Check console every 10 seconds for:
   - `[ChildMonitoring] Updating device status...`
   - `[ChildMonitoring] Device status updated successfully:`
3. Check every 3 seconds for:
   - `[ChildMonitoring] Checking for commands...`
   - `[ChildMonitoring] Found X commands`

### Test 7: Remote Commands
1. On parent device, select connected child device
2. Try sending a command (e.g., "Get Location")
3. Check parent console for command sent
4. Check child console for:
   - `[ChildMonitoring] Found 1 commands`
   - `[ChildMonitoring] Executing command: get_location`
   - Command result

## Common Issues & Solutions

### Issue 1: "JSON Parse error: Unexpected character: <"
**Cause**: Backend is not running or returning HTML instead of JSON
**Solution**:
1. Check if backend server is running
2. Verify `EXPO_PUBLIC_RORK_API_BASE_URL` is set correctly
3. Check console for tRPC fetch logs
4. Test health endpoint: `http://localhost:8081/api`

### Issue 2: CORS Errors
**Cause**: Browser blocking cross-origin requests
**Solution**:
- Backend now has proper CORS headers configured
- Should accept requests from any origin (`origin: '*'`)
- If still failing, check browser console for specific CORS error

### Issue 3: Child Monitoring Not Starting
**Cause**: Connection config or device ID not saved
**Solution**:
1. Check AsyncStorage for 'connection_config'
2. Check AsyncStorage for 'device_id'
3. Verify child pairing completed successfully
4. Check console for monitoring start logs

### Issue 4: Commands Not Executing
**Cause**: Child device not polling for commands
**Solution**:
1. Verify monitoring is active: `isMonitoringActive()`
2. Check for 3-second interval logs
3. Verify backend is storing commands
4. Check device IDs match between parent and child

## Backend Architecture

### Endpoints
- `GET /api` - Health check
- `POST /api/trpc/devices.generatePairingCode` - Generate pairing code
- `POST /api/trpc/devices.pair` - Pair devices
- `GET /api/trpc/devices.checkPairingStatus` - Check pairing status
- `POST /api/trpc/devices.updateStatus` - Update device status (child → backend)
- `GET /api/trpc/devices.getStatus` - Get device status (parent ← backend)
- `POST /api/trpc/devices.sendCommand` - Send command (parent → backend)
- `GET /api/trpc/devices.getCommands` - Get commands (child ← backend)
- `POST /api/trpc/devices.updateCommandStatus` - Update command status

### Data Flow
1. **Pairing**:
   - Child: Generate pairing code → Backend stores
   - Parent: Enter code → Backend validates → Creates pairing
   - Backend: Returns child PIN to both devices

2. **Status Updates**:
   - Child device: Every 10s → `updateStatus` → Backend stores
   - Parent device: Query → `getStatus` → Backend returns

3. **Commands**:
   - Parent: Send command → Backend stores with "pending" status
   - Child: Every 3s → `getCommands` → Backend returns pending commands
   - Child: Execute → `updateCommandStatus` with result
   - Parent: Query result → `getCommandResult`

## Next Steps

1. Run tests in order (1-7)
2. Check console logs at each step
3. If errors occur, refer to "Common Issues & Solutions"
4. Report any persistent errors with console logs
