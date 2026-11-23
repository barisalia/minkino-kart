# Minik Doktor · Minkino Kliniği · Tam Oyun Tasarımı ve Yapım Belgesi (v2)

> **Durum:** Tam yapım belgesi **v2** (2026-11-22 · Antigravity / Neon 4.0 + Claude Yönetici harmanı).  
> **Karar:** Barış, Oyunlar bölümünün Sürüm 1.2 yeni büyük oyunu olarak **Minik Doktor · Minkino Kliniği**'ni onayladı (takvim: Sürüm 1.1 mağazaya verildikten sonra; 1.1 derlemesine girmez).  
> **Canlı ilk örnek (pilot):** `ekip/senaryo/MINIK-DOKTOR-ORNEK.md` ("Zıpzıp'ın Dizi" — 24 çizim `ISTEK-08` / `CEVAP-08.md` ile teslim edildi, Harf oturumu `doktor/` altında kuruyor).  
> **v2'de işlenen Claude (02:30 & 02:37) düzeltme ve katkıları:**
> 1. **Vaka 3 (Lokum, soğuk dondurma) düzeltildi:** Üşüyen hastaya serin bez verilmez; ateş ölçer **normal (yeşil)** okur, tedavi **sıcak battaniye + ılık ıhlamur**dur. **Serin bez** yalnız ateşli vakada (Vaka 12 · Baba Murat ve ateş varyasyonları) kullanılır.
> 2. **Vaka 5 (Bulut, kulakta uğur böceği) düzeltildi:** Kulağa asla cımbız sokulmaz. Uğur böceği kulağın **dış kenarındaki tüylerde** durur; çocuk büyüteçle bulur, **yeşil bir yaprağı yaklaştırır**, böcek yaprağa geçip kanat çırparak uçar. Cımbız yalnız diz ve patideki yaprak/diken çıkarmada kullanılır.
> 3. **Kilit / erişim `[ÖNERİ]` olarak işaretlendi:** Gün 1–2 ücretsiz, Gün 3+ abonelik yapısı yalnız öneridir; son kilit kararı Barış'ındır.
> 4. **Yöneticinin örnek eklemeleri tüm oyunun standardı yapıldı:** **Duygu yayı** (her hastada *endişeli → rahatlamış → coşkulu/cesur*), **hastanın derdini kendisi göstermesi** (ok/yazı yok), **aynı odada yakın plana yumuşak geçiş**, **bandı parmakla düzleştirme**, **bandın/çıkartmanın kapanışa kadar karakterde kalması** ve **kapı önü kapanış şakası** artık 14 vakanın tamamında çekirdek kuraldır.

---

## 0. Tek Cümle ve Duygusal Vaat

Kino beyaz doktor önlüğünü giyip yardımcı olur, çocuk **baş doktor** olur: her gün Minkino mahallesinden 2–3 dost küçük, komik ve korkusuz bir sorunla kliniğe gelir; çocuk önce arkadaşının korkusunu geçirir, gerçek gibi çalışan dokunsal aletlerle iyileştirir, göğsüne yıldız çıkartması yapıştırıp sağlık karnesine damga basar ve kazandığı yıldızlarla kliniği canlı eşyalarla büyütür.

- **Çocuğun hissedeceği:** *"Doktor benim! Arkadaşım başta biraz çekiniyordu, benim elimle iyileşti ve artık cesur — doktordan korkulmaz!"*
- **Velinin göreceği:** *"Çocuğum doktor muayenesi korkusunu gülerek yeniyor; diş fırçalama, temizlik, ıhlamur/dinlenme ve kulağa yabancı cisim sokmama gibi gerçek sağlık alışkanlıkları kazanıyor."*
- **5 saniyelik reklam anı:** Lokum/Zıpzıp önce ürkek → parmakla büyüteç/röntgen gezdirince komik neden görünür (dizdeki yaprak ya da midedeki 3 mandalina dilimi!) → parmakla yıldızlı yara bandı yapışır → hasta zıplayıp `"Bak, artık cesurum!"` diye güler.

---

## 1. Rakip İncelemesi ve Minkino Üstünlüğü

| Rakip | Güçlü yönü (aldığımız ilke) | Zayıf yönü (aştığımız yer) |
|---|---|---|
| **Toca Pet Doctor** | Sıfır süre baskısı, her vakanın benzersiz parmak hareketi, abartılı sevimli iyileşme tepkisi. | Amaçsız döngü; klinikte kalıcı büyüme ve hasta duygu yayı zayıf. |
| **Dr. Panda Hospital** | Bekleme odasından muayene koltuğuna alma, çok adımlı tedavi hissi. | Eski/dağınık odalar, tekrar eden aynı şırınga-hap kalıbı; çocukta gerçek muayene korkusunu yatıştırmıyor. |
| **Sago Mini** | Yazısız arayüz, yüksek dokunuş zevki, sıcak ses tasarımı. | 10 dakikada biten sığ içerik; gün ilerleyişi ve veli köprüsü yok. |
| **Minkino farkı** | **1) Duygu yayı** (*endişeli → rahat → cesur*), **2) `Kino Doktora Gidiyor` (`content/kitap-doktor.json`) kitap evreniyle birebir bütünlük** (stetoskop "içerideki davul", önce oyuncak Kuzu, ağız fenerini önce avucunda gösterme, karında elleri ısıtma, boy ölçerde topuk kaldırma şakası, göğse yıldız), **3) Minik Şef düzeyinde dokunsal fizik + klinik büyümesi**. | **Sıfır kan, sıfır iğne/şırınga, sıfır açık korkunç yara, sıfır ağlama/acı çığlığı, sıfır saat/süre, sıfır puan/ceza, sıfır insan figürü, sıfır çilek, sıfır domuz.** |

### 1a. On Altın Kural ve Sekiz Yasak

**On Altın Kural:**
1. **Duygu yayı her vakanın kalbidir:** Hasta koltuğa hafif çekingen/tedirgin oturur (*"Acıyacak mı?"*), ilk nazik muayenede rahatlar (*"İçimde davul var!"*), tedavi bitince gururla zıplar (*"Bak, artık cesurum!"*).
2. **Sıfır gecikme dokunuş fiziği (`RESTORAN.md` §1d standardı):** Parmak değdiği karede ses + görsel tepki + Capacitor hafif titreşim (10–20 ms).
3. **Parmak aracı kapatmaz:** Tutulan alet parmak ucunun 24–36 CSS px üstünde/ucunda çalışır; dokunma hedefleri en az **64 × 64 CSS px** (yatay telefon `844 × 390` asıl ölçü).
4. **Kalıcılık (gerçek fizik):** Silinen çamur gerçekten açılır; yapıştırılan desenli yara bandı ve yıldız çıkartması hasta kapıdan çıkana kadar üstünde kalır; damgalanan sağlık karnesi duvardaki panoya asılır.
5. **Aynı hareket iki kez tekrarlanmaz:** 10 mini istasyonun her birinin parmak jesti farklıdır (gezdir-tut, mercek kaydır, cımbızla çek, yaprağı yaklaştır, ileri-geri sil, sürükle-düzleştir, su dök-karıştır, fener-fırçala-çalkala, röntgen kaydır, damlat-hizala, bastır-damgala).
6. **Güvenli çocuk alışkanlığı:** Kulağa asla cımbız/çubuk sokulmaz; ateşsiz üşümede sıcak battaniye + ılık ıhlamur, ateşli vakada serin bez kullanılır; diş fırçalamada şeker/çilek yok, nane/portakal/sade macun vardır.
7. **Ok ve emir yok:** Hasta derdini kendi eliyle/pozuyla gösterir. Anlatıcı/Kino yasak sözcük listesine (`dokun`, `tıkla`, `bas`, `sürükle`, `şimdi şunu`) asla girmez.
8. **Önce oyuncak Kuzu:** Gün 1'in ilk vakası (ve velinin gerçek doktor randevusu öncesi açabileceği "Alıştırma" düğmesi) kırmızı kurdeleli pelüş Kuzu'dur — çocuk güveni orada kurar.
9. **Her gün somut klinik ödülü:** Gün sonunda kazanılan yıldızlarla bekleme odasına dokununca canlanan gerçek bir eşya yerleşir.
10. **Temiz 2D Minkino dili:** Barış'ın beğendiği `assets/dedektif-yeni/roman-2.webp` paleti (lila duvar, açık mavi lambri, şeftali zemin, sıcak ahşap, nane koltuk); ince siyah kontur, düz renk, sıfır yapay doku.

**Sekiz Yasak:**
1. Kan, kırmızı açık kesik, dikiş, yara kabuğu **YOK** (en fazla iki yumuşak açık pembe çizik).
2. İğne, şırınga, acı veren alet, korkutan dişçi matkabı **YOK**.
3. Süre sayacı, sabırsız hasta, kırmızı çarpı, can/puan kaybı **YOK**.
4. İnsan figürü (duvar afişi, kitap kapağı, pencere dışı, çerçeve içi dahil) **YOK**.
5. Çilek (macun, şurup, çıkartma, bant, duvar süsü dahil) ve domuz **YOK**.
6. Aletlerin, yıldızların, mobilyaların üstünde göz/ağız/yüz **YOK**.
7. Ekranda okunması gereken uzun yazı, sayısal menü, istatistik tablosu **YOK** (yalnız veli ekranı).
8. Eski/reddedilmiş karakter modelleri, Baba'da alın beni, Lokum'da etekli elbise (Lokum her zaman **pembe tulumlu**), Bulut'ta şaşı göz **YOK**.

---

## 2. Onaylı Kadro ve Karakter Kişilikleri

Tüm karakterler doğrulanmış ön modellerden (`ekip/kalite/minkino-gorsel-rehberi/pozlar/<ad>/on.png` ve Mila için `ekip/film/kino-bir-iki-uc-gum/cizim/Mila-Tek-Poz-Onizleme.png`) çizilir; boy oranları `boy-oranlari.json` (`Kino = 1.00`, `Lokum = 0.63`) ile uyumludur.

| Karakter | Rol | Görsel kimlik kilidi | Klinik kişiliği ve komik reaksiyonu |
|---|---|---|---|
| **Kino** | Doktor yardımcı | Beyaz köpek, **izleyiciye göre sağ** gözde turuncu leke + tepe lekesi, yeşil tişört, lacivert fular, kırmızı ayakkabı + **açık kısa beyaz doktor önlüğü** | Sıcak, cesaretlendirici, asla emir vermez. Yanlış alette gülerek yumuşak gözlem yapar. |
| **Oyuncak Kuzu** | İlk alıştırma hastası | Beyaz pelüş kuzu, boynunda kırmızı kurdele (`content/kitap-doktor.json`) | Kino'nun kucağında durur; stetoskopta minik `mee!` ve oyuncak davul sesi çıkarır. |
| **Zıpzıp** | Hasta (Gün 1) | Erkek tilki, camgöbeği V-yaka tişört, krem şort, kahverengi pati/ayak, beyaz uçlu kuyruk | Hızlı konuşur, çalıdan atlamış; başta kulakları düşük *"Acıyacak mı?"*, bant yapışınca *"Bak, artık cesurum!"* diye fırlar. |
| **Lokum** | Hasta (Gün 2, 4, 5) | Beyaz yavru köpek, turuncu sağ kulak, kırmızı burun, iki ön diş, **pembe tulum** (etek değil!), boy `0.63 × Kino` | *"Hav!"* der; soğuk dondurma yiyip üşüyünce sıcak battaniyede mırıldanır, karın muayenesinde kıkırdayarak yuvarlanır, röntgende 3 mandalina dilimi çıkar! |
| **Bulut** | Hasta (Gün 2, 3) | Kayısı tüy, küçük koyu boynuzlar, uzun içi pembe kulaklar, lila tişört, turkuaz şort; **iki göz bebeği tam hizalı** (`pozlar/bulut/on.png`) | Tatlı ve utangaç; bal kavanozuna yaklaşıp boynuzunu ballamış; kulağının dış tüyündeki uğur böceğinde kıkırdar; boy ölçerde *"Yünüm de sayılıyor mu?"* diye sorar. |
| **Mino** | Hasta (Gün 3, 4, 7) | Turuncu tekir kedi, kırmızı fular, ön cepli mavi önlüklü elbise | *"Miyav!"* der; patisinde küçük diken, kurabiye sonrası diş parlatma; sürpriz röntgende cebinden çıngıraklı top çıkar! |
| **Dede Hasan** | Hasta (Gün 5) | Beyaz köpek, uzun kahverengi kulak, gri kasket, yeşil yelek, krem gömlek, kahverengi pantolon | Çayı hızlı içip *"Hık!"* diye hıçkırır; röntgende göğsünde uçuşan hıçkırık baloncukları görünür! |
| **Mila** | Hasta (Gün 6) | Onaylı şeftali yavru kedi (`Mila-Tek-Poz-Onizleme.png`), sarı tulum, nane yeşili toka, lila kulak lekesi; ses: Bıdık Bebek | Çiçek koklarken gözüne polen konmuş; damlada minik kırpış ve bıdık kıkırdama! |
| **Baba Murat** | Hasta (Gün 6) | Gözlüklü baba köpek; **alında ben KESİNLİKLE YOK** | Gerçek **hafif ateş** vakası (kırmızı termometre → serin bezden buhar + ılık ıhlamur); iyileşince boy ölçerde çocukla şakalaşır. |
| **Anne Defne** | Hasta (Gün 7 / Rutin) | Sarı hırka, petrol etek, fiyonk | Rutin kontrol günü: *"Hasta değilim, kontrole geldim!"* (koruyucu hekimlik bilinci!). |
| **Babaanne Nazlı** | Hasta (Gün 7+) | Gri topuz, zincirli yuvarlak turuncu gözlük, mor hırka, tek turuncu düğmeli krem elbise | Buharlanan gözlüğü silme + sıcak ıhlamur ikramı + şakacı hapşırık. |

---

## 3. Çekirdek Oyun Döngüsü, İpucu Merdiveni ve Seçim Özgürlüğü

### 3a. Günlük Akış

```
1. SABAH AÇILIŞI (3 sn)
   Klinik kapısındaki güneş/ay tabelasını çevir ("Açık") → kapı zili "çıngır!"
        │
        ▼
2. BEKLEME ODASI (3/4 sıcak oda, 2–3 hasta koltuklarda oturur)
   • Çocuk istediği hastaya dokunur (seçim özgürlüğü!)
   • Bekleme odasındaki önceki günlerin ödülleri dokununca canlanır (akvaryum, kuzu, çiçek...)
        │
        ▼
3. MUAYENE ODASI (`fon-muayene.png`, geniş sakin kadraj)
   • Hasta koltuğa oturur (ENDİŞELİ poz), derdini kısa replik ve patisiyle gösterir.
   • Sağdaki ahşap masada alet tepsisi durur.
   • Çocuk doğru aleti seçer → 2–3 DOKUNSAL MİNİ İSTASYON (dize/ağza/kulağa dokununca aynı odada yumuşak yakın plan!)
   • Her adım bitince hasta bir kademe rahatlar (ENDİŞELİ → GÜLÜMSEYEN).
        │
        ▼
4. İYİLEŞME VE ÖDÜL ANI (15–20 sn)
   • Hasta zıplar (ZİPLA pozu) + kalıcı bant/temizlik üstünde görünür!
   • Çocuk 3 yıldız çıkartmasından birini seçip hastanın göğsüne yapıştırır.
   • Sağlık karnesini ahşap damgayla damgalar ("PAT!" + mürekkep izi) → kart mantar panoya uçar!
   • KAPANIŞ ŞAKASI: Hasta kapıya koşar, döner, zıplar, bandını/yıldızını gösterir ("Bak, artık cesurum!") → +2 klinik yıldızı!
        │
        ▼
5. GÜN SONU · KLİNİK DEFTERİ (2–3 hasta tamamlanınca)
   • 1 yeni doktor aleti açılır (ertesi günün heyecanı).
   • Çocuk biriktirdiği yıldızlarla bekleme odasına 1 canlı eşya seçer ve yerine koyar!
   • İsteğe bağlı: Gün 4'ten itibaren "Serbest Klinik" düğmesi (Toca tarzı: istediğin hastayı ve aleti seçip özgürce muayene et!).
```

### 3b. İpucu Merdiveni (Sıfır Emir, Sıfır Baskı — `RESTORAN.md` §4c ile Aynı Standart)

| Bekleme / Durum | Tepki |
|---|---|
| **0–6 sn** | Tam sessizlik ve özgür keşif. Çocuk masadaki başka eşyalara dokunursa yumuşak tık/ses verir. |
| **Yanlış alet seçimi (1. kez)** | Ceza/çarpı yok. Alet nazikçe geri döner; Kino gülümseyerek gözlem söyler: *"Hımm, bunu sonra kullanalım; önce dizine bakalım!"* (Asla "yanlış" demez). |
| **6 sn boşta ya da 2. yanlış seçim** | Doğru alet tepside hafifçe sallanır ve kenarında yumuşak sıcak parıltı nabız atar (2–3 yaşta 4 sn). |
| **14 sn boşta** | Hasta derdini bir kez daha yumuşakça işaret eder (dizini tutar / burnunu çeker / esner). |
| **22 sn boşta** | Yarı saydam küçük el gölgesi hareketi **bir kez** gösterir ve kaybolur. |

**Yasak anlatıcı / Kino sözcükleri (birim testiyle denetlenir):** `dokun`, `tıkla`, `bas`, `sürükle`, `şimdi şunu`, `yanlış`, `hatalı`, `hızlı ol`, `çabuk`, `süre`, `kaybettin`, `aferin` (yerine somut övgü: *"Kalbi çok sakin attı!"*, *"Dizi pırıl pırıl oldu!"*).

### 3c. Çocuğun Anlamlı Seçimleri (Her Hastada En Az 3 Gerçek Karar)
1. **Bekleme odasında kimi önce alacağı** (2–3 hasta arasından).
2. **Desenli yara bandı seçimi** (yıldızlı, kalpli, gökkuşağı, patili — seçilen desen hastanın üstünde kalır ve kapanış repliği buna uyar!).
3. **Doğal içecek / macun seçimi** (ıhlamur · papatya · ballı ılık su; diş macununda nane · portakal · sade köpük — sıfır çilek! Limon eklenirse komik ekşi yüz gülüşü!).
4. **Yıldız çıkartması rengi** (altın sarı, nane yeşili, gök mavisi — göğüste kalır!).
5. **Gün sonunda bekleme odasına hangi canlı ödülü ekleyeceği.**

---

## 4. On İki Dokunsal Mini İstasyon (`D1–D12`)

Her istasyon **15–30 sn** sürer, kendine özgü parmak hareketi taşır ve yakın plan tam çözünürlüklü etkileşim sunar:

| Kod | İstasyon & Alet | Parmak hareketi | Fiziksel anlık tepki | Açıldığı gün |
|---|---|---|---|---|
| **D1** | **Stetoskop** *(İçerideki Davul)* | Ucu hastanın göğsünde gezdir, kalp noktasında 2 sn tut | Kalbe yaklaştıkça `güm-güm!` ritmi hızlanır ve güçlenir; ekran kenarında çok hafif pembe nabız parıltısı. 2 sn tutulunca hasta kıkırdar (*"İçimde davul var!"*). **Gizli şaka:** Karnına tutulursa `gurrr!` karın gurultusu! | Gün 1 |
| **D2** | **Islak Pamuk & Desenli Yara Bandı** | Pamuğu çamur üstünde ileri-geri sürt → %90 açılınca 4 banttan birini seç, çiziğe bırak, parmakla üstünden geçip düzleştir | Gerçek canvas silme maskesi: parmak geçtikçe çamur erir, alttan iki minik pembe çizik çıkar. Bant yapışıp düzleştirilince kabarcıklar söner, `"Pıt!"` sesiyle parlar ve **kapanışa kadar dizde kalır**. | Gün 1 |
| **D3** | **Ateş Ölçer + Battaniye / Serin Bez** *(İki ayrı mantık!)* | Alın termometresini alna 1,5 sn tut → **Yeşil (normal / üşümüş):** yumuşak battaniyeyi omuzlara çekip sar → **Kırmızı (hafif ateş):** serin bezi su kâsesine daldır, sık, alna koy | **Üşüyen hasta (Lokum):** termometre yeşil `bip-bip`, battaniye sarılınca titreme durur (*"Ohhh, sıcacık!"*). **Ateşli hasta (Baba):** termometre sıcak kırmızı `bip-bip`, serin bez alna konunca 3 minik beyaz buhar halkası yükselir, kızarıklık geçer (*"Ferahladım!"*). | Gün 2 |
| **D4** | **Ihlamur & Sıcak İçecek Köşesi** | Cezveden/sürahiden ılık suyu fincana dök → ıhlamur çiçeği ya da bal kaşığı ekle → parmakla daire çizerek karıştır → hastaya uzat (3 yudum) | Daire çizdikçe ince buhar kıvrılır; her yudumda `"Lıkır!"` sesi + hasta rahatlayıp gülümser. *(Limon sıkılırsa 1 sn komik ekşi yüz + kahkaha!)* | Gün 2 |
| **D5** | **Büyüteç + Yeşil Yaprak / Cımbız** *(Güvenlik ayrımı!)* | Büyüteci gezdir (camın içi gerçekten 2× büyütür!) → **Diz/pati:** cımbızla sapından/ucundan tutup çek → **Kulak dış tüyü:** yeşil yaprağı böceğin yanına yaklaştır | **Diz/pati:** yaprak/diken biraz direnir, uzar, `"Pıt!"` diye çıkar ve süzülerek düşer. **Kulak dış kenarı (Bulut):** asla cımbız sokulmaz! Yeşil yaprak yaklaşınca uğur böceği neşeyle yaprağa yürür, kanatlarını açıp `"Vızz!"` diye pencereye uçar! | Gün 3 |
| **D6** | **Ağız Feneri & Diş Fırçası** *(Kocaman Aaa!)* | Önce feneri yak (isteğe bağlı Kino'nun avucuna tutup göster — kitaptan!) → hasta `"Aaaaa!"` der → 3 macundan birini seç (nane/portakal/sade — çilek yok!) → dişlerde ileri-geri fırçala → su bardağıyla çalkala | Fırçaladıkça beyaz köpük baloncukları çoğalır, kırıntılar erir; çalkalamada `"Blup-blup!"` + yıldız pırıltısı! | Gün 4 |
| **D7** | **Sihirli Röntgen** *(İmza 5-sn Reklam Mekaniği!)* | Mavi çerçeveli röntgen ekranını hastanın gövdesinde parmakla kaydır | Çerçevenin içi X-ray katmanına dönüşür: karikatür kemikler + **karaktere özel komik bulgu** (Lokum'da 3 mandalina dilimi, Dede'de uçuşan hıçkırık baloncukları, Mino'nun cebinde çıngıraklı top, Zıpzıp'ta bütün havuç)! Bulguya dokununca `"Aha!"` parıltısı. | Gün 5 |
| **D8** | **Karın Muayenesi & Gıdık** *(Kitap kanonu)* | Önce iki eli birbirine sürterek ısıt (kitaptan!) → hastanın karnında 3 yumuşak dokunuş/daire masajı yap | Eller ısınınca minik sıcak parıltı; 2. masajda hasta gıdıklanıp kendi ElevenLabs sesiyle kahkaha atar, midedeki gurultu diner! | Gün 5 |
| **D9** | **Göz Damlası & Mendil** | Damlalığı gözün üstünde hizala, sık (`pıt!` tek mavi damla) → yumuşak mendille göz kenarını / hapşırık burnunu nazikçe sil | Damla düşünce sarı polen tanecikleri uçup gider, gözler pırıl pırıl açılır; mendilde `"Hapşu!"` sonrası tertemiz gülümseme! | Gün 6 |
| **D10** | **Zürafa Boy Ölçer** *(Kitap kanonu)* | Ahşap çubuğu yukarıdan hastanın başının üstüne indirip bırak | Çizgi tık diye yerleşir! **Şaka:** Kino/Lokum bazen parmak ucuna kalkar (çocuk fark edip patisine dokununca topuğunu indirip kıkırdar); Bulut *"Yünüm de sayılıyor mu?"* diye sorar! | Gün 2 & Rutin |
| **D11** | **Doğal Vitamin Kaşığı** *(Matematik köprüsü)* | Şişeden kaşığa bal/portakal/nane şurubu dök (çilek yok!), dolu/yarım kaşığı hastaya uzat | Tatlıysa `"Mmmm!"`, naneli/ekşiyse komik yüz + kahkaha! | Gün 6+ |
| **D12** | **Yıldız Çıkartması & Damgalı Sağlık Karnesi** *(Final)* | 3 yıldız çıkartmasından birini seçip hastanın göğsüne yapıştır → ahşap damgayı sağlık karnesinin boş dairesine bastır ve kaldır | Yıldız göğüste kalır ve parlar; damga `"PAT!"` sesiyle mürekkep izi bırakır, karne uçarak duvardaki mantar panoya asılır! | Her gün |

---

## 5. On Dört Tam Vaka Senaryosu (Duygu Yayı + Yaş Yolları + Kapanış Şakası)

> **Yaş basamağı kuralı (tüm vakalarda ortak):**
> - **2–3 yaş:** Günde **2 hasta**, her hastada **2 kısa adım**; tepside yalnız o anki 1–2 alet; 4 sn'de nazik sallanma; damga isteğe bağlı (otomatik kutlama).
> - **4 yaş:** Günde **3 hasta**, her hastada **2–3 adım**; tepside 3–4 alet.
> - **5+ yaş:** Günde **3 hasta**, her hastada **3 adım** (teşhis + 2 tedavi); tepside 5–6 alet; çocuk önce dinleyip/bakıp sırayı kendi kurar.

| # | Hasta | Gün | Duygu yayı (Baş → Orta → Final) | Giriş repliği | 2–3 yaş | 4 yaş | 5+ yaş | Kapanış şakası & replik |
|---|---|---|---|---|---|---|---|---|
| **1** | **Oyuncak Kuzu** *(Alıştırma)* | Gün 1 | Pelüş → *"Mee!"* → Yıldızlı | Kino: *"Önce Kuzu'ya bakalım mı?"* | D1 Stetoskop → D12 Yıldız | D1 Stetoskop → D2 Bant → D12 Yıldız | D1 Stetoskop → D2 Bant → D12 Yıldız & Damga | Kuzu hafifçe zıplar (`mee!`). Kino: *"Kuzu hazır! Sıra arkadaşlarda!"* |
| **2** | **Zıpzıp** *(Dizde çalı sıyrığı — Canlı Örnek!)* | Gün 1 | Korkulu (kulak düşük) → Gülümseyen → Zıplayan | *"Çalıdan atladım, dizim acıyor. Acıyacak mı?"* | D1 Stetoskop → D2 Bant → D12 Yıldız | D1 Stetoskop → D2 Pamuk & Bant → D12 Yıldız | D1 Stetoskop → D5 Büyüteç & Cımbız (yaprak) → D2 Pamuk & Bant → D12 Yıldız & Damga | Kapıya koşar, döner, zıplayıp bandı gösterir: **"Bak, artık cesurum!"** |
| **3** | **Lokum** *(Soğuk dondurma üşümesi — v2 DÜZELTİLDİ!)* | Gün 2 | Titreyen, burnu kızarık → Battaniyede sıcak → Neşeli | *"Hapşu! Çok soğuk dondurma yedim, üşüdüm!"* | D3 Ateş ölç (Yeşil/Normal!) → D3 Battaniye | D3 Ateş ölç (Yeşil) → D3 Battaniye → D4 Ilık Ihlamur | D1 Stetoskop → D3 Ateş ölç (Yeşil) & Battaniye → D4 Ilık Ihlamur | Battaniyeden kafasını çıkarıp zıplar: **"Ohhh, sıcacık oldum! Hav!"** *(Serin bez KULLANILMAZ!)* |
| **4** | **Bulut** *(Boynuzda bal + boy ölçümü)* | Gün 2 | Utangaç, boynuz yapışkan → Temiz → Gururlu | *"Bal kavanozuna çok yaklaştım!"* | D2 Pamukla balı sil → D12 Yıldız | D2 Pamuk → D10 Boy ölçer → D12 Yıldız | D1 Stetoskop → D2 Pamukla balı sil → D10 Boy ölçer | Boy ölçerde kulaklarını dikip sorar: **"Boynuzum pırıl pırıl! Yünüm de sayılıyor mu?"** |
| **5** | **Bulut** *(Kulak dış tüyünde uğur böceği — v2 DÜZELTİLDİ!)* | Gün 3 | Kıkırdıyor ama şaşkın → Böcek uçunca rahat → Mutlu | *"Kulağımın kenarı çok gıdıklanıyor, hihi!"* | D5 Büyüteç → **D5 Yeşil Yaprak** (böcek yaprağa geçip uçar!) | D5 Büyüteç → **D5 Yeşil Yaprak** → D12 Yıldız | D5 Büyüteç → **D5 Yeşil Yaprak** → D1 Stetoskop | Pencereye el sallar: **"Güle güle uğur böceği! Artık gıdıklanmıyor!"** *(Kulağa asla cımbız sokulmaz!)* |
| **6** | **Mino** *(Patide küçük diken)* | Gün 3 | Patisini havada tutar → Çıkınca rahat → Zıplar | *"Çimende yürürken patime diken battı!"* | D5 Cımbızla çıkar → D2 Bant | D5 Büyüteç → D5 Cımbız → D2 Bant | D5 Büyüteç → D5 Cımbız → D2 Pamuk & Bant | İki kez yükseğe zıplar: **"Miyav! Artık yine zıplayabilirim!"** |
| **7** | **Mino** *(Dişlerde kurabiye kırıntısı)* | Gün 4 | Ağzı kapalı utangaç → *"Aaaa!"* → Pırıl pırıl | *"Çok kurabiye yedim, dişlerim yapış yapış!"* | D6 Diş fırçala → Çalkala | D6 Ağız feneri → Diş fırçala → Çalkala | D6 Ağız feneri (önce Kino avucuna!) → Macun seç & Fırçala → Çalkala | Kocaman gülümser, dişten pırıltı çıkar: **"Bak, dişlerim yıldız gibi parlıyor!"** |
| **8** | **Lokum** *(Boğaz gıdıklanması)* | Gün 4 | Sesi kısık, şaşkın → Ilık ıhlamur → *"Hav!"* | *"Aaaa derken sesim komik çıkıyor!"* | D6 Ağız feneri → D4 Ilık Ihlamur | D6 Ağız feneri → D3 Ateş ölç (Yeşil) → D4 Ihlamur | D6 Ağız feneri → D3 Ateş ölç → D4 Ballı Ihlamur | Yüksek sesle sevinçli havlar: **"Hav! Hav! Sesim geri geldi!"** |
| **9** | **Dede Hasan** *(Hıçkırık · Sihirli Röntgen!)* | Gün 5 | *"Hık!"* sıçrar → Röntgende baloncuk → Sakin | *"Hık! Çayı hızlı içtim, hıçkırık tuttu!"* | D7 Röntgen → D4 Ilık Su | D7 Röntgen → D4 Ilık Su → D12 Yıldız | D7 Röntgen (baloncuklar!) → D4 Ilık Su (3 yudum) → D1 Stetoskop | Kasketini selam gibi kaldırır: **"Hıçkırığım geçti! Çok yaşa minik doktor!"** |
| **10** | **Lokum** *(Guruldayan karın · Sihirli Röntgen!)* | Gün 5 | Karnını tutar (`gurrr!`) → 3 mandalina dilimi → Gıdık kahkahası | *"Karnım gurulduyor, çok mandalina yedim!"* | D7 Röntgen → D8 Karın masajı | D7 Röntgen → D8 Elleri ısıt & Karın masajı → D12 Yıldız | D7 Röntgen (3 mandalina!) → D8 Elleri ısıt & Karın masajı → D4 Papatya/Ihlamur | Gıdıklanıp kıkırdar: **"Hihi, gıdıklandım! Karnım çok rahat!"** |
| **11** | **Mila** *(Gözde çiçek poleni)* | Gün 6 | Gözünü hafif kırpıştırır → Damla → Tertemiz | *"Çiçek kokladım, gözüme toz kaçtı!"* | D9 Göz damlası → D9 Mendil | D5 Büyüteç → D9 Göz damlası → D9 Mendil | D5 Büyüteç → D9 Göz damlası → D9 Mendil & D12 Yıldız | Bıdık kıkırdamasıyla el sallar: **"[giggles] Her yer pırıl pırıl!"** |
| **12** | **Baba Murat** *(Bahçede hafif ateş + boy yarışı)* | Gün 6 | Yanakları pembe, yorgun → **Serin bezden buhar!** → Enerjik | *"Hapşu! Bahçede biraz ateşim çıktı doktor!"* | D3 Ateş ölç (Kırmızı!) → **D3 Serin Bez** | D3 Ateş ölç (Kırmızı!) → **D3 Serin Bez** → D4 Ihlamur | D1 Stetoskop → D3 Ateş ölç (Kırmızı) & **Serin Bez** → D4 Ihlamur → D10 Boy ölçer | Boy ölçerde başı tepeye değer, güler: **"Ferahladım! Bakalım benden uzun kim varmış!"** |
| **13** | **Anne Defne** *(Rutin Kontrol Günü — Koruyucu Hekimlik!)* | Gün 7 | Neşeli & sakin → *"Sağlıklıyım!"* → Yıldızlı | *"Hasta değilim doktor, rutin kontrole geldim!"* | D1 Stetoskop → D10 Boy ölçer | D1 Stetoskop → D10 Boy ölçer → D12 Damga | D1 Stetoskop → D6 Ağız feneri → D10 Boy ölçer & D12 Damga | *"Hasta olmadan da kontrole gelmek harika!"* *(Doktor = yalnız hastalık değil, sağlıklı büyüme!)* |
| **14** | **Mino** *(Sürpriz Röntgen: Cepteki Kayıp Çıngırak!)* | Gün 7+ | Şaşkın (`tıngır!`) → Röntgende top → Kahkaha | *"Yürüyünce karnımdan tıngır sesi geliyor!"* | D7 Röntgen → Patisiyle cepten çıkar | D1 Stetoskop → D7 Röntgen → Çıngırak çıkar | D1 Stetoskop → D7 Röntgen (cepteki top!) → D12 Yıldız | Topu havaya atıp yakalar: **"Miyav! Meğer cebimdeymiş!"** |

*(Gün 8 ve sonrası: tüm 14 vaka + Babaanne'nin buharlı gözlüğü ve Zıpzıp'ın bütün havuç röntgeni sürprizleriyle her gün 3 taze hasta karışık döner; aynı karakter art arda iki gün gelmez.)*

---

## 6. On Gizli Sürpriz (Keşif Ödülleri — `RESTORAN.md` §9 Standardı)

Hiçbiri görev değildir; meraklı çocuk kurcaladıkça bulur ve kahkaha atar:

1. **Stetoskopu Kino'nun kendi göğsüne tut:** Kino kıkırdar: *"Hihi, benim kalbim de hızlı atıyor!"*
2. **Stetoskopu hastanın karnına (göğüs yerine) tut:** Komik `gurrr!` karın gurultusu; hasta kızarıp güler.
3. **Ağız fenerini önce Kino'nun avucuna tut:** Avuçta yumuşak sarı ışık halkası parlar (`content/kitap-doktor.json` kanonu!), hasta korkusu azalıp gülümser!
4. **Röntgen çerçevesini pencere yanındaki saksıya kaydır:** Saksının içinden toprağın altındaki kökler ve minik bir solucan görünür!
5. **Bekleme odasındaki akvaryuma dokun:** Turuncu balık havada takla atar, 3 baloncuk `blup-blup!` yükselir.
6. **Oyuncak Kuzu sepetine dokun:** Kuzu minik zıplayıp `"Mee!"` der, kırmızı kurdelesi sallanır.
7. **Boy ölçerde Lokum'un parmak ucuna kalkması:** Lokum gizlice yükselir; çocuk patisine dokununca topuğunu indirip kıkırdar!
8. **Ihlamur fincanına limon dilimi ekle:** Hasta 1 sn ekşi yüz yapıp hemen kahkaha atar (ceza yok!).
9. **Duvardaki mantar panoda eski sağlık kartına dokun:** O arkadaşın küçük sevinç sesi yeniden çalar!
10. **Pencere dışındaki çalıya 3 kez dokun:** Küçük mavi kuş uçup pencere pervazında bir kez cikleyip gider!

---

## 7. Klinik Büyümesi, Ekonomi, Kayıt ve Erişim

### 7a. Bekleme Odası Canlı Ödülleri (`Klinik Defteri`)
Her hasta iyileşince **+2 klinik yıldızı** verir (ceza veya kesinti yok; 2–3 hasta = günde 4–6 yıldız). Gün sonunda **Klinik Defteri** açılır:

| Gün | Açılan yeni alet | Bekleme odası ödülü (yıldız) | Canlı dokunma tepkisi |
|---|---|---|---|
| **Gün 1** | Stetoskop, Pamuk & Yara Bandı | **Renkli Balık Akvaryumu** (4 ★) | Dokununca balık takla atar, baloncuk çıkar. |
| **Gün 2** | Ateş Ölçer, Battaniye, Ihlamur, Boy Ölçer | **Zürafa Boy Ölçer** (4 ★) | Bekleyen hastalar sırayla boyunu ölçer. |
| **Gün 3** | Büyüteç, Yeşil Yaprak, Cımbız | **Oyuncak Kuzu Sepeti** (5 ★) | Dokununca Kuzu meleyip zıplar. |
| **Gün 4** | Ağız Feneri & Diş Fırçası + **Serbest Klinik** | **Çiçekli Saksı & Güneşli Pencere** (5 ★) | Dokununca çiçek açar, pencereden kuş geçer. |
| **Gün 5** | Sihirli Röntgen & Karın Muayenesi | **Ihlamur & Sıcak Çay Köşesi** (6 ★) | Dokununca buhar tüter, fincan şıngırdar. |
| **Gün 6** | Göz Damlası, Mendil & Serin Bez | **Yıldız Çıkartma Panosu** (6 ★) | Tüm damgalı sağlık karneleri duvara dizilir! |

### 7b. Kilit / Erişim **[ÖNERİ — kilit kararı Barış'ta]**
> **DİKKAT:** Aşağıdaki dağılım yalnızca `src/engine/erisim.ts` (Minik Şef ve Okula Hazırlanalım kalıbı) ile uyumlu bir **öneridir**. Mağaza kilidi kararı Barış'a aittir; Barış onaylamadan kilit aktif edilmez.
- `[ÖNERİ]` `doktor: 'ucretsiz'`
- `[ÖNERİ]` `'doktor/gun-1': 'ucretsiz'`, `'doktor/gun-2': 'ucretsiz'` *(İlk 4 vaka: Kuzu, Zıpzıp, Lokum üşümesi, Bulut balı + Akvaryum & Boy Ölçer)*
- `[ÖNERİ]` `'doktor/*': 'abonelik'` *(Gün 3–7+, Büyüteç/Yaprak/Cımbız, Diş Bakımı, Sihirli Röntgen, Göz Damlası, Serbest Klinik)*

### 7c. Kayıt Şeması (`localStorage['minkino-doktor-v1']`) & Test Bayrakları
```ts
export interface DoktorKaydi {
  surum: 1;
  gun: number;                  // 1..∞
  yildiz: number;               // birikmiş klinik yıldızı
  acilanAletler: string[];      // ['stetoskop', 'pamuk', 'bant', ...]
  beklemeOdasiSusleri: string[];// ['akvaryum', 'boy-olcer', ...]
  iyilesenKartlar: Array<{
    vakaId: string;
    hastaId: string;
    bantDeseni?: 'yildiz' | 'kalp' | 'gokkusagi' | 'pati';
    yildizRengi: 'sari' | 'nane' | 'mavi';
    gun: number;
  }>;
  serbestKlinikAcik: boolean;   // Gün 4 sonrası açılır
  sonHastaGunleri: Record<string, number>; // aynı hasta art arda 2 gün gelmez
}
```
**Test URL bayrakları (E2E ve yönetici denetimi için):**
- `?test=1` — ses/animasyon deterministik, hızlı geçiş
- `?test=1&vaka=zipzip-diz&yas=5` — doğrudan belirli vakayı ve yaş yolunu açar
- `?test=1&gun=5&yildiz=20` — belirli gün ve yıldızla Klinik Defteri testi

### 7d. Veli "Evde 1 Dakika" Sağlık Köprüsü (Çizim Gerektirmez)
Ebeveyn ekranında çocuğun bugün oynadığı alete göre tek satırlık somut ev önerisi:
- *Stetoskop:* "Bugün arkadaşlarının kalp atışını dinledi. Evde elinizi göğsünüze koyup 'içerideki davulu' birlikte dinleyin."
- *Diş fırçası:* "Bugün Mino'nun dişlerini parlattı. Akşam 'Mino gibi yıldız diş yapalım!' diyerek birlikte fırçalayın."
- *Kulak & Yaprak:* "Bugün kulağa cımbız/çubuk sokmadan yaprakla yardım etmeyi oynadı — kulak temizliğinde güvenli alışkanlık."
- *Doktor randevusu öncesi:* "Gerçek kontrolden bir gün önce 'Oyuncak Kuzu' alıştırmasını açıp birlikte oynayabilirsiniz."

---

## 8. Kamera, Ölçek ve Yatay Telefon Düzeni (`844 × 390` Asıl Ölçü)

- **Ana ekran oranı:** `16:9` (yatay telefon `844 × 390` CSS px, iPhone Pro `932 × 430`, iPad yatay `1366 × 1024`). Dikey desteklenmez (Minkino oyunları yatay oynanır — `KULLANICI-KURALLARI.md`).
- **Geniş sakin kadraj:** Muayene odasında (`fon-muayene.png`, `2752 × 1536`) nane koltuk ekran yüksekliğinin yaklaşık **%33'ü**; oturan hasta koltuğun içine doğal oturur, toplam karakter alanı sahnenin **≤ %24'ü** kalır. Sağdaki ahşap masanın üstünde alet tepsisi durur; çocuk parmağıyla geniş boş alanda rahat çalışır.
- **Yakın plan istasyonları:** Dize, kulağa, ağza veya göğse geçildiğinde aynı odada yumuşak geçişle **tam çözünürlüklü `2048 × 1152` yakın plan** açılır (küçük karakter sprite'ı büyütülmez!). Sağ kenarda (veya alt-sağ tepside) o istasyonun araçları ≥ `64 × 64` CSS px dokunma alanıyla durur.
- **Kalıcılık bağlantısı:** Yakın planda yapıştırılan yara bandının deseni (`bant-yildiz` / `kalp` / `gokkusagi` / `pati`), kamera geri açıldığında hastanın dizinde küçük katman olarak taşınır ve kapı önü kapanış zıplamasında görünür.

---

## 9. Teknik Mimari ve Kodcu İş Paketleri (`doktor/`)

Mevcut Minkino çok-sayfalı Vite mimarisiyle birebir uyumludur (`sef/`, `alfabe/`, `matematik/` ile aynı ortak motor `src/audio/ses.ts`, `src/engine/menu-yas.ts`, `src/engine/erisim.ts`, `src/ui/dom.ts`):

```
doktor/
├── index.html
└── src/
    ├── main.ts                 # Giriş, yaş okuma, test bayrakları, ses ön yükleme
    ├── model.ts                # 14 vaka, yaş yolları, karakter meta, bekleme ödülleri
    ├── kayit.ts                # localStorage['minkino-doktor-v1'] + göç + test tohumları
    ├── ses.ts                  # ElevenLabs replik eşlemesi + Web Audio dokunsal efektler
    ├── sahne/
    │   ├── bekleme-odasi.ts    # Günlük 2–3 hasta seçimi + 6 canlı ödül etkileşimi
    │   ├── muayene-odasi.ts    # Geniş oda, Kino ipuçları, duygu yayı, kalıcı bant, kapanış şakası
    │   └── klinik-defteri.ts   # Gün sonu yeni alet + bekleme odası ödül alımı
    └── mini/
        ├── arayuz.ts           # Ortak istasyon sözleşmesi (aşağıda)
        ├── stetoskop.ts        # D1: Mesafeye göre hızlanan güm-güm + nabız halkası
        ├── pamuk-bant.ts       # D2: Canvas silme maskesi + 4 desenli bant + düzleştirme
        ├── ates-battaniye.ts   # D3: Yeşil=battaniye / Kırmızı=serin bez & buhar
        ├── ihlamur.ts          # D4: Dök, ekle, dairesel karıştır, 3 yudum
        ├── buyutec-yaprak.ts   # D5: 2× gerçek mercek + cımbız çekişi / kulakta yaprak
        ├── dis-bakimi.ts       # D6: Ağız feneri (avuç şakası!) + fırça köpüğü + çalkala
        ├── rontgen-karin.ts    # D7 & D8: Kaydırılabilir X-ray maskesi + elleri ısıtıp gıdıkla
        ├── goz-mendil.ts       # D9: Damlalık hizala-damlat + mendil
        └── boy-karne.ts        # D10 & D12: Zürafa boy ölçer + yıldız çıkartması + PAT damga
```

### 9a. İstasyon Arayüz Sözleşmesi (`doktor/src/mini/arayuz.ts`)
```ts
export type YasGrubu = '2-3' | '4' | '5+';

export interface IstasyonBaglami {
  kok: HTMLElement;
  vakaId: string;
  hastaId: string;
  yas: YasGrubu;
  testModu: boolean;
  sesCal: (id: string) => void;
  efektCal: (ad: 'gum' | 'pit' | 'surt' | 'bant' | 'bip' | 'buhar' | 'blup' | 'damga' | 'zipla') => void;
  kinoIpucu: (replikId: string) => void;
  tamamlandi: (sonuc: { bantDeseni?: string; secim?: string }) => void;
}

export interface MiniIstasyon {
  id: string;
  baslat(b: IstasyonBaglami): void;
  temizle(): void;
}
```

### 9b. Aşamalı Kodcu İş Paketleri (Sürüm 1.2 Penceresi)
- **P0 · Canlı Örnek "Zıpzıp'ın Dizi" *(ŞU AN — Harf oturumu)*:** `doktor/` altında tek vaka (`fon-muayene`, Zıpzıp 4 poz, Kino 3 poz, diz yakın plan 4 katman, 8 alet, 4 bant; `DOKTOR_MENUDE = false`, 1.1'i etkilemez).
- **P1 · Çekirdek + Gün 1–2 Akışı (~4 sa):** Bekleme odası, Klinik Defteri, `kayit.ts`, Kuzu + Zıpzıp + Lokum (üşüme/battaniye/ıhlamur) + Bulut (bal/boy ölçer), D1/D2/D3/D4/D10/D12 + Akvaryum ödülü. *(İlk oynanabilir 1.2 dilimi!)*
- **P2 · Gün 3–4 İstasyonları (~3,5 sa):** Büyüteç + Yeşil Yaprak (Bulut kulak kenarı) + Cımbız (Mino pati), Ağız Feneri & Diş Fırçası, Serbest Klinik düğmesi.
- **P3 · Gün 5–6 İmza İstasyonları (~4 sa):** Sihirli Röntgen (D7, 2× canvas katmanlı maske) + Karın Muayenesi (D8) + Göz Damlası & Mendil (D9) + Baba Murat ateşli vaka (Serin Bez!).
- **P4 · Gün 7+ Rutin Kontrol, 10 Gizli Sürpriz, Ses & E2E Cila (~3 sa):** Anne Defne rutin kontrolü, Mino çıngıraklı top, 10 gizli sürpriz, yasak sözcük birim testi, `844 × 390` + `932 × 430` + `1366 × 1024` Playwright E2E ve video kaydı.

---

## 10. Eşlik Eden Üretim Belgeleri

- **Ölçülü Astra Çizim Brief'i (Sürüm 1.2 · `MD1–MD6`):** [MINIK-DOKTOR-ASTRA-BRIEF.md](MINIK-DOKTOR-ASTRA-BRIEF.md) — dosya adları, tuval boyları, taban çizgileri, sayfa başına en çok 6–8 çizim, onaylı model yolları ve uzuv/bütünlük denetim listesi.
- **ElevenLabs Seslendirme ve Efekt Listesi:** [MINIK-DOKTOR-SES-LISTESI.md](MINIK-DOKTOR-SES-LISTESI.md) — konuşmacıya göre kısa tek-cümle replikler, yasak sözcük kontrolü, `content/elevenlabs-hesap.json` yeni hesap ses durumu ve Web Audio efekt tasarımı.
- **Canlı İlk Örnek Senaryo & Teslim:** [MINIK-DOKTOR-ORNEK.md](MINIK-DOKTOR-ORNEK.md) · [CEVAP-08.md](../antigravity/CEVAP-08.md).

---

## 11. Sert Editör Denetimi (En Büyük 6 Risk ve Somut Önlem)

| # | Risk | Somut önlem |
|---|---|---|
| **1** | **Küçük ekranda (`844 × 390`) ince hareket zorluğu** (cımbızla yaprak tutma, göz damlası hizalama) | Yakın planlar tam ekran `2048 × 1152` açılır; tutma/bırakma hitbox'ı görünür şekilden en az 18 px geniş tutulur (≥ 64 CSS px); cımbız yaprağa yaklaşınca hafif manyetik tutuş sağlar. |
| **2** | **Mobil WebView'da Sihirli Röntgen ve Pamuk Silme performansı** | İki istasyon da tek offscreen 2D canvas üstünde `destination-out` / `clip()` kullanır (WebGL gerekmez); `devicePixelRatio` max 2'de sınırlanır → 60 FPS akıcı. |
| **3** | **2–3 yaş çocuğun 6 alet arasında kaybolması** | 2–3 yaşta tepside **yalnız sıradaki 1–2 alet** görünür; 4 sn'de nazik sallanma başlar; pamuk/büyüteç/damga gibi ince adımlar sadeleştirilir. |
| **4** | **Tıbbi / pedagojik yanlış mesaj riski** | v2'de tamamen kapatıldı: (a) Üşüyen hastada termometre yeşil + battaniye/ıhlamur, serin bez yalnız ateşlide; (b) Kulağa asla cımbız yok, dış tüydeki böceğe yeşil yaprak; (c) Sıfır kan/iğne; (d) Gün 7'de Anne Defne ile koruyucu rutin kontrol. |
| **5** | **ElevenLabs yeni workspace ses eksikliği** (`content/elevenlabs-hesap.json`) | Yeni hesapta şu an yalnız Kino, Ceren ve Polly tanımlı; Zıpzıp, Lokum, Bulut, Mino, Mila, Baba, Dede, Anne sesleri kayıtlı onaylı seslerinden `scripts/ses-hesabi.ts` kalıbıyla klonlanmalı ya da ana hesap kredisi açılmalı. Bu iki fazlı plan `MINIK-DOKTOR-SES-LISTESI.md` içinde açıkça ayrıldı. |
| **6** | **Astra üretim yükü ve 1.1 takvim çakışması** | 1.1 çıkışını sıfır etkiler. İlk örnek (Zıpzıp'ın Dizi, 24 çizim) şimdiden hazır. 1.2 Astra brief'i **Faz 1 (Gün 1–2 oynanabilir dilim: MD1–MD4)** ve **Faz 2 (Gün 3–7 tam paket: MD5–MD7)** olarak bölündü; ilk 2 günde oynanabilir klinik açılır. |
