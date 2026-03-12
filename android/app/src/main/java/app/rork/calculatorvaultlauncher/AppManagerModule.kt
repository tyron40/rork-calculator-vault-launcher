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
