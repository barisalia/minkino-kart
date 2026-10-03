# Adobe kalite planı (2026-10-03, Barış: "özellikle Adobe, Turntable, kaliteyi artırın")

İsteyen: yönetici minkino. Ana hedef **kalite**. Hızlı ama kötü iş istenmiyor. Her çıktı açık ve koyu zeminde önizlenir. Kötü olan yeniden yapılır; bir şey "idare eder" diye geçilmez.

## 1. Turntable kusurlarını düzelt (önce bu)
Yönetici önizlemelerde şu hataları gördü. Illustrator'da elle düzelt: Doğrudan Seçim aracıyla, parçayı silerek ya da taşıyarak. Gerekirse o açıyı Dönen tabla'da yeniden üret, 45/90° yerine 80-100° aralığında bir iki açı dene.

| Karakter | Görünüm | Kusur | İstenen |
|---|---|---|---|
| ayı | yan | Kıvrık domuz kuyruğu var. Kulak başın tepesinde tek parça duruyor. Alında koyu bir leke var. | Kuyruk küçük ve yuvarlak ponpon olsun ya da hiç olmasın. Kulak başın arka üstünde, yuvarlak dursun. Leke silinsin. |
| ayı | arka | Göbekte kuyruğa benzeyen tuhaf bir yuvarlak var. Kollar fazla açık. | Küçük yuvarlak bir kuyruk olsun. Kollar gövdeye daha yakın dursun. |
| maymun | yan | Kulak başın arkasına, ensenin üstüne yapışmış. Parlama çizgileri aşırı ve beyaz şeritler var. | Kulak başın yanında dursun. Parlamalar azaltılsın, en fazla 2 küçük parlama. |
| maymun | genel | Gövdede parlak beyaz dikey şeritler var. | Mat ve yumuşak gölge olsun (Mino stili). |
| inek | yan | Ön kol garip, kutu gibi sarkıyor. Yanakta pembe leke kayık. | Kol gövdenin önünde, aşağı doğal sarksın. Burun ve ağız tek parça dursun. |
| kuş | yan | Kanat dik duruyor, gövdenin ortasını kesen bir çubuk gibi. | Kanat gövdenin yanında, kapalı ve yatık dursun. |
| köpek, tavşan, ördek | yan | Yok (yalnız 3/4 ve arka var). | Gemini'deki yan profiller iskelette duruyor. Turntable 3/4 ile renk ve oran tutarlılığını kontrol et. |

Her düzeltmeden sonra `ekip/turntable/<ad>/onizleme.png` dosyasını yeniden üret. Eski dosyanın adı `onizleme-eski.png` olsun. Yöneticiye tek satır: "<ad> düzeldi, önce/sonra".

## 2. Hayvan profil iskeletleri (oyunlarda yürüyen yan görünüm)
Düzelen yan görünüşleri köpek standardındaki `kopek-profil.svg/json` iskeletine çevir: `ekip/pazar-musteri/kopek-profil.*`. Sıra: **ayı, maymun, inek, kuş**. Bunlar şimdilik taslak/ altında duruyor.
- Bacak pivotları kalçada olmalı. Can'ın profilinde adım kısa çıkmıştı; bacak pivotu taşınınca düzeldi.
- Kuşta kanat-on ve kanat-arka katmanları gerekiyor (src/karakter/yandan.ts kanat desteği var).
- Bittiğinde `node scripts/karakter/iskelet-al.mjs` çalıştır. Kodcu boy.test ile yan yürüyüş testini çalıştırır.

## 3. Kalan eşya Turntable'ları
Sıra: elma, top, sepet, beşik, salıncak, kaydırak, pasta.
- Parça sayısı 400'ün üstündeyse önce `[6 Colors]` izle sadeleştir. Salıncak, kaydırak ve pasta Illustrator'ı çökertmişti.
- Adlandırma `esya-adlandir.cjs` ile yapılır.

## 4. Gemini'den gelen yeni çizimleri temizle
- `minkino-film-gemini\okul-ses\` → `assets/okul/ses/<ad>.webp`
- `minkino-film-gemini\okul-kelime\` → `assets/okul/kelime/<ad>.webp`

Kullanılacak betik `ekip/illustrator/gemini-esya.cjs`.
- Beyaz zemin silinir, iç beyazlar korunur, hale kalmaz. Oran asla gerilmez (contain).
- Önizleme açık ve koyu zeminde yapılır.
- Arı karakteri (ari, ari-ucan, ari-mutlu) gelince Turntable'a da girer: 3/4 ve yan.

## Kurallar
- Git yok. Başka oturumların dosyalarına dokunma.
- Firefly kredisi gerekirse israf etmeden kullan ve kullandığını yaz.
- Recraft kullanma; gerekiyorsa yöneticiye sor.
- Illustrator çökerse: WerFault'u kapat, programı yeniden başlat, devam et.
