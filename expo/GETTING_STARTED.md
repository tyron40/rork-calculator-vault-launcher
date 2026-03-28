# Getting Started with Development Builds

## 🎯 Goal

Get your Calculator Vault Launcher app running on an Android device with full launcher functionality.

## ⚠️ Important

**This app CANNOT run in Expo Go** because it uses custom native Android code for launcher functionality.

You MUST use **Development Builds**.

## 🚀 Two Ways to Build

### Method 1: Local Build (Fastest)
- ⏱️ **Time**: 5 minutes (after Android Studio setup)
- 💰 **Cost**: Free
- 📦 **Requires**: Android Studio installed
- 🎯 **Best for**: Daily development, rapid iteration

### Method 2: Cloud Build (Easiest)
- ⏱️ **Time**: 15-20 minutes
- 💰 **Cost**: Free (30 builds/month)
- 📦 **Requires**: Just internet connection
- 🎯 **Best for**: Beginners, teams, no local setup

---

## 📋 Prerequisites

### For Local Builds
- [ ] Android Studio installed
- [ ] Android SDK configured
- [ ] Android device or emulator

### For Cloud Builds
- [ ] Expo account (free at expo.dev)
- [ ] Android device to install APK

### For Both
- [ ] Node.js installed
- [ ] This project cloned/downloaded
- [ ] Dependencies installed (`npm install` or `bun install`)

---

## 🏃 Quick Start: Local Build

### Step 1: Install expo-dev-client
```bash
npx expo install expo-dev-client
```

### Step 2: Update app.json
Add `"expo-dev-client"` to the plugins array:

```json
{
  "expo": {
    "plugins": [
      "expo-dev-client",
      ["expo-router", { ... }],
      ["expo-secure-store", { ... }]
    ]
  }
}
```

### Step 3: Prebuild Native Project
```bash
npx expo prebuild --platform android
```

This generates the `android/` folder with native code.

### Step 4: Build and Run
```bash
npx expo run:android
```

This will:
- Compile native Android code
- Install app on connected device/emulator
- Start Metro bundler
- Launch app

### Step 5: Test Launcher
1. Press **Home** button on device
2. Select **"Calculator Vault Launcher"**
3. Choose **"Always"**
4. Your home screen is now the calculator!

### Step 6: Develop
- Make changes to your code
- Fast Refresh updates instantly
- No rebuild needed for JS/TS changes

---

## 🏃 Quick Start: Cloud Build

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Install expo-dev-client
```bash
npx expo install expo-dev-client
```

### Step 4: Update app.json
Add `"expo-dev-client"` to the plugins array:

```json
{
  "expo": {
    "plugins": [
      "expo-dev-client",
      ["expo-router", { ... }],
      ["expo-secure-store", { ... }]
    ]
  }
}
```

### Step 5: Configure EAS
```bash
eas build:configure
```

### Step 6: Build Development Client
```bash
eas build --profile development --platform android
```

Wait 10-20 minutes for build to complete.

### Step 7: Install APK
1. Download APK from EAS build page
2. Transfer to Android device
3. Enable "Install from unknown sources"
4. Install APK

### Step 8: Start Dev Server
```bash
npx expo start --dev-client
```

### Step 9: Connect Device
1. Open development build app on device
2. Scan QR code from terminal
3. App loads and connects

### Step 10: Test Launcher
1. Press **Home** button
2. Select **"Calculator Vault Launcher"**
3. Choose **"Always"**
4. Test full functionality

### Step 11: Develop
- Make changes to your code
- Fast Refresh updates instantly
- Rebuild only when changing native code

---

## 🎮 Testing the App

### 1. Calculator Mode (Locked)
- Home screen shows calculator
- Calculator works normally
- Type: `2580=` to unlock (default PIN)

### 2. Vault Mode (Unlocked)
- **Hidden Apps** tab: Apps you've hidden
- **All Apps** tab: All installed apps
- **Settings** tab: Configure PIN, biometric, etc.

### 3. Hide an App
1. Unlock vault (`2580=`)
2. Go to **All Apps** tab
3. Tap app to toggle hidden
4. Lock vault
5. App disappears from launcher

### 4. Launch Hidden App
1. Unlock vault
2. Go to **Hidden Apps** tab
3. Tap app icon to launch

---

## 🔄 Development Workflow

### Daily Development

```bash
# Start dev server
npx expo start --dev-client

# Make changes to code
# Fast Refresh updates instantly
```

### When to Rebuild

**Rebuild required for:**
- Native code changes (Java/Kotlin)
- AndroidManifest.xml changes
- Adding/removing native dependencies
- Native plugin configuration

**No rebuild needed for:**
- JavaScript/TypeScript changes
- React components
- Styles
- Assets

**Rebuild command:**
```bash
# Local
npx expo run:android

# Cloud
eas build --profile development --platform android
```

---

## 🐛 Troubleshooting

### "expo-dev-client not found"
```bash
npx expo install expo-dev-client
```

### "Android SDK not found"
```bash
# Set environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### "No devices found"
```bash
# Check connected devices
adb devices

# Restart ADB
adb kill-server && adb start-server
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

### "App crashes on launch"
```bash
# View logs
npx react-native log-android
```

---

## 📚 Next Steps

### Learn More
- **[DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)** - Detailed quick start
- **[DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)** - Complete guide
- **[BUILD_OPTIONS.md](./BUILD_OPTIONS.md)** - Compare build methods
- **[EAS_SETUP.md](./EAS_SETUP.md)** - EAS configuration

### Customize Your App
- Change default PIN in `store/vaultStore.ts`
- Modify calculator UI in `components/CalculatorPad.tsx`
- Customize vault screens in `app/vault.tsx`
- Add biometric authentication in settings

### Deploy to Production
```bash
# Build production APK
eas build --profile production --platform android

# Submit to Google Play
eas submit --platform android
```

---

## ✅ Checklist

### Setup
- [ ] expo-dev-client installed
- [ ] app.json updated with plugin
- [ ] Build method chosen (local or cloud)

### Local Build
- [ ] Android Studio installed
- [ ] Android SDK configured
- [ ] Device/emulator connected
- [ ] `npx expo prebuild` completed
- [ ] `npx expo run:android` successful

### Cloud Build
- [ ] EAS CLI installed
- [ ] Logged into Expo account
- [ ] `eas build:configure` completed
- [ ] Development build created
- [ ] APK downloaded and installed

### Testing
- [ ] App launches successfully
- [ ] Calculator works
- [ ] PIN unlock works (`2580=`)
- [ ] Vault opens with tabs
- [ ] Can hide/unhide apps
- [ ] Can launch hidden apps
- [ ] Set as default launcher
- [ ] Home button shows calculator

### Development
- [ ] Dev server starts
- [ ] Device connects to server
- [ ] Fast Refresh works
- [ ] Can make code changes
- [ ] Changes update instantly

---

## 🎉 Success!

You now have a fully functional development build of the Calculator Vault Launcher!

**What you can do:**
- ✅ Use as custom Android launcher
- ✅ Hide apps from home screen
- ✅ Access hidden apps via PIN unlock
- ✅ Develop with Fast Refresh
- ✅ Test full native functionality

**Next:**
- Customize the app
- Add features
- Test with real usage
- Deploy to production

---

## 💡 Tips

### Speed Up Development
- Use local builds for fastest iteration
- Keep dev server running
- Use Fast Refresh for instant updates
- Only rebuild when changing native code

### Team Collaboration
- Use EAS builds for consistent environment
- Share APK links with team
- Use Git for code collaboration
- Document custom changes

### Production Readiness
- Test thoroughly as launcher
- Test with many apps hidden
- Test PIN unlock edge cases
- Test biometric authentication
- Test auto-lock functionality

---

## 🆘 Need Help?

### Documentation
- [START_HERE.md](./START_HERE.md) - Overview
- [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md) - Quick start
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Architecture

### External Resources
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

**Ready to build?**

**Local:**
```bash
npx expo prebuild --platform android && npx expo run:android
```

**Cloud:**
```bash
eas build --profile development --platform android
```

**Let's go! 🚀**
