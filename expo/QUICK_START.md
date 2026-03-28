# Quick Start Guide

Get your Calculator Vault Launcher up and running in minutes!

## 🚀 Installation (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Prebuild for Android
npx expo prebuild --platform android

# 3. Implement native module (see NATIVE_MODULE.md)
# Copy the Kotlin files to android/app/src/main/java/...

# 4. Build APK
cd android
./gradlew assembleRelease

# 5. Install on device
adb install app/build/outputs/apk/release/app-release.apk
```

## 📱 First Use (2 minutes)

1. **Open app** → Calculator appears
2. **Create PIN** → Enter 4-8 digits, confirm
3. **Complete onboarding** → Read instructions
4. **Set as launcher**:
   - Press Home button
   - Select "Calculator Vault Launcher"
   - Choose "Always"

## 🔓 Daily Use

### Unlock Vault
1. Type your PIN (e.g., `2580`)
2. Press `=`
3. Vault opens!

### Hide Apps
1. Unlock vault
2. Go to "All Apps" tab
3. Long press any app
4. Select "Hide"

### Lock Vault
- Tap lock icon (top right)
- Or just press Home button

## 🎯 Key Features

| Feature | How to Use |
|---------|-----------|
| **Calculator** | Works like normal calculator |
| **Unlock** | Type PIN + press = |
| **Hide Apps** | Long press in All Apps tab |
| **Search** | Use search bar in vault |
| **Lock** | Tap lock icon or go home |

## 📋 Checklist

- [ ] Dependencies installed
- [ ] Native module implemented
- [ ] APK built successfully
- [ ] Installed on device
- [ ] Set as default launcher
- [ ] PIN created
- [ ] Apps hidden
- [ ] Unlock tested
- [ ] Lock tested

## ⚡ Commands

```bash
# Development
npm run android

# Build release
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease

# Install APK
adb install app/build/outputs/apk/release/app-release.apk

# View logs
adb logcat | grep -E "Calculator|Vault|AppManager"

# Clean build
cd android && ./gradlew clean
```

## 🐛 Common Issues

### "Native module not found"
```bash
npx expo prebuild --platform android
# Then add native module files
cd android && ./gradlew assembleRelease
```

### "Apps not loading"
- Check native module is implemented
- View logs: `adb logcat | grep AppManager`
- Verify AndroidManifest.xml has QUERY_ALL_PACKAGES

### "Can't set as launcher"
- Check AndroidManifest.xml has HOME intent filter
- Rebuild APK after manifest changes

## 📚 Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **NATIVE_MODULE.md** - Native module implementation
- **APP_CONFIG.md** - Configuration reference

## 🎨 Customization

### Change Colors
Edit in component files:
- Calculator: `#1a1d29`, `#6366f1`, `#8b5cf6`
- Vault: `#2d3142`, `#8b5cf6`

### Change PIN Length
Edit `app/setup.tsx`:
```typescript
if (pin.length < 4) { // Change minimum
```

### Change Auto-Lock Time
Edit in vault store (when implemented)

## 🔐 Security Tips

1. **Use strong PIN** - 6+ digits recommended
2. **Don't share PIN** - No recovery option
3. **Test thoroughly** - Before hiding important apps
4. **Know how to switch back** - Settings → Apps → Default apps

## 📞 Need Help?

1. Check error logs: `adb logcat`
2. Review SETUP_GUIDE.md
3. Verify native module implementation
4. Check AndroidManifest.xml

## ✅ Success Criteria

Your app is working if:
- ✅ Calculator functions work
- ✅ PIN unlock opens vault
- ✅ Apps list loads with icons
- ✅ Apps launch when tapped
- ✅ Long press hides/unhides apps
- ✅ Search filters apps
- ✅ Lock button works
- ✅ Can set as default launcher

## 🎉 You're Done!

Your Calculator Vault Launcher is ready to use. Enjoy your privacy!

---

**Pro Tip**: Test with non-critical apps first to ensure everything works as expected.
