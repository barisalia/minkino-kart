# Kino ve Ailesi · Oyunlu Çizgi Film: biçim

> 2026-10-10 · Senarist / oyun tasarımı. **TASLAK: Barış görmeden üretime geçilmez.**
> Barış'ın isteği: "Yeni projem şu: oyunlu çizgi film. Hikâyeli oyun gibi. Kino'nun bir gününü anlatacak, sonra bazı kısımları oyunla geçecek."
> Barış'ın uyarısı (aynı gün, Kino'nun Otobüsü için): "Aynı olmuş öbürüyle… farklı şeyler düşünün, gelişin… senarist aynı işi vermesin, sürekli gelişsin." Bu yüzden bu biçimin en sıkı kuralı §8.1: **oyun anı, elimizdeki oyunların kılık değiştirmiş hâli olamaz.**
> İlgili: [SERI-KITABI.md](SERI-KITABI.md) (karakterler, ton) · [oyunlu-bolum-01.md](oyunlu-bolum-01.md) (Bölüm 1) · [KARAKTER-KITI.md](KARAKTER-KITI.md) (kit + §8 Bölüm 1 çizim listesi) · [URETIM-YOLU.md](URETIM-YOLU.md) (kit hattı).
> **Üretim yolu (karar):** uygulamanın içinde canlı, kendi JS film motorumuzda (`film/src`: `motor.ts`, `oyuncu.ts`, `esya.ts`; sahne dosyası `content/film/*.json` biçimi). Karakterler yeni Recraft vektör parça kitinden kesme-kukla iskelet. Blender/MP4 hattı (URETIM-YOLU) başka bir ürün; kit kuralları ve senaryo dili ortak.

---

## 0. Kısaca

- **Ne:** Kino'nun bir günü çizgi film olarak akar. Günün 4-5 doğal anında film durmadan oyuna dönüşür. Çocuk Kino'nun yerine kısa, elle yapılan bir iş yapar: dişini kum saati bitene kadar fırçalar, Lokum'a kahvaltı tabağından bir yüz yapar, ayakkabısını bağlar, ağlayan kardeşini yavaşça okşar, küvette neyin batıp neyin yüzdüğünü dener. İş bitince film kaldığı yerden sürer.
- **His:** "Kino'nun gününe ben de girdim." Oyun hikâyeden doğar, hikâye de oyunun sonucunu taşır.
- **Kimin için:** 3-5 yaş. İki ayar var: 3-4 ve 5-6. Önce telefon, yatay ekran.
- **Seri kitabıyla ilişkisi:** Ton, aile, anlatıcı ve kurallar aynıdır. Seri kitabındaki "tekrarlanan oyun mekaniği yok" kuralı hikâye içindir: bölümde sihirli araç ya da her bölüm dönen bir numara yoktur. Oyun anları gündelik işin kendisidir ve her bölümde başkadır.

## 1. Bölüm uzunluğu

| Parça | Süre |
|---|---|
| Açılış (seri açılışının kısa hâli + bölüm adı) | ~15 sn |
| Hikâye (açılış ve kapanış hariç) | 4-6 dk |
| Oyun anı | **3-5 tane**, her biri 20-60 sn (hedef 35-45 sn) |
| Kapanış kartı + jenerik | ~20 sn |
| **Toplam** | **~8-10 dk** |

- İlk oyun en geç 1:30'da gelir. Çocuk "bu oyunlu bir film" diye erkenden anlamalı.
- İki oyun arasında en az ~40 sn hikâye olur. Oyunlar üst üste binmez.
- Son sahne (yatak) **oyunsuzdur**. Bölüm sakin, izlenerek kapanır.

## 2. Hikâyeden oyuna geçiş ve dönüş (menü yok)

### Geçiş: köprü (1-2 sn)
1. **Hikâye bir ihtiyaç kurar.** Bu iş zaten yapılacaktır: diş fırçalanacak, Lokum kahvaltı etmiyor, Lokum ağlıyor. Anlatıcı geçmiş zamanla anlatır.
2. **Kamera oyun kadrajına süzülür:** yaklaşır, kayar ya da üstten bakışa döner. Arka plan aynı kalır. Kesme ya da kararma olmaz. Karakterler canlı kalır: nefes alır, göz kırpar, hedefe bakar.
3. **Anlatıcı "oyun sesine" geçer** (§3). Tek bir kısa çağrı yapar. Aynı anda ilk hedef yumuşakça parlar. Müzik, aynı tonun döngülü oyun fonuna çapraz geçer.
4. **Dokunuş hemen geçerlidir.** Çocuk çağrı bitmeden dokunabilir; beklemek yoktur.

Ekranda düğme, yazı, ilerleme çubuğu, puan, yıldız ya da "Başla" yoktur. Tek istisna köşedeki küçük, soluk **duraklat** düğmesidir (ebeveyn için; filmlerde zaten var).

### Dönüş
1. Son adım bitince **1-2 sn kutlama anı** gelir: karakterin tepkisi (Lokum'un kahkahası, Kino'nun "Ben büyüdüm artık!"ı), birkaç parıltı, kısa bir müzik vurgusu. Puan yoktur.
2. Kamera hikâye kadrajına geri açılır, müzik hikâye müziğine geçer, film saati yeniden işler.
3. **Kalıcı iz:** oyunun sonucu hikâyede görünür kalır. Çocuğun seçtiği yara bandı gün boyu Lokum'un dizinde durur. Bağladığı fiyonk parkta koşarken sallanır. Kahvaltı tabağındaki yüz, kapanış kartındaki fotoğrafa girer.
4. Hikâyenin kendisi **dallanmaz**. Yalnız bu küçük izler değişir. Karmaşık sistem yoktur.

## 3. Anlatıcı oyunda nasıl yol gösterir

- **Tek ses:** dizinin anlatıcısı. Oyun için ayrı bir "sunucu" yoktur.
- **Hikâyede:** anlatıcı geçmiş zamanla konuşur, izleyiciye soru sormaz (seri kuralı).
- **Oyunda ("oyun sesi"):** şimdiki zaman, "biz" dili, emir kipi kullanılır: *"Köpüğün üstünde kalalım."* Cümle en çok 5-6 kelime ve 30 harftir. **Soru sorulmaz**: "Hangisi?" denmez, "Gözleri koyalım." denir. Zaman ve dildeki bu değişiklik, çocuğa "şimdi sıra bende" olduğunu kendiliğinden söyler. Seri kuralıyla da çelişmez, çünkü anlatıcı soru sormaz, çocuğu bir işe çağırır.
- **Bir oyun anında** en çok 3 çağrı ve 1 bitiriş cümlesi olur. Aradaki boşluğu karakterler doldurur (Kino: *"Biraz daha!"*). Çoğu tepki sözsüzdür: kulak, kuyruk, kıkırdama.
- **Karakterler kameraya bakmaz.** Ama hedefe bakarlar: Kino köpük topuna, Lokum zeytin kâsesine bakar. **Bakış ilk ipucudur.**
- **"Yanlış" sözü hiç yoktur.** "Olmadı" ya da "tekrar dene" de denmez. Yanlış hamlenin sonucu tatlı bir beden tepkisidir: Lokum hızlı okşanınca irkilir, Kino *"Yavaş, yavaş."* der. Nesne yerine döner.

## 4. Çocuk hiçbir şey yapmazsa: yardım merdiveni

Süre, anlatıcının çağrısı bittiği andan sayılır. Her yeni adımda baştan başlar.

| Zaman | Ne olur |
|---|---|
| 0-5 sn | Sessiz bekleme. Karakter hedefe bakar, nefes alır, kuyruğunu sallar. |
| **5 sn** | Hedef nabız gibi parlar, yumuşak bir çan çalar. |
| **10 sn** | Anlatıcı çağrıyı bir kez, başka bir kısa cümleyle söyler. **Hayalet el** hareketi gösterir: dokun, sürükle, izle ya da okşa (mevcut "minik el"). |
| **18 sn** | Karakter ilk adımı kendisi yapar, gösterir ve sırayı geri verir: *"Bak, böyle!"* |
| **30 sn** | Karakter kalanını sıcak bir sözle kendisi bitirir: *"Ben bitiririm, sen bak!"* Dönüş normal işler. |

- **Tavan:** Bir oyun anı, ne olursa olsun ~60 sn'de kendiliğinden tamamlanır.
- **Dokunuyor ama tutturamıyorsa (deneme merdiveni):**
  - 2 kaçırmada doğru hedef parlar.
  - 4 kaçırmada mıknatıs genişler: yakına bırakılan nesne yerine oturur.
  - 6 kaçırmada karakter "elini tutar gibi" yapar ve nesne kendisi gider.
- **Kilit yoktur.** Her adım kendiliğinden bitebilir. Çocuk oyunu hiç oynamasa da bölüm sonuna kadar akar.
- **Mikrofon gerekmez.** Bölüm 1'de sesli adım yoktur (sesli görev Maceralar'ın işi). İleride bir bölüme sesli adım girerse her birinin parmakla karşılığı olur. Film mikrofon izni sormaz; izin daha önce verilmemişse yalnız parmak yolu kullanılır.
- **"Yalnız izle" (ebeveyn ayarı, kilitsiz):** Oyun anlarını Kino kendisi oynar; yardım merdiveni hemen 30 sn basamağına geçer. Arabada, yorgun akşamlarda ve MP4 tanıtım kaydında (`npm run film:mp4`) kullanılır.

## 5. Yaş ayarı (3-4 / 5-6)

- Uygulamanın yaş ayarı okunur. Bölümün içinde yaş sorulmaz.
- Hikâye ve süre iki yaşta da aynıdır. Fark yalnız oyunun içindedir, o da yalnız anlamlı olduğu yerde. **Her oyun anına yaş farkı koymak şart değildir.**

| | 3-4 | 5-6 |
|---|---|---|
| Hedef sayısı | az, iri | 1-2 fazla |
| Yol gösterme | sıradaki hedef baştan hafifçe parlar | parlama yok; yalnız yardım merdiveninde gelir |
| Hareket | dokun ve kısa sürükle | uzun sürükleme, iz sürme, sıra |
| Doğruluk | geniş mıknatıs, sıra serbest | sıra ve miktar önemli (yukarı-aşağı fırçalama, dört adımlı fiyonk) |
| Düşünme | gör ve yap | önce **tahmin et**, sonra gör (batar mı, yüzer mi?); **gözlemle** (tabağa Lokum'un yüzünü yap) |

**Kolaylık kuralı (senarist rehberi):** 3-4 yaş hiç takılmaz. 5-6 yaş biraz uğraşır ama 3. denemede kesin geçer.

## 6. İlerleme ve "en sevdiğim an"

- **Kayıt yalnız cihazda tutulur** (`localStorage`, `minkino-oyunlu-v1`). İçinde bölüm, son sahne, biten oyun anları, her anın kaç kez oynandığı ve kalıcı izler (seçilen bant, tabaktaki yüz) bulunur. Hesap ve sunucu yoktur.
- **Yarıda kalırsa:** Bölüm kartında son sahnenin karesi görünür. Dokununca o **sahnenin başından** sürer, oyunun ortasından değil.
- **Bölüm bitince** kartın altına 5 **an fotoğrafı** gelir (polaroid). Her biri çocuğun kendi oyunundan bir karedir: Lokum'un dizinde onun seçtiği bant, tabakta onun kurduğu yüz.
  - Fotoğrafa dokununca o an tek başına oynar: 5-8 sn hikâye girişi, oyun, kutlama, sonra karta dönüş.
  - Her tekrarda oyun yeniden kurulur: tabak boştur, bant kutusu doludur.
- **En sevdiğim an:** En çok tekrar oynanan fotoğrafın köşesine küçük bir kalp gelir ve kartın kapağı o kare olur. Bu kendiliğinden olur; ayarı yoktur.
- Rozet, yıldız, puan ve seviye **yoktur** (Barış: karmaşık sistem yok).

## 7. Ücretsiz / abonelik

- **Bölüm 1 "Kino'nun Bir Günü" baştan sona ücretsizdir.** An tekrarları da sınırsızdır. Bu, mağazadaki ilk izlenimdir: aile Kino'yu tanır.
- **Bölüm 2'den sonrası abonelikle açılır.** `src/engine/erisim.ts` tablosuna şu satırlar eklenir: `'oyunlu/kinonun-bir-gunu': 'ucretsiz'`, `'oyunlu/*': 'abonelik'`.
- Bölüm yarıda kesilmez, oyun anı kilitlenmez. Kilitli bölüme dokununca mevcut sakin kilit anı açılır (`src/abonelik/kilit-ani.ts`).
- Bölüm 1'in sonunda satış ekranı yoktur. Jenerikten sonra karta dönülür; kartın yanında Bölüm 2'nin kapağı küçük bir kilitle durur.
- Yaş ayarı ve "yalnız izle" kilitlenmez.

## 8. Bölüm yapısı şablonu

### 8.1 Değişmez kural: yeni çekirdek

Her oyun anının **kendine ait bir çekirdek fikri** olur. Elimizdeki oyunların dokunuş hissi (sürükle, ova, dök) kullanılabilir. Ama oyunun ne olduğu kopyalanamaz:

| Oyunumuz | Çekirdeği (oyun anında kopyalanmaz) |
|---|---|
| Pasta Otobüsü, Kino'nun Otobüsü | müşteri ister, tezgâhta hazırla, ver, karşılaştır |
| Mino'nun Pazarı (Tart Bakalım dahil) | say, tart, istenen kadar ver |
| Kino Ne Giysin? | havaya bak, doğru giysiyi doğru yere sürükle |
| Dedektif Mino | ipucu bul, kartla çıkarım yap |
| Sesli Maceralar | sesle görev: üfle, sus, bağır, şarkı söyle |
| Kartlar | eşleştir, doğru kartı seç |
| Çiz Canlansın | çiz, iz sür, çizim canlansın |

Her oyun anının kartında şu satır **zorunludur**: **"Bu oyun hangi oyunumuza benziyor, farkı ne?"** Fark tek cümleyle söylenemiyorsa oyun yeniden düşünülür.

### 8.2 Yapı

| # | Parça | Süre | Ne olur |
|---|---|---|---|
| 0 | **Açılış** | ~15 sn | Seri açılışının kısa hâli; anlatıcı bölüm adını okur. |
| 1 | **Gündelik başlangıç** | 30-60 sn | Sıradan bir an. Kino'nun beklentisi ("Bugün parka gidecekti!"). |
| 2 | **Oyun A: ısınma** | 25-40 sn | Tek el hareketiyle en basit oyun. |
| 3 | **Hikâye: aile** | 40-70 sn | Ev sıcaklığı ve mizah sabitleri (Baba'nın uykusu, Dede'nin tek cümlesi). |
| 4 | **Oyun B** | 35-50 sn | Yerleştirme ya da yapma; resimle bilgi (renk, şekil, sayı). |
| 5 | **Hikâye: küçük sorun** | 40-70 sn | Kino'nun kusuru bir şeyi tetikler; dürüst duygu. |
| 6 | **Oyun C: kalp** | 30-45 sn | Duygu oyunu: başkasına iyi gelmek (empati). |
| 7 | **Hikâye: onarım** | 30-50 sn | Özür, birlikte yeniden deneme, yumuşak mizah. |
| 8 | **Oyun D: akşam** | 30-45 sn | Yavaş, merak uyandıran, sakinleştiren bir oyun. |
| 9 | **Kapanış** | 40-60 sn | Yatak, anlatıcının son cümlesi, kapanış kartı (Kino'nun sesiyle). **Oyunsuz.** |

- **3 oyunlu bölümde** B ya da D çıkar. **5 oyunlu bölümde** 3 ile 5 arasına bir oyun daha girer (Bölüm 1'deki ayakkabı bağı gibi).

### 8.3 Kurallar

- **Neden burada?** "Bu oyun neden burada?" diye sorulamamalı. Oyun, hikâyede zaten yapılacak işin kendisidir.
- **Eller değişir.** Arka arkaya aynı el hareketi olmaz. Bölüm 1'deki sıra: iz sür → yerleştir → ip çek → yavaş okşa ve soy → bırak, gözle.
- **Duygu oyunu.** Her bölümde en az bir empati oyunu olur.
- **Yeni yok.** Oyun anında yeni karakter ya da yeni eşya tanıtılmaz. Eşya önce hikâyede görünür (çakıl taşı parkta bulunur, akşam küvete girer).
- **Resimle bilgi.** Her oyun anı ekranda net bir resimle tek bir bilgi taşır: sayı, renk, şekil, sıra, büyük-küçük, ağır-hafif ya da bir duygunun adı.
- **Kalıcı iz.** Oyunun son hâli bir sonraki sahnede görünür.
- **Seri kuralları aynen geçerlidir:** sihir yok, kameraya bakış yok, ders cümlesi yok. Senarist rehberinde yasaklanan sözcük hiçbir metinde geçmez.
- **Her bölüm yeni oyun ister.** Bir bölümün oyun anı başka bir bölümde tekrar edilmez. Kalıp kopyalanmaz (Barış: "sürekli gelişsin").

### 8.4 Oyun anı kartı (her oyun için doldurulur)

```
### OYUN N · <ad>  (~sn)
- Hikâyedeki sebebi:
- Çekirdek fikir (tek cümle):
- Bu oyun hangi oyunumuza benziyor, farkı ne?:
- Kadraj (yatay 844×390 / dikey 390×844):
- Etkileşim adımları:
- Hedefler (adet, en küçük boy px):
- Başarı geri bildirimi:
- Yanlış hamle (tatlı, cezasız):
- Yardım (18 sn ve 30 sn'de karakter ne yapar):
- Yaş: 3-4 / 5-6:
- Öğrettiği (resimle bilgi):
- Kalıcı iz:
- Hikâyeye dönüş:
- Cümleler: anlatıcı (oyun sesi) / karakterler:
```

## 9. Ekran ve dokunma (önce telefon)

- **Yatay ekran önce:** 844×390, ardından 667×375 ve 932×430.
- **Hedefler** en az **72×72 px** (Kino'nun Otobüsü ölçüsü), aralarında en az 16 px. Hedefler başparmağın eriştiği alt %60'ta durur. Çentik tarafına hedef konmaz; `env(safe-area-inset-*)` kullanılır.
- **Oyun kadrajı hikâyeden yakındır.** Oynanan şey ekranın en az üçte birini kaplar. Örneğin diş oyununda Kino'nun yüzü ekran yüksekliğinin %80'idir.
- **Dikey ekran (390×844):**
  - Hikâye 16:9 bir bant olarak oynar; bandın üstü ve altı sahnenin devamıdır (bulanık ya da siyah değil).
  - Oyun anında kamera dikey kadraja geçer. Her oyun anının dikey kadrajı senaryoda yazılıdır.
- **Tablet:** aynı düzen, oranla büyür.
- **Animasyon girdiyi kilitlemez.** Çocuk hızlı dokunursa hamleler üst üste biner (Otobüs kuralı).
- **Hikâye sırasında dokunuş:** Konuşmayan bir karaktere dokunulunca küçük, sessiz bir beden tepkisi olur (kulak sallar, kuyruk döner). Hikâye durmaz, konuşma bölünmez.

## 10. Motorun (`film/src`) bu biçim için gerekenleri

| # | Özellik | Not |
|---|---|---|
| 1 | **Oyun durağı** | Yeni olay: `{ "kim": "oyun", "yap": "basla", "ad": "kum-saati", "kadraj": [x, y, z], "dikey": [x, y, z] }`. Film saati durur (saat zaten duraklatılabiliyor); karakterlerin canlılığı sürer. Oyun modülü (`film/src/oyun/<ad>.ts`, ortak arayüz `basla(baglam)`, `kendiBitir()`, `kapat()`) aynı dünyaya, nesnelere, oyunculara ve kameraya erişir. Bitince sonucunu (`{ bant: 'kuzu' }`) döner ve saat sürer. |
| 2 | **Dokunma katmanı** | Dünya koordinatında isabet: eşya ya da oyuncu parçası. Hareketler: sürükle-bırak + mıknatıs, **iz sürme** (hareketli hedefin peşinden gitme), **hız ölçen okşama** (yavaş / hızlı), **soyma** (sekmeyi çekip ayırma), **ip** (birkaç halkalı basit ip fiziği), bırak-düş (suda yüzme/batma). Tek bir ortak modül olur; her oyun bunları kullanır. |
| 3 | **Yardım merdiveni** | Ortak modül: 5/10/18/30 sn, kaçırma sayacı, hayalet el. Yalnız izle modunda hemen 30 sn basamağı. |
| 4 | **Kalıcı iz (koşullu olay)** | Olayda `"eger": { "bant": "kalp" }` ya da eşya tipinde yer tutucu `"tip": "bant-{bant}"`. Sonuçlar bölüm boyunca saklanır ve kayda yazılır. |
| 5 | **Oyun fonu** | Müzik dosyasının döngülü hâli ve çapraz geçiş (`dosya` olayı zaten çapraz geçiyor; döngüsüz parçalar için döngü noktası eklenir). |
| 6 | **Seri 2 kesme-kukla oyuncusu** | Kit parça PNG'leri + `rig.json` (dönme noktaları). Kol ve bacak iki parçalıdır (dirsek, diz); mesh deform yerine yuvarlak eklem kapakları kullanılır (kit kuralı 2). Önden / 3/4 / yan görünüş, kesme anında değiştirilir (`yerine` gibi). **9 ağızlı dudak senkronu** (`src/audio/dudak.ts` şimdi 6 ağız; Lokum ve büyükler 6 ile kalır). Göz ve kaş takası. Kulak ve kuyrukta yaylı ikincil hareket. **Kostüm takası** aynı dönme noktalarıyla yapılır (pijama, banyo gövdesi). |
| 7 | **Yeni sesler** | Anlatıcı, 5 yaşındaki Kino, Anne, Baba, Lokum, Babaanne, Dede: `konusSecenegi` içine. Sesleri Barış seçer. |
| 8 | **Ön yükleme** | Her oyun anının görselleri, önceki hikâye sırasında `decode()` edilir. Oyuna geçerken yükleme beklemesi olmaz. |
| 9 | **İlerleme ve giriş noktaları** | Sahne başında kayıt. An tekrarı: `?an=<ad>` (5-8 sn giriş + oyun + çıkış). Yalnız izle: `?izle=1`; MP4 kaydında bu kendiliğinden açıktır. |
| 10 | **Dikey kadraj** | Her oyun durağında `kadraj` (yatay) ve `dikey` alanları. |
| 11 | **Test** | Her oyun anı için e2e testleri: hiç dokunmadan kendiliğinden bitiyor mu; doğru oynanınca bitiyor mu; 844×390 ve 390×844 ekran görüntüleri; konsol hatası yok. |

**URETIM-YOLU'nun saydığı motor eksikleri** (mesh deform, alan derinliği, hareket bulanıklığı) bu biçimde şöyle karşılanır:
- Yuvarlak eklem kapakları kullanılır.
- Uzak katman önceden yumuşatılmış çizilir; canlı filtre kullanılmaz.
- Hızlı harekette esneme-basılma (squash & stretch) kullanılır.

Oyun anları canlı olduğu için bu biçimde MP4 değil, motor kullanılır.
