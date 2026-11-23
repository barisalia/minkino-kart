package com.minkino.app;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;
import java.util.List;

/**
 * Soz tanima (src/audio/soz-tanima.ts): cocugun soyledigi sozcugu YALNIZ BU CIHAZDA tanir.
 * - Yalniz Android 12+ cihaz ici taniyici (SpeechRecognizer.createOnDeviceSpeechRecognizer): ses Google'a ya da
 *   baska bir yere gonderilmez, kaydedilmez, saklanmaz.
 * - Cihaz ici taniyici ya da o dilin modeli yoksa "yok" doner; oyun eski yoluna (ses var/yok, dokunma) gecer.
 * - Dinlerken mikrofonu taniyici tutar: web tarafi kendi getUserMedia akisini once kapatir.
 * JS: durum({dil}), izinIste(), dinle({dil, ipuclari, sureMs}), durdur(); olay: "seviye" {deger: 0..1}.
 * Sonuc durumu: duydu (metinler) | anlasilmadi | sessiz | yok | iptal.
 */
@CapacitorPlugin(name = "SozTanima", permissions = { @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "mikrofon") })
public class SozTanimaPlugin extends Plugin {

    private final Handler ana = new Handler(Looper.getMainLooper());
    private SpeechRecognizer tanici;
    private PluginCall bekleyen;
    private Runnable sureBitti;
    private boolean konustu;

    private boolean cihazdaVar() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext());
    }

    private boolean izinVar() {
        return getPermissionState("mikrofon") == PermissionState.GRANTED;
    }

    @PluginMethod
    public void durum(PluginCall call) {
        JSObject r = new JSObject();
        r.put("cihazda", cihazdaVar());
        r.put("izin", izinVar());
        r.put("sorulmadi", getPermissionState("mikrofon") == PermissionState.PROMPT);
        call.resolve(r);
    }

    /** Izin penceresini yalniz cocugun bir dokunusunda cagirin. */
    @PluginMethod
    public void izinIste(PluginCall call) {
        if (izinVar()) {
            izinSonucu(call);
            return;
        }
        requestPermissionForAlias("mikrofon", call, "izinSonucu");
    }

    @PermissionCallback
    private void izinSonucu(PluginCall call) {
        JSObject r = new JSObject();
        r.put("izin", izinVar());
        call.resolve(r);
    }

    @PluginMethod
    public void dinle(final PluginCall call) {
        ana.post(() -> baslat(call));
    }

    @PluginMethod
    public void durdur(final PluginCall call) {
        ana.post(() -> {
            bitir("iptal", null);
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        bitir("iptal", null);
    }

    private void baslat(final PluginCall call) {
        bitir("iptal", null);
        if (!izinVar() || !cihazdaVar()) {
            sonuc(call, "yok", null);
            return;
        }
        String dil = call.getString("dil", "en-US");
        double sure = Math.max(1500.0, Math.min(15000.0, call.getDouble("sureMs", 6000.0)));
        ArrayList<String> ipuclari = new ArrayList<>();
        JSArray dizi = call.getArray("ipuclari");
        if (dizi != null) {
            for (int i = 0; i < dizi.length(); i++) {
                String s = dizi.optString(i, "");
                if (!s.isEmpty()) ipuclari.add(s);
            }
        }
        SpeechRecognizer t = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                t = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
            } catch (Exception e) {
                t = null;
            }
        }
        if (t == null) {
            sonuc(call, "yok", null);
            return;
        }
        tanici = t;
        bekleyen = call;
        konustu = false;
        t.setRecognitionListener(
            new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {}

                @Override
                public void onBeginningOfSpeech() {
                    konustu = true;
                }

                @Override
                public void onRmsChanged(float rmsdB) {
                    JSObject v = new JSObject();
                    v.put("deger", Math.max(0.0, Math.min(1.0, (rmsdB + 2.0) / 12.0)));
                    notifyListeners("seviye", v);
                }

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {}

                @Override
                public void onError(int hata) {
                    String d;
                    if (hata == SpeechRecognizer.ERROR_NO_MATCH) d = konustu ? "anlasilmadi" : "sessiz";
                    else if (hata == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) d = "sessiz";
                    else d = "yok";
                    bitir(d, null);
                }

                @Override
                public void onResults(Bundle sonuclar) {
                    ArrayList<String> m = sonuclar == null ? null : sonuclar.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (m == null || m.isEmpty()) bitir(konustu ? "anlasilmadi" : "sessiz", null);
                    else bitir("duydu", m);
                }

                @Override
                public void onPartialResults(Bundle kismi) {}

                @Override
                public void onEvent(int tur, Bundle params) {}
            }
        );
        Intent niyet = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        niyet.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        niyet.putExtra(RecognizerIntent.EXTRA_LANGUAGE, dil);
        niyet.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        niyet.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        niyet.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        // Android 13+: beklenen sozcukler taniyiciya ipucu (RecognizerIntent.EXTRA_BIASING_STRINGS)
        if (!ipuclari.isEmpty()) niyet.putStringArrayListExtra("android.speech.extra.BIASING_STRINGS", ipuclari);
        try {
            t.startListening(niyet);
        } catch (Exception e) {
            bitir("yok", null);
            return;
        }
        sureBitti = () -> {
            if (tanici != null) tanici.stopListening();
            // kesin sonuc gecikirse eldekiyle bitir
            ana.postDelayed(
                () -> {
                    if (bekleyen == call) bitir(konustu ? "anlasilmadi" : "sessiz", null);
                },
                1500
            );
        };
        ana.postDelayed(sureBitti, (long) sure);
    }

    private void bitir(String durum, List<String> metinler) {
        if (sureBitti != null) {
            ana.removeCallbacks(sureBitti);
            sureBitti = null;
        }
        if (tanici != null) {
            final SpeechRecognizer t = tanici;
            tanici = null;
            try {
                t.cancel();
            } catch (Exception ignored) {}
            // dinleyicinin kendi geri cagrisinin icinden yok etme: bir sonraki turda
            ana.post(() -> {
                try {
                    t.destroy();
                } catch (Exception ignored) {}
            });
        }
        PluginCall c = bekleyen;
        bekleyen = null;
        if (c != null) sonuc(c, durum, metinler);
    }

    private void sonuc(PluginCall c, String durum, List<String> metinler) {
        JSObject r = new JSObject();
        r.put("durum", durum);
        r.put("metinler", new JSArray(metinler == null ? new ArrayList<String>() : metinler));
        c.resolve(r);
    }
}
