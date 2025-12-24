package com.template

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

/**
 * Main Activity - Entry point for the Android app
 * Launches WebViewActivity with the web app URL
 */
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Launch WebView Activity
        val intent = Intent(this, WebViewActivity::class.java).apply {
            // For development, use dev server URL
            // putExtra("WEB_APP_URL", "http://10.0.2.2:3000")

            // For production, use bundled assets
            // putExtra("WEB_APP_URL", "file:///android_asset/index.html")

            // For development with real device (same Wi-Fi network)
            putExtra("WEB_APP_URL", "http://192.168.50.41:3000")
        }

        startActivity(intent)
        finish()
    }
}
