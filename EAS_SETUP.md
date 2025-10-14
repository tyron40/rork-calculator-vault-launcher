# EAS Build Setup for Development Builds

## Overview

This guide shows how to configure EAS (Expo Application Services) for building development builds of the Calculator Vault Launcher app.

## Prerequisites

1. **Expo account** (free) - Sign up at https://expo.dev
2. **EAS CLI** installed globally
3. **expo-dev-client** installed in project

## Installation

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Verify installation
eas whoami
```

## Configuration

### 1. Initialize EAS

```bash
eas build:configure
```

This creates `eas.json` with default build profiles.

### 2. Recommended eas.json Configuration

After running `eas build:configure`, update your `eas.json`:

```json
{
  "cli": {
    "version": ">= 13.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Debug",
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### Build Profile Explanations

#### Development Profile
- **Purpose**: For active development with custom native code
- **Features**:
  - Includes expo-dev-client
  - Connects to Metro bundler
  - Fast Refresh enabled
  - Debug mode
- **Output**: APK (Android), Simulator build (iOS)
- **Use**: Daily development and testing

#### Preview Profile
- **Purpose**: Internal testing and QA
- **Features**:
  - Production-like build
  - No dev client
  - Optimized but not fully minified
- **Output**: APK (Android), IPA (iOS)
- **Use**: Beta testing, stakeholder demos

#### Production Profile
- **Purpose**: App Store/Google Play submission
- **Features**:
  - Fully optimized
  - Minified and obfuscated
  - Release signing
- **Output**: AAB (Android), IPA (iOS)
- **Use**: Store submission

## Building

### Development Build

**Android:**
```bash
eas build --profile development --platform android
```

**iOS:**
```bash
eas build --profile development --platform ios
```

**Both:**
```bash
eas build --profile development --platform all
```

### Preview Build

```bash
eas build --profile preview --platform android
```

### Production Build

```bash
eas build --profile production --platform android
```

## Build Process

1. **Trigger build**: Run `eas build` command
2. **Upload code**: EAS uploads your project
3. **Cloud build**: EAS builds on their servers (10-20 min)
4. **Download**: Get APK/IPA from build page or CLI

### Monitor Build

```bash
# View build status
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]
```

## Installing Development Build

### Android

1. **Download APK** from EAS build page or CLI
2. **Transfer to device** (USB, email, cloud storage)
3. **Enable "Install from unknown sources"** in Android settings
4. **Install APK**
5. **Open app** - it will show "Waiting for dev server"

### iOS

**Option 1: Simulator (macOS only)**
```bash
# Download and install to simulator
eas build:run --profile development --platform ios
```

**Option 2: Physical Device**
- Requires Apple Developer account ($99/year)
- Device must be registered in Apple Developer portal
- Download IPA and install via Xcode or TestFlight

## Connecting to Dev Server

After installing development build:

```bash
# Start dev server
npx expo start --dev-client

# Or with tunnel (if on different network)
npx expo start --dev-client --tunnel
```

Then:
1. Open development build app on device
2. Scan QR code from terminal
3. Or enter URL manually

## Development Workflow

### Initial Setup (Once)
```bash
eas build --profile development --platform android
# Download and install APK
```

### Daily Development
```bash
npx expo start --dev-client
# Open dev build app and scan QR
# Make changes - Fast Refresh updates instantly
```

### When to Rebuild
- Changed native code (Java/Kotlin/Swift/Objective-C)
- Modified AndroidManifest.xml or Info.plist
- Added/removed native dependencies
- Changed native configuration in app.json

## Advanced Configuration

### Custom Build Scripts

Add to `eas.json`:

```json
{
  "build": {
    "development": {
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk",
        "withoutCredentials": true
      }
    }
  }
}
```

### Environment Variables

Create `.env` files:

```bash
# .env.development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_DEBUG=true

# .env.production
EXPO_PUBLIC_API_URL=https://api.production.com
EXPO_PUBLIC_DEBUG=false
```

Reference in `eas.json`:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Build Hooks

Run scripts before/after build:

```json
{
  "build": {
    "production": {
      "android": {
        "prebuildCommand": "npm run generate-assets",
        "postbuildCommand": "npm run upload-sourcemaps"
      }
    }
  }
}
```

## Credentials Management

### Android

EAS can manage your Android keystore:

```bash
# Let EAS generate keystore
eas build --platform android

# Or provide your own
eas credentials
```

### iOS

Requires Apple Developer account:

```bash
# Configure credentials
eas credentials

# EAS can manage certificates and provisioning profiles
```

## Troubleshooting

### "Build failed: Gradle error"

```bash
# Check build logs
eas build:view [BUILD_ID]

# Common fixes:
# 1. Update Gradle version in android/gradle/wrapper/gradle-wrapper.properties
# 2. Check AndroidManifest.xml for errors
# 3. Verify all dependencies are compatible
```

### "Build failed: Pod install error" (iOS)

```bash
# Update CocoaPods
cd ios && pod install --repo-update

# Or in eas.json:
{
  "build": {
    "development": {
      "ios": {
        "cocoapods": "1.15.2"
      }
    }
  }
}
```

### "Can't connect to dev server"

```bash
# Use tunnel mode
npx expo start --dev-client --tunnel

# Or configure LAN URL manually in dev build app
```

### "Development build crashes on launch"

```bash
# Check native logs
eas build:view [BUILD_ID] --logs

# Rebuild with clean state
eas build --profile development --platform android --clear-cache
```

## Cost

EAS Build pricing (as of 2024):

- **Free tier**: 30 builds/month
- **Production tier**: $29/month - unlimited builds
- **Enterprise**: Custom pricing

Development builds count toward your monthly limit.

## Best Practices

### 1. Use Development Profile for Daily Work
```bash
eas build --profile development --platform android
```

### 2. Test with Preview Before Production
```bash
eas build --profile preview --platform android
# Test thoroughly
eas build --profile production --platform android
```

### 3. Version Your Builds

Update `app.json` before each build:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

### 4. Use Git Tags

```bash
git tag v1.0.1
git push --tags
eas build --profile production --platform all
```

### 5. Keep Build Logs

```bash
eas build:list --limit 50 > builds.txt
```

## Local vs Cloud Builds

| Feature | Local (`expo run:android`) | Cloud (EAS) |
|---------|---------------------------|-------------|
| Setup | Requires Android Studio | Just EAS CLI |
| Speed | Fast (2-5 min) | Slower (10-20 min) |
| Cost | Free | 30 builds/month free |
| Credentials | Manual | Managed by EAS |
| CI/CD | Manual setup | Built-in |
| Team sharing | Manual APK sharing | Automatic |

**Recommendation**: 
- Use **local builds** for rapid iteration during development
- Use **EAS builds** for team sharing, CI/CD, and production

## CI/CD Integration

### GitHub Actions

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g eas-cli
      - run: eas build --profile preview --platform android --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

Get `EXPO_TOKEN`:
```bash
eas login
eas token:create
```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [Credentials Management](https://docs.expo.dev/app-signing/managed-credentials/)

## Quick Reference

```bash
# Setup
npm install -g eas-cli
eas login
eas build:configure

# Build
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android

# Monitor
eas build:list
eas build:view [BUILD_ID]
eas build:cancel [BUILD_ID]

# Install
eas build:run --profile development --platform ios

# Credentials
eas credentials

# Submit
eas submit --platform android
eas submit --platform ios
```

## Next Steps

1. ✅ Install EAS CLI: `npm install -g eas-cli`
2. ✅ Login: `eas login`
3. ✅ Configure: `eas build:configure`
4. ✅ Build: `eas build --profile development --platform android`
5. ✅ Install APK on device
6. ✅ Start dev server: `npx expo start --dev-client`
7. ✅ Scan QR code and start developing!
