package com.template.bridge

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Camera Handler - Manages camera and gallery operations
 * Matches HWMS bridge-camera module interface
 *
 * Supported actions:
 * - camera.takePhoto: Take a photo using device camera
 * - camera.selectFromGallery: Select an image from gallery
 */
class CameraHandler(
    private val activity: ComponentActivity,
    private val onResult: (String, JSONObject) -> Unit,
    private val onError: (String, String, String) -> Unit
) {
    companion object {
        const val ACTION_PREFIX = "camera."
    }

    private var currentCallbackId: String? = null
    private var currentPhotoUri: Uri? = null
    private var currentOptions: JSONObject? = null

    // Camera permission launcher
    private val cameraPermissionLauncher: ActivityResultLauncher<String> =
        activity.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                launchCamera()
            } else {
                currentCallbackId?.let {
                    onError(it, "PERMISSION_DENIED", "카메라 권한이 거부되었습니다.")
                }
            }
        }

    // Gallery permission launcher (for Android 13+)
    private val galleryPermissionLauncher: ActivityResultLauncher<String> =
        activity.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                launchGallery()
            } else {
                currentCallbackId?.let {
                    onError(it, "PERMISSION_DENIED", "갤러리 접근 권한이 거부되었습니다.")
                }
            }
        }

    // Camera launcher
    private val takePictureLauncher: ActivityResultLauncher<Uri> =
        activity.registerForActivityResult(ActivityResultContracts.TakePicture()) { success ->
            if (success && currentPhotoUri != null) {
                processImage(currentPhotoUri!!)
            } else {
                currentCallbackId?.let {
                    onError(it, "CANCELLED", "사진 촬영이 취소되었습니다.")
                }
            }
        }

    // Gallery launcher
    private val pickImageLauncher: ActivityResultLauncher<String> =
        activity.registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            if (uri != null) {
                processImage(uri)
            } else {
                currentCallbackId?.let {
                    onError(it, "CANCELLED", "이미지 선택이 취소되었습니다.")
                }
            }
        }

    /**
     * Handle camera-related actions
     */
    fun handleAction(action: String, params: JSONObject, callbackId: String) {
        when (action) {
            "camera.takePhoto" -> takePhoto(params, callbackId)
            "camera.selectFromGallery" -> selectFromGallery(params, callbackId)
            else -> onError(callbackId, "ACTION_NOT_FOUND", "Unknown camera action: $action")
        }
    }

    /**
     * Take a photo using the device camera
     * Action: camera.takePhoto
     */
    fun takePhoto(params: JSONObject, callbackId: String) {
        currentCallbackId = callbackId
        currentOptions = params

        // Check camera permission
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED
        ) {
            launchCamera()
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    /**
     * Select an image from the device gallery
     * Action: camera.selectFromGallery
     */
    fun selectFromGallery(params: JSONObject, callbackId: String) {
        currentCallbackId = callbackId
        currentOptions = params

        // For Android 13+, check READ_MEDIA_IMAGES permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_MEDIA_IMAGES)
                == PackageManager.PERMISSION_GRANTED
            ) {
                launchGallery()
            } else {
                galleryPermissionLauncher.launch(Manifest.permission.READ_MEDIA_IMAGES)
            }
        } else {
            // For older versions, no runtime permission needed for gallery picker
            launchGallery()
        }
    }

    private fun launchCamera() {
        try {
            currentPhotoUri = createImageUri()
            currentPhotoUri?.let { uri ->
                takePictureLauncher.launch(uri)
            } ?: run {
                currentCallbackId?.let {
                    onError(it, "FILE_ERROR", "이미지 파일을 생성할 수 없습니다.")
                }
            }
        } catch (e: Exception) {
            currentCallbackId?.let {
                onError(it, "CAMERA_ERROR", e.message ?: "카메라를 시작할 수 없습니다.")
            }
        }
    }

    private fun launchGallery() {
        try {
            pickImageLauncher.launch("image/*")
        } catch (e: Exception) {
            currentCallbackId?.let {
                onError(it, "GALLERY_ERROR", e.message ?: "갤러리를 열 수 없습니다.")
            }
        }
    }

    private fun createImageUri(): Uri? {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val fileName = "HWMS_${timeStamp}.jpg"

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Use MediaStore for Android 10+
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES)
            }
            activity.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
        } else {
            // Use FileProvider for older versions
            val storageDir = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            val file = File(storageDir, fileName)
            FileProvider.getUriForFile(
                activity,
                "${activity.packageName}.fileprovider",
                file
            )
        }
    }

    private fun processImage(uri: Uri) {
        try {
            val options = currentOptions ?: JSONObject()
            val maxWidth = options.optInt("maxWidth", 1920)
            val maxHeight = options.optInt("maxHeight", 1080)
            val quality = options.optDouble("quality", 0.8)
            val format = options.optString("format", "base64")

            // Load and resize bitmap
            val bitmap = loadAndResizeBitmap(uri, maxWidth, maxHeight)

            if (bitmap == null) {
                currentCallbackId?.let {
                    onError(it, "PROCESS_ERROR", "이미지를 처리할 수 없습니다.")
                }
                return
            }

            // Create response based on format
            val result = JSONObject().apply {
                put("width", bitmap.width)
                put("height", bitmap.height)
                put("mimeType", "image/jpeg")
                put("format", format)

                if (format == "base64") {
                    val base64Data = bitmapToBase64(bitmap, (quality * 100).toInt())
                    put("data", base64Data)
                    put("fileSize", base64Data.length)
                } else {
                    put("data", uri.toString())
                }
            }

            currentCallbackId?.let {
                onResult(it, result)
            }

            // Clean up
            bitmap.recycle()

        } catch (e: Exception) {
            currentCallbackId?.let {
                onError(it, "PROCESS_ERROR", e.message ?: "이미지 처리 중 오류가 발생했습니다.")
            }
        }
    }

    private fun loadAndResizeBitmap(uri: Uri, maxWidth: Int, maxHeight: Int): Bitmap? {
        return try {
            // First, get dimensions without loading full bitmap
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            activity.contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, options)
            }

            // Calculate sample size
            options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight)
            options.inJustDecodeBounds = false

            // Load sampled bitmap
            activity.contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, options)
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        val (height, width) = options.outHeight to options.outWidth
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight = height / 2
            val halfWidth = width / 2

            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }

        return inSampleSize
    }

    private fun bitmapToBase64(bitmap: Bitmap, quality: Int): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }
}
