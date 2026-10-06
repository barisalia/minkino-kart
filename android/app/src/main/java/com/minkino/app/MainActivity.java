package com.minkino.app;

import android.content.pm.ActivityInfo;
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

    /**
     * Ekran yonu sayfaya gore web tarafinda ayarlanir (src/kabuk/yon.ts, @capacitor/screen-orientation): telefonda
     * genis sahneli oyunlar yatay, menu / Kartlar / Okul / Canlan serbest; tablet serbest (film yatay).
     * Eklentinin 'landscape' kilidi tek yone kilitler (SCREEN_ORIENTATION_LANDSCAPE): yatay kilit iki yonlu olsun,
     * cocuk telefonu hangi yana cevirirse ekran duz dursun (sensorle; dikey yok).
     */
    @Override
    public void setRequestedOrientation(int yon) {
        if (yon == ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE || yon == ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE) {
            yon = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }
        super.setRequestedOrientation(yon);
    }
}
