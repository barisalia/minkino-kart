# Minik Doktor · Y5 ve Y6 parça brief'leri (anahtar kare onaylanınca Astra'ya gider)

Claude (İngilizce yan oturumu → Minik Doktor), 23 Kasım 2026 gecesi. Barış'ın temel kuralına göre yazıldı (KALITE-KURALLARI madde 0): ucuza kaçma, her hareketin kendi kareleri. Kod hazır, çizim bekliyor:
- `doktor/src/vaka-hapsu/`: `doktor/index.html?oyun=hapsu`.
- `doktor/src/vaka-kanat/`: `doktor/index.html?oyun=kanat`.

Adlar, ölçüler ve kare dizileri kodla birebir. Birim testleri (`tests/unit/doktor-hapsu.test.ts`, `doktor-kanat.test.ts`) bu dosyayı okuyup karşılaştırır.

Anahtar kareler `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 23:55 kaydında (Doktor-Y5 `anahtar-hapsu`, Doktor-Y6 `anahtar-kanat`). Yerleşimleri aynen geçerli; senaryo büyüdüğü için kanala bir ek yazıldı (23 Kasım). Sıra: Doktor-Y4'ten sonra. Sayfa başına en çok 8 çizim.

**Ortak:**
- **Stil:** onaylı `anahtar-hub` ve Y1 yakın planı. İnce koyu kontur, düz yumuşak renk, sıcak pastel, tek yumuşak gölge, doku yok.
- **Yasaklar:** insan figürü, çilek, kan, iğne, hap, makas, yazı ve rakam yok; aletlerde yüz yok. Kulağın ve gözün içine alet girmez.
- **Y1'den aynen kullanılanlar** (yeniden çizilmez): `hub-fon`, `canta-kapali`, `canta-acik`, `serit`, `pof-0`, `pof-1`, `yildiz`, Kino'nun dört pozu.
- **Hiza:** yakın planın bütün katmanları 2048 × 1152 tuvalde, aynı hizada.
- **Sakin alanlar:**
  - alt kenar x 20…1520, y 940…1140 (alet şeridi);
  - sağ alt köşe x ≥ 1480, y ≥ 800 (Kino).
- **Kare dizileri:** bir dizinin kareleri aynı tuvalde, aynı hizada; değişmeyen parça piksel piksel aynı (aynı çizimden türet).
- **Masadaki hasta:** Y1'deki Zıpzıp pozlarının eşi. Sedyede, önden, boydan; tuval 1000 × 940, gövde x 260…860, y 60…860.
- **Kaynaklar:** `ekip/doktor/<y5|y6>/kaynak/` içine bu adlarla (`.png`); tuvale oturtma ve webp bizde.

---

## Paket Doktor-Y5 · "Pamuk'un Hapşırığı" → `assets/doktor/hapsu/` (81 çizim)

**Pamuk modeli:** `assets/dedektif-yeni/pamuk-onden.webp`. Beyaz, pofuduk kedi yavrusu; mavi gözler, pembe burun, boynunda pembe fiyonk. Bu vakada burnu kıpkırmızı-pembe ve gözleri sulu.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Mendil | Kutunun ağzından mendili yukarı çeker | Mendil üç karede uzar, "cırt" diye kopar, ele geçer. |
| 2 | Hapşırık | Mendili Pamuk'un burnunun önünde tutar, hapşırığı bekler | Pamuk'un burnu kaşınır (iki kare), "hap… hap…" (iki kare), HAPŞU. Mendil yakalarsa üç karede şişer, uçup gider. Kaçarsa hapşırık rüzgârı (üç kare) pamukları ve mendilleri uçurur, Pamuk kıkırdar. Her yakalamada yeni mendil çekilir. |
| 3 | Sil | Mendili burnun üstünde gezdirir | Mendil buruşur; burnun pembesi azalır. |
| 4 | Dök | Raftaki demliği kâsenin üstüne getirip parmağı aşağı indirerek eğer | Demlik eğilir (iki kare), su üç karede akar ve sıçrar (üç kare). Kâse dört kademede dolar, buhar yükselir (dört kare). |
| 5 | Serpiştir | Papatya kavanozunu kâsenin üstünde yukarı aşağı sallar | Kavanoz sallanır (iki kare). Papatyalar tutam tutam düşer, suda üç kademede birikir; koku kıvrımları yükselir (iki kare). |
| 6 | Nefes | Buhara bastırıp tutar, sonra bırakır | Tutarken Pamuk nefes alır, buhar burnuna akar (iki kare). Bırakınca nefes verir, ağzından "puf" çıkar. Burnun pembesi ve gözyaşı her nefeste azalır. Çok uzun tutarsa yanakları şişer, komik bir "pöf". |
| 7 | Atkı | Atkıyı boynunun önünde bir yandan öbür yana geçirir | Atkı havada açılır, üç kademede boynuna sarılır. |
| 8 | Battaniye | Battaniyeyi aşağıdan göğsüne kadar çeker | Battaniye örtülür, kenarı kıvrılır (iki kare). Pamuk esner, mırlar, kalpler yükselir (iki kare). Masada derin nefes alır, hapşıracak gibi olur… ve mırıldar. |

**Yaş:**
- 2–3: bir hapşırık, geniş zaman penceresi, az eğimle dökme, iki nefes.
- 5+: üç hapşırık ve dar pencere; altı sallamada papatya.

### Yakın plan ölçüleri (2048 × 1152)
- **Baş:** ekseni x 860; baş x 500…1220, y 110…760. Göğüsten yukarısı.
- **Yüz noktaları:**
  - Burun ucu (860, 470); ağız (860, 540).
  - Boynun önü x 640…1080, y 640…760.
  - Göğüs x 560…1160, y 760'tan aşağısı; battaniye buraya kadar çıkar.
- **Mendil kutusu** solda: çizim tuvali x 60…420, y 400…760; kutunun ağzı sahnede (240, 480).
- **Kâse** önde ortada: çizim tuvali x 600…1120, y 660…960; **suyun yüzü kâse çiziminde (260, 100)**, sahnede (860, 760).
- **Raf** fonda, sağ üstte x 1560…1960, y 140…480. Fonda **boş raf**; demliği ve kavanozu kod koyar. Demliğin yeri (1690, 330), kavanozun yeri (1880, 360).

### Sayfa 1 · Fon, kutu ve kâse (6) → `hapsu-fon`, `mendil-kutusu`, `kase-0`, `kase-1`, `kase-2`, `kase-3`
- **`hapsu-fon`** (2048 × 1152, opak):
  - Y1 `yakin-fon` ile aynı oda; nane sedye yastığı, lila duvar.
  - Sağ üstte boş tahta raf (yukarıdaki ölçüde).
  - Kutunun, kâsenin ve başın yeri sade.
- **`mendil-kutusu`** (360 × 360):
  - Açık mavi, puantiyeli mendil kutusu, yandan hafif yukarıdan.
  - **Üstteki ağzı (180, 80)**; ağızdan beyaz bir mendil ucu görünür.
- **`kase-0…3`** (520 × 300):
  - Krem rengi kâse, yandan hafif yukarıdan. **Suyun yüzü elips, merkezi (260, 100)**, eni yaklaşık 400.
  - 0 boş; 1, 2, 3 suyun yükselen kademeleri (sıcak su, hafif sarımsı).
  - Kâse dört karede piksel piksel aynı.

### Sayfa 2 · Pamuk'un başı, ifadeler I (8, şeffaf, her biri 2048 × 1152, aynı hiza) → `pamuk-yakin-uzgun`, `pamuk-yakin-kirp`, `pamuk-yakin-hap-0`, `pamuk-yakin-hap-1`, `pamuk-yakin-hapsu`, `pamuk-yakin-rahat`, `pamuk-yakin-sikik`, `pamuk-yakin-gulen`
- Önden, göğüsten yukarısı; patiler göğsünde.
- **Bütün pozlarda kulaklar, baş, fiyonk ve omuzlar piksel piksel aynı**; yalnız gözler, kaşlar, bıyıklar ve ağız değişir.
- **Burun normal pembe; gözyaşı yok** (ikisi ayrı katman).

İfadeler:
- `uzgun`: gözler sulu ve yarı kapalı, kaşlar düşük, ağız küçük.
- `kirp`: `uzgun` ile aynı, gözler kapalı.
- `hap-0`: burun kırışmış, gözler kısılmış ("hap…").
- `hap-1`: baş hafif geri, gözler kapalı, ağız açılıyor ("hap!").
- `hapsu`: gözler sımsıkı, ağız açık, bıyıklar savrulmuş; hapşırık anı.
- `rahat`: gözler kapalı, rahatlamış gülümseme.
- `sikik`: gözler sımsıkı, burun kırışık (mendil burnundayken).
- `gulen`: gözler kocaman ve parlak, kocaman gülüş.

### Sayfa 3 · Pamuk'un başı, ifadeler II (8, aynı hiza) → `pamuk-yakin-kasin-0`, `pamuk-yakin-kasin-1`, `pamuk-yakin-nefes-al`, `pamuk-yakin-nefes-ver`, `pamuk-yakin-sisik`, `pamuk-yakin-esne`, `pamuk-yakin-mirr`, `pamuk-yakin-kikir`
- `kasin-0`, `kasin-1`: burun kıpırdıyor; bıyıklar iki yana titriyor, iki kare.
- `nefes-al`: başı kâseye eğik, gözler kapalı, burun delikleri açık, göğüs kabarık.
- `nefes-ver`: aynı eğik baş, dudaklar büzük, nefesini veriyor.
- `sisik`: yanaklar balon gibi şişmiş, gözler kocaman (nefesi çok uzun tuttu).
- `esne`: ağız kocaman açık, esniyor, gözler kapalı.
- `mirr`: gözler kapalı, mutlu gülümseme, mırlıyor.
- `kikir`: gözler gülerek kısık, kıkırdıyor.

### Sayfa 4 · Katmanlar (6, şeffaf, 2048 × 1152 ya da yazılan boy) → `burun-pembe`, `gozyasi`, `battaniye-ortulu`, `atki-sarili-0`, `kalp-0`, `kalp-1`
- `burun-pembe`: yalnız burnun ve çevresinin kıpkırmızı-pembe hâli, (860, 470) çevresinde yarıçap 70. Kontursuz, kenarı yumuşak.
- `gozyasi`: iki gözün kenarında birer damla gözyaşı ve ıslak parıltı.
- `battaniye-ortulu`:
  - Göğsü örten pastel kareli battaniye, üst kenarı y 760, x 380…1340, aşağıya tuval sonuna kadar.
  - Kod aşağıdan yukarı açar.
- `atki-sarili-0`: boynun önüne gevşekçe düşmüş atkı (ilk kademe), boynun önünde x 640…1080.
- `kalp-0`, `kalp-1` (160 × 160): yükselen küçük pembe kalp, iki kare (0 küçük, 1 büyük ve parıltılı).

### Sayfa 5 · Masadaki Pamuk (7, tuval 1000 × 940) → `pamuk-uzgun-0`, `pamuk-uzgun-1`, `pamuk-uzgun-kirp`, `pamuk-sevinc-0`, `pamuk-sevinc-1`, `pamuk-son-hap`, `pamuk-son-mirr`
- **Ölçüler:** baş merkezi (560, 300), burun (560, 340), göğüs (560, 540).

Pozlar:
- `uzgun-0`: burnu kıpkırmızı, gözleri sulu, bir patisinde buruşuk mendil.
- `uzgun-1`: aynı; baş hafif yana, burnunu çekiyor.
- `uzgun-kirp`: `uzgun-0` ile aynı, gözler kapalı.
- `sevinc-0`, `sevinc-1`: burnu normal, boynunda atkı; iki kolu havada zıplıyor. 0'da sol pati yukarıda, 1'de sağ.
- `son-hap`: atkılı; derin nefes almış, gözler kısık, hapşıracak gibi ("hap…").
- `son-mirr`: aynı duruş; gözler kapalı, mutlu, mırıldıyor (hapşırmadı).

### Sayfa 6 · Mendil (8) → `mendil`, `mendil-cek-0`, `mendil-cek-1`, `mendil-cek-2`, `mendil-sisik`, `mendil-ucan-0`, `mendil-ucan-1`, `mendil-buruk`
- **`mendil`** (600 × 600): elde tutulan beyaz yumuşak mendil, köşesinden sarkıyor. **Tutulan yer (300, 120), ortası (300, 330).**
- **`mendil-cek-0…2`** (240 × 400):
  - Kutunun ağzından çekilen mendil. **Alt ortası (120, 390) kutunun ağzına oturur.**
  - 0 kısa; 1 uzamış; 2 iyice gerilmiş, kopma çizgisi belirgin.
- **`mendil-sisik`** (600 × 600): hapşırığı yakalayıp balon gibi şişmiş mendil; aynı tutma yeri.
- **`mendil-ucan-0`, `-1`** (400 × 400): uçup giden mendil, iki kare (savrulan, katlanan).
- **`mendil-buruk`** (600 × 600): burun silerken buruşmuş mendil; aynı tutma yeri.

### Sayfa 7 · Hapşırık (6) → `hapsu-ruzgar-0`, `hapsu-ruzgar-1`, `hapsu-ruzgar-2`, `ucan-pamuk-0`, `ucan-pamuk-1`, `ucan-mendil`
- **`hapsu-ruzgar-0…2`** (600 × 400): hapşırığın komik rüzgârı.
  - Burundan öne ve aşağı açılan kıvrık rüzgâr çizgileri ve birkaç küçük yıldız, üç kare (açılır, yayılır, söner).
  - Merkez burnun biraz altına gelir. Damla, sümük yok.
- **`ucan-pamuk-0`, `-1`** (200 × 200): savrulan küçük pamuk topu, iki kare.
- **`ucan-mendil`** (300 × 300): savrulan tek mendil.

### Sayfa 8 · Demlik ve su (8) → `demlik`, `demlik-egik`, `su-akis-0`, `su-akis-1`, `su-akis-2`, `sicrama-0`, `sicrama-1`, `sicrama-2`
- **`demlik`, `demlik-egik`** (600 × 600):
  - Nane-krem çiçekli küçük porselen demlik, yandan. **Kulp sağda, tutulan yer (450, 300); emzik solda, ucu (90, 230).**
  - `egik`: aynı demlik. Kapak hafif kalkmış, emzikten su başlamış, üstünde ince buhar. Kod ayrıca eğer.
- **`su-akis-0…2`** (120 × 400): emzikten akan ılık su sütunu, üç kare. **Üst ortası (60, 0) emziğe oturur.**
- **`sicrama-0…2`** (300 × 300): kâsenin suyuna düşen suyun sıçraması, üç kare. **Tabanın ortası (150, 280) suyun yüzüne oturur.**

### Sayfa 9 · Buhar (8) → `buhar-0`, `buhar-1`, `buhar-2`, `buhar-3`, `buhar-burun-0`, `buhar-burun-1`, `buhar-puf`, `koku-0`
- **`buhar-0…3`** (400 × 500): kâseden yükselen kıvrık beyaz buhar sütunu, dört kare. **Tabanın ortası (200, 490) suya oturur.** Kod sırayla oynatır.
- **`buhar-burun-0`, `-1`** (400 × 400): buharın burna doğru kıvrılan kolu, iki kare. Sol alttan sağ üste kıvrılır.
- **`buhar-puf`** (300 × 300): Pamuk'un nefes verirken ağzından çıkan küçük beyaz "puf".
- **`koku-0`** (300 × 300): papatya kokusunun ilk karesi; küçük sarı-beyaz kıvrım ve iki minik yaprak.

### Sayfa 10 · Papatya (8) → `koku-1`, `papatya-kavanoz`, `papatya-kavanoz-salla`, `papatya-0`, `papatya-1`, `papatya-2`, `papatya-yuzen-1`, `papatya-yuzen-2`
- **`koku-1`** (300 × 300): kokunun büyümüş, incelmiş ikinci karesi.
- **`papatya-kavanoz`** (600 × 600):
  - Cam kavanoz, içi kurutulmuş papatya dolu, kapağı açık.
  - **Ağzı üstte (300, 120); tutulan yer gövde (300, 420).**
- **`papatya-kavanoz-salla`** (600 × 600): sallanırken aynı kavanoz. Hafif yatık, ağzından iki papatya fırlıyor, iki kısa hareket çizgisi.
- **`papatya-0…2`** (120 × 120): tek papatya; üç farklı açı (önden, yandan, ters).
- **`papatya-yuzen-1`, `-2`** (520 × 300): `kase` ile aynı hizada, yalnız suyun yüzünde yüzen papatyalar. 1 üç papatya, 2 yedi papatya.

### Sayfa 11 · Atkı ve battaniye (8) → `papatya-yuzen-3`, `atki`, `atki-ucan`, `atki-sarili-1`, `atki-sarili-2`, `battaniye`, `battaniye-kivrim-0`, `battaniye-kivrim-1`
- **`papatya-yuzen-3`** (520 × 300): on iki papatya, suyun yüzü dolu.
- **`atki`, `atki-ucan`** (600 × 600):
  - Pembe-beyaz çizgili yün atkı, ortadan tutulur.
  - `atki`: katlı. `ucan`: havada açılmış, iki ucu dalgalı.
- **`atki-sarili-1`, `-2`** (2048 × 1152, yakın plan hizası): atkı boynun önüne sarılıyor.
  - 1 bir tur sarılmış.
  - 2 tam sarılmış, iki püsküllü ucu göğsüne sarkıyor.
  - Fiyonk atkının altında kalır.
- **`battaniye`** (600 × 600): katlanmış pastel kareli battaniye. **Üst kenarının ortası (300, 150) tutulan yer.**
- **`battaniye-kivrim-0`, `-1`** (600 × 200): örtülürken battaniyenin üst kenarının kıvrımı, iki kare (dalgalanan kenar).

**Sayı:** 6 + 8 + 8 + 6 + 7 + 8 + 6 + 8 + 8 + 8 + 8 = **81 çizim**, on bir sayfa.

---

## Paket Doktor-Y6 · "Polly'nin Karışık Kanadı" → `assets/doktor/kanat/` (81 çizim)

**Polly modeli:** `ekip/film/ortak-poz-arsivi/polly-agac-evi/polly-tunekte-sheet.png`.
- Turkuaz papağan; mercan-kırmızı kanatlar, sarı gaga ve ayaklar, krem göğüs.
- Safari şapkası, sırt çantası askıları ve boynunda dürbün.
- **Bu vakada şapkası başında değil, tepside durur** (sonda takılır).
- Polly kısa İngilizce sözlerle konuşur ve konuşurken gagası iki karede açılıp kapanır.

**Senaryo · sekiz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Kanadı aç | Kanadın ucunu tutup yavaşça açar | Kanat altı kademede açılır. Hızlı çekilirse Polly "Ouch!" der, kanat biraz geri kapanır. |
| 2 | Pıtrak | Pıtrağı tutup kanattan uzağa çeker, tepsiye bırakır | Pıtrak tüyleri iki karede gerer, "pıt" diye kopar (iki kare), tepsiye düşer. Başına bırakılırsa yapışır, Polly şaşı bakar ("Hey!"), sonra pıtrak kendiliğinden tepsiye düşer. |
| 3 | Tara | Tarağı tüylerde kökten uca (soldan sağa) gezdirir | Karışık tüyler geçilen yerden düzelir, şerit şerit parıltı akar (üç kare). Ters taranırsa tüy kabarır (iki kare), Polly gıdıklanır, tarağa tüy takılır. |
| 4 | Tüy | Eğik tüyü kökünün çevresinde çevirir | Tüy döner; yuvasına gelince "tık" diye oturur (iki karelik ışıltı). |
| 5 | Çırp | Kanadın ucunu yukarı aşağı oynatır | Kanat üç karede çırpar, rüzgâr akar (iki kare), tüyler uçuşur (dört kare). Polly "Yay!" der. |
| 6 | Askı | Askıyı kanadın altına koyar, iki ucunu boynunun arkasına taşır | Askı iki karede yerleşir; iki uç sırayla bağlanır, düğüm olur. |
| 7 | Kraker | Krakeri gagasına uzatır, çeker, yine uzatır | Her girişte "krak": Polly iki karede çiğner, kırıntılar düşer (üç kare), kraker küçülür. |
| 8 | Şapka | Tepsideki şapkayı başına taşır | Şapka havada döner, başına oturur, yıldız parlar, notalar yükselir. Masada Polly zıplar; bir tüy havada süzülüp Kino'nun burnuna konar, Kino hapşırır, Polly "Bless you, Kino!" der. |

**Yaş:** 2–3'te iki pıtrak, üç şerit, tüy oturtma yok. 5+'ta kanat daha yavaş açılmalı ve beş çırpma.

### Yakın plan ölçüleri (2048 × 1152)
- **Polly'nin başı** sol üstte x 120…560, y 60…480:
  - başın ortası (330, 260);
  - gaga ucu (520, 300);
  - başın tepesi (320, 110);
  - boynun arkası (300, 470).
- **Yaralı kanat:**
  - Kökü (480, 560).
  - Kapalıyken ucu (760, 780); tam açıkken ucu (1380, 420).
  - Açık kanat x 420…1420, y 260…860; ortası (900, 600).
- **Pıtraklar** açık kanatta: (820, 520), (1020, 640), (1220, 480).
- **Tarama şeritleri**, kökten uca: y 420, 520, 620, 720; her biri x 540…1380 arasında, yaklaşık 96 px yüksek.
- **Eğik tüy:** kökü (1180, 700). Yuvasının açısı 18°, başta −40°'de yukarı kalkık duruyor (0° sağ, saat yönü artı); boyu 400.
- **Böbrek tepsi** fonda, sağ üstte x 1580…1880, y 300…760. Pıtrakların yeri (1660, 400), (1780, 430), (1700, 500); şapka başta (1730, 650).
- **Askının iki ucu:** (560, 720) ve (1260, 800).

### Sayfa 1 · Fon ve şapka (8) → `kanat-fon`, `sapka`, `sapka-havada`, `sapka-basta`, `sapka-yildiz`, `nota-0`, `nota-1`, `nota-2`
- **`kanat-fon`** (2048 × 1152, opak):
  - Y1 `yakin-fon` ile aynı oda; nane sedye örtüsü, lila duvar.
  - Sağ üstte boş böbrek tepsi (Y1'deki gibi, yukarıdaki ölçüde).
  - Polly'nin ve kanadın yeri sade.
- **`sapka`, `sapka-havada`** (400 × 400): Polly'nin safari şapkası. `sapka` tepside duruyor; `havada` hafif eğik, kenarı kalkık.
- **`sapka-basta`** (2048 × 1152, yakın plan hizası): yalnız şapka, başın tepesinde (320, 110) oturuyor.
- **`sapka-yildiz`** (300 × 300): şapka oturunca çakan parıltı.
- **`nota-0…2`** (160 × 160): yükselen küçük müzik notası, üç kare (sarı-turkuaz, ince kontur). Yazı yok.

### Sayfa 2 · Polly'nin yakın pozları I (8, şeffaf, her biri 2048 × 1152, aynı hiza) → `polly-yakin-endise`, `polly-yakin-kirp`, `polly-yakin-ouch`, `polly-yakin-sasir`, `polly-yakin-kikir`, `polly-yakin-gurur`, `polly-yakin-mutlu`, `polly-yakin-bakis`
- Polly sedyede duruyor, baş sol üstte, yüzü kanadına dönük.
- **Yaralı kanat çizilmez** (ayrı katman); öbür kanat gövdesinde kapalı. Şapka yok.
- **Bütün pozlarda gövde, ayaklar ve başın yeri piksel piksel aynı**; yalnız gözler, kaşlar ve gaga değişir.

Pozlar:
- `endise`: kaşlar kalkık, kanadına endişeyle bakıyor.
- `kirp`: `endise` ile aynı, gözler kapalı.
- `ouch`: gözler sımsıkı, gaga açık bağırıyor.
- `sasir`: gözler kocaman.
- `kikir`: gözler kısık, gaga açık kıkırdıyor.
- `gurur`: göğüs kabarık, gözler kısık, kendini beğenmiş.
- `mutlu`: kocaman gülüş, gözler parlak.
- `bakis`: gözler doktorun aletine bakıyor, meraklı.

### Sayfa 3 · Polly'nin yakın pozları II (7, aynı hiza) → `polly-yakin-kirt-0`, `polly-yakin-kirt-1`, `polly-yakin-yay`, `polly-yakin-hey`, `polly-yakin-gaga-0`, `polly-yakin-gaga-1`, `polly-yakin-huzur`
- `kirt-0`, `kirt-1`: kraker çiğniyor; gaga kapalı ve aralık, yanaklar dolu.
- `yay`: gaga açık, sevinçle bağırıyor.
- `hey`: başına yapışan pıtrağa şaşı bakıyor.
- `gaga-0`, `gaga-1`: konuşma, gaga kapalı ve açık (yüz sakin).
- `huzur`: rahatlamış, gözler yarı kapalı gülümseme.

### Sayfa 4 · Kanadın açılışı (6, aynı hiza) → `kanat-0`, `kanat-1`, `kanat-2`, `kanat-3`, `kanat-4`, `kanat-5`
- Yaralı kanat kökten (480, 560) açılıyor. 0 gövdeye kapalı (uç (760, 780)), 5 tam açık (uç (1380, 420)); aradakiler eşit adımlarla.
- **0–4:** tüyler karışık, kabarık.
- **5:** tam açık; tüyler **düzgün** çizilir (karışıklık ayrı katman). Pıtrak ve eğik tüy çizilmez.

### Sayfa 5 · Kanat katmanları ve çırpma (7) → `kanat-karisik`, `kanat-parlak`, `kanat-cirp-0`, `kanat-cirp-1`, `kanat-cirp-2`, `kanat-ruzgar-0`, `kanat-ruzgar-1`
- `kanat-karisik` (2048 × 1152, `kanat-5` hizası): yalnız karışık, kabarık, ters dönmüş tüyler; kanadın üstüne biner. Kod tarandıkça siler.
- `kanat-parlak` (2048 × 1152): düzgün kanadın üstünde parlak çizgiler ve iki üç ışıltı.
- `kanat-cirp-0…2` (2048 × 1152): düzgün açık kanat; 0 yukarı kalkık, 1 ortada, 2 aşağı inmiş (kökü aynı yerde).
- `kanat-ruzgar-0`, `-1` (500 × 300): kanat çırpınca akan kıvrık rüzgâr çizgileri.

### Sayfa 6 · Pıtrak (8) → `pitrak-0`, `pitrak-1`, `pitrak-2`, `pitrak-gergin-0`, `pitrak-gergin-1`, `pitrak-tepside`, `pit-0`, `pit-1`
- `pitrak-0…2` (160 × 160): yeşil dikenli küçük pıtrak topu, üç ayrı biçim, ortada. Sivri ve korkutucu değil, yumuşak tırtıklı.
- `pitrak-gergin-0`, `-1` (240 × 240): çekilen pıtrak; arkasından iki üç tüy gerilmiş (0 az, 1 çok). Pıtrak ortada.
- `pitrak-tepside` (160 × 160): tepside yatan pıtrak.
- `pit-0`, `-1` (200 × 200): pıtrak kopunca çıkan "pıt" yıldızı ve sönen halka.

### Sayfa 7 · Tarak (8) → `tarak`, `tarak-tuylu`, `tarak-tara-0`, `tarak-tara-1`, `parilti-tuy-0`, `parilti-tuy-1`, `parilti-tuy-2`, `tuy-kabarik-0`
- `tarak` (600 × 600):
  - Turkuaz kulplu, geniş dişli yumuşak tüy tarağı, dik. **Kulp üstte, tutulan yer (300, 160); dişlerin ortası (300, 430).**
- `tarak-tuylu`: aynı tarak, dişlerine bir tutam mercan tüy takılmış.
- `tarak-tara-0`, `-1`: tararken tarak hafif sola ve sağa yatık, dişlerinde ince tüy telleri.
- `parilti-tuy-0…2` (600 × 200): taranan şeridin üstünde soldan sağa akan parıltı, üç kare.
- `tuy-kabarik-0` (300 × 300): ters taranınca kabaran tüy pofu (ilk kare).

### Sayfa 8 · Tüyler (8) → `tuy-kabarik-1`, `tuy-egik`, `tuy-tik-0`, `tuy-tik-1`, `tuy-ucan-0`, `tuy-ucan-1`, `tuy-ucan-2`, `tuy-ucan-3`
- `tuy-kabarik-1` (300 × 300): kabaran tüyün ikinci karesi.
- `tuy-egik` (400 × 120): uzun mercan tüy, yatay. **Kökü sol ortada (0, 60)**, ucu sağda. Kod kökünün çevresinde döndürür.
- `tuy-tik-0`, `-1` (300 × 300): tüy yuvasına oturunca çakan ışıltı.
- `tuy-ucan-0…3` (200 × 200): havada süzülen tek tüy, dört farklı açı.

### Sayfa 9 · Askı (6) → `aski`, `aski-yerinde-0`, `aski-yerinde-1`, `aski-ucu-sol`, `aski-ucu-sag`, `aski-dugum`
- `aski` (600 × 600): katlı üçgen kanat askısı bezi (nane rengi, küçük yıldız desenli).
- `aski-yerinde-0`, `-1` (2048 × 1152): askı açık kanadın altında. 0 yeni konmuş, 1 oturmuş. **İki serbest ucu çizilmez.**
- `aski-ucu-sol`, `aski-ucu-sag` (240 × 240): askının iki ucu; kısa bez şerit, ucu yuvarlak.
- `aski-dugum` (2048 × 1152): iki şerit askıdan boynun arkasına uzanır, (300, 470)'te fiyonk düğüm.

### Sayfa 10 · Kraker (7) → `kraker-0`, `kraker-1`, `kraker-2`, `kraker-kirik`, `kirinti-0`, `kirinti-1`, `kirinti-2`
- `kraker-0…2` (400 × 400):
  - Yuvarlak, delikli altın sarısı kraker. **Tutulan yer alt (200, 300); ısırılan kenar üst (200, 110).**
  - 0 bütün; 1 bir ısırık; 2 küçük parça.
- `kraker-kirik` (400 × 400): son lokma; ufalanmış küçük parça.
- `kirinti-0…2` (300 × 300): gagadan dökülen kırıntılar, üç kare.

### Sayfa 11 · Masadaki Polly (8, tuval 1000 × 940) → `polly-uzgun-0`, `polly-uzgun-1`, `polly-uzgun-kirp`, `polly-sevinc-0`, `polly-sevinc-1`, `polly-son-0`, `polly-son-1`, `polly-son-2`
- **Ölçüler:** yaralı kanat (700, 420), göğüs (520, 520).

Pozlar:
- `uzgun-0`: Polly sedyede duruyor. Bir kanadı yana sarkık, karışık, üç pıtraklı. Şapkasız, endişeli.
- `uzgun-1`: aynı; baş hafif öne düşmüş.
- `uzgun-kirp`: `uzgun-0` ile aynı, gözler kapalı.
- `sevinc-0`, `sevinc-1`: şapkası başında, askılı kanadı göğsünde. Öbür kanadını sallıyor, zıplıyor; 0 ve 1 kanat yukarıda ve aşağıda.
- `son-0…2`: şapkalı ve askılı; sağlam kanadından bir tüy kopup sağ alta (Kino'ya doğru) süzülüyor.
  - 0 tüy kanadından ayrılıyor;
  - 1 tüy havada;
  - 2 Polly gülerek sağ alta işaret ediyor.

**Sayı:** 8 + 8 + 7 + 6 + 7 + 8 + 8 + 8 + 6 + 7 + 8 = **81 çizim**, on bir sayfa.
