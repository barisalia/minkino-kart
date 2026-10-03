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

## Güncelleme (2026-10-01, Barış 3 saat)
- **Biten karakterler:** mino, kino, ada, can, elif, deniz, zeynep (dün); ege, anne, ayi, inek, maymun, kus (yan/3-4/arka); kopek, tavsan, ordek (3/4 + arka). Hepsi `ekip/turntable/<ad>/` altında.
- **Eşyalar** (kaynak 3/4 ön çizim, bu yüzden dönüşler ona göre): `esya-adlandir.cjs` adlandırır: `yan` = 45° (gerçek yan), `arka-uc-ceyrek` = 90° (arkadan 3/4), `arka` = 180°, `uc-ceyrek` = kaynak çizimin kendisi. Biten: bank, kum-havuzu, fener (parlama bölgesi karışık), + balon sırada. Girdileri hazır, vektörü hazır: salincak, kaydirak, oyuncak-ayi, pasta, hediye-kutusu, kitap (ekip/adobe-yanci/cikti/turntable/<ad>-temiz16.ai).
- **Uyarı:** çok parçalı (500+) eşya vektörü (salıncak 539, kaydırak 563, pasta 959) Dönen tabla'da Illustrator'ı çökertti (2026-10-01 06:40, WerFault). Önce `[6 Colors]` iziyle sadeleştir ya da parça sayısı <400 olanlardan başla. Çöktüğünde: WerFault'u kapat, Illustrator'ı yeniden başlat (COM), belge aç.
- Kalan: salincak, kaydirak, oyuncak-ayi, pasta, hediye-kutusu, kitap, mama-sandalyesi, besik, kuvet, sepet, karpuz, elma, top (girdileri `ekip/adobe-yanci/girdi/turntable/` altında).

## Güncelleme (2026-10-03, yancı)
- **İz ön ayar adları Türkçe:** `app.tracingPresetsList` → `16 Renk`, `6 Renk`, `3 Renk`, `Yüksek Kaliteli Fotoğraf`... `[16 Colors]` / `[6 Colors]` adları bu kurulumda YOK; `loadFromPreset` sessizce geçiyor, varsayılan iz kullanılıyor. Eşyalar `6 Renk` ile yeniden izlendi: `cikti/turntable/<ad>-temiz6.ai` (elma 92, top 109, sepet 458, beşik 833, salıncak 229, kaydırak 84, pasta 196 parça).
- **Dönen tabla kredisi:** üretim başına 20 kredi (araç ipucu: "74 çeşitleme başına 20 kredi").
- **SVG dışa aktarma kilidi:** üretimden hemen sonra aynı oturumda `exportFile(SVG)` Illustrator'ı kilitliyor (iki kez, öldürmek gerekti). Çözüm: üretim → "Bitti" → `saveAs(<ad>-tt.ai)` → kapat → yeniden aç → açıyı Özellikler'deki yatay alana yaz → "Bitti" → PNG+SVG dışa aktar. Kurtarılan belge de aynı şekilde çalışıyor.
- Ön (düz bakan) kaynaklı eşyalarda (top, sepet, salıncak, kaydırak, pasta) karakter düzeni kullanıldı: 45° = uc-ceyrek, 90° = yan, 180° = arka. 3/4 kaynaklı elma `esya-adlandir` düzeninde.
