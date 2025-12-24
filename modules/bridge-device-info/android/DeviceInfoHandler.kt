package com.template.bridge

import android.content.Context
import android.os.Build
import android.util.DisplayMetrics
import android.view.WindowManager
import org.json.JSONObject
import java.util.Locale
import java.util.TimeZone

/**
 * Device Info Handler - Provides device information
 * Matches HWMS bridge-device-info module interface
 *
 * Supported actions:
 * - device.getInfo: Get complete device information
 * - device.getOSInfo: Get OS information only
 * - device.getAppInfo: Get app information only
 * - device.isPhysicalDevice: Check if physical device
 */
class DeviceInfoHandler(
    private val context: Context,
    private val onResult: (String, JSONObject) -> Unit,
    private val onError: (String, String, String) -> Unit
) {
    companion object {
        const val ACTION_PREFIX = "device."
    }

    /**
     * Handle device-related actions
     */
    fun handleAction(action: String, params: JSONObject, callbackId: String) {
        when (action) {
            "device.getInfo" -> getDeviceInfo(callbackId)
            "device.getOSInfo" -> getOSInfo(callbackId)
            "device.getAppInfo" -> getAppInfo(callbackId)
            "device.isPhysicalDevice" -> isPhysicalDevice(callbackId)
            else -> onError(callbackId, "ACTION_NOT_FOUND", "Unknown device action: $action")
        }
    }

    /**
     * Get complete device information
     * Action: device.getInfo
     */
    private fun getDeviceInfo(callbackId: String) {
        try {
            val result = JSONObject().apply {
                put("platform", "android")
                put("deviceId", getDeviceId())
                put("model", Build.MODEL)
                put("manufacturer", Build.MANUFACTURER)
                put("isPhysicalDevice", !isEmulator())
                put("os", getOSInfoObject())
                put("app", getAppInfoObject())
                put("screen", getScreenInfoObject())
                put("locale", Locale.getDefault().toLanguageTag())
                put("timezone", TimeZone.getDefault().id)
            }
            onResult(callbackId, result)
        } catch (e: Exception) {
            onError(callbackId, "DEVICE_ERROR", e.message ?: "기기 정보를 가져올 수 없습니다.")
        }
    }

    /**
     * Get OS information only
     * Action: device.getOSInfo
     */
    private fun getOSInfo(callbackId: String) {
        try {
            onResult(callbackId, getOSInfoObject())
        } catch (e: Exception) {
            onError(callbackId, "DEVICE_ERROR", e.message ?: "OS 정보를 가져올 수 없습니다.")
        }
    }

    /**
     * Get app information only
     * Action: device.getAppInfo
     */
    private fun getAppInfo(callbackId: String) {
        try {
            onResult(callbackId, getAppInfoObject())
        } catch (e: Exception) {
            onError(callbackId, "DEVICE_ERROR", e.message ?: "앱 정보를 가져올 수 없습니다.")
        }
    }

    /**
     * Check if running on physical device
     * Action: device.isPhysicalDevice
     */
    private fun isPhysicalDevice(callbackId: String) {
        try {
            val result = JSONObject().apply {
                put("isPhysicalDevice", !isEmulator())
            }
            onResult(callbackId, result)
        } catch (e: Exception) {
            onError(callbackId, "DEVICE_ERROR", e.message ?: "기기 정보를 확인할 수 없습니다.")
        }
    }

    /**
     * Get OS info as JSONObject
     */
    private fun getOSInfoObject(): JSONObject {
        return JSONObject().apply {
            put("name", "Android")
            put("version", Build.VERSION.RELEASE)
            put("buildNumber", Build.VERSION.SDK_INT.toString())
        }
    }

    /**
     * Get app info as JSONObject
     */
    private fun getAppInfoObject(): JSONObject {
        val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo.longVersionCode.toString()
        } else {
            @Suppress("DEPRECATION")
            packageInfo.versionCode.toString()
        }

        return JSONObject().apply {
            put("version", packageInfo.versionName ?: "1.0.0")
            put("buildNumber", versionCode)
            put("bundleId", context.packageName)
            put("name", getAppName())
        }
    }

    /**
     * Get screen info as JSONObject
     */
    private fun getScreenInfoObject(): JSONObject {
        val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val displayMetrics = DisplayMetrics()

        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getMetrics(displayMetrics)

        return JSONObject().apply {
            put("width", displayMetrics.widthPixels)
            put("height", displayMetrics.heightPixels)
            put("scale", displayMetrics.density)
        }
    }

    /**
     * Get unique device identifier
     */
    private fun getDeviceId(): String {
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: "unknown"
    }

    /**
     * Get application name
     */
    private fun getAppName(): String {
        return try {
            val appInfo = context.packageManager.getApplicationInfo(context.packageName, 0)
            context.packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            "App"
        }
    }

    /**
     * Check if running on emulator
     */
    private fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.BRAND.startsWith("generic")
                || Build.DEVICE.startsWith("generic")
                || "google_sdk" == Build.PRODUCT)
    }
}
