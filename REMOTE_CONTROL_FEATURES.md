# Remote Access Parental Control Features

## Overview
This app is a fully functional parental monitoring application with remote access controls. It disguises as a calculator while providing comprehensive monitoring capabilities with legal consent.

## Key Features

### 🔐 Dual PIN System
- **Parent PIN**: Access to full monitoring dashboard and remote controls
- **Child PIN**: Calculator access (monitoring runs in background)
- Both PINs secured with encryption and AsyncStorage

### 👨‍👩‍👧 Two Modes

#### Parent Mode
- Monitor multiple child devices from single dashboard
- Real-time device status updates (online/offline, battery, location)
- Remote command execution with live feedback
- Device pairing via secure 6-character codes
- Calculator disguise switch (can return by entering parent PIN)

#### Child Mode
- Functional calculator app
- Background monitoring service
- Automatic command polling (checks server every 3 seconds)
- Status updates sent every 10 seconds
- Pairing code generation for connection

### 🎮 Remote Control Features

#### Live Audio Monitoring
- Start/stop audio recording on child device
- Real-time activation via parent dashboard
- Uses expo-av for cross-platform audio capture

#### Location Tracking
- Get current GPS coordinates
- Accuracy information
- Real-time location requests
- Background location permission handling

#### Device Information
- Retrieve device details (brand, model, OS version)
- Battery level monitoring
- Screen on/off status
- Last seen timestamps

#### Remote Device Lock
- Lock child device remotely
- Requires child to enter PIN
- Instant activation

### 🔄 Real-Time Synchronization

#### Backend Architecture (tRPC)
- **Device Pairing**: Secure code-based pairing system
- **Command Queue**: Parent sends commands, child polls and executes
- **Status Updates**: Automatic device status synchronization
- **Result Polling**: Parent receives command results in real-time

#### Polling System
- Child device polls for commands every 3 seconds
- Status updates sent every 10 seconds
- Command execution results tracked
- Online/offline detection (30-second timeout)

### 📊 Monitoring Dashboard
- View all connected devices
- Real-time status indicators
- Activity logs and sessions
- Consent information display
- Quick action buttons for common commands

### 🎭 Calculator Disguise
- Fully functional advanced calculator
- PIN entry to unlock monitoring
- Switch between modes seamlessly
- Available on both parent and child devices

### ✅ Legal Compliance
- One-time consent screen (required before setup)
- Clear disclosure of monitoring features
- Parent/guardian name recording
- Child name recording
- Consent date tracking
- Terms and conditions agreement

## Technical Implementation

### Backend Routes (tRPC)

```typescript
devices.pair - Pair parent and child devices
devices.generatePairingCode - Generate 6-char pairing code
devices.sendCommand - Send remote command to child
devices.getCommands - Poll for pending commands (child)
devices.updateCommandStatus - Update command execution status
devices.getCommandResult - Get command result (parent polling)
devices.updateStatus - Update device status
devices.getStatus - Get single device status
devices.getMultipleStatus - Get multiple device statuses
```

### Command Types
- `start_audio` - Start audio monitoring
- `stop_audio` - Stop audio monitoring
- `get_location` - Get device location
- `get_screen` - Get device information
- `lock_device` - Lock the device
- `screenshot` - Capture screenshot (requires native implementation)

### Data Flow

1. **Device Pairing**
   - Child generates pairing code via backend
   - Parent enters code to pair
   - Backend validates and creates connection
   - Devices stored in parent's local state

2. **Remote Command**
   - Parent sends command via tRPC mutation
   - Backend stores command in queue
   - Child polls backend for new commands
   - Child executes command locally
   - Child updates command status
   - Parent polls for result
   - Parent displays result to user

3. **Status Updates**
   - Child updates status every 10 seconds
   - Includes battery, location, last seen
   - Parent queries statuses every 5 seconds
   - UI updates in real-time with online/offline indicators

### State Management
- **Zustand**: Global app state (vault, devices, user role)
- **React Query (via tRPC)**: Server state and caching
- **AsyncStorage**: Persistent local storage

### Security Features
- Encrypted PIN storage
- Device ID generation
- Pairing code expiration (5 minutes)
- Secure backend communication
- Permission-based feature access

## Platform Support

### Mobile (iOS/Android)
- Full feature support
- Audio recording with expo-av
- Location tracking with expo-location
- Device information with expo-device
- Background monitoring

### Web
- Limited feature support
- Location tracking via web API
- No audio monitoring
- Device info limited
- Real-time status updates work

## User Flow

### Parent Setup
1. Open app → Consent screen → Choose "Parent"
2. Enter parent and child names → Grant consent
3. Create parent PIN and child PIN
4. Access parent dashboard
5. Add child device via pairing code
6. Monitor and control remotely

### Child Setup
1. Open app → Consent screen → Choose "Child"
2. Enter parent/guardian and child names → Grant consent
3. Create child PIN
4. Receive pairing code (share with parent)
5. App functions as calculator
6. Background monitoring active

### Connecting Devices
1. Child completes setup → Pairing code displayed
2. Child shares code with parent (verbally, text, etc.)
3. Parent opens "Connect" tab → Enters pairing code
4. Backend validates and pairs devices
5. Parent can now monitor and control child device

## Remote Control in Action

### Example: Get Location
1. Parent taps location button on device card
2. Command sent to backend
3. Child polls and receives command
4. Child requests location permission (if needed)
5. Child gets GPS coordinates
6. Child updates command with location data
7. Parent polls for result
8. Location displayed in alert

### Example: Start Audio Monitoring
1. Parent taps microphone button
2. Command sent to backend
3. Child receives command
4. Child requests audio permission
5. Child starts recording
6. Status updated to parent
7. Parent sees "Audio monitoring active"

## Features Summary

✅ Real-time device monitoring  
✅ Live audio recording control  
✅ GPS location tracking  
✅ Remote device locking  
✅ Device information retrieval  
✅ Multi-device support  
✅ Calculator disguise mode  
✅ Secure pairing system  
✅ Legal consent framework  
✅ Cross-platform (iOS, Android, Web)  
✅ Backend synchronization  
✅ Automatic status updates  
✅ Command result polling  
✅ Online/offline detection  
✅ Battery level monitoring  

## Notes

- All monitoring is consensual and disclosed
- Pairing codes expire after 5 minutes for security
- Commands execute asynchronously
- Parent receives feedback via polling
- Child monitoring runs in background
- Calculator remains fully functional
- Both modes can switch to disguise mode
