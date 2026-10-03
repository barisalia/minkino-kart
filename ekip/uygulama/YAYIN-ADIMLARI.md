# Minkino: mağazaya çıkış adımları (Barış için)

Hazırlayan: baş kodcu, 2026-10-02. Kod hazır: Capacitor paketi (`android/`, `ios/`), abonelik ekranı, ebeveyn kapısı,
gizlilik ve şartlar sayfaları, derleme hatları. Aşağıdakiler **yalnız senin yapabileceğin** adımlar (hesap, parola, imza).
Sıra önemli; her adımın yanında yaklaşık süresi var.

> Parolaları, anahtarları hiçbir sohbete, dosyaya, commit'e yazma. Yalnız GitHub / Codemagic / Play Console / App Store
> Connect / RevenueCat ekranlarına gir.

---

## 0. Kısaca neler hazır?

| Ne | Nerede |
|---|---|
| Uygulama kimliği | `com.minkino.app`, adı **Minkino** |
| Uygulama derlemesi | `npm run build:app` (web sitesi `npm run build` aynen duruyor) |
| Uygulamada olmayanlar | Mikrofon testi, Uyuyan Orman (Minik Sanatçı 2026-10-03 tamamen kaldırıldı) |
| Ücretsiz | Kartlar · Çizgi Filmler'den "Mino'nun Karpuzu" · Sesli Maceralar'dan "Elektrikler Kesildi!" (tek tablo: `src/engine/erisim.ts`) |
| Abonelikle | Gerisi (Pazar, Çiz Canlansın, Pasta Otobüsü, diğer maceralar ve filmler) |
| Abonelik | RevenueCat; yetki adı `premium`; ürünler `minkino_aylik`, `minkino_yillik` |
| Ebeveyn kapısı | Yazıyla toplama sorusu ("On dört artı yedi kaç eder?"), sayı tuşlarıyla |
| Gizlilik / Şartlar | https://minkino-site.barisalidogan.workers.dev/gizlilik/ ve /sartlar/ (push'tan sonra yayında) |
| Android derleme | GitHub Actions → **Android (APK + AAB)** (main'e push'ta ve elle) |
| iOS derleme | Codemagic → `codemagic.yaml` → **ios-testflight** |

**Anahtar yokken** (RevenueCat anahtarı girilmemişse) uygulamada kilit yoktur, her şey açıktır; abonelik ekranı "Yakında" der. Yani anahtarı girmeden de test yapılabilir.

---

## 1. Android imza anahtarı (tek sefer, ~10 dk)

Play Console'a yüklenen her paket aynı "yükleme anahtarı" ile imzalanmalı. Bilgisayarda Java olmadığı için anahtarı GitHub üretir.

1. **Bir parola seç** (en az 12 karakter, harf + rakam). Parola yöneticine kaydet. Bu parola anahtarın da, indirilecek arşivin de parolası olacak.
2. GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**. Üç secret ekle:
   - `ANDROID_KEYSTORE_PASSWORD` = seçtiğin parola
   - `ANDROID_KEY_PASSWORD` = **aynı** parola
   - `ANDROID_KEY_ALIAS` = `minkino`
3. GitHub → **Actions → "Android yükleme anahtarı üret (tek sefer)" → Run workflow** → kutuya `EVET` yaz → Run.
4. Bitince (1-2 dk) çalıştırma sayfasının altındaki **Artifacts → minkino-android-anahtar**'ı indir.
5. İndirdiğin `.7z` dosyasını **7-Zip** ile aç (ücretsiz: 7-zip.org; Windows'un kendi açıcısı bu şifrelemeyi açamayabilir). Parola: seçtiğin parola. İçinde üç dosya var:
   - `ANDROID_KEYSTORE_BASE64.txt` → içindeki **tek satırı** kopyala, yeni secret olarak ekle: `ANDROID_KEYSTORE_BASE64`.
   - `minkino-yukleme.jks` → **yedekle** (ör. kişisel Google Drive'a ya da USB belleğe; parolası parola yöneticinde).
   - `OKU-BENI.txt` → bu adımların özeti.
6. GitHub'daki çalıştırma sayfasında **Artifacts yanındaki çöp kutusuna** basıp arşivi sil (1 gün sonra kendiliğinden de silinir). Bilgisayardaki `.7z`'yi ve açılmış `.txt`'yi de sil (`.jks` yedeği kalsın).

**Bu yolun artıları:** Java/Android Studio kurmak gerekmez; anahtar hiç sohbete ya da repoya girmez; arşiv AES-256 ile şifreli ve 1 gün sonra silinir; iş akışı ikinci kez çalıştırılırsa var olan anahtarın üstüne yazmaz.
**Eksileri:** Repo herkese açık olduğu için GitHub'a giriş yapmış herkes o gün arşivi indirebilir; şifre sağlam olduğu sürece içini açamaz (o yüzden parola uzun olsun ve arşivi hemen sil). Anahtar birkaç dakika GitHub'ın geçici makinesinde durur (iş bitince makine silinir). 7-Zip kurmak gerekir.
**Kaybedersen:** Play App Signing açık olduğu için (yeni uygulamalarda varsayılan) asıl imza anahtarı Google'da durur; yükleme anahtarı kaybolursa Play Console → Uygulama bütünlüğü → "Yükleme anahtarını sıfırla" ile yenisi istenir (birkaç gün sürebilir).

---

## 2. RevenueCat ve mağaza ürünleri (~45 dk)

1. **RevenueCat** (app.revenuecat.com) → yeni proje "Minkino".
2. Projeye iki uygulama ekle:
   - **Google Play**: paket adı `com.minkino.app`. RevenueCat'in istediği "service account" JSON'unu Play Console'dan bağla (RevenueCat ekranındaki adım adım rehberi izle).
   - **App Store**: bundle ID `com.minkino.app`. App Store Connect'ten "In-App Purchase Key" (P8) yükle.
3. **Mağaza ürünleri** (fiyatlar mağazada ayarlanır, uygulamaya yazılmaz):
   - Play Console → Para kazanma → Abonelikler: `minkino_aylik` (aylık, 99 TL), `minkino_yillik` (yıllık, 499 TL). Her birine temel plan ve **7 gün ücretsiz deneme** teklifi ekle.
   - App Store Connect → Abonelikler → bir abonelik grubu ("Minkino Premium"): `minkino_aylik`, `minkino_yillik`; fiyatlar ve **7 günlük ücretsiz tanıtım teklifi**.
4. RevenueCat → **Entitlements**: `premium`; iki ürünü de buna bağla. **Offerings**: "default" teklifine iki paket (Monthly → `minkino_aylik`, Annual → `minkino_yillik`); "current" olarak işaretle.
5. RevenueCat → **API keys**: iki "public SDK key" var (Android `goog_…`, iOS `appl_…`). Bunlar gizli değildir ama repoya yazılmaz:
   - GitHub → Settings → Secrets and variables → Actions → **Variables** sekmesi (ya da Secrets) → `REVENUECAT_ANDROID_KEY`.
   - Codemagic → Environment variables → grup **revenuecat** → `REVENUECAT_IOS_KEY`.
6. Anahtar girildikten sonraki ilk derlemede uygulamada kilitler ve gerçek abonelik ekranı açılır.

---

## 3. Google Play: kapalı test (12 kişi, 14 gün)

Kişisel geliştirici hesabı olduğu için Google, üretime çıkmadan önce **en az 12 test kullanıcısının 14 gün kesintisiz** katıldığı bir kapalı test istiyor. Saat bugünden işlemeye başlasın diye bu adım öncelikli.

1. **Play Console → Uygulama oluştur**: ad "Minkino", dil Türkçe, Uygulama, Ücretsiz (abonelik uygulama içi satıştır), beyanlar.
2. **Uygulama içeriği** (sol menü "Politika ve programlar → Uygulama içeriği"):
   - Gizlilik politikası: `https://minkino-site.barisalidogan.workers.dev/gizlilik/`
   - **İletişim e-postası** (Ana sayfa → Mağaza girişi → Mağaza ayarları → İletişim bilgileri → E-posta): `minkinokids@gmail.com`
   - Reklamlar: **Hayır**.
   - Hedef kitle: **5 yaş ve altı, 6-8** (3-6 yaş için) → "Aileler" politikası uygulanır. Uygulama çocuklara yönelik.
   - Veri güvenliği: **Veri toplanmıyor / paylaşılmıyor.** (Mikrofon sesi cihazda anlık işlenir, cihazdan çıkmaz; satın alma Google Play üzerinden. RevenueCat anonim kimliği satın alma doğrulaması içindir.) Formda "Ses kayıtları" toplanmıyor işaretlenir.
   - İçerik derecelendirmesi anketi, hükümet uygulaması: hayır, finansal özellikler: hayır, sağlık: hayır.
3. **Mağaza girişi**: metinler hazır → `ekip/uygulama/MAGAZA-METINLERI.md`. İkon (512×512) ve öne çıkan görsel (1024×500), en az 2 telefon ekran görüntüsü gerekir (ikon tasarımcıdan; bkz. "Eksikler").
4. **Paket**: GitHub → Actions → **Android (APK + AAB)** → Run workflow (main). Bitince **Artifacts → minkino-release-aab-N** indir (içinde `.aab`). (İmza secret'ları yoksa yalnız debug APK çıkar; bkz. Adım 1.)
5. **Test → Kapalı test → Yeni kanal** (ör. "Kapalı test"):
   - **Test kullanıcıları**: bir e-posta listesi oluştur, **en az 12 Gmail adresi** (tavsiye 15-16: biri bırakırsa sayı düşmesin). Bu kişiler Play Store'a o Gmail ile girmiş Android telefon kullanmalı.
   - Sürüm oluştur → `.aab`'yi yükle → sürüm notu (MAGAZA-METINLERI §5) → incelemeye gönder.
   - Onaylanınca "Katılım bağlantısı"nı test kullanıcılarına gönder; her biri bağlantıya girip **"Test kullanıcısı ol"** der ve uygulamayı Play'den kurar. **14 gün boyunca uygulama telefonlarında kalmalı** (silmesinler; arada açıp oynamaları iyi olur).
   - 14 gün dolunca Play Console → Kontrol paneli → "Üretime erişim için başvur" (birkaç soru sorar: test süreci, geri bildirimler).
6. **İç test (hızlı deneme, beklemesiz):** Test → **Dahili test** kanalı; en çok 100 kişi, incelemesiz dakikalar içinde yayınlanır. Kendi telefonunda denemek için ilk buraya yükle. (İç test 12/14 sayımına girmez; sayılan kapalı testtir.)
7. **Ücretsiz deneme ve satın alma testi:** Play Console → Ayarlar → **Lisans testi** listesine kendi Gmail'ini ekle: test satın alımları gerçek para almaz.

Debug APK (Artifacts → minkino-debug-apk-N) Play'siz hızlı deneme içindir: telefona indir, "bilinmeyen kaynak" izniyle kur. Satın alma denemesi için Play'den (iç test kanalından) kurulan sürümü kullan.

---

## 4. iOS: Codemagic → TestFlight (~40 dk, Mac gerekmez)

Ön koşul: Apple Developer Program üyeliği (yıllık).

1. **App Store Connect → Uygulamalar → +**: ad "Minkino", dil Türkçe, bundle ID `com.minkino.app` (yoksa önce developer.apple.com → Identifiers'ta oluştur), SKU `minkino`.
2. **App Store Connect → Kullanıcılar ve Erişim → Entegrasyonlar → App Store Connect API → anahtar oluştur** (rol: App Manager). `.p8` dosyasını indir (bir kez indirilebilir), Issuer ID ve Key ID'yi not et.
3. **Codemagic** (codemagic.io) → GitHub ile gir → repo'yu ekle (minkino-kart) → "codemagic.yaml" kullan.
4. Codemagic → **Teams → Integrations → Developer Portal / App Store Connect → Connect**: adı tam olarak **`Minkino App Store Connect`** yaz; Issuer ID, Key ID ve `.p8`'i yükle.
5. Codemagic → **Code signing identities → iOS certificates → Generate/Fetch** (App Store dağıtım sertifikası) ve **iOS provisioning profiles → Fetch profiles** (`com.minkino.app`, App Store).
6. Codemagic → **Environment variables** → grup `revenuecat` → `REVENUECAT_IOS_KEY` (RevenueCat iOS public anahtarı; yoksa grup yine olsun, değer sonra girilebilir).
7. **Start new build → ios-testflight**. Bitince IPA otomatik TestFlight'a yüklenir.
8. App Store Connect → **TestFlight**: kendini "Dahili test" grubuna ekle, iPhone'a TestFlight uygulamasıyla kur.
9. App Store Connect → **App Review bilgileri → İletişim e-postası**: `minkinokids@gmail.com`. **Destek URL**'si olarak gizlilik sayfası verilebilir (e-posta orada yazılı).
10. App Store'a gönderirken: Kategori **Eğitim**, "Çocuklar" bölümü **5 yaş ve altı / 6-8**; Gizlilik etiketi: **Veri toplanmıyor**; gizlilik URL'si ve kullanım koşulları URL'si (yukarıdaki adresler) açıklamaya ve uygulama bilgilerine. Abonelik açıklamasındaki otomatik yenileme metni MAGAZA-METINLERI §7'de.

---

## 5. Her yeni sürümde

1. Değişiklikler `main`'e girer → **Yayınla** iş akışı seslendirmeyi üretir ve repoya yazar.
2. Ondan **sonra** Actions → **Android (APK + AAB)** → Run workflow (yeni ses dosyaları pakete girsin). Sürüm kodu kendiliğinden artar.
3. iOS için Codemagic'te yeni derleme.
4. Android derleme özetinde "Seslendirme denetimi" var: cihaz sesine düşecek cümle sayısı 0 olmalı (2026-10-02'de 0).

---

## 6. Eksikler / dikkat

- **İkon ve açılış görseli:** yerinde. Açılış görseli tasarımcının `assets/uygulama/splash.png`'sinden `node scripts/uygulama/acilis-gorseli.mjs` ile android/ ve ios/ altına üretildi (krem zemin #FFF4DD, ortada Mino-Kino + logo; Android 12+ sistem açılışında ikon krem zemin üstünde).
- **Gerçek cihaz denemesi:** iPhone ve Android'de mikrofon (üfleme, alkış), ses (hoparlörden mi), film yatay kilidi, arka plana alıp geri dönme, uçak modunda açılış, satın alma (lisans testi / sandbox).
