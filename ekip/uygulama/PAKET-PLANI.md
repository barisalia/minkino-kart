# Minkino uygulama paketi (iOS / Android): plan

Hazırlayan: kodcu, 2026-09-27. Durum: **taslak**. Kod değişmedi, paket kurulmadı. Barış'ın kararını bekliyor.

## 1. Bugünkü durum (depodan ölçüldü)

- **Derleme:** Vite, çok sayfalı (`vite.config.ts` → 9 giriş: kartlar `/`, uygulama, pazar, canlan, sanatci, macera, film, orman, ses-testi).
  - `base: './'`; çıktı `dist/`.
  - Sayfalar arası gezinme göreli bağlantıyla (`../pazar/` gibi); ana menü `uygulama/` kartları `location.assign` ile oyuna gider.
- **Boyut:**
  - `dist` ≈ 38 MB.
  - 22 MB'ı `public/ses` (1369 seslendirme mp3'ü + 432 KB efekt).
  - ≈ 16 MB görsel/kod (`dist/assets`; karakter iskeletleri, arka planlar, film katmanları).
- **Gömülebilir giriş (`oyunuBaslat(kok, { cikis })`):** yalnız Kartlar (`src/oyun.ts`) ve Pazar (`pazar/src/oyun.ts`) hazır. Canlan, Sanatçı, Macera, Film ve Orman yalnız kendi `main.ts`'iyle açılıyor.
- **Ses:**
  - Konuşma kayıtlıysa mp3, değilse cihazın Türkçe sesi (Web Speech `speechSynthesis`, `src/audio/konusma.ts`).
  - Efekt ve müzik Web Audio ile.
- **Mikrofon:** `getUserMedia` (`ses-testi/src/mikrofon.ts`, `orman/src/kulak.ts`). Ses kaydedilmez, kare kare işlenir. Dokunarak oynama her yerde var.
- **Ağ:** yalnız Minik Sanatçı'nın "sihir"i dış sunucuya gider (`sunucu/sihir`, Cloudflare Worker; ebeveyn onayıyla). Geri kalan her şey çevrimdışı çalışır.
- **Kayıt:** ilerleme, albüm, müze ve ayarlar `localStorage`'da. Service worker yok.
- **Yön:** manifest dikey. Film 16:9 ve yatay isteniyor (dikeyde "çevir" simgesi).

## 2. Önerilen yol: iki aşama

### Aşama 1: Capacitor kabuğu, çok sayfalı hâliyle (en hızlı, en az risk)

Capacitor `dist/` klasörünü uygulamanın içine koyar ve yerel bir adresten sunar (Android `https://localhost`, iOS `capacitor://localhost`). Göreli bağlantılar ve çok sayfa bu hâliyle çalışır; oyun kodu değişmeden paket çıkar.

1. `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android` (kurulumda güncel ana sürüm kontrol edilir). Sonra `npx cap init Minkino com.minkino.app --web-dir dist`, `npx cap add ios`, `npx cap add android`.
2. **Açılış sayfası:** Capacitor `dist/index.html`'i açar; bugün o Kartlar oyunu. Seçenekler:
   - (a) derlemede `uygulama/` girişini köke almak (kartlar `kartlar/`'a taşınır), ya da
   - (b) paket derlemesinde kökte yalnız `uygulama/`'ya yönlendiren küçük bir `index.html`.
   (a) temiz ama bağlantıları güncellemek gerekir. **Öneri: (b)**, web sitesi değişmez.
3. **Ana menüye dönüş:** her oyunun "geri" düğmesi bugün kendi açılışına döner. Pakette `uygulama/`'ya dönmeli. `BaslatSecenekleri.cikis` zaten var; çok sayfalı hâlde `location.assign('../uygulama/')` yeterli.
4. **Derleme hattı:** `npm run build && npx cap sync`. `scripts/` altına `paket.mjs` (sürüm numarası, yönlendirme sayfası, ses manifestini kontrol).
5. **Mağaza öncesi zorunlular:** bölüm 4 (izinler), 5 (ses), 6 (çocuk kuralları).

### Aşama 2: tek uygulama (gezinme akıcı, sayfa yenilenmez)

Her oyun için `oyunuBaslat(kok, { cikis })` girişi yazılır (Pazar'daki kalıp). Ana menü oyunları sayfa değiştirmeden açar ve kapatır.

- **Kazanç:** geçişte beyaz ekran yok, müzik ve ses motoru kesilmez, Mino/Kino menüden oyuna "yürüyebilir".
- **İş listesi (her oyun için):**
  - `main.ts`'teki kurulumu `oyun.ts`'e taşı; ekranları `ekranKaydet` ile her açılışta yeniden kaydet (aynı ekran adları çakışıyor: `acilis`, `yas`…).
  - Kök sınıfı (`pz-kok`, `mc-kok`…) ekle; `kapat()` her şeyi (rAF, mikrofon, zamanlayıcı, ses) temizlesin.
  - Sırası: Macera, Canlan, Sanatçı, Film, Orman.
- **Yük:** `import()` ile oyun başına tembel paket (ilk açılış hızlı kalır). Ortak ses/mikrofon motorları tek örnek (`kulak`, `ses`) zaten modül düzeyinde.
- **Risk:** CSS çakışması. Kök sınıflı kurallar çoğunlukla hazır; `ana.css` ortak.

## 3. Varlık boyutu

- 38 MB mağaza için sorun değil. Hedef ilk sürümde < 60 MB.
- **Ses:** 1369 mp3, ~16 KB ortalama. İkinci geçişte 48 kbps mono'ya inmek ≈ %30–40 kazandırır. Kullanılmayan kayıtları (`public/ses/manifest.json`'da olmayanlar) paket betiği ayıklasın.
- **Görsel:** WebP zaten sıkıştırılmış. Karakter iskelet SVG'leri (gömülü WebP) 200–270 KB; ek kazanç düşük.
- **İleride** bölüm başına indirilen içerik paketi (abonelikle açılan bölümler) düşünülebilir. İlk sürümde her şey pakette, kilit yalnız mantıkta.

## 4. İzinler ve mikrofon

- **iOS** (`ios/App/App/Info.plist`):
  - `NSMicrophoneUsageDescription` önerisi: "Minkino, çocuğunuzun sesini, nefesini ve alkışını oyunun içinde anlık dinler. Ses kaydedilmez ve cihazdan çıkmaz."
  - WKWebView `getUserMedia`'yı destekler. İzin sistemi ilk istekte sorulur; oyundaki "Büyükler için" izin ekranı (macera/orman) önce gösterilmeli.
  - `AVAudioSession` kategorisi: çalma ve kayıt aynı anda (`playAndRecord`, hoparlöre yönlendirme). Yoksa mikrofon açılınca ses kulaklığa/ahizeye düşebilir. Küçük bir yerel eklenti ya da Capacitor ayarıyla çözülür; gerçek cihazda denenmeli.
- **Android** (`AndroidManifest.xml`):
  - `RECORD_AUDIO` ve `MODIFY_AUDIO_SETTINGS` izinleri gerekir. Çalışma anında izin istenir; Capacitor'ın WebChromeClient'ı WebView isteğini uygulama iznine bağlar. İzin reddedilirse oyun dokunarak sürer (zaten öyle).
  - Play Console veri güvenliği formu: "ses verisi toplanmaz, cihazda işlenir".
- **Ses kilidi:** algılama eşikleri (`ekip/SES-SISTEMI.md`) pakette değişmez. Ancak WebView mikrofon kazancı tarayıcıdan farklı olabilir: gerçek iPhone ve Android'de üfleme/alkış/konuşma denemesi şart (Barış onayıyla, eşiklere dokunmadan).

## 5. Ses ve konuşma

- **Web Speech yedeği:** Android WebView'da `speechSynthesis` güvenilir değil; iOS'ta çalışır ama ses seçimi sınırlı. Seçenekler:
  - (a) paket öncesi bütün cümlelerin seslendirilmiş olması (kayıt yoksa cihaz sesine düşülmesin; CI'da manifest denetimi), ya da
  - (b) yerel TTS eklentisi (`@capacitor-community/text-to-speech`).
  **Öneri: (a)**, zaten büyük ölçüde kayıtlı; kalanlar için (b) yedek.
- **Otomatik çalma:** ilk dokunuşta ses motorları açılıyor (`sesiAc`); WebView'da da aynı kural geçerli. Android'de `mediaPlaybackRequiresUserGesture` kapatılabilir.
- **Arka plana geçince** (`@capacitor/app` → `appStateChange`): müzik, konuşma ve mikrofon durdurulmalı, geri gelince devam etmeli.

## 6. Çocuk uygulaması kuralları ve abonelik

- **Apple Kids kategorisi / Google Families:**
  - Satın alma, dış bağlantı ve ayarlar ebeveyn kapısı arkasında olmalı. Bugünkü "basılı tut" kapısı çocuk için fazla kolay; mağaza kuralı için yetişkinin çözebileceği bir soru (ör. "on iki artı yedi") eklenmeli.
  - Üçüncü taraf reklam ve izleme yok (bugün de yok).
  - Minik Sanatçı'nın sunucuya gönderimi gizlilik politikasında açıkça yazmalı; onay ekranı hazır.
- **Abonelik:**
  - Mağaza içi satın alma zorunlu (dijital içerik). Öneri: RevenueCat Capacitor eklentisi. Tek kod iki mağaza, makbuz doğrulama sunucuda; ücretsiz deneme ve aile paylaşımı ayarları mağazada.
  - Kilit mantığı: `src/engine/` altında tek bir `erisim.ts` (hangi oyun/bölüm ücretsiz, hangisi abonelikle). Menüdeki kartlarda kilit rozeti, dokununca ebeveyn kapısı → abonelik ekranı. Çevrimdışında son bilinen abonelik durumu `@capacitor/preferences`'ta.
  - Ücretsiz / kilitli dağılımı ürün kararı (Barış).
- **Kayıtların kalıcılığı:** iOS WebView `localStorage`'ı depolama baskısında silinebilir. İlerleme, albüm ve müze için `@capacitor/preferences` ya da dosya sistemine ayna kaydı önerilir. Kod tarafında `src/engine/ilerleme.ts` → `Depo` arayüzü buna hazır.

## 7. Diğer

- **Ekran yönü:** menü ve oyunlar dikey (tablette serbest), film yatay. `@capacitor/screen-orientation` ile film açılınca yataya kilit, çıkınca serbest.
- **Güvenli alan:** CSS `env(safe-area-inset-*)` zaten kullanılıyor. Çentikli cihazlarda ve Android gezinme çubuğunda son kontrol.
- **Açılış ekranı ve ikon:** `@capacitor/splash-screen`; ikon `public/ikon-512.png`'den üretilir (1024 × 1024 kaynak gerekir: tasarımcı).
- **Sanatçı sunucusu:** Worker'ın CORS'u uygulama kökenlerine (`capacitor://localhost`, `https://localhost`) izin vermeli. Sunucu adresi `ayar.json`'dan mutlak adres olmalı.
- **Test:**
  - Playwright takımı web derlemesinde aynen kalır.
  - Paket için gerçek cihaz denemesi: mikrofon (üfleme/alkış/perde/sessizlik), ses (kayıt ve cihaz sesi), yön, arka plan/geri dönüş, uçak modunda açılış.

## 8. Kararlar (Barış'a)

1. Aşama 1 mi (hızlı, çok sayfalı), doğrudan Aşama 2 mi? **Öneri:** Aşama 1 ile TestFlight / iç test, sonra Aşama 2.
2. Paket kimliği ve adı (`com.minkino.app` önerisi), geliştirici hesapları (Apple, Google).
3. Abonelik aracı (RevenueCat önerisi), fiyat, deneme süresi, ücretsiz içerik.
4. Kayıtsız cümlelerin tamamının seslendirilmesi (kredi) ya da yerel TTS yedeği.
5. Ebeveyn kapısına soru eklenmesi (mağaza kuralı).
