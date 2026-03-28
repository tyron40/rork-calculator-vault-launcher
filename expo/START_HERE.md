# 🚀 START HERE - Calculator Vault Launcher

## ⚠️ IMPORTANT: This App Requires Development Builds

**Expo Go CANNOT run this app** because it uses custom native Android code.

## Quick Start (Choose One)

### Option 1: Local Build (5 minutes)
```bash
npx expo install expo-dev-client
npx expo prebuild --platform android
npx expo run:android
```

### Option 2: Cloud Build (10-20 minutes)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
# Download APK and install on device
npx expo start --dev-client
```

## What This App Does

A **calculator-disguised vault** that acts as a **custom Android launcher**:

✅ **Calculator Interface** - Fully functional calculator as your home screen  
✅ **PIN Unlock** - Type secret PIN on calculator to access vault  
✅ **Custom Launcher** - Replaces Android home screen  
✅ **Hide Apps** - Selected apps don't appear in launcher  
✅ **Vault Access** - Hidden apps only visible after unlock  
✅ **Biometric Auth** - Optional Face/Touch ID  
✅ **Encrypted Storage** - AES-256-GCM encryption  

## Why Development Builds?

This app includes:
- **Custom native Android module** (`AppManager`) to list and launch apps
- **Custom launcher intent filters** in AndroidManifest.xml
- **Package query permissions** for Android 11+

These features require native code that Expo Go doesn't include.

## Platform Support

| Feature | Android | iOS | Web |
|---------|---------|-----|-----|
| Calculator | ✅ | ✅ | ✅ |
| PIN Vault | ✅ | ✅ | ✅ |
| Custom Launcher | ✅ | ❌ | ❌ |
| Hide Apps | ✅ | ❌ | ❌ |
| Launch Apps | ✅ | ❌ | ❌ |
| Biometric Auth | ✅ | ✅ | ❌ |

**Note**: iOS and Web use mock app data for testing UI/UX. Full functionality requires Android.

## Setup Steps

### 1. Install expo-dev-client

```bash
npx expo install expo-dev-client
```

### 2. Add to app.json

Edit `app.json` and add `"expo-dev-client"` to plugins:

```json
{
  "expo": {
    "plugins": [
      "expo-dev-client",
      ["expo-router", { "origin": "https://rork.com/" }],
      ["expo-secure-store", { ... }]
    ]
  }
}
```

### 3. Build and Run

**Local build:**
```bash
npx expo prebuild --platform android
npx expo run:android
```

**Cloud build:**
```bash
eas build --profile development --platform android
```

### 4. Set as Default Launcher (Android)

1. Press **Home** button
2. Select **"Calculator Vault Launcher"**
3. Choose **"Always"**

Now your home screen is the calculator!

## Development Workflow

Once you have a development build installed:

```bash
# Start dev server
npx expo start --dev-client

# Make changes to code
# Fast Refresh updates instantly (just like Expo Go)
```

**Rebuild only when:**
- Changing native code (Java/Kotlin)
- Modifying AndroidManifest.xml
- Adding/removing native dependencies

## Testing the App

### Calculator Mode (Locked)
- Home screen shows calculator
- Calculator works normally
- No apps visible

### Unlock Sequence
1. Type PIN on calculator (default: `2580`)
2. Press `=`
3. Vault opens with tabs

### Vault Mode (Unlocked)
- **Hidden Apps** - Apps you've hidden from launcher
- **All Apps** - All installed apps, toggle to hide/unhide
- **Settings** - Configure PIN, biometric, auto-lock

### Hide an App
1. Unlock vault
2. Go to **All Apps** tab
3. Tap app to toggle hidden status
4. Lock vault
5. App no longer appears in launcher

### Launch Hidden App
1. Unlock vault
2. Go to **Hidden Apps** tab
3. Tap app icon to launch

## Project Structure

```
app/
├── index.tsx              # Calculator screen (locked state)
├── vault.tsx              # Vault tabs (unlocked state)
├── setup.tsx              # Initial PIN setup
└── onboarding.tsx         # Launcher setup guide

components/
├── CalculatorPad.tsx      # Calculator UI
├── AppGrid.tsx            # App grid display
├── AppTile.tsx            # Individual app tile
└── SearchBar.tsx          # Search functionality

services/
├── apps.ts                # Native module interface
├── crypto.ts              # Encryption helpers
└── storage.ts             # Encrypted storage

store/
└── vaultStore.ts          # Zustand state management
```

## Key Files

- **`services/apps.ts`** - Interface to native `AppManager` module
- **`store/vaultStore.ts`** - App state (locked/unlocked, hidden apps)
- **`services/crypto.ts`** - AES-256-GCM encryption
- **`app/index.tsx`** - Calculator interface with PIN unlock

## Native Module

The `AppManager` native module provides:

```typescript
interface AppManager {
  getInstalledApps(): Promise<InstalledApp[]>;
  launchApp(packageName: string): Promise<void>;
  openLauncherSettings(): Promise<void>;
}
```

Implementation: `android/app/src/main/java/com/calculatorvaultlauncher/AppManagerModule.java`

## Configuration

Default settings (can be changed in app):
- **Default PIN**: `2580`
- **Auto-lock**: 3 minutes
- **Biometric**: Optional
- **Decoy PIN**: Optional (shows empty vault)

## Troubleshooting

### "Native module not found"
```bash
npx expo prebuild --clean
npx expo run:android
```

### "Can't connect to dev server"
```bash
npx expo start --dev-client --tunnel
```

### "Build failed"
- Ensure Android Studio is installed
- Check Android SDK is configured
- Try: `cd android && ./gradlew clean`

### "App crashes on launch"
```bash
npx react-native log-android  # View crash logs
```

## Documentation

- **[DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)** - Quick setup guide
- **[DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)** - Complete development builds guide
- **[NATIVE_MODULE.md](./NATIVE_MODULE.md)** - Native module implementation
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Architecture overview
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues

## Security Notes

- **Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Storage**: Android Keystore for key management
- **Biometric**: Uses expo-local-authentication
- **No blocking**: Apps are hidden, not blocked (still accessible via other means)

## Limitations

### Android
- Requires Android 11+ for full app listing
- `QUERY_ALL_PACKAGES` permission needed
- Not suitable for Google Play without justification

### iOS
- Cannot act as launcher (iOS restriction)
- Cannot list installed apps (iOS restriction)
- Cannot launch other apps (iOS restriction)
- UI/UX testing only with mock data

### Web
- Mock data only
- No native features
- UI/UX testing only

## Distribution

### Internal Testing (APK)
```bash
eas build --profile preview --platform android
```

### Production (Google Play)
```bash
eas build --profile production --platform android
eas submit --platform android
```

**Note**: Google Play requires justification for `QUERY_ALL_PACKAGES` permission.

## Next Steps

1. ✅ Read this file
2. ⬜ Install `expo-dev-client`
3. ⬜ Add to `app.json` plugins
4. ⬜ Run `npx expo prebuild --platform android`
5. ⬜ Run `npx expo run:android`
6. ⬜ Set as default launcher
7. ⬜ Test calculator and vault
8. ⬜ Start developing!

## Support

- **Development Builds**: See [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)
- **Native Module**: See [NATIVE_MODULE.md](./NATIVE_MODULE.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Expo Docs**: https://docs.expo.dev/develop/development-builds/

---

**Ready to start?** Run:
```bash
npx expo prebuild --platform android && npx expo run:android
```
