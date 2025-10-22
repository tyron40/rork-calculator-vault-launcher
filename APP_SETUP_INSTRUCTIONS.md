# Calculator Vault App - Setup Instructions

## Overview
Your Calculator Vault app is now fully configured with:
- ✅ Backend enabled (tRPC + Hono)
- ✅ Parent/Child device pairing
- ✅ Remote control features
- ✅ Disguise calculator mode
- ✅ Auto-login after first setup
- ✅ Full calculator functionality

## Quick Start

### 1. Start the App
```bash
npm start
# or
bun start
```

This will start the app with the backend enabled and create a tunnel for device pairing.

### 2. First Time Setup Flow

#### For Parent Device:
1. Open the app → Choose "Parent/Guardian" role
2. Enter your name and agree to terms
3. Create two PINs:
   - **Parent PIN**: For accessing monitoring dashboard
   - **Child PIN**: For disguise mode (calculator only)
4. You'll receive a success message and be taken to parent dashboard
5. From now on, entering the parent PIN will automatically log you in

#### For Child Device:
1. Open the app → Choose "Child" role  
2. Enter parent name and child name, agree to terms
3. Create your PIN
4. You'll receive a **6-character pairing code** (e.g., "AB12CD")
5. Share this code with the parent device
6. Parent can pair by entering this code in their dashboard

### 3. Using Disguise Mode

The "Switch to Calculator Disguise" button is available on the role selection screen. This transforms the app into a fully functional calculator.

**To exit disguise mode:**
- Type your PIN on the calculator buttons
- Press `=` 
- The app will unlock and return to normal mode

**Calculator features:**
- All basic operations (+, -, ×, ÷)
- Decimal support
- Percentage
- Plus/minus toggle  
- Clear (C) and Clear Entry (CE)
- Backspace
- Memory of last operation
- Fully functional like iOS/Android calculator

### 4. Auto-Login Feature

After initial setup:
- **Parent devices**: Automatically log in with saved PIN
- **Child devices**: Must enter PIN each time (for security)

To disable auto-login:
- Go to parent dashboard → Settings
- Toggle "Auto-login" off

## How Device Pairing Works

### Step-by-Step:

1. **Child device generates pairing code** (5-minute expiration)
2. **Parent enters code** in their dashboard under "Pair Device"
3. **Devices are now connected** via the backend
4. **Parent can:**
   - View child device status
   - Send remote commands
   - View activity logs
   - Monitor location (with permission)
   - Start/stop audio monitoring

## Backend Configuration

The app automatically detects the backend URL:
- **Web**: Uses `window.location.origin`  
- **Mobile**: Uses the tunnel URL from `bun start`
- **Fallback**: `http://localhost:8081`

### Environment Variable (Optional)
If you need to override the backend URL, create a `.env` file:

```bash
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-backend-url.com
```

## Remote Control Features

Available commands that parent can send to child device:

1. **Screenshot** - Capture current screen
2. **Start Audio Monitoring** - Begin microphone recording
3. **Stop Audio Monitoring** - End recording
4. **Get Location** - Fetch current GPS coordinates  
5. **Lock Device** - Force lock the app

All commands require:
- Active device pairing
- Child device to be online
- Appropriate permissions granted

## Troubleshooting

### App won't load / stuck on loading screen
1. Make sure you started with `npm start` or `bun start`
2. The backend must be running (it starts automatically)
3. Check console for errors

### "No base url found" error
- The app should auto-detect the URL now
- If you see this error, add `EXPO_PUBLIC_RORK_API_BASE_URL` to `.env`

### Pairing code expired
- Codes expire after 5 minutes
- Generate a new code on the child device
- Enter it on parent device before expiration

### Can't exit disguise mode
- Enter your PIN using calculator buttons (0-9)
- Press `=` when done
- PIN must match either parent PIN or child PIN

### Auto-login not working
1. Check that you're on a parent device
2. Verify auto-login is enabled in settings
3. Make sure you completed initial setup

## Project Structure

```
app/
  ├── _layout.tsx         # Root layout with tRPC provider
  ├── index.tsx           # Calculator/PIN entry screen
  ├── consent.tsx         # Role selection & terms
  ├── setup.tsx           # PIN creation & pairing
  ├── onboarding.tsx      # First-time tutorial
  ├── vault.tsx           # Hidden apps screen
  ├── parent.tsx          # Parent dashboard
  ├── monitoring.tsx      # Monitoring controls
  └── disguise.tsx        # Full calculator disguise mode

backend/
  ├── hono.ts                    # API server
  └── trpc/
      ├── app-router.ts          # Main router
      ├── create-context.ts      # tRPC context
      └── routes/
          ├── devices/
          │   ├── pair/          # Pairing endpoints
          │   ├── commands/      # Remote commands
          │   └── status/        # Device status

components/
  ├── CalculatorPad.tsx    # Reusable calculator component
  ├── AppGrid.tsx          # App launcher grid
  └── ...

services/
  ├── storage.ts           # Secure PIN & data storage
  ├── crypto.ts            # Encryption utilities  
  ├── connection.ts        # Device pairing logic
  ├── monitoring.ts        # Activity logging
  └── childMonitoring.ts   # Remote command handling
```

## Security Features

- ✅ PINs hashed with SHA-256
- ✅ Hidden apps encrypted with AES-GCM
- ✅ Separate parent/child PINs
- ✅ Decoy mode for privacy
- ✅ Auto-lock after inactivity
- ✅ Secure pairing codes (5-min expiration)
- ✅ Activity logging for transparency

## Next Steps

1. **Test the app** on both parent and child devices
2. **Pair devices** using the pairing code system
3. **Try disguise mode** by switching to calculator
4. **Test remote controls** from parent dashboard
5. **Review activity logs** for monitoring transparency

## Need Help?

If you encounter any errors:
1. Check the console logs (look for `[Calculator]`, `[Setup]`, `[Backend]` prefixes)
2. Verify backend is running (should see "API is running" at `/api`)
3. Make sure both devices are connected to internet
4. Try restarting the app with `npm start`

---

Your app is ready to use! 🎉
