# Seri 2 "Ela ile Efe": üretim yolu

> 2026-10-09 · Karar kesin (yönetici + Barış): **Blender'da, Python ile sürülen 2D cut-out animasyon.** Çıktı MP4.
> İlgili dosyalar: [SERI-KITABI.md](SERI-KITABI.md) · [bolum-01.md](bolum-01.md) · [../../gemini/IS-LISTESI-SERI2.md](../../gemini/IS-LISTESI-SERI2.md)

**Neden başka yol değil (tek satır):**
- After Effects bilgisayarda yok.
- Spine paralı.
- Character Animator ve Animate yalnız arayüzle çalışır, ekip için çok yavaş.
- Kendi JS motorumuzda yumuşak bükülme (mesh deform), gerçek kamera derinliği ve hareket bulanıklığı yok; TV kalitesine çıkmaz.
- Yapay zekâ videosu tutarsız ve paralı.

Seri 1 (Mino ve Kino) JS motorunda kalır. Seri 2'de yeni yazılım kurulmaz: Blender 5.2, Illustrator 2026, Python (Blender'ın kendi Python'u) ve mevcut betiklerimiz yeterli.

## 1. Ölçü

Barış: "Basit bir resmi animasyon gibi oynatma. Caillou gibi gerçek bir dizi kalitesi."

Her karede şunlar olmalı:
- **Dönen karakter:** önden, 3/4, yandan ve arkadan görünüş.
- **Bükülen kol ve bacak:** dirsek ve dizde yumuşak eğilme; sert parça dönmesi değil.
- **Harfe göre ağız:** Türkçe konuşmada 9 ağız şekli.
- **Canlı yüz:** göz kırpma, kaş, ifade.
- **Gerçek hareketler:** yürüyüş ve koşu döngüsü; oturma, emekleme, zıplama pozları.
- **Takip hareketi:** saç topuzları, ayı kulakları ve sırt çantası geriden gelir.
- **Gerçek kamera:** katmanlar arasında derinlik (parallax), odak, hareket bulanıklığı.
- **Hiç donmama:** duran karakter nefes alır, ağırlık aktarır, bakınır.

## 2. Hat (baştan sona)

```
Gemini (model sayfaları, ifade/ağız/el/poz sayfaları)
   → Illustrator: vektörleştir ([16 Colors]) → Turntable (yan 90°, 3/4 45°, arka 180°)
   → Illustrator betikleri: parçalara ayır, eklem payı, pivot → katman PNG (2048 tuval) + JSON
        (ayrılamayan yerde yalnız Recraft vectorize: en çok 2 görsel)
   → Blender Python: rig kurucu  (karakter başına bir kez)
   → Blender Python: sahne kurucu  (content/film2/<bolum>.json → anahtar kareler)
   → Blender Python: dudak senkronu  (ElevenLabs sesi + harf zamanları → 9 ağız)
   → EEVEE render (gece) → MP4 (ses Blender VSE'de karışır)
```

### 2.1 Çizim (Gemini + Adobe)
- **Gemini:** önden model sayfası, A-pozu (rig kaynağı), büyük kafa, parça sayfası, ağız, göz, kaş, ifade ve el sayfaları, yürüyüş ve koşu anahtar pozları, bölüm pozları. Liste: `ekip/gemini/IS-LISTESI-SERI2.md`.
- **Illustrator Turntable** (tasarımcı oturumu): **yan, 3/4 ve arka görünüşler** önden vektörden üretilir. Yöntem ve tuzaklar `ekip/adobe-yanci/TURNTABLE-PLANI.md` dosyasında: `vektorlestir-maske.jsx` `[16 Colors]` ile vektörleştirir, parça sayısı 400'ün altında tutulur. Bir üretim ≈ 4 dk ve ≈ 20 kredidir.
  - Turntable'da yüz bozulursa yüz, Gemini'de önden yüze göre düzeltilir (S-KİLİT, Turntable çıktısı yüklenir). Gövde Turntable'dan kalır.
- **Parçalara ayırma:** Illustrator betikleriyle, mevcut iskelet hattının sözleşmesine göre (`ekip/film/FILM-REHBERI.md` §5). Her parça kendi konturuyla tam çizilir, eklemlerde yuvarlak taşma payı bırakılır.
- **Recraft:** yalnız Illustrator izinin parçaları birbirine kaynattığı yerde, parçalara ayırmak için `vectorize_image` (1 kredi). Liste en çok 2 görsel (Ela ve Efe A-pozu, R1-R2). Kredi çok az; başka iş için kullanılmaz.

### 2.2 Teslim sözleşmesi (Adobe → Blender)
Her görünüş için bir klasör: `assets/film2/karakter/<ad>/<aci>/` (`aci` = `on`, `34`, `yan`, `arka`).
- `<katman>.png`: 2048 kare tuvalde yerinde duran şeffaf parça. Konumu tuvalden okunur, ayrı hizalama gerekmez.
- `rig.json`:
  - `sira`: alttan üste katman sırası.
  - `donme`: pivotlar, piksel.
  - `bagli`: hangi katman hangi kemiğe bağlı.
  - `bukul`: mesh deform alacak katmanlar ve kemik zinciri.
  - `ekler`: gizli değiştirme katmanları (ağız, göz, el, kaş).
- Katman adları Seri 1 ile aynı dildedir:
  - `kafa, sac-arka, topuz-sol, topuz-sag` (Ela), `bere, bere-kulak-sol, bere-kulak-sag, perçem` (Efe)
  - `kas-sol, kas-sag`
  - `goz-sol/sag-ak, -bebek, -kapak`
  - `agiz-*`
  - `boyun, govde`
  - `canta, canta-askisi` (Ela)
  - `kol-ust-sol/sag, kol-alt-sol/sag, el-sol/sag-<poz>`
  - `bacak-ust-sol/sag, bacak-alt-sol/sag, ayak-sol/sag`

### 2.3 Rig kurucu (`blender -b -P film2/rig_kur.py -- <ad>`)
- Her PNG bir düzleme dönüşür. Malzeme ışıksız (emission) ve alfa karışımlıdır, renk yönetimi "Standard" olur. Böylece renkler çizimle birebir kalır.
- Katman sırası çok küçük z farklarıyla kurulur.
- **Armatür** `donme` pivotlarından kurulur: kalça → gövde → boyun → kafa; omuz → dirsek → bilek; kalça → diz → ayak.
- **Mesh deform:**
  - `bukul` listesindeki parçalar (gövde, kollar, bacaklar, salopet/elbise) sık ızgaralı düzlem olur.
  - Ağırlıkları otomatik verilir, eklem çevresinde yumuşatılır.
  - Böylece dirsek ve diz kırılmadan bükülür. Nefes alırken gövde şişer; zıplamada ezilip uzar (squash & stretch).
- **Değiştirme katmanları** (ağız, göz, el, kaş, poz): her biri gizli düzlem. Görünürlük anahtar kareyle açılır ve kapanır; ara geçiş olmaz (sabit adım).
- **Dört görünüş** aynı karakter koleksiyonunda dört alt rig'dir. Görünüş değişimi tek karede olur; kafa iki kare önden döner, o an göz kırpılır.
- **İkincil hareket:** topuzlar, bere kulakları, çanta, perçem. Python sönümlü yay hesabıyla kemik açısına pişirilir (bake).
- **Ayak sabitleme:** bacak zincirinde IK kısıtı. Yürürken ve çömelirken ayak yerde kalır.
- Çıktı: `assets/film2/karakter/<ad>.blend`. Sahneler bunu bağlantı (link) olarak alır; düzeltme tek yerde yapılır.

### 2.4 Sahne kurucu (`blender -b -P film2/sahne_kur.py -- content/film2/<bolum>.json`)
- Senaryo JSON'u Seri 1'deki sözcüklerle yazılır:
  - `git, soyle, ifade, bak, al, birak, salla, tepki`
  - yeniler: `don-aci`, `poz`, `el`, `kas`, `kamera`, `isik`
- Python bunları anahtar kareye çevirir. Eğriler Bezier'dir: hazırlık (anticipation), aşma (overshoot), yumuşak iniş.
- **Otomatik katmanlar** (animatör yazmaz, kurucu ekler):
  - nefes,
  - 2-6 sn'de bir göz kırpma,
  - 3-5 sn'de bir küçük bakınma ve ağırlık aktarma ("moving hold"),
  - dinleyen karakterin konuşana bakması.
- **Yürüyüş ve koşu:** çizilmiş 4 anahtar pozdan çıkarılan açı tablosu döngülenir. Gövde iner kalkar, kollar ters salınır, adım uzunluğu yola göre ayarlanır.
- **Kamera:**
  - Arka plan katmanları gerçek z derinliğinde durur: gök -60, uzak -25, orta -8, oyun düzlemi 0, ön plan +4.
  - Perspektif kamera gerçek parallax verir. Yaklaşma, kaydırma, kesme ve omuz üstü çekim kolaydır.
  - Odak (DOF) ve EEVEE hareket bulanıklığı açılır.
- **Eşya fiziği:** kule yıkılması gibi anlar Blender rigid body ile yapılır. Gizli küp çarpıştırıcılar kullanılır, sonuç Python'da pişirilir. Bloklar düzlem olduğu için 2D görünür, fiziği gerçek olur.
- **Işık:** gün saati renk tonu (compositor renk düzeltmesi), karakter altında yumuşak temas gölgesi düzlemi, gerekirse kenar ışığı düzlemi.

### 2.5 Dudak senkronu (yeni yazılım yok)
- ElevenLabs sesi CI'da `with-timestamps` ile üretilir. Her harfin başlangıç saniyesi `public/ses/` altına JSON olarak yazılır. Aynı üretim olduğu için ek kredi beklenmez; kodcu doğrular.
- `film2/dudak.py` Türkçe harfleri **9 ağza** çevirir:

| Ağız | Harfler | Şekil |
|---|---|---|
| `kapali` | M B P | dudaklar kapalı |
| `az` | K G Ğ H Y C J, kısa ünsüzler | az açık, dişler görünür |
| `e` | E İ I | yayvan, dişler |
| `a` | A | kocaman açık |
| `o` | O Ö | orta yuvarlak |
| `u` | U Ü | küçük büzük |
| `f` | F V | alt dudak üst dişte |
| `l` | L N R D T | az açık, dil ucu görünür |
| `s` | S Z Ş Ç | dişler kapalı, dudak gergin |

- Ağız şekli en az 2 kare kalır. Çok kısa harfler birleştirilir, ünlüler öne çıkar. Cümle bitince ağız 3 karede karakterin dinlenme gülümsemesine döner.
- Harf zamanı yoksa (animatik, cihaz sesi) WAV zarfından şiddete göre `kapali/az/e/a` seçilir. Blender'ın numpy'si yeter.

### 2.6 Render ve teslim
- **EEVEE**, 1920×1080, 25 fps. PNG kareler sonra MP4'e (H.264) çevrilir. Ses (konuşma, müzik, efekt) Blender VSE'de karışır.
- Efektler WAV dosyasıdır. Seri 1'deki Web Audio sentez efektleri bir kez dosyaya kaydedilir.
- Sosyal medya için aynı sahneden 9:16 kadraj kamerası ve ayrı render.
- **Süre:** bu bilgisayarda kare başına ~0,5-1,5 sn tahmin ediliyor. 6 dk = 9.000 kare = **2-4 saat**. Render geceleri yapılır (05:00-05:30 penceresi ve sonrası). Önce yarım çözünürlükte animatik render alınır (~30 dk).
- **Uygulama boyutu:** MP4 büyük. Düz renkli çizgi film H.264'te verimli sıkışır:
  - 720p ~1,2 Mbps: 6 dk ≈ **50-60 MB**
  - 1080p ~2,5 Mbps: ≈ 110 MB
  - Bu yüzden bölümler uygulama paketine konmaz. Cloudflare'den (mevcut site) akış olarak oynar, "indir, internetsiz izle" seçeneği olur.
  - Paket içinde en çok 1. bölüm 720p olarak bulunur.
  - Bunun karşılığında JS motoru bölüm başına ~5-8 MB tutuyordu. Fark kalite için kabul edildi.

## 3. Bölüm başına iş (kit hazırsa)

| İş | Kim | Süre |
|---|---|---|
| Senaryo | senarist | 1 gün |
| Yeni arka plan katmanları ve eşyalar (≤ 2 mekân, ~10 eşya) | Gemini + Adobe | 1-2 gün |
| Yeni poz çizimi (bölüme özel 4-8 poz) | Gemini + Adobe | 1 gün |
| Sahne JSON'u ve animatik | animatör (kodcu) | 3-4 gün |
| Seslendirme (CI) ve dudak | otomatik | yarım gün |
| İnce ayar ve render | animatör | 1 gün + gece render |

Kit, rig kurucu ve sahne kurucu **bir kez** yapılır: ~2-3 hafta. Her bölümde poz kütüphanesi büyür, iş kısalır.

## 4. Pilot

- **Şimdi:** Kino ile Blender pilotu yapılıyor (yönetici). Hat (rig kurucu, mesh deform, dudak, kamera) önce orada kanıtlanır.
- **Sonra, ikililerin kiti gelince: 12 sn "Ela ile Efe" pilotu.** Para yok, ses için cihaz sesi ya da tek bir ElevenLabs cümlesi.
  1. Oda arka planı 4 katman. Kamera yavaşça yaklaşır, ön planda oyuncak sandığı kayar.
  2. Efe yandan yürüyerek girer: ayak sabit, bere kulakları sallanır. Durur, 3/4'e döner (kafa önce, göz kırpar).
  3. Ela koşarak girer, topuzlar zıplar, çanta sallanır. Frenler, ezilip uzar.
  4. Ela: "Hadi, kule yapalım!" (9 ağızlı dudak). Efe çömelir, dirseği bükülerek bloğu alır, gülümser.
  5. Ölçüt: Barış "bu gerçek dizi gibi" demeli. Değilse eksik olan kitte mi, rigde mi, ona bakılır. Bölüm 1 bu çıtaya göre yapılır.

## 5. Boylar (Mino birimi; `src/karakter/boy.ts` ile aynı dil)

| Karakter | Boy | Not |
|---|---|---|
| Ela (4) | 1.30 (topuzlar dahil 1.36) | ikiz |
| Efe (4) | 1.28 (bere kulakları dahil 1.40) | ikiz |
| Nil (2) | 0.98 | ikizlerin omzuna gelir |
| Anne (Selin) | 1.90 | çocuk × ~1.45 |
| Baba (Emre) | 2.10 | çocuk × ~1.6 |
| Tosbi | 0.30 (kabuk boyu) | ayakkabı kutusu kadar |
| Mino/Kino peluşu | 0.45 | oyuncak |

## 6. Barış'ın kararları

1. **Karakter sesleri:** Ela, Efe (4 yaş), Nil (2 yaş, birkaç kelime), Anne, Baba. Barış ElevenLabs'te kendisi seçer. Anlatıcı mevcut ses.
   - Bölüm başına ~1.300 karakter.
   - Çocuk sesi kütüphanede kısıtlıysa Voice Design ile tasarlanır; bu hesap kararıdır.
2. **Akış:** bölümler uygulamaya gömülmez, Cloudflare'den oynar. Paket boyutu küçük kalır, ilk açılışta internet gerekir.
3. **Firefly kredisi:** Turntable 16 üretim × ~20 ≈ **320 kredi**. Tasarımcının kredisi; israf edilmez.
4. **Recraft:** 2 vectorize ≈ 2 kredi.
