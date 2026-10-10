# Kino'nun Otobüsü v2 · Kino'nun Dondurma Turu

> Durum: TASLAK (2026-10-10). Barış'la konuşulmadan kodcuya ve Gemini'ye gitmez.
> Neden var: Barış, "Kino'nun Otobüsü aynı olmuş öbürüyle… farklı şeyler düşünsene, gelişsenize." Haklı. v1 (`kino-otobus.md`), Pasta'nın aynısıydı. Tezgâh, resimli sipariş, istasyonlarda hazırlık, verme, jeton, 3 gün ve akşam kumbara dükkânı birebir aynıydı. Kepçeyle sürtmek, sos dökmek, tezgâh silmek, külah yapmak gibi elle yapılan işler eklendi ama oyunun özü değişmedi.
> Bu belgenin kuralı: **Tezgâh yok, sipariş hazırlamak yok, jeton yok, kumbara dükkânı yok.** Dondurma otobüsü, Kino ve var olan çizimler kalıyor. Oyunun özü baştan değişiyor.

---

## 1. Önce: bizim oyunların çekirdek döngüleri (tekrar etmeyelim diye)

| Oyun | Çekirdek döngü | Asıl beceri |
|---|---|---|
| **Pasta Otobüsü** (`pasta/`) | tezgâh, resimli sipariş, istasyonlarda hazırlık (hamur, kalıp, fırın, krema, süs), ver, jeton, 3 gün, akşam sayım ve dükkân | eşleme, sayma |
| **Mino'nun Pazarı** (`pazar/`) | müşteri ister, ürünü sepete sürükle, say, ver. **Meyve Suyu:** meyveleri blender'a at, **renk karıştır** (kırmızı + sarı = turuncu). **Tart Bakalım:** fizikle kantara meyve doldur | sayma, renk karışımı, ağırlık |
| **Kino Ne Giysin?** (`giysin/`) | mevsime bak, dolaptan giysiyi Kino'ya sürükle, dışarı çık, fotoğraf, albüm | hava ve mantık |
| **Dedektif Mino** (`dedektif/`) | büyüteçle ipucu bul, üç karttan birini seç, "demek ki…", sonraki halka, çizgi roman | çıkarım |
| **Sesli Maceralar** (`macera/`) | hikâye sahneleri, sesle ve dokunarak görev. Doğum Günü, Ege, Banyo, Elektrik, **Salıncak Kimin?** (parkta sıra ve paylaşma) | ses, duygu, sıra bekleme |
| **Kartlar** (`src/screens`) | soru kartı, eşleme, hafıza, albüm | kelime, eşleme |
| **Çiz Canlansın** (`canlan/`) | çiz, puan al, çizim canlanır | el becerisi |
| (Uyuyan Orman, beklemede) | haritadan bölge seç, sesle görev | ses |

**Hiç olmayan:** Bir aracı **sürmek**, bir **haritada yol bulmak**, **yön** (sağ, sol, düz) ve **yer bildiren sözcükler** (altında, üstünde, arkasında, içinde, yanında), **trafik kuralı**. Çocuğun parmağıyla bir şeyi bir yerden bir yere **götürdüğü** bir oyunumuz yok. Dedektif'te yalnız bir halkada çatal yol seçimi var. Orman'daki harita da yalnız dokunup bölge seçmek için.

---

## 2. Üç yön

### Yön A · Kino'nun Dondurma Turu (sür, bul, teslim et)
- **Çekirdek döngü:** Kasabanın tek ekranlık haritası. Otobüste dondurmalar hazır. Her dondurmanın üstünde bir kart var: kimin ya da hangi evin olduğu. Çocuk otobüsü parmağıyla yolda **sürer** (otobüs yoldan çıkmaz). Yolda küçük olaylar var: ördekler karşıdan karşıya geçer, trafik lambası yanar, köprü, tünel, yokuş. Çocuk doğru eve ya da parka varır. Arkadaş oyun olsun diye saklanmıştır: **"Kaydırağın arkasında!"** Çocuk onu bulur, dondurmasını verir. Arkadaş otobüse teşekkür süsü takar ve akşam şenliğe gelir.
- **Öğrettiği:** yön ve yer sözcükleri (sağ, sol, üstünden, altından, içinden, arkasında), harita okuma, adres bulma (çatı rengi, kapı şekli, baca), trafikte dur ve geç, yavru ördekleri sayma.
- **Neden tekrar değil:** Tezgâh ve istasyon yok. Oyun bir yolculuk. Bizde araç süren ya da harita okuyan oyun yok. Saklambaç da yalnız sözcükle yer arama için var.
- **Yeniden kullandığı çizimler:** otobüs (haritada ve duraklarda), Kino'nun önlüğü ve şapkası, dolap (açık kapakta), tat kapları ve kepçe (sabah hazırlığı), toplar, külah, kâse, kupa, soslar, serpinti, kiraz, gofret, şemsiye, kalp şeker, mum (dondurmalar bunlardan kodla kurulur), 6 otobüs süsü (teşekkür hediyeleri), doğum günü penceresi (Tur 3 finali), film sahneleri (park, sokak, anaokulu, plaj, çiftlik), film eşyaları (kaydırak, salıncak, bank, şemsiye, kum havuzu, ağaç kovuğu, saman balyası), bütün karakter iskeletleri, tren.
- **Yeni çizim:** 3 harita (Tur 1 için 1 tane), 6 ev, trafik lambası (2 hâl), yavru ördek, teslim kartı, harita bayrağı, korna, şoför Kino pozu. Tur 1 için 14 görsel.
- **Kalan kod:** yaklaşık %35. Otobüs ve süsleri, görsel haritası, yükleme, efektler, sesler, kayıt, dondurma kulesi çizimi, sürükleme yardımcısı ve açılış kalıyor. Gün ekranı, istasyonlar, yan işler ve akşam dükkânı gidiyor.

### Yön B · Kino'nun Buz Atölyesi (icat et, dondur, koleksiyon)
- **Çekirdek döngü:** Kino otobüsün arkasında bir laboratuvar kurar. Çocuk meyveleri ve renkleri karıştırıp yeni tat bulur, kalıba döker, dondurur, tadı resimle adlandırır. Tat kitabı dolar.
- **Öğrettiği:** renk karışımı, katı ve sıvı (erime, donma), sınıflama.
- **Dürüst sorun:** Renk karışımı Pazar'daki **Meyve Suyu**'nun ta kendisi (blender, kırmızı + sarı = turuncu). Döküp karıştırmak yine istasyonlu bir tezgâh oyunu; Barış yine "aynı" der. Donma da yapısı gereği beklemedir. Koleksiyon kitabı ise Giysin albümüyle Dedektif dosyasının bir benzeri.
- **Çizimler:** tat kapları, toplar, külahlar yeniden kullanılır. Yeni olarak meyveler, kalıplar ve laboratuvar (8-12 görsel) gerekir.
- **Kalan kod:** %50 civarı, çünkü tezgâh düzeni kalır. Pasta'ya en yakın yön de bu yüzden bu.

### Yön C · Parkta Dondurma Şenliği (birlikte oyun, ödül dondurma)
- **Çekirdek döngü:** Kino otobüsü parka park eder. Parktaki çocuklar küçük oyunlar oynar (top atma, ip atlama, sıra), çocuk oyunu yönetir ve sırayı kurar. Oyun bitince dondurma ödül olarak dağıtılır.
- **Öğrettiği:** sıra bekleme, paylaşma, adil bölme.
- **Dürüst sorun:** "Salıncak Kimin?" bölümü tam olarak bu: parkta sıra, paylaşma, sayarak bekleme. Kalabalık şenlik de Doğum Günü bölümünde var. Dondurma yalnız ödül olunca otobüsün de bir anlamı kalmaz.
- **Çizimler:** park sahnesi ve karakterler var. Oyun eşyaları ve bir sürü yeni poz (8-10 görsel) gerekir.
- **Kalan kod:** %20 (açılış ve otobüs).

### Seçim: **A, Kino'nun Dondurma Turu** (C'nin en güzel anı final olarak içinde)
- **Açıkça farklı:** Pasta'da çocuk tezgâhın arkasında durur, iş ona gelir. Turda çocuk **yola çıkar**, işin peşinden gider. Ekran, el ve beceri baştan sona başka: harita, sürüş, yön, yer sözcükleri.
- **Şirin:** Kino camdan kafasını çıkarmış, kulakları rüzgârda uçuşuyor. Ördek yavruları otobüsün önünden paytak paytak geçiyor. Tünelde "Hav-hav-hav" diye yankı yapıyor. Arkadaşlar kaydırağın arkasından "Cee!" diye fırlıyor.
- **Basit:** Tek hareket otobüsü sürüklemek. Otobüs yoldan çıkamaz, kaza olmaz, yanlış ev komik bir uğrak olur. Bekleme de yok, çünkü yolculuğun kendisi oyun.
- **Eğitici ama zorlamasız:** Sağ ve sol, altında ve arkasında, kırmızıda dur, yavruları say. Hepsi büyük resimle ve tek sözcükle anlatılıyor.
- **C'den aldığımız:** Tur sonunda dondurmasını alan bütün arkadaşlar otobüsün peşinden şenliğe gelir. Kalabalık ve sevinç finalde, sıra oyunu yok.

---

## 3. Tek cümle
Kino buz mavisi otobüsüyle kasabayı dolaşıyor. Çocuk otobüsü haritada sürüyor, kartına bakıp doğru evi buluyor, saklanan arkadaşı "altında, arkasında" sözcükleriyle arıyor, dondurmasını veriyor. Akşam herkes şenlikte toplanıyor.

---

## 4. Ekranlar

### 4a. Açılış (mevcut açılış, değişir)
- Otobüs parkta, "Dondurmaaa!" kornası. Yaş seçimi için iki büyük düğme (3-4 ve 5-6), mevcut yapı.
- Altta 3 tur kartı: **Mahalle** (ücretsiz), **Sahil**, **Çiftlik ve Doğum Günü**. Her kartta haritanın küçük resmi ve o turun bayrakları. Kilitli turlar için mevcut sakin kilit anı kullanılır.

### 4b. Sabah hazırlığı (~8 sn, dokununca geçer, hiçbir şeyi kilitlemez)
- Otobüsün içi (`ic-arka`). Kino kepçeyle tat kaplarından top alır ve dondurmaları kurar (var olan kap, kepçe, top, külah, sos ve süs çizimleri; kodla, hızlı montaj).
- Dondurmalar tek tek **dolaba** dizilir. Her birinin önünde bir **teslim kartı** durur. Anlatıcı: *"Dondurmalar hazır!"* Kino: *"Hadi yola!"*
- Bu bir izleme anı. Çocuk dondurmaya dokunursa dondurma zıplar, Kino güler. Ekrana dokunmak hazırlığı hemen bitirir.

### 4c. Harita (oyunun asıl ekranı)
```
 y 0   ┌──────────────────────────────────────────────────────────────────────────┐
       │ [geri]            [Mahalle  ⚑⚑⚐]                                  [ses] │ 44 px, saydam
       │                                                                          │
       │   [EV pembe]═════════╗          [PARK kaydırak]                          │
       │       ║        🦆 geçidi ╚══════════╗      ║                             │
       │   [OTOBÜS]══════[KÖPRÜ]════════[🚦]══╬══════╝      [ANAOKULU]           │  harita tam ekran
       │       ║                              ║                ║                  │  (kenardan kenara)
       │   [EV sarı]════════[TÜNEL]═══════════╩════════════════╝                  │
       │ ┌─────────────────┐                                         ┌────────┐  │
       │ │ DOLAP: 🍦🍦🍦     │                                         │ KORNA  │  │
 y 390 └─┴─────────────────┴─────────────────────────────────────────┴────────┴──┘
          sol alt: kalan dondurmalar (kartlarıyla)                    sağ alt: 80 px
```
- **Harita tek ekran, kaydırma yok.** Bir turda 5-6 yer var. Her yer en az **88 px**, otobüs **96 px** boyunda. Yollar 36 px kalınlığında, krem rengi ve parlak.
- **Otobüs:** var olan yan görünüş çizimi. Gittiği yöne bakar (çizim aynalanır), yokuşta hafifçe eğilir. Kino şoför camından kafasını çıkarır, kulakları uçuşur.
- **Dolap (sol alt):** dağıtılmamış dondurmalar kartlarıyla durur. Bir dondurma verilince oradan eksilir. Yüksek sesle sayılmaz; yalnız görünür.
- **Korna (sağ alt):** her an çalar ("Dondurmaaa!" ezgisi). Ördekler ve arkadaşlar korna sesine el sallar.
- **Bayraklar:** dondurma verilen yere pati izli bir bayrak dikilir. Turun sonunda harita bayraklarla dolar.
- **Dikey telefon (390×844):** harita ekranın enine sığdırılır (üstte gökyüzü, altta çimen bandı). Dolap ve korna haritanın altında büyük bir şerit olur.

### 4d. Durak (her teslim)
```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ film sahnesi: park / sokak / anaokulu / plaj / çiftlik (3 katman, derinlik) │
 │                                                                          │
 │  [OTOBÜS yanı, kapak açık = tente]      [kaydırak]   [ağaç]   [kum havuzu] │
 │   Kino kapakta, elinde dondurma          (3 saklanma yeri, her biri ≥ 120 px)│
 └──────────────────────────────────────────────────────────────────────────┘
```
- Otobüs soldan girer, frene basar, kulaklar öne savrulur, kapak açılır (tente). Kino: *"Dondurmaaa!"*
- **Saklambaç:** arkadaş oyun olsun diye saklanmıştır. Sahnedeki 2-3 eşyanın birinin arkasında, altında ya da içindedir. İskeletin bir kısmı eşyanın ön katmanıyla örtülür; kulak ya da kuyruk ucu görünebilir.
- Çocuk eşyaya dokunur. Arkadaş **"Cee!"** diye fırlar, otobüse koşar.
- **Teslim:** dondurma Kino'nun patisindedir. Çocuk onu arkadaşa sürükler ya da arkadaşa dokunur. Ardından tadım anı gelir (yakın çekim, en çok 1 sn): ayının burnuna dondurma bulaşır, Pamuk'un yanakları pembeleşir, ördek "Vak!" der.
- **Teşekkür:** arkadaş bir otobüs süsü verir (var olan 6 süs). Süs uçup otobüse anında takılır. Arkadaş el sallar: *"Akşam şenlikte!"* (balon).
- Otobüse dokununca haritaya dönülür. 4 sn dokunulmazsa otobüs kendiliğinden döner.

### 4e. Tur sonu şenliği (~30 sn)
- Turun son yeri (Tur 1'de park, Tur 2'de kumsal, Tur 3'te Mino'nun bahçesi). Dondurmasını alan bütün arkadaşlar sırayla otobüsün yanına gelir (o gün kaç kişiye gidildiyse o kadar).
- Kino son dondurmayı kendine ayırmıştır. Çocuk onu Kino'ya verir. Kino: *"Sıra bende! Ham!"* Burnu dondurmaya bulanır.
- Herkes çak yapar. Harita büyük açılır, Kino'nun o gün sürdüğü yol noktalı bir iz olarak görünür, bayraklar dalgalanır.
- Anlatıcı: *"Herkes dondurmasını aldı!"* Otobüs gün batımında, süsleriyle eve döner.

---

## 5. Bir teslimin akışı (~40 sn) ve sürüş kuralları

1. **Kart:** Dolaptaki sıradaki dondurmanın kartı büyür (3-4 yaşta yalnız bir kart sırada). Anlatıcı: *"Tavşanın dondurması!"*
2. **Sür:** Çocuk otobüsü sürükler. Otobüs **raya bağlıdır**: parmak nereye kayarsa kaysın, otobüs yolda parmağa en yakın noktaya gider. Kavşakta parmağın gittiği kola sapar. Yoldan çıkmak, çarpmak, devrilmek yok.
   - Dokunarak oynamak da mümkün: hedef yere dokunulursa otobüs yolu kendisi gider (sakin hızda, her yol parçası ~2 sn). Yol olayları yine olur.
3. **Yol olayı** (her yolculukta en çok bir tane; aynı tur içinde tekrar etmez):
   | Olay | Ne olur | Çocuk ne yapar | Öğrettiği |
   |---|---|---|---|
   | **Ördek geçidi** | otobüs geçidin önünde kendiliğinden durur, anne ördek ve yavrular kaldırımda | her yavruya dokunur, yavru zıplayarak karşıya geçer, sayılır: "Bir, iki, üç!" | sayma, sabır |
   | **Trafik lambası** | kırmızı yanar | 3-4: otobüs kendiliğinden durur. Kırmızıda bir arkadaş yaya geçidinden geçer (1.5 sn, dokunursa el sallar), sonra yeşil yanar. 5-6: çocuk otobüsü çizgide kendisi durdurur. Durduramazsa Kino frene basar, patileriyle gözlerini kapar: "Uff!" | kırmızıda dur, yeşilde geç |
   | **Köprü** | dere üstünde kemerli köprü | otobüsü köprünün **üstünden** geçirir, altında balık zıplar | üstünden ve altından |
   | **Tünel** | dağın içinden geçen yol | otobüs tünelin **içinden** geçer. Yalnız farlar görünür, Kino: "Hav-hav-hav!" (yankı) | içinden |
   | **Yokuş** | tepe | yukarı çıkarken "vıııın", aşağı inerken Kino'nun kulakları havalanır: "Yaşasın!" | yukarı ve aşağı |
   | **Su birikintisi** | yolda gölcük | geçince su "şlap" diye sıçrar, Kino ıslanır, silkelenir | (yalnız güldürmek için) |
   | **Tren geçidi** (Tur 2) | bariyer iner, tren geçer | vagonlara dokunur, vagonlar sayılır, bariyer kalkar | sayma |
4. **Var ve bul:** durak ekranı (4d), saklambaç, teslim, teşekkür süsü.
5. **Yanlış yer:** Kart başka bir evi gösteriyorsa ve çocuk yanlış eve gittiyse, o evin penceresinden başka bir karakter uzanır (kuş, maymun…) ve doğru yönü patisiyle gösterir: *"Burada değil, şurada!"* Haritada yön oku yanar. Ceza yok, puan kaybı yok. Yollar halka şeklinde olduğu için her yoldan hedefe varılır.
6. **İpucu:** 6 sn hareket olmazsa doğru yol parlar ve otobüsün önünde minik bir el kayar. Saklambaçta 6 sn içinde bulunamazsa saklanan arkadaş kıkırdar, saklandığı eşya titrer.

**Hiçbir animasyon girdiyi kilitlemez.** Kino'nun tepkileri, süs takılması ve kalpler üst üste biner. Çocuk her an haritaya dokunup devam edebilir.

---

## 6. Bir oturumun akışı (Tur 1 · Mahalle, ~4 dk)

| Sıra | Ne | Süre |
|---|---|---|
| 1 | Açılış, yaş seçimi, Mahalle kartı | 10 sn |
| 2 | Sabah hazırlığı (Kino dondurmaları kurar) | 8 sn |
| 3 | Teslim 1: **Tavşan**, pembe ev. Yol olayı: ördek geçidi. Saklandığı yer: çalının arkası | 40 sn |
| 4 | Teslim 2: **Ayı**, park. Yol olayı: trafik lambası. Saklandığı yer: kaydırağın altı | 40 sn |
| 5 | Teslim 3: **Can**, anaokulu. Yol olayı: tünel. Saklandığı yer: kum havuzunun içi | 40 sn |
| 6 | (5-6) Teslim 4: **Ördek**, sarı ev, Kino'nun tarifiyle. Yol olayı: köprü | 40 sn |
| 7 | Şenlik: parkta herkes, Kino'nun dondurması, harita izi | 30 sn |
| | **Toplam** | 3-4 dk |

Her teslimin ilk saniyesinde müzik değişir (her yerin kendi kısa ezgisi, Web Audio). Durakların sahnesi her seferinde farklıdır, aynı düzen tekrar etmez.

---

## 7. Yaşa göre

| | **3-4** | **5-6** |
|---|---|---|
| Teslim sayısı | 3 | 4 (Tur 3'te 5) |
| Kart | arkadaşın **yüzü** | evin **resmi** (çatı rengi, kapı şekli, baca, yanındaki ağaç). Haritada birbirine benzeyen iki ev var, aralarında tek bir fark var |
| Haritada | arkadaşın yüzü evinin üstünde durur, el sallar | yüz yok. Çocuk kartı haritayla karşılaştırır |
| Sıra | sırayla tek kart gösterilir | bütün kartlar dolapta. Çocuk sırayı kendisi seçer (yakındakinden başlamak serbest, ödül yok) |
| Kino'nun tarifi | yok | turda bir teslim **kartsız** olur. Kino sesle tarif eder: *"Köprüden geç, sonra sağa!"* Kavşakta sağ ve sol okları yalnız 2 yanlış dönüşten ya da 6 sn'den sonra çıkar |
| Saklambaç | tek saklanma yeri, kulak ucu görünüyor, kıkırdama sesi | 3 saklanma yeri, ipucu yalnız sözcükle: *"Kaydırağın altında!"* |
| Ördek yavrusu | 1-3 | 2-5 |
| Trafik lambası | otobüs kendiliğinden durur | çocuk kendisi durdurur (durduramazsa Kino frene basar, komik) |

Her şeyde yaş farkı yok. Sürüş, tadım anları, süs takma ve şenlik iki yaşta da aynı.

---

## 8. Turlar

| Tur | Harita | Yerler (durak sahnesi) | Arkadaşlar | Yol olayları | Teşekkür süsleri | Final |
|---|---|---|---|---|---|---|
| **1 · Mahalle** (ücretsiz) | ev sokağı, park, anaokulu, dere | pembe ev, sarı ev (`film/sokak`), park (`film/park`), anaokulu (`film/anaokulu`) | Tavşan, Ayı, Can, Ördek | ördek geçidi, trafik lambası, tünel, köprü | flama, kemik tabela, ampul zinciri | parkta şenlik |
| **2 · Sahil** | kumsal, iskele, deniz feneri, tren yolu | plaj evi, kumsal (şemsiyenin altı, kovanın arkası; `film/plaj`), iskele, kum havuzu | Elif, Maymun, Deniz, Karabaş | tren geçidi, yokuş, su birikintisi | yıldızlı jant, çatı külahı | kumsalda şenlik |
| **3 · Çiftlik ve Doğum Günü** | çiftlik, tepe, Mino'nun evi | çiftlik (saman balyasının arkası, el arabasının içi; `film/ciftlik`), Ada'nın evi, Mino'nun evi (`pencere-dogumgunu`) | İnek, Ada, Zeynep, Pamuk, **Mino** | tünel, ördekler, trafik lambası, köprü | Kino'nun kiraz tepeli şapkası | Mino'nun doğum günü: son dondurma **kupada**, üstünde mumlar (`kupa`, `mum`). Mino üfler, herkes alkışlar |

Her arkadaşın kendi dondurması var. Dondurmalar var olan çizimlerden kodla (`kule.ts`) kurulur:

| Arkadaş | Dondurma |
|---|---|
| Tavşan | külahta çilek, kalp şeker |
| Ayı | kâsede çikolata, karamel sos |
| Ördek | külahta limon |
| Can | külahta çikolata ve vanilya, serpinti |
| Elif | kâsede fıstık, minik şemsiye |
| Maymun | külahta vanilya, gofret |
| Deniz | külahta limon ve yaban mersini |
| Karabaş | kâsede çikolata, gofret |
| İnek | külahta vanilya, çilek sos |
| Ada | külahta yaban mersini, kiraz |
| Zeynep | kâsede çilek ve vanilya, kiraz |
| Pamuk | külahta çilek ve çilek, kalp şeker |
| Mino | doğum günü kupası: üç top, mumlar |

Tur 2 ve Tur 3'ün haritaları Tur 1 kusursuz olduktan sonra çizdirilir.

---

## 9. Dokunsal geri bildirim

| Dokunuş | Görüntü | Ses (Web Audio, dosya yok) |
|---|---|---|
| Otobüsü tutma | otobüs hafifçe yaylanır, egzozdan minik pof bulutu çıkar | motor "brrm" |
| Sürme | tekerler döner, Kino'nun kulakları hızla uçuşur, yolda minik toz | motor sesi hıza göre inceliyor |
| Kavşakta sapma | otobüs yatar gibi eğilip doğrulur | lastik "vıjj" (yumuşak) |
| Korna | otobüs zıplar, notalar uçar | "Dondurmaaa!" ezgisi |
| Yavru ördeğe dokunma | yavru zıplayıp karşıya geçer, ayak izi kalır | "vik!" (her yavruda bir nota yükselir) |
| Kırmızıda durma | fren, kulaklar öne savrulur | "çiii" (yumuşak fren) |
| Köprü | tahtalar sırayla iner kalkar | "tak-tak-tak" |
| Tünel | ekran kararır, farlar parlar | "Hav-hav-hav" yankısı |
| Su birikintisi | su sıçrar, Kino silkelenir, damlalar ekrana | "şlap" |
| Saklanma yerine dokunma (boş) | eşya sallanır, içinden kelebek ya da yaprak çıkar | eşyanın kendi sesi (kaydırak "boing", çalı "hışır") |
| Bulma | arkadaş "Cee!" diye fırlar, yıldızlar çıkar | kıkırdama |
| Dondurmayı verme | dondurma yay çizerek arkadaşa uçar, arkadaş yalar | "Mmm!" ve ksilofon |
| Süs takılma | süs otobüse uçar, "tık" diye oturur, parlar | "tık" ve çan |
| Bayrak dikme | bayrak yere saplanır, dalgalanır | "pıt" |
| Kino'ya dokunma | Kino havlar, kulak sallar, bazen hapşırır | "Hav!" |
| Boşluğa dokunma | minik buz yıldızı | yok |

---

## 10. Ücretsiz ve abonelik
- **Ücretsiz:** Tur 1 (Mahalle) baştan sona, iki yaş ayarıyla, şenlik dahil, sınırsız tekrar. İlk 3 teşekkür süsü de bu turda.
- **Abonelik:** Tur 2 (Sahil) ve Tur 3 (Çiftlik ve Mino'nun doğum günü) ile kalan 3 süs. Yaş ayarı kilitlenmez.
- Erişim anahtarları: `src/engine/erisim.ts` içinde `kino-otobus/tur-1` ücretsiz, `kino-otobus/*` abonelik. Kilitli tura dokunulunca mevcut kilit anı (`src/abonelik/kilit-ani.ts`) gösterilir. Web sitesinde hiçbir şey kilitli değil (şimdiki gibi).
- Mağaza vitrini Tur 1'dir: ilk 10 saniye (Kino camdan kulakları uçuşarak ördeklere yol veriyor) kayıt ve tanıtım görseli olur.

---

## 11. Seslendirme

Kurallar: Anlatıcı Mino sesi, Kino Barış'ın seçtiği Kino sesi (sesi Barış seçer). Cümleler 30 karakter civarında tutulur. v1'de kaydedilmiş cümleler varsa ("Dondurmaaa!", "Hoş geldin!", "Çak!") yeniden kaydedilmez.

**Anlatıcı (Mino sesi)**
| Anahtar | Cümle |
|---|---|
| tur_baslik | "Kino'nun Dondurma Turu!" |
| hazir | "Dondurmalar hazır!" |
| kimin_tavsan … kimin_mino | "Tavşanın dondurması!" (13 arkadaş için 13 cümle: "Ayının…", "Can'ın…", "Ördeğin…", "Elif'in…", "Maymunun…", "Deniz'in…", "Karabaş'ın…", "İneğin…", "Ada'nın…", "Zeynep'in…", "Pamuk'un…", "Mino'nun…") |
| hangi_ev | "Bu kart hangi evin?" |
| once_kim | "Önce kime gidelim?" |
| sur | "Otobüsü sür!" |
| kirmizi | "Kırmızı: dur!" |
| yesil | "Yeşil: geç!" |
| ordekler | "Ördekler geçiyor!" |
| kac_yavru | "Kaç yavru var?" |
| kopru | "Köprünün üstünden!" |
| tunel | "Tünelin içinden!" |
| yokus_yukari | "Yokuş yukarı!" |
| yokus_asagi | "Yokuş aşağı!" |
| tren | "Tren geçiyor!" |
| nerede | "Nereye saklandı?" |
| yer_arkasinda_cali | "Çalının arkasında!" |
| yer_altinda_kaydirak | "Kaydırağın altında!" |
| yer_icinde_kumhavuzu | "Kum havuzunun içinde!" |
| yer_arkasinda_agac | "Ağacın arkasında!" |
| yer_yaninda_bank | "Bankın yanında!" |
| yer_altinda_semsiye | "Şemsiyenin altında!" |
| yer_arkasinda_kova | "Kovanın arkasında!" |
| yer_arkasinda_saman | "Saman balyasının arkasında!" |
| yer_icinde_elarabasi | "El arabasının içinde!" |
| buldun | "Buldun!" |
| burasi_degil | "Burası değil, bak!" |
| herkes_aldi | "Herkes dondurmasını aldı!" |
| senlik | "Şenlik başlasın!" |
| bitti | "Bugünlük bu kadar!" |
| sayilar | "Bir" … "Beş" (varsa mevcut kayıtlar kullanılır) |

**Kino**
| Anahtar | Cümle |
|---|---|
| dondurma | "Dondurmaaa!" (var) |
| hadi_yola | "Hadi yola!" |
| geldik | "Hav! Geldik!" |
| tarif_kopru_sag | "Köprüden geç, sonra sağa!" |
| tarif_tunel_sol | "Tünelden geç, sonra sola!" |
| tarif_park_duz | "Parka kadar dümdüz!" |
| sag | "Sağa dön!" |
| sol | "Sola dön!" |
| duz | "Dümdüz git!" |
| uff | "Uff! Kırmızıydı!" |
| tunel_yanki | "Hav-hav-hav!" |
| yasasin | "Yaşasın!" |
| afiyet | "Afiyet olsun!" |
| sira_bende | "Sıra bende! Ham!" |
| cak | "Çak!" (var) |

**Balonlar (seslendirilmez):** "Cee!", "Mmm!", "Soğuk!", "Bayıldım!", "Vak!", "Akşam şenlikte!", "Burada değil, şurada!", "Teşekkürler!"

Yeni kayıt: yaklaşık 60 cümle, ~1.100 karakter (Tur 1 için ~40 cümle).

---

## 12. Çizim listesi (Gemini; yalnız Gemini, temizlik Adobe'da)

Stil ekleri ve boyut kısaltmaları `ekip/gemini/IS-LISTESI-YENI.md` bölüm 0'daki gibidir (S-NESNE, S-ARKA, S-KİLİT; K, Y, G). Kayıt yolu: `ekip/gemini/yeni/kino-tur/<dosya>.png`, sonra Adobe'da `assets/kino-otobus/<dosya>.webp`.
**Harita istemi için not:** S-ARKA'daki "The center of the image is open empty space for characters" cümlesi harita için **çıkarılır**, çünkü haritanın ortası dolu olmalı.

### Yeniden kullanılan (yeni çizim yok)
`kino-otobus/`: otobus, ic-arka, dolap, kap-* (6), top-* (6), kulah, kase, kupa, kepce, sos-*-ust ve sos-*-sise, serpinti-*, kiraz, gofret, semsiye, kalp-seker, mum, kino-onluk, kino-sapka, 6 süs (sus-*), pencere-dogumgunu, kapak (yeni kapak gelene kadar). Yalnız `tezgah-on` kullanılmaz.
Başka oyunlardan: `film/park`, `film/sokak`, `film/anaokulu`, `film/plaj`, `film/ciftlik` (3 katmanlı durak sahneleri); `film/esya/` kaydirak, salincak, bank, semsiye, kum-havuzu, agac-kovugu, saman-balyasi, el-arabasi, kova, cali; `tasitlar/tren`; bütün karakter iskeletleri (Mino dahil). Saklanma yerlerinin ön katmanlarını (kum havuzu kenarı, saman balyası) Adobe aynı çizimden keser.

### Tur 1 · 14 yeni görsel
| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| T1 | `kino-otobus/harita-mahalle.webp` | Y 2752×1536 | H | Tur 1 haritası |
| T2-T7 | `kino-otobus/ev-pembe-baca.webp`, `ev-pembe.webp`, `ev-sari-yuvarlak.webp`, `ev-sari-kare.webp`, `ev-mavi.webp`, `ev-yesil-agac.webp` | K | E | haritadaki evler ve 5-6 yaşın adres kartları |
| T8 | `kino-otobus/trafik-lambasi-kirmizi.webp` | K | E | yol olayı |
| T9 | `kino-otobus/trafik-lambasi-yesil.webp` | K | E | yol olayı |
| T10 | `kino-otobus/ordek-yavru.webp` | K | E | ördek geçidi (anne ördek mevcut iskelet) |
| T11 | `kino-otobus/teslim-karti.webp` | K | E | dondurmanın kartı (içine yüz ya da ev konur) |
| T12 | `kino-otobus/harita-bayrak.webp` | K | E | teslim edilen yer |
| T13 | `kino-otobus/korna.webp` | K | E | korna düğmesi |
| T14 | `kino-otobus/kino-sofor.webp` | K | E | şoför camından uzanan Kino (S-KİLİT) |

**İstemler**
- **T1** · A cheerful picture-book town map seen from above at a gentle tilt, like a toddler's play mat: wide smooth cream-colored roads with soft rounded corners forming two simple loops that cover the whole picture, bright green grass, a small blue creek crossing the middle with a round wooden arched bridge over it, a small rounded green hill on the right with a dark tunnel opening where the road goes inside it, a zebra crossing near the center, a small park in the upper right with a round sandbox area and trees, a kindergarten yard in the lower right with a little fence, and six empty flat house plots (plain light green squares with a short garden path to the road) on the left and in the middle where houses will be placed later. A few round trees and flower bushes along the roads. No houses, no vehicles, no traffic lights, no people, no animals, no text, no letters, no road signs with words. Edge to edge, no white border. + S-ARKA (without the center empty-space sentence)
- **T2** · A single small cute cartoon house for a picture-book town map, front view with a slight look from above, pink walls, a red triangle roof with a small brick chimney, a round brown front door, two square windows with white frames, a tiny flower box. + S-NESNE
- **T3** · Exactly the same house as T2 but with no chimney. Same size, same angle, same colors. + S-NESNE
- **T4** · A single small cute cartoon house, same style, size and angle as T2, yellow walls, an orange roof, a round window above an arched green door. + S-NESNE
- **T5** · Exactly the same house as T4 but with a square window instead of the round one. Same size, same angle, same colors. + S-NESNE
- **T6** · A single small cute cartoon house, same style, size and angle as T2, light blue walls, a dark blue roof, a rectangular yellow door, a small round mailbox next to the door. + S-NESNE
- **T7** · A single small cute cartoon house, same style, size and angle as T2, mint green walls, a brown roof, a red door, with one round green tree standing right next to its left side. + S-NESNE
- **T8** · A single cute rounded traffic light on a short cream pole, ice-blue body with soft rounded corners, three round lights: the top red light glowing brightly with a soft glow, the yellow and green lights dark and unlit, a tiny friendly look (no face). Front view. + S-NESNE
- **T9** · Exactly the same traffic light as T8, but now only the bottom green light glows brightly with a soft glow, the red and yellow lights dark and unlit. + S-NESNE
- **T10** · A single tiny fluffy yellow duckling walking, side view facing right, round body, small orange beak and feet, big shiny dark eyes, one tiny wing lifted. + S-NESNE
- **T11** · A single small rounded cream paper card with a soft ice-blue border and a tiny brown paw print in the bottom corner, the middle of the card is plain empty cream (a picture will be placed there), slightly tilted, a small ice-blue string loop at the top. + S-NESNE
- **T12** · A single small triangle flag on a thin wooden stick stuck in a tiny mound of grass, ice-blue flag with a small brown paw print, the flag gently waving. + S-NESNE
- **T13** · A single round bicycle-style horn with an ice-blue rubber bulb and a shiny golden trumpet, three small music notes coming out of the trumpet. + S-NESNE
- **T14** · Upload Kino. This puppy character wearing his small ice-blue ice cream cone cap, leaning out sideways from a vehicle window with his head and both front paws visible, ears flying backwards in the wind, eyes happy and half closed, tongue out in joy. Only the puppy from the chest up, drawn alone without the vehicle. + S-KİLİT

### Tur 2-3 · 8 yeni görsel (Tur 1 onaylanınca)
| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| T15 | `kino-otobus/harita-sahil.webp` | Y | H | Tur 2 haritası |
| T16 | `kino-otobus/harita-ciftlik.webp` | Y | H | Tur 3 haritası |
| T17 | `kino-otobus/tren-bariyeri.webp` | G 2:1 | E | Tur 2 tren geçidi |
| T18 | `kino-otobus/plaj-evi.webp` | K | E | Tur 2 harita yeri |
| T19 | `kino-otobus/deniz-feneri.webp` | K | E | Tur 2 harita yeri |
| T20 | `kino-otobus/ahir.webp` | K | E | Tur 3 harita yeri |
| T21 | `kino-otobus/mino-evi.webp` | K | E | Tur 3 harita yeri (balonlu) |
| T22 | `kino-otobus/kapak-tur.webp` | 4:3, en az 2732×2048 | H | yeni menü kartı ve açılış |

- **T15** · A cheerful picture-book seaside town map seen from above at a gentle tilt, like a toddler's play mat: wide smooth cream roads forming two simple loops, a sandy beach along the bottom edge with gentle blue waves, a short wooden pier, a railway track with a level crossing cutting across one road, a small rounded hill road on the left, a puddle on one road, four empty flat house plots, round palm-like trees. No houses, no vehicles, no people, no animals, no text. Edge to edge. + S-ARKA (without the center empty-space sentence)
- **T16** · A cheerful picture-book countryside map seen from above at a gentle tilt, like a toddler's play mat: wide smooth cream roads forming two simple loops over soft rolling green fields, a small duck pond with reeds, a round arched bridge over a creek, a green hill with a tunnel opening, a zebra crossing, fenced fields with hay bales, four empty flat plots for buildings. No buildings, no vehicles, no people, no animals, no text. Edge to edge. + S-ARKA (without the center empty-space sentence)
- **T17** · A single red-and-white striped railway crossing barrier arm on a short cream post with a small round lamp, the arm lowered horizontally, soft rounded shapes. Very wide horizontal, flat front view. + S-NESNE
- **T18** · A single small cute cartoon beach house, same style, size and angle as the attached pink house (T2), white wooden walls with light blue stripes, a turquoise roof, a round porthole window, a small striped awning. + S-NESNE
- **T19** · A single small cute cartoon lighthouse, same picture-book map style as the attached pink house (T2), red and white stripes, a round yellow light at the top, a tiny door. + S-NESNE
- **T20** · A single small cute cartoon red barn, same style, size and angle as the attached pink house (T2), white crossed beams on the doors, a small round window in the roof. + S-NESNE
- **T21** · A single small cute cartoon house, same style, size and angle as the attached pink house (T2), lavender walls, a plum roof, a round door, three colorful party balloons tied to the fence and a small bunting string above the door. + S-NESNE
- **T22** · Upload Kino and the ice-blue ice cream truck. A cheerful picture book cover scene: the ice-blue ice cream truck driving along a winding cream road through a tiny colorful town, this puppy character leaning out of the window with his ears flying in the wind, a mother duck and three ducklings waving from the roadside, a little rabbit peeking out from behind a bush, a park and small houses behind. Characters big and clear, faces fully visible. Premium glossy 2D cartoon, Disney Junior style, thick dark brown outlines, no text.

**Toplam: Tur 1 için 14, hepsiyle 22 yeni görsel.** v1'in 43 çiziminin 42'si kullanılmaya devam ediyor.

---

## 13. Kod: ne kalır, ne gider (kodcu için)

| Kalır (yaklaşık 2.000 satır, TS'nin %35'i) | Gider (yaklaşık 3.600 satır) | Yeni |
|---|---|---|
| `oyun.ts`, `main.ts`, `yukle.ts`, `varliklar.ts` (görsel haritası, yeni anahtarlar eklenir), `cizim.ts` (yer tutucular), `otobus.ts` (süs takma olduğu gibi), `efekt.ts`, `sesler.ts` (çoğu; motor, fren, vik eklenir), `dokunsal.ts` (sürükleme), `kule.ts` (dondurmayı kurmak), `kayit.ts` (jeton yerine bayrak ve süs), `musteri.ts` (karakter kurma ve boy), `ekranlar.ts`'nin açılış kısmı | `gun.ts` (tezgâh günü), `isler.ts` ve `el-isi.ts` (yan işler), `dukkan-ic.ts`, `model.ts`'nin sipariş, kontrol ve jeton kısmı, `ekranlar.ts`'nin akşam ve dükkân kısmı, CSS'in %80'i | `harita.ts` (yol ağı, ray, kavşak), `yol-olay.ts` (ördek, lamba, köprü, tünel, yokuş), `durak.ts` (sahne, saklambaç, teslim, tadım, teşekkür), `tur.ts` (tur planı, yaşa göre kart), `senlik.ts`, haritalar için yol çizgisi JSON'ları (`content/kino-tur.json`) |

- Yol ağı haritanın çizimi üstünden elle işaretlenir (her yol bir çizgi dizisi, kavşaklar düğüm). Kod yol çizmez, yalnız otobüsü yolda yürütür.
- Durak sahneleri film katmanlarını ve Pazar ile Dedektif'teki kamera yaklaşmasını kullanır (`pazar/src/kamera.ts` örnek).
- Testler: 844×390 önce, sonra 390×844 ve 1024×768. Her yol olayı sırasında haritaya dokunulabildiği, otobüsün hiçbir parmak hareketinde yoldan çıkmadığı ve yanlış evden hedefe her yoldan varılabildiği denetlenir.

## 14. MVP sırası
1. Tur 1 (Mahalle), iki yaş ayarı, 4 yol olayı, şenlik. **Önce bu, telefonda kusursuz.**
2. Tur 2 (Sahil, tren geçidi).
3. Tur 3 (Çiftlik ve Mino'nun doğum günü kupası).
