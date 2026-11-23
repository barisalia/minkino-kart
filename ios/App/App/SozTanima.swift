import Foundation
import AVFoundation
import Speech
import Capacitor

/// Söz tanıma (src/audio/soz-tanima.ts): çocuğun söylediği sözcüğü YALNIZ BU CİHAZDA tanır.
/// - requiresOnDeviceRecognition = true: ses Apple'a ya da başka bir yere gönderilmez, kaydedilmez, saklanmaz.
/// - Cihaz o dili kendi içinde tanıyamıyorsa (eski cihaz, model yok) "yok" döner; oyun eski yoluna (ses var/yok,
///   dokunma) geçer. Hiçbir durumda oyun kilitlenmez.
/// - Dinlerken mikrofonu bu eklenti tutar: web tarafı kendi getUserMedia akışını önce kapatır.
/// JS: registerPlugin('SozTanima') → durum({dil}), izinIste(), dinle({dil, ipuclari, sureMs}), durdur();
/// olay: 'seviye' {deger: 0…1} (mikrofon halkası için).
@objc(SozTanimaPlugin)
public class SozTanimaPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SozTanimaPlugin"
    public let jsName = "SozTanima"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "durum", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "izinIste", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "dinle", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "durdur", returnType: CAPPluginReturnPromise)
    ]

    private let motor = AVAudioEngine()
    private var istek: SFSpeechAudioBufferRecognitionRequest?
    private var gorev: SFSpeechRecognitionTask?
    private var bekleyen: CAPPluginCall?
    private var metinler: [String] = []
    private var sureSayaci: Timer?
    private var susmaSayaci: Timer?
    /// Mikrofon dinleyicisi (tap) takılı mı: takılı değilken removeTap / ikinci kez installTap çağrılmaz (ikinci tap çöker)
    private var tapTakili = false
    private var oncekiOturum: (kategori: AVAudioSession.Category, mod: AVAudioSession.Mode, secenek: AVAudioSession.CategoryOptions)?

    /// Yalnız cihazda tanıyabilen tanıyıcı; yoksa nil
    private func cihazdaTanici(_ dil: String) -> SFSpeechRecognizer? {
        guard let t = SFSpeechRecognizer(locale: Locale(identifier: dil)), t.isAvailable, t.supportsOnDeviceRecognition else {
            return nil
        }
        return t
    }

    private func izinVar() -> Bool {
        return SFSpeechRecognizer.authorizationStatus() == .authorized
            && AVAudioSession.sharedInstance().recordPermission == .granted
    }

    @objc func durum(_ call: CAPPluginCall) {
        let dil = call.getString("dil") ?? "en-US"
        DispatchQueue.main.async {
            call.resolve([
                "cihazda": self.cihazdaTanici(dil) != nil,
                "izin": self.izinVar(),
                "sorulmadi": SFSpeechRecognizer.authorizationStatus() == .notDetermined
            ])
        }
    }

    /// İzin pencerelerini (konuşma tanıma + mikrofon) yalnız çocuğun bir dokunuşunda çağırın.
    @objc func izinIste(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { durum in
            AVAudioSession.sharedInstance().requestRecordPermission { mikrofon in
                DispatchQueue.main.async {
                    call.resolve(["izin": durum == .authorized && mikrofon])
                }
            }
        }
    }

    @objc func dinle(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.baslat(call) }
    }

    @objc func durdur(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.bitir("iptal")
            call.resolve()
        }
    }

    private func baslat(_ call: CAPPluginCall) {
        bitir("iptal")
        let dil = call.getString("dil") ?? "en-US"
        guard izinVar(), let tanici = cihazdaTanici(dil) else {
            call.resolve(["durum": "yok", "metinler": [String]()])
            return
        }
        let sure = max(1500, min(15000, call.getDouble("sureMs") ?? 6000))
        let ipuclari = (call.getArray("ipuclari") ?? []).compactMap { $0 as? String }

        let oturum = AVAudioSession.sharedInstance()
        oncekiOturum = (oturum.category, oturum.mode, oturum.categoryOptions)
        do {
            // hoparlör açık kalsın (kulaklığa düşmesin), oyunun öbür sesleri kesilmesin
            try oturum.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .mixWithOthers])
            try oturum.setActive(true)
        } catch {
            oturumuGeriAl()
            call.resolve(["durum": "yok", "metinler": [String]()])
            return
        }

        let r = SFSpeechAudioBufferRecognitionRequest()
        r.requiresOnDeviceRecognition = true
        r.shouldReportPartialResults = true
        r.contextualStrings = ipuclari
        if #available(iOS 16, *) { r.addsPunctuation = false }
        istek = r
        bekleyen = call
        metinler = []

        let giris = motor.inputNode
        let bicim = giris.outputFormat(forBus: 0)
        guard bicim.sampleRate > 0, bicim.channelCount > 0 else {
            bitir("yok")
            return
        }
        tapTakili = true
        giris.installTap(onBus: 0, bufferSize: 1024, format: bicim) { [weak self] tampon, _ in
            r.append(tampon)
            guard let kanal = tampon.floatChannelData?[0] else { return }
            let n = Int(tampon.frameLength)
            if n == 0 { return }
            var toplam: Float = 0
            for i in 0..<n { toplam += kanal[i] * kanal[i] }
            let deger = min(1.0, Double(sqrt(toplam / Float(n))) / 0.12)
            DispatchQueue.main.async { self?.notifyListeners("seviye", data: ["deger": deger]) }
        }
        motor.prepare()
        do {
            try motor.start()
        } catch {
            bitir("yok")
            return
        }

        gorev = tanici.recognitionTask(with: r) { [weak self] sonuc, hata in
            DispatchQueue.main.async {
                guard let self = self, self.istek === r else { return }
                if let s = sonuc {
                    let yeni = s.transcriptions.map { $0.formattedString }.filter { !$0.isEmpty }
                    if !yeni.isEmpty { self.metinler = yeni }
                    if s.isFinal {
                        self.bitir(self.metinler.isEmpty ? "sessiz" : "duydu")
                        return
                    }
                    // çocuk sustu: son kısmi sonuçtan 0,9 sn sonra dinleme biter, kesin sonuç gelir
                    if !self.metinler.isEmpty {
                        self.susmaSayaci?.invalidate()
                        self.susmaSayaci = Timer.scheduledTimer(withTimeInterval: 0.9, repeats: false) { _ in r.endAudio() }
                    }
                }
                if let hata = hata {
                    let h = hata as NSError
                    // Duyulan bir şey varsa onunla bitir. Yoksa yalnız "konuşma duyulmadı" (1110) sessizliktir; başka her
                    // hata (model yok, tanıyıcı meşgul, iptal…) "yok" sayılır: oyun eski yola (ses var/yok) döner,
                    // çocuğa boşuna "bir daha" denmez.
                    if !self.metinler.isEmpty { self.bitir("duydu") }
                    else { self.bitir(h.code == 1110 ? "sessiz" : "yok") }
                }
            }
        }
        sureSayaci = Timer.scheduledTimer(withTimeInterval: sure / 1000, repeats: false) { [weak self] _ in
            r.endAudio()
            // kesin sonuç gecikirse eldekiyle bitir
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                guard let self = self, self.istek === r else { return }
                self.bitir(self.metinler.isEmpty ? "sessiz" : "duydu")
            }
        }
    }

    private func bitir(_ durum: String) {
        sureSayaci?.invalidate()
        sureSayaci = nil
        susmaSayaci?.invalidate()
        susmaSayaci = nil
        if motor.isRunning { motor.stop() }
        if tapTakili {
            motor.inputNode.removeTap(onBus: 0)
            tapTakili = false
        }
        let r = istek
        istek = nil
        r?.endAudio()
        gorev?.cancel()
        gorev = nil
        oturumuGeriAl()
        guard let c = bekleyen else { return }
        bekleyen = nil
        let duyulan: [String] = durum == "duydu" ? metinler : []
        c.resolve(["durum": durum, "metinler": duyulan])
    }

    private func oturumuGeriAl() {
        guard let o = oncekiOturum else { return }
        oncekiOturum = nil
        try? AVAudioSession.sharedInstance().setCategory(o.kategori, mode: o.mod, options: o.secenek)
    }
}
