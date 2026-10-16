# Eksik listesi: bütün oyunlar (2026-10-16)

Kalite denetçisi ve oyun tasarımcısı. Bu belge yalnız tespit ve iş listesidir. Hiçbir kod ya da görsel değiştirilmedi.

Barış'ın ölçütü: "Kalite çok artmalı. Görselden kaçma, ucuza yapma. Bitmiş gibi sunma."

## Nasıl denetlendi

- Kendi web derlemem `vite build` ile scratchpad'e alındı ve `vite preview` 127.0.0.1:4517'de çalıştı. 5190'a dokunulmadı.
- Tek Chromium kullanıldı (workers=1). Telefon ölçüleri 844×390 yatay ve 390×844 dikey, DPR3, dokunmatik, gerçek hız (`?test=1` yok).
- Her oyunu gerçek bir çocuk gibi oynadım: önce yanlış seçimi denedim, sonra doğruyu; sürükledim, bekledim, ipucuyu izledim. Ekran görüntülerine kare kare baktım.
- Her ekranda iki ölçüm yapıldı:
  - **Büyütme:** görselin ekrandaki piksel boyu (DPR3 dahil) ile kaynak boyu karşılaştırıldı. 1.15'ten büyükse "bulanık".
  - **Cihaz sesi:** `speechSynthesis` dinlendi. Duyulan her cümle kaydı olmadığı için cihaz sesine düşmüş demektir.
- Konsol hatası ve 404 hiçbir oyunda çıkmadı. Tek uyarı Canlan'daki `willReadFrequently` uyarısı, zararsız.
- Kapsam:
  - Menü, Kartlar (soru, Hafıza, Mino ile oyna), Pazar (oyun, Meyve Suyu, Tart).
  - Canlan.
  - Macera'nın 5 bölümü: Doğum Günü, Ege, Banyo, Elektrik, Salıncak.
  - Film (iki film), Dedektif (Vaka 1 ve 3), Kino Ne Giysin, Mino Ne Giysin, Kino'nun Otobüsü, Pasta.
  - Menüde olmayanlar: Pati v2 (`/pati/`), Uyku Vakti (`/?uyku=1&saat=21`) ve oyunlu film (`/oyunlu/`).
  - Uyuyan Orman beklemede olduğu için denetlenmedi.

**Öncelik:** Y = yüksek (çocuk ya da anne hemen fark eder, mağazadan önce şart), O = orta, D = düşük.
**Tür:** görsel / animasyon / oyun / hata / ses.

---

## Genel bulgular (bütün oyunları etkiler)

1. **Y · hata/ses · Açılışta ilk cümleler kayıt varken cihaz sesiyle okunuyor.**
   - `konus()` kaydın olup olmadığına (`kayitVar`) eşzamanlı bakıyor. Manifest (232 KB) daha yüklenmeden ilk cümle gelirse kayıt "yok" sayılıyor ve robot ses çıkıyor.
   - Bu derlemede görüldüğü yerler:
     - Pasta açılışı: "Mino ile Kino'nun Pasta Otobüsü!"
     - Dedektif açılışı: "Yeni bir vaka var!"
     - Banyo: ilk 3 cümle.
     - Elektrik: ilk 5 cümle.
   - Bu cümlelerin hepsinin kaydı manifestte var. Annenin ilk duyduğu ses robot ses oluyor.
   - Yapılacak: ilk konuşma manifesti beklesin (en çok ~1.5 sn). Bkz. iş paketi K1.
2. **Y · oyun · "Şuna dokun" yönlendirmesi hâlâ çok yerde.**
   - Macera bölümlerinde sağ altta görev çipi duruyor: "Kino'yu çevir!", "Kino'nun başını okşa", "Çamura dokun", "Balona üfle", "Fenerin düğmesine bas". Aynı anda büyük el işaretçisi de çıkıyor.
   - Kartlar'da ve Pazar'da ilk yanlıştan hemen sonra doğru seçenek parlıyor.
   - Bu, "seçenek ve deneme-yanılma" kuralına aykırı. Kural: ≥3 anlamlı seçenek olsun, yanlış komik sonuç versin, ipucu geç ve dolaylı gelsin.
3. **Y · animasyon · Karakterler çoğunlukla tek resim.**
   - Hareketler yalnızca ezilip esneme, zıplama ya da parça döndürme (kol, kafa) ile yapılıyor.
   - Barış'ın beğendiği yöntem 8 pozluk hareket sayfası. Şu an bu yalnız Pati'de Fındık ve Tarçın'da var.
   - Mino'nun kolları (`src/mino/mino-poz.ts`, kalkık kol döndürme) ve Kino ile insan karakterlerin iskeleti (`assets/karakter-iskelet`) hâlâ parça döndürüyor.
   - Gereken sayfalar aşağıda, Gemini kuyruğunda.
4. **O · görsel · İki stil yan yana duruyor.**
   - Eski parlak Recraft çizimleri: Kartlar'ın bütün kartları, Pazar'ın arka planı, meyveleri ve müşterileri, Canlan'ın sihirli arka planları, Dedektif şüpheli kartları.
   - Onaylı düz 2D çizimler: Giysin, Uyku, Dedektif odası, Kino'nun Otobüsü, Pasta, film.
   - Aynı ekranda ikisi bir arada görülüyor. Örnek: Dedektif'te düz oda, üstünde parlak ördek kartı.
5. **O · ses · Kaydı hiç olmayan sözler.**
   - Pati v2'de Nehir'in ~30 cümlesi. Duyulanlar: "Bu dükkân artık senin!", "İşte ilk jetonların!", "Tarçın biraz nazlı.", "Hımm, bunu sevmedi galiba."
   - Kino'nun Otobüsü'nde müşteri sesleri. Şimdilik yalnız balonda yazı var (eleven_v4, ONAY BEKLİYOR).
   - Mino Ne Giysin'de Ege'nin "Mama!", "Ham!", "Teşekküyler!" sözleri.
   - `scripts/ses-denetim.ts` "eksik 0" diyor. Bunun sebebi Pati v2 sözlerinin bilerek `tumCumleler`'e eklenmemesi; denetim bunları görmüyor.
6. **O · görsel · Kamera ve dikey ekran büyütmeleri.** Bu ölçümler 844×390 / 390×844 DPR3'te alındı:

   | Ekran | Görsel | Kaynak | Büyütme |
   |---|---|---|---|
   | Doğum Günü | flama | 512×192 | **5.2×** (gözle bulanık) |
   | Dedektif Vaka 3 | otobus-ic | 2752×1536 | 1.95× |
   | Kino Ne Giysin, dikey | oda-dikey | 1080×1920 | **1.8×** |
   | Kino Ne Giysin | dolap ve kapaklar | 1000×1000 | 1.57× / 1.74× |
   | Pasta, dikey | arka-tezgah-uzak-1 | | 1.58× |
   | Pasta, yatay | arka-tezgah-uzak-1 | | 1.42× |
   | Dedektif Vaka 1 | ev arka katmanları | 4096×2286 | 1.5× |
   | Mino Ne Giysin, dikey | oda-dikey | | 1.32× |
   | Dedektif | masa | | 1.27× |
   | Kino Ne Giysin | oda-yatay | | 1.25× |

   - Pazar'da doğru ve yanlış seçimde kamera müşteriye ~2× yaklaşıyor. Dikeyde yaklaşma 2.3×, raster müşteri büyüyor.
   - `ekip/gemini/NETLIK-YENIDEN-CIZIM.md` listesinde olmayan yeni maddeler: Giysin dikey odası, Giysin dolabı, Pasta tezgâhı, Dedektif Vaka 3 otobüs içi.
7. **D · görsel · Menü.**
   - Dikeyde son sıradaki Pasta kartı ekranın altında yarım kalıyor; görmek için kaydırmak gerekiyor.
   - Pasta kartında "Mino ile Kino'nun" tabelası resmin üst yarısını örtüyor. Kartın resmi kodla çizilmiş küçük bir otobüs.

---

## 1. Kartlar (Hafıza, Mino ile oyna)

Durum: Çalışıyor ve sesi tam. Ama klasik "test kâğıdı" gibi; görselleri eski parlak stilde.

- **Y · oyun ·** İlk yanlışta doğru kart hemen sarı halkayla parlıyor (SAY sorusunda görüldü). Çocuk düşünmeden ikinci dokunuşta buluyor.
  - Yapılacak: ilk yanlış komik bir sonuç versin; örneğin Mino yanlış kartı koklasın, hapşırsın.
  - Parlama ancak 2. yanlıştan sonra ve ≥10 sn sonra gelsin. Önce dolaylı ipucu olsun: Mino doğru karta baksın.
- **Y · görsel ·** Kart çizimlerinin hepsi Recraft'ın parlak stilinde (fil, tavşan, zürafa, balıklar, meyveler, taşıtlar). Uygulamanın ilk kartı bu oyun.
  - Yapılacak: temalar tema sayfaları halinde onaylı düz stilde yeniden çizilsin (Gemini G7).
- **O · oyun ·** Soru tipleri hep "3 kartın birini seç". Hafıza dışında oyunun içinde karar veren bir şey yok.
  - Yapılacak: soru tiplerine küçük bir hikâye eklensin. Örnek: "Kim acıkmış?" sorusunda karakter karta tepki versin.
- **O · animasyon ·** Soru ekranında Mino sol üstte 60 px, neredeyse duruyor. "Mino ile oyna"da Mino ortada ve büyük ama kol hareketleri parça döndürme.
  - Yapılacak: Mino 8 pozluk sayfası (G1) bağlansın.
- **O · görsel ·** Yatayda soru şeridinde yalnız ses dalgası var, yazı yok; dikeyde yazı var. Dikeyde 2×2 kartın üstünde ~130 px boşluk kalıyor.
- **D · görsel ·** Hafıza'da açılış animasyonunda kartlar soldan kayarken kenarda ince şerit görünüyor.
- **D · oyun ·** Mino ile oyna: kartı Mino'ya sürüklemek sezgisel değil; dokunmak da çalışıyor, o iyi. Yanlışta Mino "hayır" diyor, 2 yanlışta resim ipucu geliyor; bu doğru yaklaşım.

## 2. Mino'nun Pazarı (oyun, Meyve Suyu, Tart Bakalım)

Durum: Üç kipte de akış sağlam. Ama ilk kipte seçim yok; görsel eski stilde; kamera büyütmesi bulanıklaştırıyor.

- **Y · oyun ·** İstek balonu ürünün resmini gösteriyor ("1 🍎"). Tezgâhta 3 elma var, düşünmek gerekmiyor.
  - Yapılacak, 5-6 yaş için: resim yerine yalnız söz ya da özellik verilsin ("kırmızı ve yuvarlak", "maymunun sevdiği").
  - Yapılacak, 3-4 yaş için: müşteri iki şey istesin, tezgâhta tuzak ürün olsun.
  - İki yanlıştan sonra doğru ürünler parlıyor (`yanlisUrun` → `parlat`). Bu kalsın ama 10 sn'den önce olmasın.
- **Y · oyun ·** Ürüne dokunmak onu sepete koymuyor; yalnız zıplıyor ve nota çalıyor. Sürüklemek şart.
  - "Mino ile oyna"da dokunarak vermek var, burada yok; iki oyun tutarsız. 3 yaş için ağır.
  - Yapılacak: dokunulan ürün sepete uçsun (`surukle` → `birak(dokunus)` dalı).
- **Y · görsel ·** Doğru ve yanlış seçimde kamera müşteriye ~2× yaklaşıyor; dikeyde 2.3×.
  - Raster maymun ve kuş büyüyor ve yumuşuyor. Dikeyde Mino'nun yüzü kadrajın sağında yarım kalıyor.
  - Sol kenarda sıradaki müşterinin yarı saydam "hayaleti" görünüyor (koyun, kuş).
  - Yapılacak: `kam.odakla(... enCok)` kaynak çözünürlüğüne göre sınırlansın; sıradaki müşteri kadraj dışında beklesin.
- **Y · görsel ·** Arka plan, meyveler ve müşteriler parlak Recraft stilinde; Mino düz stilde. Müşteriler tezgâhın arkasında yalnız kafalarıyla görünüyor (maymun).
  - Yapılacak: Gemini G4 (pazar yeri, onaylı stil) ve G5 (müşteri hareket sayfaları).
- **O · görsel ·** Dikeyde ekranın üst %40'ı boş gökyüzü, tezgâh küçük.
- **O · animasyon ·** Müşteriler tek görsel; bütün gövde esneyip sallanıyor. Sevinme, üzülme ve yeme pozu yok.
- **O · oyun · Meyve Suyu:** Yanlış karışımda balon "kırmızı + sarı = turuncu" ipucu veriyor. Bu iyi bir deneme-yanılma örneği.
  - Blender 97 px, meyveler büyük; tezgâhın yarısı boş tahta.
  - Yapılacak: blender büyüsün; yanlış karışımda müşteri komik bir yüz yapsın.
- **O · görsel · Tart:** Patatesler 49 px. Kefe ile kadran iyi ama kefe NETLIK #4'te.
- **D · oyun ·** Boş sepetle "Ver"e basınca "az" uyarısı ve sallanma geliyor; doğru davranış.

## 3. Çiz Canlansın

Durum: Çizim kısmı iyi. "Canlanma" ve "sihirli hâl" ise çocuğun çizimini parlak, boyalı bir resimle değiştiriyor; stil kuralına aykırı.

- **Y · görsel ·** Sihirli arka planlar boyalı ve dokulu: gerçekçi bulutlu gök, ışık huzmeli deniz. Sonuç ekranında güneşin "sihirli hâli" parlak Recraft güneşi.
  - "Yapay zekâ görünümü yok" kuralına doğrudan aykırı.
  - Yapılacak: sahne arka planları (gök, deniz, çayır, gece, oda) onaylı düz stilde yeniden çizilsin (G8). Sihirli hâl çocuğun çizgisini korusun, yalnız renk ve göz eklesin.
- **Y · görsel ·** Açılış kartındaki balıklı deniz sahnesi de aynı boyalı stilde. Menüdeki Canlan kartındaki dinozor parlak Recraft.
- **O · oyun ·** Puan gevşek: güneşte noktaları birleştirmeden kabaca daire çizince 2 yıldız geldi.
  - Yapılacak: `content/canlan.json` → `puan` eşikleri gerçek çocuk çizimleriyle ayarlansın.
- **O · görsel ·** Resim listesindeki ikonlar parlak Recraft. Yatayda ikinci sıra ekranın dışında.
- **O · animasyon ·** Canlanma: güneş ışınları gri düz çizgiler, kodla çizilmiş gibi kaba.
- **D · oyun ·** Nokta kipinde el işaretçisi sıradaki noktayı gösteriyor. Çizim oyununda bu kabul edilebilir.

## 4. Sesli Maceralar (5 bölüm)

Durum: En zengin oyun; her sesli görevin parmak karşılığı var. Ama her adımda bir çip ve bir el "şunu yap" diyor. Karakterler küçük; stil bölümden bölüme değişiyor.

- **Y · oyun ·** Bütün bölümlerde sağ altta görev çipi var ("Kino'yu çevir!", "Kino'nun başını okşa", "Çamura dokun", "Balona üfle", "Fenerin düğmesine bas"). Anlatıcı da aynı emri veriyor ("Salıncağa oturarak binilir. Kino'yu çevir!").
  - Seçenek olan tek yer Elektrik'teki çekmece: eldiven, rende ve fener; yanlışlarda komik söz geliyor. Bu iyi.
  - Yapılacak: çipler kalksın. Anlatıcı yalnız durumu söylesin. Her adımda ≥3 dokunulabilir şey olsun ve yanlışlar komik sonuç versin. İpucu merdiveni ≥12 sn olsun.
- **Y · görsel ·** Doğum Günü'ndeki flama 512 px, 5.2× büyütülüyor; tepesi gözle bulanık (NETLIK #1).
  - Parti çocukları (Ada, Can, Deniz, Elif, Zeynep) parlak stilde, Mino ise düz stilde.
  - Ege bölümünde Ege bebek ile anne farklı, daha gerçekçi bir çizgide.
- **Y · görsel ·** Salıncak'ta yatay ekranda Mino ~50 px, Kino ~40 px; karakterler parkın içinde kayboluyor. Dikeyde ekranın üst %55'i gökyüzü, karakterler alt şeritte küçük kalıyor.
  - Yapılacak: kamera yakın çekimi kaynak sınırında kalsın ve karakterlere yaklaşsın. Dikey park arka planı NETLIK #6'da.
- **Y · animasyon ·** Bütün çocuk karakterleri iskeletle parça döndürüyor; "Cut-out reddi" kuralına aykırı. Kino ve Mino da öyle.
  - Gemini G1, G2, G6: pozlar ayrı ayrı çizilsin.
- **O · görsel ·** Elektrik'te karanlık sahne çok koyu; karakterler mor perdenin altında soluk. Çekmece yakın çekimi NETLIK #5'te.
- **O · görsel ·** Açılış ekranı: 5 bölüm kartının yanında ayrı bir "Oyna" düğmesi var ve hangi bölümü açtığı belli değil. Arka plan odanın bulanık kopyası.
- **O · oyun ·** Doğum Günü balonu: mikrofonsuz kipte "basılı tut" çalışıyor, ama balon başlangıçta 12×22 px; çocuk neye basacağını görmüyor.
- **D · ses ·** Salıncak tekerlemesinin 4 dizesi (`content/macera-salincak.json` → `sarki`) anlatıcı manifestinde yok. Şarkı kaydı ayrıysa sorun yok; değilse cihaz sesine düşer. Denetlenmeli.

## 5. Çizgi Filmler

Durum: Görsel kalitesi en yüksek bölüm (onaylı stil). Animasyon parça döndürme; dikey ekran sönük.

- **O · animasyon ·** Film karakterleri iskeletle oynuyor (kafa ve kol döndürme). Seri 2'de 8 pozluk sayfalarla değiştirilecek: Kino ve aile, G2, G9.
- **O · görsel ·** Yatayda filmin iki yanında bulanık bant var; 844×390'da ekranın ~%18'i.
- **O · görsel ·** Dikeyde film 390×220'lik küçük bir şerit; üstü ve altı koyu boş, "telefonu çevir" ikonu var.
  - Yapılacak: dikeyde film otomatik döndürülsün ya da daha büyük kırpılsın.
- **D · oyun ·** Katalogda yalnız 2 film var; menüde "Çizgi Filmler" kartı büyük bir vaat veriyor.

## 6. Dedektif Mino

Durum: En iyi oynanan oyunlardan biri. Büyüteçle arama, şüpheli seçimi ve yanlış şüphelinin alibisi gerçek deneme-yanılma.

- **O · görsel ·** Şüpheli kartları (kedi, ördek, zürafa) Kartlar oyununun parlak Recraft resimleri. Yanlış şüpheli sahneye büyük parlak ördek olarak geliyor; düz stildeki odayla çakışıyor.
  - Yapılacak: şüpheliler onaylı stilde çizilsin (G10).
- **O · görsel ·** Vaka 1'de ev katmanları 1.5× büyütülüyor; masa 1.27×. Vaka 3'te otobüs içi 1.95×.
- **O · animasyon ·** Mino'nun dedektif pozu kendi SVG'si (iyi); Kino ve şüpheliler tek resim.
- **D · oyun ·** "Büyüteci gezdir, ipucu ara!" bir görev tanımı, emir değil; kabul. İpucuyu görünce bir de dokunmak gerekiyor (iki adım) ve bu yazılmıyor. 3 sn içinde dokunmayan çocuk ne olduğunu anlamayabilir.

## 7. Kino Ne Giysin?

Durum: Görsel ve tepki kalitesi yüksek. Şort kafaya geçiyor, botlar çoraptan önce olursa gag geliyor; seçimler anlamlı.

- **Y · görsel ·** Dikey oda 1080×1920 kaynakla 1.8× büyütülüyor, bulanık.
  - Dolap ve kapaklar 1000 px kaynakla 1.57× ve 1.74×; yatay oda 1.25×.
  - Yapılacak: G11 ile dikey oda 1536×2752 ve dolap 2048 px olarak yeniden çizilsin.
- **O · görsel ·** Pencerenin pembe perdesi pırıltılı ve parlak; odanın düz stilinden ayrılıyor.
- **O · animasyon ·** Kino giysinde iyi tepki veriyor. Ama giyinme anında yalnız giysi yerine "oturuyor"; ayrı giyinme pozu yok.
- **D · oyun ·** Dolapta her mevsimde 8 giysi var; iyi. İpucu ancak beklenince geliyor (çorap parladı). Doğru davranış.

## 8. Mino Ne Giysin?

Durum: Fikir güzel, sahneler temiz. Ama kostüm seçimi sonucu etkilemiyor; dikey ekranın üstü boş.

- **Y · oyun ·** Dertte sonucu yalnız alet belirliyor (`mino-giysin/src/model.ts`). Hangi kostüm giyildiğinin hiçbir etkisi yok.
  - Örnek: aşçı kıyafetiyle ağaçtaki Pamuk'a kaşıkla mama verip çözdüm.
  - Oyunun adı "Ne Giysin?" ama giysi süs kalıyor.
  - Yapılacak: kostüm + alet uyumu sonucu değiştirsin. Örnek: itfaiye kaskı olmadan merdivene çıkmak komik bir sonuç versin, kaskla başarılı olsun.
- **O · görsel ·** Dikeyde ekranın üst ~%35'i boş duvar; Mino ortada büyük. Dolap ve alet sepeti alt kenara sıkışmış, giysilerin yarısı kesik.
- **O · animasyon ·** Pamuk'un ağaç pozları var. Mino kostümle yalnız tek pozda duruyor; aleti kullanma pozu yok.
- **D · ses ·** Ege'nin "Mama!", "Ham!", "Teşekküyler!" sözlerinin kaydı yok.

## 9. Kino'nun Otobüsü

Durum: Çok güzel, sıcak bir dükkân. Bilmeceli istekler var ("Meyveli bir şey?" ve güneş ikonu), "Ben önce!" sürprizi var. Müşteriler ise hep aynı duruşta.

- **Y · animasyon ·** Müşteriler (`kaynak=duragan`) tek resim: Mino, anne, tavşan Zıpzıp, baba… Sevinme, ekşi yüz ya da beyin donması gibi bir poz yok; balon yazısı var ama yüz değişmiyor.
  - Yapılacak: müşteri başına 6 pozluk sayfa çizilsin (G3).
- **Y · ses ·** Müşteri sesleri yok (eleven_v4 ONAY BEKLİYOR). İstek, bayılma ve komik söz şimdilik yalnız balonda yazı; 3-4 yaş okuyamaz.
- **O · görsel ·** Dikeyde sahne üst yarıda; müşteriler küçük (~70 px), Mino ve Kino tezgâhın arkasında yarım. Alt yarıda dondurma dolabı iyi.
- **O · oyun ·** Tat kabından yuvaya doğrudan sürüklemek top koymuyor; önce kâse ya da külah, sonra tat kabına dokunmak gerekiyor. 3-4 yaş ilk denemede takılabilir. Kâse dokununca hemen geliyor; bu iyi.
- **D · oyun ·** Para, kumbara ve gün sonu sayımı iyi. Külah zinciri tavandan sallanıyor; canlı.

## 10. Mino ile Kino'nun Pasta Otobüsü

Durum: Üç fırın açık ve paralel hokkabazlık var; akıcı. Ama istek hep resim, seçim yok gibi.

- **O · oyun ·** Müşteri balonu tam ürünü gösteriyor (mavi kremalı yuvarlak pasta, sarı kalp kurabiye). Çocuk kopyalıyor, karar vermiyor.
  - Yapılacak, Gün 2-3 için: "doğum günü için bir şey", "kalbi kırık ördeğe" gibi ucu açık istekler gelsin; birden çok doğru olsun ve müşteri hepsine farklı sevinsin.
- **O · görsel ·** Tezgâh arka planı 1.42× (yatay) ve 1.58× (dikey).
  - Menüde ve açılışta otobüs kodla çizilmiş (`pasta/src/cizim.ts`). Bunun yerine Gemini otobüsü çizilsin (G12).
- **O · animasyon ·** Müşteriler (kız, ördek, çocuk) tek resim. Mino tezgâhta ve kasada küçük ve durağan.
- **D · ses ·** Açılış cümlesi cihaz sesine düşüyor (genel bulgu 1).

## 11. Pati Dükkânı v2 (menüde değil)

Durum: Ekonomi, bakım odası ve tercih sistemi kuruldu. Ama görselin yarısı yer tutucu ve sözlerin hiçbiri seslendirilmedi. Bitmiş gibi sunulamaz.

- **Y · görsel ·** Çekmece eşyaları yer tutucu piktogram: su için iki mavi damla, oyuncak için düz yumak, top. Fındık ve Tarçın'ın bakım ve tepki pozları da yok.
  - Bu iş `ISTEK-02` ve PATI-V2 §11'de bekliyor. Barış onayı gerekiyor.
- **Y · ses ·** Nehir'in v2 sözleri kayıtsız; oyun başından cihaz sesiyle konuşuyor. Kredi Barış'ın onayında.
- **O · görsel ·** Vitrin, salon ve bakım odası ince ve açık kontur kullanıyor; diğer oyunların kalın koyu kahve konturundan farklı. Karakterler ayrıca gölgesiz ve soluk.
  - Barış Fındık sayfasını beğendi; yine de onaylı stile göre kontur kalınlığı denetlensin.
- **O · görsel ·** Dikey vitrinde alt %25 boş turuncu zemin; Nehir yarım görünüyor. Kumbara sağda tek başına duruyor.
- **O · oyun ·** Bakım odasında 4 sekme var; her çekmecede 3 eşya. Hiçbiri "doğru" diye işaretli değil; tercih sistemi iyi. Su şişesi denendiğinde yalnız "Hımm" deniyor, komik sahne çıkmadı.

## 12. Uyku Vakti (bayrak kapalı)

Durum: Sıcak ve sade; anne için güzel bir bitiş. Gemini çizimleri bağlı. Yatırma adımları anlamlı (yanlış yastık sahibini bulmuyor).

- **O · oyun ·** Her adımda tek bir doğru sıra var: oyuncaklar → yastıklar → battaniye → perde → lamba. Çocuk ne yapacağını yalnız anlatıcıdan öğreniyor.
  - Yapılacak: küçük sürprizler eklensin. Örnek: kitap rafına dokununca Mino kitap ister; pencerede ay göz kırpar.
- **O · görsel ·** Battaniyeler sert, düz dikdörtgen gibi duruyor; karakterin üstüne dökülmüyor. Halıdaki oyuncaklar 41-51 px; 3 yaş için küçük.
- **D · görsel ·** Dikeyde pencere ekranın üst %40'ını kaplıyor, yatak alanı küçük.

## 13. Oyunlu film: Kino'nun Bir Günü (yalnız web)

- **D · görsel ·** Banyo sahnesi onaylı stilde ve çok iyi. Yalnız 40 sn izlendi; etkileşim adımlarına gelinmedi. Ayrıca denetlenmeli.

---

## Gemini çizim kuyruğu (öncelik sırasıyla)

Ortak kurallar:
- Her istekte iki referans yüklenir: `ekip/stil/onayli-stil-oda.png` (çizgi ve renk) ve `ekip/film/seri-2/karakter/v6/aile-model.png` (karakter oranı). Karakter sayfalarında o karakterin model sayfası da yüklenir.
- Çıktı en az 2752×1536. Dikey sahneler 1536×2752.
- Her madde tek sayfadır. Kayıt yeri `ekip/gemini/yeni/<klasör>/<ad>.png`.
- `NETLIK-YENIDEN-CIZIM.md` ve `ISTEK-02` maddeleri yinelenmedi; yalnız sıraya kondu.

Ortak stil cümlesi (her isteme eklenir, aşağıda `[STYLE]` diye geçer):
> Flat 2D children's cartoon matching the attached reference exactly: thick, even dark chocolate-brown outline (#3B2416), flat warm pastel fills, at most one soft cel-shadow tone, no gradients, no gloss highlights, no texture, no painterly brushwork, no 3D, no text, no watermark. Pure white background.

Pose sheet rule (`[SHEET]`):
> One sheet, 8 poses in a 4×2 grid, the SAME character at the SAME scale and the same proportions in every cell, full body, feet on an invisible common baseline, generous white space between cells, no overlapping, no cropping, no extra limbs or ears.

| Sıra | Öncelik | Dosya | Neden | İstem (İngilizce) |
|---|---|---|---|---|
| 1 | Y | `oyun-poz/mino-hareket-sayfasi.png` | Mino her oyunda var; kol döndürme yerine poz | Orange tabby kitten Mino with red neckerchief, exactly as in the attached model. [SHEET] Poses: 1 idle smiling, 2 jumping for joy with both arms up, 3 thinking with paw on chin looking up, 4 sad droopy ears, 5 surprised gasp with paws on cheeks, 6 eating happily with closed eyes, 7 pointing to her right, 8 big yawn stretching. [STYLE] |
| 2 | Y | `oyun-poz/kino-hareket-sayfasi.png` | Kino (Giysin, Otobüs, Macera, Uyku, film) | Cream puppy Kino with brown ear patch and blue neckerchief, exactly as in the attached model. [SHEET] Poses: 1 idle tongue out, 2 happy jump, 3 scared trembling with ears down, 4 sneezing, 5 laughing on his back, 6 licking an ice cream, 7 waving, 8 sleepy rubbing eyes. [STYLE] |
| 3 | Y | `kino-otobus/musteri-sayfasi-1.png` … `-4.png` (4 sayfa, sayfa başına 2 müşteri × 4 poz) | Müşteriler durağan | Two customers from the attached models (page 1: Kino's mother, Zıpzıp the bunny). [SHEET] with 4 poses each, left half character A, right half character B: 1 asking (pointing up, curious), 2 delighted (eyes closed, hands clasped), 3 funny fail (sour face / brain-freeze shiver / colored mustache), 4 waving goodbye. [STYLE] |
| 4 | Y | `netlik/pazar-arka-sol.png`, `pazar-arka-sag.png` (NETLIK #8) | Pazar arka planı parlak + bulanık | Wide open-air village fruit market, straight-on frontal view, striped awnings on both sides, empty wooden counter across the bottom third, bunting across the top, the centre left empty for a stall. [STYLE] Left half / right half of one continuous 5504×1536 panorama, seamless at the joint. |
| 5 | Y | `pazar/musteri-sayfasi-1.png` … `-3.png` | Pazar müşterileri parlak, tek poz | Market customers from the attached models (page 1: monkey, blue bird; page 2: bunny, sheep; page 3: duck, bear). [SHEET] 4 poses each: 1 asking with speech-ready open mouth, 2 happy hop, 3 disgusted funny face (wrong fruit), 4 munching. Half-body is NOT allowed: draw full body, standing. [STYLE] |
| 6 | Y | `netlik/dg-flama.png`, `dg-mino-a.png`, `dg-mino-b.png` (NETLIK #1-2) | 5.2× bulanık flama | (NETLIK belgesindeki istemler) |
| 7 | Y | `kartlar/tema-hayvanlar-1.png`, `-2.png`; `tema-meyveler-1.png`, `-2.png`; `tema-tasitlar-1.png` | Kartların hepsi parlak Recraft | Sticker sheet of 8 separate items in a 4×2 grid (page: farm & wild animals – cat, dog, elephant, giraffe, rabbit, cow, horse, duck), each centred in its cell, same size, full body, friendly faces in the style of the attached Mino/Kino models. [STYLE] |
| 8 | Y | `canlan/sahne-sayfasi.png` (4 kare: gök, deniz, çayır, gece) | Sihirli hâl boyalı | Four empty background tiles in a 2×2 grid, each square: 1 sunny sky with two simple flat clouds, 2 underwater with flat seaweed and bubbles, 3 flower meadow with a low hill, 4 night sky with flat stars. Centre of each tile empty. [STYLE] No light rays, no realistic clouds. |
| 9 | O | `oyun-poz/insan-cocuk-sayfasi-ada-can.png`, `-deniz-elif.png` | Macera çocukları parça döndürme | Two children from the attached models (Ada and Can). [SHEET] 4 poses each: 1 clapping, 2 dancing, 3 upset arms crossed, 4 surprised. [STYLE] |
| 10 | O | `dedektif/supheli-sayfasi.png` | Şüpheli kartları parlak | Suspect portraits, 6 cells in a 3×2 grid, each a framed square portrait (head and shoulders): white kitten Pamuk, duck, giraffe, squirrel Fındık, owl, puppy Kino. Same frame, same scale. [STYLE] |
| 11 | O | `giysin/oda-dikey-v2.png` (1536×2752), `giysin/dolap-v2.png` (2048×2048, 3 durum: kapalı / açık / iç) | 1.8× ve 1.57× bulanık | Same room as the attached `oda-dikey.webp`, redrawn larger and sharper, identical layout and colours, portrait 1536×2752. [STYLE] |
| 12 | O | `pasta/otobus-sayfasi.png` | Kodla çizilmiş otobüs | Pink bakery bus, side view, rounded retro shape, a donut sign on the side, open serving window with awning, three angles in one row: side, three-quarter, front. [STYLE] |
| 13 | O | `pasta/tezgah-arka-v2.png` (4096×2286) | 1.42-1.58× | Same bakery-bus interior back wall as the attached `arka-tezgah-uzak-1.webp`, identical layout, redrawn at 4096×2286 with the same window opening position. [STYLE] |
| 14 | O | `pati/v2/*` (ISTEK-02 §1, 10 sayfa) | Yer tutucu eşyalar ve pozlar | (PATI-V2 §11 istemleri) |
| 15 | O | `pati/nehir-hareket-sayfasi.png` | Nehir tek poz + ağız | Shop keeper Nehir from the attached model. [SHEET] Poses: 1 welcoming wave, 2 explaining with open palm, 3 laughing, 4 surprised, 5 kneeling to pet, 6 thumbs up, 7 pointing, 8 waving goodbye. [STYLE] |
| 16 | O | `dedektif3/otobus-ic-v2.png` (4096 en) | 1.95× | Same as attached `otobus-ic.webp`, redrawn at 4096×2286, identical composition. [STYLE] |
| 17 | D | `mino-giysin/mino-alet-sayfasi.png` | Alet kullanma pozu yok | Mino in her chef apron from the attached model. [SHEET] 8 poses using tools: climbing a ladder, holding a spoon out, listening with a stethoscope, watering, carrying a bowl, pulling, stirring, cheering. [STYLE] |
| 18 | D | `uyku/battaniye-sayfasi.png` | Battaniye sert | Two soft quilts draped over a sleeping body shape (no character visible), pink with white dots and blue with stars, front view, natural folds hanging over the bed edge. [STYLE] |

---

## Kodcu iş paketleri

Bir oturumda en çok 3 kodcu çalışsın; e2e `workers=1`. Her pakette kontrol aynı: telefon 844×390 ve 390×844 DPR3 gerçek hızda kare kare izlenir.

| Kod | Süre | Öncelik | İş | Dosyalar |
|---|---|---|---|---|
| K1 | yarım gün | Y | İlk cümle yarışı: `konusIc` manifest yüklenmeden çağrılırsa `kayitlariHazirla()` beklensin (en çok 1500 ms), sonra kayıt seçilsin. Birim testi: manifest gecikince bile kayıt çalsın. | `src/audio/konusma.ts`, `src/audio/kayit.ts`, `tests/unit/` |
| K2 | tam gün | Y | Macera'da yönlendirme azaltılsın. Görev çipleri ve hemen çıkan el kalksın. İpucu merdiveni 12 sn dolaylı (karakter bakar, ses gelir), 25 sn parlama, 40 sn el. Anlatıcı metni durum anlatsın; metin değişikliği kredi ister, Barış onayı gerekir. Her adıma ≥2 komik yanlış hedef eklensin (Salıncak, Banyo). | `macera/src/*.ts` (ui.ipucu, ipucu()), `content/macera-*.json` |
| K3 | tam gün | Y | Pazar: dokununca ürün sepete uçsun. Yaşa göre istek: 5-6'da balonda resim olmasın, tuzak ürün olsun. İlk yanlışta parlama olmasın; müşteri komik yüz yapsın. Kamera `enCok` kaynak çözünürlüğüne göre sınırlansın. Sıradaki müşterinin hayaleti gizlensin. Dikey yerleşim: tezgâh büyüsün, üst boşluk azalsın. | `pazar/src/ekranlar.ts`, `kamera.ts`, `musteri.ts`, `pazar.css`, `yatay.css` |
| K4 | yarım gün | Y | Kartlar: ilk yanlışta doğru kart parlamasın. Mino yanlış karta tepki versin, ≥10 sn sonra ve 2. yanlıştan sonra parlasın. Yatayda soru yazısı görünsün. | `src/screens/oyun.ts`, `src/screens/sorular/*`, `src/styles` |
| K5 | tam gün | Y (Gemini G1-G2 gelince) | Mino ve Kino hareket sayfalarını bağlama. `Mino` ve `Karakter` sınıflarına poz değiştirme eklensin; kol ve kafa döndürmesi kalksın. Önce Kartlar, Giysin, Uyku, Otobüs. | `src/mino/mino.ts`, `mino-poz.ts`, `src/karakter/karakter.ts`, kesme betiği `ekip/illustrator/` |
| K6 | yarım gün | O | Netlik: Giysin dikey odası ve dolabı, Pasta tezgâhı, Dedektif ev ve otobüs içi, Doğum Günü flaması. Yeni çizimler gelene kadar zoom kaynak boyuyla sınırlansın. `src/ui/netlik.ts` ile e2e ölçümü eklensin (≤1.15). | `giysin/src/oda.ts`, `pasta/src/*`, `dedektif/src/dunya*.ts`, `macera/src/dogumgunu.ts`, `tests/e2e/` |
| K7 | tam gün | Y | Mino Ne Giysin: kostüm sonucu etkilesin. `SONUC` tablosu kostüm + alete göre kurulsun. Yanlış kostüm = komik sonuç (kasksız merdivende sallanma). Dikey yerleşimde dolap ve sepet görünür olsun. | `mino-giysin/src/model.ts`, `dert.ts`, `sahneler.ts`, `oda.ts`, `mino-giysin.css` |
| K8 | yarım gün | O | Canlan: sihirli hâl çocuğun çizgisini korusun. Puan eşikleri sıkılaşsın (`content/canlan.json`). Güneş ışınları çizgi yerine çocuğun rengiyle canlansın. | `canlan/src/*`, `content/canlan.json` |
| K9 | yarım gün | O | Film: dikeyde filmi ekrana sığdırma ya da döndürme. Yatayda bulanık yan bantlar yerine sahne genişletilsin (geniş arka plan varsa). | `film/src/*`, `film/src/film.css` |
| K10 | yarım gün | O | Kino'nun Otobüsü: tat kabından yuvaya sürükleyince kepçe kendiliğinden alınsın. Dikeyde müşteriler büyüsün. Müşteri pozları (G3) gelince poz değişimi bağlansın. | `kino-otobus/src/dokunsal.ts`, `gun.ts`, `kino-otobus.css` |
| K11 | yarım gün | O | Ses denetimi genişlesin: `scripts/ses-denetim.ts` bütün `content/*.json` konuşma alanlarını da tarasın ve "listede değil" diye ayrı bölüm yazsın (Pati v2, Kino'nun Otobüsü müşterileri, Mino Ne Giysin Ege). | `scripts/ses-denetim.ts` |
| K12 | yarım gün | D | Menü: dikeyde 10. kart tam görünsün (kart yüksekliği ya da 2×5 aralık). Pasta tabelası resmi örtmesin. Pasta kartına Gemini otobüsü (G12). | `uygulama/src/uygulama.css`, `oyunlar.ts` |
| K13 | tam gün | O (G14-G15 gelince) | Pati: v2 eşya ve pozlarını kes ve bağla (`pati-isle.cjs v2-esya / v2-hayvan`). Dikey vitrin alt boşluğu doldurulsun. Su şişesi gibi sevmediği eşyalarda komik sahne çıksın. | `pati/src/*`, `ekip/illustrator/pati/pati-isle.cjs` |

### Barış'ın kararı gereken işler (kredi ya da ürün kararı)

1. Pati v2 Nehir sözlerinin seslendirilmesi: ~30 cümle, ElevenLabs.
2. Kino'nun Otobüsü müşteri sesleri: eleven_v4, Ekim'de ücretsiz.
3. Macera anlatıcı metinlerinin "durum anlatır" biçimine çevrilmesi: metin değişince kayıt yeniden üretilir.
4. Gemini kuyruğu: ISTEK-02 beklemede. Bu listedeki 1-8 numaralı maddeler onaylanırsa öncelik sırası bu belgedeki gibi olsun.
