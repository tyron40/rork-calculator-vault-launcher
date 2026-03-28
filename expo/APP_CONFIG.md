# App Configuration Guide

## app.json Configuration

Update your `app.json` with these settings for optimal Android launcher functionality:

```json
{
  "expo": {
    "name": "Calculator Vault Launcher",
    "slug": "calculator-vault-launcher",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1d29"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "app.rork.calculator-vault-launcher"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1a1d29"
      },
      "package": "app.rork.calculatorvaultlauncher",
      "permissions": [
        "android.permission.QUERY_ALL_PACKAGES"
      ],
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://rork.com/"
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow Calculator Vault to use Face ID for quick unlock"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## Key Configuration Points

### Android Package Name
- **Package**: `app.rork.calculatorvaultlauncher`
- Must match the package name in native module files
- No hyphens allowed in package names

### Permissions
- **QUERY_ALL_PACKAGES**: Required to list installed apps on Android 11+
- Note: This permission requires justification for Play Store submission

### UI Theme
- **userInterfaceStyle**: `"dark"` - Forces dark mode
- **backgroundColor**: `"#1a1d29"` - Matches app theme

### Orientation
- **orientation**: `"portrait"` - Locked to portrait mode
- Prevents landscape mode issues with calculator UI

### Plugins
1. **expo-router**: Navigation system
2. **expo-local-authentication**: Biometric unlock (future feature)

## Environment Variables

Create a `.env` file (optional):

```env
# Android-only mode
EXPO_PUBLIC_ANDROID_ONLY=true

# Auto-lock timeout in minutes
EXPO_PUBLIC_IDLE_LOCK_MINUTES=3

# Biometric authentication
EXPO_PUBLIC_REQUIRE_BIOMETRIC=false

# Default PIN for testing (REMOVE IN PRODUCTION)
EXPO_PUBLIC_DEFAULT_PIN=2580

# Decoy PIN feature
EXPO_PUBLIC_ENABLE_DECOY_PIN=true
EXPO_PUBLIC_DECOY_PIN=0000
```

## Build Configuration

### Development
```bash
npm run android
```

### Production
```bash
# Prebuild
npx expo prebuild --platform android

# Build release APK
cd android
./gradlew assembleRelease
```

## Icon Requirements

### App Icon
- **Size**: 1024x1024px
- **Format**: PNG
- **Location**: `assets/images/icon.png`
- **Design**: Calculator icon (to maintain disguise)

### Adaptive Icon
- **Size**: 1024x1024px
- **Format**: PNG
- **Location**: `assets/images/adaptive-icon.png`
- **Background**: `#1a1d29` (dark blue-gray)

### Splash Screen
- **Size**: 1284x2778px (or similar)
- **Format**: PNG
- **Location**: `assets/images/splash-icon.png`
- **Background**: `#1a1d29`

## Version Management

### Version Code (Android)
- Increment for each release
- Current: `1`
- Format: Integer (1, 2, 3, ...)

### Version Name
- Current: `"1.0.0"`
- Format: Semantic versioning (MAJOR.MINOR.PATCH)

## Platform-Specific Notes

### Android
- Minimum SDK: 30 (Android 11)
- Target SDK: 34 (Android 14)
- Launcher mode: `singleTask`
- Screen orientation: `portrait`

### iOS
- Not supported (Android-only app)
- iOS config included for future expansion

### Web
- Limited functionality (native module not available)
- Shows mock data for testing UI

## Security Considerations

### Permissions
- Only request necessary permissions
- QUERY_ALL_PACKAGES is sensitive
- Provide clear privacy policy

### Package Name
- Use unique package name
- Avoid common names
- Match across all config files

### Signing
- Use proper keystore for release
- Keep keystore secure
- Never commit keystore to git

## Troubleshooting

### Package name mismatch
- Ensure package name matches in:
  - app.json
  - AndroidManifest.xml
  - Native module files (AppManagerModule.kt, etc.)

### Permission denied
- Add QUERY_ALL_PACKAGES to app.json
- Add to AndroidManifest.xml
- Rebuild after changes

### Build errors
- Delete `android` folder
- Run `npx expo prebuild --platform android`
- Rebuild

## Next Steps

1. Update app.json with above configuration
2. Create/update app icons
3. Run `npx expo prebuild --platform android`
4. Implement native module
5. Build and test

---

**Note**: Always test thoroughly before releasing to production!
