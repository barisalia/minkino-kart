# Kino ve Ailesi: karakter kiti (Recraft istemleri)

> 2026-10-10 · Senarist/karakter tasarımı. **TASLAK: kredi harcamadan önce toplam Barış'a söylenir ve onay alınır** (minkinogames1.md §5 kuralı).
> **Değişiklik notu (2. sürüm):** Koku İzi kaldırıldı (Barış). Kitte değişenler: Kino'nun burnu artık **normal boy** ("yüzün yıldızı" değil); göz sayfasındaki "koklarken sıkılmış göz" yerine "sıkıca kapalı göz (ağlama/kahkaha)"; koku kutusu yok; Baba'nın kayıp gözlüğü yok. Bölüm 1 pozları yeni senaryoya göre P1-P10 + F1-F2. Başka bir çizim değişmedi.
> Model: **Recraft `recraftv4_1_pro_vector`** (çıktı SVG), görsel başına **~12 kredi**. Hedef bütçe: **~500 kredi** (yeniden deneme payı dahil).
> İlgili: [SERI-KITABI.md](SERI-KITABI.md) (karakterler, boy tablosu) · [bolum-01.md](bolum-01.md) · [URETIM-YOLU.md](URETIM-YOLU.md) (Adobe → Blender teslim sözleşmesi) · [../../blender-pilot/rig/kino.json](../../blender-pilot/rig/kino.json) (pilot rig).

---

## 0. Özet

| Faz | Karakter | Görsel | Kredi (12 × görsel) | +%30 deneme payı | Faz toplamı |
|---|---|---|---|---|---|
| **1** | **Kino** | 7 | 84 | 25 | 109 |
| **1** | **Anne** | 6 | 72 | 22 | 94 |
| 2 | Lokum | 4 | 48 | 14 | 62 |
| 2 | Baba | 5 | 60 | 18 | 78 |
| 3 | Mino | 5 | 60 | 18 | 78 |
| 4 | Babaanne + Dede | 5 | 60 | 18 | 78 |
| | **Toplam** | **32** | **384** | **115** | **~500** |

- **Sıra kesin:** Önce yalnız **K1** (Kino model sayfası) üretilir, Barış stile ve Kino'ya bakar. Onaydan sonra Kino'nun kalanı, sonra Anne. Faz 1 bitip Blender'da yeni Kino pilotu geçmeden Faz 2'ye geçilmez.
- **Deneme payı** her fazın içinde kalır. Bir faz payını aşarsa yeni faza geçmeden yöneticiye söylenir.
- **Kit dışı krediler** (bu tabloda yok):
  - Adobe Turntable (Firefly, tasarımcının kredisi): Kino yan + 3/4, Anne, Baba, Lokum, Mino yan = 6 üretim × ~20 ≈ **120 Firefly kredisi**.
  - Bölüm 1'e özel pozlar (P1-P10), iki albüm fotoğrafı (F1-F2) ve arka planlar. Öneri: Gemini (ücretsiz) + Adobe temizlik. Recraft'la yapılırsa +~145-185 kredi.

---

## 1. Kit kuralları (Blender pilotunun bulguları)

1. **Parçalar tam çizilir.** Başka parçanın arkasında kalan yer de çizilir: tişört altındaki kalça, kafanın arkasındaki ense, kulağın arkasındaki kafa. Rig döndürünce boşluk görünmez.
2. **Eklemler yuvarlak ve üst üste biner.** Her kol-bacak parçasının eklem ucu tam bir daire kapağıdır; komşu parçanın altına girer. Dönünce dikiş ya da kopukluk olmaz.
3. **Ayak ayrı parçadır** (ayakkabıyla birlikte). Bacak ucuna yuvarlak bir bilek kapağıyla bağlanır. IK ile yere sabitlenir.
4. **Önden, 3/4 ve yan görünüş aynı ölçekte.** Recraft görseller arasında ölçeği garanti etmez. Bu yüzden Adobe her sayfayı **model sayfasına göre** ölçekler (§2, ölçü çapası).
5. **Ağız seti karakterin kendi stilinde.** Köpeklerde ağız, burun altındaki beyaz ağız-burun (muzzle) parçasının üstündedir. Her ağız aynı muzzle parçası üstünde, aynı yerde çizilir; rig yalnız değiştirir.
6. **Göz seti ayrı.** Göz akı, göz bebeği ve göz kapağı ayrı kapalı şekillerdir. Kino'nun sol gözü kestane lekenin üstünde olduğu için **sol göz kapakları kestane**, sağ göz kapakları beyazdır.
7. **Yüz parçaları kafada yok.** Parça sayfasındaki kafa "boş yüz"dür: yalnız muzzle şekli ve tüy lekeleri. Göz, kaş, ağız, burun ayrı katmanlardır.
8. **Yazı, etiket, numara, renk kartelası, kılavuz çizgisi yok.** (Recraft bazen ekler; o görsel reddedilir.)

**Katman adları** (URETIM-YOLU §2.2 ile aynı dil): `kafa, kulak-sol, kulak-sag, burun, boyun, govde, fular, kuyruk, kol-ust-sol/sag, kol-alt-sol/sag, el-sol/sag-<poz>, bacak-ust-sol/sag, bacak-alt-sol/sag, ayak-sol/sag, goz-sol/sag-ak/-bebek/-kapak-<hal>, kas-sol/sag-<hal>, agiz-<sekil>`. Karaktere özel: `biyik` (Baba, Dede), `onluk` (Baba), `gozluk`, `topuz` (Babaanne), `kasket` (Dede), `kuyruk-uc` (Mino).

**"Sol/sağ" her zaman karakterin kendi solu/sağıdır** (izleyiciye göre ters).

---

## 2. Hat

```
Recraft (SVG)  →  Adobe: kontrol + temizlik + ölçekleme  →  Turntable (yan, Kino için 3/4 de)
   →  Recraft: yan (3/4) parça sayfası (Turntable çıktısı referans)  →  Illustrator: katmanlara ayır, pivot
   →  assets/film2/karakter/<ad>/<aci>/<katman>.png + rig.json  →  Blender rig kurucu
```

- **Dosyalar:** Recraft çıktıları `ekip/film/seri-2/kit/<kod>.svg` (+ önizleme `.png`) olarak saklanır. Kod tablodaki kodlardır (K1, A3…).
- **Ölçü çapası:** Her karakterin model sayfasında (X1) **kafa genişliği** ölçülür (kulaklar hariç). Parça sayfalarındaki kafa bu genişliğe ölçeklenir; diğer parçalar kafayla aynı oranda büyür. Ağız ve göz sayfaları, muzzle ve göz akı genişliği model sayfasındakine eşitlenerek ölçeklenir.
- **Turntable:** önden model görünüşünden (X1 sol figür) yapılır; yöntem `ekip/adobe-yanci/TURNTABLE-PLANI.md`. Yüz bozulursa yalnız gövde alınır; yandan yüz parçaları zaten X-yan sayfasında Recraft'la çizilir.
- **Yan parça sayfası:** Recraft'a Turntable çıktısı **referans görsel** olarak verilir (image-to-image, güç ~0.5). Bu model referans kabul etmiyorsa aynı istem yalnız metinle çalıştırılır; Adobe yan sayfayı Turntable siluetine göre hizalar.
- **Recraft stil kilidi (isteğe bağlı):** K1 onaylanınca Recraft'ta K1'den özel bir stil oluşturmak tutarlılığı artırır. Kredisi bilinmiyor; yöneticiye sorulmadan yapılmaz.
- **İstem uzunluğu:** İstemler `STYLE` + karakter `DNA` + görsel metni birleşimidir (~1.800-2.500 karakter). İlk çağrıda Recraft'ın uzunluk sınırı doğrulanır. Sınır daha kısaysa önce `STYLE` içindeki son cümle ("Shapes…") atılır, sonra DNA'daki renk kodları atılır; parça listesi asla kısaltılmaz.
- **Ayar:** `model: recraftv4_1_pro_vector`, boyut **1:1** (aksi yazılmadıkça), `n: 1`.

### Ret ölçütü (yeniden deneme sebebi)

Doku, fırça, gren ya da degrade · yazı, numara, etiket · birbirine kaynamış ya da eksik parça · köşeli (yuvarlak olmayan) eklem · yanlış renk (ör. Kino'da mavi tüy) · Kino'nun göz lekesi yanlış tarafta · fazladan uzuv · kıyafet K1'den farklı · parçalar üst üste binmiş · beyaz zeminde lekeler. Küçük leke ve fazla nokta Adobe'de silinir, yeniden üretilmez.

---

## 3. Ortak stil bloğu (`STYLE`, her istemin başına)

```
STYLE: Original character art for a premium modern 2D preschool TV animation series, top-tier broadcast quality. Clean flat VECTOR illustration built from smooth, confident Bezier shapes. One consistent dark chocolate-brown outline (#3B2416) on every outer contour, uniform medium weight, slightly thinner on inner details. Flat color fills, each color with ONE crisp hard-edged cel-shade tone and at most two small flat white highlights. Warm, cheerful, slightly saturated palette. Absolutely no texture, no fur strands, no grain, no brush strokes, no sketch lines, no gradients, no 3D, no realistic rendering. Cute baby-schema faces: large rounded head, big glossy dark-brown eyes with two white catchlights set low and wide, small mouth, soft round coral cheek spots. Shapes are simple, rounded, readable in silhouette, and cleanly separable into layers for cut-out puppet animation. Pure white background, no ground, no cast shadow, no text, no letters, no numbers, no labels, no color swatches, no border.
```

---

## 4. Karakter DNA blokları (her istemde `STYLE`'dan sonra)

**`KINO`**
```
CHARACTER, KINO: a 5-year-old anthropomorphic beagle-like puppy boy who walks upright, about 2.6 heads tall, chubby but sturdy with short strong legs. White fur (#FFFDF8, shade #EADFD3). Long, soft, rounded floppy ears in warm chestnut brown (#9A5A32) that hang down to his shoulders. ONE chestnut patch around his LEFT eye only (on the viewer's right side); the right eye area is white. A chestnut saddle patch on his back. Tail: chestnut with a bright white tip, held up like a little flag. A small, glossy, dark cocoa button nose (#3A2420). Short white rounded muzzle. Big curious eyes, short expressive brows. Clothes: a grass-green short-sleeved crew-neck T-shirt (#5DAE4B), a navy-blue neckerchief (#26386E) tied with a small knot at the front, red sneakers (#D94A3C) with white soles and white laces. White paw-hands with four short rounded fingers.
```

**`ANNE`**
```
CHARACTER, MOTHER: Kino's mom, a grown-up anthropomorphic beagle-like dog lady, about 1.37 times Kino's height and about 3.2 heads tall, soft gentle pear-shaped figure. White fur (#FFFDF8). Long chestnut-brown floppy ears (#9A5A32) to her shoulders. NO eye patch. One round chestnut spot on her lower back near the tail; white tail with one chestnut spot. Kind soft eyes with three short lashes, warm gentle smile, small dark cocoa nose. Clothes: a mustard-yellow V-neck cardigan (#E3A93B) with three round brown buttons and simple band cuffs and hem, worn as her only top; dark-brown flat shoes (#5A3A2A). White paw-hands with four short rounded fingers.
```

**`BABA`**
```
CHARACTER, FATHER: Kino's dad, a big, gentle, round-bellied anthropomorphic beagle-like dog, about 1.48 times Kino's height and about 3.3 heads tall. White fur. A large chestnut saddle on his back and a chestnut cap-shaped patch over the top of his head. Long floppy ears in darker chocolate brown (#5E3622). His signature: a small chocolate-brown MOUSTACHE-shaped patch right under his nose. Sleepy, half-lidded, friendly eyes, thick short brows, big warm grin. Clothes: a cherry-burgundy crew-neck sweater (#9E2F3F) with sleeves pushed up to the elbows, brown house slippers (#7A4A2E). White paw-hands with four short rounded fingers.
```

**`LOKUM`**
```
CHARACTER, LOKUM: Kino's 2-year-old baby brother, a toddler anthropomorphic beagle-like puppy, about 0.7 times Kino's height and about 2 heads tall, almost perfectly round body, tiny short limbs. White fur. Short floppy ears: his LEFT ear chestnut (#9A5A32), his RIGHT ear white (asymmetric, his signature). A tiny round chestnut spot on his bottom, a short white stubby tail. Huge eyes, small button nose, two tiny front teeth when smiling. Clothes: a soft Turkish-delight-pink short-sleeved romper (#F4AFC0) with two white snap buttons. Bare white paw feet.
```

**`MINO`**
```
CHARACTER, MINO: Kino's next-door best friend, a 5-year-old anthropomorphic orange tabby kitten girl who walks upright, about 2.6 heads tall, very slightly shorter than Kino (her tall ears bring her level with him). Bright orange fur (#F28C28) with a few soft darker orange tabby stripes (#D96A16) on her forehead, cheeks and tail; cream muzzle, chest and paws (#FBEBD3); tall pointed ears with pink inner ears; a long curling tail with a cream tip. Big amber-brown eyes with two short lashes, small pink triangle nose. Clothes: a red neckerchief (#D9483B) tied at the front and a turquoise sleeveless pinafore dress (#2BB3B1) with one round pocket. Cream paw-hands with four short rounded fingers, bare cream paw feet.
```

**`BABAANNE`**
```
CHARACTER, GRANDMOTHER: Kino's grandma, an elderly anthropomorphic beagle-like dog lady, slightly shorter than Kino's mom, plump and cozy. White fur, soft milky-caramel floppy ears (#C9A27E), small dark cocoa nose. Her signature: a small round silver-white fur bun on top of her head. Small round gold-rim glasses (#C9A04A) on a thin cord. Warm crinkled smiling eyes. Clothes: a lavender cardigan (#A893C9) over a plain cream dress, comfy brown shoes. White paw-hands with four short rounded fingers.
```

**`DEDE`**
```
CHARACTER, GRANDFATHER: Kino's grandpa, an elderly anthropomorphic beagle-like dog, about as tall as Kino's mom, slim with a slight stoop. White fur, pale grey-brown floppy ears (#9C8B7A). Big bushy white eyebrows, a white moustache-shaped patch under his nose (an older version of Kino's dad's), dry half-smile. A grey flat cap (#8C8C88). Clothes: an olive-green vest (#7C8A3E) over a cream shirt with rolled sleeves, brown trousers, brown shoes. White paw-hands with four short rounded fingers.
```

---

## 5. Görsel listesi ve istemler

Her istem = **`STYLE` + karakter `DNA` + aşağıdaki metin.**

### 5.1 Kino (Faz 1 · 7 görsel · 84 kredi + pay)

**K1 · Model sayfası (önden + arkadan)** · 1:1 · *önce yalnız bu üretilir, Barış onayı*
```
MODEL SHEET: the same character shown twice at exactly the same scale, both standing on the same invisible baseline, with a wide empty gap between the two figures. LEFT figure: full body, strict front view. RIGHT figure: full body, strict back view (showing the chestnut back saddle patch, the back of the neckerchief knot and the white-tipped tail). Neutral relaxed A-pose: arms held slightly away from the body with relaxed open hands, legs slightly apart, nothing overlapping the torso, ears hanging freely beside the head without touching the arms, tail clearly visible. Calm friendly expression, eyes open, gentle closed-mouth smile. The figures fill about 85 percent of the image height.
```

**K2 · Önden parça sayfası** · 1:1
```
CUT-OUT PUPPET PARTS SHEET, front view, matching the character design exactly. Every body part is a separate, COMPLETE, closed vector shape with its own full outline, laid out like a tidy exploded diagram on white with clear empty space around each part; no part touches or overlaps another. Draw every part in full, including the areas that would normally be hidden behind other parts. Every limb segment has FULLY ROUND circular ends at its joints, like paper-puppet joints, so that it overlaps its neighbour when rotated. Arrange the parts in body order from top to bottom:
1 head with a BLANK face: only the white muzzle shape and the chestnut patch around the left eye area, NO eyes, NO brows, NO mouth, NO nose; the full skull drawn including where the ears attach;
2 left ear, 3 right ear (long chestnut floppy ears, each with a round top cap);
4 the glossy nose on its own;
5 neck: a short white rounded cylinder;
6 torso: the green T-shirt body, with the white lower belly and hips drawn completely below the hem as a rounded shape;
7 the navy neckerchief with its front knot as one piece;
8 tail: chestnut with a white tip and a round base cap;
9 and 10 left and right upper arm with the green T-shirt sleeve;
11 and 12 left and right forearm (white);
13 and 14 left and right hand, relaxed open;
15 and 16 left and right thigh (white, round hip cap on top);
17 and 18 left and right lower leg (white);
19 and 20 left and right foot wearing the red sneaker, each with a round ankle cap.
No floating eyes or mouths, no labels, no numbers, no guide lines.
```

**K3 · Ağız sayfası (dudak senkronu, 9 ağız)** · 1:1
```
MOUTH SHAPES SHEET for lip-sync, in this character's own style. Nine separate tiles in a neat 3 by 3 grid with even white space between them. Each tile shows the SAME white rounded muzzle piece (the lower snout) at the same size and position, with the same glossy dark cocoa nose on top and a short philtrum line splitting into a soft W-shaped upper lip; only the mouth changes. Mouth interior dark red-brown (#5A1E1E), tongue soft coral (#F08A8A), small white teeth.
Row 1: (1) closed, lips pressed together in a gentle resting smile; (2) slightly open, top teeth visible; (3) wide, stretched sideways, both rows of teeth (as in "e").
Row 2: (4) big open round mouth with tongue visible (as in "a"); (5) medium round open "o"; (6) small puckered round "u".
Row 3: (7) lower lip tucked under the top teeth ("f"); (8) slightly open with the tongue tip touching behind the top teeth ("l"); (9) teeth together, lips stretched ("s").
Nothing else in the image.
```

**K4 · Göz, kaş ve duygu ağızları sayfası** · 1:1
```
EYES, BROWS AND EXPRESSION SWAP SHEET for this character, laid out in clean rows on white with even spacing, every piece a separate closed shape. Eyes come in LEFT/RIGHT pairs at the same size and spacing as on the model sheet. Each eye is built from separate stacked shapes: white of the eye, dark-brown pupil with two white catchlights, and eyelid shapes. IMPORTANT: the character's LEFT eye sits on the chestnut patch, so all LEFT eyelid shapes are chestnut (#9A5A32); all RIGHT eyelid shapes are white.
Row 1 eye pairs: open neutral; half-closed (mid-blink); fully closed blink (flat curved line); happy closed (upward arcs).
Row 2 eye pairs: wide surprised (smaller pupils); squeezed tightly shut (tight crescents, for a big cry or a big laugh); teary (extra large catchlights, wet lower lid); sleepy (heavy half lids).
Row 3: pupils alone in five positions (center, left, right, up, down).
Row 4 brow pairs: neutral; raised high; worried (inner ends up); cross (inner ends down); one brow raised.
Row 5: three expression mouths on the same white muzzle piece with the nose: sad closed frown; big laugh with tongue out; wobbly worried mouth.
```

**K5 · El pozları sayfası** · 1:1
```
HAND POSES SWAP SHEET for this character's RIGHT paw-hand only (white, four short rounded fingers, no claws), nine separate hands in a 3 by 3 grid. Each hand ends in a full ROUND wrist cap so it overlaps the forearm. (1) relaxed open; (2) fist; (3) pointing with the index finger; (4) waving, open palm facing viewer, fingers spread; (5) gripping an invisible thin handle (curled fingers, empty grip); (6) cupped palm up, as if holding a small round bun; (7) thumbs up; (8) pinching with thumb and finger; (9) palm flat, back of the hand facing viewer. No sleeves, no objects.
```
*Sol el Adobe'de aynalanır (lekesiz, simetrik el).*

**K6 · Yan parça sayfası (Turntable'dan sonra)** · 1:1 · *referans: Turntable yan çıktısı*
```
Use the attached side-view image as the reference for pose, proportions and colors. Redraw it as a CUT-OUT PUPPET PARTS SHEET in strict SIDE VIEW, the character facing RIGHT, same style. Every part is a separate, COMPLETE, closed vector shape with its own outline, laid out as a tidy exploded diagram with clear space between parts, nothing touching. Draw hidden areas in full. All limb joints have FULLY ROUND ends that overlap. Parts: head in profile with a BLANK face (profile muzzle shape and markings only, no eye, no mouth, no nose); near ear (long, hanging) and far ear (drawn complete); the nose in profile; neck; torso in profile with the green T-shirt and complete hips; neckerchief in profile with the knot at the front; tail with white tip; near and far upper arm with sleeve; near and far forearm; near and far hand, relaxed, in side view; near and far thigh; near and far lower leg; near and far foot with the red sneaker in profile. Far-side parts use the same colors (the rig darkens them). Along the bottom edge, small and separate: one profile eye open, one profile eye closed, one profile brow, and three profile mouths on the profile muzzle (closed smile, open "a", small "o").
```

**K7 · 3/4 parça sayfası (Turntable'dan sonra)** · 1:1 · *referans: Turntable 3/4 çıktısı*
```
Use the attached three-quarter view image as the reference for pose, proportions and colors. Redraw it as a CUT-OUT PUPPET PARTS SHEET in THREE-QUARTER VIEW, the character turned 45 degrees to the viewer's right, same style. Every part is a separate, COMPLETE, closed vector shape with its own outline, laid out as a tidy exploded diagram, nothing touching; hidden areas drawn in full; FULLY ROUND overlapping joints. Parts: head in three-quarter view with a BLANK face (muzzle shape turned 45 degrees and the chestnut left-eye patch only); near ear and far ear; nose in three-quarter view; neck; torso with T-shirt and complete hips; neckerchief; tail; near and far upper arm, forearm and hand; near and far thigh, lower leg and foot with red sneaker. Along the bottom edge, small and separate: the near and far eye open (far eye narrower), the same pair closed, two brows, and three mouths on the three-quarter muzzle (closed smile, open "a", small "o").
```

### 5.2 Anne (Faz 1 · 6 görsel · 72 kredi + pay)

**Süreklilik:** Gemini çizimi `ekip/gemini/yeni/bolum-1/kino-anne/on.png` (beyaz tüy, kestane sarkık kulaklar, göz lekesi yok, hardal hırka, üç kahve düğme, kahve ayakkabı, beldeki kestane leke). Recraft referans kabul ediyorsa A1'de bu dosya referans olarak verilir (güç ~0.35: tasarım kalsın, çizim kalitesi artsın).

**A1 · Model sayfası (önden + arkadan)** · 1:1
```
MODEL SHEET: the same character shown twice at exactly the same scale, both standing on the same invisible baseline, with a wide empty gap between them. LEFT: full body, strict front view. RIGHT: full body, strict back view (showing the round chestnut spot near the tail and the back of the cardigan). Neutral relaxed A-pose: arms slightly away from the body, relaxed open hands, legs slightly apart, ears hanging freely without touching the arms, tail visible. Calm, warm expression, eyes open, gentle closed-mouth smile. The figures fill about 85 percent of the image height.
```

**A2 · Önden parça sayfası** · 1:1
```
CUT-OUT PUPPET PARTS SHEET, front view, matching the character design exactly. Every body part is a separate, COMPLETE, closed vector shape with its own full outline, laid out like a tidy exploded diagram with clear space around each part; nothing touches or overlaps. Draw hidden areas in full. Every limb segment has FULLY ROUND circular ends at its joints. Parts in body order:
1 head with a BLANK face (white muzzle shape only; NO eyes, brows, mouth or nose); 2 left ear, 3 right ear (long chestnut floppy ears with round top caps); 4 nose; 5 neck (short white rounded cylinder); 6 torso: the mustard cardigan body with the white V-neck chest and the three buttons, with the white hips drawn completely below the hem; 7 tail (white with one chestnut spot, round base cap); 8 and 9 left and right upper arm in the cardigan sleeve; 10 and 11 left and right forearm in the sleeve with the band cuff; 12 and 13 left and right hand, relaxed open; 14 and 15 left and right thigh (white, round hip cap); 16 and 17 left and right lower leg; 18 and 19 left and right foot with the dark-brown flat shoe, round ankle cap.
No floating eyes or mouths, no labels, no numbers, no guide lines.
```

**A3 · Ağız sayfası (9 ağız)** · 1:1
```
MOUTH SHAPES SHEET for lip-sync, in this character's own gentle style. Nine separate tiles in a neat 3 by 3 grid with even white space. Each tile shows the SAME white rounded muzzle piece at the same size and position with the same small dark cocoa nose on top and a short philtrum line into a soft W-shaped upper lip; only the mouth changes. Her mouths are a little softer and narrower than a child's. Mouth interior dark red-brown (#5A1E1E), tongue soft coral (#F08A8A), small white teeth.
Row 1: (1) closed gentle resting smile; (2) slightly open, top teeth visible; (3) wide "e" with both rows of teeth.
Row 2: (4) open "a" with tongue; (5) round "o"; (6) small puckered "u".
Row 3: (7) lower lip under top teeth "f"; (8) slightly open, tongue tip behind top teeth "l"; (9) teeth together, lips stretched "s".
Nothing else in the image.
```

**A4 · Göz, kaş ve duygu ağızları** · 1:1
```
EYES, BROWS AND EXPRESSION SWAP SHEET for this character, clean rows on white, every piece a separate closed shape. Eyes in LEFT/RIGHT pairs at the model-sheet size and spacing; each eye built from separate stacked shapes: white of the eye, dark-brown pupil with two white catchlights, and white eyelid shapes with three short lashes on the upper lid.
Row 1 eye pairs: open neutral; half-closed (mid-blink); fully closed blink; happy closed (upward arcs).
Row 2 eye pairs: wide surprised; soft caring (slightly lowered lids); worried; sleepy.
Row 3: pupils alone in five positions (center, left, right, up, down).
Row 4 brow pairs: neutral; raised; worried (inner ends up); stern but kind (slightly lowered); one brow raised.
Row 5: three expression mouths on the same muzzle piece with the nose: warm open laugh; small "oh" of concern; sympathetic closed smile with lowered corners.
```

**A5 · El pozları** · 1:1
```
HAND POSES SWAP SHEET for this character's RIGHT paw-hand only (white, four short rounded fingers, slightly slimmer than a child's), nine separate hands in a 3 by 3 grid, each ending in a full ROUND wrist cap, no sleeves, no objects. (1) relaxed open; (2) soft fist; (3) pointing; (4) waving, open palm; (5) gripping an invisible thin handle such as a teacup handle; (6) palm up, offering; (7) gently stroking, fingers together and slightly curved; (8) pinching; (9) palm flat, back of the hand facing viewer.
```
*Sol el Adobe'de aynalanır. Baba'nın elleri bu sayfadan ×1.15 ölçekle alınır.*

**A6 · Yan parça sayfası (Turntable'dan sonra)** · 1:1 · *referans: Turntable yan çıktısı*
```
Use the attached side-view image as the reference for pose, proportions and colors. Redraw it as a CUT-OUT PUPPET PARTS SHEET in strict SIDE VIEW, the character facing RIGHT, same style. Every part a separate, COMPLETE, closed vector shape with its own outline, tidy exploded layout, nothing touching, hidden areas drawn in full, FULLY ROUND overlapping joints. Parts: head in profile with a BLANK face (profile muzzle only); near ear and far ear; nose in profile; neck; torso in profile in the mustard cardigan with complete hips; tail; near and far upper arm and forearm in the cardigan sleeve; near and far hand in side view; near and far thigh, lower leg and foot with the flat brown shoe in profile. Along the bottom edge, small and separate: profile eye open, profile eye closed, profile brow, and three profile mouths (closed smile, open "a", small "o").
```

### 5.3 Lokum (Faz 2 · 4 görsel · 48 kredi + pay)

Küçük çocuk: az parça. Kol ve bacak **tek parça** (Blender'da mesh deform ile bükülür), el ve ayak ayrı.

**L1 · Model sayfası (önden + arkadan)** · 1:1
```
MODEL SHEET: the same toddler character shown twice at exactly the same scale on the same invisible baseline with a wide gap. LEFT: full body, strict front view. RIGHT: full body, strict back view (showing the chestnut spot on his bottom and the stubby tail). Standing toddler pose: feet apart, round belly forward, short arms held slightly out from the body, asymmetric ears clearly visible (his left ear chestnut, his right ear white). Happy open-mouth smile showing two tiny top teeth. The figures fill about 70 percent of the image height.
```

**L2 · Önden parça sayfası + 3 el** · 1:1
```
CUT-OUT PUPPET PARTS SHEET for this toddler, front view, matching the design exactly. Every part a separate, COMPLETE, closed vector shape with its own outline, tidy exploded layout with clear space, nothing touching, hidden areas drawn in full, FULLY ROUND overlapping joint ends. Parts: 1 head with a BLANK face (white muzzle shape only); 2 left ear (chestnut), 3 right ear (white); 4 nose; 5 round body in the pink romper with the two snap buttons, white hips drawn complete below; 6 tail (short, white, round base); 7 and 8 left and right arm, each ONE piece with the short pink sleeve and a round shoulder cap; 9 and 10 left and right leg, each ONE short piece with a round hip cap; 11 and 12 left and right bare white paw foot, round ankle cap. Along the bottom: three separate RIGHT toddler hands with round wrist caps: open, grabbing (fingers curled), pointing.
```

**L3 · Ağız + göz sayfası (6 ağız)** · 1:1
```
FACE SWAP SHEET for this toddler, clean rows on white, every piece a separate closed shape.
Rows 1 and 2: six mouth tiles, each on the SAME small white muzzle piece with the same small nose on top: (1) closed happy smile; (2) open giggle with two tiny top teeth; (3) open "a" calling out; (4) small round "o"; (5) wide crying mouth, square-ish and wobbly; (6) trembling pout with pushed-out lower lip.
Row 3: LEFT/RIGHT eye pairs, each built from white of the eye, big dark pupil with two catchlights, and white eyelid shapes: open huge; blink; happy closed arcs; teary with big wet catchlights; sleepy.
Row 4: two soft small brow pairs: neutral and worried.
```
*Dudak eşlemesi (6 ağız): `kapali`→1, `az/l/s/f`→2, `e`→3, `a`→3, `o/u`→4. Ağlama ve dudak titremesi 5-6.*

**L4 · Yan parça sayfası (Turntable'dan sonra)** · 1:1 · *referans: Turntable yan çıktısı*
```
Use the attached side-view image as the reference. Redraw it as a CUT-OUT PUPPET PARTS SHEET in strict SIDE VIEW facing RIGHT, same style. Separate, COMPLETE, closed vector shapes, tidy exploded layout, nothing touching, hidden areas drawn in full, FULLY ROUND overlapping joints. Parts: head in profile with a BLANK face (profile muzzle only); near ear (the white right ear) and far ear (the chestnut left ear, drawn complete); nose in profile; round body in the pink romper in profile; tail; near and far arm (one piece each); near and far hand; near and far leg (one piece each); near and far bare foot. Along the bottom: profile eye open, profile eye closed, and three profile mouths (closed smile, open giggle, crying).
```

### 5.4 Baba (Faz 2 · 5 görsel · 60 kredi + pay)

Eller A5'ten (×1.15). Bıyık **ağız parçasının üstündedir**: konuşurken ağızla birlikte zıplar (komik).

**B1 · Model sayfası (önden + arkadan)** · 1:1
```
MODEL SHEET: the same character shown twice at exactly the same scale on the same invisible baseline with a wide gap. LEFT: full body, strict front view. RIGHT: full body, strict back view (showing the chestnut back saddle and the chestnut head cap). Neutral relaxed A-pose, arms slightly away from the round belly, relaxed open hands, legs apart, ears hanging freely, tail visible. Sleepy, warm half-lidded expression with a closed-mouth grin under the moustache patch. The figures fill about 90 percent of the image height.
```

**B2 · Önden parça sayfası + önlük** · 1:1
```
CUT-OUT PUPPET PARTS SHEET, front view, matching the design exactly. Every part a separate, COMPLETE, closed vector shape with its own outline, tidy exploded layout with clear space, nothing touching, hidden areas drawn in full, FULLY ROUND circular joint ends. Parts in body order: 1 head with a BLANK face (white muzzle shape and the chestnut cap patch on top; NO eyes, brows, mouth, nose or moustache); 2 left ear, 3 right ear (dark chocolate, round top caps); 4 nose; 5 neck; 6 torso: the burgundy sweater over the big round belly, white hips drawn complete below the hem; 7 tail; 8 and 9 left and right upper arm in the sweater sleeve; 10 and 11 left and right forearm, white fur with the pushed-up sleeve edge at the elbow; 12 and 13 left and right thigh (white, round hip cap); 14 and 15 left and right lower leg; 16 and 17 left and right foot in a brown slipper, round ankle cap. Separately: 18 a plain cream baker's apron with a neck strap and waist ties, flat, to be worn over the sweater.
```

**B3 · Ağız sayfası (9 ağız, bıyıklı)** · 1:1
```
MOUTH SHAPES SHEET for lip-sync, in this character's own style. Nine separate tiles in a neat 3 by 3 grid with even white space. Each tile shows the SAME broad white muzzle piece at the same size and position, the same dark cocoa nose on top, and the small chocolate-brown MOUSTACHE patch directly under the nose, sitting on the upper lip and moving with it; only the mouth (and the moustache's slight lift) changes. Wide, friendly mouth. Mouth interior dark red-brown (#5A1E1E), tongue coral (#F08A8A), white teeth.
Row 1: (1) closed, wide resting grin; (2) slightly open, top teeth; (3) wide "e", both rows of teeth.
Row 2: (4) big open "a" with tongue, moustache lifted; (5) round "o"; (6) puckered "u".
Row 3: (7) lower lip under top teeth "f"; (8) slightly open, tongue tip behind teeth "l"; (9) teeth together, lips stretched "s".
```

**B4 · Göz, kaş ve duygu ağızları** · 1:1
```
EYES, BROWS AND EXPRESSION SWAP SHEET for this character, clean rows on white, every piece a separate closed shape. Eyes in LEFT/RIGHT pairs at model-sheet size and spacing, each built from white of the eye, dark-brown pupil with two catchlights, and white eyelid shapes; his default eyes are sleepy and half-lidded.
Row 1 eye pairs: sleepy half-lidded (default); fully open awake; blink; happy closed arcs.
Row 2 eye pairs: asleep (peaceful curved lines); wide startled awake (small pupils); gently surprised; soft caring.
Row 3: pupils alone in five positions.
Row 4 thick short brow pairs: neutral; raised high; worried; stern; one raised.
Row 5: three expression mouths on the same muzzle piece with nose and moustache: big belly laugh; yawning wide open; snoring with a small round open mouth.
```
*Baba'nın uyurken yüzüne kapanan gazetesi eşya olarak çizilir, kit dışı.*

**B5 · Yan parça sayfası (Turntable'dan sonra)** · 1:1 · *referans: Turntable yan çıktısı*
```
Use the attached side-view image as the reference. Redraw it as a CUT-OUT PUPPET PARTS SHEET in strict SIDE VIEW facing RIGHT, same style. Separate, COMPLETE, closed vector shapes, tidy exploded layout, nothing touching, hidden areas drawn in full, FULLY ROUND overlapping joints. Parts: head in profile with a BLANK face (profile muzzle and the chestnut cap patch only); near ear and far ear; nose in profile; neck; torso in profile with the burgundy sweater and the big round belly, complete hips; tail; near and far upper arm with sleeve; near and far forearm; near and far hand; near and far thigh, lower leg and slippered foot. Along the bottom: profile eye half-lidded, profile eye closed, profile brow, and three profile mouths with the moustache (closed grin, open "a", small "o").
```

### 5.5 Mino (Faz 3 · 5 görsel · 60 kredi + pay)

Seri 1 Mino'su (`assets/karakter/mino.webp`, film kapakları) referans olarak verilebilir (güç ~0.3): yüz düzeni ve renkler tanınmalı, yaş 5'e çıkmalı. Kuyruk **iki parça** (kök + uç), takip hareketi için.

**M1 · Model sayfası (önden + arkadan)** · 1:1
```
MODEL SHEET: the same character shown twice at exactly the same scale on the same invisible baseline with a wide gap. LEFT: full body, strict front view. RIGHT: full body, strict back view (tabby stripes on the back of the head, the back of the pinafore, the long curling tail with cream tip). Neutral relaxed A-pose, arms slightly away from the body, relaxed open hands, legs slightly apart, tall ears upright, tail curling out to the side. Bright, confident expression, eyes open, small closed-mouth smile. The figures fill about 85 percent of the image height.
```

**M2 · Önden parça sayfası + 4 el** · 1:1
```
CUT-OUT PUPPET PARTS SHEET, front view, matching the design exactly. Every part a separate, COMPLETE, closed vector shape with its own outline, tidy exploded layout with clear space, nothing touching, hidden areas drawn in full, FULLY ROUND circular joint ends. Parts in body order: 1 head with a BLANK face (orange head with forehead tabby stripes and the cream muzzle area; NO eyes, brows, mouth or nose); 2 left ear, 3 right ear (tall, pointed, pink inner ear, round base caps); 4 small pink nose; 5 neck; 6 torso: the turquoise pinafore over the cream chest, with orange hips drawn complete below the hem; 7 red neckerchief with front knot; 8 tail base segment and 9 tail tip segment (cream tip), joined by a round overlapping cap; 10 and 11 left and right upper arm (orange); 12 and 13 left and right forearm (orange fading to a cream paw cuff by a clean edge, no gradient); 14 and 15 left and right thigh; 16 and 17 left and right lower leg; 18 and 19 left and right bare cream paw foot, round ankle cap. Along the bottom: four separate RIGHT cream paw-hands with round wrist caps: relaxed open, fist, pointing up, waving.
```

**M3 · Ağız sayfası (9 ağız, kedi stili)** · 1:1
```
MOUTH SHAPES SHEET for lip-sync, in this kitten's own style. Nine separate tiles in a neat 3 by 3 grid with even white space. Each tile shows the SAME cream rounded muzzle piece at the same size and position with the same small pink triangle nose on top and a tiny line down into a small cat-style upper lip; only the mouth changes. Mouth interior dark red-brown (#5A1E1E), tongue pink (#F49AA6), two tiny fangs only when the mouth is open.
Row 1: (1) closed little smile; (2) slightly open, small teeth; (3) wide "e".
Row 2: (4) open "a" with tongue; (5) round "o"; (6) small puckered "u".
Row 3: (7) lower lip under top teeth "f"; (8) slightly open, tongue tip up "l"; (9) teeth together, lips stretched "s".
```

**M4 · Göz, kaş ve duygu ağızları** · 1:1
```
EYES, BROWS AND EXPRESSION SWAP SHEET for this kitten, clean rows on white, every piece a separate closed shape. Eyes in LEFT/RIGHT pairs at model-sheet size and spacing, each built from white of the eye, amber-brown iris with dark pupil and two white catchlights, and orange eyelid shapes with two short lashes.
Row 1 eye pairs: open neutral; half-closed; blink; happy closed arcs.
Row 2 eye pairs: wide excited (big pupils); narrowed sly and confident; worried; teary.
Row 3: irises alone in five positions.
Row 4 brow pairs (thin orange): neutral; raised; worried; cross; one raised.
Row 5: three expression mouths on the same cream muzzle with the pink nose: big open laugh with tongue; proud closed smirk; small worried wobble.
```

**M5 · Yan parça sayfası (Turntable'dan sonra)** · 1:1 · *referans: Turntable yan çıktısı*
```
Use the attached side-view image as the reference. Redraw it as a CUT-OUT PUPPET PARTS SHEET in strict SIDE VIEW facing RIGHT, same style. Separate, COMPLETE, closed vector shapes, tidy exploded layout, nothing touching, hidden areas drawn in full, FULLY ROUND overlapping joints. Parts: head in profile with a BLANK face (profile muzzle only, tabby stripes); near ear and far ear; nose in profile; neck; torso in profile in the turquoise pinafore with complete hips; neckerchief in profile; tail base and tail tip; near and far upper arm, forearm and hand; near and far thigh, lower leg and bare paw foot. Along the bottom: profile eye open, profile eye closed, profile brow, and three profile mouths (closed smile, open "a", small "o").
```

### 5.6 Babaanne ve Dede (Faz 4 · 5 görsel · 60 kredi + pay)

Yalnız önden kit: ilk bölümlerde masada oturur, kapıda durur, balkondan bakar. Yan görünüş gerekince sonra eklenir (+2 görsel, +2 Turntable).

**N1 · Babaanne model sayfası (önden + arkadan)** · 1:1
```
MODEL SHEET: the same character shown twice at exactly the same scale on the same invisible baseline with a wide gap. LEFT: full body, strict front view. RIGHT: full body, strict back view (the silver fur bun on top of the head, the glasses cord, the back of the lavender cardigan). Neutral relaxed A-pose, arms slightly away from the body, relaxed open hands, feet slightly apart, ears hanging freely. Warm crinkled smile. The figures fill about 85 percent of the image height.
```

**N2 · Babaanne önden parça sayfası** · 1:1
```
CUT-OUT PUPPET PARTS SHEET, front view, matching the design exactly. Every part a separate, COMPLETE, closed vector shape with its own outline, tidy exploded layout with clear space, nothing touching, hidden areas drawn in full, FULLY ROUND circular joint ends. Parts: 1 head with a BLANK face (white muzzle shape only); 2 the silver fur bun as its own piece; 3 left ear, 4 right ear (milky caramel, round top caps); 5 nose; 6 the round gold-rim glasses with their cord, as one piece with empty clear lenses; 7 neck; 8 torso in the lavender cardigan over the cream dress, with the dress skirt as part of the torso and white hips drawn complete underneath; 9 tail; 10 and 11 left and right upper arm in the cardigan sleeve; 12 and 13 left and right forearm in the sleeve; 14 and 15 left and right hand, relaxed open; 16 and 17 left and right leg below the skirt (one piece each, round top cap); 18 and 19 left and right foot in a comfy brown shoe, round ankle cap. Along the bottom: three separate RIGHT hands with round wrist caps: holding (curled grip), palm up offering, waving.
```

**D1 · Dede model sayfası (önden + arkadan)** · 1:1
```
MODEL SHEET: the same character shown twice at exactly the same scale on the same invisible baseline with a wide gap. LEFT: full body, strict front view. RIGHT: full body, strict back view (the back of the flat cap, the olive vest, the brown trousers). Neutral relaxed pose with a slight stoop, arms slightly away from the body, relaxed open hands, feet slightly apart, ears hanging freely. Dry, kind half-smile under the white moustache patch. The figures fill about 85 percent of the image height.
```

**D2 · Dede önden parça sayfası** · 1:1
```
CUT-OUT PUPPET PARTS SHEET, front view, matching the design exactly. Every part a separate, COMPLETE, closed vector shape with its own outline, tidy exploded layout with clear space, nothing touching, hidden areas drawn in full, FULLY ROUND circular joint ends. Parts: 1 head with a BLANK face (white muzzle shape only, no brows, no moustache); 2 the grey flat cap as its own piece; 3 left ear, 4 right ear (pale grey-brown, round top caps); 5 nose; 6 neck with the cream shirt collar; 7 torso: the olive vest over the cream shirt, with the top of the brown trousers drawn complete underneath; 8 tail; 9 and 10 left and right upper arm in the cream shirt sleeve; 11 and 12 left and right forearm with the rolled sleeve edge; 13 and 14 left and right hand, relaxed open; 15 and 16 left and right thigh in brown trousers (round hip cap); 17 and 18 left and right lower leg in trousers; 19 and 20 left and right foot in a brown shoe, round ankle cap. Along the bottom: three separate RIGHT hands with round wrist caps: holding (curled grip), pointing, palm up.
```

**G1 · Büyükanne-büyükbaba yüz sayfası (ortak)** · 1:1 · istem = `STYLE` + `BABAANNE` + `DEDE` + aşağısı
```
FACE SWAP SHEET for TWO characters, every piece a separate closed shape, clean rows on white with even spacing. TOP HALF, the GRANDMOTHER: six mouth tiles, each on the SAME white muzzle piece with the same small nose: (1) closed warm smile; (2) slightly open, top teeth; (3) wide "e"; (4) open "a"; (5) round "o"; (6) delighted open laugh. Then her LEFT/RIGHT eye pairs (white of eye, dark pupil with catchlights, white eyelids, no glasses): open crinkled smile-eyes; blink; happy closed arcs; surprised. Then two soft brow pairs: neutral and raised. BOTTOM HALF, the GRANDFATHER: six mouth tiles, each on the SAME white muzzle piece with the same nose and the white MOUSTACHE patch on the upper lip: (1) closed dry half-smile; (2) slightly open; (3) wide "e"; (4) open "a"; (5) round "o"; (6) rare big laugh. Then his eye pairs: open calm; blink; happy closed arcs; one eye squinting. Then his BIG BUSHY WHITE brow pairs as separate shapes: neutral; raised; frowning; one raised.
```
*Dudak eşlemesi (6 ağız): `kapali`→1, `az/l/s/f`→2, `e`→3, `a`→4, `o/u`→5. Gülme 6.*

---

## 6. Kit dışı: Bölüm 1 pozları (bütçeye dahil değil)

Bölüm 1'in P1-P10 pozları ve F1-F2 albüm fotoğrafları ([bolum-01.md](bolum-01.md)) kit gelince çizilir. Bebek Kino (F1) Lokum kitinden türetilir: iki kulak kestane, sol gözde kestane leke, açık yeşil tulum. Öneri: kitin model sayfası referans verilerek **Gemini** (ücretsiz), sonra Adobe'de temizlik ve parçalara ayırma. Recraft'la yapılacaksa her biri `STYLE` + `DNA` + tek cümlelik poz tarifi (ör. *"Full body, side view facing right: sitting down hard on his bottom on the floor, legs straight out in front, ears flying up, surprised face."*), 12 × 12 = ~144 kredi (+ pay ~185).

## 7. Kontrol listesi (her görselden sonra)

- [ ] §2'deki ret ölçütlerinden hiçbiri yok.
- [ ] Renkler DNA'daki kodlarla aynı aile; Kino'da mavi yalnız fularda.
- [ ] Kino'nun lekesi **sol gözünde** (izleyiciye göre sağda).
- [ ] Parça sayfasında her parça kapalı ve tam; eklem uçları daire.
- [ ] Ağız sayfasında muzzle ve burun dokuz karede aynı yerde, aynı boyda.
- [ ] Dosya `ekip/film/seri-2/kit/<kod>.svg` olarak kaydedildi; harcanan kredi ve kalan bakiye ORTAK_NOTLAR'a yazıldı.

---

## 8. Ek: Oyunlu Bölüm 1 "Kino'nun Bir Günü" için çizim listesi

> 2026-10-10 · [OYUNLU-FORMAT.md](OYUNLU-FORMAT.md) · [oyunlu-bolum-01.md](oyunlu-bolum-01.md). Kit (§5) dışında bölümün istediği her şey burada. **Kredi harcamadan önce toplam Barış'a söylenir ve onay alınır** (§0 kuralı). Hepsi §3 `STYLE` bloğuyla, aynı çizgi ve renk diliyle çizilir.
> **Durum işaretleri:**
> - ✓ var, yeniden kullanılır (yanına kit karakteriyle bir deneme kare konur; çizgi rengi ya da gölge tutmazsa aynı kompozisyon yeniden çizilir);
> - ⇄ Bölüm 1 ile ortak (zaten gerekiyor, bir kez yapılır);
> - ✗ yeni.

### 8.1 Kit ekleri: kostüm sayfaları (2 görsel)

Aynı dönme noktalarına oturur. Rig yalnız katmanı değiştirir.

| Kod | Ne | Nerede | Not |
|---|---|---|---|
| **K8** ✗ | **Kino pijama parça sayfası**: pijama gövdesi (kalça dahil), üst kol ×2, alt kol ×2, uyluk ×2, baldır ×2; krem zemin, küçük yeşil yıldızlar; yalınayak beyaz ayak ×2 | S1, S3 | Mavi yok (seri kuralı). K2 düzeninde, yuvarlak eklemlerle. |
| **K9** ✗ | **Banyo gövdesi sayfası (Kino + Lokum)**: kıyafetsiz beyaz üst gövde ve omuzlar; Kino'nun sırt eyer lekesi, Lokum'un tombul gövdesi; kollar kitteki beyaz alt kollarla birleşir; ıslak kulak ×2 (Kino, düz ve damlalı) | S7, Oyun 5 | Küvette yalnız bel üstü görünür; alt gövde çizilmez. |

### 8.2 Arka planlar: 2 yeni, 2 ortak, 2 yeniden kullanım

| Kod | Yer | Durum | Not |
|---|---|---|---|
| M0 | Çınar Apartmanı cephesi | ⇄ | **Ek katman ✗: kapı önü taş basamaklar yakın planı** (Oyun 3 arkası, önceden yumuşatılmış). Yeni bir arka plan değil, cephenin yakın katmanı. |
| M1 | Çocuk odası, sabah + gece ışığı | ⇄ | Komodin üstü boş (taş ve gece lambası eşya olarak konur). |
| **M3** | **Banyo**: lavabo + ayna (sol uç), küvet (sağ uç), karolu duvar, küçük pencere; sabah ve akşam ışığı | ✗ | Bölüm 2 "Banyo Yok!" de kullanır. Ayna **içi boş** çizilir (Oyun 1'de kamera aynadan bakar). Küvet arka ve ön kenar ayrı katman. Eski `assets/banyo/arkaplan` Mino Banyo'nundur, yalnız düzen örneği. |
| **M4** | **Babaanne'nin bahçesi**: limon ağacı, uzun kahvaltı masası (örtülü), 6 sandalye, fesleğen-domates tarhı, apartmanın arka duvarı | ✗ | Dizinin daimi seti. Masa önden; altı kişi masanın arkasında yüzü bize dönük oturur. |
| M5 | Sokak (parka yol) | ✓ `assets/film/sokak` | Stil denemesi şart. |
| M6 | Park | ✓ `assets/film/park` (+ `esya/kaydirak`, `salincak`, `kum-havuzu`, `bank`) | Seri kitabı "uyarlanabilir" diyor. Küçük kaydırak = `esya/kaydirak` küçültülmüş; büyük kaydırak park katmanındaki. |

### 8.3 Bölüme özel pozlar (Gemini + Adobe, §6 yolu; Recraft'la yapılırsa her biri ~12 kredi)

| Kod | Poz | Durum |
|---|---|---|
| OP1 | Lokum karyolada ayakta, iki eliyle parmaklıkları tutmuş, zıplıyor | ✗ |
| OP2 | Kino'nun başı pijamanın içinde sıkışmış, kollar havada, kulak uçları yakadan çıkmaya çalışıyor (pijama + Kino bir arada) | ✗ |
| OP3 | Baba masada oturarak uyuyor, başı göğsüne düşmüş, fırıncı önlüklü | ✗ |
| OP4 | Kino basamakta oturmuş, ayakkabısına eğilmiş (yan) | ✗ |
| OP5 | Kino diz çökmüş, Lokum'a eğilmiş (yan) | ✗ |
| OP6 | Kino ile Lokum yerde sarılıyor | ✗ |
| OP7 | Lokum mama sandalyesinde oturuyor | ✗ |
| OP8 | Babaanne bankta oturuyor, eli hırka cebinde | ✗ |
| OP9 | Baba kapüşonlu havlulara sarılı iki çocuğu birden kucaklamış | ✗ |
| OP10 | Kino köpükte sırtüstü yüzüyor, kulakları suda iki yana yayılmış | ✗ |
| OP11 | **Tepeden:** Lokum'un başı tabağın üst kenarından bakıyor (gözler, burun ucu, iki kulak) | ✗ |
| P5, P9, P10 | Lokum yerde ağlıyor · yatakta Kino (+ Anne) · Lokum karyolada uyuyor | ⇄ Bölüm 1 |

### 8.4 Eşyalar (şeffaf; oyun eşyaları ★, en küçük boy telefonda 72 px)

Eşyalar **sayfa sayfa** üretilir (bir görselde 4-8 eşya, aralarında boşluk; Adobe ayırır). Kredi görsel başına (~12), eşya başına değil.

| Sayfa | Eşyalar | Durum |
|---|---|---|
| **E1 · Lavabo** ✗ | ★ kum saati (cam, ahşap kapaklı; kum ayrı katman), Kino'nun yeşil diş fırçası, Lokum'un minik pembe fırçası, macun tüpü (sıkılmış ve düz), diş bardağı, ★ köpük topu (beyaz kabarcık kümesi, 3 boy) | ✗ |
| **E2 · Kahvaltı** ✗ | simit sepeti (fırın sepeti), ★ simit, ★ büyük beyaz tabak (tepeden), ★ 5 küçük kâse (tepeden, boş), ★ zeytin, ★ domates dilimi, ★ peynir üçgeni, ★ salatalık dilimi, ★ kızarmış ekmek üçgeni, pişi tepsisi, ince belli çay bardağı + tabağı, **masa örtüsü üstten (oyun zemini)** | ✗ (çaydanlık ⇄ Bölüm 1) |
| **E3 · Ayakkabı** ✗ | ★ **Kino'nun sağ spor ayakkabısı yakın plan** (önden 3/4, iri; bağcık delikleri net, bağcık YOK: bağcıklar ip fiziğiyle kodla çizilir), ★ bağcık uçları (plastik uç, 2), ★ hazır fiyonk (son kare için) | ✗ |
| **E4 · Park ve bant** ✗ | Lokum'un puseti, ★ teneke yara bandı kutusu (açık ve kapalı), ★ 3 yara bandı (sarı yıldızlı, kırmızı kalpli, krem kuzulu; her biri kâğıtlı ve kâğıtsız), ★ kâğıt sekmesi, ★ parlak çakıl taşı | ✗ |
| **E5 · Küvet deneyi** ✗ | ★ sünger, ★ plastik top (kırmızı-beyaz), ★ pembe sabun kalıbı, ★ iki tahmin minderi ("yüzer": dalgada ördek resmi; "batar": dipte taş resmi), 2 kapüşonlu havlu (yeşil: Kino, pembe: Lokum) | ✗ |
| **E6 · Yatak** ✗ | masal kitabı *Küçük Kuzu* (kapalı + açık çift sayfa), yerdeki terlikler (Kino) | ✗ |
| Ortak / var | Kuzu, ay biçimli gece lambası, yorgan, çaydanlık | ⇄ Bölüm 1 |
| Ortak / var | lastik ördek `assets/banyo/ordek`, köpük `assets/banyo/kopuk`, mama sandalyesi `assets/film/esya/mama-sandalyesi`, basamak taburesi `assets/banyo/tabure`, çamaşır sepeti `assets/banyo/sepet` | ✓ (stil denemesiyle) |

**Kodla çizilenler (çizim istemez):** macun kıvrımı, köpük kabarcıkları, kum akışı, bağcıklar (ip fiziği; beyaz şerit + koyu kahve kontur), su yüzeyi, halkalar, sıçrama ve kabarcıklar, parıltılar, gözyaşları.

### 8.5 Toplam

| | Görsel | Kredi (Recraft vektör, ~12) | +%30 pay |
|---|---|---|---|
| Kit ekleri (K8, K9) | 2 | 24 | 31 |
| Yeni arka plan (M3, M4) + M0 basamak katmanı | 3 | 36 | 47 |
| Eşya sayfaları (E1-E6) | 6 | 72 | 94 |
| **Toplam Recraft** | **11** | **132** | **~170** |
| Pozlar OP1-OP11 | 11 | Gemini (ücretsiz) + Adobe temizlik | (Recraft'la: +~170) |

- **Sıra:** Önce M4 bahçe ile E2 kahvaltı sayfası (en çok görünen ve en Türk sahne). Kino kiti (Faz 1) onaylanmadan bu liste başlamaz.
- Yeniden kullanılanlar (✓) için önce kit karakteriyle **bir deneme kare** yapılır. Tutmazsa Barış'a "yeniden çizelim mi?" diye toplam kredisiyle sorulur.
