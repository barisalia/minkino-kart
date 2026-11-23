# Ölçü tezgâhı · kurdele turunu dönüştürme: iki fikir (19 Kasım 2026, taslak)

## Hangi etkinlik, neden

**Ölçü tezgâhının kurdele ölçme turu** Matematik'teki en kâğıt etkinliği gibi duran tur. Kara tahtada soyut turuncu bir çubuk, altında kesik çizgili boş kutular, masada tek bir mavi kare düğme var. Çocuk düğmeye kurdele bitene kadar basıyor; kimse bir şey yapmıyor, hiçbir yere gidilmiyor.

Tur her yaşta ikişer kez geliyor (`tur-sirasi.ts`: 3 yaş n 0 ve 4, 4 yaş n 0 ve 8, 5+ n 1 ve 12). Ölçmenin özünü de taşıyor: eşit birimleri boşluksuz, uç uca dizip saymak.

İki fikir de bu özü korur, yalnız soyut çubuğu bir **dostun derdine** çevirir:

- Fikir 1'de ölçmek **dikey**: bir hayvanın boyu.
- Fikir 2'de ölçmek **yatay**: bir yolun uzunluğu.

Ölçünün sonunda çocuk, ölçtüğü şeyin işe yaradığını görür.

> **Taslak çizimleri yer tutucudur.** Sahneler yalnızca var olan çizimlerle ve CSS hareketiyle kuruldu, kodla çizim yok.
> Yapımda bütün çizimler Astra'dan, Matematik'in düz renkli, ince siyah konturlu çizgisinde yeni gelir. Başka oyunun çizimi kullanılmaz, kırpılmaz.

---

## Fikir 1 · Boy Duvarı

**Ne:** Hayvan dostların boyunu tahtaları yanlarına üst üste dizerek ölçüyoruz.

**Çocuk ne yapıyor, ne görüyor:**
- Masada bir zürafa duruyor, sağda tahta yığını var. Ceren: "Zürafa kaç tahta boyunda? Tahtaları yanına üst üste koy."
- Çocuk tahtaları tek tek sürükler ya da dokunur. Her tahta zürafanın yanına iner, yükselen bir notayla sayılır ("bir, iki, üç…"); yığın kule gibi yükselir.
- Son tahta zürafanın başına değince ikisi birlikte parlar. Zürafa sevinçle zıplar, üstte "5" belirir: "Zürafa beş tahta boyunda!"
- **Yaşa göre:**
  - 2–3 yaş: kısa hayvan, 2–3 tahta; tahtaya dokunmak yeter.
  - 4 yaş: 4–5 tahta.
  - 5+ yaş (genişleme, eski "uç uca" turunun yerine): iki dost yan yana, örneğin zürafa 5, tavşan 2. Çocuk ikisini de ölçer, sonra "Hangisi daha uzun?" sorusunda uzun olana dokunur. Ölçme ile karşılaştırma bir arada.

**Neden daha eğlenceli:**
- Ölçülen şey bir dost; sonucu o dost kutluyor.
- Yığını yükseltmek, Sayı masasının en sevilen kule oyununun dokunma hissi.
- Aynı tur her seferinde başka bir hayvanla gelir, tekrar sıkmaz.

**Süre:** Tek hayvan yaklaşık 12 sn (yönerge 3 sn, tahtalar 5–6 sn, kutlama 2 sn). 5+ yaşta iki hayvan ve karşılaştırma yaklaşık 22 sn.

**Taslak (var olan çizimler):** `matematik/kule-masasi` (oda), `matematik/kule-kutusu` (tahta), `hayvanlar/zurafa`, `hayvanlar/tavsan`.

**Astra brief'i (yapımda):**
- **Sayfa 1–4, her hayvan kendi sayfasında 3 poz:** dik duruş (tam boy, ayaklar aynı taban çizgisinde), başını kaldırıp yığına bakış, sevinç zıplaması.
  - Hayvanlar: zürafa (5 tahta boyu), tavşan (2), ördek (3), kaplumbağa (1).
  - Boylar tahta birimine tam otursun: tepe noktası tahta sınırına denk gelsin.
- **Sayfa 5, nesne kataloğu (3 çizim):**
  - Ölçü tahtası (480×208 oranı, numara yazısız, iki ucunda küçük ahşap çizgi).
  - Tahta yığını (masada 5 tahta, hafif yamuk).
  - Sevinç yıldızı.
- **Fon (kendi tam çözünürlüklü çağrısında, 16:9, 1672×941):** boy ölçme köşesi. Matematik odasının duvarında renkli, çocuk boyu bir boy cetveli; önde geniş masa yüzeyi.
- **Sesler (Ceren, her biri ayrı istek):**
  - Hayvan başına "… kaç tahta boyunda? Tahtaları yanına üst üste koy."
  - Hayvan başına "… beş tahta boyunda!"
  - "Hangisi daha uzun?"
  - Sayılar mevcut kayıtlardan.

**Ekranlar:**
- iPad yatay: [`fikir-1-boy-duvari-a-ipad.png`](fikir-1-boy-duvari-a-ipad.png) (ölçüyor) · [`fikir-1-boy-duvari-b-ipad.png`](fikir-1-boy-duvari-b-ipad.png) (5+ karşılaştırma)
- Telefon yatay: [`-a-telefon.png`](fikir-1-boy-duvari-a-telefon.png) · [`-b-telefon.png`](fikir-1-boy-duvari-b-telefon.png)
- Video: [`fikir-1-boy-duvari-ipad.webm`](fikir-1-boy-duvari-ipad.webm) · [`fikir-1-boy-duvari-telefon.webm`](fikir-1-boy-duvari-telefon.webm)
- Canlı sahne: `fikir-1-boy-duvari.html?oynat=1`

---

## Fikir 2 · Kurbağanın Yaprak Yolu

**Ne:** Kurbağa göletin karşısındaki çiçeğe gitmek istiyor. Aradaki suyu eşit yapraklarla uç uca kapatıyoruz, sonra kurbağa yaprak yaprak zıplıyor.

**Çocuk ne yapıyor, ne görüyor:**
- Solda kıyıda kurbağa, sağda adacıkta çiçek, altta yaprak sepeti var. Ceren: "Kurbağa çiçeğe gitmek istiyor. Yaprakları suya uç uca diz, yol olsun."
- Çocuk yaprağı sepetten suya sürükler. Yaprak sıradaki yere süzülüp oturur, su üstünde hafifçe sallanır, sayılır. Sepet yaprak yaprak boşalır.
- Yol tamamlanınca kurbağa dört zıplayışla geçer. Bastığı her yaprak parlar ve sayılır ("bir, iki, üç, dört"). Çiçeğe varınca ikisi sevinir: "Yol dört yaprak uzunluğunda!"
- **Yaşa göre:**
  - 2–3 yaş: 2–3 yaprak; yaprağa dokununca kendisi yerine süzülür.
  - 4 yaş: 4–5 yaprak.
  - 5+ yaş (genişleme): iki yol (iki ada); "Hangi yol daha uzun?" Ya da yol kırık: önce kısa bir parça, sonra devamı (eski "uç uca" turunun yerine).

**Neden daha eğlenceli:**
- Ölçü bir yol, ölçmek bir yolculuğu mümkün kılıyor. Çocuk sonucu kurbağanın zıplayışlarında görüyor ve sayıyı bir daha, hareketle duyuyor.
- Su, sallanan yapraklar, zıplama: sakin ama canlı bir sahne.
- Misket parkurundan farkı: ray ya da mekanik yok, birim doğal bir nesne ve sonuç bir karakterin eylemi.

**Süre:** Yaklaşık 14 sn (yönerge 3 sn, 4 yaprak 4 sn, zıplayışlar 3 sn, kutlama 2 sn).

**Taslak (var olan çizimler):** `hazirlik/kres/oyuncak-ordek-havuz` (gölet), `hazirlik/kres/golet-ada`, `hazirlik/kres/deney-yaprak`, `hayvanlar/kurbaga`, `orman-esya/cicek`, `sef/piknik/sepet`.

**Astra brief'i (yapımda):**
- **Sayfa 1, kurbağa (orta plan, 6 poz, tek hareket):** otur-bekle, çömel, sıçra, havada, yaprağa kon, sevinç. Yönü sağa; temas noktası (arka ayaklar) sabit.
- **Sayfa 2, nesne kataloğu (5 çizim):**
  - Yüzen nilüfer yaprağı (birim, üstten hafif eğik bakış, sapsız).
  - Dolu yaprak sepeti ve boş yaprak sepeti.
  - Hedef çiçek (nilüfer çiçeği; çilek yok).
  - Küçük su halkası (yaprak oturunca).
- **Fon (kendi tam çözünürlüklü çağrısında, 16:9):** yukarıdan hafif eğik bakılan gölet. Solda kurbağanın kıyısı, sağda çiçekli adacık, ortada yaprakların dizileceği düz ve açık bir su şeridi.
- **Sesler (Ceren, ayrı istekler):**
  - "Kurbağa çiçeğe gitmek istiyor. Yaprakları suya uç uca diz, yol olsun."
  - "Yol hazır! Kurbağa, zıpla!"
  - "Yol dört yaprak uzunluğunda!" (sayıya göre)
  - 5+ için "Hangi yol daha uzun?"

**Ekranlar:**
- iPad yatay: [`fikir-2-yaprak-yolu-a-ipad.png`](fikir-2-yaprak-yolu-a-ipad.png) (yol kuruluyor) · [`fikir-2-yaprak-yolu-b-ipad.png`](fikir-2-yaprak-yolu-b-ipad.png) (kurbağa zıplıyor)
- Telefon yatay: [`-a-telefon.png`](fikir-2-yaprak-yolu-a-telefon.png) · [`-b-telefon.png`](fikir-2-yaprak-yolu-b-telefon.png)
- Video: [`fikir-2-yaprak-yolu-ipad.webm`](fikir-2-yaprak-yolu-ipad.webm) · [`fikir-2-yaprak-yolu-telefon.webm`](fikir-2-yaprak-yolu-telefon.webm)
- Canlı sahne: `fikir-2-yaprak-yolu.html?oynat=1`

---

## İkisi için ortak

- Kurdele turunun yerine geçer; tur sırası, tür kuralı ("aynı tür en çok iki kez") ve kayıt değişmez. İki fikir birlikte de kullanılabilir: türün birinci gelişi biri, ikinci gelişi öteki olur. Böylece aynı iş iki kez olmaz.
- Yanlış sesi yok: birim boşluk bırakırsa ya da taşarsa yerine süzülür, "uç uca" kendiliğinden sağlanır.
- Dokunma hedefleri telefonda en az 44 px; telefon yatay.
- Barış onaylarsa sırası: Astra brief'i `CLAUDE-ASTRA-MESAJLAR.md`'ye, çizimler gelince yapım, gerçek sesle oynatma ve testler.
