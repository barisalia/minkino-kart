# Oyun geliştirme · 3 gün planı (2026-10-15 → 2026-10-18)

> Barış'ın talimatı (2026-10-15): "3 gün kaldı, oyunları geliştir, senaristle düşünün, iyi iş yapın, oyunlarda animasyon yeteneğini kullan."
> Yazan: senarist / oyun tasarımcısı. Kod yazılmadı; bu belge yöneticinin kodculara, Gemini üreticisine ve tasarımcıya (Adobe) iş dağıtması için.

---

## 0. Önce kısa durum

- Oyunların çoğu zaten canlı: ortak karakter motoru (`src/karakter/karakter.ts`) nefes alır, göz kırpar, konuşurken ağız oynatır; Mino'nun (`src/mino/mino.ts`) ifade ve poz takımı geniş; menü ile oyun arasında krem perde geçişi var (`src/ui/gecis.ts`).
- Bu yüzden 3 günün en etkili işi **yeni sistem kurmak değil**, şunlar:
  1. **Pati Dükkânı'nı oynanır yapmak.** Bizde hiç olmayan şey bu oyunda var: kendi kendine yaşayan, parmağa karşılık veren hayvanlar. Tamamı 3 güne sığmaz (Bölüm 1 ≈ 137 görsel), ama **"İlk Gün" dilimi sığar** (§1, iş 1).
  2. **Canlılığı eksik kalan yerleri eski oyunlarda kapatmak.** Örneğin Sesli Maceralar'ın ilk bölümü Doğum Günü'nde çocuklar hâlâ düz resim; Ege bölümünde aynı çocuklar nefes alıyor, göz kırpıyor.
  3. **Doğru cevap anlarını büyütmek.** Doğru hamlede karakter sevinsin, eşya zıplasın, ses gelsin. Çocuk ne olduğunu her seferinde anlasın.

### Animasyon yolu (bütün işlerde aynı)
- **Parça döndürme (kesme kukla) yok.** Barış üç kez reddetti. Hareket iki yolla yapılır:
  - **Poz değiştirme:** Gemini'nin çizdiği hazır pozlar arasında geçilir. Geçiş anında 120 ms ezilme-esneme (scaleY 0.92 → 1.06 → 1) yapılır; böylece "kesme" değil "zıplama" gibi görünür.
  - **Bütün gövdeye hareket:** nefes (taban pivotlu scaleY 1 → 1.025), zıplama yayı, titreme (±2 px), sallanma, iniş ezilmesi. Yalnız `transform` ve `opacity` kullanılır.
- **Göz kırpma:** Gemini, aynı sayfada gözü kapalı kareyi de çizer. Adobe yalnız göz bölgesini ana poza yama olarak oturtur. Kod 2,4-5,4 sn arayla 140 ms yamayı gösterir (karakter motorundaki `sonrakiKirp` mantığı).
- **Parça sayfası kuralı:** Bir karakterin ya da eşya grubunun bütün animasyon kareleri **tek Gemini sayfasında** üretilir (2×4 ya da 3×4 ızgara). Ayrı ayrı çizdirilmez; böylece boy, renk ve kontur birbirini tutar. Kesim: `kes.mjs` + Adobe temizlik.
- **Telefon önce:** her iş 844×390 ve 390×844'te (DPR 3) kusursuz bitince tablete bakılır. Dokunma alanı en az 88 px.
- **Hiçbir animasyon dokunuşu kilitlemez** (kalite-sayı-değil kuralı).

---

## 1. İşler (öncelik sırasıyla)

### İş 1 · Pati Dükkânı · "İlk Gün" oynanır dilim (yeni oyun) · EN ÖNCELİKLİ

**Ne değişecek:** Pati Dükkânı'nın ilk günü baştan sona oynanır hâle gelir. Akış şöyle:
1. **Açılış (8 sn):** Salon karanlık başlar, Nehir abla lambanın ipini çeker (`salon-gunduz-v2`'de ipli lamba zaten çizili). Işık yanınca üç köşedeki hayvanlar sırayla uyanır, gerinir ve zıplar. Nehir abla: "Günaydın ortağım!"
2. **Salon (asıl ekran):** Üç köşede Fındık, Tarçın ve Pırıl kendi hâllerinde yaşar. Fındık kuyruk sallar, Tarçın yalanır, Pırıl akvaryumda yüzer. Bir ihtiyaç açılır ve o hayvan **bedeniyle** gösterir. 3-4 yaşta 3 sn sonra resimli düşünce balonu çıkar.
3. **Yakın çekim:** Köşeye dokununca kamera yaklaşır (`pazar/src/kamera.ts`). Sağda 4 eşyalık bakım rafı açılır, çocuk eşyayı sürükler. Hayvan anında tepki verir: yer, kıvrılır, zıplar, topu getirir.
4. **Beş ihtiyaç anı (sıra serbest):**
   - Fındık **aç**: ölçekle mama, kaba dök, sesli "Bir, iki!"
   - Fındık **oyun istiyor**: topu fiskele, yay çizer, Fındık koşup getirir. Bahçe yok; salonun zemininde döner.
   - Tarçın **oyun istiyor**: tüy değneğini salla. Tarçın popo sallar ve atlayıp tüyü yakalar. **Mağaza vitrinindeki an bu.**
   - Tarçın **üşümüş**: battaniyeyi sürükle. Battaniye dalgalanarak iner, Tarçın içinde kıvrılır.
   - Pırıl **aç**: yem kutusunu salla. 3-4 yaşta her tutam sayılır; 5-6 yaşta "bir tutam yeter", fazlası suyu bulandırmaz, Pırıl yalnız şişkin karnıyla güler.
5. **Akşam (20 sn):** Salon turuncuya döner, Nehir abla: "Herkes uyusun." Çocuk her hayvana dokunur ve hayvan uyku pozuna kıvrılır. Son iş: lamba ipini çeker. Gündüz salon ile gece salonu (G7, aynı çizimin gece eşi) 1,2 sn'de birbirine geçer, ay gece lambası yumuşakça yanar.
6. **Günün fotoğrafı:** En çok tekrarlanan an polaroid olur (flaş, "çık" sesi). Bu dilimde pano yok; fotoğraf ekranın ortasında kalır. Ardından "Yarın görüşürüz!" ve açılışa dönülür.

- **Dilimde olmayanlar (sonraki parti):** dükkân dışı ve kepenk, köşe kurma, gök gürültüsü ve tüy günü, mini işler, yuvaya gidiş, gece arka planları, köşe yakın çekim arka planları. Yakın çekim, salon resminin büyütülmüş hâlidir. Köşe eşyaları ayrı çizildiği için hayvan ve eşyalar keskin kalır; arka duvar biraz yumuşar ama düz renkli olduğu için göze batmaz.
- **Menüye girmez.** `PATI_MENUDE = false` bayrağıyla yalnız `/pati/` adresinde açılır. Barış görüp "tamam" deyince menüye girer.

**Çocuk için neden daha iyi:**
- **Şirinlik:** esneyen yavru, battaniyede kıvrılan kedi, tüye atlayan Tarçın. Ödül hayvanın kendisi.
- **Canlılık:** Çocuk dokunmasa da salon yaşar. Bu bizde ilk kez oluyor.
- **Geri bildirim:** Her eşya anında bir beden tepkisi doğurur. Yanlış eşya ceza değil, komik bir tepkidir (uykulu Fındık'a top yuvarlanır, Fındık bakmaz bile).
- **Pedagojik değer:** Duyguyu bedenden okumak (empati), bakım rutini, ölçü ve sayma, nazik dokunuş.

**Gemini (§2):** G1 Fındık, G2 Tarçın, G3 Pırıl, G4 eşya sayfası, G5 köşe sayfası, G6 Nehir anlatıcı sayfası, G7 salon gece eşi. Salon (`salon-gunduz-v2.png`), Nehir model sayfası ve Fındık modeli zaten var.
- Ad çakışması: Dedektif Vaka 3'te de "Fındık" adlı bir sincap var. Dosya adları `pati/` klasöründe kaldığı sürece sorun olmaz. Ama mağaza metninde ve seslendirmede ikisi karışabilir. Bu not Barış'a gidecek (ad değişikliği onun kararı).

**Adobe:**
- Sayfaları keser. Her hayvanda pozların boyunu sırt yüksekliğine eşitler.
- Göz kırpma için göz yamasını ana pozun üstüne oturtur (`<hayvan>-goz-yama.webp` ve konumu).
- Akvaryumun ön camı ile çerçevesini ayrı katman yapar (Pırıl iki katmanın arasında yüzer).
- Nehir'in ağızlarını ve göz yamasını anlatıcı pozunun yüz konumuna hizalar.
- Hepsi `assets/pati/*.webp` olarak, şeffaf zeminle teslim edilir.

**Kodcunun dokunacağı dosyalar:**
- Yeni klasör `pati/`:
  - `index.html`
  - `src/main.ts`
  - `src/oyun.ts`: `oyunuBaslat(kok, { cikis })`
  - `src/salon.ts`: salon, 3 köşe yuvası, kamera
  - `src/hayvan.ts`: poz durum makinesi, nefes, göz kırpma, ezilme-esneme, titreme, zıplama yayı, Pırıl'ın yüzme yolu
  - `src/ihtiyac.ts`: saf mantık; gün planı, aynı anda en çok bir/iki hayvan, yaş ayarı
  - `src/raf.ts`: bakım rafı ve eşya etkileşimleri
  - `src/nehir.ts`: anlatıcı köşesi, ifade, ağız
  - `src/aksam.ts`: uyutma, lamba ipi, polaroid
  - `src/pati.css`
- `content/pati.json`: Gün 1 planı ve cümleler.
- `src/audio/cumleler.ts`: pati cümleleri `tumCumleler()`'e eklenir.
- `vite.config.ts`: `pati` girişi.
- `src/engine/erisim.ts`: `'pati/bolum-1': 'ucretsiz'`.
- Mevcuttan kullanılacaklar:
  - `kino-otobus/src/dokunsal.ts`: `elSurukle`, `Tutulan`
  - `kino-otobus/src/el-isi.ts`: `kepceDolum` (ölçek), `sosDolum` (gerekirse sürahi), `Sallama` (yem)
  - `kino-otobus/src/efekt.ts`: kalp, parıltı
  - `pazar/src/kamera.ts`: `Kamera`
  - `src/audio/dudak.ts`: Nehir'in ağzı
- Testler:
  - `tests/unit/pati-ihtiyac.test.ts`
  - `tests/e2e/pati.spec.ts`. Önce 844×390, sonra 390×844. Hiç dokunmadan gün akşama dönüyor mu, her ihtiyaç doğru eşyayla kapanıyor mu, yanlış eşya hiçbir şeyi bozuyor mu, konsol hatası var mı.

**Seslendirme:** Bölüm 1 listesinden (senaryo §15) yalnız bu dilimin cümleleri, yaklaşık 22 cümle (~450 karakter). Ses Barış'ın seçimi: önce mevcut anlatıcı sesi. Hayvan sesleri Web Audio ile yapılır, dosya gerekmez.

**Süre:**
- Gemini: 7 sohbet, Gün 1 sabahı (Pro kotası 10:00'da sıfırlanır).
- Adobe: yarım gün.
- Kod: 2 gün, tek kodcu. Görseller gelene kadar `assets/pati/kadro-*` kesimleriyle çalışılır.
- Gün 3 öğleden sonra telefonda deneme.
- **Toplam: 3 gün, hat A (bir kodcu).**

---

### İş 2 · Sesli Maceralar · Doğum Günü: çocuklar canlansın

**Ne değişecek:** Bölüm 1 "Ada'nın Sürpriz Doğum Günü"nde Ada ve dört konuk (Can, Elif, Deniz, Zeynep) şu an düz resim. Pozlar resim değiştirerek oynuyor, ağızları kıpırdamıyor, göz kırpmıyorlar (`macera/src/dogumgunu.ts` satır 79-80: düz `new Oyuncu`). Ege bölümü aynı çocukları zaten parçalı iskeletle oynatıyor (`macera/src/ege.ts` → `cocukOyuncu`, `ege-cocuk.ts`). Beşinin de iskeleti hazır: `assets/karakter-iskelet/{ada,can,elif,deniz,zeynep}.json`. Yapılacaklar:
- Doğum Günü'nde de beşi iskeletle oynar: nefes, göz kırpma, konuşan çocukta ağız, "Sürpriz!" anında hep birlikte zıplama, dansta kollar.
- **Parti şapkası kafa grubuna takılır.** Kafa dönünce şapka da döner (Kino'nun Otobüsü'ndeki kiraz şapkası gibi: `KINO_GIYSI_YERI` kalıbı).
- İskeletin karşılığı olmayan pozlarda (saklanıyor, dilek) eski poz resmi kalır. `Oyuncu` bunu zaten destekliyor (`iskelet.poz(p)`).
- **Yeni küçük anlar** (hepsi kodla):
  - Mumlar üflenince Ada gözlerini kapatıp dilek tutar ve 1 sn sonra kocaman güler.
  - Balon şişerken en yakın konuk kulağını tıkar, balon patlamadan bağlanınca alkışlar.
  - Sessizlik görevinde çocuklar nefeslerini tutar: nefes durur, yanaklar şişer (scaleX 1.04).
- **Dikey telefon:** Doğum Günü `new Sahne('parti-sahne/oda')` ile dikey arka plansız açılıyor. Ege ve Elektrik `'parti-sahne/oda-dikey'` kullanıyor; Doğum Günü de onu kullanmalı. 390×844'te sahnenin ekranı doldurması için bu küçük düzeltme şart.

**Çocuk için neden daha iyi:** Bu bölüm ücretsiz ve Maceralar'ın ilk izlenimi. Şu an Maceralar'ın en eski görünen sahnesi bu. Arkadaşların canlı olması "parti" duygusunu gerçek yapar. Sesli görevin karşılığını yüzlerden görmek (sessizlikte nefes tutmak, sürprizde zıplamak) çocuğa sesinin bir etkisi olduğunu gösterir: neden-sonuç.

**Gemini:** yok. **Adobe:** yok (iskeletler hazır).

**Kodcunun dokunacağı dosyalar:**
- `macera/src/dogumgunu.ts` (870 satır; oyuncu kurulumu 44-80, adımlar)
- `macera/src/ege-cocuk.ts` (`cocukOyuncu`'yu ortak kullanmak için gerekirse `macera/src/cocuk.ts`'e taşınır)
- `macera/src/oyuncu.ts` (şapka iskelette)
- `macera/src/macera.css`
- e2e: mevcut doğum günü testi, 844×390 ve 390×844 ekran görüntüsü

**Süre:** 0,5-1 gün (hat B).

---

### İş 3 · Müşteri hayvanlarına yüz: sevinç, şaşkınlık, hüzün (Pazar, Pasta, Kino'nun Otobüsü)

**Ne değişecek:** Üç oyunun müşterileri aynı iskelet hayvanlar: ayı, inek, maymun, tavşan, kuş, ördek, köpek. Bunlarda yalnız göz kırpma ve konuşan ağız var. Mutlu ya da şaşkın yüz yok, üzgün yüz yalnız köpekte var. Bu yüzden:
- Pasta'da ve Kino'nun Otobüsü'nde "farklı oldu" anında müşterinin yüzü hiç değişmiyor (`Kisi.mutlu()` çoğu hayvanda boş dönüyor).
- Pazar'da yanlış üründe yalnız kafa sallanıyor ve ekran titriyor.

Yapılacaklar:
1. **Yüz takımı:** Her hayvan iskeletine üç gizli ifade katmanı eklenir. `assets/karakter-iskelet/<ad>.svg` + `.json` içinde `goz-*` / `agiz-*` katmanları olur; `ifadeSetleri()` bunları kendiliğinden tanır.
   - **mutlu:** gözler yukarı kavis (^ ^), açık gülüş, yanak lekeleri biraz koyu.
   - **saskin:** gözler büyük ve yuvarlak, ağız küçük "o", kaşlar kalkık.
   - **uzgun:** göz kapakları düşük, ağız ters kavis. Yalnız Pazar'daki yanlış üründe 0,8 sn görünür, sonra hemen "hmm" yüzüne döner. Çocuğu suçlamaz.
   - Çizim, iskeletin kendi konturuyla (aynı kalınlık, aynı koyu kahve) yapılır. Can'ın üzgün yüzünde ve Kino ailesinin yüz setlerinde kullanılan yol bu (`ekip/illustrator/can-uzgun.cjs`, `pamuk-ifade.cjs` kalıbı). Önce tavşanda denenir, yönetici bakar, sonra öbür altısına geçilir.
2. **Tepkileri bağlamak:**
   - **Doğru teslim (üç oyun):** müşteri `mutlu` yüzüyle `sevin` zıplaması yapar. Ürün eline uçarken 1 kez yaylı büyür (1 → 1.15 → 1). Yanağında kalp parıltısı çıkar.
   - **"Farklı oldu" (Pasta, Kino'nun Otobüsü):** müşteri önce `saskin` (0,6 sn) yapar, sonra ürünü koklar ya da tadar, sonra `mutlu` olur. Kino `dusun` ifadesiyle bakar, sonra omuz silker ve güler. Ders şu: "Farklı da olsa güzel." Ceza yok.
   - **Yanlış ürün (Pazar):** müşteri `saskin` olur, ürünü burnuna götürür, `burus` yapar, sonra elini uzatıp doğru ürüne bakar. Bakış yönü ipucu olur. Mino `hayir` yerine `dusun` pozuyla çeneyi kaşır.
   - **Yanlış dokunuş (Pasta, `gun.ts:791 yanlis()`):** şimdi yalnız ses var ve sıradaki yer hafifçe zıplıyor. Bunun yerine Kino sıradaki yere döner ve patisiyle işaret eder (`KinoIsci`'ye `isaret` hareketi).

**Çocuk için neden daha iyi:** Geri bildirim yüzden okunur. 3 yaşındaki çocuk yazıyı da kalbi de saymaz ama gülen ya da şaşıran yüzü hemen anlar. "Farklı oldu" anı bugün sessiz geçiyor; yeni hâliyle esnekliği öğretir ve en sevimli anlardan biri olur. Duyguları tanımak okul öncesinin temel kazanımlarından biri.

**Gemini:** yok (yüzler basit kavislerden oluşuyor, iskeletin kendi çizgisiyle yapılır).
**Adobe / tasarımcı:** 7 hayvan × 3 ifade. İlk tavşan 1 saat, kalanlar ~3 saat.

**Kodcunun dokunacağı dosyalar:**
- `assets/karakter-iskelet/{ayi,inek,maymun,tavsan,kus,ordek,kopek}.json/.svg` (tasarımcının betiği yazar)
- `src/karakter/karakter.ts`: yalnız `ifade` geri dönüşü; ifadesi olmayan iskelette sessizce normal kalır
- `pazar/src/ekranlar.ts` (`yanlisUrun` ~484), `pazar/src/musteri.ts`
- `pasta/src/gun.ts` (`yanlis` 791, farklı sonuç), `pasta/src/musteri.ts`, `pasta/src/kino-is.ts`
- `kino-otobus/src/gun.ts` (~1360 farklı sonuç), `kino-otobus/src/musteri.ts` (`Kisi.mutlu`)
- Birim testi: `tests/unit` altında iskelet ifade testi; her müşteri hayvanında `mutlu` ve `saskin` var mı

**Süre:** tasarımcı 0,5 gün, kod 1 gün (hat C).

---

### İş 4 · Sesli Maceralar · Elektrikler Kesildi: eşyalar gerçek çizim olsun

**Ne değişecek:** Bölümün bütün eşyaları kodla çizilmiş SVG: komodin, fener, pil, saat, saksı, gıcırtılı kemik, sandalye, büyük lamba, battaniye çadırı, karşı apartman (`macera/src/elektrik-cizim.ts`; `assets/elektrik/` klasörü yok). Bölümün kahramanı olan fener de bunların arasında. "Kodla çizim kaba" kuralına göre bunlar Gemini'den gelir; kod çizimi yalnız yedek olarak kalır. Yeni çizimle gelecek animasyon fırsatları:
- **Çekmece:** dokununca yaylı açılır (translateY + kısa sarsıntı), içinden fener "pıt" diye zıplar.
- **Fener:** açılınca ışık konisi kodla verilir; fener 2 kez hafifçe titreyip yanar.
- **Pil (5-6 yaş):** pil kapağı ayrı karede çizili. Pil yuvaya sürüklenince "tık" sesi gelir, kapak menteşeden kapanır.
- **Gıcırtılı kemik:** ışık üstüne gelince ezilme-esneme yapar ve gıcırdar. Kino kendi kemiğinden korktuğunu anlayıp utanarak güler (`kino` iskeletinde `korku` → `keyif`).
- **Battaniye çadırı:** şarkının sonunda gerçekten çöker. İki aşama çizili (dik, çökmüş), arası ezilme ile geçer. Altından "hayalet Kino" çıkar: battaniye Kino'nun üstünde yürür.

**Çocuk için neden daha iyi:** Bu, Maceralar'ın korkuyla baş etmeyi anlatan bölümü. Ana ürün Maceralar, ama bu bölümün eşyaları uygulamanın en kaba görünen yerlerinden. Fener gibi bir "kahraman eşyası" güzel çizilince çocuk onu bulmayı ve yakmayı daha çok ister. Karanlığın içinden çıkan tanıdık, sevimli eşyalar da korkuyu tatlıya çevirir.

**Gemini:** G8 (§2, tek sayfa, 12 kare). **Adobe:** kesim, fenerin pil kapağı ayrı katman, çekmece ön yüzü ayrı katman → `assets/elektrik/*.webp`. Yarım gün.

**Kodcunun dokunacağı dosyalar:**
- `macera/src/elektrik-cizim.ts` (284): görsel varsa resim, yoksa mevcut kod çizimi. `macera/src/gorsel.ts` kalıbı kullanılır.
- `macera/src/elektrik.ts` (2252): yerleşim ve oranlar yeni çizimlerden ölçülür.
- `macera/src/elektrik.css` (1048)
- Gerekirse `ekip/illustrator/elektrik-isle.cjs` (`gemini-esya.cjs` ile kesme)
- e2e: elektrik testi, 844×390 ve 390×844 ekran görüntüsü

**Süre:** Gemini 1 sohbet, Adobe yarım gün, kod 1 gün (hat B, Gün 2).

---

### İş 5 · Kino Ne Giysin?: Kino giysiye uzansın

**Ne değişecek:** Bu oyunda Kino'nun kolları sabit (`ekHareket` her karede `kolSol`/`kolSag` = 0 yapıyor). Giysi sürüklenirken Kino hiç uzanmıyor. Yanlış bölgeye bırakılan giysi yalnız `saskin` ve sendeleme ile karşılanıyor.
- **Sürüklerken:** Giysi Kino'ya 200 px'ten fazla yaklaşınca Kino giysiye bakar (göz yönü). Kolunu ona doğru açar (iskeletteki kol kaldırma katmanı, en çok 25°) ve heyecanla parmak uçlarında yükselir (translateY -6 px).
- **Doğru giyince:** Kollar giysiyle birlikte iner. Kino iki kolunu kendine sarar (sarılma katmanı) ve yanakları kızarır: `keyif`.
- **Yanlış bölge:** Kino `dusun` yapar, kafasını kaşır, sonra giysiyi doğru yerine baktırır (göz yönü). Bu 3-4 yaş için açık bir ipucu olur.
- **Hiç kullanılmayan `uzgun` ifadesi** yalnız "şemsiyesiz yağmur" uymaz tepkisinin sonunda, 0,5 sn görünür. Hemen ardından silkinme gelir (komik kalır).

**Çocuk için neden daha iyi:** Kino'nun çocuğa doğru uzanması "bana ver!" dedirtir. Çocuk karakterle birlikte çalıştığını hisseder. Yanlış bölgede bakışla gelen ipucu sözsüzdür ve vücut bölümlerini öğretir (bere başa, bot ayağa).

**Gemini / Adobe:** yok (Kino iskeletinde kol kaldırma ve sarılma katmanları var).

**Kodcunun dokunacağı dosyalar:**
- `giysin/src/oda.ts` (914; sürükleme, ~362 yanlış bölge)
- `giysin/src/giyinik.ts` (274; kol açısı giysi katmanlarıyla birlikte)
- `giysin/src/tepkiler.ts` (303)
- `giysin/src/giysin.css`

**Dikkat:** Kol giysisi (mont kolu) kol grubuna bağlı. Kol açılınca birlikte dönmeli; her mevsimin her giysisiyle ekran görüntüsü alınır.

**Süre:** 0,5-1 gün (hat C).

---

### İş 6 · Dedektif Vaka 3: final sahnesinde Fındık (sincap) canlansın

**Ne değişecek:** Vakanın doruk anında suçlu Fındık ortaya çıkıyor. Ama `vaka3.ts → findikPoz()` dört resmi düz değiştiriyor ve yalnız kutusu zıplıyor. Aynı oyunda Kino ve Pamuk'un poz resimleri `poz.ts → PozYuvasi` ile ezilme-esneme karışımıyla geçiyor. Yapılacaklar:
- Fındık'ın dört pozu da `PozYuvasi` ile geçer.
- Pozun altına nefes eklenir (taban pivotlu).
- Kuyruk resmi zaten ayrı (`findik-kuyruk.webp`): utangaç pozda kuyruk yüzünü örter, sarılma pozunda pervane gibi döner.
- Kurabiyeyi yerken yanakları her ısırıkta şişer (`findik-yanak` pozu + scaleX 1.06 vuruşu, "kıt" sesi).
- Sarılma anında Kino ile Mino'nun üstünde 3 kalp çıkar. Mino `tepki('saril')` yapar.

**Çocuk için neden daha iyi:** Vakanın finali "kızma, anla" duygusunu taşıyor: Fındık aç olduğu için almıştı. Bu duygu düz resimle geçince zayıf kalıyor. Canlı bir utangaçlık ve sarılma, final mesajını (paylaşmak, affetmek) çocuğa geçirir.

**Gemini / Adobe:** yok.

**Kodcunun dokunacağı dosyalar:**
- `dedektif/src/vaka3.ts` (~1141 `findikPoz`, 1251-1431 final)
- `dedektif/src/poz.ts` (230)
- `dedektif/src/vaka3.css`
- e2e: `dedektif-vaka3.spec.ts` final testi

**Süre:** 0,5 gün (hat C).

---

### İş 7 · Çiz Canlansın: boya keskin, Mino cesaret versin

**Ne değişecek:**
- **Keskinlik (görsel kusur):** Boya katmanı `BOYUT = 360` ile çiziliyor ve telefonda ×3 büyüyor; bulanık görünüyor (kalite denetimi #22, `ekip/kalite/GORSEL-DENETIM.md`). Boya katmanı ekranın gerçek piksel boyunda çizilir (DPR 3, en çok `BOYA_EN_COK = 1024`).
- **Düşük puanda Mino:** Şimdi `y.nazik()` var ve eksik parçaların hayalet çizgisi görünüyor. Yenisi şöyle: Mino hayalet çizginin yanına yürür, sihirli değneğiyle eksik parçanın üstünden havada bir kez çizer (değnek ucunda parıltı izi, hayalet çizgiyle aynı yol). Sonra kalemi çocuğa uzatır gibi `sun` yapar. Söz söylemez; anlatıcının mevcut "Bir daha deneyelim" cümlesi kullanılır.
- **Yüksek puanda:** Çizim canlanınca Mino çizimin hareketini taklit eder. Balık ise yüzer gibi kollarını sallar, araba ise yerinde koşar (mevcut `dans` + yön).

**Çocuk için neden daha iyi:** Düşük puan bugün çocuğa "olmadı" diye kalıyor; Mino'nun gösterip kalemi uzatması "yapabilirsin" demek. Keskin boya da çocuğun kendi resmine gururla bakmasını sağlar; Müzem'deki resimler de güzelleşir.

**Gemini / Adobe:** yok.

**Kodcunun dokunacağı dosyalar:**
- `canlan/src/boya.ts` (430; `BOYUT`)
- `canlan/src/ekranlar.ts` (831; ~693 yıldız, 701-707 düşük puan)
- `src/mino/cizim-yoldas.ts` (198; yeni `goster(yol)` tepkisi)
- `canlan/src/muze.ts` (boya saklama boyu; eski kayıtlar bozulmaz)
- `canlan/src/canlan.css`

**Süre:** 1 gün (hat B, Gün 3).

---

### İş 8 · Küçük cila: menü kartları canlansın, salıncak çalıları düzelsin

- **Menü kartı dokununca canlanır** (0,4 sn, kart zıplamasıyla birlikte, perde inmeden önce):
  - Pazar'ın meyveleri sepete hoplar.
  - Canlan'ın dinozoru kuyruk sallar.
  - Maceralar'ın balonu yükselir.
  - Giysin'de Kino kartın içinde zıplar.
  - Pasta'nın otobüsü tekerlek üstünde zıplar.
  - Kartlar'da üç küçük kart döner.

  Bu katmanlar zaten ayrı resim (`oyunlar.ts` → `katmanlar`), yeni çizim gerekmez. Boşta da her 8 sn'de "Yeni" rozetli bir kart kendi hareketini bir kez yapar. Çocuk menüde yeni oyunu böyle fark eder.
- **Salıncak çalıları:** `.sl-kume` çalı kümeleri `salincak.css`'te ×5 büyütülüp esnemiş görünüyor (kalite denetimi #7). Oranı korunarak yeniden yerleştirilir.

**Kodcunun dokunacağı dosyalar:** `uygulama/src/ekranlar.ts` (387), `uygulama/src/uygulama.css` (982), `macera/src/salincak.css` (815).
**Süre:** 0,5 gün (hat C, Gün 3).

---

## 2. Gemini çizim listesi (8 sohbet, her biri yeni sohbette)

**Her istemde yüklenecek stil referansı:** `ekip/stil/onayli-stil-oda.png`. Kayıt yeri: `ekip/gemini/yeni/<klasör>/<dosya>.png` (≥ 2048 px). Kontrol: `onayli-stil-ozet.jpg` ile yan yana konur; tüy dokusu, parlama, gradyan ya da yazı varsa kullanılmaz.

**S-DÜZ** (Pati senaryosu §16a'daki S-PATİ; her istemin sonuna aynen eklenir):
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm pastel color fills, at most one soft hard-edged shade tone per color, only one or two tiny white highlights in the eyes. Simple rounded shapes, cute baby proportions. No texture, no fur strands, no grain, no gradients, no glow, no shine, no painterly look, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

**SAYFA kuralı** (karakter sayfalarının başına):
> ANIMATION SHEET. Every tile shows exactly the same character with the same design, same colors, same markings, same proportions and the same size scale (the character fills about 70% of the tile height), standing on the same invisible baseline. Even white space between tiles, nothing touching, no tile borders, no objects unless named.

| # | Dosya | Yükle | İstem (İngilizce) |
|---|---|---|---|
| G1 | `pati/findik-hareket-sayfasi.png` (16:9, 2×4) | stil, `pati/findik-model.png` | SAYFA + "Of exactly this same baby puppy: a chubby baby puppy, four-legged, no clothes, cream body (#F3D9A4) with a honey-brown (#D9963F) patch on the back and honey-brown long floppy ears, cream muzzle, small round chocolate nose, short tail with a cream tip. Two rows by four columns, eight tiles, three-quarter view facing right. Tile 1: standing calm and happy, tail up (main idle pose). Tile 2: exactly the same as tile 1, only the eyes gently closed as happy curves. Tile 3: hungry, sitting and looking down sadly, licking its lips. Tile 4: wants to play, play bow, front paws down, bottom up, tail high, eager eyes. Tile 5: eating happily with the head down (no bowl). Tile 6: fast asleep, curled into a round ball, eyes closed. Tile 7: overjoyed, jumping with all four paws off the ground, ears flying up. Tile 8: standing proudly holding a plain red ball in its mouth." + S-DÜZ |
| G2 | `pati/tarcin-hareket-sayfasi.png` (16:9, 2×4) | stil, `pati/kadro-a-tarcin.png` | SAYFA + "Of exactly this same kitten: a tiny ginger tabby kitten, four-legged, no clothes, orange (#F2A65A) with three simple darker orange stripes on the forehead and back drawn as flat shapes, white chest and white paws, pink triangle nose, long curly tail. Two rows by four columns, eight tiles, three-quarter view facing right. Tile 1: sitting calm and happy, the curly tail around the paws (main idle pose). Tile 2: exactly the same as tile 1, only the eyes gently closed as happy curves. Tile 3: cold, curled up small and shivering with two tiny shiver lines, ears flat, tail wrapped tight. Tile 4: wants to play, crouching low with the bottom raised and wiggling, eyes fixed forward. Tile 5: mid-air leap, both front paws reaching up as if catching a feather, joyful face. Tile 6: fast asleep, curled into a ball, tail over the nose. Tile 7: cozy, lying flat and relaxed, eyes closed, small smile (a blanket will be placed over it later). Tile 8: eating happily with the head down (no bowl)." + S-DÜZ |
| G3 | `pati/piril-hareket-sayfasi.png` (16:9, 2×4) | stil, `pati/kadro-b-piril.png` | SAYFA + "Of exactly this same goldfish: a round little goldfish, bright orange (#FF8C3A) with a white flowing double tail and white-tipped fins, big round eyes, tiny round mouth. No water drawn. Two rows by four columns, eight tiles, side view facing right. Tile 1: swimming, tail swept up. Tile 2: swimming, tail swept down. Tile 3: exactly the same as tile 1, only the eyes gently closed as happy curves. Tile 4: hungry, tilted up with the round mouth open toward the top. Tile 5: eating, gulping one tiny flake. Tile 6: overjoyed, a happy loop with three tiny bubbles. Tile 7: sleepy, drifting slowly, eyes half closed, fins drooping. Tile 8: asleep, still and level, eyes closed, peaceful." + S-DÜZ |
| G4 | `pati/esya-sayfasi.png` (4:3, 3×4) | stil | "OBJECT SHEET for a preschool pet shop game, twelve separate objects in three rows by four columns, each centered in its own tile with even white space, nothing touching, all drawn front view at a consistent scale. Row 1: an empty round pet food bowl; the same bowl full of brown kibble; an empty round water bowl; the same water bowl full of light blue water. Row 2: an open pet food bag with a paw-print shape and no words; a small plastic scoop; a small round fish food shaker tub with no words; a soft blue fleece blanket lying flat and spread out. Row 3: a plain red ball; a cat feather wand toy with a pink feather; an empty round thought bubble with three small trailing circles; a moon-shaped night lamp, warm yellow." + S-DÜZ |
| G5 | `pati/kose-sayfasi.png` (16:9, 1×3) | stil, `pati/salon-gunduz-v2.png` | "Three separate pet corner set pieces in one row with clear white space between them, straight-on front view like a stage set, no perspective tilt, made to sit inside the empty alcoves of the attached pet shop room. 1) a puppy corner: a round soft cushion bed and a low wooden picket fence behind it. 2) a kitten corner: a small cat tree with a sisal scratching post, one round platform, and a plain light-brown cardboard box with no markings beside it. 3) an aquarium: a rectangular glass tank on a low wooden stand, filled with light blue water, a green water plant, a few round pebbles and sand at the bottom, a thin frame; no fish. No bowls, no animals." + S-DÜZ |
| G6 | `pati/nehir-anlatici-sayfasi.png` (16:9, 2×4) | stil, `pati/nehir-model-v2.png` | SAYFA + "Of exactly this same young woman, waist-up, three-quarter view facing right, same face, same wavy chestnut hair in a messy bun with the yellow pencil, same green apron with the paw-print and two pockets, same cream shirt with rolled sleeves. The head is in exactly the same position and size in every tile. Row 1: Tile 1 warm closed-mouth smile; Tile 2 laughing happily with eyes closed; Tile 3 surprised, eyebrows up, small round open mouth; Tile 4 gentle and caring, head slightly tilted, one hand on her chest. Row 2: exactly the same face, pose and head position as tile 1, only the mouth changes: Tile 5 mouth open as in 'a'; Tile 6 rounded mouth as in 'o'; Tile 7 wide mouth as in 'e'; Tile 8 big open laugh." + S-DÜZ |
| G7 | `pati/salon-gece.png` (16:9, ≥ 2752×1536) | `pati/salon-gunduz-v2.png` (stil yerine bu) | "Edit this exact image. Make it night: the lights are off, the whole room is in soft calm dark-blue tones, the door window shows a dark blue night sky with a few small simple stars, the ceiling lamp is off. Keep every object, outline, shape and position pixel-identical. Flat colors only: no glow, no light rays, no gradients, no texture." |
| G8 | `elektrik/esya-sayfasi.png` (4:3, 3×4) | stil | "OBJECT SHEET for a preschool game about a cozy evening power cut at home, twelve separate objects in three rows by four columns, each centered in its own tile with even white space, nothing touching, front view, consistent scale, everyday daytime colors (the darkness will be added later). Row 1: a small wooden bedside cabinet with one drawer closed; the same cabinet with the drawer pulled open and empty; a chunky friendly yellow flashlight, switched off; the same flashlight with its round battery cap open and an empty battery slot. Row 2: one plain AA battery with no letters; a round alarm clock with two bells and simple hands, no numbers; a small potted plant in a terracotta pot; a squeaky dog toy bone, light blue. Row 3: a simple wooden chair; a tall floor lamp with a cream shade, switched off; a blanket tent: a patterned blanket draped over two chairs, standing; the same blanket tent collapsed flat in a soft heap." + S-DÜZ |

- **Sıra:** G8 sabah ilk iş yapılır (hat B'yi Gün 2'de besler). Ardından G1, G2, G3, G6 (kotada önce karakterler). G4, G5, G7 öğleden sonra.
- **Kayma olursa:** sayfa baştan çizdirilmez. Yalnız kayan kare, aynı sayfa yüklenerek "Edit this exact image: redraw ONLY tile N as …" ile düzeltilir.
- **Göz kırpma karesi (G1-G3 kare 2, G6 kare 1/5-8):** Adobe yalnız göz ve ağız bölgesini ana kareye yama olarak hizalar. Gemini'nin iki karesi piksel piksel aynı çıkmaz; kod bütün kareyi değiştirmez, yalnız yamayı gösterir.

---

## 3. Adobe (tasarımcı) iş listesi

| Ne | Girdi | Çıktı | Süre |
|---|---|---|---|
| Pati hayvan sayfaları kesimi, boy eşitleme, göz yaması | G1-G3 | `assets/pati/{findik,tarcin,piril}-*.webp` + `<ad>-goz-yama.webp` ve konum JSON'u | 3 saat |
| Pati eşya ve köşe kesimi, akvaryum ön camı ayrı katman | G4, G5 | `assets/pati/esya-*.webp`, `kose-*.webp`, `akvaryum-on.webp` | 2 saat |
| Nehir anlatıcı: ifadeler, 4 ağız ve göz yaması hizası | G6 | `assets/pati/nehir-anlatici-*.webp` + hiza JSON'u | 2 saat |
| Salon gece eşi hiza denetimi (gündüzle 1 px bile kaymamalı) | G7 | `assets/pati/salon-gece.webp` | 0,5 saat |
| Elektrik eşyaları; pil kapağı ve çekmece ön yüzü ayrı | G8 | `assets/elektrik/*.webp` | 3 saat |
| Hayvan iskeletlerine mutlu / şaşkın / üzgün yüz (İş 3) | `assets/karakter-iskelet/*` | aynı dosyalar, yeni gizli katmanlar | 4 saat |

Büyük dosya kuralı: daha yüksek çözünürlüklü mevcut dosya ezilmez (`guvenli-yaz.cjs`).

---

## 4. Takvim (en çok 3 kodcu aynı anda)

| | Hat A (kodcu 1) | Hat B (kodcu 2) | Hat C (kodcu 3) | Gemini / Adobe |
|---|---|---|---|---|
| **Gün 1 (16 Ekim)** | Pati: iskelet sayfa, salon, kamera, `ihtiyac.ts` + testi; kadro kesimleriyle | İş 2 Doğum Günü canlı çocuklar | İş 6 Dedektif Fındık + İş 5 Giysin | Gemini G8 → G1-G7 · Adobe: İş 3 yüzleri (önce tavşan) |
| **Gün 2 (17 Ekim)** | Pati: hayvan durum makinesi, bakım rafı, 5 ihtiyaç, Nehir; gerçek çizimler bağlanır | İş 4 Elektrik eşyaları | İş 3 müşteri tepkileri (Pazar, Pasta, Kino'nun Otobüsü) | Adobe: Pati kesimleri, elektrik kesimi |
| **Gün 3 (18 Ekim)** | Pati: açılış, akşam, polaroid, ses; telefon denemesi | İş 7 Çiz Canlansın | İş 8 küçük cila + bütün işlerin telefon turu (844×390, 390×844, 667×375) | Düzeltme kareleri (edit) |

- **Bitti ölçütü (her iş):** `npm run build` ve `npm test` geçer; ilgili e2e geçer; konsol hatası yok; 844×390 ve 390×844 ekran görüntüsü alınır, mümkünse debug APK'da gerçek telefonda kare kare izlenir.
- Pati 3. günün sonunda Barış'a `/pati/` bağlantısı ve 15 sn'lik bir kayıtla gösterilir (Tarçın'ın tüye atlaması, Fındık'ın battaniyesi). Menüye girmesi onun "tamam"ına bağlı.

---

## 5. Bilerek yapılmayanlar

- **Kino C kesme kukla kiti oyunlara taşınmaz.** Parça döndürme reddedildi. Oyunlardaki `karakter-iskelet/kino` ifade takımıyla zaten iyi çalışıyor.
- **Üç ayrı `Efekt` sınıfı birleştirilmez** (kino-otobus, pasta, dedektif). Çocuğa görünen bir kazancı yok, 3 günde risk.
- **Uyuyan Orman'a dokunulmaz.** Uygulamada yok, beklemede.
- **Pati'nin geri kalanı** (dükkân dışı, kepenk, köşe kurma, Gün 2-3 olayları, mini işler, yuvaya gidiş) bu dilim Barış'tan onay alınca, ayrı partiyle yapılır. Bölüm 1'in tamamı yaklaşık 137 görsel ve 3.000 satır; 3 güne sığmaz.
- **Yeni sistem yok:** puan, sayaç, oyunlar arası bağlantı eklenmez.
