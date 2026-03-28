# 🔧 Development Builds Enabled

## ✅ expo-dev-client Installed

Your Calculator Vault Launcher app now has **expo-dev-client** installed, which enables development builds with custom native code.

---

## 🚀 Quick Start

### Option 1: Local Build (Fastest - 5 minutes)

```bash
# 1. Prebuild native project
npx expo prebuild --platform android

# 2. Build and run
npx expo run:android

# Done! App is running with full launcher functionality
```

**Requirements**: Android Studio installed

---

### Option 2: Cloud Build (Easiest - 15 minutes)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build
eas build --profile development --platform android

# 5. Download APK and install on device

# 6. Start dev server
npx expo start --dev-client

# Done! Scan QR code with your dev build app
```

**Requirements**: Expo account (free)

---

## ⚠️ Important: Update app.json

Before building, add `"expo-dev-client"` to your plugins in `app.json`:

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

---

## 📚 Complete Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **[START_HERE.md](./START_HERE.md)** | Overview & quick setup | 5 min |
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Step-by-step walkthrough | 10 min |
| **[DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)** | TL;DR quick reference | 5 min |
| **[DEVELOPMENT_BUILDS.md](./DEVELOPMENT_BUILDS.md)** | Complete guide | 20 min |
| **[BUILD_OPTIONS.md](./BUILD_OPTIONS.md)** | Compare local vs cloud | 10 min |
| **[EAS_SETUP.md](./EAS_SETUP.md)** | EAS configuration | 15 min |

---

## 🎯 Why Development Builds?

This app **requires** development builds because:

- ✅ Custom native Android module (`AppManager`)
- ✅ Custom launcher intent filters
- ✅ Package query permissions
- ✅ Full launcher functionality

**Expo Go cannot run this app** - it doesn't include your custom native code.

---

## 🔄 Development Workflow

```bash
# Start dev server
npx expo start --dev-client

# Make changes to code
# Fast Refresh updates instantly!
```

**Rebuild only when:**
- Changing native code
- Modifying AndroidManifest.xml
- Adding/removing native dependencies

---

## 🆚 Quick Comparison

| Feature | Local Build | Cloud Build |
|---------|-------------|-------------|
| Setup | Complex | Simple |
| Build time | 2-5 min | 10-20 min |
| Cost | Free | 30/mo free |
| Best for | Daily dev | Teams |

---

## 📖 Start Here

**New to development builds?** Read [START_HERE.md](./START_HERE.md)

**Ready to build?** Follow [GETTING_STARTED.md](./GETTING_STARTED.md)

**Need quick reference?** See [DEV_BUILD_QUICKSTART.md](./DEV_BUILD_QUICKSTART.md)

---

**Let's build! 🚀**

```bash
# Local
npx expo prebuild --platform android && npx expo run:android

# Cloud
eas build --profile development --platform android
```
