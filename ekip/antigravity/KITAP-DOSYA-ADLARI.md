# Kitap "Kino Okula Başlıyor": çizim ve animasyon listesi (dosya adları)

> 2026-10-16 · Kodcu/animatör (Claude ekibi). Antigravity bu listeye göre çizer ve kaydeder; kesme, bağlama ve animasyon kodu bizde (`ekip/illustrator/kitap-isle.cjs`, `kitap/src/`).
> Metin: [../senaryo/KITAP-MINO-KINO.md](../senaryo/KITAP-MINO-KINO.md) §2.5. Yazı resme **basılmaz**; başlığı, metni, konuşmaları kod basar.
> Sıra ISTEK-01'deki gibi: (1) model sayfaları + kapak → Barış onayı → (2) sayfalar ve hareket sayfaları. Her teslimi `CEVAP-01.md`'ye yaz.

## 1. Kayıt yeri ve genel kurallar

- Klasör: `ekip/gemini/yeni/kitap-okul/` (ana çalışma klasöründe). Ad küçük harf, Türkçe harfsiz, `.png`.
- **Sayfa numarası iki hane:** `s01` … `s14`, kapak `kapak`.
- **Yazı yok:** hiçbir resimde harf, rakam, tabela yazısı, poz numarası olmaz.
- **Uğur böceği hiçbir sayfa resmine çizilmez.** Ayrı katmandır (`ortak-ugur.png`); her sayfada yerini biz koyarız. Senaryoda yazan yer (pencere pervazı, çay tabağı …) resimde **açık ve boş** görünsün.
- **Parça döndürme yok** (kol, kafa, kuyruk döndürülmez; Barış 3 kez reddetti). Bütün hareket **çizilmiş kare değişimi** + kodla **squash-stretch** ve **kayma**dır.
- Stil: onaylı düz 2D, dik karşıdan bakış, koyu çikolata kahvesi kontur (#3B2416), sıcak pastel düz dolgu. Doku, gren, boyalı görünüm, 3D render yok.
- Her Gemini isteğine yüklenecek referanslar: `ekip/stil/onayli-stil-oda.png`, `ekip/stil/onayli-stil-banyo.png`, `ekip/stil/onayli-stil-ozet.jpg`, Kino ailesi için `ekip/film/seri-2/karakter/v6/aile-model.png`, o sayfada geçen yeni karakterlerin model sayfası (`model-*.png`) ve hareket sayfası çizerken o sayfanın `sNN.png`'si.
- Boy oranları (Mino birimi, SERI-KITABI tablosu): Kino 1.35, Mino 1.30, Bulut 1.25, Zıpzıp 1.25, Tombi 1.45, Lokum 0.95, Anne 2.16, Baba 2.36. Ceren Öğretmen ≈ Anne boyu.

### 1.1 Bir sayfanın dosyaları (katman yöntemi)

Her sayfa için **dört çeşit dosya** var. Sayfa resmi ile hareketli karakter katmanı ayrıdır:

| Dosya | Ne | Boyut | Nasıl üretilir |
|---|---|---|---|
| `sNN.png` | **Tam sayfa**: sahne + bütün karakterler, "boşta" duruşlarında (aşağıda her sayfada "Başlangıç" yazan durum). Barış'ın onayı ve bizim yerleşim ölçümümüz bunun üstünden yapılır. | **Kare 1:1**, en az **2048x2048** (Gemini 2K kare; 16:9'daki 2752x1536 ile aynı piksel sayısı) ya da 4096x4096 | Yeni sohbet, istem A |
| `sNN-zemin.png` | **Aynı resim, hareketli katmanlar silinmiş**: o karakterlerin arkasındaki duvar/zemin/eşya tamamlanmış. Geri kalan her şey `sNN.png` ile birebir aynı (aynı kadraj, aynı boy). | `sNN.png` ile aynı | Aynı sohbette `sNN.png` üstünde düzenleme, istem B |
| `sNN-<karakter>.png` | **Hareket sayfası** (Barış'ın beğendiği 8 pozluk Fındık sayfası yöntemi): o karakterin bu sayfadaki bütün pozları **tek resimde, aynı ölçekte, aynı bakış açısında**, düz beyaz zeminde. **Poz 1 = `sNN.png`'deki duruşun aynısı.** | 16:9, en az 2752x1536 | Yeni sohbet, `sNN.png` + model sayfası yüklenir, istem C |
| `sNN-<karakter>-<parca>.png` | **Küçük hareket kare dizisi** (kuyruk, kulak): yalnız o parça, tek sıra 3-5 kare, karakterin hareket sayfasıyla aynı ölçekte. Kod kareleri sırayla oynatır. | 16:9, en az 2752x1536 | Hareket sayfasıyla aynı sohbette, istem D |

Kurallar:
- **Hareket sayfası düzeni:** pozlar soldan sağa, üst sıradan alt sıraya, listedeki sırayla. 5-8 poz = 2 sıra × 4; 2-4 poz = tek sıra. Pozlar **birbirine değmez**, aralarında geniş beyaz boşluk; aynı sıradakiler aynı taban çizgisinde; gölge, zemin çizgisi, numara yok.
- **Kuyruk/kulak dizisi:** karakterin hareket sayfasında o dizinin oynayacağı pozun **"kuyruksuz" (ya da "kulaksız") hâli** de bir poz olarak bulunur (listede yazıyor). Parça o pozun **arkasına** yerleşir; parçanın kökü (gövdeye bağlandığı uç) sade, yuvarlak ve biraz uzun çizilir ki gövdenin arkasına girsin, dikiş görünmesin. Kök her karede karenin aynı yerinde: **kuyrukta karenin altında, kulakta karenin üstünde**.
- **Kesik kenar kuralı:** karakter masanın, karyolanın arkasında belden yukarı görünüyorsa hareket sayfasında da **belden yukarı** çizilir ve alt kenarı **düz yatay** kesilir (masa/karyola kenarıyla aynı hizada). Masa/karyola zeminde kalır. Karakterin önünde (masanın üstünde, karakterle bakan arasında) eşya olmasın.
- **Önde duran karakter:** hareketli bir karakterin önünü başka bir karakter kapatıyorsa (s04 Anne'nin bacağı), öndeki de zeminden silinir ve kendi tek pozlu sayfasıyla gelir; biz katmanları sırayla dizeriz.
- **Grup kareleri:** el ele, iç içe hareket eden ikili (s03 Anne+Kino, s05 Anne+Kino, s07 Kino+Kuzu, s13 Kino+Lokum) **tek katmandır**: hareket sayfasının her karesi ikisini birlikte çizer. Her karede ikisi **aynı yerde, aynı boyda**; yalnız listede yazan şey değişir (el, parmak, kulak). Böylece kare değişince titreme olmaz.
- **Yerleşimi biz ölçeriz:** `kitap-isle.cjs` `sNN.png` ile `sNN-zemin.png` farkından her hareketli katmanın yerini ve boyunu bulur, poz 1'i oraya oturtur, öteki pozlar aynı ölçek ve taban çizgisiyle gelir. Antigravity koordinat yazmaz. Uymayan olursa biz `yerlesim.json` ile elle düzeltiriz.
- **Kadraj güvenli alanı:** sayfa resmi telefonda sayfa kutusuna göre yanlardan en çok %15 kırpılabilir. Önemli her şey (karakterler, eşyalar, uğur böceğinin yeri) **ortadaki %70 genişlikte ve üst-alt %5 payın içinde** olsun; kenarlar odanın sakin devamı.
- **Netlik:** hareket sayfasındaki karakter, `sNN.png`'deki boyunun en az %60'ı kadar piksel yüksekliğinde olsun (biz küçültürüz, büyütmeyiz). Karakter sayfada büyükse (sayfa boyunun yarısından uzun) tek sıra × 4 kullan.

### 1.2 İstem kalıpları (İngilizce)

Her istemin sonu aynı **STİL KUYRUĞU** ile biter:

> Straight-on frontal view, flat 2D cartoon, thick smooth dark chocolate-brown outlines (#3B2416), warm flat pastel fills with at most one hard-edged shade tone per color, no texture, no grain, no painterly brush strokes, no 3D render look, no text, no letters, no numbers. Match the attached approved style references (onayli-stil-oda, onayli-stil-banyo, onayli-stil-ozet) and the attached character sheets exactly. premium 2D vector illustration, glossy cartoon finish with soft highlights, high-end toddler picture-book style

**A · Tam sayfa (`sNN.png`)**
> Square 1:1 picture-book page illustration, 2048x2048. Scene: {SAHNE}. Characters: {KARAKTERLER}. Keep all characters and important objects inside the central 70% of the width; the left and right edges are only a quiet continuation of the room. Leave {UGUR_YERI} clearly visible and empty. Do not draw any ladybug. {STİL KUYRUĞU}

**B · Zemin (`sNN-zemin.png`, aynı sohbette, `sNN.png` üstünde)**
> Edit this exact image. Remove {SILINECEK} completely and paint what was behind them (wall, floor, furniture continue naturally). Keep everything else exactly the same: same framing, same size, same positions, same colors, nothing new added. {STİL KUYRUĞU}

**C · Hareket sayfası (`sNN-<karakter>.png`)**
> Animation motion sheet, 16:9, 2752x1536, plain pure white background, no shadows, no ground line, no text or numbers. {N} poses of {KARAKTER_TARİFİ}, in {DÜZEN}, left to right, top row first. All poses at exactly the same scale and the same viewing angle as this character in the attached page image, same outfit, feet on the same baseline in each row, wide white gaps between poses, poses never touch each other. Pose 1 is exactly the pose in the attached page image. Poses: {POZ_LİSTESİ}. {STİL KUYRUĞU}

**D · Kuyruk/kulak dizisi (`sNN-<karakter>-<parca>.png`)**
> Animation frame strip, 16:9, 2752x1536, plain pure white background, no text or numbers. Only {PARÇA} drawn alone, without the body, {N} frames in one row left to right, exactly the same scale as the attached motion sheet. The root end (where it joins the body) is a simple rounded end at the same spot in every frame: at the {bottom|top} center of each frame. Wide white gaps, frames never touch. Frames: {KARE_LİSTESİ}. {STİL KUYRUĞU}

### 1.3 Karakter tarifleri (istemlere yapıştır)

- **Kino** (5): Kino, a 5-year-old beagle-like puppy boy: white fur, long soft chestnut floppy ears reaching his shoulders, chestnut patch around his left eye, chestnut saddle patch on his back, chestnut tail with a bright white tip, small glossy cocoa nose; grass-green short-sleeve T-shirt, navy neckerchief tied in front, red sneakers with white soles. **At school:** light-blue collared school smock over the T-shirt, navy neckerchief visible at the open collar, small backpack.
- **Anne (Defne):** Kino's mother, an elegant adult beagle-like dog: white fur, long chestnut floppy ears, no eye patch, mustard-yellow V-neck cardigan with three round brown buttons, dark brown flat shoes (exactly as on aile-model.png).
- **Baba (Murat):** Kino's father, a big soft round-bellied adult dog: white fur, large chestnut saddle patch, dark chocolate-brown ears, sleepy kind eyes, cherry-red crew-neck sweater with rolled sleeves, brown slippers (exactly as on aile-model.png).
- **Lokum** (2): Kino's baby brother: almost round, chubby white puppy, one chestnut ear and one white ear, huge eyes, two tiny teeth, candy-pink short-sleeve romper with two white snaps, barefoot.
- **Kuzu:** Lokum's cream knitted toy lamb, flat cream color with no knit texture, one ear has visible stitches.
- **Mino** (5): Kino's neighbour, a 5-year-old orange tabby kitten girl: bright orange with darker orange stripes on forehead and tail, cream muzzle, chest and paws, pink inner ears, pointy upright ears, curly tail with a cream tip, amber eyes with lashes, red neckerchief, turquoise pinafore dress (at school: the same light-blue school smock, red neckerchief visible).
- **Bulut** (5): a shy lamb boy: charcoal-black face and legs, bright white fluffy wool (not cream, must not look like the toy Kuzu), light-blue school smock.
- **Ceren Öğretmen:** the kindergarten teacher, a gentle slim adult gazelle woman, warm smile (model sayfasından).
- **Tombi** (6): a chubby honey-colored bear cub boy, round ears, pocket always full, light-blue school smock.
- **Zıpzıp** (5): a sand-beige bunny girl with long upright ears, always one foot in the air, light-blue school smock.

---

## 2. Aşama 1: model sayfaları ve kapak

| Dosya | Ne | Not |
|---|---|---|
| `model-bulut.png` | Bulut model sayfası: ön, yan, arka + 3 ifade (utangaç, gülümseme, şaşkın) | Barış onayı ilk bu |
| `model-ceren.png` | Ceren Öğretmen model sayfası: ön, yan, arka + eğilmiş duruş | |
| `model-kino-onluk.png` | Kino açık mavi önlüklü: ön, yan, arka; bir de **arkası öne giyilmiş önlük** (düğmeler sırtta) | s01 için |
| `kapak.png` | Kapak tam resmi (A). Üst %25'i sakin gökyüzü/duvar: başlığı kod basar | |
| `kapak-zemin.png` | Kino silinmiş (B) | |
| `kapak-kino.png` | Hareket sayfası, 4 poz | |
| `kapak-kino-kuyruk.png` | Kuyruk dizisi, 4 kare | |

**Kapak** · Sahne: Çınar Anaokulu'nun kapısı (cheerful kindergarten entrance door with a little plaque, no letters on it), sabah. Kino ortada, sırt çantalı; çantanın fermuarından minik beyaz kuzu kulağı görünüyor.
- Uğur böceği yeri: kapı tabelasının sağ alt köşesi.
- Başlangıç: Kino bir eli havada, kuyruk dik.
- `kapak-kino.png` (tek sıra × 4): 1) ana poz, bir el havada, kuyruk dik · 2) el sallama: el sola yatık · 3) el sallama: el sağa yatık · 4) poz 1'in **kuyruksuz** hâli.
- `kapak-kino-kuyruk.png` (4 kare, kök altta): 1) dik · 2) sağa kıvrık · 3) aşağı-yana hızlı dönüşte (kısa, kalın, hafif hız çizgisiz) · 4) sola kıvrık. Kodda: pervane = 2-3-4-1 hızlı döngü (her kare 70 ms), el sallama 1-2-3-2-1.

---

## 3. Aşama 2: sayfalar

Her sayfada: `sNN.png` (A), `sNN-zemin.png` (B, "Silinecek" satırı), hareket sayfaları (C), varsa diziler (D). "Kodda" satırı bizim yapacağımızdır, çizilmez.

### s01 · Ters önlük
- Sahne: Kino's bedroom in soft morning light, moon-shaped night lamp still glowing; Kino stands in front of his bed wearing the light-blue school smock **backwards** (buttons on his back), tail straight up; Lokum sits in his barred crib on the right, sleepy, Kuzu in his arms, head and shoulders above the crib's top rail.
- Uğur böceği: pencere pervazı. · Silinecek (B): Kino; Lokum (karyola kalır, parmaklıklar dahil).
- `s01-kino.png` (2 × 4, 6 poz): 1) ana: dik, önlük ters, kuyruk dik · 2) başı sağ omzunun üstünden sırtına bakıyor, eli düğmeleri arıyor · 3) dönmeye başlamış: sağ profil, sırtındaki düğmelere uzanıyor · 4) tam arkası dönük: düğmeler sırtta görünür, iki eli sırtında · 5) sol profil, hâlâ arıyor · 6) poz 1'in kuyruksuz hâli.
- `s01-kino-kuyruk.png` (4 kare, kök altta): kapaktakiyle aynı pervane dizisi, bu sayfanın ölçeğinde.
- `s01-lokum.png` (tek sıra × 4; **kesik kenar**: belden yukarı, alt kenar karyola tırabzanı hizasında düz): 1) uykulu, Kuzu kucakta · 2) esnemeye başlıyor, ağız yarım · 3) kocaman esneme, gözler kapalı, kollar hafif yukarı · 4) esneme sonrası mahmur.
- Kodda: dokununca 2-3-4-5-1 (düğme arayıp kendi etrafında döner) + gövde squash; kuyruk pervanesi boştayken ara ara; Lokum'a dokununca 1-2-3-3-4-1, esnerken dikey stretch.

### s02 · Kahvaltı
- Sahne: kitchen breakfast table seen straight-on: simit, white cheese, olives, tulip-shaped Turkish tea glasses on saucers. Baba sits at the table asleep, head bowed, a simit in his hand. Anne stands by the table holding a teapot. Kino at the table, smock now worn correctly. Lokum on the floor in front of the table with Kino's backpack on his back, the bag dragging on the floor.
- Uğur böceği: bir çay tabağının kenarı (Baba'nın önünde değil). · Silinecek (B): Baba, Lokum (+çanta).
- `s02-baba.png` (tek sıra × 4; kesik kenar: masa hizasında belden yukarı; kolları ve simit masanın üstünde): 1) uyuyor, başı önde, simit elde · 2) horlama: göğüs şişkin, ağız "o" · 3) **sıçramış**: gözler kocaman açık, kulaklar havada, simit yukarıda · 4) "Kalktım!": dik oturmuş, gülümsüyor.
- `s02-lokum.png` (2 × 4, 6 poz; çanta Lokum'la birlikte çizilir): 1) ayakta, çanta sırtta, yere sürtüyor · 2) bir adım atıyor · 3) popo üstü oturmuş, çanta arkasında · 4) oturmuş gülüyor, gözler kapalı · 5) Kuzu'yu çantanın içine sokuşturuyor · 6) parmağı dudağında "şşş", göz kırpar gibi.
- Kodda: Baba'ya dokununca 1-2-1-2 horlama (göğüs squash) → anlatıcı "Çay?" anında 3 (zıplama stretch) → 4; Lokum'a dokununca 2 → 3 (otururken squash) → 4. **Gizli sürpriz:** çantaya dokununca 5 → 6 + "Şşş!".

### s03 · Kapıda Mino
- Sahne: in front of Çınar Apartment building in the morning, a big plane tree, pavement stones. Anne in the middle holding Kino's hand; Kino puffing out his chest; Mino hopping ahead with her backpack (her hand is free: she let go to hop); from Kino's backpack zipper a tiny white lamb ear hangs out.
- Not: senaryoda Mino da Anne'nin elini tutuyor; zıplama animasyonu el ele dururken kopar, bu yüzden Mino bir adım önde, eli serbest çizilir (yönetici kararı).
- Uğur böceği: çınarın alçak bir yaprağı. · Silinecek (B): Anne+Kino (grup), Mino.
- `s03-anne-kino.png` (**grup**, tek sıra × 4): 1) el ele yürüyor, Kino gülümsüyor · 2) Kino göğsünü germiş, kuyruğu dimdik, burnu havada · 3) Kino kaldırım taşına takılmış, öne sendeliyor, kollar açık, Anne'nin eli hâlâ tutuyor · 4) toparlanmış, utangaç sırıtış.
- `s03-mino.png` (tek sıra × 4): 1) yerde, sevinçli · 2) çömelmiş, hoplamaya hazır · 3) havada, kollar yukarı, kuyruk kıvrık · 4) iniş, dizler bükük.
- `s03-kuzu-kulak.png` (3 kare, kök üstte): fermuardan sarkan kuzu kulağı: 1) düz sarkık · 2) sağa sallanmış · 3) sola sallanmış.
- Kodda: Mino boştayken ara ara 2-3-4-1 hoplar (zıplama kayması + squash); Kino'ya dokununca 2 (stretch) → 3 (öne kayma) → 4 → 1; kulak, grup her kare değiştiğinde 1-2-3-1 sallanır.

### s04 · Kocaman okul
- Sahne: kindergarten entrance hall: colorful coat hooks, children's drawings on the wall (no letters), children running in the background (Tombi among them). Ceren Öğretmen bending down, smiling. Kino hides behind Anne's leg, only one long chestnut ear and his tail stick out. Leave an empty strip along the back wall (Zıpzıp will hop across it).
- Uğur böceği: duvardaki bir çocuk resminin köşesi. · Silinecek (B): Kino, Anne (Anne ayrı katman, Kino'nun önünde).
- `s04-anne.png` (1 poz): Anne ayakta, tek parça, sahnedeki gibi.
- `s04-kino.png` (tek sıra × 4): 1) tamamen saklı: yalnız kulak ve kuyruk Anne'nin bacağının yanında görünecek duruş (bütün gövdeyi çiz; Anne katmanı önünü kapatır) · 2) başını uzatmış, tek gözle bakıyor · 3) göz göze geldi: göz kocaman, kulak dik · 4) poz 1'in kuyruksuz hâli.
- `s04-kino-kuyruk.png` (4 kare, kök altta): 1) yarı dik · 2) yatay · 3) aşağı sarkık · 4) yerde.
- `s04-kino-kulak.png` (3 kare, kök üstte): dışarıdaki kulak: 1) sarkık · 2) hafif kalkmış · 3) yana kıpırdamış.
- `s04-zipzip.png` (tek sıra × 4): koşu-zıplama: 1) bir ayak havada · 2) havada uzanmış · 3) iniş · 4) öbür ayak havada.
- Kodda: sayfa açılınca kuyruk yavaşça 1→4 iner; Kino'ya dokununca 2 → 3 → 1 (saklanır) + kulak 1-3-1; Zıpzıp dokununca soldan sağa kayarak 1-2-3-4 döngüsüyle geçer.

### s05 · El
- Sahne: Anne kneels at Kino's eye level and holds one of Kino's hands between her two hands. Kino's ears hang to the floor, his eyes are big. Quiet, warm corner of the entrance hall.
- Uğur böceği: Anne'nin hardal hırkasının cebi, yarı görünür. · Silinecek (B): Anne+Kino (grup).
- `s05-anne-kino.png` (**grup**, tek sıra × 4 + 1 = 2 × 4, 5 poz; her karede ikisi aynı yerde, yalnız eller/kulak değişir): 1) Kino'nun eli yumruk, Anne'nin iki eli arasında · 2) bir parmak açık · 3) iki parmak açık · 4) üç parmak açık · 5) Anne parmağıyla Kino'nun burnuna dokunuyor, Kino'nun kulakları bir an kalkık.
- Kodda: her dokunuş bir parmak (1→2→3→4), dördüncüden sonra 5 (kulaklar stretch) → 4. Burada gülmece yok; hareket yumuşak.

### s06 · Askı
- Sahne: a long row of coat hooks, a small drawing above each hook (pictures only, no letters; above Kino's hook a tiny Kino drawing). Kino alone, ears low. Through the window, Mino in the sandbox. A few steps away, Ceren Öğretmen ties another child's shoe. Kino's backpack hangs on his hook (closed, nothing on the floor yet).
- Uğur böceği: başka bir askıdaki şapkanın üstü. · Silinecek (B): Kino, çanta.
- `s06-kino.png` (2 × 4, 6 poz): 1) ana: kulaklar düşük, kuyruk yerde · 2) ayağıyla yere daire çiziyor: ayak sağda · 3) ayak önde · 4) ayak solda · 5) başını kaldırmış askıdaki resme bakıyor · 6) poz 5'in kuyruksuz hâli.
- `s06-kino-kuyruk.png` (3 kare, kök altta): 1) yerde · 2) bir kez kalkmış · 3) yarı yolda.
- `s06-canta.png` (tek sıra × 4): 1) askıda düz · 2) sola sallanmış · 3) sağa sallanmış · 4) ağzı açık, boş.
- `s06-kuzu.png` (tek sıra × 2): 1) havada düşerken · 2) yerde yüzüstü, yumuşak.
- Kodda: Kino'ya dokununca 2-3-4-2-3-4-1; askıdaki resme dokununca 5 + kuyruk 1-2-1; çantaya dokununca 2-3-2 sallanır → 4, Kuzu düşer (kayma + yere değince squash) "pat"; birkaç saniye sonra baştaki duruma döner.

### s07 · Kuzu
- Sahne: Kino sits on the floor holding Kuzu with both hands in front of him, nose to nose. Kuzu's stitched ear droops sideways. Kino's tail slightly lifted off the floor. Coat hooks behind.
- Uğur böceği: Kino'nun kırmızı ayakkabısının burnu. · Silinecek (B): Kino+Kuzu (grup).
- `s07-kino-kuzu.png` (**grup**, tek sıra × 4): 1) burun buruna · 2) Kino fısıldıyor (ağız küçük açık, gözler yarım) · 3) Kino bir parmağıyla Kuzu'nun dikişli kulağını kaldırıyor · 4) poz 1'in kuyruksuz hâli.
- `s07-kino-kuyruk.png` (4 kare, kök altta): 1) yerde · 2) yarı kalkmış · 3) dik, sola sallanmış · 4) dik, sağa sallanmış.
- Kodda: dokununca 2 → 3 → 1; kuyruk sayfa açılınca yavaşça 1-2-3-4-3-4.

### s08 · Blok köşesi
- Sahne: block corner with big colorful wooden blocks. Bulut sits in the corner holding one blue block, ears low. Kino walks toward him, Kuzu tucked under his arm. A free gap between Kino and Bulut.
- Uğur böceği: kırmızı bir bloğun üstü. · Silinecek (B): Kino, Bulut.
- `s08-kino.png` (tek sıra × 4): 1) yürüyor, Kuzu koltuk altında · 2) duruyor, bir bloğu Bulut'a uzatıyor · 3) gülümsüyor, blok hâlâ uzatılmış · 4) poz 1'in adım değişimi (yürüyüş için öbür ayak).
- `s08-bulut.png` (tek sıra × 4): 1) utangaç, kulaklar düşük · 2) Kuzu'yu görmüş, kulaklar bir an kalkık · 3) utanarak gülümsüyor · 4) yünü kabarmış (yün daha geniş, daha kabarık).
- Kodda: Bulut'a dokununca 2 → 1; Kino'ya dokununca 2 → 3, ardından Bulut 3 → 4 (yün kabarırken squash-stretch) → 1.

### s09 · Kule
- Başlangıç (boşta): kule ayakta, Kino'dan uzun; Kino ve Bulut gururla kuleye bakıyor. Senaryodaki "devrilme anı" dokununca oynar; tam sayfa resmi (`s09.png`) bu yüzden **kule ayaktayken** çizilir.
- Sahne: block corner; a tall wobbly tower of colorful blocks, taller than Kino; Kino and Bulut next to it (Kuzu in Bulut's arms); in the background all the children (Mino, Tombi, Zıpzıp) busy with their own play.
- Uğur böceği: kulenin ortasındaki bir blok; kule devrilince o blokla birlikte havada uçar (senaryodaki "havada uçan bloğun üstü"; biz bağlarız). · Silinecek (B): kule, Kino, Bulut, arka plandaki çocuklar.
- `s09-kule.png` (tek sıra × 3): 1) dik · 2) sağa eğik · 3) sola eğik.
- `s09-bloklar.png` (2 × 4, 8 tek blok, her biri kulede kullanılan renklerden; farklı açılarla yatık çizilmiş): devrilince saçılacak bloklar.
- `s09-kino.png` (tek sıra × 3): 1) gururlu, kuleye bakıyor · 2) ağız açık şaşkın · 3) kulakları dimdik havada.
- `s09-bulut.png` (tek sıra × 2): 1) kuleye bakıyor, Kuzu kucakta · 2) ağız açık şaşkın.
- `s09-cocuklar.png` (tek sıra × 2; Mino, Tombi, Zıpzıp birlikte tek grup): 1) kendi oyunlarında · 2) hepsi dönmüş, kuleye bakıyor.
- Kodda: dokununca kule 2-3-2-3 sallanır → kaybolur, bloklar kayarak ve zıplayarak (her inişte squash) yere saçılır, "GÜM"; Kino 2 → 3, Bulut 2, çocuklar 2. Birkaç saniye sonra kule yeniden ayakta.

### s10 · Bir daha!
- Sahne: block corner, children in a ring: Mino, Bulut, Zıpzıp, Tombi; Kino in the middle handing out blocks; Ceren Öğretmen smiling in the back.
- Uğur böceği: Öğretmen'in omzu. · Silinecek (B): Kino, Mino, Bulut, Zıpzıp, Tombi (Öğretmen kalır).
- `s10-kino.png` (tek sıra × 3): 1) blok dağıtıyor · 2) iki kolu havada sevinç · 3) poz 1'in kuyruksuz hâli.
- `s10-kino-kuyruk.png` (4 kare): pervane dizisi.
- `s10-mino.png`, `s10-bulut.png`, `s10-zipzip.png` (her biri tek sıra × 2): 1) halkada duruyor · 2) kollar havada zıplıyor.
- `s10-tombi.png` (tek sıra × 4): 1) halkada, elinde blok · 2) bloğu ağzına götürüyor · 3) bloğa şaşkın bakıyor · 4) iç çekmiş, bloğu bırakıyor.
- Kodda: çocuklara dokununca hepsi sırayla 2 (zıplama kayması + squash) "Bir daha!"; Kino'nun kuyruğu pervane; Tombi'ye dokununca 1-2-3-4-1 + `[sighs]` anı.

### s11 · Sonra yemek
- Başlangıç: Bulut ve Mino'nun elleri **boş** (pişiler dokununca dağıtılır).
- Sahne: low tables and small chairs; Kino's lunch box open, full of round pişi (Turkish fried dough); Bulut and Mino sit beside him with empty hands; Tombi stretches his neck from the next table.
- Uğur böceği: beslenme kutusunun kapağı. · Silinecek (B): Kino, Bulut, Mino, Tombi, kutudaki pişiler (kutu boş kalır).
- `s11-kino.png` (tek sıra × 3; kesik kenar: masa hizası): 1) kutuyu açmış, sevinçli · 2) iki parmağını kaldırmış · 3) poz 2'nin kuyruksuz hâli.
- `s11-kino-kuyruk.png` (3 kare, kök altta): 1) sola sallanmış · 2) dik · 3) sağa sallanmış.
- `s11-bulut.png`, `s11-mino.png` (her biri tek sıra × 2; kesik kenar): 1) eli boş, uzanıyor · 2) pişi tutuyor, gülümsüyor.
- `s11-tombi.png` (tek sıra × 4; kesik kenar): 1) boynunu uzatmış · 2) pişi elinde · 3) pişiyi tek lokmada yutmuş, yanaklar dolu · 4) gözleri kırpışıyor (gözler kapalı).
- `s11-pisi.png` (tek sıra × 2): 1) tek pişi · 2) kutuda üst üste pişi yığını (kutunun içine oturacak).
- Kodda: Kino'ya dokununca 2 + kuyruk 1-2-3-2; kutuya her dokunuşta bir pişi kayarak sırayla Bulut, Mino, Tombi'ye gider, o karakter 2'ye geçer; Tombi 3 → 4.

### s12 · Kule bitmedi!
- Sahne: classroom door open, Anne in the doorway with open arms. Kino, back turned to Anne, about to put the last block on top of a new, bigger tower; Mino and Bulut hold the tower from both sides. Empty floor between Kino and the door (Kino will run there).
- Uğur böceği: kulenin en tepesindeki blok (son blok konunca onun üstünde görünür; biz yerleştiririz). · Silinecek (B): Anne, Kino, kulenin son bloğu.
- `s12-anne.png` (tek sıra × 3): 1) kollar açık · 2) el sallıyor sola · 3) el sallıyor sağa.
- `s12-kino.png` (2 × 4, 6 poz): 1) arkası dönük, son blok elinde yukarı uzanıyor · 2) blok konmuş, kollar aşağı, kuyruk dimdik · 3) Anne'ye dönmüş, gülüyor · 4) koşu: sol ayak önde, kulaklar arkaya uçuşuyor · 5) koşu: sağ ayak önde, kulaklar havada · 6) Anne'ye ulaşmış, kollar açık.
- `s12-blok.png` (1 poz): son blok.
- Kodda: Anne'ye dokununca 2-3-2-1, Kino dönmez; Kino'ya dokununca blok kule tepesine kayar (konunca squash), Kino 2, sonra 3 ve 4-5 döngüsüyle kapıya kayar, 6. Birkaç saniye sonra baştaki duruma döner.

### s13 · Abi
- Sahne: entrance hall at home: shoe rack, slippers. Kino kneels and opens Lokum's fingers one by one; Lokum holds Kuzu in his other arm. **Mirror of page 5**: same pose and same angle, this time Kino in Anne's place. Anne in the back hangs the bag on the hook, smiling.
- Uğur böceği: ayakkabılıktaki kırmızı spor ayakkabının içi. · Silinecek (B): Kino+Lokum (grup).
- `s13-kino-lokum.png` (**grup**, 2 × 4, 6 poz; her karede ikisi aynı yerde): 1) Lokum'un eli yumruk, Kuzu öbür kolunda · 2) bir parmak açık, Lokum kıkırdıyor (gözler kapalı) · 3) iki parmak, Lokum kıkırdıyor · 4) üç parmak, Lokum kıkırdıyor · 5) Lokum Kuzu'ya sımsıkı sarılmış, gözler kapalı · 6) poz 4'ün Lokum'u gülerek Kino'ya bakıyor.
- Kodda: her dokunuş bir parmak (1→2→3→4) + Lokum'da küçük zıplama squash; sonra 5 → 6; Lokum'a ayrıca dokununca 5.

### s14 · Çay bile
- Sahne: evening dinner table under a warm yellow lamp. Kino asleep with his head on the table next to his plate, a spoon in his hand, tail hanging from the chair, one ear hanging. Baba surprised and grinning widely. Lokum pretends to sleep like Kino but one eye is open. Anne across the table. At home Kino wears his green T-shirt (no smock).
- Uğur böceği: lambanın tepesi. · Silinecek (B): Kino, Baba, Lokum.
- `s14-kino.png` (tek sıra × 2; kesik kenar: masa hizası): 1) uyuyor, kaşık elde · 2) poz 1'in sarkan kulağı olmadan.
- `s14-kino-kulak.png` (3 kare, kök üstte): sarkan kulak: 1) düz · 2) hafif sağa · 3) hafif sola.
- `s14-baba.png` (tek sıra × 3; kesik kenar): 1) şaşkın gülümseme · 2) hırkasını iki eliyle tutup Kino'ya uzanıyor · 3) gülümseyerek doğrulmuş, elleri boş.
- `s14-hirka.png` (1 poz): Kino'nun omzuna örtülmüş hırka (Baba'nın vişne kazağının yanında duracak, krem ya da hardal hırka), Kino'nun sırtına oturacak biçimde.
- `s14-lokum.png` (tek sıra × 2; kesik kenar): 1) uyuyor numarası, iki göz kapalı · 2) bir göz açık.
- Kodda: Kino boştayken nefes (yavaş squash-stretch) + kulak 1-2-1-3; Baba'ya dokununca 2, hırka Kino'nun omzuna kayar, 3; Lokum'a dokununca 1-2-1.

### Ebeveyn sayfası
Resim yok (kod düz zeminle basar).

---

## 4. Ortak dosyalar

| Dosya | Ne |
|---|---|
| `ortak-ugur.png` | Küçük kırmızı uğur böceği (siyah benekli, sade), tek sıra × 4, yukarıdan bakış: 1) kanatlar kapalı · 2) kanatlar yarım açık · 3) kanatlar tam açık, ince zar kanatlar görünür · 4) poz 3'ün biraz daha açığı. Kodda: dokununca 1-2-3-4-3-2-1. Her sayfada aynı böcek. |

## 5. Teslim sayısı (yaklaşık)

Aşama 1: 7 dosya. Aşama 2: 14 tam sayfa + 14 zemin + ~40 hareket sayfası/dizi + 1 ortak ≈ 70 dosya. Bir sayfa bitince (tam sayfa + zemin + hareket sayfaları) `CEVAP-01.md`'ye yaz; biz o sayfayı hemen keser, bağlar, kare kare izleriz.

## 6. Biz ne yapıyoruz (bilgi için)

- `node ekip/illustrator/kitap-isle.cjs` → `assets/kitap/okul/` (WebP) + `assets/kitap/okul/yerlesim.json`. Eksik dosya varsa kitap o sayfada sade yer tutucu gösterir; gelen dosya kendiliğinden yerine geçer.
- Netlik: hiçbir görsel kaynağının üstüne büyütülmez (`src/ui/netlik.ts`); betik küçük gelen hareket sayfasını raporlar.
- Dosya adı yanlış, sayı eksik ya da poz sayısı listedekinden farklıysa betik o dosyayı kesmez ve nedenini yazar.
