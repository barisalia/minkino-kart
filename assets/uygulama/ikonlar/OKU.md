# Uygulama ikon takımı (otomatik: ekip/illustrator/ikon-seti.cjs)

Kaynak: `public/ikon-1024.png` (Mino + Kino, gökyüzü ve tepecik), `assets/uygulama/ikon-on.png` (uyarlanabilir ön), `ikon-arka.png` (uyarlanabilir arka). Yeniden üretmek için önce `node ekip/illustrator/magaza-yedek.cjs` (ya da Gemini ikonu gelince onun betiği), sonra `node ekip/illustrator/ikon-seti.cjs`.

## Capacitor'dan sonra nereye
**Android** (`npx cap add android` sonrası):
- `android/*/mipmap-*` klasörlerinin içeriğini `android/app/src/main/res/` içine kopyala (var olan `ic_launcher*.png` ve `mipmap-anydpi-v26/*.xml` üzerine yaz).
- Capacitor şablonundaki `res/drawable/ic_launcher_background.xml` ve `res/drawable-v24/ic_launcher_foreground.xml` artık kullanılmaz: silinebilir (yeni XML'ler `@mipmap/ic_launcher_background` ve `@mipmap/ic_launcher_foreground` PNG'lerine bakar). `values/ic_launcher_background.xml` kalabilir.
- `ic_launcher-playstore.png` (512x512): Play Console mağaza ikonu.
- Ön katman 108 dp (mdpi 108 … xxxhdpi 432 px); içerik 66 dp'lik güvenli dairenin içinde.

**iOS** (`npx cap add ios` sonrası):
- `ios/AppIcon.appiconset` klasörünün tamamını `ios/App/App/Assets.xcassets/AppIcon.appiconset/` yerine koy. Hepsi alfasız. `AppIcon-1024.png` App Store pazarlama ikonu; Xcode 14+ tek 1024 dosyasını da kabul eder, ama tam set eski sürümlerle de çalışır.

**Web**: `public/ikon-512.png`, `public/ikon-180.png` (apple-touch), `public/favicon.svg`, `public/favicon.ico` doğrudan `public/` içinde üretildi.
