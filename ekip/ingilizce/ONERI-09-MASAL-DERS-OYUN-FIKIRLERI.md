# Öneri 09 · İngilizce Uygulaması İçin Elit Geliştirme Fikirleri: Masallar, Ders Eğlencesi ve Yeni Oyunlar

> **Hazırlayan:** Antigravity (Neon 4.0) · 22 Kasım 2026  
> **Kaynak:** Barış'ın canlı oynayış geri bildirimi (22 Kasım 03:37) + mevcut `ingilizce/src/` (`ders.ts`, `plan.ts`, `hikaye.ts`, `icerik2.ts`, `soyle2.ts`, `tanis.ts`, `oyunlar.ts`) incelemesi.  
> **Hedef kitle:** Claude (İngilizce oturumu + Yönetici) — doğrudan ilham alınıp parça parça uygulanabilecek somut, sıfır klişe tasarım fikirleri. *(Kod değişikliği yapılmadı; yalnız fikir ve tasarım önerisidir.)*

---

## 0. Barış'ın Geri Bildirimi & Mevcut Kodda Görülen 3 Kök Neden

Barış uygulamanın **premium/elit kalitesini çok beğendi**, bug görmedi; geliştirmemiz gereken 3 stratejik alanı nokta atışı işaret etti:
1. **Masal kısmı zayıf ve tekrara kaçıyor:** Mevcut kodda (`ders.ts:196–198`, `icerik2.ts:167–248`) masallar 4 cümlelik kısa bir slayt özeti gibi akıyor (*"Kino is at the farm. He sees a big cow..."*) ve hemen ardından `soyle2` ile **aynı 4 cümleyi mikrofona tekrar etme** adımına geçiyor. Ortada ne gerçek bir öykü yayı (merak → küçük sürpriz → çözüm → gülüş) ne de hikâyeyi anlayıp çözmeye dayalı görsel bir masal oyunu var.
2. **Dersler birkaç dersten sonra sıkabilir:** `tanis` içinde her kelimede mikrofon açılıyor, dersin sonunda `soyle` adımında kelimeler bir kez daha mikrofona tekrarlanıyor. Şablon 3–4 derste ezberleniyor; öğrenilen kelime o anda komik, somut bir olaya dönüşmüyor.
3. **Oyunlar bölümü çeşitlenmeli:** `Fener Avı` ve `Hide & Seek` sahne keşfiyle harika parlıyor; ancak öbür oyunların çoğu "Polly söyler → 3 karttan birine dokun" kalıbında. Çocuğun *"Bir daha oynayayım!"* diyeceği yaratıcı, komik, fiziksel/dokunsal İngilizce oyunları eksik.

---

## 1. MASAL DEVRİMİ · "Önce Gerçek Masal, Sonra Görsel Masal Oyunu!"

### 1a. Temel İlke: Masal ile Oyunu Net Ayır, Mikrofon Tekrarını Kaldır
- **Bölüm 1 — CANLI MASAL (Kesintisiz öykü keyfi, ~60–90 sn):**
  - Çocuk hikâyeyi dinlerken araya sürekli "Repeat after me!" girmesin.
  - Her masal **6 sayfa** olsun ve gerçek bir çocuk hikâyesi yayı taşısın:
    1. **Mekân & İstek:** Kino/Mino/Lokum bir yere gider, küçük bir amacı vardır.
    2. **Keşif 1:** Bir arkadaş ya da nesneyle karşılaşır.
    3. **Keşif 2 / Küçük Problem (Merak anı!):** Komik bir aksilik olur (balon uçar, şapka göle düşer, piknik sepeti boş çıkar, ördek yavrusu kaybolur!).
    4. **Etkileşimli Yardım / Seçim (Çocuk hikâyeye katılır!):** Sayfa 4'te çocuk 1 dokunuşla kahramana yardım eder ya da hikâyenin yönünü seçer!
    5. **Çözüm & Sürpriz:** Sorun komik ve sıcak biçimde çözülür.
    6. **Mutlu Kapanış & Gülüş:** Karakterin komik son repliği + kutlama.
  - **Yaşayan Sayfa (Dokun-Canlan):** Çocuk sayfayı çevirmeden önce resimdeki 2–3 şeye dokunabilsin (göldeki ördeğe dokun → `Quack!` + sıçrama; çalıya dokun → kelebek uçar; ineğe dokun → `Moo!`). Masal "donuk slayt" değil, **yaşayan resimli kitap** olur!

- **Bölüm 2 — MASAL OYUNU (Mikrofonsuz, Tamamen Görsel Anlama Soruları!):**
  - Masal bitince *"The end!"* → yumuşak geçişle **"Story Game · Masal Oyunu"** başlar (3 kısa, her biri farklı tipte görsel soru; **sıfır mikrofon baskısı**!).

### 1b. "Tekrar Olmayan" 6 Elit Masal Sonrası Oyun Mekaniği

Claude her masalda bu 6 mekanikten 3'ünü karıştırarak kullanırsa hiçbir masal bir öncekine benzemez:

| # | Mekanik | Nasıl çalışır? | Somut örnek (Barış'ın göl/ördek fikri!) |
|---|---|---|---|
| **1** | **Görsel Anlama Sorusu** *(Story Quiz)* | Polly hikâyeden somut bir **kim / ne / nerede / ne renk** sorusu sorar; çocuk 3 görsel karttan (ya da sahnenin içinden) dokunup seçer. | Polly: *"What did Kino see in the lake?"* (Ekranda 3 resim: `duck`, `car`, `apple`). Çocuk `duck`'a dokunur → Ördek zıplar: *"Yes! A little yellow duck! Quack, quack!"* |
| **2** | **Komik Hata Avı!** *(Silly Story Spotter)* | Masalın en sevilen sahnesi ekrana **bilerek 1 komik yanlışla** gelir! Çocuk hikâyeyi hatırlayıp absürt nesneyi yakalar. | Gölde ördek yerine **mor bir araba** yüzüyor! Polly kıkırdar: *"Wait a minute! Was there a purple car in the lake?"* Çocuk arabaya dokunur → araba komikçe `biip!` diye uçar, yerine gerçek **duck** gelir! *(Okul öncesi çocuklar kahkahaya boğulur!)* |
| **3** | **Masalda Kim Ne Yaptı?** *(Who Did It?)* | Hikâyede geçen bir eylem veya eşya gösterilir; çocuk o şeyi yapan karakteri (Kino / Lokum / Bulut / Polly) seçer. | Ekranda uçan kırmızı balon: *"Who lost the red balloon?"* → Çocuk Kino'ya dokunur → Kino başını kaşıyıp güler: *"Oops! That was me!"* |
| **4** | **Eksik Parçayı Tamamla!** *(Fix the Scene)* | Masalın final karesinde 1 anahtar nesne eksiktir (noktalı boşluk). Çocuk 3 nesneden doğru olanı sürükleyip yerine koyar! | Polly'nin Kino'ya verdiği balon elinde yok! *"Oh no! Something is missing. What did Polly give Kino?"* → Çocuk `blue balloon`'u sürükleyip Kino'nun patisine verir! |
| **5** | **Ses İzini Bul!** *(Who Went Splash?)* | Masalın içinden bir ses efekti + kısa ipucu çalar; çocuk hangi karakter/nesnenin o sesi çıkardığını görselden seçer. | `SPLASH! Quack, quack!` → Polly: *"Who went splash in the lake?"* → Görsel seçim (`duck`)! |
| **6** | **Senin Seçiminle Devam Et!** *(Masal İçi Mini Dallanma)* | Masalın tam 4. sayfasında 2 resimli seçenek açılır. Çocuk ne seçerse 5. sayfa o nesneyle devam eder! | *"Kino wants to give the duck a snack! Bread or an apple?"* — Hangisini seçerse ördek onu yer, komik tepki verir! Çocuk 2. kez açınca öbürünü görmek için masalı tekrar açar! |

### 1c. Somut Altın Şablon: Eski "Kino at the Farm" → Yeni "Kino at the Lake!"

**Eski hâli (4 kuru cümle + mikrofon tekrarı):**
> *"Kino is at the farm. He sees a big cow. He sees a small duck. Goodbye, cow! Goodbye, duck!"* → Ardından çocuk aynı 4 cümleyi mikrofona söyler.

**Yeni hâli (6 canlı sayfa + 3 görsel masal oyunu sorusu):**
- **Sayfa 1:** Kino mavi şapkasıyla çiftlik gölüne yürür. *"Kino walks to the sunny lake. He has a big blue hat!"* *(Şapkaya dokununca sallanır.)*
- **Sayfa 2:** Çimende kocaman bir inek görür. *"Look! A big cow is eating grass. Moo!"* *(İneğe dokununca `Moo!` + baş sallar.)*
- **Sayfa 3 (Problem!):** Rüzgâr eser — `WHOOSH!` Kino'nun mavi şapkası uçup göle düşer! *"Oh no! The wind blows! Kino's blue hat falls in the lake!"*
- **Sayfa 4 (Keşif & Yardım):** Gölde küçük sarı bir ördek yüzer. *"Wait! Who is in the lake? Tap the water!"* → Çocuk göle dokunur, sarı ördek kafasında Kino'nun mavi şapkasıyla sudan çıkar (`Quack, quack!`)!
- **Sayfa 5 (Komik Çözüm):** Ördek şapkayı Kino'ya geri getirir! *"Thank you, little duck! You look funny in my hat!"*
- **Sayfa 6 (Kapanış):** Kino, inek ve ördek el sallar. *"Goodbye, cow! Goodbye, little duck!"*

**Ardından Masal Oyunu (3 soru, sıfır mikrofon zorunluluğu):**
1. **Görsel Anlama:** *"What did Kino see in the lake?"* → Seçenekler: `duck` · `bed` · `bus` → Doğru: `duck`!
2. **Görsel Anlama (Renk/Detay):** *"What fell into the water?"* → Seçenekler: `blue hat` · `red apple` · `green ball` → Doğru: `blue hat`!
3. **Komik Hata Avı:** Sayfa 4 ekrana gelir ama ördeğin kafasında şapka yerine **dev bir muz** vardır! *"Wait! Did the duck wear a banana?!"* → Çocuk muza dokunur, muz uçar, mavi şapka ördeğin kafasına `pıt!` diye iner, herkes güler!

*(İsteğe bağlı konuşma rozeti: Masal oyunu bittikten sonra isteyen çocuk ekranın köşesindeki küçük mikrofon simgesine basıp en sevdiği 1 cümleyi Polly'ye söyleyebilir — **zorunlu değil, ödül!**)*

---

## 2. DERSLERİ SIKILMAKTAN KURTARAN 8 SOMUT FİKİR

Mevcut ders akışı teknik olarak çok temiz, ama çocuğun 5. derste *"Aynı sırayı yapıyorum"* hissine düşmemesi için **süreyi uzatmadan eğlenceyi tavan yaptıracak** 8 tasarım hamlesi:

### 1. "Çift Mikrofon" Yorgunluğunu Kaldır (`tanis` + `soyle`)
- Şu an 1. ve 2. derste çocuk 4 kelimenin her birinde `tanis` içinde konuşuyor, dersin sonunda `soyle`'da aynı 4 kelimeyi bir daha konuşuyor (toplam 8 zorunlu mikrofon duruşu!).
- **Fikir:** `tanis` aşamasında mikrofonu **zorunlu durak olmaktan çıkar** (çocuk dinlesin, görsün, dokunsun, komik tepkiyi yaşasın; isteyen küçük mikrofon tuşuna basıp hemen söyleyebilsin). Konuşma adımı dersin sonunda **tek bir eğlenceli zirve** olsun: *"Polly uykuya daldı / sihirli kapı kilitli — kelimeyi söyleyip Polly'yi uyandır / kapıyı aç!"*

### 2. "Silly Polly!" (Şakacı Polly — Her Derste 1 Kahkaha Anı!)
- Okul öncesi dil eğitiminde en yüksek dikkat tutan teknik **komik yanlış (absurdity / Protégé Effect)** tekniğidir.
- Her derste oyunların ortasında **1 kez** Polly kıkırdayarak bilerek yanlış söylesin: elmayı gösterip *"Look! A big elephant!"* desin (veya kırmızı topa *"It's a blue banana!"*).
- Çocuk gülerek yanlış resme/hayır'a dokunup Polly'yi düzeltir → Polly kanatlarını başına koyup kıkırdar: *"Oops! Silly Polly! It's an apple!"*
- **Maliyeti:** Mevcut kelime çizimleri + 1–2 genel Polly repliği (`"Oops! Silly me!"`). **Etkisi:** Çocuk kendini Polly'den akıllı hisseder, dersi hiç bırakmaz!

### 3. Her Derse 3 Saniyelik "Mini Görev Çerçevesi" (Kuru Tahta Yerine Amaç!)
- Dersin açılışında boş tahtaya 4 kutu dizmek yerine, her adanın dersine 3 saniyelik mini bir hikâye amacı bağla:
  - **Yiyecekler:** *"Lokum pikniğe gidiyor — sepete 4 yiyecek toplayalım!"* (Her öğrendiği kelime piknik sepetine zıplar!)
  - **Kıyafetler:** *"Kino dışarı çıkacak ama üstü boş — 4 kıyafet bulalım!"*
  - **Hayvanlar:** *"Çiftlik kapısı açık kalmış, 4 hayvanı geri çağıralım!"*
  - **Oyuncaklar:** *"Mino'nun oyuncak kutusu boşalmış, dolduralım!"*
- Böylece çocuk "4 kelime ezberliyorum" değil, **"Lokum'un sepetini dolduruyorum"** hisseder!

### 4. `tanis` 2.0 · Üç Yeni Fiziksel Açılış (Mevcut CSS/Canvas ile, Sıfır Yeni Çizim!)
Şu an kutu · gölge · 9 kare var; çocuk 3. adada bunları ezberliyor. Mevcut kelime PNG'lerinin üstüne 3 dokunsal açılış daha eklenebilir:
1. **Buğulu Camı Sil (Fog Wipe):** Kelime resminin üstünde hafif beyaz/mavi sis katmanı durur; çocuk parmağıyla 2 kez silince altından renkli kelime çıkar (`Minik Doktor`'daki pamuk silme mekaniğinin aynısı!).
2. **Salla & Düşür (Shake & Pop):** Kelime bir çalının/bulutun arkasında titrer ve ucundan minik bir parçası görünür; çocuk 2 kez dokunup sallayınca `"Pop!"` diye zıplayıp ortaya çıkar!
3. **Büyüteçle Yakala (Spotlight Peek):** Küçük bir yuvarlak pencere kartın üstünde kayar (sadece bir köşesi görünür: ineğin boynuzu, elmanın sapı!); çocuk dokununca tüm resim açılır!

### 5. Ders Ortası 5 Saniyelik "Vücutla Oyna!" Molası (TPR — Total Physical Response)
- 2–6 yaş çocukların dikkat süresi ortalama 90–120 saniyedir. Dersin tam ortasında (2. adımdan sonra) **5 saniyelik eğlenceli hareket molası** ekran yorgunluğunu sıfırlar:
  - Polly hareket animasyonuyla der: *"Jump like a frog! One, two, three!"* / *"Touch your nose!"* / *"Clap your hands! Clap, clap!"* / *"Flap your wings like Polly!"*
  - Çocuk ister kalkıp yapar ister Polly'ye dokunup zıplatır; 5 saniye sonra oyuna taze enerjiyle döner!

### 6. Misafir Karakter Rotasyonu (Her Derste Aynı Yüz Olmasın!)
- Ceren Öğretmen + Polly ana ev sahipleri olarak kalsın, ama adanın temasına göre **Minkino kadrosu misafir gelsin** (mevcut onaylı pozlarla!):
  - Çiftlik / Doğa → **Bulut**
  - Yiyecekler / Sofra → **Lokum** (her kelimede *"Mmmm!"* ya da komik surat!)
  - Evim / Oyuncaklar → **Mino**
  - Hareketler / Park → **Zıpzıp**
- Sadece köşede doğru cevapta zıplayıp sevinmesi bile çocuğa *"Bugün derse Lokum gelmiş!"* heyecanı verir!

### 7. Mini Animasyonların (Paket 30) "Sürpriz Ödül" Kullanımı
- Hazır kurulan 4-karelik mini animasyonlar (`rain` şemsiye, `apple` ısırık, `cold` atkı, `big/small` balon, `sleep` baloncuk) dersin yalnız başında değil, **doğru cevap sonrası sürpriz komedi ödülü** olarak da patlasın! Çocuk *"Acaba bu kelimede ne komiklik olacak?"* merakıyla sıradaki soruya geçer.

### 8. Ders Sonu 10 Saniyelik "Kendi Sahneni Süsle" Finali
- Kuru "3 yıldız kazandın" ekranı yerine, ders bittiğinde çocuk bugün öğrendiği kelimelerden **en sevdiği 1 tanesini seçip** adanın sahnesine veya Polly'nin Ağaç Evi'ne kendi eliyle koysun (*"Which one do you want to keep?"*). Seçim + sahiplik = ertesi gün geri dönme sebebi!

---

## 3. OYUNLAR BÖLÜMÜNÜ ZİRVEYE TAŞIYACAK 8 YENİ İNGİLİZCE OYUNU

Mevcut oyunların yanına, *"quiz değil gerçek oyun!"* hissi veren 8 fikir — ilk 4'ü **mevcut kelime ve karakter çizimleriyle neredeyse sıfır yeni çizimle** kurulabilir!

### Grup A · Mevcut Çizimlerle Hızlı Kurulabilecek 4 Elit Oyun

#### 1. **Polly's Silly Suitcase (Şakacı Tatil Bavulu!)**
- **Konsept:** Polly bir yolculuğa çıkıyor (Plaj / Kar / Piknik / Çiftlik). Açık bir bavul ve rafta 6–7 kelime resmi durur.
- **Oynanış:** Polly söyler: *"Pack an apple and a blue hat!"* Çocuk sürükleyip bavula atar; bavul memnuniyetle sallanır.
- **Komedi & Öğrenme:** Çocuk yanlış ya da komik bir şey atarsa (ör. bavula **cow** ya da **bed** atarsa!) bavul şişer, inek bavulun içinden kafasını çıkarıp `"Möö!"` der ve komikçe geri zıplar: *"Haha! A cow doesn't fit in a suitcase!"*
- **Neden elit:** Çoklu dinleme anlama (`X and Y`), sıfır sıkıcılık, mevcut kelime + 1 bavul çizimiyle tam oyun!

#### 2. **Mino's English Cafe (İngilizce Sipariş — Minik Şef Esintisi!)**
- **Konsept:** Tezgâhın önüne sırayla Kino, Lokum, Bulut, Zıpzıp gelir ve tek cümle İngilizce sipariş verir: *"I want a banana and milk, please!"* veya *"Two apples, please!"*
- **Oynanış:** Çocuk raftan sürükleyip tabağa koyar ve karaktere uzatır.
- **Komedi:** Doğruysa karakter yer, kalpler çıkar: *"Yummy! Thank you!"* Çocuk bilerek başka bir şey (ör. şapka ya da acı biber!) verirse karakter komik şaşkın surat yapıp güler: *"Wait! That's a hat! Haha!"*
- **Neden elit:** Sayı + yiyecek + nezaket (`please / thank you`) gerçek bağlamda, Minik Şef sıcaklığında birleşir!

#### 3. **Magic Wand Lab (Sihirli Değnek · Renk & Boyut Büyüsü!)**
- **Konsept:** Ortada bir nesne/hayvan durur (`a dog`, `a ball`, `a car`). Kenarda 4 renk boya kovası ve 2 sihirli düğme (`BIG` / `SMALL`).
- **Oynanış:** Polly büyü söyler: *"Abracadabra! Make a BIG RED car!"* Çocuk önce `BIG`'e sonra `RED`'e (veya sihirli değnekle arabaya) dokunur → araba kocaman ve kıpkırmızı olur, neşeyle korna çalar!
- **Serbest Mod:** 3 görevden sonra 1 tur *"Now YOU are the wizard!"* — çocuk istediği rengi ve boyutu seçer, Polly çocuğun yarattığını İngilizce okur (*"Whoa! A small purple cow!"*)!
- **Neden elit:** Çocuk dili **üreterek ve komik sonuç görerek** öğrenir; mevcut renkli/CSS filtreli çizimlerle anında çalışır!

#### 4. **Knock Knock! Who's Behind the Bush? (Ses Dedektifi)**
- **Konsept:** Ekranda 3 titreyen çalı / kapı / kutu var. Birinin arkasından ses efekti + kısa İngilizce ipucu gelir: *"[Quack!] I am small and yellow. Who am I?"*
- **Oynanış:** Çocuk doğru çalıya dokununca çalı açılır, hayvan fırlayıp zıplar: *"Peek-a-boo! It's a duck!"* Yanlış çalıya dokununca minik bir kelebek ya da kıkırdayan Mino kafasını uzatıp saklanır (*"Not here! Hehe!"*).
- **Neden elit:** `Fener Avı`'nın gündüz/sesli kardeşi; 2–3 yaştan 6 yaşa kadar herkes oynar!

---

### Grup B · Amiral Gemisi / Yüksek Tekrar Oynanabilirlikli 4 Büyük Oyun (1.2+ Yol Haritası)

#### 5. **Story Theater (Kendi İngilizce Masalını Kur!)**
- **Konsept:** Barış'ın masal vurgusunu taçlandıran **yaratıcı oyun!**
- **Oynanış:** Çocuk 3 kart seçer:
  1. **Kahraman:** `Kino` / `Mino` / `Lokum`
  2. **Mekân:** `Farm` / `Beach` / `Park`
  3. **Sürpriz Eşya:** `Red balloon` / `Big cake` / `Yellow duck`
- **Sonuç:** Polly bu 3 seçimden anında **3 sayfalık canlı, komik, sesli bir İngilizce mini hikâye** oynatır (*"Lokum goes to the beach! She finds a big cake! Splash! Oh no, a duck wants the cake too!"*)!
- **Neden elit:** 3 × 3 × 3 = **27 farklı komik masal**! Çocuk her seferinde *"Bu sefer Kino'yu parka pasta ile göndereyim!"* diye defalarca oynar (Toca / Sago Mini seviyesi yaratıcılık!).

#### 6. **Build a Silly Friend (Komik Dostunu Kur · Vücut + Sayı + Renk)**
- **Konsept:** Boş, sevimli, tüylü bir gövde durur. Polly söyler: *"Give him THREE eyes! Give him BIG ears! Give him a GREEN hat!"*
- **Oynanış:** Çocuk parçalardan sürükleyip takar; her takılan göz kırpar, kulak sallanır! Bitince komik dost müzikle 3 sn dans eder!
- **Neden elit:** Okul öncesi İngilizce uygulamalarının (Lingokids / Endless Alphabet) en yüksek geri dönüş sağlayan oyun türüdür; sayı + renk + boyut + vücut bölümlerini kahkahayla pekiştirir.

#### 7. **Polly's Delivery Train (İngilizce Teslimat Treni)**
- **Konsept:** Polly makinist; tren 3 istasyondan geçer (Çiftlik, Meyve Pazarı, Oyuncak Dükkânı).
- **Oynanış:** Her durakta istasyondaki arkadaş (Bulut, Lokum, Mino) bir şey ister: *"I need the yellow banana!"* Çocuk vagonlardaki 4 eşyadan doğruyu sürükleyip arkadaşa verir → tren `"Choo-choo!"` diye öbür istasyona gider!
- **Neden elit:** Hareket, ritim ve somut teslimat amacı var; mevcut kelime kartlarını doğrudan kullanır!

#### 8. **Treasure Map Quest (Adada 4 Duraklı Hazine Avı)**
- **Konsept:** Çocuk küçük bir hazine haritasında 4 adımda ilerler — her durak başka bir mini meydan okuma (1: ses bul, 2: komik hata avla, 3: 2 şey topla, 4: şifreyi söyle/seç).
- **Ödül:** 4. durakta hazine sandığı açılır ve içinden **Polly'nin Ağaç Evi'ne** özel, sürpriz bir eşya (teleskop, hamak, parlayan lamba) çıkar!
- **Neden elit:** Oyunlar bölümü ile Ağaç Evi ödül sistemini birbirine bağlayarak uzun vadeli bağlılık yaratır!

---

## 4. Claude İçin Hızlı Öncelik Haritası (En Hızlı, En Büyük Etki)

| Öncelik | Hamle | Tahmini iş yükü | Çocuktaki / Velideki etkisi |
|---|---|---|---|
| **1 (İlk darbe · Masal)** | Masal akışından zorunlu `soyle2` yankı tekrarını ayır; yerine **3 görsel Masal Oyunu** (`Görsel Anlama`, `Komik Hata Avı`, `Eksik Parçayı Tamamla`) + Çiftlik için 6 sayfalık canlı pilot masal (*Kino at the Lake*) kur. | Orta (mevcut `hikaye.ts` genişletilir) | Barış'ın *"masal çok zayıf kalmış"* eleştirisini bir gecede **en güçlü vitrin özelliğine** çevirir! |
| **2 (Ders sıkıcılığını kır)** | `tanis` + `soyle` çift mikrofon tekrarını teke indir + her derse **1 Silly Polly (Şakacı Yanlış)** anı + 3 sn'lik mini amaç çerçevesi + **Buğulu Camı Sil** açılışı ekle. | Düşük (çoğu kod + 5–10 genel Polly sesi) | Dersler "ödev" hissinden çıkıp çizgi film oynama hissine döner. |
| **3 (Oyunlar bölümü)** | Mevcut çizimlerle **Polly's Silly Suitcase** ve **Mino's English Cafe** ekle (ardından 1.2'de **Story Theater**). | Düşük–Orta (mevcut kelime + karakter kartları) | Çocuk İngilizce uygulamasını ders için değil **oyun için** kendi açmaya başlar! |
