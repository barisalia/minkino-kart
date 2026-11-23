# Minik Doktor · vaka planı

Claude (Harf / Minik Doktor), 22 Kasım 2026 gecesi. Yöneticinin isteği; kaynak `ekip/senaryo/MINIK-DOKTOR.md` (danışmanın 14 vakası) ve Barış'ın Dikenli Pati'yi oynadıktan sonraki sözü: "UI'lar çok güzel, sistem oturmuş; ama devamı gelmemiş, çok kısa. Gerçekten sabunladığını, sildiğini hissetmiyorsun. En az 5–10 tane daha böyle iş lazım."

Bu belge on vakanın planıdır: ikisi kurulu, sekizi yeni. Çizim brief'leri `CLAUDE-ASTRA-MESAJLAR.md`'de (Doktor-A1, Y2…Y10); her yeni vaka önce tek anahtar kareyle başlar.

## Değişmeyen sistem

- **Masa (hub):** aynı klinik, yukarıdan. Hasta sedyede, solda doktor çantası, altta şerit, sağ altta Kino. Çanta açılır, hastanın derdine dokununca yakın plana geçilir.
- **Yakın plan:** dert büyük görünür. Hastanın yüzü ve Kino hep kadrajda; ikisi de her adıma tepki verir.
- **Kapanış:** son hamleden en çok 2 sn sonra masada kutlama; hasta zıplar, yıldız yağar, "yeniden oyna" ve "sıradaki hasta" hazır.
- **Yaş basamağı:** 2–3 yaşta daha az iş ve daha geniş hedef, 4 yaşta orta, 5+ yaşta tam. Akış aynı kalır.
- **Yasak:** insan, kan, iğne, hap, makas, çilek; aletlerde yüz yok. Kulağa ve göze alet sokulmaz.

## "Gerçek his" kuralları (her vakada)

1. Alet parmağı izler, gittiği yöne yatar, gölgesi vardır. Götürülüp bırakılan alet yoktur.
2. Her hareket iz bırakır: silinen yer gerçekten silinir (maske), köpük geçilen yolda birikir, su akar ve sıçrar, bez ıslanır ve kirlenir.
3. İlerleme süreyle değil hareketle ölçülür: parmağın yolu, tur sayısı, yönü. Yerinde tutmak da ilerletir ama yavaş (küçük çocuk takılmaz).
4. Temas anında alet durum değiştirir: cımbız kapanır, sprey başlığı basılır, pamuk kirlenir, rulo incelir.
5. Her vakada en az iki yeni el hareketi; aynı hareket bir vakada iki kez yapılmaz.
6. Yanlış hamle komik bir sonuç verir, ceza yoktur.

## Vakalar

| # | Paket | Hasta | Dert | Yeni el hareketleri | Durum |
|---|---|---|---|---|---|
| 1 | Y1 + A1 | Zıpzıp | Çalıya düşmüş: çamurlu patiler, kolda diken | zıplat; kolu çevir, ıslat, sabunla, ovuştur, durula, kurula; stetoskobu kalpte tut; gezdir-bul, köpükle ov, gerip çek, pamuğu daldır ve sil, çevirip sar, bandı yapıştırıp düzelt; çıkartmayı soy ve yapıştır, damga bas | Oyunda, on iki sahnenin hepsi gerçek çizimle (23 Kasım 04:05): A1'in 193 karesi denetlendi ve bağlandı |
| 2 | Y2 (yeni) | Mino | Kurabiyeli dişler | çeneyi gıdıkla, aynayı gezdir-bul, dişlere tek tek dokun, sürerek sık, ileri geri fırçala, bardağı tut, yanaklara sırayla dokun, ipi aşağı yukarı oynat, aynayı tut (dokuz adım) | Baştan kuruldu (23 Kasım): `doktor/src/vaka-dis/`, `?oyun=disler`; 99 kare: `DOKTOR-Y2-PARCALAR.md`; anahtar kare istendi (sıra: Y6'dan sonra). Eski kısa hâl `doktor/src/dis/` içinde, klinik şimdilik onu açıyor. Mino'nun ses klonu kararı Barış'ta |
| 3 | Y3 | Bulut | Ateşi çıkmış | salla, daldır ve sık, bastırıp gezdir, bardağı tut, tek tek at, çevirerek kapat, yelpazele | Kod hazır (`doktor/src/vaka-ates/`, `?oyun=ates`; İngilizce yan oturumu). 85 çizim: `DOKTOR-Y3-Y4-PARCALAR.md`; Astra'nın sırasında (Doktor-A1'den sonra) |
| 4 | Y4 | Mila | Parmak boyası her yerinde | sabunu sürt, süngerle ov, kovada çalkala, nokta nokta dokun, püskürt, kurula, baloncuk patlat, aynayı tut | Kod hazır (`doktor/src/vaka-boya/`, `?oyun=boya`; İngilizce yan oturumu). 83 çizim: `DOKTOR-Y3-Y4-PARCALAR.md`; Astra'nın sırasında |
| 5 | Y5 | Pamuk | Hapşırıyor, burnu tıkalı | çekip kopar, eğerek dök, serpiştir, yelpazele (sekiz adım) | Kod hazır (`doktor/src/vaka-hapsu/`, `?oyun=hapsu`; İngilizce yan oturumu). 81 çizim: `DOKTOR-Y5-Y6-PARCALAR.md`; anahtar kare bekliyor (sıra: Y4 → K1 → Y5 → Y6). Pamuk'un sesi için klon kararı Barış'ta |
| 6 | Y6 | Polly | Kanadı karışmış, pıtrak takılmış | yönlü tara, çevirip oturt, iki ucu birleştir (sekiz adım) | Kod hazır (`doktor/src/vaka-kanat/`, `?oyun=kanat`; İngilizce yan oturumu). 81 çizim: `DOKTOR-Y5-Y6-PARCALAR.md`; anahtar kare bekliyor. Polly'nin 12 sözü kayıtlı |
| 7 | Y7 | Lokum | Karnı gurulduyor | sıcak-soğuk ara, çerçeveyi kaydır, sürterek ısıt, yavaş daire çiz, karıştır, yukarı üfle, ağza tut, koyup vur (sekiz adım) | Kod hazır (`doktor/src/vaka-karin/`, `?oyun=karin`; İngilizce yan oturumu). 80 çizim: `DOKTOR-Y7-Y9-PARCALAR.md`; anahtar kare bekliyor (sıra en sonda, Y2'den sonra). Lokum'un sözleri yazılı; ses kararı Barış'ta |
| 8 | Y8 | Kuzu (oyuncak) | Pamuğu çıkmış, düğmesi düşmüş | tıkıştır, yama seç-koy, köşe köşe bastır, cırt cırtı çek, vidalayarak tak, fiyonk bağla, fırçayla kabart (sekiz adım; iğne yok) | Kod hazır (`doktor/src/vaka-kuzu/`, `?oyun=kuzu`; İngilizce yan oturumu). 84 çizim: `DOKTOR-Y8-Y10-PARCALAR.md`; anahtar kare bekliyor (sıra en sonda). Lokum'un sözleri yazılı; Kuzu'nun "mee"si efekt |
| 9 | Y9 | Bulut | Kulak tüyünde uğur böceği | büyüteçle bul, tüyleri arala, yavaşça yaklaştır, sarsmadan taşı, yukarı çekip uçur, kökten uca fırçala, kulağı salla, dokunup uğurla (sekiz adım; böceğe alet dokunmaz) | Kod hazır (`doktor/src/vaka-bocek/`, `?oyun=bocek`; İngilizce yan oturumu). 82 çizim (+ Y1'in büyüteci): `DOKTOR-Y7-Y9-PARCALAR.md`; anahtar kare bekliyor (sıra en sonda). Bulut'un sözleri yazılı; ses kararı Barış'ta |
| 10 | Y10 | Mino | Karnından "tıngır" sesi geliyor | bastır-bırak zıplat, kaçan sesi takip et, fermuarı çek, topu çek çıkar, vuruşta dokun, fırlat, eldivenle yakala, tokaya basılı tut (sekiz adım) | Kod hazır (`doktor/src/vaka-cingirak/`, `?oyun=cingirak`; İngilizce yan oturumu). 80 çizim: `DOKTOR-Y8-Y10-PARCALAR.md`; anahtar kare bekliyor (sıra en sonda). Mino'nun sözleri yazılı |

Sıra, el hareketleri kolaydan zora gidecek biçimde: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10. Aynı hasta art arda gelmez.

### 1) Zıpzıp'ın Dikenli Patisi (Y1 + A1)

Barış'ın temel kuralına (KALITE-KURALLARI madde 0) göre uzatıldı: her adımda çocuğun gerçek bir el hareketi, her hareketin kendi kareleri. Kod baştan sona hazır ve geçici çizimlerle sınanıyor; çizimi gelen aşama kendiliğinden açılır, gelmeyen atlanır (yer tutucu yok).

| # | Sahne | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Geliş (masa) | Zıpzıp'a dokunur: üç zıplayış | Zıpzıp topallayarak girer (altı kare), Kino el sallar. Her dokunuşta sedyeye doğru zıplar; konunca Kino güler. |
| 2 | Çanta | Dokunur | Çanta açılır, aletler tek tek çıkar. |
| 3 | Lavabo: doktorun el yıkaması | Musluk kolunu çevirir, patileri suya tutar, sabunu sürer, ovuşturur, durular, musluğu kapatır, havluyla kurular | Su akar ve sıçrar, sabun sürüldükçe köpük birikir, sekiz karelik ovuşturma, aynada Kino tepki verir, köpük suyla gider, damlalar havluyla silinir. |
| 4 | Göğüs: stetoskop | Stetoskobu göğüste gezdirir, kalbin üstünde tutar | Kalbe yaklaştıkça "güm güm" güçlenir, kalp atar; Zıpzıp önce ürker ("Soğukmuş!"), sonra sakinleşir. |
| 5 | Kol: büyüteç | Gezdirir | Mikroplar kıpırdar (dört kare), mercekten kaçarken korkar; bulunan "hi hi" diye belirir. |
| 6 | Kol: köpük spreyi | Mikrobun çevresinde ovar | Başlık basılır, ağızdan köpük fışkırır; köpük parmağın yolunda birikir, çamuru çözer; mikrop köpüğe gömülür, dört karede "pof". |
| 7 | Kol: cımbız | Dikeni tutar, gerip çeker, tepsiye bırakır | Cımbız dikene yaklaşınca yarı kapanır; çekerken tüy çadır gibi kalkar, diken "pıt" diye çıkar, yerinde minik pembe iz kalır; tepside "tıngır". |
| 8 | Kol: ıslak pamuk | Pamuğu kâseye daldırır, kolu siler, kirlenince çalkalar | Kâsede halkalar, pamuk dört kademede kirlenir, kalan çamur silinir. |
| 9 | Kol: sargı | Ruloyu kolun çevresinde döndürür | Sargı beş katta sarılır, rulo incelir, bez rulodan kola uzanır. |
| 10 | Kol: bant | Bandı alır, yapıştırır, üstünden parmakla geçer | Arkasındaki kâğıt soyulur ("cırt"); bant kırışık yapışır, bastırdıkça düzelir ve parıldar. |
| 11 | Çıkartma defteri | Çıkartmayı soyar, yuvaya yapıştırır; pati damgasını basar | Köşe kalkar, "cırt"; son çıkartmada Zıpzıp'ın resmi güler; damga izi kalır. |
| 12 | Masada kutlama | (izler; "yeniden oyna") | Zıpzıp sekiz karelik sevinç dansı eder, Kino dans eder, yıldız ve konfeti yağar, kayan yıldız göğse konar. |

- **Tepkiler:** Zıpzıp'ın yakın yüzü on ifade (endişe, göz kırpma, merak, kıkır, kahkaha, diş sıkma, "ay", "oh", rahat, utangaç). Kino masada karşılar, göz kırpar, düşünür, güler, "ups" der, "yaşasın" der; yakın planda eğilip bakar, başparmak kaldırır, coşkuyla alkışlar. Masada bekleyen Zıpzıp arada patisine bakar, uzun beklerse iç çeker.
- **Yaş:** 2–3: iki mikrop, iki diken, bir çıkartma, bant bir geçişte düzelir. 4: üç mikrop, üç diken, iki çıkartma, iki geçiş. 5+: üç çıkartma, üç geçiş; pamuk en az bir kez çalkalanır.
- **Bugün oyunda olan (23 Kasım 04:05):** on iki sahnenin hepsi, gerçek çizimlerle. Denetim kaydı: `doktor/araclar/a1-onay.ts`; durum: `npx vite-node doktor/araclar/a1-bagla.ts -- durum`.
- **Çizim:** Paket Doktor-A1, `CLAUDE-ASTRA-MESAJLAR.md` 23 Kasım 00:34 (192 kare) ve 01:55 ek ölçüler; yöneticinin 01:50 notuyla `defter-portre-mutlu` eklendi (193). Üç anahtar kare onaylı: `ekip/doktor/a1/`.
- **Kod:** `doktor/src/vaka/` içinde `a1.ts` (adlar, ölçüler, saf kurallar), `sahne.ts`, `lavabo.ts`, `gogus.ts`, `defter.ts`, `parca.ts`, `his.ts`. Lavabo, göğüs ve defter sırası gelince kurulur, işi bitince bırakılır (bellek).
- **Test:** `tests/unit/doktor-a1.test.ts`; `tests/e2e/doktor.spec.ts` içinde "uzun akış" (geçici çizimlerle, `?taslak`; yalnız geliştirme sunucusu).
- **Çizimler gelince:** her kare %100 boyda denetlenir, diziler oynatılır, yerler ölçülür; tam sahne boyundaki poz katmanları bağlanırken kırpılır (bellek).

### 2) Mino'nun Kurabiyeli Dişleri (Y2, yeni)

İlk hâli (altı adım, 27 çizim) Barış'ın temel kuralına göre kısa kalıyordu; 23 Kasım'da baştan kuruldu. Ayrıntı, ölçüler ve 99 kare: `DOKTOR-Y2-PARCALAR.md`.

- **Giriş:** Mino sedyede, patisi yanağında, ağzını sımsıkı kapatmış. "Mmm! Açmam!"
- **Akış:**
  1. **Gıdıkla:** çenesinin altında parmağını **gezdir**; dudağı titrer, kıkırdar, "Aaaa!" diye açar. Bırakırsan yine kapanır.
  2. **Ağız aynası:** ışıklı aynayı dişlerde **gezdir**; saklı kırıntılar ışığın altında belirir.
  3. **Dişleri say:** dişlere **tek tek dokun**; her diş bir nota çalar, Kino sayar.
  4. **Macun:** üç tattan birini seç, fırçanın kıllarına **boydan boya sürerek sık**; şerit üç kademede uzar.
  5. **Fırçala:** **ileri geri**; köpük parmağın yolunda birikir, dişler birer birer temizlenir, baloncuklar patlar. 5+'ta dil de.
  6. **Su:** bardağı ağzına **tut**; su akar, bardak boşalır, yanaklar şişer.
  7. **Çalkala:** şişik yanaklara **sırayla dokun**; su gidip gelir, sonunda kâseye "pfff".
  8. **İp:** ip çubuğunu diş aralarında **aşağı yukarı oynat**; her aralıktan minik bir kırıntı fırlar.
  9. **Gülüş:** el aynasını yüzüne **tut**; dişler parıldar, Mino poz verir.
- **Yanlış hamleler (komik, cezasız):** macun yüze sıkılırsa burna konar; aynı yanağa iki kez dokununca su geçmez, Mino'nun gözleri büyür.
- **Kapanış şakası:** Mino cebinden bir kurabiye çıkarır, Kino'ya uzatır; sonra fırçasını gösterir: "Bir kurabiye... Sonra yine fırça!"
- **Yaş:** 2–3: üç kırıntı, dört diş sayılır, altı diş fırçalanır, iki çalkalama, iki aralık. 5+: yedi kırıntı, sekiz diş, on iki diş ve dil, altı çalkalama, beş aralık.
- **Kod ve test:** `doktor/src/vaka-dis/` (vaka-kit ile), `tests/unit/doktor-disler.test.ts`, `tests/e2e/doktor-disler.spec.ts`; geçici çizimler `npx vite-node doktor/araclar/disler-taslak.ts`.

### 3) Bulut'un Ateşi (Y3)

Kod ve parça brief'i İngilizce yan oturumunda; güncel akış sekiz adım (ayrıntı, ölçüler ve 85 çizim: `DOKTOR-Y3-Y4-PARCALAR.md`).

- **Giriş:** Bulut sedyede, yanakları kıpkırmızı, yünü terden yapışmış. "Çok sıcak oldum..."
- **Akış:**
  1. **Termometre:** hızlı ileri geri **salla** (gösterge iner, "şık şık"), alna tut; uç parlar, gösterge kırmızıya çıkar.
  2. **Serin bez:** kâseye **daldır** (su sıçrar, halkalar), kâsenin üstünde aşağı çekerek **sık** (üç kademe burulur).
  3. **Serinletme:** bezi yüze **bastırıp gezdir**; kızarıklık geçilen yerden silinir, buhar yükselir, bez alında kalır.
  4. **Su:** pipetli bardağı ağzına **tut**; Bulut içer, su dört kademede azalır.
  5. **Buz torbası:** küpleri **tek tek at** (torba beş kademede şişer), kapağı **çevirerek kapat**.
  6. **Torba başa:** tutup götür; Bulut ürperir ("Brrr!"), rahatlar.
  7. **Yelpaze:** sağa sola **salla**; yapış yapış yün üç kademede kabarır.
  8. **Son ölçüm:** gösterge yeşile iner; masada Bulut torbayı şapka gibi takıp zıplar: "Ferahladım!"
- **Yanlış hamleler (komik, cezasız):** sıkılmamış bez burna damlar; buz burna değince ürperir; pipet burna gelince gıdıklanır.
- **Yaş:** 2–3'te sallama yok, iki küp. 5+'ta dört küp; bez yarıda ısınır, ikinci kez ıslatılır.

### 4) Mila'nın Boya Lekeleri (Y4)

Kod ve parça brief'i İngilizce yan oturumunda; güncel akış sekiz adım (ayrıntı, ölçüler ve 83 çizim: `DOKTOR-Y3-Y4-PARCALAR.md`).

- **Giriş:** Mila parmak boyası yapmış; yüzünde, patilerinde renkli lekeler. Kıkırdıyor. (Sol kulağındaki mor leke modelin kendisidir, boya değildir.)
- **Akış:**
  1. **Köpürt:** sabunu süngerin üstünde ileri geri **sürt**; köpük kabarır.
  2. **Ov:** süngeri lekelerde **gezdir**; köpük lekenin rengini alır, sünger kirlenir.
  3. **Çalkala:** kirli süngeri kovada **sağa sola salla**; su renklenir. 2 ile 3 lekeler bitene dek gidip gelir.
  4. **Benekler:** pamuklu çubukla **nokta nokta dokun**; her benek "pıt".
  5. **Püskürt:** sprey şişesini köpüklü yerlere tut; her "pıs"ta sis açılır, köpük söner.
  6. **Kurula:** havluyu **gezdir**; kuruyan tüy "pof" diye kabarır.
  7. **Baloncuklar:** kovadan yükselen baloncuklara **dokun**; Mila da patlatmaya uzanır.
  8. **Ayna:** el aynasını yüzüne **tut**; Mila poz verir. Masada zıplar, sonunda patisini yine boya kabına sokar; Kino: "Mila, Mila! Yine mi boya?"
- **Yanlış hamle (komik, cezasız):** kirli süngerle ovunca renkler karışır, burnu mor olur; o da temizlenir.
- **Yaş:** 2–3'te iki renk, çubuk adımı yok, üç baloncuk. 4'te dört renk, beş baloncuk. 5+'ta dört renk, yedi baloncuk.

### 5) Pamuk'un Hapşırığı (Y5)

- **Giriş:** Pamuk'un burnu pembe, gözleri sulu. "Hap... hap... HAPŞU!" Hapşırınca masadaki pamuklar uçuşur.
- **Akış:**
  1. **Mendil:** kutudan mendili **çekip kopar** (uzar, "cırt" diye kopar), burnunu sil. Her hapşırıkta mendil uçar, yenisi çekilir.
  2. **Buhar kâsesi:** demlikten ılık suyu **eğerek dök** (parmağı çevirdikçe demlik eğilir, su akar), papatyaları **serpiştir** (tutam tutam bırak).
  3. **Buhar:** yükselen buharı Pamuk'un burnuna **yelpazele** (parmak sağa sola; buhar o yöne gider). Burun pembeden beyaza döner.
  4. **Atkı:** boynuna sar.
- **Yanlış hamle:** buhar Kino'ya yelpazelenirse Kino'nun kulakları buharda kabarır, silkelenir.
- **Kapanış şakası:** Pamuk derin bir nefes alır, hapşıracak gibi olur... ve mırıldar.
- **Yaş:** 2–3'te dökme adımı tek dokunuş; 5+'ta üç tutam papatya.

### 6) Polly'nin Karışık Kanadı (Y6)

- **Giriş:** Polly çalıya takılmış; bir kanadının tüyleri karışık, aralarında üç pıtrak. Kanadını kaldıramıyor.
- **Akış:**
  1. **Pıtraklar:** cımbız yok; parmakla tutup **çek** (pıtrak tüye yapışık, uzar, bırakır). Tepside birikir.
  2. **Tarak:** tüyleri kökten uca **tek yönde tara**; taranan şerit düzelir ve parlar. Ters yönde taranırsa tüy kabarır, Polly gıdıklanır.
  3. **Eğik tüy:** yerinden çıkmış uzun tüyü **çevirerek yuvasına oturt** (doğru açıya gelince "tık").
  4. **Kanat askısı:** üçgen bezin **iki ucunu boynunun arkasında birleştir** (iki ucu sırayla sürükle, düğüm olur).
- **Kapanış şakası:** Polly kanadını açar, bir tüy havada süzülüp Kino'nun burnuna konar; Kino hapşırır.
- **Yaş:** 2–3'te iki pıtrak, tüy oturtma yok.

### 7) Lokum'un Guruldayan Karnı (Y7)

- **Giriş:** Lokum karnını tutuyor: "Gurrr!" Çok mandalina yemiş.
- **Akış:**
  1. **Stetoskop:** karnında gezdir; gurultuya yaklaştıkça ses büyür, ekran kenarı hafifçe titrer (sıcak-soğuk). Bulununca Lokum kıkırdar.
  2. **Röntgen çerçevesi:** çerçeveyi karnın üstünde **kaydır**; içi çizgi film röntgenine döner, üç mandalina dilimi görünür. Her dilime dokun.
  3. **Ilık eller:** iki patiyi birbirine **hızlı sürterek ısıt** (parıltı çıkar), sonra karnına **yavaş daireler çiz**. Hızlı çizilirse Lokum gıdıklanıp yuvarlanır; yavaş çizilirse gurultu diner.
  4. **Papatya çayı:** kaşıkla **karıştır**, buharına üfle (dokun, dokun), üç yudum.
- **Kapanış şakası:** Lokum "Hav!" der, karnından küçük bir "gur" daha çıkar, kızarır.
- **Yaş:** 2–3'te röntgen ve çay; 4'te masaj eklenir; 5+'ta hepsi.

### 8) Kuzu'nun Sökük Dikişi (Y8)

- **Giriş:** Lokum'un oyuncak Kuzu'su Kino'nun kucağında gelir: yanı sökülmüş, pamuğu taşmış, bir düğme gözü düşmüş, kurdelesi çözülmüş. İğne yok; bu bir oyuncak tamiri.
- **Akış:**
  1. **Pamuk:** taşan pamukları deliğe **tıkıştır** (parmakla it; Kuzu şişer, fazla itilirse karşı taraftan pofurdar).
  2. **Yama:** üç yamadan birini seç (kalp, yıldız, pati), sökük yerin üstüne koy, **köşe köşe bastır** (her köşe "pıt" diye yapışır).
  3. **Düğme göz:** düğmeyi yerine koyup **çevirerek tak** (vidalar gibi; her yarım turda "tık").
  4. **Kurdele:** iki ucu çaprazla, ilmeği çek: **fiyonk**.
- **Kapanış şakası:** Kuzu'ya dokununca "Mee!" der; Lokum'un sesi dışarıdan duyulur: "Kuzu'm!"
- **Yaş:** 2–3'te pamuk ve yama; fiyonk tek çekiş.
- **İğne yasak (yönetici, 23 Kasım):** sökük yalnız yapışkan yamayla ya da cırt cırt bantla kapanır. Dikiş, iğne ve iplik görüntüsü yok.

### 9) Bulut'un Uğur Böceği (Y9)

- **Giriş:** Bulut kulağını kaşıyor, kıkırdıyor: kulağının dış tüylerinde bir şey geziyor.
- **Akış:**
  1. **Büyüteç ve tüyler:** kulağın dış tüylerini parmakla **iki yana arala**; uğur böceği görünür, kaçıp öbür tüyün arkasına saklanır (üç kez).
  2. **Yeşil yaprak:** yaprağı böceğe **yavaşça yaklaştır**. Hızlı gelirse böcek saklanır; yavaş gelirse yaprağa yürür.
  3. **Taşıma:** yaprağı pencereye **sarsmadan taşı**; sallanırsa böcek yaprağın altına kaçar, durunca yine çıkar. Pencerede kanatlarını açar, uçar.
  4. **Kulak:** tüyleri yumuşak fırçayla kabart.
- **Güvenlik:** kulağın içine hiçbir şey girmez; her şey dış tüyde olur.
- **Kapanış şakası:** böcek dönüp Kino'nun burnuna konar, sonra uçar.
- **Yaş:** 2–3'te böcek bir kez saklanır, taşıma sarsılmaya duyarsız.

### 10) Mino'nun Kayıp Çıngırağı (Y10)

- **Giriş:** Mino yürüyünce karnından "tıngır" sesi geliyor; şaşkın.
- **Akış:**
  1. **Dinle:** Mino'yu parmakla **zıplat** (aşağı bastır, bırak); her zıplayışta "tıngır". Stetoskopla sesin yerini bul.
  2. **Röntgen çerçevesi:** kaydır; önlüğünün cebinde çıngıraklı top görünür.
  3. **Cep:** fermuarı **çek** (dişler tek tek açılır), topu çıkar.
  4. **Oyun:** topu Mino'ya **fırlat** (hızlı kaydır); Mino yakalar, geri atar. Üç atış.
- **Kapanış şakası:** Mino topu cebine koyar, fermuarı kapatmayı unutur; top yine düşer: "tıngır".
- **Yaş:** 2–3'te fermuar tek çekiş, bir atış.

## İlerleme

- **Bekleme sırası (Doktor-K1, kod hazır: `doktor/src/klinik/`, `?oyun=klinik`; İngilizce yan oturumu, 23 Kasım):**
  - Oyun bekleme odasıyla açılır. Yedi hasta derdiyle oturur ve beş karelik boşta döngüyle canlıdır: Zıpzıp topallar, Mino yanağını tutar, Bulut terler, Mila boyalı kıkırdar, Pamuk hapşırır, Polly kabarık kanadıyla uğraşır, Lokum'un karnı guruldar.
  - On vaka var. Lokum, Bulut ve Mino ikinci kez gelir:
    - Lokum karnı geçince kucağında Kuzu'yla;
    - Bulut ateşi geçince kulağında uğur böceğiyle;
    - Mino dişleri geçince karnından "tıngır"la.
  - Panoda on çıkartma yuvası var, iki sıra.
  - Sırada iki hasta ışıkla bekler; çocuk birini seçer. Hasta kalkıp kapıdan içeri yürür, vakası `baslat(kok, yas, { bitince })` ile açılır. Vakada geri düğmesi bekleme odasına döner.
  - İyileşen hasta mutlu çıkar, yerine oturur; çıkartması panoya uçar. Pano dolunca kutlama olur.
  - Çizimler: önce üç ekran seçeneği istendi (A bankalar, B oyun halısı, C bahçe; kanal 23 Kasım 02:59; Lokum ve sekiz yuva eki). Yönetici seçince stil anahtar karesi, sonra 172 parça: `DOKTOR-K1-PARCALAR.md`.
  - Kino'nun 12 sözü kaydedildi; 8 efekt üretildi.
  - Varsayılan açılış değişmedi.
- **Bekleme sırası, ilk tarif:** sırada iki hasta oturur, çocuk hangisini alacağını seçer. Biten her hastanın çıkartması klinik panosuna asılır.
- **Açılma:** vakalar sırayla açılır; çizimleri gelmemiş vaka sırada görünmez.
- **Kayıt:** `localStorage['minkino-doktor-vaka-v1']`: şimdilik `{ s: 1, iyilesen: [...] }` (biten vakalar: zipzip, mino, bulut, mila, pamuk, polly, lokum, lokum-kuzu, bulut-bocek, mino-cingirak). Seçilen bantlar ve yıldızlar sonra eklenir.
- **Tekrar:** biten vaka yeniden seçilebilir; ikinci oynayışta dert küçük bir farkla gelir (diken sayısı, leke rengi, pıtrak yeri).
- Kilit ve menüdeki yer kararı Barış'ta.

## Ses

- Her hastanın 8–12 kısa repliği (duygu ve tepki; emir yok) ve vakaya özgü 5–7 efekt.
- Yeni hesapta klonu olanlar: Kino, Ceren, Zıpzıp. **Klon gerekenler:** Mino, Bulut, Lokum, Mila, Pamuk, Polly; Kuzu yalnız "mee" efekti.

## Kod sırası

1. Dikenli Pati'nin uzun akışı kodda hazır (geliş, lavabo, göğüs, pamuk, kat kat sargı, bant, defter, dans; tepki pozları ve kare dizileri). A1 kareleri geldikçe: denetim, bağlama, yer ölçümü, gerçek çizimle uzun akış testi.
2. Bekleme sırası ve kayıt: kod geçici çizimlerle hazır (`doktor/src/klinik/`). Ekran seçilince yerleşim `klinik/veri.ts`'te ayarlanır, parçalar gelince bağlanır.
3. Y2 çizimleri gelince Mino'nun dişleri; ardından Y3'ten başlayarak anahtar karesi onaylanan vaka.
4. Ortak parçalar `doktor/src/vaka/his.ts` (köpük, su, maske) ve `etki.ts` (gölge, yıldız, kenar) içinde; her yeni vaka bunları kullanır.
