# Kino ve Ailesi · Bölüm 1: Hızlı Çoraplar

> Durum: **TASLAK, 3.1 sürüm** (2026-10-11). **Barış storyboard'u (en sonda, 12 kare) görmeden animatiğe ve render'a geçilmez.**
> **Değişiklik notu (2026-10-11):** Önceki sürüm "Herkes Lokum'a Bakıyor" reddedildi. Barış'ın sözleri: "dram filmi gibi, aşırı amatör, hiç özenilmemiş". Bölüm sıfırdan yazıldı:
> - Yeni konu: kayıp çorap.
> - Ağlama, bağırma, saklanma ve uzun konuşma yok. Tek kısa duygu anı var (~11 sn).
> - 8 kısa sahne var; her birinde bir eylem ve bir şaka bulunur. Hayal sahnesi eklendi.
> - Önden kuklaya uygun: kimse oturmaz, yatmaz, sarılmaz.
> - Eski sürüm git geçmişinde: `git log -- ekip/film/seri-2/bolum-01.md`.
>
> **3.1 notu (aynı gün):** Barış'ın yeni kuralı: "Sahneleri bol tut, sahnelerde animasyonlar olsun, sahne boş olmasın. 10 saniye boş boş durmalar olmasın." Konu ve sahne yapısı aynı kaldı. Bu sürümde:
> - Her sahneye bir **canlılık katmanı** eklendi: 4-6 sürekli arka plan hareketi ve en az bir arka plan şakası.
> - Her sahnede bir **ön plan kalabalığı** var: konuşan iki kişinin yanında başkaları da kendi işini yapıyor.
> - **Boşluk kuralı** (§2.6) getirildi.
> - Çekim listelerine **"Ne hareket ediyor"** sütunu eklendi. Hiçbir çekim 10 sn'yi geçmiyor; uzun çekimler bölündü.
> - Canlılık sesleri (§2.5) ve storyboard tarifleri güncellendi.
>
> **Kodcuya iki uyarı:**
> 1. `content/film2/bolum-01.json` eski senaryoya göre yazılmıştı. Yeni kimliklerle baştan kurulmalı.
> 2. `ekip/ses/seri2-gelen/` içindeki `b01-s4-*.mp3` dosyaları (27 dosya) reddedilen Sahne 4'ün kayıtları. Kimlikleri yeni repliklerle çakışır; yeni kayıttan önce kenara alınmalı.
>
> **Süre:** ~5 dk 55 sn (seri açılışı ve jenerik dahil). **Üretim:** [URETIM-YOLU.md](URETIM-YOLU.md). Seri kitabı: [SERI-KITABI.md](SERI-KITABI.md). Kit: [KARAKTER-KITI.md](KARAKTER-KITI.md).

---

## 0. Tarif: Caillou ve Bluey nasıl yapıyor? (Bu bölüm buna uyar)

1. **Açılış: hedef ilk 20 saniyede belli olur.** Bluey soğuk açılışla, bir oyunun tam ortasında başlar. Caillou'da anlatıcı tek cümleyle günü ve Caillou'nun isteğini söyler.
   **Bizde:** 15 sn seri açılışı. Ardından Kino bir hareketin ortasındadır (tek ayakta zıplayarak çorap giyiyor). Ne istediği 20 sn içinde anlaşılır.
2. **Tek istek, art arda engeller.** Bölüm basit bir isteğin peşinden gider: bir şeyi bulmak, bir yere gitmek, bir şeyi yapmak. Her sahne ya bir adım ya da komik bir sapmadır. Karakterler sürekli yer değiştirir; plan değişimi 3-10 sn'dir.
   **Bizde:** 8 sahne, her biri 40-45 sn. Her sahne başka bir mekânda ya da başka bir köşede geçer. Her sahnede bir eylem ve bir şaka var.
3. **Komedi çocuğun mantığından gelir.** Çocuk dünyayı kendi kuralıyla açıklar ve o kurala ciddiyetle uyar. Büyükler bu mantığı düzeltmez, içine girer; kısa konuşur, ders vermez.
   **Bizde:** "Tek hızlı çorap yalnız tek ayağı hızlandırır", bu yüzden Kino daire çizerek koşar. Baba da oyuna katılır: "Benimki de hızlı."
4. **Yanlış anlama.** Büyük mecazlı ya da yarım bir söz söyler, çocuk onu kelimesi kelimesine alır. Bu, hayal sahnesinin kapısıdır.
   **Bizde:** Dede "Rüzgâr almıştır. Uçmuştur." der; Kino çorabın gerçekten uçtuğunu sanır. Bıdık da sarı, uzun çorabı muz sanır.
5. **Abartılı hayal sahnesi (Caillou'nun imzası).** Gerçek bir an birden büyük bir fanteziye döner. 20-40 sn sürer ve sert bir dönüşle gerçeğe biter. Komedi bu karşıtlıktadır: hayalde gökte uçan bir kahraman, gerçekte bahçede kollarını açmış "vıııın" yapan bir çocuk vardır.
   **Bizde:** Bölüm başına bir hayal, 30-40 sn.
6. **Beden komedisi.** Takılma, sekme, kayma, iri ve abartılı tepkiler. Bizim ek kanallarımız kulak ve kuyruk.
   **Bizde:** Kino sepete dalar, Baba'nın göbeği jöle gibi sallanır, çorap lastik gibi uzayıp şaplak atar.
7. **Tekrar eden şaka, üç kez.** Şaka kurulur, tekrarlanır, üçüncüsünde ters döner. Süregelen ev şakaları bölümler boyunca yaşar.
   **Bizde:** Baba'yı "çay" sözü uyandırır. Önce Anne bunu söyler, sonra Dede yapar, en sonunda Lokum "Tay!" der.
   **Ayrıca:** İzleyicinin bildiği, kahramanın bilmediği gizli bir şaka var: kırmızı çorap bütün bölüm boyunca Kuzu'nun başında.
8. **Duygusal an kısadır.** Bluey'de kalbe dokunan an çoğu zaman son dakikadadır ve birkaç cümle sürer. Caillou'da hayal kırıklığı bir yüz ifadesi ve tek bir cümledir. Uzun konuşma, ağlama ya da saklanma olmaz; an bir şakayla ya da bir hareketle kapanır.
   **Bizde:** 10-20 sn, son üçte birde.
9. **Anlatıcı az konuşur.** Caillou'da anlatıcı geçişleri bağlar ve çocuğun içinden geçeni bir cümleyle söyler; karakterler konuşurken susar. Bluey'de anlatıcı hiç yok.
   **Bizde:** Bölüm başına 7 cümle ve bölüm adı. Sahne başına en çok 2 cümle, bazı sahnelerde hiç yok.
10. **Bitiş: çözüm, ters dönüş, düğme.** İstek çözülür ama beklenmedik bir yoldan: kazanan beklenen kişi değildir. Son kare bir geri çağırma şakasıdır; ardından tek bir sıcak cümle ve kart gelir. Ders cümlesi olmaz.

**Ek kural (Barış, 2026-10-11):** Dünya hep canlıdır. Bluey'nin de Caillou'nun da arka planında hep bir şey kıpırdar: kuş, perde, kardeş, bir yan olay. Ekranda hiçbir an boş kalmaz (§2.6).

---

## 1. Künye

- **Konu:**
  - Kino bugün parkta Mino'yla yarışacak. "Hızlı çorapları" olmadan koşamayacağına inanıyor. Ama kırmızı çorabın biri yok.
  - Anne'nin resimli listesiyle evi, salonu, antreyi ve Babaanne'nin bahçesini arar. Ayakta uyuyan Baba'yı "çay" sözüyle uyandırır.
  - Dede'nin "uçmuştur" sözüyle çorabın parka uçtuğunu hayal eder. Yolda Bıdık, Baba'nın dev sarı çorabını muz sanır.
  - Parkta kırmızı bir şey yakalar; o şey Mino'nun fuları çıkar.
  - Sonunda Lokum Kuzu'yu havaya kaldırır: çorap bütün gün Kuzu'nun başındaymış, "Kuzu da hızlı olsun" diye. Yarışı Lokum kazanır.
- **Neden bu konu?**
  - Kayıp çorap her evin her sabahıdır. 3-5 yaşındaki çocuk durumu hemen tanır, anne de güler.
  - Arayış, sahneyi kendiliğinden hareketli yapar. Her sahne başka bir yerde geçer ve karakterler yürür, koşar, zıplar. Önden kukla için en uygun biçim budur.
  - İlk bölüm olarak bütün aileyi birer şakayla tanıtır: Anne'nin listesi, Baba'nın uykusu, Babaanne'nin pişisi, Dede'nin kuru sözü, Lokum'un taklidi. İki yeni yan karakteri de getirir: Bıdık ve Bıdıcık. Mino'nun imza sözü "Hadi, yarışalım!" bölümün hedefi olur.
  - Kardeş ilişkisi kalır, ama kıskançlık yerine hayranlık ve taklit vardır. Lokum çorabı abisi gibi hızlı olmak için almıştır.
  - Bilgi kendiliğinden içinde: çift, renkler, büyük-orta-küçük, 1-5 sayma.
  - Bildiğim kadarıyla Bluey ya da Caillou'da bu kurguda bir bölüm yok. Seri kitabı §7 gereği yönetici bir kez kontrol etsin.
- **Süregelen şakalar:**

  | Şaka | Kurulur | Tekrar | Doruk / ters dönüş |
  |---|---|---|---|
  | Baba ayakta uyur, yalnız "çay" sözü uyandırır | S3 (Anne: "Çay de.") | S4 (Dede: "Murat. Çay.") | S8 (Lokum: "Tay!") |
  | Kırmızı çorap Kuzu'nun başında: izleyici görür, Kino görmez | S1 | S2, S3, S4 (Kuzu boş mandalda!), S5 (hayalde bile), S6 (Bıdık koklar) | S7 ortaya çıkar |
  | Lokum her şeyi taklit eder | S1 daire koşusu | S2 çorap şapka, S4 mandal, S6 hıçkırık | S8 "çay" numarasını kendisi yapar |
  | Baba'nın dev sarı çorabı | S2 sepetten çıkar | S3 giyilir, S4-S5 "flop flop", S6 muz sanılır | S8 bitiş bayrağı olur, sonra Kuzu'yu yutar |
  | Tek çorap, tek hızlı ayak | S1 daire koşusu | — | S8 iki çorapla "dümdüz!" |
  | Dede'nin kuru sözü | S4 "Rüzgâr almıştır. Uçmuştur." | S5 "Bak sen şu işe." | — |
  | Mahalle kedisi Pamuk (arka plan) | S4 duvarda Kuzu'yu dürter | S5 Kino'yu taklit edip "uçak" olur, S6 paspasta uyur | S8 bitişte Baba'yla birlikte esner |

- **Resimle bilgi** (hiçbiri ders gibi söylenmez, olayın içinden çıkar):
  - **Çift:** S1'de "Bir… iki?" ve S8'de "İki çorap! Bir, iki!". Ekranda ayakların üstünde iri **1** ve **2** belirir.
  - **Renkler:** S2'de sepetten uçan sarı, mavi ve yeşil çoraplar; S4'te ipteki sarı, mavi, yeşil ve turuncu çamaşırlar.
  - **Büyük-orta-küçük:** S2'de Baba'nın kocaman, Anne'nin orta, Lokum'un minicik çorabı yan yana dizilir.
  - **1-5 sayma:** S4'te mandallar sayılır ve her mandalın üstünde rakam belirir. S8'de arka planda anne ördek ve **3 yavru** koşar.
  - **Sıra:** Anne'nin resimli listesinde 1 sepet, 2 Baba, 3 Babaanne yazar. Kino okuyamadığı için Anne liste yerine resim çizer.
  - **Renk ve şekil ipucu:** S6'da Bıdık "Sarı, uzun… muz!" der (yanlış ama mantıklı).
- **Duygu eğrisi:** heves (yarış!) → şaşkınlık (tek çorap) → kahkaha (daire koşusu) → arayış coşkusu → hayal (uçuş) → komik engel (Bıdık) → **kısa bozulma (~11 sn)** → kahkaha (Kuzu!) → yarış coşkusu → kahkaha (Lokum kazandı, Kuzu kayboldu).
- **Lokum'un bu bölümdeki yeni sözcüğü:** **"Hızlı!"**.
- **Türk evi:** Babaanne'nin pişisi ve çamaşır ipindeki mandallar, ince belli bardakta çay, fırından dönen Baba'nın ekmek torbası, kapının üstündeki nazar boncuğu.
- **Kapanış kartı** (Kino'nun sesiyle): ***"Kuzu da hızlı olmak istemiş!"***

## 2. Teknik

### 2.1 Mekânlar (hepsi var ya da çiziliyor; yeni mekân yok)

| Kod | Yer | Sahne | Not |
|---|---|---|---|
| M0 | Çınar Apartmanı önü (cephe, kapı, kaldırım) | Açılış, S6 | Seri açılışıyla ortak |
| M1 | Çocuk odası, sabah ışığı | S1 | |
| M2 | Salon ve antre ucu (tek geniş set) | S2, S3 | Kamera salondan antreye kayar |
| M4 | Babaanne'nin bahçesi | S4, S5 dönüşü | Limon ağacının yanına **çamaşır ipi** eklenir (eşya, ayrı katman) |
| P | Park (`assets/film/park` + `esya/kaydirak`, `salincak`, `kum-havuzu`, `bank`) | S7, S8 | |
| H | **Hayal göğü** | S5 | Yeni mekân değil. M0'ın gök ve çınar katmanları kullanılır; renkler bir ton doygun, kenarlarda yumuşak parıltı. Ufukta parkın `arka-uzak` katmanı görünür. |

### 2.2 Oyuncular

| Karakter | Kit | Sahneler |
|---|---|---|
| Anlatıcı | ses | Açılış, S1, S3, S5, S7, S8 |
| Kino | önden kit | her sahne |
| Lokum (+ Kuzu) | önden kit | her sahne |
| Anne | önden kit | S2, S3 (yalnız kafası kapıdan) |
| Baba | önden kit | S2 (arkada, kapı aralığından), S3-S8 |
| Babaanne, Dede | önden kit | S4, S5 |
| **Bıdık** (yeni) | **önden kit gerekir** (model kartı, Gemini) | S6, S8 (arkadan koşar) |
| **Bıdıcık** (yeni) | **önden kit gerekir**; çekçeğin içinde, yalnız beli ve üstü görünür | S6 |
| Mino | önden kit | S7, S8 |
| **Arka plan çocukları:** Tombi, Bulut, Zıpzıp (sessiz) | her biri **tek önden poz + basit döngü** (sallanma, zıplama); yakın plan yok | S7, S8 |
| **Hayvanlar** (sessiz, döngü) | mahalle kedisi Pamuk (krem tekir; gerinme, uyuma, kuyruk sallama); serçe; güvercinler (3); kelebek; fanusta kırmızı balık; anne ördek + 3 yavru | S1-S8 (§2.4) |

**Teknik uyum:** Bu bölümde **oturma 0, yatma 0, sarılma 0**. Herkes ayakta. Yürüme ve koşma önden sekme döngüsüyle yapılır. Daire koşusu derinlik ölçeğiyle verilir: arkaya giden küçülür, öne gelen büyür. Kucakta taşıma da yok. Arka plan hayvanları ve çocukları tek çizim üstünde döngüyle oynar: sallanma, dönme, sekme. Rig gerekmez.

### 2.3 Bölüme özel pozlar (5 tane; Gemini çizer, Adobe temizler)

| Kod | Poz | Sahne |
|---|---|---|
| P1 | Kino tek ayak üstünde, hafif öne eğik, iki eliyle kırmızı çorabı öbür ayağına çekiyor. Dil dışarıda, kulaklar sallanıyor. | S1 |
| P2 | Kino çamaşır sepetine dalmış: önde sepet katmanı, sepetten yalnız iki bacağı ve kestane kuyruğu yukarı çıkıyor, tekmeliyor. | S2 |
| P3 | Kino "uçuş": kollar iki yana açık, kulaklar ve fular rüzgârda geriye savrulmuş, gövde öne eğik. Hayalde gökte, dönüşte bahçede aynı poz. | S5 |
| P4 | Bıdık geriye yaslanmış, dişleriyle bir şeyi çekiyor; yanaklar şişkin, gözler kısık. | S6 |
| P5 | Önden koşu döngüsü, 2 kare (Kino ve Mino): kollar savrulmuş, bir ayak havada, kulaklar geriye uçmuş. | S1, S8 |

### 2.4 Kostüm ve eşya ekleri

- **Kino'nun ayakları** (değiştirilebilir parçalar):
  - kırmızı çoraplı ayak;
  - çıplak beyaz ayak;
  - **dev sarı çorap tüpü**: dize kadar çıkar, ucu kemikli ayrı bir parçadır ve kuyruk gibi "flop flop" sallanır.
  - S3'ten sonra kırmızı spor ayakkabılar giyilir. Konçlar ayakkabının üstünden görünür: bir yanda kırmızı konç, öbür yanda dev sarı tüp.
- **Kuzu'nun kırmızı çorap şapkası:** Kuzu eşyasına üst katman. Bütün bölüm boyunca net görünür, gizli değildir.
- **Çoraplar:** sarı (lambaya konar), yeşil (fanusa konar), turuncu çizgili (Lokum'un şapkası), minicik pembe (Lokum'un), orta mavi (Anne'nin), dev sarı (Baba'nın).
- **Çocuk odası (canlılık):** tül perde (dalgalanma döngüsü); tavanda ay-yıldız mobili (dönme); serçe (3 kare: konma, gagalama, uçma); Lokum'un karyolasındaki çıngırak (sallanma); yerde güneş lekesi ve toz zerreleri.
- **Salon ve antre:**
  - çamaşır sepeti (ön katman);
  - Anne'nin not defteri ve **resimli liste** yakın planı (1 sepet, 2 bıyık, 3 limon ağacı; çocuk çizimi gibi değil, Anne'nin sade çizgisi);
  - Baba'nın ekmek torbası (ağzından simit uçları görünür; buhar tüter);
  - canlılık: **sarkaçlı duvar saati**, büfenin üstünde **fanusta kırmızı balık**, tül perde, balkon kapısının önünde fesleğen saksısı, sehpada demlikten buhar, kapının üstünde **nazar boncuğu**, askılıkta ceketler.
- **Bahçe:** çamaşır ipi, 5 mandal, 4 çamaşır (sarı havlu, mavi gömlek, yeşil önlük, turuncu tişört), limon, ince belli çay bardağı, pişi tabağı, çaydanlık; canlılık: düşen limon yaprakları, kelebek, tarhta dönen küçük fıskiye, duvarda **kedi Pamuk**.
- **Hayal:**
  - gözlü kırmızı çorap (3 kıvrılma karesi);
  - çoraplı güvercin (tek çizim, 3 renk: sarı, mavi, yeşil minik çorap);
  - **Baba'nın yüzü biçiminde, horlayan bulut** (şişip inen tek çizim);
  - bacalardan çıkan duman;
  - uzakta bir uçurtma.
- **Apartman önü:** güvercinler (3, yem gagalama döngüsü), balkon çamaşırları, kapı önündeki paspas ve üstünde uyuyan Pamuk, çınar yaprakları.
- **Bıdık'lar:** turuncu çekçek (oyuncak el arabası değil, ip kollu çocuk vagonu).
- **Park:**
  - Mino'nun kırmızı fularının uzun, rüzgârda dalgalanan hâli (kaydırağın tepesinde);
  - sarı balon;
  - Tombi'nin kovası ve kum pastası;
  - Zıpzıp'ın atlama ipi;
  - anne ördek ve 3 yavru;
  - bankın yanında kumrular.

### 2.5 Ses ve müzik

- **Müzik** (`assets/muzik/`):
  - `film-acilis`: açılış;
  - `film-merak`: S1-S2;
  - `film-gecis`: sahne geçişleri;
  - `film-fon-pazar`: S4 bahçe;
  - `film-surpriz`: S5 hayal;
  - `film-kovalamaca`: S6-S8;
  - `film-uzgun`: yalnız S7'deki kısa anda, iki nota, çok hafif;
  - `film-kutlama`: S8, "Lokum kazandı!";
  - `film-kapanis`: kart ve jenerik.
- **Olay efektleri:**
  - mevcut: `pof`, `kikir`, `horlama`, `ayak`, `hih`, `zil`;
  - yeni (Web Audio sentezi ya da kısa kayıt): `pit-pat` (çoraplı ve çıplak ayak), `firt` (fırlatılan çorap), `boing` (göbek), `tok` (limon), `flop` (dev çorabın ucu), `piiing` (lastik gibi geri dönen çorap), `ruzgar` (hayal), `kanat` (güvercin).
- **Canlılık sesleri** (fon; her biri döngülü ya da rastgele aralıklı, çok hafif, konuşmanın altında kalır):

  | Ses | Dosya önerisi | Sahne | Durum |
  |---|---|---|---|
  | Sabah kuşları, serçe cıvıltısı | `kus-cik` | S1, S4, S6 | `public/ses/efekt/kus.mp3` var; fon döngüsü yeni |
  | Duvar saati tik-tak | `tik-tak` | S2, S3 (antrede uzaktan) | yeni |
  | Demlik / çaydanlık buharı | `buhar` | S2, S4 | yeni |
  | Fanus baloncuğu | `blup` | S2 | yeni |
  | Perde ve rüzgâr hışırtısı | `hisirti` | S1, S2, S4 | yeni |
  | Horlama (2 çeşit, sevimli) | `horlama` | S2 (uzaktan), S3, S4, S8 | var |
  | Nazar boncuğu tıkırtısı | `tikirti` | S3 | yeni |
  | Fıskiye | `fiskiye` | S4 | yeni |
  | Kedi mırlaması ve esnemesi | `mirr` | S4, S5, S6, S8 | `kedi.mp3` var; mırlama yeni |
  | Güvercin "gugu" | `gugu` | S5, S6 | yeni |
  | Uzak araba ve bisiklet zili | `bisiklet-zil` | S6 | `zil.mp3` uyarlanır |
  | Uzak çocuk kahkahaları | `park-fon` | S7, S8 | yeni |
  | Salıncak gıcırtısı | `salincak-gicir` | S7, S8 | yeni |
  | İp atlama "şap şap" | `ip-sap` | S7, S8 | yeni |
  | Ördek "vak" | `vak` | S8 | `ordek.mp3` var |
  | Balon kayması (ince ıslık) | `balon-uc` | S7 | `balon.mp3` uyarlanır |

### 2.6 Kamera dili ve boşluk kuralı

- **TV çizgi filmi gibi:** geniş plan, orta plan, yakın plan, tepki çekimi, omuz üstü. Kamera çocuk göz hizasında. Kimse kameraya bakmaz, kameraya konuşmaz.
- **Geçişler (Seri 2 kuralı):**
  - **düz:** aynı an içinde plan değişimi;
  - **kayma (0,5 sn):** zaman ya da yer sıçraması; hayale giriş;
  - **kararma (0,4 sn):** zaman ya da yer sıçraması; hayalden çıkış.
- **Omuz üstü:** ön plandaki karakterin yalnız arkadan kulak ve omuz silueti görünür. Model sayfasındaki arka görünüşten tek parça alınır ve bulanık ön katman olarak kullanılır; rig gerekmez.
- **Gizli şaka kuralı:** Kuzu'nun kırmızı şapkası her sahnede **en az 2 sn net ve kadrajın içinde** görünür. Kino'nun bakışı ise hep başka yöndedir.
- **Boşluk kuralı (Barış, 2026-10-11):**
  1. **Hiçbir çekim 10 sn'yi geçmez.** Bu bölümde en uzun çekim 10 sn.
  2. **Hiçbir karakter 2-3 sn'den fazla hareketsiz kalmaz.**
     - Konuşmayan karakter tepki verir: kulak, kuyruk, göz, kaş.
     - Ya da kıpırdanır veya bir şeyle oynar.
     - Ayakta uyuyan Baba bile hareket halindedir: nefesle göbek kalkıp iner, bıyık havalanır, gövde hafifçe sallanır.
  3. **Replikler arasında 1 sn'den uzun boşluk yok.** Konuşma dursa bile ekranda bir eylem sürer.
  4. **Kadrajda hep 3 hareket katmanı:**
     - **ön plan:** konuşan ya da eylem yapan;
     - **orta plan:** kalabalık, yani başka bir karakterin kendi işi;
     - **arka plan:** canlılık katmanı.
  5. **Her sahnede en az bir arka plan şakası** var: izleyicinin fark edip güleceği küçük bir yan olay. Ön plandaki konuşmayı bölmez, kendi küçük sonu vardır.
  6. **Canlılık döngüleri ucuzdur:** her biri tek çizim üstünde sinüs sallanma, dönme ya da 2-3 karelik değiştirme. Döngü süreleri birbirine eşit olmaz (2,3 sn, 3,1 sn, 4,7 sn…); aynı anda tekrar edip makine gibi durmasınlar.

### 2.7 Replik biçimi

- Kimlik `b01-<sahne>-<kim>-<no>` biçimindedir. Ses dosyası `ekip/ses/seri2-gelen/<kimlik>.mp3` olur.
- Metin ElevenLabs v4'e olduğu gibi yapıştırılır. Replik başına 1-2 etiket.
- Lokum bebek konuşur: R yerine Y, Ç yerine T ("çoyap", "Tay!").
- Bıdık sözün ortasına "meee" kaçırır ve hıçkırır.
- Karakter cümlesi en çok 6-7 kelime, anlatıcı cümlesi en çok 10-12 kelime.
- Replikler arka arkaya bağlanır: bir replik bitince ötekisi 0,2-0,8 sn içinde başlar (§2.6).

---

## AÇILIŞ (0:00-0:15) · M0

- **Olur:** Seri açılışının kısa hâli. Kamera çınarın dallarından cepheye süzülür.
  - Dede bahçede fesleğen sular. Babaanne pencereden el sallar.
  - Balkonda Baba ayakta uyuyor, elinde fincan.
  - Lokum korkuluğa tutunmuş zıplıyor.
  - Kino korkuluğun üstünden başını çıkarır, kulakları sallanır.
  - Karşı pencerede Mino el sallar.
  - Yazı belirir: **"Kino ve Ailesi"**.
- **Canlılık:** Çınar yaprakları sallanır; balkon çamaşırları dalgalanır; iki güvercin çatıdan havalanır; Pamuk kapı önünde gerinir.
- **Arka plan şakası:** Baba'nın fincanı her horlamada eğilir; fincandaki çay tam dökülecekken Baba uykusunda doğrultur.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş, aşağıdan yukarı kayma | 6 sn | Çınar, bahçe, Dede, Babaanne | kamera; çınar yaprakları; Dede'nin sulama kabından su; Babaanne el sallıyor; güvercinler havalanıyor | — |
| 2 | Orta, balkon | 4 sn | Uyuyan Baba, zıplayan Lokum, Kino'nun başı | Lokum zıplıyor; Kino'nun kulakları; Baba'nın fincanı eğilip doğruluyor; çamaşırlar | düz |
| 3 | Geniş, geri çekilme | 5 sn | Bütün cephe, herkes el sallar, logo | herkes el sallıyor; logo zıplayarak oturuyor; Pamuk geriniyor | düz |

- `b01-ac-anl-01` ANLATICI: `[happy] Kino ve Ailesi. Hızlı Çoraplar.`

---

## SAHNE 1 · Tek Çorap (0:15-1:00, 45 sn) · M1 sabah

- **Eylem:** Kino tek kırmızı çorabını giyer. İkincisini bulamaz ve tek çorapla koşmayı dener.
- **Şaka:** Tek "hızlı" çorap yalnız bir ayağı hızlandırır, bu yüzden Kino odada daire çizerek koşar. Lokum taklit eder. Sonunda ikisinin de başı döner, kulakları pervane olur.
- **Bilgi:** çift (bir, iki).
- **Kuzu:** Lokum'un elinde, başında kırmızı çorap (çekim 1'de arkada, çekim 5'te net).
- **Canlılık katmanı:**
  1. Açık pencerede tül perde rüzgârla dalgalanır (`hisirti`).
  2. Tavandaki ay-yıldız mobili yavaşça döner; Kino koşunca hızlanır.
  3. Yerde güneş lekesi; içinde toz zerreleri süzülür.
  4. Lokum'un karyolasındaki çıngırak, odada her koşuşta sallanır.
  5. Pencerenin dışında çınar dalı sallanır, sabah kuşları cıvıldar (`kus-cik`).
- **Arka plan şakası:** Pencere pervazına bir serçe konar. Kino'nun daire koşusunu başıyla takip eder, başı fırıl fırıl döner. Sersemleyip pervazdan devrilir ve hemen uçup gider (`pıt`, `kanat`).
- **Ön plan kalabalığı:** Lokum bütün sahne boyunca kapıda. Önce Kuzu'yu havada zıplatır, sonra Kino'yu taklit eder. Konuşmadığı her an bir şey yapıyor.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş | 10 sn | Kino tek ayakta zıplaya zıplaya kadraja girer, kırmızı çorabı çekiyor (P1). Arkada kapıda Lokum. | Kino zıplıyor, kulaklar sallanıyor; Lokum Kuzu'yu havada zıplatıyor; perde; mobil; serçe pervaza konuyor | kayma (açılıştan) |
| 2 | Yakın, sonra aşağı kayma | 8 sn | Kino'nun elinde tek çorap kalmış; odaya bakar. Kamera iki ayağa iner: biri kırmızı çoraplı, biri çıplak. Üstlerinde iri **1** ve **?** belirir. | Kino'nun gözleri sağa sola, kulakları kalkıp iniyor; çıplak ayak parmakları oynuyor; 1 ve ? zıplayarak beliriyor; arkada toz zerreleri | düz |
| 3 | Orta | 4 sn | Kino göğsünü gerer, kuyruğu dikilir. | kuyruk dikilip sallanıyor; arkada serçe başını yana yatırıyor | düz |
| 4 | Geniş, sabit kamera | 10 sn | Kino koşar ama daire çizer (P5; derinlik ölçeği). | Kino daire çiziyor; mobil hızlanıyor; çıngırak sallanıyor; serçenin başı dönüyor | düz |
| 5 | Tepki, Lokum | 4 sn | Lokum kapıda Kuzu'yu sıkıca tutup o da daireye girer. Kuzu'nun kırmızı şapkası net görünür. | Lokum dönüyor; Kuzu'nun şapkası savruluyor; arkada Kino geçiyor | düz |
| 6 | Orta, iki kişilik | 9 sn | İkisi durur, sallanır, kulakları pervane. Pervazda serçe devrilip uçar. Kino "Anne!" diye koridora fırlar. | iki gövde sallanıyor; kulaklar dönüyor; serçe düşüp uçuyor; Kino koşarak çıkıyor, Lokum peşinden | düz → kayma |

- `b01-s1-anl-01` ANLATICI: `[happy] Cumartesiydi. Kino'nun parkta Mino'yla büyük bir yarışı vardı.`
- `b01-s1-kino-01` KİNO (zıplarken): `[excited] Hızlı çoraplarım! Bunlarla rüzgâr gibi koşarım!`
- `b01-s1-kino-02` KİNO: `[curious] Bir… iki? İkincisi nerede?`
- `b01-s1-kino-03` KİNO (göğsünü gerer): `[proudly] Olsun! Tek çorapla da koşarım!`
- *Koşu başlar: `pit-pat` (çoraplı ayak "pıt", çıplak ayak "pat").*
- `b01-s1-anl-02` ANLATICI: `[chuckles] Ama tek çorap, yalnız tek ayağı hızlandırıyordu.`
- `b01-s1-lok-01` LOKUM (o da daireye girer): `[giggles] Abiii! Ben de!`
- `b01-s1-kino-04` KİNO (sallanır): `[laughs] Başım döndü…`
- `b01-s1-lok-02` LOKUM (sallanır): `[giggles] Döndü! Döndü!`
- `b01-s1-kino-05` KİNO (koridora fırlar): `[excited] Anneee!`

## SAHNE 2 · Çamaşır Sepeti (1:00-1:40, 40 sn) · M2 salon

- **Eylem:** Anne resimli bir liste çizer. Kino sepette çorap arar.
- **Şaka:**
  - Kino sepete dalar; yalnız bacakları ve kuyruğu dışarıda kalır. Çoraplar omzunun üstünden uçar: sarı lambaya, mavi Anne'nin başına konar.
  - Anne istifini bozmadan yazmaya devam eder.
  - Lokum sepetten turuncu çizgili bir çorap kapıp kendi başına geçirir; Kuzu'yla "aynı şapka" olurlar.
- **Bilgi:** renkler (sarı, mavi, yeşil); büyük-orta-küçük; liste sırası 1-2-3.
- **Kuzu:** Lokum'un yanında. İkisi de başında çorapla yan yana durur (çekim 4).
- **Canlılık katmanı:**
  1. Duvar saatinin sarkacı sallanır (`tik-tak`).
  2. Büfenin üstündeki fanusta kırmızı balık yüzer, baloncuk çıkarır (`blup`).
  3. Balkon kapısının tül perdesi dalgalanır; önündeki fesleğen yaprakları titrer.
  4. Sehpadaki demlikten buhar tüter (`buhar`).
  5. Pencerenin önünden iki kuş kanat çırparak geçer.
- **Arka plan şakası:** Uçan çoraplardan yeşil olanı fanusun üstüne düşer; fanus şapka giymiş gibi olur. Balık yukarı bakar, kocaman bir baloncuk çıkarır ve şapkanın altında daireler çizer.
- **Ön plan kalabalığı:**
  - Antre kapısının aralığından ayakta uyuyan Baba'nın göbeği görünür. Göbek her horlamada kalkıp iner (`horlama`, uzaktan); bu, S3'ü hazırlar.
  - Lokum yerdeki çorapları tek tek toplayıp Kuzu'ya giydirmeye uğraşır.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş | 8 sn | Kino `pit-pat` koşarak salona girer. Anne kanepenin yanında ayakta, elinde not defteri. Kapı aralığında Baba'nın göbeği. | Kino koşuyor; Anne'nin kalemi yazıyor; sarkaç; demlik buharı; Baba'nın göbeği kalkıp iniyor | kayma |
| 2 | Yakın, liste | 7 sn | Anne kâğıda çizer: büyük **1** ve sepet, **2** ve bıyık, **3** ve limon ağacı. Kino'nun burnu kadrajın kenarından uzanır. | kalem çiziyor, resimler sırayla beliriyor; Kino'nun burnu ve kulak ucu kıpırdıyor | düz |
| 3 | Orta | 8 sn | Kino sepete dalar (P2). Sarı, mavi, yeşil çoraplar havada (`firt` ×3). | bacaklar ve kuyruk tekmeliyor; çoraplar yay çizip uçuyor; sarı lambaya, yeşil fanusa konuyor | düz |
| 4 | Tepki, iki kişilik | 4 sn | Anne başında mavi çorapla kaşını kaldırır, yazmayı sürdürür. Yanında Lokum turuncu çizgili bir çorabı başına geçirmiş; Kuzu da kırmızı şapkasıyla. | Anne'nin kaşı kalkıyor, kalemi yürüyor; Lokum Kuzu'yu kendi yüzünün yanına tutuyor; arkada fanusta balık daire çiziyor | düz |
| 5 | Orta | 9 sn | Kino sepetten fırlar, üç çorabı kanepenin koluna dizer. Her biri sırayla hafifçe parlar: kocaman sarı, orta mavi, minicik pembe. | Kino'nun elleri diziyor; çoraplar sırayla zıplıyor; kuyruk sallanıyor; Lokum arkada sepetten çorap çekiyor; perde | düz |
| 6 | Yakın, Anne | 4 sn | Anne kâğıdı gösterir; Kino dev sarı çorabı kapıp koşar. | Anne'nin parmağı "2"yi gösteriyor; Kino'nun kuyruğu kadrajdan çıkıyor; Lokum peşinden paytak paytak | düz → kayma |

- `b01-s2-kino-01` KİNO: `[gasps] Anne! Hızlı çorabım kayboldu!`
- `b01-s2-anne-01` ANNE (yazar): `[chuckles] Ne yapsak acaba? Liste yapalım.`
- `b01-s2-anne-02` ANNE (kâğıdı uzatır): `[happy] Resimli liste. Bir, iki, üç.`
- `b01-s2-kino-02` KİNO (kâğıda bakar, sepete döner): `[excited] Bir: sepet!`
- `b01-s2-kino-03` KİNO (sepetin içinden, boğuk): `[excited] Sarı değil! Mavi değil! Yeşil değil!`
- `b01-s2-lok-01` LOKUM (başına çorap geçirir): `[giggles] Şapka! Abi, şapka!`
- `b01-s2-kino-04` KİNO (dizer): `[proudly] Kocaman, Baba'nın. Orta, Anne'nin.`
- `b01-s2-kino-05` KİNO: `[giggles] Minicik, Lokum'un. [sighs] Benimki yok!`
- `b01-s2-anne-03` ANNE (kâğıdı gösterir; mavi çorap hâlâ başında): `[chuckles] İki numara: Baba.`

## SAHNE 3 · Çay mı? Kalktım! (1:40-2:20, 40 sn) · M2 antre ucu

- **Eylem:** Kino Baba'yı uyandırmaya çalışır.
- **Şaka:**
  - Baba fırından yeni dönmüş, antrede ayakta uyuyor. Ekmek torbası koltuğunun altında, bıyığı her horlamada havalanıyor.
  - Kino göbeğini dürter; göbek jöle gibi sallanır (`boing`), Baba uyanmaz. Lokum Kuzu'yu Baba'nın burnuna uzatır; yine uyanmaz.
  - Tek sihirli söz: **"çay"**.
- **Kuzu:** Kırmızı şapkasıyla Baba'nın burnunun dibinde (çekim 2). Kino o anda göbeğe bakıyor.
- **Canlılık katmanı:**
  1. Baba'nın bıyığı her horlamada havalanır; göbeği nefesle kalkıp iner; gövdesi hafifçe sallanır.
  2. Ekmek torbasının ağzından sıcak ekmek buharı tüter.
  3. Kapının üstündeki nazar boncuğu horlamanın titreşimiyle sallanır, tıkırdar (`tikirti`).
  4. Askılıktaki ceketlerin kolları her horlamada kıpırdar.
  5. Dış kapının buzlu camında bir komşunun gölgesi merdivenden iner; salondan saat sesi duyulur (`tik-tak`, uzak).
- **Arka plan şakası:** Her horlamada torbadan bir simit kayar. Lokum altında bekler: ilk simidi yakalayıp Kuzu'nun boynuna bilezik gibi takar, ikincisini kendi koluna, üçüncüsünü ısırır. Sahnenin sonunda Lokum'un iki kolunda simit vardır.
- **Ön plan kalabalığı:** Anne salon kapısından bakar (başında hâlâ mavi çorap). Lokum simit toplar. Kino uyandırma denemelerini yapar.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş | 6 sn | Antre. Baba dış kapının önünde ayakta uyuyor (gözler kapalı, `horlama`). | göbek ve bıyık; nazar boncuğu; ekmek buharı; ilk simit kayıyor, Lokum yakalıyor | kayma |
| 2 | Orta, Kino ve Baba | 9 sn | Kino göbeği dürter (`boing` ×2). Lokum Kuzu'yu Baba'nın burnuna kaldırır. Horlama sürer. | göbek jöle gibi dalgalanıyor; Kino'nun kulakları her dürtüşte zıplıyor; Kuzu'nun şapkası Baba'nın bıyığını kaldırıyor; ikinci simit kayıyor | düz |
| 3 | Yakın, Anne | 3 sn | Anne'nin başı salon kapısından uzanır; mavi çorap hâlâ başında. | Anne'nin başı kapıdan kayarak giriyor; kaşı kalkıyor; mavi çorabın ucu sallanıyor | düz |
| 4 | Omuz üstü (Baba'nın arkası bulanık ön planda) | 3 sn | Kino eliyle ağzını kapatıp fısıldar. | Kino'nun kulakları öne eğiliyor, parmak uçlarında yükseliyor; ön planda Baba'nın sırtı nefesle kalkıyor | düz |
| 5 | Orta | 9 sn | Baba'nın gözleri fal taşı gibi açılır. Ekmek torbası havaya uçar, Baba yakalar. | Baba sıçrıyor; torba ve simitler havada; Lokum simitleri havada kapmaya çalışıyor; nazar boncuğu fırlıyor | düz |
| 6 | Geniş | 10 sn | Kino dev sarı çorabı çeker (`pof` toz bulutu). Kırmızı ayakkabılar ayakta, sarı tüp dizine kadar. Kino koşar; sarı uç `flop flop` vurur. | toz bulutu; Kino zıplıyor ve koşuyor; sarı uç kuyruk gibi sallanıyor; Lokum kıkırdayıp simitli kollarını sallıyor; Baba esneyip gerinerek el sallıyor | düz → kayma ↓ |

- `b01-s3-anl-01` ANLATICI: `[chuckles] Baba fırından yeni dönmüştü. Ayakta bile uyuyabilirdi.`
- `b01-s3-kino-01` KİNO: `[curious] Baba? Çorabımı gördün mü?`
- `b01-s3-lok-01` LOKUM (Kuzu'yu uzatır): `[excited] Baba! Kuzu!`
- `b01-s3-anne-01` ANNE (kapıdan, kuru): `[softly] Çay de.`
- `b01-s3-kino-02` KİNO: `[whispers] Çay?`
- `b01-s3-baba-01` BABA: `[surprised] Çay mı? Kalktım!`
- `b01-s3-kino-03` KİNO: `[excited] Kırmızı çorabım nerede?`
- `b01-s3-baba-02` BABA: `[yawns] Babaanne yıkadı. Bahçede, ipte.`
- `b01-s3-baba-03` BABA (dev çorabı gösterir): `[chuckles] Şimdilik benimkini giy. O da hızlı.`
- `b01-s3-kino-04` KİNO (kapıdan fırlar): `[laughs] Üç: Babaanne!`

## SAHNE 4 · Boş Mandal (2:20-3:00, 40 sn) · M4 bahçe

- **Eylem:** Kino çamaşır ipindeki mandalları sayar; beşinci mandal boştur.
- **Şaka:**
  1. Baba limon ağacına yaslanır yaslanmaz uyur. Bir limon kafasına düşer (`tok`); yine uyanmaz. Dede ince belli bardağı burnunun dibine tutar.
  2. Babaanne konuşan Kino'nun ağzına bir pişi tıkar. Kino'nun yanakları balon gibi şişer.
  3. **Gizli şaka:** Arka planda Lokum parmak uçlarında Kuzu'yu **boş beşinci mandala** asar. Kuzu başındaki kırmızı çorapla ipte sallanır. Kino o sırada Dede'ye dönüktür.
- **Bilgi:** 1-5 sayma; renkler (sarı, mavi, yeşil, turuncu çamaşır).
- **Canlılık katmanı:**
  1. İpteki çamaşırlar rüzgârda dalgalanır (`hisirti`).
  2. Limon ağacından ara sıra bir yaprak süzülerek düşer.
  3. Fesleğen tarhında küçük fıskiye döner, su yay çizer (`fiskiye`).
  4. Bir kelebek tarhtan Babaanne'nin pişi tabağına, oradan Dede'nin kasketine konar.
  5. Masadaki çaydanlıktan buhar tüter (`buhar`); kuşlar cıvıldar (`kus-cik`).
  6. Bahçe duvarında mahalle kedisi Pamuk gerinir, kuyruğunu sallar (`mirr`).
- **Arka plan şakası:** Pamuk ipte sallanan Kuzu'yu fark eder. Patisiyle bir dürter, Kuzu ipte döner. Pamuk şaşırıp kuyruğunu kabartır ve duvarın öbür yanına kayıp gözden kaybolur. Bir saniye sonra yalnız kulakları duvarın üstünden yeniden çıkar.
- **Ön plan kalabalığı:**
  - Babaanne konuşurken ipten kuru çamaşırları toplar, kolundaki sepete koyar.
  - Dede çay bardağını yudumlar, fıskiyenin yönünü ayağıyla düzeltir.
  - Baba ağaçta uyuklar, sallanır.
  - Lokum Kuzu'yu asmaya uğraşır.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş | 8 sn | Bahçe. Baba ağaca yaslanır, `horlama`, `tok` (limon). Dede bardağı uzatır, Baba uyanır. | Baba kayıp sallanıyor; limon düşüp sekiyor; Dede'nin bardağından buhar; fıskiye; çamaşırlar; Pamuk geriniyor | kayma ↓ |
| 2 | Orta | 6 sn | Kino `flop flop` gelir. Babaanne pişiyi ağzına tıkar. | Kino koşup fren yapıyor, sarı uç savruluyor; yanaklar şişiyor; kulaklar havaya kalkıyor; kelebek pişi tabağından havalanıyor | düz |
| 3 | Yakın-orta, ip boyunca yavaş kayma | 10 sn | Mandallar soldan sağa; her birinin üstünde iri **1-5** belirir. Dördünde çamaşır var, beşincisi boş. | kamera kayıyor; rakamlar zıplayarak beliriyor; çamaşırlar dalgalanıyor; Kino'nun parmağı her mandala dokunuyor, mandal sekiyor | düz |
| 4 | Orta, Kino-Babaanne-Dede; arka plan net | 8 sn | Ön planda konuşma. Kadrajın sağında, ipte, Lokum Kuzu'yu boş mandala asar. Duvarda Pamuk Kuzu'yu dürter. | Babaanne çamaşır topluyor; Dede yudumluyor; Lokum parmak uçlarında uzanıyor; Kuzu dönüyor; Pamuk kayıp kayboluyor | düz |
| 5 | Yakın, Kino | 8 sn | Gözler kocaman, kulaklar yavaşça kalkar. Kamera göğe kayar. | kulaklar kalkıyor; kuyruk dikiliyor; ağzındaki pişi kırıntıları düşüyor; kamera yukarı kayarken bir limon yaprağı kadrajdan süzülüyor | kayma ↑ (hayale) |

- `b01-s4-dede-01` DEDE: `[sighs] Murat. Çay.`
- `b01-s4-baba-01` BABA: `[surprised] Çay mı? Kalktım!` *(S3'teki kayıt da kullanılabilir.)*
- `b01-s4-babaanne-01` BABAANNE (pişiyi tıkar): `[happy] Sizin için yaptım, sıcacık!`
- `b01-s4-kino-01` KİNO (yutar, sayar): `[gulps] Bir, iki, üç, dört, beş!`
- `b01-s4-kino-02` KİNO: `[gasps] Beşinci mandal boş!`
- `b01-s4-babaanne-02` BABAANNE: `[curious] Oraya asmıştım ama…`
- `b01-s4-dede-02` DEDE (çayını yudumlar): `[chuckles] Rüzgâr almıştır. Uçmuştur.`
- `b01-s4-kino-03` KİNO: `[gasps] Uçmuş mu?!`

## SAHNE 5 · Uçan Çorap, hayal (3:00-3:40, 40 sn) · H hayal göğü → M4

- **Eylem:** Kino hayalinde kollarını açıp uçar ve gözlü kırmızı çorabın peşine düşer.
- **Şaka:**
  - Çorap kıkırdayarak kıvrılır ve kaçar; Kino tam yakalayacakken elinden kayar.
  - Güvercinler de çorap giymiştir.
  - **Hayalde bile** Lokum yanında uçuyor ve elindeki Kuzu'nun başında kırmızı çorap var; Kino ileri bakıyor, görmüyor.
  - Dönüşte Kino gerçekte bahçede, parmak uçlarında kollarını açmış "vıııın" yapıyor. Herkes ona bakıyor.
- **Bilgi:** 1-2-3 sayma (güvercinler).
- **Hayal görünüşü:**
  - Aynı düz çizim, renkler bir ton daha doygun, kenarlarda yumuşak parıltı.
  - Kino'nun ayağında dev sarı çorap bayrak gibi dalgalanıyor.
  - Hayal karanlık ya da korkutucu değil; gök sabah mavisi.
- **Canlılık katmanı (hayal):**
  1. Bulutlar farklı hızlarda akar (paralaks).
  2. Kiremit çatıların bacalarından ince duman kıvrılır.
  3. Balkonlardaki çamaşırlar aşağıda rüzgârla dalgalanır.
  4. Uzakta bir uçurtma sallanır.
  5. Güvercinler kanat çırpar (`kanat`, `gugu`).
- **Arka plan şakası (hayal):** Bulutlardan biri Baba'nın yüzü biçiminde, bıyığı bile var. Horladıkça şişip iner (`horlama`, yankılı). Kırmızı çorap onun burnundan geçince bulut hapşırır ve dağılıp yeniden toplanır.
- **Canlılık (dönüş, bahçe):** S4'ün katmanı sürer (çamaşırlar, fıskiye, kelebek).
- **Arka plan şakası (dönüş):** Pamuk duvarda Kino'yu taklit eder: iki ön patisini yana açar, "uçak" olur, dengesini kaybedip duvardan aşağı kayar.
- **Ön plan kalabalığı:**
  - Hayalde: Lokum ve güvercinler.
  - Dönüşte: Babaanne elini ağzına kapatıp güler. Baba esner. Dede kaşını kaldırır. Lokum Kuzu'yu mandaldan alır.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş, gök | 8 sn | Çınarın tepesi, çatılar. Gözlü kırmızı çorap kıvrıla kıvrıla uçuyor (`ruzgar`). | çorap kıvrılıp dalıyor; bulutlar akıyor; baca dumanları; uçurtma; Baba-bulut şişip iniyor | kayma ↑ |
| 2 | Orta | 8 sn | Kino uçuyor (P3), çoraba uzanıyor; çorap kayıp kaçıyor. | Kino'nun gövdesi dalgalanıyor; kulaklar ve fular savruluyor; sarı çorap bayrak gibi; çorap elinden kayıyor | düz |
| 3 | Orta, iki kişilik | 6 sn | Yanında Lokum uçuyor, Kuzu'yu ileri tutmuş. Kuzu'nun kırmızı şapkası kadrajın ortasında. | Lokum'un ayakları çırpınıyor; Kuzu'nun şapkası dalgalanıyor; Kino ileri bakıp kulaklarını sallıyor; arkada Baba-bulut hapşırıp dağılıyor | düz |
| 4 | Geniş | 8 sn | Çorap üç çoraplı güvercinin arasından geçer (`kanat`), çınarın arkasından ufuktaki parka dalar. | güvercinler kanat çırpıyor, minik çorapları sallanıyor; çorap dalış yapıyor; Kino sayarken parmakları açılıyor | düz |
| 5 | Geniş, bahçe | 10 sn | Kino ipin önünde, parmak uçlarında P3 pozunda "vıııın" yapıyor. Babaanne, Dede, Baba bakıyor. | Kino sağa sola yatıyor; Pamuk "uçak" olup kayıyor; Babaanne gülüyor; Baba esniyor; Lokum Kuzu'yu mandaldan alıyor; çamaşırlar | kararma (hayalden çıkış) |

- `b01-s5-anl-01` ANLATICI: `[chuckles] Kino'nun aklında, çorabı çoktan havalanmıştı.`
- `b01-s5-kino-01` KİNO: `[excited] Dur, çorap! Gel buraya!`
- `b01-s5-lok-01` LOKUM: `[laughs] Vııı! Abiii!`
- `b01-s5-kino-02` KİNO: `[surprised] Bir, iki, üç güvercin… çoraplı!`
- `b01-s5-kino-03` KİNO: `[gasps] Parka iniyor!`
- *Kararma, bahçe.*
- `b01-s5-dede-01` DEDE (kaşlarını kaldırır): `[chuckles] Bak sen şu işe.`
- `b01-s5-kino-04` KİNO (kolları hâlâ açık): `[excited] Çorabım parka uçmuş! Hadi!`
- `b01-s5-baba-01` BABA: `[laughs] Zaten parka gidiyorduk.`

## SAHNE 6 · Muz Değil, Çorap (3:40-4:20, 40 sn) · M0 apartman önü

- **Eylem:** Apartmandan çıkarken kaldırımda Bıdık ve çekçekteki Bıdıcık'la karşılaşırlar.
- **Şaka:**
  1. Bıdık çekçeği geri geri çekerek gelir, Baba'nın göbeğine çarpar ve seker (`boing`).
  2. Kino'nun ayağındaki dev sarı çorabı muz sanıp ucunu dişler. Çekiştirme başlar: çorap lastik gibi uzar. Bıdık hıçkırınca ağzı açılır, çorap `piiing` diye geri döner ve Kino'nun bacağına şaplak atar.
  3. Lokum ile Bıdıcık birbirine hıçkırık taklidi yapar.
- **Bilgi:** renk ve şekil (sarı ve uzun… muz mu?).
- **Kuzu:** Bıdık Kuzu'nun kırmızı şapkasını koklar: "Bu da mı muz?" Lokum Kuzu'yu kendine çeker. Çok yaklaştı, kimse fark etmedi.
- **Canlılık katmanı:**
  1. Kaldırımda üç güvercin yem gagalar, sekerek yer değiştirir (`gugu`).
  2. Çınar yaprakları kaldırım boyunca rüzgârla yuvarlanır.
  3. Balkonlarda çamaşırlar dalgalanır; bir balkonda sardunya saksısı sallanır.
  4. Kapı önündeki paspasta Pamuk uyur; kuyruğunun ucu kıvrılıp açılır.
  5. Arka sokaktan bir bisiklet geçer, zilini çalar (`bisiklet-zil`); kuşlar cıvıldar.
- **Arka plan şakası:** Çekiştirmede sarı çorap tel gibi gerilince üç güvercin üstüne sıra sıra konar. Çorap `piiing` diye geri dönünce güvercinler havaya fırlar. Biri Baba'nın başına konar ve orada kalır; Baba fark etmez, sahnenin sonuna kadar başında güvercinle durur.
- **Ön plan kalabalığı:**
  - Bıdıcık çekçekte durmadan alkışlar ve zıplar.
  - Baba Lokum'un elini tutar, esner.
  - Lokum Bıdıcık'a el sallar.
  - Pamuk uyur.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş | 6 sn | Apartman kapısı. Baba, Kino, Lokum çıkar. Soldan Bıdık geri geri gelir, Baba'nın göbeğine çarpar. | Bıdık geri yürüyüp sekiyor; çekçek sallanıyor; Bıdıcık zıplıyor; Baba'nın göbeği dalgalanıyor; güvercinler sekiyor | kararma |
| 2 | Yakın, Bıdık | 6 sn | Gözleri sarı çoraba kilitlenir, ağzı sulanır. | göz bebekleri çorabın sallanan ucunu izliyor; dili dudağını yalıyor; sakal püskülü titriyor; arkada Bıdıcık alkışlıyor | düz |
| 3 | Geniş | 10 sn | Çekiştirme. Bıdık çorabın ucunu dişlemiş (P4). Kino tek ayakta sekerek geri çeker, çorap uzar. Güvercinler gergin çoraba konar. | Kino sekerek geri çekiyor; çorap uzuyor; güvercinler sırayla konuyor; Bıdıcık ve Lokum zıplıyor; Baba esniyor | düz |
| 4 | Yakın, Bıdık ve Kuzu | 5 sn | Bıdık hıçkırır, bırakır (`piiing`). Güvercinler fırlar. Bıdık Kuzu'nun şapkasını koklar; Lokum çeker. | çorap geri fırlıyor; güvercinler havalanıyor; Bıdık'ın burnu kıpırdıyor; Lokum Kuzu'yu çekiyor | düz |
| 5 | Omuz üstü (Kino'nun arkası bulanık) | 7 sn | Bıdık düşünür, parmağıyla parkı gösterir. Arkada Baba'nın başında güvercin. | Bıdık'ın gözleri yukarı dönüyor, hıçkırıkla zıplıyor; Baba'nın başındaki güvercin başını sallıyor; Pamuk kuyruğunu kıvırıyor | düz |
| 6 | Tepki, iki bebek | 6 sn | Lokum ve Bıdıcık karşılıklı "Hıp!" yapıp kıkırdar. | iki bebek sırayla zıplıyor; Bıdıcık'ın kurdelesi sallanıyor; arkadan Kino koşarak çıkıyor | düz → kayma |

- `b01-s6-bidik-01` BIDIK (sekerken): `[hiccups] Hıp! Pardon! Meee-rhaba!`
- `b01-s6-bidik-02` BIDIK: `[gasps] Sarı, uzun… Muuuz!`
- `b01-s6-bidicik-01` BIDICIK (alkışlar): `[excited] Bıdık abiii! [giggles]`
- `b01-s6-lok-01` LOKUM: `[laughs] Daha! Daha!`
- `b01-s6-bidik-03` BIDIK (bırakır): `[hiccups] Hıp! Muz değilmiş… çorapmış.`
- `b01-s6-bidik-04` BIDIK (Kuzu'yu koklar): `[curious] Bu da mı muz?`
- `b01-s6-lok-02` LOKUM (Kuzu'yu çeker): `[surprised] Benim!`
- `b01-s6-kino-01` KİNO: `[excited] Kırmızı çorap gördün mü? Uçuyordu!`
- `b01-s6-bidik-05` BIDIK: `[curious] Hımm… Kırmızı bir şey parka gitti!` *(Gördüğü şey Mino'nun fularıydı.)*
- `b01-s6-kino-02` KİNO: `[excited] Biliyordum! Parka!`
- `b01-s6-lok-03` LOKUM: `[hiccups] Hıp! [giggles]`
- `b01-s6-bidicik-02` BIDICIK: `[laughs] Ben de hıp!`

## SAHNE 7 · Kırmızı Bir Şey (4:20-5:00, 40 sn) · P park

- **Eylem:** Kino kaydırağın tepesinde dalgalanan kırmızıyı yakalar: o, Mino'nun fularıdır. Mino yarışa çağırır. Kino'nun hızlı çorabı yoktur. Lokum Kuzu'yu kaldırır.
- **Şaka:**
  - Kino fuları çeker: "Buldum!" Fuların öbür ucundan Mino'nun başı çıkar.
  - Sonra büyük açılış: çorap hep Kuzu'daymış.
- **Duygu anı (~11 sn, çekim 4-5):**
  - Kino ayaklarına bakar: bir kırmızı konç, bir dev sarı tüp. Kulaklar iner, kuyruk düşer. Kısa; bir replik ve bir anlatıcı cümlesi var.
  - Ağlama, bağırma, oturma yok. Ekran boş da kalmaz: Kino'nun yüzü ve kulakları oynar, arkada park yaşar, Lokum yaklaşır. An, Lokum'un gelişiyle hemen kahkahaya döner.
- **Canlılık katmanı:**
  1. Bulut salıncakta sallanır (`salincak-gicir`).
  2. Zıpzıp ip atlar (`ip-sap`).
  3. Tombi kum havuzunda kovayla kumdan pasta yapar.
  4. Bankın yanında kumrular yem gagalar.
  5. Bir çocuğun elinden kaçmış sarı balon gökyüzüne yükselir (`balon-uc`).
  6. Ağaç yaprakları sallanır, uzaktan çocuk kahkahaları gelir (`park-fon`).
- **Arka plan şakası:** Tombi kumdan pastasını bitirir, büyük bir ısırık alır, yüzünü buruşturup kumu tükürür. Sonra omuz silker ve ikinci pastaya başlar.
- **Ön plan kalabalığı:**
  - Baba bankın yanında ayakta Lokum'un elini tutar; uyuklar ve horlar.
  - Lokum elinden kurtulup kumrulara doğru paytak paytak yürür, sonra Kino'ya döner.
  - Mino konuşmadığı her an ısınma hareketi yapar: zıplar, kollarını çevirir.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Geniş | 7 sn | Park. Kaydırağın tepesinde rüzgârda dalgalanan kırmızı bir şey. Kino `flop flop` koşar. | fular dalgalanıyor; Kino koşuyor; Bulut salıncakta; Zıpzıp ip atlıyor; kumrular sekiyor; sarı balon yükseliyor | kayma |
| 2 | Orta | 8 sn | Kino kaydırağın dibinde zıplayıp uzanır, çeker. Fuların ucunda Mino'nun başı belirir. Mino kahkaha atar. | Kino zıplıyor; fular gerilip gevşiyor; Mino'nun başı kaydırak kenarından çıkıyor, kulakları dikiliyor; arkada Tombi kum pastası yapıyor | düz |
| 3 | Orta, Mino | 4 sn | Mino kaydıraktan kayar, aşağıda zıplar. | Mino kayıyor ve zıplıyor; fuları uçuşuyor; arkada salıncak | düz |
| 4 | Yakın, Kino (duygu) | 6 sn | Kamera ayaklarından yüzüne çıkar. Kulaklar ve kuyruk yavaşça düşer. `film-uzgun` iki nota. | kamera yukarı kayıyor; kulaklar ve kuyruk iniyor; Kino'nun bir ayağı sarı tüpü yerde sürtüyor; rüzgâr fularını oynatıyor | düz |
| 5 | Geniş (Kino önde küçük, park arkada canlı) | 5 sn | Anlatıcı konuşur. Arkada Mino ısınıyor. Tombi kum pastasını ısırıp tükürüyor. Lokum kumrulardan dönüp Kino'ya yöneliyor. | Mino zıplıyor; Tombi'nin şakası; Lokum'un paytak yürüyüşü; salıncak; balon küçülerek uzaklaşıyor | düz |
| 6 | Orta → hızlı yaklaşma | 10 sn | Lokum gelir, Kuzu'yu iki eliyle havaya kaldırır. Kamera kırmızı şapkaya "pat" diye yaklaşır. Kino'nun ağzı açık; Mino ve Baba güler. | Lokum zıplayarak kaldırıyor; kamera hızlı yaklaşıyor; Kino'nun kulakları "pıt" diye dikiliyor, kuyruğu pervane; Mino gülerek zıplıyor; Baba uyanıp gülüyor | düz |

- `b01-s7-kino-01` KİNO: `[gasps] Çorabım! Orada!`
- `b01-s7-kino-02` KİNO (çeker): `[excited] Buldum!`
- `b01-s7-mino-01` MİNO (fuların ucundan): `[surprised] Hey! O benim fularım! [laughs]`
- `b01-s7-kino-03` KİNO: `[giggles] Iı… çorap değilmiş.`
- `b01-s7-mino-02` MİNO (aşağıda zıplar): `[excited] Kino! Hadi, yarışalım!`
- `b01-s7-kino-04` KİNO (ayaklarına bakar): `[sighs] Hızlı çorabım yok. Kazanamam.`
- `b01-s7-anl-01` ANLATICI: `[softly] Kino'nun kulakları düştü. Tek çorapla yarış olur muydu?`
- `b01-s7-lok-01` LOKUM (Kuzu'yu kaldırır): `[excited] Abi! Kuzu da hızlı! [giggles]`
- `b01-s7-kino-05` KİNO: `[gasps] Çorabım! [laughs] Hep Kuzu'daymış!`

## SAHNE 8 · Büyük Yarış (5:00-5:40, 40 sn) · P park

- **Eylem:** Kino kırmızı çorabını giyer. Kino, Mino ve arkadan yetişen Bıdık koşar. Bitişte Baba hakemdir.
- **Şaka:**
  1. İki çorapla Kino artık dümdüz koşar.
  2. Bıdık her "Hıp!"te havaya zıplar.
  3. Hakem Baba bitişte ayakta uyumuş, elindeki "bayrak" (dev sarı çorap) sarkmış. Lokum "Tay!" der, Baba uyanır ve önünde ilk kimi görürse onu kazanan ilan eder.
  4. **Düğme:** Kino dev sarı çorabı Kuzu'ya şapka yapar; çorap Kuzu'yu baştan aşağı yutar.
- **Bilgi:** çift (iki çorap: bir, iki); başlama sayımı (bir, iki, üç); 3 ördek yavrusu.
- **Kuzu:** Önce şapkasız Lokum'un elinde. Sonunda dev sarı çorabın içinde kaybolur.
- **Canlılık katmanı:**
  1. Bulut ve Zıpzıp çizginin kenarında zıplayıp tezahürat eder (sessiz, yalnız `park-fon` kahkahaları).
  2. Salıncak boş kalmıştır ama hâlâ sallanır (`salincak-gicir`).
  3. Ağaç yaprakları ve çimen rüzgârla dalgalanır; koşucuların arkasında toz bulutçukları kalkar.
  4. Kumrular koşanların önünden havalanır.
  5. Pamuk bir şekilde parka gelmiştir; bankın üstünde gerinir.
- **Arka plan şakası:**
  - Yarış başlayınca bir anne ördek ve 3 yavrusu (`vak`) aynı yöne, sıra hâlinde paytak paytak koşar. Bitişe Lokum'la aynı anda varırlar ve Baba'nın ayağının dibinde dururlar.
  - Bitişte Baba uyurken bir kelebek bıyığına konar; Baba her horlamada kelebeği havaya kaldırıp indirir.
- **Ön plan kalabalığı:**
  - Tombi yarışa katılmaz; kum pastasını tabak gibi tutup seyreder ve sonda Lokum'a uzatır.
  - Bıdık arkadan yetişir.
  - Lokum bütün yarışı kendi temposunda yürüyerek yapar.

| # | Plan | Süre | Ne görünür | Ne hareket ediyor | Geçiş |
|---|---|---|---|---|---|
| 1 | Orta | 6 sn | `pof` toz bulutu; Kino iki kırmızı konçla zıplar. Ayakların üstünde iri **1** ve **2**. | toz bulutu; Kino zıplıyor, kulaklar sallanıyor; rakamlar zıplıyor; Lokum şapkasız Kuzu'yu sallıyor; Mino ısınıyor | düz |
| 2 | Geniş, başlangıç | 6 sn | Kino ve Mino çizgide; arkadan Bıdık koşarak gelir. Uzakta Baba elinde sarı çorap bayrakla. Kenarda Bulut, Zıpzıp, Tombi. | Bıdık hıçkırarak koşuyor; Baba bayrağı sallıyor, sonra sallaması yavaşlıyor; Zıpzıp zıplıyor; ördekler sıraya giriyor | düz |
| 3 | Önden, kameraya doğru koşu | 10 sn | Kino ve Mino koşuyor (P5), kulaklar uçuşuyor. Arkada Bıdık her hıçkırıkta zıplıyor. Yanlarında ördek ailesi. `film-kovalamaca`. | iki koşu döngüsü; Bıdık zıplıyor; ördekler paytak koşuyor; kumrular havalanıyor; toz bulutçukları | düz |
| 4 | Geniş, bitiş | 8 sn | Baba ayakta uyumuş, bıyığında kelebek. Kino ve Mino aynı anda varır. Lokum ve ördekler en arkadan gelir. Lokum Baba'nın dizine dokunur. | Kino ve Mino nefes nefese, birbirini gösteriyor; kelebek horlamayla kalkıp iniyor; Lokum ve ördekler varıyor; Baba fırlıyor | düz |
| 5 | Orta → geri çekilme | 10 sn | Herkes güler. Kino sarı çorabı Kuzu'ya geçirir, Kuzu kaybolur. Kamera geniş plana açılır; anlatıcı konuşur. | Lokum çorabın içinde Kuzu'yu arıyor; Kino gülerek kuyruğunu sallıyor; Mino ve Bıdık zıplıyor; Tombi pastasını uzatıyor; ördekler Baba'nın etrafında dönüyor; Pamuk esniyor | düz → kararma |

- `b01-s8-kino-01` KİNO: `[excited] İki çorap! Bir, iki!`
- `b01-s8-mino-01` MİNO: `[excited] Hazır… Bir, iki, üç!`
- `b01-s8-bidik-01` BIDIK (arkadan): `[hiccups] Hıp! Hıp! Bekleyiiin! [laughs]`
- `b01-s8-kino-02` KİNO (koşarken): `[laughs] İki çorap, dümdüz!`
- `b01-s8-kino-03` KİNO (bitişte): `[excited] Ben!`
- `b01-s8-mino-02` MİNO: `[excited] Hayır, ben!`
- *Baba horlar; kelebek bıyığında iner kalkar.*
- `b01-s8-lok-01` LOKUM (Baba'nın dizine dokunur): `[giggles] Tay!`
- `b01-s8-baba-01` BABA: `[surprised] Çay mı? Kalktım!`
- `b01-s8-baba-02` BABA (önünde Lokum'u ve ördekleri görür): `[chuckles] Lokum kazandı!`
- *`film-kutlama`, herkes güler; ördekler "vak".*
- `b01-s8-kino-04` KİNO (dev çorabı Kuzu'ya geçirir): `[laughs] Al Kuzu. Sen de hızlı ol.`
- `b01-s8-lok-02` LOKUM: `[gasps] Kuzu kayboldu!`
- `b01-s8-kino-05` KİNO: `[laughs harder] Yine mi arıyoruz?!`
- `b01-s8-anl-01` ANLATICI: `[happy] O gün en hızlısı Lokum'du. Bir de Kuzu.`

## KAPANIŞ KARTI VE JENERİK (5:40-5:55)

- **Kart (5 sn):** Krem zemin. Ortada başında kırmızı çorapla Kuzu çizimi. Kuzu hafifçe sallanır, şapkanın ucu kıvrılır. Yazı yuvarlak ve kalın.
  - `b01-kart-kino-01` KİNO: `[giggles] Kuzu da hızlı olmak istemiş!`
- **Jenerik (10 sn):** Bir çamaşır ipine renkli çoraplar teker teker mandallanır, üstlerinde 1-5 belirir. Son mandalda Kuzu sallanır. İpin üstünde bir serçe sekip durur, Pamuk ipin altından geçer. Yazılar. `film-kapanis`.

---

## Konuşma sayımı

| Ses | Satır |
|---|---|
| Anlatıcı | 7 + bölüm adı |
| Kino | 33 + kart |
| Lokum | 11 |
| Anne | 4 |
| Baba | 7 (3'ü aynı "Çay mı? Kalktım!") |
| Babaanne | 2 |
| Dede | 3 |
| Bıdık | 6 |
| Bıdıcık | 2 |
| Mino | 4 |
| **Toplam** | **~81** |

- Arka plan çocukları (Tombi, Bulut, Zıpzıp) ve hayvanlar bu bölümde konuşmaz; yalnız fon sesleri var (§2.5).
- Sesler `content/film2/sesler.json` içindeki eşlemeyle üretilir (`bidik`, `bidicik` sesleri var).
- Kısa replikler 3-4 kez üretilir, en canlısı seçilir. Etiket tutmazsa yalnız etiket çıkarılır, metin değişmez.
- `b01-s6-bidicik-01` ve `b01-s6-bidicik-02`, Bıdıcık'ın genel kayıtları `bidicik-abi` ve `bidicik-taklit` ile aynı sözlerdir. O kayıtlar beğenildiyse kopyalanabilir.

## Üretim kontrol listesi

- [ ] **Barış storyboard'u (aşağıda, 12 kare) gördü ve onayladı.** Render ve animatik bundan sonra başlar.
- [ ] Bıdık ve Bıdıcık model kartları (önden), [SERI-KITABI §2.7](SERI-KITABI.md) tarifine göre. Tombi, Bulut ve Zıpzıp için arka plan pozu (tek önden çizim).
- [ ] Pozlar P1-P5; kostüm ve eşya ekleri (§2.4), canlılık eşyaları ve hayvanlar dahil.
- [ ] M4 bahçeye çamaşır ipi katmanı; hayal göğü için M0 gök katmanının doygun kopyası.
- [ ] Olay efektleri ve canlılık sesleri (§2.5).
- [ ] **Boşluk denetimi (§2.6), animatikte kare kare:**
  - hiçbir çekim 10 sn'yi geçmiyor;
  - hiçbir karakter 3 sn'den fazla donmuyor;
  - replik araları 1 sn'yi geçmiyor;
  - her kadrajda 3 hareket katmanı var.
- [ ] Gizli şaka denetimi: Kuzu'nun kırmızı şapkası her sahnede en az 2 sn net görünüyor mu? Telefonda (844×390) da seçiliyor mu?
- [ ] Arka plan şakaları telefonda okunuyor mu (serçe, fanus, simit, Pamuk, Baba-bulut, güvercinler, Tombi, ördekler)?
- [ ] Eski `b01-s4-*.mp3` kayıtları kenara alındı; `content/film2/bolum-01.json` yeni kimliklerle kuruldu.

---

## Barış'a gösterilecek storyboard (12 kare)

**Gemini için ortak kurallar:**
- 16:9 yatay. Düz 2D çizgi film; kalın çikolata kahvesi kontur.
- Düz renk ve en fazla tek ton gölge. Doku, boya fırçası, parlak 3D ışık yok.
- Arka planlar bir ton soluk ve sıcak; karakterler öne çıkar.
- **Her kare kalabalık ve canlıdır:** ön planda ana eylem, orta planda başka bir karakterin kendi işi, arka planda en az bir canlılık ögesi ve varsa arka plan şakası. Hareket, hareket çizgileri ve havada kalmış nesnelerle gösterilir. Boş duvar ya da boş gök yok.
- Karakter referansları: `assets/karakter/kino-yeni`, `anne`, `baba`, `lokum`, `mino-yeni.webp`. Babaanne ve Dede seri kitabı tarifinden.
- Bıdık, Bıdıcık, Tombi, Bulut ve Zıpzıp'ın çizimi yok. **Önce model kartları çizilir**; K10, K11 ve K12 onlardan sonra çizilir.
- **Kuzu'nun göründüğü karelerde (K1, K2, K3, K5, K7, K8, K10, K11) kırmızı çorap şapkası açıkça seçilir.** K12'de Kuzu şapkasızdır, çünkü çorap artık Kino'nun ayağındadır.

| Kare | Sahne | Tarif |
|---|---|---|
| **K1** | S1 | Sabah ışıklı çocuk odası. Kino ortada tek ayak üstünde zıplıyor, iki eliyle kırmızı çorabı öbür ayağına çekiyor; dili dışarıda, uzun kestane kulakları havada. Arkada kapıda Lokum, başında kırmızı çorap olan krem Kuzu'yu havaya zıplatıyor. Açık pencerede tül perde dalgalanıyor, pervaza bir serçe konmuş. Tavanda ay-yıldız mobili, yerde güneş lekesi içinde toz zerreleri. |
| **K2** | S1 | Aynı oda, geniş. Kino ve Lokum odanın ortasında daire çizerek koşuyor; yerde dairesel hareket çizgileri. Kino'nun bir ayağı kırmızı çoraplı, öbürü çıplak. İkisinin de kulakları pervane gibi savrulmuş, kocaman gülüyorlar. Pervazdaki serçenin başının üstünde dönen küçük yıldızlar var, sersemlemiş. Mobil hızla dönüyor, karyoladaki çıngırak sallanıyor. |
| **K3** | S2 | Salon. Kino hasır çamaşır sepetine dalmış; sepetten yalnız iki bacağı ve ucu beyaz kestane kuyruğu çıkıyor. Havada sarı, mavi ve yeşil çoraplar uçuyor. Mavi çorap Anne'nin başına konmuş; Anne istifini bozmadan not defterine yazıyor. Yeşil çorap büfenin üstündeki balık fanusuna şapka gibi düşmüş; kırmızı balık yukarı bakıp baloncuk çıkarıyor. Lokum başına bir çorap geçirmiş, Kuzu'yla aynı şapka. Arkada sarkaçlı duvar saati, demlikten buhar. Antre kapısının aralığında ayakta uyuyan Baba'nın göbeği görünüyor. |
| **K4** | S2 | Orta-yakın plan. Kanepenin kolunda yan yana üç çorap: kocaman sarı (Baba'nın), orta mavi (Anne'nin), minicik pembe (Lokum'un). Kino parmağıyla gösteriyor, kuyruğu sallanıyor. Üç çorap boy sırasıyla net; büyük-orta-küçük açıkça okunuyor. Arkada Lokum sepetten çorap çekiyor, tül perde dalgalanıyor. |
| **K5** | S3 | Antre. Kocaman, göbekli Baba (vişne kazak) dış kapının önünde ayakta uyuyor; gözler kapalı, bıyığı horlamayla havalanmış, koltuğunun altındaki ekmek torbasından buhar tütüyor ve bir simit kayıyor. Kino parmağıyla göbeğini dürtüyor, göbek sallanıyor (hareket çizgileri). Lokum Kuzu'yu Baba'nın burnuna uzatmış; kolunda bilezik gibi bir simit. Kapının üstünde nazar boncuğu sallanıyor. |
| **K6** | S3 | Aynı antre. "Çay mı? Kalktım!" anı: Baba'nın gözleri kocaman açılmış, ekmek torbası ve simitler havada. Lokum simitleri kapmak için zıplamış. Önde Kino eliyle ağzını kapatmış, fısıldamış. Sol kenarda kapıdan Anne'nin başı, başında hâlâ mavi çorap. Nazar boncuğu havaya fırlamış. |
| **K7** | S4 | Babaanne'nin bahçesi, limon ağacı. Çamaşır ipinde 5 mandal; dördünde sarı havlu, mavi gömlek, yeşil önlük, turuncu tişört var, beşincisi boş. Mandalların üstünde iri 1-5. Kino (bir ayağında dizine kadar dev sarı çorap) boş mandala şaşkın bakıyor. Babaanne kolundaki sepete çamaşır topluyor; Dede elinde ince belli bardakla. Baba ağaca yaslanmış uyukluyor, ayağının dibinde limon. **Kino'nun arkasında**, ipin öbür ucunda, Lokum parmak uçlarında Kuzu'yu boş mandala asıyor. Bahçe duvarında kedi Pamuk patisini Kuzu'ya uzatmış. Tarhta fıskiye, havada kelebek ve düşen bir limon yaprağı. |
| **K8** | S5 | Hayal göğü: sabah mavisi gök, aşağıda çınarın tepesi, kiremit çatılar, dumanı tüten bacalar. Gözlü, gülen kırmızı bir çorap kıvrılarak uçuyor. Kino kolları iki yana açık peşinde uçuyor; fuları ve kulakları geriye savrulmuş, ayağındaki sarı çorap bayrak gibi dalgalanıyor. Yanında Lokum uçuyor, elinde kırmızı şapkalı Kuzu. Ayaklarında minik sarı, mavi, yeşil çoraplar olan üç güvercin. Gökte bıyıklı, Baba'nın yüzüne benzeyen horlayan bir bulut; uzakta bir uçurtma. |
| **K9** | S5 | Gerçeğe dönüş, bahçe. Kino ipin önünde parmak uçlarında, kolları açık, "uçak" yapıyor; gözleri kapalı, mutlu. Dede (gri kasket, zeytin yelek) bardağı elinde, gür kaşlarını kaldırmış bakıyor. Babaanne ağzını eliyle kapatıp gülüyor. Baba esniyor. Duvarda Pamuk da iki ön patisini açmış, "uçak" olmuş, duvardan kaymak üzere. Arkada Lokum Kuzu'yu mandaldan alıyor. |
| **K10** | S6 | Apartman önü, kaldırım. Keçi yavrusu Bıdık (açık kül grisi, minik boynuz tomurcukları, çenede minik sakal, bir askısı düşük gökyüzü mavisi tulum) geriye yaslanmış, Kino'nun ayağındaki dev sarı çorabın ucunu dişleriyle çekiyor. Çorap lastik gibi uzamış ve tel gibi gerilmiş; üstüne üç güvercin sıra sıra konmuş. Kino tek ayakta geri çekiyor. Turuncu çekçekte Bıdıcık (limon sarısı, sarı kurdele) alkışlıyor; Lokum Kuzu'yla zıplıyor. Baba esniyor. Kapı önündeki paspasta Pamuk uyuyor, balkonlarda çamaşırlar. |
| **K11** | S7 | Park, kaydırak. Lokum iki eliyle Kuzu'yu havaya kaldırmış; Kuzu'nun başında kırmızı çorap, ışık ona vuruyor. Kino'nun ağzı açık, kulakları dimdik. Arkada Mino (turuncu tekir, kırmızı fular, turkuaz elbise) ve Baba kahkaha atıyor. Arka planda Bulut (siyah yüzlü beyaz kuzu) salıncakta sallanıyor, Zıpzıp (tavşan) ip atlıyor, Tombi (bal rengi ayı) kum havuzunda yüzünü buruşturup kum tükürüyor. Gökte uzaklaşan sarı balon, bankın yanında kumrular. |
| **K12** | S8 | Parkta bitiş. Baba ayakta uyuyor, elindeki sarı çorap bayrak gibi sarkmış, bıyığında bir kelebek. Kino ve Mino nefes nefese, ikisi de "Ben!" diye kendini gösteriyor. Kino'nun ayaklarında iki kırmızı konç. Ön planda Lokum, kolunda şapkasız Kuzu, Baba'nın dizine dokunmuş, kocaman gülüyor. Yanında anne ördek ve 3 yavrusu sıra hâlinde durmuş. Arkada Bıdık hıçkırıkla havada; kenarda Zıpzıp ve Bulut zıplıyor, Tombi kum pastasını tabak gibi tutuyor. Bankta Pamuk esniyor. *(Son düğme, yani Kuzu'nun dev sarı çorabın içinde kaybolması, bu kareden hemen sonra gelir. Barış isterse 13. kare olarak eklenir.)* |
