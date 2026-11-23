# ONERI-08: 2000 TL Premium İçerik Paketi (Doğrudan Üretime Hazır)

Gönderen: Antigravity (Neon 4.0) · Tarih: 2026-11-20 · Kime: Yönetici (Claude) & Barış.  
*Amaç: Barış'ın 20 Kasım 20:45 "içeriği doldur, yıllık 2000 TL'ye ürün satıyoruz" talimatına karşılık, mevcut kod ve yol haritalarındaki boşlukları kapatacak **kopyala-yapıştır üretime hazır** içerik, senaryo, şarkı promptu ve veli metinleri paketidir. Hiçbir kod dosyasına dokunulmamıştır.*

---

## 0. İki Acil Kalite / Çakışma Notu (Kod Taramasından)

1. **`ingilizce/src/icerik.ts` satır 69 — `pig` (domuz):** Barış 20 Kasım'da domuz istemediğini belirtip `piglet`'i çıkardı (`CLAUDE-ASTRA-MESAJLAR.md` satır 2377), ancak 1. adanın (`ciftlik`) 8. kelimesi hâlâ `pig`. **[Öneri]** Barış'a sorup `goat` (keçi — P15-H1'de çizimi zaten onaylı) ya da `rabbit` ile değiştirilsin.
2. **İngilizce paket numarası:** `ekip/ingilizce/YOL-HARITASI.md` #4'te Ağaç Evi hâlâ "Paket 15" yazıyor; P15–P23 doldu, yeni brief **Paket 24** olmalı.

---

## 1. İNGİLİZCE · "Büyükler için: Evde 3 İngilizce Cümle" (24 Ada × 3 = 72 Hazır Cümle)

*Yol haritası #6 — Çizim: **YOK**, Ses: **YOK**, ayrı oturum doğrudan koda bağlayabilir. Her cümle birebir o adanın `icerik.ts` / `icerik3.ts` kelimelerini kullanır.*

| # | Ada (`id`) | Evde 1. cümle | Evde 2. cümle | Evde 3. cümle |
|---|---|---|---|---|
| 1 | `ciftlik` | **Look, a cow!** *(Bak, bir inek!)* | **Where is the duck?** *(Ördek nerede?)* | **Is it a sheep?** *(Bu bir koyun mu?)* |
| 2 | `renkler` | **Show me red!** *(Bana kırmızıyı göster!)* | **I see blue!** *(Mavi görüyorum!)* | **Is it yellow or green?** *(Sarı mı yeşil mi?)* |
| 3 | `sayilar` | **Count with me: one, two, three!** *(Benimle say: bir, iki, üç!)* | **Give me two, please.** *(Bana iki tane ver lütfen.)* | **How many? Five!** *(Kaç tane? Beş!)* |
| 4 | `yiyecekler` | **Do you like apples?** *(Elma sever misin?)* | **Drink your milk, please.** *(Sütünü iç lütfen.)* | **Water, please!** *(Su lütfen!)* |
| 5 | `oyuncaklar` | **Where is your ball?** *(Topun nerede?)* | **Hug your teddy bear!** *(Oyuncak ayına sarıl!)* | **Let's play with the puzzle.** *(Yapbozla oynayalım.)* |
| 6 | `ailem` | **Here is Mom!** *(İşte anne!)* | **Say hello to Dad!** *(Babaya merhaba de!)* | **I love my family.** *(Ailemi seviyorum.)* |
| 7 | `yuzum` | **Touch your nose!** *(Burnuna dokun!)* | **Clap your hands!** *(Ellerini çırp!)* | **Where are your ears?** *(Kulakların nerede?)* |
| 8 | `kiyafetler` | **Put on your shoes!** *(Ayakkabılarını giy!)* | **Where is your hat?** *(Şapkan nerede?)* | **Put on your jacket.** *(Ceketini giy.)* |
| 9 | `odam` | **Open the door, please.** *(Kapıyı aç lütfen.)* | **Look out the window!** *(Pencereden bak!)* | **Turn off the lamp. Good night!** *(Lambayı kapat. İyi geceler!)* |
| 10 | `tasitlar` | **Look! A big bus!** *(Bak! Büyük bir otobüs!)* | **I see a red car.** *(Kırmızı bir araba görüyorum.)* | **Look up! A plane!** *(Yukarı bak! Bir uçak!)* |
| 11 | `hareketler` | **Jump, jump, jump!** *(Zıpla, zıpla, zıpla!)* | **Let's dance together!** *(Birlikte dans edelim!)* | **Time to sleep!** *(Uyku zamanı!)* |
| 12 | `vahsi` | **Roar like a lion!** *(Aslan gibi kükre!)* | **Look, a little bird!** *(Bak, küçük bir kuş!)* | **Jump like a frog!** *(Kurbağa gibi zıpla!)* |
| 13 | `meyve` | **The lemon is yellow.** *(Limon sarı.)* | **Can I have a carrot?** *(Bir havuç alabilir miyim?)* | **I like watermelon!** *(Karpuz severim!)* |
| 14 | `hava` | **Look outside! It's sunny.** *(Dışarı bak! Hava güneşli.)* | **It's cold today!** *(Bugün hava soğuk!)* | **Look! A rainbow!** *(Bak! Gökkuşağı!)* |
| 15 | `doga` | **Look at the big tree!** *(Büyük ağaca bak!)* | **Smell the flower!** *(Çiçeği kokla!)* | **Good night, moon and stars!** *(İyi geceler ay ve yıldızlar!)* |
| 16 | `evim` | **Come to the kitchen!** *(Mutfağa gel!)* | **Let's go to the garden.** *(Bahçeye çıkalım.)* | **Where is the key?** *(Anahtar nerede?)* |
| 17 | `okul` | **Open your book!** *(Kitabını aç!)* | **Where is your bag?** *(Çantan nerede?)* | **Let's draw with a crayon.** *(Boya kalemiyle çizelim.)* |
| 18 | `duygular` | **How do you feel? Happy?** *(Nasıl hissediyorsun? Mutlu mu?)* | **Are you hungry?** *(Aç mısın?)* | **Are you sleepy?** *(Uykun mu geldi?)* |
| 19 | `sekiller` | **Is it big or small?** *(Büyük mü küçük mü?)* | **Find a circle!** *(Bir daire bul!)* | **Which one is long?** *(Hangisi uzun?)* |
| 20 | `sofra` | **Here is your spoon.** *(İşte kaşığın.)* | **Put the plate on the table.** *(Tabağı masaya koy.)* | **Yummy soup!** *(Nefis çorba!)* |
| 21 | `park` | **Let's go on the slide!** *(Kaydıraktan kayalım!)* | **Push me on the swing!** *(Beni salıncakta salla!)* | **Bring your bucket and shovel.** *(Kovanı ve küreğini getir.)* |
| 22 | `vucudum` | **Shake your arms!** *(Kollarını salla!)* | **Touch your knees and toes!** *(Dizlerine ve ayak parmaklarına dokun!)* | **Brush your hair.** *(Saçını tara.)* |
| 23 | `gunum` | **Good morning! Wake up!** *(Günaydın! Uyan!)* | **Wash your face and brush your teeth.** *(Yüzünü yıka ve dişlerini fırçala.)* | **Give me a big hug!** *(Bana kocaman sarıl!)* |
| 24 | `sayilar2` | **Count to twelve!** *(On ikiye kadar say!)* | **Show me something white.** *(Bana beyaz bir şey göster.)* | **Look, a gold star!** *(Bak, altın bir yıldız!)* |

---

## 2. İNGİLİZCE · "Polly'nin Yaşayan Ağaç Evi" (Yol Haritası #4 · Paket 24 Tasarımı)

**Temel fikir:** Statik süs odası değil, her adadan kazanılan eşyanın **dokununca 2 durum arasında değişip kısa bir İngilizce eylem cümlesi oynattığı** oyuncak ev. Günde 1 kez Polly küçük bir istek söyler (*"I'm sleepy! Turn off the lamp."*), çocuk dokununca yıldız alır — bağımlılık kurmayan günlük geri dönüş motoru.

**Çizim yapısı (Paket 24):** 1 fon (`agac-evi.webp`, 1920 × 1080, raf + pencere + halı + duvar noktaları sabit koordinatlı) + 24 eşya (önce 1–12. adaların ilk 12'si; iki durumlu olanlar aynı tuvalde `esya-0` / `esya-1`).

| Ada | Eşya (`id`) | 0 → 1 Dokunma tepkisi | Polly'nin sözü (tek kısa kayıt) |
|---|---|---|---|
| 1 Çiftlik | `toy-barn` (oyuncak ahır) | Kapı kapalı → açılır, minik inek kafası çıkar | *"Open the barn! Moo!"* |
| 2 Renkler | `rainbow-rug` (gökkuşağı halı) | Halı parlar, renk şeritleri dalgalanır | *"Look! Red, blue, yellow!"* |
| 3 Sayılar | `block-tower` (sayı blokları) | 1-2-3-4-5 blokları zıplar | *"One, two, three, four, five!"* |
| 4 Yiyecekler | `fruit-basket` (meyve sepeti) | Elma ve armut zıplar (çilek yok!) | *"Yummy! An apple and a pear!"* |
| 5 Oyuncaklar | `toy-drum` (davul) | Tokmak vurur, nota çıkar | *"Play the drum! Boom, boom!"* |
| 6 Ailem | `family-photo` (aile çerçevesi) | Çerçeve parlar, kalp çıkar | *"I love my family!"* |
| 7 Yüzüm | `wall-mirror` (duvar aynası) | Aynada Polly göz kırpar | *"Look in the mirror! Touch your nose!"* |
| 8 Kıyafetler | `hat-rack` (şapka askısı) | Polly'nin şapkası havalanıp konar | *"Put on the hat!"* |
| 9 Odam | `night-lamp` (gece lambası) | Oda aydınlanır ↔ kararır | *"Turn off the light! Good night!"* / *"Turn on the light!"* |
| 10 Taşıtlar | `toy-train` (oyuncak tren) | Rafta ileri gider, düdük çalar | *"Choo choo! Look at the train!"* |
| 11 Hareketler | `music-box` (müzik kutusu) | Kapak açılır, Polly dans eder | *"Let's dance and clap!"* |
| 12 Vahşi | `fish-bowl` (balık fanusu) | Balık takla atar, baloncuk çıkar | *"Look! The fish can swim!"* |
| 13 Meyve | `salad-bowl` (salata kâsesi) | Havuç ve domates zıplar | *"Let's make a big salad!"* |
| 14 Hava | `tree-window` (ağaç penceresi) | Perde açılır: güneş ↔ yağmur ↔ gökkuşağı | *"Open the window! It's sunny!"* |
| 15 Doğa | `flower-pot` (çiçek saksısı) | Tomurcuk açılıp kırmızı çiçek olur | *"Water the flower! It grows!"* |
| 16 Evim | `door-bell` (kapı zili) | Zil çalar, Kino kapıdan el sallar | *"Ring the bell! Hello, Kino!"* |
| 17 Okul | `crayon-cup` (boya kutusu) | Kalemler zıplar, kâğıtta yıldız çizilir | *"Let's draw with crayons!"* |
| 18 Duygular | `soft-pillow` (yumuşak yastık) | Polly üstüne konup esner / gülümser | *"I am happy and cozy!"* |
| 19 Şekiller | `shape-mobile` (şekil dönencesi) | Daire, kare, üçgen, kalp döner | *"Circle, square, triangle, heart!"* |
| 20 Sofra | `tea-cup` (sıcak fincan) | Buhar çıkar, kaşık şıngırdar | *"A warm cup! Thank you!"* |
| 21 Park | `rope-swing` (iç salıncak) | Salıncak sallanır, Polly *"Wheee!"* der | *"Swing up high! Wheee!"* |
| 22 Vücudum | `dance-mat` (dans halısı) | Ayak izleri yanar | *"Shake your arms and jump!"* |
| 23 Günüm | `wall-clock` (duvar saati) | Akrep döner: sabah ↔ gece | *"Wake up! Good morning!"* |
| 24 Sayılar 2 | `gold-star` (altın yıldız feneri) | Tavandan yıldız ışığı saçılır | *"Look! A gold star!"* |

---

## 3. İNGİLİZCE · "Polly'nin Şarkıları" (10 Adaya Telifsiz Şarkı + Hazır Gemini Promptları)

**Ortak stil kuralı (tüm şarkılar için):** 65–75 sn, major key, 92–98 BPM, akustik ukulele + hafif el alkışı + yumuşak glockenspiel, tek net genç kadın vokal, her kelime 3–6 yaş için yavaş ve net, rock/elektronik/autotune/fısıltı yok, ekstra söz yok.

| # | Ada | Şarkı (Telifsiz) | Sahnede tetiklenecek anlar (`anlar`) | Hazır kesin sözler (Gemini'ye doğrudan verilebilir) |
|---|---|---|---|---|
| **1** | `renkler` | **The Rainbow Song** *(94 BPM)* | `red, blue, yellow, green, orange, pink` dedikçe ilgili renk fırçası/balonu patlar | `[Verse 1] Red and yellow, pink and green, / Purple and orange and blue! / I can sing a rainbow, / Sing a rainbow, / Sing a rainbow too! [Verse 2] Look up high, look at the sky, / Red, blue, yellow, and green! / I can sing a rainbow, / Sing a rainbow, / Sing a rainbow with you!` |
| **2** | `sayilar` | **Five Little Ducks** *(94 BPM, 3 kıta: 5→3→1)* | `five/three/one` ve `quack` anlarında ördekler suya zıplar | `[Verse 1] Five little ducks went out one day, / Over the hill and far away. / Mother duck said, "Quack, quack, quack!" / And four little ducks came swimming back. [Verse 2] Three little ducks went out one day, / Over the hill and far away. / Mother duck said, "Quack, quack, quack!" / And two little ducks came swimming back. [Verse 3] One little duck went out one day, / Over the hill and far away. / Mother duck said, "Quack, quack, quack!" / And all five ducks came swimming back!` |
| **3** | `yuzum` + `vucudum` | **Head, Shoulders, Knees and Toes** *(92 BPM → 2. tur 100 BPM)* | Her organda Kino ilgili yerine dokunur | `[Verse 1] Head, shoulders, knees and toes, / Knees and toes! / Head, shoulders, knees and toes, / Knees and toes! / And eyes and ears and mouth and nose, / Head, shoulders, knees and toes, / Knees and toes! [Verse 2] (Repeat slightly faster, cheerful claps)` |
| **4** | `tasitlar` | **The Wheels on the Bus** *(96 BPM)* | `wheels` döner, `horn` dütler, `door` açılır | `[Verse 1] The wheels on the bus go round and round, / Round and round, round and round. / The wheels on the bus go round and round, / All through the town! [Verse 2] The horn on the bus goes beep, beep, beep, / Beep, beep, beep, beep, beep, beep. / The horn on the bus goes beep, beep, beep, / All through the town! [Verse 3] The doors on the bus go open and shut, / Open and shut, open and shut. / The doors on the bus go open and shut, / All through the town!` |
| **5** | `duygular` | **If You're Happy and You Know It** *(96 BPM)* | `clap`, `stamp`, `jump` anlarında Kino ve Polly birlikte yapar | `[Verse 1] If you're happy and you know it, clap your hands! (Clap, clap!) / If you're happy and you know it, clap your hands! (Clap, clap!) / If you're happy and you know it, and you really want to show it, / If you're happy and you know it, clap your hands! (Clap, clap!) [Verse 2] If you're happy and you know it, stamp your feet! (Stamp, stamp!) ... [Verse 3] If you're happy and you know it, jump up high! (Jump, jump!) ...` |
| **6** | `hava` | **Rain, Rain, Go Away** *(92 BPM)* | Yağmur bulutu gider, güneş ve gökkuşağı açar | `[Verse 1] Rain, rain, go away, / Come again another day! / Little Kino wants to play, / Rain, rain, go away! [Verse 2] Sun, sun, shine today, / Bright and warm and here to stay! / Look, a rainbow in the sky, / Sun, sun, shine up high!` |
| **7** | `doga` | **Twinkle, Twinkle, Little Star** *(88 BPM, ninni sıcaklığında)* | Yıldızlar yanar, hilal gülümser | `[Verse 1] Twinkle, twinkle, little star, / How I wonder what you are! / Up above the world so high, / Like a diamond in the sky. / Twinkle, twinkle, little star, / How I wonder what you are! [Verse 2] Look up at the bright white moon, / Night is here, we'll sleep so soon. / Twinkle, twinkle, little star, / How I wonder what you are!` |
| **8** | `gunum` | **This Is the Way** *(96 BPM)* | `wash`, `brush`, `read` eylemlerini Kino oynar | `[Verse 1] This is the way we wash our face, / Wash our face, wash our face. / This is the way we wash our face, / Early in the morning! [Verse 2] This is the way we brush our teeth, / Brush our teeth, brush our teeth. / This is the way we brush our teeth, / Early in the morning! [Verse 3] This is the way we read a book, / Read a book, read a book. / This is the way we read a book, / Every sunny day!` |
| **9** | `ailem` | **Finger Family** *(94 BPM)* | `Dad, Mom, Sister, Grandpa, Grandma` sahneye çıkar | `[Verse 1] Daddy finger, Daddy finger, where are you? / Here I am, here I am! How do you do? [Verse 2] Mommy finger, Mommy finger, where are you? / Here I am, here I am! How do you do? [Verse 3] Grandma finger, Grandpa finger, where are you? / Here we are, here we are! How do you do?` |
| **10** | `hareketler` | **Jump, Clap, Freeze!** *(özgün telifsiz, 96 BPM, 2 sn'lik gerçek sessizlik!)* | `Freeze!` anında müzik 2 sn durur — **Freeze Dance** oyununda da kullanılır! | `[Verse 1] Jump, jump, jump up high! / Jump, jump, touch the sky! / Ready now... FREEZE! (2 seconds silence) / Yay! [Verse 2] Clap, clap, clap your hands! / Clap, clap, join the band! / Ready now... FREEZE! (2 seconds silence) / Yay! [Verse 3] Dance, dance, spin around! / Dance, dance, happy sound! / Ready now... SLEEP! (soft lullaby chord) / Good night!` |

---

## 4. İNGİLİZCE · 13–24. Adalar İçin 4 Yüksek Değerli, Düşük Çizim Maliyetli Ada Oyunu

*(Mevcut `P12` Kino gövdesi ve `P17–P20` çizimlerini yeniden kullanarak Astra yükünü en aza indirir!)*

1. **`hava` · Polly's Weather Window** *(35–55 sn, 4 & 5+ yaş)*: Perdeye dokun → hava açılır (`It's rainy / sunny / snowy!`) → Kino'ya 2 uygun giysi giydir (`Put on the jacket / hat!`) → kapı açılır, Kino dışarıda o havaya uygun oynar. *(Mevcut P12 Kino gövdesi + yalnız 3 yeni hava parçası: yağmurluk, şemsiye, güneş gözlüğü + pencere fonu!)*
2. **`duygular` · Help Kino! (Empati Oyunu)** *(30–50 sn, 3–6 yaş)*: Kino `hungry / thirsty / sleepy / sad` yüzüyle gelir (`P17-8` çizimleri zaten brief'te!) → Polly *"Oh no! Kino is thirsty!"* der → çocuk masadaki 3 nesneden (`water, bed, apple`) doğruyu verir → Kino `happy` olur (*"Thank you! Now I am happy!"*). *(Yeni çizim maliyeti neredeyse sıfır: 1 masa fonu + mevcut `P17` kartları!)*
3. **`evim` · Knock, Knock! Where is Kino?** *(25–45 sn, 3–6 yaş)*: `P18-4` `evim-set` kesit evinin 4 odası (`kitchen, bathroom, bedroom, garden`) → Polly *"Kino is in the kitchen!"* → çocuk odaya dokununca o oda aydınlanır ve `P20-1` `kino-in-kitchen` belirir! *(Sıfır yeni Astra çizimiyle çalışan tam yeni oyun!)*
4. **`gunum` · Kino's Sun & Moon Wheel** *(35–55 sn, 4 & 5+ yaş)*: Penceredeki güneş/ay çarkı döner (`Morning → Noon → Night`) → her zaman diliminde Polly sorar (*"Good morning! What does Kino do?"*) → çocuk `wake-up / brush / read / sleep` arasından seçer, Kino yapar. *(Mevcut `P17-14/15` kartları + 1 çark fonu!)*

---

## 5. TÜRKÇE · Harf Atölyesi 2. Dalga: +5 Çözülebilir Öykü (`Öykü 6–10`) + 2 Yeni Oyun (`Harf-H11`, `Harf-H12`)

### 5A. "Ceren'in Hikâye Defteri" 2. Cilt (`oyku-6` … `oyku-10`)
*Her harf tek tek kontrol edilmiştir: her öykü **%100 yalnız kendi ses grubuna kadarki harfleri** kullanır, çileksiz, onaylı kadroludur, 4. sayfa "okuduğunu yaptır" (önce/sonra) çiftlidir.*

| Öykü | Grup (İzinli harfler) | Sayfa 1 | Sayfa 2 | Sayfa 3 | Sayfa 4 (Önce → Sonra · Dokunulacak nesne) |
|---|---|---|---|---|---|
| **Öykü 6 · Anne ile Tatil** | 1. Grup (`A N E T İ L`) | `Anne ile tatil!` | `El ele, atla!` | `Anne, anlat!` | **`Anne, atla!`** *(Önce: Anne bahçede alçak ipin önünde → çocuk ipe dokunur → Sonra: Anne ipin üstünden atlamış!)* |
| **Öykü 7 · Lokum Okulda** | 2. Grup (`+ O K U R I M`) | `Kino okula iner.` | `Lokum koltukta oturur.` | `Mino kalem tutar.` | **`Lokum, elma al!`** *(Önce: masada kırmızı elma → çocuk elmaya dokunur → Sonra: Lokum elmayı patisinde tutuyor!)* |
| **Öykü 8 · Mino ile Deniz** | 3. Grup (`+ Ü S Ö Y D Z`) | `Mino denize indi.` | `Suda ördek yüzdü.` | `Kino üzüm ile muz yedi.` | **`Mino, muzu al!`** *(Önce: örtüde soyulmuş muz → çocuk muza dokunur → Sonra: Mino muzu patisinde tutuyor!)* |
| **Öykü 9 · Baba ile Gemi** | 4. Grup (`+ Ç B G C Ş`) | `Baba gemi çizdi.` | `Kino sarı güneş çizdi.` | `Bulut büyük balık çizdi.` | **`Baba, çantayı aç!`** *(Önce: masada kapalı sarı çanta → çocuk çantaya dokunur → Sonra: çanta açık, boyalar görünüyor!)* |
| **Öykü 10 · Zıpzıp'ın Vapuru** | 5. Grup (Tüm 29 harf) | `Zıpzıp vapura bindi.` | `Havada martı uçtu.` | `Kino ile Zıpzıp havuç yedi.` | **`Zıpzıp, bayrağı salla!`** *(Önce: Zıpzıp elinde duran bayrak → çocuk bayrağa dokunur → Sonra: Zıpzıp bayrağı havada sallıyor!)* |

### 5B. İki Yeni Harf Oyunu (Kısa Brief Özeti)
- **`Harf-H11 · Mino'nun Harf Kurabiyesi`** *(Görsel harf ayrımı — `b/d, o/ö, u/ü, c/ç, s/ş, ı/i, g/ğ`; 2–3, 4, 5+ yaş; 25–40 sn)*: Babaanne'nin tepsisinde 5 sade kurabiye (3 hedef, 2 benzer çeldirici). Mino tabağını tutar; doğru kurabiyeye dokununca tabağa uçar ve sesi çalar, yanlışta farkı (nokta/çengel/yön) parlar (*"Bunun iki noktası var: Ö!"*). **Çizim (6 dosya):** mutfak fonu (1672×941), fırın tepsisi, sade kurabiye tabanı, Mino tabaklı 2 poz, menü kartı.
- **`Harf-H12 · Zıpzıp'ın Sesli Bavulu`** *(Baş ses ayıklama; 4 ve 5+ yaş; ders/tekrar içinde; 30–45 sn)*: Zıpzıp tatile giderken yalnız hedef sesle başlayan 3 eşyayı bavula koyar (mevcut H6/H8 80+ sözcük havuzunu kullanır!); yanlış eşya yaylanıp bavuldan pırt diye geri fırlar. **Çizim (5 dosya):** oda fonu (1672×941), açık & kapalı bavul, Zıpzıp 2 poz.

---

## 6. MATEMATİK · Ölçü Tezgâhı 2. Dalga (`M25–M27`, 3 Eksik Okul Öncesi Kavram)

*M14–M24 Sayı, Şekil ve Fener Tiyatrosu'nu tamamladı; Ölçü Tezgâhı'na eklenen bu 3 tur okul öncesi matematik müfredatını %100 kapatır:*

| Paket | Tur adı & Kavram | Akış (30–50 sn) | Yaş basamakları | Gereken çizimler (1672×941 fon + şeffaf nesneler) |
|---|---|---|---|---|
| **M25** | **Anne'nin Sürahileri** *(Hacim & Kapasite: dolu / yarım / boş; çok–az alan kap)* | Masada şeffaf sürahi ve bardaklar; çocuk sürahiye dokunup suyu bardağa döker (*"Yarım oldu!"*, *"Tam doldu!"*); 5+ yaşta 1 sürahinin kaç bardak doldurduğunu sayar. | 2–3: dolu/boş · 4: dolu/yarım/boş · 5+: sürahi kaç bardak? | Mutfak tezgâh fonu, 3 seviyeli bardak (boş/yarım/dolu), sürahi (düz/eğik), Anne 2 poz. |
| **M26** | **Babaanne'nin Bütün ve Yarımı** *(Kesir başlangıcı: bütün ↔ iki yarım)* | Tahtada bütün elma, armut, ekmek ve simit (çilek yok!). Çocuk tahta bıçakla ortadan ikiye böler (*"İki yarım!"*), sonra iki yarımı birleştirip bütün yapar (*"Bir bütün!"*). | 4 yaş: ikiye böl & birleştir · 5+ yaş: *"İki yarım elma kaç bütün eder?"* (2–4 yarım) | Masa kesme tahtası fonu, 4 yiyeceğin bütün + sol yarım + sağ yarım parçaları (elma, armut, ekmek, simit), Babaanne 2 poz. |
| **M27** | **Kino'nun Günü** *(Zaman sırası: önce / şimdi / sonra; sabah / öğlen / akşam)* | 3 boş zaman karesi (güneş doğarken / tepede / ay). Çocuk 3 karışık sahne kartını sıraya koyar (uyanma → oyun → uyku); doğru sırada Kino'nun günü kısa akışla oynar. | 2–3: gündüz / gece (2 kart) · 4: 3 kartlık günlük sıra · 5+: 3 kartlık olay sırası (tohum → filiz → çiçek) | Duvar şeridi fonu (sabah-öğlen-gece ikonlu), 3 günlük kart + 3 bitki büyüme kartı, Kino 2 poz. |

---

*Not: Her bölüm doğrudan yönetici tarafından ayrı oturumlara bölünebilir; öncelik önerisi: **1) İngilizce 24 ada veli "Evde 3 Cümle"** (sıfır çizim, anında değer) → **2) İngilizce `evim` & `duygular` sıfır/az çizimli oyunlar + Ağaç Evi Paket 24** → **3) 10 şarkı promptunun Barış'a iletilmesi** → **4) Türkçe Öykü 6–10 & M25–M27**.*
