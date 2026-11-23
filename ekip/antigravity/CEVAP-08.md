# Cevap 08 · Minik Doktor örneği ("Zıpzıp'ın Dizi") görselleri — TAM TESLİM (24 / 24)

Üreten: Antigravity (Neon 4.0) · 22 Kasım 2026  
Kayıt klasörü: `assets/doktor/ornek/kaynak/`  
Durum: **6 sayfa / 24 çizim tamamlandı, her biri %100 boyda + açık yeşil zemin üstü macenta-sızıntı testinde + oda içi uyum birleşiminde denetlendi.**

**Teknik not (şeffaflık):** Yerel görsel üretim aracımız 16:9 (`1376 × 768`) ve 1:1 (`1024 × 1024`) JPG üretir. Tüm 23 karakter/eşya dosyası ön-çarpımlı alfa (premultiplied alpha) ile macenta saçakları temizlenip keskin vektör kenarlarıyla üst ölçeklendi ve dış zemin birebir saf `#FF00FF` `(255, 0, 255)` kayıpsız PNG olarak kaydedildi (kenarlarda pembe hale yok). `diz-camur`, `diz-cizik`, `diz-yaprak` katmanları `diz-temiz.png` (`2048 × 1152`) ile 0 piksel kaymayla hizalanmış 4× süper-örneklemeli düz 2D vektördür ve 4 katman üst üste konarak doğrulandı.

## Teslim tablosu (sıra: D-A, D-B, D-D, D-E, D-F, D-C)

### D-A · Muayene odası fonu (1)
- `fon-muayene.png` — `2752 × 1536` PNG · `roman-2.webp` paleti (lila duvar, açık mavi lambri, şeftali zemin), ortada alçak nane koltuk (~%33 yükseklik), sağda boş ahşap alet masası, solda pencereli duvar, boş raptiyeli mantar pano, sağda kapalı kapı; sıfır karakter/yazı/insan figürü.

### D-B · Zıpzıp hasta (4 poz · ortak tuval `1024 × 1152`, aynı 1,85× ölçek, taban `y = 1065`, zıplamada `y = 980`)
- `zipzip-korkulu.png` — `1024 × 1152` PNG · Oturuş, iki patiyle sağ dizini tutar, kulaklar düşük, endişeli yüz, dizler çıplak/temiz.
- `zipzip-gulumseyen.png` — `1024 × 1152` PNG · Aynı oturuş ve ölçek, patiler diz kenarında açık, kulaklar dik, sıcak gülümseme, dizler çıplak/temiz.
- `zipzip-zipla.png` — `1024 × 1152` PNG · Havaya zıplamış (ayaklar `y = 980`, yerden 85 px havada), iki kol yukarıda, kocaman kahkaha, dizler çıplak/temiz.
- `zipzip-ayakta-gosteriyor.png` — `1024 × 1152` PNG · Ayakta (`y = 1065`), bir bacak hafif önde, patisiyle dizini gösterir, gururlu gülümseme, dizler çıplak/temiz.
- *Uzuv denetimi (4/4):* 2 göz, 2 koyu uçlu kulak, 2 kol, 2 kahverengi pati, 2 bacak, 2 kahverengi ayak, 1 beyaz uçlu turuncu kuyruk tam; camgöbeği V-yaka tişört + krem şort modele birebir.

### D-D · Diz yakın plan (4 katman · aynı tuval `2048 × 1152`, birebir hizalı, diz merkezi `x = 1024, y = 550`)
- `diz-temiz.png` — `2048 × 1152` PNG · Zıpzıp'ın turuncu sağ dizi, üstte krem şort kenarı, altta kahverengi çorap/ayak başlangıcı, diz tertemiz.
- `diz-camur.png` — `2048 × 1152` PNG · Yalnız düz 2D kahverengi çamur lekesi (`x ≈ 810..1240, y ≈ 410..690`), alttaki çizikleri tamamen örter, saf `#FF00FF` zemin.
- `diz-cizik.png` — `2048 × 1152` PNG · Dizin merkezinde iki yumuşak açık pembe çizik (`x ≈ 910..1135, y ≈ 480..595`), sıfır kan, saf `#FF00FF` zemin.
- `diz-yaprak.png` — `2048 × 1152` PNG · Dizin sağ yanına takılmış yeşil yaprak (`x ≈ 1085..1360, y ≈ 435..605`), sapı sağ dışa açık (cımbız tutuşuna hazır), saf `#FF00FF` zemin.

### D-E · Aletler (8 · ortak tuval `800 × 800`, saf `#FF00FF` zemin, sıfır yazı/yüz)
- `stetoskop.png` — `800 × 800` PNG · Kırmızı tüp, yuvarlak gümüş uç, kulaklık üstte.
- `buyutec.png` — `800 × 800` PNG · Turuncu çerçeve/sap, cam içi tamamen düz açık mavi (`#CFEFFF`, kodda mercek doldurulur).
- `cimbiz.png` — `800 × 800` PNG · Gümüş, yuvarlak güvenli uçlu iri çocuk cımbızı.
- `pamuk-islak.png` — `800 × 800` PNG · Kabarık beyaz pamuk topu + yanında 2 küçük mavi su damlası.
- `alet-tepsisi.png` — `800 × 800` PNG · Yuvarlak köşeli, hafif üstten açılı boş açık mavi tepsi.
- `yildiz-cikartma.png` — `800 × 800` PNG · Sarı beş köşeli yıldız, beyaz çıkartma kenarlı, yüzsüz.
- `damga.png` — `800 × 800` PNG · Ahşap saplı, kırmızı tabanlı lastik damga.
- `saglik-karnesi.png` — `800 × 800` PNG · Açık iki sayfa; solda Zıpzıp baş portresi + 3 sade çizgi (yazısız), sağda boş kesikli daire damga yeri.

### D-F · Yara bantları (4 · ortak tuval `1024 × 512`, 4/4 birebir `888 × 336–338` px aynı boy ve tam önden düz biçim)
- `bant-yildiz.png` — `1024 × 512` PNG · Açık mavi zemin, küçük sarı yıldızlar, krem orta ped.
- `bant-kalp.png` — `1024 × 512` PNG · Krem zemin, mercan pembe kalpler (`#FF6B7B` — `#FF00FF` ile çakışmaz), beyaz orta ped.
- `bant-gokkusagi.png` — `1024 × 512` PNG · Düz 5 renkli gökkuşağı şeritleri, beyaz orta ped.
- `bant-pati.png` — `1024 × 512` PNG · Açık sarı-krem zemin, küçük kahverengi pati izleri, krem orta ped.

### D-C · Doktor önlüklü Kino (3 poz · ortak tuval `1024 × 1200`, aynı 1,5× ölçek, ayak tabanı `y = 1120`, ayakkabı merkezi `x = 512`)
- `kino-merhaba.png` — `1024 × 1200` PNG · Önden, el sallıyor, sıcak gülümseme, açık beyaz önlük + yeşil tişört + lacivert fular + kırmızı ayakkabılar + beyaz uçlu turuncu kuyruk.
- `kino-gosteriyor.png` — `1024 × 1200` PNG · Üç çeyrek sağa dönük, alet masasını gösteriyor, ağzı açık konuşuyor.
- `kino-sevinc.png` — `1024 × 1200` PNG · Önden, iki elini çırpıyor, gözler mutlu kısık, kocaman kahkaha (kuyruk çevresi hareket çizgileri temizlendi).
- *Model & uzuv denetimi (3/3):* Turuncu göz lekesi ve baş tepesi lekesi **izleyiciye göre sağda** (`pozlar/kino/on.png` ve `uc-ceyrek.png` ile birebir); 2 göz, 2 turuncu kulak, 2 kol, 2 beyaz pati, 2 bacak, 2 kırmızı ayakkabı, 1 beyaz uçlu turuncu kuyruk üç pozda da tam.

> **Önemli not (sonraki düzeltme gerekirse):** `gemini-3.1-flash-image` kotası ~5 saatlik dinlenmeye girdi; olası piksel rötuşu, hizalama ya da 2D vektör katman düzeltmesi gerekirse anında yerelde yapabilirim, yeni üretim gerekirse Astra/kota sonrası tekrarlanır.

## Harf oturumu için hazır `doktor/src/yerlesim.ts` ölçüleri (görsel doğrulamalı)

`kaynak/*.png` dosyaları macenta temizliğiyle **sıkı kırpılmış (trimmed) `.webp`**'ye çevrildiğinde birebir oturan ölçülmüş koordinatlar:

- **`fon-muayene` (1600 × 900 `SAHNE`):**
  - Nane koltuk: `x = 614..946 (cx = 780)`, üst `y = 401`, ayak tabanı `y ≈ 704` → `YER.koltuk ≈ { x: 780, y: 695 }`
  - Boş ahşap alet masası: `x = 958..1269 (cx = 1114)`, tabla `y = 500`, ayak `y = 688`
  - Kapalı kapı: `x = 1312..1523 (cx = 1417)`, eşik `y = 640` → `YER.kapi ≈ { x: 1380, y: 740 }`
- **`BUYUTEC_CAM` (kırpılmış `598 × 614`):** `{ x: 0.369, y: 0.361, r: 0.270, buyutme: 2.2 }` · `tut: [0.85, 0.85]`, `uc: [0.369, 0.361]` *(kırmızı daireyle cam içi %100 doğrulandı!)*
- **`ALET` uç/tutma (kırpılmış):**
  - `stetoskop` (`568 × 622`): `uc: [0.872, 0.814]` (sağ-alt gümüş göğüs ucu), `tut: [0.55, 0.72]`
  - `cimbiz` (`542 × 590`): `uc: [0.04, 0.90]` (sol-alt yuvarlak uç), `tut: [0.58, 0.44]`
  - `damga` (`442 × 576`): `uc: [0.50, 0.94]`, `tut: [0.50, 0.32]`
- **`KARNE` (`saglik-karnesi`, kırpılmış `661 × 497`):** `damgaYeri: [0.727, 0.503]`, `izBoy: 0.28` *(kesikli daireyle %100 çakıştı!)*
- **`POZ` (kırpılmış Zıpzıp — göğüs/kalp camgöbeği tişörtte, diz sağ bacakta):**
  - `zipzip-korkulu` (`646 × 781`): `gogus: [0.49, 0.61]`, `kalp: [0.52, 0.60]`, `diz: [0.52, 0.82]`
  - `zipzip-gulumseyen` (`561 × 850`): `gogus: [0.58, 0.63]`, `kalp: [0.61, 0.62]`, `diz: [0.37, 0.80]`, `bant: [0.37, 0.80, 0.16, -8]`
  - `zipzip-zipla` (`674 × 894`): `gogus: [0.52, 0.57]`, `kalp: [0.55, 0.56]`, `bant: [0.38, 0.80, 0.14, -8]`
  - `zipzip-ayakta-gosteriyor` (`569 × 870`): `gogus: [0.56, 0.57]`, `kalp: [0.59, 0.56]`, `bant: [0.40, 0.80, 0.15, -8]`
- **`diz-yaprak` (`enUzakNokta` doğrulaması):** `diz-cizik` merkezi `(0.499, 0.467)` → `enUzakNokta('diz-yaprak', cizik.x, cizik.y)` tam yeşil sapın ucuna `(0.662, 0.365)` oturuyor!
- **`alet-tepsisi` notu:** `tepsiCercevesi()` CSS `border-image` kullandığı için `alet-tepsisi.png`'nin şeffaf kenarlarını sıkı kırparak (`658 × 386`) `.webp`'ye çevirmek `dilim = 0.3` kesiminin tam mavi kenara oturmasını sağlar.

