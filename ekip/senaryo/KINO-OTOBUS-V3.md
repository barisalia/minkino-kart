# Kino'nun Otobüsü V3 · Seç, Sat, Kazan, Büyüt

> Durum: TASLAK (2026-10-16, senarist). Barış görüp "tamam" deyince kodcuya gider.
> Bu belge, şu an oynanan oyunu (`kino-otobus/src`, tasarımı `kino-otobus.md`) düzeltir. v2 (`kino-otobus-v2.md`, "Dondurma Turu") rafta kalır.
> Hata düzeltmeleri başka bir kodcuda: iki toplu sipariş, müşteriye sürükleme, müşteri boyu. **Bu iş o işten SONRA başlar** (aynı `gun.ts`).
> Temel kural (Barış, 2026-10-16): Her adımda en az 3 anlamlı seçenek olsun. Yanlış seçim komik olsun, ceza olmasın. Anlatıcı "şuna dokun" demesin. İpucu geç ve dolaylı gelsin. Gizli sürprizler olsun. Parça döndürme yok, görsel büyütme (zoom) yok.

---

## 0. Barış ne dedi, V3 ne yapıyor

| Barış'ın sözü | Bugün oyunda olan | V3 |
|---|---|---|
| "Külah hiç bitmiyo, ihtiyaç olmuyo" | Raf en az 1 külahta durur (`KULAH_STOK.enAz = 1`). Kino tezgâhın altından hep külah bulur. | Rafta **3 yuva** var. Külah **biter**. Biten külah ya yapılır (makine, 3 taze külah) ya da müşteriye kâse verilir. Bu çocuğun kararıdır (§3). |
| "Sayma kısmı çok uzuyo" | Akşam günün bütün jetonları tek tek sayılır (3-4: ona kadar, 5-6: beşer). 15-20 jeton, ~40 sn. | **Akşam sayımı kalkar.** Her müşteri, aldığı top kadar jeton bırakır: 3-4 yaşta 1-3, 5-6 yaşta en çok 5. Çocuk jetonlara dokundukça Mino sayar. Her ödeme 2-4 sn sürer (§4). |
| "Parayla bi bok yapılmıyo adam akıllı" | Akşam dükkânında 10 otobüs süsü var, fiyatlı. Süsler oyunda görünmez, yalnız açılışta ve akşam görünür. | Kumbara her gün dolar. Gün sonunda **3 büyük kart** gelir: **yeni tat**, **yeni süs**, **otobüs/Kino süsü**. Çocuk birini seçer. Seçtiği şey **ertesi gün tezgâhta** olur ve bir müşteri onu ister (§5). Fiyat yok, "yeter mi?" yok. |
| "Karakterler az" | 13 müşteri, sabit sıra. Gün 1'de hep aynı 5 kişi aynı sırayla gelir. | **26 müşteri.** 14 iskelet, Kino'nun ailesi (5 kit), Nehir abla ve Gemini'den 6 yeni yan karakter. Her gün havuzdan rastgele seçilir. Sesi olanlar isteğini **kendi sesiyle** söyler (§6). |
| (Temel kural) "Hiç seçenek yok, sürekli 'bunu tıkla'" | Mino isteği eksiksiz okur ("Külahta, iki top: çilek, çikolata!"). Öğreticide "Şimdi buna dokun!" der. 5 sn sonra parlayan el çıkar. | Üç tür istek var: **resimli**, **ipuçlu** ("Çok sıcaklamış…") ve **sürpriz** ("Sen seç!"). İpuçlu ve sürprizde birden çok doğru vardır. Müşterinin zevki vardır: sevdiğine bayılır, sevmediğine komik surat yapar, yine de yer. Parlama en erken 12 sn sonra (§2, §7). |

**Hangi oyuna benziyor, farkı ne?** Tezgâhta sipariş döngüsü Pasta Otobüsü'ne benziyor; v1 zaten öyleydi. V3'ün farkları şunlar:
- **Açık istekler:** çocuk müşterinin zevkini tahmin eder ve dener.
- **Tükenen külah:** yap ya da kâse ver kararı.
- **Kazancın görünür sonucu:** dükkân her gün büyür. Pasta'nın jeton sayımı ve fiyatlı dükkânı burada yok.
- **Kalabalık mahalle:** 26 müşteri, Kino'nun ailesi ve konuşan yan karakterler.

---

## 1. Bir günün akışı (~4 dk, 5 müşteri)

1. **Yolculuk (3 sn, var):** Otobüs parka gelir, kapak açılır. Görseller bu sırada `decode()` edilir.
2. **Sabah (≤ 8 sn):**
   - Rafta **2 külah** var (raf 3 yuvalı, biri boş). Makine hafif buhar çıkarır. Bu dolaylı bir işarettir; parlamaz.
   - İki ya da daha çok yeni tat açıldıysa Kino açılan tatların kaplarını tezgâha dizer. Çocuk bugünün **özel tadını** seçer (2-3 seçenek). Tek yeni tat varsa kendiliğinden özel yuvaya geçer. Hiç yoksa bu adım yoktur.
   - Kino: "[excited] Dondurmaaa!"
3. **Müşteri gelir:** Pencerede belden yukarı görünür (ölçek değişmez, zoom yok). Yanında istek balonu çıkar (§2).
   - Sesi olan müşteri isteğini kendi söyler.
   - Sesi olmayan hayvanda Mino durumu anlatır, emir vermez: "[curious] Tavşan pembeye bakıyor…"
4. **Hazırlık:** Çocuk kabı seçer (külah, kâse, Gün 3'te kupa). Sonra tadı seçer (3-7 kap), istersen sos, istersen süs. Hiçbir adım zorunlu sırada değildir, hiçbir şey beklemez. İki yuva baştan açıktır (var).
5. **Ver:** Dondurma sürüklenir ya da dokunulur (sürükleme düzeltmesi öbür kodcuda). Müşteri tadar ve **zevkine göre** tepki verir (§2.3). Ret yok, ağlama yok.
6. **Ödeme (2-4 sn):** Müşteri, dondurmadaki top sayısı kadar jetonu tezgâha, kumbaranın önüne bırakır. Çocuk jeton sırasına dokundukça her dokunuşta bir jeton kumbaraya uçar ve Mino sayar: "[happy] Bir!", "İki!", "Üç!" Çocuk bu sırada başka müşteriye geçebilir. Dokunulmayan jetonlar tezgâhta bekler (§4).
7. **Kumbara dolar:** Kavanozun yan yüzünde üç çentik var. Jeton geldikçe içi yükselir (rakam yok). Dolunca kapağı "pıt" diye bir kez zıplar.
8. **Gün sonu (~20 sn, §5):** Kumbara kavanozu tezgâhın ortasına kayar. Kino sarsar: "[gasps] Kumbara doldu!" Üç kart açılır, çocuk birini seçer. Seçilen şey yerine uçar. Kino dener ya da takar. Kapak kapanır.
9. **Ertesi gün:** İlk müşterilerden biri yeni şeyi ister: "[excited] Yeni tadı duydum!"

---

## 2. İstekler: seçenekli, zevkli

### 2.1 Üç tür istek

| Tür | Balonda | Ne kabul edilir | Örnek |
|---|---|---|---|
| **Resimli** | Tam dondurma resmi (kap, toplar, sos, süs) | Aynısı tam sevinç verir. Farklısı da yenir (§2.3). | Ördek: kâsede 2 limon |
| **İpuçlu** | Tek ipucu resmi: güneş ve ter damlası (serin), pembe kalp (pembe bir şey), kocaman ağız (çok top), kahverengi lekeli bıyık (çikolatalı bir şey), iki renk damla (iki ayrı tat), meyve sepeti (meyveli tat) | O özelliğe uyan her dondurma doğrudur. Çocuk seçer. | Tombi "[sighs] Ben acıktım…" (kocaman ağız). Doğrusu 3 ya da daha çok top, tat serbest. |
| **Sürpriz** | Soru işaretli boş külah ve müşterinin yüzü | Her şey doğrudur. Müşterinin gizli sevdiği tat ya da süs varsa üstüne **bayılma** tepkisi gelir. | Bulut "[softly] Sen… seçer misin?" |

**Özel istekler (yalnız 5-6, var olanlar):** bir fazla, paylaşma, sıra, örüntü. Bunlar resimli istektir. Günde en çok 1 tane gelir.

### 2.2 Günün karışımı

| | 3-4 yaş | 5-6 yaş |
|---|---|---|
| Gün 1 | 2 resimli, 2 ipuçlu, 1 sürpriz | 1 resimli, 2 ipuçlu, 1 sürpriz, 1 özel (sıra) |
| Gün 2 | 2 resimli, 2 ipuçlu, 1 sürpriz | 1 resimli, 2 ipuçlu, 1 sürpriz, 1 özel (bir fazla) |
| Gün 3 | 1 resimli, 2 ipuçlu, 1 sürpriz, son müşteri Mino'nun doğum günü (var) | 1 ipuçlu, 1 sürpriz, 1 paylaşma, 1 örüntü, Mino'nun doğum günü |

- İlk oynayışta Gün 1'in ilk müşterisi Mino'dur, ama **"Şimdi buna dokun!" demez**. Mino tezgâha yaslanır ve durumu anlatır: "[giggles] Pembe bir şey canım çekti…" Kino'nun bakışı kaplar arasında gezinir. Öğretici bu kadardır.
- Hangi müşteri hangi isteği alır: istek şablonları güne bağlıdır; müşteriler havuzdan rastgele gelir (§6). Şablonda `{sevdigi}` yazıyorsa müşterinin sevdiği tat konur (tavşan çilek, ördek limon).
- Yeni bir tat ya da süs alındıysa ertesi gün 1 istek mutlaka onu içerir.

### 2.3 Zevk ve tepki (ceza yok, komik var)

Her müşterinin bir **sevdiği** ve çoğunun bir **sevmediği** var (tablo §6). Tepki üç kademelidir:

| Ne verildi | Tepki (yüz ya da poz değişimi, bütün gövde hareketi) | Jeton | Mutlu sayacı |
|---|---|---|---|
| Sevdiği şey var (ya da resimli istek tam aynı) | **Bayıldı:** gözler kapalı yalar, iki kol havada zıplar, kalpler çıkar. Sesi varsa imza sözü. | top sayısı + 1 bahşiş (5-6'da toplam en çok 5) | +1 |
| İsteğe uyuyor ama sevdiği yok | **Mmm:** mutlu yüz, bir hop | top sayısı | +1 |
| İsteğe uymuyor (ya da sevmediği var) | **Komik:** önce şaşkın yüz (0.5 sn), sonra sevmediğine göre gag: limonda dudak büzülür ve kulaklar diker olur; çikolatada bıyık kahverengi olur ve müşteri diliyle yalar; kocaman kulede burnu dondurmaya gömülür. Sonra güler: "[laughs] Farklıymış ama güzel!" Farklı olan parça bir an parlar. | top sayısı | 0 |

Ders tek: "Herkesin zevki farklı." Çocuk ikinci gelişte müşteriyi tanır. Müşteriler oturumlar arasında sevdiklerini değiştirmez.

---

## 3. Külah: biten, dolan, karar isteyen

- **Raf:** Külah düğmesinin üstünde 3 yuvalı tahta raf vardır. Kaç külah kaldığı resim olarak görünür (rakam yok). Gün başında 2 külah olur.
- **Kullanım:** Her külahlı dondurma 1 külah eksiltir. Kâse ve kupa sınırsızdır (bulaşık makinesinden gelir; süs).
- **Bitince:**
  - Raf boşalır, külah düğmesi silik bir kâğıt kılıf olarak durur.
  - Kino bir kez "[gasps] Külah bitti!" der (günde en çok 1 kez).
  - Makinenin buharı artar; bu dolaylı bir işarettir.
  - Boş külaha dokunulursa Kino rafın altına bakar, boş elini gösterir ve omuz silker. Bu komik bir andır, ceza değildir.
- **Çocuğun 3 yolu var:**
  1. **Külah yap:** makine paneli açılır (var: 3-4 yaşta bas ve yuvarla, 5-6 yaşta hamuru dök, bas, yuvarla). Rafa **3 taze külah** gelir.
  2. **Kâse ver:** Resimli istekte külah isteyen müşteri kâseyi de yer. Tepki "İsteğe uymuyor" satırıdır: şaşkın yüz, sonra "[laughs] Kâseden de olur!"
  3. **Bekletip sıradakine geç:** Müşteri bekler; sabır sayacı yoktur. Bekleyen müşteri ara ara külah resmine bakıp dudak yalar.
- **İpucu:** Külah istekli müşteri 12 sn bekler ve rafta külah yoksa önce makineye bakar. Bu dolaylı bir ipucudur. Makine ancak 20 sn sonra parlar.
- **Bıdık külahı da yer** (gizli şaka): Bıdık'a külahlı dondurma verilirse dondurmadan sonra külahı da "kıtır kıtır" yer, "Hıp! Pardon!" der.

---

## 4. Para: kısa sayma

- Jeton sayısı müşterinin aldığı **top sayısına** eşittir. Bayılırsa +1 bahşiş gelir. Üst sınır 3-4 yaşta 3, 5-6 yaşta 5'tir. Çocuk "çok top = çok jeton" ilişkisini görür.
- Jetonlar tezgâhın ön çizgisine, müşterinin yuvasının önüne sıra hâlinde iner. Temas gölgeleri vardır.
- **Sayma:**
  - Jeton sırasının tamamı tek dokunma alanıdır (en az 88 × 72 px). Her dokunuş **sıradaki** jetonu kumbaraya uçurur. Mino sayıyı söyler (kayıtlar var: `sayiSozu`). Son jetonda kavanoz zıplar.
  - Çocuk sürükleyerek de atabilir: jetonu kumbaraya bırakırsa aynı sayım olur.
  - Yalnız 5-6 yaşta ve günde en çok 2 kez, son jetondan sonra Mino sorar: "[curious] Kaç jeton oldu?" Kumbaranın yanında 3 büyük rakam balonu çıkar (doğru, bir eksik, bir fazla). Doğruda kavanoz parlar. Yanlışta jetonlar kavanozda bir kez daha zıplayıp sayılır, Mino güler. Bu sayıyı yine bulmaya çalışmaktır, ceza yoktur. 10 sn dokunulmazsa balonlar söner.
- **Dokunulmazsa:**
  - 12 sn sonra kumbara hafifçe sallanır (dolaylı).
  - Jetonlar tezgâhta kalır. Yeni müşterinin jetonları yanlarına eklenmez; yeni sıra öbür yuvanın önüne iner.
  - Gün sonunda kalan jetonlar sayılmadan, bir "şıngır" sesiyle kumbaraya kayar.
- **Kumbaranın içi:** Gün hedefi 3-4 yaşta 8 jeton, 5-6 yaşta 14 jetondur. Bu hedef genelde 4. müşteride dolar. Dolmasa bile gün sonunda Kino kendi cebinden bir avuç atar ("[giggles] Benden de!") ve kavanoz dolar. Her gün ödül vardır.
- **Kayıt:** `jeton` alanı artık birikmez. Yalnız `acilan` (ödüller) ve günler tutulur. Eski kayıtta jetonu olan oyuncunun eski `alinan` süsleri korunur.

---

## 5. Ödül: üç kart, tek seçim, ertesi gün oyunda

### 5.1 Ekran (~20 sn)
- Gün batımı. Otobüs solda, sağda kumbara.
- Kino kavanozu sallar ve jetonlar yay çizerek üç kartın üstüne yağar. Kartlar aynı anda açılır.
- Kartlarda yazı ve fiyat yoktur. Her kart büyük bir resimdir:
  1. **Yeni tat:** tat kabı ve üstünde bir top.
  2. **Yeni süs:** süsün kendisi, bir külahın tepesinde.
  3. **Görünüm:** otobüs ya da Kino süsü, otobüsün küçük çiziminde ya da Kino'nun başında.
- Kartlardan birine ilk dokunuşta **ön izleme** olur: Mino adını söyler, Kino tadına bakar ya da süsü havada gösterir. İkinci dokunuşta, ya da kartı otobüse sürükleyince, seçim kesinleşir. Çocuk üç kartı da tek tek deneyebilir.
- Seçilen kart uçar:
  - Tat dolaba girer.
  - Süs rafa oturur.
  - Görünüm otobüse ya da Kino'ya takılır, otobüs zıplar.
  - Kino seçilen şeye tepki verir: "[happy] Mmm, vişne!" ya da şapkayla poz.
- Seçilmeyen kartlar küçülüp kavanoza geri girer. Mino: "[softly] Onlar da yarına!"
- Tamam düğmesi otobüsü kapatır (var: Kino esner, kapak kapanır).

### 5.2 Katalog (her kategoride sıra; seçilen yerine sıradaki gelir)
| Kategori | Sıra | Görsel |
|---|---|---|
| **Tat** | vişne (kırmızı), portakal (turuncu), pamuk şeker (açık mavi) | Yeni çizim yok. `top-cilek` → vişne, `top-limon` → portakal, `top-yabanmersini` → pamuk şeker ve aynı yoldan `kap-*`, Lab ton kaydırmalı yeniden boyama betiğiyle (§10). Renk öğretimine üç yeni renk ekler: kırmızı, turuncu, açık mavi. |
| **Süs** | yıldız kurabiye, muz dilimi, çikolata parçası | Var: `assets/pasta/kurabiye-yildiz-altin`, `susler-muz`, `susler-cikolata-tek` |
| **Görünüm** | flama, Kino'nun kiraz şapkası, ampul zinciri, çatı külahı, korna, kemik tabela, jant, 3 boya | Var: `assets/kino-otobus/sus-*`, `kino-sapka`, `BOYA` |

- **Oyunda nerede görünür:**
  - Yeni tat dolabın sağındaki **özel tat yuvasında** durur (7. kap, "yeni" kurdeleli).
  - Yeni süs, süs rafının sonundaki **özel süs yuvasında** durur.
  - Şapka Kino'nun başındadır.
  - Ampul zinciri ve flama pencerenin tepesindedir.
  - Korna üst çubukta küçük düğmedir: basınca "Dondurmaaa" melodisi çalar.
  - Boya, jant ve çatı külahı açılışta, yolculukta ve gün sonunda görünür.
- **Bir kategori bitince** o kart "Kino'ya dondurma ısmarla" olur: seçilince Kino kocaman bir kupayı bir dikişte yer, beyni donar, titrer, güler. Her gün tekrar seçilebilir.
- **Ücretsiz/abonelik:** Gün 1 ücretsizdir ve tekrar tekrar oynanır. Ücretsiz oyuncu her kategoriden **ilk ödülü** alır. Sonrakinde kart kilit anını açar (`kino-otobus/odul`, abonelik). Yaş ayarı kilitlenmez.

---

## 6. Müşteri havuzu (26)

**Kaynaklar:**
- **İskelet:** `assets/karakter-iskelet`. Göz kırpar, nefes alır, mutlu, şaşkın ve üzgün yüzleri vardır.
- **Kit:** Kino'nun ailesi, `assets/karakter/{anne,baba,lokum,babaanne,dede}`. Bunlar `film/src/kukla.ts` ile **yalnız dinlenme duruşunda** çizilir. Eklem açısı 0'dır. Kitin göz ve ağız setleri değiştirilir: konuşurken ağız, sevinçte mutlu göz. Hareket yalnız bütün gövdeye verilir.
- **Durağan:** Nehir (`assets/pati/nehir-on` ve ağızları) ve G-OT1'in 6 yeni karakteri. Bunlarda tek resim kullanılır, hareket bütün gövdeye verilir. Faz 2'de hareket sayfasına geçerler.

**Ses:**
- Kino'nun ailesi, Nehir ve 6 yeni karakter `content/film2/sesler.json`'daki **kendi sesleriyle** konuşur (eleven_v4).
- Hayvan ve çocuk iskeletlerinin sesi yoktur. Onların isteğini Mino bir cümleyle **anlatır**; isteği okumaz.

| # | Müşteri | Kaynak | Sevdiği | Sevmediği (komik gag) | Ses / imza |
|---|---|---|---|---|---|
| 1 | Mino | iskelet | çilek | yok | anlatıcı |
| 2 | Tavşan | iskelet | çilek | limon (dudak büzülür) | yok |
| 3 | Ayı | iskelet | karamel sos | yaban mersini (dili mor olur) | yok |
| 4 | Ördek | iskelet | limon | çikolata (gagası kahverengi) | yok |
| 5 | Kuş | iskelet | yaban mersini | karamel (gagası yapışır, açamaz) | yok |
| 6 | Maymun | iskelet | fıstık + gofret | vanilya ("sade") omuz silker | yok |
| 7 | İnek | iskelet | vanilya | yok | yok |
| 8 | Karabaş | iskelet | vanilya | limon (kulakları dikilir) | yok |
| 9 | Pamuk | iskelet | pembe her şey | fıstık (yeşil, tüyleri kabarır) | yok |
| 10 | Ada | iskelet | çilek + serpinti | yok | yok |
| 11 | Can | iskelet | çikolata | limon | yok |
| 12 | Elif | iskelet | limon | karamel | yok |
| 13-14 | Deniz + Zeynep | iskelet | paylaşma çifti (aynısı) | yok | yok |
| 15 | **Lokum** (Kino'nun kardeşi) | kit | tek top vanilya, kâsede | kocaman kule (yüzü dondurmaya gömülür) | `lokum`: "[giggles] Abiii, dondurma!" |
| 16 | **Anne** | kit | meyveli (çilek, yaban mersini) | yok | `anne`: "[happy] Aferin oğluma!" |
| 17 | **Baba** | kit | çikolata + karamel, kocaman | limon (gözlüğü buğulanır) | `baba`: "[laughs] Kocamanından!" |
| 18 | **Babaanne** | kit | fıstık | serpinti ("dişime yapıştı") | `babaanne`: "[softly] Fıstıklı var mı?" |
| 19 | **Dede** | kit | vanilya + kiraz | pamuk şeker (bıyığı mavi olur) | `dede`: "[chuckles] Eski usul olsun." |
| 20 | **Nehir abla** | durağan | yaban mersini | yok | `nehir`: "[happy] Serin bir şey lütfen!" |
| 21 | **Bıdık** (keçi) | yeni | her şey, külahı da yer | yok | `bidik`: "Hıp! Pardon!" |
| 22 | **Bıdıcık** (çekçekte) | yeni | Bıdık ne aldıysa aynısı | yok | `bidicik`: "[giggles] Bıdık abiii!" |
| 23 | **Bıdık'ın babası** | yeni | limon | çikolata (sakalı kahverengi) | `bidik-baba`: "[laughs] Meee, serin olsun!" |
| 24 | **Tombi** (ayı yavrusu) | yeni | kocaman (3+ top) | tek top (boş külaha bakar) | `tombi`: "[sighs] Ben acıktım…" |
| 25 | **Bulut** (kuzu) | yeni | vanilya ("bembeyaz") | yok | `bulut`: "[softly] Sen… seçer misin?" |
| 26 | **Zıpzıp** (tavşan) | yeni | portakal (yoksa limon) | yok | `zipzip`: "[excited] Ben önce!" |

**Kurallar:**
- Bir günde aynı müşteri iki kez gelmez.
- Son iki oyunda gelmeyenler önce seçilir (`kayit.gorulen`).
- Mino yalnız ilk Gün 1'in öğreticisinde ve Gün 3 doğum gününde gelir.
- Bıdıcık hep Bıdık'la gelir (paylaşma ya da "aynısı" isteği).
- Deniz ile Zeynep birlikte gelir.
- Kit karakterleri (aile) günde en çok 2 tane gelir. Seri 2 çizimiyle Seri 1 çizimi yan yana çok görünmesin diye.

**Boy:** `src/karakter/boy.ts` → `BOY`'a yeni satırlar eklenir (Mino = 1; SERI-KITABI §boy tablosu):

| Karakter | Boy |
|---|---|
| Lokum | 0.95 |
| Anne | 2.16 |
| Baba | 2.36 |
| Babaanne | 2.05 |
| Dede | 2.20 |
| Nehir | 2.0 |
| Bıdık | 1.25 |
| Bıdıcık | 0.80 |
| Bıdık'ın babası | 2.2 |
| Tombi | 1.45 |
| Bulut | 1.25 |
| Zıpzıp | 1.25 |

Pencere ölçeği müşteri boyu düzeltmesine uyar (öbür kodcunun işi). Büyükler kırpılmaz; omuzdan yukarısı pencerede görünür.

---

## 7. İpucu ve seçenek kuralları (bütün oyun)

- **Kaldırılan sözler:** `mino.dokun` ("Şimdi buna dokun!") ve `mino.bana_ver` ("Şimdi bana ver!"). İsteği eksiksiz okuyan `okuma()` artık yalnız resimli istekte ve yalnız **ilk 2 müşteride** çalışır. Sonra balon kendi konuşur.
- **İpucu merdiveni** (her yuva için, son dokunuştan sayılır):
  - 0-12 sn: hiçbir şey olmaz.
  - 12 sn: müşteri isteğindeki eksik şeye **bakar** (göz kayması ya da baş eğme) ve dudak yalar.
  - 20 sn: Mino durumu bir daha anlatır.
  - 30 sn: eksik şey hafifçe parlar.
  - 40 sn: minik el çıkar.
  - Bugünkü `siradakiAdim` parlaması 5 sn yerine bu merdivene bağlanır.
- **Her adımda seçenek:**
  - Kap için 2-3 seçenek, tat için 3-7, sos için 1-3, süs için 0-6 (özel yuvalarla).
  - İpuçlu ve sürpriz isteklerde birden çok doğru vardır.
  - Akşamda 3 kart vardır.
  - Külah bitince 3 yol vardır (§3).
- **Yanlışta:** Yanlış tat istenmeden kondu diye hiçbir şey engellenmez. En üstteki topa dokununca Kino onu yer (var). Komik tepki müşteridedir.

---

## 8. Gizli sürprizler (her biri tek dokunuşla bulunur; hiçbiri ipucuyla gösterilmez)

1. **Külah zinciri** (pencerenin tepesinde, var): her külah bir nota çalar. Soldan sağa sırayla dokunulursa "Dondurmaaa" korna melodisi çıkar ve Kino dans eder.
2. **Dolabın camı:** üç dokunuşta buğuya kalp çizilir, Kino göz kırpar.
3. **Kumbara:** 5 hızlı dokunuşta Kino üç jetonla hokkabazlık yapar, jetonlar kavanoza geri düşer.
4. **Kaçan balon** (`assets/film/esya/balon`, var): her müşteriden sonra %20 olasılıkla pencerenin önünden süzülür. Dokunulursa bir müşterinin kafasına "bop" diye çarpar ve sekip uçar. Müşteri şaşkın yüz yapar, sonra güler. Yeni çizim yok.
5. **Lokum'a dokununca** Kino eğilir ve Lokum'un burnuna minik dondurma sürer. Lokum kıkırdar.
6. **Zıpzıp** sıradaki müşterinin önüne atlar: "Ben önce!" Dokunulursa utanıp yerine döner, sıra eski hâline gelir. Dokunulmazsa ilk o alışveriş yapar. İkisi de olur.
7. **Tombi** dondurmayı bitirince külahı da ister: boş külaha dokunulursa Kino ona bir külah daha uzatır. Rafta külah yoksa Tombi omuz silker.
8. **Kara tahta menü** (var): resmine dokunulan tatın adını Mino söyler.
9. **Kino'ya 3. dokunuş:** Kino soğuktan hapşırır (var). 5. dokunuşta kiraz şapkası varsa şapka zıplar.

---

## 9. Replikler (kısa, etiketli; ≤ 30 karakter hedef)

**Mino (anlatıcı sesi, `content/kino-otobus.json` → `mino`):**

Durum anlatımı (`durum`), sesi olmayan müşteride, ipucu türüne göre:
- serin: "[softly] Çok sıcaklamış gibi…"
- pembe: "[curious] Pembeye bakıyor…"
- kocaman: "[giggles] Çok acıkmış!"
- çikolata: "[curious] Kahverengi bir şey mi?"
- iki renk: "[happy] İki renk sever."
- meyveli: "[curious] Meyveli bir şey mi?"
- sürpriz: "[whispers] Ne sever acaba?"
- resimli: "[happy] Bak, ne istiyor?"

Ödeme (`odeme`):
- "[happy] Bir!" … "[happy] Beş!" (var olan sayı kayıtları)
- "[curious] Kaç jeton oldu?" (5-6)

Külah (`kulah`):
- "[gasps] Külah bitti!" (Kino söyler, `kino.kulah_bitti`)

Gün sonu ve ödül (`odul`):
- "[excited] Kumbara doldu!"
- "[curious] Hangisi olsun?"
- "[softly] Onlar da yarına!"
- tat adları: "Vişne!", "Portakal!", "Pamuk şeker!"
- süs adları: "Yıldız kurabiye!", "Muz dilimi!", "Çikolata parçası!"
- görünüm adları: "Flama!", "Kiraz şapka!", "Ampuller!", "Çatı külahı!", "Korna!", "Kemik tabela!", "Yıldızlı jant!", "Nane yeşili!", "Limon sarısı!", "Çilek pembesi!"

**Kino (`kino`):**
- "[gasps] Külah bitti!"
- "[happy] Mmm, {tat}!" (yeni tat tadımı; 3 ayrı kayıt)
- "[giggles] Benden de!"
- "[laughs] Beynim dondu!"
- "[excited] Yeni tadı denesene!"

**Müşteriler (kendi sesleri, eleven_v4; `content/kino-otobus.json` → `musteri.<ad>`):** Her birine 3 kayıt düşer: istek, bayıldı, komik.

| Müşteri | İstek | Bayıldı | Komik |
|---|---|---|---|
| Lokum | "[giggles] Abiii, dondurma!" | "[laughs] Abiii, bir daha!" | "[gasps] Burnum dondu!" |
| Anne | "[happy] Meyveli bir şey?" | "[happy] Aferin oğluma!" | "[laughs] Ay, ekşiymiş!" |
| Baba | "[laughs] Kocamanından!" | "[excited] İşte bu be!" | "[chuckles] Gözlüğüm buğulandı!" |
| Babaanne | "[softly] Fıstıklı var mı?" | "[happy] Maşallah sana!" | "[laughs] Dişime yapıştı!" |
| Dede | "[chuckles] Eski usul olsun." | "[happy] Tam benim zamanımdaki!" | "[laughs] Bıyığım mavi oldu!" |
| Nehir | "[happy] Serin bir şey lütfen!" | "[excited] Bayıldım Kino!" | "[giggles] Hı, ilginçmiş!" |
| Bıdık | "[excited] Meee, hepsinden!" | "Hıp! Pardon!" | "[laughs] Meee, güzelmiş!" |
| Bıdıcık | "[giggles] Bıdık abiii!" | "[giggles] Ben de hıp!" | "[gasps] Meee!" |
| Bıdık'ın babası | "[laughs] Meee, serin olsun!" | "[happy] Oh, ferahladım!" | "[chuckles] Sakalım boyandı!" |
| Tombi | "[sighs] Ben acıktım…" | "[happy] Kocamanmış!" | "[sighs] Bu kadar mı?" |
| Bulut | "[softly] Sen… seçer misin?" | "[whispers] Çok güzel…" | "[giggles] Hı… olur." |
| Zıpzıp | "[excited] Ben önce!" | "[excited] Hızlı ve güzel!" | "[laughs] Komikmiş!" |

**Toplam yeni kayıt:**
- Mino: ~30 kısa cümle.
- Kino: 7.
- Müşteriler: 36.
- Hepsi ≤ 30 karakter, toplam ~1400 karakter.
- Müşteri sesleri eleven_v4 ile CI'da üretilir (Ekim'de v4 ücretsiz). **ONAY BEKLİYOR (Barış):** 36 müşteri cümlesinin üretimi.
- Ses gelmeden önce balon yine çalışır: müşterinin cümlesi seslendirilmez, Mino'nun durum cümlesi söylenir.

---

## 10. Yaş farkı (3-4 / 5-6)

| | 3-4 | 5-6 |
|---|---|---|
| Top sayısı | 1-3 | 1-4 (kupada 5) |
| Jeton | 1-3 | 1-5 |
| "Kaç jeton oldu?" | yok | günde en çok 2 |
| İpuçlu istek | tek özellik (serin, pembe, kocaman) | iki özellik birden ("serin ve iki top") |
| Özel istek | yok | sıra, bir fazla, paylaşma, örüntü |
| Külah yapımı | bas, yuvarla | hamuru dök, bas, yuvarla |
| Kumbara hedefi | 8 | 14 |
| Ödül | aynı (3 kart) | aynı |

---

## 11. Animasyon anları (zoom yok, parça döndürme yok)

- **Yakın çekimler kalkar.** Bugün istek, kule, tadım ve Kino'nun yemesi için kamera yaklaşıyor. Bunların yerine aynı ölçekte poz ve yüz değişimi gelir: müşterinin `mutlu`, `saskin` yüzü, kitlerde göz ve ağız seti. Poz geçişinde 120 ms ezilme-esneme olur (scaleY 0.92 → 1.06 → 1). Görsel hiçbir yerde kaynak çözünürlüğünün üstüne büyütülmez (DPR 3 dahil).
- **Komik gag'lar:** Bunlar ayrı küçük görseldir ya da renk katmanıdır. Mor dil, kahverengi bıyık, mavi bıyık, buğulu gözlük ve sakal birer yama resmidir (Faz 2'de hareket sayfasından kesilir). MVP'de yalnız yüz değişimi, titreme ve "!" balonu kullanılır. Yama yoksa gag sesli ve yüz değişimli oynar.
- **Jeton:** müşteriden tezgâha iki sekmeyle iner. Dokununca yay çizerek kumbaraya uçar. Kavanozun içi kodla yükselir (jeton yığını maskesi).
- **Külah bitti:** son külah alınınca raf hafifçe sallanır. Boş kâğıt kılıf bir kez "pıt" diye çöker.
- **Ödül:** Üç kart arkadan öne sırayla sekerek açılır. Seçilen kart parıltıyla yerine uçar, öbürleri küçülerek kavanoza girer.
- **Yeni tat:** Kap dolaba kayar. Kino kepçeyle tadar: önce şaşkın yüz, sonra keyif.
- **Bıdık külah yer:** üç ısırık, her ısırıkta külah kısalır (alttan kırpma maskesi), "kıtır" sesi.
- **Zıpzıp önce:** yana zıplayıp pencerenin önüne geçer. Öbür müşteri şaşkın yüzle geri çekilir.

---

## 12. Gemini istemleri

**Kayıt:** `ekip/gemini/yeni/kino-otobus/<dosya>.png` (≥ 2048 px). **Yüklenecekler:**
- stil: `ekip/stil/onayli-stil-oda.png`
- karakter stili: `ekip/film/seri-2/karakter/v4/aile-model.png`

**Kontrol:**
- `onayli-stil-ozet.jpg` ile yan yana konur.
- Doku, tüy çizgisi, parlama, degrade ya da yazı varsa kullanılmaz.

### G-OT1 · `musteri-yeni-sayfasi.png` (MVP, tek sayfa, 16:9, 2 × 3) · ZORUNLU
> CHARACTER LINEUP SHEET. Six new side characters for the same preschool cartoon world as the attached family model sheet, drawn in exactly the same style, same outline weight and same head-to-body proportions, all at the SAME SIZE SCALE relative to each other (relative heights: the little goat Bidik 1.25, the baby goat Bidicik sitting in a wagon 0.8, the father goat 2.2, the bear cub Tombi 1.45, the lamb Bulut 1.25, the bunny Zipzip 1.25 without ears; the tallest character fills about 80% of its tile height), all standing on the same invisible baseline, front view, facing the viewer, arms relaxed and slightly away from the body, gentle happy smile, eyes open. Two rows by three columns, six tiles, even white space between tiles, nothing touching, no tile borders.
> Tile 1, Bidik: a 5-year-old boy goat kid, light ash-grey fur drawn as flat color, cream belly and muzzle, two tiny horn buds, a small chin tuft, one front tooth showing, round cartoon eyes (no goat pupils), sky-blue overalls with one strap fallen off the shoulder.
> Tile 2, Bidicik: his 1.5-year-old baby sister goat, same grey but rounder and chubbier, no horns, a tiny yellow ribbon on her head, lemon-yellow overalls, huge eyes, sitting inside a small orange pull-wagon with a long handle (only the wagon, no other objects).
> Tile 3, Bidik's father: a friendly adult goat, same grey, longer chin beard, two short curved horns, a soft round belly, a green knitted vest over a white shirt.
> Tile 4, Tombi: a chubby 6-year-old bear cub, honey-brown, round ears, a big round tummy, red shorts with one bulging pocket.
> Tile 5, Bulut: a shy 5-year-old lamb, charcoal-black face, ears and legs, a puffy pure-white wool body drawn as simple scalloped flat shapes, a small blue scarf, looking a little shy.
> Tile 6, Zipzip: an energetic 5-year-old girl bunny, sandy-beige fur, very long upright ears, a pink t-shirt with a small star, one foot lifted as if about to hop.
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm pastel color fills, at most one soft hard-edged shade tone per color, only one or two tiny white highlights in the eyes. Simple rounded shapes, cute baby proportions. No texture, no fur strands, no grain, no gradients, no glow, no shine, no painterly look, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

Kesim: `kes.mjs` (Gemini üretici) ya da `gemini-esya.cjs --esit --esit-hiza alt` → `assets/kino-otobus/musteri/<ad>.webp` (bidik, bidicik, bidik-baba, tombi, bulut, zipzip). Bu sayfa Seri 2'nin **model kartı** olarak da kullanılır (`ekip/film/seri-2/karakter/`'e kopya).

### Faz 2 (1 günlük işin dışında; Gemini kotasına göre sonraki günler): hareket sayfaları

Her yeni müşteri için 1 sayfa çizilir. Kino'nun ailesi istenirse aynı kalıpla çizilir. Dosya adı `<ad>-hareket-sayfasi.png` (16:9, 2 × 4). Yükle: stil + G-OT1'den o karakterin kesimi. Başa SAYFA kuralı, sona S-DÜZ eklenir (`ekip/OYUN-GELISTIRME-3GUN.md` §2).
> Of exactly this same character: {G-OT1'deki tarif}. Two rows by four columns, eight tiles, front view. Tile 1: standing calm and happy (main idle pose). Tile 2: exactly the same as tile 1, only the eyes gently closed. Tile 3: thinking, one hand under the chin, looking up and to the side. Tile 4: excited, both hands on the cheeks, mouth open. Tile 5: eyes closed in bliss, licking the air with the tongue out (no ice cream drawn). Tile 6: sour face, lips puckered, eyes squeezed, ears or horns stiff. Tile 7: overjoyed, both arms up, small hop. Tile 8: waving goodbye with one hand.

Sıra: Tombi, Bıdık, Zıpzıp, Bulut, Bıdık'ın babası, Bıdıcık. Gelen sayfa `kes.mjs` ile kesilir. Müşteri sınıfı durağan resmi poz yuvasına (`PozYuvasi` mantığı) geçirir, kodda başka değişiklik gerekmez.

---

## 13. Telefon yerleşimi (önce 844 × 390 ve 390 × 844, DPR 3)

**Yatay 844 × 390 (bugünkü düzene ekler):**
```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ [geri]   [Gün 1]                               [korna*] [ses]            │ 48
 ├──────────────────────────────────────────────────────────────────────────┤
 │  PENCERE: müşteri A [balon]   müşteri B [balon]   ampul/flama* tepede     │
 │                 Kino (tezgâhın arkası)                   │ SOS │ SÜS │★süs│
 ├──────────────────────────────────────────────────────────────────────────┤
 │ [raf ▯▯▯] │ ◖çilek◗ ◖vanilya◗ ◖çikolata◗ │★özel│ [YUVA A] [YUVA B] │kumbara│
 │ [KÜLAH]   │ ◖limon◗ ◖fıstık◗ ◖y.mersini◗ │ tat │ ●●● jeton sırası  │ ▤▤▤   │
 │ [KÂSE]    │                              │     │                    │makine │
 └──────────────────────────────────────────────────────────────────────────┘
```
- Külah rafı külah düğmesinin hemen üstündedir: 3 yuva, her biri en az 30 px. Dokunma alanı düğmeyle birdir.
- **Özel tat yuvası** dolabın sağındadır, iki sıra boyunda tek kaptır (≥ 84 × 150). Gün 1'de dolap tek sıra olur ve özel yuva yanına gelir.
- **Özel süs yuvası** süs rafının son hücresidir (≥ 64 px). Raf küçülmez.
- **Jeton sırası** yuvanın önündeki tezgâh çizgisindedir. Jetonlar 40 px, aralarında 6 px boşluk var. Sıranın tamamı tek dokunma kutusudur (≥ 88 × 72).
- **5-6 rakam balonları** kumbaranın solunda dikey 3'lü durur: her biri 72 px, yuvaları örtmez.

**Dikey 390 × 844:**
- Üstte pencere (iki müşteri yan yana).
- Ortada Kino ve iki yuva; jeton sırası yuvaların altında.
- Altta dolap 2 × 3 ve özel tat (dolabın altında tam en, 72 px yüksek şerit).
- En altta kaplar, külah rafı, sos, süs ve özel süs: iki sıra, yatay kaydırma yok.
- Kumbara sağ alt köşededir, makine onun üstündedir.

**Ödül ekranı:**
- Yatay: otobüs solda %42, sağda 3 kart yan yana (her biri ~150 × 190, aralık 12 px). Kumbara kartların üstünde ortadadır.
- Dikey: otobüs üstte %38, kumbara ortada, 3 kart bir sırada (her biri ~112 × 150).
- Tamam düğmesi sağ alttadır (88 px).
- Çentik tarafına düğme konmaz; `env(safe-area-inset-*)` + 16 px pay.

**Tablet:** aynı düzen orantılı büyür (var olan sınırlar).

---

## 14. Kodcunun dokunacağı dosyalar

| Dosya | Ne |
|---|---|
| `kino-otobus/src/model.ts` | `IstekTuru`'na `ipucu` ve `surpriz` (ipucu: `serin`, `pembe`, `kocaman`, `cikolata`, `ikiRenk`, `meyveli`, `yeni`). `gunPlani(gun, yas, tohum, acilan)` sabit listeden **şablon + havuz** olur. `MUSTERILER` tablosu (sevdiği, sevmediği, kaynak, ses). `tepkiHesapla(sip, dondurma, musteri)` → `bayildi`, `mmm` ya da `komik`. `odeme(dondurma, tepki, yas)` → jeton sayısı. `farklar` resimli istekte aynen kalır. `sayim`, `OTOBUS_SUSLERI`, `dukkan`, `satinAl`, `JETON` gider. Yerine `ODUL_KATALOGU` (tat, süs, görünüm sırası) ve `gunOdulleri(acilan)` → 3 kart gelir. `Tat`'a `visne`, `portakal` ve `pamukseker` eklenir (renk tablosu). `Sus`'a `yildiz`, `muz` ve `cikolataParca` eklenir. |
| `kino-otobus/src/el-isi.ts` | `KULAH_STOK = { bas: 2, dolu: 3, enAz: 0 }`, `kulahKullan` 0'a iner, `kulahVarMi`. |
| `kino-otobus/src/gun.ts` | Boş külah durumu ve külahsız külah isteği (kâse de verilebilir). İpucu merdiveni (12, 20, 30, 40 sn). `okuma()` yalnız ilk 2 resimli müşteride. Jeton sırası ve sayım. 5-6 "kaç jeton" balonları. Kumbara dolum maskesi. Gün sonu kumbara → `app.git('odul')`. Yakın çekim kodu kalkar. Özel tat ve özel süs yuvaları. Gizli sürprizler §8. |
| `kino-otobus/src/ekranlar.ts` | `aksamEkrani` → `odulEkrani` (3 kart, ön izleme, seçim, uçuş). Sayım ve dükkân kodu silinir. |
| `kino-otobus/src/musteri.ts` | Havuzdan müşteri kurma: iskelet (var), kit (`kit-musteri.ts`), durağan (`assets/kino-otobus/musteri/*.webp`, Nehir). Tepki gag'ları. Bakış ipucu (`bak(hedefEl)`). |
| `kino-otobus/src/kit-musteri.ts` (yeni) | Kino'nun ailesi: `film/src/kukla.ts` ile dinlenme duruşu (eklem 0), ağız/göz seti değişimi, nefes, hop. |
| `kino-otobus/src/kayit.ts` | `acilan: { tat: string[]; sus: string[]; gorunum: string[] }`, `gorulen: string[]` (son müşteriler), `ozelTat`. Eski `jeton` ve `alinan` okunur: alınanlar `gorunum`'a geçer, jeton bırakılır. |
| `kino-otobus/src/varliklar.ts` | `top-visne`, `top-portakal`, `top-pamukseker` (+ `kap-*`), pasta süsleri, yeni müşteri resimleri. Yoksa sade yer tutucu kullanılır ve o müşteri havuzdan düşer. |
| `content/kino-otobus.json` | `mino.durum.*`, `odeme`, `odul`, `kino.*` yenileri, `musteri.<ad>.{istek,bayildi,komik}`. `dokun` ve `bana_ver` silinir. |
| `src/audio/cumleler.ts` | Müşteri cümleleri kendi sesleriyle toplanır (Kino'nun `KINO_SESI` yolu gibi). CI'da `sesler.json`'daki voice_id ve `eleven_v4`. |
| `src/karakter/boy.ts` | §6 boy satırları (`CIZIM` ölçüleri kesimden sonra). |
| `src/engine/erisim.ts` | `kino-otobus/odul` (ilk ödül her kategoride ücretsiz). |
| `ekip/illustrator/kino-otobus-tat-boya.cjs` (yeni) | `top-*` ve `kap-*`'tan Lab ton kaydırmayla vişne, portakal, pamuk şeker; `guvenli-yaz.cjs` ile. |
| `tests/unit/kino-otobus.test.ts` | Plan şablon ve havuzu (aynı gün tekrar yok, Bıdıcık ile Bıdık birlikte), ipucu kabul kuralları, tepki kademeleri, ödeme sınırları (3/5), ödül sırası, kayıt göçü. |
| `tests/e2e/kino-otobus.spec.ts` | Aşağıdaki "bitti" senaryoları, 844 × 390 ve 390 × 844. |

---

## 15. Bitti ölçütü

1. **Külah:** Gün 1'de 3. külah isteğinde raf boştur. Kâse verilince müşteri "farklı" tepkisiyle yer. Makineyle 3 külah yapılınca raf dolar. Hiçbir an kilitlenmez.
2. **Sayma:** Her ödeme 3-4 yaşta en çok 3, 5-6 yaşta en çok 5 jetondur. Akşam sayımı hiç yoktur. Bir günün bütün ödemeleri toplam ≤ 20 sn dokunuştur.
3. **Ödül:** Gün sonunda 3 kart çıkar, biri seçilir, ertesi gün o tat ya da süs tezgâhta durur ve 1 müşteri onu ister. Görünüm otobüste ve oyunda görünür.
4. **Seçenek:**
   - Hiçbir yerde "dokun" ya da "ver" diye yönlendiren söz yoktur (`content/kino-otobus.json`'da test).
   - Parlama 30 sn'den önce çıkmaz.
   - İpuçlu ve sürpriz isteklerde en az 2 farklı dondurma kabul edilir (birim testi).
5. **Müşteri:** Arka arkaya 3 Gün 1 oyununda en az 12 farklı müşteri görülür. Bir günde aynı müşteri iki kez gelmez. G-OT1 kesimleri gelmeden de oyun çalışır (havuz 20).
6. **Zoom yok:** Hiçbir müşteri, Kino ya da eşya kaynak piksel boyunun üstünde çizilmez (e2e: `naturalWidth` ≥ ekrandaki genişlik × DPR).
7. **Gizli sürprizler:** §8'deki 9 sürprizin her biri e2e'de bir kez tetiklenir, konsol hatası yoktur.
8. Testler geçer: `npm run build`, `npm test`, `npm run e2e -- kino-otobus`. 844 × 390, 932 × 430, 667 × 375 ve 390 × 844 (DPR 3) ekran görüntüleri gerçek hızda kare kare izlenir. `ORTAK_NOTLAR.md`'ye satır eklenir.

**1 günlük iş sırası:**
1. Model (plan, tepki, ödeme, ödül) ve testleri.
2. Külah.
3. Jeton sırası.
4. Ödül ekranı.
5. Müşteri havuzu (iskelet ve durağan; kit ailesi en son).
6. İpucu merdiveni ve sözler.
7. Sürprizler.
8. e2e.

Müşteri sesleri ve Faz 2 hareket sayfaları bu güne girmez.
