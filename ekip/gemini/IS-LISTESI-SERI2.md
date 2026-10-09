# Gemini iş listesi: Seri 2 "Ela ile Efe" (karakter kitleri + Bölüm 1)

> 2026-10-09 · Kaynak belgeler: `ekip/film/seri-2/SERI-KITABI.md`, `ekip/film/seri-2/bolum-01.md`, `ekip/film/seri-2/URETIM-YOLU.md`.
>
> **Kim ne yapar:**
> - **Gemini** (tarayıcı): model sayfaları, A-pozları, ifade, ağız, göz, el ve poz sayfaları, arka plan katmanları, eşyalar.
> - **Illustrator Turntable** (tasarımcı oturumu): yan, 3/4 ve arka görünüşler (bölüm T).
> - **Recraft**: yalnız 2 görsel, yalnız parçalara ayırmak için (bölüm R). Kredi çok az.
> - **Adobe**: temizlik, şeffaflık, katmanlama.
>
> **Toplam:**
> - **95 Gemini görseli**: Ela 22, Efe 25, aile ve Tosbi 23, Bölüm 1 mekân ve eşya 23, kapak ve açılış 2.
> - **16 Turntable üretimi** (~320 Firefly kredisi).
> - **2 Recraft vectorize** (~2 kredi).

## 0. Nasıl kullanılır

**İstem = sahne cümlesi + kimlik cümlesi (I-…) + stil eki (S-…).** Ekler aynen, sona yapıştırılır.

### Stil ekleri
- **S-İNSAN** (insan karakter, tek figür, beyaz zemin):
  > Premium glossy cartoon style for a preschool picture book, modern Disney Junior / Nick Jr. preschool style, very cute and appealing, clean flat 2D vector look with only light two-tone cel shading and a few small subtle highlights (top of the hair, cheeks, nose tip), thick clean dark brown outline (not black) of even weight, simple rounded shapes. Big round head and small soft body, short chubby limbs, rounded hands with four fingers and a thumb. Huge round expressive eyes placed low and wide on the face, tiny button nose, small mouth. Flat smooth hair shapes with no strands, flat clothes with no fabric or knit texture. No texture, no grain, no brush strokes, no 3D, no plastic look, no realistic rendering. Centered, isolated on a plain pure white background, no text, no ground, no cast shadow.
- **S-SAYFA** (aynı karakterin çok parçalı sayfası: ağız, göz, el, ifade, poz dizisi):
  > Character design sheet: every item drawn at exactly the same scale and the same line weight, evenly spaced in a clean grid with generous white space between items, nothing overlapping, no labels, no numbers, no arrows, no text, plain pure white background.
- **S-PARÇA** (cut-out kukla parçaları):
  > Cut-out animation puppet parts: every body part drawn as a separate complete piece with its own full outline, joints drawn as full rounded ends that would hide under the neighbouring part, nothing cut off at the joints, the pieces laid out apart with clear white gaps, same scale and colors as the reference.
- **S-KİLİT-İNSAN** (var olan karakterin yeni pozu ya da sayfası; önce kaynak görsel yüklenir):
  > Keep exactly the same character as the uploaded reference: same face shape, same eye size and position, same hair shapes and color, same skin tone, same clothes and colors, same accessory, same proportions, same thick dark-brown outline and the same light cel shading with only a few small highlights. Clean flat 2D cartoon vector, no 3D, no texture. Plain pure white background, no text, no ground.
- **S-NESNE** ve **S-ARKA**: `ekip/gemini/IS-LISTESI-YENI.md` §0 ile aynen aynı.
- **S-KATMAN** (arka plan katmanı ayrı parça; parallax için):
  > This is one separate depth layer of a background scene, drawn alone and complete, with nothing cut off, isolated on a plain pure white background, no characters, no text.

### Kimlik cümleleri (her istemde aynen)
- **I-ELA:**
  > a very cute 4-year-old Turkish girl named Ela, about 2.3 heads tall, round face with soft rosy round cheeks, warm light-tan skin, huge round dark-brown eyes with two white sparkles each and three short lashes, dark-chestnut hair with a short straight fringe and two big perfectly round fluffy hair puffs on both sides of her head at ear height tied with small red bobbles, wearing a sunflower-yellow short-sleeve dress with a white rounded collar, red leggings and small red shoes with a white strap, and her signature accessory: a round red ladybug backpack with big black spots and two tiny antennae, its two red straps visible over her shoulders
- **I-EFE:**
  > a very cute 4-year-old Turkish boy named Efe, Ela's twin brother, about 2.3 heads tall, round chubby face with soft rosy cheeks, warm light-tan skin, huge round dark-brown eyes with two white sparkles each, a single dark-chestnut curl falling on his forehead from under his hat, his signature accessory: a smooth sky-blue beanie with two small round bear ears on top (flat color, no knit texture), wearing a grass-green t-shirt with one big white star on the chest, navy-blue shorts with rolled hems, white socks and small sky-blue sneakers with white soles
- **I-NİL:**
  > a very cute 2-year-old toddler girl named Nil, about 2 heads tall, chubby round cheeks and a round little belly, warm light-tan skin, huge round dark-brown eyes with white sparkles, short dark-chestnut hair with one tiny sprout ponytail on top of her head tied with a red bobble, wearing a pink dress with white polka dots, mint-green leggings and small red slippers
- **I-ANNE:**
  > a young Turkish mother named Selin, friendly round face, warm light-tan skin, big kind dark-brown eyes, shoulder-length wavy dark-chestnut hair in a loose low ponytail, wearing a soft coral-red sweater, blue jeans and white sneakers, gentle warm smile, adult cartoon proportions (about 4 heads tall) but still soft and rounded
- **I-BABA:**
  > a young Turkish father named Emre, round friendly face, warm light-tan skin, big kind dark-brown eyes, short dark hair and a short neat dark beard, wearing a mustard-yellow sweater, dark-grey trousers and brown slippers, big warm smile, adult cartoon proportions (about 4.3 heads tall) but soft and rounded
- **I-TOSBİ:**
  > a very cute small tortoise named Tosbi, round olive-green dome shell with big soft golden-brown hexagon plates, a cream shell rim, light-green head with huge shiny black eyes and a tiny smile, four short stubby legs and a tiny tail

### Kaynak yükleme kuralı
- A1 (Ela) ve B1 (Efe) onaylandıktan sonra **her istemde o karakterin A1/B1'i yüklenir**.
- Yan ve 3/4 istemlerinde ayrıca T çıktısı yüklenir.
- İkisi birlikte çizilecekse A1 ve B1 birlikte yüklenir.
- **Her görsel yeni bir sohbette** üretilir; uzayan sohbet yanlış resim indirir. Pro kotası 10:00'da sıfırlanır; iş 2-3 güne bölünür.

### Boyut ve şeffaflık
- **K** = 1:1, ≥ 2048. **Y** = 16:9, ≥ 2752×1536. **G** = 2:1 ya da 3:1, ≥ 3072 geniş.
- **E** = beyaz zemin Adobe'da silinir. **H** = zemin kalır (arka plan).
- **Kayıt:** `ekip/gemini/yeni/seri2/<karakter|bolum-01>/<dosya>.png`. Adobe teslimi `assets/film2/…` altına yapar (URETIM-YOLU §2.2).
- **Kontrol:**
  - stil rehberi §5,
  - A1 ve B1 ile yan yana aynı karakter mi,
  - parmak sayısı doğru mu,
  - göz boyu ve yeri aynı mı.
  - Yazı, harf ya da rakam çıkarsa görsel kullanılmaz.

---

## A. Ela kiti · 22 görsel (öncelik 1)

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| A1 | `ela/model.png` | K | E | **Model sayfası, kimlik kaynağı. Barış onayı burada.** |
| A2 | `ela/a-poz-on.png` | K | E | Rig kaynağı + Turntable girdisi |
| A3 | `ela/kafa-on.png` | K | E | Yakın plan kafası (2048'de keskin) |
| A4 | `ela/parca-on.png` | K | E | Gizli kalan yerleri tam çizilmiş parçalar (omuz, kalça, boyun) |
| A5 | `ela/agiz-on.png` | K | E | 9 dudak senkronu ağzı |
| A6 | `ela/agiz-ifade-on.png` | K | E | 6 ifade ağzı |
| A7 | `ela/goz-kas-on.png` | K | E | göz durumları + ayrı iris + kaşlar |
| A8 | `ela/ifade-1.png` | K | E | 6 yüz: mutlu, kahkaha, şaşkın, üzgün, ağlıyor, kızgın |
| A9 | `ela/ifade-2.png` | K | E | 6 yüz: korkmuş, düşünceli, gururlu, uykulu, utangaç, kararlı |
| A10 | `ela/eller.png` | K | E | 8 el pozu |
| A11 | `ela/agiz-goz-34.png` | K | E | 3/4 kafa için 9 ağız + göz durumları |
| A12 | `ela/agiz-yan.png` | K | E | yan kafa için 9 ağız |
| A13 | `ela/yuruyus-yan.png` | G 3:1 | E | yürüyüşün 4 anahtar pozu |
| A14 | `ela/kosu-yan.png` | G 3:1 | E | koşunun 4 anahtar pozu |
| A15 | `ela/poz-diz-cok.png` | K | E | halıda diz çökmüş, blok koyuyor (S3) |
| A16 | `ela/poz-parmak-ucu.png` | K | E | parmak ucunda uzanıyor (S5) |
| A17 | `ela/poz-dizleri-kucak.png` | K | E | dizlerini kucaklamış, ağlamaklı (S7) |
| A18 | `ela/poz-nefes-al.png` | K | E | balon nefesi alıyor (S9) |
| A19 | `ela/poz-nefes-ver.png` | K | E | nefes veriyor (S9) |
| A20 | `ela/poz-hadi.png` | K | E | imza: tek ayak zıplama, yumruk havada |
| A21 | `ela/poz-canta.png` | K | E | çantaya hazine koyuyor (S13) |
| A22 | `ela/poz-bagdas.png` | K | E | bağdaş kurmuş oturuyor (S13) |

**İstemler**
- **A1** · Full body character model sheet front view of I-ELA, standing relaxed, arms down at her sides, feet slightly apart, happy closed-mouth smile, looking at the viewer. + S-İNSAN
- **A2** · Upload A1. The same girl in a neutral A-pose for an animation rig: standing straight, front view, arms held slightly away from the body at about 30 degrees with open relaxed hands, legs slightly apart, mouth closed in a soft smile, eyes open looking forward. The backpack straps visible, the backpack peeking out on both sides. + I-ELA + S-KİLİT-İNSAN
- **A3** · Upload A1. Only the head of the same girl, very large, front view, including both hair puffs and the fringe, neutral soft smile with closed mouth, eyes open, no neck below the chin line. + I-ELA + S-KİLİT-İNSAN
- **A4** · Upload A2. The same girl taken apart into separate puppet pieces, front view: head without hair puffs, left hair puff, right hair puff, fringe, neck, torso with dress, the ladybug backpack alone, left upper arm, left forearm, left hand, right upper arm, right forearm, right hand, left thigh, left shin, left shoe, right thigh, right shin, right shoe. + S-PARÇA + S-SAYFA
- **A5** · Upload A3. Nine mouth shapes of the same girl for lip sync, drawn as mouths only (lips, teeth, tongue where needed, no face), front view, same size, in a 3 by 3 grid: 1 lips closed pressed together, 2 slightly open showing a little upper teeth, 3 wide smile-shaped open showing teeth for E and I, 4 big wide open mouth for A, 5 medium round open O, 6 small tight round puckered U, 7 lower lip tucked under the upper teeth for F and V, 8 slightly open with the tongue tip touching behind the upper teeth for L and N, 9 teeth closed together with lips stretched for S and Z. + S-SAYFA
- **A6** · Upload A3. Six expression mouths of the same girl, mouths only, front view, same size, in a 2 by 3 grid: big open laugh, sad downturned curve, wobbly crying mouth with lower lip pushed out, surprised small round O, angry clenched teeth, pouting pushed-out lips. + S-SAYFA
- **A7** · Upload A3. Eyes and eyebrows of the same girl, front view, same size, in a grid: a pair of open eyes; the same eyes with the white of the eye and the brown iris drawn as separate pieces; half-closed eyelids; closed eyes (curved lash lines); happy closed eyes like upside-down U shapes; huge surprised eyes; sad eyes with raised inner corners; angry eyes with lowered lids; teary eyes with shining water at the bottom. Then five pairs of eyebrows: neutral, raised, worried, angry, one raised. + S-SAYFA
- **A8** · Upload A3. Six head-and-shoulders expressions of the same girl, front view: happy smile, big laugh with eyes closed, surprised with round mouth, sad with downturned mouth, crying with tears and wobbly mouth, angry with lowered brows and puffed cheeks. + I-ELA + S-KİLİT-İNSAN + S-SAYFA
- **A9** · Upload A3. Six head-and-shoulders expressions of the same girl, front view: scared with big eyes and small mouth, thinking with eyes looking up and a finger on her chin, proud with chin up and closed eyes smiling, sleepy yawning, shy with blushing cheeks and a small smile, determined with a confident grin. + I-ELA + S-KİLİT-İNSAN + S-SAYFA
- **A10** · Upload A1. Eight hand poses of the same girl's right hand with a bit of the yellow sleeve edge, same size: open flat palm facing forward, relaxed hand, fist, pointing index finger, hand curved in a C shape holding nothing (to hold a block), waving hand, thumbs up, two fingers pinching. + S-SAYFA
- **A11** · Upload T5 (Ela's 3/4 head) and A5. The nine mouth shapes of A5 redrawn for this three-quarter view head, plus open, half-closed, closed and happy-closed eyes for the three-quarter view, mouths and eyes only, same size, grid. + S-SAYFA
- **A12** · Upload T4 (Ela's side head) and A5. The nine mouth shapes of A5 redrawn in pure side view facing right, mouths only, same size, 3 by 3 grid. + S-SAYFA
- **A13** · Upload T1 (Ela side view) and A1. The same girl walking in side view facing right, four key poses of a cheerful walk cycle in a row: contact (heel down, legs apart), down (knee bent, body lowest), passing (one leg passing the other), up (on the toes, body highest); arms swing opposite to the legs; hair puffs and backpack bounce slightly. + I-ELA + S-KİLİT-İNSAN + S-SAYFA
- **A14** · Upload T1 and A1. The same girl running in side view facing right, four key poses of a bouncy run cycle in a row: contact, push-off, both feet in the air, landing. Arms bent swinging, hair puffs flying back. + I-ELA + S-KİLİT-İNSAN + S-SAYFA
- **A15** · Upload A1. The same girl kneeling on the floor in three-quarter view facing right, sitting on her heels, reaching both hands forward at chest height as if placing a toy block on a tower, tongue slightly out in concentration. + I-ELA + S-KİLİT-İNSAN
- **A16** · Upload A1. The same girl standing on tiptoes in three-quarter view facing right, stretching both arms high up above her head as if placing a block on top of a tall tower, tongue out, hair puffs bouncing. + I-ELA + S-KİLİT-İNSAN
- **A17** · Upload A1. The same girl sitting on the floor hugging her knees, front view, chin on her knees, lower lip trembling, teary eyes, sad but cute. + I-ELA + S-KİLİT-İNSAN
- **A18** · Upload A1. The same girl taking a big slow breath in, front view, both hands on her round puffed-up belly, cheeks puffed, eyes closed, shoulders slightly raised. + I-ELA + S-KİLİT-İNSAN
- **A19** · Upload A1. The same girl slowly blowing the breath out, front view, lips in a small round O, eyes half-closed and calm, shoulders relaxed, hands on her belly. + I-ELA + S-KİLİT-İNSAN
- **A20** · Upload A1. The same girl's signature happy pose: hopping on one foot, one fist punched up in the air, big open smile, eyes closed happily, hair puffs flying, front three-quarter view. + I-ELA + S-KİLİT-İNSAN
- **A21** · Upload A1. The same girl holding her ladybug backpack in front of her chest with the top open, putting a tiny red flag inside with one hand, looking down at it with a proud smile, front three-quarter view. + I-ELA + S-KİLİT-İNSAN
- **A22** · Upload A1. The same girl sitting cross-legged on the floor, front view, hands resting on her knees, happy calm smile. + I-ELA + S-KİLİT-İNSAN

## B. Efe kiti · 25 görsel (öncelik 1, A ile birlikte)

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| B1 | `efe/model.png` | K | E | **Model sayfası, kimlik kaynağı. Barış onayı burada.** |
| B2 | `efe/a-poz-on.png` | K | E | Rig + Turntable girdisi |
| B3 | `efe/kafa-on.png` | K | E | Yakın plan kafası |
| B4 | `efe/parca-on.png` | K | E | Parçalar |
| B5 | `efe/agiz-on.png` | K | E | 9 ağız |
| B6 | `efe/agiz-ifade-on.png` | K | E | 6 ifade ağzı |
| B7 | `efe/goz-kas-on.png` | K | E | göz + iris + kaş |
| B8 | `efe/ifade-1.png` | K | E | 6 yüz (A8 ile aynı liste) |
| B9 | `efe/ifade-2.png` | K | E | 6 yüz (A9 ile aynı liste) |
| B10 | `efe/eller.png` | K | E | 8 el pozu |
| B11 | `efe/agiz-goz-34.png` | K | E | 3/4 ağız + göz |
| B12 | `efe/agiz-yan.png` | K | E | yan ağız |
| B13 | `efe/yuruyus-yan.png` | G 3:1 | E | yürüyüş 4 poz |
| B14 | `efe/kosu-yan.png` | G 3:1 | E | koşu 4 poz |
| B15 | `efe/poz-diz-cok.png` | K | E | diz çökmüş, blok koyuyor (S3) |
| B16 | `efe/poz-emekle.png` | K | E | emekliyor (S5) |
| B17 | `efe/poz-yuzustu-uzan.png` | K | E | yüzüstü yatağın altına uzanıyor (S5) |
| B18 | `efe/poz-tepin.png` | K | E | kızgın tepiniyor (S7) |
| B19 | `efe/poz-kollar-bagli.png` | K | E | kollar bağlı küsmüş (S8) |
| B20 | `efe/poz-nefes-al.png` | K | E | nefes al (S9) |
| B21 | `efe/poz-nefes-ver.png` | K | E | nefes ver (S9) |
| B22 | `efe/poz-bir-bakayim.png` | K | E | imza: çömelmiş, eller dizlerde |
| B23 | `efe/poz-sevinc.png` | K | E | iki yumruk "yes!" sevinci |
| B24 | `efe/poz-cek.png` | K | E | ağır kutuyu çekiyor (S2) |
| B25 | `efe/poz-bagdas.png` | K | E | bağdaş (S13) |

**İstemler** (B2-B14 ve B20-B21, B25: A'daki istemin aynısı; "girl" yerine "boy", I-ELA yerine I-EFE, A1/A3/T… yerine B1/B3/T…; saç topuzu yerine "beanie with bear ears and the forehead curl". Farklı olanlar aşağıda.)
- **B1** · Full body character model sheet front view of I-EFE, standing relaxed, arms down at his sides, feet slightly apart, shy happy closed-mouth smile, looking at the viewer. + S-İNSAN
- **B4** · Upload B2. The same boy taken apart into separate puppet pieces, front view: head without the beanie, the beanie body, left bear ear, right bear ear, the forehead curl, neck, torso with t-shirt, shorts (hips), left upper arm, left forearm, left hand, right upper arm, right forearm, right hand, left thigh with sock, left shin, left sneaker, right thigh, right shin, right sneaker. + S-PARÇA + S-SAYFA
- **B15** · Upload B1. The same boy kneeling on the floor in three-quarter view facing left, holding a toy block carefully with both hands at chest height, tongue out in concentration, eyes focused. + I-EFE + S-KİLİT-İNSAN
- **B16** · Upload B1 and T6 (Efe side view). The same boy crawling on hands and knees in side view facing right, head up looking forward, bear ears flopping forward. + I-EFE + S-KİLİT-İNSAN
- **B17** · Upload B1 and T6. The same boy lying flat on his belly in side view facing right, one arm stretched far forward reaching for something, legs straight behind him with feet slightly up. + I-EFE + S-KİLİT-İNSAN
- **B18** · Upload B1. The same boy angry but cute, front view: stamping one foot, both fists down at his sides, eyebrows pulled down, red cheeks, mouth shouting with clenched teeth, bear ears pointing up stiffly. + I-EFE + S-KİLİT-İNSAN
- **B19** · Upload B1. The same boy sulking, front three-quarter view: arms crossed tightly over his chest, chin down, bottom lip pushed out, eyebrows lowered, looking to the side. + I-EFE + S-KİLİT-İNSAN
- **B22** · Upload B1. The same boy's signature curious pose: crouching low with both hands on his knees, leaning forward, one eye squinted, looking closely at something on the floor, bear ears tilted forward, front three-quarter view. + I-EFE + S-KİLİT-İNSAN
- **B23** · Upload B1. The same boy happy and proud, front view: both small fists pulled down in a cheerful "yes!" gesture, big open smile, eyes closed happily, one knee lifted. + I-EFE + S-KİLİT-İNSAN
- **B24** · Upload B1 and T6. The same boy in side view facing left, leaning far back and pulling with both hands as if dragging something very heavy (draw nothing in his hands), feet sliding, tongue out with effort, cheeks puffed. + I-EFE + S-KİLİT-İNSAN

## T. Turntable (tasarımcı oturumu, Illustrator) · 16 üretim

Girdi A2 ya da B2'nin (A-pozu) beyaz zeminli PNG'si → `vektorlestir-maske.jsx` (`[16 Colors]`, parça sayısı < 400) → Turntable.
Kafa üretimleri için girdi A3/B3. Açılar: yan 90°, 3/4 45°, arka 180°. Kayıt: `ekip/turntable/<ad>/`.

| # | Girdi | Açı | Çıktı |
|---|---|---|---|
| T1-T3 | A2 | yan, 3/4, arka | `ela/yan`, `ela/uc-ceyrek`, `ela/arka` |
| T4-T5 | A3 | yan, 3/4 | `ela/kafa-yan`, `ela/kafa-uc-ceyrek` |
| T6-T8 | B2 | yan, 3/4, arka | `efe/yan`, `efe/uc-ceyrek`, `efe/arka` |
| T9-T10 | B3 | yan, 3/4 | `efe/kafa-yan`, `efe/kafa-uc-ceyrek` |
| T11-T12 | C2 | yan, 3/4 | `nil/yan`, `nil/uc-ceyrek` |
| T13-T14 | C9 | yan, 3/4 | `anne/yan`, `anne/uc-ceyrek` |
| T15-T16 | C16 | yan, 3/4 | `baba/yan`, `baba/uc-ceyrek` |

- Yüz bozulursa yalnız yüz Gemini'de onarılır: Turntable PNG'si + A3/B3 yüklenir, "fix only the face to match the reference, keep the body and angle". + S-KİLİT-İNSAN
- Gövde Turntable'dan kalır.

## R. Recraft (yalnız parçalara ayırma) · 2 görsel

| # | Girdi | İşlem | Neden |
|---|---|---|---|
| R1 | A2 (Ela A-pozu) | `vectorize_image` (~1 kredi) | Illustrator izi topuzu kafayla, kolu gövdeyle kaynatırsa: renk bölgeleri ayrı SVG gruplarına düşer, Adobe parçaları bunlardan ayırır |
| R2 | B2 (Efe A-pozu) | `vectorize_image` (~1 kredi) | aynı (bere kulakları, kollar) |

- Önce Illustrator izi denenir. R yalnız iz yetmezse kullanılır.
- Başka hiçbir görsel Recraft'a gitmez. Aile kitleri A4/B4 gibi Gemini parça sayfasıyla çözülür.

## C. Aile ve Tosbi · 23 görsel (öncelik 2)

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| C1 | `nil/model.png` | K | E | Nil model sayfası |
| C2 | `nil/a-poz-on.png` | K | E | rig + Turntable |
| C3 | `nil/agiz-goz.png` | K | E | 6 ağız (kapalı, az, a, o, u, gülüş) + göz durumları |
| C4 | `nil/ifade.png` | K | E | 4 yüz: ağlıyor, kahkaha, "daha!" heyecanı, şaşkın |
| C5 | `nil/yuruyus-yan.png` | G 2:1 | E | paytak yürüyüş 2 anahtar poz |
| C6 | `nil/poz-it.png` | K | E | kuleyi itiyor (S6) |
| C7 | `nil/poz-otur.png` | K | E | yerde oturuyor, bacaklar ileride (S11, S13) |
| C8 | `anne/model.png` | K | E | Anne model sayfası |
| C9 | `anne/a-poz-on.png` | K | E | rig + Turntable |
| C10 | `anne/agiz-goz.png` | K | E | 9 ağız + göz durumları |
| C11 | `anne/ifade.png` | K | E | 4 yüz: sıcak gülümseme, şefkatli dinleme, gülme, şaşkın |
| C12 | `anne/poz-diz-cok.png` | K | E | yerde dizleri üstünde oturuyor (S8) |
| C13 | `anne/poz-nil-kucak.png` | K | E | Nil'i kucakta tutuyor (iki karakter tek çizim) |
| C14 | `anne/poz-nefes.png` | K | E | eli karnında nefes gösteriyor (S9) |
| C15 | `baba/model.png` | K | E | Baba model sayfası |
| C16 | `baba/a-poz-on.png` | K | E | rig + Turntable |
| C17 | `baba/agiz-goz.png` | K | E | 9 ağız + göz durumları |
| C18 | `baba/poz-sasir.png` | K | E | abartılı şaşkın, eller yanakta (S12) |
| C19 | `baba/poz-kapi.png` | K | E | elinde fincan, kapıya yaslanmış (S2) |
| C20 | `tosbi/model-34.png` | K | E | Tosbi 3/4 önden |
| C21 | `tosbi/parca-yan.png` | K | E | yandan parçalar: kabuk, kafa+boyun, 4 bacak, kuyruk |
| C22 | `tosbi/kabukta.png` | K | E | kafası ve bacakları içeride |
| C23 | `tosbi/goz-agiz.png` | K | E | göz açık, kapalı + ağız: kapalı, açık (ısırma), çiğneme |

**İstemler**
- **C1** · Full body character model sheet front view of I-NİL, standing with her round belly forward, arms slightly out for balance, big happy open smile. + S-İNSAN
- **C2** · Upload C1. Same toddler in a neutral A-pose for an animation rig, front view, arms slightly away from the body, legs apart, closed-mouth smile. + I-NİL + S-KİLİT-İNSAN
- **C3** · Upload C1. Six mouth shapes (closed, slightly open, wide open A, round O, small puckered U, big laugh) and eye states (open, half, closed, happy closed, teary) of the same toddler, mouths and eyes only, same size, grid. + S-SAYFA
- **C4** · Upload C1. Four head-and-shoulders expressions of the same toddler: crying with a wide wobbly mouth and tears, big laugh with eyes closed, excited with both hands open and mouth in an O, surprised. + I-NİL + S-KİLİT-İNSAN + S-SAYFA
- **C5** · Upload C1 and T11. Same toddler waddling in side view facing right, two key poses of a wobbly toddler walk (body leaning left, body leaning right), arms out for balance. + I-NİL + S-KİLİT-İNSAN + S-SAYFA
- **C6** · Upload C1. Same toddler in three-quarter view facing right, pushing forward with both open hands at shoulder height, tiptoes, mischievous delighted grin. + I-NİL + S-KİLİT-İNSAN
- **C7** · Upload C1. Same toddler sitting on the floor with legs straight out in front, hands clapping, happy, front view. + I-NİL + S-KİLİT-İNSAN
- **C8** · Full body character model sheet front view of I-ANNE, standing relaxed, warm smile, looking at the viewer. Upload A1 and B1 as style references: same art style and same family look (same eye style, same skin tone). + S-İNSAN
- **C9** · Upload C8. Same mother in a neutral A-pose for an animation rig, front view. + I-ANNE + S-KİLİT-İNSAN
- **C10** · Upload C8. Nine mouth shapes in the same list as A5 and eye states (open, half, closed, happy closed) for this mother, mouths and eyes only, same size, grid. + S-SAYFA
- **C11** · Upload C8. Four head-and-shoulders expressions of the same mother: warm smile, tender listening face with head tilted, laughing, surprised. + I-ANNE + S-KİLİT-İNSAN + S-SAYFA
- **C12** · Upload C8. Same mother kneeling on the floor sitting back on her heels, front three-quarter view, hands resting on her knees, warm caring face. + I-ANNE + S-KİLİT-İNSAN
- **C13** · Upload C8 and C1. The mother standing and holding the toddler Nil on her hip with one arm, the toddler's cheek resting on her shoulder, both calm and smiling, front three-quarter view. + S-KİLİT-İNSAN
- **C14** · Upload C8. Same mother kneeling, one hand on her belly, taking a big calm breath in with cheeks slightly puffed and eyes closed, front view. + I-ANNE + S-KİLİT-İNSAN
- **C15** · Full body character model sheet front view of I-BABA, standing relaxed, big smile. Upload A1 and B1 as style references. + S-İNSAN
- **C16** · Upload C15. Same father in a neutral A-pose for an animation rig, front view. + I-BABA + S-KİLİT-İNSAN
- **C17** · Upload C15. Nine mouth shapes in the same list as A5 and eye states for this father (the beard stays around the mouth), mouths and eyes only, grid. + S-SAYFA
- **C18** · Upload C15. Same father pretending to be very shocked, front view: both hands on his cheeks, mouth a big round O, eyebrows high, leaning back a little. + I-BABA + S-KİLİT-İNSAN
- **C19** · Upload C15. Same father leaning with one shoulder on a door frame (no door drawn), holding a small coffee cup in one hand, relaxed playful smile, three-quarter view facing left. + I-BABA + S-KİLİT-İNSAN
- **C20** · I-TOSBİ, three-quarter front view, standing, head out, looking up curiously. + S-NESNE
- **C21** · Upload C20. The same tortoise in side view facing right taken apart into separate puppet pieces: shell, head with neck, front left leg, front right leg, back left leg, back right leg, tail. + S-PARÇA + S-SAYFA
- **C22** · Upload C20. The same tortoise with head, legs and tail pulled inside the shell, only two shy eyes peeking out from the front opening, three-quarter front view. + S-NESNE
- **C23** · Upload C20. The same tortoise's eyes and mouths only, side view: eye open, eye closed, mouth closed smile, mouth open biting, mouth chewing with cheeks full. + S-SAYFA

## D. Bölüm 1 mekânları ve eşyaları · 23 görsel (öncelik 3)

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| D1 | `bolum-01/apartman-kompozisyon.png` | Y | H | dış çekim referansı ve yedek tek katman |
| D2 | `bolum-01/apartman-uzak.png` | Y | H | gök, deniz, uzak çatılar (z -60) |
| D3 | `bolum-01/apartman-bina.png` | K | E | bina ve balkon (z -8) |
| D4 | `bolum-01/apartman-on-dal.png` | G 2:1 | E | ön plan begonvil dalları (z +4) |
| D5 | `bolum-01/oda-kompozisyon.png` | Y | H | odanın renk ve yerleşim referansı |
| D6 | `bolum-01/oda-bos.png` | Y | H | mobilyasız oda: duvar, pencere, kapı, parke (z -25) |
| D7 | `bolum-01/oda-pencere-gok.png` | Y | H | pencereden görünen gök ve çatılar (z -60) |
| D8 | `bolum-01/oda-raf.png` | G 2:1 | E | raf + kitaplık (z -8) |
| D9 | `bolum-01/oda-yataklar.png` | G 2:1 | E | iki yatak (Adobe yatak ön kenarını ayrı katman keser) |
| D10 | `bolum-01/oda-hali.png` | G 2:1 | E | yuvarlak halı |
| D11 | `bolum-01/oda-masa.png` | K | E | alçak oyun masası |
| D12 | `bolum-01/oda-on-sandik.png` | G 2:1 | E | ön plan oyuncak sandığı + saksı (z +4) |
| D13 | `esya/kup-turuncu.png` | K | E | 5. renk blok (mevcut kup setiyle aynı) |
| D14 | `esya/kule-catisi.png` | K | E | kırmızı üçgen çatı bloğu + bayrak |
| D15 | `esya/blok-kutusu.png` | K | E | tahta blok kutusu (kapak ayrı) |
| D16 | `esya/ofke-bulutu.png` | K | E | sevimli fırtına bulutu |
| D17 | `esya/bulut-kucuk.png` | K | E | küçülmüş beyaz bulut |
| D18 | `esya/tosbi-sepet.png` | K | E | Tosbi'nin sepeti |
| D19 | `esya/marul.png` | K | E | marul yaprağı |
| D20 | `esya/pelus-mino.png` | K | E | peluş Mino |
| D21 | `esya/pelus-kino.png` | K | E | peluş Kino |
| D22 | `esya/bayrak.png` | K | E | minik kırmızı bayrak (hazine; çatıdan ayrı) |
| D23 | `esya/kahve-fincani.png` | K | E | Baba'nın fincanı |

**İstemler**
- **D1** · Empty background scene for a premium preschool picture book: a sunny morning in a small Aegean seaside town, a cheerful four-storey apartment building painted warm peach with white balconies in the middle, the third-floor balcony full of flower pots and a small basket, red tiled roofs and a calm blue sea behind, a few soft clouds, pink bougainvillea branches framing the top left corner. + S-ARKA
- **D2** · Upload D1. The same view with the apartment building and the bougainvillea removed: only the sky with soft clouds, the calm blue sea and the distant red tiled roofs, complete and continuous across the whole image. + S-ARKA
- **D3** · Upload D1. Only the same warm peach apartment building with white balconies and the flower-filled third-floor balcony, drawn alone and complete, front view. + S-KATMAN + S-NESNE
- **D4** · Upload D1. Only the pink bougainvillea branches with green leaves, a long hanging cluster, drawn alone and complete. + S-KATMAN + S-NESNE
- **D5** · Empty background scene for a premium preschool picture book: a cosy shared bedroom of two 4-year-old twins seen at a child's eye level, cream walls, a big window with a sunny sky and red roofs, a white door on the left, honey-colored wooden floor, two small beds side by side at the back (one with a yellow blanket, one with a sky-blue blanket), a low toy shelf and bookcase, a round soft green rug in the middle, a low round play table on the right, a toy chest and a potted plant in the near foreground corner. The rug in the middle is open empty space. + S-ARKA
- **D6** · Upload D5. The same bedroom completely empty of furniture: only the cream walls, the big window, the white door and the honey-colored wooden floor, complete and continuous. + S-ARKA
- **D7** · Upload D5. Only the view through the window: a sunny blue sky with soft clouds and red tiled roofs, complete, filling the whole image. + S-ARKA
- **D8** · Upload D5. Only the low toy shelf and the small bookcase from this bedroom with a few colorful books and toys, two empty spots on the top shelf, front view. + S-KATMAN + S-NESNE
- **D9** · Upload D5. Only the two small beds side by side, one with a sunflower-yellow blanket, one with a sky-blue blanket, white pillows, a dark open gap under each bed, front view. + S-KATMAN + S-NESNE
- **D10** · Upload D5. Only the round soft green rug lying flat on the floor, seen from a low angle as a wide ellipse. + S-KATMAN + S-NESNE
- **D11** · Upload D5. Only the low round wooden play table for small children, front view, table top at the height of a 4-year-old's waist. + S-KATMAN + S-NESNE
- **D12** · Upload D5. Only the near foreground pieces: a wooden toy chest with a rounded lid and a potted green plant beside it, front view, wide. + S-KATMAN + S-NESNE
- **D13** · Upload `assets/film/esya/kup-kirmizi.webp` as style reference. A single wooden toy cube block in the same style, orange, with a simple painted white square on the front face. + S-NESNE
- **D14** · Upload `assets/film/esya/kup-kirmizi.webp`. A single wooden toy roof block, red triangle prism, same size as the cube, with a tiny red triangle flag on a thin stick on top. + S-NESNE
- **D15** · A single wooden toy box for building blocks, honey wood with rounded corners, the lid drawn separately beside it, front view. + S-NESNE
- **D16** · A single cute small grumpy storm cloud for a children's picture book, dark grey puffy round cloud with a tiny yellow zigzag lightning below it, soft and funny, not scary, no face. + S-NESNE
- **D17** · A single small fluffy white cloud, soft and round, with two tiny sparkles. + S-NESNE
- **D18** · A single small round wicker basket for a pet tortoise lined with a soft green cloth, front view, slightly from above. + S-NESNE
- **D19** · A single fresh green lettuce leaf, ruffled edge. + S-NESNE
- **D20** · Upload Mino (`karakter-kaynak/mino-yeni.svg` as PNG). A soft plush toy version of this kitten, sitting, with simple stitched seams and button-like shiny eyes, same colors and red neckerchief, cuddly toy proportions. + S-NESNE
- **D21** · Upload Kino (`assets/giysin/kart-kino.webp`). A soft plush toy version of this puppy, sitting, with simple stitched seams and button-like shiny eyes, same colors, cuddly toy proportions. + S-NESNE
- **D22** · A single tiny red triangle flag on a thin wooden stick. + S-NESNE
- **D23** · A single small coffee cup on a saucer, white with a thin mustard-yellow stripe, soft steam. + S-NESNE

## E. Kapak ve açılış · 2 görsel (öncelik 4)

| # | Dosya | Boyut | Şeffaf | Ne için |
|---|---|---|---|---|
| E1 | `kapak/ela-ile-efe.png` | 4:3, ≥ 2732×2048 | H | katalog kapağı |
| E2 | `bolum-01/acilis-gok.png` | Y | H | seri açılışının gök zemini (logo Blender'da) |

- **E1** · Upload A1, B1, C1 and C20. A cheerful picture book cover scene: the twins Ela and Efe proudly standing next to a tall colorful tower of wooden blocks with a red roof, Ela with one fist in the air, Efe pointing at the top, little sister Nil sitting on the rug clapping, the tortoise Tosbi peeking in at the bottom corner, cosy sunny bedroom. Characters big and clear, faces fully visible. Premium glossy 2D cartoon, Disney Junior style, thick dark brown outlines, no text.
- **E2** · Empty background for a children's show opening title: a soft sky-blue sky with big round fluffy white clouds and a gentle sunny glow, the center left completely open. + S-ARKA

---

## Sıra özeti
1. **A1 + B1** (tek örnek, yan yana) → Barış'a gösterilir: **"Bunlar şirin mi?"** Onay olmadan devam yok. Gerekirse 2-3 deneme.
2. **A2, A3, B2, B3** → **T1-T10** Turntable (+ gerekirse R1-R2).
3. **A4-A14, B4-B14** (ağız, göz, el, yürüyüş): rig bunlarla kurulur, ardından 12 sn pilot (URETIM-YOLU §4).
4. **C** (aile, Tosbi) + **T11-T16**.
5. **A15-A22, B15-B25** (Bölüm 1 pozları), **D**, **E**.
