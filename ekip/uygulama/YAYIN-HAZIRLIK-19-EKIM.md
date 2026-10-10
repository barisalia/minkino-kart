# Minkino: 19 Ekim yayın hazırlığı (denetim + kontrol listesi)

> Hazırlayan: yayın mühendisi (salt okuma denetimi), 2026-10-10. Denetimde kod değiştirilmedi; kod ve belge işleri aynı gün ayrıca yapıldı (aşağıda "Durum").
> Dayanak: `android/`, `ios/`, `codemagic.yaml`, `.github/workflows/android.yml`, `vite.config.ts`, `uygulama/src/oyunlar.ts`, `src/engine/erisim.ts`, `src/abonelik/*`, `src/kabuk/*`, `gizlilik/`, `sartlar/`, `ekip/uygulama/*.md`, `ORTAK_NOTLAR.md`, `assets/uygulama/magaza-ekranlari/`.
> Ürün: com.minkino.app · Capacitor 8 · Google Play kapalı test sürüyor · üretim hedefi ~19 Ekim 2026.

İşaretler: **[ENGEL]** = yayından önce mutlaka · **[ÖNEMLİ]** = yayın haftasında yapılmalı · **[KÜÇÜK]** = sonra da olur · **✓ YAPILDI** = 2026-10-10'da kodda/belgede yapıldı.

---

## Durum (2026-10-10, yayın mühendisi): kod ve belge işleri yapıldı

**Yapıldı:**
- ✓ **E3 iOS gizlilik bildirimi:** `ios/App/App/PrivacyInfo.xcprivacy` eklendi ve Xcode projesinde uygulama hedefinin kaynaklarına bağlandı (`project.pbxproj`: dosya, App grubu, "Copy Bundle Resources"). İçerik: takip yok (`NSPrivacyTracking` false, takip alan adı yok); gerekçeli API: yalnız UserDefaults → CA92.1 (`@capacitor/preferences`). Eklentiler tarandı: Capacitor çekirdeğinin kendi bildirimi boş; App, Splash Screen, Screen Orientation ve RevenueCat Capacitor köprüsünde dosya zaman damgası, açılış süresi (boot time), disk alanı API'si yok. RevenueCat'in yerel SDK'sı (SPM ile gelen purchases-ios) kendi bildirimini taşır. Toplanan veri: Satın alma geçmişi, kullanıcı kimliğine bağlı, yalnız uygulama işlevi, takip için değil.
- ✓ **E4 mağaza metni yer tutucuları:** `[N] gün` → 7 gün (TR/EN), `[bağlantı]` → uygulamanın kullandığı gizlilik ve şartlar adresleri (`src/kabuk/ayar.ts → SITE`).
- ✓ **Mağaza metinleri (§4.2 1-9):** Ada'nın Doğum Günü (5. macera), Meyve Suyu Köşesi, Tart Bakalım; Pasta'nın adı "Mino ile Kino'nun Pasta Otobüsü"; "Yenilikler" (5 macera, Dedektif, Giysin); §7 abonelik listesi uygulamadakiyle aynı (Kartlar ücretsiz, "Tüm kart paketleri" çıktı); §8 Pazar satırına ölçme ve renk karışımı; yayımlanmamış kitaba atıf yapan cümle çıktı; ücretsiz olanlar açıkça yazıldı; "Kişisel veri toplanmaz" cümlesi RevenueCat'e göre düzeltildi ("çocuğunuzdan kişisel veri toplanmaz… yalnızca mağazanın satın alma bilgisi işlenir").
- ✓ **E5 yaş:** metne dokunulmadı; "3-6" ve "3-8"in geçtiği her yer MAGAZA-METINLERI.md'nin başında listelendi. Karar Barış'ın.
- ✓ **Gizlilik politikası:** Çiz Canlansın "Kartım" paragrafı (TR + EN): kart cihazda yapılır; paylaşma/kaydetme yalnız ebeveyn kapısından sonra, cihazın kendi paylaşım menüsü ya da fotoğraf arşiviyle; hiçbir yere yüklenmez, bize gelmez; iletişim minkinokids@gmail.com. Ebeveyn kapısı maddesine "paylaşma" eklendi, tarih 10 Ekim. Şartlar: kendi çiziminden yapılan kartı kişisel paylaşma izni eklendi, tarih 10 Ekim. İki sayfanın görünen metninde "barisalidogan" yok (birim testi bekçisi: `tests/unit/aile-politikasi.test.ts`).
- (tarihçe; 2026-10-10 (2) menüde açıldı) ✓ **Kino'nun Otobüsü uygulama paketinden çıktı** (`vite.config.ts → UYGULAMADA_YOK`, `KINO_OTOBUS_MENUDE` false iken). Web derlemesinde `/kino-otobus/` denemek için duruyor. Menüye açılınca (`uygulama/src/oyunlar.ts → KINO_OTOBUS_MENUDE = true`, tek satır) sayfa pakete kendiliğinden geri girer.
- (tarihçe; 2026-10-10 (2) VAKA3_YAYINDA = true) ✓ **Dedektif Vaka 3:** uygulama derlemesinde `VAKA3_YAYINDA` false iken `?vaka=3`, `?vaka3=1` ve test kısayolu `ekran=vaka3` yok sayılır, vaka seçimi açılır (`dedektif/src/mantik3.ts → vaka3Gorunur`, `dedektif/src/oyun.ts`). Web'de deneme adresleri çalışmaya devam eder. Testler: `tests/unit/dedektif-vaka3.test.ts`, `tests/e2e/dedektif-uygulama.spec.ts` (UYGULAMA_DIST ile).
- ✓ **Ekran görüntüsü 01 (ana menü)** yeniden çekildi: Pasta kartında "Mino ile Kino'nun" tabelası var. 4 boyut × TR/EN (`iphone-2796x1290`, `android-1920x1080` yatay; `ipad-2048x2732`, `play-tablet-1440x2560` dikey). 02-07 değişmedi.
- Denetim: `npm test` (52 dosya), `npm run build`, `npm run build:app`, e2e kabuk + uygulama + aile-politikasi (26), dedektif-uygulama (uygulama derlemesiyle) geçti.
- ✓ **2026-10-10 (2), yeni içerik yayında:** `KINO_OTOBUS_MENUDE = true` (menüde 9. kart; sayfa uygulama paketine girdi) ve `VAKA3_YAYINDA = true` (Dedektif Vaka 3 "Kaybolan Yıldız Kurabiyeler", Vaka 2 çözülünce açılır). Mağaza metinleri (§3, §4, §5, §7, §8) ve ekran görüntüleri güncellendi: 01 dokuz kartlı menü, 07 Kino'nun Otobüsü (eski Pasta karesi çıktı; gerekçe MAGAZA-METINLERI.md §6). 4 boyut × TR/EN, 56 görsel, boyutları denetlendi. Erişim: Kino'nun Otobüsü Gün 1 ücretsiz, Gün 2-3 ve kalan süsler abonelikle; Vaka 3 abonelikle (`src/engine/erisim.ts`).
- ✓ **Gizlilik denetimi (yeni içerik):** Kino'nun Otobüsü ve Vaka 3 çevrimdışı ve yalnız yerel: ağ çağrısı (`fetch`, XHR, WebSocket, sendBeacon) yok, mikrofon/kamera/paylaşım yok, yeni bağımlılık yok (package.json aynı). İlerleme yalnız cihazda (`localStorage`: `minkino-kino-otobus-v1`, Vaka 3 için mevcut `minkino-dedektif-v1`). Veri güvenliği / App Privacy formlarında, PrivacyInfo.xcprivacy'de ve gizlilik politikasında değişiklik gerekmez.

**Hâlâ Barış'ın işi (kod değil):**
1. **Veri formları (E1):** Play Console → Veri güvenliği ve App Store Connect → Uygulama Gizliliği: "Satın alma geçmişi" = toplanıyor, kullanıcı kimliğine bağlı, yalnız uygulama işlevi, takip yok, paylaşılmıyor (bkz. §8 adım 6). PrivacyInfo.xcprivacy de aynısını söylüyor; form ile dosya çelişmemeli.
2. **RevenueCat anahtarları ve ürünler (E2):** `REVENUECAT_ANDROID_KEY` (GitHub), `REVENUECAT_IOS_KEY` (Codemagic), `premium` yetkisi, aylık + yıllık ürün, 7 gün deneme.
3. **Mağaza sözleşmeleri:** Apple "Paid Apps" + banka/vergi; Google ödeme profili.
4. **Yaş kararı (E5):** "3-6" mı "3-8" mi; yerleri MAGAZA-METINLERI.md'nin başında.
5. **Kendi alan adı (§5):** gizlilik/şartlar adresi hâlâ `minkino-site.barisalidogan.workers.dev`; mağaza açıklamasındaki ve formlardaki bağlantılarda bu ad görünüyor. Alan adı alınınca kodcu `src/kabuk/ayar.ts → SITE` ve MAGAZA-METINLERI.md'yi değiştirir.
6. Metinleri ve yeni görselleri (01 dokuz kartlı menü, 07 Kino'nun Otobüsü; 7 görselin hepsi yeniden üretildi, 06 ve 07 başlıkları değişti) mağazalara yüklemek (§8 adım 8-9), inceleme notları, Tart Bakalım çizimi gelmezse düğmeyi gizleme kararı (yönetici).

---

## 0. Özet: önce bunlar

| # | Ne | Kimin işi |
|---|---|---|
| E1 | **Veri güvenliği / App Privacy formları "Veri toplanmıyor" diyor; ama RevenueCat satın alma makbuzunu ve anonim kimliği sunucusuna gönderiyor** (gizlilik politikamız da bunu yazıyor). Formlarda en azından "Satın alma geçmişi: toplanıyor, yalnız uygulama işlevi, paylaşılmıyor, takip yok" işaretlenmeli. | Barış (form), yönetici (RevenueCat rehberine göre son kontrol) |
| E2 | **RevenueCat anahtarları + abonelik ürünleri + mağaza sözleşmeleri** (Apple "Paid Apps" sözleşmesi, banka/vergi; Google ödeme profili). Anahtar yoksa uygulamada her şey bedava açılır ve abonelik ekranı "Yakında" der; ürünler yüklenmezse "Mağazaya ulaşılamıyor" der. İkisi de Apple'da red sebebi. | Barış |
| E3 | ✓ **YAPILDI (2026-10-10).** ~~**iOS gizlilik bildirimi (PrivacyInfo.xcprivacy) uygulamada yok.**~~ `@capacitor/preferences` iOS'ta UserDefaults kullanıyor; Apple bunun gerekçesini (CA92.1) istiyor. Eksikse App Store Connect yüklemeyi ITMS-91053 ile reddedebilir. | Kodcu (küçük iş: dosya + Xcode projesine ekleme) |
| E4 | ✓ **YAPILDI (2026-10-10):** 7 gün ve adresler yazıldı; Barış yalnız kopyalayıp yapıştırır. ~~**Mağaza metninde doldurulmamış yerler**~~: uzun açıklamada `[N] gün` ve `[bağlantı]` (TR ve EN). 7 gün ve gizlilik/şartlar adresleri yazılmalı. Apple, abonelikli uygulamada kullanım koşulları bağlantısını açıklamada (ya da EULA alanında) arar. | Senarist / Barış (kopyala-yapıştır) |
| E5 | (2026-10-10: geçtiği yerler MAGAZA-METINLERI.md başında listelendi; metne dokunulmadı, karar bekleniyor) **Yaş tutarsızlığı**: mağaza metni "3-6 yaş", gizlilik ve şartlar "3-8 yaş", Play hedef kitlesi "5 ve altı + 6-8". Tek bir ifade seçilmeli (öneri: metinlerde "3-6 yaş için", Play'de 5 ve altı + 6-8; gizlilik/şartlar "3-8" kalabilir ama mağaza açıklamasıyla çelişmemesi için "okul öncesi" vurgusu yeterli). Karar Barış'ın. | Barış karar, senarist uygular |

Önemli olanlar: ekran görüntüsü 01'in yenilenmesi (Pasta kartı eski), mağaza metninde eksik oyunlar (Ada'nın Doğum Günü, Tart Bakalım, Meyve Suyu), gizlilik adresinde "barisalidogan" geçmesi, Tart Bakalım'daki yer tutucu çizim, inceleme notları. Ayrıntılar aşağıda.

---

## 1. Sürüm numaraları

| Platform | Nerede | Şu an | Nasıl artıyor |
|---|---|---|---|
| Android versionCode | `android/app/build.gradle` → `surumKodu` özelliği (varsayılan 1) | GitHub Actions çalıştırma numarası (`SURUM_KODU = github.run_number`) | **Kendiliğinden**, her "Android (APK + AAB)" çalıştırmasında +1 |
| Android versionName | aynı dosya → `surumAdi` (varsayılan "1.0") | `1.0.<çalıştırma no>` (ör. 1.0.42) | Kendiliğinden |
| iOS sürüm (CFBundleShortVersionString) | `ios/App/App.xcodeproj/project.pbxproj` → `MARKETING_VERSION = 1.0` | **1.0** | **Elle**; kod değişikliği gerekir |
| iOS derleme no (CFBundleVersion) | aynı dosya → `CURRENT_PROJECT_VERSION` | Codemagic `BUILD_NUMBER` ile değiştiriliyor (`codemagic.yaml`) | Kendiliğinden |

**Üretim için ne artmalı?**
- **Android:** Elle hiçbir şey. En temiz yol: kapalı testte denenmiş son `.aab`'yi Play Console'da **"Üretime yükselt" (Promote)** ile aynen üretime almak; yeni paket yüklenecekse yeni çalıştırma zaten daha büyük kod üretir. (İsim "1.0.42" gibi görünür; sorun değil. Daha sade bir ad istenirse kodcu `SURUM_ADI`'nı değiştirir; şart değil.)
- **iOS:** İlk App Store sürümü **1.0** olarak gidebilir; artırmak gerekmez. **1.0 onaylandıktan sonraki her mağaza sürümünde** `MARKETING_VERSION` elle 1.0.1 / 1.1 yapılmalı (kodcu işi), yoksa App Store Connect yeni sürüm açtırmaz.
- [KÜÇÜK] `package.json` "version": "0.1.0" mağazayı etkilemez.

---

## 2. Pakette ne var, kullanıcı ne görüyor?

**Uygulama derlemesi** (`npm run build:app`, `vite.config.ts`): ana menü, kartlar, canlan, macera, pazar, pasta, dedektif, giysin, film ve (2026-10-10 (2)'den beri, `KINO_OTOBUS_MENUDE = true`) kino-otobus sayfaları girer. Girmeyenler: ses-testi, orman (Uyuyan Orman), eski /uygulama/ yönlendirmesi, gizlilik, şartlar (bunlar web sitesine bağlanır). **Okula Hazırım tamamen yok** (klasör, sayfa, içerik ve kod içinde iz kalmamış; mikrofon metinlerinde de geçmiyor).

**Ana menü: 9 kart** (`uygulama/src/oyunlar.ts`, `KINO_OTOBUS_MENUDE = true`; 2026-10-10 (2) öncesi 8 kart). Erişim tablosu: `src/engine/erisim.ts`.

| # | Kart | İçinde görünenler | Ücretsiz / Premium |
|---|---|---|---|
| 1 | Kartlar (rozet "Hafıza") | 6 soru tipi, yaş × tema, albüm, Hafıza oyunu | **Tamamen ücretsiz** |
| 2 | Mino'nun Pazarı (rozet "Meyve Suyu") | Oyna, Meyve Suyu Köşesi, **Tart Bakalım** (yeni, 3. düğme) | Premium (hepsi) |
| 3 | Çiz Canlansın (rozet "Müzem") | Çizim, Müzem, "Kartım" (paylaş/kaydet, ebeveyn kapılı) | Premium |
| 4 | Sesli Maceralar (rozet "Yeni: Salıncak") | 5 bölüm: Ada'nın Doğum Günü, Şşş Ege Uyuyor!, Mino Banyo Yapmıyor!, Elektrikler Kesildi!, Salıncak Kimin? | Yalnız **Elektrikler Kesildi!** ücretsiz |
| 5 | Çizgi Filmler | 6 film (Mino'nun Karpuzu, Mino'nun Sepeti, Kino ve Elma Kulesi, Kino ve Kaydırak, Kino ve Sihirli Söz, Kino ve Oyuncak Sepeti) | Yalnız **Mino'nun Karpuzu** ücretsiz |
| 6 | Dedektif Mino (rozet "Yeni") | Vaka 1 "Devrilen Lamba", Vaka 2 (Vaka 1 çözülünce açılır), **Vaka 3 "Kaybolan Yıldız Kurabiyeler"** (Vaka 2 çözülünce açılır; `VAKA3_YAYINDA = true`) | Premium |
| 7 | Kino Ne Giysin? (rozet "Yeni") | 4 mevsim | Yalnız **Kış** ücretsiz |
| 8 | Kino'nun Otobüsü (rozet "Yeni") | Dondurma otobüsü, 3 gün (park, plaj, doğum günü), akşam kumbara sayımı, otobüs süs dükkânı | Yalnız **Gün 1** ücretsiz (ilk iki süs dahil) |
| 9 | Mino ile Kino'nun Pasta Otobüsü (geniş kart; altta "Pasta Otobüsü", üstte "Mino ile Kino'nun" tabelası) | 3 gün | Premium |

Ayrıca menünün köşesindeki ayar düğmesi → ebeveyn kapısı → **Ebeveyn Köşesi**: ayarlar, "Aboneliği yönet", gizlilik ve şartlar bağlantıları, minkinokids@gmail.com, en altta "İnceleme kodu".

**Pakette olup kullanıcının göremedikleri:**
- ✓ YAPILDI (2026-10-10): sayfa uygulama paketinden çıkarıldı (bayrak false iken). Eski tespit: [ÖNEMLİ] **Kino'nun Otobüsü** sayfası pakette (çizimleriyle birlikte), menüde kartı yok; uygulamada adres çubuğu olmadığı için ulaşılamaz. Zararsız ama paketi büyütüyor ve "gizli özellik" gibi görünebilir. Öneri: açılana kadar `vite.config.ts` → `UYGULAMADA_YOK` listesine `kinoOtobus` eklensin (kodcu, 1 satır). Karar yöneticinin.
- 2026-10-10 (2): ikisi de artık yayında (yukarıdaki tablo); bu iki madde tarihçe.
- Dedektif Vaka 3 kodu pakette. ✓ 2026-10-10: uygulama derlemesinde `?vaka=3`, `?vaka3=1` ve `ekran=vaka3` artık yok sayılıyor (yalnız `VAKA3_YAYINDA = true` açar); web'de deneme adresleri çalışır.

---

## 3. Aileler politikası ve Veri güvenliği tutarlılığı

### 3.1 Ağ çağrıları
- Oyun kodunda `fetch` yalnız **paketin kendi dosyalarına** (göreli yollar: `../ses/`, `./ses/`, film/müzik/karakter SVG'leri). Dışarıya giden çağrı yok.
- `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`: **yok**.
- Analitik / hata izleme (Firebase, Sentry, gtag, PostHog, Mixpanel, Amplitude): **yok**. Yazı tipi paket içinde (`@fontsource/fredoka`), Google Fonts çağrısı yok.
- Koddaki tek dış adresler: gizlilik/şartlar sayfaları (`src/kabuk/ayar.ts → SITE`), mağaza abonelik yönetim sayfaları. Hepsi ebeveyn kapısının arkasında, kullanıcı dokununca tarayıcıda açılır.
- **Tek üçüncü taraf: RevenueCat** (`@revenuecat/purchases-capacitor`). Anonim kullanıcı kimliği + mağaza makbuzu RevenueCat sunucusuna gider; kayıt düzeyi WARN (anahtar loga düşmez).
- `sunucu/sihir` Worker'ını hiçbir oyun kullanmıyor (Minik Sanatçı kaldırıldı). [KÜÇÜK] Cloudflare'deki Worker Barış tarafından silinebilir.

### 3.2 Android izinleri (`AndroidManifest.xml`)
- `INTERNET`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`; mikrofon `required="false"` (mikrofonsuz cihaz da kurar). Doğru.
- **AD_ID kaldırılmış** (`tools:node="remove"`): ✓. [KÜÇÜK] Aynı satır iki kez yazılmış; zararsız, sonra temizlenebilir.
- RevenueCat kütüphanesi birleştirmede `BILLING` iznini ekler; normal.
- targetSdk 36, minSdk 24: Play şartlarına uygun.

### 3.3 Mikrofon (yalnız Sesli Maceralar)
- Mikrofonu artık **yalnız Sesli Maceralar** kullanıyor (`macera/src/*`, Uyuyan Orman'ın `kulak.ts` analizini paylaşır). Okul kaldırıldığı için başka kullanan yok.
- iOS metni (`Info.plist → NSMicrophoneUsageDescription`): "bazı oyunlarda üfleme, ses, alkış; yalnız cihazda, kaydedilmez, gönderilmez; izin yoksa dokunarak". **Doğru ve hâlâ geçerli** (oyun adı geçmiyor, Okul'dan söz etmiyor).
- Uygulama arka plana geçince mikrofon izi kapatılıyor (`src/kabuk/yerel.ts`). ✓
- Mağaza metni ve gizlilik politikası aynı şeyi söylüyor. ✓

### 3.4 Fotoğraflara ekleme (Çiz Canlansın → "Kartım")
- iOS: `NSPhotoLibraryAddUsageDescription` var ("yalnız siz istediğinizde Fotoğraflar'a kaydetmek için; fotoğraflarınızı okumaz"). Doğru: kart, paylaşım sayfasından ya da resmi basılı tutup "Fotoğraflar'a ekle" ile kaydediliyor. Uygulama fotoğraf **okumuyor**.
- Android: WebView'da paylaşım yok; kart penceresi açılır ve "ekran görüntüsü alabilirsin" der. İzin istenmiyor. ✓
- ✓ YAPILDI (2026-10-10): gizlilik politikasına "Kartım" paragrafı eklendi (TR + EN). ~~[ÖNEMLİ] **Gizlilik politikasında bu özellik hiç geçmiyor** (bkz. §5).~~

### 3.5 Paylaşım sayfası ebeveyn kapısının arkasında mı?
- Evet. `canlan/src/ekranlar.ts`: "Kartım" düğmesi → önce `ebeveynKapisiAc` → geçilirse `navigator.share` (sistem paylaşım sayfası). ✓
- Diğer dış bağlantılar (gizlilik, şartlar, aboneliği yönet, e-posta) Ebeveyn Köşesi'nde ya da abonelik ekranında; ikisi de kapının arkasında. ✓
- Kilitli içeriğe dokunan çocuk önce "Bunu anne-babanla açabilirsin" ekranını görüyor; satın alma ekranı ancak "Büyükler için" → kapı → abonelik. ✓ (Teacher Approved / Aileler kuralı)

### 3.6 Belgelerin beyanı ile karşılaştırma (UYUMSUZLUKLAR)

| Konu | Belgede yazan | Gerçek durum | Yapılacak |
|---|---|---|---|
| **Veri toplama** | IKI-MAGAZA-SIRA: "Veri toplanmıyor"; YAYIN-ADIMLARI §3: "Veri toplanmıyor / paylaşılmıyor"; §4 Apple: "Veri toplanmıyor" | RevenueCat makbuz + anonim kimlik gönderiyor; gizlilik politikamız da bunu açıkça yazıyor | **[ENGEL] E1.** Play Veri güvenliği: "Satın alma geçmişi" = toplanıyor, paylaşılmıyor, amaç "Uygulama işlevi", aktarımda şifreli, silme talebi e-postayla. Apple App Privacy: "Satın Almalar → Satın alma geçmişi", amaç "Uygulama İşlevi", takip için kullanılmıyor. RevenueCat'in "Google Play Data Safety" ve "Apple App Privacy" yardım sayfalarıyla son kez karşılaştırın. Ses kayıtları: toplanmıyor (doğru). |
| Reklam | "Reklam yok" | Reklam kodu yok, AD_ID kaldırılmış | ✓ |
| Yaş | IKI-MAGAZA: "5 yaş ve altı + 6-8"; metinler "3-6"; gizlilik/şartlar "3-8" | — | **[ENGEL] E5** (tek ifade) |
| Ücretsiz içerik | YAYIN-ADIMLARI §0: "Kartlar · Karpuz · Elektrikler Kesildi" | Buna ek olarak **Kino Ne Giysin? Kış** da ücretsiz | [KÜÇÜK] belge güncellensin |
| Premium listesi (MAGAZA-METINLERI §7) | "Tüm kart paketleri" premium'la açılır | **Kartlar tamamen ücretsiz**; uygulamadaki liste: Maceralar, filmler, "Pazar, Pasta Otobüsü, Çiz Canlansın", "Dedektif Mino ve Kino Ne Giysin? mevsimleri", yeni bölümler, reklamsız | [ÖNEMLİ] §7 uygulamadaki listeye göre düzeltilsin (mağaza abonelik açıklamasına da bu gider) |
| Uygulamada olmayanlar (YAYIN-ADIMLARI §0) | "Mikrofon testi, Uyuyan Orman" | Doğru; Okul da yok | [KÜÇÜK] "Okula Hazırım kaldırıldı" eklensin |

---

## 4. Mağaza metinleri ve ekran görüntüleri

### 4.1 Doğru olanlar ✓
- Okul / Okula Hazırım hiçbir mağaza metninde ve ekran görüntüsünde yok.
- Pasta'nın yeni adı her yerde: "Mino ile Kino'nun Pasta Otobüsü" (EN: "Mino & Kino's Bakery Bus"), abonelik listesi ve öğrenme kazanımları dahil.
- Dedektif Mino ve Kino Ne Giysin? uzun açıklamada var.
- Öne çıkan görsel (`one-cikan.png`): Mino-Kino + logo; eski oyun göstermiyor.
- İletişim e-postası her yerde minkinokids@gmail.com.

### 4.2 Güncellenmesi gerekenler (MAGAZA-METINLERI.md) · ✓ 1-9 YAPILDI (2026-10-10); 7. madde: kitap cümlesi çıkarıldı
1. **[ENGEL]** Uzun açıklama TR/EN: `[N] gün` → **7 gün** / `[N]-day` → **7-day**; `[bağlantı]` / `[link]` → gizlilik ve şartlar adresleri.
2. **[ÖNEMLİ] Sesli Maceralar** maddesi 4 bölüm sayıyor; uygulamada **5** var. Eksik: **Ada'nın Doğum Günü** (EN öneri: "Ada's Birthday"). Kısa bir satır eklenmeli (ör. "Ada'nın Doğum Günü: balonları şişir, pastayı süsle, partiye katıl!"; içerik yazarı bölümün gerçek görevlerine göre düzeltsin).
3. **[ÖNEMLİ] Mino'nun Pazarı** maddesine **Meyve Suyu Köşesi** ve **Tart Bakalım** eklenmeli (ör. "Meyve Suyu Köşesi'nde renkleri karıştır, Tart Bakalım'da meyveleri say ve kantarda tart!" / EN: "Mix colours at the Juice Corner and weigh fruit on the scales in Weigh It!"; EN adını senarist seçsin).
4. **[ÖNEMLİ] "Yenilikler (ilk sürüm)"** listesinde Dedektif Mino ve Kino Ne Giysin? yok; "4 Sesli Macera" → "5 Sesli Macera".
5. **[ÖNEMLİ] §7 "Ne açılıyor"** listesi (TR/EN) uygulamadakiyle aynı yapılmalı ("Tüm kart paketleri" çıkmalı; Kartlar ücretsiz).
6. **[ÖNEMLİ] §8 öğrenme kazanımları**: Pazar satırına Tart Bakalım (ölçme, ağır-hafif, yarım-bir kilo, sayma) eklenmeli.
7. **[ÖNEMLİ] Kitap cümlesi**: "Mino ile Kino'yu kitaplarından tanıyorsanız…" Kitap henüz yayımlanmadı (kitap planı ileride). Yayında olmayan ürüne atıf incelemede soru doğurabilir; kitap çıkana kadar bu cümle çıkarılsın ya da "yakında kitaplarda da" gibi yumuşatılsın. Karar Barış'ın.
8. [KÜÇÜK] Dosyanın en altındaki "Uzun açıklamada Dedektif Mino henüz yok" notu eskidi (artık var); silinsin.
9. [KÜÇÜK] "Bazı oyunlar ücretsiz" doğru; istenirse açıkça yazılabilir: "Kartlar, bir çizgi film, bir macera ve Kino Ne Giysin? kışı ücretsiz."

### 4.3 Ekran görüntüleri (`assets/uygulama/magaza-ekranlari/`, 2026-10-08)
- Setler tam: tr/en × `android-1920x1080`, `play-tablet-1440x2560`, `iphone-2796x1290` (6.9"/6.7" yuvasına uygun), `ipad-2048x2732`; her birinde 7 kare. Okul yok. ✓
- ✓ YAPILDI (2026-10-10): 01 dört boyutta, iki dilde yeniden çekildi. Eski tespit: **[ÖNEMLİ] 01 (ana menü) eski**: Pasta kartı yalnız "Pasta Otobüsü" yazıyor; 2026-10-09'dan beri kartın sol üstünde "Mino ile Kino'nun" tabelası var. 01 dört boyutta ve iki dilde yeniden çekilmeli (`ekip/illustrator/magaza-cekim.cjs` → `magaza-ekran.cjs`, Play tablet `scripts/uygulama/play-tablet-ekran.cjs`).
- 07 (Pasta oyun içi): 10-09'daki değişiklikler (Kino'nun karşılaması, açılış rozetleri) bu karede belirgin değil; yenilemek şart değil ama 01 çekilirken 07 de tazelenirse iyi olur.
- [KÜÇÜK] Tart Bakalım için bir kare yok; isterse ileride 02 (Pazar) yerine/yanına eklenebilir. Ancak Tart Bakalım'da çürük domates şu an yer tutucu (bkz. §7); çizim gelmeden ekran görüntüsüne konmamalı.
- Mağazada eski dikey telefon görselleri kaldıysa silinip yatay set yüklenmeli (MAGAZA-METINLERI §6 notu).

---

## 5. Gizlilik politikası (`gizlilik/index.html`) ve şartlar

- İletişim: **minkinokids@gmail.com** (TR ve EN, "Haklarınız" ve "İletişim"). ✓
- Sayfa metninde **"barisalidogan" geçmiyor**. ✓ (sartlar da temiz.)
- **[ÖNEMLİ] Ama sayfanın adresi** `https://minkino-site.barisalidogan.workers.dev/gizlilik/`. Bu adres Play ve App Store kaydında, abonelik ekranında ve Ebeveyn Köşesi'nde görünüyor; tarayıcı adres çubuğunda da okunuyor. Kişisel ad herkese açık bir adreste. Çözüm (biri seçilir):
  - Kendi alan adı (ör. minkino…), Cloudflare'de siteye bağlanır; sonra `src/kabuk/ayar.ts → SITE` ve mağaza formlarındaki adresler değişir (kodcu + Barış).
  - Ya da Cloudflare hesabının workers.dev alt adı değiştirilir (eski adres çalışmaz olur; mağaza formları aynı gün güncellenmeli).
  - Yayından önce yetişmezse: yayından sonraki ilk güncellemede yapılabilir; mağaza bunun için reddetmez.
- İçerik doğru olanlar: veri toplanmıyor, analitik/reklam yok, mikrofon cihazda, ilerleme cihazda, RevenueCat anonim kimlik + makbuz, ebeveyn kapısı, COPPA/GDPR/KVKK, silme hakkı ve 30 gün. ✓
- ✓ YAPILDI (2026-10-10). Eski tespit: **[ÖNEMLİ] Eksik:** Çiz Canlansın "Kartım": "Resim kartı yalnız büyük onay verince (ebeveyn kapısı) sistem paylaşım sayfasıyla paylaşılır ya da Fotoğraflar'a kaydedilir; Minkino fotoğraflarınızı okumaz, kartı kendisi hiçbir yere göndermez." cümlesi TR/EN eklenmeli; "Son güncelleme" tarihi yenilenmeli.
- [ÖNEMLİ] Yaş ifadesi (3-8) mağaza metniyle uyumlu hale getirilmeli (E5).
- [KÜÇÜK] Şartlar sayfası: Apple standart EULA'ya atıf var ✓, otomatik yenileme ✓, geri yükleme ✓.
- [KÜÇÜK] Repo herkese açık; README ve ekip belgelerinde "barisalidogan" geçiyor (site adresi olarak). Kamuya açık sayfa değil ama adres değişince bunlar da güncellenir.

---

## 6. Abonelik ekranı, RevenueCat ve mağaza incelemesi

| Kontrol | Durum | Not |
|---|---|---|
| Fiyatlar mağazadan (yerel para birimi) | ✓ `priceString`; yıllıkta "ayda …" `pricePerMonthString` | Mağaza yokken yedek "99 TL / 499 TL" yalnız bilgi |
| **Deneme hakkı** | ✓ iOS: `checkTrialOrIntroductoryPriceEligibility`; yalnız "uygun" ise "7 gün ücretsiz dene" yazar, bilinmiyorsa vaat etmez. Android: varsayılan teklifin ücretsiz evresi (Google yalnız hakkı olana verir) | Doğru kurgu |
| Düğme metni | Deneme varsa "Ücretsiz denemeyi başlat", yoksa "Abone ol"; altında "Deneme bitince [fiyat] / [ay/yıl]. İstediğin zaman iptal edebilirsin." | ✓ |
| **Satın alımları geri yükle** | ✓ Düğme her zaman görünür; sonuç yazısı var | ✓ |
| Otomatik yenileme metni | ✓ Platforma göre (Apple / Google), TR + küçük EN | ✓ |
| **Gizlilik ve Kullanım koşulları bağlantıları** | ✓ Abonelik ekranında ve Ebeveyn Köşesi'nde | Adres meselesi §5 |
| Çocuk satın alma ekranını doğrudan görmüyor | ✓ kilit anı → "Büyükler için" → ebeveyn kapısı → abonelik | ✓ |
| Anahtar yoksa | Kilit yok, ekran "Yakında" | **[ENGEL] E2**: üretim derlemesinde anahtar mutlaka olmalı |
| **İnceleme kodu yalnız özet olarak** | ✓ `src/abonelik/inceleme.ts`: yalnız SHA-256 özeti (`INCELEME_OZETI`); kodun kendisi repoda yok; testler `?inceleme-ozet=` ile başka özet kullanıyor | Kod Barış'ta |
| İnceleme kodu kapsamı | Yalnız o cihazda `localStorage` ile açar; RevenueCat'ten bağımsız | ✓ |

**İnceleme için yapılacaklar**
- [ÖNEMLİ] İnceleme kodu **uzun ve tahmin edilemez** olmalı (en az 12 karakter, harf+rakam). Repo herkese açık ve özet orada; kısa bir kod özetinden deneme yoluyla bulunabilir. Kod kısaysa kodcu yeni kod + yeni özet koysun (kodu yalnız Barış bilir).
- [ÖNEMLİ] Kod iki mağazada da **inceleme notuna** yazılır: Play Console → Uygulama içeriği → Uygulama erişimi ("Bazı özellikler kısıtlı" → talimat); App Store Connect → Sürüm → App Review bilgileri → Notlar. Nota ayrıca: ebeveyn kapısının nasıl geçileceği (toplama sorusu), Ebeveyn Köşesi'nin yeri, mikrofonun isteğe bağlı olduğu ve her görevin dokunarak oynandığı yazılsın.
- [ÖNEMLİ] Apple inceleme ekibi satın almayı **sandbox'ta gerçekten dener**. İnceleme kodu bunun yerine geçmez: ürünler "Gönderilmeye hazır" olmalı, ilk abonelik **uygulama sürümüyle birlikte** incelemeye eklenmeli (sürüm sayfasında "Uygulama İçi Satın Alımlar ve Abonelikler" bölümü), Paid Apps sözleşmesi etkin olmalı.

---

## 7. Bilinen riskler ve açık işler

1. ✓ YAPILDI (2026-10-10; bkz. en üstteki Durum). Eski tespit: **[ENGEL] E3 iOS PrivacyInfo.xcprivacy**: uygulama hedefinde yok (Capacitor çekirdeğininki boş; Preferences eklentisinin kendi bildirimi yok). Kodcu: `ios/App/App/PrivacyInfo.xcprivacy` (NSPrivacyAccessedAPICategoryUserDefaults → CA92.1; toplanan veri: satın alma geçmişi, uygulama işlevi, takip yok) eklesin ve Xcode projesinin kaynaklarına bağlasın. Daha önce TestFlight'a yükleme yapıldıysa Apple'dan "ITMS-91053" e-postası gelmiş mi bakılsın.
2. **[ENGEL] E1 / E2** (yukarıda).
3. **[ÖNEMLİ] Google üretim erişimi**: kapalı test 12+ kişiyle **kesintisiz 14 gün** tamamlanmadan "Üretime erişim için başvur" düğmesi açılmaz; başvurunun incelenmesi de birkaç gün (en çok ~7 gün) sürebilir. 19 Ekim hedefi buna bağlı: Play Console → Kontrol paneli'ndeki sayaç kontrol edilsin; gün dolduğu gün başvurulsun. Test sırasında kişi sayısı 12'nin altına düşmemeli.
4. **[ÖNEMLİ] Tart Bakalım**: çürük domates ve kompost **yer tutucu çizim** (lekeler + sinek). Gemini Ek B (ekip/gemini/IS-LISTESI-YENI.md) gelmeden yayına giderse "kusursuz görsel" kuralına aykırı. Seçenek: çizim 17 Ekim'e kadar gelmezse Tart Bakalım düğmesi bu sürümde gizlensin (yönetici kararı).
5. ✓ YAPILDI (2026-10-10): Kino'nun Otobüsü uygulama paketinde yok; menüde açılmıyor. Açılacağı gün tek satır: `KINO_OTOBUS_MENUDE = true`. **2026-10-10 (2): açıldı (bayrak true), sayfa pakette ve menüde.**
6. **[ÖNEMLİ] Gerçek cihaz turu** (YAYIN-ADIMLARI §6): iPhone + Android telefon + iPad'de mikrofon (Sesli Maceralar), film yatay kilidi, arka plana alıp dönme, uçak modunda açılış, sandbox/lisans testi satın alma, geri yükleme, gizlilik bağlantısının tarayıcıda açılması, "Kartım" paylaşımı (iOS) ve Android'deki "ekran görüntüsü" ipucu.
7. **[ÖNEMLİ] Seslendirme**: her yeni sürümde önce "Yayınla" iş akışı (eksik cümleler), sonra Android derlemesi; derleme özetinde "Seslendirme denetimi" 0 olmalı. Tart Bakalım ve Pasta'nın yeni cümleleri bu yoldan geçmeli.
8. [KÜÇÜK] AndroidManifest'te AD_ID satırı iki kez.
9. [KÜÇÜK] ElevenLabs anahtarı değiştirilmeli (minkinogames1.md §7 güvenlik notu; hâlâ açık iş).
10. [KÜÇÜK] Cloudflare'deki kullanılmayan `sihir` Worker'ı silinebilir.
11. [KÜÇÜK] Apple "Çocuklar" kategorisi: bir kez seçilip onaylanınca uygulama bu kategorinin kurallarına (dış bağlantı ve satın alma için ebeveyn kapısı, üçüncü taraf analitik/reklam yok) uymaya devam etmek zorunda; şu anki kod uyuyor.
12. [KÜÇÜK] Codemagic `xcode: latest`: Apple bir gün yeni Xcode'a geçince derleme beklenmedik bozulabilir; yayın haftasında sorun çıkarsa sabit sürüme alınır.

---

## 8. Barış için adım adım (sade)

> Parola, anahtar, `.p8`, `.jks` hiçbir sohbete ya da dosyaya yazılmaz. Yalnız ilgili sitenin kendi ekranına girilir.

### A. Yayından önce (bu hafta)
1. **Karar ver:** mağaza metinlerinde yaş "3-6" mı "3-8" mi? Kitap cümlesi kalsın mı? Kararını yöneticiye yaz.
2. **RevenueCat'i kontrol et:** app.revenuecat.com → Minkino projesi → iki uygulama (Google Play, App Store) bağlı mı, `premium` yetkisi ve "default" teklif (aylık + yıllık) "current" mı?
3. **Anahtarlar yerinde mi:** GitHub → Settings → Secrets and variables → Actions → `REVENUECAT_ANDROID_KEY` var mı? Codemagic → Environment variables → grup `revenuecat` → `REVENUECAT_IOS_KEY` var mı? (Test telefonunda abonelik ekranı "Yakında" diyorsa anahtar yok demektir.)
4. **Apple sözleşmeleri:** App Store Connect → İş (Business) → "Paid Apps" sözleşmesi **Etkin** olmalı; banka ve vergi bilgileri tamam olmalı. Yoksa fiyatlar uygulamada görünmez.
5. **Google ödeme profili:** Play Console → Ayarlar → Ödeme profili tamam mı? Abonelikler (`minkino_aylik`, `minkino_yillik`) **Etkin** ve 7 gün deneme teklifi açık mı?
6. **Veri formlarını düzelt:**
   - Play Console → Politika ve programlar → Uygulama içeriği → **Veri güvenliği** → "Satın alma geçmişi" = toplanıyor, paylaşılmıyor, amaç "Uygulama işlevi"; ses kaydı toplanmıyor; veriler aktarım sırasında şifreli; silme talebi minkinokids@gmail.com.
   - App Store Connect → Uygulama Gizliliği → "Satın Almalar → Satın alma geçmişi" = Uygulama işlevi, takip yok. Başka bir şey işaretleme.
7. **İnceleme kodunu notlara yaz:** Play → Uygulama içeriği → **Uygulama erişimi**; Apple → sürüm sayfası → **App Review bilgileri → Notlar**. Kod kısaysa önce yöneticiden yenisini iste.
8. **Mağaza metinlerini yapıştır:** yönetici `MAGAZA-METINLERI.md`'yi güncelledikten sonra (7 gün, bağlantılar, Ada'nın Doğum Günü, Tart Bakalım) Play "Ana mağaza girişi" ve Apple "Açıklama / Yenilikler" alanlarına kopyala.
9. **Yeni ekran görüntüleri:** yönetici 01 numaralı kareyi yeniledikten sonra iki mağazada eski 01'i silip yenisini yükle (Play: telefon + tablet, Apple: iPhone + iPad; TR ve EN).

### B. Google Play üretime çıkış
10. Play Console → **Kontrol paneli**: kapalı testin 14 günü dolmuş ve 12+ test kullanıcısı katılmış mı bak.
11. Dolduğu gün **"Üretime erişim için başvur"** → soruları kısa ve dürüst cevapla (kaç kişi test etti, ne geri bildirim geldi, neyi düzelttik). Onay birkaç gün sürebilir.
12. Onay gelince: Test → **Kapalı test** → son sürüm → **"Sürümü yükselt → Üretim"** (yeni paket gerekmez). Yeni paket istenirse: GitHub → Actions → "Android (APK + AAB)" → Run workflow → Artifacts'tan `.aab` indir → Üretim → Yeni sürüm → yükle.
13. Ülkeler: Türkiye (ve istenen diğerleri). **Kademeli yayın** %20 ile başlat; 2-3 gün sorun yoksa %100.
14. "İncelemeye gönder". Onaylanınca mağazada görünür.

### C. App Store çıkışı
15. Codemagic → **Start new build → ios-testflight** (anahtarlar ve PrivacyInfo eklendikten sonra). Bitince TestFlight'a kendiliğinden gider.
16. Kendi iPhone'unda TestFlight'tan kur: aç, bir maceraya gir, kilitli bir şeye dokun → "Büyükler için" → abonelik ekranı → fiyatlar görünüyor mu? Sandbox hesabıyla deneme başlat, sonra "Satın alımları geri yükle".
17. App Store Connect → Uygulamalar → Minkino → **1.0 sürümü**: ekran görüntüleri, açıklama, anahtar kelimeler, destek URL (gizlilik sayfası), pazarlama URL (boş olabilir), telif ("2026 Minkino").
18. Aynı sayfada **Derleme (Build)** bölümünden TestFlight'taki son derlemeyi seç.
19. **Uygulama İçi Satın Alımlar ve Abonelikler** bölümünden `minkino_aylik` ve `minkino_yillik`'i bu sürüme ekle (ilk abonelikler uygulamayla birlikte incelenir).
20. Yaş derecelendirmesi + **Çocuklar kategorisi** (5 yaş ve altı / 6-8), Uygulama Gizliliği (adım 6), App Review notları (adım 7).
21. **"İncelemeye Gönder"**. Çocuk kategorisinde inceleme genelde 1-3 gün. Soru gelirse yöneticiye ilet, birlikte cevaplayalım.
22. Onay gelince "Bu sürümü elle yayınla" seçtiysen **Yayınla**'ya bas (Google ile aynı gün çıkmak için bu seçenek önerilir).

### D. Yayından sonra (ilk hafta)
23. Her gün minkinokids@gmail.com ve iki mağazanın yorum/çökme ekranlarına bak.
24. RevenueCat panelinde ilk denemelerin ve aboneliklerin göründüğünü kontrol et.
25. Sonraki her App Store sürümü için yöneticiden sürüm numarasını (1.0.1, 1.1 …) artırmasını iste; Android kendisi artar.
