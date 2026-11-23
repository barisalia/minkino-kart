# Build 6 hazırlık listesi

**Hazırlayan:** Claude (uygulama yönetici), 17 Kasım 2026.

Build 6 haftaya çıkacak. Barış "yükle" demeden push ve derleme yapılmaz.

## 1. Bu sürüme girenler (yerelde hazır, henüz commit/push yok)

| İş | Nerede | Durum |
|---|---|---|
| Söz tanıma (yalnız cihazda): İngilizce "Şimdi sen söyle" artık söylenen sözcüğe bakıyor | `src/audio/soz-tanima.ts`, `src/audio/soz-esle.ts`, `ingilizce/src/adimlar/ortak.ts`, iOS `ios/App/App/SozTanima.swift`, Android `SozTanimaPlugin.java` | Kod hazır; eşleme testi 7/7. Gerçek cihazda henüz denenmedi. |
| Konuşma tanıma izin metni (iOS) | `Info.plist`, `tr.lproj` / `en.lproj` `InfoPlist.strings` | Hazır |
| Gizlilik sayfası: cihaz içi sözcük tanıma paragrafı | `gizlilik/index.html` (17 Kasım) | Hazır; site push ile yayına girer |
| Hediye kodu düğmesi | `src/abonelik/ekran.ts`, `revenuecat.ts`, `satin.ts` | Hazır; tarayıcıda iOS ve Android kipinde denendi |
| Konuşma kayıtları 64 kb/s | `scripts/uygulama-ses-kucult.mjs` (`npm run build:app` sonunda çalışır) | Hazır. 17 Kasım derlemesinde ölçüldü: 5534 kayıttan 3391 küçüldü, 251 MB → 146 MB (106 MB kazanç); paket 671 → 566 MB |
| Çizimler kalite 85 | `scripts/uygulama-gorsel-kucult.mjs` | Barış'ın onayını bekliyor. Onaylanırsa `build:app` sonuna eklenir (yaklaşık 190 MB kazanç). **Eklemeden önce:** piksel okuyan oyunların çizimleri ya hariç tutulmalı ya da o oyunların e2e testleri küçültülmüş paketle geçmeli: `canlan/src/boya.ts`, `sef/src/kurabiye-tepsisi.ts`, `sef/src/restoran-tadim.ts`, `hazirlik/src/pano-resmi.ts`, `dedektif/src/resimler3.ts`, `macera/src/banyo-efekt.ts`, `src/karakter/yandan.ts` (`getImageData`). |
| iPad yatay alt menüler (Etkinlikler, Oyunlar) | `uygulama/src/yatay-menu.css` (dosya sonu) | Hazır. 6 ya da daha az kartta 2 sütun; kartlar yaklaşık %30 büyük, panel doluyor (önceden alt yarı boştu). 1366×1024, 1180×820 ve 1024×768 boylarında denendi; telefon ve dikey iPad değişmedi |
| İngilizce görsel cilası | `ingilizce/src/stil.css` | Hazır. Oyunlar kartları (telefon), Ceren taşması (iPad), Derse başla oku, Kelimelerim başlığı, sonuç ekranında 2×2, veli köşesi etiketleri. Ayrıntı: `ekip/ingilizce/INGILIZCE-MESAJLAR.md` |
| **İngilizce: tekrar azaldı, tek oyun Fener Avı (18 Kasım)** | `ingilizce/src/plan.ts`, `adimlar/soyle.ts`, `adimlar/fener.ts`, `ekranlar/oyunlar.ts` | Hazır. Dersler kısaldı (her kelime bir kez, oyunlar 3–4 soru). Çıkartma adımında çocuk kelimeyi kendi hatırlayıp söylüyor (ipucu ıskada). Oyunlar bölümünde eski dokuz oyun yerine Fener Avı. Ayrıntı: `ekip/ingilizce/INGILIZCE-MESAJLAR.md` (18 Kasım 01:00) |
| **Kitaplar: ilk raf telefonda görünmüyordu (kritik)** | `kitap/src/kitap.css` (.kt-raf-ekran, .kt-raflar) | Düzeltildi (17 Kasım 23:10). Raflar ortalanıp üstten kesiliyordu, kök `overflow: hidden` olduğu için ilk raftaki 3 ücretsiz kitaba ulaşılamıyordu. Artık raf ekranı dikey kayıyor, sığarsa ortada duruyor. Telefonda, yatay iPad'de ve dikey iPad'de ilk kitap görünüyor, dokununca açılıyor, son kitaba kadar kaydırılabiliyor. Build 5'te (App Store'daki) bu hata var. |
| Hece Evleri (Harf Atölyesi yeni bölüm) | `alfabe/src/hece-evleri*` | Ayrı oturumda; L, K, N, M ücretsiz. 160 hecenin sesi 18 Kasım'da yenilendi ve doğrulandı |
| **Harf Atölyesi: kısa ders, Resimde Bul ışığı, iPad taşmaları (18 Kasım)** | `alfabe/src/main.ts` (`dersAdimlari`), `resimde-bul-hareket.ts`, `resimde-bul.css`, `stil.css`, `obur-tabaklari.ts` | Hazır. Ders 5+ yaşta 9 → 6 adım, 4 yaşta 4, 2–3 yaşta 2; aynı iş bir derste iki kez yok. Resimde Bul'da turuncu odak çerçevesi yerine spot ışığı ve altın yıldızlar. iPad'de yazma adımında kesilen renk kalemleri ve 1280×800'de taşan "Yaz ve hayvanı çağır" düzeldi. Öğleden sonra: Harf rafı yatay iPad / tablette kaydırmadan sığıyor; telefonda Resimde Bul resmi büyüdü (soru çubuğu yanda); ders sonu albüm sayfası; Hece Trambolini ve Hece Evleri kısaldı; Ceren'in Obur ve Resimde Bul tekrarları kalktı. Ayrıntı: `ORTAK_NOTLAR.md` (18 Kasım 06:45, 09:20, 13:20, 13:45, 14:05, 15:00) |
| Matematik: Ceren Öğretmen ile Sayılar 1–10 | `matematik/` | Hazır: Astra'nın bütün çizimleri bağlı. 62 Ceren kaydı tam; 23'ü 17 Kasım 21:30'da üretildi (677 harf) ve Scribe ile birebir doğrulandı. 10'un tanıtımı düzeltildi ("sayı", "rakam" değil). 18 Kasım: ders sayı başına 3 adıma indi (~3 dk); oyuncaklar 16 turdan yaşa göre 6–10 tura indi, aynı tür en çok iki kez ve arka arkaya değil, eski kayıtlar oranıyla taşınıyor. Testler 18 Kasım: birim 22/22, e2e iPad + telefon 72/72. 19 Kasım: 4 ve 5+ yaşta gerçek sesle baştan sona oynandı; Ceren'in çift sayması, kesilen kule sözü, yinelenen övgüler, kolay başlayan 5+ Sayı masası ve telefonda küçük dokunma hedefleri düzeldi (birim 23/23, e2e 72/72, 427 oyun ekranında taşma yok). Barış oynayıp onaylamalı |
| **Pazar açılışı ve İngilizce selam, yatay tablet (18 Kasım)** | `pazar/src/yatay.css` (sonu), `ingilizce/src/stil.css` | Hazır. Pazar'da iPad ve 1280×800'de "Yaşı değiştir" tamamen ekran dışındaydı, "Tart Bakalım" kenardaydı; İngilizce selam/vedada el sallama düğmesi 1280×800'de kesikti. Pazar e2e 40/40, İngilizce 10/10 |
| **Taşma tarama aracı (18 Kasım)** | `scripts/tasma-tara.mjs` | Derlemeden önce bir kez: `node scripts/tasma-tara.mjs` (geliştirme sunucusu açıkken). 7 boyda yarım kesilen ya da ekran dışında kalan düğmeleri listeler; bilerek kesik olanları (alttan kesik Ceren, kayan listeler) gözle ayırın |

**Yerel söz tanıma kodu, derlemeden önce elle denetlendi (17 Kasım 22:55).** Bu bilgisayarda Xcode/Gradle yok; kod `node_modules/@capacitor` (8.5.2) kaynaklarıyla satır satır karşılaştırıldı.
- **iOS (`SozTanima.swift`), dört düzeltme:**
  1. Sözlük içinde türsüz boş dizi (`"metinler": []`) kesin derleme hatasıydı; `[String]()` yapıldı.
  2. `hata as NSError?` güvenli biçime çevrildi.
  3. `override open func capacitorDidLoad` yerine `override func` kullanıldı (iç sınıfta `open` sorunu).
  4. Mikrofon tap'i bayrakla izleniyor; ikinci `installTap` çökmesi önlendi. Ayrıca kullanımdan kalkan `.allowBluetooth` seçeneği çıkarıldı.
- **Android (`SozTanimaPlugin.java`):** Kullanılan bütün Capacitor yöntemleri (`JSObject.put`, `getDouble`, `getArray`, `requestPermissionForAlias`, `bridgeBuilder`) kaynakta doğrulandı; değişiklik gerekmedi.
- **Codemagic / GitHub derlemesinde ilk bakılacak yer:** Derleme kırılırsa önce bu iki dosya.

## 2. Derlemeden önce (yükle denmeden hemen önce)

1. Bütün oturumların işleri bitti mi, yarım iş var mı? Yarım bölüm çocuğa açılmaz.
2. `npx tsc --noEmit` temiz olmalı.
3. `npm test` (birim testleri) sakin makinede çalıştırılır. 17 Kasım 18:50 tam çalıştırmada, 4–5 oturum açık ve makine yüklüyken 20 test düştü:
   - **Menü ve abonelik testleri (17 Kasım 21:25'te düzeltildi):**
     - Testler, commit edilmiş ve Barış'ın onayladığı kararlara göre güncellendi:
       - Dedektif ve Otobüs arşivde, Matematik ve Harf başta.
       - İngilizce `INGILIZCE_MENUDE` bayrağıyla açılır.
       - Pazar yalnız 2–3 yaş için.
       - Kilit düzeni: eski oyunlar tam premium.
       - Fiyatlar 239,99 ve 1.799,99; abonelik listesi 5 madde.
       - Hediye kodu düğmesi var; 6 yaş düğmede "6+".
     - Güncellenen dosyalar: birim `abonelik`, `uygulama`, `kino-otobus`, `pasta-mino-kino` (54/54 geçti); e2e `kabuk.spec.ts`, `uygulama.spec.ts` (iPad dikeyde 14/14, yatayda 10/10 geçti).
   - **`konusma-ilk-cumle`:** Kök neden bulunup düzeltildi (22:57). Yük altında ilk modül dönüşümü 5 sn'yi aşıyordu. Zaman aşımına düşen test arka planda sürüp sonraki testlerin sahte Audio'sunu çağırıyordu; zincirleme "play 3 kez" hatası bundan geliyordu. Ürün kodu hatası değil. Modüller `beforeAll` ile ısıtılıyor, süre 20 sn. Sekiz dosya yük altında birlikte 115/115 geçti.
   - **`canlan-puan`:** Ağır puanlama testleri; yüklü makinede zaman aşımı.
4. `npm run build:app` sonunda iki küçültme satırı okunur (ses, onaylandıysa görsel). Toplam paket ölçülür; hedef 500 MB altı.
5. Depo herkese açık: 100 MB üstü dosya yok, anahtar ya da şifre yok.

## 3. Gerçek cihazda denenecekler (TestFlight / Play iç test)

- **İngilizce "Şimdi sen söyle" (cümle):** "A big cow." adımında çocuk "big cow" ya da "it's a big cow" dediğinde geçmeli; "cow" ya da "table" dediğinde geçmemeli.
- **İngilizce "Şimdi sen söyle":**
  - Doğru sözcük geçiyor.
  - Başka sözcük geçmiyor.
  - 1. ıskada Ceren "Bir daha" diyor, 2. ıskada Polly yavaş örneği söylüyor, 3. ıskada yıldız kalıyor.
- **Tanıyıcı hatası:** iPhone'da İngilizce tanıma modeli inmemişse ya da tanıyıcı hata verirse oyun doğrudan eski yola (ses var/yok) geçiyor; çocuğa boşuna "bir daha" denmiyor.
- **İzin penceresi:** iOS'ta "Konuşma Tanıma" izni ilk "sen söyle"de bir kez soruluyor. İzin verilmezse eski yol (ses var/yok) çalışıyor.
- **Hoparlör:** Dinleme bittikten sonra oyun sesleri hoparlörden devam ediyor, kulaklığa düşmüyor.
- **Android:**
  - 12 ve üstünde yeni yol çalışıyor.
  - 11 ve altında eski yol çalışıyor.
  - Cihazda İngilizce modeli yoksa eski yol çalışıyor.
- **Hediye kodu:**
  - iPhone'da Apple kod penceresi açılıyor.
  - Android'de Google Play kod sayfası açılıyor.
  - Kod kullanılınca ekran "Teşekkürler" diyor.
- **Ses:** Küçültülen sesler kulağa aynı geliyor (Ceren, kitap anlatıcısı, Şef müşterileri).

## 4. Mağaza tarafı

**App Store Connect:**
- 1.0 sürümüne Build 6 seçilir.
- **Header** alanına Astra'nın afişi yüklenir: `ekip/uygulama/appstore-ekran/header/header-5244x2950.png`. İsteğe bağlı ikinci boy: `header-3840x1646.png`.
- Hediye kodu dağıtılacaksa abonelik için **Offer Codes** oluşturulur (Barış).
- App Privacy değişmez: tanıma cihaz içinde, veri toplanmıyor.

**Google Play Console:**
- AAB yüklenir.
- Hediye kodu dağıtılacaksa **Promosyon kodları** oluşturulur (Barış).
- Veri güvenliği formu değişmez: ses cihaz içinde işleniyor, toplanmıyor.

## 5. "Yenilikler" metni (öneri)

> Yeni: Hece Evleri! Ceren Öğretmen'le kapıları çal, heceleri oku, anahtarları topla.
> İngilizcede artık söylediğin sözcüğü dinliyoruz; yanlışta nazikçe bir daha deniyoruz.
> Hediye kodu desteği ve daha küçük uygulama boyutu.

**Derlenmiş paket denetimi (19 Kasım 14:30, yalnız yerel):** Son kodla `vite build` 0 hata. Alfabe, Hece ve Matematik e2e pakete karşı iPad + telefon 122/122; İngilizce 10/10. Build 6 öncesi aynı denetim tekrarlanmalı: `npx vite build`, ardından `vite preview --port 4173` ve `E2E_ADRES=http://localhost:4173/ npx playwright test -c playwright.gelistirme.config.ts …`. Geliştirme sunucusu, birden çok oturum dosya değiştirirken sayfaları yenileyebildiği için kesin sonuç vermez.
