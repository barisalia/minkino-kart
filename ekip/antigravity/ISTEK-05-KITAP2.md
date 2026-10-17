# ISTEK-05: İkinci kitap "Kuzu'nun Kulağı" çizimleri

Gönderen: Yönetici Minkino (Claude, kitap yapım koordinatörü). Tarih: 2026-10-17. Barış kitabı onayladı.
Metin: `C:\Users\Minkex\Desktop\Minkino Games\ekip\senaryo\KITAP-MINO-KINO.md` §3 (kapak + 13 sayfa). Yazıyı kod basar; resme yazı konmaz.
İlk kitabın listesi örnek: `C:\Users\Minkex\Desktop\Minkino Games\ekip\antigravity\KITAP-DOSYA-ADLARI.md`.

---

## 1. Sıra (önemli)

1. **Aşama 1 (örnek):** kapak + **sayfa 01, 07, 10**. Her birinin tam sayfası, zemini ve poz sayfaları. Bu dört sayfada kitabın bütün karakterleri ve Kuzu'nun üç hâli (sağlam, kulaksız, dikişli) var.
2. Bitince `CEVAP-05.md`'ye yaz ve **dur**. Yönetici tutarlılığı ve stili kontrol eder.
3. **Aşama 2:** yönetici "devam" deyince (yeni ISTEK dosyasıyla) kalan sayfalar: 02, 03, 04, 05, 06, 08, 09, 11, 12, 13.

## 2. Teslim

- Dosyaları doğrudan şuraya koy: `C:\Users\Minkex\Desktop\Minkino Games\ekip\gemini\yeni\kitap-kuzu\`
- Adlar (küçük harf, Türkçe harf yok, iki haneli sayfa numarası):
  - `kapak.jpg`, `kapak-zemin.jpg`, `kapak-<karakter>.jpg`
  - `sayfa-NN.jpg`: tam sayfa resim
  - `sayfa-NN-zemin.jpg`: aynı resmin karaktersiz hâli
  - `sayfa-NN-<karakter>.jpg`: o karakterin poz sayfası. Birlikte hareket eden ikili tek dosyadır: `sayfa-NN-kino-kuzu.jpg` gibi.
- Bitince listeyi `C:\Users\Minkex\Desktop\minkino yayınevi\CEVAP-05.md`'ye yaz. Her dosya için ad, piksel boyutu, poz sayısı ve varsa sorun.

## 3. Ortak kurallar (ilk kitaptan öğrenilenler)

1. **Aynı karakterler, her sayfada aynı.** Kino, Lokum, Kuzu, Babaanne ve Dede her sayfada aynı kafa, kulak, leke, renk, kıyafet ve boyla çizilir. Baba ve Anne de öyle.
   Her yeni sohbete şu referansları yükle:
   - `C:\Users\Minkex\Desktop\Minkino Games\ekip\film\seri-2\karakter\v6\aile-model.png`: bütün aile, boy oranlarıyla.
   - `C:\Users\Minkex\Desktop\Minkino Games\ekip\gemini\yeni\kitap-okul\antigravity-1376\kapak.jpg` ve `sayfa-01.jpg`: ilk kitabın en iyi Kino'su ve stili.
   - Kuzu için aynı klasördeki `sayfa-07.jpg`.
   - Aşama 2'de bunlara ek olarak bu kitabın onaylanan `kapak.jpg` ve `sayfa-01.jpg`'si.
2. **Boy oranları** (Kino = 1): Lokum 0.70, Babaanne 1.52, Anne 1.60, Dede 1.63, Baba 1.75. Kuzu, Lokum'un kucağında rahatça tutulacak boyda: Lokum'un yarısı kadar.
3. **Kuzu'nun kulağı hikâyeyle değişir:**
   - Kapak, sayfa 1 ve 2: iki kulak sağlam, dikiş yok.
   - Sayfa 3-9: bir kulak kopuk (Kino'nun elinde, cebinde, alnında). Kuzu'nun başında o kulağın yerinde küçük bir yırtık izi var.
   - **Sayfa 10'dan sonra dikişli kulak her zaman görünür:** kulak yerinde, biraz eğri, üstünde ilk kitaptaki gibi üç küçük X dikiş. Kuzu arkaya saklansa bile o kulak görünür kalır.
4. **Uğur böceği her sayfada saklı:** küçük, kırmızı, siyah benekli, sade. Her sayfada aşağıda yazan yerde çizilir. Zeminde de kalır. Hareketli bir karakterin üstündeyse (sayfa 3, 8, 9, 12) o karakterin **bütün pozlarında aynı yerde** çizilir, zeminde olmaz.
5. **Görselde yazı yok:** harf, rakam, tabela, gazete yazısı, poz numarası olmaz. Gazete düz gri çizgili.
6. **Stil ilk kitapla aynı:** temiz, sade 2D vektör; sıcak pastel düz renk; kalın koyu kahve kontur. Doku, gren, boyalı görünüm, 3D ve parlak "yapay zekâ" görünümü yok.
7. **Boyut:** mümkünse 2752x1536 (16:9). Olmuyorsa 1376x768. Zemin ve poz sayfaları, o sayfanın tam resmiyle **aynı boyutta** olmalı.
8. **Zemin = aynı resmin karaktersiz hâli.** Tam sayfayı ürettiğin **aynı sohbette** düzenleme olarak iste. Genel bir arka plan kullanılmaz (ISTEK-04). Kadraj, eşyalar, renkler ve uğur böceği birebir aynı kalır.
9. **Poz sayfası:**
   - Düz beyaz zemin. Gölge, yer çizgisi ve numara yok.
   - Bütün pozlar sayfadakiyle aynı ölçekte ve aynı bakış açısında.
   - Soldan sağa dizilir. 2-4 poz tek sırada, 5-8 poz iki sırada durur.
   - Pozlar birbirine değmez, aralarında geniş beyaz boşluk olur.
   - **1. poz, sayfadaki duruşun aynısıdır.**
   - Masanın ya da karyolanın arkasında belden yukarı görünen karakter, poz sayfasında da belden yukarı çizilir; alt kenarı düz yatay kesilir.
10. Parça döndürme yok. Bütün hareket çizilmiş pozlarla yapılır, kodu biz yazarız.

## 4. İstem kalıpları (İngilizce)

**STİL KUYRUĞU** (her istemin sonuna):
> Clean simple flat 2D vector cartoon in exactly the same style as the attached book pages (kapak, sayfa-01): thick smooth dark chocolate-brown outlines (#3B2416), warm soft pastel flat fills, at most one soft shade tone per color, no texture, no grain, no gradients, no painterly brush strokes, no 3D render look, no glossy AI look. Absolutely no text, letters, numbers or signs anywhere. Characters must match the attached family model sheet (aile-model.png) exactly: same heads, ears, patches, colors, clothes and height ratios.

**A · Tam sayfa** (yeni sohbet, referanslar yüklü):
> Children's picture-book page illustration, 16:9 landscape, 2752x1536. Scene: {SAHNE}. Hide one small red ladybug with black spots {UĞUR YERİ}. {KARAKTER TARİFLERİ} {STİL KUYRUĞU}

**B · Zemin** (aynı sohbette, A'nın sonucunu düzenle):
> Edit this exact image. Remove only {SİLİNECEK} completely and paint naturally what was behind them. Keep every other pixel, the framing, the furniture, the colors and the ladybug exactly identical. Same size. Nothing new added.

**C · Poz sayfası** (tam sayfa yüklü):
> Animation pose sheet, 16:9, same pixel size as the attached page. Plain pure white background, no shadows, no ground line, no text or numbers. {N} poses of {KARAKTER}, {DÜZEN}, left to right, top row first, wide white gaps, poses never touch. All poses at exactly the same scale, angle, outfit and colors as this character in the attached page image. Pose 1 is exactly the pose in the attached page. Poses: {POZ LİSTESİ}. {STİL KUYRUĞU}

### Karakter tarifleri (istemlere yapıştır)

- **Kino** (5 yaş): Kino, a 5-year-old beagle-like puppy boy: white fur, long soft chestnut floppy ears, chestnut patch around his left eye, chestnut saddle patch on his back, chestnut tail with a white tip, small cocoa nose; grass-green short-sleeve T-shirt **with one small chest pocket** (needed in this book), navy neckerchief tied in front, red sneakers with white soles.
- **Lokum** (2 yaş): Kino's baby brother, 0.7 times Kino's height: almost round chubby white puppy, one chestnut ear and one white ear, huge eyes, two tiny front teeth, candy-pink short-sleeve romper with two white snaps, barefoot.
- **Kuzu:** Lokum's cream knitted toy lamb, flat cream color without knit texture, curly wool cap on its head, small brown button eyes, two long soft drooping ears. {intact: both ears whole, no stitches | torn: one ear missing, a tiny torn spot where it was | stitched: that ear sewn back on, slightly crooked, with three small X cross-stitches}
- **Babaanne** (Nazlı): Kino's grandma, 1.52 times Kino's height, plump and cozy elderly beagle-like dog lady: white fur, milky-caramel floppy ears, small round silver-white fur bun on top of her head, small round gold-rim glasses on a thin cord, warm crinkled smiling eyes, lavender cardigan over a plain cream dress, brown shoes.
- **Dede** (Hasan): Kino's grandpa, 1.63 times Kino's height, slim elderly beagle-like dog with a slight stoop: white fur, grey-brown floppy ears, big bushy white eyebrows, white moustache-shaped patch under his nose, dry half-smile, grey flat cap, olive-green vest over a cream shirt, brown trousers, brown shoes.
- **Baba** (Murat): Kino's dad, 1.75 times Kino's height, big soft round-bellied beagle-like dog: white fur, dark chocolate-brown floppy ears, small chestnut tuft on top of his head, small chocolate moustache-shaped patch under his nose, sleepy half-closed kind eyes, cherry-red crew-neck sweater with pushed-up sleeves, navy trousers, brown slippers.
- **Anne** (Defne): Kino's mom, 1.6 times Kino's height: white fur, long chestnut floppy ears, small red bow on one ear, no eye patch, mustard-yellow cardigan with three round brown buttons over a teal dress, dark brown flat shoes.

---

## 5. Sayfa listesi

Her sayfada üç bölüm var:
- **A:** tam sayfa istemindeki sahne.
- **Zemin:** B isteminde silinecek olanlar.
- **Pozlar:** C istemindeki poz sayfaları.

### Kapak · Aşama 1
- **A:** The open doorway of the children's bedroom. Kino stands in the doorway hiding something behind his back, a guilty sheepish smile, eyes glancing sideways. From behind his back one cream knitted lamb foot pokes out. In front of him Lokum stands with both arms wide open, looking around, searching. Warm afternoon light. Leave the upper part of the picture calm (wall).
- **Uğur böceği:** kapı pervazında, yarı boyda.
- **Zemin:** Kino (arkasındaki Kuzu ayağı dahil), Lokum. → `kapak-zemin.jpg`
- **`kapak-kino.jpg`** (4 poz, tek sıra):
  1. Sayfadaki duruş: eller arkada, gözler yana, kuyruk yarı kalkık.
  2. Göz ucuyla Lokum'a bakıyor, suçlu sırıtış büyümüş.
  3. Aynı duruş, kuyruk dimdik yukarı.
  4. Aynı duruş, kuyruk aşağıda.
- **`kapak-lokum.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş: kollar açık, arıyor.
  2. Öbür yana dönmüş arıyor, bir eli kaşının üstünde.
  3. Kino'ya bakıyor, kafası yana eğik, meraklı.

### Sayfa 01 · Kuzu her yere gider · Aşama 1
- **A:** Saturday breakfast table seen straight-on: simit, white cheese, olives, a jam jar with a lid, tulip-shaped Turkish tea glasses on saucers. Lokum sits in a high chair without a front tray. Next to him Kuzu (intact) sits in its own tiny chair with a tiny plate in front of it. Lokum holds out a piece of bread to Kuzu. Kino at the other end of the table, laughing. Anne stands by the table pouring tea from a teapot.
- **Uğur böceği:** reçel kavanozunun kapağında.
- **Zemin:** Lokum, Kuzu, Kino. Mama sandalyesi ve Kuzu'nun sandalyesi kalır. → `sayfa-01-zemin.jpg`
- **`sayfa-01-lokum-kuzu.jpg`** (birlikte, 3 poz, tek sıra; mama sandalyesi çizilmez, Lokum oturur duruşta):
  1. Sayfadaki duruş: Lokum Kuzu'ya ekmek uzatıyor.
  2. Ekmek Kuzu'nun burnuna değmiş; Kuzu'nun burnunda küçük bir reçel lekesi.
  3. Lokum Kuzu'ya sımsıkı sarılmış, gözleri kapalı, Kuzu'nun burnunda reçel.
- **`sayfa-01-kino.jpg`** (3 poz, tek sıra; masanın arkasında belden yukarı, alt kenar masa hizasında düz):
  1. Sayfadaki duruş: gülüyor.
  2. Kıkırdıyor, bir pati ağzının önünde, gözler kapalı.
  3. Öne eğilmiş kahkaha, kulaklar havada.

### Sayfa 02 · Bir dakikacık · Aşama 2
- **A:** Children's bedroom, early afternoon, warm yellow light through the curtain. Lokum sleeps in his barred crib with his bottom up in the air; the crib's front side is low so his head and raised bottom show above the top rail. On the floor at the foot of the crib lies Kuzu (intact). In the middle of the room stands Kino's tall tower of colorful wooden blocks. Kino tiptoes toward Kuzu, tail stiff straight up.
- **Uğur böceği:** karyolanın bir parmaklığında.
- **Zemin:** Kino, Lokum. Karyola ve yerdeki Kuzu kalır.
- **`sayfa-02-kino.jpg`** (5 poz, iki sıra):
  1. Sayfadaki duruş: parmak ucunda adım, kuyruk dimdik.
  2. Öbür ayakla parmak ucu adım.
  3. Adımın ortasında donmuş, gözler kocaman, karyolaya bakıyor, kuyruk titrek dik.
  4. Rahatlamış, parmağı dudağında "şşş".
  5. Eğilmiş, Kuzu'ya uzanıyor.
- **`sayfa-02-lokum.jpg`** (3 poz, tek sıra; karyola tırabzanının üstü, alt kenar tırabzan hizasında düz):
  1. Sayfadaki duruş: uyuyor.
  2. Uykusunda ağzını şapırdatıyor, ağız küçük açık.
  3. Uykuda gülümsüyor.

### Sayfa 03 · Bekçi · Aşama 2
- **A:** Same bedroom (Lokum still asleep in the crib in the background). The block tower is falling: tipping to the right, top blocks flying in the air. Kino has jumped up, in mid-air, arms stretched, holding Kuzu (intact) by one ear; Kuzu dangles below, the ear about to tear at its root.
- **Uğur böceği:** havada uçan bir bloğun üstünde. O blok kule poz sayfasında olduğu için böcek **kulenin her pozunda aynı blokta** çizilir.
- **Zemin:** kule ve havadaki bloklar, Kino, Kuzu.
- **`sayfa-03-kule.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş: sağa devriliyor, üst bloklar havada.
  2. Sola eğik.
  3. Bloklar yerde dağınık, alçak bir yığın.
- **`sayfa-03-kino-kuzu.jpg`** (birlikte, 3 poz, tek sıra):
  1. Sayfadaki duruş: Kino havada, Kuzu'yu kulağından tutuyor.
  2. Yere inmiş, Kuzu kulağından sarkıyor.
  3. Kulak kopmuş: Kino'nun elinde yalnız kulak, gözleri kocaman; Kuzu hemen altında düşüyor (kulaksız).

### Sayfa 04 · Minderin altı · Aşama 2
- **A:** Same bedroom. Kino sits hastily on a huge square floor cushion with tassels at the corners. From under the cushion one foot of Kuzu (torn) sticks out. From Kino's T-shirt chest pocket the tip of a cream lamb ear hangs out. In the background Lokum sits up in his crib rubbing his eyes.
- **Uğur böceği:** minderin bir püskülünde.
- **Zemin:** Kino, Lokum. Minder ve altından görünen Kuzu ayağı kalır.
- **`sayfa-04-kino.jpg`** (5 poz, iki sıra):
  1. Sayfadaki duruş: minderde oturuyor, cebinden kulak ucu sarkıyor, telaşlı.
  2. Kulaklar yere kadar düşmüş, kuyruk yerde.
  3. Minderin üstünde "hop": biraz havada.
  4. Yere inmiş, parmağıyla kulak ucunu cebine itiyor.
  5. Oturuyor, masum gülümseme, kulak görünmüyor.
- **`sayfa-04-lokum.jpg`** (3 poz, tek sıra; karyola tırabzanının üstü, alt kenar düz):
  1. Sayfadaki duruş: gözlerini ovuşturuyor.
  2. Kocaman esneme.
  3. Mahmur, Kino'ya bakıyor.

### Sayfa 05 · Arama · Aşama 2
- **A:** Living room. Baba sleeps on the sofa with his mouth open, his brown slippers on the floor in front of the sofa. Lokum lifts Baba's big arm with both hands and peeks underneath. Behind them Kino clutches the big tasseled cushion to his chest and innocently looks at the ceiling; one foot of Kuzu (torn) dangles from a corner of the cushion.
- **Uğur böceği:** yerdeki terliğin üstünde.
- **Zemin:** Baba, Lokum, Kino. Kanepe ve terlikler kalır.
- **`sayfa-05-baba-lokum.jpg`** (birlikte, 4 poz, tek sıra):
  1. Sayfadaki duruş: Lokum kolu kaldırmış, Baba uyuyor.
  2. Baba horluyor: göğsü şişkin, bıyık lekesi kalkık.
  3. Lokum başını kolun altına sokmuş bakıyor.
  4. Lokum kolu bırakmış, omuz silkiyor; Baba'nın kolu aşağıda.
- **`sayfa-05-kino.jpg`** (4 poz, tek sıra):
  1. Sayfadaki duruş: minder göğsünde, gözler tavanda, Kuzu ayağı sarkıyor.
  2. Islık çalmaya çalışıyor: dudaklar büzük, yanaklar şişik.
  3. Yanaklar daha şişik, gözler sıkılı.
  4. Minderi çevirmiş: Kuzu ayağı görünmüyor, gergin gülümseme.

### Sayfa 06 · Taş · Aşama 2
- **A:** Living room, a big rug with a simple geometric pattern in flat colors. Tiny Lokum sits alone in the middle of the rug, his chestnut ear drooping down. In the doorway Kino clutches the cushion tightly, tail on the floor. Wide empty space between them. Quiet mood, no tears.
- **Uğur böceği:** kilimin köşesindeki desende, çok sessiz.
- **Zemin:** Lokum, Kino.
- **`sayfa-06-lokum.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş: oturuyor, kestane kulak düşük, alt dudak önde.
  2. Dudağı titriyor (dalgalı ağız). Gözler ıslak ama gözyaşı yok.
  3. Kestane kulak daha da düşük, yere bakıyor.
- **`sayfa-06-kino.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş.
  2. Minderi daha sıkı tutuyor, minder ezilmiş, omuzlar kalkık.
  3. Kulaklar yere düşmüş, gözler aşağıda.

### Sayfa 07 · Bant · Aşama 1
- **A:** Kino's bedroom. Kino sits on the floor with little pieces of tape stuck all over him. Kuzu (torn, one ear missing) sits in his lap. The torn cream lamb ear is taped to Kino's forehead, standing between his two long chestnut ears like a funny third ear. Kino looks up at it cross-eyed. A tape roll lies on the floor next to him.
- **Uğur böceği:** bant makarasının üstünde.
- **Zemin:** Kino ve kucağındaki Kuzu. Bant makarası kalır.
- **`sayfa-07-kino-kuzu.jpg`** (birlikte, 6 poz, iki sıra; Kuzu her pozda kucakta aynı yerde):
  1. Sayfadaki duruş: kulak alnında, Kino yukarı şaşı bakıyor.
  2. Kulağı Kuzu'nun başına bantlamış, umutlu (alnında kulak yok).
  3. Kulak Kuzu'nun başından kayıp düşüyor.
  4. Bant patisine yapışmış, o patiyi silkeliyor.
  5. Bant öbür patisine geçmiş.
  6. Kulağı bantla kendi alnına bastırıyor.

### Sayfa 08 · Üç kulak · Aşama 2
- **A:** Kino's bedroom doorway. Babaanne stands at the door holding a plate of steaming round pişi (Turkish fried dough). Kino sits on the floor exactly as on page 7: tape everywhere, the lamb ear on his forehead, Kuzu (torn) in his lap.
- **Uğur böceği:** pişi tabağının kenarında. Tabak Babaanne'nin elinde olduğu için böcek **Babaanne'nin her pozunda aynı yerde** çizilir.
- **Zemin:** Babaanne, Kino ve Kuzu.
- **`sayfa-08-babaanne.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş: kapıda, tabak elde, gülümsüyor.
  2. Bir parmağıyla gözlüğünü burnuna itiyor, kaşlar havada.
  3. Meraklı, öne eğilmiş, tabak öbür elinde.
- **`sayfa-08-kino-kuzu.jpg`** (birlikte, 4 poz, tek sıra):
  1. Sayfadaki duruş: kulak alnında, Babaanne'ye bakıyor.
  2. Kulağı alnından çekiyor, yüzü buruşmuş.
  3. Kulak elinde, başı eğik, kulakları düşük.
  4. Başı eğik, kuyruk yerden yavaşça kalkmış.

### Sayfa 09 · Babaanne de saklamış · Aşama 2
- **A:** Kino's bedroom. Babaanne and Kino sit side by side on the edge of Kino's bed. Babaanne waves one hand in the air, telling a story; her glasses hang on a thin cord. Kino laughs big, his tail hanging over the bed edge. On the floor in front, the big cushion lies with Kuzu (torn) under it; one foot shows.
- **Uğur böceği:** Babaanne'nin gözlük ipinde. **Babaanne'nin her pozunda aynı yerde** çizilir.
- **Zemin:** Babaanne, Kino, minder. Minderin altındaki Kuzu zeminde **tamamen** görünür: yerde yatıyor, kulaksız.
- **`sayfa-09-babaanne.jpg`** (4 poz, tek sıra):
  1. Sayfadaki duruş: anlatıyor, bir eli havada.
  2. Babasını taklit ediyor: çay kaşığını ağzına götürüyor.
  3. Kaşık ağzında, gözler kocaman şaşkın.
  4. Kahkaha, eli karnında.
- **`sayfa-09-kino.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş: kocaman gülüyor.
  2. Yatakta zıplıyor: biraz havada, kulaklar uçuşuyor.
  3. Yatağın kenarından eğilmiş, aşağı uzanıyor.
- **`sayfa-09-minder.jpg`** (2 poz, tek sıra):
  1. Sayfadaki duruş: yerde yatıyor.
  2. Yan dönmüş, kalkık.

### Sayfa 10 · İlmek ilmek · Aşama 1
- **A:** Grandparents' home downstairs: a Turkish sedir (long low divan with cushions), a plain flat-colored sewing basket and a cream yarn ball on the sedir. Babaanne sits with her glasses on, sewing Kuzu's ear back on with a needle and cream thread. Kino holds Kuzu with both hands, tight and careful, his tongue sticking out in concentration. In the background Dede sits in his armchair; he has lowered his newspaper (plain grey lines, no letters) and raises his bushy white eyebrows.
- **Kuzu:** dikiş yapılıyor; kulak yerine oturuyor. Bu sayfadan sonra dikişli kulak hep görünür.
- **Uğur böceği:** iplik yumağının üstünde.
- **Zemin:** Babaanne, Kino ve Kuzu, Dede. Sedir, sepet, yumak ve koltuk kalır.
- **`sayfa-10-babaanne-kino-kuzu.jpg`** (birlikte, 5 poz, iki sıra; her pozda üçü aynı yerde):
  1. Sayfadaki duruş: iğne kulağın dibinde.
  2. İğne yukarı çekilmiş, iplik gergin, 1 dikiş.
  3. 2 dikiş.
  4. 3 dikiş, kulak yerinde, biraz eğri.
  5. Kino parmağıyla dikişleri sayıyor, Babaanne gülümsüyor.
- **`sayfa-10-dede.jpg`** (3 poz, tek sıra; koltuğun arkalığı zeminde kalır, Dede oturur duruşta):
  1. Sayfadaki duruş: gazete inik, bir kaşı havada.
  2. İki kaşı birden havada, hafif gülümseme.
  3. Gazete yeniden yukarıda, yalnız kasket ve kaşlar görünüyor.

### Sayfa 11 · En zoru · Aşama 2
- **A:** Apartment staircase in front of Kino's family's front door. Lokum sits on the top step, waiting. Kino stands two steps lower, hiding Kuzu behind his back; Kuzu's stitched ear peeks out from behind him. Kino's ears hang low but his head is up. At the bottom of the stairs Babaanne leans on the banister, quietly watching. No jokes, calm mood.
- **Uğur böceği:** tırabzanın topuzunda.
- **Zemin:** Kino ve Kuzu, Lokum. Babaanne zeminde kalır.
- **`sayfa-11-kino-kuzu.jpg`** (birlikte, 4 poz, tek sıra):
  1. Sayfadaki duruş: Kuzu arkada, dikişli kulak görünüyor.
  2. Derin nefes: göğüs kabarık, gözler kapalı.
  3. Kuzu'yu iki eliyle öne getiriyor.
  4. Kuzu'yu Lokum'a uzatıyor, kollar uzanmış.
- **`sayfa-11-lokum.jpg`** (3 poz, tek sıra):
  1. Sayfadaki duruş: oturuyor, ciddi, bekliyor.
  2. Gözler kocaman.
  3. Öne eğilmiş, elleri uzanıyor.

### Sayfa 12 · Dikiş! · Aşama 2
- **A:** Top of the staircase. Lokum presses Kuzu against his face, the stitched ear facing forward. With his other hand he points at his own chestnut ear. Kino stands beside him laughing, tail straight up and wagging.
- **Uğur böceği:** Kuzu'nun dikişinin hemen yanında. Bu sayfada bilerek görünür olsun. **Lokum'un her pozunda aynı yerde** çizilir.
- **Zemin:** Lokum ve Kuzu, Kino.
- **`sayfa-12-lokum-kuzu.jpg`** (birlikte, 4 poz, tek sıra):
  1. Sayfadaki duruş.
  2. Kuzu'ya sarılmış, sola sallanıyor.
  3. Sağa sallanıyor.
  4. Kendi kestane kulağını tutup Kino'ya uzatıyor, Kuzu öbür kolunun altında, kıkırdıyor.
- **`sayfa-12-kino.jpg`** (4 poz, tek sıra):
  1. Sayfadaki duruş: gülüyor, kuyruk dik.
  2. Kuyruk sola savrulmuş.
  3. Kuyruk sağa savrulmuş.
  4. Kuyruk yana yatık.

### Sayfa 13 · Bunu da dik! · Aşama 2
- **A:** Grandparents' small garden under a lemon tree. Babaanne sits on a chair with the sewing basket on her knee and a tulip tea glass on a saucer in her hand. In front of her lies a little pile of "broken" things: a toy car with one wheel off and Dede's grey flat cap. Lokum, with Kuzu (stitched ear visible) under one arm, pulls sleepy Baba by the hand; Baba shuffles along half-asleep in his slippers. Kino and Dede stand side by side, laughing. Dede has no cap on this page (it is in the pile).
- **Uğur böceği:** limon ağacının bir yaprağında.
- **Zemin:** Lokum ve Baba, Babaanne, Kino ve Dede. Sandalye, yığın ve ağaç kalır.
- **`sayfa-13-lokum-baba.jpg`** (birlikte, 4 poz, tek sıra):
  1. Sayfadaki duruş: Lokum çekiyor, Baba yarı uykulu.
  2. Baba bir adım atmış, kocaman esniyor.
  3. Baba'nın gözleri fal taşı gibi açık, kulaklar havada: uyandı.
  4. Baba dik, gülümsüyor; Lokum sevinçten zıplıyor.
- **`sayfa-13-babaanne.jpg`** (3 poz, tek sıra; oturur duruşta, sandalye zeminde kalır):
  1. Sayfadaki duruş.
  2. Gülüyor.
  3. Çay bardağını Baba'ya doğru kaldırıyor.
- **`sayfa-13-kino-dede.jpg`** (birlikte, 3 poz, tek sıra):
  1. Sayfadaki duruş: yan yana gülüyorlar.
  2. İkisi aynı anda kaşlarını kaldırıyor: Dede'ninki gür, Kino'nunki küçük.
  3. İkisi gözleri kapalı kahkaha.

---

## 6. Sayım

- **Aşama 1:** 4 tam sayfa + 4 zemin + 7 poz sayfası = **15 dosya**.
- **Aşama 2:** 10 tam sayfa + 10 zemin + 22 poz sayfası = **42 dosya**.

## 7. Biz ne yapıyoruz (bilgi için)

Kitabın metni uygulamada hazır, rafta açılıyor. Resim gelmeyen sayfa şimdilik sade yer tutucu gösteriyor. Dosyaların gelince kesilmesi, yerleştirilmesi ve canlandırılması bizde. Ad, boyut ya da poz sayısı listeden farklıysa CEVAP-05'e yaz.
