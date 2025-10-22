# Features Checklist

Use this checklist to verify all features are working correctly.

## ✅ Initial Setup & Onboarding

### Role Selection
- [ ] App opens to consent/role selection screen
- [ ] Can choose "Parent/Guardian" role
- [ ] Can choose "Child" role
- [ ] Can access "Switch to Calculator Disguise" button
- [ ] Terms and conditions are displayed
- [ ] Name input fields work correctly

### Parent Setup
- [ ] Can enter parent name
- [ ] Can create parent PIN (4+ digits)
- [ ] Can confirm parent PIN  
- [ ] Can create child PIN (4+ digits)
- [ ] Can confirm child PIN
- [ ] Cannot use same PIN for both parent and child
- [ ] Success message appears after setup
- [ ] Redirected to parent dashboard

### Child Setup
- [ ] Can enter parent name
- [ ] Can enter child name
- [ ] Can create PIN (4+ digits)
- [ ] Can confirm PIN
- [ ] Receives pairing code (6 characters)
- [ ] Pairing code is displayed in alert
- [ ] Redirected to onboarding after setup

## ✅ Calculator & PIN Entry

### Basic Calculator Functions
- [ ] Numbers 0-9 work
- [ ] Addition (+) works correctly
- [ ] Subtraction (-) works correctly
- [ ] Multiplication (×) works correctly
- [ ] Division (÷) works correctly
- [ ] Decimal point (.) works
- [ ] Equals (=) calculates result
- [ ] Clear (C) resets calculator
- [ ] Plus/minus (±) toggles sign
- [ ] Percent (%) calculates percentage

### PIN Entry
- [ ] Entering 4+ digits and pressing = triggers PIN check
- [ ] Correct parent PIN opens parent dashboard
- [ ] Correct child PIN opens vault
- [ ] Incorrect PIN shows no response (for security)
- [ ] PIN buffer resets after operation buttons

## ✅ Disguise Mode

### Entering Disguise Mode
- [ ] "Switch to Calculator Disguise" button works
- [ ] App displays full calculator interface
- [ ] Calculator functions normally
- [ ] No indication of hidden features

### Disguise Calculator Features
- [ ] All basic operations work
- [ ] Clear (C) and Clear Entry (CE) both work
- [ ] Backspace (⌫) removes last digit
- [ ] Operation display shows current operation
- [ ] Info button (ⓘ) shows help message
- [ ] Percent button works with wide layout

### Exiting Disguise Mode
- [ ] Can enter PIN using calculator buttons
- [ ] Pressing = with correct PIN exits disguise mode
- [ ] Returns to normal app mode
- [ ] Works with both parent and child PINs

## ✅ Parent Features

### Parent Dashboard
- [ ] Opens after parent PIN entry
- [ ] Shows connected devices list
- [ ] Shows monitoring controls
- [ ] Can access settings
- [ ] Can pair new devices

### Device Pairing
- [ ] Can enter 6-character pairing code
- [ ] Valid code pairs device successfully
- [ ] Paired device appears in list
- [ ] Device shows name and status
- [ ] Can view device details
- [ ] Expired codes show error message

### Auto-Login
- [ ] First login saves parent PIN
- [ ] Subsequent app opens auto-login
- [ ] Goes directly to parent dashboard
- [ ] No need to enter PIN again
- [ ] Can disable in settings

### Device Monitoring
- [ ] Can select a paired device
- [ ] Can view device status (online/offline)
- [ ] Can view last seen timestamp
- [ ] Can view battery level (if available)
- [ ] Can view location (if available)

### Remote Commands
- [ ] Can send screenshot command
- [ ] Can start audio monitoring
- [ ] Can stop audio monitoring  
- [ ] Can request location
- [ ] Can lock device
- [ ] Commands show pending status
- [ ] Completed commands show results
- [ ] Failed commands show error messages

### Activity Logs
- [ ] Logs are displayed chronologically
- [ ] Shows app opens/closes
- [ ] Shows PIN attempts
- [ ] Shows command executions
- [ ] Can filter by date
- [ ] Can search logs

## ✅ Child Features

### Child Mode
- [ ] Calculator screen after PIN entry
- [ ] Can access hidden apps
- [ ] Monitoring indicators (if active)
- [ ] Cannot access parent features

### Device Status Updates
- [ ] Automatically reports status to backend
- [ ] Updates every 30 seconds
- [ ] Sends battery level
- [ ] Sends location (if enabled)
- [ ] Shows as online on parent device

### Remote Command Handling
- [ ] Receives commands from parent
- [ ] Executes screenshot command
- [ ] Handles audio monitoring start/stop
- [ ] Sends location on request
- [ ] Locks device on command
- [ ] Reports execution status back

### Monitoring Consent
- [ ] Clear indication monitoring is active
- [ ] Can view what's being monitored
- [ ] Parental consent stored
- [ ] Appropriate for safety use case

## ✅ Backend & Connectivity

### API Health
- [ ] Backend starts automatically
- [ ] `/api` endpoint returns status OK
- [ ] tRPC endpoints respond
- [ ] CORS configured correctly
- [ ] Handles multiple concurrent requests

### Device Pairing Backend
- [ ] Generates pairing codes
- [ ] Stores pairing data
- [ ] Code expires after 5 minutes
- [ ] Returns device info after pairing
- [ ] Tracks parent-child relationships

### Commands Backend
- [ ] Receives commands from parent
- [ ] Stores pending commands
- [ ] Child device fetches commands
- [ ] Updates command status
- [ ] Returns command results
- [ ] Cleans up completed commands

### Status Backend
- [ ] Receives status updates from child
- [ ] Stores device status
- [ ] Parent can query status
- [ ] Marks devices offline after 30s
- [ ] Handles multiple devices

## ✅ Security & Privacy

### PIN Security
- [ ] PINs are hashed before storage
- [ ] Cannot retrieve original PIN
- [ ] Separate parent/child PINs
- [ ] 4+ digit minimum length enforced
- [ ] Wrong PIN attempts logged

### Data Encryption
- [ ] Hidden apps list encrypted
- [ ] Settings encrypted
- [ ] Decoy mode data separate
- [ ] Secure storage (SecureStore on mobile, localStorage on web)

### Monitoring Transparency
- [ ] Consent required before setup
- [ ] User role clearly indicated
- [ ] Activity logging for accountability
- [ ] No hidden monitoring without consent
- [ ] Child is aware of monitoring

## ✅ Cross-Platform

### Web
- [ ] App loads in browser
- [ ] Calculator works
- [ ] PIN entry works
- [ ] Backend connectivity works
- [ ] localStorage fallback works

### iOS
- [ ] App runs on iOS Simulator
- [ ] Calculator works
- [ ] Haptic feedback works
- [ ] Permissions granted (mic, location)
- [ ] SecureStore works

### Android  
- [ ] App runs on Android Emulator
- [ ] Calculator works
- [ ] Haptic feedback works
- [ ] Permissions granted (mic, location)
- [ ] SecureStore works

## ✅ UI/UX

### Calculator Design
- [ ] Looks like real calculator
- [ ] iOS-style button layout
- [ ] Dark theme (#000 background)
- [ ] Orange operation buttons
- [ ] Gray special buttons
- [ ] Large, readable display
- [ ] Responsive button presses

### Navigation
- [ ] Smooth transitions between screens
- [ ] Back button works (where applicable)
- [ ] Cannot go back from parent dashboard
- [ ] Role selection has back button
- [ ] Loading states displayed

### Error Handling
- [ ] User-friendly error messages
- [ ] No app crashes
- [ ] Invalid inputs handled gracefully
- [ ] Network errors handled
- [ ] Timeout errors handled

## ✅ Edge Cases

### Offline Mode
- [ ] App loads without internet
- [ ] Calculator works offline
- [ ] Pairing requires internet (expected)
- [ ] Remote commands require internet (expected)
- [ ] Appropriate offline messages shown

### Session Management
- [ ] App remembers user role
- [ ] Auto-login works after app restart
- [ ] PIN not stored in plain text
- [ ] Session persists through app close

### Data Limits
- [ ] Handles 100+ activity logs
- [ ] Handles 10+ paired devices
- [ ] Long device names display correctly
- [ ] Large battery percentages handled

## Testing Checklist

### Quick Test (5 minutes)
1. [ ] Start app → Choose role → Setup → Enter PIN
2. [ ] Calculator opens and works
3. [ ] Enter PIN on calculator → Unlocks
4. [ ] Switch to disguise mode and back

### Full Test (30 minutes)
1. [ ] Complete parent setup
2. [ ] Complete child setup on second device/tab
3. [ ] Pair devices using code
4. [ ] Send remote command
5. [ ] Verify command executes
6. [ ] Check activity logs
7. [ ] Test auto-login
8. [ ] Test disguise mode thoroughly

### Device Pairing Test
1. [ ] Setup child device → Get pairing code
2. [ ] Setup parent device  
3. [ ] Enter code on parent → Pair succeeds
4. [ ] Child appears online
5. [ ] Send command from parent
6. [ ] Command appears on child
7. [ ] Result sent back to parent

---

## Results

- **Total Features**: ~120
- **Tested**: ___ / 120
- **Passing**: ___ / ___
- **Failing**: ___ / ___

### Critical Issues (if any):
- 
- 
- 

### Minor Issues (if any):
- 
- 
- 

### Notes:
- 
- 
- 
