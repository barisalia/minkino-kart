package com.minkino.app;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /** Son ayarlanan sinif (telefon / tablet); null = henuz ayarlanmadi */
    private Boolean telefon = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Ekran yonu ilk kareden once: telefon yatay (AndroidManifest sensorLandscape), tablet serbest
        yonuAyarla();
        super.onCreate(savedInstanceState);
        // Mikrofon: Capacitor'in BridgeWebChromeClient'i WebView'in getUserMedia istegini (AUDIO_CAPTURE)
        // RECORD_AUDIO + MODIFY_AUDIO_SETTINGS calisma ani iznine baglar (izinler AndroidManifest.xml'de).
        // Izin reddedilirse oyun dokunarak surer.
        // Sesler ilk dokunustan once de calabilsin (karakter konusmasi, muzik): kullanici hareketi sarti kapali.
        WebView web = getBridge().getWebView();
        web.getSettings().setMediaPlaybackRequiresUserGesture(false);
    }

    @Override
    public void onConfigurationChanged(Configuration yeni) {
        super.onConfigurationChanged(yeni);
        // katlanan telefon acilinca tablet olur (ya da tersi): yalniz sinif degisince yeniden ayarlanir, film
        // kilidi (ScreenOrientation eklentisi, yalniz tablette) bozulmaz
        yonuAyarla();
    }

    /**
     * Telefon (en kisa kenar 600 dp alti; src/kabuk/yon.ts ile ayni esik): iki yatay yon, sensorle.
     * Tablet: serbest doner (film acilinca JS yatay kilitler, cikinca birakir).
     */
    private void yonuAyarla() {
        boolean t = getResources().getConfiguration().smallestScreenWidthDp < 600;
        if (telefon != null && telefon == t) return;
        telefon = t;
        setRequestedOrientation(t ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    }
}
