# Google Play + App Store: tek sıra (Barış için)

Ortak işler bir kez yapılır, her adımda iki mağaza birlikte ilerler. Bir mağazada yaptığın hiçbir iş ötekinde boşa gitmez. Ayrıntılı tıklama tarifleri [YAYIN-ADIMLARI.md](YAYIN-ADIMLARI.md)'de; burada yalnız sıra ve neyin ortak olduğu var.

> Parola, anahtar, `.p8`, `.jks` dosyaları hiçbir sohbete ya da repoya girmez. Yalnız GitHub, Codemagic, Play Console, App Store Connect ve RevenueCat ekranlarına yazılır.

## Bir kez yazılanlar (iki mağazaya da aynısı)
| Ne | Değer |
|---|---|
| Uygulama adı | Minkino |
| Paket / Bundle ID | `com.minkino.app` (ikisinde de aynı) |
| İletişim e-postası | minkinokids@gmail.com |
| Gizlilik URL | https://minkino-site.barisalidogan.workers.dev/gizlilik/ |
| Şartlar URL | https://minkino-site.barisalidogan.workers.dev/sartlar/ |
| Kategori | Eğitim · Çocuklar 5 yaş ve altı + 6-8 |
| Reklam / veri | Reklam yok · Veri toplanmıyor |
| Metinler | [MAGAZA-METINLERI.md](MAGAZA-METINLERI.md) (aynı metin ikisine de; kısa açıklama Play'de, alt başlık Apple'da) |
| Ekran görüntüleri | `assets/uygulama/magaza-ekranlari/<tr veya en>/`: Play için `android-1080x1920`, Apple için `iphone-1290x2796` ve `ipad-2048x2732` (6'şar tane) |
| İkon | Play: `assets/uygulama/ikonlar/android/ic_launcher-playstore.png` (512) + öne çıkan görsel `assets/uygulama/one-cikan.png` (1024×500). Apple: ikon pakette (Codemagic kendisi koyar) |
| Abonelik ürünleri | `minkino_aylik` 99 TL · `minkino_yillik` 499 TL · 7 gün ücretsiz deneme (iki mağazada da **aynı ürün kimlikleri**) |

## Sıra

### 1. Hesaplar ve uygulama kaydı (~20 dk, ikisi aynı oturumda)
- **Play Console:** Uygulama oluştur → Minkino, Türkçe, Uygulama, Ücretsiz.
- **App Store Connect:** developer.apple.com → Identifiers → `com.minkino.app` oluştur → App Store Connect → Uygulamalar → + → Minkino, SKU `minkino`.
- İkisine de yukarıdaki tablodan e-posta, gizlilik URL'si, kategori, çocuk yaş grubu, "reklam yok", "veri toplanmıyor" girilir. (Play: Uygulama içeriği bölümü · Apple: Uygulama Gizliliği + Yaş derecelendirmesi.)

### 2. İmza ve derleme (~30 dk, bir kez kurulur, sonra hep kendiliğinden)
- **Android:** YAYIN-ADIMLARI §1: GitHub secret'ları + "Android yükleme anahtarı üret" iş akışı. Bundan sonra her push'ta imzalı `.aab` çıkar.
- **iOS:** YAYIN-ADIMLARI §4 adım 2-5: App Store Connect API anahtarı (`.p8`) → Codemagic'e bağla (adı tam `Minkino App Store Connect`) → sertifika ve profil "Fetch". Bundan sonra Codemagic'te tek tuşla TestFlight'a gider.

### 3. Abonelik ürünleri (~30 dk; iki mağazada aynı kimlikler)
- Play Console → Para kazanma → Abonelikler: `minkino_aylik`, `minkino_yillik` + 7 gün deneme.
- App Store Connect → Abonelikler → grup "Minkino Premium": aynı iki kimlik + 7 günlük tanıtım teklifi. (Apple ilk aboneliği uygulamanın ilk incelemesiyle birlikte onaylar; şimdi oluşturmak yeter.)
- **RevenueCat (tek proje, iki uygulama):** Google Play + App Store uygulamasını ekle → `premium` yetkisi → iki ürünü bağla → "default" teklif current. İki public anahtar: Android → GitHub Variables `REVENUECAT_ANDROID_KEY`, iOS → Codemagic grup `revenuecat` → `REVENUECAT_IOS_KEY`.
- Bu adım bitmese de test başlar: anahtar yokken uygulamada her şey açık, abonelik ekranı "Yakında" der.

### 4. Testi başlat (aynı gün ikisi)
- **Google (14 gün saati burada başlar):** Test → Kapalı test → 12+ (tavsiye 15) Gmail → `.aab` yükle → incelemeye gönder → onaylanınca katılım linkini gönder. 14 gün telefonlarında kalsın.
- **Apple (bekleme şartı yok):** Codemagic → ios-testflight derle → TestFlight'ta kendini ve aynı test kişilerinden iPhone'u olanları ekle (dış test için Apple kısa bir beta incelemesi yapar, ~1 gün).
- Aynı kişiler iki testte de olabilir; geri bildirim tek yerden (minkinokids@gmail.com) toplanır.

### 5. 14 gün boyunca
- Biz geliştirmeye devam ederiz. Her yeni sürüm: main'e girer → Android iş akışı yeni `.aab` → Play kapalı teste yükle; Codemagic → yeni TestFlight. Test süresi sıfırlanmaz.

### 6. Yayın
- **Apple:** Hazır olduğumuz gün "İncelemeye gönder" (beklemek gerekmez; çocuk kategorisi incelemesi 1-3 gün).
- **Google:** 14 gün dolunca Kontrol paneli → "Üretime erişim için başvur" → onaydan sonra üretime yükle.
- Hedef: iki mağazada aynı sürümle aynı hafta yayında olmak.

## Senden beklenen tek seferlik işler (özet)
1. Android imza anahtarı (GitHub, ~10 dk)
2. Apple `.p8` anahtarı + Codemagic bağlantısı (~20 dk)
3. İki mağazada uygulama kaydı + gizlilik/çocuk formları (~30 dk)
4. Abonelik ürünleri + RevenueCat (~30 dk, ertelenebilir)
5. 12-15 test kişisinin Gmail listesi
