# Native Android Module Implementation

This document provides the complete implementation for the AppManager native module.

## Overview

The AppManager module provides three essential functions:
1. List all installed launchable apps with icons
2. Launch apps by package name
3. Open system launcher settings

## Implementation

### 1. AppManagerModule.kt

Create: `android/app/src/main/java/app/rork/calculatorvaultlauncher/AppManagerModule.kt`

```kotlin
package app.rork.calculatorvaultlauncher

import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.provider.Settings
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream

class AppManagerModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppManager"

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

            val apps = pm.queryIntentActivities(intent, 0)
            val appList = WritableNativeArray()

            for (app in apps) {
                val appInfo = WritableNativeMap().apply {
                    putString("label", app.loadLabel(pm).toString())
                    putString("packageName", app.activityInfo.packageName)
                    putString("iconBase64", getIconBase64(app, pm))
                    putBoolean("launchable", true)
                }
                appList.pushMap(appInfo)
            }

            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get apps: ${e.message}")
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Cannot launch: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Launch failed: ${e.message}")
        }
    }

    @ReactMethod
    fun openLauncherSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_HOME_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Settings failed: ${e.message}")
        }
    }

    private fun getIconBase64(info: ResolveInfo, pm: PackageManager): String {
        return try {
            val icon = info.loadIcon(pm)
            val bitmap = drawableToBitmap(icon)
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
        } catch (e: Exception) {
            ""
        }
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable) return drawable.bitmap

        val bitmap = Bitmap.createBitmap(
            drawable.intrinsicWidth,
            drawable.intrinsicHeight,
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }
}
```

### 2. AppManagerPackage.kt

Create: `android/app/src/main/java/app/rork/calculatorvaultlauncher/AppManagerPackage.kt`

```kotlin
package app.rork.calculatorvaultlauncher

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AppManagerPackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(AppManagerModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

### 3. Register Package in MainApplication.kt

Update: `android/app/src/main/java/app/rork/calculatorvaultlauncher/MainApplication.kt`

```kotlin
package app.rork.calculatorvaultlauncher

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> {
                val packages = PackageList(this).packages
                // Add custom package
                packages.add(AppManagerPackage())
                return packages
            }

            override fun getJSMainModuleName() = "index"
            override fun getUseDeveloperSupport() = BuildConfig.DEBUG
            override val isNewArchEnabled = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) load()
    }
}
```

### 4. Update AndroidManifest.xml

Update: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Query installed apps (Android 11+) -->
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true"
            android:screenOrientation="portrait">
            
            <!-- HOME launcher intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
            
            <!-- App launcher icon -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## Building

```bash
# 1. Generate native code
npx expo prebuild --platform android

# 2. Add the native module files above

# 3. Build release APK
cd android
./gradlew assembleRelease

# 4. APK location
# android/app/build/outputs/apk/release/app-release.apk
```

## Testing

```bash
# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# View logs
adb logcat | grep AppManager
```

## Troubleshooting

### Module not found
- Run `npx expo prebuild --platform android`
- Clean: `cd android && ./gradlew clean`
- Rebuild

### Permission denied
- Add QUERY_ALL_PACKAGES to manifest
- For Play Store, justification required

### Apps not launching
- Check logcat for errors
- Verify package names
- Test with known apps (e.g., com.android.chrome)

## Notes

- Android only (not iOS/web)
- Requires Android 11+ (API 30+)
- QUERY_ALL_PACKAGES needs Play Store justification
- For testing, sideload APK directly
