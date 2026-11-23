# Minik Doktor · Ölçülü Astra Çizim Brief'i (Sürüm 1.2 · Paket `MD1–MD7`)

> **Hazırlayan:** Antigravity (Neon 4.0) · 22 Kasım 2026  
> **Durum:** Yönetici (Claude) 1.1 mağazaya verildikten sonra Astra sırasına koyması için ölçülü brief biçiminde hazır. **Bugünün 1.1 Astra işlerini bölmez.**  
> **Bağlı belgeler:** `ekip/senaryo/MINIK-DOKTOR.md` (v2) · `ekip/senaryo/MINIK-DOKTOR-ORNEK.md` · `ekip/antigravity/CEVAP-08.md` (ilk örnekteki 24 çizim `assets/doktor/ornek/kaynak/` altında hazır; burada **yeniden çizilmez**, gerekirse yalnız final cilası yapılır).

---

## Ortak Kurallar (Tüm Sayfalar İçin Zorunlu)

1. **Çizgi ve renk dili:** Minkino'nun temiz 2D düz vektör dili; ince siyah dış kontur, düz dokusuz renk alanları, gerekirse tek keskin düz gölge. Gradyan, boyalı doku, 3D parlama, bulanık gölge, yazı, harf, rakam, ok, hız çizgisi **YOK**.
2. **İç mekân palet referansı:** `assets/dedektif-yeni/roman-2.webp` ve `assets/doktor/ornek/kaynak/fon-muayene.png` (lila duvar `#D4B5F4`, açık mavi lambri `#A9D7F7`, şeftali zemin `#F7B189`, sıcak ahşap `#F7B538`, nane yeşili `#7AD9B3`).
3. **Zemin:** Fon ve kapaklar kendi tam çözünürlüklü çağrısında tam sahne çizilir. Tüm karakter, yakın plan ve eşya sayfaları düz, tek renk **şeffaf ya da saf `#FF00FF` macenta** zeminde, gölgesiz ve yer çizgisiz üretilir; her çizimin çevresinde en az 40 px boşluk kalır.
4. **Sayfa başına en çok 6–8 çizim (kesin üst sınır: 8).** Bağımsız arka planlar ve kapak her zaman tek başına tam çözünürlükte (`2752 × 1536`, 16:9) üretilir.
5. **Kesin yasaklar:**
   - Hiçbir yerde **insan figürü yok** (duvar afişi, kitap kapağı, pencere dışı, çerçeve içi dahil).
   - **Çilek yok** (macun, şurup, bant, çıkartma, duvar süsü dahil), **domuz yok**, **kan/iğne/şırınga yok**, aletlerde/yıldızlarda **yüz/göz yok**.
   - **Lokum** her zaman **pembe tulumlu** (etek/elbise değil; `boy-oranlari.json`: `Lokum = 0.63 × Kino`).
   - **Bulut** kayısı tüylü keçi, küçük koyu boynuzlu, **iki göz bebeği göz akının tam ortasında hizalı** (`ekip/kalite/minkino-gorsel-rehberi/pozlar/bulut/on.png`).
   - **Baba Murat'ın alnında ben YOK** (`ekip/kalite/minkino-gorsel-rehberi/pozlar/baba/on.png`).
   - **Mila** onaylı şeftali yavru kedi (`ekip/film/kino-bir-iki-uc-gum/cizim/Mila-Tek-Poz-Onizleme.png`; sarı tulum, nane toka, lila kulak lekesi).
   - **Kino** turuncu göz lekesi ve baş tepesi lekesi **izleyiciye göre sağda** (`pozlar/kino/on.png`, `uc-ceyrek.png`).
6. **Teslim öncesi %100 boyut uzuv/bütünlük denetimi (her karakter karesinde sayılır):**
   - 2 göz (doğru hizada), 2 kulak, 2 kol, 2 el/pati (parmak sayısı tutarlı), 2 bacak, 2 ayak/ayakkabı, 1 kuyruk.
   - Kollar ve bacaklar gövdeye eksiksiz bağlı; yakalar/düğmeler önde; koltuk/masa ayakları aynı taban çizgisinde.
   - Aynı karakterin tüm pozlarında baş genişliği ve gövde ölçeği sabit; taban çizgisi kaymaz.

**Kayıt klasörü:** `assets/doktor/` (alt klasörler: `fon/`, `kisi/`, `yakin/`, `alet/`, `odul/`).

---

## FAZ 1 · İlk Oynanabilir 1.2 Dilimi (Gün 1–2: 4 Vaka + Bekleme Odası + Akvaryum)

> *Not:* `fon-muayene.png`, Zıpzıp (4 poz), Kino (3 poz), Diz yakın plan (4 parça), ilk 8 alet ve 4 yara bandı ilk örnekten (`assets/doktor/ornek/kaynak/`, 22 Kasım 03:28 Harf denetiminden **24/24 geçti**) doğrudan yeniden kullanılır! Faz 1 yalnız Gün 1–2'yi tam oyuna çeviren eksik parçaları ve 03:28 denetiminde çıkan **2 ek pozu** (`kino-bekliyor` + `zipzip-giris`) içerir.
>
> **03:28 Harf Denetiminden Alınan 4 Kalite Kilidi (1.2 Astra üretimi için zorunlu):**
> - **Çözünürlük:** Karakter ve eşya sayfaları yerel en az **2048 px geniş** (kırpılmış tek karakter en az 1024 px yüksek); yumuşak kenar yumuşatmalı (anti-aliased) temiz siyah dış kontur, koyu macenta/mor dış saçak yok.
> - **Aynı diz/pati tutarlılığı:** Bir hasta hangi dizini/patisini tutuyorsa (ör. sağ diz = izleyiciye göre sol bacak), kapanıştaki gururlu gösterme pozunda da **aynı bacağını** gösterir.
> - **Kino sakin dinleme pozu (`kino-bekliyor`):** Çocuk aletle çalışırken Kino'nun ağzı kapalı, elleri önde sakin gülümseyerek beklediği poz.
> - **Giriş yürüme/sekme pozu (`<hasta>-giris`):** Hastalar koltuğa oturuş pozuyla değil, ayakta yürüyen/seken giriş pozuyla gelir.

### Paket MD1 · Kapak, Bekleme Odası Fonu ve Kapı Tabelası (3 ayrı tam çözünürlük çağrı)

1. **`assets/uygulama/oyun-kapaklari/doktor.webp`** (kaynak `doktor-kapak.png`, `2048 × 1536`, 4:3 — **tek çağrı**)
   - **Referanslar:** `pozlar/kino/on.png`, `pozlar/lokum/on.png`, `pozlar/zipzip/on.png`, `assets/doktor/ornek/kaynak/fon-muayene.png`.
   - **Sahne:** Yazısız menü kapağı. Ön ortada doktor önlüklü Kino gülümseyerek stetoskopu tutuyor; sol yanında pembe tulumlu Lokum (`0.63 × Kino`) elinde kırmızı kurdeleli oyuncak Kuzu'yla, sağ yanında Zıpzıp dizinde yıldızlı yara bandıyla sevinçle gülümsüyor. Arkada sıcak lila/mavi muayene odası. Sıfır yazı, sıfır insan figürü, sıfır çilek.
2. **`assets/doktor/fon/bekleme-odasi.png`** (`2752 × 1536`, 16:9 — **tek çağrı**)
   - **Referans:** `assets/doktor/ornek/kaynak/fon-muayene.png`, `assets/dedektif-yeni/roman-2.webp`.
   - **Sahne:** Karakter yok, süs/ödül eşyaları yok. `fon-muayene.png` ile birebir aynı duvar/lambri/zemin paleti.
   - **Ölçülü yerleşim ve boş ödül yuvaları:**
     - Sol duvar (`x = 120…680, y = 240…860`): cam giriş kapısı (kapalı) ve yanında tabela askı çivisi (`x = 400, y = 520`).
     - Orta-arka (`x = 760…2040, y = 780…1180`): 3 yan yana alçak yuvarlak nane yeşili/sarı bekleme koltuğu (taban `y = 1180`, koltuk oturma çizgisi `y = 1040`, yükseklik ~380 px).
     - **6 boş ödül yuvası (boş bırakılır, kod yerleştirir):**
       1. Akvaryum yuvası: sol-ön köşe (`x = 160…580, taban y = 1320`)
       2. Zürafa boy ölçer duvarı: koltukların sol yanı (`x = 680…860, taban y = 1180`)
       3. Kuzu sepeti zemini: orta-ön (`x = 1180…1520, taban y = 1360`)
       4. Saksı & güneşli pencere: sağ-arka duvar (`x = 2080…2560, y = 220…1160`)
       5. Ihlamur köşesi sehpası: sağ-ön (`x = 2160…2620, taban y = 1340`)
       6. Yıldız çıkartma panosu duvarı: orta üst duvar (`x = 960…1860, y = 220…640`)
     - Sağ kenar (`x = 2420…2700`): muayene odasına açılan kapalı ahşap kapı.
3. **`assets/doktor/alet/kapi-tabelasi.png`** (2 çizim, sayfa `1600 × 900`, her biri `640 × 640`, taban `y = 600` — **1 sayfa, 2 çizim**):
   - `tabela-kapali`: yuvarlak ahşap kapı levhası, ortada sade düz sarı uyuyan hilal ay (yazısız, yüzsüz).
   - `tabela-acik`: aynı levha, ortada sade parlak sarı güneş (yazısız, yüzsüz).

### Paket MD2 · Gün 1–2 Ek Aletler (1 sayfa, 6 çizim · her biri `800 × 800`, saf `#FF00FF`)
- `ates-olcer-normal`: çocuk dostu yuvarlak uçlu beyaz-mavi alın termometresi, küçük ekranı düz **yeşil** (rakamsız, yazısız).
- `ates-olcer-sicak`: aynı termometre, aynı boy ve açı, ekranı düz **kırmızı-turuncu** (rakamsız).
- `battaniye-katli`: yumuşak pastel sarı-nane kareli katlı battaniye (düz renk, dokusuz).
- `battaniye-sarili`: oturan küçük hasta (Lokum) omuzlarına/gövdesine sarılacak ön katman battaniye şekli (ortası açık boyun kavisi, `800 × 600`, taban `y = 580`).
- `ihlamur-fincani`: krem seramik fincan içinde açık altın rengi ıhlamur çayı + yanında sade ahşap kaşık; buhar ayrı efekt çizilir.
- `ihlamur-demlik`: yuvarlak pastel nane çaydanlık/sürahi ve yanında küçük ıhlamur çiçeği dalı + yarım limon (komik ekşi şaka için!).

### Paket MD3 · Gün 1–2 Yeni Hastalar + 2 Örnek Tamamlayıcı Poz (4 küçük sayfa, toplam 12 çizim)
> **Ortak karakter ölçüsü:** `1024 × 1152` px (sayfa yerel `≥ 2048 px` geniş), şeffaf ya da saf `#FF00FF`, gölgesiz; **oturan ayak tabanı `y = 1065`**, ayakta/zıplama aynı karakter ölçeği.

- **Sayfa MD3-ek · Kino & Zıpzıp tamamlayıcı 2 poz (Harf 03:28 denetim önerisi)** · ref: `assets/doktor/ornek/kino-merhaba.webp`, `zipzip-korkulu.webp`:
  - `kino-bekliyor`: doktor önlüklü Kino ayakta, önden, **ağzı kapalı**, iki patisi önde rahat birleşik, sıcak gülümseyerek çocuğun işini izliyor (`kino-merhaba` ile birebir aynı baş/boy/ayakkabı tabanı).
  - `zipzip-giris`: Zıpzıp ayakta, üç çeyrek sola/koltuğa dönük, tek ayağı hafif kalkık seke seke giriş pozu, kulaklar hafif düşük ama tatlı (oturuş pozuyla sekme yerine doğal giriş!).
- **Sayfa MD3a · Oyuncak Kuzu (2 çizim)** · `assets/doktor/kisi/kuzu-*.png` (ref: `content/kitap-doktor.json` Kuzu):
  - `kuzu-otur`: küçük beyaz pelüş kuzu, boynunda kırmızı kurdele, düğme gözler, koltukta oturur (`640 × 760`, taban `y = 700`).
  - `kuzu-mutlu`: aynı kuzu, kulakları hafif kalkık, havada küçük neşeli sekme.
- **Sayfa MD3b · Lokum (4 poz, PEMBE TULUMLU! · `0.63 × Kino` boyu korunur)** · ref: `pozlar/lokum/on.png`, `uc-ceyrek.png`:
  - `lokum-usumus`: koltukta oturur, iki patisiyle kollarına sarılmış hafif titrer, kırmızı burun/hafif pembe yanak, üşümüş tatlı yüz (ağlama/korku yok!).
  - `lokum-rahat`: aynı oturuş ve ölçek, eller rahat, sıcak gülümseme.
  - `lokum-zipla`: sevinçle havaya zıplamış (`y = 980`), iki pati yukarıda, ağzı açık *"Hav!"* kahkahası.
  - `lokum-karin`: koltukta oturur, iki patisi karnında, şaşkın-kıkırdayan yüz (Gün 5 röntgen/gıdık vakasında da yeniden kullanılır!).
  - **Zorunlu kontrol:** Pembe tulum (etek DEĞİL, iki paça belli, iki beyaz düğme, beyaz yaka), turuncu sağ kulak, iki ön diş, beyaz tüy.
- **Sayfa MD3c · Bulut (4 poz · kayısı keçi, HİZALI GÖZLER!)** · ref: `pozlar/bulut/on.png`, `uc-ceyrek.png`:
  - `bulut-utangac`: koltukta oturur, bir patisi başının/boynuzunun yanında, utangaç ama tatlı gülümseme; boynuzlar temiz (bal ayrı katman).
  - `bulut-guluyor`: aynı oturuş ve ölçek, gözleri hafif kısık kıkırdıyor (uğur böceği gıdığı / boynuz temizlenince).
  - `bulut-zipla`: ayakta sevinçle zıplıyor (`y = 980`), iki kol yukarıda.
  - `bulut-ayakta`: ayakta önden, kulakları dik, gururlu gülümseme (boy ölçer ve kapanış için).
  - **Zorunlu kontrol:** Kayısı tüy, küçük koyu boynuzlar, uzun içi pembe kulaklar, lila tişört, turkuaz şort; önden bakışta iki göz bebeği göz akının tam ortasında!

### Paket MD4 · Gün 1–2 Yakın Plan (Boynuz Balı) + İlk 2 Bekleme Odası Ödülü (1 sayfa, 6 çizim)
- **Boynuz yakın plan (2 katman, aynı tuval `2048 × 1152`, birebir hizalı):**
  - `boynuz-temiz`: Bulut'un başının üstü ve iki küçük koyu boynuzu çok yakından, kayısı tüy + kulak üstleri.
  - `boynuz-bal`: aynı tuvalde yalnız sağ boynuza bulaşmış düz altın rengi damlayan bal lekesi (parlama/gradyan yok, saf `#FF00FF`).
- **İlk 2 canlı bekleme odası ödülü (`800 × 800`, taban `y = 750`):**
  - `odul-akvaryum-1`: ahşap sehpa üstünde yuvarlak/dikdörtgen temiz cam akvaryum, içinde neşeli turuncu balık + yeşil su bitkisi.
  - `odul-akvaryum-2`: aynı akvaryum, balık takla atmış + 3 mavi su baloncuğu yükseliyor.
  - `odul-boy-olcer`: sarı benekli sevimli zürafa biçimli ahşap boy cetveli (sayısız, yalnız renkli yatay çizgiler; `420 × 1000`, taban `y = 960`).
  - `odul-boy-cubugu`: zürafanın üstünde aşağı-yukarı kayan kırmızı uçlu ahşap ölçüm çubuğu (`360 × 120`).

---

## FAZ 2 · Tam Klinik Paketi (Gün 3–7+: Kalan İstasyonlar, Hastalar ve Ödüller)

### Paket MD5 · Gün 3–6 Ek Aletler (2 sayfa, toplam 12 çizim · `800 × 800`, saf `#FF00FF`)
- **Sayfa MD5a (6 çizim):**
  1. `yesil-yaprak-tut`: Bulut'un kulağı dışındaki uğur böceğini almak için elde tutulan taze yeşil dal/yaprak (cımbız yerine güvenli araç!).
  2. `agiz-feneri`: yuvarlak gövdeli sarı-mavi küçük doktor cep feneri (ışık ayrı saydam koni).
  3. `dis-fircasi`: turkuaz çocuk diş fırçası, beyaz kıllı, üstünde sade nane-beyaz macun damlası (çilek rengi yok!).
  4. `su-bardagi`: şeffaf görünümlü açık mavi plastik durulama bardağı, yarısı su dolu.
  5. `rontgen-cerceve`: yuvarlak köşeli lacivert-mavi çerçeveli Sihirli Röntgen ekranı; **ortası tamamen düz `#FF00FF` boş** (kod X-ray katmanını içine maskeler!).
  6. `goz-damlaligi`: şeffaf küçük damlalık, açık mavi yumuşak başlık + ucunda tek mavi damla.
- **Sayfa MD5b (6 çizim):**
  1. `serin-bez-kase`: küçük nane su kâsesi içinde katlı serin mavi el bezi (yalnız ateşli vakalarda!).
  2. `serin-bez-alin`: hastanın alnına konacak düz katlı açık mavi serin bez (`500 × 260`).
  3. `mendil-kutu`: pastel sarı mendil kutusu, üstünden tek beyaz mendil çıkıyor.
  4. `vitamin-kasigi`: yuvarlak ahşap/gümüş kaşık içinde altın bal rengi şurup (çilek yok!).
  5. `buhar-efekt`: 3 parça sade beyaz buhar kıvrımı (serin bez ve ıhlamur için).
  6. `kopuk-baloncuk`: 3 parça düz beyaz-açık mavi diş köpüğü ve parıltı yıldızı.

### Paket MD6 · Gün 3–6 Yakın Plan İstasyon Katmanları (3 sayfa, toplam 12 parça · her grup aynı `2048 × 1152` tuvalde!)
- **Sayfa MD6a · Kulak Dış Kenarı + Pati Yakın Plan (4 parça, `2048 × 1152`):**
  1. `kulak-bulut-temiz`: Bulut'un uzun kayısı kulağının **dış üst kenarı ve tüyü** yakından (kulak içi derin kanal DEĞİL, dış kenar tüyü!).
  2. `kulak-ugur-bocegi`: aynı tuvalde dış kenar tüylerinin üstünde oturan şirin kırmızı-siyah noktalı küçük uğur böceği (`diz-yaprak` gibi ayrı katman!).
  3. `pati-mino-temiz`: Mino'nun yumuşak turuncu-krem patisi yakından, pembe pati yastıkları görünür.
  4. `pati-diken`: aynı tuvalde pati kenarına yüzeysel takılmış minik kahverengi dal/diken parçası (kan yok, cımbızla çekilmeye uygun çıkıntılı uç).
- **Sayfa MD6b · Ağız / Dişler & Göz Yakın Plan (4 parça, `2048 × 1152`):**
  1. `agiz-mino-temiz`: Mino'nun kocaman *"Aaaa!"* diyen sevimli temiz ağzı ve pırıl pırıl beyaz dişleri (yakın plan).
  2. `agiz-kirinti`: aynı tuvalde dişlerin üstünde 5–6 küçük kahverengi kurabiye kırıntısı lekesi (fırçalayınca silinir).
  3. `goz-mila-temiz`: Mila'nın şeftali yüzünde iri parlak gözleri yakından (temiz).
  4. `goz-polen`: aynı tuvalde göz kenarında 6–7 minik sarı çiçek poleni taneciği (damla düşünce uçup gider).
- **Sayfa MD6c · Sihirli Röntgen İç Katmanları (4 parça, `1024 × 1024`, koyu lacivert `#102848` X-ray paleti, düz açık camgöbeği karikatür kaburga çizgisi + tek komik bulgu!):**
  1. `rontgen-lokum`: karikatür kaburgalar + midede 3 parlak turuncu **mandalina dilimi**!
  2. `rontgen-dede`: karikatür kaburgalar + göğüste yükselen 5 parlak mavi **hıçkırık baloncuğu**!
  3. `rontgen-mino`: karikatür kaburgalar + ön cep hizasında sarı **çıngıraklı küçük top**!
  4. `rontgen-saksi`: gizli sürpriz! Saksı içi toprak altı kökler ve şirin gülümseyen küçük solucan!

### Paket MD7 · Kalan 5 Hasta + Kalan 4 Bekleme Odası Ödülü (6 küçük sayfa)
> Ortak karakter ölçüsü: `1024 × 1152`, saf `#FF00FF`, oturan taban `y = 1065`, zıplama `y = 980`.

- **MD7a · Mino (3 poz · ref: `pozlar/mino/on.png`, `uc-ceyrek.png`):** `mino-patisi` (oturur, patisini tutar, endişeli), `mino-rahat` (oturur, gülümser), `mino-zipla` (sevinçle zıplar).
- **MD7b · Dede Hasan (3 poz · ref: `pozlar/dede/on.png`, `uc-ceyrek.png`):** `dede-hickirik` (oturur, kasketi hafif kalkmış şaşkın *"Hık!"*), `dede-rahat` (oturur, sıcak gülümseme), `dede-selam` (ayakta kasketini kaldırıp selamlar).
- **MD7c · Mila (3 poz · ref: `ekip/film/kino-bir-iki-uc-gum/cizim/Mila-Tek-Poz-Onizleme.png`; boy ≈ Lokum `0.63`):** `mila-polen` (oturur, bir gözünü hafif kırpmış, patisi yanağında), `mila-rahat` (oturur, parlak gözler gülümser), `mila-zipla` (sevinçli el sallama/sekme).
- **MD7d · Baba Murat (3 poz · ref: `pozlar/baba/on.png`, `uc-ceyrek.png` — ALINDA BEN YOK!):** `baba-ates` (oturur, yanakları hafif pembe, yorgun ama şefkatli), `baba-rahat` (oturur, ferah gülümseme), `baba-boy` (ayakta dik, gururla gülümser).
- **MD7e · Anne Defne (2 poz · ref: `pozlar/anne/on.png`, `uc-ceyrek.png`):** `anne-otur` (rutin kontrol için neşeli oturuş), `anne-alkis` (ayakta sevinçle alkışlar).
- **MD7f · Kalan 4 Bekleme Odası Canlı Ödülü (1 sayfa, 6 çizim · `800 × 800`, taban `y = 750`):**
  - `odul-kuzu-sepet`: hasır sepette kırmızı kurdeleli oyuncak Kuzu.
  - `odul-saksi-kapali`, `odul-saksi-acik`: pencere kenarı çiçek saksısı (tomurcuk / açmış papatyalar).
  - `odul-ihlamur-kose`: küçük ahşap sehpa üstünde demlik ve iki fincan.
  - `odul-pano-yildiz`: duvar mantar panosu, üstünde yıldızlı renkli küçük sağlık kartları dizili (yazısız).
  - `odul-kus`: pencereden geçen küçük düz mavi kuş (gizli sürpriz #10).

---

## Toplam Bütçe Özeti

| Faz | Paket | Çizim sayısı | Sonuç |
|---|---|---|---|
| **Pilot (TAMAMLANDI)** | `ISTEK-08` (D-A..D-F) | 24 (teslim edildi) | "Zıpzıp'ın Dizi" canlı örnek |
| **Faz 1 (Gün 1–2)** | `MD1–MD4` | 27 çizim (~9 çağrı) | Bekleme odası + 4 vaka + `kino-bekliyor` & `zipzip-giris` + Akvaryum & Boy Ölçer oynanır! |
| **Faz 2 (Gün 3–7+)** | `MD5–MD7` | 44 çizim (~11 çağrı) | Tüm 14 vaka, 12 istasyon, Sihirli Röntgen, 6 ödül tamamlanır! |
| **Toplam yeni Astra** | `MD1–MD7` | **71 çizim** (~20 çağrı) | 1.1 sonrası ~2–3 Astra gününde biter. |
