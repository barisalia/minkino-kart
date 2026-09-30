# Turntable (Dönen tabla): 2026-09-28, 11:00–11:30'da başlar

Illustrator 11:00'den önce açılmaz; Barış öyle istedi. İsteyen: yönetici minkino. Kaynakları tasarımcı (adobe) hazırlar, arayüz işini yancı yapar.

## 1. Kaynaklar (hazır)
- `girdi/turntable/<ad>-on.png`: şeffaf zemin, 1024 kare, karakter ortada (%88).
- `<ad>-on-beyaz.png`: aynısı, beyaz zeminli.
- Vektör hazır olanlar: `girdi/mino-on.svg`, `girdi/kino-on.svg`.
- Sıra: mino, kino, ada, can, elif, deniz, zeynep, ege, anne, ayi, inek, maymun, kus. Ek olarak kopek, tavsan, ordek (bu üçünde yalnız 3/4 ve arka).

## 2. Vektörleştirme (tasarımcı, 11:00'de, COM ile)
`ekip/illustrator/vektorlestir.jsx` çalıştırılır.
- GIRDI: `<ad>-on-beyaz.png`. Betik beyaz zemini atar.
- İç beyazlar (Elif'in yakası, ördek, tavşan) kenara değmediği sürece kalır; kontrol edilir.
- CIKTI: `cikti/turntable/<ad>-temiz.ai`. Belge açık kalır, karakter seçili olur.

**Durum (11:06):** 16 dosya hazır: `cikti/turntable/<ad>-temiz.ai`, kontrol için `<ad>-temiz.png`, hepsi bir arada `cikti/turntable/onizleme.png`. İç beyazları korumak için `ekip/illustrator/vektorlestir-maske.jsx` kullanıldı: büyük beyaz, merkezi şeffaf PNG'de zemindeyse silinir. Elif'in yakası, köpeğin göz akı, Can'ın ayakkabısı ve ördek korundu. Illustrator açık bırakıldı, belge açık değil.

## 3. Dönen tabla (yancı, arayüzden)
- Her `<ad>-temiz.ai` için: tümünü seç → Özellikler → Dönüştür → **Dönen tabla**.
- Üretilecek açılar: **yan** (sağa bakan tam profil), **3/4**, **arka**.
- Kayıt: `ekip/turntable/<ad>/yan.svg`, `uc-ceyrek.svg`, `arka.svg` (Dışa Aktar → SVG) ve her biri için PNG. Ayrıca `onizleme.png` (üç açı yan yana).
- Kötü sonuç (yüz bozuk, renk kaymış, fular kaybolmuş): `-v2` ile bir kez daha dene. Yine kötüyse notu düş, geç.
- Kredi harcanırsa yaz.

## 4. Sonra (tasarımcı)
- İyi çıkan yan görünüşler köpek standardıyla (`ekip/pazar-musteri/kopek-profil.*`) `<ad>-profil.svg/json` iskeletine çevrilir.
- Önizlemeler açık ve koyu zeminde hazırlanır, varsayılan çizimde piksel farkı 0 olmalı.
- Yöneticiye tek satır haber verilir.

## Güncelleme (2026-09-30)
- Yancı oturumu kalmadı; Turntable'ı tasarımcı oturumu Illustrator arayüzünden yapıyor.
- Vektörleştirme: `vektorlestir-maske.jsx` içindeki `[High Fidelity Photo]` yerine **`[16 Colors]`** kullanılmalı. Ege'de ilki renksiz (beyaz dolgu, siyah kontur) çıktı; ikincisi renkli çıktı. Kaynak: `cikti/turntable/ege-temiz16.ai`.
- Açılar (yatay): yan 90°, 3/4 45°, arka 180°. Bir üretim ≈ 4 dk.
- Biten: Ege yan (`ekip/turntable/ege/yan.png/.svg`). Kalan: Ege 3/4 ve arka, anne, ayı, inek, maymun, kuş, köpek, tavşan, ördek.
