# Minik Doktor · "Zıpzıp'ın Dizi" · senaryo ve çekim listesi

Hazırlayan: Claude (Harf Atölyesi oturumu), 22 Kasım 2026. Barış sekiz sahnelik kurguyu onayladı ("Evet, ilerle"). Plan: `MINIK-DOKTOR-ELIT-PLAN.md`. Oyun kuralları: `MINIK-DOKTOR.md` (on altın kural, sekiz yasak, ipucu merdiveni).

Bu belge her planı yazar: süre, kadraj, karakterin hareketi (çizilmiş poz dizisi), çocuğun eylemi, replik ve ses. İlk kurulacak ve Barış'a gösterilecek parça **kanıt sahnesi**dir (4. ve 5. sahne); ayrıntısı en altta.

## Değişmeyen kurallar

- **Hareket çizimdir.** Köşeli parantez içindeki her ad Astra'nın çizdiği bir poz dizisidir (ör. `[zipzip-tirman 0–5]`). Hareket sürerken saniyede 10 ya da 12 poz; sakin anda poz tutulur, araya göz kırpma girer. Kodla esnetme ve kukla yok.
- **Ağız söze oturur.** Konuşulan her duruşun altı ağzı vardır (kapalı, az, orta, yuvarlak, diş, gülümse); zamanlama `src/audio/dudak-mantik.ts` ile sesten çıkar.
- **Her plan en az 2,5 saniye.** Planlar arası geçiş aynı mekânda kamera itmesi, mekân değişiminde kısa kararma ya da kapı geçişi.
- **Kino emir vermez.** Yasak sözcükler: dokun, tıkla, bas, sürükle, şimdi şunu, yanlış, hatalı, hızlı ol, çabuk, süre, kaybettin, aferin. Kino ne gördüğünü söyler ya da soru sorar; övgüsü somuttur.
- **Tepkiler karakterin kendi sesiyle,** yüzün ve bedenin harekete başladığı karede (irkilme, kıkırdama, iç çekiş, ürperme).
- **Ekranda ok ve yazı yok.** Hasta derdini kendi gösterir. İpucu merdiveni `MINIK-DOKTOR.md` 3b'deki gibi.
- Kan, iğne, insan figürü, çilek yok. Müzik yok; ortam sesi var.

## Kitapla aynı dünya ("Kino Doktora Gidiyor")

Kitaptan alınan dört an: doktor önce gösterir; stetoskobun ucu serindir; önce Kuzu dinlenir; "içimde davul var" dedikten sonra bir daha duymak ister. Sonda Kuzu'ya da yıldız verilir ("ilk hasta oydu").

## Sahne 1 · Bahçe, düşüş (açılış, ~12 sn)

Fon: `fon-bahce` (yeşil çalı sırası, çimen, uzakta kliniğin kapısı). Çocuk izler; tek dokunuş var.

| Plan | Süre | Kadraj | Ne olur | Çocuk | Ses ve replik |
|---|---|---|---|---|---|
| 1.1 | 4 sn | geniş | Kırmızı top sekerek çalıya doğru yuvarlanır `[top-sek 0–2]`. Zıpzıp peşinden koşar `[zipzip-kosu 0–7]`. | Topa dokunursa top bir kez daha seker. | Kuş sesi, top "pof pof". Zıpzıp: "Topum! Bekle!" |
| 1.2 | 4 sn | orta | Zıpzıp çalının üstünden atlamaya kalkar, arka ayağı dala takılır, çamura düşer `[zipzip-dusus 0–7]`. Top çalının içine sıkışır. | — | "Hop!", dal hışırtısı, yumuşak "pluf". Zıpzıp: "Ayy!" |
| 1.3 | 4 sn | yakın | Zıpzıp oturmuş, çamurlu dizine bakar; kulakları düşer, dudağı titrer `[zipzip-dize-bak 0–3]`. Çalıdan bir uğur böceği dizine doğru uçar (görünür, ama konduğunu görmeyiz). | — | Zıpzıp (iç çeker): "Dizim…" |

## Sahne 2 · Klinik kapısı (~10 sn)

Fon: `fon-klinik-dis` (kapı boşluğu, yanında asılı tabela, pencere); kapı kanadı ayrı katman. Zıpzıp kapıya sağdan gelir, sola dönüktür (çamurlu sol bacağı bize yakın); Kino sağa dönüktür. Çizimler: Paket Doktor-K2.

| Plan | Süre | Kadraj | Ne olur | Çocuk | Ses ve replik |
|---|---|---|---|---|---|
| 2.1 | 3 sn | orta | Kapıdaki tabela ay tarafında (sarı hilal; yüzü yok). | Tabelayı çevirir: güneş tarafı gelir `[tabela 0–2]`. | Tahta "tak", kapı zili. |
| 2.2 | 4 sn | geniş | Zıpzıp tek ayak üstünde sekerek gelir, dizini tutar `[zipzip-sek 0–7]`. Kapıda durur, içeri bakıp geri çekilir `[zipzip-cekin 0–3]`. | — | Zıpzıp: "Acıyacak mı?" |
| 2.3 | 4 sn | orta | Kapı açılır `[kapi 0–2]`; Kino eşikten çıkar, dizlerini büküp Zıpzıp'ın boyuna iner `[kino-karsila 0–5]`, konuşur `[kino-karsila-agiz]`. | — | Kino: "Hoş geldin Zıpzıp! Dizine birlikte bakalım mı?" |

## Sahne 3 · Bekleme odası (~25 sn)

Fon: `fon-bekleme` (alçak raf, açık iç kapı aralığı, boş sehpa, rakamsız saat); koltuk ve raftaki üç eşya (Kuzu, kitap, top) ayrı katman. İlk gerçek seçim burada. Çizimler: Paket Doktor-K2.

| Plan | Süre | Kadraj | Ne olur | Çocuk | Ses ve replik |
|---|---|---|---|---|---|
| 3.1 | 6 sn | geniş | Zıpzıp koltuğun ucuna ilişir, kuyruğunu bacağına sarar `[zipzip-ilis 0–5]`. Gözü rafa kayar. Kino iç kapının eşiğinde `[kino-kapida 0–1]`, konuşur `[kino-kapida-agiz]`. | — | Saat tik tak. Kino: "Bekleyene bir arkadaş iyi gelir." |
| 3.2 | 8 sn | orta | Çocuğun verdiğine göre: Kuzu → sarılır `[zipzip-saril 0–3]`, konuşur `[zipzip-saril-agiz]`. Kitap → açar, kitap ağzını örter, gözleri kitabın üstünden bakar, sonra yanına koyar `[zipzip-kitap 0–3]`. Top → sıkar, üzgün bakar, yanına koyar `[zipzip-top 0–3]`, temel pozda konuşur `[zipzip-ilis-agiz]`. Kitap ya da toptan sonra raf açık kalır. | Rafın bir eşyasını Zıpzıp'a götürür. | Kuzu: "Kuzu! Sen de mi kontrole geldin?" Kitap: "Aa, Kino da doktora gitmiş!" Top: "Benim topum çalıda kaldı…" |
| 3.3 | 5 sn | orta | Kino konuşur, odayı gösterip yol verir `[kino-kapida 2–3]`. Kuzu henüz verilmediyse çocuk Kuzu'yu verir (sahne Kuzu'yla sürer). Zıpzıp Kuzu'yu kolunun altına alıp kalkar `[zipzip-kalk-kuzu 0–3]`. | Kuzu'yu verir (verilmediyse). | Kino: "Sıra sende. Kuzu da gelsin mi?" |

## Sahne 4 · Muayene odası, "önce Kuzu" (~20 sn) · KANIT SAHNESİ

Aşağıda ayrıntılı.

## Sahne 5 · Göğüs yakın planı, "içimde davul var" (~18 sn) · KANIT SAHNESİ

Aşağıda ayrıntılı.

## Sahne 6 · Diz yakın planı (~60 sn)

Kadraj: Zıpzıp'ın yüzü üstte, dizi altta; ikisi aynı çizimde (yakın plan, tam çözünürlük). Her alet anında yüz tepki verir.

| Plan | Süre | Ne olur | Çocuk | Ses ve replik |
|---|---|---|---|---|
| 6.1 | 4 sn | Zıpzıp dizini uzatır, patisiyle gösterir `[zipzip-diz-uzat 0–3]`. | — | Kino: "Dizinde kahverengi bir şey var." |
| 6.2 | 12 sn | Büyüteç: camın içi büyütür. Yaprak bulunur. Yaprağın altından uğur böceği çıkar, cama konar, sonra pencereye uçar `[ugur-bocegi 0–5]`. Zıpzıp gözleriyle izler `[zipzip-yakin-izle 0–3]`. | Büyüteci gezdirir. | Bulma sesi. Zıpzıp: "Aaa! Yaprak!… Bir de yolcu varmış!" |
| 6.3 | 12 sn | Cımbız sapı tutar; Zıpzıp gözlerini kısar `[zipzip-yakin-kis 0–2]`; yaprak direnir, çıkar, süzülür. Zıpzıp bir gözünü açar, şaşırır `[zipzip-yakin-oh 0–3]`. | Sapı tutup çeker. | "Pıt." Zıpzıp: "Yavaş yavaş…" → "Oh! Hiç acımadı!" |
| 6.4 | 14 sn | Islak pamuk çamuru siler; ilk değişte kuyruk kabarır, Zıpzıp ürperir, sonra güler `[zipzip-yakin-urper 0–3]`. Altından iki pembe çizik çıkar. | Çamuru siler. | Sürtme sesi. Zıpzıp: "Hii, serin!… Gıdıklıyor!" Kino: "Dizi pırıl pırıl oldu." |
| 6.5 | 14 sn | Dört bant; seçilen çiziğe konur, sürttükçe düzleşir. Zıpzıp bandı kendi patisiyle bir kez okşar `[zipzip-bant-oksa 0–3]`. | Bandı seçer, koyar, düzleştirir. | Kino: "Hangisi yakışır dersin?" Zıpzıp (desene göre): "Yıldızlı! En sevdiğim!" |

## Sahne 7 · Ödül köşesi (~25 sn)

Fon: muayene odası, kamera mantar panonun olduğu duvara kayar.

| Plan | Süre | Kadraj | Ne olur | Çocuk | Ses ve replik |
|---|---|---|---|---|---|
| 7.1 | 5 sn | geniş | Zıpzıp koltuktan atlar `[zipzip-in 0–5]`, dizini büküp açar, bir kez zıplar `[zipzip-diz-dene 0–5]`. | — | Zıpzıp: "Bak! Bükülüyor!" |
| 7.2 | 8 sn | orta | Üç renkte yıldız. Seçilen Zıpzıp'ın göğsüne yapışır; Zıpzıp göğsünü kabartır `[zipzip-gurur 0–3]`. Sonra Kuzu'nun boş göğsünü gösterir; ikinci yıldız Kuzu'ya. | Yıldızı seçer, yapıştırır; ikincisini Kuzu'ya. | Kino: "Cesur hastaya bir yıldız yakışır." Zıpzıp: "Kuzu'ya da! İlk hasta oydu!" |
| 7.3 | 8 sn | yakın | Sağlık karnesi; damga iz bırakır; karne uçup mantar panoya asılır ve orada kalır. | Damgayı vurur. | "Pat." Kino: "Panomuzun ilk karnesi." |
| 7.4 | 4 sn | orta | Zıpzıp stetoskobu alıp Kino'nun göğsüne dayar `[zipzip-doktor 0–3]`; Kino güler `[kino-gul 0–3]`. | — | Zıpzıp: "Seninki de davul!" |

## Sahne 8 · Bahçe, kapanış (~20 sn)

| Plan | Süre | Kadraj | Ne olur | Çocuk | Ses ve replik |
|---|---|---|---|---|---|
| 8.1 | 5 sn | geniş | Zıpzıp kapıdan çıkar, bahçede yürür (aksamadan) `[zipzip-yuru 0–7]`, aynı çalının önünde durur, bakar. | — | Kuş sesi. Zıpzıp: "Hmm… Bu sefer dikkatli." |
| 8.2 | 5 sn | orta | Geri çekilir, bu kez yüksek ve temiz atlar `[zipzip-atla 0–7]`, topunu çalıdan çıkarır. | Çalıya dokunursa top kıpırdar. | "Hop!" Zıpzıp: "Topum!" |
| 8.3 | 6 sn | orta | Bandını gösterir `[zipzip-bant-goster 0–5]`. Uğur böceği gelip bandın üstüne konar; Zıpzıp kıkırdar. Kino kapıdan el sallar `[kino-el-salla 0–5]`. | — | Zıpzıp: "Bak, artık cesurum!" Kino: "Kalbi sakin, dizi tertemiz. Çok nazik bir doktorsun." |
| 8.4 | döngü | geniş | Zıpzıp topunu sektirir `[zipzip-top-sektir 0–5]`; uğur böceği bantta. Sağ üstte "yeniden" düğmesi. | Topa dokunursa Zıpzıp topu ona doğru atar. | Top "pof pof". |

## Yaş basamakları

- **5+:** bütün planlar.
- **4:** 6.2 ve 6.3 yok (yaprak ve böcek yok); 7.3 yok.
- **2–3:** 6.2, 6.3, 6.4 ve 7.3 yok; 3.2'de rafta yalnız Kuzu; tepside yalnız sıradaki alet; kalpte bekleme 1,2 sn.

---

# Kanıt sahnesi: 4. ve 5. sahne (≈ 38 sn)

Barış'a ilk gösterilecek iş. Beş plan, tek mekân, son kalite: çizilmiş hareket, söze oturan ağız, göz kırpma, kamera, ses. Onaylanmadan başka sahne kurulmaz.

Mekân: `fon-muayene` (Astra yeniden çizer; kitaptaki klinik: `assets/kitap/doktor/klinik-kuzu.webp`). Yerleşim: Kino solda, ortada nane yeşili muayene masası ve önünde iki basamaklı tabure (ayrı katman), sağda alet masası; arkada pencere (perde hafif dalgalanır), mantar pano, boy ölçer. Stetoskop kitaptaki gibi turkuaz hortumlu.

| Plan | Süre | Kadraj | Zıpzıp | Kino | Çocuk | Ses ve replik |
|---|---|---|---|---|---|---|
| K1 | 5 sn | geniş | Kuzu kolunda, basamaktan muayene masasına çıkıp oturur `[zipzip-tirman 0–5]`; oturunca bir kez kırpar `[zipzip-otur-kirp]`. | Yanında bekler, bir kez kırpar. | — | Basamak tıkırtısı, minder hışırtısı. Zıpzıp (kısık): "Hop." |
| K2 | 7 sn | orta, hafif itme | Kino'ya bakar `[zipzip-otur-bak]`; stetoskobu görünce irkilir, Kuzu'yu yüzüne kaldırıp arkasına saklanır `[zipzip-saklan 1–4]`. Saklıyken konuşur (ağız görünmez; kulaklar oynar). | Stetoskobu boynundan çıkarıp ucunu avucunda gösterir `[kino-steto-goster 0–3]`; konuşur `[kino-steto-agiz]`. | — | Kino: "Bu stetoskop. Kalbin şarkısını dinler." Zıpzıp (irkilir): "Hı!… O ne? Çok mu soğuk?" |
| K3 | 8 sn | orta | Kuzu'yu yüzünün önünde tutar. Davul sesi gelince Kuzu'nun arkasından çıkar `[zipzip-merak 0–3]`, konuşur `[zipzip-otur-agiz]`. | Eğilir, stetoskobu açık avucunda çocuğa uzatır `[kino-egil 0–3]`; çocuk alınca avucu boş kalır `[kino-egil-bos]`. | Stetoskobun ucunu Kuzu'nun göğsüne götürür (ilk dokunuş; hedef Kuzu'nun kurdelesinin altı). | Kino: "Önce Kuzu'yu dinleyelim mi?" Oyuncak davul: tık tık tık. Zıpzıp: "Aa! Kuzu'nun davulu var!… Ben de! Ben de!" |
| K4 | 13 sn | yakın plan (bel üstü; kamera iter, ayrı tam çözünürlüklü çizim) | Göğsüne bakar `[zipzip-yakin-dinle]`. Uç değince ürperir `[zipzip-yakin-saskin 0–1]`. Kalbe yaklaştıkça göğsü atışla kabarır `[zipzip-yakin-gogus]`. Kalpte durunca gözleri büyür, sonra kıkırdar `[zipzip-yakin-kikir 0–3]`, konuşur `[zipzip-yakin-agiz]`. | Kadraj dışı. | Ucu göğüste gezdirir; kalbe yaklaştıkça güm-güm hızlanır ve yükselir; kalpte 2 sn tutar. Sonra serbestçe bir daha dinleyebilir. | Zıpzıp: "Hii, serinmiş!" … güm-güm … "Hihi! İçimde davul var!… Bir daha, bir daha!" |
| K5 | 5 sn | orta (geri açılır) | Kuzu'yu iki patisiyle başının üstüne kaldırır, bacaklarını sallar `[zipzip-kuzu-kaldir 0–3]`. | Güler `[kino-gul 0–3]`, konuşur. | — | Kino: "İkinizin davulu da çok güzel çalıyor!" |

## Kanıt sahnesinin çizimleri (Astra, Paket Doktor-K1 · 68 çizim, 22 çağrı; brief `CLAUDE-ASTRA-MESAJLAR.md` sonunda)

| Küme | Dizi | Çizim |
|---|---|---|
| Zıpzıp, orta plan | tırman 6 · oturuş ağız 6 · kırp ve bak 2 · saklan 4 · merak 4 · Kuzu'yu kaldır 4 | 26 |
| Zıpzıp, yakın plan | dinle ve kırp 2 · şaşkın 2 · kıkır 4 · ağız 6 · göğüs kabarık ve bize bakış 2 | 16 |
| Kino, orta plan | stetoskop göster 4 · ağız 6 · kırp, Kuzu'ya bakış ve boş avuç 3 · eğil 4 · gül 4 | 21 |
| Eşya | stetoskop (yüksek çözünürlük) | 1 |
| Mekân | muayene odası fonu 1 · muayene masası ve tabure 1 · perde 2 | 4 |

## Kanıt sahnesinin sesleri

Kino (uygulamadaki sesi): "Bu stetoskop. Kalbin şarkısını dinler." · "Önce Kuzu'yu dinleyelim mi?" · "İkinizin davulu da çok güzel çalıyor!"

Zıpzıp (klon ses, Barış'ın onayına bağlı): "Hop." · "Hı!" (irkilme) · "O ne? Çok mu soğuk?" · "Aa! Kuzu'nun davulu var!" · "Ben de! Ben de!" · "Hii, serinmiş!" · kıkırdama · "İçimde davul var!" · "Bir daha, bir daha!"

Kayıt durumu (22 Kasım): on iki replik `assets/doktor/zipzip-diz/ses/` içinde, her biri ayrı istek, Scribe ile doğrulandı, düzey −19 dB. "Soğuk mu?" iki alışta da "sok mu" duyulduğu için replik "Çok mu soğuk?" oldu.

Efekt: basamak tıkırtısı, minder hışırtısı, oyuncak davul (tık tık), kalp atışı (güm-güm), stetoskop ucunun değmesi, ortamda saat ve pencereden kuş.

## Kanıt sahnesinde "bitti" ne demek

- Her harekette poz atlaması, kayma, boy sıçraması yok (normal hızda, iPad ve telefon yatayda izlenir).
- Ağız her replikte söze oturuyor; iki replik arasında en az bir göz kırpma var.
- Çocuğun iki eylemi (Kuzu'yu dinleme, Zıpzıp'ı dinleme) parmağın biraz üstünde, gecikmesiz.
- Gerçek sesle video: iPad yatay ve telefon yatay; ilk kare yüklü sahne.

## Çizim paketleri ve kod (22 Kasım 2026)

| Sahne | Astra paketi | Kod | Kayıt |
|---|---|---|---|
| 1 · bahçede düşüş | Doktor-K3 (35 çizim) | `doktor/src/bahce/` · `?sahne=bahce` | 3 replik |
| 2 · klinik kapısı | Doktor-K2 (39) | `doktor/src/kapi/` · `?sahne=kapi` | 3 replik, 4 efekt |
| 3 · bekleme odası | Doktor-K2 (51) | `doktor/src/bekleme/` · `?sahne=bekleme` | 6 replik |
| 4–5 · önce Kuzu, göğüs yakın planı | Doktor-K1 (68) | `doktor/src/once-kuzu/` · `?sahne=once-kuzu` | 12 replik, 5 efekt |
| 6 · diz yakın planı | Doktor-K3 (35) | `doktor/src/diz/` · `?sahne=diz` | 13 replik, 4 efekt |
| 7 · ödül köşesi | Doktor-K3 (40) | `doktor/src/odul/` · `?sahne=odul` | 5 replik, 3 efekt |
| 8 · bahçede kapanış | Doktor-K3 (51) | `doktor/src/bahce/` · `?sahne=kapanis` | 4 yeni replik (2 kayıt K1'den) |

Toplam 319 çizim. Sahneler ortak motorla yürür (`doktor/src/motor/`); çizim klasöre düşünce kendiliğinden bağlanır, eksikken ekranda görüntü olmaz. **Baştan sona tek akış:** `doktor/index.html?oyun=zipzip-diz` (`doktor/src/zincir.ts`): sahne bitince perde kararır, sıradaki açılır; seçilen bant ve yıldız sahneden sahneye taşınır; son sahnede Zıpzıp topunu sektirir ve "yeniden oyna" düğmesi çıkar. 8. sahnede Zıpzıp klinikten (soldan) döner: sağa yürür, çalının solundan sağına atlar (K3 yön eki).

K3 ile gelen iki kural:
- **Bant:** tedaviden sonraki pozlarda Astra dizde düz krem, desensiz bir bant çizer; çocuğun seçtiği desen küçük bir işaret çizimi olarak (`bant-isaret-*`) kodla üstüne konur. Her pozda bandın yeri çizim gelince ölçülür.
- **Yıldız:** göğüsteki yıldız yeri pozlarda boş bırakılır; seçilen renk (`yildiz-sari`, `-nane`, `-mavi`) kodla konur. Kuzu'nun yıldızı da öyle.
- **6. sahnenin kadrajı:** arkada yüz (`diz-yuz-*`), önde diz (`diz-bacak` ve lekeler); ikisi aynı 2048 × 1536 tuvalde. Kino kadraj dışıdır, sesi duyulur.
