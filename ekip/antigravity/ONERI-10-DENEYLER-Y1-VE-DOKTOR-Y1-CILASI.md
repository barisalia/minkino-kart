# ONERI-10 · 19:00 Gösterimi İçin Deneyler-Y1 Hazır Tasarım Planı + Doktor-Y1 Elit Oyun Hissi Cilası + UI-1 Piksel Denetimi

**Tarih:** 22 Kasım 2026 · **Saat:** 15:08  
**Yazan:** Antigravity (Neon 4.0)  
**Hedef:** Claude (Yönetici), Claude (Matematik / Deneyler), Claude (Harf / Minik Doktor)  
**Kapsam:** Sıfır görsel üretimi (Barış'ın 14:35 kuralı), sıfır kod değişikliği — 19:00 Barış gösterimine yetişecek en yüksek kaliteli tasarım, fizik, ses, stil ve mikro-etkileşim rehberi.

---

## 1. Teslim Edilen 12 UI-1 Görselinin Gerçek Piksel Denetimi & Minkino Stiline Çevirme Kuralları

`ekip/ui-secenek/` içindeki tüm 12 önizlemeyi (`ui-doktor-a1..c2`, `ui-deney-a1..c2`) `assets/kitap/doktor/kapak.webp`, `klinik-yildiz.webp` ve `output/kapak-k1/seri.png` ile yan yana inceledim. Barış'ın **14:55 stil uyarısının** ve **14:49 akıcılık/oturuş kuralının** somut karşılığı piksellerde çok net görülüyor:

### A. Neden UI-1'deki Çizgi "Bizim Stil" Değildi (Doktor-Y1 ve Deney-Y1'de Kesinlikle Yapılmayacaklar)
1. **Kalın, parlak "sticker" konturu ve neon renkler:** UI-1 görsellerinde kalın kara keçe kalem çizgisi, aşırı doygun camgöbeği/kırmızı ve plastik beyaz parlamalar var. **Bizim stil (`assets/kitap/doktor/` + `kapak-k1/seri.png`):** ince ve zarif koyu kontur (`#221E1B`), kadife yumuşaklığında düz pastel renkler (adaçayı yeşili `#A8D8A8`, yumuşak lavanta `#D5BFE2`, sıcak şeftali `#F5CE9E`, nane `#A4E1CC`, bal ahşabı `#E8B87D`), **plastik beyaz parlama şeritleri yok**, en fazla tek, yumuşak ve düz bir gölge.
2. **4 parmaklı beyaz insan eldiveni imleci (`a1, b1, b2, c1, c2, deney-a1, deney-c1`):** Minkino'da insan eli/figürü yasaktır; oyunda ipucu olarak asla beyaz çizgi film eldiveni kullanılmamalı. Bunun yerine **yumuşak altın halka nabzı**, kesikli parlak hedef yuva ve hafif zıplayan nesne pırıltısı kullanılır.
3. **Havada asılı karakterler ve kopuk gölgeler (`ui-deney-a2.png`):** Kino ve Ceren masanın arkasında havada duruyor, altlarında masaya kopuk oval gölgeler var. Barış'ın **14:49 kuralına** göre karakterlerin patileri/ayakları her zaman masanın kenarına veya zemin çizgisine sağlam basmalı; zıplama yapılacaksa gerçek 4 karelik zıplama sheet'i kullanılmalı, tek kare yukarı ötelenmemeli.
4. **Fizik ve güvenlik yakalamaları:**
   - `ui-deney-b1.png`: Su aynı anda hem su çarkına akıyor hem de yukarı çıkıp ucu açık, boşlukta duran üst boruya tırmanıyor (fizik hatası). Deney-Y2'de boru yolu mutlaka fiziksel olarak tutarlı kurulmalı.
   - `ui-deney-c1.png`: Tank dibinde **bilye** çizilmişti — 14:55 kararında zaten yasaklandı; çocuk güvenliği açısından mükemmel oldu.

### B. 12 Önizleme Arasında Deneyler İçin Açık Ara #1 Kazanan
- **`ui-deney-a1.png` + `ui-deney-a2.png` ("Zincirleme Top Parkuru")** gerçek bir şov parçası! Tek bakışta ne yapılacağı 0 kelimeyle anlaşılıyor: kırmızı top, ahşap rampalar, mor huni, kesikli parlak yuva, 4 renkli domino, sarı zil, kırmızı-beyaz yelkenli, sağda parça rafı, arkada meraklı Kino.
- **Stratejik karar (19:00 için):** `Paket Deney-Y1` **kesinlikle "Zincirleme Top Parkuru"** olmalı (Minkino kitap stiline çevrilmiş + iri kırmızı **BAŞLAT kolu** eklenmiş hâliyle!). `ui-deney-b2` (**Işık & Rüzgâr Devresi**) `Deney-Y2`, `ui-deney-c2` (**Gözlüklü Kino ile Köpüren Volkan**) ise `Deney-Y3` olarak hemen arkasından aynı "Deneyler" atölyesinin 2. ve 3. masaları olur.

---

## 2. `Paket Deney-Y1` Hazır Tasarım & Akış Planı · "Kino'nun Büyük Top Parkuru" (19:00 Gösterimi İçin)

**Amaç:** Matematik/Deney oturumu `Paket Deney-Y1` brief'ini yazarken vakit kaybetmeden, **Astra'nın 6–7 kompakt çağrıda bitirebileceği**, kodda 60fps cam gibi akacak ve Barış 19:00'da masaya oturduğunda *"İşte bu dünyanın en iyisi!"* dedirtecek eksiksiz tasarım.

### A. Tek Bakışta Ekran Yerleşimi (`2048 × 1152`, Minkino Kitap Stili)
- **Stil çıpası:** `assets/kitap/doktor/kapak.webp` ve `assets/uygulama/oyun-kapaklari/deney.webp` ile birebir aynı çizgi ağırlığı, sıcak pastel palet ve düz dokusuz renkler.
- **Arka plan (sıcak atölye):** Bal rengi dikey tahta duvar, sol üstte açık mavi gökyüzü ve yumuşak yeşil tepelerin göründüğü pencere + minik kırmızı saksıda iki yapraklı bitki, ortada mantar pano (iki sade pastel dişli ve iki boş not kâğıdı — yazısız).
- **Ön plan (çalışma masası, y 560…1152):** Sıcak açık meşe masa üstü; altında 3 sade yuvarlak kulplu çekmece süsü (y 1040…1152).
- **Kino (arka orta-sol, x 540…1040, y 70…600):** Onaylı YouTube/kitap modeli (yeşil tişört, mavi fular, kırmızı yanaklar, doğru turuncu göz lekesi). **İki beyaz patisi masanın arka kenarına (`y = 585`) sağlam basıyor** — asla havada değil! Gözü aktif olarak topu ve çocuğun sürüklediği parçayı takip eder.
- **Sağ Parça Rafı (x 1630…1990, y 70…640):** Yumuşak nane-turkuaz çerçeveli, 3 bölmeli oyuncak rafı. Her bölmede çocuğun parmağıyla kapıp masaya sürükleyeceği gerçek boyutlu parçalar:
  1. **Sarı Ahşap Rampa** (kısa köprü rampa)
  2. **Mor Huni** (dönen şaşırtmalı huni)
  3. **Turuncu Trambolin Yay** (topu zıplatan yaylı yastık)
- **Sol Başlangıç Kulesi & Kırmızı BAŞLAT Kolu (x 70…520, y 420…960):**
  - İki katlı ahşap iskele üstünde eğimli başlangıç rampası, en tepede küçük ahşap durdurucu kapakçığın arkasında bekleyen parlak **Kırmızı Top** (`çap 110 px`).
  - İskelenin sol önünde **iri, dokunulası kırmızı fiziksel BAŞLAT Kolu (lever)** (`x 80…210, y 620…840`): Çocuk kolu aşağı çekince (veya dokununca) mekanik **"KLANK!"** sesiyle kapakçık açılır ve kırmızı top serbest kalır!
- **Sağ Bitiş Zinciri (x 1220…1980, y 680…960):**
  - **4 Renkli Müzikli Domino** (kırmızı, sarı, yeşil, mavi — devrilirken sırayla **Do–Re–Mi–Fa!** ksilofon notası çalar!)
  - **Sarı Masa Zili** (mavi domino çarpınca yaylanarak zıplar ve **"ÇINNNN!"** çalar!)
  - **Kırmızı-Beyaz Yelkenli** (zilin önündeki küçük su oluğu/ray üstünde durur; zilin tetiklediği itkiyle yelkeni dolup **"vuuuş!"** diye sağa kayar, ucundaki bayrak dalgalanır!)

### B. 60–90 Saniyelik 3 Turlu Oyun Akışı & Yaş Ölçeklemesi
Aynı sahne ve aynı parçalarla **3 kademeli** harika bir akış kurulur — ekstra fon çizimi gerekmez!

| Tur | Yaş Uyumu | Parkurdaki Durum | Çocuğun Eylemi & Ekrandaki Büyü |
|---|---|---|---|
| **Tur 1 · İlk Zincir** *(Isınma)* | **2–3+ yaş** (herkes açar) | Başlangıç rampası + Mor Huni yerinde. Huniden domino dizisine giden **1 tek yuva boş** (yumuşak altın kesikli çizgiyle parlar). | Çocuk sağ raftan **Sarı Rampa**yı sürükleyip yuvaya oturtur (**"tık!"** + mıknatıs çekimi + toz pırıltısı). Kırmızı **BAŞLAT kolu** parlamaya başlar. Çocuk kolu çeker → top iner → hunide fırıl fırıl döner (**"vuu-pıt!"**) → yeni rampadan geçer → 4 domino **Do-Re-Mi-Fa!** → zil **"ÇINNNN!"** → yelkenli kayar → **Kino zıplayıp alkışlar, konfeti yağar!** |
| **Tur 2 · Zıplayan Top** *(Keşif & Şaşırma)* | **4+ yaş** (2–3 yaşta tek ipucuyla devam) | İki yuva boş: önce **Turuncu Trambolin Yay** (yüksek engeli aşmak için!), sonra **Sarı Rampa** (dominoya ulaştırmak için). | Çocuk iki parçayı yerleştirir ve **BAŞLAT kolunu** çeker. Top rampadan inip tramboline düşer → trambolin ezilip fırlar (**"BOİNG!"**) → top havada parabolik yay çizerek üst rampaya konar → dominolar → zil → yelkenli! |
| **Tur 3 · Usta Mucit** *(3 Parça + Serbest Tekrar)* | **5+ yaş** (ve meraklı 4 yaş) | **3 yuva birden boş:** Rampa + Mor Huni + Trambolin Yay! Çocuk sıralamayı deneyerek bulur. | Doğru dizilimle tüm zincir eksiksiz çalışır. Final kutlamasından sonra **BAŞLAT kolu aktif kalır**; çocuk isterse tekrar çekip şovu yeniden izler, isterse yeni parkura geçer! |

### C. Barış'ı En Çok Güldürecek Sır: "Hata Yok, Komik Fizik Var!"
Eğer çocuk parçaları henüz koymadan veya yanlış/eksik bir kombinasyonla **kırmızı BAŞLAT kolunu çekerse:**
- Asla soğuk bir *"Yanlış!"* çarpısı ya da kırmızı ekran çıkmaz!
- **Top gerçekten harekete geçer!** Boşluğa gelince fiziksel olarak düşer, masada komik **"pıt-pıt-boing!"** diye sekip yumuşakça durur.
- Kino şaşırıp kıkırdar (**`kino-saskin`**): *"Hoppala! Top kaçtı! Buraya bir parça daha koyalım mı?"*
- Eksik boş yuva 1,5 sn altın renginde nazikçe nabız atar ve kırmızı top küçük bir yayla başlangıç rampasına geri zıplar. Çocuk **neden çalışmadığını kendi gözüyle görüp** anında anlar! *(Tinybop + Toca Lab'ın gerçek altın sırrı!)*

### D. 19:00'a Yetişecek Kompakt Astra Çizim Listesi (Öneri — Toplam 6 Çağrı, ~18 Parça)
1. **Çağrı 0 · Stil Anahtar Karesi (1 çizim, oyunda kullanılmaz):** `ekip/deney/y1/anahtar-parkur.png` (`2048 × 1152`, Minkino kitap stili: ince koyu kontur, sıcak pastel atölye, masa üstünde kurulu parkur, masaya sağlam basan Kino, sol başta iri kırmızı BAŞLAT kolu, sağda 3 bölmeli raf, sıfır insan eli).
2. **Çağrı 1 · `atolyefon` (1, opak `2048 × 1152`):** Boş atölye + ahşap masa + sağ boş raf + sol başlangıç iskelesi (top, kol, değiştirilebilir parçalar ve karakterler yok).
3. **Çağrı 2 · Kino (4, şeffaf, tek sayfa, aynı tuval `800 × 700`, patiler `y = 660` masa çizgisinde sabit!):**
   - `kino-bekle-0` (meraklı gülümseme, iki pati masa kenarında)
   - `kino-bekle-1` (gözler hafif kısık / kulak kıpırtısı, bekleme döngüsü)
   - `kino-saskin` (ağız küçük "o", bir pati yanakta — top boşluğa düşünce!)
   - `kino-sevin` (iki pati havada sevinçli, gövde masa arkasında sağlam oturuyor — havada yüzen gölge yok!)
4. **Çağrı 3 · Hareketli Başlangıç & Parkur Parçaları (6, şeffaf, tek sayfa):**
   - `top-kirmizi` (200×200, düz kırmızı, tek keskin yumuşak gölge — plastik parlama yok)
   - `kol-taban` (260×300, sol iskeledeki kol mekanizması)
   - `kol-sap` (260×300, kırmızı topuzlu kol — kod pivot etrafında 0° → 55° döndürür!)
   - `parca-rampa` (420×180, sarı ahşap köprü rampa)
   - `parca-huni` (320×340, mor huni + alt çıkış dirseği)
   - `parca-trambolin` (320×220, turuncu yaylı trambolin yastık)
5. **Çağrı 4 · Bitiş Zinciri Parçaları (6, şeffaf, tek sayfa):**
   - `domino-kirmizi`, `domino-sari`, `domino-yesil`, `domino-mavi` (her biri 140×300, alt köşe pivotuyla kodda cam gibi devrilir!)
   - `zil` (260×240, sarı masa zili — kodda squash-and-stretch + titreşim)
   - `yelkenli` (360×340, kırmızı-beyaz oyuncak yelkenli — kodda dalga çizgisiyle kayar!)
6. **Çağrı 5 · (Opsiyonel Bonus, vakit kalırsa 2 çizim):** `ceren-alkis-0`, `ceren-alkis-1` (mevcut `assets/ingilizce/kisi/ceren-alkis-*.webp` veya yeni atölye önlüklü Ceren — final kutlamasında sağdan gelip Kino'yla alkışlar).

### E. 60fps Akıcılık & Ses Mühendisliği (Barış'ın 14:49 Kuralı)
- **Top hareketi:** Gerçek `requestAnimationFrame` yerçekimi hızlanması (`v += g*dt`), top kendi etrafında döner (ince bir küçük nokta/desen veya hafif squash-and-stretch ile yuvarlanma hissedilir).
- **Hunide dönme:** Top huninin üst ağzına girince 0,55 sn daralan spiral yörüngeyle döner (`scale 1.0 → 0.85 → 1.0`), alt dirsekten **"pıt!"** diye fırlar.
- **Trambolin:** Top değdiği anda yay `scaleY(0.62) scaleX(1.22)` sıkışır (80ms) → `scaleY(1.15)` fırlar (140ms) → top yumuşak parabolle yükselir (**"BOİNG!"**).
- **4 Domino:** 110ms aralıkla sırayla 0° → 68° ease-in devrilir; her birinde WebAudio/WAV **C5 – D5 – E5 – F5** parlak tahta ksilofon sesi!
- **Zil + Yelkenli:** 4. domino zili vurunca zil 180ms zıplayıp titrer (**"ÇINNNN!"**), yelkenli 900ms ease-out kayar, üstünden 8–10 küçük yıldız/konfeti fışkırır.
- **Kısa Türkçe Seslendirme (Ceren & Kino):**
  - Giriş (Ceren): *"Kino'nun parkurunda bir parça eksik! Raftan alıp yerine koy, sonra kırmızı kolu çek!"*
  - Parça oturunca (Kino): *"Harika oturdu! Haydi kırmızı kolu çek!"*
  - Erken/yanlış denemede (Kino): *"Hoppala! Top kaçtı! Şuraya bir parça daha koyalım!"*
  - Final (Kino + Ceren): *"Çınnn! Yelkenli gitti! Yaşasın, harika bir mucitsin!"*

---

## 3. `Doktor-Y1` ("Zıpzıp'ın Dikenli Patisi") İçin Sıfır Yeni Çizimle 10× Elit Oyun Hissi & Akıcılık Cilası

Harf / Minik Doktor oturumunun `CLAUDE-ASTRA-MESAJLAR.md:6268–6376` içindeki `Paket Doktor-Y1` çizim listesi (Çağrı 0–11) Barış'ın **B + C temel, A açılışta çanta** kararına harika oturuyor. **Tek bir çizim bile eklemeden**, yalnızca kod + ses + mikro-etkileşim katmanında şu **7 dokunuş** oyunu "iyi bir prototip"ten **"dünyanın en iyisi"** seviyesine çıkarır:

1. **Kırmızı Acil Çanta Açılış Tiyatrosu (A'nın Kalbi):**
   - `canta-kapali` → `canta-acik` aniden tek karede değişmesin!
   - Çocuk çantaya dokununca önce 120ms sıkışma (`scale(0.97)`), iki sarı klips üstünde küçük altın kıvılcım + metalik **"ÇIT-ÇIT!"** sesi, ardından kapak yaylı açılışla (`cubic-bezier(0.34, 1.56, 0.64, 1)`, 260ms) `canta-acik`a geçsin.
   - İçindeki 4 alet (`buyutec`, `sprey`, `cimbiz-acik`, `sargi-rulo`) 65ms kademeyle **"pıt-pıt-pıt-pıt"** minik sıçramayla yuvalarına otursun.

2. **Gerçek Büyüteç Merceği (`clip-path: circle`) İle Mikrop Avı (B'nin Sihri):**
   - `buyutec.webp` camı zaten tamamen şeffaf istenmiş — bu müthiş avantaj!
   - `mikrop-0`, `mikrop-1`, `mikrop-2` kol üstünde **yalnızca büyütecin cam dairesi (`clip-path: circle(r at mx my)`) içindeyken görünür** olsun! Çocuk büyüteci Zıpzıp'ın kolunda gezdirdikçe mikroplar büyülü bir şekilde ortaya çıksın!
   - Mercek bir mikrobun üstüne tam gelince mikrop `scale(1.18)` büyüyüp yaramazca sallansın + **"ihi-ihi!"** komik ses çıkarsın ve üstüne minik bir "bulundu!" parıltısı düşsün. 3/3 mikrop bulununca köpük spreyi yuvasında yumuşak altın nabız başlasın.

3. **Katmanlı Köpük & Parmak Altında Eriyen Çamur (Tek Tıkta Yok Olmasın!):**
   - Çocuk `sprey`i tutup kolun üstünde gezdirdikçe (basılı sürüklemede her 180ms'de bir **"fıss!"** sesiyle) ağız ucundan `(150, 110)` küçük `kopuk` bulutları çıkıp kola yapışsın.
   - Her mikrop 2–3 fıs köpük alınca **0.25 sn şişip panik titremesi yapsın**, sonra `pof-0` (100ms) → `pof-1` (140ms) + **"POF!"** sabun balonu sesiyle patlasın!
   - **Çamur temizliği:** `kol-camurlu` aniden `opacity: 0` olmasın — köpük her bir çamur lekesinin üstüne geldikçe o bölgedeki leke yumuşakça solsun (3 bölgesel alfa maskesi veya canvas silgi maskesi) ve altından tertemiz `kol-temiz` parlayarak çıksın!

4. **Cımbız Direnci + Çelik Tepsiye "TINGIR!" Parabolü (En Tatmin Edici An):**
   - Çocuk `cimbiz-acik`ı `diken`in ucuna yaklaştırınca (geniş, çocuk dostu 85px mıknatıs yarıçapı) uçlar **"tık"** diye `cimbiz-kapali`ya geçsin.
   - Çocuk dikeni dışarı doğru çekerken diken hemen ışınlanmasın: **ilk 35px sürüklemede elastik bir dirençle uzasın** (0.3 sn gerilim + hafif tüy titremesi), eşiği geçince **"PITT!"** diye serbest kalsın!
   - Serbest kalan diken parabolik bir yayla (`requestAnimationFrame` + hafif dönüş) sağdaki çelik böbrek tepsisine uçsun, tepsiye değince **"TINGIR!"** metalik tınlama + minik bir sekme yapıp tepsinin içinde kalıcı olarak biriksin (3 diken bitince tepside 3'ü de yan yana durur!).

5. **Gerçek Sargı Sarma (`clip-path`) + Desenli Bant "ŞAP!" Hissi (C'nin Kalbi):**
   - `sargi-sarili` tek dokunuşta birden belirmesin! Çocuk `sargi-rulo`yu kolun üstünde soldan sağa (veya 3 tur) gezdirdikçe:
     - `sargi-sarili` soldan sağa **`clip-path: inset(0 ${100 - ilerleme}% 0 0)`** ile gerçek zamanlı sarılarak ortaya çıksın!
     - `sargi-rulo` her harekette hafifçe dönsün + yumuşak kumaş hışırtısı (**"fışş-fışş"**) çalsın.
   - Sargı %100 sarılınca alttaki `serit` tepsisinde 3 desenli bant (`bant-yildiz`, `bant-kalp`, `bant-pati`) hafifçe zıplayarak kendini göstersin. Çocuk istediğini sürükleyip sargının ortasına bırakınca **"ŞAP!"** + 5 küçük altın yıldız parıltısı!

6. **Sıcak Seslendirme & Duygusal Bağ (Zıpzıp + Kino — Soğuk Kuşbakışı Sıcaklaşsın!):**
   - Sedyedeki Zıpzıp'ın sesi (`zıpzıp erkek`, `zCieqqNJvrBIGmXON5an`) her aşamada kısa ve tatlı tepki versin — çocuk makine tamir etmiyor, arkadaşını iyileştiriyor hissini alır:
     - Giriş: *"Çalıya düştüm, patime diken battı... Bakar mısın doktor?"*
     - Mikrop bulununca: *"Aaa, minik mikroplar saklanmış!"*
     - Köpük sıkınca: *"Hihihi! Köpük çok gıdıklıyor!"*
     - İlk diken çıkınca: *"Ayy... oh, hemen rahatladı!"*
     - Sargı & bant bitince (`zipzip-sevinc-0/1` + göğse `yildiz` konunca): *"Yaşasın! Patim iyileşti! Çok teşekkürler doktor!"*

7. **Barış 14:49 Kusursuzluk Kontrol Listesi (19:00 Öncesi Son Test):**
   - `zipzip-uzgun-0 ↔ 1` döngüsü asla 0.3 sn hızlı ping-pong yapmasın — **1.4 sn yumuşak organik ritim** + rastgele 3.5–5.5 sn `zipzip-uzgun-kirp` (140ms göz kırpma).
   - `zipzip-sevinc-0 ↔ 1` geçişinde kafa ve sargılı kol **tek 1 piksel bile kıpırdamasın**; yalnız sallanan kol ve kuyruk oynasın.
   - 2–3 yaş için her alet ve hedefte **en az 96px dokunma toleransı**; yanlış sıradaki alete dokunursa azarlamadan sıcak sesli yönlendirme (*"Önce büyüteçle mikroplara bakalım mı?"*).
   - İmleç/ipucu olarak **beyaz çizgi film eldiveni kesinlikle yok** — yalnız yumuşak altın halka + hafif nabız.

---

> **Özetle Claude'a Not:** İki oyun da 19:00'a kadar aynı **Minkino kitap sıcaklığında** (`assets/kitap/doktor/`), 60fps akıcı, bol sesli-tepkili ve sıfır pikselsel kusurla biterse Barış bu akşam hem **Doktor**u hem **Deneyler**i tek seferde "İşte elit seviye bu!" diye onaylayacaktır. Yeni istek veya bir sonraki İngilizce Masal 2.0 serisi için her an hazırım!
