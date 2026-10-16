# ISTEK-03: "Kino Okula Başlıyor" çizim düzeltmeleri (Barış onayladı)

Gönderen: Yönetici Minkino (Claude). Tarih: 2026-10-17. Barış: "tamam düzeltir onları".

Teslimin (CEVAP-01) genel olarak güzel; stil temiz ve sıcak, Bulut çok iyi. İki düzeltme gerekiyor:

## 1. Karakter tutarlılığı
Kino ve Anne her sayfada AYNI görünmeli: baş biçimi, kulak, leke, göz, boy oranı, kıyafet. Her sayfada referans olarak yükle:
- `C:\Users\Minkex\Desktop\Minkino Games\ekip\film\seri-2\karakter\v6\aile-model.png` (Kino ve ailesi model sayfası)
- Senin `kapak` ve `sayfa-01`'deki Kino'n (en iyi olanlar)

Yeniden çizilecekler:
- **sayfa-04:** Kino çok küçük ve farklı. Anne de farklı görünüyor (beyaz tüy, kırmızı kurdele), aile modeline göre çiz.
- **sayfa-05:** Kino'nun gözleri ve kafası farklı.
- **sayfa-07:** Kino çok büyük. Kino boyu her sayfada yaklaşık aynı ölçekte olsun.
- Diğer sayfalarda da Kino'yu aile modeliyle karşılaştır. Fark varsa o sayfayı da düzelt.

## 2. Canlanan anlar için katmanlar (animasyon)
Kitapta dokununca karakterler canlanıyor. Bunun için her sayfada:
- **`sayfa-NN-zemin`:** Aynı resmin hareketli karakterleri SİLİNMİŞ hâli. Aynı kadraj ve aynı ölçek, arkası doğal tamamlanmış. Aynı sohbette "remove the characters, keep everything else identical" diye düzenleyerek üret.
- **`sayfa-NN-<karakter>`:** O sayfadaki hareketli karakterin hareket sayfası. Aynı ölçek, düz beyaz zemin. 1. poz sayfadaki duruşun aynısı, diğerleri canlanan anlardaki pozlar.

Hangi sayfada hangi karakter ve hangi pozlar: `C:\Users\Minkex\Desktop\Minkino Games\ekip\antigravity\KITAP-DOSYA-ADLARI.md`. Senaryo: `ekip\senaryo\KITAP-MINO-KINO.md` §2.5'teki "Canlanan" maddeleri.

## Kurallar
- Stil aynı kalsın, temiz ve sade. Yazı ve harf yok.
- Parça döndürme yok. Pozlar ayrı çizilir.
- Çıktılar: `C:\Users\Minkex\Desktop\Minkino Games\ekip\gemini\yeni\kitap-okul\` altına, doğrudan bu adlarla.
- Bitince `C:\Users\Minkex\Desktop\Minkino Games\ekip\antigravity\CEVAP-03.md`'ye liste yaz.
