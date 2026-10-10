# Gemini iş listesi: Pati Dükkânı · ilk parti

> 2026-10-10 · Kaynak: [ekip/senaryo/pet-dukkani.md](../senaryo/pet-dukkani.md) (ONAYLANDI). Kodcuya ve Adobe'ye giden adlar bu listedekilerdir.
> Bu parti: **19 Gemini sohbeti, oyunda kullanılacak 58 görsel** (+ 2 kadro sayfası çalışma görseli).
> Sıra değişmez: (1) kadro sayfaları → (2) Nehir abla model sayfası → (3) Bölüm 1'in üç hayvanı (Fındık, Tarçın, Pırıl) → (4) salon arka planı.

---

## 0. Nasıl çalışılır

- **Araç:** Gemini Pro (Chrome). **Her madde yeni bir sohbette** açılır. Uzayan sohbet yanlış resim indiriyor.
- **Stil referansı (her sohbette ilk yüklenen):** `ekip/stil/onayli-stil-oda.png`. Arka planda ikinci olarak `ekip/stil/onayli-stil-banyo.png` de yüklenir.
- **Yasaklar:** her istemin sonundaki stil ekinde şunlar var: "no texture, no painterly, no glow, no gradients". Ek silinmez, kısaltılmaz.
- **Çıktı klasörü:** `ekip/gemini/yeni/pati/` (PNG, en az 2048 px). İndirme `Resmi indir` düğmesiyle yapılır, ad aşağıdaki tablodaki gibi verilir.
- **Izgara kesimi:** 2×3 ve 2×2 sayfalar `kes.mjs` ile kesilir, kesilen kareler aynı klasöre aşağıdaki adlarla kaydedilir. Sayfa başına en çok 6 kare.
- **Kontrol (her görsel):** `ekip/stil/onayli-stil-ozet.jpg` yanına konup bakılır. Şunlar çıkarsa görsel kullanılmaz ve yeniden üretilir: tüy dokusu, parlama, gradyan, boyalı görünüm, yazı/harf/rakam, fazladan bacak ya da kulak, karelerde başka renk ya da leke. Bozuk tek kare için sayfa baştan çizdirilmez; o poz modelden "edit" ile yeniden istenir.
- **Kontrol durağı:** Madde 1 ile 2 bitince yönetici kadroyu ve Nehir abla'yı Barış'a gösterir (stil ve şirinlik). Madde 3'ün poz sayfalarına bu onaydan sonra geçilir. Madde 4 beklemeden yapılabilir.
- Adobe sonra beyaz zemini siler: `assets/pati/<ad>.webp`. Arka planlar zeminli kalır.

### 0a. Stil ekleri (istemin sonuna aynen)

**S-PATİ** (hayvanlar ve eşyalar):
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm pastel color fills, at most one soft hard-edged shade tone per color, only one or two tiny white highlights in the eyes. Simple rounded shapes, cute baby proportions (big round head, big round dark eyes set low and wide, tiny mouth, soft round cheek spots). No texture, no fur strands, no grain, no gradients, no glow, no shine, no painterly look, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

**S-PATİ-İNSAN** (Nehir abla):
> Clean flat 2D cartoon illustration in the style of a modern preschool TV series, matching the attached reference image exactly: thick, even dark chocolate-brown outline (#3B2416) on every shape, flat warm colors, at most one soft hard-edged shade tone per color, one or two tiny white highlights in the eyes only. Friendly, soft, rounded cartoon proportions for a young adult (about six heads tall), simple readable shapes, clean hands with clear fingers. No texture, no fabric texture, no grain, no gradients, no glow, no shine, no painterly look, no realistic rendering, no 3D. Plain pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no frames.

**S-PATİ-ARKA** (arka planlar):
> Straight-on front view like a stage set or a dollhouse wall, no perspective tilt, in exactly the same flat 2D cartoon style as the attached reference images: thick dark chocolate-brown outlines, flat warm pastel fills, simple cozy lived-in details, little clutter. No texture, no gradients, no glow, no light rays, no painterly look. No animals, no characters, no people, no text, no letters, no numbers, no words on signs. Edge to edge, no white border.

### 0b. DNA'lar (istemlerde `<… DNA>` yazan yere aynen)

- **FINDIK DNA:** a chubby baby puppy, four-legged, no clothes, no collar, cream body (#F3D9A4) with a honey-brown (#D9963F) patch on the back and honey-brown long floppy ears, cream muzzle, small round chocolate nose, short tail with a cream tip
- **TARÇIN DNA:** a tiny ginger tabby kitten, four-legged, no clothes, no collar, orange (#F2A65A) with three simple darker orange stripes on the forehead and back drawn as flat shapes (not fur strands), white chest and white paws, pink triangle nose, long curly tail
- **PIRIL DNA:** a round little goldfish, bright orange (#FF8C3A) with a white flowing double tail and white-tipped fins, big round eyes, tiny round mouth
- **POFUDUK DNA:** a round fluffy baby rabbit, white (#FFFFFF) with a soft lilac-grey shade, one ear standing up and one ear flopped down, pink inner ears and pink nose, cotton-ball tail
- **FISTIK DNA:** a round golden hamster, honey-orange back (#E8A657), cream belly, tiny round ears, tiny pink paws, soft cheek pouches
- **LİMON DNA:** a little budgerigar, lime-green body (#9BD34C), lemon-yellow head (#FFE066) with three small simple black wave lines on the back of the head, small blue cere above a short ivory beak, long tail
- **TOSPİK DNA:** a small tortoise with a round domed olive-green shell (#8DB255) with simple lighter-green hexagon plates, a friendly round sand-yellow head (#E6D49A), short stubby legs
- **KURABİYE DNA:** a round guinea pig with white, caramel (#D9893B) and chocolate (#6B4226) patches, a small swirl of fur on top of the head drawn as one simple flat shape, tiny petal ears, no tail
- **DİKEN DNA:** a tiny round hedgehog, soft brown spiny coat (#9C6B45) drawn as one simple scalloped spiky outline (no individual needles), cream face and belly (#F5E3C3), small black button nose
- **NEHİR DNA:** a warm, friendly young woman in her early twenties who runs a small pet shop. Round cute face, big dark-brown eyes, a few small flat freckles on the nose and cheeks, soft pink cheek spots, a gentle smile. Thick wavy chestnut-brown hair (#7A4A2A) in a messy top bun with a yellow pencil stuck in it, two short strands falling on the forehead. Skin #F2C6A0. Cream long-sleeved T-shirt (#FFF3DC) with the sleeves rolled up to the elbows. Grass-green apron (#7FBF6A) with a small embroidered paw print on the chest (no letters) and two big front pockets: a carrot top peeks out of the left pocket, a brush handle and a bone-shaped biscuit peek out of the right pocket. A colorful braided yarn bracelet on her left wrist. Loose mustard-yellow trousers (#E5B54A) rolled up once at the ankles, white sneakers with orange (#F28C3A) details. Three or four tiny cream and orange pet hairs on the apron drawn as small flat strokes.

---

## 1. Kadro sayfaları (2 sohbet)

Amaç: dokuz hayvan aynı elden çıkmış gibi olsun ve boyları birbirine göre doğru olsun. Bütün sonraki işlerin kaynağı bu iki sayfadır.

### 1a · `kadro-a.png` (16:9, en az 2752×1536)
**Yükle:** `ekip/stil/onayli-stil-oda.png`
> CAST LINEUP for a preschool pet shop game: five cute baby pet animals standing side by side in one row with clear white space between them, nothing touching, all in three-quarter view facing right, all happy and calm with all paws on the ground, drawn at their true relative sizes (the puppy is the biggest, then the kitten, then the rabbit, then the guinea pig, and the hamster is the smallest). 1) FINDIK DNA. 2) TARÇIN DNA. 3) POFUDUK DNA. 4) KURABİYE DNA. 5) FISTIK DNA. + S-PATİ

(İstemde `FINDIK DNA` gibi yazan yerlere §0b'deki metin konur.)

**Kes:** `kadro-a-findik.png`, `kadro-a-tarcin.png`, `kadro-a-pofuduk.png`, `kadro-a-kurabiye.png`, `kadro-a-fistik.png`

### 1b · `kadro-b.png` (16:9, en az 2752×1536)
**Yükle:** `ekip/stil/onayli-stil-oda.png`, `kadro-a-findik.png`
> CAST LINEUP, second page of the same cast. The attached puppy stays exactly as it is and is the size reference. Five cute baby pet animals side by side in one row with clear white space between them, nothing touching, all in three-quarter view facing right, happy and calm, drawn at their true relative sizes next to the puppy: 1) exactly the attached puppy, unchanged. 2) LİMON DNA, perched as if on an invisible perch. 3) PIRIL DNA, floating at the same height as the others, no water drawn. 4) TOSPİK DNA. 5) DİKEN DNA. Same outline weight and same eye style as the puppy. + S-PATİ

**Kes:** `kadro-b-limon.png`, `kadro-b-piril.png`, `kadro-b-tospik.png`, `kadro-b-diken.png` (köpek A'dakinden farklı çıkarsa A'daki geçerli)

---

## 2. Nehir abla model sayfası (1 sohbet)

### 2 · `nehir-model.png` (16:9, en az 2752×1536)
**Yükle:** `ekip/stil/onayli-stil-oda.png`, `kadro-a-findik.png` (yalnız stil ve çizgi kalınlığı uyumu için)
> CHARACTER MODEL SHEET (turnaround) of one original character: NEHİR DNA. Three full-body views of exactly the same woman standing side by side on white, same height and same scale, feet on the same invisible line, clear white space between them, nothing touching: 1) front view, arms relaxed at her sides, gentle smile; 2) three-quarter view turned to the viewer's right, gentle smile; 3) strict side view facing right. Calm neutral standing pose, hands empty, the pencil always in the bun, the apron pockets and their contents the same in every view. Draw her in the same flat cartoon world as the attached puppy, with the same outline weight. Do not draw the puppy. + S-PATİ-İNSAN

**Kes:** `nehir-on.png`, `nehir-34.png`, `nehir-yan.png`

**Bakılacaklar:** üç görünüşte boy aynı; topuz ve kalem aynı yerde; cepteki havuç ve fırça her görünüşte var; el parmakları düzgün (beşten fazla değil); önlükte yazı yok. Boy kuralı: oyunda Nehir abla çocuk karakterlerin ~1.35 katı (anne iskeletiyle aynı) gösterilir; ölçeği kod ayarlar.

---

## 3. Bölüm 1'in üç hayvanı (15 sohbet, 54 görsel)

Her hayvan için 5 sohbet: model, sayfa A, sayfa B, sayfa C, göz kırpma. Bütün pozlar sağa bakar (sola giderken kod aynalar). **Hiçbir karede kap, yatak, oyuncak çizilmez** (aşağıda belirtilen birkaç istisna dışında); eşyalar ayrı çizilip kodla birleşir.

Ortak sayfa cümlesi (her sayfa isteminin başında, `ORTAK` diye anılır):
> CHARACTER POSE SHEET of exactly this same baby animal: <DNA>. Every tile shows exactly the same character with the same design, same colors, same markings, same proportions and the same size scale (the animal fills about 70% of the tile height), all facing right. Even white space between the tiles, nothing touching, no tile borders.

### 3a · Fındık (köpek yavrusu)

| Sohbet | Yükle | İstem | Çıktı | Kesilen adlar |
|---|---|---|---|---|
| 3a.1 model | stil, `kadro-a-findik.png` | Redraw exactly the attached puppy alone and large: FINDIK DNA. Full body, three-quarter view facing right, happy and calm, all four paws on the ground, tail up. Same design, colors, markings, proportions and outline as the attached image. + S-PATİ | `findik-model.png` | (tek görsel) |
| 3a.2 sayfa A | stil, `findik-model.png` | ORTAK (FINDIK DNA). Two rows by three columns, six tiles, three-quarter view. Tile 1: hungry, sitting and looking down sadly, licking its lips. Tile 2: sleepy, a big wide yawn, eyes half closed, ears drooping. Tile 3: cold, curled up small and shivering with two tiny shiver lines, ears down, tail tucked. Tile 4: wants to play, front paws down and bottom up in a play bow, tail high, eager eyes. Tile 5: scared, pressed low to the ground and leaning back, ears flat, eyes wide. Tile 6: itchy and ruffled, scratching behind the ear with a hind paw, coat edges ruffled. No bowls, no beds, no toys, no objects. + S-PATİ | `findik-sayfa-a.png` | `findik-ac`, `findik-uykulu`, `findik-usumus`, `findik-oyun-istiyor`, `findik-korkmus`, `findik-kasiniyor` |
| 3a.3 sayfa B | stil, `findik-model.png` | ORTAK (FINDIK DNA). Two rows by three columns, six tiles, three-quarter view. Tile 1: eating happily with the head down, tail wagging (no bowl drawn). Tile 2: fast asleep, curled up in a round ball, eyes closed, peaceful. Tile 3: cozy, lying flat and relaxed, eyes closed, small smile, body low and rounded (a blanket will be placed over it later). Tile 4: standing proudly holding a plain red ball in its mouth. Tile 5: being petted, eyes closed in bliss, head tilted up, big smile (no hand drawn). Tile 6: overjoyed, jumping with all four paws off the ground, ears flying up. No other objects. + S-PATİ | `findik-sayfa-b.png` | `findik-yiyor`, `findik-uyuyor`, `findik-rahat`, `findik-top-agizda`, `findik-oksaniyor`, `findik-sevinc` |
| 3a.4 sayfa C | stil, `findik-model.png` | ORTAK (FINDIK DNA). Two rows by two columns, four tiles. Tile 1: strict side view facing right, running, front and back legs stretched out. Tile 2: strict side view facing right, running, legs gathered under the body. Tile 3: three-quarter view, sitting and waiting, tail wagging, looking up hopefully. Tile 4: three-quarter view, lying on its belly, tired and happy, tongue out. No objects. + S-PATİ | `findik-sayfa-c.png` | `findik-kosu-1`, `findik-kosu-2`, `findik-bekler`, `findik-yorgun` |
| 3a.5 göz | `findik-model.png` | Edit this exact image. Change ONLY the eyes into gently closed happy curves. Keep everything else pixel-identical. | `findik-goz-kapali.png` | (tek görsel) |

### 3b · Tarçın (kedi yavrusu)

| Sohbet | Yükle | İstem | Çıktı | Kesilen adlar |
|---|---|---|---|---|
| 3b.1 model | stil, `kadro-a-tarcin.png` | Redraw exactly the attached kitten alone and large: TARÇIN DNA. Full body, three-quarter view facing right, happy and calm, sitting with the curly tail around the paws. Same design, colors, markings, proportions and outline as the attached image. + S-PATİ | `tarcin-model.png` | (tek görsel) |
| 3b.2 sayfa A | stil, `tarcin-model.png` | ORTAK (TARÇIN DNA). Two rows by three columns, six tiles, three-quarter view. Tile 1: hungry, sitting and looking down, licking its lips, a little sad. Tile 2: sleepy, a big wide yawn showing a tiny pink tongue, eyes half closed. Tile 3: cold, curled up small and shivering with two tiny shiver lines, ears flat, tail wrapped tight. Tile 4: bored and wanting to play, sitting with the tail swishing to the side (two small motion lines), ears turned, looking around. Tile 5: scared, crouched low with the back slightly arched, ears flat, eyes wide. Tile 6: itchy and ruffled, scratching behind the ear with a hind paw, coat edges ruffled. No objects. + S-PATİ | `tarcin-sayfa-a.png` | `tarcin-ac`, `tarcin-uykulu`, `tarcin-usumus`, `tarcin-sikildi`, `tarcin-korkmus`, `tarcin-kasiniyor` |
| 3b.3 sayfa B | stil, `tarcin-model.png` | ORTAK (TARÇIN DNA). Two rows by three columns, six tiles, three-quarter view. Tile 1: eating happily with the head down (no bowl drawn). Tile 2: fast asleep, curled up in a round ball, tail over the nose, eyes closed. Tile 3: cozy, lying flat and relaxed, front paws tucked in, eyes closed, small smile (a blanket will be placed over it later). Tile 4: crouching low, bottom wiggling, ready to pounce, eyes fixed forward. Tile 5: being petted, eyes closed in bliss, head pushed up, purring smile (no hand drawn). Tile 6: overjoyed, a happy springy jump with all four paws off the ground, tail straight up. No objects. + S-PATİ | `tarcin-sayfa-b.png` | `tarcin-yiyor`, `tarcin-uyuyor`, `tarcin-rahat`, `tarcin-comelme`, `tarcin-oksaniyor`, `tarcin-sevinc` |
| 3b.4 sayfa C | stil, `tarcin-model.png` | ORTAK (TARÇIN DNA). Two rows by two columns, four tiles. Tile 1: mid-air leap, both front paws reaching up as if catching a feather, belly showing, joyful face. Tile 2: head and front paws peeking out of a plain light-brown cardboard box with no markings, only the top of the box visible. Tile 3: climbing upward, body stretched, front paws reaching high (no tree drawn). Tile 4: sitting, the tail curled up tickling its own nose, giggly eyes. Only the box in tile 2, no other objects. + S-PATİ | `tarcin-sayfa-c.png` | `tarcin-atlama`, `tarcin-kutuda`, `tarcin-tirmanma`, `tarcin-kuyruk-burun` |
| 3b.5 göz | `tarcin-model.png` | Edit this exact image. Change ONLY the eyes into gently closed happy curves. Keep everything else pixel-identical. | `tarcin-goz-kapali.png` | (tek görsel) |

### 3c · Pırıl (Japon balığı)

Balıkta su çizilmez (akvaryum ayrı arka plan). Küçük kabarcıklara izin var.

| Sohbet | Yükle | İstem | Çıktı | Kesilen adlar |
|---|---|---|---|---|
| 3c.1 model | stil, `kadro-b-piril.png` | Redraw exactly the attached goldfish alone and large: PIRIL DNA. Side-three-quarter view facing right, happy, fins relaxed, tail flowing. No water. Same design, colors, proportions and outline as the attached image. + S-PATİ | `piril-model.png` | (tek görsel) |
| 3c.2 sayfa A | stil, `piril-model.png` | ORTAK (PIRIL DNA). Two rows by three columns, six tiles, no water drawn. Tile 1: hungry, tilted up with the round mouth open toward the top of the tile. Tile 2: sleepy, drifting slowly, eyes half closed, fins drooping. Tile 3: cold and dull, lying low with fins tucked in, color a little paler orange. Tile 4: wants to play, doing a happy loop with three tiny bubbles. Tile 5: scared, body curved away, eyes wide, fins pressed back. Tile 6: squinting as if in cloudy water, eyes squeezed, fins fanning. + S-PATİ | `piril-sayfa-a.png` | `piril-ac`, `piril-uykulu`, `piril-solgun`, `piril-oyun-istiyor`, `piril-korkmus`, `piril-bulanik` |
| 3c.3 sayfa B | stil, `piril-model.png` | ORTAK (PIRIL DNA). Two rows by three columns, six tiles, no water drawn. Tile 1: eating, mouth open gulping one tiny flake. Tile 2: asleep, still and level, eyes closed, peaceful. Tile 3: cozy, floating relaxed, eyes closed, small smile. Tile 4: darting forward to chase food, mouth open, tail swept back, two small motion lines. Tile 5: happy shimmy, tail wagging fast with small motion lines, big smile. Tile 6: overjoyed, leaping up in an arc. + S-PATİ | `piril-sayfa-b.png` | `piril-yiyor`, `piril-uyuyor`, `piril-rahat`, `piril-kovalama`, `piril-kipir`, `piril-sevinc` |
| 3c.4 sayfa C | stil, `piril-model.png` | ORTAK (PIRIL DNA). Two rows by two columns, four tiles, side view facing right, no water. Tile 1: swimming, tail swept up. Tile 2: swimming, tail swept down. Tile 3: blowing one round bubble from the mouth. Tile 4: body half turned, peeking shyly as if from behind something, only the front half clearly visible. + S-PATİ | `piril-sayfa-c.png` | `piril-yuzme-1`, `piril-yuzme-2`, `piril-baloncuk`, `piril-saklanma` |
| 3c.5 göz | `piril-model.png` | Edit this exact image. Change ONLY the eyes into gently closed happy curves. Keep everything else pixel-identical. | `piril-goz-kapali.png` | (tek görsel) |

---

## 4. Salon arka planı (1 sohbet)

### 4 · `salon-gunduz.png` (16:9, en az 2752×1536; zemin kalır)
**Yükle:** `ekip/stil/onayli-stil-oda.png`, `ekip/stil/onayli-stil-banyo.png`
> Empty background for a preschool game: the inside of a small, cozy pet shop. Layout is important: three wide empty alcoves built into the back wall side by side at the same height, each about one quarter of the image width, their centers at about 20%, 50% and 80% of the image width, reaching from about 22% to 68% of the image height; inside each alcove only a plain soft-colored back wall and a flat floor (animal corners will be placed there later). Above the alcoves, a long wooden shelf with plain colorful pet food bags and toy boxes with no words and no logos. At the far left edge, the shop's glass front door with a small brass bell and a blank round hanging sign. Between the door and the first alcove, a cork board with a few colorful pins and empty space. At the bottom right corner, the edge of a small wooden craft table with a jar of colorful yarn balls. The bottom quarter of the image is plain honey-colored wooden floor, open and empty for characters. Warm cream upper walls with a mint-green lower wall band, like the attached reference rooms. A ceiling lamp with a pull string hangs near the top center. + S-PATİ-ARKA

**Bakılacaklar:** üç oyuk aynı yükseklikte ve boş; rafta, tabelada, panoda yazı yok; zemin altta boş; sahne düz karşıdan (eğik perspektif yok). Gece eşi (`salon-gece.png`) bu görsel onaylanınca ayrı sohbette "Edit this exact image: night, lights off, dark blue window, a small moon-shaped night lamp glowing softly" ile istenir (sonraki parti).

---

## 5. Bu partinin sayımı

| Madde | Sohbet | Oyunda kullanılan görsel |
|---|---|---|
| 1 · kadro A ve B | 2 | 0 (çalışma görseli; kesimleri kaynak olur) |
| 2 · Nehir abla model | 1 | 3 |
| 3 · Fındık, Tarçın, Pırıl | 15 | 54 (3 × 18) |
| 4 · salon gündüz | 1 | 1 |
| **Toplam** | **19** | **58** |

**Sonraki parti** (`pet-dukkani.md` §16): Nehir abla N2, N3, N4, N6 ve kapak; Bölüm 1'in kalan arka planları (dış cephe sabah ve akşam, salon gece, 3 köşe ve gece eşleri, bahçe, pano, atölye); Bölüm 1 eşya sayfaları (E1-E10'un Bölüm 1'e girenleri, kepenk, düşünce balonu).
