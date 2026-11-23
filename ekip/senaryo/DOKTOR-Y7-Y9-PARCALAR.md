# Minik Doktor · Y7 ve Y9 parça brief'leri (anahtar kare onaylanınca Astra'ya gider)

Claude (İngilizce yan oturumu → Minik Doktor), 23 Kasım 2026. KALITE-KURALLARI madde 0'a göre yazıldı: ucuza kaçma, her hareketin kendi kareleri. Kod hazır, çizim bekliyor:
- `doktor/src/vaka-karin/` → `doktor/index.html?oyun=karin`.
- `doktor/src/vaka-bocek/` → `doktor/index.html?oyun=bocek`.
- İki vaka bekleme odasına (`?oyun=klinik`) bağlı. Çizimleri gelince sıraya kendiliğinden girerler.

Adlar, ölçüler ve kare dizileri kodla birebir. Birim testleri (`tests/unit/doktor-karin.test.ts`, `doktor-bocek.test.ts`) bu dosyayı okuyup karşılaştırır.

Anahtar kareler `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 23:55 kaydında (Doktor-Y7 `anahtar-karin`, Doktor-Y9 `anahtar-bocek`). Senaryo büyüdüğü için kanala bir ek yazıldı (23 Kasım). **Sıra en sonda, Doktor-Y2'den sonra.** Sayfa başına en çok 8 çizim.

**Ortak:**
- **Stil:** onaylı `anahtar-hub` ve Y1 yakın planı. İnce koyu kontur, düz yumuşak renk, sıcak pastel, tek yumuşak gölge, doku yok.
- **Yasaklar:** insan figürü, çilek, kan, iğne, hap, bilye, makas, yazı ve rakam yok; aletlerde yüz yok. Kulağın ve gözün içine alet girmez.
- **Y1'den aynen kullanılanlar** (yeniden çizilmez): `hub-fon`, `canta-kapali`, `canta-acik`, `serit`, `pof-0`, `pof-1`, `yildiz`, Kino'nun dört pozu. Y9'da Y1'in `buyutec`'i de.
- **Hiza:** yakın planın bütün katmanları 2048 × 1152 tuvalde, aynı hizada.
- **Sakin alanlar:**
  - alt kenar x 20…1520, y 940…1140 (alet şeridi);
  - sağ alt köşe x ≥ 1480, y ≥ 800 (Kino).
- **Kare dizileri:** bir dizinin kareleri aynı tuvalde, aynı hizada; değişmeyen parça piksel piksel aynı (aynı çizimden türet).
- **Masadaki hasta:** Y1'deki Zıpzıp pozlarının eşi. Sedyede, önden, boydan; tuval 1000 × 940, gövde x 260…860, y 60…860.
- **Kaynaklar:** `ekip/doktor/<y7|y9>/kaynak/` içine bu adlarla (`.png`); tuvale oturtma ve webp bizde.

---

## Paket Doktor-Y7 · "Lokum'un Guruldayan Karnı" → `assets/doktor/karin/` (80 çizim)

**Lokum modeli:** `ekip/kalite/minkino-gorsel-rehberi/pozlar/lokum/on.png`.
- Beyaz köpek yavrusu: sağ kulağı turuncu, burnu kırmızı, pembe tulumlu.
- Boyu Kino'nun 0,63'ü.
- Saymak: 2 kol, 2 el, 2 bacak, 2 ayak, 2 kulak, 2 göz, 1 kuyruk.
- Çok mandalina yemiş; karnı "gurrr" diye konuşuyor.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Dinle | Stetoskobu karında gezdirir | Gurultuya yaklaştıkça ses büyür ve sıklaşır, karın çizgileri titrer, ekran hafifçe sarsılır (sıcak-soğuk). Yerinde tutunca bulunur: gurultu yeri işaretlenir, Lokum kıkırdar. Burnuna tutarsa stetoskobu koklar. |
| 2 | Röntgen | Çerçeveyi karnın üstünde kaydırır | Çerçevenin penceresinden çizgi film röntgeni görünür. Üç mandalina dilimi pencerede tutulunca "bıdık" diye kıpırdar, parlar. Başına tutarsa röntgende aklındaki mandalina görünür; Lokum utanır. |
| 3 | Isıt | Kino'nun patilerini sağa sola hızlı sürter | Patiler sürtünür (iki kare), sıcak pırıltılar çıkar, patiler kızarıp ısınır. Isınmadan karna dokunursa Lokum "brr" diye üşür, titrer. |
| 4 | Ov | Ilık patilerle karnında yavaş daireler çizer | Karın ılık ışıkla parlar, ovma izi kıvrılır; gurultu üç kademede söner. Hızlı çizerse Lokum gıdıklanıp yuvarlanır (iki kare). |
| 5 | Karıştır | Kaşıkla çayın içinde daireler çizer | Çay girdap olur (üç kare), papatyalar döner. Hızlı karıştırırsa çay sıçrar. |
| 6 | Üfle | Buharın içinden yukarı doğru çeker | Buhar dağılır (üç kare), her üflemede azalır. Lokum da yanaklarını şişirip üfler. |
| 7 | İç | Fincanı Lokum'un ağzına götürüp tutar | Fincan eğilir, Lokum yudumlar (iki kare), fincan dört kademede boşalır. Burnuna tutarsa koklar. |
| 8 | Torba | Kalpli sıcak su torbasını karnına koyar, pıt pıt vurur | Torba her vuruşta basılır (iki kare), kalpler yükselir, Lokum kuyruğunu sallar. Son vuruşta "Hav!" der. Masada "Hav!"ın ardından karnından minik bir "gur" kaçar, kızarır. |

**Yaş:**
- 2–3: geniş bulma yarıçapı; bir tur ovma, bir tur karıştırma; iki üfleme, iki yudum, iki vuruş.
- 5+: dar yarıçap; iki tur ovma ve iki tur karıştırma, daha yavaş el.

### Yakın plan ölçüleri (2048 × 1152)
- **Lokum** sedyede sırtüstü, yukarıdan. Baş üstte x 620…1100, y 40…420: başın ortası (860, 230), burun (860, 300), ağız (860, 370).
- **Karın** karenin ortasında x 520…1200, y 400…880; ortası (860, 640).
- **Gurultu yerleri** (her oynayışta biri): (720, 580), (1000, 610), (860, 770).
- **Röntgendeki üç dilim:** (740, 620), (980, 660), (860, 790). Kodda 150 boyda.
- **Papatya çayı** solda: fincan çizimi x 60…460, y 400…820; çayın yüzü (260, 520).

### Sayfa 1 · Fon, röntgen ve ışık (3, her biri 2048 × 1152) → `karin-fon`, `karin-rontgen`, `karin-isik`
- **`karin-fon`** (opak): Y1 `yakin-fon` ile aynı oda; nane sedye yastığı, lila duvar. Solda fincanın durduğu küçük tepsi; Lokum, fincan ve aletler yok.
- **`karin-rontgen`** (opak): aynı Lokum, koyu mavi çizgi film röntgeni.
  - Açık mavi çizgilerle gövde ana hatları; korkutucu kemik yok.
  - Karın boş: dilimleri kod koyar.
  - **Başının içinde küçük bir mandalina** var: aklı mandalinada.
- **`karin-isik`** (şeffaf): karnın üstünde sıcak turuncu yumuşak ışık halesi.

### Sayfa 2 · Lokum, ifadeler I (8, şeffaf, 2048 × 1152, aynı hiza) → `lokum-yakin-uzgun`, `lokum-yakin-kirp`, `lokum-yakin-gur`, `lokum-yakin-kikir`, `lokum-yakin-gidik-0`, `lokum-yakin-gidik-1`, `lokum-yakin-utangac`, `lokum-yakin-rahat`
- Bütün gövde, aynı yer. Her karede karın aynı yerde.
- uzgun: patileri karnında, kaşlar çatık. kirp: göz kırpma. gur: karnı guruldarken yüzünü buruşturmuş.
- gidik-0/1: gıdıklanıp sağa ve sola yuvarlanıyor, gözleri kapalı kahkaha.
- utangac: yanakları pembe, utangaç gülüş. rahat: gözleri yarı kapalı, keyifli.

### Sayfa 3 · Lokum, ifadeler II (8, aynı hiza) → `lokum-yakin-yudum-0`, `lokum-yakin-yudum-1`, `lokum-yakin-koklar`, `lokum-yakin-hav`, `lokum-yakin-mutlu-0`, `lokum-yakin-mutlu-1`, `lokum-yakin-gulen`, `lokum-yakin-usudu`
- yudum-0/1: ağzı fincana uzanmış (ağız (860, 370)), yudumlarken. Fincanı kod koyar.
- koklar: burnu kıpır kıpır, gözler şaşı, kokluyor. hav: ağzı açık "Hav!", kuyruğu havada.
- mutlu-0/1: kuyruk sallanıyor (iki uç). gulen: kocaman gülüş. usudu: titriyor, dişleri takırdıyor, gözleri kocaman.

### Sayfa 4 · Lokum III ve katmanlar (8) → `lokum-yakin-ufler`, `karin-gurultu-0`, `karin-gurultu-1`, `karin-gurultu-2`, `gurultu-yeri-0`, `gurultu-yeri-1`, `titreme-0`, `titreme-1`
- `lokum-yakin-ufler`: yanakları şişik, dudakları büzük, üflüyor.
- `karin-gurultu-0/1/2` (2048 × 1152, şeffaf): karnın çevresinde dalgalı ses çizgileri; 0 güçlü, 1 orta, 2 zayıf. Yazı yok.
- `gurultu-yeri-0/1` (240 × 240): turuncu küçük girdap işareti, iki karede döner.
- `titreme-0/1` (800 × 600): Lokum'un çevresinde titreme çizgileri.

### Sayfa 5 · Stetoskop ve röntgen (6) → `karin-steto`, `karin-steto-dinle`, `rontgen-cerceve`, `rontgen-dilim-0`, `rontgen-dilim-1`, `dilim-parilti`
- **`karin-steto`** (600 × 600): oyuncak stetoskop. Tutulan yer kulaklıklar (300, 140); dinleme başı (450, 470).
- **`karin-steto-dinle`**: aynısı, dinleme başından minik ses halkaları.
- **`rontgen-cerceve`** (600 × 480): mavi yuvarlak köşeli çerçeve, sapı altta. İçi boş ve saydam: cam x 70…530, y 70…410.
- **`rontgen-dilim-0/1`** (200 × 200): röntgen renginde parlak mandalina dilimi. 1: kıpırdamış, hafif büyümüş.
- **`dilim-parilti`** (300 × 300): sarı yıldızcıklı parıltı halkası.

### Sayfa 6 · Kino'nun patileri (7) → `kino-eller`, `kino-eller-sur-0`, `kino-eller-sur-1`, `kino-eller-sicak`, `sicak-parilti-0`, `sicak-parilti-1`, `sicak-parilti-2`
- `kino-eller` (600 × 600): Kino'nun iki patisi avuç avuca, önden. Tutulan yer bilekler (300, 450); avuçların ortası (300, 270).
- `kino-eller-sur-0/1`: patiler birbirine sürtünürken (iki yön).
- `kino-eller-sicak`: patiler hafif turuncu, ılık parlıyor.
- `sicak-parilti-0/1/2` (300 × 300): sıcak turuncu kıvılcımlar dağılıyor.

### Sayfa 7 · Ovma ve gıdık (5) → `ov-iz-0`, `ov-iz-1`, `ov-iz-2`, `gidik-cizgi-0`, `gidik-cizgi-1`
- `ov-iz-0/1/2` (300 × 300): ılık, kıvrılan yumuşak iz; sönerek.
- `gidik-cizgi-0/1` (800 × 600): Lokum'un çevresinde kahkaha çizgileri ve küçük yıldızlar.

### Sayfa 8 · Fincan ve kaşık (7) → `fincan-0`, `fincan-1`, `fincan-2`, `fincan-3`, `fincan-egik`, `kasik`, `kasik-karistir`
- `fincan-0…3` (400 × 420): papatya desenli fincan, tabağıyla. Çay 0 dolu → 3 boş. Fincanın ağzı (200, 76).
- `fincan-egik`: aynı fincan elde, ağzı Lokum'a doğru eğik.
- `kasik` (600 × 600): tahta kaşık; sap üstte (300, 120), çorba kısmı altta (300, 520).
- `kasik-karistir`: kaşık çayın içinde, hafif dalgalı.

### Sayfa 9 · Çayın içi (8) → `cay-girdap-0`, `cay-girdap-1`, `cay-girdap-2`, `cay-papatya-0`, `cay-papatya-1`, `cay-sicrama-0`, `cay-sicrama-1`, `cay-sicrama-2`
- `cay-girdap-0/1/2` (300 × 160): çayın yüzünde dönen girdap.
- `cay-papatya-0/1` (100 × 100): suda yüzen küçük papatya (iki duruş).
- `cay-sicrama-0/1/2` (300 × 300): çay damlaları sıçrıyor.

### Sayfa 10 · Buhar (7) → `cay-buhar-0`, `cay-buhar-1`, `cay-buhar-2`, `cay-buhar-3`, `buhar-dagil-0`, `buhar-dagil-1`, `buhar-dagil-2`
- `cay-buhar-0…3` (300 × 400): fincandan yükselen kıvrık buhar, tabanı altta.
- `buhar-dagil-0/1/2` (400 × 400): üflenen buhar sağa yukarı dağılıyor.

### Sayfa 11 · Sıcak su torbası (6) → `sicak-torba`, `sicak-torba-yerinde`, `sicak-torba-bas-0`, `sicak-torba-bas-1`, `torba-kalp-0`, `torba-kalp-1`
- `sicak-torba` (600 × 600): kalp biçimli pembe sıcak su torbası, örgü kılıflı; tutulan yer üst (300, 180).
- `sicak-torba-yerinde` (400 × 400): karnın üstünde yatan torba, yukarıdan.
- `sicak-torba-bas-0/1`: vuruşta basılmış, sonra kabarmış.
- `torba-kalp-0/1` (160 × 160): yükselen pembe kalpler.

### Sayfa 12 · Masadaki Lokum (7, tuval 1000 × 940) → `lokum-uzgun-0`, `lokum-uzgun-1`, `lokum-uzgun-kirp`, `lokum-sevinc-0`, `lokum-sevinc-1`, `lokum-son-hav`, `lokum-son-gur`
- Sedyede oturmuş, patileri karnında. Masada dokunulacak yer karnı, tuvalde (560, 560).
- sevinc-0/1: zıplar. son-hav: "Hav!" der. son-gur: karnından minik ses çizgisi, yanakları kıpkırmızı, utangaç.

---

## Paket Doktor-Y9 · "Bulut'un Uğur Böceği" → `assets/doktor/bocek/` (82 çizim)

**Bulut modeli:** `ekip/kalite/minkino-gorsel-rehberi/pozlar/bulut/on.png`.
- Kayısı tüylü oğlak, küçük kahverengi boynuzlu; lila üst, turkuaz şort.
- Saymak: 2 kol, 2 el, 2 bacak, 2 kulak, 2 göz, 2 boynuz.

**Uğur böceği:** kırmızı, yedi siyah benekli, yuvarlak, sevimli; iki minik anten, altı minik bacak. Yüzü kocaman gözlü, gülümser.

**Güvenlik:** böceğe hiçbir alet dokunmaz; kulağın içine hiçbir şey girmez. Her şey kulağın dış tüylerinde olur. Cımbız yok, ezmek yok.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Bul | Büyüteci kulakta gezdirir | Böceğin saklandığı tutam ara ara kıpırdar ("tıkır tıkır"). Cam tutamda tutulunca böcek bakar (üç kare), "cik" deyip saklanır. Cam gözüne gelirse kocaman göz: Bulut irkilir. |
| 2 | Arala | Tüy tutamının üstünde parmağını iki yana çeker | Tutam aralanır. Böcek oradaysa görünür, başka tutamın arkasına koşar (saklambaç); en sonunda açıkta oturur, yüzünü temizler. Boş tutam aralanırsa tüyler uçuşur, Bulut gıdıklanır. |
| 3 | Yaprak | Yeşil yaprağı böceğe yavaşça yaklaştırır | Yavaş gelirse böcek yaprağa yürür. Hızlı gelirse böcek kabuğuna büzülür (iki kare), Bulut irkilir. |
| 4 | Taşı | Yaprağı pencereye sarsmadan götürür | Böcek yaprakta yürür (iki kare). Sallarsa yaprağın altına saklanır (yaprak sallanır, iki kare); durunca çıkar. Bulut nefesini tutar. Bırakırsa böcek kulağa geri yürür. |
| 5 | Uçur | Pervazdaki böceği yukarı doğru çeker | Böcek kanatlarını açar (üç kare), odada bir tur uçar (üç kare). Kino'nun burnuna konar, Kino hapşırır. Böcek pencereden gider, Bulut el sallar (iki kare). |
| 6 | Fırçala | Kulağın tüylerini kökten uca fırçalar | Fırça izi parlar (üç kare), tüyler düzelir, kulak pırıl pırıl olur. Ters fırçalarsa tüyler dikilir, Bulut kıkırdar. |
| 7 | Salla | Kulağın ucunu tutup yukarı aşağı sallar | Kulak yukarı ve aşağı sallanır, "flap flap". Çok sert sallarsa kulak gözlerinin üstüne düşer: "Göremiyorum!" |
| 8 | Selam | Pervaza konan üç uğur böceğine tek tek dokunur | Böcek iki arkadaşıyla teşekküre gelir. Dokunulan kanat çırpar, kalp yükselir. Üçü de dokunulunca kalp çizerek uçarlar. |

**Yaş:**
- 2–3: böcek bir kez kaçar; yaprak hızına ve sarsıntıya pek duyarlı değil; iki bant fırça, iki sallama.
- 5+: üç kaçış, yavaş el; üç bant, dört sallama.

### Yakın plan ölçüleri (2048 × 1152)
- **Bulut'un başı** yandan, solda x 60…560, y 160…700. Göz (330, 360).
- **Uzun kulağın dış yüzü** karenin ortasında x 520…1320, y 200…860: kök solda başın yanında, uç sağda.
  - Kulak ayrı katman, baş kulaksız çizilir.
  - Kulağın ucu (1260, 560).
- **Üç tüy tutamı** (böceğin saklandığı yerler): (760, 420), (960, 610), (1150, 470). Kovalamacanın sonunda böcek açıkta (1000, 400) oturur.
- **Açık pencere** sağ üstte x 1500…2000, y 40…520. Pervazın ortası (1740, 470); teşekküre gelen üç böceğin yerleri (1610, 450), (1750, 430), (1890, 450).
- **Fırçanın üç bandı:** y 410, 530, 650; x 620…1260 arası, kökten uca.
- **Kino'nun burnu** yakın planda (1780, 930); Y1'in Kino pozları aynen. Böcek buraya konar.

### Sayfa 1 · Fon ve pencere dalı (3) → `bocek-fon`, `pencere-dal-0`, `pencere-dal-1`
- **`bocek-fon`** (2048 × 1152, opak):
  - Y1 `yakin-fon` ile aynı oda.
  - Sağ üstte açık pencere: dışarıda mavi gökyüzü, ahşap pervaz.
  - Bulut, kulak ve böcek yok.
- **`pencere-dal-0/1`** (500 × 480, şeffaf): pencerenin dışında yapraklı bir dal, iki karede rüzgârda sallanır.

### Sayfa 2 · Bulut'un başı, ifadeler I (8, şeffaf, 2048 × 1152, aynı hiza; kulaksız) → `bulut-yan-uzgun`, `bulut-yan-kirp`, `bulut-yan-kasin-0`, `bulut-yan-kasin-1`, `bulut-yan-kikir`, `bulut-yan-gidik`, `bulut-yan-sasir`, `bulut-yan-merak`
- uzgun: gıdıklanmış, hem kıkırdayan hem şaşkın bir yüz. kirp: göz kırpma.
- kasin-0/1: patisini kulağının köküne uzatmış kaşınıyor (pati kulağa girmez).
- kikir, gidik: gözleri kapalı kıkırdama ve gıdıklanma.
- sasir: kaşlar havada. merak: gözü kulağına kaymış, dikkatle bakıyor.

### Sayfa 3 · Bulut'un başı, ifadeler II (8, aynı hiza) → `bulut-yan-irkil`, `bulut-yan-sessiz`, `bulut-yan-salla-0`, `bulut-yan-salla-1`, `bulut-yan-kor`, `bulut-yan-ohh`, `bulut-yan-mutlu`, `bulut-yan-gulen`
- irkil: gözler kocaman, geri çekilmiş. sessiz: nefesini tutmuş, dudakları büzük, "şşş".
- salla-0/1: pencereye el sallıyor (kolu iki uçta). kor: kulağı gözlerinin üstünde, kıkırdıyor (yüzün görünen kısmı; kulak katmanı üstte).
- ohh: rahatlamış, gözleri yarı kapalı. mutlu: gülümseme. gulen: kocaman gülüş.

### Sayfa 4 · Kulak (5, şeffaf, 2048 × 1152, aynı hiza) → `kulak`, `kulak-tarali`, `kulak-yukari`, `kulak-asagi`, `kulak-gozde`
- `kulak`: uzun kulağın dış yüzü, tüyleri biraz dağınık. Tutamların yeri sade; tutamları kod koyar.
- `kulak-tarali`: tutamlar dahil bütün tüyler taranmış, yumuşak ve parlak.
- `kulak-yukari`, `kulak-asagi`: taranmış kulak, ucu yukarı ve aşağı sallanmış. Kök aynı yerde.
- `kulak-gozde`: taranmış kulak ters dönmüş, Bulut'un gözlerinin üstüne düşmüş.

### Sayfa 5 · Tüyler (7) → `tutam`, `tutam-aralik`, `tutam-dik`, `tuy-ucusan-0`, `tuy-ucusan-1`, `kipirti-0`, `kipirti-1`
- `tutam`, `tutam-aralik`, `tutam-dik` (280 × 280): bir tüy tutamı. Düz; iki yana aralanmış (arası boş); dikilmiş.
- `tuy-ucusan-0/1` (300 × 300): uçuşan birkaç tüy.
- `kipirti-0/1` (300 × 300): tutamın çevresinde kıpırtı çizgileri.

### Sayfa 6 · Parıltı ve gıdık (5) → `tuy-parilti-0`, `tuy-parilti-1`, `tuy-parilti-2`, `kulak-gidik-0`, `kulak-gidik-1`
- `tuy-parilti-0/1/2` (300 × 300): taranmış tüyde parıltı.
- `kulak-gidik-0/1` (400 × 300): gıdıklanma çizgileri.

### Sayfa 7 · Uğur böceği I (8, 200 × 200) → `bocek-bak-0`, `bocek-bak-1`, `bocek-bak-2`, `bocek-yuru-0`, `bocek-yuru-1`, `bocek-yuru-2`, `bocek-yuru-3`, `bocek-burun`
- Böcek tuvalin ortasında, gövde 150 boyda.
- bak-0/1/2: tutamın arkasından başını çıkarıp bakar, göz kırpar, "cik".
- yuru-0…3: yukarıdan, **başı sağa** dönük yürüyüş; altı bacak sırayla. Kod yönüne döndürür.
- burun: önden, Kino'nun burnunda oturan böcek, gülümsüyor.

### Sayfa 8 · Uğur böceği II (7, 200 × 200) → `bocek-saklan-0`, `bocek-saklan-1`, `bocek-otur-0`, `bocek-otur-1`, `bocek-kanat-0`, `bocek-kanat-1`, `bocek-kanat-2`
- saklan-0/1: bacaklarını çekiyor; kabuğuna büzülmüş yuvarlak.
- otur-0/1: oturmuş, ön bacaklarıyla yüzünü temizliyor.
- kanat-0/1/2: kabuk açılıyor, kanatlar çıkıyor, tam açık.

### Sayfa 9 · Uçuş ve selam (5, 200 × 200) → `bocek-uc-0`, `bocek-uc-1`, `bocek-uc-2`, `bocek-selam-0`, `bocek-selam-1`
- uc-0/1/2: uçarken kanat çırpma döngüsü.
- selam-0/1: pervazda oturmuş, bir bacağını sallayarak selam veriyor.

### Sayfa 10 · Arkadaşlar (6, 200 × 200) → `arkadas-a-0`, `arkadas-a-1`, `arkadas-a-uc`, `arkadas-b-0`, `arkadas-b-1`, `arkadas-b-uc`
- İki arkadaş uğur böceği:
  - a: daha küçük, iki benekli, turuncu;
  - b: sarı, çok benekli.
- `-0` oturur; `-1` kanat çırpar; `-uc` uçar.

### Sayfa 11 · Yaprak (7) → `yaprak`, `yaprak-bocekli-0`, `yaprak-bocekli-1`, `yaprak-saklanmis`, `yaprak-salla-0`, `yaprak-salla-1`, `yaprak-pervazda`
- `yaprak` (600 × 600): sapı sol altta, yeşil taze yaprak. Tutulan yer sap (140, 520); böceğin bindiği yer yaprağın ortası (330, 250).
- `yaprak-bocekli-0/1`: üstünde böcek yürüyor (iki kare).
- `yaprak-saklanmis`: böcek yaprağın altına kaçmış, yalnız bacakları ve antenleri görünür.
- `yaprak-salla-0/1`: saklanmış böcekle sallanan yaprak (iki yön).
- `yaprak-pervazda` (400 × 300): pervazda yatan yaprak, yandan.

### Sayfa 12 · Fırça ve kalp (6) → `firca`, `firca-iz-0`, `firca-iz-1`, `firca-iz-2`, `bocek-kalp-0`, `bocek-kalp-1`
- `firca` (600 × 600): yumuşak, pofuduk tüy fırçası; sapı altta (300, 500), kılların ucu üstte (300, 110).
- `firca-iz-0/1/2` (400 × 200): fırçanın arkasında parlayan yumuşak iz, sönerek.
- `bocek-kalp-0/1` (160 × 160): kırmızı benekli küçük kalpler.

### Sayfa 13 · Masadaki Bulut (7, tuval 1000 × 940) → `bulut-kulak-uzgun-0`, `bulut-kulak-uzgun-1`, `bulut-kulak-uzgun-kirp`, `bulut-kulak-sevinc-0`, `bulut-kulak-sevinc-1`, `bulut-kulak-son-salla`, `bulut-kulak-son-kikir`
- Sedyede oturmuş, kulağını kaşıyıp kıkırdıyor. Uzun kulağının dış tüylerinde küçük kırmızı bir nokta (böcek). Masada dokunulacak yer kulağı, tuvalde (720, 250).
- sevinc-0/1: zıplar. son-salla: pencereye el sallar. son-kikir: kulağını okşayıp kıkırdar.
