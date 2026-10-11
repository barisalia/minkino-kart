# Kino ve Ailesi · Bölüm 1: Kino'nun Tepsisi

> Durum: **TASLAK, 4. sürüm** (2026-10-11). **Barış storyboard'u (en sonda, 12 kare) görmeden animatiğe ve render'a geçilmez.**
> **Değişiklik notu:** "Herkes Lokum'a Bakıyor" ("dram filmi gibi") ve "Hızlı Çoraplar" ("boktan senaryo, git Caillou oku") reddedildi. Bu sürüm, gerçek Caillou dökümleri okunduktan sonra sıfırdan yazıldı: [CAILLOU-INCELEME.md](CAILLOU-INCELEME.md). Eski sürümler git geçmişinde: `git log -- ekip/film/seri-2/bolum-01.md`.
>
> **Kodcuya iki uyarı:**
> 1. `content/film2/bolum-01.json` eski senaryoya göre yazılmıştı; yeni kimliklerle baştan kurulmalı.
> 2. `ekip/ses/seri2-gelen/` içindeki eski `b01-*` kayıtları reddedilen sürümlere ait; yeni kayıttan önce kenara alınmalı (kimlikler çakışır).
>
> **Süre:** ~5 dk (açılış ve jenerik dahil). Üretim: [URETIM-YOLU.md](URETIM-YOLU.md). Karakterler: [SERI-KITABI.md](SERI-KITABI.md). Sesler: `content/film2/sesler.json`.

---

## 0. Bu bölüm hangi Caillou bölümlerinin yapısını izliyor

| Caillou bölümü | Ondan alınan | Bizde |
|---|---|---|
| **Try, Try Again** | Gerçek bir beceri, bir benzetme, ilk denemede başarısızlık, kendi isteğiyle tekrar deneme, gururla bitiş. Örnek replik: "It's too hard." | Tepsi taşımak. Benzetme "ağaç ve tavşan" yerine **"kaplumbağa adımı"**. Kino ilk denemede zeytinleri döker, sonra kendi isteğiyle yeniden dener. |
| **Caillou Hates Vegetables** | Dede ders vermez, oyuna girer: "Bears eat berries." Hep birlikte ayı olurlar. | Dede Hasan kaplumbağa olur, Kino ve Lokum da onunla birlikte. |
| **Caillou's Surprise** | İstek "büyükler gibi" bir şey yapmak (fincandan içmek). Kısa hayal o anki hayranlıktan doğar ve kendi gülüşüyle biter. | Kino büyükler gibi büyük tepsiyi taşımak ister. Babaanne'nin dolu tepsisine bakarken 15 sn'lik bir hayal görür. |
| **Caillou Stays Up Late** | Ebeveyn net bir "hayır" der ve hemen bir görev verir (çiçeği sen seç). Düğme repliği: "Can I stay up late tonight?" | Anne "Tepsi ağır" der, ekmek sepetini verir. Son düğme: "Yarın büyük tepsi?" — "Biraz daha büyüyünce." |
| **Caillou's Missing Sock** | Anlatıcı her geçişte bir düz cümle söyler. Az karakter, ev içi gündelik iş. | 9 anlatıcı cümlesi, hepsi düz eylem ya da Kino'nun içi. |
| **Bluey: Keepy Uppy** | Arka plan hep canlı (anne saksıdan dökülen toprağı toplar); büyükler oyunun içinde; sonda herkes gülerek toplanır. | Her sahnede ev işi süren büyükler; sonda bütün aile kahvaltı masasında. |

**Bu sürümde bilerek olmayanlar:** uydurma efsane ("hızlı çorap"), yarış, yanlış anlama zinciri, sahne başına şaka kuralı, yan karakterler, uzun hayal, ağlama, uzun konuşma.

---

## 1. Künye

- **Konu (3 cümle):** Pazar sabahı Babaanne alt katta, bahçede kahvaltı kuruyor ve Kino büyükler gibi büyük tepsiyi taşımak istiyor. Anne ona ekmek sepetini verir, Kino koşarak taşır, sonra Babaanne'nin verdiği küçük zeytin tepsisini de koşarak taşımaya kalkar ve zeytinler yuvarlanıp gider. Dede Hasan ona "kaplumbağa adımı"nı gösterir; Kino yavaş yavaş, kendi tekerlemesiyle tepsiyi masaya götürür, sonunda da ayakta uyuyan Baba'ya çayını getirip onu uyandırır.
- **İstek:** Büyükler gibi tepsi taşımak ("Ben büyüdüm artık!").
- **Gerçek zorluk:** Acele eden 5 yaşındaki çocuk, dolu bir tepsiyi dökmeden taşıyamaz.
- **Benzetme:** Kaplumbağa adımı: "Yavaş… göz tepside."
- **Kısa duygu anı:** Zeytinler dökülünce kulaklar düşer: "Olmuyor." (~8 sn). Hemen Dede gelir.
- **Hayal:** Kino, kendini masaları uçarak dolaşan dev tepsili bir garson olarak görür (15 sn).
- **Tekrarlar (yalnız iki):** (1) Lokum, Kino'nun her yaptığını taklit eder. (2) Baba ayakta uyur ve "çay" sözüyle uyanır (dizinin süregelen şakası).
- **Ders cümlesi yok.** Anlatıcı yalnız sonda "Kino kendini çok büyük hissetti" der.

## 2. Teknik

### 2.1 Mekânlar (3 yer; yeni mekân yok)

| Kod | Yer | Sahne |
|---|---|---|
| M2 | Salon (mutfak tezgâhı arkada) | S1 |
| M0 | Çınar Apartmanı önü ve bahçe kapısı | S2 |
| M4 | Babaanne'nin bahçesi, limon ağacı ve kahvaltı masası | S3-S7 |
| H | Hayal: M4 bahçesinin bir ton doygun, kenarı parıltılı hâli | S3 içinde |

### 2.2 Oyuncular (konuşan 6 ve anlatıcı)

| Karakter | Ses (`sesler.json`) | Sahneler |
|---|---|---|
| Anlatıcı | `anlatici` | ac, S1, S2, S3, S4, S5, S7 |
| Kino | `kino` | hepsi |
| Lokum (+ Kuzu) | `lokum` | hepsi |
| Anne Defne | `anne` | S1, S2, S6, S7 |
| Baba Murat | `baba` | S1 (arkada uyur), S6, S7 |
| Babaanne Nazlı | `babaanne` | S3, S4, S6, S7 |
| Dede Hasan | `dede` | S4, S5, S6, S7 |
| Sessiz: kedi Pamuk, serçeler, kelebek | — | arka plan döngüleri |

Mino ve yan karakterler bu bölümde yok.

### 2.3 Sahneleme (önden kukla)

- Herkes **önden** durur. Yürüme önden sekme döngüsüyle yapılır; yaklaşma ve uzaklaşma ölçekle verilir.
- Masa sahnelerinde büyükler **masanın arkasında ayakta** durur; masa bacakları örter. Oturma, yatma ve sarılma yok.
- Tepsi, sepet ve fincan **ayrı katman**dır; ele bağlanır.
- Zeytinler ayrı küçük katmanlardır, yuvarlanma basit dönme ve kayma ile yapılır.

### 2.4 Poz listesi (Gemini çizer, Adobe temizler)

| Kod | Poz | Sahne |
|---|---|---|
| P1 | Kino, iki eliyle önünde bir şey taşıyor (sepet ya da tepsi); dirsekler bükük, göğüs ileri, kuyruk dik. | S1-S6 |
| P2 | Kino "koşarak taşıma": aynı tutuş, gövde öne eğik, bir ayak havada, kulaklar geride. | S2, S4 |
| P3 | Kino "kaplumbağa adımı": dizler hafif kırık, boyun öne uzamış, gözler aşağıda tepsiye bakıyor, dil ucu dışarıda. | S5, S6 |
| P4 | Dede "kaplumbağa": boynunu omuzlarının arasına çekmiş, sonra yavaşça uzatıyor (iki kare); elleri önde boş bir tepsi tutar gibi. | S5 |
| P5 | Kino hayalde: tek elinde başının üstünde dev tepsi, öbür kolu açık, ayaklar yerden kesik, gülüyor. | S3 hayal |
| P6 | Baba ayakta uyuyor: başı yana düşmüş, ağız açık, bir eli göbekte. (Var; yoksa çizilir.) | S1, S6 |
| P7 | Lokum, iki eliyle önünde Kuzu'yu ya da tek zeytini "taşıyor"; Kino'nun P1/P3 taklidi. | S2, S5, S7 |

### 2.5 Eşyalar (ayrı katman)

Büyük kahvaltı tepsisi (peynir, domates, salatalık, bal, reçel kaseleri), ekmek sepeti (somun ve simit), küçük yuvarlak tepsi ve üstünde zeytin tabağı, 5 zeytin, çaydanlık ve demlik, ince belli çay bardakları, Baba'nın büyük kupası, sıcak pişi tabağı, şekerlik, kahvaltı masası ve muşamba örtü.

### 2.6 Canlılık (sahne asla boş durmaz)

Kural: Konuşan iki kişinin yanında en az bir kişi **kendi işini** yapar (Anne tepsi doldurur, Babaanne pişi çevirir, Dede fesleğen sular, Lokum Kuzu'yu taşır). Arka planda sürekli 2-3 küçük döngü olur (serçe, limon yaprakları, kedi kuyruğu, çaydanlığın buharı). Bunlar **şaka değil, hayattır**; dikkat çekmez. Hiçbir çekim 8 sn'yi geçmez.

### 2.7 Replik biçimi

- Kimlik `b01-<sahne>-<kim>-<no>`; dosya `ekip/ses/seri2-gelen/<kimlik>.mp3`.
- Metin ElevenLabs v4'e olduğu gibi yapıştırılır; replik başına 1-2 etiket.
- Lokum bebek konuşur: R yerine Y, Ç yerine T ("Tay!", "Kaplumba!").
- Karakter cümlesi en çok 6-7 kelime; anlatıcı cümlesi en çok 10-12 kelime.
- Kısaltmalar: anl, kin, lok, ann, bab, bbn (babaanne), ded.

---

## AÇILIŞ (0:00-0:15) · M0

Seri açılışının kısa hâli: Kamera çınardan apartmana iner. Bahçede masa kurulmuş, Babaanne örtüyü sallıyor; balkonda Kino başını çıkarır. Logo belirir.

- `b01-ac-anl-01` ANLATICI: `[warmly] Kino ve Ailesi. Kino'nun Tepsisi.`

---

## SAHNE 1 · Büyük Tepsi (0:15-1:05, 50 sn) · M2 salon

- **Olur:** Anne tezgâhta büyük tepsiyi dolduruyor. Kino ve Lokum yanında zıplıyor. Arkada Baba, elinde boş kupa, ayakta uyuyor.
- **Canlılık:** Çaydanlıktan buhar; perde sallanıyor; Lokum Kuzu'yu tezgâha "oturtmaya" çalışıyor.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Geniş | 7 sn | Anne tepsiye peynir koyar; Kino ve Lokum zıplar; Baba arkada sallanır |
| 2 | Orta, Kino | 5 sn | Kino tepsiye bakar, kuyruk dikilir |
| 3 | İki çekim, Anne-Kino | 8 sn | Konuşma; Anne bal kasesini yerleştirir |
| 4 | Yakın, Kino | 4 sn | Kulaklar yarım düşer, sepete bakar |
| 5 | Orta | 8 sn | Anne sepeti verir, Lokum Kuzu'yu "sepet gibi" kaldırır |

- `b01-s1-anl-01` ANLATICI: `[warmly] Pazar sabahıydı. Babaanne alt katta kahvaltı hazırlıyordu.`
- `b01-s1-ann-01` ANNE: `Hadi bakalım, aşağı iniyoruz.`
- `b01-s1-kin-01` KİNO: `[excited] Ben taşırım! Büyük tepsiyi ben taşırım!`
- `b01-s1-ann-02` ANNE: `[gently] Bu tepsi ağır, canım.`
- `b01-s1-kin-02` KİNO: `Ben büyüdüm artık!`
- `b01-s1-ann-03` ANNE: `[smiling] Sen ekmeği taşı. Çok önemli iş.`
- `b01-s1-anl-02` ANLATICI: `Kino ekmek sepeti istemiyordu. O büyük tepsiyi istiyordu.`
- `b01-s1-kin-03` KİNO: `[sighs] Peki… ekmek.`
- `b01-s1-lok-01` LOKUM: `[giggles] Lokum da taşıyoy! Kuzu!`
- `b01-s1-ann-04` ANNE: `Murat? Kalk, iniyoruz.` (Baba kıpırdamaz, horlar.)
- `b01-s1-bab-01` BABA: `[snores] Hrrr… pşşş…`

---

## SAHNE 2 · Ekmek Koşusu (1:05-1:45, 40 sn) · M0 apartman önü

- **Olur:** Kino sepeti kucağında koşarak bahçe kapısına gider; simit sepette zıplar. Lokum Kuzu'yla arkasından. Anne büyük tepsiyle yavaş yavaş gelir.
- **Canlılık:** Pamuk kapı önünde gerinir; güvercinler kaldırımda yem arar; çınar yaprakları.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Geniş | 7 sn | Kino koşarak gelir (P2), simit sepette hoplar |
| 2 | Orta | 6 sn | Simit sepetten zıplar, Kino havada yakalar |
| 3 | Orta, Anne | 6 sn | Anne tepsiyle yavaş ve dengeli gelir |
| 4 | İki çekim | 8 sn | Kino Anne'ye bakar, sonra kendi sepetine |

- `b01-s2-anl-01` ANLATICI: `Kino ekmekleri herkesten önce götürmek istedi.`
- `b01-s2-kin-01` KİNO: `[excited] Ben en hızlıyım!` (Simit zıplar, Kino yakalar.) `[gasps] Hop! Yakaladım!`
- `b01-s2-lok-01` LOKUM: `Hop! Yakaladım!` (Kuzu'yu havaya atar, yakalayamaz, yerden alır.)
- `b01-s2-ann-01` ANNE: `[laughs] Yavaş, Kino. Simit kaçıyor.`
- `b01-s2-anl-02` ANLATICI: `Anne büyük tepsiyi hiç sallamadan taşıyordu. Kino hayran kaldı.`

---

## SAHNE 3 · Babaanne'nin Masası ve Hayal (1:45-2:35, 50 sn) · M4 bahçe → H → M4

- **Olur:** Babaanne masada pişi çeviriyor. Kino sepeti masaya koyar. Babaanne'nin elindeki dolu tepsiye bakar ve bir an hayale dalar.
- **Canlılık:** Pişi tavasından buhar; limon yaprakları; serçe masanın ucuna konup kırıntıya bakar.
- **Hayal (15 sn):** Bahçe parlar. Kino, başının üstünde dev bir tepsiyle (P5) masaların üstünden uçarak dolaşır. Tepside dağ gibi pişi var. Babaanne, Dede ve Lokum alkışlar. Kino bir tabak koyar, bir tabak koyar, hiçbiri sallanmaz. Sert kesme: gerçek bahçede Kino ağzı açık, gülümseyerek havaya bakıyor.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Geniş | 7 sn | Babaanne pişi çevirir, Kino sepetle gelir |
| 2 | Orta | 6 sn | Babaanne pişi tabağını tepsiye koyar |
| 3 | Yakın, Kino | 3 sn | Gözleri tepsiye kilitlenir |
| 4 | H, geniş | 8 sn | Uçan Kino, dev tepsi |
| 5 | H, orta | 7 sn | Alkışlayan aile, tabaklar yerine konur |
| 6 | Yakın, Kino (gerçek) | 4 sn | Ağzı açık gülümsüyor; Babaanne'nin eli önünde sallanıyor |
| 7 | İki çekim | 8 sn | Konuşma |

- `b01-s3-bbn-01` BABAANNE: `[warmly] Hoş geldin kuzum! Sizin için yaptım, sıcacık!`
- `b01-s3-kin-01` KİNO: `Ekmekler geldi! Hiç düşmedi.` (Simit yamuk duruyor.)
- `b01-s3-anl-01` ANLATICI: `Kino, Babaanne'nin tepsisine baktı. Kendini büyük bir tepsiyle düşledi.`
- `b01-s3-kin-02` KİNO (hayal): `[laughs] Pişi geldi! Pişi geldi!`
- `b01-s3-bbn-02` BABAANNE: `Kino? Neye gülüyorsun öyle?`
- `b01-s3-kin-03` KİNO: `[giggles] Tepsi taşıyordum. Uçarak.`
- `b01-s3-kin-04` KİNO: `Babaanne, ben de tepsi taşıyabilir miyim?`
- `b01-s3-bbn-03` BABAANNE: `Tabii ki. Al, şu küçük tepsi senin.`

---

## SAHNE 4 · Zeytinler Kaçıyor (2:35-3:15, 40 sn) · M4 bahçe

- **Olur:** Babaanne küçük tepsiyi verir: zeytin tabağı. Masa bahçenin öbür ucunda. Kino tepsiyle koşmaya başlar (P2). Zeytinler tabakta kayar, birer birer yuvarlanıp çimene düşer. Lokum her birini "Benim!" diye yerden toplar. Masaya vardığında tabakta tek zeytin kalmıştır.
- **Kısa duygu anı (~8 sn):** Kino tabağa bakar, kulakları ve kuyruğu düşer. Tek replik. Hemen Dede'nin sesi gelir.
- **Canlılık:** Dede arkada fesleğen sular; Pamuk düşen bir zeytini koklayıp geri çekilir.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Orta | 5 sn | Babaanne küçük tepsiyi verir |
| 2 | Geniş | 8 sn | Kino koşar; zeytinler yuvarlanır (3 kez "tık tık tık") |
| 3 | Orta, Lokum | 5 sn | Lokum zeytinleri toplar, Pamuk geri sıçrar |
| 4 | Orta | 6 sn | Kino masaya varır, tabakta tek zeytin |
| 5 | Yakın, Kino | 6 sn | Kulaklar düşer |
| 6 | Orta | 5 sn | Dede sulama kabını bırakıp gelir |

- `b01-s4-kin-01` KİNO: `[excited] Zeytinler geliyor!`
- `b01-s4-lok-01` LOKUM: `[giggles] Benim! Benim! Bu da benim!`
- `b01-s4-anl-01` ANLATICI: `Kino çok hızlı gidiyordu. Zeytinler daha da hızlıydı.`
- `b01-s4-kin-02` KİNO: `[sad] Olmuyor. Hepsi kaçtı.`
- `b01-s4-anl-02` ANLATICI: `Tepsi taşımak, Kino'nun sandığından zordu.`
- `b01-s4-ded-01` DEDE: `[chuckles] Bak sen şu işe.`

---

## SAHNE 5 · Kaplumbağa Adımı (3:15-4:05, 50 sn) · M4 bahçe

- **Olur:** Dede, kendi boş tepsisini alır. "Tepsi koşmayı sevmez" der ve kaplumbağa olur (P4): boynunu çeker, yavaşça uzatır, minik adımlarla yürür. Lokum hemen taklit eder (P7). Kino güler, sonra dener. Babaanne zeytinleri yıkayıp tabağa geri koyar. Kino, tekerlemesini söyleyerek (P3) bahçeyi baştan geçer. Tabak sallanır ama hiçbir zeytin düşmez. Masaya koyar.
- **Canlılık:** Kelebek, Kino'nun önünden yavaşça uçar ve onu geçer; Babaanne arkada çay demler.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Orta, Dede | 7 sn | Dede kaplumbağa olur, boyun çekilip uzar |
| 2 | Geniş | 6 sn | Dede ve Lokum yan yana kaplumbağa yürür |
| 3 | Yakın, Kino | 3 sn | Kino güler |
| 4 | Orta | 6 sn | Babaanne tabağı doldurur, Kino tepsiyi alır |
| 5 | Geniş | 8 sn | Kino kaplumbağa adımıyla yürür; kelebek onu geçer |
| 6 | Yakın, tepsi | 3 sn | Zeytinler sallanır, düşmez |
| 7 | Orta | 7 sn | Kino tabağı masaya koyar, kuyruk dikilir |

- `b01-s5-ded-01` DEDE: `Tepsi koşmayı sevmez, Kino.`
- `b01-s5-ded-02` DEDE: `[slowly] Kaplumbağa gibi. Yavaş… göz tepside.`
- `b01-s5-lok-01` LOKUM: `[giggles] Kaplumba! Kaplumba!`
- `b01-s5-kin-01` KİNO: `[laughs] Dede, sen kaplumbağa oldun!`
- `b01-s5-ded-03` DEDE: `[chuckles] Hem de yetmiş yaşında bir kaplumbağa.`
- `b01-s5-bbn-01` BABAANNE: `Al bakalım. Zeytinler yıkandı, yeniden.`
- `b01-s5-anl-01` ANLATICI: `Kino bir daha denemek istedi. Bu sefer kaplumbağa gibi.`
- `b01-s5-kin-02` KİNO: `[whispers] Yavaş… göz tepside… yavaş…`
- `b01-s5-kin-03` KİNO: `[excited] Yaptım! Hiç düşmedi!`
- `b01-s5-ded-04` DEDE: `Aferin benim kaplumbağama.`

---

## SAHNE 6 · Çay! (4:05-4:40, 35 sn) · M4 bahçe

- **Olur:** Anne ve Baba aşağı gelir. Baba limon ağacının yanında ayakta uyuyakalmıştır (P6). Babaanne, Baba'nın kupasını küçük tepsiye koyar. Kupa sıcak değil, ılık; Anne "yavaş" der. Kino kaplumbağa adımıyla Baba'ya gider, Lokum arkasından aynı adımla. Kino Baba'nın önünde durur.
- **Canlılık:** Dede masada ekmek keser; Babaanne bardaklara çay doldurur; serçe limon dalında.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Geniş | 6 sn | Baba ağacın yanında uyuyor, herkes masada iş yapıyor |
| 2 | Orta | 5 sn | Babaanne kupayı tepsiye koyar |
| 3 | Geniş | 7 sn | Kino ve Lokum kaplumbağa adımıyla yürür |
| 4 | Orta, Baba | 5 sn | "Baba, çay!" |
| 5 | Yakın, Baba | 4 sn | Gözler fırlar: "Kalktım!" |
| 6 | Geniş | 6 sn | Herkes güler |

- `b01-s6-bbn-01` BABAANNE: `Babanın çayını kim götürür?`
- `b01-s6-kin-01` KİNO: `[excited] Ben! Kaplumbağa adımıyla!`
- `b01-s6-ann-01` ANNE: `[smiling] Yavaş, göz tepside.`
- `b01-s6-kin-02` KİNO: `Baba… çay!`
- `b01-s6-bab-01` BABA: `[gasps] Çay mı? Kalktım!`
- `b01-s6-bab-02` BABA: `[laughs] Bunu kim getirdi böyle?`
- `b01-s6-kin-03` KİNO: `Ben! Hiç dökmedim!`

---

## SAHNE 7 · Kahvaltı (4:40-5:05, 25 sn) · M4 bahçe

- **Olur:** Bütün aile masanın arkasında. Babaanne pişi dağıtır. Kino Anne'ye döner.
- **Düğme:** Lokum, tek zeytini avucunda kaplumbağa adımıyla masaya getirir, "Kaplumba!" der ve zeytini kendisi yer. Herkes güler.

| # | Plan | Süre | Ne görünür / hareket |
|---|---|---|---|
| 1 | Geniş | 7 sn | Aile masada, pişi elden ele |
| 2 | İki çekim | 7 sn | Kino-Anne |
| 3 | Orta, Lokum | 6 sn | Lokum'un zeytini |
| 4 | Geniş | 5 sn | Herkes güler; kamera yavaşça geri çekilir |

- `b01-s7-kin-01` KİNO: `Anne, yarın büyük tepsi?`
- `b01-s7-ann-01` ANNE: `[warmly] Biraz daha büyüyünce. Kaplumbağa gibi.`
- `b01-s7-lok-01` LOKUM: `[giggles] Kaplumba!` (zeytini yer) `Hav!`
- `b01-s7-anl-01` ANLATICI: `[warmly] O sabah Kino, kendini çok büyük hissetti.`

---

## KAPANIŞ KARTI VE JENERİK (5:05-5:20)

Kart: bahçe masası, üstünde küçük tepsi. Kino'nun sesi:

- `b01-kp-kin-01` KİNO: `[happy] Kino ve Ailesi! Haftaya görüşürüz!`

---

## Konuşma sayımı

| Kim | Replik |
|---|---|
| Anlatıcı | 10 (açılış dahil) |
| Kino | 18 |
| Lokum | 5 |
| Anne | 7 |
| Baba | 3 |
| Babaanne | 5 |
| Dede | 5 |

---

## Barış'a gösterilecek storyboard (12 kare)

1. **Açılış:** Çınarlı apartman, alt bahçede kahvaltı masası, balkondan Kino'nun başı ve sarkık kulakları. Logo.
2. **S1, salon:** Anne tezgâhta büyük tepsiyi doldurur. Kino tepsinin yanında parmak uçlarında, kuyruğu dik. Arkada Baba elinde kupayla ayakta uyuyor.
3. **S1:** Anne ekmek sepetini uzatır, Kino'nun kulakları yarı düşük. Lokum Kuzu'yu "sepet" gibi kaldırıyor.
4. **S2, apartman önü:** Kino sepetle koşuyor; bir simit havada. Arkada Anne büyük tepsiyle dengeli ve yavaş geliyor. Kapıda Pamuk geriniyor.
5. **S3, bahçe:** Babaanne pişi tavasının başında, buhar. Kino sepeti masaya koyuyor, gözleri Babaanne'nin dolu tepsisinde.
6. **S3, hayal:** Parlayan bahçe. Kino başının üstünde dev bir pişi tepsisiyle masaların üstünden uçuyor; aile alkışlıyor.
7. **S4:** Kino küçük zeytin tepsisiyle koşuyor; üç zeytin havada, çimene yuvarlanıyor. Lokum arkadan eğilmiş topluyor.
8. **S4, duygu anı:** Masada tabakta tek zeytin. Kino'nun kulakları ve kuyruğu yere düşük. Arkada Dede sulama kabını bırakıyor.
9. **S5:** Dede boynunu omuzlarına çekmiş, boş tepsiyle "kaplumbağa"; yanında Lokum aynı pozda. Kino gülüyor.
10. **S5:** Kino kaplumbağa adımıyla bahçeyi geçiyor: dizler kırık, dil ucu dışarıda, gözler tepside. Önünden bir kelebek onu geçiyor.
11. **S6:** Limon ağacının yanında Baba gözleri fırlamış, "Kalktım!"; Kino önünde kupalı tepsiyle gururlu. Arkada Lokum aynı adımla geliyor.
12. **S7, final:** Bütün aile masanın arkasında, pişiler elden ele. Önde Lokum avucundaki tek zeytinle "Kaplumba!", herkes gülüyor.
