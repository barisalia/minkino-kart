# Minik Doktor · Y3 ve Y4 parça brief'leri (taslak; anahtar kare onaylanınca Astra'ya gider)

Claude (İngilizce yan oturumu → Minik Doktor), 23 Kasım 2026 gecesi; 01:10'da Barış'ın temel kuralına (KALITE-KURALLARI madde 0) göre baştan, bol kareyle yeniden yazıldı. Kod hazır, çizim bekliyor:
- `doktor/src/vaka-ates/`: `doktor/index.html?oyun=ates`.
- `doktor/src/vaka-boya/`: `doktor/index.html?oyun=boya`.

Adlar ve ölçüler kodla birebir. Birim testleri (`tests/unit/doktor-ates.test.ts`, `doktor-boya.test.ts`) bu dosyayı okuyup karşılaştırır. Anahtar kareler: Paket Doktor-Y3 ve Y4, `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 23:55. Plan: `ekip/senaryo/DOKTOR-VAKALAR.md`. Harf oturumu bu metni onaylı anahtar kareyle birlikte Astra'ya iletir. Sayfa başına en çok 8 çizim.

**Ortak:**
- Stil: onaylı `anahtar-hub` ve Y1 yakın planı. İnce koyu kontur, düz yumuşak renk, sıcak pastel, tek yumuşak gölge, doku yok.
- Yasaklar: insan figürü, çilek, kan, iğne, hap, makas, yazı ve rakam yok; aletlerde yüz yok. Kulağın ve gözün içine alet girmez.
- Y1'den aynen kullanılanlar (yeniden çizilmez): `hub-fon`, `canta-kapali`, `canta-acik`, `serit`, `pof-0`, `pof-1`, `yildiz`, Kino'nun dört pozu (`kino-goster`, `kino-sasir`, `kino-alkis-0`, `kino-alkis-1`).
- Yakın planın bütün katmanları 2048 × 1152 tuvalde, aynı hizadadır.
- Her yakın planda iki köşe sakin kalır:
  - alt kenar x 20…1520, y 940…1140 (alet şeridi gelir);
  - sağ alt köşe x ≥ 1480, y ≥ 800 (Kino oradan bakar).
- Kaynaklar `ekip/doktor/<y3|y4>/kaynak/` içine bu adlarla gelir (`.png`); tuvale oturtma ve webp bizde.

---

## Paket Doktor-Y3 · "Bulut'un Ateşi" → `assets/doktor/ates/` (85 çizim)

**Barış'ın temel kuralı (madde 0):** ucuza kaçmadan, her hareketin kendi kareleriyle. Her adımda çocuğun parmağı gerçek bir iş yapar, ekranda gerçek bir animasyon olur, Bulut ve Kino tepki verir.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Termometre | Hızlı ileri geri sallar, sonra alna tutar | Gösterge titreyerek iner ("şık şık"). Alında uç üç karede parlar, gösterge kırmızıya yükselir. Bulut gözüyle termometreye bakar, Kino şaşırır. |
| 2 | Serin bez | Kâseye daldırır, kâsenin üstünde aşağı çekerek sıkar | Su dört karede sıçrar, halkalar yayılır. Bez üç kademede burulur, damlalar akar. İyi sıkılmadan yüze gelirse burnuna damlar, Bulut kıkırdar. |
| 3 | Bezle serinletme | Bezi yüze bastırıp gezdirir | Kızarıklık geçilen yerden silinir. Bezden beş karelik buhar halkaları yükselir, alnın üstündeki sıcak dalgaları söner, ter damlaları kurur. Bulut'un yüzü sıcaktan serine döner. Bez alında kalır. |
| 4 | Su | Pipetli bardağı ağzına götürür ve tutar | Bulut pipetten üç karede içer, yutkunur. Bardağın suyu dört kademede azalır, kabarcıklar çıkar. |
| 5 | Buz torbası | Tepsideki küpleri torbaya tek tek atar, kapağı parmakla çevirir | Küpler tepside parıldar. Her küp "tık" diye düşer, torba beş kademede şişer, buz üç karede çıtırdar, torbadan soğuk buğu tüter. Kapak dönerek iner. |
| 6 | Torbayı başa koy | Torbayı tutup başına götürür | Bulut iki karede ürperir ("Brrr!"), sonra rahatlar. |
| 7 | Yelpaze | Yelpazeyi sağa sola sallar | Rüzgâr çizgileri üç karede akar. Yapış yapış yün üç kademede kabarır, Bulut gözlerini kapayıp keyiflenir. |
| 8 | Son ölçüm | Termometreyi alna tutar | Uç yeniden parlar, gösterge kırmızıdan yeşile iner. Masada Bulut torbayı şapka gibi takmış zıplar ve "Ferahladım!" diye kollarını açar. |

**Yanlış hamleler (komik, cezasız):**
- Sıkılmamış bez burna damlar.
- Buz küpü burna değer, Bulut ürperir.
- Pipet burna gelirse Bulut gıdıklanıp hapşırır gibi kıkırdar.

**Yaş:**
- 2–3: sallama yok, iki küp.
- 5+: dört küp; bez yarıda ısınır ve ikinci kez ıslatılır.

### Yakın plan ölçüleri (2048 × 1152; bütün yakın katmanlar aynı hizada)
- **Baş:** ekseni x 900; baş x 480…1320, y 120…900 (boynuzlar ve kulaklar dahil).
- **Yüz noktaları:**
  - Alın: merkezi (900, 290), yaklaşık x 650…1150, y 160…420.
  - Yanaklar: merkezleri (690, 610) ve (1110, 610), yarıçap 150.
  - Burun ucu: (900, 560).
  - Ağız: (900, 655).
  - Başın tepesi: (880, 150), iki boynuzun arası.
- **Kâse:** solda; çizim tuvali sahnede x 40…440, y 370…770; suyun yüzü kâse çiziminde (200, 150).
- **Buz tepsisi** (fonda, boş): x 1560…1960, y 120…460. Küplerin yeri: (1660, 220), (1860, 220), (1660, 370), (1860, 370).
- **Torbanın yeri:** x 1250…1570, y 450…770; burası fonda sade.

### Kare dizileri nasıl çizilir
- Bir dizinin bütün kareleri **aynı tuvalde, aynı hizada**. Değişmeyen parça piksel piksel aynı kalır; aynı çizimden türet.
- Kod kareleri sırayla gösterir: sıçrama ve buhar 70–90 ms, ürperme ve içme 120 ms.

### Sayfa 1 · Fon ve su (6) → `ates-fon`, `kase`, `damla`, `su-halkasi-0`, `su-halkasi-1`, `su-halkasi-2`
- **`ates-fon`** (2048 × 1152, opak): Y1 `yakin-fon` ile aynı oda; nane sedye yastığı, lila duvar. Sağ üstte boş buz tepsisi (yukarıdaki ölçüde). Kâsenin, torbanın ve başın yeri sade.
- **`kase`** (400 × 400): yandan hafif yukarıdan nane rengi kâse, içi su dolu.
  - **Suyun yüzü elips, merkezi (200, 150)**, eni yaklaşık 300.
  - Kâse gövdesi y 150…380.
- **`damla`** (60 × 80): tek su damlası; açık mavi, ince koyu kontur, küçük parıltı.
- **`su-halkasi-0…2`** (300 × 100): suyun yüzünde yayılan elips halka, üç kare. 0 küçük ve parlak; 2 geniş, ince ve soluk. Merkez hep (150, 50).

### Sayfa 2 · Sıçrama dizisi (4) → `sicrama-0`, `sicrama-1`, `sicrama-2`, `sicrama-3`
- 300 × 300; tabanın ortası (150, 280) suyun yüzüne oturur.
- Bez suya girince su taçlanıp sıçrar:
  - 0: küçük taç.
  - 1: yüksek taç ve iki damla.
  - 2: damlalar havada dağılmış.
  - 3: suya dönen son damlalar ve küçük halka.

### Sayfa 3 · Bulut'un başı, ifadeler I (8, şeffaf, her biri 2048 × 1152, aynı hiza) → `bulut-yakin-sicak`, `bulut-yakin-kirp`, `bulut-yakin-bakis`, `bulut-yakin-sasir`, `bulut-yakin-kikir`, `bulut-yakin-serin`, `bulut-yakin-keyif`, `bulut-yakin-gulen`
- Önden; baş ve omuzlar, sedyede hafif geriye yaslanmış.
- **Bütün başlarda boynuzlar, kulaklar, baş tepesi, yünün yeri ve gözlerin yeri piksel piksel aynı** (aynı çizimden türet). Yalnız gözler, kaşlar ve ağız değişir.
- Yanaklar normal açık pembe: kızarıklık ve ter ayrı katmandır. Yün bu başlarda **yapış yapış, yassı** çizilir (kabaran yün ayrı katman).

İfadeler:
- `sicak`: gözler yarı kapalı ve yorgun, ağız küçük ve dalgalı.
- `kirp`: `sicak` ile aynı, gözler tam kapalı.
- `bakis`: gözler yukarı, alnındaki termometreye bakıyor; kaşlar meraklı.
- `sasir`: gözler kocaman, ağız küçük "o".
- `kikir`: gözler gülerek kısık (yay), ağız açık kıkırdıyor.
- `serin`: gözler kapalı, rahat gülümseme ("ooh").
- `keyif`: gözler kapalı, başı hafif yana, mutlu gülümseme; rüzgâr yüzünü okşuyor.
- `gulen`: gözler açık ve parlak, kocaman gülüş.

### Sayfa 4 · Bulut'un başı, ifadeler II ve katmanlar (8) → `bulut-yakin-urper-0`, `bulut-yakin-urper-1`, `bulut-yakin-ic-0`, `bulut-yakin-ic-1`, `bulut-yakin-ic-2`, `bulut-yakin-yutkun`, `yanak-kizariklik`, `ter`
Hepsi 2048 × 1152, sayfa 3 ile aynı hiza.

- **`urper-0`, `urper-1`:** buz başa değince ürperme.
  - 0: omuzlar yukarı, gözler sımsıkı, dişler takırdar.
  - 1: aynı, baş ve omuzlar 8 px sağa kaymış, yün diken diken.
- **`ic-0…2`:** pipetten içme. Dudaklar ağızda (900, 655).
  - 0: dudaklar pipete uzanmış.
  - 1: yanaklar içe çekilmiş.
  - 2: gözler keyifle kapalı.
- **`yutkun`:** ağız kapalı, boğazda küçük yutkunma çizgisi, gözler mutlu.
- **`yanak-kizariklik`:** yalnız iki yanakta kıpkırmızı, yuvarlak kızarıklık, yukarıdaki iki dairenin içinde. Kontursuz, düz renk, kenarı yumuşak; baş çizilmez.
- **`ter`:** yalnız alında ve şakaklarda 5–6 küçük ter damlası (açık mavi, ince kontur); baş çizilmez.

### Sayfa 5 · Yün kabarması (3) → `yun-1`, `yun-2`, `yun-3`
- 2048 × 1152, aynı hiza. **Yalnız başın üstündeki ve yanaklarındaki yün;** yassı yünün üstüne biner.
- Kademeler:
  - 1: hafif kabarık.
  - 2: kabarık bulut gibi.
  - 3: kocaman, pofuduk, birkaç küçük parıltı.
- Boynuzlar ve kulaklar üstte görünür kalır.

### Sayfa 6 · Masadaki Bulut (6, şeffaf, tuval 1000 × 940) → `bulut-uzgun-0`, `bulut-uzgun-1`, `bulut-uzgun-kirp`, `bulut-sevinc-0`, `bulut-sevinc-1`, `bulut-ferah`
Y1'deki Zıpzıp pozlarının eşi: sedyenin üstünde, önden, oturuyor, boydan.
- Gövde x 260…860, y 60…860; **baş merkezi (560, 300), alın (560, 230), göğüs (560, 520).**

Pozlar:
- `uzgun-0`: yanaklar kıpkırmızı, gözler yarı kapalı, bir patisi alnında, yün yapış yapış, başının üstünde iki üç sıcak dalga çizgisi.
- `uzgun-1`: aynı; baş hafif yana düşmüş, kulaklar düşük.
- `uzgun-kirp`: `uzgun-0` ile aynı, gözler kapalı.
- Üç `uzgun` pozunda gövde aynı yerde.
- `sevinc-0`, `sevinc-1`:
  - Başında şapka gibi buz torbası (`torba-kapali`), yün pofuduk, yanaklar normal, kocaman gülüş.
  - İki kolu havada zıplıyor; 0'da sol pati yukarıda, 1'de sağ.
- `ferah`: aynı şapka ve yün; kollar iki yana açık, gözler kapalı, derin nefes, mutlu.

### Sayfa 7 · Termometre (8) → `termometre`, `termometre-salla-0`, `termometre-salla-1`, `gosterge-kirmizi`, `gosterge-yesil`, `termometre-isik-0`, `termometre-isik-1`, `termometre-isik-2`
**`termometre`** (600 × 600):
- Dik duran alın termometresi; yuvarlak algılayıcı başı üstte, **ucu (300, 60).**
- Gövdede dikey, hap biçimli boş gösterge penceresi: **x 272…328, y 190…430**, açık krem.
- Sap altta, y 560'a iner. Rakam ve yazı yok.

**`termometre-salla-0`, `-salla-1`** (600 × 600):
- Aynı termometre, sapın altındaki (300, 540) noktası çevresinde −12° ve +12° yatık.
- Gövdenin iki yanında iki üç kısa hareket çizgisi; penceredeki gösterge bulanık.

**`gosterge-kirmizi`, `gosterge-yesil`** (56 × 240):
- Pencereyi tümüyle dolduran düz kırmızı ve düz yeşil dolgu, üst ucu yuvarlak.
- Kod alttan yukarı kırparak doldurur.

**`termometre-isik-0…2`** (200 × 200):
- Algılayıcı başın üstüne binen ışık, merkezi (100, 100). Kod termometrenin ucuna ortalar.
- Kareler:
  - 0: küçük sıcak sarı nokta.
  - 1: daha büyük parıltı ve dört kısa ışın.
  - 2: en parlak an, yumuşak hale.

### Sayfa 8 · Bez (6) → `bez-kuru`, `bez-islak`, `bez-buruk-0`, `bez-buruk-1`, `bez-buruk-2`, `bez-alinda`
**`bez-kuru`, `bez-islak`** (600 × 600):
- Katlanmış açık nane rengi havlu bez. Gövde x 110…490, y 170…540.
- **Üst kenarın ortası (300, 180) tutulan yer, alt kenarın ortası (300, 540) damlanın aktığı yer.**
- `kuru`: kabarık ve açık renk.
- `islak`: aynı biçim; daha koyu nane, ıslak parıltı, alt kenarda iki asılı damla.

**`bez-buruk-0…2`** (600 × 600):
- Sıkılan bez, üç kademede burulur. Hepsinin üst ucu (300, 180), alt ucu (300, 540).
- 0: hafif kıvrık. 1: yarı burulmuş. 2: burgu gibi sıkı, alt ucundan damlalar sarkar.

**`bez-alinda`** (600 × 360): alnın üstüne yatırılmış, katlı ıslak bez, hafif eğri. Kod alnın merkezine (900, 300) ortalar.

### Sayfa 9 · Buhar ve sıcak (6) → `buhar-0`, `buhar-1`, `buhar-2`, `buhar-3`, `buhar-4`, `isi-dalgasi`
**`buhar-0…4`** (200 × 300):
- Bezden yükselen beyaz buhar halkası, beş kare. Tabanın ortası (100, 280) bezin üstüne oturur.
- 0: küçük, yoğun bir kıvrım. 4: büyük, ince, soluk bir halka, en üstte.
- İnce açık gri kontur.

**`isi-dalgasi`** (600 × 300):
- Alnın üstünde yükselen üç dalgalı sıcak çizgisi, açık turuncu, kontursuz.
- Kod başın tepesine koyar ve yavaşça kıpırdatır. Bez alnı serinletince söner.

### Sayfa 10 · Buz I (8) → `buz-0`, `buz-1`, `buz-2`, `buz-parilti-0`, `buz-parilti-1`, `torba-0`, `torba-1`, `torba-2`
**`buz-0…2`** (200 × 200):
- Üç ayrı buz küpü, ortada yaklaşık 150 px.
- Açık mavi, köşeleri yuvarlak, düz renk ve iki parıltı çizgisi. Biçimleri hafif farklı.

**`buz-parilti-0`, `-1`** (200 × 200): küpün üstünde dönen küçük beyaz yıldız parıltısı, iki kare.

**`torba-0…2`** (400 × 400):
- Klasik yuvarlak mavi buz torbası, önden. **Ağız üstte ortada, ağız halkasının merkezi (200, 70).**
- Kademeler:
  - 0: boş ve yassı, buruşuk.
  - 1: dibinde bir küp.
  - 2: yarıya kadar dolu, küplerin köşeleri kabarık.
- Ağız hep açık. Her kademenin silueti öncekinin silüetini örter.

### Sayfa 11 · Buz II (8) → `torba-3`, `torba-4`, `torba-kapali`, `kapak`, `citirti-0`, `citirti-1`, `citirti-2`, `soguk-0`
- **`torba-3`, `torba-4`** (400 × 400): dörtte üç dolu ve tam dolu, şişkin; ağız açık.
- **`torba-kapali`** (400 × 400): `torba-4` ile aynı. Ağızda `kapak` vidalı, üstten hafif eğik görülür. Yüzeyde ince buğu.
- **`kapak`** (200 × 200):
  - Üstten hafif eğik görülen yuvarlak vidalı kapak, ortada yaklaşık 160 px.
  - Üstünde ortadan dışa altı kabartma çizgi: kod döndürünce dönüşü belli olsun.
- **`citirti-0…2`** (300 × 300): buz çıtırtısı; torbanın yüzünde açılan beyaz-mavi buz kristali yıldızları, üç kare. 0 küçük, 2 en açık, sonra kod söndürür.
- **`soguk-0`** (300 × 300): torbadan yükselen soğuk buğu kıvrımı, ilk kare (küçük).

### Sayfa 12 · Soğuk buğu ve bardak (8) → `soguk-1`, `soguk-2`, `bardak-0`, `bardak-1`, `bardak-2`, `bardak-3`, `kabarcik-0`, `kabarcik-1`
**`soguk-1`, `soguk-2`** (300 × 300): buğunun büyüyen ve incelen kareleri; açık mavi-beyaz, ince kontur.

**`bardak-0…3`** (600 × 600):
- Şeffaf-mavi plastik bardak, dik; içinde su ve eğik bir çizgili pipet.
- **Pipetin ucu (190, 60)**; bardağın ağzı y 200, tabanı y 540, ekseni x 300.
- Su kademeleri: 0 dolu, 1 dörtte üç, 2 yarım, 3 neredeyse boş. Bardak ve pipet dört karede piksel piksel aynı.

**`kabarcik-0`, `-1`** (160 × 240): pipetin dibinden yükselen küçük kabarcıklar, iki kare. Kod bardağın içinde gösterir.

### Sayfa 13 · Yelpaze (6) → `yelpaze-kapali`, `yelpaze-acik`, `yelpaze-egik`, `ruzgar-0`, `ruzgar-1`, `ruzgar-2`
**`yelpaze-kapali`, `-acik`, `-egik`** (600 × 600):
- Çizgili pastel kâğıt yelpaze (nane-sarı-pembe dilimler), tahta sapı.
- **Sapın ucu (300, 560) tutulan yer; açık yelpazenin ortası (300, 240).**
- `kapali`: dilimler toplu. `acik`: yarım daire açık. `egik`: açık, sapın ucu çevresinde 15° yatık ve hafif bükülmüş (sallanırken).

**`ruzgar-0…2`** (400 × 300):
- Sağdan sola akan üç dört kıvrık rüzgâr çizgisi, açık mavi-beyaz.
- Üç kare, çizgiler sola doğru ilerler. Kod yelpazenin önünde, yüze doğru gösterir.

**Sayı:** 6 + 4 + 8 + 8 + 3 + 6 + 8 + 6 + 6 + 8 + 8 + 8 + 6 = **85 çizim**, on üç sayfa.

---

## Paket Doktor-Y4 · "Mila'nın Boya Lekeleri" → `assets/doktor/boya/` (83 çizim)

**Barış'ın temel kuralı (madde 0):** her adımda çocuğun parmağı gerçek bir iş yapar, ekranda gerçek bir animasyon olur, Mila ve Kino tepki verir. Her hareketin kendi kareleri vardır.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Köpürt | Sabun kalıbını kovanın kenarındaki süngerin üstünde ileri geri sürter | Süngerde köpük iki kademede kabarır, kabarcıklar uçuşur, sabun köpüklenir. |
| 2 | Ov | Süngeri lekelerin üstünde gezdirir | Leke geçilen yerden silinir, köpük lekenin rengini alır. Sünger iki kademede kirlenir, Mila gıdıklanıp gözlerini sıkar. |
| 3 | Çalkala | Kirli süngeri kovada sağa sola sallar | Su üç karede dalgalanır ve sıçrar, üç kademede renklenir; sünger temizlenir. 2 ile 3 lekeler bitene dek gidip gelir. |
| 4 | Benekler | Pamuklu çubuğu beneklerin üstüne nokta nokta değdirir | Her benek iki karede "pıt" diye kalkar, çubuğun ucu boyanır. |
| 5 | Püskürt | Sprey şişesini köpüklü yerlere tutar | Her "pıs"ta tetik basılır, sis üç karede açılır, köpük söner. Damlalar yüzden üç karede süzülür, tüy ıslanır. Mila "Iyy!" diye gözlerini kırpıştırır. |
| 6 | Kurula | Havluyu yüzde ve patilerde gezdirir | Havlu iki karede buruşarak ovar, ıslanır; damlalar emilir. Kuruyan tüy iki karede "pof" diye kabarır. |
| 7 | Baloncuklar | Kovadan yükselen sabun baloncuklarına dokunur | Her baloncuk üç karede patlar. Mila patileriyle o da patlatmaya uzanır (iki kare), kıkırdar. |
| 8 | Ayna | El aynasını Mila'nın yüzüne tutar | Ayna üç karede parıldar, Mila kendini görür ve poz verir, kalpler yükselir. Masada zıplar; sonunda patisini yine boya kabına sokar, Kino "Mila, Mila! Yine mi boya?" der. |

**Yanlış hamle (komik, cezasız):** kirli sünger yüzden ayrılıp yeniden yüzde ovulursa renkler karışır, burnu mor olur. Mila şaşı bakıp kıkırdar; mor burun da temizlenir.

**Yaş:** 2–3'te iki renk, çubuk adımı yok ve üç baloncuk. 4'te dört renk ve beş baloncuk. 5+'ta dört renk ve yedi baloncuk.

**Mila modeli:** `ekip/film/kino-bir-iki-uc-gum/cizim/Mila-Tek-Poz-Onizleme.png`. Turuncu kedi yavrusu; sol kulağında doğal mor leke, nane rengi kalp tokası, sarı tulum, şeftali cebi. **Kulaktaki mor leke modelin kendisidir, boya değildir.** Boya lekeleri kalın, parlak parmak boyası; ince koyu konturlu, turuncu tüyde de seçilir.

### Yakın plan ölçüleri (2048 × 1152; bütün yakın katmanlar aynı hizada)
- **Baş:** ekseni x 880; baş x 500…1260, y 100…780 (kulaklar dahil).
- **Patiler:** alt ortada x 620…1140, y 700…920, avuçlar bize dönük.
- **Lekeler** (`lekeler` çiziminde, her biri kendi dairesinin içinde; daireler birbirine değmez):
  - Mavi yanak: merkezi (1090, 500) yarıçap 110.
  - Sarı alın: (880, 230) yarıçap 110.
  - Yeşil sol pati: (760, 820) yarıçap 100.
  - Mor sağ pati: (1000, 820) yarıçap 100.
- **Burun** (880, 450): mor burun yalnız yanlış hamlede, yarıçap 70 içinde.
- **Benekler** (kod `benek-…` çizimlerini koyar):
  - Burnun çevresi: (840, 440), (920, 455), (880, 500).
  - Sol kulağın arkası: (600, 230), (640, 280), (575, 340).
  - Bu yerler sade; kulağın içi değil, dışı.
- **Kova** solda: çizim tuvali sahnede x 40…460, y 400…820; **suyun yüzü kova çiziminde (210, 130).** Sabunlanacak sünger kovanın kenarında, (250, 380) çevresinde durur.
- **Boya kapları** fonda, sağ üstte x 1560…1960, y 140…460 (üç kap: mavi, sarı, yeşil).

### Kare dizileri nasıl çizilir
- Bir dizinin kareleri **aynı tuvalde, aynı hizada**; değişmeyen parça piksel piksel aynı (aynı çizimden türet).
- Kod kareleri sırayla gösterir: patlama ve sıçrama 70–90 ms, poz kareleri 120–160 ms.

### Sayfa 1 · Fon ve kova (6) → `boya-fon`, `kova`, `kova-su-1`, `kova-su-2`, `kova-su-3`, `damla`
- **`boya-fon`** (2048 × 1152, opak):
  - Y1 `yakin-fon` ile aynı oda: nane sedye yastığı, lila duvar.
  - Sağ üstte üç parmak boyası kabı (yukarıdaki ölçüde).
  - Kova ve Mila'nın geleceği yer sade.
- **`kova`** (420 × 420): küçük açık mavi kova, yandan hafif yukarıdan, içi berrak su. **Suyun yüzü elips, merkezi (210, 130)**, eni yaklaşık 320.
- **`kova-su-1…3`** (420 × 420): `kova` ile aynı hizada **yalnız suyun yüzü.**
  - 1 hafif bulanık mavi. 2 mavi-yeşil. 3 mavi-yeşil-mor karışık koyu.
  - Kod yıkadıkça sırayla gösterir.
- **`damla`** (60 × 80): tek su damlası; açık mavi, ince koyu kontur.

### Sayfa 2 · Kovada su (6) → `kova-dalga-0`, `kova-dalga-1`, `kova-dalga-2`, `kova-sicrama-0`, `kova-sicrama-1`, `kova-sicrama-2`
- **`kova-dalga-0…2`** (420 × 420, `kova` ile aynı hiza): suyun yüzünde sağa sola giden dalga, üç kare.
- **`kova-sicrama-0…2`** (300 × 300): sünger sallanınca kovanın kenarından taşan sıçrama, üç kare. Tabanın ortası (150, 280) suyun yüzüne oturur.

### Sayfa 3 · Mila'nın yakın pozları I (8, şeffaf, her biri 2048 × 1152, aynı hiza) → `mila-yakin-kikir`, `mila-yakin-kirp`, `mila-yakin-sikik`, `mila-yakin-saskin`, `mila-yakin-gulen`, `mila-yakin-gidik`, `mila-yakin-bakis`, `mila-yakin-ayna`
- Önden; baş, omuzlar ve iki pati (avuçlar bize dönük), sedyede oturuyor.
- **Bütün pozlarda kulaklar, toka, baş, omuzlar ve patiler piksel piksel aynı** (aynı çizimden türet); yalnız gözler, kaşlar ve ağız değişir.
- **Hiçbir pozda boya yok:** lekeler ayrı katmandır.

Pozlar:
- `kikir`: gözler gülerek kısık, ağız açık kıkırdıyor (bekleme hâli).
- `kirp`: `kikir` ile aynı, gözler kapalı.
- `sikik`: gözler sımsıkı kapalı, burun kırışık, dudaklar büzük (sünger ve havlu yüzdeyken).
- `saskin`: gözler kocaman, ağız küçük "o".
- `gulen`: tertemiz, parlak gözler, kocaman gülüş.
- `gidik`: gözler kapalı, kahkaha; köpük gıdıklıyor.
- `bakis`: gözler kocaman ve parlak, aynaya bakıyor, ağız şaşkın-mutlu.
- `ayna`: çenesi hafif yukarıda, bir göz kırpık, kendini beğenmiş gülüş.

### Sayfa 4 · Mila'nın yakın pozları II ve katmanlar (8) → `mila-yakin-iyy`, `mila-yakin-pati-0`, `mila-yakin-pati-1`, `mila-yakin-mor`, `lekeler`, `burun-mor`, `islak`, `tuy-kabarik`
Hepsi 2048 × 1152, sayfa 3 ile aynı hiza.

- **`iyy`:** sprey serin gelince gözler kırpıştırılmış, ağız "iyy" (dişler görünür), omuzlar hafif yukarı.
- **`pati-0`, `pati-1`:** baloncuk patlatma. **Bu iki pozda patiler başka yerde:**
  - 0: sol pati yukarıda, x 620…800, y 300…520.
  - 1: sağ pati yukarıda, x 960…1140, y 300…520.
  - Gözler yukarı bakar, ağız gülüyor.
- **`mor`:** burnuna şaşı bakıyor, kıkırdıyor (yanlış hamle).
- **`lekeler`:** dört parmak boyası lekesi, yukarıdaki dairelerin içinde; düz renk ve ince kontur. Mila çizilmez.
- **`burun-mor`:** yalnız burnun üstünde mor-kahve karışık boya, (880, 450) yarıçap 70 içinde.
- **`islak`:** ıslak tüy. Yüzde ve patilerde koyulaşmış, birbirine yapışmış tüy tutamları ve birkaç parıltı; Mila'nın kendisi çizilmez.
- **`tuy-kabarik`:** kuruyunca kabaran tüy. Başın ve yanakların kenarında pofuduk tüy tutamları ve iki üç küçük parıltı.

### Sayfa 5 · Masadaki Mila (7, şeffaf, tuval 1000 × 940) → `mila-boyali-0`, `mila-boyali-1`, `mila-boyali-kirp`, `mila-sevinc-0`, `mila-sevinc-1`, `mila-saka`, `mila-saka-kikir`
Y1'deki Zıpzıp pozlarının eşi: sedyenin üstünde, önden, oturuyor, boydan.
- Gövde x 260…860, y 60…860; **baş merkezi (560, 300), yüz (560, 330), göğüs (560, 540).**

Pozlar:
- `boyali-0`: yüzü ve patileri renk renk boyalı (yanakta mavi, alında sarı, patilerde yeşil ve mor), kıkırdıyor, patilerini bize gösteriyor.
- `boyali-1`: aynı; baş hafif eğik, kuyruk sallanmış.
- `boyali-kirp`: `boyali-0` ile aynı, gözler kapalı.
- Üç `boyali` pozunda gövde aynı yerde.
- `sevinc-0`, `sevinc-1`: tertemiz, pofuduk; kocaman gülüş, iki kolu havada zıplıyor (0'da sol pati yukarıda, 1'de sağ).
- `saka`: tertemiz, sinsi-tatlı gülüş; bir patisi yanındaki küçük boya kabına dalmış, pati ucu pembe boyalı.
- `saka-kikir`: aynı; gözler kısık, kıkırdıyor, pati kabın içinde.

### Sayfa 6 · Sabun ve sünger (8) → `sabun`, `sabun-kopuklu`, `sunger`, `sunger-kopuk-1`, `sunger-kopuk-2`, `sunger-kirli-1`, `sunger-kirli-2`, `sunger-sikis`
- **`sabun`, `sabun-kopuklu`** (600 × 600):
  - Pembe, yuvarlak köşeli sabun kalıbı, üstte kabartma kalp.
  - Gövde x 160…440, y 220…400; **ortası (300, 310) tutulan yer ve sürtünen yüz.**
  - `kopuklu`: aynı kalıp, kenarları köpüklü, iki kabarcık.
- **`sunger`** (600 × 600):
  - Sarı banyo süngeri, kuru. Gövde x 150…450, y 190…410; **ortası (300, 300).**
  - Kovanın kenarında yatar, sonra elde tutulur.
- **`sunger-kopuk-1`, `-2`:** aynı sünger; üstünde beyaz köpük. 1 biraz, 2 kabarık ve taşan.
- **`sunger-kirli-1`, `-2`:** köpüklü sünger, boya bulaşmış. 1 birkaç renk lekesi; 2 mavi-sarı-yeşil-mor karışık, köpük grimsi.
- **`sunger-sikis`:** kovada sallanırken sıkışmış, ortadan büzülmüş sünger; damlalar sıçrıyor.

### Sayfa 7 · Köpük (8) → `kopuk-beyaz`, `kopuk-sari`, `kopuk-mavi`, `kopuk-yesil`, `kopuk-mor`, `kopuk-pof-0`, `kopuk-pof-1`, `kopuk-pof-2`
- **`kopuk-…`** (her biri 300 × 300): Y1 `kopuk` ile aynı biçimde köpük öbeği, ortada yaklaşık 220 px. Sırasıyla:
  - beyaz;
  - açık sarı;
  - açık mavi;
  - açık yeşil;
  - açık mor.
  - Hepsi pastel, beyaz parıltılı.
- **`kopuk-pof-0…2`** (300 × 300): sprey değince sönen köpük öbeği, üç kare. 0 köpük kabarır, 1 kabarcıklar dağılır, 2 son küçük kabarcıklar.

### Sayfa 8 · Sabun baloncukları (6) → `baloncuk-0`, `baloncuk-1`, `baloncuk-patla-0`, `baloncuk-patla-1`, `baloncuk-patla-2`, `baloncuk-ucan`
- **`baloncuk-0`, `-1`** (240 × 240): iri, şeffaf, gökkuşağı yansımalı sabun baloncuğu, ince kontur. 1'de yansıma kaymış (süzülürken kod sırayla gösterir).
- **`baloncuk-patla-0…2`** (240 × 240): patlama. 0 baloncuk çatlar, 1 halka ve damlacıklar, 2 son ışıltı.
- **`baloncuk-ucan`** (300 × 300): köpürtürken uçuşan küçük baloncuk kümesi.

### Sayfa 9 · Çubuk ve benekler (6) → `cubuk`, `cubuk-boyali`, `benek-turuncu`, `benek-mavi`, `benek-pit-0`, `benek-pit-1`
- **`cubuk`, `cubuk-boyali`** (600 × 600):
  - Dik duran pamuklu çubuk, ince açık mavi sap. **Üst pamuk ucu (300, 60)**, alt uç y 560.
  - `boyali`: aynı; pamuk ucu turuncu-mavi boyalı.
- **`benek-turuncu`, `benek-mavi`** (90 × 90): küçük parmak boyası beneği, ortada yaklaşık 60 px, ince kontur. Turuncu burnun çevresinde, mavi kulak arkasında.
- **`benek-pit-0`, `-1`** (120 × 120): çubuk değince beneğin kalktığı an, iki kare. 0 küçük beyaz "pıt" yıldızı, 1 sönen halka.

### Sayfa 10 · Sprey ve damlalar (8) → `sprey-sise`, `sprey-sise-basili`, `sis-0`, `sis-1`, `sis-2`, `damla-suzul-0`, `damla-suzul-1`, `damla-suzul-2`
- **`sprey-sise`, `sprey-sise-basili`** (600 × 600; Y1'deki köpük spreyinden ayrı yeni çizim):
  - Şeffaf-mavi su sprey şişesi, tetikli başlık. **Meme sola bakar, ucu (130, 140).**
  - `basili`: tetik içeri basılı, memede minik parıltı.
- **`sis-0…2`** (300 × 300): memeden açılan sis bulutu. 0 dar huni, 1 geniş bulut, 2 dağılan ince damlalar. İnce kontur.
- **`damla-suzul-0…2`** (80 × 200): yüzden aşağı süzülen damla. 0 yuvarlak damla üstte, 1 uzamış ve ortada, 2 altta ve arkasında ince ıslak iz.

### Sayfa 11 · Havlu ve kabaran tüy (6) → `havlu-kuru`, `havlu-islak`, `havlu-ovus-0`, `havlu-ovus-1`, `tuy-pof-0`, `tuy-pof-1`
- **`havlu-kuru`, `havlu-islak`** (600 × 600):
  - Katlanmış yumuşak pembe havlu, gövde x 120…480, y 160…520. **Üst kenarın ortası (300, 180) tutulan yer.**
  - `islak`: aynı biçim, daha koyu, ıslak parıltı.
- **`havlu-ovus-0`, `-1`** (600 × 600): ovarken buruşan havlu, iki kare; aynı tutma yeri.
- **`tuy-pof-0`, `-1`** (240 × 240): kuruyan tüyden çıkan küçük "pof": tüy tutamı ve iki parıltı, iki kare.

### Sayfa 12 · Ayna (6) → `ayna`, `ayna-parilti-0`, `ayna-parilti-1`, `ayna-parilti-2`, `kalp-0`, `kalp-1`
- **`ayna`** (600 × 600):
  - Yuvarlak pembe çerçeveli el aynası, tahta sapı aşağıda.
  - **Sapın ucu (300, 560) tutulan yer; camın ortası (300, 220).**
  - Camda yalnız açık mavi yansıma ve iki parlak çizgi; içinde yüz yok.
- **`ayna-parilti-0…2`** (300 × 300): camın üstünde dönen ışıltı, üç kare; kod camın ortasına koyar.
- **`kalp-0`, `-1`** (160 × 160): Mila kendini görünce yükselen küçük pembe kalp, iki kare (0 küçük, 1 büyük ve parıltılı).

**Sayı:** 6 + 6 + 8 + 8 + 7 + 8 + 8 + 6 + 6 + 8 + 6 + 6 = **83 çizim**, on iki sayfa.
