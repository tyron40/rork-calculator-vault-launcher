# Calculator Vault Launcher - Setup Guide

## 🎯 Overview

This guide will help you set up the Calculator Vault Launcher app, which disguises itself as a calculator while functioning as a custom Android launcher with hidden app management.

## 📋 Prerequisites

- Node.js 18+ and npm/bun
- Android device or emulator (Android 11+)
- Expo CLI
- Basic knowledge of React Native/Expo

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Set Up Native Android Module

The app requires a custom native module for app management. You'll need to:

1. Run `npx expo prebuild --platform android` to generate native code
2. Implement the native module (see Native Module Setup section below)
3. Build the APK

### 3. Development Testing

```bash
# Run on Android device/emulator
npm run android
```

## 🔧 Native Module Setup

### Required Files

Create these files in your Android project after running `expo prebuild`:

#### 1. AppManagerModule.kt
Location: `android/app/src/main/java/app/rork/calculatorvaultlauncher/AppManagerModule.kt`

This module provides:
- `getInstalledApps()` - Lists all launchable apps with icons
- `launchApp(packageName)` - Launches an app
- `openLauncherSettings()` - Opens system launcher settings

#### 2. AppManagerPackage.kt
Location: `android/app/src/main/java/app/rork/calculatorvaultlauncher/AppManagerPackage.kt`

Registers the native module with React Native.

#### 3. Update MainApplication.kt
Add the custom package to the packages list.

#### 4. Update AndroidManifest.xml
Add launcher intent filters and permissions:

```xml
<queries>
    <intent>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent>
</queries>

<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTask">
    
    <!-- Launcher intent -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.HOME" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
    
    <!-- App icon -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

## 📦 Building Release APK

### Step 1: Prebuild
```bash
npx expo prebuild --platform android
```

### Step 2: Build Release APK
```bash
cd android
./gradlew assembleRelease
```

### Step 3: Locate APK
```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Install on Device
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## 🎮 Using the App

### First Launch

1. **Create PIN**: Enter a 4-8 digit PIN and confirm it
2. **Onboarding**: Read the instructions on how to set as default launcher
3. **Set as Launcher**: 
   - Press Home button
   - Select "Calculator Vault Launcher"
   - Choose "Always"

### Daily Use

**Locked State (Default)**
- Calculator is displayed
- No apps visible
- Looks like a normal calculator

**Unlocking**
1. Type your PIN (e.g., `2580`)
2. Press `=` button
3. Vault opens

**Managing Hidden Apps**
1. Unlock vault
2. Go to "All Apps" tab
3. Long press any app to hide/unhide it
4. Hidden apps appear in "Hidden Apps" tab

**Locking**
- Tap lock icon in vault header
- App auto-locks when backgrounded

## 🔐 Security Features

### Encryption
- AES-256 equivalent encryption
- PIN-based key derivation
- Secure storage via Android Keystore

### PIN Protection
- Minimum 4 digits
- SHA-256 hashed
- No recovery option (by design)

### Auto-Lock
- Locks on background
- 3-minute idle timeout (configurable)

## ⚠️ Important Notes

### What It Does
✅ Hides apps from launcher grid/search  
✅ PIN-protected access  
✅ Encrypted storage  

### What It Doesn't Do
❌ System-level app blocking  
❌ Hide from Settings  
❌ Work on other launchers  

### Switching Back
1. Settings → Apps → Default apps → Home app
2. Select original launcher
3. Or uninstall the app

## 🐛 Troubleshooting

### Native Module Not Found
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### Apps Not Launching
- Check package names are correct
- View logs: `adb logcat | grep AppManager`

### Permission Issues
- Ensure QUERY_ALL_PACKAGES is in manifest
- For Play Store, justification required

### Build Errors
- Delete `android` and `ios` folders
- Run `npx expo prebuild --platform android` again
- Rebuild

## 📱 Testing Checklist

- [ ] Calculator functions work
- [ ] PIN unlock works
- [ ] Apps list loads
- [ ] Apps launch correctly
- [ ] Hide/unhide apps works
- [ ] Search works
- [ ] Lock button works
- [ ] Auto-lock works (when implemented)
- [ ] Launcher settings open
- [ ] Can set as default launcher

## 🔄 Development Workflow

1. Make changes to TypeScript code
2. Test in development: `npm run android`
3. Build release APK when ready
4. Test release APK on device
5. Iterate

## 📞 Support

For issues:
1. Check this guide
2. Review error logs: `adb logcat`
3. Verify native module is implemented
4. Check AndroidManifest.xml

## 🎨 Customization

### Change Colors
Edit color values in components and screens:
- Calculator: `#1a1d29`, `#6366f1`, `#8b5cf6`
- Vault: `#2d3142`, `#8b5cf6`

### Change PIN Length
Edit validation in `app/setup.tsx`:
```typescript
if (pin.length < 4) { // Change minimum here
```

### Change Auto-Lock Timeout
Edit in vault store or settings (when implemented)

## 📄 File Structure

```
calculator-vault-launcher/
├── app/                    # Screens
│   ├── index.tsx          # Calculator (locked)
│   ├── setup.tsx          # PIN setup
│   ├── onboarding.tsx     # Instructions
│   └── vault.tsx          # Vault (unlocked)
├── components/            # UI components
├── services/             # Business logic
├── store/               # State management
└── android/            # Native code
```

## 🚀 Next Steps

After setup:
1. Test all features thoroughly
2. Customize as needed
3. Build release APK
4. Install and use!

---

**Need Help?** Check logs, verify native module, review manifest.
