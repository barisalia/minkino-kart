# Bölüm 4: Elektrikler Kesildi!

> Durum: Barış istedi (2026-09-27 gece: "baştan sona oynanabilir, premium, yeni bir proje"). Fikir: `FIKIR-HAVUZU.md` → 1. Elektrikler Kesildi! (8,3).
> Ölçü: `ekip/senarist-rehberi.md` §1. Tek hedef, her görev hikâyeden doğar, çocuğun sesinin sonucu ekranda görünür, her sesli görevin parmak karşılığı var.
> Oyun, Sesli Maceralar motoruyla (`macera/`): aynı `Sahne`, Mino ve Kino (`banyo-karakter.ts` → `Kisi`). Adres: `/macera/?bolum=elektrik`.

## Tek cümle
Akşam Mino ile Kino küp kule yaparken elektrikler gidiyor. Kino karanlıktan çok korkuyor. **Işıklar gelene kadar Kino'ya cesaret veriyoruz.**

## Tek hedef
Kino'nun korkusunu cesarete çevirmek. Bölümün başında masanın altına saklanan Kino, sonunda büyük lambayı **kendisi** kapatıp "Çadırda gece lambasıyla oynayalım!" diyor. Her görev bu yolun bir basamağı:

| Basamak | Neden bu görev? |
|---|---|
| Kino'yu yumuşak sesle çıkarmak | Korkan birine bağırılmaz; sakin ses güven verir. |
| Fener bulmak | Karanlıkta ilk iş ışık. |
| Işıkla Mino'yu zıplatmak | Işık oyuna dönüşünce Kino gülüyor: korku kırılıyor. |
| Karanlığın seslerini bulmak | Korkutan şeyin adını koyunca korku biter. |
| Karşıdaki Can'a fenerle cevap | Karanlıkta yalnız değiliz. |
| Battaniye çadırı | Karanlık artık oyun yeri. |
| Geldiii! | Işıklar gelince Kino, karanlığı kendisi seçiyor. |

## Duygu eğrisi
Keyif (kule) → **şok: Pıt!** → gerilim (Kino saklanıyor, "Kim var orada?") → merak (çekmece, fener) → **doruk: kahkaha** (Mino ışığın peşinde, Kino'nun kafasına konuyor) → gerilim (karanlığın sesleri) → rahatlama ("Hıhı, benmişim!") → sıcaklık (Can'la selamlaşma) → coşku (çadır, şarkı, "hayalet Kino") → **patlama: Geldiii!** → tatlı final (Kino lambayı kendisi kapatıyor).

## Ne öğretiyor? (çocuğa söylenmez, oyunun içinde)
- Korkan birine yumuşak sesle yaklaşmak.
- Karanlıkta korkutan sesin adını koymak (saat, damlayan saksı, gıcırtılı oyuncak).
- Elektrik kesilince ne yapılır: fener, pil, sakin kalmak; ışık gelince feneri kapatıp yerine koymak.
- Saymak (Can'ın fener işaretleri), birlikte iş yapmak (çadır).

## Yaş ayarı (iki grup: 3-4 ve 5-6)
Yaş farkı yalnız gereken yerde: **2** (fener pilsiz mi), **4** (sessizlik süresi, ses kaynağı parlıyor mu), **5** (işaret sayıları), **6** (alkış sayısı). Diğerleri her yaşta aynı.
Kolaylık kuralı: 2 yanlışta ya da 12 saniyede parmak ipucu; her yaşta 3. denemede kabul. Oyun kilitlenmez.

---

## Mekân ve çizim listesi
- **Arka plan:** Doğum Günü salonu (`assets/parti-sahne/oda`), karartılarak. Karanlık **hiç tam siyah değil**: sıcak lacivert, pencereden ay ışığı süzülüyor. Fener ışığı kodla (yumuşak kenarlı ışık halkası). Yeni arka plan çizimi yok.
- **Mevcut çizimler:** masa (örtülü, `parti/masa`), koltuk (`parti/koltuk`), battaniye (`ege/battaniye-anne`), gece lambası (`ege/gece-lambasi`), Can (`parti/can`, karşı pencerede küçük).
- **Kodla çizilen eşyalar** (kahve kontur, parlak düz renk; `ege-cizim.ts` üslubu). Hareketliler ★:
  - küp kule (4 renkli küp) ★
  - çekmeceli komodin (çekmece açılır) ★ + üstünde saksı (damlar) ★
  - fener ★ (düğmesi, ışığı), pil ★, fırın eldiveni ★, rende ★
  - duvar saati (akrep, yelkovan, sarkaç) ★
  - gıcırtılı oyuncak (lastik kemik) ★
  - 2 sandalye ★, 2 mandal ★, çadır hâlinde battaniye ★
  - büyük ayaklı lamba (ipli düğme) ★
  - karşı apartman (pencerenin içinde, gece silüeti, Can'ın ışıklı penceresi)
- **Karakterler:** Mino (anlatıcı), Kino (korkan), Can (yalnız karşı pencerede, küçük). Yeni karakter yok.
- **Yeni pozlar (Adobe'ye; gelene kadar kodla):**
  - **büzülmüş Kino** (masanın altında: kulaklar düşük, kuyruk arada, gövde toplanmış). Şimdilik: üzgün ifadesi + gövde basık + titreme.
  - **avlanan Mino** (çömelmiş, popo havada, kuyruk dik). Şimdilik: gövde ölçeği (alçak ve geniş) + kıç sallama + kuyruk sallama.

---

## Sahneler

| # | Hikâyede ne oluyor | Çocuk ne yapıyor | Mekanik | Başarınca | Yanlışta (komik, cezasız) | Yaşa göre | Parmakla | Süre |
|---|---|---|---|---|---|---|---|---|
| 1 | Pıt! Karanlık. Kino masanın altına kaçıyor | Kino'ya kısık sesle sesleniyor | kısık ses / fısıltı | Önce kulak, sonra burun, sonra Kino çıkıyor | Bağırırsa Kino örtüyü kafasına çekip büzülüyor | aynı (5-6'da bağırınca bir adım geri) | örtüyü okşa | ~45 sn |
| 2 | Fener lazım, çekmece karanlık | Eşyalara dokunup sesinden feneri buluyor | dokun + dinle (+ 5-6: pili sürükle) | Fener "tık" diye yanıyor | Eldiven Kino'nun kafasında şapka, rende kulağında "Alo? Elektrik?" | 3-4: fener pilli; 5-6: pilsiz, pil bulunup takılır | dokun, sürükle | ~50 sn |
| 3 | Işık lekesi duvarda | Işığı parmağıyla gezdiriyor | sürükle | Mino koltuğa, perdeye, masaya zıplıyor, sonunda Kino'nun kafasına konuyor; Kino kahkaha | yok (her yer oyun) | aynı | sürükle | ~45 sn |
| 4 | Karanlığın sesleri | Susup dinliyor, sesin geldiği yere ışık tutuyor | sessizlik + dokun | Tik-tak saatmiş, tıp-tıp saksıymış, gıcırtı Kino'nun altındaki oyuncakmış | Ses çıkarsa "ses" kayboluyor, baştan dinlenir | 3-4: 1,5 sn sessizlik, kaynak kıpırdar; 5-6: 2,5 sn, ses yalnız soldan/sağdan gelir | kulağa basılı tut | ~50 sn |
| 5 | Karşıda Can fenerle işaret veriyor | Aynı sayıda alkışlıyor | alkış sayma | Can el sallıyor; sonra Kino feneri ağzına alıp sallıyor, Can gülmekten pencereden kayboluyor | Can başını yana yatırıp "Hı?" der, işareti tekrarlar | 3-4: 2 ve 3; 5-6: 3 ve 5 | fenere dokun | ~40 sn |
| 6 | Işıklar gelene kadar çadır | Sandalyeleri, battaniyeyi sürüklüyor, mandallıyor; kamp şarkısını alkışla çalıyor | sürükle + dokun + alkış | Çadırda yıldızlar yanıyor; Kino içeri dalıyor, çadır çöküyor, "hayalet Kino" | yanlış yere bırakılan geri kayar | alkış: 3-4: 6, 5-6: 8 | sürükle, dokun | ~60 sn |
| 7 | Geldiii! | Bağırıyor; feneri kapatıp çekmeceye koyuyor | yüksek ses + sürükle | Kino uluyor, Mino "Miyaav!"; Kino büyük lambayı kendisi kapatıyor | yok | aynı | büyük düğme, sürükle | ~40 sn |

Toplam yaklaşık **5,5 dakika**.

### Sahne 1: Pıt! (~45 sn)
- **Olur:** Salon aydınlık. Mino ile Kino halıda küp kule yapıyor. Kino son küpü dilini çıkarıp dikkatle koyuyor... **PIT!** Işıklar sönüyor, en üstteki küp "tak" diye düşüyor. Pencereden ay ışığı. Kino: *"Kim var orada?"* Kulakları düşük, masanın altına fırlıyor; örtü sallanıyor, örtünün altından yalnız titreyen patileri görünüyor.
- MİNO: *"Eyvah! Elektrikler kesildi."* → *"Kino korktu, masanın altına saklandı."* → *"Onu yumuşacık sesle çağır."*
- **Çocuk:** Kısık sesle "Kino, gel..." der (kelime değil, sesin kısıklığı ölçülür). Her yumuşak seslenişte bir adım: **önce bir kulak** örtünün kenarından çıkar, **sonra burun** ("Iı?"), **sonra Kino** yavaşça çıkıp Mino'ya sokulur.
- **Yanlışta:** Bağırırsa Kino örtüyü kafasına çekip büzülür, örtü titrer (balon: "Iıı!"). Mino: *"Şşş, daha yumuşak. Kino korkuyor."* 5-6 yaşta bir adım geri gider; 3-4 yaşta yalnız titrer.
- **Parmakla:** Örtüyü okşamak (parmağı örtünün üstünde gezdirmek).
- KİNO (çıkınca): *"Çok karanlık… Korkuyorum."* MİNO: *"Fener bulalım. Çekmecede vardı!"*

### Sahne 2: Çekmecede fener (~50 sn)
- **Olur:** Kamera komodine yaklaşır, çekmece "gıcır" diye açılır. İçi karanlık; parmağın altında küçük bir ışık halkası görünür (dokununca içi seçilir).
- MİNO: *"Eşyalara dokun, sesini dinle."* → *"Fenerin düğmesi tık tık der."*
- **Çocuk:** Eşyalara dokunur, eşya sallanır ve kendi sesini çıkarır: pil "tıkır tıkır", fener "tık tık", eldiven "pof", rende "şırr".
- **Yanlış eşya (komik):** Eldiven çekmeceden uçar, Kino kafasına geçirir: *"Bu şapka bana olmadı."* Rende uçar, Kino kulağına dayar: *"Alo? Elektrik?"* Sonra eşya çekmeceye geri süzülür.
- **Fener bulununca:**
  - 3-4: Fener çıkar, Mino: *"Düğmesine bas, yak!"* Çocuk düğmeye dokunur: "tık", ışık!
  - 5-6: Düğmeye basılır: "tık"... yanmaz. MİNO: *"Yanmadı! Pili bitmiş. Pil bul!"* Çocuk sesinden pili bulur (tıkır tıkır), MİNO: *"Pili fenere tak."* Pili fenere sürükler, düğmeye basar: ışık!
- **Başarınca:** Fener yanar, çekmecenin içi ve çevre aydınlanır. Kino'nun kulakları biraz kalkar.

### Sahne 3: Işık lekesi (~45 sn)
- **Olur:** Fener duvara yuvarlak bir ışık lekesi düşürür. MİNO: *"Işık yandı! Işığı gezdir."*
- **Çocuk:** Işığı parmağıyla gezdirir (ışık parmağın gittiği yere gider).
- **Görünen sonuç:** Mino ışığa kilitlenir: gözleri lekeyi izler, **çömelir, kıçını sallar, kuyruğu seğirir** ve ışığın durduğu yere atlar: **koltuğa** (yastıkta sekip), **perdeye** (tırmanır, "vızzt" diye kayar), **masaya**. Kino önce korkarak bakar, her zıplamada biraz daha yaklaşır.
- Üç zıplamadan sonra MİNO: *"Şimdi ışığı Kino'ya tut!"* Işık Kino'nun kafasına gelince Mino **Kino'nun kafasına konar.** Kino kahkahayı basar: *"Işık! Ben de yakalayacağım!"* Kino da ışığın peşinde zıplar. **Korkunun kırıldığı an.** MİNO: *"Bak, Kino artık gülüyor!"*
- **Parmakla:** Aynı (zaten parmakla).

### Sahne 4: Karanlığın sesleri (~50 sn)
- **Olur:** Birden hepsi durur. Karanlıktan bir ses... Kino yeniden büzülür: *"Ne o?!"* MİNO: *"Şşş, dinleyelim. Hiç ses çıkarma."*
- **Çocuk (üç tur):** Susar (ekranda sessizlik halkası dolar). Halka dolunca ses gelir. MİNO: *"Bu ses nereden geldi? Işık tut!"* Çocuk sesin geldiği yere dokunur, ışık oraya gider:
  1. **Tik-tak:** Duvar saati. MİNO: *"Tik tak… Saatmiş!"* Sarkaç sallanır.
  2. **Tıp-tıp:** Komodinin üstündeki saksıdan damla. MİNO: *"Tıp tıp… Saksıdan su damlıyor!"*
  3. **Gıyk!:** Ses Kino'dan gelir. Işık Kino'ya tutulunca Kino kalkar, altından lastik kemik çıkar: *"Hıhı, benmişim!"* Kemiği sıkar: "gıyk gıyk".
- **Yanlışta:** Susulmazsa ses gelmez, halka boşalır (Kino kulağını diker, bekler). Yanlış yere ışık tutulursa orada bir şey yoktur, ışık kısaca titrer.
- **Yaşa göre:** 3-4: 1,5 sn sessizlik, sesin kaynağı ses gelince kıpırdar. 5-6: 2,5 sn, kaynak kıpırdamaz; ses soldan/sağdan gelir (hoparlörde yön).
- **Parmakla:** Kulak düğmesine basılı tutmak (sessizce beklemek).

### Sahne 5: Karşıdaki Can (~40 sn)
- **Olur:** Pencerenin dışında karşı apartman. Bir pencerede Can, elinde fener: yak-söndür, yak-söndür. MİNO: *"Bak, karşıda Can var!"* → *"Kaç kere yaktı? Sen de o kadar alkışla!"*
- **Çocuk:** Can'ın yakıp söndürdüğü kadar alkışlar. Her alkışta bizim fenerimiz bir kere yanıp söner (pencere camında ışık).
- **Başarınca:** Can sevinçle el sallar ("Selam!"). MİNO: *"Can sana selam verdi!"* İkinci tur.
- **Yanlışta:** Can başını yana yatırır ("Hı?"), işareti tekrarlar.
- **Final şakası:** Kino feneri ağzına kapıp sallar; ışık tavanda çılgınca döner. Can gülmekten pencereden kaybolur ("Hahaha!").
- **Yaşa göre:** 3-4: 2 ve 3 işaret. 5-6: 3 ve 5 işaret.
- **Parmakla:** Fener düğmesine dokunmak.

### Sahne 6: Battaniye çadırı (~60 sn)
- **Olur:** MİNO: *"Işıklar gelene kadar çadır kuralım!"*
- **Çocuk:**
  1. MİNO: *"Önce sandalyeleri getir."* İki sandalyeyi halının iki yanındaki ışıklı yerlere sürükler.
  2. MİNO: *"Şimdi battaniyeyi üstüne ser."* Battaniyeyi sandalyelere sürükler; battaniye açılıp çadır olur.
  3. MİNO: *"Mandallarla tuttur."* İki mandala dokunur, "çıt" diye tutturur.
  4. MİNO: *"Kamp şarkısı! Alkışla çal."* Her alkış şarkının bir notasını çalar, çadırın üstünde bir yıldız yanar.
- **Şaka:** Kino sevinçle içeri dalar, kuyruğu sandalyeye çarpar, **çadır çöker.** Battaniyenin altında bir tümsek dolaşır. MİNO: *"Çadır çöktü! Kino nerede?"* KİNO (altından): *"Buuu! Ben hayalet Kino!"* Sonra kafasını çıkarır, çadır "hop" diye yeniden kurulur.
- **Yaşa göre:** Alkış: 3-4 yaşta 6, 5-6 yaşta 8.
- **Parmakla:** Sürükle, mandala dokun, şarkıda yastığa (çadıra) vur.

### Sahne 7: Geldiii! (~40 sn)
- **Olur:** Lamba "vızz vızz" titreyip yanar, oda aydınlanır. Pencereden mahalleden "Geldiii!" balonları yükselir. MİNO: *"Işıklar geldi!"* → *"Hadi, sen de bağır: Geldiii!"*
- **Çocuk:** Yüksek sesle bağırır (ya da büyük "GELDİİ!" düğmesine basar).
- **Görünen sonuç:** Kino kafasını kaldırıp uluyor: *"Geldiii! Auuu!"* Mino gözlerini sıkıp "Of, kulaklarım!" der, sonra o da katılır: "Miyaav!"
- MİNO: *"Feneri kapat, çekmeceye koy."* Çocuk fenere dokunup kapatır ("tık"), çekmeceye sürükler; çekmece kapanır.
- **Final:** Kino büyük lambaya yürür: *"Lambayı ben kapatırım!"* İpi çeker, oda loşlaşır, çadırdaki gece lambası yanar. KİNO: *"Çadırda gece lambasıyla oynayalım!"* MİNO: *"Aferin Kino! Artık karanlıktan korkmuyorsun."* İkisi çadıra girer, çadır içeriden sıcacık parlar. MİNO: *"Karanlıkta bile birlikte eğlendik!"*
- **Ödül:** Albüme "Cesur Kino" kartı: fener tutan Kino.

---

## Mino'nun cümleleri (seslendirilecek, `content/macera-elektrik.json` → `mino`)
```
giris:      "Kino ile kule yapıyoruz. Son küp kaldı!"
kesildi:    "Eyvah! Elektrikler kesildi."
korktu:     "Kino korktu, masanın altına saklandı."
cagir:      "Onu yumuşacık sesle çağır."
yumusak:    "Şşş, daha yumuşak. Kino korkuyor."
fener:      "Fener bulalım. Çekmecede vardı!"
dinle:      "Eşyalara dokun, sesini dinle."
tik:        "Fenerin düğmesi tık tık der."
yak:        "Düğmesine bas, yak!"
pil_yok:    "Yanmadı! Pili bitmiş. Pil bul!"
pil_tak:    "Pili fenere tak."
isik:       "Işık yandı! Işığı gezdir."
kino_tut:   "Şimdi ışığı Kino'ya tut!"
guluyor:    "Bak, Kino artık gülüyor!"
dinleyelim: "Şşş, dinleyelim. Hiç ses çıkarma."
nereden:    "Bu ses nereden geldi? Işık tut!"
saat:       "Tik tak… Saatmiş!"
saksi:      "Tıp tıp… Saksıdan su damlıyor!"
can:        "Bak, karşıda Can var!"
say:        "Kaç kere yaktı? Sen de o kadar alkışla!"
selam:      "Can sana selam verdi!"
cadir:      "Işıklar gelene kadar çadır kuralım!"
sandalye:   "Önce sandalyeleri getir."
battaniye:  "Şimdi battaniyeyi üstüne ser."
mandal:     "Mandallarla tuttur."
sarki:      "Kamp şarkısı! Alkışla çal."
coktu:      "Çadır çöktü! Kino nerede?"
geldi:      "Işıklar geldi!"
bagir:      "Hadi, sen de bağır: Geldiii!"
kapat:      "Feneri kapat, çekmeceye koy."
aferin:     "Aferin Kino! Artık karanlıktan korkmuyorsun."
son:        "Karanlıkta bile birlikte eğlendik!"
```
## Kino'nun cümleleri (Kino'nun sesiyle, `kino`)
```
kim_var:    "Kim var orada?"
korkuyorum: "Çok karanlık… Korkuyorum."
sapka:      "Bu şapka bana olmadı."
alo:        "Alo? Elektrik?"
yakalarim:  "Işık! Ben de yakalayacağım!"
ne_o:       "Ne o?!"
benmisim:   "Hıhı, benmişim!"
hayalet:    "Buuu! Ben hayalet Kino!"
geldi:      "Geldiii! Auuu!"
kapatirim:  "Lambayı ben kapatırım!"
oynayalim:  "Çadırda gece lambasıyla oynayalım!"
```
43 cümle, yaklaşık 1050 karakter. Kayıt gelene kadar cihaz sesiyle çalar (seslendirme CI'da).

## Balon tepkileri (seslendirilmez)
"Pıt!", "Iıı!", "Iı?", "Tık!", "Tıkır tıkır", "Pof!", "Şırr", "Tik tak", "Tıp tıp", "Gıyk!", "Selam!", "Hı?", "Hahaha!", "Geldiii!", "Miyaav!", "Of, kulaklarım!", "Hop!", "Çıt!"

## Ses efektleri (hepsi Web Audio, kredi yok)
Pıt (elektrik sönmesi), küp düşmesi, çekmece gıcırtısı, fener düğmesi "tık", pil tıkırtısı, eldiven "pof", rende "şırr", tik-tak, damla "tıp", gıcırtılı oyuncak "gıyk", fener yanıp sönme "vık", mandal "çıt", kamp şarkısı notaları + davul, lamba vızıltısı ve "tık", uluma (sentez).
**Kural:** her efekt `kulak.sustur(ms)` ile çalar; sesli görevlerde müzik durur.

## Müzik
Gece müziği: yumuşak müzik kutusu (Web Audio), yalnız mikrofonun dinlemediği anlarda. Kamp şarkısı: pentatonik 8 notalık basit melodi (telif yok), çocuğun her alkışı bir nota.

## Final
Kino lambayı kendisi kapatır, çadırda gece lambası yanar. "Aferin Kino! Artık karanlıktan korkmuyorsun." Albüme **"Cesur Kino"** kartı.

---

## Kodcuya notlar
1. **Karanlık:** Dünyanın üstünde tek bir lacivert katman (`rgba(20,26,70,.74)`), ortasında yumuşak kenarlı delik; delik yalnız `transform` ile kayar (her karede yerleşim okunmaz). Ay ışığı pencereden süzülen açık bir şerit.
2. **Algılama (kilitli sınıflar, yeni eşik yok):** kısık ses `ege-seviye.ts → SesSeviyesi` (söyleyiş sonucu fısıltı/kısık/yüksek), sessizlik `SessizlikSayaci`, alkış `Alkis`, yüksek ses Doğum Günü'ndeki "Sürpriz!" kuralı (tabanın 24 dB üstü, 0,18 sn).
3. **Sırayla konuşma:** her efekt ve konuşma sırasında mikrofon susar; ses turunda (sahne 4) çalan ses bitene kadar dinlenmez.
4. **Adobe pozları (ad sözleşmesi):** `assets/elektrik/kino-buzulmus.webp`, `assets/elektrik/mino-avlaniyor.webp` (şeffaf, karakter tuvaliyle aynı piksel ölçeği: Kino 1410×1856, Mino 1360×1790 kırpım). Dosya gelince kod o anlarda iskeletin yerine onu gösterir; yoksa kodla poz.
5. **Eşya görselleri:** `assets/elektrik/<ad>.webp` gelirse kodla çizilen SVG'nin yerine geçer (ad: fener, pil, eldiven, rende, saat, saksi, kemik, sandalye, mandal, lamba, komodin, cekmece).
