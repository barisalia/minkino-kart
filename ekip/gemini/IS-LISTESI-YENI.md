# Gemini iş listesi: yeni görseller (Kino'nun Otobüsü, Dedektif Vaka 3, Bölüm 1 "Yağmurlu Gün")

> 2026-10-09 · Kaynak belgeler: `ekip/senaryo/kino-otobus.md`, `ekip/senaryo/dedektif-vaka3.md`, `ekip/film/bolum-1-yagmurlu-gun.md`, `ekip/senaryo/mino-kino-pasta.md` (Ek A).
> Bütün yeni çizimleri **Gemini** çizer (Recraft yok). Şeffaflık ve temizlik Adobe'da; kodcu bağlar. Stil kuralı: `ekip/stil-rehberi.md`.
> **Toplam: 87 yeni görsel** (bölüm A-E) + Pasta için 2 (Ek A) + Pazar Tart Bakalım için 3 (Ek B) = 92.

## 0. Nasıl kullanılır

**Stil eki: istemin sonuna aynen eklenir.**

- **S-NESNE** (eşya, kart, karakter pozu; beyaz zemin, sonra şeffaf yapılır):
  > Premium glossy cartoon style for a toddler picture book, modern Disney Junior / Nick Jr. preschool style, clean flat 2D vector look with only light two-tone cel shading and a few small subtle highlights, thick clean dark brown outline (not black), simple rounded shapes, soft warm colors. No texture, no grain, no brush strokes, no 3D, no plastic look. Centered, isolated on a plain pure white background, no text, no ground, no cast shadow.
- **S-ARKA** (arka plan; kenardan kenara, beyaz yok):
  > Premium glossy cartoon vector illustration, clean 2D vector art, modern Disney Junior / Nick Jr. preschool style, smooth flat color fills with soft gradients, glossy white highlights used sparingly, crisp clean dark-brown outlines, simple rounded shapes, no texture, no brush strokes, no grain, no sketch lines, no painterly effects. The center of the image is open empty space for characters. No animals, no characters, no text.
- **S-KİLİT** (var olan karakterin yeni pozu; önce kaynak görsel yüklenir):
  > Keep exactly the same character, same design, same proportions, same colors, same face, same thick dark-brown outlines, same light cel shading and the same small amount of highlights. Clean flat 2D cartoon vector, no fur texture, no 3D. Full body, plain pure white background, no text, no ground.

**Kaynak görseller (yüklenecek):** Kino: `assets/giysin/kart-kino.webp` (önden) ve `ekip/film/mino-kino-sarilma.png` · Mino: `karakter-kaynak/mino-yeni.svg` (PNG'ye çevrilmiş hâli) · stil örneği (eşyalarda ikinci görsel olarak): `assets/pasta/kurabiye-yildiz-krema-pembe-1.webp`, `assets/film/esya/semsiye.webp`.

**Boyut kısaltmaları:**
- **K**: kare 1:1, en az 2048×2048 (eşya, kart, poz).
- **Y**: yatay 16:9, en az 2752×1536 (arka plan; dedektif sahnesi 4096×2286 tercih).
- **D**: dikey 9:16, en az 1536×2752 (dedektif sahnesinin dikey eşi).
- **G**: geniş 3:1 ya da 2:1 (tezgâh, flama), en az 3072 geniş.

**Şeffaf** sütunu: **E** = beyaz zemin Adobe'da silinir (kesik çıktı, WebP alfa). **H** = arka plan, zemin kalır.

**Kontrol** (her görsel): stil rehberi §5 listesi; ayrıca yanına `assets/pasta/otobus-1.webp` ya da `assets/dedektif2/kart-ordek.webp` konup aynı dünyadan mı diye bakılır. Yazı, harf, rakam çıkarsa görsel kullanılmaz.

**Kayıt:** `ekip/gemini/yeni/<bölüm>/<dosya>.png` (≥ 2048). Adobe temizleyip `assets/<klasör>/<dosya>.webp` yapar.

---

## Yeniden kullanılanlar (yeni çizim YOK)
| Ne | Dosya | Nerede |
|---|---|---|
| Müşteriler (13 karakter) | `assets/karakter-iskelet/*` | Kino'nun Otobüsü |
| Park ve plaj pencere manzarası | Pasta'nın pencere görüntüleri | Kino'nun Otobüsü Gün 1-2 |
| Jeton, kumbara kavanozu | `assets/pasta/jeton-1`, `kumbara-kavanoz-1` | Kino'nun Otobüsü |
| Otobüs içi dünyası, tezgâh, tepsi, yıldız kurabiye | `assets/pasta/arka-tezgah-uzak`, `tezgah-on`, `firin-tepsisi`, `kurabiye-yildiz-krema-sari` | Vaka 3 (kartlardaki 2/4/6 kurabiye kodla dizilir) |
| Havuç parçası | `assets/pasta/susler-havuc-1` | Vaka 3 Halka 3 |
| Kuş kartı | `assets/hayvanlar/kus.webp` | Vaka 3 Halka 4 |
| Büyüteç, dosya, Mino dedektif, Kino utanç | `assets/dedektif/*`, `src/mino` | Vaka 3 |
| Ev, yağmurlu oturma odası, park arka planları | `assets/film/ev`, `assets/film/yagmur`, `assets/film/park` | Bölüm 1 |
| Mino yağmurluk; Kino yağmurluk ve çizme | `assets/giysin/mino-yagmurluk`, `assets/giysin/giysi/*` | Bölüm 1 |
| Kova, kürek, birikinti, su sıçraması | `assets/giysin/esya-kova`, `esya-kurek`, `esya-birikinti`, `esya-sicrama` | Bölüm 1 |
| Battaniye, fener, şemsiye, kaydırak | `assets/ege/battaniye-anne`, `assets/film/esya/fener`, `semsiye`, `kaydirak` | Bölüm 1 |
| Gölge tavşan | tavşan iskeletinin siyah silueti (kod) | Bölüm 1 |
| Kovuk ağızları, pencere pervazı (ön katmanlar) | Vaka 3'ün ağaç ve otobüs sahnelerinden **Adobe keser** | Vaka 3 |

---

## A. Öncelik 1 · Kino'nun Otobüsü Gün 1 (ücretsiz gün, mağazanın vitrini) · 20 görsel

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| A1 | `kino-otobus/otobus.webp` | Y (otobüs tuvali ortada) | E | açılış, akşam, menü |
| A2 | `kino-otobus/ic-arka.webp` | Y | H | gün ekranının arka duvarı (pencere maskeyle oyulur) |
| A3 | `kino-otobus/tezgah-on.webp` | G 3:1 | E | ön tezgâh yüzü |
| A4 | `kino-otobus/dolap.webp` | G 2:1 | E | 6 gözlü dondurma dolabı (boş gözler) |
| A5-A7 | `kino-otobus/kap-cilek.webp`, `kap-vanilya.webp`, `kap-cikolata.webp` | K | E | dolaptaki tat kapları |
| A8-A10 | `kino-otobus/top-cilek.webp`, `top-vanilya.webp`, `top-cikolata.webp` | K | E | dondurma topu (kuleye dizilir, balonda simge) |
| A11 | `kino-otobus/kulah.webp` | K | E | külah |
| A12 | `kino-otobus/kase.webp` | K | E | kâse |
| A13 | `kino-otobus/sos-cikolata-sise.webp` | K | E | sos şişesi |
| A14 | `kino-otobus/sos-cikolata-ust.webp` | K | E | topun tepesine oturan sos |
| A15 | `kino-otobus/kepce.webp` | K | E | Kino'nun elindeki kepçe |
| A16 | `kino-otobus/kino-onluk.webp` | K | E | Kino iskeletine (govde) bağlanan önlük |
| A17 | `kino-otobus/kino-sapka.webp` | K | E | Kino iskeletine (kafa) bağlanan şapka |
| A18 | `kino-otobus/sus-kemik-tabela.webp` | G 2:1 | E | otobüs süsü (Gün 1 dükkânı) |
| A19 | `kino-otobus/sus-flama.webp` | G 3:1 | E | otobüs süsü (Gün 1 dükkânı) |
| A20 | `kino-otobus/kapak.webp` | 4:3, en az 2732×2048 | H | menü kartı ve oyun açılışı |

**İstemler**
- **A1** · A single cute food truck bus in side view, facing right, soft ice-blue body with a few round warm brown spots like a puppy's coat, a cream stripe along the side, a big closed side hatch with a small brown paw print in the middle, a giant ice cream cone with three scoops (pink, cream, brown) mounted on the roof, round windows, two big dark tires with cream hubs, small yellow headlight. Same shape language and proportions as the attached pink pastry bus. + S-NESNE
- **A2** · Empty background scene for a premium toddler picture book: the inside of an ice-blue ice cream truck seen from the counter, a wide open serving window in the upper half filled with plain flat light grey (to be masked), cream tiled wall with tiny paw-print tiles, a small shelf on the right side wall, warm soft light. + S-ARKA
- **A3** · A single long horizontal front face of a wooden serving counter for an ice cream truck, light honey wood top edge, ice-blue front panel with two cream cabinet doors and small round brass knobs, a thin row of tiny brown paw prints along the bottom. Very wide horizontal, flat front view. + S-NESNE
- **A4** · A single wide ice cream freezer seen from the front and slightly from above, white and ice-blue body, a glass top with six empty rectangular slots in two rows of three (each slot an empty dark-blue hole), cold frost sparkles on the glass edges, front view, straight not tilted. + S-NESNE
- **A5** · A single round ice cream tub seen slightly from above, filled with smooth pink strawberry ice cream with one curled scoop mark on the surface and a tiny strawberry on the tub label area (no text), cream-colored tub. + S-NESNE
- **A6** · Same as A5 but with cream-yellow vanilla ice cream and a small vanilla flower on the tub. + S-NESNE
- **A7** · Same as A5 but with chocolate brown ice cream and a small chocolate square on the tub. + S-NESNE
- **A8** · A single round scoop of pink strawberry ice cream, soft rounded ball with a slightly ruffled bottom edge, two tiny strawberry seeds, one small glossy highlight. Front view. + S-NESNE
- **A9** · A single round scoop of cream-yellow vanilla ice cream, soft rounded ball with a slightly ruffled bottom edge, a few tiny vanilla specks, one small glossy highlight. Front view. + S-NESNE
- **A10** · A single round scoop of chocolate brown ice cream, soft rounded ball with a slightly ruffled bottom edge, one small glossy highlight. Front view. + S-NESNE
- **A11** · A single empty waffle ice cream cone, golden waffle grid pattern, upright, front view, open top. + S-NESNE
- **A12** · A single empty paper ice cream cup, white with ice-blue stripes and a small brown paw print, wide open top seen slightly from above, front view. + S-NESNE
- **A13** · A single squeeze bottle of chocolate sauce, brown bottle with a cream cap and a small drop shape on the front (no text). + S-NESNE
- **A14** · A single glossy chocolate sauce topping shaped like a cap that sits on top of a round ice cream scoop, with two drips running down the sides, seen from the front, no ice cream underneath. + S-NESNE
- **A15** · A single ice cream scoop tool, shiny silver round scoop with an ice-blue handle, front side view. + S-NESNE
- **A16** · Upload Kino. A small ice-blue apron for this puppy character with a cream pocket and a tiny ice cream cone embroidered on it, drawn alone without the puppy, front view, sized and shaped to fit this puppy's body exactly. + S-NESNE
- **A17** · Upload Kino. A small soft cap for this puppy character shaped like an upside-down ice cream cone with a pink scoop on top, drawn alone without the puppy, front view, sized to sit between his ears. + S-NESNE
- **A18** · A single wooden sign shaped like a dog bone, cream wood with a brown outline, an ice cream cone painted in the middle, two small hanging chains at the top, no text. + S-NESNE
- **A19** · A single long horizontal string of small triangle bunting flags in ice-blue, pink, cream and mint, hanging in a gentle curve. + S-NESNE
- **A20** · Upload Kino. A cheerful picture book cover scene: this puppy character wearing an ice-blue apron leans out of the window of an ice-blue ice cream truck in a sunny park, holding up a three-scoop ice cream cone (pink, cream, brown), tongue out happily, a little rabbit customer smiling at the window. Characters big and clear, faces fully visible. Premium glossy 2D cartoon, Disney Junior style, thick dark brown outlines, no text.

---

## B. Öncelik 2 · Dedektif Mino Vaka 3 "Kaybolan Yıldız Kurabiyeler" · 28 görsel

**Kural (Barış):** kartlarda hayvanın/nesnenin kendisi, üç kart aynı boy, aynı ışık, aynı çerçeve dışı boşluk. Saklanan şeyler sahnenin kendi çizgilerinin arkasına girer; ön katmanı Adobe aynı görselden keser.

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| B1 | `dedektif3/otobus-ic.webp` | Y 4096×2286 | H | giriş, Halka 1-2 |
| B2 | `dedektif3/otobus-ic-dikey.webp` | D | H | dikey eşi |
| B3 | `dedektif3/otobus-yani.webp` | Y 4096×2286 | H | Halka 3 |
| B4 | `dedektif3/otobus-yani-dikey.webp` | D | H | dikey eşi |
| B5 | `dedektif3/agac.webp` | Y 4096×2286 | H | Halka 4, arama, Halka 5 dışı (kovuk ağızları buradan kesilir) |
| B6 | `dedektif3/agac-dikey.webp` | D | H | dikey eşi |
| B7 | `dedektif3/kiler-ic.webp` | Y | H | Halka 5 kovuk içi yakın plan |
| B8 | `dedektif3/ipucu-kirinti.webp` | K | E | pervazdaki kırıntılar |
| B9 | `dedektif3/ipucu-tohum.webp` | K | E | Halka 3 ipucu ve kartı |
| B10 | `dedektif3/ipucu-yildiz-seker.webp` | K | E | Halka 3 ipucu, kartı, iz noktaları |
| B11 | `dedektif3/ipucu-el-izi.webp` | K | E | Halka 4 topraktaki izler |
| B12 | `dedektif3/ipucu-tuy.webp` | K | E | Halka 4 kabuktaki tutam |
| B13-B15 | `dedektif3/kart-kapi.webp`, `kart-pencere.webp`, `kart-baca.webp` | K | E | Halka 2 kartları |
| B16 | `dedektif3/kart-sincap.webp` | K | E | Halka 4 kartı |
| B17 | `dedektif3/kart-kirpi.webp` | K | E | Halka 4 kartı |
| B18-B20 | `dedektif3/kart-sincap-ac.webp`, `kart-sincap-kiler.webp`, `kart-sincap-parti.webp` | K | E | Halka 5 kartları |
| B21 | `dedektif3/findik.webp` | K | E | Fındık normal (kaynak çizim) |
| B22 | `dedektif3/findik-yanak.webp` | K | E | yanakları şiş, komik an |
| B23 | `dedektif3/findik-utangac.webp` | K | E | final |
| B24 | `dedektif3/findik-sarilma.webp` | K | E | kurabiyelere sarılmış |
| B25 | `dedektif3/findik-kuyruk.webp` | K | E | kovuktan sarkan kuyruk ucu |
| B26 | `dedektif3/baykus.webp` | K | E | üst kovukta uyuyan baykuş |
| B27 | `dedektif3/palamut.webp` | K | E | Fındık'ın hediyesi |
| B28 | `dedektif3/palamut-kurabiye.webp` | K | E | finaldeki yeni kurabiye |

**İstemler**
- **B1** · Empty background scene for a premium toddler picture book: the inside of a pink pastry food truck in the early morning, a wooden counter along the bottom, a baking tray on the counter, a pink side window on the right that is slightly open (ajar) with a wide cream window sill in front, a closed side door on the left with a simple wooden slide bolt on the inside, a tiny round roof vent hatch up in the ceiling, soft golden morning light, cream and pink tiles. The window sill is drawn so it can be cut out as a separate front layer. + S-ARKA
- **B2** · Same scene as B1, composed vertically 9:16: window and sill in the upper middle, counter with tray at the bottom, door on the left edge, roof vent at the top. + S-ARKA
- **B3** · Empty background scene for a premium toddler picture book: a sunny park in the morning, the pink side of a parked pastry food truck on the left with its window up high, soft green grass below it where three thin dirt paths start side by side and split: one curves left to a small pond with reeds, one goes straight to a wooden park bench, one goes right towards a big old oak tree at the edge. Blue sky, two round bushes. + S-ARKA
- **B4** · Same scene as B3, composed vertically 9:16: the truck window at the top left, the three paths fanning out downwards to pond, bench and the oak tree at the bottom right. + S-ARKA
- **B5** · Empty background scene for a premium toddler picture book: a big friendly old oak tree in a park filling the middle of the picture, thick round trunk, three round tree hollows at three heights (high, middle, low near the roots), each hollow with a thick rounded bark rim drawn clearly as its own shape, a small empty bird nest visible inside the middle hollow, soft brown soil and a few acorns at the roots, green grass, blue sky. The inside of the high and low hollows is plain dark brown. + S-ARKA
- **B6** · Same oak tree as B5, composed vertically 9:16, the three hollows stacked clearly from top to bottom. + S-ARKA
- **B7** · Empty background scene for a premium toddler picture book: the cosy inside of a squirrel's tree hollow seen up close through its round bark opening (the rim frames the picture), small wooden shelf ledges with neat rows of acorns and hazelnuts, two whole star-shaped cookies with yellow icing and yellow star sprinkles placed at the end of the row, a tiny paper snowflake hanging on a string, warm soft light. + S-ARKA
- **B8** · A small scatter of golden cookie crumbs with tiny yellow star-shaped sugar sprinkles, lying flat, seen from slightly above. + S-NESNE
- **B9** · A small scatter of pale bird seeds lying flat on the ground, seen from slightly above. + S-NESNE
- **B10** · A small scatter of five tiny shiny yellow star-shaped sugar sprinkles lying flat, seen from slightly above. + S-NESNE
- **B11** · A short trail of tiny squirrel footprints pressed into soft brown soil, small hand-like prints with four thin fingers and longer back feet, top view, soil patch with soft rounded edges. + S-NESNE
- **B12** · A single small fluffy tuft of reddish-orange squirrel tail fur caught on a piece of brown tree bark, soft and puffy. + S-NESNE
- **B13** · A single cute pink food truck side door, closed, with a small wooden slide bolt, front view. + S-NESNE
- **B14** · A single cute pink food truck window with a cream frame, slightly open, with a cream window sill, front view. + S-NESNE
- **B15** · A single small round roof vent hatch of a pink food truck, short pink chimney pipe with a cream cap, front view. + S-NESNE
- **B16** · A single cute red-orange squirrel standing, front view, cream belly, big fluffy curled tail, big brown eyes, small round cheeks, friendly neutral smile, little paws held together. + S-NESNE
- **B17** · A single cute hedgehog standing, front view, soft brown spines, cream face and belly, tiny black nose, friendly neutral smile, little paws held together. Same size and pose as a small squirrel card. + S-NESNE
- **B18** · Upload B21. This same squirrel sitting and holding its tummy with a hungry face, an empty small plate in front of it. + S-KİLİT
- **B19** · Upload B21. This same squirrel proudly standing next to its tree hollow pantry full of neatly lined acorns and nuts, with soft falling snowflakes around. + S-KİLİT
- **B20** · Upload B21. This same squirrel at a tiny party, wearing a paper party hat, two colorful balloons tied behind it, confetti. + S-KİLİT
- **B21** · A single cute little red squirrel character named Findik, full body, standing and facing the viewer, happy smile, big sparkling dark brown eyes, rosy cheeks, cream belly and cream inner ears, a huge fluffy curled tail taller than its head, tiny paws. Same cartoon family as the attached orange kitten Mino and the white-brown puppy Kino. + S-NESNE (Mino ve Kino kaynakları yüklenir)
- **B22** · Upload B21. Same squirrel with its cheeks hugely puffed out round like two balloons, stuffed with cookies, eyes wide and guilty, paws behind its back, a few cookie crumbs flying from its mouth. Very funny. + S-KİLİT
- **B23** · Upload B21. Same squirrel looking shy and sorry: hugging its own big tail, ears slightly down, eyes looking down, small embarrassed smile, pink blush. + S-KİLİT
- **B24** · Upload B21. Same squirrel hugging two star-shaped cookies with yellow icing against its chest, eyes closed, very happy, tail curled into a soft heart shape. + S-KİLİT
- **B25** · Upload B21. Only the fluffy tail tip of this same squirrel, hanging down in a soft curve, as if drooping out of a hole; nothing else. + S-NESNE
- **B26** · A single cute round owl sleeping, eyes closed as two calm curves, soft brown and cream feathers, small yellow beak, wings folded, seen from the front, sitting. + S-NESNE
- **B27** · A single shiny acorn with a little cap and short stem, warm golden brown, one small highlight. + S-NESNE
- **B28** · A single cookie shaped like an acorn, golden baked dough with a chocolate-iced cap and a few cream sprinkle dots. + S-NESNE

---

## C. Öncelik 3 · Bölüm 1 "Kino ve Yağmurlu Gün" · 11 görsel

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| C1 | `film/kino-anne/on.webp` | K | E | Kino'nun annesi önden (Adobe iskelet kaynağı) |
| C2 | `film/kino-anne/profil.webp` | K | E | yandan yürüyüş iskeleti kaynağı |
| C3 | `film/kino-anne/sarilma.webp` | K | E | Kino'yu kucaklarken (ikisi tek çizim) |
| C4 | `film/kino-anne/oturan.webp` | K | E | diz çökmüş, göz hizasında |
| C5 | `film/kino/kizgin.webp` | K | E | Kino kızgın yüz (Adobe göz/ağız eki çıkarır) |
| C6 | `film/kino/yatan.webp` | K | E | minderde yüzüstü sıkılmış Kino |
| C7 | `film/esya/minder-cadir.webp` | G 2:1 | E | battaniyeli minder çadırı (ön kenar Adobe'da ayrılır) |
| C8 | `film/cadir-ic/arka.webp` | Y | H | çadırın içi yakın plan |
| C9 | `film/esya/minderler.webp` | G 3:1 | E | sarı, mavi, yeşil üç minder (Adobe üçe böler) |
| C10 | `film/esya/gokkusagi.webp` | G 2:1 | E | park gökyüzünde |
| C11 | `film/esya/sut-kupalari.webp` | G 2:1 | E | iki buharlı süt kupası |

**İstemler**
- **C1** · Upload Kino (front) as reference. A single cute grown-up mother dog character, Kino's mom, full body, standing and facing the viewer, same species and same cartoon family as this puppy: white fur, warm brown floppy ears, one round brown spot on her back, no eye patch, kind soft eyes, gentle warm smile, rosy cheeks, wearing a cozy mustard-yellow cardigan, about 1.6 times taller than the puppy, simple and plain, no jewelry. + S-NESNE
- **C2** · Upload C1. Same mother dog in clean side view facing right, standing, mid-step walking pose, same cardigan. + S-KİLİT
- **C3** · Upload C1 and Kino. The mother dog kneeling and hugging the puppy Kino gently to her chest, both eyes closed, peaceful smiles, her arms wrapped around him, his head under her chin. Two characters in one picture, front three-quarter view. + S-KİLİT
- **C4** · Upload C1. Same mother dog kneeling on the floor, sitting back on her heels, hands resting on her knees, head slightly tilted, warm listening face, front view. + S-KİLİT
- **C5** · Upload Kino. Same puppy, angry and grumpy but still cute: eyebrows pulled down, cheeks puffed, small pouting frown, one foot stamping. Front view. + S-KİLİT
- **C6** · Upload Kino. Same puppy lying flat on his belly, chin resting on his front paws, ears flopped down, bored face looking up, tail flat behind, seen from the front at a low angle. + S-KİLİT
- **C7** · A single cozy blanket fort for kids made of a pile of yellow, blue and green cushions with a blue blanket with red stripes draped over the top, a round open entrance at the front, front view, wide. + S-NESNE
- **C8** · Empty background scene for a premium toddler picture book: inside a cozy blanket fort, soft blue blanket walls with red stripes curving overhead, cushions on the floor, warm dim lamp-lit light, a smooth light area on the back blanket wall for shadow puppets. + S-ARKA
- **C9** · Three separate soft square floor cushions in a row with space between them: one yellow, one blue, one green, each with a small button in the middle, front view. + S-NESNE
- **C10** · A single soft cartoon rainbow arc with six gentle colors, small fluffy white clouds at both ends. + S-NESNE
- **C11** · Two cozy mugs of warm milk side by side, one orange mug and one blue mug, soft curly steam rising, front view. + S-NESNE

---

## D. Öncelik 4 · Kino'nun Otobüsü Gün 2-3 ve süsler · 23 görsel

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| D1-D3 | `kino-otobus/kap-limon.webp`, `kap-fistik.webp`, `kap-yabanmersini.webp` | K | E | Gün 2 tat kapları |
| D4-D6 | `kino-otobus/top-limon.webp`, `top-fistik.webp`, `top-yabanmersini.webp` | K | E | Gün 2 toplar |
| D7-D8 | `kino-otobus/sos-cilek-sise.webp`, `sos-cilek-ust.webp` | K | E | çilek sos |
| D9-D10 | `kino-otobus/sos-karamel-sise.webp`, `sos-karamel-ust.webp` | K | E | karamel sos |
| D11 | `kino-otobus/serpinti-kavanoz.webp` | K | E | serpinti kavanozu |
| D12 | `kino-otobus/serpinti-ust.webp` | K | E | topun üstündeki serpinti |
| D13 | `kino-otobus/kiraz.webp` | K | E | süs |
| D14 | `kino-otobus/gofret.webp` | K | E | süs |
| D15 | `kino-otobus/semsiye.webp` | K | E | Gün 3 süs |
| D16 | `kino-otobus/kalp-seker.webp` | K | E | Gün 3 süs |
| D17 | `kino-otobus/kupa.webp` | K | E | Gün 3 paylaşma kupası |
| D18 | `kino-otobus/mum.webp` | K | E | Mino'nun doğum günü kupası |
| D19 | `kino-otobus/pencere-dogumgunu.webp` | Y | H | Gün 3 pencere manzarası |
| D20 | `kino-otobus/sus-cati-kulah.webp` | K | E | otobüs süsü |
| D21 | `kino-otobus/sus-ampul.webp` | G 3:1 | E | otobüs süsü |
| D22 | `kino-otobus/sus-jant.webp` | K | E | otobüs süsü |
| D23 | `kino-otobus/sus-kino-kiraz-sapka.webp` | K | E | Kino'ya şapka |

**İstemler** (A5-A14 ile aynı kalıp; aynı tuval, aynı ışık)
- **D1** · Same as A5 but with lemon yellow ice cream and a small lemon slice on the tub. + S-NESNE
- **D2** · Same as A5 but with soft pistachio green ice cream and a small pistachio on the tub. + S-NESNE
- **D3** · Same as A5 but with blueberry purple-blue ice cream and three small blueberries on the tub. + S-NESNE
- **D4** · A single round scoop of lemon yellow ice cream, soft rounded ball with a slightly ruffled bottom edge, one small glossy highlight. Front view. + S-NESNE
- **D5** · Same as D4 in soft pistachio green with a few tiny green nut bits. + S-NESNE
- **D6** · Same as D4 in blueberry purple-blue with a few tiny darker berry specks. + S-NESNE
- **D7** · Same as A13 but a pink bottle of strawberry sauce with a small strawberry shape (no text). + S-NESNE
- **D8** · Same as A14 but glossy pink strawberry sauce. + S-NESNE
- **D9** · Same as A13 but a golden bottle of caramel sauce with a small drop shape (no text). + S-NESNE
- **D10** · Same as A14 but glossy golden caramel sauce. + S-NESNE
- **D11** · A single round glass jar of rainbow sprinkles with an ice-blue lid, front view. + S-NESNE
- **D12** · A light scatter of rainbow sprinkles shaped like a cap that sits on top of a round ice cream scoop, no ice cream underneath, front view. + S-NESNE
- **D13** · A single shiny red cherry with a green stem and one small leaf. + S-NESNE
- **D14** · A single wafer stick, golden with a fine grid pattern, slightly tilted. + S-NESNE
- **D15** · A single tiny paper cocktail umbrella, open, pink and ice-blue stripes, wooden stick. + S-NESNE
- **D16** · A single small pink heart-shaped sugar candy, glossy. + S-NESNE
- **D17** · A single big glass sundae bowl on a short stem, empty, wide open top, two long spoons standing in it, front view. + S-NESNE
- **D18** · A single small birthday candle, pink and white spiral stripes, lit with a small round yellow flame. + S-NESNE
- **D19** · Empty background scene for a premium toddler picture book: a sunny garden birthday party seen through a wide window, colorful balloons tied to a fence, bunting flags between two trees, a small table with a tablecloth on the far side, green lawn. + S-ARKA
- **D20** · A single giant decorative ice cream cone for a truck roof with three scoops (pink, cream, mint) and a cherry on top, small light bulbs around the cone rim, front view. + S-NESNE
- **D21** · A single long horizontal string of small round glowing light bulbs in warm yellow, pink and ice-blue, hanging in a gentle curve. + S-NESNE
- **D22** · A single bus wheel hubcap shaped like a cream star with a small ice-blue center, front view. + S-NESNE
- **D23** · Upload Kino. A small round cap for this puppy shaped like a scoop of pink ice cream with a red cherry on top, drawn alone without the puppy, sized to sit between his ears. + S-NESNE

---

## E. Öncelik 5 · Kapak ve roman · 5 görsel

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| E1-E4 | `dedektif3/roman-1.webp` … `roman-4.webp` | 4:3, 2048×1536 | H | Vaka 3 çizgi romanı |
| E5 | `dedektif3/kapak.webp` | 4:3, 2732×2048 | H | Vaka 3 dosya kapağı |

Bölüm 1'in kapağı çizilmez: film motorundan kare alınır (`FILM-REHBERI.md` §11).

**İstemler** (B21 Fındık ve Mino/Kino kaynakları yüklenir; ortak ek: *Premium glossy 2D cartoon, Disney Junior style, thick dark brown outlines, light cel shading, no text, no speech bubbles.*)
- **E1** · Night: the slightly open window of a pink pastry truck, six star-shaped cookies with yellow icing cooling on the window sill, soft moonlight, a tiny fluffy red tail just peeking at the edge.
- **E2** · The little red squirrel Findik at the truck window taking cookies: two cookies stuffed in his puffed cheeks and two hugged in his arms, guilty happy eyes, moonlight.
- **E3** · Findik running across the park grass towards a big oak tree, tail high, tiny yellow star sprinkles falling behind him like a trail.
- **E4** · Daytime under the oak tree: Findik hugging two star cookies in front of his hollow, the white-brown puppy Kino balancing a shiny acorn on his nose, the orange kitten Mino in a detective hat laughing.
- **E5** · A picture book cover: the orange kitten Mino in a detective hat looking through a magnifying glass, the white-brown puppy Kino behind her sniffing, and the little red squirrel Findik peeking from a tree hollow with hugely puffed cheeks, star cookie crumbs around. Characters big, faces fully visible.

---

## Ek A · Mino ile Kino'nun Pasta Otobüsü (2 görsel, bölüm A-E dışında)
| # | Dosya | Boyut | Şeffaf | İstem |
|---|---|---|---|---|
| X1 | `pasta/kino-onluk-1.webp` | K | E | Upload Kino. A small cream baker's apron for this puppy character with a pink pocket and a tiny cookie embroidered on it, drawn alone without the puppy, front view, sized to fit his body exactly. + S-NESNE |
| X2 | `pasta/kino-sapka-1.webp` | K | E | Upload Kino and the existing Mino chef hat. A small white baker's hat for this puppy with a thin blue band, the same family as the attached hat, drawn alone, sized to sit between his ears. + S-NESNE |

## Ek B · Mino'nun Pazarı: Tart Bakalım (3 görsel, bölüm A-E dışında)
> 2026-10-10 · Oyun hazır, şimdilik yer tutucuyla çalışıyor: çürük domates = sağlam domates çizimi + kodla kahve lekeler; kompost kutusu = kodla SVG. Dosyalar aşağıdaki adlarla `assets/pazar/` içine konunca oyun **kendiliğinden** onları kullanır (kod değişmez: `pazar/src/tart-kantar.ts` → `meyveCizimi`, `pazar/src/tart-ekran.ts` → kompost).
> 2026-10-10 · **Geldi, bağlandı** (Y1-Y3): ekip/illustrator/tart-isle.cjs (zemin kenardan akıtılır, kırpılır; çürük domates sağlam domatesin karesine aynı en ve tabanla oturur). Kapağın gövdeye oturuşu pazar/src/tart.css → .tb-kompost.tb-resimli.
> Kaynak (yüklenecek): `assets/meyveler/domates.webp` (Y1 için birebir aynı domates). Stil örneği: `assets/pazar/sepet.webp`.

| # | Dosya | Boyut | Şeffaf | İstem |
|---|---|---|---|---|
| Y1 | `pazar/domates-curuk.webp` | K | E | Upload the tomato. The very same tomato, same shape, same size, same outline and same leafy stem position, but gently overripe and bruised: three or four soft brown bruise spots, a little wrinkled skin on one side, the green stem slightly wilted and droopy, the red a bit duller. Still cute and clean for small children: no mold fuzz, no worms, no flies, no face. + S-NESNE |
| Y2 | `pazar/kompost.webp` | K | E | A small cute green garden compost bin without its lid (open top), rounded friendly shape, a light green leaf emblem on the front, a simple happy face (two dot eyes, small smile, pink cheeks), front view. + S-NESNE |
| Y3 | `pazar/kompost-kapak.webp` | K (sonra kırpılır) | E | Upload Y2. Only the matching dark green rounded lid of this compost bin with a small handle on top, drawn alone, front view, the same width as the bin's top. + S-NESNE |

**Kontrol:** Y1 sağlam domatesin yanına konup bakılır: aynı domates, yalnız çürümüş (tiksindirici değil). Y2 ve Y3 üst üste konunca kapak kutuya tam oturmalı (kod kapağı sol kenarından menteşe gibi açar).

## Sıra özeti
1. **A** (20): Kino'nun Otobüsü'nün ücretsiz günü. Önce A1 ve A8 tek örnek üretilir, stil onaylanınca kalanlar.
2. **B** (28): Vaka 3. Önce B21 Fındık (bütün pozların kaynağı), sonra B5 ağaç.
3. **C** (11): Bölüm 1. Önce C1 (Adobe'nin iskelet işi en uzun süren iş).
4. **D** (23): Gün 2-3 ve süsler.
5. **E** (5): roman ve kapak.
