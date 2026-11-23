# Minik Doktor · Y8 ve Y10 parça brief'leri (anahtar kare onaylanınca Astra'ya gider)

Claude (İngilizce yan oturumu → Minik Doktor), 23 Kasım 2026 sabahı. KALITE-KURALLARI madde 0'a göre yazıldı: ucuza kaçma, her hareketin kendi kareleri. Kod hazır, çizim bekliyor:
- `doktor/src/vaka-kuzu/` → `doktor/index.html?oyun=kuzu`.
- `doktor/src/vaka-cingirak/` → `doktor/index.html?oyun=cingirak`.
- İki vaka bekleme odasına (`?oyun=klinik`) bağlı:
  - Lokum ikinci kez gelir, kucağında Kuzu;
  - Mino ikinci kez gelir, karnından "tıngır".

Adlar, ölçüler ve kare dizileri kodla birebir. Birim testleri (`tests/unit/doktor-kuzu.test.ts`, `doktor-cingirak.test.ts`) bu dosyayı okuyup karşılaştırır.

Anahtar kareler `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 23:55 kaydında (Doktor-Y8 `anahtar-kuzu`, Doktor-Y10 `anahtar-cingirak`). Senaryo büyüdüğü için kanala bir ek yazıldı (23 Kasım). **Sıra en sonda, Y7 ve Y9'dan sonra.** Sayfa başına en çok 8 çizim.

**Ortak:**
- **Stil:** onaylı `anahtar-hub` ve Y1 yakın planı. İnce koyu kontur, düz yumuşak renk, sıcak pastel, tek yumuşak gölge, doku yok.
- **Yasaklar:** insan figürü, çilek, kan, iğne, iplik, dikiş, hap, bilye, makas, yazı ve rakam yok; aletlerde yüz yok.
- **Y1'den aynen kullanılanlar** (yeniden çizilmez): `hub-fon`, `canta-kapali`, `canta-acik`, `serit`, `pof-0`, `pof-1`, `yildiz`, Kino'nun dört pozu.
- **Hiza:** yakın planın bütün katmanları 2048 × 1152 tuvalde, aynı hizada.
- **Sakin alanlar:**
  - alt kenar x 20…1520, y 940…1140 (alet şeridi);
  - sağ alt köşe x ≥ 1480, y ≥ 800 (Kino).
- **Kare dizileri:** bir dizinin kareleri aynı tuvalde, aynı hizada; değişmeyen parça piksel piksel aynı (aynı çizimden türet).
- **Masadaki hasta:** Y1'deki Zıpzıp pozlarının eşi; sedyede, önden; tuval 1000 × 940.
- **Kaynaklar:** `ekip/doktor/<y8|y10>/kaynak/` içine bu adlarla (`.png`); tuvale oturtma ve webp bizde.

---

## Paket Doktor-Y8 · "Kuzu'nun Sökük Dikişi" → `assets/doktor/kuzu/` (84 çizim)

**Kuzu modeli:** `ekip/doktor/k1-prova/a1-kuzu-rev.png`. Lokum'un beyaz pelüş oyuncak kuzusu.
- Boynunda kırmızı kurdele, işlemeli yüz, iki düğme göz.
- Dört bacaklı bir oyuncak hayvan; insan biçimli değil, iki ayak üstünde durmaz.
- Bu vakada yanı sökülmüş, beyaz pamuğu taşmış; bir düğme gözü düşmüş, kulağı yırtılmış, kurdelesi çözülmüş.

**Oyuncak tamiri:** iğne, iplik, dikiş yok. Sökük yapışkan kumaş yamayla, kulak cırt cırt bantla kapanır; pamuk parmakla yerine itilir; düğme göz vidalanır gibi çevrilerek takılır.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Tıkıştır | Taşan pamukları söküğe sürükler | Pamuk "pof" diye içeri girer, Kuzu dört kademede dolgunlaşır. Hızlı iterse karşı taraftan bir pamuk "pof" diye geri çıkar, Kuzu "mee?" der. 5+ yaşta sepetten bir tutam daha. |
| 2 | Seç | Üç yamadan birine dokunur | Seçilen yama parlar, kalkar. |
| 3 | Yama | Yamayı söküğün üstüne götürür | Tam üstüne konan yama oturur, köşeleri havada. Kaymış yerde bırakılırsa kayıp düşer (iki kare). |
| 4 | Köşe | Yamanın dört köşesine basar | Her köşe "pıt" diye yapışır (iki kare). Dördü yapışınca yama parlar. |
| 5 | Cırt | Cırt cırt bandı kulaktaki yırtık boyunca çeker | Bant boydan boya kapanır, "cırrt" izi (üç kare), kulak sallanır (iki kare). Hızlı çekerse bant kıvrılır, yeniden çekilir. |
| 6 | Düğme | Düğmeyi göz yuvasına koyar, saat yönünde çevirir | Her yarım turda "tık", vida çizgileri (iki kare). Ters çevirirse düğme "pıt" diye fırlar, yuvarlanır. |
| 7 | Kurdele | İki ucu çaprazlar, ilmeği yukarı çeker | Uçlar çaprazlanır, fiyonk iki karede bağlanır. Çaprazlamadan bırakılan uç yerine kaçar. |
| 8 | Kabart | Fırçayla yün kıvrımlarında küçük daireler çizer | Toz bulutları çıkar (üç kare), kıvrım pofuduk olur, parlar. Hepsi bitince Kuzu "Mee!" der, kalpler yükselir. Masada Kuzu'ya dokununca "Mee!", dışarıdan Lokum'un "Kuzu'm!"u. |

**Yaş:**
- 2–3: üç pamuk, bir tur düğme, iki yün; el hızına hoşgörülü.
- 5+: dört pamuk (biri sepetten), iki tur düğme, dört yün; daha yavaş el.

### Yakın plan ölçüleri (2048 × 1152)
- **Kuzu** sedyede yan yatıyor, x 420…1400, y 220…880. Başı solda: işlemeli yüzün ortası (600, 430); düşmüş gözün yuvası (650, 380).
- **Sökük** gövdenin yanında, ortası (940, 620). Dışına taşmış üç pamuk: (860, 540), (1040, 580), (960, 730).
- **Yamanın dört köşesi** söküğün çevresinde: (825, 515), (1055, 515), (1055, 725), (825, 725).
- **Kulaktaki yırtık:** soldan sağa (500, 290) → (720, 320).
- **Kurdele** boynunda (780, 560); iki ucu (680, 630) ve (880, 630).
- **Dört yün kıvrımı:** (1080, 420), (1250, 520), (1140, 790), (1300, 700).
- **Pamuk sepeti** solda x 60…420, y 420…780; içindeki tutam (240, 520).
- **Yamalar** sağ üstte, rafta: kalp (1660, 260), yıldız (1860, 260), pati (1760, 430).

### Sayfa 1 · Fon ve sepet (3) → `kuzu-fon`, `pamuk-sepeti`, `pamuk-sepeti-bos`
- **`kuzu-fon`** (2048 × 1152, opak): Y1 `yakin-fon` ile aynı oda. Sağ üstte yamaların durduğu küçük raf (boş). Kuzu, sepet ve aletler yok.
- **`pamuk-sepeti`**, **`pamuk-sepeti-bos`** (360 × 360): örgü sepet, içi pamuk dolu; boşalmış.

### Sayfa 2 · Kuzu'nun gövdesi (6, şeffaf, 2048 × 1152, aynı hiza; yüz ve gözler ayrı) → `kuzu-yakin-0`, `kuzu-yakin-1`, `kuzu-yakin-2`, `kuzu-yakin-3`, `kuzu-yakin-pof`, `kuzu-yakin-mee`
- 0: pamuğu taşmış, sönük, yanı çökük. 1–3: doldukça dolgunlaşır; 3 tam dolgun.
- Sol gözü yerinde (düğme), sağ gözün yuvası boş; söküğün yeri sade (sökük ayrı katman).
- `pof`: bir pamuk geri fırladığı an, gövde hafif sıkışmış. `mee`: "mee" derken gövde zıplamış.

### Sayfa 3 · Kuzu'nun yüzü I (5, 400 × 400) → `kuzu-yuz-uzgun`, `kuzu-yuz-mee`, `kuzu-yuz-sasir`, `kuzu-yuz-gulen`, `kuzu-yuz-kikir`
- İşlemeli oyuncak yüz: burun ve ağız, kaşlar; gözler yok (gövdede).
- uzgun: ağız aşağı. mee: ağız yuvarlak açık. sasir: kaşlar havada. gulen: kocaman gülüş. kikir: gözler kapalı gülüş çizgisi.

### Sayfa 4 · Kuzu'nun yüzü II (4, 400 × 400) → `kuzu-yuz-mutlu`, `kuzu-yuz-utangac`, `kuzu-yuz-gidik`, `kuzu-yuz-merak`
- mutlu: tatlı gülümseme. utangac: pembe yanaklar. gidik: kıpır kıpır gülüş. merak: tek kaş havada.

### Sayfa 5 · Sökük ve pamuk (8) → `sokuk`, `pamuk-0`, `pamuk-1`, `pamuk-2`, `pamuk-pof-0`, `pamuk-pof-1`, `pamuk-pof-2`, `sepet-pamugu`
- `sokuk` (360 × 300): yanın açık ağzı, kumaş kenarları; içi yumuşak gölge. İğne izi yok.
- `pamuk-0/1/2` (240 × 240): üç ayrı biçimde beyaz pamuk tutamı.
- `pamuk-pof-0/1/2`: pamuğun "pof" diye fırlaması.
- `sepet-pamugu`: sepetten alınan tutam.

### Sayfa 6 · Yamalar I (6, 300 × 300) → `yama-kalp`, `yama-yildiz`, `yama-pati`, `yama-kalp-yerinde`, `yama-yildiz-yerinde`, `yama-pati-yerinde`
- Kumaş yamalar: pembe kalp, sarı yıldız, mavi pati. Kenarları dikişsiz, yumuşak; arkası yapışkan.
- `-yerinde`: söküğün üstüne konmuş, köşeleri hafif havada.

### Sayfa 7 · Yamalar II (8) → `yama-kalp-yapisik`, `yama-yildiz-yapisik`, `yama-pati-yapisik`, `yama-secim-isigi`, `yama-kayma-0`, `yama-kayma-1`, `kose-pit-0`, `kose-pit-1`
- `-yapisik`: dört köşesi yapışmış, hafif parlak.
- `yama-secim-isigi` (360 × 360): seçilen yamanın çevresinde sıcak ışık halkası.
- `yama-kayma-0/1`: kayıp düşen yama (genel). `kose-pit-0/1` (160 × 160): köşenin yapışma pırıltısı.

### Sayfa 8 · Cırt cırt (8) → `kulak-sokuk`, `cirt-bant`, `cirt-bant-yarim`, `cirt-bant-tamam`, `cirt-bant-kivrik`, `cirt-iz-0`, `cirt-iz-1`, `cirt-iz-2`
- `kulak-sokuk` (400 × 200): kulaktaki yırtık.
- `cirt-bant` (600 × 600): elde tutulan mavi cırt cırt bant şeridi; sol ucundan tutulur (120, 300), ucu sağda (520, 300).
- `cirt-bant-yarim`, `cirt-bant-tamam` (400 × 200): yırtığın üstünde yarıya kadar ve boydan boya yapışmış bant.
- `cirt-bant-kivrik` (400 × 300): hızlı çekilince kıvrılıp kendine yapışmış bant.
- `cirt-iz-0/1/2` (300 × 200): "cırrt" çizgileri.

### Sayfa 9 · Kulak ve pamuk parçası (4) → `kulak-sallan-0`, `kulak-sallan-1`, `pamuk-parca-0`, `pamuk-parca-1`
- `kulak-sallan-0/1` (500 × 400): yapışan kulak iki yana sallanır.
- `pamuk-parca-0/1` (300 × 300): itilirken uçuşan minik pamuk parçaları.

### Sayfa 10 · Düğme göz (7) → `dugme-goz`, `dugme-goz-yerinde-0`, `dugme-goz-yerinde-1`, `dugme-yuvarlan`, `dugme-pit`, `vida-cizgi-0`, `vida-cizgi-1`
- `dugme-goz` (240 × 240): kahverengi, dört delikli yuvarlak düğme (iplik yok).
- `dugme-goz-yerinde-0/1`: yuvaya oturmuş düğme, iki ışıltı.
- `dugme-yuvarlan`: yuvarlanan düğme. `dugme-pit` (300 × 300): fırlama pırıltısı.
- `vida-cizgi-0/1` (300 × 300): dönüş çizgileri.

### Sayfa 11 · Kurdele (7) → `kurdele-cozuk`, `kurdele-sol-uc`, `kurdele-sag-uc`, `kurdele-capraz`, `kurdele-fiyonk-0`, `kurdele-fiyonk-1`, `kurdele-bagli`
- `kurdele-cozuk`, `kurdele-bagli` (2048 × 1152): boynundaki kırmızı kurdele; çözük (uçlar yok, ayrı) ve fiyonklu.
- `kurdele-sol-uc`, `kurdele-sag-uc` (200 × 200): serbest uçlar.
- `kurdele-capraz` (400 × 300): çaprazlanmış iki uç. `kurdele-fiyonk-0/1`: ilmek çekilirken.

### Sayfa 12 · Fırça ve yün (7) → `kuzu-firca`, `yun-toz-0`, `yun-toz-1`, `yun-toz-2`, `yun-kivrim-0`, `yun-kivrim-1`, `yun-parilti`
- `kuzu-firca` (600 × 600): yumuşak oyuncak fırçası; sap altta (300, 500), kıllar üstte (300, 110).
- `yun-toz-0/1/2` (300 × 300): küçük toz bulutları.
- `yun-kivrim-0/1` (260 × 260): basık ve pofuduk yün kıvrımı. `yun-parilti`: kabaran yünde parıltı.

### Sayfa 13 · Kalp ve mee (4) → `kuzu-kalp-0`, `kuzu-kalp-1`, `mee-cizgi-0`, `mee-cizgi-1`
- `kuzu-kalp-0/1` (160 × 160): yükselen kalpler. `mee-cizgi-0/1` (400 × 300): "mee"nin ses çizgileri (yazı değil).

### Sayfa 14 · Masadaki Kuzu (7, tuval 1000 × 940) → `kuzu-masa-uzgun-0`, `kuzu-masa-uzgun-1`, `kuzu-masa-egik`, `kuzu-masa-sevinc-0`, `kuzu-masa-sevinc-1`, `kuzu-masa-son-mee`, `kuzu-masa-son-kuzum`
- Sedyede oturtulmuş oyuncak Kuzu, yanından pamuk taşıyor. Masada dokunulacak yer söküğü, tuvalde (620, 560).
- `egik`: başı yana eğik (göz kırpmak yerine). sevinc-0/1: zıplar. son-mee: "Mee!". son-kuzum: başını kapıya çevirmiş, Lokum'un sesini duyuyor.

---

## Paket Doktor-Y10 · "Mino'nun Kayıp Çıngırağı" → `assets/doktor/cingirak/` (80 çizim)

**Mino modeli:** `ekip/kalite/minkino-gorsel-rehberi/pozlar/mino/on.png`.
- Turuncu tekir kedi, mavi önlüklü elbise.
- Saymak: 2 kol, 2 el, 2 kulak, 2 göz, 1 kuyruk.
- Sarı çıngıraklı topu önlüğünün cebine koymuş, unutmuş; yürüyünce karnından "tıngır".

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Zıplat | Mino'yu başından aşağı bastırıp bırakır | Mino basılır (ezik), yay gibi zıplar (havada), konarken toz; her zıplayışta "tıngır" çizgileri. Çok bastırırsa "boing" diye tavana kadar fırlar. |
| 2 | Dinle | Stetoskopla kaçan sesi takip eder | Top giysinin içinde yuvarlanıyor; ses dalgası onunla gezer. Yakınken dalga görünür, ses büyür. Yeterince takip edilince ses cepte durur. |
| 3 | Fermuar | Cebin fermuarını soldan sağa çeker | Dişler tek tek açılır, cep beş kademede açılır. Hızlı çekerse fermuar sıkışır ("kırt"); biraz geri alınca kurtulur. |
| 4 | Çıkar | Topu cepten yukarı çeker | Top uzar, "pop" diye çıkar, sedyeye seker, parlar. Hızlı çekerse cep ters döner, kurabiye kırıntıları dökülür. |
| 5 | Ritim | Mino başını sallarken, vuruş anında topa dokunur | Topun çevresinde ışık halkası vuruşta yanar. Doğru anda dokununca "tıngır", yıldızcıklar, Mino dans eder (dört kare). Yanlış anda "tık", Mino başını yana eğer. |
| 6 | Fırlat | Topu Mino'ya doğru hızlıca kaydırır | Top dönerek uçar (iki kare), Mino yakalar. Zayıf atarsa top yuvarlanıp önünde durur (üç kare), Mino uzanır. |
| 7 | Yakala | Eldiveni alıp düşeceği yerin gölgesine tutar | Mino eldiveni görünce geri atar; gölge büyür. Yakalarsa eldivende top. Kaçarsa top seker, Mino kıkırdar. Yaşa göre bir ile üç atış. |
| 8 | Toka | Topu boynuna götürür, tokaya basılı tutar | Halka dolar, toka "çıt" diye kapanır. Çıngırak artık tasmasında sallanır (iki kare). Erken bırakırsa toka açılır. Masada Mino sevinçle zıplar, boynundan "tıngır"; cebine bakar, kıkırdar. |

**Yaş:**
- 2–3: iki zıplama, iki ritim vuruşu (geniş pencere), bir atış.
- 5+: dört ritim vuruşu (dar pencere), üç atış, uzun toka.

### Yakın plan ölçüleri (2048 × 1152)
- **Mino** sedyede ayakta, belden yukarısı. Baş ekseni x 880; baş x 540…1220, y 60…560. Zıplatmak için bastırılan yer başı ve omuzları.
- **Ön cep** x 640…1120, y 600…900. Fermuar cebin ağzında, soldan sağa (690, 640) → (1070, 640); on iki diş.
- **Top** cepte (880, 770); cepten çıkınca sedyede (1330, 800).
- **Patiler** (top buraya atılır) (880, 500); **boyun** (880, 575); **toka** (880, 640).
- **Geri atışta düşme yerleri:** (560, 860), (900, 880), (1260, 860).

### Sayfa 1 · Fon (1) → `cingirak-fon`
- **`cingirak-fon`** (2048 × 1152, opak): Y1 `yakin-fon` ile aynı oda, sıcak sarı ışık. Mino, top ve aletler yok.

### Sayfa 2 · Mino I (8, şeffaf, 2048 × 1152, aynı hiza; cep ve tasma ayrı) → `mino-yakin-uzgun`, `mino-yakin-kirp`, `mino-yakin-ezik`, `mino-yakin-havada`, `mino-yakin-boing`, `mino-yakin-sasir`, `mino-yakin-kikir`, `mino-yakin-merak`
- Cebin yeri sade, boyun tasmasız (ikisi ayrı katman).
- uzgun: şaşkın, patisi yanağında. kirp: göz kırpma. ezik: basılmış, gözler sıkılmış, yanaklar şiş.
- havada: zıplarken kollar havada. boing: tavana fırlamış, gözler kocaman, kulaklar dik.
- sasir: ağzı açık. kikir: gözler kapalı gülüş. merak: başı yana eğik.

### Sayfa 3 · Mino II (8, aynı hiza) → `mino-yakin-dinle`, `mino-yakin-oh`, `mino-yakin-sevin`, `mino-yakin-dans-0`, `mino-yakin-dans-1`, `mino-yakin-dans-2`, `mino-yakin-dans-3`, `mino-yakin-uzan`
- dinle: kulakları kabarmış, gözü karnında. oh: "oh!" ağzı yuvarlak. sevin: gülüş.
- dans-0…3: başını iki yana sallayarak dans, kuyruk havada, dört kare döngü.
- uzan: kısa düşen topa doğru uzanmış, öne eğik.

### Sayfa 4 · Mino III ve tasma (6) → `mino-yakin-yakala`, `mino-yakin-firlat`, `mino-yakin-gulen`, `mino-yakin-utangac`, `tasma-cozuk`, `tasma-bagli`
- yakala: iki patisi önde, topu yakalamış. firlat: kolu yukarıda, atıyor. gulen: kocaman gülüş. utangac: pembe yanaklar.
- `tasma-cozuk`, `tasma-bagli` (2048 × 1152): boynunda mavi tasma; tokası açık ve sarı çıngıraklı top tokada.

### Sayfa 5 · Cep (8) → `cep-fermuar-0`, `cep-fermuar-1`, `cep-fermuar-2`, `cep-fermuar-3`, `cep-fermuar-4`, `cep-ters`, `fermuar-tutamak`, `fermuar-sikisti`
- `cep-fermuar-0…4` (480 × 300): ön cep; fermuar 0 kapalı → 4 tam açık; içinde topun tümseği.
- `cep-ters`: cep ters dönmüş, astarı dışarıda, kırıntılı.
- `fermuar-tutamak` (160 × 200): fermuarın çekme tutamağı. `fermuar-sikisti` (300 × 200): sıkışmanın "kırt" çizgileri.

### Sayfa 6 · Ses ve stetoskop (8) → `fermuar-parilti`, `tingir-cizgi-0`, `tingir-cizgi-1`, `tingir-cizgi-2`, `ses-dalga-0`, `ses-dalga-1`, `cin-steto`, `cin-steto-dinle`
- `fermuar-parilti` (200 × 200): açılan fermuarın ucunda pırıltı.
- `tingir-cizgi-0/1/2` (400 × 300): "tıngır" ses çizgileri (yazı değil).
- `ses-dalga-0/1` (300 × 300): giysinin içinde gezen sesin yumuşak halkası.
- `cin-steto` (600 × 600): oyuncak stetoskop; kulaklıklar (300, 140), dinleme başı (450, 470). `cin-steto-dinle`: dinleme başında ses halkaları.

### Sayfa 7 · Top (8, 240 × 240 ve gölge) → `cingirak-top`, `cingirak-top-cepte`, `cingirak-top-parla`, `cingirak-top-ezik`, `top-yuvarlan-0`, `top-yuvarlan-1`, `top-yuvarlan-2`, `top-golge`
- Sarı, içi çıngıraklı, delikli oyuncak top (kodda 170 boyda).
- cepte: cepten yarısı görünen top. parla: pırıl pırıl. ezik: dokunuşta basılmış. yuvarlan-0…2: yuvarlanma.
- `top-golge` (300 × 120): yerdeki gölge.

### Sayfa 8 · Uçuş, kırıntı, yay ve toz (8) → `top-ucus-0`, `top-ucus-1`, `kurabiye-kirinti-0`, `kurabiye-kirinti-1`, `yay-cizgi-0`, `yay-cizgi-1`, `zipla-toz-0`, `zipla-toz-1`
- `top-ucus-0/1` (240 × 240): havada dönen top. `kurabiye-kirinti-0/1` (300 × 300): dökülen kurabiye kırıntıları.
- `yay-cizgi-0/1` (700 × 300): "boing" yay çizgileri. `zipla-toz-0/1` (500 × 200): konarken toz.

### Sayfa 9 · Ritim (6) → `ritim-isik-0`, `ritim-isik-1`, `ritim-isik-2`, `tingir-yildiz-0`, `tingir-yildiz-1`, `tingir-yildiz-2`
- `ritim-isik-0/1/2` (300 × 300): vuruşta topun çevresinde yanıp sönen ışık halkası.
- `tingir-yildiz-0/1/2` (200 × 200): doğru vuruşta yükselen yıldızcıklar.

### Sayfa 10 · Eldiven ve toka (8) → `eldiven`, `eldiven-tuttu`, `eldiven-kacti`, `dusme-golgesi`, `toka-acik`, `toka-kapali`, `tasma-cin-0`, `tasma-cin-1`
- `eldiven` (600 × 600): yumuşak, kocaman yakalama eldiveni; tutulan yer bilek (300, 490), avucun ortası (300, 250). `eldiven-tuttu`: içinde top. `eldiven-kacti`: boş, şaşkın sallanmış.
- `dusme-golgesi` (300 × 140): topun düşeceği yerde büyüyen gölge.
- `toka-acik`, `toka-kapali` (240 × 200): tasmanın tokası. `tasma-cin-0/1` (200 × 200): tasmada sallanan çıngırak.

### Sayfa 11 · Parıltı ve kalp (3) → `tasma-parla`, `cin-kalp-0`, `cin-kalp-1`
- `tasma-parla` (300 × 300): kapanan tokanın pırıltısı. `cin-kalp-0/1` (160 × 160): kalpler.

### Sayfa 12 · Masadaki Mino (8, tuval 1000 × 940) → `mino-cin-uzgun-0`, `mino-cin-uzgun-1`, `mino-cin-uzgun-kirp`, `mino-cin-sevinc-0`, `mino-cin-sevinc-1`, `mino-cin-son-zipla`, `mino-cin-son-tingir`, `mino-cin-son-kikir`
- Sedyede ayakta, şaşkın, patisi yanağında; karnının yanında ses çizgileri. Masada dokunulacak yer cebi, tuvalde (560, 600).
- sevinc-0/1: zıplar. son-zipla: tasmasıyla zıplar. son-tingir: boynundaki çıngıraktan ses çizgileri. son-kikir: cebine bakıp kıkırdar.
