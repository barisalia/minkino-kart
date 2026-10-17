# Mino Ne Giysin? · Yardımcı Mino

> Durum: TASLAK (2026-10-16, senarist). Barış görüp "tamam" deyince kodcuya gider.
> Barış'ın isteği: "Kino ne giysin bölümünü Mino ile de bir şey yapın, o da ayrı oyun olsun, 2 oyun bir sette."
> Temel kural (Barış, 2026-10-16):
> - Her adımda en az 3 anlamlı seçenek olsun; tek doğru şart değil.
> - Yanlış seçim komik olsun, ceza olmasın.
> - Anlatıcı "şuna dokun" demesin.
> - İpucu geç gelsin, dolaylı olsun.
> - Gizli sürprizler olsun.
> - Parça döndürme yok, görsel büyütme (zoom) yok.

---

## 0. Tek cümle ve kardeş oyundan farkı

**Tek cümle:** Mahallede dört arkadaşın başı dertte. Mino kostüm dolabından bir şapka, bir giysi ve bir alet seçip doktor, itfaiyeci, aşçı ya da bahçıvan olur. Çocuğun seçtiği aletle derde çare arar. Olmazsa komik bir şey olur ve başka bir şey denenir. Her derdin **iki ayrı çözümü** vardır.

| | Kino Ne Giysin? (var) | Mino Ne Giysin? (bu) |
|---|---|---|
| Soru | "Hava nasıl? Ne giymeli?" | "Kimin başı dertte? Kim olursam yardım ederim?" |
| Çekirdek döngü | pencereden havayı oku → giysiyi vücudun doğru yerine sürükle → giyinme sırası → dışarı çık → sonucunu yaşa → fotoğraf, albüm | dert seç → kostüm seç (karışık olabilir) → aletle dene → komik başarısızlık ya da çözüm → başka yolu keşfet → arkadaş odaya gelir → kostüm partisi |
| Doğru-yanlış | havaya uyan giysi doğru | her dertte 2 çözüm, 2 komik başarısızlık; kostüm tamamen serbest |
| El hareketi | sürükle, yerine oturt | fırlat ve yakala (Mino havada kapar); her çözümde ayrı bir el hareketi: uzat, tıngırdat, dinle, karıştır, uçur, sula, taşı |
| Öğrettiği | hava, mevsim, giyinme sırası | meslekler ve aletleri, sorun çözme, deneme-yanılma, yardımlaşma |

Bu oyunda bölge eşleme, giyinme sırası ve hava okuma yok. Giysi Mino'nun neresine atılırsa atılsın kendi yerine oturur.

---

## 1. Dünya, karakterler ve varlıklar (yeni çizim en aza iner)

**Mino:** `src/mino/mino.ts`. Kostüm katmanları vektör çizimin içine `<image>` olarak girer (§12, `kostum()`):
- şapka → `.k` (kafa) grubunun sonuna,
- üst giysi → `.g` (gövde) grubunun içine, fuların altına (fular görünür kalır),
- alet → `.kr` (sağ kol) grubunun sonuna.

Kollar dönmez. Alet tutulurken `poz()` ve `otur()` kullanılmaz; hareket `ifade()`, `tepki()` ve bütün gövde hareketiyle yapılır.

**Dertteki 4 arkadaş** (hepsi var):

| Dert | Arkadaş | Kaynak | Yer (arka plan, var) | Eşyalar (var) |
|---|---|---|---|---|
| D1 · **Pamuk ağaçta kaldı** | Pamuk | iskelet + **G-MG2** hareket sayfası | `assets/film/park/arka-uzak`, `arka-orta` (soldaki ağaç), `arka-on` | `assets/pati/esya-mama-kabi-dolu` |
| D2 · **Kino hapşırıyor** | Kino | iskelet (hapşu tepkisi var, Giysin) | `assets/giysin/oda-yatay` / `oda-dikey` | `assets/kino-otobus/kase` (ıhlamur kâsesi) |
| D3 · **Bebek Ege acıktı** | Ege | iskelet (oturan) | `assets/film/mutfak/arka-uzak`, `arka-orta` (ocakta tencere) | `assets/film/esya/mama-sandalyesi`, üst rafta `assets/pasta/kavanoz-cikolata-1`, ödül `assets/pasta/kurabiye-yuvarlak-altin` |
| D4 · **Ada'nın çiçekleri boynunu büktü** | Ada | iskelet | `assets/film/park/arka-uzak`, `arka-on` | `assets/film/esya/cicek` ×3, `assets/film/esya/mantar`, `assets/film/esya/kova` |

**Mino'nun odası:**
- Zemin `assets/giysin/oda-yatay` / `oda-dikey`; set duygusu Kino'nunkiyle aynı evden gelir.
- Gözlü dolap: `assets/giysin/dolap-acik-goz`, 8 göz.
- Alet sepeti: `assets/giysin/esya-sepet`.
- Ayna: `assets/giysin/ayna`.
- Kapı: `assets/giysin/kapi-cerceve`, `kapi-kanat`.

**Yeni çizim:** yalnız G-MG1 (12 kostüm parçası) ve G-MG2 (Pamuk'un 8 pozu).

---

## 2. Bir oturum (~5 dk)

1. **Açılış (5 sn):** Mino odada dolabın önünde kuyruğunu sallar. Pencerede dört **yardım balonu** belirir, her biri arkadaşın yüzü ve derdinin küçük resmidir:
   - Pamuk ağaç dalında.
   - Kino'nun burnunda mendil.
   - Ege boş kâseyle.
   - Ada solmuş çiçekle.

   Arkadaşların sesleri tek tek duyulur: Pamuk "miyav", Kino "hapşu", Ege "mama", Ada'nın iç çekişi. Mino: "[gasps] Herkesin başı dertte!"
   - **Seçenek:** Hangi arkadaşa önce gidileceğini çocuk seçer (4 balon). Seçilen balon Mino'nun düşünce balonuna geçer.
2. **Kostüm (20-40 sn):** Dolabın 8 gözünde 4 şapka ve 4 üst giysi durur, sepette 4 alet (§3).
3. **Kapı:** Mino'nun elinde alet varsa kapıya dokununca Mino koşarak çıkar. Alet yoksa Mino boş patilerine bakar: "[giggles] Ellerim bomboş!" Bu ipucu bile değildir, bir şakadır.
4. **Dert sahnesi (15-40 sn):** Mino aletiyle dener (§4):
   - **Çözüm:** çocuğun yaptığı kısa bir el hareketi, sonra arkadaşın sevinci.
   - **Komik başarısızlık:** 2-3 sn'lik gag. Mino güler: "[giggles] Olmadı! Başka ne olur?" Sahnenin köşesinde alet sepeti belirir. Çocuk başka bir alet seçer; Mino eldekini sepete fırlatır ve yenisini kapar. Odaya dönmek gerekmez.
5. **Teşekkür (4 sn):** Arkadaş Mino'ya sarılır ya da el sallar. Mino: "[happy] Ne demek!" Arkadaş odaya gelir ve duvarın önündeki minderlere oturur. Seyirci her dertte bir kişi büyür.
6. **Kalan dertler:** Mino odaya döner. Pencerede kalan balonlar durur. Kostüm durur; değiştirmek de serbesttir.
7. **Kostüm Partisi (final, 30-60 sn):** Dört arkadaş odadadır. Dolap ve sepet tamamen serbesttir; yanlış diye bir şey yoktur.
   - Çocuk Mino'yu dilediği karışımla giydirir. Mino her yeni parçada aynada poz verir, arkadaşlar alkışlar.
   - Bitir düğmesine basınca Mino halının üstünde küçük bir geçit yapar: soldan sağa yürür, döner, eğilir. Arkadaşlar "Yaşasın!" der.

**Çözüm yıldızları:** Dolabın kapağında 8 küçük boş yıldız vardır (4 dert × 2 çözüm). Bulunan her çözüm yıldızı doldurur, yıldızda o çözümün minik resmi olur. Bu, oyunu yeniden oynamaya davettir: "İkinci yolu bulabilir miyim?" Puan yoktur, kilit yoktur.

---

## 3. Kostüm: fırlat, yakala, beğenmezse fırlatır

**Dolap ve sepet (12 parça, G-MG1):**

| Rol | Şapka | Üst | Alet |
|---|---|---|---|
| Doktor | aynalı doktor bandı | kısa beyaz önlük (kolsuz, kalp cepli) | stetoskop |
| İtfaiyeci | kırmızı kask | kırmızı-sarı yelek (yansıtıcı şeritli) | kırmızı merdiven |
| Aşçı | kabarık aşçı şapkası | kırmızı-beyaz kareli önlük | büyük tahta kaşık |
| Bahçıvan | çiçekli hasır şapka | mavi askılı tulum | yeşil sulama kabı |

- **Fırlatma:** Çocuk parçayı dolaptan Mino'ya doğru sürükleyip bırakır (fırlatma hızı yeterse havada uçar) ya da parçaya dokunur.
  - Parça yay çizerek Mino'ya uçar.
  - Mino hafifçe zıplar ve **yakalar**: ezilme-esneme, "hop".
  - Küçük bir "pof" bulutu (kod efekti, 0.25 sn) değişimi örter ve parça yerindedir.
  - Parça Mino'nun neresine bırakılırsa bırakılsın kendi yerine oturur. Bölge eşleme yoktur.
- **Beğenmezse fırlatır** (Mino'nun kendi kişiliği):
  1. **Aynı yere ikinci parça:** Mino şapkalıyken yeni şapka gelirse eskisini kafasından çekip omzunun üstünden geriye fırlatır, sonra yenisini takar. Eski şapka nereye düşer?
     - Çoğunlukla dolaptaki gözüne geri.
     - %25 olasılıkla odadaki bir arkadaşın kafasına (finalde, ya da arkadaş odadaysa): Kino'nun kafasında aşçı şapkası. Arkadaş gülüp şapkayı dolaba geri atar.
  2. **Islak şaka (Mino sudan hoşlanmaz):** Sulama kabı Mino'ya ilk kez fırlatılınca kabın ağzından bir damla Mino'nun burnuna sıçrar. Mino irkilir ("[gasps] Iyy, su!") ve kabı bir an tutup geri fırlatmaya kalkar. Sonra vazgeçer, güler: "[giggles] Tamam, tamam." Kap elinde kalır. Bu tepki her oturumda yalnız bir kez olur.
- **Tam takım:**
  - Üç parçası aynı rolden olursa Mino aynaya döner ve rolünü söyler, örnek "[excited] İtfaiyeci Mino!". Aynada küçük parıltı çıkar. Dert sahnesinde o rolün çözümüne küçük bir süs eklenir (§4, "tam takım" sütunu).
  - Karışık takım da serbesttir. Mino aynaya bakıp güler: "[laughs] Karışık Mino!" (3 değişik kayıt). Karışık takımda da her çözüm çalışır. Çözüm mü başarısızlık mı, onu **alet** belirler; **kostüm** ise sonucun nasıl geçtiğini belirler (§4a "Kostüm etkisi").
- **Seçenek sayısı:** Her adımda 4 şapka, 4 üst ve 4 alet vardır. Dert sırası 4 balondur. Her dertte 4 alet denenebilir. En az 3 seçenek kuralı her yerde tutar.

---

## 4. Dert × alet tablosu (16 sonuç: 8 çözüm, 8 komik başarısızlık)

Komik başarısızlıkların çoğu **dolaylı ipucu** taşır: arkadaşın bakışı, bir ses, Mino'nun yorumu. Hiçbiri "şunu dene" demez.

### D1 · Pamuk ağaçta kaldı (park)
| Alet | Ne olur | Çocuğun el hareketi | Tam takım süsü |
|---|---|---|---|
| **Merdiven ✓** | Merdiven ağaca dayanır ve yukarı doğru **uzar** (alttan yukarı açılan kırpma maskesi; resim büyütülmez). Mino basamak basamak çıkar. Pamuk Mino'nun kollarına atlar (G-MG2 karo 7). İkisi aşağı iner. | Merdiveni ağaca sürükle. 5-6: üç basamağa sırayla dokun, Mino sayar: "Bir, iki, üç!" | kask şeridi parlar, "vuu vuu" |
| **Tahta kaşık ✓** | Mino mama kabını ağacın dibine koyar, kaşıkla kaba vurur: "tın tın". Pamuk burnunu kaldırıp koklar (karo 5), gövdeden kayarak iner (karo 6) ve mamaya dalar. | Kaşıkla kaba 3 kez dokun ("tın tın tın"). | aşçı şapkası kabarır |
| Sulama kabı ✗ | Su yukarı sıçrar, Pamuk ıslanır (karo 4) ve bir dal **daha yukarı** tırmanır. Mino: "[gasps] Eyvah, daha yukarı!" Pamuk sonra eve doğru burnunu kaldırıp koklar. Bu dolaylı bir ipucudur: yemek. | (dokun) | yok |
| Stetoskop ✗ | Mino ağacın gövdesini dinler: "güm güm" yerine "tak tak tak". Gövdedeki kovuktan bir ağaçkakan başını çıkarıp kaçar. Pamuk korkup dala sarılır (karo 3). Mino: "[giggles] Ağaç çok sağlıklı!" | (dokun) | yok |

### D2 · Kino hapşırıyor (Kino'nun odası)
| Alet | Ne olur | El hareketi | Tam takım |
|---|---|---|---|
| **Stetoskop ✓** | Mino Kino'nun göğsünü dinler. Üç kalp halkası çıkar: "güm güm güm". Mino: "[softly] Biraz dinlen, bol su iç." Kino esneyip minderine kıvrılır, gülümser. | Stetoskobu Kino'nun göğsüne sürükle. 5-6: sonra "Kaç güm?" sorusuna 3 rakam balonu (2, 3, 4). Yanlışta kalp bir daha atar ve sayılır. | aynalı bant parlar |
| **Tahta kaşık ✓** | Masada buğusu tüten ıhlamur kâsesi durur. Mino kaşığı Kino'nun ağzına götürür. Kino: "[happy] Mmm, sıcacık!" Hapşırık geçer, kulakları dikilir. | Kaşığı kâseden Kino'nun ağzına sürükle. 5-6: 3 kaşık. | aşçı şapkası kabarır |
| Sulama kabı ✗ | Bir damla Kino'nun burnuna düşer. Kino dev bir **hapşırık** yapar. Mino'nun şapkası uçar ve Kino'nun kafasına konar. Mino ile Kino gülüşür. Kino eliyle göğsünü tutup "öhö öhö" der: dolaylı ipucu. | (dokun) | yok |
| Merdiven ✗ | Mino merdivene çıkıp Kino'nun alnına bakar: "[curious] Ateşin var mı?" Kino hapşırınca merdiven sallanır, Mino zıplayarak iner. | (dokun) | yok |

### D3 · Bebek Ege acıktı (mutfak)
| Alet | Ne olur | El hareketi | Tam takım |
|---|---|---|---|
| **Tahta kaşık ✓** | Mino ocaktaki tencereyi karıştırır, buhar çıkar. Kaşık "vınnn" diye uçak olur ve Ege'nin ağzına gider. Ege: "Ham!" Ağzı şişer, kıkırdar. | Tencerenin üstünde daire çizerek karıştır (yolun ~%70'i). Sonra kaşığı Ege'nin ağzına sürükle. 5-6: 3 kaşık, Mino sayar. | aşçı şapkası kabarır |
| **Merdiven ✓** | Merdiven üst rafa dayanır, Mino çıkar ve kavanozdan bir kurabiye alır. Ege kurabiyeyi iki eliyle tutup kemirir. | Merdiveni rafa sürükle, sonra kavanoza dokun. | kask şeridi parlar |
| Stetoskop ✗ | Mino Ege'nin karnını dinler: "gurul gurul!" Ege kıkırdar. Mino: "[giggles] Karnı konuşuyor!" (Karnı aç; dolaylı ipucu.) | (dokun) | yok |
| Sulama kabı ✗ | Ege kabı oyuncak sanır, kapıp mama sandalyesinden etrafa su serper ve güler. Mino ıslanır, irkilir: "[gasps] Iyy!" Ege yine de "[whimpers] Mama!" der. | (dokun) | yok |

### D4 · Ada'nın çiçekleri boynunu büktü (bahçe)
| Alet | Ne olur | El hareketi | Tam takım |
|---|---|---|---|
| **Sulama kabı ✓** | Kabın ağzından damlalar düşer. Çiçek önce ezilip sonra yaylanarak dikilir: yalnız scaleY 0.6 → 1.08 → 1, kaynak boyunun üstüne çıkmaz. Ada alkışlar. | Kabı her çiçeğin üstünde 1 sn tut. 3-4: 2 çiçek. 5-6: 3 çiçek ve bir mantar (gizli sürpriz §6). | hasır şapkadaki çiçek "pıt" diye açar (ayrı katman) |
| **Tahta kaşık ✓** | Mino kovadan kaşıkla su taşır ve her çiçeğe bir kaşık döker. Çok yavaş ve komik: Mino her seferinde dili dışarıda koşar. Çiçekler dikilir. | Kaşığı kovadan çiçeğe sürükle, her çiçek için bir kez. | aşçı şapkası kabarır |
| Stetoskop ✗ | Mino çiçeği dinler: sessizlik, sonra minik bir "hıh". Mino: "[whispers] Çiçek susamış galiba…" (dolaylı ipucu) | (dokun) | yok |
| Merdiven ✗ | Mino merdivenin tepesinden güneşe bakar, gözlerini kısar: "[sighs] Güneş çok yakıyor!" Ada da terler. Dolaylı ipucu: su. | (dokun) | yok |

**Başarısızlıktan sonra:**
- Sahnede sepet açılır, denenen alet sepette kalır (soluk değil, yine seçilebilir).
- 12 sn dokunulmazsa arkadaş çözüm aletlerinden birine bakar (göz kayması).
- 25 sn: Mino durumu bir kez daha anlatır.
- 35 sn: sepetteki çözüm aletlerinden biri hafifçe sallanır.
- Parmak ipucu en son, 45 sn'de gelir.

**İkinci çözüm (yalnız 5-6):** Dert çözülünce Mino göz kırpar: "[curious] Başka yolu var mı acaba?" Arkadaş dertli hâline döner (geri sar), çocuk isterse dener. İstemezse kapıya dokunarak geçer. 3-4'te bu soru yoktur; yıldız yine dolar.

---

## 4a. Kostüm etkisi (kalite denetimi K7, 2026-10-17)

Kostüm artık sonucu etkiler. Ceza yoktur, her sonuç eğlencelidir. Amaç, çocuğun "itfaiyeci olursam daha iyi kurtarıyorum" diye fark etmesidir.

**Kostümün rolü:** Şapka ve üst giysi aynı rolden ise kostüm o roldür. Yalnız şapka, yalnız üst, hiç kostüm ya da karışık şapka-üst "karışık" sayılır. Aleti sonuç tablosu ayrıca değerlendirir.

**Derde uygun roller** (§4'teki çözüm aletlerinden):

| Dert | Uygun kostüm |
|---|---|
| D1 Pamuk ağaçta | itfaiyeci (merdiven), aşçı (kaşık) |
| D2 Kino hapşırıyor | doktor (stetoskop), aşçı (kaşık) |
| D3 Ege acıktı | aşçı (kaşık), itfaiyeci (merdiven) |
| D4 Ada'nın çiçekleri | bahçıvan (sulama kabı), aşçı (kaşık) |

**Üç durum:**

| Kostüm + alet | Ne olur |
|---|---|
| Aletin rolünden kostüm + çözüm aleti (itfaiyeci + merdiven) | **Tam başarı.** Rol süsü (§4 son sütun), konfeti, alkış, Mino rolünü söyler ("[excited] İtfaiyeci Mino!", var olan kayıt). Yıldız rozeti büyük ve altın. Dolaptaki yıldız **parlar** ve parlak kalır (kayıt: `tam`). |
| Başka rol, karışık ya da kostümsüz + çözüm aleti | **Yine başarı**, yıldız dolar (parlamaz). Çözümün ortasında komik bir **ek an** olur (aşağıdaki tablo). |
| Derde uygun kostüm + yanlış alet | §4'teki komik başarısızlık, sonra **kostüme özel şaka**. Kostüm kendi işini yapmaya kalkar, olmaz. Sonra sepetteki kendi aleti iki kez zıplar, Mino o yana bakar. |
| Uygun olmayan / karışık kostüm + yanlış alet | Yalnız §4'teki komik başarısızlık. |

**Ek anlar (yanlış ya da karışık kostüm + doğru alet):**

| Dert · alet | Ek an | Mino |
|---|---|---|
| D1 · merdiven (şapka var) | Merdivenin tepesinde şapka dala takılır, sallanır. Pamuk şapkanın içine atlar, yalnız başı görünür. Şapka Pamuk'la birlikte yere süzülür, "pof". Mino iner, Pamuk şapkadan zıplar, şapka Mino'nun başına uçar. | "[giggles] Şapkam sepet oldu!" |
| D1 · merdiven (şapka yok) | Pamuk Mino'nun kafasına atlar. Mino ezilir, sersemler. Pamuk yere atlar, Mino iner. | "[giggles] Kafam minder oldu!" |
| D1 · kaşık | Pamuk kayıp mamaya değil Mino'nun kafasına iner. Şapka varsa yassılır. Pamuk sonra mamaya atlar. | "[laughs] Mama aşağıda, Pamuk!" |
| D2 · stetoskop (şapka var) | Şapka Mino'nun gözlerinin üstüne kayar. Mino zıplar, şapka yerine sıçrar, sonra dinler. | "[giggles] Göremiyorum!" |
| D2 · stetoskop (şapka yok) | Kino gıdıklanır, kıkırdar, titrer. | "[giggles] Gıdıklanıyor musun?" |
| D2 · kaşık | İlk kaşıktan sonra Kino "üfff" der, buhar Mino'nun yüzüne gelir. Şapka havalanıp geri konar. | "[gasps] Çok sıcakmış!" |
| D3 · kaşık | Tencere kaynayınca bir damla Mino'nun burnuna sıçrar (küçük turuncu leke). | "[gasps] Burnuma sıçradı!" |
| D3 · merdiven | Kasksız Mino merdivenin tepesinde sağa sola sallanır. | "[giggles] Sallanıyorum!" |
| D4 · sulama kabı | İlk çiçekten sonra bir damla Mino'nun başına düşer. Mino ıslanır (sudan hoşlanmaz). | "[gasps] Iyy, su!" (var olan kayıt) |
| D4 · kaşık | İlk taşımada Mino ıslak çimde kayar, ezilip esner, kaşıktaki su yüzüne sıçrar. | "[giggles] Hop, kaydım!" |

**Kostüm şakaları (derde uygun kostüm + yanlış alet):**

| Kostüm | Şaka | Mino | Sepette zıplayan |
|---|---|---|---|
| Doktor | Alın aynası güneşi Mino'nun gözüne yansıtır, parıltı; Mino gözlerini kırpıştırır. | "[giggles] Ayna gözümü aldı!" | stetoskop |
| İtfaiyeci | Kask kendiliğinden öter ("vuu vuu", kırmızı-mavi ışık); Mino irkilip zıplar. | "[giggles] Kaskım heyecanlandı!" | merdiven |
| Aşçı | Karın guruldar, aşçı şapkası kabarıp "pöf" diye söner. | "[giggles] Şapkam acıktı!" | kaşık |
| Bahçıvan | Hasır şapkadaki çiçek boynunu büker. | "[sighs] Şapkamın çiçeği soldu!" | sulama kabı |

Kurallar: parça döndürme yok, poz değişimi ve ezilme-esneme; büyütme yok. Söz kısa, "dokun" demez. Yeni sözler `content/mino-giysin.json` → `mino.kostum_ek`, `mino.kostum_saka` (CI seslendirir). Kod: `model.ts` → `kostumEtkisi`, `dert.ts` (tam sevinç, şaka), `sahneler.ts` (ek anlar).

**Dikey ekran (390 × 844):** Odada duvarın boş üst yarısında, balonlarla Mino arasında perdeli pencere durur, camda mahallenin yaz manzarası görünür (var olan `giysin/pencere`, `pencere-yaz-*`, `perde-sol/sag`). Dert sahnelerinde üst boşluk doldurulur: parkta sahnenin gök katmanı (aynalı, bulutlu), Kino'nun odasında duvar ve aynı perdeli pencere. Mutfak sahnesi üstten başlar; altındaki boşlukta evin dikey odasının ahşap zemini ve halısı durur (`film/ev/oda-dikey`, sahnenin alt kenarı ona karışır). Ada sahnesi dikeyde biraz küçüktür (ekranın %43'ü), Mino ile Ada birlikte sığar. Yatayda sahne Mino'nun ayağının altındaki boş zemin kadar aşağı kayar; sulama şakasında Pamuk en çok ekranın üst kenarına kadar tırmanır. Hepsi kaynak boyunda, büyütme yok.

---

## 5. Yaş farkı (3-4 / 5-6)

| | 3-4 | 5-6 |
|---|---|---|
| Derdin anlatımı | duygu ve yer: "[softly] Pamuk yukarıda kalmış, korkmuş…" | yalnız ses ve resim: "[gasps] Bu ses de ne?" ve Pamuk'un miyavı |
| Çözüm hareketi | tek hareket | sayılı: 3 basamak, 3 kaşık, 3 çiçek; "Kaç güm?" |
| İkinci çözüm daveti | yok | var |
| İpucu süreleri | 12 / 25 / 35 / 45 sn | 15 / 30 / 40 / 50 sn |
| Kostüm | aynı | aynı (tam takım bonusu aynı) |

---

## 6. Gizli sürprizler (hiçbiri ipucuyla gösterilmez)

1. **Sepete 3 hızlı dokunuş:** içinden banyo ördeği (`assets/banyo/ordek`) "vak" diye fırlar. Mino banyoyu hatırlayıp irkilir: "[gasps] Banyo yok!"
2. **Ayna:** dokununca Mino aynaya doğru poz verir, sonra kendine dil çıkarır (`ifade` + `tepki`).
3. **Mino'nun kuyruğu:** mırlar (`tepki('mir')`). Göbek gıdıklanır (`gidik`).
4. **Ağaçkakan** (D1, stetoskop): kovuktan çıkar. Ona bir kez daha dokunulursa "tak tak" ile kısa bir ritim çalar.
5. **Mantar** (D4, 5-6): sulanırsa yaylanarak dikilir ve kocaman bir "pof" ile spor bulutu çıkarır. Ada hapşırır.
6. **Ege:** ayağına dokununca gıdıklanır ve kahkaha atar.
7. **Uçan şapka:** başka parçalar fırlatılırken eski şapka %25 olasılıkla bir arkadaşın kafasına konar (§3).
8. **Partide üst üste 5 aynı parça:** Mino "[sighs] Yeter ama!" der ve parçayı tavana fırlatır. Parça lambaya takılır, bir sonraki dokunuşta düşer.

---

## 7. Replikler (kısa, etiketli; ≤ 30 karakter hedef)

**Mino (anlatıcı sesi; `content/mino-giysin.json` → `mino`):**

Açılış ve dert seçimi:
- "[gasps] Herkesin başı dertte!"
- "[curious] Önce kime gitsek?"

Dertler (3-4 ve 5-6 ayrı):
- D1: "[softly] Pamuk yukarıda kalmış…", "[gasps] Bu ses de ne?"
- D2: "[softly] Kino'nun burnu akıyor…", "[gasps] Hapşu mu o?"
- D3: "[softly] Ege'nin karnı acıkmış…", "[curious] Kim ağlıyor?"
- D4: "[sighs] Ada'nın çiçekleri solmuş…", "[curious] Çiçeklere ne oldu?"

Kostüm:
- tam takım: "[excited] Doktor Mino!", "[excited] İtfaiyeci Mino!", "[excited] Aşçı Mino!", "[excited] Bahçıvan Mino!"
- karışık: "[laughs] Karışık Mino!", "[giggles] Çok değişik oldum!", "[laughs] Bu da yeni moda!"
- parça değişimi: "[giggles] Bu gitsin!", "[giggles] Hop, yenisi!"
- su: "[gasps] Iyy, su!", "[giggles] Tamam, tamam."
- kapı (alet yok): "[giggles] Ellerim bomboş!"

Sahne:
- başarısız: "[giggles] Olmadı! Başka ne olur?", "[laughs] Hı-hı, bu değil!"
- yorum: "[giggles] Ağaç çok sağlıklı!", "[gasps] Eyvah, daha yukarı!", "[curious] Ateşin var mı?", "[giggles] Karnı konuşuyor!", "[whispers] Çiçek susamış galiba…", "[sighs] Güneş çok yakıyor!"
- çözüm: "[softly] Biraz dinlen, bol su iç."
- ikinci yol (5-6): "[curious] Başka yolu var mı acaba?"
- teşekkür cevabı: "[happy] Ne demek!"
- sayma: "Bir!", "İki!", "Üç!" (var olan kayıtlar), "[curious] Kaç güm?"
- final: "[excited] Kostüm partisi!", "[happy] Yaşasın!"
- gizli: "[gasps] Banyo yok!", "[sighs] Yeter ama!"

**Kino (kendi sesi):**
- "[sneezes] Hapşu!"
- "[happy] Mmm, sıcacık!"
- "[laughs] Şapkan bende!"
- "[happy] Teşekkürler Mino!"

**Ege (bebek söyleyişi; sesi Barış'ın seçtiği Ege sesiyle, yoksa balon):**
- "[whimpers] Mama!"
- "[giggles] Ham!"
- "[laughs] Teşekküyler!"

**Pamuk ve Ada:** Seslendirme yok. Pamuk'ta "miyav" efekti ve balon, Ada'da balonda kalp ve alkış efekti.

**Toplam:**
- Mino ~45, Kino 4, Ege 3; ~52 kısa cümle, ~900 karakter.
- Efektler Web Audio sentezi ya da var olan efektlerle yapılır: tın, güm, tak tak, vınnn, pof, vak.

---

## 8. Animasyon anları (poz değişimi, bütün gövde hareketi; zoom yok)

| An | Nasıl |
|---|---|
| Yardım balonları | Pencerede sırayla "pıt" diye açılır, hafif sallanır. Seçilmeyenler küçülüp bekler. |
| Fırlat ve yakala | Parça yay çizer, Mino 0.2 sn önce çömelir (hazırlık), zıplar, "pof" bulutu çıkar, iner (ezilme). |
| Kafasından çıkarıp atma | Şapka yukarı kayar, Mino'nun başı geriye sekerek gider, şapka omzun üstünden yay çizerek uçar. Kafa dönmez; yalnız öteleme. |
| Ayna | Mino aynaya doğru iki adım kayar, sevinç tepkisi, parıltı. |
| Merdiven uzar | Alttan yukarı açılan kırpma; her basamakta "tık". Mino basamak basamak sekerek çıkar. |
| Pamuk | G-MG2'nin 8 pozu arasında 120 ms ezilme-esneme geçişiyle; nefes taban pivotlu. |
| Ege uçak kaşık | Kaşık dalgalı yol izler, "vınnn". Ege'nin ağzı açılır (iskelet ağzı). |
| Çiçek dikilir | Taban pivotlu scaleY (0.6 → 1.08 → 1), en çok kaynak boyu. Yaprak sallanması yok (döndürme yok). |
| Arkadaş odaya gelir | Kapıdan yürüyüp minderine kayar, otururken bir hop. |
| Geçit | Mino halıda soldan sağa yürür (var olan yürüyüş, `src/mino/yuruyus.ts`), ortada durup eğilir (`tepki('selam')`). |

**Kural:** Hiçbir görsel kaynak boyunun üstünde çizilmez (DPR 3 dahil). Kamera yaklaşması yok.

---

## 9. Gemini istemleri (en çok 2 sayfa)

**Kayıt:** `ekip/gemini/yeni/mino-giysin/<dosya>.png` (≥ 2048 px). **Yüklenecekler:**
- stil: `ekip/stil/onayli-stil-oda.png`
- karakter: G-MG1 için `assets/karakter/mino.webp`, G-MG2 için `assets/dedektif/pamuk-a.webp`

**Kontrol:**
- Tüy dokusu, parlama, degrade ya da yazı varsa kullanılmaz.
- G-MG2 kesimleri Pamuk'un soğuk beyazına `pamuk-sogut.cjs` ile çekilir.

### G-MG1 · `kostum-sayfasi.png` (16:9 ya da 4:3, 3 sıra × 4 sütun, 12 parça)
> COSTUME PIECES SHEET for the attached orange cat character (Mino). Draw ONLY the clothing pieces and tools, no character. Every piece is drawn flat from the front, at the exact scale it would have when worn by this cat: hats are as wide as her head and sit between or around her two big ears with the ears left free, tops cover only her round chubby torso from just below her scarf down to her hips and have NO sleeves (her arms are drawn separately on top), tools are held upright and are about as tall as her torso. Three rows by four columns, twelve tiles, even white space between tiles, nothing touching, no tile borders, every piece centered in its tile and standing on the same invisible baseline within its row.
> Row 1, hats: (1) a white doctor's headband with a small round silver head mirror, (2) a shiny-free red firefighter helmet with a short brim and two side slits for cat ears, (3) a tall puffy white chef's hat, (4) a wide straw gardener's hat with a ribbon and one small pink flower, with two slits for cat ears.
> Row 2, tops: (5) a short white doctor's coat with no sleeves, two buttons and a red heart on the pocket, (6) a red firefighter vest with two yellow reflective stripes, (7) a red-and-white checkered chef's apron with a front pocket, (8) blue gardener's overalls with two straps and one patch pocket, no shirt.
> Row 3, tools: (9) a red-and-blue stethoscope hanging in a loose loop, (10) a tall straight red fire ladder with seven rungs, much taller than wide, (11) a big wooden cooking spoon, (12) a small green watering can with a round sprinkler head, seen from the side.
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm pastel color fills, at most one soft hard-edged shade tone per color, only one or two tiny white highlights. Simple rounded shapes, cute proportions. No texture, no grain, no gradients, no glow, no shine, no painterly look, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

Kesim:
- `ekip/illustrator/mino-giysin-isle.cjs` (yeni; `gemini-esya.cjs --esit --esit-hiza alt` ile).
- Çıktılar: `assets/mino-giysin/{bas,ust,alet}-{doktor,itfaiye,asci,bahce}.webp` ve dolap ikonları `assets/mino-giysin/ikon/<ad>.webp` (aynı resmin küçük kopyası).
- Hasır şapkanın çiçeği ayrı katmana kesilir (`bas-bahce-cicek.webp`; tam takım süsü).
- Bir sıra bozuk çıkarsa aynı sohbette yalnız o sıra yeniden istenir.

### G-MG2 · `pamuk-agac-hareket-sayfasi.png` (16:9, 2 × 4, 8 poz)
> ANIMATION SHEET. Every tile shows exactly the same character with the same design, same colors, same markings, same proportions and the same size scale (the character fills about 70% of the tile height), standing on the same invisible baseline. Even white space between tiles, nothing touching, no tile borders, no objects unless named.
> Of exactly this same white cat Pamuk from the attached reference (same face, same colors, same proportions), front view. Two rows by four columns, eight tiles. Tile 1: sitting upright as if on a tree branch, a little worried, front paws together (main idle pose). Tile 2: exactly the same as tile 1, only the eyes gently closed. Tile 3: scared, hugging with all four paws around an invisible horizontal branch at chest height, ears flat, eyes wide. Tile 4: soaking wet and funny, fur flattened into a skinny shape, shaking off a few drawn water drops, grumpy face. Tile 5: nose raised high, sniffing a delicious smell, eyes half closed, dreamy smile. Tile 6: sliding down belly-first, front legs stretched down and back legs up, as if sliding along a tree trunk, happy. Tile 7: leaping forward toward the viewer with both front paws open for a hug, overjoyed. Tile 8: sitting proudly on the ground, licking one front paw, eyes closed.
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm pastel color fills, at most one soft hard-edged shade tone per color, only one or two tiny white highlights in the eyes. Simple rounded shapes, cute baby proportions. No texture, no fur strands, no grain, no gradients, no glow, no shine, no painterly look, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

Kesim: `kes.mjs` ya da `gemini-esya.cjs --esit --esit-hiza alt` → `assets/mino-giysin/pamuk-{bekle,kirp,korku,islak,kokla,kay,atla,yala}.webp` ve göz yaması (karo 1 ile 2'nin farkı; `pati-isle.cjs`'teki yöntem).

**Bu ikisinden sonra (Faz 2, bu güne girmez):** D2-D4 arkadaşları için aynı kalıpla hareket sayfaları çizilebilir: Kino hasta ve iyileşmiş, Ege yemek yiyor, Ada alkışlıyor. Şimdilik iskelet ifadeleri yeterli.

---

## 10. Telefon yerleşimi (önce 844 × 390 ve 390 × 844, DPR 3)

**Oda, yatay 844 × 390:**
```
 ┌───────────────────────────────────────────────────────────────────────┐
 │ [geri]          pencere: [Pamuk][Kino][Ege][Ada] balonları      [ses] │ 48
 ├───────────────────────────────────────────────────────────────────────┤
 │ DOLAP (2 × 4 göz)  │         MINO (boy ~290)        │ SEPET (2 × 2)   │
 │ şapka şapka        │                                 │ alet  alet      │
 │ şapka şapka        │      [ayna]      minderler →    │ alet  alet      │
 │ üst   üst          │                                 │                 │
 │ üst   üst   ☆☆☆☆   │                                 │      [KAPI]     │
 └───────────────────────────────────────────────────────────────────────┘
   ~210 px                       ~400 px                     ~200 px
```
- Dolap gözü 96 × 80, dokunma kutusu 100 × 88 (aralık dahil). Sepette alet hücresi 96 × 96.
- Mino ortada ve ekran boyunun ~%75'idir. Kaynak boyu (rig 1790 yükseklik) DPR 3'te yeter; büyütme yoktur.
- Pencere balonları 72 px, üst çubuğun altında yan yana durur. Bitenler küçük yeşil tikle kalır.
- Çözüm yıldızları dolabın alt kenarında, dokunulamaz (yalnız gösterir).
- Arkadaş minderleri Mino'nun arkasında, duvar dibinde. Yatayda iki yanında ikişer tanedir. Yüzler Mino'yla örtüşmez (e2e yüz örtüşme testi).
- Çentik tarafına düğme konmaz; `env(safe-area-inset-*)` + 16 px.

**Oda, dikey 390 × 844:**
- Üstte balonlar (4 × 72).
- Mino ortada (boy ~380).
- Altta dolap yatay: 4 sütun × 2 sıra, göz 88. Üst sıra şapka, alt sıra üst giysi.
- En altta alet sırası (4 × 88) ve sağında kapı.
- Kaydırma yok.

**Dert sahnesi:**
- Arka plan ekranı doldurur (`cover`, sahne en çok 2.17:1). Arkadaş ve dert eşyası ortada.
- Mino solda, sahneye kayarak girer.
- Sepet (4 alet) başarısızlıktan sonra sağ alt köşede açılır (yatay 2 × 2, dikey 4 × 1).
- Dikeyde ağaç sahnesi dar kırpılır: ağaç ve Pamuk ortaya alınır, sahne yatay kaydırma yerine `object-position` ile ayarlanır.

**Tablet:** aynı düzen orantılı büyür.

---

## 11. Menü: iki oyun bir set

- `uygulama/src/oyunlar.ts`:
  - Yeni kart: `{ id: 'mino-giysin', ad: 'Mino Ne Giysin?', adres: './mino-giysin/', renk: '#FF9F43', zemin: 'giysin/oda-yatay', set: 'giysin', katmanlar: [{ gorsel: 'mino-giysin/kart-mino', sinif: 'ug-k-mino-giysin' }] }`.
  - Kart resmi itfaiyeci kasklı ve merdivenli Mino'dur. Kodla birleştirilir: `ekip/giysin/kart-mino.cjs`, Kino kartının `kart.cjs` yöntemi; Mino'nun durağan resmi ve G-MG1 parçaları kullanılır.
  - Kino kartına `set: 'giysin'` eklenir.
- **Yan yana:** `menuOyunlari` set kartlarını ardışık dizer. İkisi her ızgarada **aynı sırada** durur: 10 kartta 7. ve 8. sıra (0'dan 6 ve 7). Yerleşim:
  - Telefon dikey (2 sütun): 4. sıra.
  - Yatay telefon (5 sütun): 2. sıra.
  - Tablet (3 sütun): 3. sıra.
- **Set görünümü:** İki kartın üst kenarları arasında, boşluğun üstünden geçen bir **çamaşır ipi** olur (CSS çizgi, hafif sarkık). İpte iki mandal ve küçük bir çorap asılıdır (`assets/giysin/ikon/corap`). Kartların altında ortak küçük tabela: "Ne Giysin?" (`ust`). Menü kartı canlanmasında (var) Mino kartında Mino zıplar ve kaskı bir an havalanır.
- **Izgara 10 kart** (Pasta geniş kartı sonda):
  - Telefon dikey 2 × 5: Pasta 1 hücre.
  - Yatay telefon 5 × 2: Pasta 1 hücre.
  - Tablet 3 sütun: 9 kart + Pasta tam sıra (3 hücre).
  - `uygulama.css` → `data-adet='10'`.
  - Boşluksuz ızgara testi `tests/e2e/uygulama.spec.ts`'te 10 kart için güncellenir.

---

## 12. Kodcunun dokunacağı dosyalar

| Dosya | Ne |
|---|---|
| `mino-giysin/index.html`, `mino-giysin/src/main.ts`, `oyun.ts` (yeni) | `oyunuBaslat(kok, { cikis })` (Giysin'in `oyun.ts` kalıbı). Ekranlar: `oda`, `dert`, `parti`. `?test=1&ekran=dert&dert=pamuk&alet=merdiven&yas=…` |
| `mino-giysin/src/model.ts` (yeni, saf) | `ROLLER`, `PARCALAR` (rol, yer: bas, ust, alet), `DERTLER`, `SONUC[dert][alet]` → `cozum` ya da `komik` ve ipucu türü. `takimAdi(giyili)` → `tam:rol` ya da `karisik`. `yerDegistir(giyili, parca)` → eski parçayı döndürür (fırlatılacak). `yildizlar(kayit)`. |
| `mino-giysin/src/kostumlu-mino.ts` (yeni) | Mino + kostüm katmanları (`mino.kostum()`), fırlat-yakala, kafadan çıkarıp atma, ayna. |
| `mino-giysin/src/oda.ts` (yeni) | Balonlar (dert seçimi), dolap (8 göz), sepet, kapı, arkadaş minderleri, gizli sürprizler 1-3 ve 8. |
| `mino-giysin/src/dert.ts` (yeni) | 4 sahne × 4 alet; el hareketleri (sürükle, dokun-say, daire karıştır, basılı tut); ipucu merdiveni; sahne içi sepet. |
| `mino-giysin/src/parti.ts` (yeni) | Serbest giydirme, geçit, arkadaşların alkışı. |
| `mino-giysin/src/kayit.ts` (yeni) | `minkino-mino-giysin-v1`: `yildiz: string[]` (`dert:alet`), `yas`. |
| `mino-giysin/src/mino-giysin.css` (yeni) | Kök `.mg-kok`, önek `mg-`. Seçiciler `.mk-kok.mg-kok` ile (ana.css ezilme notu, ORTAK_NOTLAR 2026-10-15). |
| `src/mino/mino.ts` | `kostum(ayar: { bas?: string \| null; ust?: string \| null; alet?: string \| null })`: `dedektif()` gibi. Resimler `.k` sonuna, `.g` içinde fuların altına, `.kr` sonuna; ölçüler `assets/mino-giysin/kostum-yer.json` (2048 tuvalinde [x, y, en, boy]). `kostumSu` getter. Kostüm varken `poz()` alet katmanını gizlemez; bu oyunda `poz()` çağrılmaz. |
| `content/mino-giysin.json` (yeni) + `src/audio/cumleler.ts` | §7 cümleleri (Mino anlatıcı, Kino `KINO_SESI`, Ege). |
| `vite.config.ts` | `minoGiysin: 'mino-giysin/index.html'`. |
| `uygulama/src/oyunlar.ts`, `uygulama/src/ekranlar.ts`, `uygulama/src/uygulama.css` | Kart, `set` alanı, ardışık dizilim, çamaşır ipi, 10 kart ızgarası. |
| `src/engine/erisim.ts` | `mino-giysin/pamuk` ve `mino-giysin/kino` ücretsiz, `mino-giysin/*` abonelik. Kilitli balon dokununca kilit anı açılır. Parti, çözülen dertlerle ücretsiz açılır. |
| `ekip/illustrator/mino-giysin-isle.cjs` (yeni), `ekip/giysin/kart-mino.cjs` (yeni) | G-MG1 ve G-MG2 kesimi, `kostum-yer.json` için ölçü sayfası (`kostum-onizleme.png`: 4 tam takım Mino'nun üstünde), menü kartı. |
| `tests/unit/mino-giysin.test.ts` (yeni) | 16 sonuç tablosu (her dertte tam 2 çözüm), yer değiştirme ve fırlatma, takım adı, yıldız kaydı, cümle uzunlukları (`cumleler.test.ts` sınırları). |
| `tests/e2e/mino-giysin.spec.ts` (yeni) | §13 senaryoları, 844 × 390 ve 390 × 844. |

Dokunulmayanlar: `giysin/src/*` (Kino'nun oyunu). Yalnız ortak görseller okunur.

---

## 13. Bitti ölçütü

1. **Oynanış:**
   - 4 dertin her biri her iki çözümle çözülür.
   - 8 komik başarısızlığın her biri oynar ve sonra sahne içi sepetle başka alet denenir.
   - Hiçbir an kilitlenmez. Hiçbir animasyon dokunuşu bloklamaz.
2. **Seçenek kuralı:**
   - Her adımda en az 3 seçenek vardır: 4 balon, 4 şapka, 4 üst, 4 alet, sahnede 4 alet.
   - Hiçbir sözde "dokun", "sürükle" ya da "ver" geçmez (birim testi `content/mino-giysin.json`'u tarar).
   - İlk parlama 3-4 yaşta 35 sn'den, 5-6 yaşta 40 sn'den önce çıkmaz.
3. **Kostüm:**
   - 12 parça Mino'ya oturur. 4 tam takımın ölçü sayfası (`kostum-onizleme.png`) Barış'a gösterilir.
   - Kulaklar şapkanın altında kalmaz. Fular görünür.
   - İkinci şapka eskisini fırlatır. Şapka yere ya da bir arkadaşın kafasına düşer, kaybolmaz.
4. **Gizli sürprizler:** §6'daki 8 sürprizin her biri e2e'de bir kez tetiklenir.
5. **Zoom yok:** Hiçbir resim kaynak boyunun üstünde çizilmez (e2e: `naturalWidth` ≥ ekrandaki en × DPR).
6. **Menü:** Kino ve Mino kartları her ızgarada yan yana aynı sırada durur. Çamaşır ipi iki kartı bağlar. 10 kart boşluksuzdur (844 × 390, 667 × 375, 390 × 844, 768 × 1024).
7. **Test ve teslim:**
   - `npm run build`, `npm test`, `npm run e2e -- mino-giysin uygulama` geçer, konsol hatası yoktur.
   - Gerçek hızda video kare kare izlenir (DPR 3).
   - `ORTAK_NOTLAR.md`'ye satır eklenir.

**1 günlük iş sırası:**
1. Model ve testi.
2. `mino.kostum()` ve ölçü sayfası (G-MG1 gelmeden yer tutucu: düz renkli sade şekiller, kalın kahve kontur).
3. Oda: balon, dolap, fırlat-yakala.
4. D1 ve D2 (ücretsiz dertler) tam.
5. D3 ve D4.
6. Parti.
7. Menü seti.
8. Sürprizler ve e2e.

G-MG2 gelmeden Pamuk iskeletiyle oynar: bekle, korku ve sevinç yüzleri. Gelince pozlar bağlanır.
