# Gece işi · "Uyku Vakti": Mino ile Kino'yu yatıralım

> Yazan: senarist / oyun tasarımcısı, 2026-10-15 gecesi. Barış'ın talimatı: "Senariste ver, çok iyi bir şey düşünsün, eksik kalan bir şeyi tamamlasın."
> Kod yazılmadı. Bu belge bir kodcunun bu gece bitireceği tek parçanın tam tarifi.

---

## 0. Neden bu parça?

**Ebeveyn ve çocuk gözüyle uygulamaya baktım.**
- **Başlangıç güzel.** Mino yürüyerek, Kino hoplayarak gelir, el sallarlar. Kartlar canlanıyor, 9 oyun var, Maceralar ve Pati de dolu.
- **Ama uygulamanın bir sonu yok.** Çocuk oynar, oynar. Telefonu elinden almak hep annenin işi ve çoğu akşam ağlamayla biter. Annenin bir çocuk uygulamasından en çok istediği şey bu anın kolaylaşması.
- Rakiplerin en sevilen parçası da bu. Pok Pok, Sago Mini ve Headspace'in çocuk uygulamaları "uyku" ya da "kapanış" anı koyuyor. Bizde bu yok.

**Seçtiğim parça:** Akşam saatinde menüde küçük bir ay lambası belirir. Mino esner. Çocuk ay lambasına dokununca Mino ile Kino'nun yatak odasına geçilir. Çocuk onları yatırır: oyuncakları toplar, yastıkları koyar, battaniyeleri örter, perdeyi kapatır, gece lambasını yakar. İkisi uyur. Uygulama da sabaha kadar uyur. Anne isterse Ebeveyn Köşesi'nden her saatte başlatabilir.

**Çocuk için:**
- Oyunun "bitti" diye kesilmesi yerine sevdiği iki arkadaşına bakım yapar ve işi onların uyumasıyla biter. Kapanış bir ceza değil, sıcak bir ödül olur.
- Mino'nun mırlaması, battaniyeyi tekmeleyen Kino ve "İyi geceler, Ay!" çocuğun en sevdiği anlar olacak.

**Anne için:** "Ekran süresi gözyaşsız biter." Bu, mağaza sayfasındaki en güçlü cümle olur. Kendi yatma rutinini (toplama, yastık, battaniye, perde, ışık) çocuğa oyunla tekrar ettirir.

**Eğitici değer:**
- Akşam rutininin sırası
- 1-2-3 sayma
- "Her şeyin bir yeri var" (oyuncak sepete, kemik Kino'ya)
- Başkasına özen göstermek

**Neden kurallara uyuyor:**
- Yeni oyun değil, puan yok, sayaç yok, oyunlar arası bağlantı yok. Tek ekran ve tek bir `localStorage` anahtarı var.
- Karakterler kendi çizimleriyle (Mino'nun vektörü, Kino'nun iskeleti) oynar. Gemini yalnız oda ve eşya çizer, böylece stil kaymaz.
- Ücretsizdir. Abonelik kilidi yoktur; mağaza incelemesinde de, ücretsiz kullanıcıda da çalışır.

---

## 1. Akış (adım adım)

Toplam ~75-90 sn (dokunarak). Hiç dokunulmazsa yardım merdiveniyle ~2,5 dk'da kendiliğinden biter. **Hiçbir adım kilitlenmez.**

### Giriş A · Menüde akşam daveti (19:00-06:00, cihaz saati)
1. Menü her zamanki gibi açılır. Akşam saatindeyse Mino ile Kino'nun yanında **ay lambası düğmesi** belirir: 64 px resim, 88 px dokunma alanı. Lamba yavaşça iner-kalkar (translateY ±3 px, 2,4 sn). Her 8 sn'de bir kez minik bir "nefes" alır (scale 1 → 1,06 → 1).
2. Boşta dönen hareketlere (`BOS` dizisi) akşam saatinde bir yenisi eklenir. Mino `tepki('esne')` yapar, 0,4 sn sonra Kino da esner (`kino.oynat('huy')` + `keyif` ifadesi). **Ses yok** (menü sessiz kalsın).
3. Çocuk ay lambasına dokunur:
   - Lamba ezilip esner (scaleY 0,88 → 1,08 → 1, 160 ms) ve `efekt.tink()` çalar.
   - Mino `esne` yapar ve hazır kayıtlı **"Uykum geldi..."** cümlesini söyler (`mino.json → esne`; yeni kayıt gerekmez).
   - Krem perde iner (`src/ui/gecis.ts`), `app.git('uyku')` ile uyku ekranına geçilir.
4. Gündüz lamba görünmez, menü bugünkü gibidir.

### Giriş B · Ebeveyn Köşesi (her saatte)
- "Gizlilik ve güvenlik" başlığının üstüne **"Uyku vakti"** başlığı ve altına bir satır eklenir: "Mino ile Kino'yu birlikte yatırın. Uygulama sabaha kadar uyur."
- Altına bir düğme gelir: **"Uyku vaktini başlat"** (ay ikonu, `dugme` sınıfı). Ebeveyn kapısı zaten geçilmiş olduğu için doğrudan `app.git('uyku')` çağrılır.

### Ritüel (uyku ekranı)
Mekân: Mino ile Kino'nun akşam odası. Tavan ışığı açık, sıcak akşam tonları. Pencerede ay ve yıldızlar var, perdeler açık.
- **Ortada:** solda Mino'nun hasır sepet yatağı, sağda Kino'nun mavi minder yatağı, aralarında komodin ve üstünde **sönük** ay gece lambası.
- **Önde:** halının üstünde dağınık oyuncaklar. Sağ köşede oyuncak sepeti.

| # | Ne olur | Çocuk ne yapar | Başarınca | Yardım (hiç dokunmazsa) |
|---|---|---|---|---|
| 0 | **Açılış.** Perde kalkar. Mino ile Kino ortada ayakta, ikisi de esner. | (izler, ~4 sn) | | |
| 1 | **Oyuncaklar yerine.** Halıda top, küp kulesi ve tren var; arasında Kino'nun mavi kemiği duruyor. | Oyuncağı sepete sürükler **ya da** oyuncağa dokunur (dokununca oyuncak yay çizerek kendisi sepete hoplar). | Oyuncak sepete düşer. Sepet ezilip esner, `efekt.yapis()` çalar. Mino sayar: "Bir!", "İki!", "Üç!" (hazır kayıtlar). Üçüncüde Mino `zipla` yapar. | 4 sn: el ipucu sıradaki oyuncağın üstünde. 10 sn: Mino cümleyi tekrarlar. 18 sn: Kino oyuncağa hoplar, burnuyla iter, oyuncak sepete yuvarlanır. |
| 1b | **Kino'nun kemiği.** Kemik halıda kalır (sepete gitmez). | Kemiğe dokunur ya da sürükler. | Kemik havaya fırlar. Kino bütün gövdesiyle zıplayıp kapar (zıplama yayı + iniş ezilmesi), kemiğe sarılır (`keyif`): "Bu benim uyku kemiğim!" Kemik Kino'nun önünde kalır, yatağa onunla gider. | Çocuk kemiğe hiç dokunmazsa üç oyuncak bitince Kino kendisi koşup alır, aynı replik. |
| 2 | **Yastıklar.** Krem ve sarı yastık soldan hoplayarak gelir, halının kenarına konar. | Yastığı sahibinin yatağına sürükler ya da dokunur. Yanlış yatağa bırakırsa ceza yok: yastık "boing" diye geri seker. Sahibi başını sallar (bütün gövde sağa-sola ±3 px), gözüyle kendi yastığına bakar. | Yastık yatağa "pof" diye oturur (`efekt.pof()`). Sahibi hop diye yatağa girer: zıplama yayı, sonra yatağın içine iner ve ezilir (scaleY 0,9 → 1,04 → 1). Mino `otur(true)` yapar. Kino ~%14 aşağı iner; minder kenarı bacaklarını örter, yatmış gibi görünür. | 4 / 10 / 18 sn aynı merdiven. 18 sn'de yastık kendisi uçar. |
| 3 | **Battaniyeler.** Pembe ve mavi battaniye gelir. | Battaniyeyi sahibinin üstüne sürükler ya da dokunur. | **Mino:** battaniye yukarıdan dalgalanarak iner (scaleY 1,1 → 0,95 → 1, iki sekme). Mino `poz('sarilma')` yapar (gözler kapalı, gülümseme): "Mırr... sıcacık." **Kino (komik an):** battaniye örtülür, 1 sn sonra Kino tekmeler. Battaniye "pof" diye havaya kalkar, yere yığılır (yığın çizimi). Kino kıkırdar: "Hihi, ayağım dışarıda!" Mino güler: "Kino, örtün düştü!" Çocuk yığına dokunur ya da yeniden sürükler, battaniye bu kez yerinde kalır. Kino: "Tamam, tamam... uyuyorum." | Tekme **yalnız bir kez** olur. 18 sn yardımında battaniyeyi Mino patisiyle iter (Mino o yana seker), battaniye uçup örtülür. |
| 4 | **Perde ve Ay.** Pencerede ay görünür. | Pencereye dokunur. | Önce Mino `selam` yapar, fısıltıyla "İyi geceler, Ay!" der. Kino fısıltıyla "Hav..." der. Sonra perde kapanır: açık pencere resmi kapalı pencere resmine 150 ms'de geçer, aynı anda perde kumaşı korniştan aşağı esner (scaleY 0,96 → 1,03 → 1, tepe pivotlu). `efekt.dalga()` çalar. | 18 sn: Kino yatağında doğrulur, pencereye bakar, perde kendisi kapanır. |
| 5 | **Gece lambası.** Komodindeki ay lambası sönük. Mino: "Gece lambasını yakar mısın?" | Ay lambasına dokunur. | Lamba ezilip esner, sönük resimden yanık resme geçer. Etrafında düz, sert kenarlı soluk sarı daire belirir (%25 saydam, gradyan yok). Tavan ışığı söner: bütün odanın üstüne düz lacivert örtü 1,2 sn'de gelir (`#24305E`, multiply, opaklık 0 → 0,5). Lamba ve dairesi örtünün üstünde kalır. | 18 sn: Mino patisini uzatır (`isaret-sag`, kol yok), lamba kendisi yanar. |
| 6 | **Uyku.** | (izler) | Ninni (`assets/muzik/ninni-sozsuz.mp3`) %25 seste **bir kez** çalar, sonra susar. İkisinin gözleri kapanır: Mino `uyu()`, Kino gözü kapalı + `keyif` ağzı. İkisi de fısıldar: "İyi geceler." Nefes yavaşlar (taban pivotlu scaleY 1 → 1,03, 3,2 sn). Başlarının üstünden sırayla "z" harfleri yükselir. | |
| 7 | **Uyuyan oda** (son durum, ekran böyle kalır) | Mino'ya ya da Kino'ya dokunabilir. | Dokunulan karakter uykusunda kıpırdar: bütün gövde ±2 px titrer, 0,3 sn ezilir. Bir uyku cümlesi söyler (aşağıda). Uyanmaz. 60 sn sonra örtü 0,5 → 0,7 koyulaşır (ekran daha az ışık verir). | |

**Kilit:** 6. adım bitince `localStorage['minkino-uyku-v1'] = { bitti: <zaman> }` yazılır. Uygulama ertesi sabah 06:00'ya kadar her açılışta doğrudan **uyuyan odayı** (adım 7) gösterir. Ritüel tekrarlanmaz, ninni bir kez kısa çalar.
- **Sağ üst köşede küçük ebeveyn düğmesi:** menüdeki `ug-kapi` ile aynı ikon. Ebeveyn kapısından geçilince kilit silinir ve menüye dönülür.
- **Android geri tuşu:** uyuyan odada uygulamadan çıkar (menüye dönmez, kilit bozulmaz). Ritüelin ortasında menüye döner; o durumda kilit yazılmaz.
- **Sabah:** 06:00'dan sonra ilk açılışta kilit silinir. Menüde Mino ile Kino gelince Mino gerinir (`esne`) ve hazır kayıtlı **"Günaydın!"** cümlesini söyler, Kino `sevin` zıplaması yapar. Bu yalnız bir kez olur (aynı anahtarda `gunaydin: true`).

---

## 2. Replikler

Konuşan iki kişi var:
- **Mino:** anlatıcı sesi (`content/seslendirme.json → ses_id`).
- **Kino:** kendi sesi (`karakter_sesleri.kino`).

Etiketler metnin içinde durur ve CI eleven_v3'e olduğu gibi gider. Bu ekranda **yazı gösterilmez** (okumayan çocuk), etiket ekrana çıkmaz.
- **Cihaz sesine düşüş (kayıt yoksa):** `konusma.ts` metni okumadan önce `[...]` parçalarını siler. Bu tek satırlık bir ek; yoksa cihaz "yawns" diye okur.

**Hazır kayıtlar (yeni kredi yok):** "Uykum geldi...", "Günaydın!", "Bir!", "İki!", "Üç!"

**Yeni Mino cümleleri** (`content/uyku.json → mino`):

| Anahtar | Metin | Ne zaman |
|---|---|---|
| `davet` | `[yawns] Bizi yatırır mısın?` | Adım 0, iki esnemeden sonra |
| `oyuncak` | `Önce oyuncaklar yerine.` | Adım 1 başı |
| `yastik` | `Şimdi yastıklar!` | Adım 2 başı |
| `battaniye` | `Battaniyemi örter misin?` | Adım 3 başı |
| `sicacik` | `[sighs happily] Mırr... sıcacık.` | Mino örtülünce |
| `ortun_dustu` | `[laughs] Kino, örtün düştü!` | Kino tekmeleyince |
| `ay` | `[whispers] İyi geceler, Ay!` | Adım 4 |
| `lamba` | `Gece lambasını yakar mısın?` | Adım 5 başı |
| `iyi_geceler` | `[whispers] İyi geceler. Yarın yine oynarız.` | Adım 6 |
| `uykulu` | `[sleepy] Mmm... yarın...` | Adım 7, Mino'ya dokununca |

**Yeni Kino cümleleri** (`content/uyku.json → kino`; `macera-salincak.json → kino` kalıbıyla `tumCumleler()`'e girer):

| Anahtar | Metin | Ne zaman |
|---|---|---|
| `kemik` | `[giggles] Bu benim uyku kemiğim!` | Adım 1b |
| `ayak` | `[giggles] Hihi, ayağım dışarıda!` | Tekme |
| `tamam` | `[yawns] Tamam, tamam... uyuyorum.` | Battaniye yerinde kalınca |
| `hav` | `[whispers] Hav...` | Adım 4, Mino'dan sonra |
| `iyi_geceler` | `[whispers] İyi geceler.` | Adım 6 |
| `horul` | `[snoring softly] Hırr... fiuu...` | Adım 7, Kino'ya dokununca |

Toplam 16 yeni cümle, yaklaşık 330 harf (çok az kredi).

**Ses efektleri** (hepsi var, Web Audio):
- `tink`: lamba
- `yapis`: sepet
- `pof`: yastık, tekme
- `dalga`: perde
- `dokunma`: genel dokunuş
- Yeni efekt dosyası yok.

---

## 3. Yaş farkı

**Yok, bilerek.** Menüde yaş sorulmaz. Bu bir oyun değil, 2-7 yaşın hepsinin aynı yaptığı bir rutin. Kolaylık kuralı tek:
- Her adım **ya sürükleyerek ya tek dokunuşla** yapılır. Dokunuşta eşya kendisi yerine uçar.
- 2-3 yaşındaki çocuk dokunarak, 5-7 yaşındaki sürükleyerek oynar. İkisi de aynı sonucu görür.
- Sayma 3'e kadar, bütün yaşlara uygun.

---

## 4. Animasyon anları

Parça döndürme **yok**. Yalnız poz değişimi, ezilme-esneme ve bütün gövde hareketi var. Yalnız `transform` ve `opacity` kullanılır.

- **Karakter hareketleri** Mino'nun ve Kino'nun **hazır** hareketleridir:
  - Mino: `esne`, `zipla`, `selam`, `otur`, `poz('sarilma')`, `poz('isaret-sag', { kol: false })`, `uyu()`
  - Kino: `huy`, `sevin`, `bak`, ifadeler
  - Bunlara yeni kol, kafa ya da kulak açısı eklenmez.
- **Yatağa giriş:** zıplama yayı (yükseklik karakter boyunun %25'i, 380 ms). Yatağın içine iniş ezilmesi: scaleY 0,9 / scaleX 1,06 → 1,04 / 0,98 → 1.
- **Uyku nefesi:** taban pivotlu scaleY 1 → 1,03, 3,2 sn (uyanıkken 2,1 sn).
- **Kemiği kapma:** Kino'nun bütün gövdesi yay çizer, kemik onun önüne yapışır. İnişte ezilme var, kuyruk dönmez.
- **Battaniye inişi:** tepe pivotlu dalgalanma, scaleY 1,1 → 0,95 → 1,02 → 1. Önce 6 px sağa, sonra sola kayar (sallanarak oturur).
- **Tekme:** battaniye 40 px yukarı fırlar, 8° yatar (eşya; karakter parçası değil), yere iner, yığın resmine geçer. Kino'nun gövdesi tekme anında 4 px zıplar.
- **Perde:** iki pencere resmi arasında 150 ms geçiş, tepe pivotlu esneme.
- **Lamba:** ezilme-esneme ve resim değişimi, düz daire.
- **"z" harfleri:** Fredoka 600, krem dolgu, 2 px koyu kahve kontur (`#3B2416`). 2,8 sn'de 40 px yükselir, %0'dan %90'a görünür olur, sonra söner. Mino ile Kino sırayla.
- **Göz kırpma** uyanıkken sürer, uykuda durur.
- **Az hareket ayarında** (`prefers-reduced-motion`): sıçramalar yerine yumuşak geçiş, "z" yok.

---

## 5. Gemini (2 sayfa)

**Her iki istemde yüklenecek stil referansı:** `ekip/stil/onayli-stil-oda.png`
- Kayıt yeri: `ekip/gemini/yeni/uyku/`, en az 2048 px.
- Kontrol: `onayli-stil-ozet.jpg` ile yan yana konur. Doku, parlama, gradyan ya da yazı varsa kullanılmaz.
- **Kayma olursa** sayfa baştan çizdirilmez. Yalnız kayan kare düzeltilir: aynı sayfa yüklenir, "Edit this exact image: redraw ONLY tile N as …" denir.
- **Duvar ve zemin çizdirilmez.** Odanın duvarı (krem üst, nane yeşili lambri) ve zemini referanstaki gibi düz renk ve koyu kahve çizgiyle CSS'ten gelir. Böylece her telefon boyunda (yatay, dikey) oda boşluksuz kurulur. Renkler `onayli-stil-oda.png`'den damlalıkla alınır, akşam için %8 koyulaştırılır.

**S-DÜZ** (her istemin sonuna aynen eklenir; 3 gün planındaki kalıp):
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm pastel color fills, at most one soft hard-edged shade tone per color, only one or two tiny white highlights in the eyes. Simple rounded shapes, cute baby proportions. No texture, no fur strands, no grain, no gradients, no glow, no shine, no painterly look, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

### U1 · `ekip/gemini/yeni/uyku/oda-sayfasi.png` (4:3, 3 satır × 3 sütun)
> OBJECT SHEET for a cozy bedtime scene in a preschool app, nine separate objects in three rows by three columns, each centered in its own tile with even white space, nothing touching, straight-on front view like a stage set, consistent scale, matching the window, curtains, rug and furniture of the attached reference room. Row 1: (1) a window at night exactly like the window in the reference: white frame with two panes, a dark blue night sky with a smiling crescent moon and five small simple five-pointed stars, cream curtains open and tied back, wooden curtain rod; (2) exactly the same window, same size and same position in its tile, with the cream curtains closed and meeting in the middle, only the rod and the top of the frame visible above them; (3) a round rug with soft pastel rainbow rings like the reference, seen from the front as a flat wide ellipse. Row 2: (4) a small wooden bedside table with one drawer and a round knob; (5) a small night lamp shaped like a sleeping crescent moon with a gentle closed-eye smile, switched off, pale cream, on a small round wooden base; (6) exactly the same moon lamp, same size and same position in its tile, switched on: warm butter yellow, no glow, no rays. Row 3: (7) an empty woven toy basket with two handles, wide and low, front view; (8) a wooden wall shelf with three plain books with no writing and a tiny potted plant; (9) a child's crayon drawing taped to the wall with four strips of tape, showing a little cat and a little puppy holding hands under a smiling sun, simple crayon lines like the drawing in the reference, no words.
> + S-DÜZ

### U2 · `ekip/gemini/yeni/uyku/yatak-sayfasi.png` (4:3, 3 satır × 4 sütun)
> OBJECT SHEET of bedtime objects for two small cartoon pets, a kitten and a puppy, twelve separate objects in three rows by four columns, each centered in its own tile with even white space, nothing touching, front view seen slightly from above, consistent scale. Row 1: (1) a round woven wicker cat basket bed with a soft pink cushion inside, empty; (2) an oval puppy bed, a soft light-blue cushion bed with a thick raised round rim, empty, about one and a half times wider than the cat basket; (3) a small rectangular cream pillow; (4) a slightly bigger soft butter-yellow pillow. Row 2: (5) a small soft pink blanket with white polka dots, its top edge folded over as a wide hem, drawn as a gently rounded shape as if tucked over someone's lap, as wide as the cat basket; (6) a soft light-blue blanket with small yellow stars, the same shape, as wide as the puppy bed; (7) exactly the pink polka-dot blanket of tile 5 crumpled in a small soft heap on the floor; (8) exactly the blue star blanket of tile 6 crumpled in a soft heap on the floor. Row 3: (9) a plain red ball with one white stripe; (10) three wooden toy blocks stacked in a little tower, plain pastel colors, no letters; (11) a small wooden toy train engine with round wheels; (12) a light-blue squeaky dog toy bone.
> + S-DÜZ

**Sıra:** U2 önce gelir (karakterlerin yatakları en önemli parça), sonra U1. İkisi ayrı sohbette yapılır (uzayan sohbet yanlış resim indirir). Pro kotası 10:00'da sıfırlanır.

**Kesim (Adobe ya da `gemini-esya.cjs` ile betik):** `ekip/illustrator/uyku-isle.cjs` (yeni; `elektrik-isle.cjs` kalıbı)
- Sayfayı keser. Çıktı `assets/uyku/*.webp`, şeffaf.
- **Çiftler aynı tuvale hizalanır:** pencere-acik / pencere-kapali, lamba-sonuk / lamba-yanik. Kayma ≤ 1 px olmalı (komodin / fener çiftindeki yöntem).
- **İki yatağın ön kenarı ayrı katman olur:** `sepet-on.webp`, `minder-on.webp`. Minderin ya da yastığın üst çizgisinin altında kalan kısım karakterin önüne gelir. Kesimi tasarımcı maskeyle yapar (akvaryum ön camındaki yol). Karakter yatağın **içinde** görünsün diye bu şart.
- Büyük dosya kuralı geçerli: mevcut daha büyük dosya ezilmez (`guvenli-yaz.cjs`).

**Dosya adları:**
- **U1'den:** `pencere-acik`, `pencere-kapali`, `hali`, `komodin`, `lamba-sonuk`, `lamba-yanik`, `oyuncak-sepeti`, `raf`, `resim`
- **U2'den:** `sepet`, `sepet-on`, `minder`, `minder-on`, `yastik-mino`, `yastik-kino`, `battaniye-mino`, `battaniye-kino`, `yigin-mino`, `yigin-kino`, `top`, `kupler`, `tren`, `kemik`

**Görseller gelene kadar** kod sade yer tutucularla çalışır: düz renkli yuvarlak dikdörtgenler, kalın kahve kontur. Hepsi `varliklar` listesinde "eksik" diye işaretlenir. Gemini dosyası gelince betik çalışır, kod kendiliğinden kullanır. **Yer tutucuyla mağazaya çıkılmaz** (bitti ölçütü §8).

---

## 6. Kodcunun dokunacağı dosyalar

**Yeni:**
- `uygulama/src/uyku.ts`
  - `uykuEkrani(app)`: ritüel ve uyuyan oda. Karakterler `new Mino()` ve `new Karakter('kino', …)` (menüdeki gibi).
  - Sürükleme: `kino-otobus/src/dokunsal.ts → elSurukle`.
  - Kalp ve parıltı: `kino-otobus/src/efekt.ts`.
- `uygulama/src/uyku-mantik.ts` (saf, DOM'suz):
  - `aksamMi(saat)`: 19-6
  - `kilitVarMi(kayit, simdi)`: 06:00 sınırı, gece yarısını geçen kayıt dahil
  - `sonrakiAdim(durum)`
  - yardım merdiveni zamanları 4 / 10 / 18 sn
- `uygulama/src/uyku.css`
  - Önek `ug-u-`. Seçiciler `.mk-kok.ug-kok …` (ana.css ezilmesi dersini unutma).
  - Duvar, lambri, zemin düz renk ve 3 px koyu kahve ayrım çizgisi.
- `content/uyku.json`: §2'deki cümleler.
- `assets/uyku/*.webp` ve `ekip/illustrator/uyku-isle.cjs`
- Testler:
  - `tests/unit/uyku.test.ts`: `aksamMi`, kilit (23:00'te yazılan kayıt 05:59'da var, 06:01'de yok; 02:00'de yazılan 06:01'de yok), adım sırası
  - `tests/e2e/uyku.spec.ts`

**Değişen:**
- `uygulama/src/main.ts`
  - `ekranKaydet('uyku', uykuEkrani)`.
  - Açılışta kilit varsa `'menu'` yerine `'uyku'` (uyuyan oda).
  - `geriDinle`: uyuyan odada `false` (uygulamadan çık), ritüelde menüye dön.
  - Test kısayolu: `?test=1&ekran=uyku&saat=21` (saat cihaz saatinin yerine geçer).
- `uygulama/src/ekranlar.ts`
  - Menü: akşamsa ay lambası düğmesi ve boşta esneme.
  - Sabah ilk açılışta "Günaydın!".
  - `ayarlarEkrani`: "Uyku vakti" başlığı, satırı ve düğmesi.
- `uygulama/src/uygulama.css`: ay lambası düğmesinin yeri.
- `src/audio/cumleler.ts`: `uyku.json` mino ve kino cümleleri `tumCumleler()`'e (kino'lar karakter sesine).
- `src/audio/konusma.ts`: cihaz sesine düşüşte `[...]` etiketlerini sil.
- `src/audio/dosya-muzik.ts`: `FonAdi` ve glob'a `ninni-sozsuz` eklenir.
- `src/ui/ikonlar.ts`: `ay` ikonu (Ebeveyn Köşesi düğmesi için; çizgi ikon, mevcut kalıpta).
- `ORTAK_NOTLAR.md`: tarihli satır.

**Dokunulmayan:** oyunların hiçbiri, `oyunlar.ts` kart listesi (kart eklenmez, ızgara 8/9 düzeni bozulmaz), erişim tablosu.

---

## 7. Telefon yerleşimi

Önce 844×390 ve 390×844 (DPR 3) kusursuz olmalı, sonra 667×375, 360×780, 768×1024 ve 1024×768. Bütün ölçüler ekranın kısa kenarına (`vmin`) ya da sahne kutusuna göre verilir. Dokunma alanı en az 88 px. Çentik için `safe-area` boşluğu bırakılır.

**Yatay telefon (844×390):**
- **Duvar ve zemin:** duvar üstte %62, lambri duvarın alt %30'u, zemin altta %38.
- **Pencere:** ortada, tepeden %6 aşağıda, yüksekliği ekranın %44'ü.
- **Raf:** sol üst. **Resim:** sağ üst. (Kısa telefonda (≤ 375) raf gizlenir.)
- **Yataklar:** Mino'nun sepeti x %28, Kino'nun minderi x %68. Tabanları zemin çizgisinin %8 altında.
  - Karakter boyu: Mino ekran yüksekliğinin %40'ı, Kino %44'ü (menüdeki oranları korur).
- **Komodin ve lamba:** x %48. Lamba en az 72 px ve dokunulur.
- **Halı:** alt ortada, ekran genişliğinin %50'si. Oyuncaklar halının üstünde, aralarında en az 24 px. Her biri en az 88 px dokunma alanı.
- **Oyuncak sepeti:** sağ altta x %88.
- **Yastık ve battaniye bekleme yeri:** sol alt köşe, halının solu.
- **Ebeveyn düğmesi:** sağ üstte, menüdekiyle aynı yer ve boy.

**Dikey telefon (390×844):**
- **Duvar ve zemin:** duvar üstte %56, zemin altta %44.
- **Pencere:** ortada, tepeden %5, genişliği ekranın %62'si. Raf ve resim gizlenir (dar).
- **Yataklar:** yan yana. Sepet x %27, minder x %71, tabanları ekran yüksekliğinin %66'sında.
  - Karakter boyu: genişliğin %34'ü (Mino) ve %38'i (Kino).
- **Komodin:** yataklar arasında, x %50, %80 küçültülmüş. Lamba en az 64 px görünür, 88 px dokunma alanı.
- **Halı:** alt ortada, genişliğin %86'sı, ekranın %78-92'si arasında. Oyuncaklar halıda tek sıra.
- **Oyuncak sepeti:** halının sağ ucunda, halıya biraz biner.
- **Yastık ve battaniyeler:** halının sol ucunda bekler.
- **Örtüşme denetimi:** hiçbir eşya ya da karakter başka bir karakterin yüzünü örtmez (Doğum Günü'ndeki gibi ölçülür: yüz kutusu ile eşya kutusu kesişimi 0 px).

**Menüdeki ay lambası:**
- Mino ile Kino ikilisinin (`.ug-ikili`) sağ üst köşesinde durur.
- Logoyu, Kino'yu ve kartları örtmez. 844×390, 667×375, 390×844 ve 768×1024'te ekran görüntüsüyle ölçülür.

---

## 8. "Bitti" ölçütü

1. `npm run build` ve `npm test` geçer. `uyku.test.ts` birim testleri geçer.
2. `tests/e2e/uyku.spec.ts` geçer, 844×390 ve 390×844 için ayrı:
   - **Dokunarak (sürüklemesiz):** ritüel baştan sona tamamlanır, uyuyan oda görünür, kilit yazılır.
   - **Sürükleyerek:** her eşya doğru yere konur. Yanlış yatağa bırakılan yastık geri seker, hiçbir şey bozulmaz.
   - **Hiç dokunmadan:** yardım merdiveniyle ritüel kendiliğinden biter (test modunda kısaltılmış süreyle).
   - **Kilit:** sayfa yeniden açılınca uyuyan oda gelir. Ebeveyn kapısından geçilince menü gelir ve kilit silinir. `saat=7` ile açılınca menüde "Günaydın!" bir kez çalar.
   - **Akşam ve gündüz:** `saat=21` iken menüde ay lambası görünür ve dokununca uyku ekranı açılır. `saat=11` iken görünmez.
   - **Ebeveyn Köşesi:** "Uyku vaktini başlat" uyku ekranını açar.
   - Konsol hatası yok (`hataTopla`).
3. **Gemini çizimleri bağlıdır.** `assets/uyku/` 23 dosyanın hepsini içerir, yer tutucu kalmaz.
   - DPR 3'te hiçbir eşya kaynak boyundan büyük basılmaz (bulanıklık yok).
   - Karakterler yatağın **içinde** görünür (ön kenar katmanı önde).
   - Çift resimler (pencere, lamba) geçişte kaymaz (≤ 1 px).
4. **Gerçek hızda izleme:** 844×390 ve 390×844'te, DPR 3'te video ve kare kare izlenir.
   - Tekme, battaniye inişi, perde, lamba ve uyku nefesi akıcıdır. Hiçbir karede karakter parçası dönmez, eşya ekrandan kesilmez.
   - Mümkünse debug APK ile gerçek telefonda denenir.
5. **Seslendirme:** 16 yeni cümle CI ile seslendirilmiş ve yerinde çalıyor. Kayıt yoksa cihaz sesi etiketleri okumuyor.
6. Barış'a 20 sn'lik bir video: tekmeleyen Kino → perde → lamba → uyuyan ikili.

---

## 9. Bilerek yapılmayanlar

- **Süre sınırı ya da zamanlayıcı yok** ("20 dakika sonra uyku"). Bu bir sistem olurdu. Anne düğmeyle başlatır ya da akşam ay lambası davet eder.
- **Pijama, diş fırçalama ve masal okuma yok.** Pijama için karakter giysisi gerekir, diş fırçalama Banyo bölümünde ve oyunlu filmde zaten var, masal yeni metin ve ses ister. Rutin 5 adımda kısa ve tatlı kalır.
- **Mikrofon yok.** Menüde izin penceresi çıkmasın diye "İyi geceler" fısıltısı dinlenmez.
- **Yeni karakter çizimi yok.** Mino ile Kino kendi çizimleriyle oynar.
- **Mağaza metni** bu işin parçası değil. İş bitince `MAGAZA-METINLERI.md`'ye "Uyku vakti: Mino ile Kino'yu yatırın, ekran gözyaşsız kapansın." satırı ve bir ekran görüntüsü önerilir (yönetici).
