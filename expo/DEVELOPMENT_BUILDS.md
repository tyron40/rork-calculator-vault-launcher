# Development Builds Guide

## What are Development Builds?

Development builds are custom versions of your app that include:
- **Custom native code** (like the Android launcher module in this app)
- **All Expo SDK features** that work in Expo Go
- **Full debugging capabilities** with React DevTools
- **Fast Refresh** for instant code updates

Unlike Expo Go, development builds include YOUR custom native modules, making them essential for this Calculator Vault Launcher app.

## Why You Need Development Builds for This App

This app requires development builds because:
1. **Custom Android Launcher Module** - The native `AppManager` module that lists and launches apps
2. **Launcher Intent Filters** - Custom Android manifest configuration to act as a home screen replacement
3. **Package Query Permissions** - Android 11+ requires special permissions to list installed apps

**Expo Go cannot run this app's full functionality** because it doesn't include your custom native code.

## Setup Instructions

### 1. Install expo-dev-client

The package has already been installed:
```bash
✅ expo-dev-client installed
```

### 2. Add Plugin to app.json

Add `"expo-dev-client"` to the plugins array in `app.json`:

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

### 3. Add Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start:dev-client": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean"
  }
}
```

## Local Development Build (Recommended for Testing)

### For Android

1. **Prebuild the native project** (generates android/ folder with native code):
   ```bash
   npx expo prebuild --platform android
   ```

2. **Run on connected device or emulator**:
   ```bash
   npx expo run:android
   ```
   
   This will:
   - Build the native Android app with your custom launcher module
   - Install it on your device/emulator
   - Start the Metro bundler
   - Launch the app in development mode

3. **Start developing**:
   - Make changes to your React Native code
   - Fast Refresh will update instantly
   - Native changes require rebuilding: `npx expo run:android`

### For iOS

1. **Prebuild the native project**:
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Run on simulator or device**:
   ```bash
   npx expo run:ios
   ```

**Note**: iOS doesn't support custom launchers, so the launcher functionality will use mock data.

## Cloud Development Build with EAS

For team collaboration or if you don't have Android Studio/Xcode:

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS

```bash
eas build:configure
```

This creates `eas.json` with build profiles.

### 4. Build Development Client

**For Android:**
```bash
eas build --profile development --platform android
```

**For iOS:**
```bash
eas build --profile development --platform ios
```

### 5. Install on Device

After the build completes:
- **Android**: Download the APK and install it
- **iOS**: Install via TestFlight or direct download (requires Apple Developer account)

### 6. Start Development Server

```bash
npx expo start --dev-client
```

Then scan the QR code with your development build app.

## Development Workflow

### Daily Development

1. **Start the dev server**:
   ```bash
   npx expo start --dev-client
   ```

2. **Open your development build app** on your device

3. **Scan the QR code** or enter the URL manually

4. **Develop normally** - Fast Refresh works just like Expo Go

### When to Rebuild

You need to rebuild the native app when you:
- Change native code (Java/Kotlin for Android, Swift/Objective-C for iOS)
- Modify `AndroidManifest.xml` or `Info.plist`
- Add/remove native dependencies
- Change app.json configuration that affects native code

For JavaScript/TypeScript changes, Fast Refresh handles updates automatically.

## Testing Launcher Functionality

### On Android

1. **Build and install** the development build
2. **Set as default launcher**:
   - Press Home button
   - Select "Calculator Vault Launcher"
   - Choose "Always"
3. **Test the full launcher experience**:
   - Calculator interface as home screen
   - PIN unlock to access vault
   - Hide/unhide apps
   - Launch hidden apps from vault

### On iOS

iOS doesn't support custom launchers, so the app will:
- Show mock app data
- Simulate app launching (logs to console)
- Still test the vault, PIN, and UI functionality

## Debugging

### React DevTools

Development builds include full debugging support:

```bash
npx expo start --dev-client
# Press 'j' to open debugger
```

### Native Logs

**Android:**
```bash
npx react-native log-android
```

**iOS:**
```bash
npx react-native log-ios
```

### Common Issues

**"Couldn't connect to development server"**
- Ensure your device and computer are on the same network
- Try tunnel mode: `npx expo start --dev-client --tunnel`

**"Native module not found"**
- Rebuild the app: `npx expo run:android` or `npx expo run:ios`
- Clean build: `npx expo prebuild --clean`

**"App crashes on launch"**
- Check native logs for errors
- Verify AndroidManifest.xml is correctly configured
- Ensure all native dependencies are properly linked

## Production Builds

When ready to distribute:

### Internal Testing (APK)

```bash
eas build --profile preview --platform android
```

### App Store / Google Play

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

Then submit:
```bash
eas submit --platform android
eas submit --platform ios
```

## Key Differences: Expo Go vs Development Build

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Custom native modules | ❌ No | ✅ Yes |
| Launcher functionality | ❌ No | ✅ Yes (Android) |
| List installed apps | ❌ No | ✅ Yes (Android) |
| Fast Refresh | ✅ Yes | ✅ Yes |
| Easy to install | ✅ Yes | ⚠️ Requires build |
| Debugging | ✅ Yes | ✅ Yes |
| Production-ready | ❌ No | ✅ Yes |

## Next Steps

1. **Add `expo-dev-client` to plugins** in `app.json`
2. **Run `npx expo prebuild`** to generate native projects
3. **Run `npx expo run:android`** to build and test on Android
4. **Set as default launcher** and test the full experience
5. **Iterate** - make changes and use Fast Refresh for instant updates

## Resources

- [Expo Development Builds Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Custom Native Code Guide](https://docs.expo.dev/workflow/customizing/)
- [Android Launcher Development](https://developer.android.com/guide/components/activities/recents)

## Support

For issues specific to this app:
- Check `TROUBLESHOOTING.md` for common problems
- Review `NATIVE_MODULE.md` for native module setup
- See `PROJECT_SUMMARY.md` for architecture overview
