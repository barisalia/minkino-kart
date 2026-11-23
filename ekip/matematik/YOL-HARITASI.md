# Matematik Atölyesi · yol haritası (19 Kasım 2026)

Barış'ın vizyonu: Matematik Atölyesi başlı başına, her ayrıntısı olan bir okul öncesi matematik uygulaması olacak. Ceren Öğretmen'in ders dizisi, her dersin oyuncaklarla pekişmesi, akıllı tekrar, hatıra ve ödüller, yaşa göre yollar ve veli için ilerleme.

Bu belge neyin olduğunu, neyin eksik olduğunu, önem sırasını ve her adımın görsel ve ses ihtiyacını tutar. Her biten adım oynanabilir olur, testleri geçer ve iPad ile telefon görüntüleriyle gösterilir. Akışı bozan değişiklik, `KULLANICI-KURALLARI.md` ile çelişki ve kilit ya da fiyat kararları Barış'a sorulur.

## 1 · Bugün olanlar

| Bölüm | İçerik | Yaş |
|---|---|---|
| **Ceren dersi · Sayılar** | Rakamı tanıt, yaz, birlikte say, masaya koy; sonda hatıra (abaküs) | 2–3 yaş 1–5 · 4 ve 5+ 1–10 |
| **Sayı masası** | On kutuluk kule (ısınma); boncukla say; paylaştır; rakamı eşle ve yaz; pazar siparişi; topla ve çıkar; **Hızlı Gözler** (anlık sayılama, 19 Kasım) | 6 / 9 / 10 tur → 8 / 10 / 10 tur |
| **Şekil atölyesi** | Tekne kur, araba kur, örneğe göre bina, konum (sol, üst, sağ), büyüme sırası, şekil örüntüsü, Ay gezgini (şekil avı) | 8 / 10 / 10 tur |
| **Ölçü tezgâhı** | Misket parkuru (5+), kurdeleyi birimle ölç, teraziyi dengele, en çok ya da en az | 6 tur |
| **Fener tiyatrosu** | Kuş şarkısı örüntüsü, fener gösterisi (hafıza ve sıra), kendi besten | 6 tur |
| **Hatıralar** | Her oyuncakta ve derste bir hatıra; tezgâhta yıldız | — |
| **Yaş yolları** | 2–3, 4 ve 5+ yaş için ayrı tur sırası, miktar ve süre | — |
| **Kilit** | Sayı masası ve Ceren dersi ücretsiz, öbür oyuncaklar abonelikte (Ceren dersinin kilidi Barış'ta) | — |

**Eksikler:**
- Ceren'in yalnızca bir dersi var.
- Oyuncaklar dersle bağlı değil.
- Akıllı tekrar yok: çocuk zorlandığı sayıyı tekrar görmüyor.
- Ödül yalnızca hatıra ve yıldız; birikim yok.
- Veli Matematik'te neyi öğrendiğini göremiyor.
- Dersler arasında bir yol ya da harita yok.

## 2 · Önem sırası

Sıra, çocuğa en çok değer katan ve elde var olan çizimlerle hemen başlanabilen işten, Astra'nın çizimini bekleyen işe doğru gider. Çizim gereken adımlarda brief önce yöneticiye gider. Beklerken var olan çizimle yapılabilen adıma geçilir.

**Ayrı oturum:** Her adımda yazılı. "Evet" demek, iş yeni dosyalarda yaşar ve oyuna tek bir bağlantı noktasıyla bağlanır; Matematik oturumunun dosyalarına (`main.ts`, `kayit.ts`, `tur-sirasi.ts`, `ceren-ders.ts`) dokunmaz.

**Önce ders iskeleti:** Yeni Ceren derslerinin ayrı oturumlarda yazılabilmesi için `ceren-ders.ts`'in ortak parçaları paylaşılan bir iskelete ayrılmalı (sahne, Ceren'in sesi ve ağzı, pozlar, sıra, hatıra, kayıt). Bunu Matematik oturumu yapar (adım 3b). Ondan sonra her yeni ders kendi dosyasında yazılır, menüye tek satırla bağlanır.

### Adım 1b · Ölçü tezgâhı: Boy Duvarı ve Kurbağanın Yaprak Yolu (Barış'ın kararı, 19 Kasım 18:10)
- **Ne:** Kurdele turunun yerine, ilk gelişinde Boy Duvarı, ikinci gelişinde Yaprak Yolu (her yaşta). Çizimler gelene kadar eski kurdele turu kalır; yeni turlar çizim ve sesler tamamsa kendiliğinden açılır, test kipinde yer tutucuyla oynanır.
- **Görsel:** Astra brief'i `CLAUDE-ASTRA-MESAJLAR.md` (19 Kasım 18:20), klasör `assets/matematik/olcu/`. **Ses:** yaklaşık 12 Ceren sözü.
- **Ayrı oturum:** Hayır. Tur sırası, kayıt ve Ölçü tezgâhının dalları ortak dosyalarda; Matematik oturumu yapar.

### Adım 1 · Hızlı Gözler (bitti, 19 Kasım)
- **Ne:** Sayı masasına anlık sayılama turu. Nesneler bir an görünür, saklanır, çocuk rakamı seçer; doğruda nesneler kendini sayar.
- **Yaşa göre:** 2–3 yaş 1–3 nesne ve 2 seçenek; 4 yaş 1–5; 5+ 1–10, beşlik dizilir.
- **Görsel:** şimdilik var olan Matematik çizimleri; kendi sahnesi ve dostları Astra'da (Paket M2, `assets/matematik/hizli/`, 12 çizim). **Ses:** 3 yeni Ceren sözü.

### Adım 2 · Akıllı tekrar (bitti, 19 Kasım)
- **Kuruldu:** `matematik/src/akilli-tekrar.ts`. Hızlı Gözler'deki yanlış ve boncuk sayma turundaki yanlış onay, yaşın defterine (`minkino-matematik-tekrar-<yol>-v1`) yazılır. Sonraki Hızlı Gözler turunda ısınma sorusunun hemen ardından en çok iki zor sayı gelir, Ceren "Bu sayıyla bir daha oynayalım!" der (söz 119). Yanlıştan sonra iki kez ilk bakışta bilinen sayı defterden düşer. Veli sayfasının "Biraz daha tekrar" bölümü bu defteri okur. Görüntüler: `ekip/etkinlik/matematik/akilli-tekrar/`.
- **Ne:** Çocuğun takıldığı sayılar kayda yazılır: Hızlı Gözler'deki yanlış, derste "baştan say", boncukta düzeltme. Sayı masasının sonraki turlarında bu sayılar öne alınır; bilinen sayılar seyrekleşir.
- **Kural:** aynı soru art arda gelmez, tur sayısı değişmez.
- **Görsel (Astra):** karşılama pozu `ceren-bir-daha` (Paket M9, `assets/matematik/ders/tekrar/`).
- **Ses:** mevcut sayı sözleri ve bir karşılama: "Bu sayıyla bir daha oynayalım!"
- **Ayrı oturum:** Hayır. Kayıt (`kayit.ts`) ve turların soru seçimi (`main.ts`, `hizli-gozler.ts`) ortak; Matematik oturumu yapar.

### Adım 3 · Veli için ilerleme (bitti, 19 Kasım; tezgâhta "Büyükler için" düğmesiyle bağlı)
- **Ne:** Matematik'te ebeveyn kapısının (`ebeveynKapisiAc`) arkasında bir ilerleme sayfası:
  - öğrenilen dersler ve sayılar;
  - oyuncakların tamamlanma durumu;
  - becerilere göre özet (sayma, anlık sayılama, şekiller, ölçme, örüntü);
  - zorlandığı sayılar (akıllı tekrardan).
- **Görsel (Astra):** Paket MV1–MV2 (10 çizim; veli oturumu yazdı).
- **Ayrı oturum:** **Evet.** Yeni dosya (`matematik/src/veli.ts` ve `veli.css`), kayıtları yalnızca okur (`minkino-matematik-1-*`, `minkino-matematik-ceren-sayilar-v1`). Bağlantı noktası tek: tezgâhta "Büyükler için" düğmesi (`menu()` içinde bir satır; o satırı Matematik oturumu ekler). Okunacak kayıt biçimi `kayit.ts → Tur` ve `ceren-ders-mantik.ts → Kayit`.

### Adım 3b · Ders iskeleti (bitti, 19 Kasım)
- **Kuruldu:** `matematik/src/ders-iskelet.ts`: `DersSesi` (Ceren'in kayıtları, Web Audio, ağız eşleme), `cerenFiguru` ve `cerenBagla` (pozlar, konuşma kareleri), `DersAkisi` (bekle, konuş, adım, iptal, boşta yardım, dokununca), `hareketler` (zıpla, salla, uçur), `resimHTML`, `yuzde`. Sayılar dersi (`ceren-ders.ts`) bunun üstünde çalışır, davranışı değişmedi. Yeni ders: kendi dosyası `matematik/src/ders-<ad>.ts`, kendi ses klasörü (`assets/matematik/ders/<ad>/ses/`) için bir `DersSesi`, kendi sahnesi ve adımları. Şekiller dersinin (M3) 19 çizimi Astra'dan geldi.
- **Ne:** `ceren-ders.ts`'ten paylaşılan iskelet: sahne (16:9 dünya, dikey düzen), Ceren'in sesi ve ağız eşlemesi, pozlar, adım akışı, boşta yardım, hatıra ve kayıt. Sayılar dersi bu iskelete taşınır, davranışı değişmez (testler aynen geçer).
- **Ayrı oturum:** Hayır (yapıldı). Adım 4–8 artık ayrı oturumlara açılabilir.

### Adım 4 · Ceren dersi 2 · Şekiller (kuruldu, 20 Kasım)
- **Kuruldu:** `matematik/src/ders-sekiller.ts` (+ `-mantik.ts`, `-sozler.json`, `.css`), iskeletin üstünde. Şekil atölyesine girerken açılır (Astra M3 ve 18 Ceren kaydı tamam). Daire çiz · kare bul (pencere) · üçgen çiz · dikdörtgen bul (kitap); 2–3 yaş üç şekilde biter; hatıra şekil kutusu. Görüntü ve video: `ekip/etkinlik/matematik/sekiller-dersi/`.
- **Ne:** Ceren kare, üçgen, daire ve dikdörtgeni tanıtır. Çocuk şekli tahtaya parmakla çizer, sınıfta arar ("pencere hangi şekil?"), sonra Şekil atölyesine geçer.
- **Akış:** Sayılar dersindeki kalıp: tanıt, tek etkinlik, aferin, hatıra.
- **Görsel (Astra, Paket M3, `assets/matematik/ders/sekiller/`, 6 sayfa, 19 çizim):** şekiller köşesi fonu, sınıftaki şekil nesneleri (saat, top, pencere, kitap, tabela, pizza dilimi), yeni ahşap ders şekilleri, tebeşir çizim izleri, 3 Ceren pozu, hatıra (şekil kutusu).
- **Ses:** yaklaşık 25 Ceren sözü.
- **Ayrı oturum:** **Evet, ders iskeletinden (3b) sonra.** Dersin kendi dosyası (`matematik/src/ders-<ad>.ts`), sözleri (`ders-<ad>-sozler.json`) ve testi; bağlantı noktası Sayı masası ya da ders yolundaki bir satır.

### Adım 5 · Ceren dersi 3 · Karşılaştır ve ölç (kuruldu, 20 Kasım; Astra M4 çizimlerini bekliyor)
- **Kuruldu:** `matematik/src/ders-olcu.ts` (+ `-mantik.ts`, `-sozler.json`, `.css`). Ölçü tezgâhına girerken açılır. Büyük/küçük (ayıcık; şapka, kupa), uzun/kısa (aynı yerden başlayan kalem; atkı, tren), çok/az (kavanoz), 4+ ağır/hafif (karpuz, tüy); hatıra mezura. 20 Ceren kaydı hazır (`assets/matematik/ders/olcu/ses/`). M4'ün 21 çizimi gelince kendiliğinden açılır; o güne dek test kipinde `?test=1&olcudersi=1`. Görüntü ve video: `ekip/etkinlik/matematik/olcu-dersi/`.
- **Ne:** Büyük ya da küçük, uzun ya da kısa, çok ya da az; birimle ölçmenin girişi. Ölçü tezgâhıyla pekişir.
- **Ölçü tezgâhı:** kurdele turunun yerine "Boy Duvarı" ve "Yaprak Yolu" fikirleri (taslaklar `ekip/etkinlik/matematik/olcu-fikirleri/`).
- **Görsel (Astra):** ölçü oyunları ayrı pakette (27 çizim, `assets/matematik/olcu/`). Ders için Paket M4 (`assets/matematik/ders/olcu/`, 6 sayfa, 21 çizim): oyuncak odası fonu, büyük/küçük, uzun/kısa, çok/az, ağır/hafif nesneleri, 3 Ceren pozu, hatıra (mezura).
- **Ses:** yaklaşık 25 söz.
- **Ayrı oturum:** **Evet, ders iskeletinden (3b) sonra.** Dersin kendi dosyası (`matematik/src/ders-<ad>.ts`), sözleri (`ders-<ad>-sozler.json`) ve testi; bağlantı noktası Sayı masası ya da ders yolundaki bir satır.

### Adım 6 · Ceren dersi 4 · Örüntü (kuruldu, 20 Kasım; Astra M5 çizimlerini bekliyor)
- **Kuruldu:** `matematik/src/ders-oruntu.ts` (+ `-mantik.ts`, `-sozler.json`, `.css`). Fener tiyatrosuna girerken açılır. Renk (bayraklar ipte), şekil (taşlar), ses (davul, çıngırak, alkış; kodla çalan vuruşlar) örüntüleri; çocuk boşlukları doldurur, dizi dolunca bir kez çalar. 4 yaştan sonra kendi örüntüsü (iki bayrak seçer, ip onun örüntüsüyle dolar). 2–3 yaş AB tek boşluk; 4 yaş AB/AAB iki boşluk; 5+ ABC/AAB. 18 Ceren kaydı hazır (`assets/matematik/ders/oruntu/ses/`). M5'in 14 çizimi gelince kendiliğinden açılır; o güne dek test kipinde `?test=1&oruntu=1`. Görüntü ve video: `ekip/etkinlik/matematik/oruntu-dersi/`.
- **Ne:** AB, AAB, ABC örüntüleri: renk, şekil, ses. Çocuk sürdürür, sonra kendi örüntüsünü kurar. Fener tiyatrosuyla pekişir.
- **Görsel (Astra, Paket M5, `assets/matematik/ders/oruntu/`, 5 sayfa, 14 çizim):** şenlik sınıfı fonu (gergin ip), üç renk bayrak, dört örüntü taşı, ses örüntüsü (davul, çıngırak, alkış), 2 Ceren pozu, hatıra (bayrak dizisi).
- **Ses:** yaklaşık 20 söz.
- **Ayrı oturum:** **Evet, ders iskeletinden (3b) sonra.** Dersin kendi dosyası (`matematik/src/ders-<ad>.ts`), sözleri (`ders-<ad>-sozler.json`) ve testi; bağlantı noktası Sayı masası ya da ders yolundaki bir satır.

### Adım 7 · Ceren dersi 5 · Sayılar 11–20 (5+ yaş) (kuruldu, 20 Kasım; Astra M6 çizimlerini bekliyor)
- **Kuruldu:** `matematik/src/ders-onluk.ts` (+ `-mantik.ts`, `-sozler.json`, `.css`). 5+ yaşta, Sayı masasının hatırası alındıktan sonra Sayı masasına girerken açılır. Görevler: on boncuğu çubuğa diz (bir…on; onluk olur), onluğun yanına üç birlik (on bir, on iki, on üç), abaküste on altı (üst tel onluk, alt tel birlik; fazlası "birini geri al"), on yediden yirmiye (on birlik ikinci onluk olur). Her sonuçta rakam blokları iki basamağı gösterir. Hatıra boncuk kolye. 24 Ceren kaydı hazır (`assets/matematik/ders/onluk/ses/`; 1–10 Sayılar dersinden). M6'nın 9 çizimi gelince kendiliğinden açılır; test kipinde `?test=1&onluk=1`. Astra'ya abaküs boncuğu 80 × 80 düzeltmesi yazıldı (20 Kasım 17:40). Görüntü ve video: `ekip/etkinlik/matematik/onluk-dersi/`.
- **Ne:** Onluk ve birlik: on boncuk bir çubuk olur, yanına birlikler eklenir. Rakam bloklarıyla iki basamak kurulur (1 ve 4 = 14).
- **Görsel (Astra, Paket M6, `assets/matematik/ders/onluk/`, 4 sayfa, 9 çizim):** boncuk masası fonu, onluk çubuk ve birlik, abaküs (gerçek oyuncak gibi, yüzsüz; çerçeve ve iki renk boncuk ayrı), `rakam-0`, Ceren on parmak, hatıra (boncuk kolye). Rakam blokları 1–10 hazır.
- **Ses:** yaklaşık 30 söz (11–20 sayıları dahil).
- **Ayrı oturum:** **Evet, ders iskeletinden (3b) sonra.** Dersin kendi dosyası (`matematik/src/ders-<ad>.ts`), sözleri (`ders-<ad>-sozler.json`) ve testi; bağlantı noktası Sayı masası ya da ders yolundaki bir satır.

### Adım 8 · Ceren dersi 6 · Toplama ve çıkarma başlangıcı (5+ yaş)
- **Ne:** "Bir fazla, bir eksik", birleştirme ve ayırma; 5'e ve 10'a tamamlama (beşlik ve onluk çerçeve). Sayı masasının topla ve çıkar turlarıyla pekişir.
- **Görsel (Astra, Paket M7, `assets/matematik/ders/topla/`, 3 sayfa, 10 çizim):** otobüs durağı fonu, beş pencereli otobüs (beşlik çerçeve; iki otobüs onluk), beş yolcu, 2 Ceren pozu, hatıra (bilet). Var olan meyveler kullanılmaz.
- **Ses:** yaklaşık 25 söz.
- **Ayrı oturum:** **Evet, ders iskeletinden (3b) sonra.** Dersin kendi dosyası (`matematik/src/ders-<ad>.ts`), sözleri (`ders-<ad>-sozler.json`) ve testi; bağlantı noktası Sayı masası ya da ders yolundaki bir satır.

### Adım 9 · Ders yolu ve ödül rafı → "Minkino Bahçe Şenliği Hazırlığı" (kuruldu, 20 Kasım; Astra M8 yeniden çizimini bekliyor)
- **Kuruldu:** `matematik/src/ders-yolu.ts` (+ `-mantik.ts`, `-sozler.json`, `.css`). Yönetici kararı ve Antigravity CEVAP-06 (B2, C2, D2): altı ders şenliğin altı parçası (meyve tezgâhı, sahne, oyun parkuru, fenerler ve bayraklar, şenlik otobüsü, bilet gişesi); sıra Sayılar 1–10 → Şekiller → Karşılaştır ve ölç → Örüntü → Toplama ve çıkarma → Sayılar 11–20 (son ikisi 5+). Tezgâhta şenlik tabelası; parlayan parça dersi açar, ders bitince yola dönülür, parça canlanır, hatıra şenlik panosuna asılır. Oyuncak kapıları da aynı sıraya uyar (ders oyuncağından ancak yolda sıradaysa açılır; hazır olmayan ders atlanır). Kilit değişmedi. 12 Ceren kaydı hazır. Eski M8 brief'i geri çekildi; yeni brief `CLAUDE-ASTRA-MESAJLAR.md` 20 Kasım 19:45 ve 20:05. Test kipi `?test=1&dersyolu=1`. Görüntü ve video: `ekip/etkinlik/matematik/senlik-yolu/`.
- **Ne:** Ceren'in sınıfında ders yolu: derslerin sırası, biten dersin rozeti, sıradaki dersin ışığı. Tezgâhta bir hatıra rafı: her dersin ve oyuncağın hatırası rafa dizilir, Hızlı Gözler yıldızları birikir.
- **Görsel (Astra, Paket M8, `assets/matematik/ders-yolu/`, 3 sayfa, 10 çizim):** ders yolu fonu (6 durak), 6 ders rozeti, rozet yuvası, sıra ışığı, hatıra rafı.
- **Ayrı oturum:** **Evet.** Yeni dosya (`matematik/src/ders-yolu.ts` ve `.css`); derslerin bitti bilgisini kayıtlardan okur. Bağlantı noktası tek: tezgâhta bir giriş (`menu()` içinde bir satır).

### Adım 10 · Eksik üç beceriye üç yeni oyuncak turu (kuruldu, 20 Kasım; Astra M10–M12 onaylı, uygulamada açık)
- **Kuruldu:** `matematik/src/yeni-turlar.ts` (kurallar) ve `main.ts → ikiKase, sakliFindik, takimCantasi`. Yönetici kararı (Antigravity CEVAP-06 B2, C2, D2; Clements & Sarama). Her yeni tur sırada aynı türün ikinci kez geldiği bir turun yerine geçer; tur sayısı ve kayıt değişmez; bir oyuncakta aynı tür en çok iki kez, arka arkaya değil.
  - **Lokum'un İki Kâsesi** (parça-bütün; Sayı masası, 4 yaş 3–5, 5+ 5–10 mandalina): mandalinaları Kino'nun ve Lokum'un kâselerine böl; iki sayı ve toplam rakamla; "Şimdi başka türlü!" ile aynı sayı ikinci kez başka biçimde. Tek tarafa ya da aynı bölüşüm sayılmaz.
  - **Zıpzıp'ın Saklı Fındıkları** (gizli miktar; Sayı masası, 4 yaş 4–5, 5+ 6–9 fındık): fındıkları birlikte say, toplam köşede rakamla; Zıpzıp bir kısmını sepetle kapatır, çocuk sepetin altındakini bulur; sonra öbür kısım saklanır (5 = 2 + 3, sonra 3 + 2). İkinci yanlışta cevap sayılarak gösterilir.
  - **Baba'nın Takım Çantası** (sınıflama; Şekil atölyesi): altı ahşap parça iki kutuya; 2–3 yaş renge, 4 yaş şekle, 5+ önce şekle sonra aynı parçalar boya göre. Kutu levhasında örnek parça; dokunarak ya da sürükleyerek.
- **Görsel:** Astra M10–M12 (26 çizim) %100 boyda sayılarak onaylandı (`CLAUDE-ASTRA-MESAJLAR.md` 21:40). Sahne Astra'nın `yerlesim.cjs` koordinatlarıyla. **Ses:** 14 Ceren kaydı (sözler 121–134). Test kipi `?test=1&yeniturlar=1`. Görüntü ve video: `ekip/etkinlik/matematik/yeni-turlar/`.

- **Ek (20 Kasım gece):** "Bulut'un Tahterevalli Dengesi" (veli oturumunun `tahterevalli.ts`'i, Astra M13) Ölçü tezgâhında ikinci denge turunun yerine bağlandı (2–3 ve 4 yaş tur 7, 5+ tur 14). Akıllı tekrara konu defteri: Şekiller, Örüntü, Ölçü derslerindeki ve Baba'nın Takım Çantası'ndaki ilk yanlışlar veli sayfasında "Biraz daha tekrar" altında konu olarak görünür.

### Adım 11 · İçerik hacmi: 11 yeni oyuncak turu (uygulamada, 21 Kasım; Astra M14–M24 onaylı; oyuncak sıraları uzadı)
- **Sayı masası:** Dede'nin Elma Sandıkları (11–20 sayma), Babaanne'nin Kurabiye Tepsileri (miktar-rakam eşleme), Mino'nun Sayı Treni (sıralama), Bulut'un Balonları (nesneyle toplama-çıkarma), Anne'nin Kek Fırını (rakamla toplama-çıkarma), Lokum'un Asansörü (bir fazla, bir eksik).
- **Şekil atölyesi:** Şekil Bahçesi (oval, yıldız, kalp, altıgen), Şekillerle Resim Yap (ev, roket).
- **Fener tiyatrosu:** Mino'nun Büyüyen Fenerleri (büyüyen örüntü), Zıpzıp'ın Şenlik Bayrakları (eksik parça), Sen Başlat Kino Sürdürsün (kendi örüntüsü).
- Her turun 2–3, 4 ve 5+ basamağı; Ceren sözleri 57 (sozler.json 135–191). Kod `main.ts` (elmaSandigi … kinoSurdursun), kurallar `yeni-turlar.ts`; test kipinde `?test=1&yenitur=<ad>` (sandik, kurabiye, tren, balon, kek, asansor, sekilbahce, resim, buyuyen, bayrak, calgi). Yönetici kararıyla oyuncak sıraları uzadı: eski turlar yerinde, yeni turlar sonda (Şekil'de Ay gezgininden önce); çizimi ya da sesi eksik tur sırada görünmez (`ek-turlar.ts`, `tur-sirasi.ts → EK_TURLAR, etkinSira`). Uzunluklar 2–3 / 4 / 5+: Sayı 12 / 16 / 17, Şekil 10 / 12 / 12, Ölçü 9 / 10 / 11, Fener 9 / 9 / 10 (Adım 13 ile). Kayıt sürümü 3: eski kayıttaki çocuk aynı turdan sürer, bitirmiş çocuk yıldızını korur, yeni turlara geçer (kartta "Yeni" rozeti).

### Adım 12 · Ölçü tezgâhı 2. dalga (uygulamada, 21 Kasım; Astra M25–M27 onaylı)
- Anne'nin Sürahileri (hacim: dolu, yarım, boş), Babaanne'nin Bütün ve Yarımı (kesre giriş), Kino'nun Günü (zaman sırası; 5+ yaşta kardan adam sırası, bitki gelişimi Şekil atölyesinde olduğu için). Danışman ONERI-08 bölüm 6. Ceren sözleri 25 (192–216). Test kipi `?yenitur=surahi|yarim|gun`. Şekiller dersi ve Baba gibi bunlar da ilk yanlışı konu defterine yazar (ölçü: doluluk, zaman).

### Adım 13 · 5+ için iki yeni tur: ritmik sayma ve eşit paylaştırma (uygulamada, 21 Kasım; Astra M28, M29 ve rakam-0 onaylı)
- **Zıpzıp'ın Ritmik Zıplaması** (Fener, 5+): derede altı taş, 0'dan 2'şer, sonra 5'er ya da 10'ar; iki taş gösterilir, çocuk sıradakinin sayısını seçer (doğru, bir fazlası, bir adım ilerisi); yanlışta Ceren'le birlikte sayılır.
- **Babaanne'nin Eşit Paylaşımı** (Ölçü, 5+): askılı tabak terazisi; eşit değilse ağır tabak iner, kurabiyeler kavanoza döner; 6 ya da 8 iki tabağa, 6 ya da 9 üç tabağa. Her eşitlikte Babaanne alkışlar.
- Kurallar `ritim-pay.ts`, sahneler `main.ts` (ritmikZiplama, esitPaylasim); Ceren sözleri 19 (217–235; 227 kullanılmıyor). Test kipi `?yenitur=ritim|pay`. 0 rakam bloğu geldiği için 20, 30… ve 10 iki blokla yazılır. 5+ uzunluklar: Ölçü 11, Fener 10.

### Adım 14 · Okul öncesinin eksik üç konusu: geriye sayma, simetri, veri (kodu hazır, 21 Kasım; Astra M30–M32 bekliyor)
- **Roket Geri Sayımı** (Sayı masası, 4 ve 5+): karışık rakam bloklarını büyükten küçüğe panoya diz; 4 yaş 5'ten sonra 6'dan, 5+ 10'dan sonra 20'den (20…11'i çocuk dizer, 10…1'i Ceren'le birlikte sayarlar). Sıfırda roket alevle kalkar, Mino kaskla sevinir.
- **Kelebeğin Kanadı** (Şekil atölyesi, 4 ve 5+): sol kanattaki beneklerin aynasını sağ kanada kur; 4 yaş 2 sonra 3 benek tek renk, 5+ 4 sonra 5 benek iki renk (önce renk seçilir). Yanlış yere konan benek oturmaz, düşer. Doğruda kelebek kanat çırpıp uçar.
- **Meyve Grafiği** (Ölçü tezgâhı, 5+): Dede'nin sepetindeki karışık meyveler dokununca sütunlarına gider, Ceren sayar; sonra en çok, en az (sütuna dokun) ve "kaç fazla" (fazla meyveler parlar).
- Kurallar `roket-kelebek-grafik.ts`, sahneler `main.ts` (roketGeriSayimi, kelebeginKanadi, meyveGrafigi); Ceren sözleri 21 (236–256). Test kipi `?yenitur=roket|kelebek|grafik`. Çizimleri gelince sıra kendiliğinden uzar: 4 yaş Sayı 17, Şekil 13; 5+ Sayı 18, Şekil 13, Ölçü 12.

### Adım 15 · Yeni turların derinliği: her tur üç farklı geliş (kuruldu, 21 Kasım öğleden sonra; yönetici kararı)
- **Geliş:** oyuncağın sırası bitip çocuk aynı oyuncağa yeniden başladığında (`Tur.tekrar` bir artar). 1. geliş kolay, 2. orta, 3. ve sonrası zor; zor basamakta her gelişte havuzdan başka soru. Aynı soru art arda iki gelişte gelmez (`matematik/src/derinlik.ts`).
- **Akıllı tekrar:** sayılı yeni turlar (Elma, Kurabiye, Tren, Balon, Kek, Asansör, Zıpzıp, Lokum, Sürahi, Bütün–Yarım, Ritim, Paylaşım, Roket, Grafik) ilk yanlışta doğru sayıyı yaşın defterine yazar, ilk denemede doğruda düşürür. Sonraki gelişte o sayıyı içeren soru öne alınır; turun başında `planZor`'a bir kez alınır, yarıda kalan tur aynı sorularla sürer. Şekil Bahçesi konu defterindeki şekli başa alır.
- **Yeni işler:** Sayı Treni 2. geliş eksik vagon(lar), 3. geliş büyükten küçüğe (4 yaş) ya da ikişer (5+); Kek Fırını 3. geliş eksik toplanan ("6 + ? = 9"; yanlışta eklenecek kekler parlar); Bütün–Yarım elma → armut, ekmek → simit, 2 → 4 → 6 yarım; Kino'nun Günü rafta öbür diziden çeldirici; Kino Sürdürsün iki boşluk ve dört kartlık birim; Baba iki, 5+ üç ölçüt; Ritim 8'den 2'şer, 5'er 35'e, 10'ar 100'e; Roket 5 → 10 → 20; Paylaşım 6 → 8, 9 → 10, 12; Şenlik Bayrakları AB → AAB → ABC → ABCD; Sürahi 2 → 3 → 4 bardak; Tahterevalli 2–6 küp.
- Ceren 10 yeni söz (257–265 ve "Seksen" 227). Birim testi `matematik-derinlik.test.ts` (her tur, her yaş: ilk üç geliş farklı, on gelişte art arda tekrar yok, defter öne alır, sınırlar). Videolar `ekip/etkinlik/matematik/yeni-turlar/derinlik/` (Tren, Kek, Bütün–Yarım 2. ve 3. geliş).

### Adım 16 · Konum ve sıra sayıları: iki yeni tur (kodu ve sesleri hazır, 22 Kasım gecesi; Astra M33–M34 bekliyor)
- **Neden:** okul öncesi programında olup Matematik'te olmayan iki konu. Konumda yalnız "evin soluna, üstüne, sağına" turu vardı; sıra sayısı (birinci, sonuncu) hiç yoktu.
- **Lokum'la Saklambaç** (Şekil atölyesi, her yaş):
  - Çocuk ebedir. Ekran kararır, Ceren'le üçe kadar sayılır, Lokum sandığın içine, masanın altına, berjerin arkasına ya da iki minderin arasına saklanır.
  - Ceren nerede olduğunu söyler, çocuk o yere dokunur, Lokum oradan çıkar ("Sobe! Lokum masanın altındaymış.").
  - Sonra oda toplanır: "Topu sandığın içine koy", "Ayıcığı masanın üstüne koy". Çocuk eşyayı sürükler ya da önce eşyaya, sonra yere dokunur.
  - Yaşa göre:
    - 2–3 yaş: içinde, altında, arkasında, üstünde; tek eşya.
    - 4 yaş: önünde, yanında, arasında da var; iki eşya (hangisinin istendiğini dinlemek de iş).
    - 5+ yaş: zor basamakta karşıt çift (masanın altına, sonra masanın üstüne).
  - İlk yanlış konu defterine yazılır (`konum:<ilişki>`); veli sayfasında "Konum" olarak görünür.
- **Kaydırak Sırası** (Fener tiyatrosu, her yaş):
  - Arkadaşlar parkta kaydırak sırasında; kaydırağa en yakın olan birinci.
  - Ceren sorar: "Üçüncü kim? Ona dokun." 5+ yaşta "Bulut kaçıncı sırada?" sorusu da gelir, rakam kartıyla cevaplanır.
  - Doğruda birinci kayar ve sıranın sonuna geçer; herkes bir öne ilerler, sonraki soru yeni sıraya göre.
  - Yanlışta Ceren kaydıraktan başlayıp birlikte sayar ("Birinci, ikinci, üçüncü"), doğru arkadaş parlar.
  - Sonda herkes sırayla kayar, Ceren sırasını söyler.
  - Yaşa göre:
    - 2–3 yaş: üç arkadaş; birinci ve sonuncu.
    - 4 yaş: dört arkadaş; ikinci, üçüncü, dördüncü.
    - 5+ yaş: beş arkadaş; beşinciye kadar ve "kaçıncı?".
- **Derinlik:** her iki turda üç farklı geliş (`derinlik.ts`).
- **Kod ve kurallar:** `matematik/src/konum-sira.ts` (kurallar, fon koordinatları); sahneler `main.ts → lokumlaSaklambac, kaydirakSirasi`; ek tur kodları 122 ve 123.
- **Ses:** Ceren'in 53 kaydı (sözler 266–318). Scribe hepsini istenen cümle olarak duydu. "Buldun! Lokum" bitişiği her alışta "Buldum" duyulduğu için o cümleler "Sobe! …" oldu.
- **Test kipi:** `?test=1&yenitur=saklambac|kaydirak`.
- **Çizim:** Astra Paket M33 (12 çizim, `assets/matematik/saklambac/`) ve M34 (11 çizim, `assets/matematik/kaydirak-sirasi/`); brief `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 06:02.
- **Uzunluklar:** çizimler gelince Şekil 11 / 14 / 14, Fener 10 / 10 / 11.

### Adım 17 · 2–3 yaş önceliği: Kino Ailesinin Sofrası (kodu ve sesleri hazır, 22 Kasım sabahı; Astra M35 bekliyor)
- **Neden:** yönetici, 2–3 yaş yolunda içeriği en az olan yeri istedi. 2–3 yaşta en kısa oyuncak Ölçü tezgâhıydı (9 tur); büyüklüğe göre eşleme ve sıralama hiç yoktu.
- **Ne:** Baba, Anne ve Kino sofrada. Çocuk kâse, bardak ve kaşıkları herkese kendi boyunda dağıtır: büyük Baba'ya, orta Anne'ye, küçük Kino'ya (sürükle ya da önce eşyaya, sonra kişiye dokun).
  - Doğruda kişi sevinir, Ceren söyler ("Kino'ya en küçüğü!").
  - Yanlışta eşya yerinde kalır, Ceren nedenini söyler ("Bu, Kino'ya çok büyük!").
  - Takım bitince "Afiyet olsun!".
- **Yaşa göre:**
  - 2–3 yaş: yalnız Baba ve Kino; büyük ve küçük; iki takım.
  - 4 yaş: üç boy, iki takım.
  - 5+ yaş: üç boy, üç takım.
- **Derinlik:** her gelişte başka takımlar ve başka bekleme sırası; sıra hiçbir zaman kişilerin sırasıyla aynı değil.
- **Akıllı tekrar:** ilk yanlış konu defterine (olcu:buyuk-kucuk).
- **Kod:** `matematik/src/aile-sofrasi.ts`, `main.ts → kinoAileSofrasi`; ek tur 124, her yaşta Ölçü'nün sonunda.
- **Ses:** Ceren'in 17 kaydı (319–335) ve Lokum'un "Afiyet olsun!" kaydı (125). Scribe 17/17. "Bu, Anne'ye çok küçük!" iki alışta da yanlış duyulduğu için "Bu, Anne için çok küçük!" oldu. Beş kaydın düzeyi öbürlerine eşitlendi.
- **Test kipi:** `?test=1&yenitur=sofra`.
- **Çizim:** Astra Paket M35 (3 sayfa, 17 çizim, `assets/matematik/aile-sofrasi/`); brief `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 07:21.
- **Uzunluklar:** çizimler gelince Ölçü 10 / 11 / 13.

### Adım 18 · 2–3 yaşın ikinci kısa oyuncağı: Mila ile Pamuk'un Eş Kartları (kodu ve sesleri hazır, 22 Kasım sabahı; Astra M36 bekliyor)
- **Neden:** sofra turundan sonra 2–3 yaşta en kısa oyuncak Fener tiyatrosu (10 tur). Fener'in becerisi örüntü ve hafıza; eş bulma (görsel bellek ve eşleme) yoktu. Yönetici Kino ailesinden başka kadro ve yeni sahne istedi.
- **Ne:** kar yağan pencerenin önünde, halıda kapalı kartlar; Mila ile Pamuk yanında oturur. Çocuk iki karta dokunur:
  - Eşse kartlar açık kalır, Mila ya da Pamuk sevinir, Ceren söyler ("Eş! İki tren.").
  - Değilse kartlar bir an sonra kapanır; ilk seferde Ceren "Yerlerini aklında tut!" der.
- **Yaşa göre:**
  - 2–3 yaş: 4 kart; önce kısa bir bakış, sonra kapanır.
  - 4 yaş: 6 kart.
  - 5+ yaş: 8 kart.
  - 4 ve 5+ yaşta sonda eşler ikişer sayılır ("İki, dört, altı…").
- **Derinlik:** her gelişte başka resimler; bir eşin iki kartı hiçbir zaman yan yana ya da üst üste değil.
- **Kod:** `matematik/src/es-kartlar.ts`, `main.ts → esKartlar`; ek tur 125, her yaşta Fener'in sonunda.
- **Ses:** Ceren'in 12 kaydı (336–347) ve sayı sözleri (33, 35, 37, 39). Scribe 12/12.
- **Test kipi:** `?test=1&yenitur=eskart`.
- **Çizim:** Astra Paket M36 (2 sayfa, 13 çizim, `assets/matematik/es-kartlar/`); brief `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 07:35.
- **Uzunluklar:** çizimler gelince Fener 11 / 11 / 12.

### Adım 19 · 2–3 yaşın üçüncü kısa oyuncağı: Dede'nin Şekil Kutusu (kodu ve sesleri hazır, 22 Kasım sabahı; Astra M37 bekliyor)
- **Neden:** Ölçü ve Fener'den sonra 2–3 yaşta en kısa oyuncak Şekil atölyesi (11 tur). Klasik şekil yerleştirme oyuncağı yoktu; Ceren'in Şekiller dersi hatırası bir şekil kutusu resmi, bu tur onu oyuncağa çeviriyor. Bugünkü yeni turlardan başka karakter (Dede) ve sahne (sonbahar bahçe çardağı).
- **Ne:** tahta şekiller kutunun önündeki kendi deliklerine sürüklenir ya da önce şekle, sonra deliğe dokunulur.
  - Girerse "Tık!", Dede alkışlar.
  - Başka delikse geri seker ("Olmadı! Bu şekil başka delikten girer.").
- **Yaşa göre:**
  - 2–3 yaş: daire, kare, üçgen; dört parça.
  - 4 yaş: dikdörtgen de; beş parça.
  - 5+ yaş: yıldız da. İki şekil ters ya da yan gelir; dokununca 90° döner, düz değilken girmez ("Bu şekil ters duruyor. Dokun, çevir!").
- **Derinlik:** her gelişte başka parçalar, 5+ yaşta başka çevrilmiş şekiller.
- **Akıllı tekrar:** ilk yanlış konu defterine (sekil:<şekil>).
- **Kod:** `matematik/src/sekil-kutusu.ts`, `main.ts → sekilKutusu`; ek tur 126, her yaşta Şekil'in sonunda (Ay gezgininden önce).
- **Ses:** Ceren'in 10 kaydı (348–357), Scribe 10/10.
- **Test kipi:** `?test=1&yenitur=kutu`.
- **Çizim:** Astra Paket M37 (2 sayfa, 9 çizim, `assets/matematik/sekil-kutusu/`); brief `CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 07:54.
- **Uzunluklar:** çizimler gelince Şekil 12 / 15 / 15.

## 3 · Her adımda ortak ölçü

- Bir derste aynı iş iki kez olmaz; tur kısa ve tempolu.
- Yaşa göre üç yol: 2–3, 4 ve 5+.
- Ceren'in her sözü ayrı ElevenLabs isteği, Ceren klonuyla; Scribe ile denetlenir, ses düzeyi öbür kayıtlarla eşlenir.
- Çizim yalnızca Astra'dan: sayfa başına en çok 8 çizim; abaküs gerçek oyuncak gibi ve yüzsüz; çilek yok.
- Bitmiş sayılması için:
  - birim ve Matematik e2e testleri iPad ve telefonda geçer;
  - taşma taraması temiz;
  - gerçek sesle bir kez oynanır;
  - iPad ve telefon görüntüsü ya da kısa videoyla gösterilir.
- Yükleme yalnızca Barış "yükle" deyince.


**Görsel kuralı (Barış, 19 Kasım):** "Var olan çizim yeter" diye tasarlanmaz. Her yeni ders ve tur kendi yeni Astra görseliyle gelir; aynı tahta ve aynı meyve tekrar tekrar kullanılmaz. Brief'ler toplu gider: M3–M9 `CLAUDE-ASTRA-MESAJLAR.md` 19 Kasım 19:55.
