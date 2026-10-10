# Kino ve Ailesi · Oyunlu Bölüm 1: Kino'nun Bir Günü

> Durum: **TASLAK** (2026-10-10). Barış görmeden animatiğe geçilmez.
> Biçim: [OYUNLU-FORMAT.md](OYUNLU-FORMAT.md). Karakterler: [SERI-KITABI.md](SERI-KITABI.md). Kit ve çizim listesi: [KARAKTER-KITI.md](KARAKTER-KITI.md) §8.
> **Süre:** hikâye ~6 dk (açılış ve jenerik dahil) + 5 oyun anı ~3,5 dk = **~9,5 dk**.
> **Üretim:** canlı JS film motoru (`film/src`). Önerilen sahne dosyası: `content/oyunlu/kinonun-bir-gunu.json`.
> **Ücretsiz bölüm** (OYUNLU-FORMAT §7).

## Künye

- **Konu:** Sıradan bir cumartesi.
  - Kino sabah "Ben büyüdüm artık! Hepsini kendim yaparım." der.
  - Dişini kendisi fırçalar, kendisi giyinir. Lokum kahvaltıda "Yok!" deyince ona tabaktan bir yüz yapar. Parka çıkmadan ayakkabısını ilk kez kendisi bağlar.
  - Parkta Mino "Hadi, yarışalım!" diye çağırır. Kino, peşine takılan Lokum'a "Sen küçüksün, gelemezsin!" deyip koşar. Lokum arkasından koşarken düşer, dizi sıyrılır.
  - Kino geri döner. Lokum'u yavaşça okşar, dizine bant yapıştırır, özür diler, onu küçük kaydırağa götürür.
  - Akşam küvette, parkta bulduğu çakıl taşıyla batar-yüzer dener.
  - Yatakta Anne'ye gününü anlatırken kocaman esner.
- **Gösterdiği:** Büyümek her şeyi kendin yapmak değildir; bazen küçük birine yavaşça yardım etmektir. Bu cümle hiçbir yerde söylenmez; bölüm bunu gösterir.
- **Duygu eğrisi:** uykulu tatlılık → gurur ("kendim!") → kardeşe şefkat (tabak) → büyük gurur (fiyonk) → heves ve bencillik (yarış) → suçluluk (Lokum düştü) → yumuşaklık (okşama, bant) → onarım ve sevinç (birlikte kaydırak) → merak (batar mı?) → huzur (yatak).
- **Oyun anları:**

  | # | Ad | El hareketi | Öğrettiği |
  |---|---|---|---|
  | 1 | **Kum Saati** | hareketli köpüğün peşinden git | dişlerin her yeri; ne kadar süre fırçalanır |
  | 2 | **Lokum'un Tabağı** | kahvaltılıkları yerleştir | yüzün bölümleri, şekiller, renkler; 5-6: iki göz, iki kulak, gözlem |
  | 3 | **Tavşan Kulakları** | bağcığı çek, ilmek yap | ilk ayakkabı bağı: sıra, ince motor |
  | 4 | **Yavaş Yavaş** | yavaş okşa, bandı soy, yapıştır | empati, nazik olmak, bir duygunun adı |
  | 5 | **Batar mı, Yüzer mi?** | bırak ve izle; 5-6: önce tahmin | batmak-yüzmek, ağır-hafif |

- **Lokum'un bu bölümdeki yeni sözcüğü:** **"Bant!"**
- **Türk evi ve aile sıcaklığı:**
  - Babaanne bahçeden "Kahvaltı hazııır!" diye seslenir.
  - Baba fırından sıcak simit getirir.
  - Kahvaltı limon ağacının altında, ince belli bardaklarda çayla yapılır.
  - Babaanne'nin hırka cebinden yara bandı çıkar.
  - Dede alt kattan tavana üç kez vurarak "iyi geceler" der.
- **Kapanış kartı (Kino'nun sesiyle):** *"Bugün kocaman bir gündü. Yarın yine!"*

## Mekânlar

| Kod | Yer | Durum | Katmanlar (z) |
|---|---|---|---|
| M0 | Çınar Apartmanı cephesi + kapı önü basamakları | Bölüm 1 ile ortak; basamak yakın planı ek katmandır | gök ve çınar (-60), cephe (-25), kapı + basamak (0) |
| M1 | Çocuk odası, sabah ve gece ışığı | Bölüm 1 ile ortak | pencere dışı (-60), duvar + perde (-25), Kino'nun yatağı, Lokum'un karyolası, kitaplık (0), ön: yastık (+4) |
| M3 | **Banyo:** lavabo, ayna, küvet, tek set; sabah ve akşam ışığı | **yeni**; Bölüm 2 "Banyo Yok!" ile ortak | pencere + karolar (-25), lavabo/ayna ucu ve küvet ucu (0), ön: paspas, havlu askısı (+4) |
| M4 | **Babaanne'nin bahçesi:** limon ağacı, kahvaltı masası, fesleğen tarhı | **yeni**; dizinin daimi seti | apartman arka duvarı + gök (-60), limon ağacı + tarh (-25), masa ve sandalyeler (0), ön: saksı (+4) |
| M5 | Sokak (parka yürüyüş) | `assets/film/sokak` yeniden kullanılır (stil denetimiyle) | mevcut 3 katman |
| M6 | Park | `assets/film/park` + `esya/kaydirak`, `salincak`, `kum-havuzu`, `bank` (stil denetimiyle) | mevcut katmanlar |

## Oyuncular

| Karakter | Kit | Sahneler |
|---|---|---|
| Anlatıcı | ses (yeni ses, Barış seçer) | baştan sona; oyunlarda "oyun sesi" |
| Kino | tam kit + 3/4 + yan; **pijama** ve **banyo gövdesi** kostümleri | her sahne |
| Lokum | tam kit + yan; **banyo gövdesi** | her sahne |
| Anne | tam kit + yan | S1-S4, S8 |
| Baba | tam kit (fırıncı önlüğü katmanı dahil) | S4, S7 |
| Babaanne | önden kit | S4-S6 |
| Dede | önden kit | S4; S8'de yalnız ses ("tık tık tık") |
| Mino | tam kit | S6 |

## Bölüme özel pozlar (kit dışı; Gemini + Adobe, bkz. KARAKTER-KITI §8.3)

OP1-OP11 yeni; P5, P9 (Anne'siz de kullanılır), P10 Bölüm 1'den ortak. Liste KARAKTER-KITI §8.3'te.

## Ses ve müzik

- **Müzik** (mevcut `assets/muzik/`):
  - `film-acilis`: açılış;
  - `film-merak`: sabah;
  - `film-gecis`: sahne geçişleri;
  - `film-fon-pazar`: bahçe kahvaltısı, hafif;
  - `film-kovalamaca`: parkta yarış;
  - `film-uzgun`: Lokum düşünce, çok hafif;
  - `film-kutlama`: kaydırak;
  - `ninni-sozsuz`: yatak;
  - `film-kapanis`: kart ve jenerik.
- **Oyun fonları** (döngülü, sakin):
  - Kum Saati: `banyo-sozsuz` (sözler Mino'yu anlattığı için yalnız sözsüz hâli);
  - Tabak: `film-merak` döngüsü;
  - Tavşan Kulakları: `film-merak` yavaş;
  - Yavaş Yavaş: müzik yok, yalnız kuşlar ve rüzgâr;
  - Batar mı Yüzer mi: `banyo-sozsuz`.
- **Efektler:**
  - Mevcut: `pof`, `kikir`, `tik`, `ayak`, `huzun`, `hih`, `horul`.
  - Bölüm 1 ile ortak: `kus-cik`, `cit-cit`, `horlama`.
  - Yeni (Web Audio sentezi yeter): `fircala` (fışır fışır), `kum` (kum akışı, ince), `gulu` (gargara), `pft` (tükürme), `tabak-tik` (tabağa konan yiyecek), `hisir` (bağcık), `gicir` (bağcık sıkılınca), `fiyonk` (parıltılı iki nota), `cirt` (bant kâğıdı soyma), `pit` (bant yapışma), `plop` (suya düşme), `blub` (batma kabarcıkları), `sapir` (su sıçraması), `tik-tavan` (Dede'nin üç vuruşu, boğuk).

## Kamera dili

- Hikâyede kamera **çocuk göz hizasında** (Bölüm 1 gibi). Kimse kameraya bakmaz.
- **Oyunda kamera oyuna göre değişir; her oyunun kadrajı başkadır** (OYUNLU-FORMAT §8):
  - aynanın içinden (diş),
  - **tepeden** (tabak),
  - ayakkabıya çok yakın (bağcık),
  - yere alçak (Lokum'un dizi),
  - küvetin kenarından, su yüzeyi kadrajın ortasında (batar-yüzer).
- Duygu anlarında yavaş yaklaşma ve arka planda hafif yumuşaklık (önceden yumuşatılmış uzak katman).

---

## AÇILIŞ (0:00-0:15) · M0

- **Olur:** Seri açılışının kısa hâli. Kamera çınarın dallarından cepheye süzülür. Balkonda Kino el sallar, kulakları sallanır. **"Kino ve Ailesi"** yazısı belirir.
- ANLATICI: **"Kino ve Ailesi. Kino'nun Bir Günü."**
- **Müzik:** `film-acilis`.

## SAHNE 1 · Günaydın (0:15-0:50) · M1, sabah ışığı

- **Kamera:** yatağa alçak orta plan. Fonda `kus-cik`, hafif `film-merak`.
- **Olur:** Kino yorganın altında uyuyor (P9, Anne yok). Uzun kulakları yastığa iki yana yayılmış, kuyruk ucu yorganın kenarından sarkıyor. Krem üstüne yeşil yıldızlı pijamasını giyiyor.
- ANLATICI: "Sabahtı. Güneş, Kino'nun kulağına kadar gelmişti."
- Lokum karyolasında ayakta, parmaklıklara tutunmuş zıplıyor (OP1).
- LOKUM: "Abi! Abi!"
- Kino'nun bir kulağı kalkar, sonra öteki. Kocaman esner, kulakları havaya kalkar.
- KİNO: "Günaydın, Lokum!"
- Anne kapıda belirir, Lokum'u karyoladan alır.
- ANNE: "Günaydın! Bugün Babaanne'yle parka gidiyorsunuz."
- KİNO (yataktan fırlar): "Park mı? Yaşasın!"
- ANNE: "Önce yüz, diş, giyinmek."
- KİNO (göğsünü gerer, kuyruk dikilir): **"Ben büyüdüm artık! Hepsini kendim yaparım."**
- ANLATICI: "Kino o sabah her şeyi kendisi yapmak istiyordu."
- Kino koridora koşar. Anne'nin kucağındaki Lokum arkasından el uzatır: "Abi!"

## SAHNE 2 · Lavabo (0:50-1:10 hikâye · OYUN 1 ~40 sn · 1:10-1:20 dönüş) · M3, sabah

- **Kamera:** Lavabonun yanından orta plan. Kino basamak taburesinde, Lokum Anne'nin kucağında, lavabonun öbür ucunda.
- **Olur (yüz yıkama, kısa ve komik):** Kino avuçlarıyla suyu fazla çarpar. Su aynaya ve Lokum'a sıçrar.
- LOKUM (kıkırdar): "Daha!"
- Kino havluyla yüzünü kurular. Yüzündeki tüyler kabarık çıkar, pofuduk. Anne gülümsemesini saklar.
- **Olur (macun, hikâyede):** Kino tüpü iki eliyle sıkar. Kocaman, kıvrım kıvrım bir macun kulesi çıkar.
- KİNO: "Iı… biraz çok oldu."
- ANNE: "Bezelye kadar yeter, canım."
- Anne fazlasını alır, bezelye kadarını bırakır. **Resimle bilgi:** fırçanın yanında bir an küçük bir bezelye resmi belirir.
- Anne lavabonun kenarına küçük bir **kum saati** koyar.
- ANNE: "Kum bitene kadar fırçala."
- ANLATICI: "Kum saati, Anne'nin dişçiden aldığı hediyeydi."
- **Köprü:** Kamera aynanın içine döner. Artık Kino'yu aynadan görürüz; yüzü kocaman. Kino "Iii" diye dişlerini gösterir.

### OYUN 1 · Kum Saati (~35-40 sn)

- **Hikâyedeki sebebi:** Kino dişini kendisi fırçalamak istiyor. Anne kum saatini koydu: kum bitene kadar.
- **Çekirdek fikir:** Kino'nun dişlerinin üstünde **yavaşça gezinen bir köpük topu** vardır. Çocuk parmağıyla (fırçayla) onun **peşinden gider**. Fırça köpüğün üstündeyken kum saatinden kum akar. Parmak köpükten ayrılırsa kum durur, köpük de bekler. Kum bitince dişlerin her yeri fırçalanmış olur.
- **Bu oyun hangi oyunumuza benziyor, farkı ne?** Mino Banyo ve Kino'nun Otobüsü'ndeki **ovalamaya** benziyor (parmakla sürtmek). Fark: Orada duran bir lekeyi silinene kadar ovarsın. Burada **hareket eden** bir hedefin peşinden gidersin ve amaç **süre**dir: kum bitene kadar her yeri gezmek. Bizim oyunlarımızda iz sürme ve süre fikri yok.
- **Kadraj:**
  - Yatay: Aynadan görünüş. Kino'nun başı ve omzu sağ ortada, ekran yüksekliğinin %80'i. Dişler iki sıra halinde açıkça görünür, dişlerin alanı ~300×130 px. Sol altta lavabo kenarında kum saati (~90×120 px, iri, camı parlak). Sol kenarda küçük Lokum, Anne'nin kucağında, minik fırçasıyla Kino'yu taklit ediyor.
  - Dikey: Kino'nun yüzü üst yarıda, kum saati altta ortada.
- **Etkileşim:**
  1. Köpük topu (beyaz, iri, ~80 px; minik kabarcıkları var) üst dişlerin sağ ucunda belirir ve hafifçe nabız atar.
  2. Çocuk parmağını üstüne koyar. Fırça parmağa gelir: Kino'nun eli fırçayla birlikte hareket eder. Fırça köpüğün üstündeyken:
     - köpük yavaşça kayar;
     - fırçanın kılları titrer (`fircala`);
     - geçtiği dişler parlar;
     - kum saatinden kum akar (`kum`).
  3. Yol: **üst dişler sağdan sola → alt dişler soldan sağa**.
  4. Parmak köpükten çıkarsa köpük durur ve hafifçe parlar, kum da durur. Ceza yok; köpük bekler.
  5. Kum bitince "ding". Kino ağzını çalkalar (`gulu`, yanaklar balon gibi şişer), tükürür (`pft`).
- **Hedefler:**
  - köpük topu: 80 px görünür, dokunma alanı 120 px (3-4) / 90 px (5-6);
  - kum saati yalnız gösterge, dokunulmaz.
- **Başarı geri bildirimi:**
  - Her dişin üstünden geçince küçük bir "ting" ve parıltı; notalar sırayla yükselir.
  - Kum saatinin alt haznesi doldukça kum tepesi büyür.
  - Sonda Kino aynaya kocaman "Iii" yapar, üç parıltı çıkar, kuyruk pervane olur.
- **Tatlı yanlış:** Parmak burna kayarsa fırça Kino'nun burnunu gıdıklar. Kino hapşırır: "Hapşu!" Köpükler uçar, Lokum kıkırdar. Ceza yok, köpük yerinde bekler.
- **Yardım:** 18 sn'de Kino kendi eliyle köpüğü biraz götürür: *"Bak, böyle!"*. 30 sn'de mırıldanarak kalanı kendisi fırçalar: *"Ben bitiririm!"*. Kum hızlanarak biter.
- **Yaş:**
  - **3-4:** Köpük düz bir çizgide yavaş gider (üst sıra ~8 sn, alt sıra ~8 sn). Dokunma alanı geniş.
  - **5-6:** Köpük dişlerin üstünde **yukarı-aşağı küçük zikzaklarla** gider (doğru fırçalama hareketi). Yol dört bölgedir: üst sağ, üst sol, alt sol, alt sağ. Her bölge bitince Kino sayar: *"Bir! İki! Üç! Dört!"* (~25 sn).
- **Öğrettiği (resimle bilgi):**
  - Dişlerin **her yeri** fırçalanır.
  - **Ne kadar süre?** Kum bitene kadar: kum saati süreyi gözle gösterir.
  - 5-6 yaş: **yukarı-aşağı** fırçalanır, dört bölge sayılır.
- **Kalıcı iz:**
  - Kum saati banyoda kalır; akşam küvet sahnesinde lavabonun kenarında görünür.
  - Kahvaltıda Kino gülünce dişleri bir an parıldar.
- **Lokum (sürekli, süs):** Bir adım geriden Kino'yu taklit eder. Fırçayı burnuna sürer, kıkırdar. Kino tükürünce o da suyu olmadan "Pft!" yapar.
- **Cümleler:**
  - Oyun sesi: *"Köpüğün peşinden gidelim."* · yardım: *"Köpüğün üstünde kalalım."* · 5-6: *"Yukarı, aşağı."* · bitiriş: *"Pırıl pırıl!"*
  - Kino: *"Bak, böyle!"*, *"Ben bitiririm!"*, *"Hapşu!"*, 5-6: *"Bir! İki! Üç! Dört!"*
  - Lokum: *"Pft!"*, *"Iii!"*
- **Hikâyeye dönüş:** Kamera aynadan çıkar, yan plana döner. Kino aynaya "Iii" yapar. Lokum da yapar ve iki minik dişini gösterir.
  - ANLATICI: "Dişler pırıl pırıldı. Lokum'un iki dişi bile."
  - ANNE (güler): "Dişçi görse sevinirdi!"

## SAHNE 3 · Kendim giyinirim (1:20-1:50) · M1, sabah · *oyunsuz*

- **Kamera:** oda, orta plan. Sandalyede Anne'nin hazırladığı giysiler: yeşil tişört, lacivert fular.
- ANLATICI: "Kino ilk kez yardımsız giyinecekti."
- **Olur (gag):** Kino pijamanın üstünü başından çıkarmaya çalışır. **Uzun kulakları yakaya takılır**: kafası pijamanın içinde, kolları havada, sağa sola sallanır (OP2).
- KİNO (pijamanın içinden, boğuk): "Kulaklarım! Kulaklarım nerede?"
- Bir silkelenme ve **"pof!"**: pijama fırlar, kulaklar iki yana açılıp yaylanır.
- Lokum kapıda, Anne'nin dizine tutunmuş, kahkaha atar: "Daha!"
- Kino tişörtü giyer, fuları bağlar. Fular biraz yamuk durur. Aynaya bakar, göğsünü gerer.
- KİNO: "Ben büyüdüm artık!"
- Anne fuları düzeltmek için elini uzatır, durur, bırakır. Gülümser.
- ANNE: "Kendin giyinmişsin. Çok yakışmış."
- Uzaktan, aşağıdan BABAANNE (ses): "Kahvaltı hazııır!"
- KİNO: "Babaanne!" Ayağına terliklerini geçirip koşar (`ayak`).
- **Geçiş:** `film-gecis`, bahçeye.

## SAHNE 4 · Limon ağacının altında (1:50-2:25 hikâye · OYUN 2 ~45 sn · 3:10-3:25 dönüş) · M4

- **Kamera:** Bahçe, geniş plan, limon ağacının altında uzun masa. Fonda hafif `film-fon-pazar`.
- **Olur:** Babaanne masaya pişi tepsisini koyar.
- BABAANNE: "Sizin için yaptım, sıcacık!"
- Bahçe kapısından Baba girer. Fırıncı önlüğü üstünde, kucağında kocaman bir simit sepeti.
- DEDE (gür kaşlarını kaldırır): "Bak sen şu işe. Simitler de geldi."
- Baba sepeti bırakır, sandalyeye oturur… ve oturduğu yerde başı göğsüne düşer (OP3). `horlama`.
- ANLATICI: "Baba sabahın dördünde kalkmıştı. Gözleri kendiliğinden kapandı."
- Herkes kahvaltıya başlar. Lokum mama sandalyesinde (OP7), önündeki tabağı iter.
- LOKUM: "Yok!"
- Anne kaşığı uçak gibi uçurur. LOKUM: "Yok!" (başını çevirir, iki kulağı savrulur)
- Kino Lokum'a bakar. Bir kulağı kalkar; aklına bir şey gelmiştir.
- KİNO: "Ben yaparım! Sana bir yüz yapayım."
- **Köprü:** Kamera **tepeye kalkar** ve Lokum'un tabağına yukarıdan bakar. Tabağın üst kenarında Lokum'un kocaman gözleri ve kulak uçları merakla görünür (OP11).

### OYUN 2 · Lokum'un Tabağı (~40-45 sn)

- **Hikâyedeki sebebi:** Lokum kahvaltı etmek istemiyor. Kino, abisi olarak, onu güldürüp yedirmenin yolunu buluyor: tabaktan bir yüz.
- **Çekirdek fikir:** Kahvaltılıklarla tabağa **serbest bir yüz** kurulur. Bir simit yüzün çerçevesidir. Zeytinler, domates, peynir ve salatalık göz, burun, ağız, kulak olur. **Lokum yüze bakıp tepki verir**: güzel yüze güler, komik yüze kahkaha atar. Yüz bitince Lokum onu yemeye başlar. Doğru yüz diye bir şey yoktur.
- **Bu oyun hangi oyunumuza benziyor, farkı ne?** Pasta'daki ve Kino'nun Otobüsü'ndeki **süslemeye** benziyor (malzemeyi ürünün üstüne koymak). Fark: Orada müşterinin resimli isteğini **kopyalarsın** ve sonra karşılaştırılır. Burada istek yok, karşılaştırma yok. Çocuk **kendi yüzünü** kurar; "müşteri" bir kardeşin keyfidir. 5-6 yaşta ölçü bir sipariş değil, **gözlemdir**: tabaktaki yüzü Lokum'un kendi yüzüne benzetmek (bir kulağı kestane, öbürü beyaz).
- **Kadraj:**
  - Yatay: Tepeden. Ortada kocaman beyaz tabak (~300 px). Tabakta Kino'nun koyduğu **simit**, yüzün çerçevesi. Tabağın üst kenarında Lokum'un burnu, gözleri ve kulak uçları; tabağa doğru eğilmiş. Tabağın iki yanında küçük kahvaltı kâseleri, her biri ~84 px:
    - sol: zeytin (siyah), domates dilimi (kırmızı, yuvarlak);
    - sağ: peynir (beyaz, üçgen), salatalık dilimi (yeşil, yuvarlak), kızarmış ekmek üçgeni (kestane).
  - Kâselerin altında masa örtüsü (oyun zemini). Kino'nun elleri tabağın sağ alt köşesinden görünür.
  - Dikey: tabak ortada, kâseler alta iki sıra.
- **Etkileşim:**
  - Kâseden bir yiyecek sürüklenir ve tabağın içinde (simidin içinde ya da çevresinde) bırakılır. Hafif bir mıknatıs yiyeceği tabağın yüzeyine oturtur (`tabak-tik`). Her kâseden istenen kadar alınır; kâse boşalmaz.
  - Tabaktaki bir yiyecek sürüklenip yeri değiştirilebilir. Tabak dışına bırakılırsa kâsesine geri süzülür.
- **Lokum'un canlı tepkileri** (oyunun kalbi; her yerleştirmede 0,5-1 sn, girdiyi kilitlemez):
  - **İki göz konunca:** Lokum'un gözleri kocaman açılır, nefesini tutar: "Ooo!"
  - **Burun:** Lokum kendi burnuna dokunur, kıkırdar.
  - **Ağız (gülümseyen peynir ya da yay gibi dizilmiş zeytinler):** Lokum da aynı şekilde güler.
  - **Komik yerleşim** (göz çenede, kulak tepede, beş göz): Lokum kahkahayla sandalyesinde zıplar (`kikir`). En güçlü tepki budur; çocuk bunu bulup tekrar yapmak ister.
  - **Kulaklar:** Lokum başını sallar, kendi kulakları savrulur.
- **Bitiş:** Tabakta en az bir göz, bir orta parça ve bir alt parça varsa ya da 6 parça konduysa Kino "Bak Lokum, bu sensin!" der. Lokum tabağa bakar, sonra Kino'ya: "Benim!" Bir parçayı alıp ağzına atar: "Ham!" Ardından tabağı yemeye başlar.
- **Hedefler:** 5 kâse × 84 px. Tabak bırakma alanı ~300 px. Tabaktaki parçalar en az 56 px görünür, 72 px dokunma alanı.
- **Tatlı yanlış:** Yok; her yüz geçerlidir. Tek şaka: Kino'nun kendi tabağından bir zeytin sürüklenirse Kino *"O benim!"* der, güler, bırakır.
- **Yardım:** 18 sn'de Kino iki zeytini göz olarak kendisi koyar: *"Önce gözler!"*. 30 sn'de kalan burnu ve ağzı hızla koyar: *"Bir burun, bir ağız!"*
- **Yaş:**
  - **3-4:** Serbest yüz. Anlatıcı her konan parçanın **adını ve rengini** söyler: *"Kırmızı burun!"*, *"Yeşil kulak!"*
  - **5-6:** Kino ister: *"Lokum'a benzesin!"* Lokum tabağın kenarında, kendisi örnektir. Çocuk:
    - **iki göz** koyar; Kino sayar: *"Bir, iki!"*;
    - **iki kulak** koyar, **biri kestane, biri beyaz**; kızarmış ekmek ve peynir. Hangi tarafa konduğu fark etmez.
    
    İki kulak doğru renkte olunca Lokum bir kulağını tutar, sonra tabaktakini gösterir: "Benim!" Kahkaha ve parıltı. Renkler tutmazsa ceza yok: Kino Lokum'un kulaklarını iki eliyle kaldırıp gösterir, *"Bir kahve, bir beyaz!"*, ve sırayı geri verir. 3. denemede kestane parça kendisi parlar.
- **Öğrettiği (resimle bilgi):**
  - Yüzün bölümleri: **göz, burun, ağız, kulak**.
  - **Şekiller:** yuvarlak (domates, salatalık, simit), üçgen (peynir, ekmek).
  - **Renkler:** kırmızı, yeşil, siyah, beyaz, kestane.
  - 5-6 yaş: **iki** (çift parçalar) ve **gözlem**.
  - Kardeşine sabırlı ve yaratıcı yardım.
- **Kalıcı iz:** Tabaktaki yüz kaydedilir. Kapanış kartındaki polaroid budur; kartta Lokum'un yarısını yediği hâli görünür.
- **Cümleler:**
  - Oyun sesi: *"Lokum'a bir yüz yapalım."* · yardım: *"Gözleri koyalım."* · renk/ad sözleri (3-4): *"Kırmızı burun!"*, *"Siyah göz!"*, *"Yeşil kulak!"*, *"Beyaz ağız!"* · bitiriş: *"Lokum güldü!"*
  - Kino: *"Önce gözler!"*, *"Bir burun, bir ağız!"*, *"Bak Lokum, bu sensin!"*, 5-6: *"Lokum'a benzesin!"*, *"Bir kahve, bir beyaz!"*, *"O benim!"*
  - Lokum: *"Ooo!"*, *"Benim!"*, *"Ham!"*
- **Hikâyeye dönüş:**
  - Kamera tepeden masa yüksekliğine iner. Lokum ağzı dolu, yanakları şişkin, "Daha!" diye uzanıyor.
  - ANNE (şaşkın, sevinçli): "Lokum yiyor! Ne yaptın sen?"
  - KİNO (gururla; dişleri bir an parlar): "Yüz yaptım!"
  - Baba hâlâ uyuyor (`horlama`).
  - DEDE (çay bardağını Baba'nın burnunun dibine uzatır): "Murat. Çay."
  - BABA (doğrulur): **"Çay mı? Kalktım!"**
  - Herkes güler (`kikir`).
  - BABAANNE: "Hadi bakalım, parka!"
  - **Geçiş:** `film-gecis`.

## SAHNE 5 · Kapı önü: tavşan kulakları (3:25-3:45 hikâye · OYUN 3 ~45 sn · 4:30-4:40 dönüş) · M0, kapı önü basamakları

- **Kamera:** Apartman kapısının önünde, taş basamakta alçak plan. Babaanne Lokum'un pusetinin yanında. Lokum pusette Kuzu'yla.
- **Olur:** Kino basamağa oturur (OP4), kırmızı spor ayakkabılarını giyer. Bağcıklar çözük ve yere sarkıyor.
- BABAANNE (eğilir): "Bağlayayım mı, kuzum?"
- KİNO: "Hayır! Kendim bağlarım!"
- BABAANNE (hırkasını düzeltir, bekler): "Acele yok. Bekliyorum."
- ANLATICI: "Kino daha önce hiç kendi bağcığını bağlamamıştı."
- **Köprü:** Kamera Kino'nun sağ ayakkabısına iner, çok yakına. Ayakkabı ekranın ortasında kocaman; iki beyaz bağcığın uçları iki yanda.

### OYUN 3 · Tavşan Kulakları (~40-45 sn)

- **Hikâyedeki sebebi:** Kino ilk kez kendi bağcığını bağlamak istiyor. 5 yaşındaki çocuğun "büyüdüm" dediği gerçek bir an.
- **Çekirdek fikir:** **Gerçek bir ip** gibi davranan iki bağcıkla, dört hareketle fiyonk yapılır: **çaprazla, sık, iki kulak yap, bağla.** İlmekler Kino'nun uzun sarkık kulaklarına benzer. Kino da bunu fark eder: *"Benim kulaklarım gibi!"*
- **Bu oyun hangi oyunumuza benziyor, farkı ne?** Kino Ne Giysin?'deki **sürükleyip giydirmeye** benziyor (Kino'ya bir şey takmak). Fark: Orada doğru giysiyi seçip doğru yere bırakırsın; seçim ve hava vardır. Burada seçim yok. Çocuk **bir düğümü kendi eliyle yapar**: ip fiziği, dört adımlı sıra, el becerisi. Bu ip ve düğüm hareketi hiçbir oyunumuzda yok.
- **Kadraj:**
  - Yatay: Ayakkabı ortada, ekran genişliğinin ~%45'i. Bağcıklar ayakkabının üstündeki son delikten çıkıp iki yana sarkıyor. **Bağcık uçları** (plastik uçlu, beyaz) iri birer tutamaçtır: ~72 px dokunma alanı, hafifçe parlar. Arka plan yumuşatılmış basamak; Kino'nun dizleri ve elleri kadrajın üstünde.
  - Dikey: ayakkabı ortada büyük, bağcıklar aşağı doğru sarkar.
- **Etkileşim (5-6, tam dört adım):**
  1. **Çaprazla:** Sol bağcığın ucu sağa, öbürünün üstünden sürüklenir. Bağcıklar **X** olur (`hisir`). X'in yeri hayalet bir çizgiyle parlar.
  2. **Sık:** İki uç sırayla dışa doğru çekilir. Düğüm sıkışır, ayakkabının dili hafifçe ezilip yaylanır (`gicir`).
  3. **İki kulak:** Her bağcığın ucu düğüme geri sürüklenir. Bağcık **ilmek** olur, bir "tavşan kulağı". Sıra serbesttir. İkinci ilmek oluşunca Kino güler: *"Benim kulaklarım gibi!"* Kendi kulaklarını iki eliyle ilmeklerin yanına tutar (şirin an, 1 sn).
  4. **Bağla:** Bir ilmek öbürünün üstünden çaprazlanır ve iki ilmek dışa çekilir. **Fiyonk** olur: `fiyonk`, parıltı.
- **İp:** Her bağcık ~12 halkalı basit bir ip fiziğiyle hareket eder (kodla çizilir: beyaz şerit + koyu kahve kontur). Parmak ucu çeker, ip sallanıp uyar. Doğru hedefe yaklaşınca mıknatıs oturtur.
- **Hedefler:** iki uç tutamacı (72 px). Hedef noktaları (X yeri, düğüm) 96 px parlayan halkalar. Aynı anda yalnız bir hedef parlar.
- **Başarı geri bildirimi:**
  - Her adımda bir nota; ayakkabı küçük bir sekme yapar.
  - Fiyonkta ayakkabı hafifçe zıplar. Kino'nun ayağı kadraja girip iki kez yere vurur, "pat pat".
- **Tatlı yanlış:**
  - Çaprazlamadan çekilirse bağcık kayar ve gevşek sarkar. Kino: *"Önce çapraz!"*. X yeri parlar.
  - İlmek yapmadan bağlamaya çalışılırsa uç ilmek olmadan düğüme gelir ve kendiliğinden ilmeğe döner. Ceza yok.
- **Yardım:** 18 sn'de Kino'nun elleri o adımı yavaşça kendisi yapar: *"Bak, böyle!"* 30 sn'de Kino kalanı hızla bitirir: *"Çapraz, sık, kulak, bağla!"*. Öbür ayakkabıyı da hemen bağlar.
- **Yaş:**
  - **3-4:** Adım 1 ve 2'yi çocuk yapar (iki kısa sürükleme). Adım 3'te çocuk **ilmeklere dokunur**; Kino ilmekleri kendisi yapar, her dokunuşta bir "kulak" belirir. Adım 4'te iki ilmeği dışa çekmek için tek bir sürükleme. Öbür ayakkabıyı Kino bağlar.
  - **5-6:** Dört adımın hepsi sürükleyerek yapılır. Öbür ayakkabı için tekrar istenmez; Kino hızla bağlar: *"Bunu da ben!"*. Tek ayakkabı yeter, çünkü kalite süreden önemli.
- **Öğrettiği (resimle bilgi):**
  - Ayakkabı bağlamanın **sırası**: çapraz, sık, kulak, bağla.
  - El becerisi.
  - Sözcükler: **bağcık, düğüm, fiyonk, çapraz**.
  - "Kendim yapabilirim" gururu.
- **Kalıcı iz:** Fiyonk ayakkabıda kalır. Parkta Kino koşarken fiyonk sallanır. Akşam ayakkabılar kapıda fiyonklu durur.
- **Cümleler:**
  - Oyun sesi: *"Bağcıkları çaprazlayalım."* · *"Şimdi sıkıca çekelim."* · *"İki kulak yapalım."* · *"Kulakları bağlayalım."* · yardım: *"Ucu öbür yana götürelim."* · bitiriş: *"Fiyonk oldu!"*
  - Kino: *"Önce çapraz!"*, *"Benim kulaklarım gibi!"*, *"Bak, böyle!"*, *"Bunu da ben!"*
- **Hikâyeye dönüş:**
  - Kamera geri açılır. Kino ayağa fırlar, tek ayak üstünde ayakkabısını gösterir.
  - KİNO: **"Ben büyüdüm artık!"**
  - BABAANNE (ellerini çırpar): "Maşallah! Kocaman olmuşsun."
  - LOKUM (pusetten, kendi çıplak ayağını havaya kaldırır): "Benim!"
  - Herkes güler.

## SAHNE 6 · Park (4:40-5:45 hikâye · OYUN 4 ~40 sn · 6:25-6:55 dönüş) · M5 → M6

### 6a · Yol (4:40-4:55) · M5
- Babaanne puseti itiyor. Kino pusetin sapından tutmuş yürüyor, kaldırımın çizgilerinin üstünden atlıyor. Fiyonklar sallanıyor.
- BABAANNE: "Elin pusette, Kino."
- KİNO: "Tuttum!"

### 6b · Parkta (4:55-5:45) · M6
- **Olur:** Babaanne banka oturur (OP8), Lokum'u pusetten indirir. Kino kum havuzunun kenarında, güneşte parlayan **yuvarlak, düz, bembeyaz bir çakıl taşı** bulur. Taşı havaya kaldırır.
- KİNO: "Babaanne, bak! Parlak taş!"
- BABAANNE: "Ne güzel. Cebine koy, kaybolmasın."
- Kino taşı cebine koyar. **Bu taş akşam Oyun 5'te geri gelir.**
- Kamera büyük kaydırağın tepesine kalkar: Mino kırmızı fuları ve turkuaz elbisesiyle orada.
- MİNO: **"Kino! Hadi, yarışalım!"**
- Kino fırlar. Lokum Kino'nun koluna yapışır.
- LOKUM: "Abi! Ben de!"
- KİNO (kolunu çeker): "Sen küçüksün. Gelemezsin!"
- **Müzik:** `film-kovalamaca`. Kino büyük kaydırağa koşar (koşu döngüsü, fiyonklar uçuşur).
- ANLATICI: "Kino hemen koştu. Büyük kaydırak büyükler içindi."
- Lokum kollarını açıp paytak paytak peşinden koşar: "Abi! Abi!"
- Çimenin kenarında ayağı takılır. Poposunun üstüne düşer (`pof`), oturur (P5).
- **Müzik susar.** Lokum dizine bakar: küçük, pembe bir sıyrık. Alt dudağı titrer…
- LOKUM (ağlar): "Abiii!" (`huzun`)
- **Kamera:** Kino kaydırağın merdiveninde, ikinci basamakta durur. Döner. Kulakları iner, kuyruğu düşer.
- Babaanne banktan kalkar… ama durur. Kino'ya bakar. Hırkasının cebinden küçük, teneke bir **yara bandı kutusu** çıkarır.
- BABAANNE (yumuşak): "Lokum'un abisine ihtiyacı var."
- Kino merdivenden iner, Lokum'a koşar, yanına diz çöker (OP5). Babaanne kutuyu yanına bırakır, geri çekilir.
- ANLATICI: "Kino'nun içi sızladı. Lokum onun peşinden gelmişti."
- KİNO: "Lokum… canın mı yandı?"
- LOKUM (hıçkırır, dizini gösterir): "Abi…"
- ANLATICI: "Kino hatırladı. Annesi ona hep yavaşça dokunurdu."
- **Müzik:** `film-uzgun` çok hafif, sonra çekilir. Oyun fonu yok; kuşlar ve rüzgâr.
- **Köprü:** Kamera yere, Lokum'un yanına iner. Lokum'un yüzü ve dizi kocaman; Kino'nun elleri kadraja girer.

### OYUN 4 · Yavaş Yavaş (~35-40 sn)

- **Hikâyedeki sebebi:** Lokum, Kino'nun peşinden koşarken düştü. Kino'nun içi sızlıyor; onu yatıştırmak istiyor.
- **Çekirdek fikir:** **Ne kadar yavaş, o kadar iyi.** Lokum'un başı ve kulakları parmakla okşanır. Oyun parmağın **hızını** ölçer. Yavaş, yumuşak okşayışlar Lokum'u adım adım yatıştırır. Hızlı okşayış onu irkiltir. Sonra yara bandının **kâğıtları soyulur** ve bant dize yavaşça bastırılır.
- **Bu oyun hangi oyunumuza benziyor, farkı ne?** Banyo ve Otobüs'teki **ovalamaya** benziyor (parmakla sürtmek). Fark: Orada ne kadar çok ovarsan o kadar temizlenir. Burada **ölçü yavaşlıktır** ve amaç bir kardeşin **duygusudur**: hızlı olunca Lokum irkilir. Bandın kâğıdını **soymak** da hiçbir oyunumuzda olmayan yeni bir harekettir. Sesli Maceralar'daki "üfle" bilerek kullanılmadı.
- **Kadraj:**
  - Yatay: Alçak, çimen hizasında. Lokum ortada oturuyor (P5), yüzü ve başı iri (~260 px). Sıyrıklı **dizi** öne uzanmış, sağ altta (~120 px). Kino sağda diz çökmüş, eli Lokum'un omzunda. Sol altta açık teneke kutu; içinde üç bant.
  - Dikey: Lokum üstte, diz ve kutu altta.
- **Etkileşim:**
  1. **Okşa:** Lokum'un başında, kulaklarının üstünde yumuşak bir ışık var. Çocuk parmağını başın üstünde yavaşça kaydırır. Kino'nun eli parmağı izler; Kino okşuyor görünür.
     - **Yavaş okşayış** (hız sınırının altında; uzunluk ≥ ~80 px): Lokum'un ağlaması bir basamak azalır:
       **hıçkıra hıçkıra ağlama → ağlama → burun çekme → minik hıçkırık → sakin.**
       Her basamakta Lokum'un kulakları biraz kalkar, gözyaşları küçülür, omuzları iner.
     - **Hızlı okşayış:** Lokum irkilir ("Ih!"), başını omzuna çeker; basamak düşmez. Kino: *"Yavaş, yavaş."*. Ceza yok.
  2. **Bant seç:** Kutuda üç büyük bant var (her biri ~110×60 px): **sarı yıldızlı, kırmızı kalpli, krem kuzulu.** Birine dokununca kutudan çıkar, ortada büyür.
  3. **Soy:** Bandın iki ucunda kâğıt sekmeler var. Sekme dışa doğru sürüklenip soyulur (`cirt`); kâğıt kıvrılıp uçar.
  4. **Yapıştır:** Bant dize sürüklenir ve **basılı tutulur** (~1 sn). Bant dize yavaşça oturur (`pit`). Kino iki parmağıyla iki kez pat pat yapar.
- **Lokum'un bant tepkileri** (yanlış seçim yok, her biri ayrı tatlı):
  - Yıldız: Lokum gözünü kocaman açar, parmağıyla gösterir: **"Bant!"**
  - Kalp: Lokum dizini kendine çeker, bandı öper: **"Bant!"**
  - Kuzu: Lokum Kuzu'sunu bandın yanına tutar, ikisini karşılaştırır: **"Kuzu!"**. En büyük kahkaha; saklı sevinç.
- **Bitiş (kendiliğinden):** Lokum burnunu çeker, Kino'nun boynuna atılır. Kino sarılır; Kino'nun kuyruğu yavaşça sallanır, Lokum'un minik kuyruğu da (OP6).
- **Hedefler:**
  - okşama alanı ~260×140 px (Lokum'un başı ve kulakları);
  - bantlar ~110×60 px;
  - kâğıt sekmeleri ≥ 72 px dokunma alanı;
  - diz ~120 px.
- **Başarı geri bildirimi:** Ağlama basamakları açıkça duyulur ve görülür. Ses yavaş yavaş kısılır. Son basamakta kuş sesleri geri gelir. Banttan sonra kısa, sıcak bir müzik vurgusu.
- **Yardım:**
  - Okşamada 18 sn'de Kino'nun eli kendisi bir kez yavaşça okşar: *"Bak, yavaşça."*
  - Bantta 18 sn'de Kino kuzulu bandı kendisi alır ve soyar.
  - 30 sn'de Kino hepsini kendisi bitirir.
- **Yaş:**
  - **3-4:** 3 yavaş okşayış yeter, hız sınırı geniş. Bandın tek sekmesi var.
  - **5-6:** 5 yavaş okşayış, hız sınırı biraz daha dar. Bandın iki sekmesi var.

  Fark bundan ibarettir; duygu iki yaşta da aynıdır.
- **Öğrettiği (resimle bilgi):**
  - **Empati:** Birinin canı yanınca yanına gidilir.
  - **Nazik dokunuş:** yavaş ve yumuşak.
  - **Duygunun adı** (dönüşte Kino söyler): *korkmak*.
  - Küçük yaraya bakmak.
- **Kalıcı iz:** **Seçilen bant**, bölümün geri kalanında Lokum'un dizinde görünür: kaydırakta, küvette (Lokum dizini sudan çıkarıp korur), yatakta (uyuyan Lokum'un dizinde). Polaroidi de budur.
- **Cümleler:**
  - Oyun sesi: *"Lokum'u yavaşça okşayalım."* · yardım: *"Yavaş, yumuşacık."* · *"Bir bant seçelim."* · *"Kâğıdını soyalım."* · *"Dizine yapıştıralım."* · bitiriş: *"Lokum sakinleşti."*
  - Kino: *"Yavaş, yavaş."*, *"Bak, yavaşça."*
  - Lokum: *"Ih!"*, *"Bant!"*, *"Kuzu!"*
- **Hikâyeye dönüş:**
  - Kamera sarılmadan geri açılır.
  - KİNO (Anne'yi taklit eder; göz hizasına iner): "Korktun, değil mi?"
  - Lokum başını sallar.
  - KİNO: "Sana 'küçüksün' dedim. Özür dilerim."
  - LOKUM: "Abi!"
  - KİNO (elini uzatır): "Gel. Küçük kaydırağa birlikte gidelim."
  - **Olur:** Kino Lokum'un elini tutar. Lokum küçük kaydıraktan kayar; Kino yanında yürüyüp elini bırakmaz, Babaanne aşağıda kollarını açmış bekler. "Vııı!" Lokum'un dizindeki bant parlar.
  - Mino büyük kaydıraktan iner, koşarak gelir.
  - MİNO: "Ben de geliyorum!"
  - Kino ile Mino sırayla küçük kaydıraktan kayar. Lokum aşağıda alkışlar: "Daha!" (`film-kutlama`)
  - ANLATICI: "Küçük kaydırak, o gün en eğlenceli kaydıraktı."
  - **Geçiş:** `film-gecis`. Gök turuncuya döner, akşam olur.

## SAHNE 7 · Akşam banyosu (6:55-7:15 hikâye · OYUN 5 ~40 sn · 7:55-8:10 dönüş) · M3, akşam ışığı

- **Kamera:** Küvetin kenarından. Kino ile Lokum köpüklü suda; yalnız başları, omuzları ve kolları görünür (banyo gövdesi). Baba küvetin yanında diz çökmüş, kolları sıvalı. Lavabonun kenarında sabahki kum saati duruyor.
- LOKUM (bantlı dizini sudan kaldırır, gururla): "Bant!"
- BABA: "Dizini sudan çıkar. Aferin."
- Kino küvetin kenarına bir şey koyar: **parktaki parlak taş**.
- KİNO: "Taşımı da yıkayacağım!"
- Küvetin kenarında başka şeyler de var: sarı lastik ördek, süngeri, plastik top, sabun.
- KİNO: "Baba, taş yüzer mi?"
- BABA (gülümser): "Deneyelim mi?"
- ANLATICI: "Kino o akşam, küvette büyük bir deney yaptı."
- **Köprü:** Kamera küvetin kenarına yaklaşır. **Su yüzeyi kadrajın ortasından geçer:** üstte küvetin kenarı ve eşyalar, altta berrak suyun içi ve küvetin dibi.

### OYUN 5 · Batar mı, Yüzer mi? (~35-40 sn)

- **Hikâyedeki sebebi:** Kino parlak taşını yıkamak istiyor ve merak ediyor: taş yüzer mi? Küvetin kenarı oyuncak ve eşya dolu.
- **Çekirdek fikir:** Kenardaki eşyalar suya bırakılır ve **ne olacağı izlenir**: bazıları yüzer, bazıları yavaşça dibe iner. 5-6 yaşta önce **tahmin** edilir ("yüzer" tarafına mı, "batar" tarafına mı?), sonra hepsi birlikte suya atılır ve tahminler görülür. Sürpriz keyiftir; yanlış tahmin yoktur, *"Aa, şaşırttı!"* vardır.
- **Bu oyun hangi oyunumuza benziyor, farkı ne?** Mino'nun Pazarı'ndaki **Tart Bakalım**'a benziyor (fizikle bir kaba düşen nesneler). Fark: Orada sayar ya da tartarsın. Burada **sayı yok**; bir doğa olayını, **batmayı ve yüzmeyi**, izlersin ve 5-6 yaşta önce **tahmin** edersin. Tahmin edip sonucu görmek hiçbir oyunumuzda yok.
- **Kadraj:**
  - Yatay: Su çizgisi ekranın ortasında, hafif dalgalı. Üstte, küvetin kenarında 5 eşya yan yana; her biri ~84 px, aralarında 20 px:
    - **lastik ördek** (sarı, yüzer),
    - **sünger** (sarı-yeşil, yüzer),
    - **plastik top** (kırmızı-beyaz, yüzer),
    - **sabun** (pembe kalıp, batar),
    - **parlak çakıl taşı** (beyaz, batar).
  - Kino sağda, Lokum solda, sudan başları çıkık, eşyalara bakıyorlar. Su altı berrak açık turkuaz; dipte küvetin beyaz tabanı ve gider tıpası.
  - Dikey: eşyalar üstte iki sıra, su ortada, dip altta.
- **Etkileşim (3-4):** Bir eşyaya dokunulur ya da suya sürüklenir. Eşya suya düşer (`plop`) ve küçük bir sıçrama yapar (`sapir`).
  - **Yüzenler** (ördek, sünger, top) bir dalar, geri çıkar, yüzeyde sallanır.
  - **Batanlar** (sabun, taş) kabarcık bırakarak (`blub`) yavaşça dibe iner ve orada parlar.

  Anlatıcı her birine tek sözcük söyler: *"Yüzdü!"* ya da *"Battı!"*. Beş eşya da suya girince oyun biter.
- **Etkileşim (5-6):** Kenarın iki ucunda iki küçük **tahmin minderi** var:
  - sol: **"yüzer"**, üstünde suyun üstünde duran bir ördek resmi;
  - sağ: **"batar"**, üstünde dipte duran bir taş resmi.

  1. Çocuk her eşyayı bir mindere sürükler. Yazı yok, yalnız resim. Kino her eşyada kendi tahminini mırıldanır: *"Bence yüzer…"*. Çocuğu yönlendirmez; bazen yanılır, bu da komiktir.
  2. Beş eşya da yerleşince Lokum parmağıyla gösterir: "Daha!" Çocuk **Lokum'a dokunur**, ya da 3 sn sonra kendiliğinden: Lokum kollarını açıp her şeyi suya süpürür (onun yıkma huyu). Büyük bir sıçrama olur.
  3. Eşyalar aynı anda yüzer ya da batar. Tahmini tutanların minderinin resmi parlar. Tutmayanda Kino: *"Aa! Şaşırttı!"*. Baba güler. Ceza yok.
- **Lokum'un Kuzu şakası (iki yaşta da, süs):** Kenarda Kuzu da durur. Çocuk Kuzu'yu suya götürürse Kino havada yakalar: *"Kuzu olmaz! Islanır!"*. Lokum Kuzu'ya sarılır. Kuzu bir oyun eşyası değildir, yalnız bir kez yapılan bir şakadır.
- **Hedefler:** 5 eşya × 84 px. Minderler ~140×90 px. Lokum'un dokunma alanı ~140 px.
- **Başarı geri bildirimi:** Her düşüşte su halkaları, kabarcıklar ve batanın dipte parlaması. Sonda Kino taşını dipten alır, havaya kaldırır: *"Taş ağırmış!"*. Taş ışıkta parlar.
- **Tatlı yanlış:** 3-4'te yok. 5-6'da tutmayan tahmin için Kino'nun *"Aa! Şaşırttı!"* sözü ve Baba'nın kahkahası.
- **Yardım:** 18 sn'de Kino ördeği kendisi bırakır: *"Bak, yüzdü!"*. 30 sn'de Kino kalanları birer birer bırakır, her birini söyler.
- **Yaş:**
  - **3-4:** bırak ve izle.
  - **5-6:** önce iki mindere tahmin, sonra hep birlikte atma.

  İki yaşta da beş eşya.
- **Öğrettiği (resimle bilgi):**
  - **Batmak ve yüzmek.**
  - **Ağır-hafif:** dönüşte Kino söyler.
  - 5-6 yaş: **tahmin et, sonra bak.**
  - Banyo akşam düzenidir.
- **Kalıcı iz:** Parlak taş yatakta komodinin üstünde, gece lambasının ışığında parlar.
- **Cümleler:**
  - Oyun sesi: *"Suya bırakalım, bakalım."* · *"Yüzdü!"* · *"Battı!"* · 5-6: *"Önce tahmin edelim."* · yardım: *"Bir şey bırakalım."* · bitiriş: *"Kimi yüzdü, kimi battı!"*
  - Kino: *"Bence yüzer…"*, *"Bence batar…"*, *"Aa! Şaşırttı!"*, *"Kuzu olmaz! Islanır!"*, *"Bak, yüzdü!"*, *"Taş ağırmış!"*
  - Lokum: *"Daha!"*
- **Hikâyeye dönüş:**
  - Kamera küvetin kenarından geri açılır.
  - BABA: "Taş ağır, dibe iner. Ördek hafif, yüzer."
  - KİNO: "Ben de hafifim! Ben yüzerim!"
  - Kino köpükte sırtüstü yatar, kulakları suda iki yana yayılır (OP10). Lokum taklit eder. Su sıçrar, Baba'nın yüzü ıslanır. Herkes güler.
  - **Olur:** Baba ikisini kapüşonlu havlulara sarar. Kino'nun kulakları havlunun içinde kabarır, pofuduk. Baba ikisini birden kucaklayıp kaldırır (OP9).
  - ANLATICI: "Baba ikisini birden taşıdı. Babalar kocaman olur."
  - **Geçiş:** `film-gecis`, çocuk odası, gece.

## SAHNE 8 · Masal ve üç vuruş (8:10-9:10) · M1, gece lambası ışığı · *oyunsuz*

- **Işık:** Oda koyu mavi, ay biçimli gece lambasının sıcak sarı halkası. Müzik: `ninni-sozsuz` çok hafif.
- **Olur:**
  - Lokum karyolasında Kuzu'ya sarılmış uyuyor (P10). **Dizindeki bant görünür** (kalıcı iz).
  - Komodinin üstünde parlak taş parlıyor.
  - Kino yatakta yorganın altında. Kulakları hâlâ biraz pofuduk, yastığa yayılmış.
  - Anne yatağın kenarında (P9). Elinde resimli bir masal kitabı: *Küçük Kuzu*.
- ANNE (okur, yumuşak): "Küçük kuzu bütün gün oynadı…"
- KİNO (karyolaya bakar, fısıltı): "Lokum da bütün gün oynadı."
- ANNE: "Sen de. Bugün neler yaptın?"
- KİNO (parmaklarıyla sayar): "Diş fırçaladım. Kendim giyindim…"
- KİNO: "Lokum'a yüz yaptım. Bağcık bağladım!"
- Kino'nun sesi yavaşlar, kulakları iner.
- KİNO: "Lokum düştü. Ona bant yaptım."
- ANNE: "Babaanne anlattı. Kocaman bir abisin."
- KİNO (yorganın altında göğsünü gerer): "Ben büyüdüm artık!"
- …ve hemen ardından kocaman bir esneme. Kulakları yüzüne kapanır. Anne sesini çıkarmadan güler, kulakları yüzünden çeker.
- **Olur:** Yerden, boğuk: **"tık, tık, tık"** (`tik-tavan`).
- KİNO (gözleri açılır): "Dede!"
- ANLATICI: "Bu, Dede'nin iyi geceler deme yoluydu. Süpürge sapıyla, üç kez."
- Kino yataktan sarkar, eliyle yere üç kez vurur: "tık, tık, tık."
- ANNE (alnını öper): "İyi geceler, kocaman abi."
- KİNO (fısıltı, karyolaya): "İyi geceler, Lokum."
- LOKUM (uykusunda, gözleri kapalı): "Abi… bant…"
- Anne gece lambasını kısar (`cit-cit`). Kino'nun kuyruğu yorganın üstünde bir kez yavaşça sallanır, durur.
- ANLATICI: "Kino gözlerini kapadı. Kocaman bir gündü. Yarın da bir gün vardı."
- **Kapanış kartı:**
  - Krem zemin.
  - Ortada çocuğun bugünkü **beş an fotoğrafı** yumuşakça uçup bir ip üstüne mandalla dizilir: pırıl dişler, **onun kurduğu tabak yüzü**, **onun bağladığı fiyonk**, **onun seçtiği bant**, dipte parlayan taş.
  - Yazı yuvarlak ve kalındır. Kino'nun sesiyle bir kez okunur:
  - ***"Bugün kocaman bir gündü. Yarın yine!"***
- **Müzik:** `film-kapanis`.

## KAPANIŞ JENERİĞİ (9:10-9:25)

- Krem zemin. Kum saati döner, kum akar. Kumun içinden sırayla bölümün eşyaları çıkıp mandala asılır: diş fırçası, simit, bağcık, yara bandı, taş. Yazılar.
- Jenerikten sonra bölüm kartına dönülür; beş an fotoğrafı kartın altındadır (OYUNLU-FORMAT §6).

---

## Konuşma sayımı ve seslendirme (yaklaşık)

| Ses | Satır | Yaklaşık karakter |
|---|---|---|
| Anlatıcı: hikâye | 15 | ~650 |
| Anlatıcı: oyun sesi (çağrı, yardım, renk/ad sözleri) | ~38 | ~700 |
| Kino | ~50 | ~900 |
| Lokum | ~18 | ~70 |
| Anne | 8 | ~210 |
| Baba | 4 | ~110 |
| Babaanne | 7 | ~190 |
| Dede | 2 | ~50 |
| Mino | 2 | ~35 |
| **Toplam** | **~144** | **~2.900** |

- Anlatıcı (hikâye) cümleleri en çok 10-12 kelime. Oyun sesi en çok 5-6 kelime / 30 harf. Karakter cümleleri en çok 6-7 kelime.
- Sesleri Barış seçer. Anlatıcı yeni bir sestir, Mino'nun sesinden ayrıdır. Mino uygulamadaki sesini korur.
- Sayılar ("Bir!"…"Dört!", "Bir, iki!") Kino'nun sesiyle kaydedilir.

## Üretim kontrol listesi (animatik öncesi)

- [ ] Barış biçimi ([OYUNLU-FORMAT.md](OYUNLU-FORMAT.md)), beş oyunu ve kapanış kartını onayladı.
- [ ] Kit: Kino, Lokum, Anne, Baba, Mino (tam); Babaanne, Dede (önden). Kostüm ekleri: Kino pijama, Kino + Lokum banyo gövdesi (KARAKTER-KITI §8.1).
- [ ] Arka planlar: M3 banyo, M4 bahçe (yeni). M0, M1 Bölüm 1 ile ortak. M5, M6 yeniden kullanım, stil denetimiyle (KARAKTER-KITI §8.2).
- [ ] Eşyalar ve oyun eşyaları (KARAKTER-KITI §8.4). Pozlar OP1-OP11 (§8.3).
- [ ] Motor: oyun durağı, dokunma katmanı (iz sürme, hız ölçen okşama, soyma, ip, bırak-düş), yardım merdiveni, kalıcı iz, kesme-kukla oyuncusu (OYUNLU-FORMAT §10).
- [ ] Her oyun anı ayrı ayrı telefonda (844×390, 390×844) ve hiç dokunmadan sonuna kadar denendi.
- [ ] Yeni efektler (Web Audio).
- [ ] Animatik cihaz sesiyle; seslendirme Barış'ın onayından sonra.
