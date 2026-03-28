# Build Options Comparison

## Overview

This app requires **development builds** because it uses custom native Android code. Here's how to choose the best build method for your needs.

## Quick Decision Tree

```
Do you have Android Studio installed?
├─ YES → Use Local Builds (fastest)
└─ NO → Use EAS Cloud Builds (easiest)

Need to share with team?
├─ YES → Use EAS Cloud Builds
└─ NO → Either works

Building for production?
├─ YES → Use EAS Cloud Builds
└─ NO → Either works
```

## Build Methods Comparison

### 1. Local Development Builds

**Command:**
```bash
npx expo prebuild --platform android
npx expo run:android
```

**Pros:**
- ✅ Fastest (2-5 minutes)
- ✅ Free unlimited builds
- ✅ Full control over build process
- ✅ Immediate feedback
- ✅ Works offline (after initial setup)
- ✅ Best for rapid iteration

**Cons:**
- ❌ Requires Android Studio (large download)
- ❌ Requires Android SDK setup
- ❌ Mac required for iOS builds
- ❌ Manual APK sharing for team
- ❌ More complex troubleshooting

**Best for:**
- Daily development
- Rapid prototyping
- Solo developers
- Experienced developers

**Setup time:** 30-60 minutes (Android Studio install)

---

### 2. EAS Cloud Development Builds

**Command:**
```bash
eas build --profile development --platform android
```

**Pros:**
- ✅ No Android Studio required
- ✅ Works on any OS (Windows/Mac/Linux)
- ✅ Automatic APK distribution
- ✅ Easy team sharing
- ✅ Consistent build environment
- ✅ CI/CD friendly
- ✅ Managed credentials

**Cons:**
- ❌ Slower (10-20 minutes per build)
- ❌ Limited free builds (30/month)
- ❌ Requires internet connection
- ❌ Queue wait times possible
- ❌ Less control over build process

**Best for:**
- Teams
- Beginners
- Cross-platform development
- Production builds
- CI/CD pipelines

**Setup time:** 5 minutes

---

### 3. Expo Go (NOT SUPPORTED)

**Why it doesn't work:**
- ❌ Cannot include custom native modules
- ❌ No AppManager module
- ❌ No launcher functionality
- ❌ No app listing/launching

**Use only for:**
- Testing UI/UX with mock data
- Web preview

---

## Detailed Comparison

| Feature | Local Build | EAS Cloud | Expo Go |
|---------|-------------|-----------|---------|
| **Setup** |
| Initial setup time | 30-60 min | 5 min | 1 min |
| Requires Android Studio | ✅ Yes | ❌ No | ❌ No |
| Requires EAS account | ❌ No | ✅ Yes | ❌ No |
| **Building** |
| Build time | 2-5 min | 10-20 min | N/A |
| Build cost | Free | 30/mo free | N/A |
| Offline builds | ✅ Yes | ❌ No | N/A |
| **Features** |
| Custom native code | ✅ Yes | ✅ Yes | ❌ No |
| Launcher functionality | ✅ Yes | ✅ Yes | ❌ No |
| Fast Refresh | ✅ Yes | ✅ Yes | ✅ Yes |
| Debugging | ✅ Yes | ✅ Yes | ✅ Yes |
| **Distribution** |
| Team sharing | Manual | Automatic | N/A |
| CI/CD integration | Manual | Built-in | N/A |
| Production ready | ✅ Yes | ✅ Yes | ❌ No |
| **Development** |
| Iteration speed | ⚡ Fast | 🐢 Slow | ⚡ Fast |
| Rebuild frequency | Low | Low | N/A |
| Learning curve | Steep | Easy | Easy |

---

## Recommended Workflow

### For Solo Developers

**Phase 1: Initial Development**
```bash
# Use local builds for rapid iteration
npx expo prebuild --platform android
npx expo run:android
```

**Phase 2: Testing**
```bash
# Use EAS for preview builds
eas build --profile preview --platform android
```

**Phase 3: Production**
```bash
# Use EAS for production builds
eas build --profile production --platform android
eas submit --platform android
```

---

### For Teams

**All phases: Use EAS**
```bash
# Development
eas build --profile development --platform android

# Preview
eas build --profile preview --platform android

# Production
eas build --profile production --platform android
```

**Benefits:**
- Consistent builds across team
- Easy APK sharing
- No local setup required
- CI/CD integration

---

## Cost Analysis

### Local Builds

**One-time costs:**
- Android Studio: Free
- Time to set up: 1-2 hours

**Ongoing costs:**
- $0/month
- Disk space: ~10GB

**Total first year:** $0

---

### EAS Cloud Builds

**Monthly costs:**
- Free tier: $0 (30 builds/month)
- Production tier: $29/month (unlimited builds)

**Typical usage:**
- Development: 2-5 builds/week = 8-20/month
- Preview: 1-2 builds/week = 4-8/month
- Production: 1-2 builds/month

**Total first year:**
- Free tier: $0 (if under 30 builds/month)
- Production tier: $348/year

---

## Build Time Breakdown

### Local Build (Total: 2-5 minutes)
1. Prebuild: 30-60 seconds (first time only)
2. Gradle build: 1-3 minutes
3. Install: 10-30 seconds
4. Launch: 5-10 seconds

### EAS Build (Total: 10-20 minutes)
1. Upload: 30-60 seconds
2. Queue: 0-5 minutes
3. Build: 8-12 minutes
4. Download: 30-60 seconds
5. Install: 10-30 seconds

---

## When to Rebuild

### Always Rebuild When:
- ✅ Changed native code (Java/Kotlin/Swift/Objective-C)
- ✅ Modified AndroidManifest.xml or Info.plist
- ✅ Added/removed native dependencies
- ✅ Changed native plugins in app.json

### Never Rebuild For:
- ❌ JavaScript/TypeScript changes
- ❌ React component updates
- ❌ Style changes
- ❌ Asset changes (images, fonts)
- ❌ Most app.json changes

**Fast Refresh handles these instantly!**

---

## Setup Instructions

### Option 1: Local Builds

**Prerequisites:**
- Android Studio installed
- Android SDK configured
- Device connected or emulator running

**Steps:**
```bash
# 1. Install expo-dev-client
npx expo install expo-dev-client

# 2. Add to app.json plugins
# Edit app.json: add "expo-dev-client" to plugins array

# 3. Prebuild native project
npx expo prebuild --platform android

# 4. Build and run
npx expo run:android

# 5. Start developing
# Make changes, Fast Refresh updates instantly
```

**Rebuild when needed:**
```bash
npx expo run:android
```

---

### Option 2: EAS Cloud Builds

**Prerequisites:**
- Expo account (free)
- Internet connection

**Steps:**
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Install expo-dev-client
npx expo install expo-dev-client

# 4. Add to app.json plugins
# Edit app.json: add "expo-dev-client" to plugins array

# 5. Configure EAS
eas build:configure

# 6. Build development client
eas build --profile development --platform android

# 7. Download and install APK on device

# 8. Start dev server
npx expo start --dev-client

# 9. Scan QR code with development build app
```

**Rebuild when needed:**
```bash
eas build --profile development --platform android
```

---

## Troubleshooting

### Local Builds

**"Android SDK not found"**
```bash
# Set environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**"Gradle build failed"**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

**"Device not found"**
```bash
adb devices  # Check connected devices
adb kill-server && adb start-server  # Restart ADB
```

---

### EAS Builds

**"Build failed"**
```bash
# View logs
eas build:view [BUILD_ID]

# Rebuild with clean cache
eas build --profile development --platform android --clear-cache
```

**"Can't connect to dev server"**
```bash
# Use tunnel mode
npx expo start --dev-client --tunnel
```

**"Out of builds"**
- Upgrade to Production tier ($29/month)
- Or wait for monthly reset
- Or use local builds

---

## Recommendations by Use Case

### Beginner Developer
**Use:** EAS Cloud Builds
**Why:** No complex setup, just works

### Experienced Developer
**Use:** Local Builds
**Why:** Faster iteration, full control

### Small Team (2-5 people)
**Use:** EAS Cloud Builds
**Why:** Easy sharing, consistent builds

### Large Team (5+ people)
**Use:** EAS Cloud Builds + CI/CD
**Why:** Automated builds, team coordination

### Freelancer/Agency
**Use:** EAS Cloud Builds
**Why:** Multiple projects, client demos

### Open Source Project
**Use:** Local Builds + EAS for releases
**Why:** Free for contributors, professional releases

---

## Migration Path

### From Expo Go to Development Builds

```bash
# 1. Install expo-dev-client
npx expo install expo-dev-client

# 2. Add to app.json
# Edit app.json: add "expo-dev-client" to plugins

# 3. Choose build method
# Local: npx expo run:android
# Cloud: eas build --profile development --platform android

# 4. Install and test
# Your app now includes custom native code!
```

### From Local to EAS

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Configure
eas build:configure

# 3. Build
eas build --profile development --platform android

# 4. Continue developing
# Same workflow, just cloud-built
```

### From EAS to Local

```bash
# 1. Install Android Studio
# Download from developer.android.com

# 2. Prebuild
npx expo prebuild --platform android

# 3. Build locally
npx expo run:android

# 4. Continue developing
# Faster builds, same features
```

---

## Summary

**Choose Local Builds if:**
- You have Android Studio
- You want fastest iteration
- You're comfortable with native development
- You're working solo

**Choose EAS Cloud Builds if:**
- You don't have Android Studio
- You're working in a team
- You want easy setup
- You need CI/CD

**Both options:**
- Support full launcher functionality
- Include custom native code
- Enable Fast Refresh
- Are production-ready

---

## Next Steps

1. **Decide**: Local or EAS?
2. **Setup**: Follow instructions above
3. **Build**: Create your first development build
4. **Develop**: Make changes with Fast Refresh
5. **Test**: Set as launcher and test full functionality

**Ready to start?**

**Local:**
```bash
npx expo prebuild --platform android && npx expo run:android
```

**EAS:**
```bash
eas build --profile development --platform android
```

---

## Resources

- **Local Builds**: [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)
- **EAS Builds**: [EAS_SETUP.md](./EAS_SETUP.md)
- **Complete Guide**: [DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)
- **Expo Docs**: https://docs.expo.dev/develop/development-builds/
