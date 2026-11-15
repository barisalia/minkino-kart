# Harf Atölyesi — geliştirme planı (Codex için)

Yazan: Claude, 2026-11-14. Kod: `alfabe/src`. Çizim: Astra. Karar veren: Barış.

## Şu anki durum

29 harf var. Her harfte aynı 5 adım: dinle ve söyle, büyük harf, küçük harf, harf kutusu, mıknatıslar. Sesler ve yazma yolları hazır, albüm var. Temel sağlam.

## Neden oyun gibi durmuyor

1. **Aynı 5 adım 29 kez dönüyor.** B'yi bitiren çocuk C'de ne olacağını biliyor. Merak yok.
2. **Ekran çalışma kâğıdı gibi.** Düz zemin, kutular, yazılar. Bir dünya, bir karakter, bir hikâye yok.
3. **Çocuk okuyamıyor ama ekran yazı dolu.** "Dik çizgiye sağdan iki karın ekle", "Resmi kutuya götür", "Mıknatısları birleştir", "Bir daha göster".
4. **Harf bitince bir şey olmuyor.** Küçük bir resim kutuya ekleniyor, o kadar.
5. **29 harf birden açık ve alfabe sırasında.** Çocuk rastgele dolaşıyor, öğrendiği harfler bir kelimeye dönüşmüyor.
6. **Yanlış cevap kuru.** "Bu kez başka bir resmi deneyelim."
7. **Tekrar yok.** Dün öğrenilen harf bir daha karşısına çıkmıyor.

## Hedef

Her harf bir arkadaş olsun (A arı, B balık, C ceviz…). Çocuk harfi "bitirmesin", arkadaşını kasabaya getirsin. Harfler birikince kelime kursun. Yazı görmeden, dinleyerek ve dokunarak oynasın.

## Çalışma kuralları

- Her turda tek iş. Bitince Barış telefonda bakar, beğenirse sıradakine geçilir.
- **Kodla çizim yapılmaz.** Yeni görsel gerekiyorsa turun altındaki listeyle Astra'dan istenir. Astra çizene kadar o tur beklemez; çizim gerektirmeyen kısmı yapılır.
- Yeni ses kaydı kredi harcar; üretmeden önce Barış'a sorulur. Önce eldeki 7 kayıt (`big, find, join, label, model, small, speak`) kullanılır.
- Ceza yok, süre yok. Ceren'in cümlesi kısa; çocuk dokununca konuşma kesilir.
- Kayıtlı ilerleme (`minkino-alfabe-v1`) bozulmaz. Testler geçmeden iş bitmiş sayılmaz.

---

## Tur 1 — Yazıları kaldır

**Ne:** Çocuğa yönelik bütün yazılar gider. Yerine ses ve hareketli gösterim gelir.
- Adım başlıkları ("B b · Büyük harf"), "Ceren / Sen" etiketleri, yazma tarifleri, "Resmi kutuya götür", "Parçaya dokun ya da…" kalkar.
- "Bir daha göster" yazılı düğmesi yerine tek resimli düğme: göz ya da kalem simgesi.
- Yapılacak şey görünür olsun: yazmada başlangıç noktası yanıp söner, kutuda bir resim kutuya doğru bir kez kendiliğinden kayıp geri döner.
- Üstte yalnız geri oku ve 5 nokta kalır.

**Bitti sayılır:** Ders ekranlarında harfin kendisi ve mıknatıs parçaları dışında okunacak yazı yok. Sesi kapalı bir yetişkin bile ne yapacağını hareketten anlıyor.

## Tur 2 — Harf kutusu aç canavar olsun

**Ne:** Kırmızı kutu zaten ağızlı. Onu canlandır.
- Kutu acıkmış: karnı guruldar, ağzını açıp kapar.
- Doğru resim gelince yutar, "nam nam" der (`yum` kaydı var), göbeği şişer.
- Yanlış resim gelince yüzünü buruşturur, resmi "pöf" diye geri üfler. Resim yuvarlanıp yerine döner. Uyarı cümlesi yok.
- Tek soru yerine 3 lokma: ilkinde 2 resim, sonra 3, sonra 4.
- Resme dokununca adı duyulur (çocuk "balık" kelimesini duyup ilk sesi kendi yakalar).

**Bitti sayılır:** Çocuk bilerek yanlış resmi vermek istiyor çünkü komik. Üç lokmadan sonra kutu geğirip uyuyor.

**Astra'dan:** kutunun 4 yüzü (aç, çiğniyor, tiksinmiş, tok). Tek sayfa, 4 çizim.

## Tur 3 — Yazınca harf canlansın

**Ne:** Çizgi bitince yeşil onay yerine bir olay olsun.
- Parmak ilerledikçe iz parlak boyayla dolar ve her çizgi parçasında bir nota çalar.
- Büyük harf bitince harfin arkadaşı harfin üstüne gelir: A'ya arı konar, B'nin karnında balık yüzer, D davul olur ve gümler. Eldeki 29 örnek resim (`01.webp`…`29.webp`) kullanılır, yeni çizim istemez.
- Küçük harf bitince büyük ile küçük yan yana zıplar, Ceren adını söyler.
- Çocuğun kendi yazdığı harf saklanır (renk zaten saklanıyor) ve albümde onun el yazısı görünür.

**Bitti sayılır:** Her harfin bitişi farklı görünüyor. Albümde çocuğun kendi çizgisi duruyor.

## Tur 4 — Harfler grupla açılsın, kasabaya taşınsın

**Ne:** 29 düğmelik ızgara yerine bir sokak. Her harfin bir evi var.
- Harfler 5–6'lık gruplarla açılır. Sıra, okullardaki ses grupları sırasıdır (güncel MEB programından doğrulanacak; eski sıra: E L A K İ N / O M U T Ü Y / Ö R I D S B / Z Ç G Ş C P / H V Ğ F J). Böylece ilk grupla hemen kelime kurulur: el, al, ela, kale.
- Harf bitince evinin ışığı yanar, arkadaşı pencereden bakar. Eve dokununca sesini çıkarır.
- Sıradaki ev hafifçe sallanır. Kapalı evler perdeli durur, dokununca "sıra bana da gelecek" gibi kısa bir tepki verir.
- İsteyen ebeveyn kapısından bütün harfleri açabilir.

**Bitti sayılır:** Çocuk nereye gideceğini sormadan biliyor. Üç harf bitiren çocuk sokakta üç ışıklı ev görüyor.

**Astra'dan:** sokak arka planı (yatay, kaydırılabilir, tek çizim) ve ev: açık, kapalı, ışıklı (tek sayfa, 3 çizim). Evler renkle çeşitlenir.

## Tur 5 — Mıknatıslar tren olsun, kelime canlansın

**Ne:** Aynı mekanik, başka his.
- Parçalar vagon. Çocuk vagonları lokomotifin arkasına sırayla takar. Her takışta o ses duyulur.
- Son vagon takılınca tren hareket eder, sesler hızlanarak birleşir: "b… al… bal!". Ardından kelimenin resmi belirir ve oynar (bal damlar, at koşar).
- Yanlış vagon takılmaz, tampona çarpıp geri kayar.

**Bitti sayılır:** Çocuk kelimeyi tren kalkmadan önce kendisi söylemeye çalışıyor.

**Astra'dan:** lokomotif, boş vagon, ray (tek sayfa, 3 çizim).

## Tur 6 — Her grubun sonunda şenlik

**Ne:** Bir grup bitince karışık bir oyun açılır. Soru sormaz, o grubun harflerini birlikte kullandırır.
- **Harf yağmuru:** harfler balonla yükselir, Ceren bir ses söyler, çocuk o balonu patlatır. Benzer harfler (b ile d, m ile n) burada karşılaşır.
- **İlk kelimem:** grubun harfleriyle 3 kelime kurulur. Her kelime sokağa bir şey ekler: "kale" kurulunca sokağın ucunda kale belirir.
- Günün ilk girişinde önceki günün harfi 20 saniyelik tek soruyla geri gelir.

**Bitti sayılır:** İlk grubu bitiren çocuk en az 3 kelimeyi kendi kurmuş oluyor. Dünkü harf bugün bir kez karşısına çıkıyor.

## Tur 7 — Ses avı

**Ne:** Beş adımdan biri bazı harflerde yer değiştirir, böylece her harf aynı gitmez. Bir sahne (mutfak, bahçe, oda) açılır, içinde o sesle başlayan 3 şey saklıdır. Çocuk dokunarak bulur, bulduğu şey adını söyleyip zıplar.

**Bitti sayılır:** Arka arkaya iki harfin adımları birbirinin aynısı değil.

**Astra'dan:** 3 sahne ve saklanacak eşyalar. Sayfa planı bu tura gelince çıkarılır.

## Yaşa göre

- **3–4 yaş:** dinle ve söyle, canavar, ses avı. Yazma ve tren isteğe bağlı.
- **5–6 yaş:** hepsi. Küçük harf ve kelime kurma öne çıkar.

## Sıra önerisi

Tur 1, 2 ve 3 yeni çizim beklemeden başlar (Tur 2'nin yüzleri gelene kadar kutu eldeki çizimle hareket eder). Astra bu sırada Tur 4 ve 5'in çizimlerini hazırlar.

---

## 2026-11-14 Akşam Değerlendirmesi — Neden Hâlâ Sıkıcı ve Nasıl Gerçek Oyuna Dönüşür?

Barış mevcut oynanışı sıkıcı buldu. `alfabe/src/` içindeki hem 5 ana adımın hem de 3 yeni kasaba oyununun (`ses-koprusu.ts`, `hece-treni.ts`, `kelime-sahnesi.ts`) çalışma kâğıdı/alıştırma havasından çıkıp oyuncak gibi çalışması için yapılacaklar:

### 1. Ana Harf Dersindeki 5 Adım (Somut Neden-Sonuç)
- **Dinle ve Söyle (`konusma-dersi.ts`):** Ekranda yalnız harf SVG'sinin içindeki yeşil `<rect>` çubuğunun dolması mikrofon testi gibi duruyor. Harfin nesnesi (`Armut`, `Balık`, `Tren`) sahnede **uyuyor, yaprak arkasında saklanıyor ya da balon içinde bekliyor** olmalı. Çocuk ses verdikçe (veya dokunmatik modda nesneye basılı tuttukça `"Aaaaa..."` sesi uzarken) nesne titreyip büyümeli; dolunca **fırlayıp canlanmalı**.
- **Büyük & Küçük Harf Yazma (`yazma.ts`):** Boş kâğıda düz çizgi çekmek yerine parmağın ucunda yıldız/uğur böceği yolu takip etsin, her vuruş bittiğinde `"tık-çın!"` diye yerine otursun. Büyük harf **Anne/Baba Harf**, küçük harf **Yavru Harf** olarak nesneyle ilişkilendirilsin.
- **Harf Kutusu (`harf-kutusu.ts`):** Cansız kutuya 1 kart atıp bitirmek yerine **Acıkan Harf Canavarı** gözleriyle sürüklenen kartı takip etsin, 4–5 kart içinden o sesle başlayan **2 doğru nesneyi** peş peşe yesin. Yanlış kartta sadece eğilip dönmesin; **ekşi yemiş gibi yüzünü buruşturup `"Hapşuuu!"` diye kartı komikçe geri zıplatsın**.
- **Mıknatıslar (`miknatis.ts`):** Mıknatıslar birleştiği anda yalnız yazı (`mik-kelime`) büyümekle kalmasın; birleşen kelimenin **canlı nesnesi sahnede patlayarak/zıplayarak ortaya çıksın**.

### 2. Üç Kasaba Oyunu (`Ses Köprüsü`, `Hece Treni`, `Kelime Sahnesi`)
- **Ses Köprüsü (`ses-koprusu.ts`):**
  - *Sorun:* `"Elma hangi sözcüğe bağlanır?"` sorusuyla son-ses → ilk-ses bulmacası 4–5 yaş için soyut bir şıklı test gibi kalıyor; araba da en sona kadar kilitli.
  - *Çözüm:* Açılışta çocuk **Posta Arabasına dokunarak / iterek** başlasın; araba kırık köprü ucuna gelip dursun. Köprüdeki tahtanın sağ ucunda son ses (`A` / `T`) **parlayan renkli mıknatıs/yapboz ucu** olarak görünsün. Doğru tahta takıldığı **anda** araba bekletmeden o tahtanın üstüne ilerlesin; 2. tahta takılınca ayrıca `"Postayı götür"` butonuna basmaya gerek kalmadan karşıya geçip mektubu teslim etsin.
- **Hece Treni (`hece-treni.ts`):**
  - *Sorun:* Tek bir `.ht-yukle` butonuna 2–3 kez basıp fazla basınca `"↶"` geri al butonuna basmak sayaç formu (`+1 / -1`) gibi hissettiriyor.
  - *Çözüm:* `+1` ve `↶` butonları yerine çocuk **doğrudan trenin 1., 2., 3. vagonuna dokunarak (veya kasayı vagona bırakarak)** yüklesin! Her dokunuşta vagon yaylanıp o heceyi söylesin (`"ŞEM!"`, `"Sİ!"`, `"YE!"`). Dolu vagona dokununca yük geri çıksın. 2 heceli kelimede 3. vagona dokunursa vagondaki yay `"Boing!"` diye kutuyu geri zıplatsın.
- **Kelime Sahnesi (`kelime-sahnesi.ts`):**
  - *Sorun:* Doğru kart (`ZİL`, `PİL`, `TAS`) seçildiğinde sahne duruyor ve ikinci kez `"Zili çal"` / `"Pili tak"` butonuna basmayı bekliyor (`adim = 'oynat'`), oysa yanlış kartta hemen oynuyor.
  - *Çözüm:* Açılışta çocuk sahnedeki **kapalı perdeye, karanlık fenere veya susamış kuşa dokunabilsin** (tepkiyi görsün). Kart seçildiği / harf yuvasına takıldığı **anda** ikinci bir `"Zili çal"` tıklaması beklemeden sahne canlansın! Ayrıca ilk iki sahnede üst üste aynı `ZİL/PİL` ikilisini kullanmak yerine farklı bir çift (ör. **`BAL` / `DAL`**) eklensin.

