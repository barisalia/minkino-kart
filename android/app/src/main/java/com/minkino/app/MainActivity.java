package com.minkino.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Mikrofon: Capacitor'in BridgeWebChromeClient'i WebView'in getUserMedia istegini (AUDIO_CAPTURE)
        // RECORD_AUDIO + MODIFY_AUDIO_SETTINGS calisma ani iznine baglar (izinler AndroidManifest.xml'de).
        // Izin reddedilirse oyun dokunarak surer.
        // Sesler ilk dokunustan once de calabilsin (karakter konusmasi, muzik): kullanici hareketi sarti kapali.
        WebView web = getBridge().getWebView();
        web.getSettings().setMediaPlaybackRequiresUserGesture(false);
    }
}
