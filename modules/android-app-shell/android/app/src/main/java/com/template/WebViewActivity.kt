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
         * URL Configuration
         *
         * Development: Pass URL via Intent extra "WEB_APP_URL"
         *   - Example: intent.putExtra("WEB_APP_URL", "http://192.168.x.x:3000")
         *
         * Production: Uses assets/index.html by default
         */
        private const val ASSETS_URL = "file:///android_asset/index.html"
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

    /**
     * Override this method to customize the web app URL
     *
     * Development: Override and return your dev server URL
     *   - Emulator: "http://10.0.2.2:5173"
     *   - Real device: "http://192.168.x.x:5173"
     *
     * Production: Return super.getWebAppUrl() to use assets/index.html
     */
    protected open fun getWebAppUrl(): String {
        return intent.getStringExtra("WEB_APP_URL") ?: ASSETS_URL
    }

    private fun loadApp() {
        val webAppUrl = getWebAppUrl()
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
