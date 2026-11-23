# Uygulama paketi boyu: ölçüm ve küçültme yolları

Hazırlayan: Claude (İngilizce oturumu), 22 Kasım 2026 sabahı, yöneticinin isteğiyle.
Kaynak dosyalara dokunulmadı, dosya silinmedi, derleme yüklenmedi. Bütün dönüştürmeler scratch klasöründe, kopyalar üstünde yapıldı.

## 1. Ölçüm (`npm run build:app`, 22 Kasım 06:19–06:50)

- Derleme bir kez koştu, hatasız bitti (31 dk). Ses küçültme satırı: *9329 kayıt, 7125 küçüldü; 328,0 MB → 197,1 MB (131,0 MB kazanç)*.
- **`dist` toplamı 787,9 MB.** Bir önceki `dist` (21 Kasım) 625,2 MB'tı; fark **+162,8 MB**. Bu artışın çoğu İngilizce: kaynakta 96,7 MB çizim (624 WebP) ve 64,4 MB kayıt (3194 mp3, 96 kb/s; derlemede 64 kb/s'ye iner).
- `dist` artık bu derlemenin çıktısı. 21 Kasım'daki `dist`'in yerine geçti.

| Tür | Boy | Dosya |
|---|---:|---:|
| WebP çizim | 555,6 MB | 5273 |
| mp3 | 197,1 MB | 9329 |
| js | 13,8 MB | 3292 |
| svg | 9,5 MB | 547 |
| png | 3,5 MB | 102 |
| flac | 3,4 MB | 2 |
| wav | 2,5 MB | 38 |

Klasöre göre: `dist/assets` 582 MB, `dist/kino-ile-sen-sec` 157 MB (Fırtına 128, Film 29), `dist/ses` 55 MB.

**Paketin yüzde yetmişi çizim.** Küçültmenin asıl yeri orası.

### En büyük 30 dosya (MB)

| # | MB | Dosya |
|---:|---:|---|
| 1 | 1.81 | dist/assets/kino-sahne-vokal-DL9ztzcY.flac |
| 2 | 1.55 | dist/assets/cebimdeki-tohum-BwHYuXSj.flac |
| 3 | 1.47 | dist/assets/The_Morning_Whisk-CTD8X6yi.mp3 |
| 4 | 1.47 | dist/kino-ile-sen-sec/film/bir-gun/ses/sabah.mp3 |
| 5 | 1.38 | dist/ikon-1024.png |
| 6 | 1.28 | dist/assets/sahne-bizim-gecici-CUlyU8TB.mp3 |
| 7 | 1.24 | dist/assets/22-B-QTnhxZ.webp |
| 8 | 1.21 | dist/assets/16-CAvgWDxe.webp |
| 9 | 1.21 | dist/assets/sahne-ciftlik-CsOpcEC_.webp |
| 10 | 1.12 | dist/kino-ile-sen-sec/firtina/medya/oyunculuk-kino-feneri-as-cbe5829e1a.webp |
| 11 | 1.10 | dist/assets/19-zDKjG_LQ.webp |
| 12 | 1.08 | dist/assets/bahce-bocek-BCvO5fd4.webp |
| 13 | 1.06 | dist/kino-ile-sen-sec/firtina/ses/muzik.mp3 |
| 14 | 1.06 | dist/assets/bahce-kus-BygA_GBk.webp |
| 15 | 1.03 | dist/assets/bahce-deniz-8Al9OIij.webp |
| 16 | 1.02 | dist/assets/the-cow-says-DICYArwz.mp3 |
| 17 | 1.02 | dist/assets/bahce-yavru-CFTNgPDI.webp |
| 18 | 1.00 | dist/kino-ile-sen-sec/firtina/medya/oyunculuk-kino-minder-diz-1949f3451b.webp |
| 19 | 1.00 | dist/assets/bahce-vahsi-qbUCV85P.webp |
| 20 | 0.99 | dist/assets/bahce-orman-DE7YoEwt.webp |
| 21 | 0.97 | dist/assets/bahce-B0joUzH-.webp |
| 22 | 0.91 | dist/assets/oyuncak-ordek-havuz-Bs-Zf-O4.webp |
| 23 | 0.91 | dist/assets/dere-7qBOL4hw.webp |
| 24 | 0.91 | dist/assets/sinif-sekiller-2-pIWha3mD.webp |
| 25 | 0.90 | dist/kino-ile-sen-sec/firtina/medya/oyunculuk-kino-fener-masaya-0fe836bc0a.webp |
| 26 | 0.89 | dist/assets/cay-masasi-CJv95Ovj.webp |
| 27 | 0.89 | dist/assets/sinif-sekiller-BNhPnmDW.webp |
| 28 | 0.89 | dist/assets/fon-0Mzw-mfB.webp |
| 29 | 0.88 | dist/kino-ile-sen-sec/firtina/medya/poz-ortak-2-a8477a6ac6.webp |
| 30 | 0.86 | dist/assets/fon-BlX1nTIC.webp |

En büyük dosyalar tek tek küçük (en büyüğü 1,8 MB). Boyu tek bir dev dosya değil, binlerce orta boy çizim oluşturuyor.

## 2. Küçültme yolları (büyükten küçüğe)

### 2.1 Çizim kalitesi, en büyük kazanç: ~147–196 MB (örnekten tahmin)

Astra'nın çizimleri neredeyse kayıpsız kaydedilmiş. Düz renkli, konturlu çizimde kalite 90 ya da 85'te göz farkı yok.
Bunu yapan betik hazır: `scripts/uygulama-gorsel-kucult.mjs`. BUILD-6-HAZIRLIK'te "Barış'ın onayını bekliyor" diye duruyor. Betik yalnız `dist`'i değiştirir, kaynaklara dokunmaz. Saydamlığı (alfa) kayıpsız bırakır. 20 KB altı ve çok kareli çizimlere dokunmaz. Yüzde 20'den az küçülen çizimi eskisiyle bırakır.

**Örnekten tahmin** (bugünkü `dist`, klasör başına rastgele 300 WebP, betiğin kurallarıyla, 1 işçi):

| | WebP toplamı | Kazanç | Paket (787,9 MB) |
|---|---:|---:|---:|
| Kalite 90 | 555,6 → 408,7 MB | **~147 MB** | ~641 MB |
| Kalite 85 (betikteki değer) | 555,6 → 360,0 MB | **~196 MB** | ~592 MB |

- `dist/assets` (4693 çizim): q90'da %64'üne, q85'te %52'sine iniyor.
- **Kino'yla Sen Seç'in çizimleri** (`kino-ile-sen-sec`, ~152 MB WebP) zaten sıkıştırılmış. Örnekteki 33 dosyanın hiçbiri %20 küçülmedi, kazanç oradan gelmez.
- İngilizce tek başına (kaynaktan 70 örnek): 96,7 MB çizim, q90'da ~58 MB, q85'te ~65 MB kazanç. Kelime kartları en çok küçülenler (%32–38'ine iniyor).

**Görünür kayıp yok, kanıt (scratch'te dönüştürüldü):**

| Dosya | Asıl | q90 | q82 | SSIM (q90) | PSNR (q90) |
|---|---:|---:|---:|---:|---:|
| sarki/sahne-ciftlik (2000×1250) | 1183 KB | 122 KB | 83 KB | 0,9957 | 42,4 dB |
| sahne/bahce-bocek | 1050 KB | 98 KB | 62 KB | 0,9939 | 44,8 dB |
| sahne/bahce-kus | 1031 KB | 82 KB | 54 KB | 0,9954 | 45,5 dB |
| kelime/zebra | 212 KB | 50 KB | 41 KB | 0,9969 | 47,9 dB |
| kelime/cow (saydam) | 99 KB | 71 KB | 57 KB | 0,9977 | 47,3 dB |
| kisi/polly-selam-0 (saydam) | 48 KB | 36 KB | 28 KB | 0,9980 | 44,5 dB |

SSIM 1'e ne kadar yakınsa o kadar aynıdır; 0,99 üstü gözle ayırt edilmez. %100 boyda yan yana kesitler (solda asıl, sağda q90): `ekip/uygulama/paket-boyu/yakin-sahne-ciftlik-sol-asil-sag-q90.png`, `ekip/uygulama/paket-boyu/yakin-zebra-sol-asil-sag-q90.png`. Kontur, düz renk ve kenar aynı. Eski q82 karşılaştırması: `ekip/uygulama/gorsel-karsilastirma/`.

**Açmadan önce dikkat:** Piksel okuyan oyunlar BUILD-6-HAZIRLIK'te sayılı (`canlan/src/boya.ts`, `sef/src/kurabiye-tepsisi.ts`, `sef/src/restoran-tadim.ts`, `hazirlik/src/pano-resmi.ts`, `dedektif/src/resimler3.ts`, `macera/src/banyo-efekt.ts`, `src/karakter/yandan.ts`). O listeden sonra eklenenler: `alfabe/src/boyama-resmi.ts`, `doktor/src/main.ts`, `doktor/src/varliklar.ts`.
- Bunların çizimleri ya betikte hariç tutulmalı ya da o oyunların e2e testleri küçültülmüş paketle geçmeli.
- İngilizce'nin tek piksel okuması (`ingilizce/src/ekranlar/adalar.ts`) yalnız saydamlığa bakar ve saydamlık kayıpsız kalır; etkilenmez.

**Önerim:** Önce kalite 90 (~147 MB). En güvenli adım budur, fark ölçülemeyecek kadar küçük. q85 49 MB daha kazandırır; eski q82 karşılaştırmasında da göz farkı yoktu. Karar Barış'ın.

### 2.2 Konuşma kayıtları 64 → 48 kb/s: ~46 MB (dinleme onayı gerekir)

- Derleme konuşmayı zaten 128/96 kb/s'den 64 kb/s'ye indiriyor (bugün 131 MB kazanç). Kalan mp3: konuşma ~187 MB, müzik ve efekt 9,8 MB.
- 15 rastgele konuşma kaydı 48 kb/s'de 476 KB'tan 358 KB'a indi (−%25). Bütüne vurulunca **~46 MB**.
- 4 İngilizce kaydın örneği: w-cow 8/5/4 KB, c-cow 11/8/6 KB, tr/k-cow 12/9/6 KB, g-great-job 13/9/6 KB (96k / 64k / 48k).
- Bunu "duyulur kayıp yok" diye kesinleştiremem. 48k'de üst frekanslar kırpılır; "s" ve "f" sesleri İngilizce telaffuzda önemli. Eski dinleme dosyaları `ekip/uygulama/ses-karsilastirma/` içinde (asıl 128, 64, 48). O seçmede 64'te kalınmıştı. **Barış dinlemeden açılmamalı.**
- Alternatif: yalnız Türkçe Ceren yönergeleri 48k, İngilizce sözcükler 64k'de kalır. Kazanç daha az olur, telaffuz korunur.

### 2.3 Kayıpsız müzik (flac): ~2,5 MB

`kino-sahne-vokal.flac` (1,8 MB) ve `cebimdeki-tohum.flac` (1,6 MB). Şarkıdır. 192 kb/s mp3 olunca ikisi birlikte yaklaşık 1 MB kalır; bu tahmindir, dönüştürülüp ölçülmedi. Kazanç küçük. Şarkı dosyası Barış'ın, bu yüzden dönüştürülmeden önce ona sorulmalı.

### 2.4 Aynı dosyanın iki kopyası: önemsiz (< 1 MB)

- Bayt bayt aynı dosya: 1602 fazla kopya, toplam **0,2 MB**. Çoğu birkaç yüz baytlık js parçası ve bir yazı tipi. Vite aynı içeriği zaten tek dosyada topluyor.
- Görünüşü aynı ama ayrı kodlanmış çizim: 533 aday çift tam boyda piksel piksel karşılaştırıldı, gerçekten aynı olan **30 çift, ~0,8 MB**. Adaylar çoğunlukla aynı şeklin renk sürümleri (kırmızı ve mavi kart) ya da animasyon kareleri; bunlar ayrı dosya olmalı. Buradan kazanç yok.

### 2.5 Kullanılmayan dosya: İngilizce'de neredeyse yok

- İngilizce'nin 3194 kaydı ses metni listeleriyle (`scripts/ingilizce-ses.ts`'in tam listesi) karşılaştırıldı. Listede olmayan 50 kayıttan 48'i kodda kullanılıyor (`efekt/*` hayvan ve taşıt sesleri, `abc-ses-*` harf sesleri).
- **Kullanılmayan 2 kayıt:** `en/g-rd-it-is-gray`, `en/g-rd-it-is-long` (bilmece ipuçları değişince boşa çıktı), toplam 35 KB.
- Diğer bölümler bu ölçümde taranmadı.
- Not: `ingilizce/vite-dosyalar.ts`, `assets/ingilizce` altındaki **bütün** webp ve mp3'ü pakete koyar. İleride oraya taslak ya da yedek dosya bırakılırsa pakete girer. Bugün öyle bir klasör yok.

## 3. Özet

| Yol | Kazanç | Görünür/duyulur kayıp | Durum |
|---|---:|---|---|
| Çizim q90 | ~147 MB (örnekten tahmin) | Yok (SSIM ≥ 0,994) | Betik hazır, onay ve piksel okuyan oyun listesi bekliyor |
| Çizim q85 | ~196 MB (örnekten tahmin) | Yok (eski q82 denemesi dahil) | Aynı betiğin bugünkü değeri |
| Konuşma 48 kb/s | ~46 MB | Dinlenmeli | Önce dinleme |
| flac → mp3 | ~2,5 MB | Yok | Küçük, şarkı Barış'ın |
| Kopya ve kullanılmayan | < 1 MB | — | Değmez |

Paket bugün 787,9 MB. Yalnız çizim q90 ile ~641 MB, q85 ile ~592 MB olur. Bu kazanç İngilizce'nin eklediği 163 MB'ın neredeyse tamamını geri alır.

## 4. Yöntem notları

- Bütün WebP'ler ölçülmedi (yönetici: kilit uzun sürüyordu). Klasör başına rastgele örnek alındı, kazanç her klasörün bayt oranıyla toplama taşındı. Kesin sayı derlemede betiğin kendi satırından okunur.
- Ses tahmini: derlemedeki 64 kb/s hâlinden 15 rastgele konuşma kaydı 48 kb/s'ye çevrildi.
- Kullanılan scratch betikleri ve ham listeler (dist dosya listesi, kopya ve benzer çizim listeleri) bu oturumun scratch klasöründe duruyor; kalıcı değil.
