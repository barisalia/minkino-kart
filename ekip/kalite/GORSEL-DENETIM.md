# Görsel kalite denetimi (2026-10-03)

Barış'ın gözlemi: "bazı görseller düşük kaliteli, arka planlar büyük ekranda gerilip bulanıklaşıyor". Bu belge **yalnız tespit**
içerir; hiçbir görsel ya da kod değiştirilmedi. Liste, yeniden çizim (Recraft Pro Vector / Gemini) ve kod düzeltmesi için iş
sırasıdır: **en çok göze batan en üstte**.

## Nasıl ölçüldü

- `npm run build:app` (uygulama derlemesi) → `vite preview --port 4302`, Chromium (Playwright) ile gerçek piksel oranlı 5 cihaz:
  iPhone 15 Pro Max yatay 932×430 @3x · iPhone dikey 430×932 @3x · iPad Pro yatay 1366×1024 @2x · iPad Pro dikey 1024×1366 @2x ·
  Android tablet 1280×800 @2x.
- 50 ekran: menü; kartlar (açılış, oyun ×2 tema, albüm); pazar (açılış, oyun, meyve suyu); canlan (açılış, liste, çizim, müze);
  macera (açılış, ege, banyo, elektrik, salıncak); film (katalog, 2 kapak, 3 film oynarken: pazar/park/ev); okul (harita, bölge,
  albüm, Sayı Bahçesi'nin 10 etkinliğinin hepsi); pasta (açılış, Gün 1, Gün 2 sipariş); dedektif (açılış + 5 adım).
  **Ses Kulesi ve Kelime Köprüsü main'de yok**: haritada "Yakında" kilitli kart olarak duruyorlar, etkinlikleri kayıtlı değil
  (görselleri `assets/okul/ses`, `assets/okul/kelime` içinde hazır). Ölçülemedi.
- Her ekranda görünen her `<img>`, CSS arka planı (`::before/::after` dahil), SVG `<image>` ve `<canvas>` için: doğal boyut,
  ekranda çizildiği boyut × cihaz piksel oranı = **gereken piksel**, **ölçek = gereken / doğal** (1'den büyükse büyütülüyor →
  bulanık), en/boy bozulması (gerilme). `object-fit`, `background-size` (cover/contain/yüzde/px), SVG `preserveAspectRatio`,
  CSS `transform/scale` zinciri ve kamera yakınlaştırmaları hesaba katıldı.
- Eşikler: ölçek > 1.15 → bulanık; en/boy farkı > %3 → gerilmiş; ayrıca gözle: stile aykırı / dokulu / küçük kaynak.
- Araç: `scripts/denetim/gorsel-denetim.mjs` (ölçüm), `scripts/denetim/kaynak-bul.mjs` (karma adlı dosya → repo yolu + varsa
  daha büyük asıl çizim), `scripts/denetim/ozet.mjs` (cihazlar arası en kötü değerler). Ham sonuç ve iPad @2x tam çözünürlük
  ekran görüntüleri: `tests/screens/denetim-*.json`, `tests/screens/denetim-<ekran>-ipad-yatay.png` / `-ipad-dikey.png`
  (repoya girmez, yerelde).

"Gereken" sütunu bütün cihazların en büyüğüdür; çoğunda en kötüsü **dikey iPad** ya da **dikey iPhone**dur (yatay görsel dikey
ekranı `cover` ile doldurunca yüksekliğe göre büyür). Yatay cihazlardaki en büyük değer ayrıca yazıldı.

> **Pratik sınır:** tek bir WebP'nin kenarı ~6000 px'i geçerse telefonda bellek sorunu çıkar (5600×5600 ≈ 125 MB çözülmüş).
> Gereken 6000'i aşanlarda iki yol var: (1) Recraft Pro Vector çıktısını **SVG olarak doğrudan** kullanmak (vektör, her
> boyutta net; yol sayısı makul ise), (2) kodla yakınlaştırmayı sınırlamak / yalnız görünen parçayı ayrı ve büyük çizdirmek.
> Tabloda bu satırlar **(SVG önerilir)** diye işaretli.

## Ana tablo (en kötüden iyiye)

Ölçek: `yatay en kötü / tüm cihazlar en kötü`. Hedef boyut = yeniden çizimde istenecek en küçük piksel (yukarı yuvarlandı).

| # | Oyun | Ekran | Dosya | Doğal | Gereken (en büyük) | Ölçek × | Gerilmiş? | Önerilen düzeltme | Hedef boyut |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Macera | Açılış, Ege, Elektrik (oda); menü kartı | `assets/parti-sahne/oda.webp` | 1024×1024 | 5462×5462 (yatay 4096×4096) | ×4.0 / ×5.3 | hayır | **Recraft Pro Vector arka plan yeniden çiz** | 4096×4096 (dikey iPad için 5632×5632, SVG önerilir) — bkz. A1 |
| 2 | Macera | Ege, Banyo, Elektrik — yatay ekranın iki yanı | (kod) `macera/src/macera.css` → `.mc-yan-dolgu` | — | — | — | — | **kod**: yatayda sahne 75vh genişlikte dikey bir bant, iki yanı odanın **bilerek bulanıklaştırılmış** kopyası (`filter: blur`). Ekranın iPhone yatayda %65'i, Android tablette %53'ü, iPad yatayda %44'ü bulanık. Barış'ın "büyük ekranda bulanık" dediği ilk şey büyük olasılıkla bu. Çözüm: odaları geniş (16:9) çizdirip bandı kaldırmak (A1, A6) — **ürün kararı, Barış'a sorulmalı** | — |
| 3 | Pasta | Gün ekranı (otobüsün içi) | `assets/pasta/arka-tezgah-uzak-1.webp` | 1376×768 | 9158×5110 (yatay aynı) | ×6.7 / ×6.7 | hayır (100% 100% ama oranlı kutu) | **Recraft Pro Vector arka plan yeniden çiz** (otobüs içi). Kod pencereyi müşteri alanına oturtmak için resmi ekranın ~3.3 katına büyütüyor; görünen kısım fayans duvar, pencere çerçevesi, raflar | 8192×4572 (SVG önerilir) — bkz. A2 |
| 4 | Dedektif | Bütün adımlar (çalışma odası, kamera yakın) + Film "ev" sahneleri | `assets/film/ev/arka-uzak.webp`, `arka-orta.webp`, `arka-on.webp` | 2752×1536 | 13739×7667 (yatay 8606×4803) | ×3.1 / ×5.0 (film içinde ×2.0) | hayır | **Recraft Pro Vector arka plan yeniden çiz** (3 katman). Dedektif kamerası odanın bir kısmına yakınlaşıyor | 8704×4864 (SVG önerilir; dikey iPad'e yetmez → kamera yakınlığı kodla sınırlanmalı) — bkz. A3 |
| 5 | Film | Film kapağı (Oynat ekranı, tam ekran) + Çizgi Filmler kartları | `assets/film/kapak/*.webp` (6 dosya) | 960×540 | 4971×2796 (yatay 3641×2048) | ×3.8 / ×5.2 | hayır | **kaynak var, daha büyük export yeterli**: kapak filmin kendi karesi; `npm run film:mp4 -- yatay --film=<ad> --ornek=<sn>` ile 2732+ px kare alınıp yeniden kaydedilir (şu an rehber 960 px diyor, `ekip/film/FILM-REHBERI.md` §11) | 3648×2052 (16:9) |
| 6 | Macera | Salıncak (park) | `assets/film/park/arka-uzak.webp`, `arka-orta.webp` | 2752×1536 | 6679×3725 (yatay aynı) | ×2.4 / ×2.4 | hayır | **Recraft Pro Vector arka plan yeniden çiz** (park seti). Sol üstteki büyük ağaç belirgin bulanık | 6912×3840 (SVG önerilir) — bkz. A4 |
| 7 | Macera | Salıncak (köşe çalı öbekleri) | `assets/film/park/arka-on.webp` (`.sl-kume`) | 2752×1536 | 13795×6441 | ×5.0 | **evet, %20** | **kod: object-fit/background-size düzelt** — `macera/src/salincak.css` `.sl-kume` resmin köşesini `294% 222%` / `227% 454%` gibi eşit olmayan yüzdelerle kırpıyor: hem gerili hem ×5 büyük. Öbekleri ayrı obje olarak çizdirip (Gemini) koymak daha doğru | öbek başına ~1200×900 (Gemini) |
| 8 | Pazar | Açılış, Pazar, Meyve suyu (+ menü kartı) | `assets/pazar/arkaplan.webp` | 1024×1024 | 2796×2796 (yatay aynı) | ×2.7 / ×2.7 | hayır | **Recraft Pro Vector arka plan yeniden çiz**. Ayrıca gökyüzü sulu boya/dokulu, stil kuralına aykırı | 2816×2816 — bkz. A5 |
| 9 | Pazar | Açılış, Pazar, Meyve suyu | `assets/pazar/tezgah.webp` (tezgâh 3 katman: arka, tente, tahta) | 560×560 | 2312×2312 (yatay 1714×1714) | ×3.1 / ×4.1 | hayır | **Recraft Pro Vector arka plan yeniden çiz** (ekranın ortasını kaplayan sahne öğesi; Gemini'nin ~2048 sınırını aşıyor) | 2368×2368, şeffaf zemin |
| 10 | Macera | Banyo (+ yan dolgu) | `assets/banyo/arkaplan.webp` | 2688×1536 | 6647×3798 (yatay 4984×2848) | ×1.9 / ×2.5 | hayır | **Recraft Pro Vector arka plan yeniden çiz** (`ekip/banyo/kaynak/arkaplan.webp` daha küçük, 1344×768; işe yaramaz) | 5120×2926 (SVG önerilir) — bkz. A6 |
| 11 | Dedektif | Bütün adımlar (masa) | `assets/okul/ses/masa.webp` | 405×300 | 2385×1764 (yatay 1494×1105) | ×3.7 / ×5.9 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** (asıl `minkino-film-gemini/okul-ses/masa.png` yalnız 473 px). Ses Kulesi'nin küçük ikonu dedektifte dev masa olmuş | 2432×1792 |
| 12 | Okul | Bölge, Albüm, Hangisinde çok | `assets/okul/tabak.webp` | 512×220 | 2690×1156 (yatay 1838×790) | ×3.6 / ×5.3 | **evet, %51** | **kod: object-fit/background-size düzelt** (`object-fit: fill`, kutu tabağın oranında değil) + **kaynak var, daha büyük export yeterli** (`minkino-film-gemini/okul/tabak-2.png` 1380×1380, aynı tabak) | 1920×825 |
| 13 | Okul | Kuşlar, Kaç alkış (dal) | `assets/okul/dal.webp` | 1000×140 | 5451×488 (yatay 4610×482) | ×4.6 / ×5.5 | **evet, %91** | **kod: object-fit/background-size düzelt** (dal ekran boyunca enine çekiliyor, kalınlığı sabit) + **kaynak var, daha büyük export yeterli** (`minkino-film-gemini/okul/dal-2.png` 2535×2535, aynı dal) | ~1900 px en (asıldan); daha uzun dal gerekiyorsa Gemini ile 4608 px uzun dal |
| 14 | Okul | Piknik, Bölge, Albüm | `assets/okul/piknik-ortusu.webp` | 800×340 | 2838×942 (yatay 2538×830) | ×3.2 / ×3.5 | **evet, %80** | **kod: object-fit/background-size düzelt** (`fill`, örtü yayvan gerilmiş) + **Gemini ile yüksek çözünürlükte yeniden çiz** (asıl 512 px, küçük) | 2880×1216 |
| 15 | Macera | Ege (oda içindeki eşyalar) | `assets/parti/koltuk.webp`, `assets/parti/masa.webp` | 512×396, 512×349 | 1312×992 | ×1.9 / ×2.6 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** | 1344×1024 |
| 16 | Okul | Kaç elma (ağaç) | `assets/okul/agac.webp` | 768×560 | 2014×1470 (yatay 1658×1210) | ×2.2 / ×2.6 | hayır | **kaynak var, daha büyük export yeterli** (`minkino-film-gemini/okul/agac.png` 1216×880, aynı ağaç; yatayda yine ×1.4) → tam netlik için **Gemini ile yüksek çözünürlükte yeniden çiz** | 2048×1495 |
| 17 | Pasta | Gün ekranı (tezgâh dolapları) | `assets/pasta/tezgah-on-1.webp` | 1376×768 | 3078×1718 (yatay aynı) | ×2.2 / ×2.2 | hayır | **Recraft Pro Vector arka plan yeniden çiz** (otobüs içi, A2 ile aynı set) | 3136×1750 (yatay tekrar eden şerit) |
| 18 | Pasta | Açılış, Akşam, Raf (otobüs) | (kod) `pasta/src/cizim.ts` → `OTOBUS_KOD` (kodla çizilmiş SVG) | vektör | — | — | — | **Recraft Pro Vector arka plan yeniden çiz** (Pasta otobüsü). Bulanık değil ama düz renk, kaba çizim; arka planın parlak stilinin yanında oyuncak gibi duruyor ("kodla çizim kaba" kuralı) | 3072×2016 (viewBox 640×420 oranı), SVG |
| 19 | Pasta | Gün ekranı (fırın) | `assets/pasta/firin-dik-1.webp` | 311×504 | 652×1056 (yatay 615×996) | ×2.0 / ×2.1 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** (`minkino-film-gemini/pasta/firin-1.png` 1024² var ama fırın içinde ~600 px; yetmez) | 704×1140 |
| 20 | Dedektif | Bütün adımlar (devrik lamba) | `assets/dedektif/lamba-devrik.webp` | 591×578 | 1258×1227 (yatay 788×769) | ×1.3 / ×2.1 | hayır | **kaynak var, daha büyük export yeterli** (`minkino-film-gemini/dedektif/lamba-devrik.png` 1690×2528, aynı lamba) | 1280×1252 |
| 21 | Macera | Ege (mama sandalyesi) | `assets/ege/mama-sandalyesi.webp` | 537×723 | 1153×1551 (yatay 863×1163) | ×1.6 / ×2.1 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** (asıl klasördeki `esya/mama-sandalyesi-1.png` başka çizim — sarı, ahşap; beyaz sandalye değil) | 1166×1568 |
| 22 | Canlan | Açılış vitrini (canlanan boyalı resim) | (kod) `canlan/src/boya.ts` → `BOYUT = 360` | 360×360 | 1122×1122 | ×3.1 / ×3.1 | parça kutusuna göre (bilerek) | **kod**: boya katmanı 360 px tuvalde üretiliyor; `BOYUT` cihaz piksel oranıyla büyütülmeli (ör. 1024) | — |
| 23 | Film | Ev filmi (öndeki oyuncak öbeği) | `assets/film/ev/on-kume.webp` | 743×520 | 1344×941 | ×1.8 / ×1.8 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** | 1408×986 |
| 24 | Okul | Bir fazla (istasyon) | `assets/okul/istasyon.webp` | 360×300 | 616×514 (yatay 608×506) | ×1.7 / ×1.7 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** (asıl 477 px, yetmez) | 640×534 |
| 25 | Dedektif | Bütün adımlar (kalem) | `assets/okul/ses/kalem.webp` | 662×110 | 1151×192 (yatay 721×121) | ×1.1 / ×1.7 | hayır | **kaynak var, daha büyük export yeterli** (`minkino-film-gemini/okul-ses/kalem.png` 730², çok az büyük) → dikey iPad için **Gemini** | 1152×192 |
| 26 | Pasta | Gün (sipariş balonu ve tabaktaki kremalı kurabiyeler) | `assets/pasta/kurabiye-*-krema-*.webp` (9 dosya) | 297×277 | 466×434 | ×1.6 / ×1.6 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** (asıllar 366², yetmez) | 512×478 |
| 27 | Okul / Pazar | Sepete koy, Pazar | `assets/pazar/sepet.webp` | 560×560 | 880×880 (yatay 632×632) | ×1.1 / ×1.6 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** | 896×896 |
| 28 | Macera | Ege (beşik + beşik önü) | `assets/ege/besik.webp`, `besik-on.webp` | 780×621 | 1169×930 (yatay 874×697) | ×1.1 / ×1.5 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** (iki katman birlikte) | 1216×968 |
| 29 | Canlan | Açılış vitrini (deniz sahnesi) | `assets/sahne/deniz.webp` (ve aynı setteki `sahne/*.webp`) | 768×768 | 1122×1122 | ×1.5 / ×1.5 | hayır | **Recraft Pro Vector arka plan yeniden çiz** (su altı; dokulu/sulu boya görünümlü) | 1152×1152 — bkz. A7 |
| 30 | Film | Park filmi (kaydırak/kum havuzu katmanı); Okul bölge | `assets/film/park/arka-orta-2.webp` | 2752×1536 | 3928×2208 | ×1.4 / ×1.4 | hayır | **Recraft Pro Vector arka plan yeniden çiz** (park seti, A4 ile birlikte) | 3968×2216 |
| 31 | Okul | Bölge, Albüm, Hangisinde çok (kurabiye) | `assets/okul/kurabiye.webp` | 256×256 | 356×356 (yatay 244×244) | ×1.0 / ×1.4 | hayır | **kaynak var, daha büyük export yeterli** (`minkino-film-gemini/okul/kurabiye.png` 364²) | 364×364 |
| 32 | Macera | Ege (uyuyan anne baş/gövde) | `assets/ege/anne-uyuyor-bas.webp`, `-govde.webp` | 781×896 | 965×1109 | ×0.9 / ×1.2 | hayır | yalnız dikey iPad'de hafif; **Gemini** (düşük öncelik) | 1024×1175 |
| 33 | Pasta | Gün (servis tabağı, sipariş balonunda) | `assets/pasta/servis-tabagi-1.webp` | 406×272 | 525×230 | ×1.2 / ×1.3 | **evet, %133** | **kod: object-fit/background-size düzelt** — `.ps-b-grup::before` `background-size: 100% 100%` tabağı yassı gösteriyor (209×60 kutu) | — |
| 34 | Pasta | Gün (fırın tepsisi) | `assets/pasta/firin-tepsisi-1.webp` | 407×196 | 438×173 | ×1.1 | evet, %23 | **kod** (`preserveAspectRatio="none"`; `cizim.ts` yorumuna göre perspektif için bilerek basık). İstenirse düzeltilir | — |
| 35 | Okul | Harita (Sayı Bahçesi / Ses Kulesi / Kelime Köprüsü / okul) | `assets/okul/bahce.webp` 400×340, `kule.webp` 400×380, `kopru.webp` 440×300, `okul.webp` 420×340 | ~400 px | 417×354 | ×1.0 | hayır | **Gemini ile yüksek çözünürlükte yeniden çiz** — büyütülmüyor ama **stile aykırı**: ince eskiz çizgi, soluk renk, parlaklık yok; haritanın parlak arka planının ve karakterlerin yanında silik kalıyor. Asıllar da küçük (389-480 px) | 896×760 (2× pay) |

Eşiği geçmeyen ama yakın: `canvas.ms-tuval` (Canlan çizim tuvali, dikey iPhone'da ×1.16), `film/kapak/kino-oyuncak`,
`kino-lutfen` (katalog kartında ×1.19 — #5 ile birlikte çözülür), `film/park/arka-on` film içinde ×1.15.

**Sorunsuz bulunanlar** (bütün cihazlarda ×1.15 altında, gerilme yok): Kartlar (hayvan/meyve/taşıt kartları 560 px, en çok ×1.08),
menü kartları, Canlan resim listesi, Banyo eşyaları (kuvet, raf, havlu, musluk…), Dedektif ipucu kartları, film karakterleri
(gömülü iskelet parçaları ×0.4), Pasta kalıp/kavanoz/krema, Pazar meyve/sebze.

## Gerilme (kod) özeti

Yalnız kodla çözülen, çizim gerektirmeyen bozulmalar:

| Yer | Dosya / kural | Bozulma | Not |
|---|---|---|---|
| Okul dal | `okul` `.ok-resim` → `dal.webp`, `object-fit: fill` | %91 | dal enine çekiliyor |
| Okul piknik örtüsü | `piknik-ortusu.webp`, `fill` | %80 | |
| Okul tabak | `tabak.webp`, `fill` | %51 | |
| Pasta servis tabağı | `pasta/src/pasta.css` `.ps-b-grup::before` (`background-size: 100% 100%`) | %133 | sipariş balonunda yassı tabak |
| Pasta fırın tepsisi | `pasta/src/cizim.ts` `preserveAspectRatio="none"` | %23 | bilerek (perspektif) |
| Salıncak köşe öbekleri | `macera/src/salincak.css` `.sl-kume` (eşit olmayan yüzde `background-size`) | %20 | aynı zamanda ×5 büyütme |
| Macera yan dolgu | `macera/src/macera.css` `.mc-yan-dolgu` (`blur`) | — | bilerek bulanık; ürün kararı |

Film arka planlarındaki %0.8'lik fark (2752×1536 görsel 16:9 kutuya `fill`) gözle görülmez, eşik altında.

## Yeniden çizilecek arka planlar: sahne ve oran

Recraft'a verilecek tarif. Oran **tam olarak** korunmalı (kod konumları resim oranına bağlı: pencere, tezgâh çizgisi, eşya yerleri).

- **A1 — Oda** (`assets/parti-sahne/oda.webp`, **1:1**, 1024×1024): nane yeşili, beyaz puantiyeli duvar; sol üstte yuvarlak,
  dört bölmeli pencere, pembe perde bağlı; pencerenin altında saksıda kırmızı çiçekli bitki; turuncu ahşap parke zemin; ortada pembe
  oval halı; ortası boş. Macera'nın Ege/Elektrik odası ve açılışı bu resmi kullanıyor. *Öneri:* yatay ekranın bulanık yan bantlarını
  kaldırmak istenirse aynı odanın **16:9 geniş** sürümü de çizdirilsin (Barış kararı, #2).
- **A2 — Pasta otobüsünün içi** (`assets/pasta/arka-tezgah-uzak-1.webp`, **1376:768 = 1.7917**, Gemini 2752×1536'nın yarısı):
  karavan/otobüs içi; pembe çiçek desenli fayans duvar; iki yanda raflı dolaplar (kavanozlar, mikser, tencereler), altında asılı
  kepçe/spatula; ortada büyük yuvarlak köşeli pencere (kodda maskeyle oyulur, dışarıda park görünür), iki yanda küçük yan
  pencereler; kavisli ahşap tavan, tavan lambası; ahşap zemin. Pencerenin yeri ve oranı **aynı kalmalı** (`pasta.css` `--a-sol`,
  `--a-sag`, `--a-ust`, `--a-tz` değerleri buna göre). Aynı setten **tezgâh önü** (`tezgah-on-1.webp`, 1.7917): krem tezgâh üstü,
  altında pembe-krem çekmece ve kapak sırası, yatay tekrar edecek şekilde.
- **A3 — Ev / çalışma odası, 3 katman** (`assets/film/ev/arka-uzak|orta|on.webp`, **2752:1536 = 1.7917**): *uzak:* krem, sarı
  yaprak desenli duvar kâğıdı; ortada büyük ahşap pencere (dışarıda yeşil ağaçlar, mavi gök, bulutlar), iki yanda krem perdeler;
  solda aile tablosu, sağda duvar saati; altta süpürgelik ve ahşap zemin şeridi. *orta (şeffaf):* solda turuncu kanepe, ayaklı
  lamba; sağda kitaplık (kitaplar, ayıcık, tren). *ön (şeffaf):* solda örgü sepet içinde ayıcık ve ABC/123 küpleri, ortada desenli
  oval halı, sağda oyuncak tren ve terlikler; ahşap zemin. Dedektif ve "Kino ve Oyuncak Sepeti" filmi kullanıyor.
- **A4 — Park, 4 katman** (`assets/film/park/arka-uzak|orta|orta-2|on.webp`, **1.7917**): *uzak:* mavi gök, beyaz bulutlar,
  yumuşak yeşil tepeler, uzakta küçük pastel ev silüetleri. *orta (şeffaf):* solda ağaç + bank + kırmızı salıncak, sağda ağaç +
  beyaz çit + tahterevalli (ortadaki küçük salıncak kodla kesiliyor). *orta-2 (şeffaf):* solda ağaç, kaydırak ve kum havuzu; sağda
  sokak lambası, kuş evli ağaç, bank. *ön (şeffaf):* alt iki köşede çalı, lale ve mantar öbekleri, taşlar; ortada çimen şeridi.
  Salıncak, Okul (bütün ekranlar), Pasta açılış/gün, film kullanıyor. Salıncaktaki köşe öbekleri (#7) için öbekler **ayrı** çizilsin.
- **A5 — Pazar meydanı** (`assets/pazar/arkaplan.webp`, **1:1**): açık mavi gök, beyaz bulutlar (dokusuz, düz renk + yumuşak
  geçiş); üstte ipte renkli üçgen flamalar; sol ve sağ kenarda kırmızı-sarı ve mor-pembe tente köşeleri, dibinde saksılar;
  altta turuncu yuvarlak taş zemin; ortası boş (tezgâh üstüne gelir). Yanında **tezgâh** (`assets/pazar/tezgah.webp`, 1:1, şeffaf):
  kırmızı-beyaz çizgili tenteli ahşap pazar tezgâhı, önde tahta raf.
- **A6 — Banyo** (`assets/banyo/arkaplan.webp`, **2688:1536 = 1.75**): nane yeşili ve beyaz dikdörtgen fayanslı banyo duvarı;
  solda oval pencere (dışarıda yeşillik); sağda küçük oval ayna, raf ve askılık çengeli; açık renk fayans zemin; sağ altta beyaz
  yuvarlak paspas; ortası boş (küvet kodla ayrı katman).
- **A7 — Canlan sahneleri** (`assets/sahne/*.webp`, **1:1**, 768×768: çayır, deniz, gece, gök, kar, okyanus, yol): şu an
  yalnız Canlan vitrini ×1.5 büyütüyor; `deniz` su altı (ışık huzmeleri, yosun, mercan) sulu boya dokulu. Düşük öncelik; set
  olarak 1152×1152.

## Önerilen iş sırası

1. **Ürün kararı (Barış):** Macera'daki bulanık yan bantlar (#2) kalsın mı, geniş oda çizimiyle kalksın mı? Cevaba göre A1/A6
   1:1 mi 16:9 mu çizilecek.
2. **Recraft Pro Vector:** A1 oda, A2 otobüs içi + tezgâh önü + otobüs (#18), A3 ev 3 katman, A4 park 4 katman, A5 pazar +
   tezgâh, A6 banyo. Hepsi SVG olarak saklansın; WebP hedef boyutları tabloda.
3. **Kod (çizim beklemeden):** #12-14 `object-fit: fill` → oranı koruyan kutu; #33 servis tabağı; #7 salıncak öbek kırpması;
   #22 Canlan `BOYUT`; film kapaklarını (#5) büyük kareden yeniden almak; Dedektif kamera yakınlığına üst sınır (#4).
4. **Asıldan büyük export:** #12 tabak, #13 dal, #16 ağaç, #20 devrik lamba, #31 kurabiye.
5. **Gemini:** #11 masa, #15 koltuk + masa, #19 fırın, #21 mama sandalyesi, #23 oyuncak öbeği, #24 istasyon, #26 kremalı
   kurabiyeler, #27 sepet, #28 beşik, #35 okul haritası ikonları (stil).
