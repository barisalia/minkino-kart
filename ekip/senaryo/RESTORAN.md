# Tıkır Tıkır Lokanta · tam tasarım belgesi

> **Durum: TASLAK (2026-10-16, baş tasarımcı).** Barış görüp "tamam" demeden kod da görsel de üretilmez.
> **Ürün:** Minkino'nun yeni büyük oyunu. Bir restoran işletmesi; içinde ayrı ayrı cilalanmış mutfak mini oyunları var.
> **Hedef:** 3-6 yaş, önce telefon (844×390 yatay asıl ölçü, 390×844 dikey web). Uygulamada telefon yataya kilitlidir (`src/kabuk/yon.ts`).
> **Kapsam:** ~15-17 saatlik kodcu işi, 6 paket, aynı anda en çok 3 kodcu. Gemini çizimi ~6 gün (günde ~10 sayfa).

**Barış'ın sözleri (bu belgenin ölçüsü):**
- "Kino ile Mino'nun otobüsü var ya, bir tane de böyle farklı bir şey yap."
- "Örneğin salatalık doğrasın, domates doğrasın, soğan doğrar belki."
- "Restoran işletmesi olabilir, ayrı bir restoran işletmesi tarzı oyun yap, o daha güzel olur."
- "Daracık alanda yapıyorsun, karakterler dev gibi. Zoom out al, düzgün al."
- "Doğrayacak malzemeleri, ne gerekiyorsa yapacak. Hepsini mini mini HTML oyunlar gibi, her bir oyunu ayrı ayrı yaparsın."
- "İki saatlik proje gibi bakma, 15 saatlik proje. Biraz iyi düşün, baştan iyi kurgula."

---

## 0. Tek cümle

Babaanne mahalledeki küçük lokantasının anahtarını sana veriyor. Artık şef sensin. Bugünün menüsünü sen seçiyorsun. Malzemeyi kendi parmağınla yıkıyor, doğruyor, soyuyor, kızartıyor, tabağa diziyorsun. Her müşterinin damak zevki başka; ne sevdiğini deneyerek buluyorsun. Kazandığınla lokantanı büyütüyorsun: yeni tarif ve alet, yeni masa, süs, sonunda bahçe.

**Çocuk ne hisseder?** "Gerçek mutfakta gerçek iş yapıyorum, herkes benim yemeğime tepki veriyor, lokanta benim."

---

## 1. Araştırma: piyasa ne yapıyor, biz ne alıyoruz

### 1a. Oyun oyun

| Oyun | Güçlü yanı | Zayıf yanı | Bizde |
|---|---|---|---|
| **Toca Kitchen 1-2** | Tam özgürlük: her malzeme her araçtan geçer ("domatesi sık, salatayı haşla"). Misafirin damak zevki var, çocuk deneyerek keşfeder. Puan ve saat yok. | Araç çıkar, ekran değiştir zinciri küçüklere karışık geliyor. Amaç yok, oyun sonsuz. | **Aldık:** her şey yedirilebilir, her birleşimin tepkisi var. Zevk keşfi oyunun kalbi. **Almadık:** amaçsızlık. Bizde sipariş ve büyüme var. |
| **Toca Kitchen Sushi** | Doğra, sotele, rulo yap, sonra tabağa serbest diz. Kulaktan duman gibi abartılı tepkiler. | Balık kesilince iç organ görünüyor. Yerleştirme başta zor. | **Aldık:** serbest tabak dizme, kulaktan duman. **Almadık:** et kesme, iç organ. Bizde kesilen şey sebze ve meyve. |
| **Dr. Panda Restaurant 2 / Asia** | Müşteri resimle sipariş verir. Malzeme ve pişirme serbest. Araç kullanılacağı zaman hafifçe sallanır (yazılı talimat yok). Çırpılan yumurta omlete döner. | En küçükler takılıyor. Asia'da jeton hiçbir şey açmıyor (eleştirildi). Çapraz reklam var. | **Aldık:** resimli sipariş, aracın kendisinin ipucu olması (geç gelir), yemeğin gözle görünür değişimi. **Almadık:** işe yaramayan para. Bizde para lokantayı büyütür. |
| **Sago Mini (Pizza Shop, World)** | Karakter tepkileri sıradan işi eğlenceli yapıyor. Söz ve yazı yok. Abonelik, reklamsız, internetsiz. | İçerik ince. | **Aldık:** sevimli, abartılı karakter tepkisi; yazısız arayüz; abonelik modeli (zaten bizde). |
| **My Town Restaurant / Bakery, Yasa Pets Town** | Oyuncak ev hissi, çok mekân, birden çok parmakla oynama. | Tanıtım dili bile "müşteri geliyor, acele et". Yükleme takılmaları, reklam. | **Almadık:** acele baskısı, dağınık çok mekân. Bizde tek lokanta, adım adım büyür. |
| **Papa's (Pizzeria, Burgeria…)** | İstasyon istasyon ilerleyen yemek. Resimli fiş. Fırında renk değişimi. Müşteri koleksiyonu. Kazanç dekora gider. | Bekleme cezası, adet ve çeyrek hassasiyeti, istasyon başına yüzdelik not, aynı anda çok fiş. 3-6 yaşa ağır. | **Aldık (sadeleştirerek):** resimli adisyon kartı, istasyon istasyon ilerleyen yemek, renkle pişme, kazancın dekora gitmesi. **Almadık:** süre, ceza, yüzde, rütbe. |
| **Cooking Mama** | Her yemek kısa mini aşamalardan oluşuyor, her aşamada başka bir hareket var: kes, soy, karıştır, çevir. | Hata yapınca gözlerinden alev çıkan kızgın Mama. Aynı soyma ve doğrama tarif tarif tekrar ediyor, sıkıcı. Bronz-gümüş-altın madalya. | **Aldık:** yemek = 2-4 kısa mini oyun, her biri ayrı hareket. **Almadık:** kızgın yüz, madalya, aynı hareketin aynen tekrarı. Bizde her sebze başka türlü kesilir (§3), her tarif başka bir istasyon karışımı. |

Kaynaklar: [Toca Kitchen 2 (Common Sense)](https://www.commonsensemedia.org/app-reviews/toca-kitchen-2) · [Toca Kitchen Sushi](https://www.commonsensemedia.org/app-reviews/toca-kitchen-sushi) · [Dr. Panda Restaurant 2](https://www.commonsensemedia.org/app-reviews/dr-pandas-restaurant-2) · [Dr. Panda Asia (ACCM)](https://childrenandmedia.org.au/app-reviews/apps/dr.-panda-restaurant-asia) · [Sago Mini Friends (Horn Book)](https://www.hbook.com/story/sago-mini-friends-app-review) · [Papa's Pizzeria SSS](https://i.flipline.com/games/papaspizzeria/faq.html) · [Cooking Mama (Nintendo Life)](https://www.nintendolife.com/games/ds/cooking_mama/review) · [Cooking Mama (Pocket Gamer)](https://www.pocketgamer.com/cooking-mama/review/) · [Fruit Ninja (Pocket Gamer)](https://www.pocketgamer.com/fruit-ninja/review/) · [Android dokunsal ilkeleri](https://developer.android.com/develop/ui/views/haptics/haptics-principles)

### 1b. Çaldığımız 10 iyi uygulama
1. **Sipariş bir öneridir, kilit değil.** Müşteri resimle bir şey ister, ama her şey verilebilir ve her birleşimin bir tepkisi var.
2. **Her karakterin damak zevki bir kişiliktir.** Tavşan havuç sever, Dede soğana bayılır, Lokum soğanda ağlar. Keşif oyunun kendisi.
3. **Okumasız resimli adisyon.** 3-4 yaşta en fazla 3 resim. Adet ve yer şartı yok.
4. **Yemek gözle değişir.** Dilim düşer, kesit görünür, kızarır, buhar tüter, köpürür. Bu "fizik ödülü" puandan tatmin edici.
5. **Yemek = 2-4 kısa mini oyun.** Her biri 10-30 saniye, her birinde başka bir hareket.
6. **Talimat yerine araç ipucu verir,** ama geç (§4c merdiveni).
7. **"Oyun bitti" yok.** Her şey yenir, her şey ödenir.
8. **Abartılı ama kısa tepkiler.** 1-2 saniye, sesli, bütün beden.
9. **Para somut bir şey açar.** Tarif, alet, masa, süs, bahçe.
10. **Reklamsız, internetsiz, abonelik.** Zaten bizim modelimiz.

### 1c. 3-6 yaş için yapmayacağımız 8 şey
1. Süre, bekleme cezası, sabırsızlanıp giden müşteri.
2. Puan, yıldız notu, yüzde, madalya.
3. Aynı anda yönetilmesi gereken fiş yığını. Bizde en çok masa sayısı kadar sipariş var, hiçbiri beklemekten bozulmaz.
4. Araç menüleri, alt menüler, uzun ekran zinciri. Bizde lokanta tek ekran; istasyona bir dokunuşla girilir, tepsiyle çıkılır.
5. Kızgın, korkutan başarısızlık. Yanık siyah kömür, kan, parmak kesme şakası.
6. Aynı hareketin aynen tekrarı.
7. Hassas algılama, dar dokunma alanı. Her hareketin toleransı geniş.
8. Yazı ve sayı okumayı gerektiren arayüz.

### 1d. Dokunuş hissi (bütün mini oyunlar için ortak kural)
- **Gecikme sıfır.** Parmak değince ses ve görüntü aynı karede başlar.
- **Her hareketin üç karşılığı var:** görüntü (parça, damla, köpük), ses (malzemeye özel: salatalık "kırt", domates "şlap", soğan "çıtır"), titreşim (Capacitor'da 10-20 ms tık; ayarlardan kapanır; webde yok).
- **Parçalar sahnede kalır.** Kesilen dilim kaybolmaz, tahtada durur; çocuk ne yaptığını görür.
- **Seri hareket ödüllüdür.** Arka arkaya hızlı kesimde ses tonu hafifçe yükselir (Fruit Ninja hissi). Tek kaydırmada birden çok şey kesilebilir.
- **Araç parmağın biraz üstünde durur,** parmak aracı örtmez.
- **Dokunma alanı görselden büyük:** en az 64 css px.

---

## 2. Bu hangi oyuna benziyor, farkı ne?

| Bizim oyun | Çekirdeği | Lokanta neden farklı |
|---|---|---|
| **Kino'nun Otobüsü** (V3) | Tek tezgâh, müşteri pencerede. Kaplardan **seç ve üst üste koy** (kule). | Lokantada yemek **kaplardan seçilip toplanmaz, ham malzemeden yapılır.** Oyunun zevki dönüştürmenin kendisinde: kes, soy, kızart, çevir. Müşteri pencerede değil, **masaya oturur, yer, zaman geçirir.** Mekân tek tezgâh değil, büyüyen bir lokanta. |
| **Pasta Otobüsü** | Hamur, kalıp, fırın, krema deseni, serpinti sallama. | Krema deseni çizme ve serpinti sallama burada **yok**. Fırın burada bir taş fırın ve kürekle itme; hamur merdaneyle açılır. Tatlı tarafı (pankek) tavada çevirmeyle yapılır. |
| **Pazar** | Say, tart ve ver; blenderde meyve suyu. | Blender ve tartı **yok**. İçecekler çalkalayarak (ayran) ve sıkarak (limonata) yapılır. |
| **Pati Dükkânı** | Al, bak, mutluluk, para, yeni hayvan. | Ekonomi aynı ailede (Barış böyle istedi: para işe yarasın). Fark şurada: Pati'de hayvanın ihtiyacı okunur. Lokantada **çocuk bir şey üretir** ve başkası onun ürününe tepki verir. |
| **Kino/Mino Ne Giysin** | Giydir. | İlgisi yok. |

**Otobüs'ten bilerek aldığımız tek şey bir ilke:** istek türleri (resimli, ipuçlu, sürpriz) ve "herkesin zevki farklı". Bu bütün Minkino oyunlarının ortak kuralı. Döngü değil.

**Tek cümleyle fark:** Otobüs'te çocuk bir **seçici**, lokantada çocuk bir **aşçı**. Lokantanın %70'i ellerle yapılan mutfak işi, %30'u işletme.

---

## 3. Çekirdek döngü

```
  SABAH: tabelayı çevir (Açık) ─► MENÜ TAHTASI: bugün hangi yemekler? (çocuk seçer)
                                          │
        ┌─────────────────────────────────┘
        ▼
  MÜŞTERİ GELİR ─► masaya oturur ─► isteğini söyler (resim / ipucu / sürpriz)
        │                                   │
        │                     adisyon kartı mutfak ipine asılır
        │                                   ▼
        │      MUTFAK: istasyonlara gir, mini oyunlar (yıka, doğra, soy, kızart, çevir...)
        │      ürünler TEPSİYE dolar ─► TABAKLA ─► Kino servis eder (ya da çocuk tabağı masaya sürükler)
        │                                   ▼
        │              YER ─► TEPKİ (bayıldı / mmm / komik) ─► hesap tabağına jeton
        ▼                                   │
  GÜN SONU: kasa ─► BABAANNE'NİN DEFTERİ: yeni tarif+alet, masa, süs, bahçe (al ya da biriktir)
        │
        └─► ertesi gün lokanta biraz daha büyük, menüde yeni bir yemek
```

### 3a. Bir günün akışı (3-4 yaş ~8 dk, 5-6 yaş ~11 dk)

1. **Açılış (≤ 8 sn).** Lokantanın önü, sabah. Kapıda "Kapalı" levhası (resimli: uyuyan ay). Çocuk levhaya dokunur, levha döner (gülen güneş), zil çalar, Kino önlüğünü bağlayıp içeri koşar. İlk günde Babaanne kapıda anahtarı uzatır (§5, ~20 sn, bir kez).
2. **Menü tahtası (≤ 15 sn).** Kara tahtada boş yuvalar var: 3-4 yaşta 2, 5-6 yaşta 3. Açılmış tarif kartları altta sıralanır. Çocuk istediğini yuvaya sürükler ya da dokunur. Mino her kartın adını söyler. Gün 1'de yalnız 2 tarif var ve kendiliğinden yerleşir (kısa bir gösteri). Gün 2'den sonra her gün gerçek bir seçim var. **Müşteriler yalnız menüdeki yemeklerden ister**, yani bugün hangi mini oyunların oynanacağını çocuk seçer.
3. **Müşteri gelir.** Kapı zili. Müşteri yürüyerek (hoplayarak) girer. Çocuk onu **istediği boş masaya** sürükler ya da müşteri kendisi en yakın boş masaya oturur (3 sn dokunulmazsa). Masada oturunca isteğini söyler (§4a).
4. **Adisyon.** Kino not defterini çıkarır, karalar, adisyon kartı (isteğin resmi) uçup mutfağın ipine mandalla asılır. Adisyon kartı masanın rengindedir (kırmızı masa = kırmızı mandal), çocuk hangi masanın olduğunu renkten tanır.
5. **Mutfak.** Lokanta tek ekrandır: önde masalar, arkada açık mutfak (§7). Çocuk istasyonlardan birine dokunur, istasyon ekranı açılır (geçiş perdesiyle, büyütme değil; istasyonun kendi tam çözünürlüklü çizimi var).
   - Hangi istasyonda ne yapacağı çocuğun seçimidir. Adisyon kartının altında tarifin küçük resimli **yol haritası** (ör. salata: musluk, bıçak, tabak) var. Bu bir hatırlatma; uymak zorunlu değil.
   - Her istasyonun bir çıktısı var ve **tepsiye** gider (ör. doğranmış domates kâsesi). Tepsi ekranın altında hep görünür.
   - **Paralel iş:** Tava, kazan, fırın ve fritöz ocağa konunca kendi kendine pişer. Çocuk o sırada başka istasyona geçer. Pişen şeyin sesi (cız, fokur) mutfaktan duyulur; bu dolaylı bir işarettir. Hiçbir şey yanıp kömür olmaz: "altın"dan sonra "çıtır" olur ve orada durur (§3c).
6. **Tabakla.** Servis penceresinde tepsideki her şey tabağa dizilir (§4 M14). Servis zili.
7. **Servis.** İki yol var, çocuk seçer:
   - Tabağı servis penceresindeki Kino'ya ver. Kino tepsiyle hoplayarak masaya taşır (komik anlar §9).
   - Tabağı doğrudan bir masaya sürükle. Yanlış masaya verirsen o müşteri **kendi zevkine göre** yer (ceza yok, komik), asıl sahibi beklemeye devam eder ve adisyonu ipte kalır.
8. **Yeme ve tepki (4-6 sn).** Müşteri yer (yeme pozu, çiğneme sesi, tabak üç adımda boşalır). Sonra tepki (§4b). Gag oynar, gülümseyerek biter.
9. **Hesap (≤ 4 sn).** Müşteri hesap tabağına jeton bırakır ve el sallayıp gider. Çocuk hesap tabağına dokundukça jetonlar kasaya uçar, Mino sayar ("Bir! İki!"). Dokunulmazsa jetonlar masada bekler; gün sonunda kendiliğinden kasaya kayar. Bu sırada çocuk başka işe geçebilir.
10. **Boş masa.** Kirli tabak masada kalır. Yeni müşteri gelince Kino onu kendisi toplar (komik: tabakları kule gibi dengeler). Çocuk isterse kirli tabağı lavaboya sürükler ve Bulaşık mini oyununu oynar (§4 M15, ödülü bir bahşiş). Zorunlu değil.
11. **Gün sonu.** Son müşteri gidince tabela "Kapalı"ya döner. Kasa açılır, jetonlar şıngırdar. **Babaanne'nin Defteri** açılır (§6). Çocuk bir şey alır ya da biriktirir. Ertesi günün kısa ön izlemesi: aldığı şey yerine oturur, Kino dener.
12. **(5-6 yaşta, isteğe bağlı) Personel yemeği.** Kino, Mino ve Lokum masaya oturur. Adisyon yok: çocuk açık olan bütün istasyonlarla **istediği her şeyi** yapar (Toca özgürlüğü). Üçü kendi zevkine göre tepki verir. Bu, haftalık değil günlük bir "serbest mutfak" anı. Ana menüden "Serbest Mutfak" düğmesiyle de açılır (Faz 3).

### 3b. Gün başına müşteri
| | 3-4 yaş | 5-6 yaş |
|---|---|---|
| Müşteri sayısı | masa × 2, en çok 6 (Gün 1: 4) | masa × 2, en çok 8 (Gün 1: 5) |
| Aynı anda masada | en çok 2 | masa sayısı kadar (2-6) |
| Yeni müşteri ne zaman gelir | bir masa boşalınca, en erken 6 sn sonra | bir masa boşalınca ya da 25 sn'de bir, boş masa varsa |

Müşteri asla gitmez, asla somurtmaz. Beklerken kendi hâlini yapar: Baba uyuklar, Lokum peçeteyle oynar, Dede gazete okur, Tombi çatalla masaya ritim tutar. 40 sn beklerse bir kez mutfağa doğru koklar (dolaylı ipucu). Hepsi bu.

### 3c. Hiçbir şey kötüleşmez (değişmez kural)
- Yemek yanmaz. Pişme sırası: **çiğ, az, altın, çıtır.** Çıtır son durak, kömür yok. Çıtırı seven müşteri bile var (Baba: "Kıtır kıtır!").
- Malzeme bitmez. Dolap hep dolu.
- Müşteri gitmez. Jeton erimez. Kira yok.
- Yanlış verilen yemek de yenir, de ödenir.

---

## 4. Seçenek, tepki, ipucu (Barış'ın temel kuralı)

### 4a. İstek türleri
Müşteri masaya oturunca isteğini söyler. Sesi olan kendi sesiyle (eleven_v4), sesi olmayan için Mino durumu anlatır (emir vermez). Balonun içinde resim var.

| Tür | Balonda | Ne kabul edilir | Örnek |
|---|---|---|---|
| **Resimli** | Menüdeki bir yemeğin resmi | O yemek. İçine ne konduğu zevke göre tepki değiştirir. | Anne: menemen resmi. "[happy] Menemen olsun!" |
| **İpuçlu** | Tek ipucu resmi: güneş ve ter (serin bir şey), kocaman ağız (doyurucu), kırmızı damla (domatesli), kıtır çizgileri (çıtır), arı (tatlı/ballı), havuç (sebzeli) | O özelliğe uyan her yemek. Birden çok doğru var, çocuk seçer. | Tombi: kocaman ağız. "[sighs] Ben çok acıktım…" Menemen de olur, pide de, köfte de. |
| **Sürpriz** | Şef şapkası ve soru işareti | Her şey doğru. Müşterinin gizli sevdiği varsa bayılır. | Bulut: "[softly] Şef… ne yaparsa." |
| **Özel (yalnız 5-6, günde en çok 1)** | Resim + küçük sayı noktaları ya da şekil | Sayma ya da şekil isteği: "3 dilim salatalık", "küp küp", "yuvarlak dilim", "iki yumurtalı" | Dişçi: salata + 3 nokta + salatalık dilimi resmi |

Günün karışımı (müşteri havuzdan, istek şablondan, Otobüs'teki gibi tohumla):
- 3-4: %50 resimli, %30 ipuçlu, %20 sürpriz.
- 5-6: %30 resimli, %35 ipuçlu, %20 sürpriz, %15 özel.
- Yeni alınan tarif ertesi gün mutlaka bir müşteri tarafından istenir: "[excited] Yeni yemeği duydum!"

### 4b. Zevk ve tepki (ceza yok, komik var)

Her yemek mini oyunlardan bir **özellik seti** taşır: içindeki malzemeler, kesim (iri, ince, püre), pişme (çiğ, az, altın, çıtır), tuz (az, iyi, çok), acı (pul biber), ekşi (limon), tatlı (bal, şeker), sunum (yüz yapıldı mı, süs sayısı), sıcak ya da soğuk, porsiyon (az, normal, kocaman). Her müşterinin bir **sever**, bir de çoğunun **sevmez** listesi var (§5c).

| Ne verildi | Tepki (poz değişimi + bütün beden) | Jeton |
|---|---|---|
| İstek tuttu **ve** sevdiği bir şey var (sürprizde sevdiği yeter) | **Bayıldı:** gözler kapalı, eller yanaklarda, kalpler çıkar, sandalyede hoplar. Sesi varsa imza sözü. | taban + 1 bahşiş (altın kaşık jeton) |
| İstek tuttu, sevdiği yok | **Mmm:** mutlu çiğneme, bir hop. | taban |
| İstek tutmadı ya da sevmediği var | **Komik:** önce şaşkın yüz (0,5 sn), sonra müşteriye özel gag (ör. acıda kulaklardan duman, soğanda Lokum'un gözleri yaşarır, tuzluda su bardağını bir dikişte içer, ekşide yüz büzülür). Sonra güler: "[laughs] Farklıymış ama güzel!" Tabağı yine bitirir. | taban |

- **Taban:** 3-4 yaşta 2, 5-6 yaşta 3. Bahşişle en çok 3 / 4. Jeton sayısı kısa kalır (Barış: "sayma uzun sürüyor").
- **Ders tek:** "Herkesin zevki farklı." Çocuk ikinci gelişte müşteriyi tanır. Zevkler oturumlar arasında değişmez.
- **Keşif ödülü:** Bir müşterinin sevdiğini ilk kez bulunca o müşterinin fotoğrafı (polaroid) mutfak panosuna asılır ve üstüne o malzemenin minik çıkartması yapışır. Pano 5-6 yaşta bir koleksiyon olur. Ek sistem değil, duvarda bir resim.

### 4c. İpucu merdiveni (her istasyonda ve salonda aynı)
Son dokunuştan itibaren sayılır.

| Süre | Ne olur |
|---|---|
| 0-12 sn | hiçbir şey |
| 12 sn | **Dolaylı:** istasyonda sıradaki işi bekleyen malzeme ya da araç kendi kendine hafifçe kıpırdar (domates tahtada yuvarlanır, bıçak tıkırdar). Salonda müşteri mutfağa doğru koklar. |
| 20 sn | **Mino durumu anlatır**, emir vermez: "[curious] Domates hâlâ bütün…", "[giggles] Tava cızırdıyor!" |
| 30 sn | Doğru araç ya da malzeme bir kez yumuşakça parlar. |
| 40 sn | Hareketi gösteren yarı saydam minik el bir kez oynar (ör. kaydırma çizgisi). |
| asla | "Şuna dokun", "Bıçağı al", ok, sürekli parlayan hedef |

- 3-4 yaşta merdiven aynı; ilk 2 müşteride 30 sn basamağı 20 sn'ye iner (yalnız ilk oyunda).
- **Anlatıcı yasak sözleri** (birim testiyle denetlenir): "dokun", "tıkla", "bas", "sürükle", "şimdi şunu".

### 4d. Her adımda en az 3 anlamlı seçenek

| Adım | Seçenekler |
|---|---|
| Menü | açılmış tarifler arasından 2-3 tanesi |
| Masa | boş masalar (2-6) |
| İstasyon sırası | adisyondaki yol haritası bir öneri; istasyonlar serbest |
| Malzeme | her istasyonun yan rafında 3-8 malzeme (ör. salatada domates, salatalık, soğan, biber, maydanoz, marul, havuç) |
| Nasıl | kesim iri ya da ince, çok ya da az kızart, tuz az ya da çok, limon var ya da yok |
| Sunum | tabağa serbest diziş, süs 0-6 parça, yüz yapma |
| Servis | Kino'ya ver ya da istediğin masaya sürükle |
| Gün sonu | en az 3 farklı türden şey ya da biriktir |

---

## 5. Karakterler, roller, ad ve tema

### 5a. Lokantanın adı (öneri sırasıyla)

| Ad | Neden | Neden değil |
|---|---|---|
| **1. Tıkır Tıkır Lokanta** (önerilen) | Oyunun imza hareketi doğramanın sesi. Çocuk ağzına kolay, menüde akılda kalır. Karakter adına bağlı değil, bütün aile müşteri olarak sığar. Türkçe ve sıcak. | Bir karakter adı taşımıyor. |
| 2. Babaanne'nin Lokantası | Sıcak, aile ve gelenek hissi. Babaanne'nin hikâyedeki yeri net. | Lokanta çocuğun olmalı. Ad "başkasının yeri" diyor. |
| 3. Mino ile Kino'nun Lokantası | Marka tutarlılığı, Otobüs ve Pasta'nın yanında aynı aile. | Menüde üçüncü kez "Mino ile Kino'nun…" karışıklık yaratır. Barış "farklı bir şey" istedi. |

**Menü kartı:** "Tıkır Tıkır Lokanta"; kart resminde lokantanın önü, Babaanne kapıda, Kino önlüklü, camdan masalar.

### 5b. Tema (öneri sırasıyla)

| Seçenek | Ne | Neden |
|---|---|---|
| **A. Türk ev yemekleri + çocukların sevdikleri** (önerilen) | Çoban salatası, menemen, mercimek çorbası, köfte, pide, ayran, sütlaç; yanında çocuk favorileri: patates kızartması, pankek, meyve şiş, limonata | Barış'ın saydığı malzemeler (salatalık, domates, soğan) tam çoban salatası. Piyasada Türk mutfağıyla oynanan özenli bir çocuk oyunu yok. Anne-babaya değer: gerçek ve sağlıklı yemek, gerçek mutfak sırası. Babaanne'nin "kuzum" sıcaklığı oturuyor. Patates, pankek ve pide (pizzanın bizdeki karşılığı) çocuk çekiciliğini sağlıyor. |
| B. Dünya mutfağı | Pizza, burger, suşi, makarna | Evrensel ama sıradan. Toca ve Dr. Panda zaten yapmış. Bizi ayırmıyor. |
| C. Yalnız tatlı ve atıştırmalık | Pankek, dondurma, meyve | Pasta ve Otobüs'le çakışır. Doğrama sebzesi kalmaz. |

### 5c. Kadro ve roller

**Mutfak ekibi**
| Kim | Rol | Ne yapar | Ses |
|---|---|---|---|
| **Çocuk** | Şef | Bütün mini oyunlar, menü, masa, servis, defter | yok |
| **Babaanne (Nazlı)** | Lokantanın eski sahibi, tarif ustası | Gün 1'de anahtarı verir. Her yeni tarifte kapıdan girip bir kez tadına bakar ("[happy] Maşallah kuzum!"). Defterin sahibi. Ara sıra müşteri olarak da gelir. | seri 2 `babaanne` (kayıt yok, yeni) |
| **Kino** | Garson | Müşteriyi karşılar, adisyon yazar, servis eder, kirli tabak toplar. Komik anlar: tepsiyle sallanır ama düşürmez, servis yolunda bir patates çalar. | seri 2 `kino` (11 hazır söz + yeni) |
| **Mino** | Mutfak yardımcısı ve anlatıcı | İstasyonların sol alt köşesinde küçük durur. Durumu anlatır, sayar, tadına bakar, soğanda ağlar. | ana anlatıcı sesi (Mino = uygulama sesi) |
| **Lokum** | Ortalığı karıştıran küçük kardeş | Gizli sürprizlerin çoğu onun: salatalık dilimi çalar, köpükle oynar, bazen müşteri olur. | seri 2 `lokum` (5 hazır söz) |

**Müşteriler (Gün 1'de 8, bütün açılınca 20+).** Boylar `src/karakter/boy.ts` `BOY` (Mino = 1). Lokanta ölçeği §7b.

| # | Müşteri | Kaynak | Sever (bayıldı) | Sevmez (komik gag) | Ses ve imza | Ne zaman |
|---|---|---|---|---|---|---|
| 1 | **Lokum** | yeni lokanta sayfası | muz, bal, yüzlü tabak | **soğan**: gözleri şelale gibi yaşarır, burnunu çeker, sonra kıkırdar | `lokum` "[giggles] Abiii, acıktım!" | Gün 1 |
| 2 | **Anne** | yeni | limon, maydanoz, düzgün tabak | çok tuz: su bardağını bir dikişte içer, "[laughs] Ay, tuzlu!" | `anne` | Gün 1 |
| 3 | **Baba** | yeni | kocaman porsiyon, çıtır, köfte | az porsiyon: boş tabağa bakar, çatalı sallar, "Bu kadar mı?" | `baba` "[laughs] Kocamanından!" | Gün 1 |
| 4 | **Dede** | yeni | **soğan**, maydanoz, ayran | tatlı süs (bal, yüz): kaşları çatılır, sonra gizlice bir daha alır, bıyığı bal olur | `dede` "[chuckles] Eski usul olsun." | Gün 1 |
| 5 | **Babaanne** | yeni | çorba, az tuz | pul biber: hapşırır, gözlüğü burnuna kayar | `babaanne` "[softly] Ellerine sağlık kuzum." | Gün 2 |
| 6 | **Tombi** (ayı yavrusu) | yeni (G-OT1 resmi var) | kocaman, bal, pankek | az porsiyon: tabağı yalar, boş tabağı kafasına şapka yapar | `tombi` "[sighs] Ben çok acıktım…" | Gün 1 |
| 7 | **Zıpzıp** (tavşan) | yeni | **havuç**, salatalık | soğan: kulakları düğüm olur | `zipzip` "[excited] Ben önce!" | Gün 1 |
| 8 | **Bulut** (kuzu) | yeni | beyaz şeyler: ayran, sütlaç, yoğurt | yok (her şeyi sever, utangaç) | `bulut` "[softly] Şef… ne yaparsa." | Gün 1 |
| 9 | **Bıdık** (keçi) | yeni (resmi var) | marul, her şey | yok. Gizli şaka: yemekten sonra peçeteyi ve menü kartını da yer, "Hıp! Pardon!" | `bidik` | Gün 1 |
| 10 | **Bıdıcık** | yeni | Bıdık ne yediyse aynısı | farklısı: dudak büker, Bıdık'ın tabağına uzanır | `bidicik` | Bıdık'la birlikte |
| 11 | **Bıdık'ın babası** | yeni (resmi var) | ayran, peynir | acı: sakalı diken diken olur | `bidik-baba` | Gün 2 |
| 12 | **Nehir abla + Pati hayvanı** | yeni sayfa + Pati'nin hazır poz kareleri | Nehir: limonata. Yanındaki hayvan (Fındık, Tarçın ya da Pofuduk) yerde kendi kabından: Fındık sade köfte, Pofuduk havuç ve salatalık | **köpeğe soğan:** Nehir nazikçe kabı çeker, "[softly] Köpeklere soğan olmaz!" Fındık kuyruk sallar. Gerçek bilgi, ceza değil. | `nehir`; hayvanlar Pati'nin Web Audio sesleri | Gün 3 |
| 13 | **Dişçi** (yeni karakter) | yeni çizim | havuç, elma, salatalık, ayran | bal, şeker: kaşığa bakıp dişlerini kontrol eder, sonra gülüp yine yer | `disci` "[happy] Şekersiz lütfen!" | Gün 3 |
| 14 | **Tuhaf Teyze** (yeni) | yeni çizim | **tuhaf birleşimler:** muzlu menemen, ballı salata. Toca özgürlüğünü ödüllendiren müşteri. | "normal" yemek: omuz silker, "Hıı, sıradan." Yine de bayılmadan yer. | `tuhaf-teyze` | Gün 4 |
| 15 | **Palyaço Tavşan** (yeni) | yeni çizim | yüzlü tabak (tabakta yemekle yüz yapılmışsa) | yüzsüz tabak: tabağa kendi burnunu koyup yüz yapar | `palyaco-tavsan` | Gün 4 |
| 16 | **Kelime Yutan Tavşan** (yeni) | yeni çizim | ne isterse | — | `kelime-yutan-tavsan`. İsteğini kelimeleri yutarak söyler: "Me… me…men… lütf…" Doğal bir ipuçlu istek: çocuk tahmin eder. | Gün 5 |
| 17 | **Ada, Can, Elif, Deniz, Zeynep** | Gemini netlik kuyruğundaki 8 pozlu sayfalar gelince (NETLIK #2), lokanta oturuş kareleri ayrıca | patates, pankek, limonata | kişiye göre (§ tablo kodda) | ana ses + ton, balon | Faz 3 |

**Kurallar:** Bir günde aynı müşteri iki kez gelmez. Son iki günde gelmeyen önce gelir. Bıdıcık hep Bıdık'la gelir (aynı masa). Aile günde en çok 3 kişi.

**Yeni karakterler (Dişçi, Tuhaf Teyze, Palyaço Tavşan, Kelime Yutan Tavşan):** Barış'ın ElevenLabs'te sesleri zaten var (`content/film2/sesler.json`), çizimleri yok. Dördü tek bir Gemini kadro sayfasında çizilir (§8, R-GÜN 4). Tasarımları Otobüs'ün G-OT1 kadrosuyla aynı dünyadan.

### 5d. Çocuk görünür mü?
Hayır. Şef çocuğun kendisi. Mutfakta el çizilmez; araç parmağı izler (Toca, Cooking Mama gibi). Bu hem "ben yapıyorum" hissini güçlendirir hem de çizim yükünü azaltır.

---

## 6. Ekonomi, açılma sırası, kayıt

### 6a. Para
- **Altın kaşık jeton.** Üstünde kabartma bir kaşık olan altın jeton. Bahşiş jetonu aynı, kenarı turuncu.
- **Kazanç:** müşteri başına taban 2 (3-4) / 3 (5-6), bayıldıysa +1. Gün 1'de yaklaşık 9-10 (3-4) ve 15-17 (5-6) jeton.
- **Kasa:** servis penceresinin yanında eski usul, pirinç bir yazar kasa. Jeton girince "çın!" der, çekmecesi bir kez açılıp kapanır. İçindeki jeton yığını görünür (rakam yok).
- **Sayma kısa:** sayma yalnız hesap tabağında (en çok 3-4 jeton). Satın alırken sayma yok: jetonlar kasadan karta şelale gibi akar, sayılmaz.

### 6b. Babaanne'nin Defteri (gün sonu mağazası)
Kalın, kumaş kaplı bir tarif defteri. Sayfalarında büyük resimli kartlar. Kartta yazı yok; fiyat, altında **jeton resimleri** olarak durur (3-4 yaşta en çok 8 jeton resmi; 5-6 yaşta 5'lik büyük jetonla).

| Sekme | Ne açar | Oyunda nerede görünür |
|---|---|---|
| **Tarif** (alet ile gelir) | yeni yemek + yeni istasyon ya da alet = **yeni mini oyun** | Alet mutfaktaki boş yuvasına uçar, Kino dener; tarif kartı menü tahtasının altına eklenir. |
| **Masa** | 3., 4. masa, çocuk masası (alçak, minik sandalyeli), bahçe masaları | Çocuk boş yuvalardan **hangisine** koyacağını seçer (pencere kenarı, akvaryum yanı...). Masa = daha çok müşteri = daha çok kazanç. |
| **Süs** | masa örtüleri (kareli kırmızı, mavi çiçekli, sarı puantiyeli), perde, saksılar, duvar resmi, avize, akvaryum, gramofon, tabela rengi | Duvar ve masa yuvalarına sürüklenir. Bazıları dokununca canlanır (§9). |
| **Bölüm** | **Bahçe (teras)**: 2 masa + mangal yuvası, asma ve fener. Büyük hedef, biriktirerek alınır. | Lokanta ekranı sağa doğru açılır, kamera kayarak bahçeye geçer (kaydırma, büyütme değil). |

**Fiyatlar** (pati'deki gibi her değer `[3-4, 5-6]` çifti):
| Şey | Fiyat |
|---|---|
| süs (örtü, saksı, resim) | [3, 5] |
| masa | [5, 8] |
| tarif ve alet (ayran, patates, çorba, pankek, şiş, limonata, sütlaç) | [6, 10] |
| büyük alet (pide fırını, mangal) | [10, 16] |
| bahçe | [14, 24] |

- **Her gün en az bir şey alınabilir.** Defter, kasadaki parayla alınabilecek en az bir süs ve bir tarif gösterir. Biriktirmek de bir seçim: "Kumbaraya at, yarına sakla."
- Kasa boş kalmaz: alınabilecek hiçbir şey yoksa Babaanne bir avuç jeton atar ("[giggles] Benden de kuzum!").
- **Büyüme görünür:** her alınan şey ertesi sabah ekranda durur ve onu isteyen ya da ona dokunan bir müşteri olur.

### 6c. Açılma sırası (önerilen; defter her gün 3 farklı sekmeden seçenek sunar)

| Gün | Başlangıçta açık | Defterde öne çıkanlar |
|---|---|---|
| 1 | **Çoban salatası** (Doğra, Tabakla), **Menemen** (Doğra, Tava, Tabakla), 2 masa | Ayran, 3. masa, masa örtüsü |
| 2 | + "pazardan çamurlu sebze geldi" (Babaanne'nin hediyesi): **Yıka** açılır, ücretsiz | Patates kızartması (Soy, Kızart), perde, saksı |
| 3 | | Mercimek çorbası (Kazan), Pankek (Kır-Çırp, Tava çevir), 4. masa |
| 4 | | Pide fırını (Hamur, Rendele, Fırın), limonata, gramofon |
| 5 | | Köfte ve mangal (Yoğur, Mangal), meyve şiş, bahçe için biriktir |
| 6+ | | Sütlaç, bahçe, çocuk masası, akvaryum, kalan süsler |

### 6d. Ücretsiz ve abonelik
- Ücretsiz: Gün 1 ve Gün 2 (salata, menemen, yıka, ilk alım) tekrar tekrar oynanır.
- Abonelik: Gün 3 ve sonrası, defterin tarif sekmesinin kalanı. `src/engine/erisim.ts` → `'restoran/gun-1': 'ucretsiz'`, `'restoran/gun-2': 'ucretsiz'`, `'restoran/*': 'abonelik'`.

### 6e. Kayıt (`localStorage['minkino-restoran-v1']`)
```ts
interface RestoranKayit {
  surum: 1
  yas: 'kucuk' | 'buyuk'          // ortak yaş ayarından başlar (minkino-kartlar-v1)
  gun: number                     // tamamlanan gün sayısı
  jeton: number                   // kasadaki
  acilan: { tarif: string[]; alet: string[]; masa: string[]; sus: string[]; bolum: string[] }
  yerlesim: { masa: Record<string, string>; sus: Record<string, string> }   // yuva → eşya
  menu: string[]                  // son seçilen menü (ertesi gün öneri olarak gelir)
  gorulen: string[]               // son 2 günün müşterileri
  pano: Record<string, string[]>  // müşteri → keşfedilen sevdikleri
  ilkOyun: boolean                // Babaanne'nin açılışı gösterildi mi
}
```
- Her hesapta ve her alımda yazılır (uygulama kapansa da para kaybolmaz).
- `?test=1&sifirla=1` kaydı siler. `&acilan=ayran,patates&jeton=20&gun=3` test için doğrudan durum kurar.

---

## 7. Sahne, kadraj ve görünüm (Barış: "zoom out al, karakterler dev olmasın")

### 7a. İki tür ekran
1. **Lokanta (ana ekran), dik karşıdan.** Onaylı sahne stili: duvar ekrana paralel, kalın kahve kontur. **Tek resimde hem salon hem açık mutfak:** önde masalar ve kapı, arkada mutfak tezgâhı, ocak, lavabo, servis penceresi, adisyon ipi, kasa. Bütün lokanta tek bakışta görünür. Kamera yok, büyütme yok. Bahçe açılınca ekran sağa kayar (yan yana ikinci resim).
2. **İstasyon ekranları (mini oyunlar), çoğu üstten (kuş bakışı tezgâh).** Neden üstten:
   - Yiyecek büyük ve net görünür, kesim ve soyma üstten en okunaklı hâlinde.
   - **Yöne bağlı değil:** üstten çizim dikeyde 90° döndürülerek kullanılır. Her istasyon için ayrı dikey çizim gerekmez; Gemini yükü yarıya iner.
   - Cooking Mama'nın kanıtlanmış kamerası.
   - Yalnız fırın ve içecek tezgâhı **önden** çizilir (dolum seviyesi ve fırın ağzı yandan okunur); bunların dikey çizimi ayrı yapılır.

### 7b. Ölçek ve netlik (sayılar kodda tek yerde: `restoran/src/olcek.ts`)
- **Yatay 844×390, lokanta:** 1 boy birimi (Mino = 1) = ekran yüksekliğinin **%17'si** (~66 css px). Ayaktaki en uzun karakter (Baba, 2,36) ~156 css px = ekranın %40'ı. Oturan müşterinin masa üstünde görünen kısmı ~70-95 css px. **Bütün karakterler toplam ekran alanının %25'ini geçmez.** Mekân ferah görünür: kapı, 4 masa yuvası, açık mutfak, pencere aynı anda görünür.
- **Dikey 390×844 (web), lokanta:** ayrı dikey lokanta çizimi; mutfak üstte, masalar altta iki sütun. 1 birim = ekran genişliğinin %16'sı (~62 css px).
- **İstasyonda karakter:** Mino köşede, ekran yüksekliğinin en çok %30'u. Yıldız yiyecektir.
- **Netlik kuralı (`src/ui/netlik.ts`, `NETLIK_DPR = 3`):** hiçbir resim kaynak pikselinin üstünde çizilmez. Hesap:
  - Lokanta sayfası karesi ~688×768, karakter karenin %70'i = ~540 px boy. 156 css × 3 = 468 ≤ 540. ✔
  - İstasyon arka planı 2752×1536, 844 css'te 2532 cihaz pikseli. ✔ Dikeyde 90° dönünce 390 css genişliğe 1536 px kısa kenar düşer: 1170 ≤ 1536. ✔
  - **Yiyecek:** tahtadaki salatalık ekranda ~330 css px uzun = 990 px kaynak gerekir. Bu yüzden büyük sebzeler **sayfa başına bir sebze** (bütün hâli sayfanın üst yarısında ~2400 px boyunda) çizilir (§8). Küçük malzemeler paylaşılır.
  - Tava çevirmede pankek havada %125'e kadar büyür (yaklaşma hissi); kaynak bunu karşılayacak boyda kesilir.
  - e2e `buyutulen()` denetimi bu oyunda da çalışır.

### 7c. Animasyon kuralları
- **Yalnız poz değişimi + ezilme-esneme** (scaleY 0,92 → 1,06 → 1, 120-160 ms). Parça döndürme yok. Görsel büyütme yok.
- Her karakterin **8 pozlu lokanta sayfası** var (§8 LOKANTA-KARELER): girer, el sallar, oturur, göz kırpar, yer, bayılır, şaşırır, ekşi yüz.
- Yürüme: Pati'nin `yuru()` gibi poz + yer değiştirme + hop.
- Gag efektleri (duman, gözyaşı, kalp, ter damlası, buhar, yıldız, köpük, minik alev) tek bir Gemini efekt sayfasından kesilir, kodla uçar.
- Yiyecek fiziği kodla: düşme, sekme, yuvarlanma, damla, köpük (Pazar'ın `fizik.ts` `Dunya`'sı ve `gorsel.ts`'i kullanılır).

---

## 8. Mini oyunlar (17 tane: 14'ü v1, 3'ü v1.1)

**Her mini oyun kendi başına cilalı bir küçük oyundur:** kendi istasyon ekranı, kendi sesleri, kendi komik anları, kendi ödül anı. Ayrı bir test sayfasında tek başına açılabilir (`/restoran/mini.html?oyun=dogra`, §10).

**Ortak kalıp:**
- **Giriş:** istasyon açılır, yan rafta malzemeler (3-8) durur. Mino köşede.
- **Çıkış:** sağ altta büyük **tepsi** düğmesi (bir tepsi resmi, yazı yok). Çocuk ne zaman isterse ürünü tepsiye alır. Az da yapsa olur, çok da yapsa olur; sonucu müşteri tadar. Bir işin "doğal sonu" gelince (bütün dilimler kesildi) tepsi bir kez hoplar.
- **Ödül anı:** her mini oyunun sonunda 1 sn'lik tatmin anı (dilimler yelpaze olur, köpük taçlanır), sonra ürün kâsesiyle tepsiye kayar.
- Süre: her biri 10-40 sn. Bir yemek en çok 4 mini oyun.

### M1 · DOĞRA (doğrama tahtası) · imza oyunu · v1 dilim
- **İstasyon:** ahşap tezgâh, üstten. Ortada büyük kesme tahtası. Yuvarlak uçlu, yeşil saplı çocuk bıçağı.
- **Tarifler:** salata, menemen, çorba, patates, pide (sucuk), şiş.
- **Seçenek:** rafta 3-8 malzeme. Hangilerini tahtaya alacağı, kaç tane, nasıl keseceği çocuğun seçimi.
- **Hareket:** **kaydırarak kesme.** Malzemenin üstünden geçen her parmak çizgisi, geçtiği yerde bir kesimdir. Bıçak parmağı izler. Tek kaydırmada iki malzeme birden kesilebilir.
- **Her sebze başka türlü kesilir** (Cooking Mama'nın tekrar eleştirisine çözüm):
  - **Salatalık:** dik kaydırma, yuvarlak dilimler, her dilim yana devrilip içi görünür (açık yeşil daire, çekirdekler). Ses "kırt".
  - **Domates:** önce ikiye (ilk kesim kocaman "şlap", su fışkırır, tahtada leke kalır), sonra dilim, sonra küp. Kesit görünür.
  - **Soğan:** önce kuru kabuğunu parmakla çekip soy (çıtır çıtır), sonra kes. **Üçüncü kesimde Mino ağlamaya başlar,** gözyaşları şelale olur, ekran kenarında yumuşak su dalgası. Kino kapıdan mendil uzatır. Çok kesersen Mino "[sobs] Ağlamıyorum!" der ve hıçkırarak güler. Oyunun en akılda kalan anı.
  - **Biber:** ikiye kes, çekirdekleri dökülür (parmakla silkele), sonra şerit.
  - **Maydanoz:** **ritimli doğrama:** demet tahtada; hızlı dokunmalar ince kıyım yapar. Babaanne'nin mırıldandığı ritme uyulursa her vuruşta yeşil yaprak konfetisi.
  - **Havuç, patates:** sert; kesim sesi "kıtır", biraz daha bastırma hissi (iki kaydırmada bir dilim). Patateste 5-6 yaşta "çubuk" kesimi: önce uzun dilim, sonra çapraz.
- **3-4 yaş:** malzemenin üstünden geçen her kaydırma keser; parçalar iri. Soğan kabuğu tek çekişte çıkar.
- **5-6 yaş:** kesim kalınlığı parmağın yerine göre; özel istekte "3 dilim" ya da "küp küp" (iki yönlü kesim). Mino kesilen dilimleri sayar.
- **Komik başarısızlık:** aşırı kesilen domates **püre** olur ("vıcık"), kâseye akar. Müşteride "çorba gibi salata" tepkisi: kaşıkla içer. Boş tahtaya kesim: bıçak "tok" der, Mino zıplar.
- **Ödül anı:** kesim bitince dilimler tahtada kendi kendine yelpaze gibi dizilir, "tıkır tıkır" müziği bir ölçü çalar, kâseye kayar.
- **Çıktı:** `{malzemeler: {domates: {adet, kesim: 'iri'|'ince'|'pure'|'kup'|'dilim'}}}`.

### M2 · YIKA (leğen ve musluk) · v1
- **İstasyon:** lavabo, üstten. Musluk, içi su dolu leğen, süzgeç.
- **Seçenek:** hangi sebzeleri yıkayacağı; yıkamadan geçmek de bir seçim.
- **Hareket:** sebzeyi leğene at, **parmakla daire çizerek ov** (köpük çıkar, çamur lekeleri tek tek kaybolur), musluğun altına sürükle (şırıl), süzgece bırak.
- **Sürpriz:** marulun yaprağı arasında bir uğur böceği. Ovalayınca uçar, Mino'nun burnuna konar; Mino şaşı bakar, hapşırır, böcek pencereden gider.
- **3-4:** iki ovalama turu bir lekeyi siler. **5-6:** her sebzenin 2-4 lekesi var, hepsini bul.
- **Komik başarısızlık:** yıkanmamış sebzeli salata müşteride "kıtır… toprak?" tepkisi: ağzında bir an çamur bıyığı belirir, peçeteyle siler, güler. Kimse hasta olmaz.
- **Ödül:** temiz sebze parlar (tek parıltı, "ting").
- **Çıktı:** `temiz: true` (yemek özelliği).
- **Eğitici:** "Önce yıka, sonra doğra." Söylenmez, sonuçtan öğrenilir.

### M3 · SOY (soyacak) · v1
- **İstasyon:** ahşap tezgâh, üstten, soyacak ve kabuk kovası.
- **Tarifler:** patates, havuç (çorba), soğan (çorba), salatalık (isteğe bağlı), portakal (limonata yanında süs).
- **Hareket:** **soyacağı sebzenin boyunca sürükle.** Her çekişte kabuk uzun bir şerit olarak kıvrılarak kopar ve kovaya düşer. Soyulan yerin rengi değişir (patates kahveden krem rengine). Sebzeyi çevirmek için yanına dokun ya da iki parmakla döndür (3-4'te kendiliğinden döner).
- **3-4:** 3 çekiş bir yüzü soyar, sebze kendiliğinden döner. **5-6:** portakalda **tek parça spiral kabuk** dene (parmağı kaldırmadan daire): başarırsan kabuk Lokum'un başına taç olur (gizli ödül).
- **Komik başarısızlık:** soyulmuş sebzeyi soymaya devam edersen sebze incelir, sonunda kürdan kadar havuç kalır. Mino onu bıyık gibi takar.
- **Ödül:** kovadaki kabuklar bir kule olur, kova "dolu!" diye zıplar.
- **Çıktı:** `soyuldu: oran`.

### M4 · RENDELE (rende) · v1
- **İstasyon:** ahşap tezgâh, üstten, büyük dört yüzlü rende.
- **Tarifler:** pide (kaşar), çorba (havuç), salata (havuç).
- **Hareket:** malzemeyi rendenin üstünde **aşağı yukarı ritimle sürt.** Altında rende yığını kar gibi büyür, malzeme kısalır.
- **Seçenek:** yanında kaşar, havuç, elma ve (gizli) bir domates. Domatesi rendelersen "fışşş" diye her yer kırmızı olur, Mino'nun yüzü domates benekli, gülüşürler. Domates rendesi yine kullanılabilir (menemene konur!).
- **3-4:** her sürtme belirgin bir rende yığını. **5-6:** "az" ve "çok" isteği (yığın küçük ya da büyük).
- **Ödül:** yığın tepeden bir kez kar gibi "pof" eder.
- **Çıktı:** `rende: {kaşar: miktar}`.

### M5 · KIR VE ÇIRP (yumurta ve çırpma kâsesi) · v1
- **İstasyon:** mermer tezgâh, üstten. Büyük kâse, yumurta sepeti, süt, un, şeker kavanozları.
- **Tarifler:** menemen (yumurta), pankek, sütlaç (süt).
- **Hareket:**
  - **Yumurta kır:** yumurtayı kâsenin kenarına **iki kez vur** (birinci "tık" çatlak, ikinci "çat" açılır, sarısı "pıt" diye düşer).
  - Fazla güçlü (çok hızlı) vurursan kabuk kâseye düşer. Parmakla kabuğu kâseden çıkar: kaygan bir mini oyun, kabuk parmaktan kayar, üçüncüde çıkar. Mino "[giggles] Kaçıyor!" der.
  - **Çırp:** kâsede **daire çiz.** Her tur renkleri karıştırır (sarı ve beyazdan kremaya). Hız eşiği düşük, yay da sayılır. Çok hızlı çırparsan köpük Mino'nun yüzüne sıçrar, Mino yalar.
- **Seçenek:** kaç yumurta (1-4), un, süt, şeker kaşığı (az, çok). 5-6 özel istek: "iki yumurtalı".
- **Ödül:** hamur pürüzsüzleşince yüzeyde parlak bir spiral oluşur.
- **Çıktı:** `{yumurta: n, sut, un, seker, karisti: oran}`.

### M6 · TAVA (sotele, dök, çevir) · v1 dilim
- **İstasyon:** ocak, üstten. İki göz. Tava, spatula, yağ şişesi.
- **Tarifler:** menemen, pankek, (sonra) sucuklu yumurta.
- **Hareketler:**
  - **Yağ gezdir:** şişeyi tavanın üstünde tut, yağ çizgisi akar (az ya da çok).
  - **Sotele:** tepsiden doğranmış sebzeyi tavaya dök (cız!), **spatulayla tavanın içinde sağa sola sür.** Sebzeler yumuşar, renk koyulaşır.
  - **Yumurta kır ve karıştır** (menemen): M5'teki gibi kenara vur, sonra karıştır (az karıştırırsan iri yumurtalı, çok karıştırırsan ince).
  - **Dök ve çevir** (pankek): hamuru kepçeyle dök (ne kadar tutarsan o kadar büyük), kenarları kabarcıklanınca **yukarı fiske** at. Pankek havada döner (%125'e kadar büyür, yaklaşma hissi), "pof" diye iner.
- **Pişme rengi:** çiğ, az, altın, çıtır. Altında cızırtı sesi değişir. Çıtır son durak; kömür yok.
- **Paralel:** tava ocakta kendi pişer. Çocuk istasyondan çıkabilir; lokanta ekranında tavanın üstünde küçük buhar ve cız sesi. Geri dönünce kaldığı yer.
- **3-4:** fiske yönü önemli değil, pankek hep tavaya döner. **5-6:** kabarcıkları bekle (erken çevirirsen öbür yüzü soluk), fazla güçlü fiske = pankek tavana yapışır.
- **Komik başarısızlık:** tavana yapışan pankek 3 sn sonra düşer, lokanta ekranındaysan Kino'nun başına şapka olarak iner. Kino gururla şapkayla servis yapar.
- **Ödül:** altın renk anında tavada kısa bir parıltı, tereyağı kokusu dalgası (iki buhar kıvrımı).
- **Çıktı:** `{pisme: 'cig'|'az'|'altin'|'citir', karisim: oran, buyukluk}`.

### M7 · KAZAN (çorba) · v1
- **İstasyon:** ocak, üstten, büyük kazan, kepçe, baharat kavanozları (tuz, pul biber, nane), limon.
- **Tarifler:** mercimek çorbası, sütlaç.
- **Hareket:** malzemeyi kazana at (sıçrama), **kepçeyle büyük daireler çiz** (renk karışır, fokur fokur kabarcık), baharat kavanozunu **sallayarak** dök (az ya da çok), **kepçeyle kâseye doldur** (kepçeyi kâseye sürükle, doldurma çizgisine kadar).
- **Seçenek:** baharatlar ve limon. Tadına bakma: kepçeyi Mino'ya sürükle; Mino tadar ve **dolaylı ipucu** verir: "[happy] Mmm!" ya da "[gasps] Tuzlu!" (yüzü kızarır, su içer). Kaç kez tadarsa tadsın ceza yok.
- **3-4:** üç tur karıştırma çorbayı hazır yapar. **5-6:** kâseyi çizgiye kadar doldur; taşırırsan tepsiye taşar, Kino tepsiden yalar.
- **Ödül:** kıvamı tutunca kazanın üstünde kalp şeklinde buhar.
- **Çıktı:** `{tuz, aci, eksi, dolum}`.

### M8 · YOĞUR VE YUVARLA (köfte, lokma hamuru) · v1
- **İstasyon:** mermer tezgâh, üstten. Köfte harcı kâsede, soğan, maydanoz, baharat.
- **Hareket:** harca malzeme ekle; **iki parmak sıkıştır** (ya da hızlı basılı tut-bırak) ile yoğur, harç "vıcık vıcık" ses verir. Sonra bir avuç kopar (sürükle), **avucun içinde daire çizerek yuvarla** (top olur), **bastır** (yassı köfte).
- **Seçenek:** köftenin büyüklüğü (küçük topak ya da kocaman) ve sayısı. Baba kocamanına bayılır.
- **3-4:** üç sıkıştırma harcı hazır yapar, bir daire bir köfte. **5-6:** köfteleri aynı boyda yap (Mino sayar: "[happy] Bir, iki, üç!").
- **Komik başarısızlık:** çok bastırınca köfte incecik bir krep olur, Mino onu yüzüne maske yapar.
- **Ödül:** köfteler tepside sıralanır, hepsi bir kez "boing" zıplar.

### M9 · MANGAL · v1
- **İstasyon:** bahçede mangal, üstten. Izgara teli, közler, maşa, hasır yelpaze.
- **Tarifler:** köfte, közlenmiş biber ve domates, (v1.1) şiş.
- **Hareket:** köfteyi ızgaraya diz (cızzz, duman), **maşayla dokunup çevir** (alt yüzde ızgara izleri), **yelpazeyi sağa sola sallayarak** közü canlandır (alev hafifçe yükselir, pişme hızlanır).
- **Komik başarısızlık:** fazla yelpazelersen duman bulutu Kino'nun yüzünü kaplar, Kino öksürür, yüzü is lekeli kalır ve böyle servis eder. Köfte yine "çıtır" olur, yanmaz.
- **3-4:** her köfte bir çevirmede iki yüzü pişer. **5-6:** iki yüzü ayrı pişir, ızgara izleri çapraz olursa yıldız parlar.
- **Ödül:** bütün köfteler altın olunca ızgaranın üstünde çizgi film duman kalpleri.

### M10 · PİDE FIRINI (hamur aç, malzeme diz, kürekle fırına ver) · v1
- **İstasyon 1:** mermer tezgâh, üstten, hamur topu, merdane, un serpme.
  - **Merdane:** merdaneyi hamurun üstünde **ileri geri sürükle.** Hamur sürükleme yönünde uzar: uzun kayık (pide) ya da yuvarlak (lahmacun gibi). Şekli çocuk belirler.
  - **Malzeme diz:** kaşar rendesi (M4'ten), sucuk dilimleri (M1'den), yumurta (kenara vur ve ortaya dök), domates, biber. Serbest yerleştirme, hafif mıknatıs.
  - **Kenar kıvır:** pidenin kenarına iki kez dokun, kenar kıvrılır, uçları burulur.
- **İstasyon 2:** taş fırın, **önden**. Uzun saplı fırın küreği.
  - Pideyi küreğe al, **küreği fırının ağzına doğru it**, bırak. Fırın camından pidenin kabarması ve renk değişimi görünür. Fırın kendi pişirir (paralel).
  - Almak için küreği it ve geri çek.
- **Seçenek:** şekil, malzeme, miktar. Kocaman malzeme dağı mümkün: Baba bayılır, Lokum'un ağzı açılmaz (komik).
- **3-4:** merdane her sürüklemede belirgin açar, kenar kendiliğinden kıvrılır. **5-6:** kenarı kendisi kıvırır; özel istek "yuvarlak" ya da "kayık".
- **Komik başarısızlık:** çok açılan hamur incelir, ortası delinir. Mino delikten bakar, "[giggles] Pencereli pide!" Pişince delik bir kalp olur.
- **Ödül:** fırından çıkan pide buhar üfler, peynir uzar (kodla iplik efekti).

### M11 · KIZART (patates sepeti) · v1
- **İstasyon:** ocak, üstten, fritöz (yağ dolu derin kap), tel sepet, tuzluk, ketçap şişesi.
- **Tarif:** patates kızartması (Soy ve Doğra'dan sonra).
- **Hareket:** çubuk patatesleri sepete koy, **sepeti aşağı sürükle** (yağa dalar, köpük ve cızırtı), **sepeti sağa sola salla** (patatesler zıplar, eşit kızarır), yukarı çek, süzülür. Tuzluğu salla. Ketçap için tabakta noktalara dokun (krema deseni değil, sadece nokta).
- **3-4:** sepet bir kez daldırılınca altın olur. **5-6:** sallamazsan üsttekiler soluk kalır.
- **Komik başarısızlık:** çok tuz: müşteri su içer. Uzun bekletme: çıtır patates (Baba bayılır). Kino servis yolunda bir patates çalar (gizli sürpriz §9).
- **Ödül:** patatesler sepette "kıtır kıtır" sesiyle zıplar, külahta yelpaze olur.

### M12 · ÇALKALA VE DOLDUR (ayran, limonata) · v1
- **İstasyon:** içecek tezgâhı, **önden**. Sürahi, bardaklar, yoğurt, su, buz kovası, limon presi.
- **Ayran:** yoğurdu ve suyu sürahiye dök (yoğurt "plop"), tuz, kapağı kapat, **sürahiyi parmakla sağa sola hızlı salla** (köpük yükselir, sürahi titrer). Sonra **bardağa dök:** sürahiyi tut ve eğ, ne kadar tutarsan o kadar dolar. Bardağın üstünde köpük taçlanır.
- **Limonata:** limonu ikiye kes (M1'e gerek yok, tek kaydırma), **limon presinin üstüne bastır ve çevir** (basılı tut ve daire), çekirdekler zıplar (biri Kino'nun burnuna). Şeker, su, buz küplerine dokun (buz "tink" diye düşer).
- **Seçenek:** az ya da çok köpük, kaç buz, şeker.
- **3-4:** bardak doldurma çizgisinde kendiliğinden durur. **5-6:** kendisi durdurur; taşarsa tezgâha yayılır, Lokum parmağıyla yalar.
- **Komik başarısızlık:** kapaksız çalkalarsan ayran tavana fışkırır, Mino'nun bıyığı beyaz olur.
- **Ödül:** köpük taçlanınca bardağın üstünde minik bir köpük kalbi.

### M13 · ŞİŞ (meyve şiş) · v1.1
- **İstasyon:** ahşap tezgâh, üstten. Uzun tahta şişler, doğranmış meyveler (M1'den): çilek, muz, kavun, üzüm.
- **Hareket:** meyveyi şişin ucuna sürükle, şişe "tık" diye geçer ve kayar.
- **Seçenek ve eğitici:** sıra tamamen çocuğun. 5-6 özel istek: **örüntü** (balonda çilek-muz-çilek-muz-?). Örüntü tamamlanınca şiş bir kez parlar, müşteri bayılır. Bozuk örüntü bile güzel yenir.
- **Ödül:** bitmiş şiş tabakta yelpaze olur, üstüne bal gezdirilebilir.

### M14 · TABAKLA (sunum) · v1 dilim
- **İstasyon:** servis penceresi, üstten. Büyük boş tabak, yan tarafta tepsideki bütün ürünler, garnitür rafı: maydanoz yaprağı, limon dilimi, zeytin, ekmek dilimi, bal kavanozu, çilek, muz dilimi (açılanlara göre).
- **Hareket:** ürünleri tabağa **serbest sürükle** (hafif mıknatıs), garnitürü üstüne koy, zeytinyağı ya da balı şişeyle gezdir (yalnız düz gezdirme, desen değil). **Yüz yapmak serbest:** iki zeytin göz, domates dilimi burun, salatalık gülümseme.
- **Seçenek:** her şey. Boş tabakla bile servis edilebilir (müşteri boş tabağa bakar, Kino'ya bakar, güler: "[laughs] Görünmez yemek!" Jeton yine verir; bu en komik başarısızlık).
- **Akıllı tanıma:** yüz var mı (iki yuvarlak + bir yay), süs sayısı, porsiyon. Palyaço Tavşan ve Lokum yüze, Anne düzgüne bayılır.
- **Ödül:** servis zili "ding!", tabağın üstünde tek parıltı.
- **Fotoğraf:** her gün en güzel bulunan (bayıldı alan) tabak, lokanta duvarındaki "günün tabağı" çerçevesine girer.

### M15 · BULAŞIK · v1
- **İstasyon:** lavabo, üstten. Kirli tabaklar, sünger, köpük, kurutma rafı.
- **Hareket:** süngerle **daire çizerek ov** (kirli lekeler köpükte kaybolur), musluk altına sürükle, rafa diz.
- **Gizli:** köpük balonlarına dokununca patlarlar ("pıt"), en büyüğünün içinde Lokum'un yüzü belirir ve kıkırdar.
- **Neden var:** zorunlu değil. Kino'nun topladığı tabaklar lavaboda birikir (komik yığın). Yıkanınca Babaanne bir bahşiş jetonu bırakır. Ritmi sakin, ASMR hissi; yoğun günün nefesi.

### M16 · SAR (sigara böreği) · v1.1
- **İstasyon:** mermer tezgâh. Yufka üçgeni, peynir, maydanoz.
- **Hareket:** peyniri kenara çizgi gibi koy, **yufkayı yukarı doğru kaydırarak rulo yap**, uca su sür (dokun), sonra M11'in fritözünde kızart.
- **Komik:** çok peynir koyarsan rulo kapanmaz, peynir iki uçtan fışkırır.

### M17 · SÜTLAÇ (kâseye dök, fırında kızart, tarçın) · v1.1
- M7 kazan ve M10 fırının yeniden kullanımı + yeni hareket: kâselere dök (seviye), fırında üstü kızarır, **tarçın kavanozunu salla.** Bulut'un en sevdiği.

**v1 (bu 15 saatlik işin içinde): M1-M12, M14, M15 = 14 mini oyun.** M13, M16, M17 v1.1 (görseller hazırsa aynı paketlerin sonuna eklenir).

### 8a. Tarif tablosu (hangi yemek hangi mini oyunlar)

| Tarif | Mini oyunlar (önerilen sıra) | Açılış |
|---|---|---|
| Çoban salatası | (Yıka) → Doğra → Tabakla (limon, zeytinyağı) | Gün 1 |
| Menemen | Doğra → Tava (sotele, yumurta) → Tabakla (ekmek) | Gün 1 |
| Ayran | Çalkala ve Doldur | defter |
| Patates kızartması | (Yıka) → Soy → Doğra (çubuk) → Kızart | defter |
| Mercimek çorbası | Soy → Doğra → Kazan → (Tabakla: limon, ekmek) | defter |
| Pankek | Kır ve Çırp → Tava (dök, çevir) → Tabakla (bal, muz, çilek, yüz) | defter |
| Pide | Rendele, Doğra (sucuk) → Pide (merdane, diz) → Fırın | defter (büyük) |
| Köfte | Yoğur ve Yuvarla → Mangal → Tabakla (ekmek, közlenmiş biber) | defter (büyük) |
| Limonata | Çalkala ve Doldur (limon presi) | defter |
| Meyve şiş | (Yıka) → Doğra → Şiş | v1.1 |
| Sigara böreği | Sar → Kızart | v1.1 |
| Sütlaç | Kazan → kâseye dök → Fırın → tarçın | v1.1 |

Her tarifin yol haritası adisyon kartının altında resimli durur (alet resimleri, yazısız).

### 8b. Eğitici içerik (güzel resimle, ders gibi değil)
- **Sebze ve meyve adları ve renkleri:** rafta dokunulan her malzemenin adını Mino söyler.
- **Şekiller:** salatalık dilimi daire, domates yarım ay, patates çubuk, küp küp; 5-6 özel isteklerinde.
- **Sayma:** dilim, yumurta, köfte, jeton (≤5).
- **Sıra:** önce yıka, sonra doğra; çiğden pişmişe renk değişimi.
- **Örüntü:** meyve şiş (v1.1).
- **Sağlıklı beslenme ve diş:** Dişçi, Zıpzıp'ın havucu.
- **Empati:** herkesin zevki farklı.
- **Mutfak güvenliği** (söylenmeden): bıçak yuvarlak uçlu, ocak çizgi film; "öğüt" kelimesi hiçbir yerde yok.

---

## 9. Gizli sürprizler (her biri tek dokunuşla, hiçbiri ipucuyla gösterilmez)

1. **Soğan gözyaşı** (M1): Mino ağlar, Kino mendil uzatır. Mendile dokunursan Mino gürültüyle sümkürür.
2. **Lokum'un patisi:** istasyonda 8 sn dokunulmazsa ekranın alt kenarından minik bir pati uzanıp bir salatalık dilimi çalar. Patiye dokunursan Lokum kıkırdayıp dilimi geri koyar; dokunmazsan çatırdatarak yer.
3. **Kapı zili:** lokanta ekranında zile dokun, bütün müşteriler kapıya bakar, kimse yok. Kino omuz silker.
4. **Masa örtüsü numarası:** boş masanın örtüsüne iki kez dokun, Kino örtüyü sihirbaz gibi çeker, tabaklar yerinde kalır, "ta-da!".
5. **Tuzluk:** tuzluğa 5 kez dokun, yakındaki müşteri hapşırır.
6. **Pankek şapka** (M6): tavana yapışan pankek Kino'nun başına düşer.
7. **Kino'nun patatesi:** servis yolunda %20 olasılıkla tabaktan bir patates alır. Ona dokunursan utanıp geri koyar.
8. **Babaanne'nin duvardaki fotoğrafı:** dokununca göz kırpar.
9. **Gramofon** (süs): müzik çalar, bütün oturan müşteriler sandalyede sallanır.
10. **Akvaryum** (süs): balık parmağı izler.
11. **Pencereden Fındık:** Pati'nin Fındık'ı camdan bakar; dokununca havlar ve bir sonraki müşteri Nehir abla olur.
12. **Portakal kabuğu tacı** (M3, 5-6): tek parça spiral kabuk Lokum'un başına taç olur.

---

## 10. Teknik mimari

### 10a. Klasör yapısı
```
restoran/
  index.html                   # #gecis-perde + #restoran (kino-otobus/index.html kalıbı)
  mini.html                    # tek mini oyun deneme sayfası: ?oyun=dogra&yas=kucuk&tarif=salata
  src/
    main.ts                    # sesKokuAyarla + oyunuBaslat(#restoran, {cikis: anaMenuyeDon})
    oyun.ts                    # ekranKaydet('acilis' | 'lokanta' | 'istasyon' | 'defter' | 'gunSonu'), Uygulama
    model.ts                   # SAF kurallar: TARIFLER, MUSTERILER (sever/sevmez/ses), gunPlani(gun, yas, tohum, acilan),
                               # istekKabul(istek, yemek), tepkiHesapla(musteri, istek, yemek) -> 'bayildi'|'mmm'|'komik',
                               # odeme(tepki, yas), restoranCumleleri()
    ekonomi.ts                 # SAF: FIYAT [3-4, 5-6], defterKartlari(acilan, jeton), satinAl, alinabilirMi
    kayit.ts                   # minkino-restoran-v1 oku/yaz/göç/sıfırla
    olcek.ts                   # boy birimi, ekran oranları, enCokCssBoy (netlik), istasyon döndürme kararı
    varliklar.ts               # import.meta.glob('assets/restoran/**'), surumTablosu, VARLIK yedek tablosu
    lokanta/
      lokanta.ts               # ana ekran: arka plan, masa yuvaları, kapı, mutfak istasyon düğmeleri, ip, kasa
      masa.ts                  # masa, örtü, oturan müşteri katmanı, hesap tabağı, kirli tabak
      musteri.ts               # PozluKisi: lokanta sayfası pozları, yürü, otur, ye, tepki, gag
      kino-garson.ts           # Kino: karşıla, adisyon, taşı, topla
      adisyon.ts               # ipteki kartlar, renk eşleme, yol haritası
      tepsi.ts                 # tepsideki ürünler (istasyonlar arası taşınan durum)
      servis.ts                # tabağı Kino'ya ya da masaya sürükle, yeme, tepki, hesap
      ipucu.ts                 # 12/20/30/40 sn merdiveni (lokanta ve istasyonlar ortak)
      surpriz.ts               # §9 gizli sürprizler
    istasyon/
      istasyon.ts              # ortak çerçeve: arka plan (döndürme), yan raf, Mino köşesi, tepsi düğmesi, geçiş
      mino-kose.ts             # Mino'nun köşe pozları (ağla, tat, ekşi, sevin)
      fizik-ortak.ts           # düşme, sekme, damla, köpük, buhar (pazar/src/fizik.ts Dunya sarmalayıcı)
    mini/
      arayuz.ts                # SÖZLEŞME (aşağıda), tek kaynak
      dogra/  yika/  soy/  rendele/  kir-cirp/  tava/  kazan/  yogur/  mangal/
      pide/  kizart/  icecek/  tabakla/  bulasik/  (v1.1: sis/ sar/ sutlac/)
        index.ts               # export const oyun: MiniOyun
        <oyun>.css             # yalnız .rs-<oyun> altında
        mantik.ts              # SAF: kesim, pişme, dolum hesapları (birim testli)
    defter.ts                  # Babaanne'nin Defteri (mağaza)
    gun-sonu.ts                # kapanış, kasa, (5-6) personel yemeği
    sesler.ts                  # Web Audio sentez: kırt, şlap, cız, fokur, çın, ting, pof...
    restoran.css               # .rs- öneki, .mk-kok altında
content/restoran/*.json        # sözler, paket başına ayrı dosya: lokanta.json (P1), defter.json (P4), mini-<oyun>.json (her mini oyun paketi);
                               # restoranCumleleri() hepsini import.meta.glob ile toplar, böylece paketler aynı dosyaya dokunmaz
assets/restoran/               # kesilmiş webp'ler (alt klasörler: arka, istasyon, kisi/<ad>, yiyecek, alet, sus, efekt, ui)
ekip/illustrator/restoran/restoran-isle.cjs   # Gemini sayfalarını keser (pati-isle.cjs ve kino-otobus-musteri-kes.cjs kalıbı)
tests/unit/restoran-*.test.ts  # model, ekonomi, kayıt, her mini oyunun mantik.ts'i
tests/e2e/restoran.spec.ts     # akış; tests/e2e/restoran-mini.spec.ts (her mini oyun tek başına)
```

### 10b. Mini oyun sözleşmesi (`restoran/src/mini/arayuz.ts`)
Her mini oyun **lokantadan bağımsız** çalışır. Lokanta onu yalnız bu sözleşmeyle çağırır. Böylece mini oyunlar paralel kodcularca, birbirine dokunmadan yapılır.
```ts
export interface MiniGirdi {
  yas: 'kucuk' | 'buyuk'
  tarif?: string                 // 'salata' | 'menemen' ...; yoksa serbest (personel yemeği, deneme sayfası)
  malzemeler: string[]           // yan rafta görünecekler (açılanlara göre)
  tepsi: Urun[]                  // şu ana kadar hazırlananlar (ör. tabakla için)
  ozelIstek?: OzelIstek          // 5-6: { tur: 'adet' | 'kesim' | 'ornek', deger }
  test?: boolean
}
export interface Urun {           // tepsiye giden şey: bir kâse, tava, bardak...
  tur: string                    // 'dogranmis' | 'menemen' | 'ayran' | 'pankek' ...
  ozellik: YemekOzelligi         // malzemeler, kesim, pisme, tuz, aci, eksi, tatli, yuz, sus, porsiyon, sicak, temiz
  gorsel: () => HTMLElement      // tepside ve masada gösterilecek küçük hâli (kaynak boyunu aşmaz)
}
export interface MiniBaglam {
  kok: HTMLElement               // istasyon.ts'in açtığı alan (arka plan ve Mino köşesi hazır)
  mino: MinoKose                 // tepki('agla'|'tat'|'eksi'|'sevin'|'sasir'), soyle(anahtar)
  ses: Sesler                    // ortak sentez sesleri
  dokunsal: (ms?: number) => void  // Capacitor Haptics, webde boş
  ipucu: IpucuMerdiveni          // mini oyun yalnız hedefleri bildirir: ipucu.hedef(el, 'kipir'|'parla'|'el')
}
export interface MiniOyun {
  ad: string                     // 'dogra'
  istasyon: 'tezgah' | 'mermer' | 'ocak' | 'lavabo' | 'mangal' | 'servis' | 'firin' | 'icecek'
  baslat(b: MiniBaglam, g: MiniGirdi): MiniOturum
}
export interface MiniOturum {
  bitti: Promise<Urun[]>         // tepsi düğmesiyle çözülür (çocuk istediği an)
  arkaPlanda?: () => ArkaIs      // tava, kazan, fırın, fritöz: istasyondan çıkınca pişmeye devam
  kapat(): void                  // rAF, zamanlayıcı, dinleyici temizliği
}
```
- **Mini oyun lokantanın hiçbir dosyasını import etmez** (yalnız `arayuz.ts`, `src/` ortakları, kendi klasörü).
- Mantık (`mantik.ts`) DOM'suz ve birim testli: kesim sayısı → kesim türü, pişme süresi → renk, dolum oranı...

### 10c. Kullanılacak var olan kod (yeniden yazılmaz)
| Ne | Nereden |
|---|---|
| Ekran sistemi | `src/uygulama.ts` (`ekranKaydet`, `Uygulama.git`, `BaslatSecenekleri.cikis`) |
| DOM ve test modu | `src/ui/dom.ts` (`h`, `TEST_MODU`, `sure`) |
| Netlik | `src/ui/netlik.ts` (`netlikSiniri`, `NETLIK_DPR`, `netlikOnYukle`) + Pati `enCokCssBoy` kalıbı |
| Sürükleme | `pazar/src/surukle.ts` (`surukle`, `geriGonder`), `kino-otobus/src/dokunsal.ts` (`elSurukle`, dokunma/sürükleme ayrımı) |
| Hareket | `src/ui/hareket.ts` (`ucurKavis`, `yapisEsne`, `parlat`, `azHareket`), `src/ui/gecis.ts` |
| Fizik ve parçacık | `pazar/src/fizik.ts` (`Dunya`), `pazar/src/gorsel.ts` (`boing`, `parilti`, `tozKalkar`), `src/ui/konfeti.ts`, `kino-otobus/src/efekt.ts` |
| Poz canlandırma | `pati/src/hayvan.ts` katman düzeni (`.pt-yon > .pt-hareket > .pt-dongu > .pt-nefes > .pt-poz`), `pozAdresi` yedek zinciri, göz yaması (`goz-yama.json`). Lokanta için `restoran/src/lokanta/musteri.ts` bu kalıbı kopyalar (Pati'ye dokunmaz). |
| Pati hayvanları (Nehir'in yanında) | `pati/src/varliklar.ts` pozları: yiyor, sevinç, beğenmedi (salt okunur kullanım) |
| Ses | `src/audio/ses.ts` (`konus`, `efekt`, `KINO_SESI`), `cumleler.ts` → `restoranCumleleri()` eklenir; seri 2 karakter sesleri `content/film2/sesler.json` |
| Dudak | `src/audio/dudak.ts` (Nehir'de olduğu gibi konuşan ağız yaması) |
| Boy | `src/karakter/boy.ts` (`BOY`; Babaanne, Kino ve yeni dört karakter satırı eklenir) |
| Yön | `src/kabuk/yon.ts` → `YATAY_SAYFALAR`'a `'restoran'` |
| Erişim | `src/engine/erisim.ts` → `restoran/gun-1`, `restoran/gun-2` ücretsiz, `restoran/*` abonelik |
| Kesim betikleri | `ekip/illustrator/guvenli-yaz.cjs` (büyük dosyayı ezme), `pati/pati-isle.cjs`, `kino-otobus-musteri-kes.cjs` kalıbı |

### 10d. Ölçek ve yön
- `olcek.ts` Otobüs'ün `olc()` kalıbını kullanır: `ResizeObserver`, `--u` birimi, `data-yon=yatay|dikey`.
- **Yatay:** lokanta arka planı `object-fit: cover`, odak noktası mutfak ile masaların ortası. İstasyon arka planı olduğu gibi.
- **Dikey (web):** lokanta için `lokanta-dikey`, fırın ve içecek için dikey çizimler. Üstten istasyonlar `transform: rotate(90deg)` ile döner; malzeme ve araç sprite'ları dönmez, ekranda dik durur.
- Kesik ve çentik: `env(safe-area-inset-*)` + 16 px. Düğmeler çentik tarafına konmaz.

### 10e. Ses
- **Konuşma:** `content/restoran/*.json` → `mino.*` (anlatıcı sesi), `kino.*` (`KINO_SESI`), `babaanne.*`, `musteri.<ad>.{istek, ipucu, bayildi, komik, gule}` (seri 2 sesleri, eleven_v4).
- **Yeni kayıt tahmini:** Mino ~45, Kino ~12, Babaanne ~12, 15 müşteri × 5 = 75. Toplam ~145 kısa cümle, ~3.200 karakter. **ONAY BEKLİYOR (Barış):** eleven_v4 üretimi. Kayıt gelmeden balon yazısı ve Mino'nun durum cümlesi çalışır.
- **Efektler:** Web Audio sentez (`restoran/src/sesler.ts`): kırt, şlap, çıtır, cız, fokur, pof, çın, ting, şırıl, köpük, tık-çat (yumurta), kıtır, boing. ElevenLabs efekti yalnız 3 tane öneriliyor (kasa "çın", kızgın yağ cızırtısı döngüsü, lokanta uğultusu döngüsü), her biri ≤1,5 sn ~60 kredi. **ONAY BEKLİYOR.**
- **Müzik:** sakin "tıkır tıkır" döngüsü (mutfak), gün sonu kısa melodi. Önce `src/audio/muzik.ts` pentatonik döngüsü; ayrı müzik dosyası sonraki iş.

### 10f. Menü ve yapı
- `vite.config.ts` `SAYFALAR`: `restoran: 'restoran/index.html'`, `restoranMini: 'restoran/mini.html'` (mini, `UYGULAMADA_YOK`'ta; yalnız web/test).
- `uygulama/src/oyunlar.ts`: `RESTORAN_KARTI` + `RESTORAN_MENUDE` bayrağı (Barış onaylayınca true). Kart resmi `uygulama/src/ekranlar.ts` `CIZIMLER` glob'una. Menü 11 kart olacağı için `uygulama.css`'e `data-adet='11'` ızgarası ve menü testlerinin sayısı güncellenir.

---

## 11. Gemini çizim listesi

### 11a. Ortak kurallar
- **Her madde tek sayfa, yeni sohbet.** Önce stil referansı yüklenir: `ekip/stil/onayli-stil-oda.png`. Karakter sayfalarında ikinci olarak karakterin model resmi (aşağıda "yükle" sütunu).
- **Boyut:** hepsi **16:9, 2752×1536** (dikey sahneler 1536×2752, "NOT a crop, re-compose"). 2048'in altı reddedilir. Gün içinde ~10. sayfadan sonra çıktı 1376'ya düşer; o gün durulur.
- **Kayıt:** `ekip/gemini/yeni/restoran/<dosya>.png`. Kesim: `ekip/illustrator/restoran/restoran-isle.cjs` (yazılacak; SAYFALAR listesi) → `assets/restoran/...`. Büyük dosya ezilmez (`guvenli-yaz.cjs`).
- **Kontrol:** `onayli-stil-oda.png` ile yan yana. "Premium bir çocuk kitabında olur mu?" Doku, boyalı fırça, gren, 3D, yazı varsa kullanılmaz. Yalnız bozuk kare yeni sohbette düzeltilir: "Edit this exact image: redraw ONLY tile N as …".
- **Parça ve karakter sayfalarında zemin düz açık nane yeşili** (beyaz süt, yumurta, yoğurt, Bulut'un yünü zeminle karışmasın; `kes-zemin.mjs` köşe renginden zemini bulur).

**S-PREMIUM** (her istemin sonuna, aynen):
> premium 2D vector illustration, glossy cartoon finish with soft highlights and gentle volume shading, high-end toddler picture-book style, rich but clean detail, cute and warm, matching the attached style reference exactly: thick even dark chocolate-brown outline (#3B2416) on every shape, warm pastel palette, two or three soft tones per color, small clean white highlights on glossy surfaces (tomato skin, glass, oil, egg yolk). No painterly brush texture, no grain, no noise, no photo realism, no 3D render, no glow, no light rays, no text, no letters, no numbers, no logos.

**S-ARKA** (dik karşıdan arka planlar, S-PREMIUM'dan önce):
> Straight-on front view like a stage set or a dollhouse wall, no perspective tilt, no corner. Cozy and lived-in but uncluttered. No characters, no people, no animals, no food on plates unless named. Edge to edge, no white border. Wide 16:9, maximum resolution 2752x1536.

**S-ÜSTTEN** (istasyonlar, S-PREMIUM'dan önce):
> Straight top-down bird's-eye view, the camera looks straight down at a kitchen work surface, completely flat, no perspective, no horizon, no walls visible. Only the named tools are drawn; the large central area is an empty clean work surface (space for food). No hands, no characters, no food unless named. Nothing important within 8% of the edges. Edge to edge, no white border. Wide 16:9, maximum resolution 2752x1536.

**SAYFA** (karakter sayfalarının başına):
> ANIMATION SHEET. Every tile shows exactly the same character with the same design, same colors, same clothes, same proportions and the same size scale (a standing pose fills about 70% of the tile height; seated poses use the same scale, so they are shorter), all on the same invisible baseline. Two rows by four columns, eight tiles, front view facing the viewer unless stated. Even plain flat light mint-green background (#DFF5E8) everywhere, even space between tiles, nothing touching, no tile borders, no furniture, no chairs, no tables drawn.

**LOKANTA-KARELER** (müşteri sayfaları, aynen):
> Tile 1: standing, happy, mid-hop as if walking in cheerfully (three-quarter view facing right). Tile 2: standing, waving hello or goodbye with one hand, big smile. Tile 3: sitting on an invisible chair, forearms resting forward at table height, calm happy face looking at the viewer (MAIN seated pose). Tile 4: exactly the same as tile 3, only the eyes gently closed. Tile 5: sitting, eating: holding a fork to the open mouth, cheeks full, chewing happily (fork only, no plate, no food other than a small bite on the fork). Tile 6: sitting, blissful: eyes closed in delight, both hands on the cheeks, tiny happy wiggle. Tile 7: sitting, very surprised: eyes huge and round, mouth a small "o", hands up. Tile 8: sitting, funny sour face: lips puckered, eyes squeezed shut, shoulders up, comically stiff.

**ESYA** (nesne sayfalarının başına):
> OBJECT SHEET for a preschool cooking game, separate objects arranged in a clean grid, each centered in its own area with generous even space, nothing touching, nothing overlapping, all at a consistent scale unless stated. Plain flat light mint-green background (#DFF5E8). Wide 16:9, maximum resolution 2752x1536.

**SEBZE** (büyük malzeme sayfalarının başına):
> INGREDIENT STATE SHEET for a top-down cooking game: the same single vegetable shown in several states, all seen from straight above, all at the SAME real size scale. The whole vegetable is very large across the top half of the image. Plain flat light mint-green background (#DFF5E8), generous space, nothing touching. Wide 16:9, maximum resolution 2752x1536.

**Model resimleri:**
- Kino ailesi: `ekip/film/seri-2/karakter/v6/aile-model.png` (ilgili kişi istemde tarif edilir).
- Bıdık, Bıdık'ın babası, Tombi: `assets/kino-otobus/musteri/<ad>.webp`. Bulut, Zıpzıp, Bıdıcık: G-OT1 kadro sayfası (`ekip/gemini/yeni/kino-otobus/musteri-yeni-sayfasi.png`) gelmişse oradan; gelmemişse önce o sayfa çizilir.
- Mino: `assets/karakter/mino-yeni.webp`. Nehir: `assets/pati/nehir-on.webp`.

### 11b. R-GÜN 1 · ilk oynanabilir dilim (10 sayfa)

| # | Dosya | Yükle | İstem (İngilizce) |
|---|---|---|---|
| 1 | `lokanta-yatay.png` | stil | "A small cozy Turkish neighborhood restaurant (lokanta), one single room seen straight-on, wide. FRONT HALF: the dining floor with warm wooden floorboards, a glass entrance door with a small bell on the far left, a big window with lace half-curtains, and FOUR EMPTY FLOOR SPOTS for tables evenly spaced (show only the floor, no tables, no chairs). BACK WALL: an open kitchen behind a low wooden counter that runs across the back: from left to right a sink with a tap, a wooden chopping counter, a two-burner stove with a range hood, a marble pastry counter, and on the right a serving hatch window with a small bell and a vintage brass cash register beside it. Above the counter a long string with tiny wooden clothespins (empty), white and teal tiles on the kitchen wall, copper pots hanging, shelves with jars (no labels), a framed photo spot (empty frame) and potted herbs. Leave two empty wall gaps in the kitchen (between stove and marble counter, and at the far right) for appliances added later. The floor in front is open and roomy; the restaurant feels spacious, not cramped." + S-ARKA + S-PREMIUM |
| 2 | `istasyon-tezgah.png` | stil | "A wooden kitchen counter top. In the center a big round-cornered light wooden chopping board (empty). On the right edge a small knife rest. Along the top edge a narrow strip of white-and-teal wall tiles seen from above (just the top lip of the backsplash). A folded blue-checked tea towel at the bottom left corner." + S-ÜSTTEN + S-PREMIUM |
| 3 | `istasyon-ocak.png` | stil | "A cream enamel kitchen stove top with two big round black cast-iron burner grates (left and right), both empty and switched off, two round knobs at the bottom edge, a small spoon rest on the far right. Around it a light tiled counter." + S-ÜSTTEN + S-PREMIUM |
| 4 | `istasyon-servis.png` | stil | "The serving counter of a restaurant: a clean pale wooden counter with a big empty round white plate with a thin teal rim in the center, a silver service bell at the top right, a small empty wooden tray on the left, a little bowl of parsley leaves and a little dish of lemon wedges at the bottom right." + S-ÜSTTEN + S-PREMIUM |
| 5 | `sebze-domates.png` | stil | SEBZE + "A ripe red tomato with a green star-shaped stem. Top half: one whole tomato, very large (about 1100 px wide). Bottom row, left to right: the tomato cut in half showing the juicy cross-section (red flesh, yellow seeds in jelly pockets); one round tomato slice lying flat; one half-moon wedge; a small heap of tomato cubes; a small red mush puddle (over-chopped); three single juice drops." + S-PREMIUM |
| 6 | `sebze-salatalik.png` | stil | SEBZE + "A fresh green cucumber with a few small bumps. Top half: one whole cucumber lying horizontally, very long (about 2400 px). Bottom row: the cucumber's flat cut end seen straight (round, pale green ring with seeds); one round slice lying flat; a small heap of cucumber cubes; a long thin peel strip, curled; one half cucumber cut lengthwise showing seeds." + S-PREMIUM |
| 7 | `sebze-sogan-biber.png` | stil | SEBZE (iki sebze) + "LEFT HALF: a golden-brown onion: whole with dry papery skin (large, about 900 px); the same onion peeled, shiny white-purple; a round onion slice showing rings; a heap of diced onion; three pieces of dry onion skin. RIGHT HALF: a long green Turkish pepper (sivri biber): whole, very large (about 1100 px long); cut in half lengthwise showing white seeds; a small scatter of seeds; a heap of thin green pepper rings." + S-PREMIUM |
| 8 | `mutfak-aletleri-1.png` | stil | ESYA + "Row 1: a child-safe kitchen knife with a rounded tip and a green handle, seen from above; a wooden spatula; a frying pan seen from straight above (empty, dark inside, red handle); a ladle. Row 2: a glass olive-oil bottle with a pour spout; a salt shaker; a red pepper-flakes jar; a half lemon. Row 3: a brown egg, whole; the same egg cracked with a jagged crack line; an open eggshell in two halves; a raw egg in a pan seen from above (white and yellow yolk). Row 4: a big white serving tray (empty); a small round wooden bill dish (empty); a white bowl seen from above (empty); a slice of crusty bread." + S-PREMIUM |
| 9 | `babaanne-lokanta-sayfasi.png` | stil, aile-model | SAYFA + "Of exactly this same character: Babaanne Nazlı, the grandmother dog from the attached family model sheet, same face, glasses, clothes and proportions, plus a cream apron with a small teal flower. Tile 1: standing, warm smile, hands clasped (talking pose). Tile 2: holding out a big old brass key with both hands. Tile 3: tasting from a wooden spoon, eyes closed, 'mmm'. Tile 4: clapping proudly. Tile 5: laughing with a hand over the mouth. Tile 6: surprised, both hands on the cheeks. Tile 7: one finger up, wise idea face. Tile 8: waving goodbye." + S-PREMIUM |
| 10 | `kino-garson-sayfasi.png` | stil, aile-model | SAYFA + "Of exactly this same character: Kino, the small beagle-like puppy boy from the attached family model sheet, same face, green t-shirt, navy scarf, red sneakers and proportions, plus a short white waiter apron. Tile 1: standing, holding an empty round tray up flat on one hand at shoulder height, proud smile. Tile 2: walking with the tray, left foot forward (three-quarter view facing right). Tile 3: walking with the tray, right foot forward. Tile 4: bending forward placing the tray down at table height. Tile 5: holding a small notepad and a pencil, writing, tongue out in concentration. Tile 6: wobbling comically, tray tilted, one leg up, eyes wide (nothing falls). Tile 7: sneaking a bite of a single French fry, guilty sideways look. Tile 8: holding a big pile of stacked dirty plates, balancing, cheeky grin." + S-PREMIUM |

**R-Gün 1 ile dilim tam oynanır mı?** Evet: lokanta, iki istasyon (tezgâh, ocak), servis, üç sebze, aletler, Babaanne, Kino. Müşteriler ilk günde **mevcut resimlerle** gelir: Bıdık, Bıdık'ın babası ve Tombi (G-OT1 durağan resimleri), Lokum ve Anne kitleri (Otobüs V3 `KitKisi`, yalnız yüz değişimi). Oturuş pozları R-Gün 2'de gelince yerine geçer. Mino köşesi geçici olarak `src/mino/mino.ts` kod SVG'siyle.

### 11c. R-GÜN 2 · müşteriler ve Mino (10)
| # | Dosya | Yükle | İstem |
|---|---|---|---|
| 11 | `mino-mutfak-sayfasi.png` | stil, `mino-yeni.webp` | SAYFA + "Of exactly this same character: Mino, the small cat from the attached image, same face, colors and proportions, wearing a tiny white chef hat and a tiny apron. Tile 1: standing, happy, paws together. Tile 2: same as tile 1 with eyes closed. Tile 3: crying comically from cutting onions: two big streams of cartoon tears, still smiling bravely. Tile 4: tasting from a big spoon, eyes closed. Tile 5: sour face from a lemon, lips puckered, ears stiff. Tile 6: sneezing, eyes squeezed, head forward. Tile 7: cheering with both paws up, jumping. Tile 8: peeking up from the bottom of the tile, only the head and paws visible, curious." + S-PREMIUM |
| 12 | `lokum-lokanta-sayfasi.png` | stil, aile-model | SAYFA + "Of exactly this same character: Lokum, the toddler puppy girl in the pink dress from the attached family model sheet." + LOKANTA-KARELER + " Tile 8 instead: crying comically from onion with big cartoon tears, then pouting." + S-PREMIUM |
| 13 | `anne-lokanta-sayfasi.png` | stil, aile-model | SAYFA + "Of exactly this same character: Anne Defne, the mother dog from the attached family model sheet." + LOKANTA-KARELER + S-PREMIUM |
| 14 | `baba-lokanta-sayfasi.png` | stil, aile-model | SAYFA + "Of exactly this same character: Baba Murat, the big father dog with glasses from the attached family model sheet." + LOKANTA-KARELER + " Tile 8 instead: sitting, looking sadly at an empty plate shape in front of him (plate not drawn), holding a fork up, comic 'that's all?' face." + S-PREMIUM |
| 15 | `dede-lokanta-sayfasi.png` | stil, aile-model | SAYFA + "Of exactly this same character: Dede Hasan, the grandfather dog with the flat cap and moustache from the attached family model sheet." + LOKANTA-KARELER + S-PREMIUM |
| 16 | `tombi-lokanta-sayfasi.png` | stil, `tombi.webp` | SAYFA + "Of exactly this same character: Tombi, the chubby honey-brown bear cub with red shorts from the attached image." + LOKANTA-KARELER + " Tile 8 instead: sitting, wearing an empty round plate on his head like a hat, cheeky grin." + S-PREMIUM |
| 17 | `bidik-lokanta-sayfasi.png` | stil, `bidik.webp` | SAYFA + "Of exactly this same character: Bidik, the little grey goat kid with sky-blue overalls from the attached image." + LOKANTA-KARELER + " Tile 8 instead: sitting, happily munching a paper napkin, cheeks full, a corner of the napkin sticking out of the mouth." + S-PREMIUM |
| 18 | `zipzip-lokanta-sayfasi.png` | stil, G-OT1 Zıpzıp kesiti | SAYFA + "Of exactly this same character: Zipzip, the energetic sandy-beige bunny girl with very long ears and a pink t-shirt." + LOKANTA-KARELER + " Tile 8 instead: sitting, sour face with her two long ears tied in a knot above her head." + S-PREMIUM |
| 19 | `bulut-lokanta-sayfasi.png` | stil, G-OT1 Bulut kesiti | SAYFA + "Of exactly this same character: Bulut, the shy lamb with a charcoal-black face and puffy white wool, small blue scarf." + LOKANTA-KARELER + S-PREMIUM |
| 20 | `efekt-sayfasi.png` | stil | ESYA + "Small cartoon effect shapes for a cooking game, 4 rows x 5 columns: a white steam curl; a puff of grey smoke; two little smoke puffs from ears; a big blue cartoon tear drop; a stream of cartoon tears; a sweat drop; a red heart; a pink small heart; a yellow star sparkle; a white sparkle; a soap bubble with a shine; a cluster of foam bubbles; a small orange cartoon flame (spicy); a little juice splash red; a juice splash green; a single drop of oil; a dust puff; a 'ding' bell shine ring (no letters); a golden coin with a raised spoon emblem; the same coin with an orange rim." + S-PREMIUM |

### 11d. R-GÜN 3 · yeni istasyonlar ve dikey (10)
| # | Dosya | İstem özeti (tam istem = özet + blok) |
|---|---|---|
| 21 | `lokanta-dikey.png` (1536×2752) | `lokanta-yatay.png` yüklenir: "The same restaurant re-composed for a tall vertical 9:16 phone screen, NOT a crop: the open kitchen across the top third (sink, chopping counter, stove, marble counter, serving hatch with bell and cash register, clothespin string), the dining floor below with FOUR EMPTY FLOOR SPOTS in two columns, the entrance door bottom left. Same style, same colors." + S-ARKA (dikey) + S-PREMIUM |
| 22 | `istasyon-lavabo.png` | "A white kitchen sink seen from above: a chrome tap at the top, a big round light-blue plastic basin half full of clear water in the left bowl, a metal colander in the right bowl, a sponge and a dish rack on the counter." + S-ÜSTTEN |
| 23 | `istasyon-mermer.png` | "A white-grey marble pastry counter with a light dusting of flour in one corner, a wooden rolling pin resting at the top edge, a big empty light ceramic mixing bowl on the left (empty inside)." + S-ÜSTTEN |
| 24 | `istasyon-icecek.png` | "A drinks counter seen straight-on from the front (NOT top-down): a light wooden counter top across the lower third, behind it a teal tiled wall with a shelf of empty glasses, a big empty glass jug with a lid on the counter, a bucket of ice cubes, a lemon squeezer, two empty tall glasses. The center of the counter is free." + S-ARKA + S-PREMIUM |
| 25 | `istasyon-icecek-dikey.png` | aynı, dikey yeniden kompozisyon |
| 26 | `sebze-patates-havuc.png` | SEBZE (iki sebze): patates (bütün kahve kabuklu, soyulmuş krem, dilim, çubuk demeti, kabuk şeridi), havuç (bütün yapraklı, soyulmuş, yuvarlak dilim, rende yığını, kabuk şeridi, kürdan inceliğinde komik havuç) |
| 27 | `sebze-yesillik.png` | SEBZE: maydanoz demeti (bütün), ince kıyım yığını, tek yaprak; marul (bütün baş), tek yaprak, şerit yığını; küçük uğur böceği; üç kahverengi çamur lekesi şekli |
| 28 | `yiyecek-tava.png` | ESYA, hepsi üstten tavanın İÇİ olarak (tava ayrı çizilir): menemen çiğ (doğranmış domates biber yağda), menemen pişmiş, yumurtalı menemen az karışık, çok karışık; pankek hamuru ham daire, altın pankek, çıtır pankek, kabarcıklı pankek |
| 29 | `ayran-limonata.png` | ESYA, önden: sürahi boş, sürahi yoğurtlu, sürahi köpüklü ayran, bardak boş, bardak ayran dolu köpük taçlı, bardak limonata buzlu, limon yarım (kesit), sıkılmış limon, limon çekirdeği, buz küpü, köpük tacı parçası |
| 30 | `nehir-lokanta-sayfasi.png` | stil, `nehir-on.webp` + LOKANTA-KARELER; Tile 8: "sitting, gently holding up a hand in a kind 'no' to something on the floor, smiling" |

### 11e. R-GÜN 4 · yeni karakterler, Bıdık ailesi, kızartma, çorba (10)
| # | Dosya | İstem özeti |
|---|---|---|
| 31 | `musteri-yeni-2.png` | CHARACTER LINEUP SHEET (G-OT1 istemi kalıbı, aynı dünya, aynı ölçek, 4 kare, beyaz değil nane zemin): **Dişçi** (a cheerful adult hippo dentist in a white coat with a tiny round mirror on a headband, huge white teeth smile), **Tuhaf Teyze** (a quirky adult flamingo lady with a big flowery hat, mismatched socks, round glasses), **Palyaço Tavşan** (an adult rabbit clown with a red round nose, a yellow-and-blue striped shirt, big shoes, no scary make-up), **Kelime Yutan Tavşan** (a small grey bunny boy with puffed round cheeks as if his mouth is full, a green cap). Göreli boylar: 2.2, 2.1, 2.1, 1.25. |
| 32 | `disci-lokanta-sayfasi.png` | #31'in kesiti + LOKANTA-KARELER; Tile 8: "sitting, checking his own teeth in a tiny spoon like a mirror, worried then amused" |
| 33 | `tuhaf-teyze-lokanta-sayfasi.png` | LOKANTA-KARELER; Tile 8: "sitting, shrugging with a bored 'meh' face" |
| 34 | `bidik-baba-lokanta-sayfasi.png` | `bidik-baba.webp` + LOKANTA-KARELER; Tile 8: "sitting, beard sticking out spiky in shock" |
| 35 | `bidicik-lokanta-sayfasi.png` | G-OT1 Bıdıcık + LOKANTA-KARELER (çekçek yok, mama sandalyesinde oturur gibi); Tile 8: "pouting, reaching out to the side for someone else's food" |
| 36 | `istasyon-fritoz.png` | ESYA, üstten: derin fritöz (yağ dolu, altın sarısı), tel sepet boş, tel sepet patatesli (ham), tel sepet patatesli (altın), kâğıt külah boş, kâğıt külah patates dolu, ketçap şişesi, ketçap noktası |
| 37 | `istasyon-kazan.png` | ESYA, üstten: büyük çorba kazanı boş, kazanın içi su, içi turuncu mercimek çorbası, içi sütlaç; kepçe; çorba kâsesi boş, dolu; nane kavanozu; kırmızı mercimek yığını; kabarcık şekilleri |
| 38 | `soyacak-rende.png` | ESYA: sebze soyacağı (üstten), dört yüzlü rende (üstten, büyük), kaşar peyniri kalıbı (bütün, yarım), kaşar rende yığını, kabuk kovası boş, kabuk kovası dolu |
| 39 | `yumurta-cirpma.png` | ESYA, üstten kâsenin içi: kâsede çiğ yumurta, yarı karışmış, krem pürüzsüz hamur (parlak spiral), un yığını, süt dökülmesi, şeker kaşığı, çırpma teli, kâseye düşmüş kabuk parçası, süt şişesi, un kavanozu, şeker kavanozu |
| 40 | `kasa-defter.png` | ESYA: pirinç yazar kasa (önden, kapalı), aynı kasa çekmecesi açık jetonlu, Babaanne'nin defteri kapalı (kumaş kaplı, çiçek desenli), defter açık iki boş sayfa, boş resim kartı çerçevesi, masa yuvası işareti (yere çizilmiş noktalı yuvarlak), "kapalı" levhası (uyuyan ay resmi), "açık" levhası (gülen güneş), adisyon kartı boş (beyaz, mandallı), mandal 4 renk |

### 11f. R-GÜN 5 · fırın, mangal, köfte, masalar (10)
| # | Dosya | İstem özeti |
|---|---|---|
| 41 | `istasyon-firin.png` | S-ARKA önden: taş fırın (kubbe, ağzı açık, içinde turuncu kor, düz renk), uzun saplı ahşap kürek duvarda, un çuvalı |
| 42 | `istasyon-firin-dikey.png` | aynı, dikey yeniden kompozisyon |
| 43 | `pide-sayfasi.png` | ESYA, üstten: hamur topu, yarı açılmış hamur, kayık pide hamuru, yuvarlak hamur, delik açılmış ince hamur, kenarı kıvrılmış çiğ pide, pişmiş kaşarlı pide, pişmiş yumurtalı pide, sucuk dilimi, kaşar rende serpintisi, kürek ucu |
| 44 | `istasyon-mangal.png` | S-ÜSTTEN: kömür mangalı, ızgara teli, közler (düz turuncu-kırmızı, parlama yok), maşa, hasır yelpaze yan tarafta |
| 45 | `kofte-sayfasi.png` | ESYA, üstten: köfte harcı kâsede (ham), yoğrulmuş harç, köfte topu, yassı çiğ köfte, ızgara izli pişmiş köfte, çıtır köfte, çok bastırılmış incecik köfte (komik), közlenmiş biber, közlenmiş domates, yarım ekmek |
| 46 | `masalar.png` | ESYA, önden: dört kişilik ahşap masa + 2 sandalye (arkası görünür), aynı masa kareli kırmızı örtülü, mavi çiçekli örtülü, sarı puantiyeli örtülü; alçak çocuk masası minik sandalyeli; bahçe masası (beyaz demir); mama sandalyesi |
| 47 | `sus-1.png` | ESYA, önden: dantel perde, saksı fesleğen, büyük yapraklı bitki, yazısız duvar resmi (meyve sepeti), avize, akvaryum (balıklı), gramofon, Babaanne'nin çerçeveli fotoğrafı (genç hâli), duvar saati (rakamsız), bayrak süs ipi (yazısız), fener, menü kara tahtası (boş) |
| 48 | `bahce-yatay.png` | S-ARKA: lokantanın bahçesi, asma çardak, fenerler, iki boş masa yuvası, mangal yuvası, çiçek saksıları, lokantanın yan duvarı solda (kapıyla). Lokanta-yatay ile aynı yükseklikte yan yana durur. |
| 49 | `bahce-dikey.png` | aynı, dikey |
| 50 | `lokanta-dis.png` | S-ARKA: lokantanın önü, sabah: yazısız tabela (çatal-kaşık ve tencere resmi), cam kapı ve levha askısı, çiçek saksıları, sokak lambası, kaldırım |

### 11g. R-GÜN 6 · kalan sayfalar (10)
| # | Dosya |
|---|---|
| 51 | `palyaco-tavsan-lokanta-sayfasi.png` (Tile 8: "putting his own red clown nose onto an empty plate shape to make a face, giggling") |
| 52 | `kelime-yutan-lokanta-sayfasi.png` (Tile 8: "cheeks puffed full, trying to talk, little mumble lines") |
| 53 | `babaanne-musteri-sayfasi.png` (LOKANTA-KARELER; Tile 8: "sneezing, glasses slipping down the nose") |
| 54 | `meyve-sayfasi.png` (SEBZE: çilek, muz, kavun dilimi, üzüm; bütün ve dilim hâlleri, portakal ve tek parça spiral kabuk) |
| 55 | `bulasik-sayfasi.png` (ESYA, üstten: kirli tabak (sos lekeli), yarı temiz, temiz parlak, sünger, köpük yığını, kurutma rafı, tabak kulesi kirli) |
| 56 | `kapak.png` (menü kartı ve açılış: lokantanın önü, Babaanne kapıda, Kino önlüklü tepsiyle, camdan Mino ve Lokum el sallar; yazısız) |
| 57-59 | `ada-can-elif-lokanta.png`, `deniz-zeynep-lokanta.png` (çocuklar NETLIK #2 sayfaları gelince; 4'er oturuş karesi) |
| 60 | yedek: düzeltme turları |

**Toplam ~60 sayfa ≈ 6 Gemini günü.** Var olan ve yeniden çizilmeyenler: Pati hayvan pozları, Bıdık/Tombi/Bıdık'ın babası durağan resimleri (yalnız referans), G-OT1 kadrosu.

---

## 12. Aşamalar ve kodcu iş paketleri

**Kural:** aynı anda en çok 3 kodcu. Aynı dosyaya iki kodcu dokunmaz. Her paket kendi dosya listesiyle gelir. Her paketin sonunda: `npm run build`, `npm test`, ilgili e2e; 844×390, 932×430, 667×375, 390×844 (DPR 3) ekran görüntüleri **gerçek hızda kare kare izlenir**; `ORTAK_NOTLAR.md`'ye satır.

**Sıra:**
```
Dalga 1:  P1 Çekirdek ─────────────────┐   (P1 ilk 30 dk'da iskeleti ve arayuz.ts'i commit eder)
          P2 Dilim mini oyunları ──────┤   (iskelet commit'inden sonra başlar)
Dalga 2:  P3 Mini oyunlar B ───────────┤
          P4 Ekonomi ve büyüme ────────┤   (P1 bitince)
          P5 Mini oyunlar C ───────────┤
Dalga 3:  P6 Mini oyunlar D + cila + uçtan uca test
```
Dalga 1: 2 kodcu. Dalga 2: 3 kodcu. Dalga 3: 1-2 kodcu.

### P1 · Çekirdek: lokanta, müşteri, sipariş, servis (~3,5 sa)
- **Dosyalar:** `restoran/index.html`, `restoran/mini.html`, `restoran/src/{main,oyun,model,kayit,olcek,varliklar,sesler}.ts`, `restoran/src/lokanta/*`, `restoran/src/istasyon/{istasyon,mino-kose,fizik-ortak}.ts`, `restoran/src/mini/arayuz.ts`, `restoran/src/restoran.css`, `content/restoran/lokanta.json` (lokanta ve müşteri sözleri), `vite.config.ts` (iki giriş), `src/kabuk/yon.ts`, `src/engine/erisim.ts`, `src/karakter/boy.ts` (yeni satırlar), `src/audio/cumleler.ts` (`restoranCumleleri`), `tests/unit/restoran-model.test.ts`, `tests/e2e/restoran.spec.ts` (iskelet).
- **İş:** açılış (levha), lokanta ekranı (masa yuvaları, kapı, mutfak istasyon düğmeleri, adisyon ipi, kasa yerinde), müşteri havuzu ve gün planı, yürü-otur-iste, adisyon, tepsi, servis (Kino'ya ver ya da masaya sürükle), yeme, tepki (3 kademe), hesap tabağı ve kasa, ipucu merdiveni, kayıt. Mini oyun yuvası: istasyona dokununca `istasyon.ts` açılır ve sözleşmeyle mini oyunu çağırır. P2 gelene kadar **deneme mini oyunu** (tek dokunuşla ürün veren) ile akış uçtan uca çalışır.
- **Bitti:** Gün 1 uçtan uca oynanır (deneme mini oyunla). 4 müşteri, 2 masa, resimli/ipuçlu/sürpriz istekler, 3 tepki kademesi, jeton kasaya girer, kayıt yazılır. Hiçbir karakter ekranın %40'ından uzun değil, toplam karakter alanı %25'i geçmez (e2e ölçer). `buyutulen()` temiz. Anlatıcı sözlerinde yasak kelime yok (birim testi).
- **Test:** `restoran-model.test.ts` (plan: aynı gün tekrar yok, Bıdıcık-Bıdık birlikte; istekKabul ipuçlu ve sürprizde ≥2 farklı yemek kabul; tepki kademeleri; ödeme sınırları), e2e: tam gün 844×390 ve 390×844.

### P2 · Dilim mini oyunları: DOĞRA, TAVA, TABAKLA (~3,5 sa)
- **Dosyalar:** yalnız `restoran/src/mini/{dogra,tava,tabakla}/*`, `content/restoran/mini-{dogra,tava,tabakla}.json`, `tests/unit/restoran-mini-dogra.test.ts` vb., `tests/e2e/restoran-mini.spec.ts` (bu üçü).
- **İş:** §8 M1, M6, M14 eksiksiz: her sebzenin kendine özgü kesimi, soğan ağlaması, püre, tava sotele, yumurta kır ve karıştır, pankek çevirme (pankek tarifi P5'te açılır ama hareket burada yapılır), pişme renkleri, arka planda pişme, tabakla serbest diziş, yüz tanıma, boş tabak şakası. Sesler, titreşim, ödül anları.
- **Bitti:** `mini.html?oyun=dogra|tava|tabakla` tek başına oynanır; 3-4 ve 5-6 farkı çalışır; her komik başarısızlık en az bir kez tetiklenir (e2e); kesimden sonra parçalar sahnede kalır; gecikme hissi yok (dokunuştan ilk görüntüye ≤ 1 kare, e2e'de `performance` ölçümü ≤ 32 ms).
- **Test:** `mantik.ts` birim testleri (kesim sayısı → kesim türü, pişme süresi → renk, yüz tanıma), e2e her mini oyun telefon iki yön.

### P3 · Mini oyunlar B: YIKA, SOY, KIZART, ÇALKALA VE DOLDUR (~3 sa)
- **Dosyalar:** yalnız `restoran/src/mini/{yika,soy,kizart,icecek}/*`, `content/restoran/mini-<oyun>.json` + testleri.
- **Bitti:** §8 M2, M3, M11, M12; uğur böceği, kürdan havuç, spiral kabuk tacı, ayran fışkırması, limon çekirdeği. Fritöz arka planda pişer.

### P4 · Ekonomi ve büyüme (~3 sa)
- **Dosyalar:** `restoran/src/{ekonomi,defter,gun-sonu}.ts`, `restoran/src/lokanta/{menu-tahtasi,yerlesim,babaanne}.ts` (yeni), `content/restoran/defter.json` (defter ve Babaanne sözleri), `uygulama/src/oyunlar.ts` (`RESTORAN_KARTI`, bayrak kapalı), `uygulama/src/ekranlar.ts`, `uygulama/src/uygulama.css` (11 kart ızgarası), menü testleri, `tests/unit/restoran-ekonomi.test.ts`.
- **İş:** Babaanne'nin ilk açılışı, menü tahtası (seçim), gün sonu, kasa, Babaanne'nin Defteri (4 sekme, fiyat jeton resimleriyle, biriktir), masa ve süs yerleştirme (yuva seçimi), bahçe bölümü ve kayma, yeni tarifin ertesi gün istenmesi, müşteri panosu, abonelik kilidi.
- **Bitti:** 5 gün art arda oynanır; her gün en az bir alım mümkün; alınan masa müşteri sayısını artırır; alınan tarif menüye ve isteklere girer; kayıt göçü ve sıfırlama testli.

### P5 · Mini oyunlar C: KIR VE ÇIRP, KAZAN, RENDELE, PİDE FIRINI (~3,5 sa)
- **Dosyalar:** yalnız `restoran/src/mini/{kir-cirp,kazan,rendele,pide}/*`, `content/restoran/mini-<oyun>.json` + testleri.
- **Bitti:** §8 M4, M5, M7, M10; kabuk avlama, Mino tadımı, domates rendesi, pencereli pide, fırın küreği, peynir uzaması. Kazan ve fırın arka planda pişer.

### P6 · Mini oyunlar D + cila + uçtan uca (~3 sa)
- **Dosyalar:** `restoran/src/mini/{yogur,mangal,bulasik}/*` (+ görseller hazırsa `sis`, `sar`, `sutlac`), `restoran/src/lokanta/surpriz.ts`, `tests/e2e/restoran.spec.ts` (tam tur).
- **İş:** §8 M8, M9, M15; §9 bütün gizli sürprizler; personel yemeği (5-6); bütün tariflerin uçtan uca akışı; ses kayıtları geldiyse bağlanması; son netlik denetimi.
- **Bitti:** 12 tarifin her biri uçtan uca en az bir kez e2e'de pişirilip servis edilir; 12 sürprizin her biri bir kez tetiklenir; konsol hatası yok; `buyutulen()` temiz; ekran görüntüleri gerçek hızda izlendi.

**Toplam ~19,5 kodcu-saati, paralel çalışınca ~10-11 saat duvar saati.** Yönetici her paket sonunda kendisi oynar ve sert denetler; Barış'a ancak ondan sonra gider.

---

## 13. İlk oynanabilir dilim (Barış'a ilk gösterilecek)

**İçinde:** P1 + P2, R-Gün 1 görselleri (+ R-Gün 2 gelmişse oturuş pozları).

**Üç mini oyun:** **DOĞRA, TAVA, TABAKLA.**
- **Neden bu üçü:** Doğra, Barış'ın kendi sözü (salatalık, domates, soğan) ve oyunun imzası. Tava soğuk mutfaktan sıcak mutfağa geçirir, paralel işi (tava pişerken salata doğra) ve pişme rengini gösterir. Tabakla, Toca özgürlüğünü ve "yüz yap" şirinliğini taşır. Üçü üç farklı hareket: kaydır-kes, sür-çevir, sürükle-diz.
- **Neden Yıka değil:** Yıka basit bir ovalama; dilimin ilk izlenimi için en zayıf his. Gün 2'nin sürprizi olarak daha anlamlı.

**Akış (~7 dk):**
1. Lokantanın önü, sabah. Babaanne anahtarı verir: "[happy] Lokanta artık senin kuzum!" Çocuk levhayı çevirir, zil çalar.
2. Menü tahtası: Çoban salatası ve Menemen kendiliğinden yerleşir (Mino adlarını söyler).
3. **Müşteri 1, Anne (resimli: salata).** Çocuk onu bir masaya oturtur. Adisyon ipe asılır. Tezgâh: domates, salatalık, soğan, biber, maydanoz. Çocuk istediğini doğrar. Soğanda Mino ağlar. Tabakla: limon koyarsa Anne bayılır.
4. **Müşteri 2, Lokum (ipuçlu: kırmızı damla = domatesli bir şey).** Salata da olur, menemen de. Menemen seçerse tava açılır, sotele, yumurta kır. Tava cızırdarken çocuk salataya da geçebilir. İçinde soğan varsa Lokum ağlayıp kıkırdar (komik), yoksa yüz yapılmış tabağa bayılır.
5. **Müşteri 3, Baba (ipuçlu: kocaman ağız).** Kocaman porsiyon ya da çıtır menemen: bayılır. Az porsiyon: boş tabağa bakan komik yüz.
6. **Müşteri 4, Tombi (sürpriz: "Şef ne yaparsa").** Ne verilirse; tabakta bal yoksa da mmm.
7. Gün sonu: kasa "çın", Babaanne'nin Defteri bu dilimde **yalnız süs sekmesiyle** açılır: 3 masa örtüsünden biri seçilir ve masalara serilir. (Tam defter P4'te.) Bu yarım bir iş değil: dilimin kendi kapanışı tam ve anlamlı.

**Dilimde olmayanlar (Barış'a açıkça yazılır):** defterin tarif, masa ve bölüm sekmeleri; Gün 2 ve sonrası; ses kayıtları (Mino'nun anlatıcı sesi kayıtlı olanlarda çalışır, yeni sözler kayıt onayına kadar balonla); dikey web düzeninin cilası.

---

## 14. Sert editör denetimi (kendi tasarımıma)

| Soru | Cevap | Risk ve önlem |
|---|---|---|
| **Eğlenceli mi?** | Evet: her dokunuşun fiziksel bir sonucu var (dilim düşer, yağ cızırdar, pankek uçar). Komik anlar karakterlere bağlı ve tekrar görülmek istenir (soğan gözyaşı, tavana yapışan pankek). | **Risk:** mutfak "iş" gibi gelebilir. **Önlem:** her mini oyun 10-40 sn, tepsi düğmesi her an çıkış, tekrar eden hareket yok. Yönetici her mini oyunu "5 yaşında çocuk bunu yarın yine ister mi?" diye oynar. |
| **Farklı mı?** | Çekirdek "ham malzemeyi elle dönüştür" ve "masada oturan müşteriye servis". Otobüs'te bu yok. | **Risk:** istek balonu ve tepki kademeleri Otobüs'e benziyor. **Önlem:** bu bilerek ortak tutulan ilke; görsel dil farklı (adisyon ipi, masalar, yemek yeme sahnesi). |
| **Otobüs'ün kopyası mı?** | Hayır: kule yok, kap seçme yok, külah yok, tek tezgâh yok, pencere yok. Ödül 3 kart değil, biriktirmeli defter. | — |
| **Çocuğu düşündürüyor mu?** | Menü seçimi (bugün ne pişireceğim), masa seçimi, malzeme seçimi, müşteriyi tanıma (Dede soğan sever, Lokum ağlar), ipuçlu istek (kocaman ağız → hangi yemek?), biriktirme kararı. | **Risk:** 3-4 yaş için çok seçenek boğabilir. **Önlem:** 3-4'te menü 2 yemek, masada en çok 2 müşteri, rafta 3-5 malzeme. |
| **Karakterler dev mi?** | Hayır: lokanta tek bakışta görünür, en uzun karakter ekranın %40'ı, toplam karakter alanı %25 (e2e ölçer). | — |
| **Zoom var mı?** | Yok. İstasyonlar kendi tam çözünürlüklü çizimi. Bahçeye geçiş kaydırma. | Pankek havada %125: kaynak buna göre kesilir. |
| **Görsel kalite tutar mı?** | İstemler premium bloğuyla, stil referansıyla. Büyük sebzeler sayfa başına bir. | **Risk:** üstten istasyon çizimleri Gemini'de perspektifli gelebilir. **Önlem:** önce `istasyon-tezgah` tek sayfa denenir; kabul edilmezse istasyonlar önden çizilir ve dikey sürümleri eklenir (+6 sayfa). |
| **Kapsam gerçekçi mi?** | 14 mini oyun + çekirdek + ekonomi ~19,5 kodcu-saati. | **Risk:** P5-P6 kayabilir. **Önlem:** dilim (P1+P2) kendi başına anlamlı; v1.1 maddeleri ayrı tutuldu. Sayı kısılmaz, kalite kısılmaz; gerekirse süre uzar. |
| **Karmaşık sistem var mı?** (Barış: şirinlik önce) | Tek ek koleksiyon müşteri panosu, o da duvarda fotoğraf. Personel yemeği isteğe bağlı. | Barış "gerek yok" derse pano ve personel yemeği çıkar, döngü bozulmaz. |
| **Yanlış = ceza mı?** | Hiçbir yerde. Yanlış yemek de yenir, aynı taban jeton. Bahşiş yalnız keşif ödülü. | — |
| **"Şuna dokun" var mı?** | Yok; anlatıcı yasak kelimeleri birim testiyle denetlenir. | — |

---

## 15. ONAY BEKLİYOR (Barış)

1. **Ad:** "Tıkır Tıkır Lokanta" mı (önerilen), "Babaanne'nin Lokantası" mı, "Mino ile Kino'nun Lokantası" mı?
2. **Tema:** Türk ev yemekleri + çocuk sevdikleri (önerilen) mi?
3. **Seslendirme:** ~145 kısa cümle (~3.200 karakter) eleven_v4 ile (Ekim'de v4 ücretsiz). 3 ElevenLabs efekti (~180 kredi).
4. **Yeni 4 karakter:** Dişçi, Tuhaf Teyze, Palyaço Tavşan, Kelime Yutan Tavşan'ın çizilmesi (seslerin zaten var).
5. **Başlama izni:** "Tamam" gelince R-Gün 1 çizimleri ve P1 + P2 aynı gün başlar; dilim yaklaşık 1 günde Barış'a gelir.
