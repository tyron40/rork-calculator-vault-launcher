# Troubleshooting Guide

Common issues and solutions for Calculator Vault Launcher.

## 🔧 Build Issues

### "Native module 'AppManager' not found"

**Cause**: Native module not implemented or not registered

**Solution**:
```bash
# 1. Ensure you ran prebuild
npx expo prebuild --platform android

# 2. Verify native module files exist:
# - android/app/src/main/java/.../AppManagerModule.kt
# - android/app/src/main/java/.../AppManagerPackage.kt

# 3. Check MainApplication.kt includes:
packages.add(AppManagerPackage())

# 4. Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### "Package name mismatch"

**Cause**: Inconsistent package names across files

**Solution**:
Ensure package name matches in:
- `app.json`: `"package": "app.rork.calculatorvaultlauncher"`
- `AndroidManifest.xml`: `package="app.rork.calculatorvaultlauncher"`
- Native module files: `package app.rork.calculatorvaultlauncher`

### "Build failed with Kotlin errors"

**Cause**: Kotlin syntax errors or missing dependencies

**Solution**:
```bash
# Check android/build.gradle has Kotlin plugin
# Verify Kotlin version compatibility
# Review error logs for specific issues
cd android
./gradlew assembleRelease --stacktrace
```

## 📱 Runtime Issues

### Apps list is empty or shows mock data

**Cause**: Native module not working or permissions missing

**Solution**:
```bash
# 1. Check logs
adb logcat | grep AppManager

# 2. Verify AndroidManifest.xml has:
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

# 3. Check queries section:
<queries>
    <intent>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent>
</queries>

# 4. Reinstall app
adb uninstall app.rork.calculatorvaultlauncher
adb install app/build/outputs/apk/release/app-release.apk
```

### Apps won't launch

**Cause**: Incorrect package names or launch intent issues

**Solution**:
```bash
# 1. Check logs for errors
adb logcat | grep -E "AppManager|Launch"

# 2. Test with known package
# Try launching Chrome: com.android.chrome

# 3. Verify launchApp method in AppManagerModule.kt
# Ensure FLAG_ACTIVITY_NEW_TASK is set
```

### PIN unlock doesn't work

**Cause**: PIN not saved or verification failing

**Solution**:
```bash
# 1. Check logs
adb logcat | grep -E "Storage|Crypto|Calculator"

# 2. Clear app data and try again
adb shell pm clear app.rork.calculatorvaultlauncher

# 3. Verify expo-secure-store is working
# Check if other storage operations work

# 4. Test with simple PIN (e.g., 1234)
```

### App crashes on launch

**Cause**: Various initialization issues

**Solution**:
```bash
# 1. View crash logs
adb logcat | grep -E "AndroidRuntime|FATAL"

# 2. Check for missing dependencies
npm install

# 3. Rebuild from scratch
rm -rf android ios
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease

# 4. Check for JavaScript errors
adb logcat | grep -E "ReactNativeJS|ExceptionsManager"
```

## 🏠 Launcher Issues

### Can't set as default launcher

**Cause**: Missing HOME intent filter in manifest

**Solution**:
Verify AndroidManifest.xml has:
```xml
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.HOME" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```

Rebuild after changes:
```bash
cd android && ./gradlew assembleRelease
```

### Launcher settings won't open

**Cause**: Intent not working or permission issue

**Solution**:
```bash
# 1. Check logs
adb logcat | grep Settings

# 2. Test manually
adb shell am start -a android.settings.HOME_SETTINGS

# 3. Verify openLauncherSettings method in native module
```

### Home button doesn't show launcher

**Cause**: Not set as default or launcher crashed

**Solution**:
```bash
# 1. Clear default launcher
adb shell pm clear-default-launcher

# 2. Press home button and select app again

# 3. Check if app is running
adb shell ps | grep calculator

# 4. Reinstall if needed
```

## 🔐 Security Issues

### Encryption/decryption fails

**Cause**: Key derivation or crypto issues

**Solution**:
```bash
# 1. Check logs
adb logcat | grep Crypto

# 2. Verify expo-crypto is installed
npm list expo-crypto

# 3. Check for Buffer polyfill issues
# Ensure react-native-get-random-values is imported

# 4. Test with simple data
# Add console.logs in crypto.ts
```

### Secure storage not working

**Cause**: expo-secure-store issues or permissions

**Solution**:
```bash
# 1. Check logs
adb logcat | grep SecureStore

# 2. Verify installation
npm list expo-secure-store

# 3. Test on different device
# Some emulators have issues with secure storage

# 4. Use AsyncStorage as fallback for testing
```

## 🎨 UI Issues

### Calculator buttons not responding

**Cause**: Touch event issues or styling problems

**Solution**:
```bash
# 1. Check logs for touch events
adb logcat | grep -E "Touch|Gesture"

# 2. Verify TouchableOpacity is used
# Check CalculatorPad.tsx

# 3. Test on different device
# Some devices have touch sensitivity issues

# 4. Check for overlapping views
```

### Vault screen is blank

**Cause**: State not loading or rendering issue

**Solution**:
```bash
# 1. Check logs
adb logcat | grep -E "Vault|Store"

# 2. Verify zustand store is working
# Add console.logs in vaultStore.ts

# 3. Check if installedApps is populated
# Log in vault.tsx useEffect

# 4. Test navigation
# Ensure router.push('/vault') works
```

### Icons not showing

**Cause**: Base64 encoding issues or image loading

**Solution**:
```bash
# 1. Check logs
adb logcat | grep -E "Image|Icon"

# 2. Verify getIconBase64 in native module
# Test with simple app icon

# 3. Check Image component
# Ensure uri format is correct: data:image/png;base64,...

# 4. Use placeholder icon as fallback
```

## 🔍 Debugging Tips

### Enable verbose logging

Add to your code:
```typescript
// In services/apps.ts
console.log('[Apps] Detailed info:', JSON.stringify(data, null, 2));

// In services/storage.ts
console.log('[Storage] Operation:', operation, 'Data:', data);

// In components
console.log('[Component] State:', state);
```

### View all logs
```bash
# All app logs
adb logcat | grep -E "Calculator|Vault|AppManager|Storage|Crypto"

# React Native logs only
adb logcat | grep ReactNativeJS

# Native module logs
adb logcat | grep AppManager

# Errors only
adb logcat *:E
```

### Test native module directly
```bash
# Open React Native debugger
# In console:
import { NativeModules } from 'react-native';
NativeModules.AppManager.getInstalledApps()
  .then(apps => console.log('Apps:', apps))
  .catch(err => console.error('Error:', err));
```

### Check app state
```bash
# Is app running?
adb shell ps | grep calculator

# App info
adb shell dumpsys package app.rork.calculatorvaultlauncher

# Clear app data
adb shell pm clear app.rork.calculatorvaultlauncher
```

## 🚨 Emergency Fixes

### Can't unlock vault (forgot PIN)

**Solution**:
```bash
# Clear app data (WARNING: Loses all hidden app data)
adb shell pm clear app.rork.calculatorvaultlauncher

# Or uninstall and reinstall
adb uninstall app.rork.calculatorvaultlauncher
adb install app/build/outputs/apk/release/app-release.apk
```

### Stuck in launcher mode

**Solution**:
```bash
# Method 1: Use ADB
adb shell am start -a android.settings.HOME_SETTINGS

# Method 2: Safe mode
# Restart device in safe mode
# Change launcher in Settings

# Method 3: Uninstall
adb uninstall app.rork.calculatorvaultlauncher
```

### App won't start

**Solution**:
```bash
# 1. Clear cache
adb shell pm clear app.rork.calculatorvaultlauncher

# 2. Force stop
adb shell am force-stop app.rork.calculatorvaultlauncher

# 3. Reinstall
adb uninstall app.rork.calculatorvaultlauncher
adb install app/build/outputs/apk/release/app-release.apk

# 4. Check device storage
adb shell df
```

## 📞 Getting Help

### Before asking for help:

1. **Check logs**: `adb logcat`
2. **Review documentation**: SETUP_GUIDE.md, NATIVE_MODULE.md
3. **Verify setup**: Native module, manifest, package names
4. **Test on different device**: Rule out device-specific issues
5. **Try clean build**: Delete android folder, rebuild

### Information to provide:

- Error logs (from adb logcat)
- Build output (if build fails)
- Device/emulator info
- Steps to reproduce
- What you've already tried

### Useful commands:

```bash
# Full system info
adb shell getprop

# App info
adb shell dumpsys package app.rork.calculatorvaultlauncher

# Device logs
adb bugreport

# Screen recording (for UI issues)
adb shell screenrecord /sdcard/issue.mp4
```

## ✅ Verification Checklist

Use this to verify everything is working:

- [ ] App installs without errors
- [ ] Calculator UI appears on launch
- [ ] Can create PIN
- [ ] PIN unlock works
- [ ] Apps list loads (not mock data)
- [ ] App icons appear
- [ ] Apps launch when tapped
- [ ] Can hide/unhide apps
- [ ] Search filters apps
- [ ] Lock button works
- [ ] Can set as default launcher
- [ ] Launcher settings open
- [ ] No errors in logs

## 🎯 Performance Issues

### App is slow

**Solution**:
```bash
# 1. Enable Hermes (should be default)
# Check android/app/build.gradle

# 2. Reduce console.logs in production

# 3. Optimize images
# Use smaller icon sizes

# 4. Profile performance
adb shell am start -n app.rork.calculatorvaultlauncher/.MainActivity --enable-profiling
```

### High memory usage

**Solution**:
```bash
# 1. Check memory usage
adb shell dumpsys meminfo app.rork.calculatorvaultlauncher

# 2. Reduce cached data
# Clear old app icons from memory

# 3. Optimize state management
# Don't store unnecessary data in zustand
```

---

**Still having issues?** Check PROJECT_SUMMARY.md for architecture overview or SETUP_GUIDE.md for detailed setup instructions.
