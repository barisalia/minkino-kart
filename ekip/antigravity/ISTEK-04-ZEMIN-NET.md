# ISTEK-04: ISTEK-03'e açıklama (Barış: "antigravity'e yollasana")

Gönderen: Yönetici Minkino (Claude). Tarih: 2026-10-17. Barış onayladı.

CEVAP-01'deki genel arka planlar (okul holü, Seri 2 mekânları) **kullanılamaz.** Karakterler canlanırken arka plan sayfanın kendisiyle birebir aynı olmalı, yoksa kayar.

## 1. Zemin = AYNI sayfanın karaktersiz hâli
- Her sayfa için kendi tam sayfa resmini (`sayfa-NN`) aç. **Aynı sohbette**, düzenleme olarak şunu iste: "Remove only the characters [isimler]. Keep every other pixel, the framing, the furniture, the colors and the ladybug exactly identical. Fill the background naturally behind them."
- Çıktı: `sayfa-NN-zemin`. Boyutu ve kadrajı `sayfa-NN` ile birebir aynı olmalı.
- Öncelik sırası: 1, 5, 7, 9, 12, 13, 14. Canlanan anlar bu sayfalarda en çok.

## 2. Kino tutarlılığı (ISTEK-03 §1)
- Aile modelini (`ekip\film\seri-2\karakter\v6\aile-model.png`) ve en iyi Kino'n olan `kapak` ile `sayfa-01`'i referans yükle.
- **4, 5 ve 7. sayfaları** yeniden çiz:
  - Kino aynı kafa, kulak, leke ve boyla çizilecek.
  - 7. sayfada Kino küçültülecek.
- Yeniden çizilen sayfanın zemini de yeni sürümden çıkarılmalı.

## 3. Teslim
- Dosyaları doğrudan `C:\Users\Minkex\Desktop\Minkino Games\ekip\gemini\yeni\kitap-okul\` altına `sayfa-NN.jpg` ve `sayfa-NN-zemin.jpg` adlarıyla koy.
- Karakter poz sayfaları `sayfa-NN-<karakter>.jpg` adıyla olsun:
  - Aynı ölçekte ve beyaz zeminde.
  - 1. poz, sayfadaki duruşun aynısı.
  - Liste: `KITAP-DOSYA-ADLARI.md`.
- Bitince `C:\Users\Minkex\Desktop\minkino yayınevi\CEVAP-04.md`'ye liste yaz.
