package com.template

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import com.template.bridge.BridgeHandler
import com.template.bridge.BridgeInterface

/**
 * WebView Activity - Hosts the hybrid web application
 * Base template for HWMS generated apps
 * Handler initialization is done in setupNativeHandlers() which
 * should be overridden in MainActivity if activity-based handlers are used
 */
open class WebViewActivity : ComponentActivity() {

    companion object {
        /**
         * Development server URL configuration
         *
         * For Android Emulator: Use 10.0.2.2 (maps to host machine's localhost)
         * For Physical Device: Use your computer's local IP address
         *   - Find your IP: ifconfig (Mac/Linux) or ipconfig (Windows)
         *   - Example: "http://192.168.0.100:5173"
         *
         * For Production: Set USE_DEV_SERVER = false
         */
        private const val USE_DEV_SERVER = true
        private const val DEV_SERVER_URL = "http://10.0.2.2:5173"
        private const val PRODUCTION_URL = "file:///android_asset/index.html"
    }

    protected lateinit var webView: WebView
    protected lateinit var bridgeHandler: BridgeHandler

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_webview)

        webView = findViewById(R.id.webView)
        bridgeHandler = BridgeHandler(this, webView)

        // Initialize native handlers (override in subclass for activity-based handlers)
        setupNativeHandlers()

        configureWebView()
        setupBridge()
        loadApp()
    }

    /**
     * Override this method to initialize activity-based handlers
     * (e.g., CameraHandler, PushHandler that require ActivityResultLauncher)
     */
    protected open fun setupNativeHandlers() {
        // Base implementation does nothing
        // Activity-based handlers should be initialized in subclass
    }

    private fun configureWebView() {
        webView.settings.apply {
            // Enable JavaScript
            javaScriptEnabled = true

            // Enable DOM storage
            domStorageEnabled = true

            // Enable database storage
            databaseEnabled = true

            // Enable caching
            cacheMode = WebSettings.LOAD_DEFAULT

            // Enable zoom (optional)
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false

            // Allow file access
            allowFileAccess = true

            // Enable mixed content (HTTP in HTTPS)
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

            // Viewport settings
            useWideViewPort = true
            loadWithOverviewMode = true

            // Media playback
            mediaPlaybackRequiresUserGesture = false
        }

        // Set WebViewClient for navigation handling
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Send ready event to JS
                bridgeHandler.sendEvent("app.ready", null)
            }
        }

        // Set WebChromeClient for JavaScript dialogs, etc.
        webView.webChromeClient = WebChromeClient()
    }

    private fun setupBridge() {
        // Add JavaScript interface
        val bridgeInterface = BridgeInterface(webView, bridgeHandler)
        webView.addJavascriptInterface(bridgeInterface, "NativeBridge")
    }

    private fun loadApp() {
        // Load the web app
        // Priority: Intent extra > Dev server (if enabled) > Production assets
        val webAppUrl = intent.getStringExtra("WEB_APP_URL")
            ?: if (USE_DEV_SERVER) DEV_SERVER_URL else PRODUCTION_URL

        android.util.Log.d("WebViewActivity", "Loading URL: $webAppUrl")
        webView.loadUrl(webAppUrl)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            // Send back press event to JS
            bridgeHandler.sendEvent("hardware.backPressed", null)
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    override fun onPause() {
        super.onPause()
        bridgeHandler.sendEvent("app.background", null)
        webView.onPause()
    }

    override fun onResume() {
        super.onResume()
        bridgeHandler.sendEvent("app.foreground", null)
        webView.onResume()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
