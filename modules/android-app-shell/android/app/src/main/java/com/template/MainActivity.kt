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
            // Development options (uncomment one):
            // putExtra("WEB_APP_URL", "http://10.0.2.2:3000")        // Emulator
            // putExtra("WEB_APP_URL", "http://192.168.x.x:3000")    // Real device (your IP)

            // Production: uses bundled assets by default (no putExtra needed)
        }

        startActivity(intent)
        finish()
    }
}
