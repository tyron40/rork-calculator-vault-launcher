# Development Build Quick Start

## TL;DR - Get Running in 5 Minutes

This app **requires development builds** because it uses custom native Android code for launcher functionality.

### Option 1: Local Build (Fastest - Requires Android Studio)

```bash
# 1. Generate native Android project
npx expo prebuild --platform android

# 2. Build and run on device/emulator
npx expo run:android

# Done! App is now running with full launcher functionality
```

### Option 2: Cloud Build (No Android Studio Required)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build development client
eas build --profile development --platform android

# 5. Download and install the APK on your device

# 6. Start dev server
npx expo start --dev-client

# 7. Scan QR code with your development build app
```

## What You Need to Know

### Why Development Builds?

**Expo Go cannot run this app** because:
- Custom native `AppManager` module for listing/launching apps
- Custom Android launcher intent filters
- Android package query permissions

### What's Different?

| Action | Expo Go | Development Build |
|--------|---------|-------------------|
| Install | Download from store | Build yourself |
| Custom native code | ❌ | ✅ |
| Launcher functionality | ❌ | ✅ |
| Fast Refresh | ✅ | ✅ |
| Setup time | 1 min | 5-10 min |

### Development Workflow

1. **Build once** (local or cloud)
2. **Install on device**
3. **Develop normally** - Fast Refresh works like Expo Go
4. **Rebuild only when** changing native code

## Prerequisites

### For Local Builds (Option 1)

**Android:**
- Android Studio installed
- Android SDK configured
- Device connected or emulator running

**iOS:**
- macOS with Xcode installed
- iOS Simulator or device connected

### For Cloud Builds (Option 2)

- Expo account (free)
- Internet connection
- Android device to install APK

## Step-by-Step: Local Build

### 1. Ensure expo-dev-client is installed

```bash
npx expo install expo-dev-client
```

### 2. Add to app.json plugins

```json
{
  "expo": {
    "plugins": [
      "expo-dev-client",
      ...other plugins
    ]
  }
}
```

### 3. Prebuild native projects

```bash
# Android only
npx expo prebuild --platform android

# Or both platforms
npx expo prebuild
```

This generates:
- `android/` folder with native Android project
- `ios/` folder with native iOS project (if applicable)

### 4. Run on device

```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

This will:
- Compile native code
- Install app on device/emulator
- Start Metro bundler
- Launch app in development mode

### 5. Test launcher functionality

**On Android:**
1. Press Home button
2. Select "Calculator Vault Launcher"
3. Choose "Always"
4. Test the full launcher experience

**On iOS:**
- Launcher features use mock data (iOS doesn't support custom launchers)
- Vault, PIN, and UI still work fully

## Step-by-Step: Cloud Build

### 1. Install and configure EAS

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS for your project
eas build:configure
```

### 2. Create development build

```bash
# For Android
eas build --profile development --platform android

# For iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

Build takes 10-20 minutes. You'll get a URL to download when complete.

### 3. Install on device

**Android:**
- Download APK from EAS build page
- Install on your device (enable "Install from unknown sources")

**iOS:**
- Install via TestFlight (if configured)
- Or download directly (requires Apple Developer account)

### 4. Start development server

```bash
npx expo start --dev-client
```

### 5. Connect device to dev server

- Open your development build app
- Scan QR code from terminal
- Or enter URL manually

## Daily Development

Once you have a development build installed:

```bash
# Start dev server
npx expo start --dev-client

# Open your development build app and scan QR code
# Make changes - Fast Refresh updates instantly
```

## When to Rebuild

**Rebuild required:**
- Changed native code (Java/Kotlin/Swift/Objective-C)
- Modified AndroidManifest.xml or Info.plist
- Added/removed native dependencies
- Changed native configuration in app.json

**No rebuild needed:**
- JavaScript/TypeScript changes
- React component updates
- Style changes
- Most app.json changes

## Troubleshooting

### "Command not found: expo"

```bash
npm install -g expo-cli
```

### "Android SDK not found"

Install Android Studio and configure SDK path:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### "No devices found"

**Android:**
```bash
# Check connected devices
adb devices

# Start emulator
emulator -avd Pixel_5_API_31
```

**iOS:**
```bash
# List simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 15"
```

### "Build failed"

```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

### "Can't connect to dev server"

```bash
# Use tunnel mode
npx expo start --dev-client --tunnel
```

## Testing on Physical Device

### Android

1. **Enable Developer Options:**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect via USB:**
   ```bash
   adb devices  # Should show your device
   npx expo run:android
   ```

### iOS

1. **Trust Computer:**
   - Connect iPhone via USB
   - Tap "Trust" on device

2. **Run:**
   ```bash
   npx expo run:ios --device
   ```

## Production Build

When ready to distribute:

```bash
# Build production APK/IPA
eas build --profile production --platform android
eas build --profile production --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Key Commands Reference

```bash
# Development
npx expo start --dev-client          # Start dev server
npx expo run:android                 # Build and run Android
npx expo run:ios                     # Build and run iOS

# Building
npx expo prebuild                    # Generate native projects
npx expo prebuild --clean            # Clean and regenerate
eas build --profile development      # Cloud development build
eas build --profile production       # Cloud production build

# Debugging
npx react-native log-android         # View Android logs
npx react-native log-ios             # View iOS logs
```

## Next Steps

1. ✅ Install `expo-dev-client`
2. ✅ Add to `app.json` plugins
3. ✅ Choose local or cloud build
4. ✅ Build and install
5. ✅ Start developing!

For more details, see `DEVELOPMENT_BUILDS.md`.
