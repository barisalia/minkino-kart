# Ceren Öğretmen ile İngilizceye Merhaba · çizim işleri

Sorumlu: Claude (plan, kod, denetim) · Çizim: Astra · Başlangıç: 17 Kasım 2026
Plan: [PLAN.html](PLAN.html) · Bu dosya çizim işlerinin tek listesidir. Biten sayfayı `CLAUDE-ASTRA-MESAJLAR.md` sonuna yaz; ben bakıp burada işaretlerim.

## Değişmeyen kurallar

- Minkino çizgisi: temiz 2D, canlı düz renk alanları, temiz siyah kontur, doku ve bulanık gölge yok. Referans: `assets/alfabe/ceren-konus/1.webp` (Ceren), `assets/uygulama/oyun-kapaklari/alfabe.webp` (kapak kalıbı), `ekip/ingilizce/eski-cizimler/hayvan-sheep-dur.webp` ve `shop-apple.webp` (kelime resmi).
- Bir karakterin bir hareketi tek sayfada. Bağımsız çizimlerde sayfa başına en çok 6 çizim.
- Her çizim ayrı dosya, şeffaf WebP (kapak ve fonlar opak). Zemin gölgesi yok. Yazı yok (kapaktaki etiket dışında).
- Nesnelerde, taşıtlarda, yiyeceklerde yüz yok. Çilek çizilmez. Elma kırmızı, armut yeşil.
- Karakter kimliği onaylı modelle birebir: Kino ve Mino için `ekip/kalite/minkino-gorsel-rehberi/pozlar/`, Ceren için `assets/alfabe/ceren-konus/`, Polly için `ekip/ingilizce/eski-cizimler/papagan-konus-0.webp`.
- Dosya adı ve klasör aşağıdaki gibi olursa çizim uygulamada kendiliğinden yerine oturur; ben yer ayarı yapmam.
- Teslim klasörü: `assets/ingilizce/` altında belirtilen alt klasör.

## Paket 1 · Kabuk ve 1. ünite (önce bu, sırayla)

**P1-1 · Ceren el sallıyor (4 kare, tek sayfa)** → `kisi/ceren-selam-0.webp` … `ceren-selam-3.webp`
Büst, 627 × 627 şeffaf. Baş ölçüsü, omuz hizası ve tuvaldeki yeri `assets/alfabe/ceren-konus/0.webp` ile birebir aynı; kareler üst üste konunca yalnız kol ve ağız oynamalı. Sağ eli (resmin sağı) omuz hizasında açık avuçla sallanıyor: 0 el ortada, 1 el sağa, 2 ortada, 3 sola. Ağız 0'da kapalı gülümseme, 1–3'te açık gülümseme ("Hello!" der gibi).

**P1-2 · Ceren alkışlıyor (4 kare, tek sayfa)** → `kisi/ceren-alkis-0.webp` … `ceren-alkis-3.webp`
Aynı büst ve aynı tuval. İki el göğüs önünde: 0 eller açık, 1 birleşmiş, 2 açık, 3 birleşmiş ve gözler mutlu kısık. Ağız açık gülümseme.

**P1-3 · Ceren dinliyor ve göz kırpıyor (3 çizim, tek sayfa)** → `kisi/ceren-dinle-0.webp`, `kisi/ceren-dinle-1.webp`, `kisi/ceren-goz-kapali.webp`
Aynı büst ve aynı tuval. Dinleme: bir eli kulağının arkasında, ağız kapalı gülümseme, gözler bize bakıyor; 1. karede baş hafif yana eğik. Göz kapalı: `ceren-konus/0.webp` ile birebir aynı çizim, yalnız iki göz kapalı (ince yay çizgi, kirpikler duruyor).

**P1-4 · Kino kart kaldırıyor (2 kare, tek sayfa)** → `kisi/kino-kart-0.webp`, `kisi/kino-kart-1.webp`
Belden yukarı, 800 × 800 şeffaf, onaylı üç çeyrek Kino. Bir patisiyle düz krem bir kartı havaya kaldırmış. Kart düz duruyor (eğik değil), ince siyah konturlu, köşeleri yuvarlak, içi boş krem; kartın tuvaldeki yeri iki karede de aynı: sol üst köşesi (430, 110), boyu 330 × 330. Resmi kartın içine ben koyacağım. 0: karta bakıyor, kaşları kalkık, emin değil. 1: bize bakıyor, başı hafif eğik, "bu mu?" der gibi.

**P1-5 · Kino seviniyor (2 kare, tek sayfa)** → `kisi/kino-sevin-0.webp`, `kisi/kino-sevin-1.webp`
Belden yukarı, 800 × 800 şeffaf, aynı ölçek. 0: iki pati yukarıda, ağız açık gülüyor. 1: patiler daha yukarıda, gözler mutlu kısık.

**P1-6 · Kino "hop, yanlış oldu" (2 kare, tek sayfa)** → `kisi/kino-hata-0.webp`, `kisi/kino-hata-1.webp`
Belden yukarı, 800 × 800 şeffaf, aynı ölçek. 0: bir pati başının arkasında, mahcup gülümseme. 1: omuz silkmiş, dil ucu hafif dışarıda, şirin. Üzgün ya da korkmuş değil.

**P1-7 · Ana ekran bölüm resimleri (3 bağımsız çizim, tek sayfa)** → `ui/bolum-dersler.webp`, `ui/bolum-oyunlar.webp`, `ui/bolum-kelimelerim.webp`
Her biri 900 × 600 şeffaf, zeminsiz nesne öbeği, yazısız.
- dersler: sehpada küçük kara tahta (üstünde tebeşirle çizilmiş bir yıldız ve bir elma), yanında bir zil ve üst üste iki kitap.
- oyunlar: üç renkli balon (kırmızı, sarı, mavi), kırmızı bir top ve bir uçurtma.
- kelimelerim: açık duran çıkartma albümü; sayfalarında kedi, elma ve yıldız çıkartması, yanında bir çıkartma tabakası.

**P1-8 · Menü kapağı (1 çizim)** → `assets/uygulama/oyun-kapaklari/ingilizce.webp`
1280 × 720 opak. Kalıp `oyun-kapaklari/alfabe.webp` ile aynı: düz açık mavi zemin + aynı küçük ton sür ton noktalar. Solda Ceren büstü, eliyle sağı gösteriyor. Sağda büyük krem konuşma balonu, içinde koyu yeşil "Hello!"; balonun üst kenarına Polly konmuş. Altta iki ucu renkli bantla tutturulmuş beyaz kâğıt etiket: "Ceren Öğretmen ile İngilizceye Merhaba".

**P1-9 · Balonlar (6 çizim, tek sayfa)** → `oyun/balon-kirmizi.webp`, `balon-mavi.webp`, `balon-sari.webp`, `balon-yesil.webp`, `balon-pembe.webp`, `oyun/balon-pat.webp`
Her biri 500 × 800 şeffaf. Beş balon birebir aynı biçim, yalnız renk farklı; düz renk, tek düz parlama lekesi, altında kısa ip. Yüz yok. `balon-pat`: patlama anı; balon yok, ortadan dışarı saçılan renkli parçacıklar ve çizgiler.

**P1-10 · Perde (1 çizim)** → `oyun/perde.webp`
700 × 1000 şeffaf. Kırmızı sahne perdesinin sol kanadı; üstte sarı saçak, düz renk kıvrımlar, siyah kontur. Sağ kanat için aynısını kodda çevireceğim; sağ kenarı düz bitsin.

**P1-11 · Hafıza kartı arkası (1 çizim)** → `oyun/kart-arka.webp`
600 × 600 şeffaf. Köşeleri yuvarlak kare kart; açık mavi zemin, ortasında büyük sarı yıldız, çevresinde küçük ton sür ton noktalar, siyah kontur.

**P1-12 · Sürpriz kutusu (2 çizim, tek sayfa)** → `kapak/kutu-govde.webp`, `kapak/kutu-kapak.webp`
İkisi de aynı tuvalde, 1000 × 1000 şeffaf; üst üste konunca kapalı hediye kutusu olur. Gövde: mavi kutu, önünde sarı kurdele; içi görünür (üst kenarı açık, iç yüzü koyu mavi). Kapak: aynı mavi, üstünde sarı fiyonk; gövdenin tam üstünde durur. Kapağı kodda yukarı kaldırıp yana atacağım, resim kutunun içinden çıkacak. (Ahırı olmayan bütün ünitelerde yeni kelime bu kutudan çıkar.)

**P1-13 · Yiyecekler adası (6 çizim, tek sayfa)** → `ada/yiyecekler-set.webp`, `yiyecekler-mino-0.webp`, `yiyecekler-mino-1.webp`, `yiyecekler-kus-0.webp`, `yiyecekler-kus-1.webp`, `yiyecekler-elma.webp`
Ada kuralı aşağıda. Sahne: kırmızı beyaz tenteli küçük tezgâh, üstünde meyve kasaları ve süt şişeleri (set); tezgâhın arkasında Mino (el aşağıda / el sallıyor); tentenin üstüne konmuş küçük kuş (baş yukarı / yem yiyor); tezgâhın önünde yuvarlanacak tek kırmızı elma.

## Paket 2 · 2. ve 3. ünite

**P2-1 · Renkler (6 çizim, tek sayfa)** → `kelime/red.webp`, `blue.webp`, `yellow.webp`, `green.webp`, `orange.webp`, `pink.webp`
Her biri 800 × 800 şeffaf. Aynı boya kovası altı renkte: kovanın içi ve kenarından taşan boya o renkte, yanında aynı renkte iri bir fırça darbesi. Kova biçimi altısında birebir aynı; yalnız renk değişir. Renkler net ve doygun.

**P2-2 · Sayılar (6 çizim, tek sayfa)** → `kelime/one.webp` … `kelime/six.webp`
Her biri 800 × 800 şeffaf. Ahşap oyuncak rakam (1–6), her rakam başka canlı renkte, kalın ve yuvarlak hatlı; altında o sayı kadar küçük sarı yıldız tek sıra. Rakamda yüz yok.

**P2-3 · Renkler adası (6 çizim, tek sayfa)** → `ada/renkler-set.webp`, `renkler-kino-0.webp`, `renkler-kino-1.webp`, `renkler-kus.webp`, `renkler-damla.webp`, `renkler-gokkusagi.webp`
Ada kuralı aşağıda. Sahne: sehpada büyük tuval ve boya kovaları (set); elinde fırçayla tuvali boyayan Kino (fırça aşağıda / yukarıda); tuvalin üstüne konmuş küçük kuş; fırçadan damlayan boya damlası; adanın arkasında alçak gökkuşağı.

**P2-4 · Sayılar adası (6 çizim, tek sayfa)** → `ada/sayilar-set.webp`, `sayilar-mino-0.webp`, `sayilar-mino-1.webp`, `sayilar-top.webp`, `sayilar-balon.webp`, `sayilar-bayrak.webp`
Sahne: üst üste dizilmiş 1-2-3 rakam küpleri ve bir abaküs (set; abaküste yüz yok); küpün yanında parmaklarıyla sayan Mino (bir parmak / üç parmak); zıplayan top; ipli tek balon; direkte renkli flama.

## Paket 3 · Kalan ünitelerin kelimeleri (her biri 6 çizim, tek sayfa, 800 × 800 şeffaf) → `kelime/<ad>.webp`

- **P3-5 Oyuncaklar:** doll, kite, robot, drum (ball ve teddy-bear elde var). Sayfaya iki çizim daha: `car.webp`, `bus.webp` (yandan, sürücüsüz).
- **P3-6 Ailem:** mom, dad, sister, grandma, grandpa, friend. Onaylı modellerle: Kino'nun annesi, babası, Lokum, babaanne, dede, Mino. Her biri büst, bize bakıyor, gülümsüyor.
- **P3-7 Yüzüm:** eyes, ears, nose, mouth, hands, feet. Kino'nun o uzvunun yakın çizimi; kadraj yalnız o uzvu gösterir.
- **P3-8 Kıyafetler:** hat, shoes, socks, t-shirt, pants, jacket. Tek başına duran çocuk kıyafeti.
- **P3-9 Odam:** chair, door (bed, table, lamp, window elde var). Sayfaya dört çizim daha: `train.webp`, `plane.webp`, `boat.webp`, `bike.webp`.
- **P3-11 Hareketler:** jump, run, clap, sleep, eat, drink. Her biri o hareketi yapan Kino, tam boy.
- **P3-12 Vahşi hayvanlar:** lion, monkey, elephant, bird, fish, frog. Çiftlik hayvanlarıyla aynı çizgi ve sevimlilik.

## Paket 4 · Konuşan resim sahneleri (her ünite için 1 çizim, kendi çağrısında)

Her ünitenin şenlik dersinde altı kelime tek sahnede buluşur. Sahne **boş fon** olarak çizilir (kelimelerin resimleri üstüne ben yerleştiririm): 1672 × 941 opak, ortası ve alt yarısı nesneler için boş. Örnek: `assets/ingilizce/sahne/ciftlik.webp` (çayır).
→ `sahne/renkler.webp` (resim atölyesi duvarı ve zemini), `sahne/sayilar.webp` (oyun halısı ve raf), `sahne/yiyecekler.webp` (mutfak tezgâhı ve masa), `sahne/oyuncaklar.webp` (oyun odası), `sahne/ailem.webp` (ev salonu, koltuk), `sahne/yuzum.webp` (banyo aynası önü), `sahne/kiyafetler.webp` (gardırop önü), `sahne/odam.webp` (yatak odası), `sahne/tasitlar.webp` (yol, ray ve deniz kıyısı bir arada), `sahne/hareketler.webp` (park), `sahne/vahsi.webp` (orman açıklığı).

## Paket 5 · Kalan ünitelerin adaları (her biri 6 çizim, tek sayfa, ada kuralıyla)

oyuncaklar, ailem, yuzum, kiyafetler, odam, tasitlar, hareketler, vahsi. Her adada: ünitenin dünyasını anlatan dekor (`<unite>-set`), iki kareli bir ya da iki karakter (`-0`, `-1`) ve kodla oynayacak bir iki küçük parça. Karakterler Kino, Mino ya da ünitenin kendi sakinleri. Sıra bu pakete gelince her ada için sahneyi buraya tek tek yazacağım.

## Ada kuralı (bütün adalar)

- Adanın bütün parçaları aynı tuvalde, 1000 × 900 şeffaf WebP; her parça sahnedeki kendi yerinde çizilir, dosyalar üst üste konunca sahne tamamlanır. Ada zemini çizilmez (`assets/ada-arkaplan/kasaba-ada.webp` kullanılıyor).
- Dolu alan her adada aynı: yatayda 85–910, dikeyde 243–842 piksel. Sahne tabanı 842. pikselde biter.
- `-set`: hareket etmeyen dekor. `-0` / `-1`: aynı karakterin iki karesi (yeri aynı, yalnız hareket eden uzuv değişir). Diğerleri: tek parça, kodla hareket eder (zıplar, sallanır, kayar).
- Örnek ve ölçü: `ekip/ingilizce/eski-cizimler/adalar/ahir-set.webp` ve `ahir-koyun-0.webp`.

## 17 Kasım 2026 akşam · Barış'ın yeni talimatı: derste 4 kelime, 2. ve 3. seviye (cümleler, soru–cevap, cümle kurma, hikâye)

Barış: "3 kelime ne … biraz daha fazla öğret. Dersleri ilerlet … derslerin 2. 3. seviyesi cümle kurma falan baya ilerlet. Yeni görseller üretmekten korkma."
Kod ve içerik hazır (`ingilizce/src/icerik2.ts`); aşağıdaki her çizim belli bir dersin belli bir ekranına bağlıdır, dosya doğru adla gelince ders kendiliğinden açılır. **Sıra önemli: önce Paket 6 ve Paket 7, sonra çiftliğin hikâyesi (P9-1); böylece ilk ada üç seviyesiyle baştan sona bitmiş olur. Sonra adalar sırayla.**
Ortak kurallar yukarıdakiyle aynı (Minkino çizgisi, nesnede yüz yok, yazı yok, zemin gölgesi yok). Sayfa başına en çok 6 çizim.

## Paket 6 · Her üniteye iki yeni kelime (24 çizim, 4 sayfa × 6; 800 × 800 şeffaf) → `kelime/<ad>.webp`

Ünitenin öbür kelime resimleriyle aynı çizgi, aynı ölçek, aynı kadraj doluluğu (yanlarına konunca "aynı takım" görünmeli).
- **P6-1:** `chicken`, `pig` (çiftlik hayvanlarıyla aynı duruş: yandan, ayakta) · `egg` (tek yumurta, kabuklu) · `water` (bir bardak su; `milk` ile aynı ölçek) · `purple`, `black` (öbür altı renkle aynı boya kovası, yalnız renk değişir).
- **P6-2:** `seven`, `eight` (`one`…`six` ile aynı rakam biçimi ve renk düzeni) · `balloon` (ipli tek balon, kırmızı) · `puzzle` (dört parçalı yapboz, bir parçası yerinden ayrık) · `family` (aile fotoğrafı: anne, baba, Kino ve Lokum yan yana büst, onaylı modeller) · `teacher` (Ceren Öğretmen büst, bize bakıyor, gülümsüyor; öbür aile büstleriyle aynı kadraj).
- **P6-3:** `head`, `legs` (Yüzüm kartlarıyla aynı düzen: Kino o uzvunu gösteriyor; baş için iki eliyle başına dokunuyor, bacak için bacaklarını gösteriyor) · `dress`, `scarf` (tek başına duran çocuk kıyafeti; öbür kıyafetlerle aynı ölçek) · `box` (kapağı açık karton kutu, içi boş, önden üç çeyrek) · `clock` (yuvarlak duvar saati, rakam yerine çizgiler; yüz yok).
- **P6-4:** `truck`, `rocket` (öbür taşıtlarla aynı: yandan, sürücüsüz; roket dik, alevli) · `dance`, `swim` (o hareketi yapan Kino, tam boy; öbür hareket kartlarıyla aynı ölçek; yüzmede kollukla suda) · `giraffe`, `snake` (vahşi hayvanlarla aynı sevimlilik; yılan kıvrık, gülümseyen, korkutucu değil).

## Paket 7 · Seviye 2 için Kino'nun iki pozu ve söz simgeleri

- **P7-1 Kino (tek sayfa, 2 çizim; 622 × 840 şeffaf, `kisi/kino-kart-1.webp` ile aynı tuval, aynı boy, aynı ayak hizası):**
  `kisi/kino-begen.webp` "I like": Kino bayılıyor; gözler kapalı-gülen, dil dudakta, bir eli karnında.
  `kisi/kino-begenme.webp` "I don't like": Kino istemiyor; başı yana çevrik, dili dışarıda "ıyy", bir eli "hayır, istemem" diye öne uzanmış.
  Kullanım: "I like bananas." cümlesinin resminde Kino solda, muz sağda durur.
- **P7-2 Söz simgeleri 1 (6 çizim, 400 × 400 şeffaf, kalın konturlu, tek bakışta okunur; cümle kurma taşlarının üstünde 100 piksel boyunda kullanılacak) → `ui/soz-<ad>.webp`:**
  `soz-gor` "I see": dürbün · `soz-sev` "I like": başparmağı yukarı beyaz eldivenli el · `soz-sevme` "I don't like": başparmağı aşağı aynı el · `soz-var` "I have": iki avuç içinde küçük bir hediye paketi · `soz-kalp` "I love": kırmızı kalp (bu çizim "I love my mom." resminde annenin üst köşesinde de durur) · `soz-ve` "and": tombul sarı artı işareti.
- **P7-3 Söz simgeleri 2 (5 çizim, aynı ölçüler):**
  `soz-buyuk` "big": yan yana küçük gri top ve büyük kırmızı top, büyüğün çevresinde vurgu çizgileri · `soz-kucuk` "small": aynı ikili, bu kez küçük top kırmızı ve vurgulu, büyük gri · `soz-ustunde` "on": kutunun üstünde kırmızı top · `soz-altinda` "under": masanın altında kırmızı top · `soz-icinde` "in": açık kutunun içinde kırmızı top (üstten yarısı görünür).

## Paket 8 · Seviye 2'nin cümle resimleri (800 × 800 şeffaf)

Her biri tek bir cümlenin resmidir; çocuk üç resim arasından Polly'nin söylediğini seçer. O yüzden aynı sayfadaki çizimler yalnız cümlede değişen şeyle ayrılmalı (renk, yer, hareket); gerisi birebir aynı kalmalı.
- **P8-1 Renkler (6) → `renkli/`:** `ball-red`, `ball-blue` (`kelime/ball` ile aynı top, tek düz renk) · `car-red`, `car-blue` (`kelime/car` ile aynı araba) · `kite-yellow`, `kite-green` (`kelime/kite` ile aynı uçurtma). Rengi dışında hiçbir şey değişmesin.
- **P8-2 Kıyafetler (4) → `renkli/`:** `hat-red`, `hat-blue` (`kelime/hat` ile aynı şapka) · `socks-yellow`, `socks-green` (`kelime/socks` ile aynı çorap çifti).
- **P8-3 Odam · yer (4) → `yer/`:** `cat-on-bed`, `cat-under-bed` (aynı yatak, aynı kedi; yalnız kedinin yeri değişir) · `ball-on-table`, `ball-under-table` (aynı masa, aynı kırmızı top). Yatak ve masa `kelime/bed`, `kelime/table` ile aynı; kedi `kelime/cat`.
- **P8-4 Odam · yer 2 (4) → `yer/`:** `ball-in-box`, `cat-in-box` (P6-3'teki kutunun aynısı; top / kedi içinden yarı görünür) · `ball-on-chair`, `cat-on-chair` (`kelime/chair` ile aynı sandalye).
- **P8-5 Yüzüm · yap bakalım (4) → `eylem/`:** Yüzüm kartlarıyla aynı kadraj (Kino belden yukarı). `kino-close-eyes` (gözler kapalı, iki eliyle gözlerini gösteriyor) · `kino-open-mouth` (ağız kocaman açık) · `kino-wash-hands` (köpüklü ellerini yıkıyor, musluk yok; yalnız köpük ve su damlaları) · `kino-stamp-feet` (tam boy, bir ayağını yere vuruyor, ayağın yanında vurma çizgileri).
- **P8-6 Taşıtlar · neyle gidiyor (4) → `eylem/`:** `kino-by-bus`, `kino-by-train`, `kino-by-boat`, `kino-by-bike`. `kelime/`deki aynı taşıt; Kino içinde (camdan el sallıyor) ya da üstünde (bisiklette). Yandan.
- **P8-7 Hareketler · hayvanlar (4) → `eylem/`:** `cat-sleeping` (kıvrılmış uyuyor, üstünde "z" yok; gözler kapalı) · `dog-running` (koşuyor, kulaklar uçuşuyor) · `duck-eating` (yerden yem yiyor) · `horse-jumping` (alçak bir çitin üstünden atlıyor). Hayvanlar `kelime/`dekiyle aynı.
- **P8-8 Vahşi hayvanlar · ne yapabilir (4) → `eylem/`:** `fish-swimming` (suyun içinde, kabarcıklar) · `bird-flying` (kanatlar açık, uçuyor) · `frog-jumping` (havada, bacaklar gergin) · `monkey-climbing` (ağaç gövdesine tırmanıyor). Hayvanlar `kelime/`dekiyle aynı.

## Paket 9 · Hikâyeler (her hikâye kendi sayfasında 4 çizim; 1200 × 900 opak, yatay) → `hikaye/<ünite>-<1…4>.webp`

Seviye 3'ün son dersi: Polly dört resmi birer cümleyle anlatır, çocuk sonra resimleri sıraya dizer. **Kamera rehberi geçerli (`ekip/film/KAMERA-REHBERI.md`): bir hikâyenin dört resmi aynı fon, aynı ölçek; değişen yalnız cümlede anlatılan şey.** Resimler küçük boyda da (300 piksel genişlik) birbirinden ayırt edilebilmeli; ana öğe büyük ve ortada olsun. Yazı yok.
- **P9-1 `ciftlik` · Kino at the Farm:** 1 "Kino is at the farm." Kino çiftlik kapısında, arkada ahır · 2 "He sees a big cow." Kino büyük ineğin yanında, ineğe bakıyor · 3 "He sees a small duck." Kino eğilmiş, küçük ördeğe bakıyor · 4 "Goodbye, cow! Goodbye, duck!" Kino el sallayarak uzaklaşıyor, inek ve ördek arkada.
- **P9-2 `renkler` · Two Balloons:** 1 "Kino has a red balloon." · 2 "Polly has a blue balloon." (Polly mavi balonun ipini gagasında / ayağında tutuyor) · 3 "Oh no! The red balloon is gone." (kırmızı balon göğe kaçmış, Kino üzgün yukarı bakıyor) · 4 "Here you are, Kino. Thank you, Polly!" (Polly mavi balonu Kino'ya veriyor, Kino sevinçli).
- **P9-3 `sayilar` · One, Two, Three!:** göl kıyısı. 1 "Kino sees one duck." · 2 "Now he sees two ducks." · 3 "Now he sees three ducks!" · 4 "One, two, three. Hello, ducks!" (Kino üç ördeğe el sallıyor, ördekler ona bakıyor). Ördek sayısı her resimde açıkça sayılabilir olsun.
- **P9-4 `yiyecekler` · Kino is Hungry:** mutfak masası. 1 "Kino is hungry." (eli karnında, boş tabak) · 2 "He eats an apple. Yummy!" (kırmızı elmayı ısırıyor) · 3 "He drinks milk. Yummy!" (bardaktan süt içiyor) · 4 "Now Kino is happy." (karnı tok, gülümsüyor; masada elma koçanı ve boş bardak).
- **P9-5 `oyuncaklar` · The Toy Box:** oyun odası. 1 "Kino has a big box." (kapalı büyük kutu) · 2 "A ball is in the box." (kutu açık, içinden top görünüyor) · 3 "A robot is in the box." (Kino kutudan robotu çıkarıyor) · 4 "Let's play, Polly!" (Kino ile Polly topla oynuyor, robot yanda).
- **P9-6 `ailem` · My Family:** salon, duvarda çerçeveler. 1 "This is my mom." (Kino annesini gösteriyor) · 2 "This is my dad." · 3 "This is my grandma." · 4 "I love my family!" (hepsi birlikte sarılmış).
- **P9-7 `yuzum` · Good Morning, Kino:** 1 "Good morning, Kino!" (yatakta uyanıp geriniyor, pencereden güneş) · 2 "Wash your hands." (lavaboda ellerini yıkıyor) · 3 "Brush your teeth." (dişlerini fırçalıyor) · 4 "Kino is ready. Let's go!" (kapıda, çantası sırtında). (Bu hikâyede yer değişir: yatak odası, banyo, kapı.)
- **P9-8 `kiyafetler` · It's Cold!:** evin kapı önü, dışarıda kar. 1 "It's cold today." (Kino pencereden kara bakıyor, üşüyor) · 2 "Put on your jacket, Kino." (ceketini giyiyor) · 3 "Put on your hat, Kino." (şapkasını takıyor) · 4 "Now Kino is warm. Let's play!" (karda mutlu, ceketli ve şapkalı).
- **P9-9 `odam` · Where is the Cat?:** Kino'nun odası (P4 `sahne/odam` ile aynı oda). 1 "Where is the cat?" (Kino elleri iki yana açık, soruyor) · 2 "Is it under the bed? No!" (yatağın altına bakıyor, boş) · 3 "Is it on the chair? No!" (sandalyeye bakıyor, boş) · 4 "The cat is in the box!" (kedi kutudan başını çıkarmış, Kino gülüyor).
- **P9-10 `tasitlar` · Kino's Trip:** 1 "Kino is on the bus." · 2 "Kino is on the train." · 3 "Kino is on the boat." · 4 "Hello, Grandma! Hello, Grandpa!" (babaanne ve dede evin önünde kollarını açmış, Kino koşuyor). (Yer değişir; Kino'nun ölçeği aynı kalsın.)
- **P9-11 `hareketler` · Kino's Day:** 1 "Kino is running." (parkta) · 2 "Kino is eating." (masada) · 3 "Kino is drinking." (su içiyor) · 4 "Kino is sleeping. Good night, Kino!" (yatağında, pencerede ay).
- **P9-12 `vahsi` · In the Jungle:** orman (P4 `sahne/vahsi` ile aynı). 1 "Kino is in the jungle." (kâşif şapkalı Kino) · 2 "He sees a big elephant." · 3 "He sees a small frog." (yaprağın üstünde minik kurbağa) · 4 "The frog can jump. Jump, Kino, jump!" (kurbağa ile Kino birlikte zıplıyor).

## 17 Kasım 2026 gece · Barış "devam" dedi: üst seviyelere yeni oyunlar

2\. ve 3. seviyenin altı dersinde "Hangisi?" oyunu altı kez yineleniyordu. Altı yeni oyun yazıldı (Doğru mu?, Polly'nin Dürbünü, Cümle Hafızası, Sen Söyle, Say ve Koy, Sen Sor). Hepsi var olan çizimlerle çalışıyor. Aşağıdaki altı çizim geldiğinde kendiliğinden yerine oturur: oyunlar kodla çizilmiş zeminden Astra'nın çizimine geçer.

## Paket 10 · Yeni oyunların çizimleri (6 çizim, 3 sayfa)

- **P10-1 Polly'nin iki yeni hareketi (tek sayfa, 4 çizim; 540 × 500 şeffaf; `kisi/polly-konus-0.webp` ile aynı tuval, aynı boy, aynı ayak hizası, aynı yarım profil; şapka, kanat ve boynundaki dürbün kimliğiyle birebir):**
  `kisi/polly-durbun-0.webp`: Polly dürbününü iki kanadıyla gözüne götürmüş, oyun alanına (bize göre sağa) bakıyor; gaga kapalı, gövde dik.
  `kisi/polly-durbun-1.webp`: aynı poz, gövde hafif öne eğik, bir şey görmüş gibi (dürbün gözde kalır).
  `kisi/polly-dinle-0.webp`: bir kanadını başının yanına, kulak hizasına götürmüş dinliyor; baş o yana birkaç derece eğik, gaga kapalı, gözler açık ve dikkatli. Dürbün boynunda asılı.
  `kisi/polly-dinle-1.webp`: aynı poz, gözler hafif kısık (dikkat kesilmiş).
  Kullanım: "Polly'nin Dürbünü" oyununda resimler mercekten geçerken Polly dürbünle bakar; "Sen Sor" adımında çocuk soruyu sorarken Polly dinler. Konuşma karesinden bu karelere geçişte baş ve gövde yerinden oynamasın (Ceren'in dinleme karelerindeki kural).
- **P10-2 Dürbün merceği çerçevesi (1 çizim, kendi çağrısında; 1240 × 1240 şeffaf) → `oyun/durbun-cerceve.webp`:**
  Tam ortada kalın yuvarlak bir halka: Polly'nin dürbününün rengiyle (lacivert gövde, açık mavi iç pah), temiz siyah kontur. **Halkanın iç boşluğu tam daire ve tamamen saydam: çapı 992 piksel (tuvalin %80'i). Halkanın dış çapı 1190 piksel (%96).** Boşluğun sol üstünde cam parlaması: yarı saydam beyaz, kenarı belirgin iki kısa kavis (bulanık geçiş yok). Halkanın üstünde ve altında birer küçük sarı perçin olabilir; sap, kayış ya da başka süs yok.
  Kullanım: cümle resimleri bu halkanın içinden sırayla geçer (resim halkanın arkasında, krem zeminde durur). Şimdilik halka kodla çizili düz turkuaz bir çember: `output/ingilizce/ekran/tablet/ciftlik6-yakala-an.png`.
- **P10-3 Tepsi (1 çizim, kendi çağrısında; 2000 × 1000 şeffaf, tam üstten görünüş) → `oyun/tepsi.webp`:**
  Açık renk ahşap, köşeleri yuvarlak, alçak kenarlı bir tepsi; tuvalin tamamını kaplar (kenar boşluğu yok). İçinde **sekiz eşit kare göz, 4 sütun × 2 satır; her göz 400 × 400 piksel, köşeleri yuvarlak (yarıçap 60), zemini krem (tepsiden bir ton açık, düz renk). Gözlerin sol kenarları x = 110, 570, 1030, 1490; üst kenarları y = 70, 530.** Gözlerin içi boş; yazı, rakam, desen yok. Gölge yalnız kenarı belirgin düz bir ton.
  Kullanım: "Say ve Koy" oyununda çocuk elmaları, topları, ördekleri bu gözlere tek tek koyar; ölçüler koddaki ızgarayla birebir eşleşmeli. Şimdilik tepsi kodla çizili beyaz bir kart: `output/ingilizce/ekran/tablet/sayilar6-saykoy-dolu.png`.

## Paket 11 · Polly'nin Postası (7 çizim, 3 sayfa)

- **P11-1 Sokağın dört evi (tek sayfa, 4 çizim; her biri 800 × 1000 şeffaf, tam karşıdan) → `oyun/posta-ev-0.webp` … `posta-ev-3.webp`:**
  Aynı küçük ev dört renkte: 0 şeftali, 1 nane yeşili, 2 açık mavi, 3 bal sarısı duvar; çatılar birbirinden farklı koyu tonda. Çatı tuvalin üst %30'unda, ev tuvali yanlardan ve alttan kaplar (ayak tabanı tuvalin altında).
  **Ön cephede büyük, köşeleri hafif yuvarlak tek bir pencere: tamamen saydam, x = 80…720, y = 340…800 (640 × 460 piksel).** Cümlenin resmi bu pencereden görünür; pencere çerçevesi beyaz, kontur siyah. Pencerenin altında, ortada yatay bir posta yuvası (300 × 40, koyu kahve).
  Pencerenin içine perde, cam yansıması ya da başka bir şey çizme; saydam kalsın. Kapı yok (pencere cephenin ana öğesi).
- **P11-2 Mektup (1 çizim, kendi çağrısında; 1200 × 800 şeffaf) → `oyun/zarf.webp`:**
  Kapalı krem bir zarf, önden; kapağın üçgeni üstte, kırmızı yuvarlak mühür kapağın ucunda. **Ortada boş, açık krem bir etiket alanı: x = 200…1000, y = 370…650**; içine hiçbir şey yazma (cümleyi kod yazar). Kalın siyah kontur, düz renk.
- **P11-3 Polly postacı (tek sayfa, 2 çizim; 540 × 500 şeffaf, `kisi/polly-konus-0.webp` ile aynı tuval, boy, ayak hizası, yarım profil) → `kisi/polly-posta-0.webp`, `-1`:**
  0: Polly iki kanadıyla P11-2'deki zarfı göğüs hizasında tutup bize, oyun alanına doğru uzatıyor; gaga kapalı. 1: aynı poz, zarf biraz daha ileride (veriyor). Şapka, dürbün ve renkler kimliğiyle birebir. Konuşma karesinden geçişte baş ve ayaklar yerinden oynamasın.

Kullanım: 2. seviyenin 5. dersinde (her adada) "Polly'nin Postası" oyunu. Polly mektubu okur ("A small cow."), çocuk mektubu parmağıyla sürükleyip o cümlenin resmini penceresinde taşıyan eve götürür; doğru evde mektup yuvaya girer, ev yanar. Şimdilik evler krem kart, mektup cümlesi yazan kart: `output/ingilizce/kontrol/posta4-tablet.png`, `posta5-telefon.png`.

## Paket 12 · Kino'yu Giydir (12 çizim, 4 sayfa)

Kıyafetler adasına özel oyun. Polly "Put on the hat!" der, çocuk şapkayı Kino'ya giydirir; dört giysiden sonra Kino'nun fotoğrafı çekilir. Bütün katmanlar **aynı 1000 × 1400 şeffaf tuvalde**, Kino'nun gövdesine birebir oturur: kod katmanları üst üste koyar, kaydırma ya da ölçekleme yapmaz.

- **P12-1 Kino gövdesi (tek sayfa, 2 çizim; 1000 × 1400 şeffaf) → `oyun/giydir/kino-0.webp`, `kino-1.webp`:**
  Kino'nun güncel (çizgi film) modeli, tam karşıdan ayakta; kollar gövdeden hafif açık, ayak tabanları tuvalin altından 40 piksel yukarıda, başın tepesi y ≈ 120. Üzerinde **hiçbir giysi ve aksesuar yok** (fular da yok).
  0: gülümsüyor, ağız kapalı. 1: aynı duruş piksel piksel aynı, yalnız yüz değişir: gözler kapalı, kocaman sevinçli gülüş (fotoğraf anı).
- **P12-2 Üst giysiler (tek sayfa, 4 çizim; her biri 1000 × 1400 şeffaf, P12-1'in tuvali) → `oyun/giydir/hat`, `scarf`, `t-shirt`, `jacket`:**
  Her dosyada **yalnız o giysi**, Kino'nun üstüne giydirilmiş hâliyle ve Kino'nun gövdesine tam oturan yerde; Kino'nun kendisi çizilmez. Ceket önü açık, tişörtün üstüne giyilir (kollarıyla). Atkı boyunda, uçları öne düşer. Şapka başın üstünde, kulaklar dışarıda.
- **P12-3 Alt giysiler (tek sayfa, 4 çizim; aynı tuval) → `oyun/giydir/pants`, `dress`, `socks`, `shoes`:**
  Pantolon belden bileğe; elbise omuzdan dize (tişört ve pantolonun yerine giyilir, ikisinin üstünü tamamen örter); çoraplar bileğe kadar; ayakkabılar çorabın üstüne.
  **Renk ve desen: her giysi, çocuğun derste öğrendiği `kelime/<ad>.webp` resmindeki giysinin aynısıdır** (aynı renk, aynı desen), çocuk tanısın.
- **P12-4 Giyinme odası fonu (1 çizim, kendi çağrısında; 2000 × 1250, şeffaf değil) → `sahne/giyinme.webp`:**
  Sıcak bir çocuk odası köşesi: arka duvarda boş askılık ve boş raflar, yerde yuvarlak halı. **Ortadan biraz solda (x 500…1200) hiçbir eşya yok**: Kino orada durur. Sağ üçte birlik alan sade duvar (kod giysi kartlarını oraya dizer). Pastel, bizim iç mekân paletimiz (lila duvar, açık mavi lambri, şeftali zemin).
- **P12-5 Fotoğraf çerçevesi (1 çizim, kendi çağrısında; 1100 × 1300 şeffaf) → `oyun/foto-cerceve.webp`:**
  Anlık fotoğraf karesi: beyaz kalın çerçeve, altı daha geniş; **iç pencere tamamen saydam: x 80…1020, y 80…1100**. Sol üst köşede yarı saydam bant parçası. Kontur siyah.

Katman sırası (kod): çorap < ayakkabı < pantolon < tişört < elbise < ceket < atkı < şapka.

## Paket 13 · Masal Kitaplığı (14 çizim, 4 sayfa)

Ana ekrandan açılan kitaplık: 12 adanın hikâyesi rafta durur, çocuk kitaba dokununca hikâye sayfa sayfa okunur.

- **P13-1 Kitaplık fonu (1 çizim, kendi çağrısında; 2000 × 1400, şeffaf değil) → `sahne/kitaplik.webp`:**
  Okuma köşesi: tam karşıdan büyük ahşap kitaplık, **üç raf, raflar boş**. Rafların üst yüzeyi (kitapların basacağı çizgi) y = 520, 900, 1280; rafların iç genişliği x = 140…1860. Kitaplığın solunda küçük bir minder ve abajur (yalnız süs, rafın önünü kapatmaz).
- **P13-2 · P13-3 Kitap kapakları (iki sayfa, her sayfada 6 kapak; her biri 600 × 800 şeffaf, tam karşıdan, dik duran sert kapaklı kitap) → `kitap/<ada>.webp`:**
  Kapak adanın kendi rengindedir; ortada hikâyenin bir anı büyük ve okunur; **altta 600 × 170'lik boş açık şerit** (kitabın adını kod yazar). Yazı yok.
  1. `ciftlik`: Kino çiftlikte büyük bir inekle selamlaşıyor. 2. `renkler`: Kino kırmızı, Polly mavi balon tutuyor. 3. `sayilar`: Kino göl kenarında üç ördeği sayıyor. 4. `yiyecekler`: Kino elma yiyor, yanında süt bardağı. 5. `oyuncaklar`: Kino büyük bir kutudan top ve robot çıkarıyor. 6. `ailem`: Kino annesi, babası ve büyükannesiyle sarılıyor.
  7. `yuzum`: Kino lavaboda dişlerini fırçalıyor. 8. `kiyafetler`: Kino ceketli ve şapkalı, kar tanecikleri. 9. `odam`: yatak altından kedi kuyruğu, Kino bakıyor. 10. `tasitlar`: Kino tren penceresinden el sallıyor. 11. `hareketler`: Kino koşuyor. 12. `vahsi`: Kino ormanda fil ve kurbağayla.
- **P13-4 Okuma kürsüsü (1 çizim, kendi çağrısında; 1600 × 1100 şeffaf) → `oyun/acik-kitap.webp`:**
  Önden hafif yukarıdan görülen açık bir kitap; **iki sayfa da boş ve krem; sol sayfanın içi x 150…780, sağ sayfanın içi x 820…1450, ikisi de y 120…940** (sol sayfaya hikâyenin resmi, sağa cümle gelir).

## Paket 14 · Polly'nin Şarkıları, ilk şarkı: Old MacDonald (5 çizim, 2 sayfa)

Şarkı sırasında sahnede Polly şarkı söyler; sözlerde adı geçen hayvan (cow, duck, sheep) sahneye zıplar ve sesini çıkarır. Hayvanlar derslerin kelime çizimleridir; yeni çizilen yalnız sahne ve Polly'nin şarkı kareleri.

- **P14-1 Şarkı sahnesi (1 çizim, kendi çağrısında; 2000 × 1250, şeffaf değil) → `sarki/sahne-ciftlik.webp`:** çiftlikte küçük bir ahşap sahne: arkada ahır, iki yanda kırmızı perde, üstte bayrak süsleri. **Sahnenin önü (x 300…1700, y 700…1150) boş**: hayvanlar oraya zıplar. Polly sol tarafta duracak (x 80…520 boş). Pastel, sıcak, bizim çizgimiz.
- **P14-2 Polly şarkı söylüyor (tek sayfa, 4 çizim; 540 × 500 şeffaf, `kisi/polly-konus-0` ile aynı tuval, boy, ayak hizası) → `kisi/polly-sarki-0` … `-3`:** 0: gaga açık, iki kanat yanda. 1: gaga açık, sağ kanat havada. 2: gaga kapalı, gülüyor, iki kanat havada. 3: gaga açık, sol kanat havada, hafif dans. Şapka ve dürbün kimliğiyle birebir; dört karede baş ve ayaklar aynı yerde (döngü olarak oynar).

## Paket 15 · Hayvanlar: 84 yeni hayvan (14 sayfa, sayfada 6)

Barış (20 Kasım): "3 hayvanla bitirdin… 1. derste 10–15, 2. derste 30, 3. derste 100 hayvan". Hayvan dersleri: 1. ders 12 hayvan, 2. ders 30, 3. ders 100. Elde 16 hayvan var (çiftlik 8, vahşi 8); 84 yeni çizim gerekiyor.

**Her çizim:** 800 × 800 şeffaf, `kelime/lion.webp` ve `kelime/cow.webp` ile aynı takım: kalın siyah kontur, düz renk, tek düz gölge, sevimli ama gerçek oranlı, bütün gövde görünür, yarım profil, çocuğun bir bakışta tanıyacağı en bilinen renk ve duruş. Hayvan tuvalin %80'ini doldurur, ayakları altta. Yazı, zemin, sahne yok. Yavrular (puppy, kitten, chick, lamb, calf, foal, piglet, duckling) annesinden belirgin küçük ve tombul. Yakın çiftler birbirinden ayırt edilsin: turtle (deniz kaplumbağası, yüzgeçli) · seal / walrus · rabbit / hamster · moose / deer.

**Öncelik:** H1–H3 (1. ve 2. dersin 14 hayvanı) önce, sonra sırayla.

- **H1** (1. ders): `kelime/rabbit` (tavşan), `kelime/goat` (keçi), `kelime/mouse` (fare), `kelime/donkey` (eşek), `kelime/tiger` (kaplan), `kelime/bear` (ayı)
- **H2** (2. ders): `kelime/zebra` (zebra), `kelime/panda` (panda), `kelime/penguin` (penguen), `kelime/turtle` (kaplumbağa), `kelime/crocodile` (timsah), `kelime/kangaroo` (kanguru)
- **H3** (2. ders): `kelime/hippo` (su aygırı), `kelime/butterfly` (kelebek), `kelime/dolphin` (yunus), `kelime/whale` (balina), `kelime/shark` (köpekbalığı), `kelime/octopus` (ahtapot)
- **H4** (3. ders · Deniz): `kelime/crab` (yengeç), `kelime/starfish` (deniz yıldızı), `kelime/seal` (fok), `kelime/jellyfish` (denizanası), `kelime/seahorse` (denizatı), `kelime/walrus` (mors)
- **H5** (3. ders · Kuşlar): `kelime/owl` (baykuş), `kelime/parrot` (papağan), `kelime/eagle` (kartal), `kelime/flamingo` (flamingo), `kelime/peacock` (tavus kuşu), `kelime/swan` (kuğu)
- **H6** (3. ders · Kuşlar): `kelime/ostrich` (devekuşu), `kelime/pigeon` (güvercin), `kelime/rooster` (horoz), `kelime/turkey` (hindi), `kelime/goose` (kaz), `kelime/toucan` (tukan)
- **H7** (3. ders · Kuşlar): `kelime/crow` (karga), `kelime/woodpecker` (ağaçkakan), `kelime/bee` (arı), `kelime/ant` (karınca), `kelime/ladybug` (uğur böceği), `kelime/spider` (örümcek)
- **H8** (3. ders · Böcekler): `kelime/snail` (salyangoz), `kelime/worm` (solucan), `kelime/caterpillar` (tırtıl), `kelime/dragonfly` (yusufçuk), `kelime/grasshopper` (çekirge), `kelime/beetle` (böcek)
- **H9** (3. ders · Orman): `kelime/fox` (tilki), `kelime/wolf` (kurt), `kelime/deer` (geyik), `kelime/squirrel` (sincap), `kelime/hedgehog` (kirpi), `kelime/raccoon` (rakun)
- **H10** (3. ders · Orman): `kelime/bat` (yarasa), `kelime/beaver` (kunduz), `kelime/skunk` (kokarca), `kelime/otter` (su samuru), `kelime/rhino` (gergedan), `kelime/camel` (deve)
- **H11** (3. ders · Vahşi doğa): `kelime/cheetah` (çita), `kelime/leopard` (leopar), `kelime/gorilla` (goril), `kelime/koala` (koala), `kelime/polar-bear` (kutup ayısı), `kelime/sloth` (tembel hayvan)
- **H12** (3. ders · Vahşi doğa): `kelime/lizard` (kertenkele), `kelime/chameleon` (bukalemun), `kelime/meerkat` (mirket), `kelime/llama` (lama), `kelime/ox` (öküz), `kelime/moose` (sığın)
- **H13** (3. ders · Yavrular ve evcil): `kelime/lamb` (kuzu), `kelime/puppy` (yavru köpek), `kelime/kitten` (yavru kedi), `kelime/chick` (civciv), `kelime/pony` (midilli), `kelime/bull` (boğa)
- **H14** (3. ders · Yavrular ve evcil): `kelime/hamster` (hamster), `kelime/goldfish` (japon balığı), `kelime/duckling` (ördek yavrusu), `kelime/calf` (buzağı), `kelime/piglet` (domuz yavrusu), `kelime/foal` (tay)

## Paket 16 · Hayvanat Bahçesi'nin altı bölümü (6 sahne, her biri kendi çağrısında)

Çiftlik adasının 3. dersi "100 hayvan": çocuk Hayvanat Bahçesi'nde altı bölümü gezer, her bölümde 10–14 hayvan sırayla sahneye çıkar, adları söylenir, sonra "Where is the octopus?" diye sorulur. Hayvanlar kelime çizimleridir; yeni çizilen yalnız bölüm fonları.

**Her fon:** 2000 × 1250, şeffaf değil, bizim pastel düz renkli çizgimiz, kalın siyah kontur. **Ortadaki geniş alan (x 160…1840, y 260…1180) sade ve açık renkli kalır**: kod hayvanları oraya ızgara gibi dizer; orada nesne, desen, yazı yok. Kenarlarda ve üstte o yerin havası:
- `sahne/bahce-deniz`: deniz altı; açık turkuaz su, kenarlarda mercan ve deniz yosunu, üstte ışık huzmeleri, kabarcıklar.
- `sahne/bahce-kus`: açık mavi gökyüzü, kenarlarda iki büyük ağaç dalı, birkaç bulut.
- `sahne/bahce-bocek`: bahçe; açık yeşil çimen zemin, kenarlarda iri çiçekler ve yapraklar.
- `sahne/bahce-orman`: orman; kenarlarda ağaç gövdeleri ve çalılar, açık yeşil-bej zemin.
- `sahne/bahce-vahsi`: savan ve dağ eteği; kenarlarda akasya ağacı, kaya, uzakta tepe; açık bej zemin.
- `sahne/bahce-yavru`: çiftlik yuvası; kenarlarda saman balyaları ve ahşap çit, açık pembe-krem zemin.

## Paket 31 · Masal 2.0: iki pilot masal (16 çizim, 4 sayfa, sayfada 4)

Barış (22 Kasım): "masal çok zayıf kalmış; önce güzel bir hikâye, sonra oyun". Masallar 4 cümlelik özet olmaktan çıkıp 6 sayfalık gerçek bir hikâye oluyor: mekân → karşılaşma → küçük aksilik → çocuğun dokunarak yardım ettiği an → sıcak çözüm → gülüşlü kapanış. Dosyalar `assets/ingilizce/masal2/` içine.

**Her çizim:** 1600 × 1200 (4:3), şeffaf değil, bizim pastel düz renkli çizgimiz, kalın siyah kontur; Kino güncel (çizgi film) modelinde, Polly `kisi/polly-konus-0` ile aynı kimlikte. Yazı yok. **Konumlar aşağıdaki kutulara uymalı** (kod o bölgelere dokununca ses ve kıpırtı verir): kutular sol üst köşeden piksel.

**Masal A · "Kino at the Lake" (çiftlik gölü; 8 çizim) → `masal2/gol-1…6`, `gol-4b`, `gol-saka`:**
1. `gol-1`: Kino, başında **kocaman mavi şapkayla** çiftlikte göle giden patikada yürüyor; güneşli. Şapka x 560–900, y 150–420.
2. `gol-2`: Çimende **kocaman bir inek** otluyor, Kino ona bakıp gülüyor; arkada göl. İnek x 820–1450, y 420–1000.
3. `gol-3`: Rüzgâr (rüzgâr çizgileri) Kino'nun mavi şapkasını uçuruyor; şapka havada göle doğru. Kino şaşkın, patileri başında. Şapka x 1050–1350, y 250–480.
4. `gol-4`: Kino göl kıyısında, suya bakıyor; şapka görünmüyor; **gölün ortasında halkalanan su** (x 600–1200, y 650–950), henüz kimse yok.
5. `gol-4b`: Aynı sahne, aynı açı: gölün ortasından **küçük sarı bir ördek** fırlamış, başında Kino'nun mavi şapkası; su sıçrıyor. Ördek x 700–1050, y 550–950.
6. `gol-5`: Ördek kıyıda, gagasıyla şapkayı Kino'ya uzatıyor; Kino sevinçli. Ördek x 900–1250, y 650–1000.
7. `gol-6`: Kino (şapkası başında), inek ve ördek birlikte el (kanat, kuyruk) sallıyor; gün batımına doğru sıcak ışık.
8. `gol-saka`: **`gol-4b`'nin aynısı**, tek fark: ördeğin başında şapka yerine **koca sarı bir muz** var (komik hata). Muz x 760–1000, y 520–700.

**Masal B · "The Picnic" (piknik; 8 çizim) → `masal2/piknik-1…6`, `piknik-4b`, `piknik-saka`:**
1. `piknik-1`: Kino ve Polly çimende kareli bir örtünün üstünde, ortada kapalı piknik sepeti; güneşli park.
2. `piknik-2`: Kino sepeti açmış, elinde **kırmızı bir elma**, örtüde **bir muz**. Elma x 560–760, y 380–600; muz x 900–1200, y 760–930.
3. `piknik-3`: Polly sepetin içine bakıyor, **sepet boş**; Polly kanatlarını açmış, şaşkın. (Havuç gitmiş!)
4. `piknik-4`: Örtünün yanında **titreyen bir çalı** (kıpırtı çizgileri), çalının arasından turuncu bir havuç ucu görünüyor. Çalı x 1050–1500, y 500–950.
5. `piknik-4b`: Aynı sahne: çalının arkasından **küçük gri bir tavşan** çıkmış, kucağında **turuncu bir havuç**; utangaç gülüyor. Tavşan x 1080–1450, y 480–950.
6. `piknik-5`: Kino, Polly ve tavşan örtüde birlikte havuç ve elma yiyor (paylaşıyorlar).
7. `piknik-6`: Üçü birlikte gülüyor, tavşan Kino'ya sarılmış; kalpler.
8. `piknik-saka`: **`piknik-4b`'nin aynısı**, tek fark: tavşanın kucağında havuç yerine **kırmızı bir ayakkabı** var. Ayakkabı x 1150–1400, y 700–880.

**Sayfa düzeni (sayfada en çok 4):** S1 gol-1…4 · S2 gol-4b, gol-5, gol-6, gol-saka · S3 piknik-1…4 · S4 piknik-4b, piknik-5, piknik-6, piknik-saka.
**Denetim:** `-4` ile `-4b` ve `-4b` ile `-saka` üst üste konunca yalnız anlatılan şey değişmeli (aynı açı, aynı ölçek, aynı arka plan).

## Paket 32 · Polly'nin Bavulu oyunu (3 çizim, kendi çağrılarında)

Polly tatile çıkıyor; çocuk Polly'nin söylediklerini sürükleyip bavula koyuyor ("Pack an apple and a hat!"). Yanlış bir şey (inek, yatak) atılınca bavul şişip onu geri tükürüyor. Dosyalar `assets/ingilizce/oyun/bavul/` içine.
- `bavul-acik` (1600 × 1000, şeffaf): yukarıdan hafif açıyla açık turuncu bir valiz; kapak arkada dik; **iç bölme boş** ve x 300–1300, y 380–880 arasında düz açık renk astar.
- `bavul-kapali` (1600 × 1000, şeffaf): aynı valiz kapalı ve tokalı, üstünde yapışkan seyahat etiketleri; konum ve ölçek `bavul-acik`'le aynı.
- `sahne-tatil` (2000 × 1250, şeffaf değil): Polly'nin ağaç evinin önü, verandada bekleyen bavul yeri boş; sağ üçte bir sade duvar (kod eşya rafını oraya koyar).

## Paket 13 eki

- **P13-5 Ana ekran bölüm resmi (1 çizim, kendi çağrısında; 900 × 600 şeffaf) → `ui/bolum-masallar.webp`:** `ui/bolum-oyunlar` ve `ui/bolum-kelimelerim` ile aynı takım (aynı çizgi, aynı boyut ve kenar boşluğu): üst üste iki üç renkli kitap, en üstteki açık, sayfalarından küçük yıldızlar çıkıyor. Yazı yok.

## Paket 38 · Yüz hayvanın zıplama kareleri (99 hayvan × 4 kare = 396 çizim, 99 çağrı) → `assets/ingilizce/kelime/`

Barış'ın temel kuralı (KALITE-KURALLARI madde 0): "ucuza kaçma; her hareketin kendi animasyon karelerini iste". Bugün yüz hayvanın yalnız altısının çizilmiş hareketi var; öbür 94'ü tek duran resim, oyunda kodla yukarı kaydırılıyor. Hayvan Geçidi, Hayvanat Bahçesi, Bul, Fener Avı, Ne Eksik? ve şarkı: çocuğun dokunduğu ya da doğru bildiği her hayvan artık **çizilmiş karelerle** sevinip zıplayacak. Kod hazır; kareler gelince kendiliğinden oynar.

**Her hayvan için dört kare, tek çağrıda (kare tuvalde 2 × 2), sonra ayrı dosyalara:** `<ad>-z0`, `<ad>-z1`, `<ad>-z2`, `<ad>-z3` (`.webp`, saydam).
- **Tuval:** hayvanın bugünkü çizimiyle (`kelime/<ad>.webp`) **aynı ölçü** (çoğu 800 × 800; inek 1000 × 788 gibi olanlar kendi ölçüsünde).
- **z0 · duruş:** bugünkü çizimin **aynısı**: aynı poz, aynı yer, aynı ölçek. Üst üste konunca fark olmamalı.
- **z1 · toplanma:** sıçramadan hemen önce. Bacaklar bükük, gövde biraz alçalmış, gözler heyecanlı. Ayaklar yerde, taban çizgisi z0 ile aynı.
- **z2 · havada:** hareketin doruğu. Ayaklar yerden 50–60 px yukarıda, bacaklar açılmış, ağız gülüyor, kulaklar ve kuyruk havada. Tuvalden taşmasın: üstte yer azsa sıçrama 35–40 px.
- **z3 · iniş:** ayaklar yere değmiş, dizler bükük, kulaklar ve kuyruk hâlâ havada. Taban çizgisi z0 ile aynı.
- Dört karede baş ölçüsü, renkler, kontur kalınlığı ve yatay yer aynı. Tasarım bugünkü çizimle birebir (benekler, yele, boynuz, renk).
- Gölge, zemin çizgisi, hareket çizgisi, yıldız, yazı yok. Kenarda saçak ve yarı saydam leke yok; doygun kırmızı ve turuncu alanlar silinmesin (Masal-K2-A'da Kino'nun ayakkabısında olmuştu).

**Zıplamayan hayvanlarda hareket hayvanın doğasına göre** (kare sırası aynı: toplanma → doruk → dönüş):
- **Yüzenler** (fish, goldfish, tadpole, dolphin, whale, shark, seahorse, jellyfish, octopus, seal): z1 kıvrılıp toplanır; z2 yukarı doğru uzanmış sıçrayış, gövde 50–60 px yukarıda, yüzgeçler ya da kollar açık; z3 dönerken hafif kıvrık.
- **Uçanlar** (bird, butterfly, bee, dragonfly, bat, parrot, eagle, pigeon, crow, toucan, woodpecker, owl, ladybug): z1 kanatlar aşağıda ve toplu; z2 kanatlar tam açık ve yukarıda, gövde 50–60 px yükselmiş; z3 kanatlar yarı açık, inerken.
- **Ağır ve sürünenler** (snake, worm, caterpillar, snail, turtle, sloth, starfish, crab, lizard, chameleon): z1 büzülür; z2 yay gibi uzanır, baş ve boyun yukarı kalkar (kaplumbağa ve salyangozda kabuk da hafifçe kalkar; yengeç kıskaçlarını havaya kaldırır); z3 yerine otururken.

**Eski altı hayvan da baştan çizilir** (cow, duck, sheep, cat, dog, horse): bugünkü kareleri 446 × 416, küçük ve bulanık; oyunda duran resmin yerine bu küçük kare görünüyor. Yenileri duran çizimin ölçüsünde gelsin, aynı adlarla.

**Sıra (çocuğun gördüğü sırayla):**
1. **1. ders (12):** cow, duck, sheep, cat, dog, horse, chicken, bird, goat, mouse, donkey, rabbit.
2. **2. ders (17):** lion, monkey, elephant, fish, frog, giraffe, snake, tiger, bear, zebra, panda, penguin, turtle, crocodile, kangaroo, hippo, butterfly. (`pig` şimdilik çizilmez.)
3. **Hayvanat Bahçesi (70):**
   - Deniz (10): dolphin, whale, shark, octopus, crab, starfish, seal, jellyfish, seahorse, walrus.
   - Kuşlar (14): owl, parrot, eagle, flamingo, peacock, swan, ostrich, pigeon, rooster, turkey, goose, toucan, crow, woodpecker.
   - Böcekler (10): bee, ant, ladybug, spider, snail, worm, caterpillar, dragonfly, grasshopper, beetle.
   - Orman (10): fox, wolf, deer, squirrel, hedgehog, raccoon, bat, beaver, skunk, otter.
   - Vahşi (14): rhino, camel, cheetah, leopard, gorilla, koala, polar-bear, sloth, lizard, chameleon, meerkat, llama, ox, moose.
   - Yavrular (12): lamb, puppy, kitten, chick, pony, bull, hamster, goldfish, duckling, calf, tadpole, foal.

**Teslimden önce her hayvanda:** dört kareyi üst üste koy; z0 bugünkü çizimle aynı mı, taban z0, z1 ve z3'te aynı mı, z2 tuvalin içinde mi bak. %100 boyda uzuvları say (dört bacak, iki kulak, bir kuyruk; kuşta iki kanat, iki ayak). 2,5 saniyelik oynatımla (z0 → z1 → z2 → z3 → z0, kare başına 120 ms) hareket akıyor mu bak. Her ders ve her bölüm bitince tek satır yaz; İngilizce oturumu %100 boyda sayıp bağlar.

## Durum

| İş | Durum |
|---|---|
| P1-7 bölüm resimleri, P1-9 balonlar, P1-10 perde, P1-11 kart arkası, P1-12 sürpriz kutusu | **geldi, onaylandı, bağlandı (17 Kasım 03:30)** |
| P1-8 kapak, P1-13 yiyecekler adası | **geldi, onaylandı, bağlandı (17 Kasım 03:52)** |
| P1-4 … P1-6 Kino hareketleri | **tam boy geldi, onaylandı, bağlandı (17 Kasım 04:23)** |
| sahne/kapi (Kapıda Kim Var? fonu) | **geldi, onaylandı, bağlandı (09:24)** |
| P1-1 … P1-3 Ceren hareketleri | **selam, alkış, göz kapalı: geldi, onaylandı, bağlandı (20:05)** · **dinle-0/1: düzeltildi, onaylandı, bağlandı (20:35)**. Ceren'in dört hareket seti tamam. **Açık çizim işi kalmadı.** |
| P2-2 sayılar, P2-3 renkler adası, P2-4 sayılar adası | **geldi, onaylandı, bağlandı (17 Kasım 03:52)** |
| P2-1 renkler (6 kova) | **düzeltildi, onaylandı (17 Kasım 04:23)** |
| P3 ailem, hareketler; oyuncaklardan doll, kite, robot; kıyafetlerden hat, shoes, socks, pants, jacket | **geldi, onaylandı (17 Kasım 04:23)** |
| P3 taşıtlar (6), vahşi hayvanlar (6), yüzüm (6: Kino uzvunu gösteriyor), t-shirt, drum, chair, door | **yeniden çizildi, onaylandı (06:55)**; 72 kelimenin çizimi tamam |
| P4 sahne/yiyecekler (masalı), oyun/balon-turuncu | **onaylandı, bağlandı (06:55)** |
| P4 sahneler: renkler, sayilar, oyuncaklar, ailem, kiyafetler, tasitlar, hareketler | **geldi, onaylandı, kelimeler yerleştirildi (07:35)** |
| P4 odam (yataksız), vahsi (göletli), yuzum-kino (oturan Kino) | **geldi, onaylandı, bağlandı (07:56)**; on iki şenlik sahnesi tamam |
| P5 kalan sekiz ada (48 parça) | **geldi, onaylandı, haritada (07:56)**; on iki ada tamam |
| P6-1: chicken, pig, purple, black | **geldi, onaylandı, bağlandı (17 Kasım 17:50)**; çiftlik ve renkler 4 + 4 kelime |
| P6-1: water, egg | **düzeltildi, onaylandı, bağlandı (18:50)** · önceki: düzeltme istendi (17:50): water'da beyaz leke, egg krem kartta kayboluyor; dosyalar `ekip/ingilizce/duzeltme-bekleyen/` |
| P7-2: soz-gor, soz-var, soz-kalp, soz-ve | **geldi, onaylandı (17:50)** |
| P7-2: soz-sev, soz-sevme | **düzeltildi, onaylandı (18:50)** · önceki: düzeltme istendi (17:50): aynı el olmalı, bilekte yeşil / kırmızı bant |
| P6-2 … P6-4 yeni kelimeler (17) | **geldi, onaylandı, şenlik sahnelerine yerleştirildi (18:50)**; on bir ünite 4 + 4 kelime |
| P6-2: `kelime/teacher` | **geldi, onaylandı, bağlandı (20:05)**; ailem 2. dersi 4 kelime |
| P7-1 Kino beğen / beğenme, P7-3 söz simgeleri (5) | **geldi, onaylandı, bağlandı (18:10)** |
| P9-1 çiftlik hikâyesi (4) | **geldi, onaylandı, bağlandı (18:10)**; çiftliğin 2. ve 3. seviyesinin çizimi tamam, yalnız ses bekliyor |
| P8-1 … P8-8 cümle resimleri (34) | **geldi, onaylandı, bağlandı (18:50)** |
| P9-2 … P9-12 hikâyeler (44) | **geldi, onaylandı, bağlandı (18:50)**; üç seviyenin çizimi tamam, üst seviyeler yalnız ses bekliyor |
| P10-1 Polly dürbün ve dinleme kareleri (4) | **onaylandı, bağlı** (18 Kasım 05:30). Oyunda `durbun-0` ve `dinle-0` kullanılıyor; `-1` kareleri yedek. |
| P10-2 dürbün çerçevesi, P10-3 tepsi | **onaylandı, bağlı** (18 Kasım 05:30). Ölçüler birebir (iç boşluk 992, dış 1190; sekiz göz yerinde). Astra ikisini düz renkli SVG'den üretti. |
| P11-1 dört ev, P11-2 zarf, P11-3 Polly postacı (7) | **onaylandı, bağlı** (19 Kasım 19:50). Pencere 81…718 × 341…798, zarf etiketi boş, Polly'nin ayakları konuşma karesiyle aynı hizada. Oyunda `posta-0` beklerken, `posta-1` mektup eve uçarken. |
| P12-1 … P12-5 Kino'yu Giydir (12) | **onaylandı, bağlı** (20 Kasım). Sekiz giysi Kino'ya birebir oturuyor; oyun Kıyafetler adasının üç kelime dersinde açık. |
| P13-1 … P13-4 Masal Kitaplığı (14) | **onaylandı, bağlı** (20 Kasım). Kitaplık, 12 kapak ve açık kitap kullanılıyor. |
| P31 S1–S2 · Masal 2.0 göl masalı "Kino at the Lake" (8: `masal2/gol-1…6`, `gol-4b`, `gol-saka`) | **geldi (13:09), onaylandı (yönetici %100), bağlandı (22 Kasım 14:35)**. Dokunma kutuları gerçek çizimde ölçüldü; Çiftlik kitabı bu masalı açar. Piknik masalı (S3–S4) bekleniyor. |
| P37 · Masal 2.0 "Lokum at the Beach" | **durduruldu (22 Kasım akşamı).** Yerine Paket Masal-K1 (açılır kitap stil anahtar karesi, Astra sırasının başında); parçalar anahtar kare onaylanınca. |
| P13-5 ana ekran "Masallar" bölüm resmi (1) | **onaylandı, bağlı** (20 Kasım 03:20). Oyunlar ve Kelimelerim resimleriyle aynı takım; tablette ve telefonda okunuyor. |
| P14-1 şarkı sahnesi, P14-2 Polly şarkı kareleri (5) | **onaylandı, bağlı** (20 Kasım 15:20). Ayak hizası konuşma karesiyle aynı (488–489); dans döngüsü çalışıyor. Şarkının kendisi Barış'ın onayını bekliyor (Gemini'de de deniyor). |
| P15 H1–H14 hayvanlar (84) | **onaylandı, bağlı** (20 Kasım). 84 hayvan aynı takımda; `piglet` çıkarıldı, yerine `tadpole` (iribaş) |
| P16 Hayvanat Bahçesi bölüm fonları (6) | **onaylandı, bağlı** (20 Kasım). Ortalar boş, kenarlarda yerin havası; hayvanlar ortaya diziliyor |

## 2026-11-20 22:30 · Claude (İngilizce 13–24) → Astra · "İngilizceye Merhaba" 12 yeni ada: Paket 17–21 (toplu brief, 180 çizim)

Barış'ın talimatı (20 Kasım akşamı): "İçeriği doldur; çocuk sıfırdan İngilizce öğrenmeyi bekliyor." İngilizce 12 adadan 24 adaya çıkıyor. Her yeni ada bugünkü kalıpla gelir: 8 kelime, 9 ders, üç seviye, hikâye. Kod ve içerik yazılıyor (`ingilizce/src/icerik3.ts`); dosya doğru adla gelince ada kendiliğinden açılır. Liste `ekip/ingilizce/CIZIM-ISLERI.md`'de de aynı.

**Değişmeyen kurallar (CIZIM-ISLERI.md başı):** Minkino çizgisi (temiz 2D, düz canlı renk, temiz siyah kontur, doku ve bulanık gölge yok). Teslim `assets/ingilizce/<alt klasör>/`. Şeffaf WebP (fonlar ve hikâye kareleri opak). Yazı yok. Nesnede, taşıtta, yiyecekte yüz yok. **Çilek yok.** Elma kırmızı, armut yeşil. Yeni insan karakter yok. Karakter kimliği onaylı modelle birebir: Kino, Mino `ekip/kalite/minkino-gorsel-rehberi/pozlar/`; Ceren `assets/alfabe/ceren-konus/`; Polly `ekip/ingilizce/eski-cizimler/papagan-konus-0.webp`; Lokum `assets/sef/misafir/lokum-istek.webp`; anne, baba `kelime/mom`, `kelime/dad`.
**Teslimden önce:** her çizimi %100 boyda aç; her karakterde **el, kol, bacak, ayak, kulak, göz say** (Kino: 2 kol, 2 el, 2 bacak, 2 ayak, 2 kulak, 2 göz); dizi karelerde (hikâye, iki kareli karakter) karakterin ve nesnenin **boyunu yan yana karşılaştır**. Kusurlu çizim bağlanmaz, sayarak geri yazılır.

Adalar (no · klasör adı): 13 `meyve` Meyve ve Sebze · 14 `hava` Hava · 15 `doga` Doğa · 16 `evim` Evim · 17 `okul` Okul · 18 `duygular` Duygular · 19 `sekiller` Şekil ve Boy · 20 `sofra` Sofra · 21 `park` Park · 22 `vucudum` Vücudum · 23 `gunum` Günüm · 24 `sayilar2` Sayılar ve Renkler 2.

### Paket 17 · 96 yeni kelime (16 sayfa × 6; her biri 800 × 800 şeffaf) → `kelime/<ad>.webp`
Var olan kelime takımıyla aynı çizgi, aynı ölçek, aynı kadraj doluluğu (yanlarına konunca "aynı takım" görünmeli; örnek `kelime/apple`, `kelime/ball`, `kelime/hat`). Tek nesne, ortada, tuvalin ~%75'ini doldurur. Kino'lu kartlarda Kino onaylı modelle birebir ve Yüzüm kartlarıyla (`kelime/eyes`, `kelime/hands`) aynı kadraj.
- **P17-1:** `grapes` (yeşil üzüm salkımı) · `watermelon` (bütün karpuz, yanında bir dilim) · `cherry` (sapı birleşik iki kiraz) · `lemon` (sarı limon) · `carrot` (yapraklı havuç) · `tomato` (kırmızı domates).
- **P17-2:** `potato` (kahverengi patates) · `corn` (yaprakları açılmış mısır koçanı) · `sun` (sarı güneş, ışınlı, yüzsüz) · `rain` (gri bulut ve altında yağmur damlaları) · `snow` (yağan kar taneleri ve altta karlı küçük bir tepe) · `wind` (rüzgâr çizgileri, içinde savrulan iki yaprak).
- **P17-3:** `cloud` (beyaz kabarık bulut) · `rainbow` (gökkuşağı, iki ucu küçük bulutta) · `hot` (Kino güneşin altında terlemiş, elinde yelpaze, belden yukarı) · `cold` (Kino atkılı ve bereli, titriyor, ağzından buhar, belden yukarı) · `tree` (yeşil yapraklı ağaç) · `flower` (tek kırmızı çiçek, saplı, iki yapraklı).
- **P17-4:** `leaf` (tek yeşil yaprak) · `grass` (yeşil çim öbeği) · `river` (iki yanı yeşil kıyılı, kıvrılan mavi dere parçası) · `mountain` (tepesi karlı dağ) · `star` (sarı beş köşeli yıldız, yüzsüz) · `moon` (sarı hilal, yüzsüz).
- **P17-5:** `house` (kırmızı çatılı küçük ev, önden) · `kitchen` (mutfak köşesi: ocak, tezgâh, üstünde tencere) · `bathroom` (banyo köşesi: küvet ve lavabo) · `bedroom` (yatak odası köşesi: yatak, komodin, pencere; `kelime/bed`'den başka, oda görünümü) · `garden` (çitli küçük bahçe: çiçekler ve bir fidan) · `stairs` (ahşap merdiven, yandan üç çeyrek).
- **P17-6:** `roof` (kiremitli çatı ve bacası; evin yalnız çatısı) · `key` (sarı anahtar) · `book` (kapalı kitap, önden) · `pencil` (sarı kurşunkalem, ucu açık) · `bag` (okul sırt çantası) · `crayon` (üç mum boya: kırmızı, mavi, sarı).
- **P17-7:** `paper` (üst üste üç beyaz kâğıt) · `scissors` (çocuk makası, ucu yuvarlak) · `desk` (okul sırası) · `school` (okul binası, bayrak direkli, saat kuleli) · `happy` (Kino kocaman gülüyor) · `sad` (Kino üzgün, tek gözyaşı).
- **P17-8 (Kino, belden yukarı, aynı kadraj):** `angry` (kaşlar çatık, yanaklar kızarmış, kollar kavuşturulmuş; korkutucu değil, şirin) · `sleepy` (esniyor, gözler yarı kapalı) · `hungry` (eli karnında, ağzı sulanmış, önünde boş tabak) · `thirsty` (dili dışarıda, elinde boş bardak) · `scared` (elleriyle yüzünün yarısını kapamış, gözler kocaman; korkutucu hiçbir şey yok) · `surprised` (ağız "o", kaşlar havada, iki eli yanaklarında).
- **P17-9:** `circle` (kırmızı daire, kalın ahşap oyuncak parça) · `square` (mavi kare) · `triangle` (sarı üçgen) · `heart` (pembe kalp) · `big` (yan yana büyük ve küçük oyuncak ayı; büyüğün çevresinde vurgu çizgileri) · `small` (aynı ikili, bu kez küçüğü vurgulu).
- **P17-10:** `long` (yerde uzun yeşil yılan oyuncak ve yanında kısa olanı; uzunu vurgulu) · `short` (aynı ikili, kısası vurgulu) · `plate` (boş beyaz tabak, üstten hafif eğik) · `cup` (kulplu mavi fincan) · `spoon` (kaşık) · `fork` (çatal).
- **P17-11:** `bowl` (boş kâse) · `juice` (bardakta portakal suyu, pipetli) · `soup` (kâsede dumanı tüten çorba) · `cake` (pembe kremalı küçük pasta, mumsuz) · `slide` (çocuk kaydırağı) · `swing` (tek kişilik salıncak, iki ip ve oturak).
- **P17-12:** `seesaw` (iki kişilik tahterevalli, boş) · `sand` (kum yığını, üstünde küçük bir kale) · `bucket` (kırmızı kum kovası) · `shovel` (mavi kum küreği) · `bench` (park bankı) · `fountain` (taş çeşme / küçük süs havuzu, fışkıran su).
- **P17-13 (Kino, Yüzüm kartlarıyla aynı düzen: o uzvu gösteriyor):** `arms` (Kino iki kolunu yana açmış, tam boy) · `fingers` (Kino bir elini açmış, beş parmağı belirgin; yakın) · `tummy` (Kino iki eliyle karnını tutuyor) · `knees` (Kino eğilip iki eliyle dizlerine dokunuyor, tam boy) · `shoulders` (Kino iki eliyle omuzlarına dokunuyor) · `toes` (Kino'nun iki ayağı yakın, parmaklar belirgin).
- **P17-14:** `hair` (Kino saçını tarıyor) · `teeth` (Kino kocaman gülümseyip dişlerini gösteriyor) · `wake-up` (Kino yatakta doğrulmuş, gerinip esniyor) · `wash` (Kino lavaboda yüzünü yıkıyor, su damlaları) · `brush` (Kino dişlerini fırçalıyor) · `read` (Kino oturmuş kitap okuyor).
- **P17-15 (eylemler tam boy, öbür hareket kartlarıyla aynı ölçek):** `draw` (Kino kâğıda boya kalemiyle çiziyor) · `sing` (Kino ağzı açık şarkı söylüyor, yanında iki nota) · `play` (Kino topla oynuyor) · `hug` (Kino oyuncak ayısına sarılıyor) · `nine` · `ten` (`one`…`eight` ile aynı ahşap rakam biçimi; altında o sayı kadar küçük sarı yıldız, iki sıra).
- **P17-16:** `eleven` · `twelve` (aynı rakam biçimi, iki basamak yan yana; altında yıldızlar iki sıra) · `white` · `brown` · `gray` · `gold` (öbür renklerle aynı boya kovası, yalnız renk değişir; altın parlak sarı-turuncu ve tek parlama lekesi).

### Paket 18 · 12 yeni ada (her ada kendi sayfasında, 6 çizim; ada kuralı) → `ada/<ada>-<parça>.webp`
**Ada kuralı (aynen):** bütün parçalar aynı tuvalde, **1000 × 900 şeffaf**; her parça sahnedeki kendi yerinde çizilir, dosyalar üst üste konunca sahne tamamlanır. Ada zemini çizilmez. Dolu alan **yatayda 85–910, dikeyde 243–842**; sahne tabanı 842. pikselde biter. `-set` hareketsiz dekor; `-0` / `-1` aynı karakterin iki karesi (yeri aynı, yalnız oynayan uzuv değişir; iki karede boy birebir aynı); öbürleri tek parça, kodla oynar. Örnek: `ekip/ingilizce/eski-cizimler/adalar/ahir-set.webp`, `ahir-koyun-0.webp`.
- **P18-1 `meyve`:** `meyve-set` (küçük bostan: havuç ve mısır sıraları, bir domates fidesi, sepet) · `meyve-mino-0` / `-1` (Mino eğilmiş havuç çekiyor / havucu havaya kaldırmış) · `meyve-karpuz` (yerde yuvarlanacak karpuz) · `meyve-kelebek` (fidenin üstünde kelebek) · `meyve-limon` (sepetten düşecek limon).
- **P18-2 `hava`:** `hava-set` (çimenli tepe, üstünde rüzgâr gülü ve küçük bir ev) · `hava-kino-0` / `-1` (Kino şemsiye tutuyor: şemsiye kapalı / açık) · `hava-bulut` (kayacak bulut) · `hava-gunes` (dönecek güneş, yüzsüz) · `hava-gokkusagi` (alçak gökkuşağı).
- **P18-3 `doga`:** `doga-set` (dere kenarı, iki ağaç, kayalar ve çiçekler) · `doga-mino-0` / `-1` (Mino derede taştan taşa atlıyor: hazırlanıyor / havada) · `doga-yaprak` (süzülecek yaprak) · `doga-kurbaga` (taşta zıplayacak kurbağa; `kelime/frog` ile aynı) · `doga-ay` (ağacın üstünde hilal, yüzsüz).
- **P18-4 `evim`:** `evim-set` (iki katlı küçük ev, kesit gibi önü açık: mutfak, banyo, yatak odası, merdiven görünür) · `evim-kino-0` / `-1` (Kino merdivende: alt basamakta / üst basamakta, el sallıyor) · `evim-kapi` (açılıp kapanacak kapı kanadı) · `evim-baca-duman` (bacadan çıkan duman) · `evim-anahtar` (kapıda asılı sallanan anahtar).
- **P18-5 `okul`:** `okul-set` (okul bahçesi: okul binası, bayrak direği, iki sıra) · `okul-ceren-0` / `-1` (Ceren Öğretmen tahtanın önünde: eli aşağıda / el sallıyor; onaylı model) · `okul-zil` (sallanacak okul zili) · `okul-canta` (sıranın yanında düşecek çanta) · `okul-ucak` (kâğıt uçak).
- **P18-6 `duygular`:** `duygular-set` (oyun odası köşesi: koltuk, ayna, renkli halı) · `duygular-kino-0` / `-1` (Kino aynanın karşısında: gülüyor / şaşırmış yüz) · `duygular-balon` (tavana yükselecek kalp balon) · `duygular-ayi` (koltukta oyuncak ayı) · `duygular-yildiz` (aynada parlayan yıldız).
- **P18-7 `sekiller`:** `sekiller-set` (blok masası: üstünde daire, kare, üçgen bloklardan yarım bir kule) · `sekiller-mino-0` / `-1` (Mino üçgen bloğu tutuyor: aşağıda / kulenin tepesine koyuyor) · `sekiller-kalp` (zıplayacak kalp blok) · `sekiller-daire` (yuvarlanacak daire) · `sekiller-kare` (düşecek kare).
- **P18-8 `sofra`:** `sofra-set` (piknik örtülü masa: tabak, bardak, kâse) · `sofra-lokum-0` / `-1` (Lokum masada: kaşığı tutuyor / kaşığı ağzında; onaylı model) · `sofra-pasta` (masanın ortasında pasta) · `sofra-dumani` (çorbadan yükselen buhar) · `sofra-kus` (masanın kenarına konan küçük kuş).
- **P18-9 `park`:** `park-set` (kaydırak, salıncak direği, kum havuzu) · `park-kino-0` / `-1` (Kino kaydırağın tepesinde / kayarken) · `park-salincak` (sallanacak boş salıncak oturağı) · `park-top` (kum havuzunda zıplayacak top) · `park-cesme` (fışkıran çeşme suyu).
- **P18-10 `vucudum`:** `vucudum-set` (dans pisti: renkli zemin karoları, küçük hoparlör, ayna) · `vucudum-kino-0` / `-1` (Kino dans ediyor: kollar yukarıda / dizler bükük, eller dizlerde) · `vucudum-nota` (uçuşacak nota) · `vucudum-isik` (dönecek disko topu, yüzsüz) · `vucudum-yildiz` (parlayacak yıldız).
- **P18-11 `gunum`:** `gunum-set` (yatak odası: yatak, pencere, komodinde çalar saat) · `gunum-kino-0` / `-1` (Kino yatakta: uyuyor / doğrulup geriniyor) · `gunum-gunes` (pencerede doğan güneş, yüzsüz) · `gunum-saat` (çalarken sallanacak çalar saat) · `gunum-kus` (pencereye konan kuş).
- **P18-12 `sayilar2`:** `sayilar2-set` (boya atölyesi rafı: dokuz boya kovası iki sırada, sehpada tuval) · `sayilar2-mino-0` / `-1` (Mino kovaları sayıyor: bir parmak / iki eli açık, on parmak) · `sayilar2-firca` (sallanacak fırça) · `sayilar2-yildiz` (tuvalden fırlayacak altın yıldız) · `sayilar2-damla` (fırçadan damlayan beyaz boya).

### Paket 19 · 12 konuşan resim sahnesi (her biri kendi çağrısında; 1672 × 941 opak) → `sahne/<ada>.webp`
Şenlik dersinde altı kelime tek sahnede buluşur. Sahne **boş fon** çizilir (kelime resimleri üstüne kodla konur): ortası ve alt yarısı boş, sade. Örnek `sahne/ciftlik.webp`.
`sahne/meyve` (bostan ve çit) · `sahne/hava` (açık tepe, geniş gökyüzü) · `sahne/doga` (dere kıyısı açıklığı) · `sahne/evim` (evin önü ve bahçe) · `sahne/okul` (sınıf: tahta ve duvar) · `sahne/duygular` (oyun odası duvarı ve halı) · `sahne/sekiller` (blok masası ve duvar) · `sahne/sofra` (mutfak masası) · `sahne/park` (park çimeni ve yol) · `sahne/vucudum` (dans salonu zemini) · `sahne/gunum` (yatak odası) · `sahne/sayilar2` (resim atölyesi duvarı).

### Paket 20 · Seviye 2'nin cümle resimleri (2 sayfa × 6; 800 × 800 şeffaf)
Aynı sayfadaki çizimler yalnız cümlede değişen şeyle ayrılır; gerisi birebir aynı (aynı Kino, aynı ölçek, aynı kadraj).
- **P20-1 Evim · yer → `eylem/`:** `kino-in-kitchen` (Kino mutfakta, tencereyi karıştırıyor) · `kino-in-bathroom` (Kino küvette köpükler içinde) · `kino-in-bedroom` (Kino yatağında oturmuş) · `kino-in-garden` (Kino bahçede çiçek suluyor). Odalar `kelime/kitchen`, `bathroom`, `bedroom`, `garden` ile aynı. · **Park:** `kino-on-slide` (kaydıraktan kayıyor) · `kino-on-swing` (salıncakta).
- **P20-2 Park · Okul:** `eylem/kino-on-seesaw` (tahterevallinin bir ucunda, öbür ucu havada boş) · `eylem/kino-in-sand` (kum havuzunda kovayla oynuyor). Park araçları `kelime/slide`, `swing`, `seesaw`, `sand` ile aynı. · `renkli/crayon-red`, `renkli/crayon-blue`, `renkli/crayon-yellow`, `renkli/crayon-green` (`kelime/crayon`'daki tek mum boya, yalnız renk değişir).

### Paket 21 · 12 hikâye (her hikâye kendi sayfasında 4 çizim; 1200 × 900 opak, yatay) → `hikaye/<ada>-<1…4>.webp`
Kamera rehberi (`ekip/film/KAMERA-REHBERI.md`): bir hikâyenin dört resmi aynı fon, aynı ölçek; değişen yalnız cümlede anlatılan şey. 300 px genişlikte de ayırt edilebilir; ana öğe büyük ve ortada. Yazı yok. **Dört karede Kino'nun (ve öbür karakterin) boyunu yan yana karşılaştır; uzuvları say.**
- **P21-1 `meyve` · The Big Salad:** bostan. 1 "Kino is in the garden." (Kino sepetle bostanda) · 2 "He picks a carrot." (havucu çekiyor) · 3 "He picks a tomato." (domatesi koparıyor) · 4 "Yummy! A big salad." (masada kocaman salata kâsesi, Kino mutlu).
- **P21-2 `hava` · Rain, Rain!:** evin önündeki çimen. 1 "It's sunny. Kino plays outside." (güneş, Kino topla) · 2 "Oh! A big cloud." (kocaman bulut güneşi kapatıyor, Kino yukarı bakıyor) · 3 "It's rainy now." (yağmur, Kino şemsiyesini açmış) · 4 "Look! A rainbow!" (gökkuşağı, Kino şemsiyesini kapatmış, sevinçli).
- **P21-3 `doga` · Night by the River:** dere kıyısı, akşamdan geceye. 1 "Kino walks by the river." · 2 "He sees a big tree." (ağacın dibinde başı yukarıda) · 3 "Look! The moon and the stars." (gece, hilal ve yıldızlar) · 4 "Good night, river!" (Kino el sallıyor, ay suya yansımış).
- **P21-4 `evim` · Where is the Key?:** evin içi (önü açık kesit, Paket 18 `evim-set` gibi). 1 "Kino can't find his key." (elleri iki yana açık) · 2 "Is it in the kitchen? No!" (mutfakta arıyor, boş) · 3 "Is it in the garden? No!" (bahçede arıyor, boş) · 4 "It's on the roof! Thank you, Polly!" (Polly anahtarı gagasında çatıdan getiriyor).
- **P21-5 `okul` · Kino Goes to School:** okul bahçesi ve sınıf (aynı ölçek). 1 "Kino goes to school." (çantası sırtında okul kapısında) · 2 "He sits at his desk." · 3 "He draws with a crayon." · 4 "Hello, teacher! I love school!" (Ceren Öğretmen'e el sallıyor).
- **P21-6 `duygular` · Kino's Feelings:** salon. 1 "Kino is sleepy." (koltukta esniyor) · 2 "Now he is hungry." (eli karnında) · 3 "He eats. Now he is happy." (masada yemek yemiş, gülüyor) · 4 "Surprise! Polly has a cake!" (Polly pastayla geliyor, Kino şaşkın ve mutlu).
- **P21-7 `sekiller` · Kino's Shape House:** masa ve büyük kâğıt. 1 "Kino draws a square." · 2 "He draws a triangle." (karenin üstünde üçgen) · 3 "He draws a circle." (yanında daire güneş) · 4 "Look! It's a house!" (kâğıtta şekillerden bir ev resmi, Kino gösteriyor).
- **P21-8 `sofra` · Lunch Time:** mutfak masası. 1 "It's lunch time." (masada tabaklar, Kino ve Lokum oturuyor) · 2 "Kino has soup in a bowl." · 3 "Lokum has juice in a cup." · 4 "And now… cake! Yummy!" (masada pasta, ikisi sevinçli).
- **P21-9 `park` · At the Park:** park. 1 "Kino goes to the park." · 2 "He goes down the slide. Wheee!" · 3 "He plays on the swing." · 4 "He drinks from the fountain. Bye, park!".
- **P21-10 `vucudum` · Let's Dance!:** dans pisti. 1 "Kino shakes his arms." · 2 "He touches his toes." · 3 "He bends his knees." · 4 "Shoulders up! Kino is a dancer!" (omuzlar yukarıda, kocaman gülüyor).
- **P21-11 `gunum` · From Morning to Night:** Kino'nun odası (pencereden gün ışığı → akşam). 1 "Kino wakes up." · 2 "He reads a book." · 3 "He sings with Polly." · 4 "He hugs Mom. Good night!" (annesi onu yatağına yatırıyor, sarılıyorlar).
- **P21-12 `sayilar2` · Counting Stars:** evin bahçesi, gece. 1 "It's night. Kino looks up." · 2 "One, two, three… nine stars!" (gökte dokuz yıldız) · 3 "Ten, eleven, twelve!" (on iki yıldız) · 4 "Look! A gold star. Make a wish, Kino!" (büyük altın yıldız kayıyor, Kino gözleri kapalı dilek tutuyor).

**Öncelik (adalar sırayla açılsın diye):** Paket 17'nin ilk iki sayfası (Meyve ve Sebze, Hava'nın başı) → Paket 18-1, 18-2 → Paket 17 kalanı ada sırasıyla → Paket 18 kalanı → Paket 21 → Paket 19 → Paket 20. Her sayfa bitince buraya tek satır. Teşekkürler!

### Paket 22 · 12 yeni masal kitabının kapağı (2 sayfa × 6; her biri 600 × 800 şeffaf) → `kitap/<ada>.webp`
(20 Kasım 2026, Paket 17–21'in eki.) Paket 13 kapaklarının aynısı: tam karşıdan, dik duran sert kapaklı kitap; kapak adanın kendi rengindedir; ortada hikâyenin bir anı büyük ve okunur; **altta 600 × 170'lik boş açık şerit** (kitabın adını kod yazar). Yazı yok. Karakterlerde uzuv say.
- **P22-1:** `meyve` (Kino kocaman salata kâsesiyle, yanında havuç ve domates) · `hava` (Kino şemsiyesiyle gökkuşağının altında) · `doga` (dere kıyısında Kino, gökte hilal ve yıldızlar) · `evim` (Polly gagasında anahtarla çatıdan uçuyor, Kino aşağıda sevinçli) · `okul` (Kino çantası sırtında okul kapısında) · `duygular` (Kino şaşkın ve mutlu, Polly pasta getiriyor).
- **P22-2:** `sekiller` (Kino'nun kâğıda çizdiği kare, üçgen ve daireden ev resmi) · `sofra` (Kino ve Lokum sofrada pastanın başında) · `park` (Kino kaydıraktan kayıyor) · `vucudum` (Kino dans ediyor, omuzlar yukarıda) · `gunum` (Kino yatakta gerinip uyanıyor, pencerede güneş) · `sayilar2` (gece gökyüzünde altın yıldız, Kino dilek tutuyor).

### Paket 23 · "Hide & Seek with Mino" (yer bildiren sözler: in, on, under, next to) · 7 çizim, 3 sayfa → `assets/ingilizce/oyun/saklambac/`
Oyun: Mino odada saklanır, Polly "Where is Mino?" diye sorar, çocuk bulur ("Mino is under the table!"); sonra tersine döner, Polly "Put the ball on the table!" der, çocuk topu doğru yere koyar. Kod dokunma bölgelerini aşağıdaki piksel yerlerinden kurar; **eşyaların yeri ve boyu birebir bu ölçülerde olmalı** (ben yer ayarı yapmam). Karakter kimliği: Mino `ekip/kalite/minkino-gorsel-rehberi/pozlar/mino/` (turuncu tekir kedi). Minkino çizgisi, temiz siyah kontur, düz renk, yazı yok, çilek yok. **Teslimden önce el, kol, bacak, kuyruk, kulak ve göz say; Mino'nun dört saklanma pozunu oda fonunun üstüne koyup eşyaya oturduğunu kontrol et.**

**P23-1 · Oda fonu (1 çizim, kendi tam çözünürlüklü çağrısında)** → `oda.webp`, 1600 × 900 opak.
Sıcak, sade bir çocuk odası; açık duvar, düz döşeme. Yer çizgisi (duvarla döşemenin birleştiği değil, eşyaların bastığı ön zemin) **y = 810**. Soldan sağa:
- **Sandalye** x 64–256: oturağın üst yüzü y 520, arkalık tepesi y 260, ayaklar y 810'a basar. **Sandalyenin sağı x 272–448 boş döşeme** (Mino burada "sandalyenin yanında" durur).
- **Masa** x 480–864: tabla üst yüzü y 470 (tabla düz ve boş), dört ayak y 810'a basar; **masanın altı x 528–816, y 520–810 boş** (Mino burada).
- **Oyuncak kutusu** (açık, kapaksız karton ya da ahşap) x 928–1120: ön üst kenarı y 600, tabanı y 810; içi koyu ve boş görünür.
- **Yatak** x 1184–1584: şiltenin üst yüzü y 560, sağda yastık, üstünde düz renk battaniye; yatağın üstü boş.
Duvarda yatağın üstünde bir pencere olabilir; dokunma bölgeleri (yukarıdaki boş alanlar) sade kalsın, başka eşya yok.

**P23-2 · Mino'nun dört saklanma pozu (4 çizim, tek sayfa; her biri 1600 × 900 şeffaf, oda fonuyla aynı tuval)** → `mino-kutuda.webp`, `mino-masa-altinda.webp`, `mino-yatakta.webp`, `mino-sandalye-yaninda.webp`
Her poz odanın üstüne konunca eşyaya oturur; Mino tam görünmez, **saklanmış ama bulunabilir**: kulakları, gözleri ve kuyruğu seçilir, muzip bakar.
- `mino-kutuda`: kutunun içinden yalnız başı, iki kulağı ve iki ön patisi kutunun ön kenarının (y 600) üstünden görünür; x 960–1090.
- `mino-masa-altinda`: masanın altında döşemede çömelmiş (y 810'a basar), x 580–780; kuyruğu masa ayağının yanından dışarı sarkar.
- `mino-yatakta`: battaniyenin altında kıvrılmış, battaniye kabarık; yalnız iki kulak ve kuyruk ucu dışarıda, x 1260–1500, şiltenin üstü (y 560) üstünde.
- `mino-sandalye-yaninda`: sandalyenin sağında döşemede (y 810'a basar), sandalye ayağının arkasından başını uzatmış, x 280–440.

**P23-3 · Bulununca ve oyuncaklar (3 çizim, tek sayfa; şeffaf)**
- `mino-buldum.webp` 600 × 600: Mino sevinçle zıplamış, iki ön patisi yukarıda, gözleri mutlu, "buldun beni!" der gibi. Ayak tabanı y 580.
- `top.webp` 300 × 300: kırmızı-sarı iki renkli oyuncak top, yüz yok.
- `ayi.webp` 300 × 300: kahverengi pelüş oyuncak ayı, oturur; Mino ile karışmasın (sade, yüzü yalnız iki nokta göz ve küçük burun).

## 2026-11-21 00:40 · Claude (İngilizce ada oyunları) → Astra · Paket 25 ve 26

Evim, Duygular ve Günüm adalarının yeni oyunları yeni çizim istemiyor; onlar Paket 17 ve 20 çizimleriyle açılır. Yalnız iki oyun için çizim gerekiyor. "Paket 24" Ağaç Evi'ne ayrıldı, bu yüzden numaralar 25 ve 26.
**Her teslimden önce:** her karakterde el, kol, bacak, ayak, kulak ve göz say; aynı tuvaldeki pozlarda karakterin boyunu ve tabağın boyunu üst üste koyup karşılaştır. Kino ve Lokum'un boy oranı `ekip/kalite/minkino-gorsel-rehberi/boy-oranlari.json`'daki gibi.

### Paket 25 · Polly's Weather Window (Hava adası) · 3 çizim, tek sayfa → `assets/ingilizce/oyun/hava/`
Oyun: perde kapalı, çocuk pencereye dokununca iki perde kanadı yana kayar; camın arkasında havanın resmi (güneş, yağmur, kar; Paket 17 kelime resimleri) görünür. Sonra Kino'ya o havaya uygun giysi giydirilir (Kino'yu Giydir çizimleri, Paket 12).
Üçü de **1200 × 900 şeffaf, aynı tuval**; üst üste konunca birebir oturur.
- `pencere.webp`: tam karşıdan ahşap pencere çerçevesi (krem boyalı, sıcak ton), ortada dikey kayıt ve **cam alanı tamamen şeffaf** (kod arkasına hava resmini koyar). Cam alanı: **x 96–1104, y 81–801** (dış çerçeve bu dikdörtgenin dışında; içeride yalnız ince orta kayıt x 588–612). Alt pervaz y 801–900 arası, üstünde küçük bir saksı olabilir (yüzsüz). Yazı yok.
- `perde-sol.webp`: camın sol yarısını kapatan perde kanadı, x 60–620, y 40–830; üstte perde rayında halkalar. Açık pembe ya da açık sarı, sade desen (küçük noktalar). Kanat düz, toplanmamış (kod kaydırarak açar).
- `perde-sag.webp`: sağ kanat, aynası: x 580–1140. İki kanat ortada x 580–620'de biraz üst üste biner.

### Paket 26 · Lokum's Snack Picnic (Sofra adası) · 4 çizim, 2 sayfa → `assets/ingilizce/oyun/piknik/`
Oyun: Lokum piknik örtüsünde boş tabağıyla oturur; Polly "Lokum wants a big apple." der, çocuk doğru yiyeceği (büyük ya da küçük) seçer, yiyecek tabağa uçar, Lokum yer ve sevinir.
Dördü de **1600 × 900, aynı tuval**. Lokum onaylı modeliyle (`assets/dedektif-yeni/lokum.webp`), beyaz tüyü yeşil çimden ve örtüden ayrılsın.
- **P26-1 · `fon.webp` (opak, kendi çağrısında):** parkta güneşli çimen; ortada ekose (kırmızı-beyaz) piknik örtüsü, arkada uzak ağaçlar ve açık gökyüzü. **Örtünün üstünde tek bir boş beyaz tabak, ortası (1000, 700), çapı 210 px** (kod yiyeceği tabağın üstüne koyar). Örtünün sol yarısı (x 120–760) Lokum'a boş kalır; başka yiyecek, sepet ya da bardak yok (çocuk yalnız tabağa baksın).
- **P26-2 · Lokum'un üç pozu (3 çizim, tek sayfa; şeffaf, fonla aynı tuval):** Lokum örtünün sol yarısında oturur, ayakları/kalçası y 760 çizgisine basar, gövdesi x 240–700 arasında, yüzü tabağa (sağa) dönük. Üç pozda **boy, yer ve oturuş aynı**; yalnız yüz ve ön patiler değişir.
  - `lokum-bekler.webp`: iki ön pati önde, merakla tabağa bakıyor, ağız kapalı, kulaklar dik.
  - `lokum-yiyor.webp`: bir ön patisi tabağa doğru uzanmış (tabağın kenarına, x ≈ 900, değiyor), ağzı açık, mutlu bir lokma anı.
  - `lokum-mutlu.webp`: iki ön patisi göğsünde, gözleri mutlulukla kısılmış, kocaman gülümseme; tabağa uzanmıyor.
  Sayım: iki göz, iki kulak, dört ayak (oturuşta arka ikisi kalçanın yanında, ön ikisi görünür), bir kuyruk.

## 2026-11-21 · Claude (İngilizce, Ağaç Evi) → Astra · Paket 24 · Polly'nin Yaşayan Ağaç Evi

Oyun: ana ekrandan girilen ağaç evi. Çocuk her adayı bitirince eve bir eşya gelir (24 ada = 24 eşya). Eşyaya dokununca öbür durumuna geçer ve Polly kısa bir İngilizce cümle söyler ("Turn on the lamp!"); ikinci dokunuşta eski haline döner. Puan ya da mağaza yok. **Evde hiçbir yerde insan figürü yok** (resimde, kartta, aynada da yok); çilek ve domuz yok.
**Her teslimden önce:** her karakterde el, kol, bacak, ayak, kulak ve göz say; gövde bütün mü bak. Bir eşyanın iki durumunu üst üste koy: **eşyanın boyu, yeri ve tabanı iki durumda birebir aynı**, değişen yalnız tarif edilen şey. Duran eşyaların tabanı tuvalin alt kenarına değer (aşağıdaki çizgiye oturur); bütün duran eşyalar kendi çizgisinde aynı hizada.

### P24-1 · Ağaç evinin içi (1 çizim, kendi tam çözünürlüklü çağrısında) → `assets/ingilizce/agac-evi/fon.webp`, 1920 × 1080 opak
Sıcak, ahşap bir ağaç evi odası; duvarlar açık bal rengi tahta, tavan kirişleri, yer yer dallar ve yapraklar. Sade ve aydınlık; eşyalar sonradan kodla konacağı için **aşağıdaki eşya yerleri boş duvar / boş zemin** kalır (orada başka eşya, desen ya da gölge yok).
- **Döşeme çizgisi y 1010** (eşyaların bastığı ön zemin; altı 1010–1080 döşeme tahtası).
- **Sol raf:** tahta raf, üst yüzü **y 620**, x 240–720.
- **Sağ raf:** tahta raf, üst yüzü **y 620**, x 1220–1890.
- **Alçak masa:** üst yüzü **y 870**, x 900–1160, ayakları döşemeye (y 1010) basar; masanın üstü boş.
- **Polly'nin tüneği:** tavandan iki iple sarkan yatay tahta çubuk, **y 520**, x 960–1200 (Polly bunun üstüne konar).
- Asılı eşyalar (salıncak, şekil dönencesi, yıldız fener) tavandan iner: tavan kenarı resmin üstü (y 0).
- Boş kalacak yerler (x, y, genişlik, yükseklik): aşağıdaki tabloda her eşyanın satırı.

### P24-2 · Polly ve menü kartı (3 çizim, tek sayfa; şeffaf) → `assets/ingilizce/agac-evi/`
- `polly-0.webp` ve `polly-1.webp`: **560 × 840 aynı tuval** (fonda x 940–1220, y 140–560 alanına yarım ölçekle oturur). Polly onaylı modeliyle birebir (`assets/ingilizce/kisi/polly-selam-0.webp`: turkuaz tüy, sarı gaga, kırmızı kanat uçları, **şapkası ve dürbünü modeldeki gibi**; giysi ve donanım modelle aynı). İki ayağı tuval y 760'ta (tünek çubuğunun üstü) tutunur. `polly-0`: kanatlar kapalı, gülümsüyor, odaya bakıyor. `polly-1`: bir kanadı açık, gagası açık, konuşuyor ve seviniyor. İki pozda boy, ayak yeri ve tünek tutuşu aynı. Sayım: iki göz, iki kanat, iki ayak (her ayakta parmaklar), bir gaga.
- `kart.webp` 600 × 600: ana ekran düğmesi için ağaç evinin dışarıdan görünüşü: kalın gövdeli ağacın dallarında küçük ahşap ev, yuvarlak penceresinde Polly'nin başı; yazı yok, kenarlarda boşluk.

### P24-3 … P24-10 · 24 eşya × 2 durum (8 sayfa, her sayfada 3 eşya × 2 durum = 6 çizim; şeffaf) → `assets/ingilizce/agac-evi/<eşya>-0.webp` ve `-1.webp`
Her eşyanın iki durumu **aynı tuvalde** çizilir; tuval fondaki yerin **iki katı** ölçüdedir (kod yarıya küçültüp yerine koyar). "0" ev açılınca görünen hal, "1" dokununca geçtiği hal. Eşyalar oyuncak gibi sevimli, kalın çizgili, okunur; küçük olanlar da 300 px'te seçilir.

| Sayfa | Ada | Dosya | Eşya | Fondaki yer (x, y, g, y) | Tuval | Taban | 0 | 1 |
|---|---|---|---|---|---|---|---|---|
| P24-3 | 1 Çiftlik | `ahir` | oyuncak ahır | 40, 780, 260, 230 | 520 × 460 | döşeme (y 1010) | kapıları kapalı | kapıları açık, içinden küçük bir oyuncak inek bakıyor |
| P24-3 | 2 Renkler | `renk-lambasi` | renk lambası | 1500, 440, 120, 180 | 240 × 360 | raf çizgisi (y 620) | sönük, şeffaf küre | yanıyor: küre kırmızı, mavi ve sarı ışık saçıyor |
| P24-3 | 3 Sayılar | `kup-kule` | sayı küpleri | 1640, 420, 120, 200 | 240 × 400 | raf çizgisi (y 620) | beş küp tabanda dağınık yığın | beş küp üst üste kule, üzerlerinde 1–5 rakamları |
| P24-4 | 4 Yiyecekler | `meyve-kasesi` | meyve kâsesi | 1180, 910, 140, 100 | 280 × 200 | döşeme (y 1010) | boş kâse | kâsede bir elma, bir muz, bir armut |
| P24-4 | 5 Oyuncaklar | `davul` | davul | 500, 500, 110, 120 | 220 × 240 | raf çizgisi (y 620) | iki baget davulun üstünde çapraz duruyor | bir baget davula vuruyor, üstünde iki nota uçuyor |
| P24-4 | 6 Ailem | `kart` | anneye kart | 1380, 500, 100, 120 | 200 × 240 | raf çizgisi (y 620) | kapalı kart, önünde küçük kalp | açık kart, içinde büyük kırmızı kalp |
| P24-5 | 7 Yüzüm | `ayna` | duvar aynası | 1260, 220, 160, 220 | 320 × 440 | duvarda asılı | sade ayna, hafif yansıma | aynada Polly’nin yüzü göz kırpıyor, köşede pırıltı |
| P24-5 | 8 Kıyafetler | `dolap` | giysi dolabı | 1640, 630, 260, 380 | 520 × 760 | döşeme (y 1010) | kapakları kapalı | kapaklar açık: askıda şapka, ceket ve atkı |
| P24-5 | 9 Odam | `gece-lambasi` | gece lambası | 1780, 460, 100, 160 | 200 × 320 | raf çizgisi (y 620) | sönük | yanıyor, sıcak sarı ışık |
| P24-6 | 10 Taşıtlar | `tren` | oyuncak tren | 250, 490, 230, 130 | 460 × 260 | raf çizgisi (y 620) | rafta duruyor | bacasından buhar bulutu, tekerlekler hızlı (hareket çizgileri) |
| P24-6 | 11 Hareketler | `muzik-kutusu` | müzik kutusu | 620, 520, 100, 100 | 200 × 200 | raf çizgisi (y 620) | kapağı kapalı | kapağı açık, üstünde dönen küçük bir yıldız, iki nota |
| P24-6 | 12 Vahşi | `fanus` | balık fanusu | 1225, 450, 140, 170 | 280 × 340 | raf çizgisi (y 620) | turuncu balık dipte duruyor | balık suyun üstüne zıplamış, baloncuklar |
| P24-7 | 13 Meyve | `sepet` | sebze sepeti | 540, 880, 160, 130 | 320 × 260 | döşeme (y 1010) | kapaklı hasır sepet, kapalı | kapak açık: havuç, domates ve mısır görünüyor |
| P24-7 | 14 Hava | `pencere` | yuvarlak pencere | 560, 140, 340, 340 | 680 × 680 | duvarda asılı | kepenkler kapalı | kepenkler açık: dışarıda gökkuşağı |
| P24-7 | 15 Doğa | `saksi` | çiçek saksısı | 1040, 670, 100, 200 | 200 × 400 | masa üstü (y 870) | yeşil kapalı tomurcuk | açmış kırmızı çiçek |
| P24-8 | 16 Evim | `kapi` | küçük kapı | 320, 650, 200, 360 | 400 × 720 | döşeme (y 1010) | kapalı, kilitte anahtar | açık: dışarıda yeşil bahçe ve çiçekler |
| P24-8 | 17 Okul | `canta` | okul çantası | 1480, 850, 140, 160 | 280 × 320 | döşeme (y 1010) | kapalı çanta | çanta açık: kitap görünüyor |
| P24-8 | 18 Duygular | `bulut` | bulut yastık | 720, 870, 160, 140 | 320 × 280 | döşeme (y 1010) | pelüş bulut uykulu (gözler kapalı) | pelüş bulut mutlu (gözler açık, gülüyor) |
| P24-9 | 19 Şekiller | `donence` | şekil dönencesi | 260, 0, 240, 300 | 480 × 600 | tavana asılı (üst kenar tavan) | tavandan sarkan daire, kare, üçgen, kalp; duruyor | şekiller dönüyor (hareket çizgileri) |
| P24-9 | 20 Sofra | `bardak` | bardak | 920, 770, 90, 100 | 180 × 200 | masa üstü (y 870) | boş bardak | bardak portakal suyuyla dolu, pipet |
| P24-9 | 21 Park | `salincak` | ip salıncak | 40, 0, 180, 560 | 360 × 1120 | tavana asılı (üst kenar tavan) | tavandan sarkan salıncak dimdik duruyor | salıncak yana savrulmuş (hareket çizgileri) |
| P24-10 | 22 Vücudum | `robot` | oyuncak robot | 1340, 790, 120, 220 | 240 × 440 | döşeme (y 1010) | kolları aşağıda | kolları yukarıda |
| P24-10 | 23 Günüm | `saat` | duvar saati | 260, 300, 140, 140 | 280 × 280 | duvarda asılı | kadranda ay ve yıldız (gece) | kadranda güneş (sabah) |
| P24-10 | 24 Sayılar 2 | `yildiz-fener` | altın yıldız feneri | 1460, 0, 180, 260 | 360 × 520 | tavana asılı (üst kenar tavan) | tavandan sarkan sönük yıldız fener | altın sarısı parlıyor, çevresine ışık |

**Öncelik:** P24-1 fon ve P24-2 Polly önce; sonra P24-3'ten başlayarak sırayla (ilk adaların eşyaları önce gelsin, çocuklar ilk onları kazanıyor).



### Paket 27 · "Polly's ABC" (İngilizce harfler ve sesleri) · 36 çizim, 7 sayfa → `assets/ingilizce/abc/`

Oyun: Polly her harfin adını ve sesini söyler ("B. /b/. B is for ball."), harf büyük görünür, o harfle başlayan resim gelir; 4 yaşta üç resimden o sesle başlayanı, 5+ yaşta büyük harfin küçüğünü bulur. Minkino çizgisi: temiz 2D, ince siyah kontur, düz renk, yazı yok (harfin kendisi dışında), çilek yok, **insan figürü yok** (harf süslerinde ve küçük resimlerde de). Karakter kimliği: Polly `ekip/ingilizce/eski-cizimler/papagan-konus-0.webp`.

**Teslimden önce, her çizim için:** harf doğru ve tek mi (yazım: büyük Latin harfi, ters ya da eksik çizgi yok); süs nesnesi doğru sözcük mü; hayvanlarda uzuv, kulak, göz, kuyruk sayısı ve gövdeye bağlı mı; insan figürü yok; köşeler ve zemin saydam (RGBA). Teslim notuna "harfler ve uzuvlar sayıldı" yaz.

**Resimli harfler** (`harf-<a…z>.webp`, her biri 800 × 800 şeffaf): **büyük harf**, kalın, yuvarlak hatlı, tuvali dolduran (kenarlarda 60 px pay), her harf başka canlı renkte; harfin gövdesi o sözcüğün nesnesiyle süslü ama harf hep okunur kalır (süs harfi kapatmaz). Sayfada 6.

**P27-1** · `harf-a` (A, apple: iki üç küçük kırmızı elma ve bir yaprak) · `harf-b` (B, ball: renkli toplar) · `harf-c` (C, cat: harfin içinden bakan turuncu bir kedi başı ve kuyruğu) · `harf-d` (D, dog: harfin kıvrımına yaslanmış küçük kahverengi köpek) · `harf-e` (E, elephant: harfin kollarında küçük gri fil ve hortumu) · `harf-f` (F, fish: harfin çevresinde yüzen iki üç küçük balık ve kabarcıklar)

**P27-2** · `harf-g` (G, goat: harfin yanında küçük beyaz keçi) · `harf-h` (H, hat: harfin tepesinde renkli şapka) · `harf-i` (I, igloo: harfin noktası küçük bir iglo, gövdesinde kar taneleri) · `harf-j` (J, jacket: harfin gövdesine asılı küçük ceket) · `harf-k` (K, kite: harfin ucundan uçan renkli uçurtma ve ipi) · `harf-l` (L, lion: harfin köşesine oturmuş küçük aslan, yelesi)

**P27-3** · `harf-m` (M, milk: harfin tepelerinde süt şişesi ve süt damlaları) · `harf-n` (N, nose: harfin üstünde sevimli bir burun (yüz yok, yalnız hayvan burnu)) · `harf-o` (O, octopus: harfin halkasına sarılmış küçük mor ahtapot) · `harf-p` (P, pig: harfin kıvrımında küçük pembe domuz) · `harf-q` (Q, quilt: harfin içi yamalı renkli yorgan deseni) · `harf-r` (R, robot: harfin yanında küçük gri robot (yüzü düz ekran))

**P27-4** · `harf-s` (S, sun: harfin kıvrımlarında güneş ve ışınları) · `harf-t` (T, train: harfin üst çizgisi raydan küçük bir tren) · `harf-u` (U, umbrella: harfin üstünde açık sarı şemsiye) · `harf-v` (V, van: harfin önünde küçük mavi minibüs) · `harf-w` (W, whale: harfin dalgalı tepelerinde küçük mavi balina ve su fışkırması) · `harf-x` (X, fox: harfin çaprazında küçük turuncu tilki)

**P27-5** · `harf-y` (Y, yo-yo: harfin kollarından sarkan iki renkli yoyo) · `harf-z` (Z, zebra: harfin çizgileri zebra deseni) · ve dört yeni sözcük resmi (800 × 800 şeffaf, kelime resimleriyle aynı kalıp: `assets/ingilizce/kelime/apple.webp` gibi tek nesne, ortada, yüz yok): `igloo` (kar bloklarından iglo, girişi önde) · `quilt` (katlanmış, renkli yamalı yorgan) · `umbrella` (açık sarı şemsiye) · `van` (yandan küçük mavi minibüs, sürücüsüz, yüz yok)

**P27-6** · `yo-yo` (800 × 800 şeffaf; iki renkli yoyo ve ipi, yüz yok) · Polly'nin iki pozu (700 × 700 şeffaf, aynı tuval, aynı ölçek, ayak tabanı y = 680): `polly-goster` (bir kanadı sağa uzanmış, yanındaki harfi gösteriyor, gagası açık "B!" der gibi) · `polly-sevin` (iki kanat yukarıda, sevinçli). Kanat ve ayak sayısı modelle aynı.

**P27-7** (kendi tam çözünürlüklü çağrısında) · `fon.webp` 1920 × 1080 opak: Polly'nin sınıfı gibi sıcak bir harf köşesi; ortada büyük, sade ve açık renkli boş bir pano (x 520…1400, y 140…780; harf ve resim buraya gelir), solda alçak bir tünek (x 120…420, y 560…820; Polly burada durur), duvarda yazısız renkli bayraklar. Pano ve tünek boş.

Her sayfa bitince `CLAUDE-ASTRA-MESAJLAR.md` sonuna tek satır. Bağlama, iPad ve telefon denetimi bende.


### Paket 28 · "Alphabet Train" (Polly's ABC içinde) · 3 çizim, tek sayfa → `assets/ingilizce/abc/`
26 harf sırayla vagonlarda; çocuk vagona dokundukça Polly harfin adını söyler; 5+ yaşta bir vagon boş gelir, çocuk eksik harfi bulur. Vagonun ön yüzüne kod Paket 27'nin resimli harflerini (`harf-a…z`) koyar. Minkino çizgisi, ince siyah kontur, düz renk, yazı ve harf yok, insan figürü yok.
- `tren-lokomotif.webp` 640 × 480 şeffaf: sevimli, kırmızı-sarı oyuncak buharlı lokomotif, yandan, sağa bakıyor; kabinde **Polly** oturuyor (model `abc/polly-sevin.webp` ile aynı karakter: safari şapkası, dürbün), bacadan küçük beyaz duman. Tekerlekler tabanı y = 460'ta.
- `tren-vagon.webp` 420 × 380 şeffaf: yandan açık yük vagonu, ahşap renkli; **ön yüzünde düz, açık krem, boş bir tabela** (x 70…350, y 40…280; resimli harf buraya gelir), iki tekerlek tabanı y = 360'ta, iki uçta bağlantı kancası (sol kanca x 0…20, sağ kanca x 400…420, y 300…330; vagonlar uç uca dizilir). Tabela boş, yazısız.
- `tren-ray.webp` 1600 × 120 şeffaf: yandan ray ve traversler, soldan sağa yatay tekrar edilebilir (sol ve sağ kenar birebir eşleşir); rayın üst yüzü y = 30.
Teslimden önce say: Polly'de iki kanat, iki ayak, model kıyafeti; vagon ve lokomotifte yüz yok (Polly dışında); tabela boş; köşeler ve zemin saydam.

## 2026-11-21 07:18 · Claude (İngilizce ada oyunları) → Astra · Paket 27-K · "Touch Your Knees!" için Kino (1 çizim; ABC'nin Paket 27'siyle çakışmasın diye 27-K)
Vücudum adasının oyunu: Polly "Touch your knees!" der, çocuk Kino'nun dizine dokunur. Öbür altı yeni ada oyunu (Fruit Salad, Day and Night, Pack the Bag, Big or Small?, Let's Play!, Count to Ten) yeni çizim istemiyor; Paket 17 ve 20 gelince açılır.
**Teslimden önce:** iki göz, iki kulak, iki kol, iki el (her elde beş parmak, açık ve seçilir), iki bacak, iki ayak say; gövde bütün; giysi modeldeki gibi (`assets/ingilizce/kisi/kino-sevin-0.webp`: yeşil tişört, mavi fular, kırmızı ayakkabı, beyaz kuyruk).
- `assets/ingilizce/oyun/vucut/kino.webp` · **800 × 1200 şeffaf**, Kino tam karşıdan, dimdik ayakta, gülümsüyor ve **dişleri görünüyor** (ağız açık gülüş). Kollar yanlara ve hafif aşağı açık ("A" duruşu), avuçlar öne dönük, parmaklar ayrık. Kod şu bölgelere dokunuş arar; çizimde o parça tam bu dikdörtgenlerin içinde olsun (piksel, sol-üst köşe 0,0):
  - kafa tepesi tüyleri: x 264–536, y 24–144 · ağız ve dişler: x 336–464, y 288–372
  - sol omuz x 160–304, sağ omuz x 496–640, y 444–540 · sol kol x 48–176, sağ kol x 624–752, y 480–720
  - sol el ve parmaklar x 16–144, sağ el x 656–784, y 720–840 · karın x 304–496, y 600–768
  - sol diz x 240–384, sağ diz x 416–560, y 888–984 (dizler belirgin, şort ya da çıplak bacak; bacak beyaz)
  - sol ayak x 192–384, sağ ayak x 416–608, y 1104–1188 (ayakkabının burnu öne bakar)
  Ayak tabanı y 1190 çizgisinde; arka planda başka bir şey yok.

## 2026-11-21 08:09 · Claude (İngilizce, Renkli Kino) → Astra · Paket 29 · Renkli Kino (33 çizim, 9 sayfa; eski adı Paket 28, Alphabet Train'le çakıştığı için 29) → `assets/ingilizce/oyun/renkli/`
Oyun (Oyunlar bölümü): Polly "Put on the red hat!" der, çocuk dolaptan kırmızı şapkayı seçer, şapka Kino'nun başına oturur; dört giysiden sonra fotoğraf: "A red hat and blue socks!". Kino'yu Giydir'in (Paket 12) gövdesi ve tuvali kullanılır.
**Teslimden önce:** bir giysinin dört renginde **biçim, yer ve boy birebir aynı, yalnız renk değişir** (üst üste koyup karşılaştır); katman Kino gövdesine (`oyun/giydir/kino-0.webp`) birebir oturur; dolap resmi aynı giysinin aynı renkte düz duran hali.
Renkler: **red, blue, yellow, green** (çocuğun bildiği dört temiz renk; açık-koyu ton farkı yok, her renk tek düz ton + gölge).
- **P29-1 … P29-4 · Katmanlar (4 sayfa × 4 çizim; her biri 1000 × 1400 şeffaf, Paket 12 tuvali):** `<renk>-<giysi>.webp`, giysi başına bir sayfa: `red-hat`, `blue-hat`, `yellow-hat`, `green-hat` · `*-t-shirt` · `*-socks` · `*-jacket`. Biçim ve yer, Paket 12'deki `oyun/giydir/hat.webp`, `t-shirt.webp`, `socks.webp`, `jacket.webp` ile birebir aynı; yalnız renk değişir.
- **P29-5 … P29-8 · Dolap resimleri (4 sayfa × 4 çizim; her biri 400 × 400 şeffaf):** `raf-<renk>-<giysi>.webp`: giysi karşıdan, düz, askısız ya da askıda; tuvalin ortasında, kenarda boşluk; 80 px'te bile rengi ve giysisi seçilir.
- **P29-9 · Oyunlar kartı (1 çizim, 600 × 600 şeffaf):** `kart.webp`: Kino kırmızı şapka, mavi tişört, sarı ceket ve yeşil çorapla seviniyor (onaylı model: iki göz, iki kulak, iki kol, iki bacak), yanında küçük bir dolap; yazı yok.
| Masal-K1 açılır kitap stil anahtar karesi (1) | **onaylandı** (Barış, 22 Kasım 23:36). Oyunda kullanılmaz; stil kararı. |
| Masal-K2-A açılır kitabın kanıt sayfası (40 + 1) | **onaylandı, bağlı** (23 Kasım 00:08). İlk teslimde 14 çizim geri döndü (`ekip/ingilizce/masal-k2-a/geri-donen/`), ikinci teslim temiz. Brief ve ölçüler: `MASAL-GOL-CILEK.md`. Sıradaki: K2-B (kalan altı sayfa). |
| P38 yüz hayvanın zıplama kareleri (396) | **istendi** (23 Kasım 01:34). Kod hazır (`kit.ts` → `kareZipla`; Hayvan Geçidi ve Hayvanat Bahçesi bağlı); kareler gelince kendiliğinden oynar. |
| UI-3 Oyunlar için üç oyun fikrinin ekran örneği (3): Dondurma Arabası, Komik Arkadaş, Hayvan Treni | **istendi** (23 Kasım 02:19; Barış: "Evet, çizdir"). Oyunda kullanılmaz; Barış seçince seçilen oyunun asıl brief'i yazılır. Brief: `CLAUDE-ASTRA-MESAJLAR.md`, 23 Kasım 02:19. |
| UI-3 sonuç | **geldi, gösterildi, fikirler beğenilmedi** (23 Kasım 02:32). Oyun fikri ve ekran örneği artık Antigravity'den (ISTEK-11). |
| P38 yüz hayvanın zıplama kareleri (396) | **geldi, onaylandı, bağlı** (23 Kasım 03:18). 99/99 ölçü denetiminden geçti, tabakada gözle bakıldı. |
| ING-UI-A ana ekran (42) ve ING-UI-B Oyun Parkı (30) | **onaylandı, bağlı** (23 Kasım 15:20). Ekran örnekleri `ekip/ui-secenek/ing-ui-*.png`. Ada haritası ve ders sahnesi parçaları henüz istenmedi. |
