# Minik Doktor · Y2 parça brief'i · "Mino'nun Kurabiyeli Dişleri" (yeni; anahtar kare onaylanınca Astra'ya gider)

Claude (Harf / Minik Doktor), 23 Kasım 2026. Yöneticinin isteğiyle baştan yazıldı: 22 Kasım 19:46'daki ilk Y2 brief'i (27 çizim, altı adım) Barış'ın temel kuralına (KALITE-KURALLARI madde 0) göre kısa kalıyordu; **bu brief onun yerine geçer.** Kod hazır, çizim bekliyor: `doktor/src/vaka-dis/`, `doktor/index.html?oyun=disler`. Adlar, ölçüler ve kare dizileri kodla birebir; birim testi (`tests/unit/doktor-disler.test.ts`) bu dosyayı okuyup karşılaştırır.

**Ortak:**
- Stil: onaylı `anahtar-hub`, Y1 yakın planı ve Doktor-A1 kareleri. İnce koyu kontur, düz yumuşak renk, sıcak pastel, tek yumuşak gölge, doku yok.
- **Bir setin bütün karelerinde kontur aynı kalınlıkta.** Küçük parçaların tuvalinde (600 ve altı) kontur 4–5 px. Köpük ve su açık mavi ince konturlu (A1'in `kopurme` kareleri gibi).
- "Aynı baş" denen karelerde baş, kulaklar ve gövde **piksel piksel aynı**; yalnız söylenen yer değişir. Rötuş izi kalmasın: silerek değil, temiz çizerek.
- Yasaklar: insan figürü, çilek, kan, iğne, hap, makas, dişçi matkabı, yazı ve rakam yok; aletlerde yüz yok. Dişler sevimli ve yuvarlak; sivri, korkutan diş yok. Dil pembe, ağız içi koyu gül rengi (siyah değil).
- Mino modeli: `ekip/kalite/minkino-gorsel-rehberi/pozlar/mino/on.png` (turuncu tekir kedi, kırmızı fular, ön cepli mavi önlüklü elbise).
- Y1'den aynen kullanılanlar (yeniden çizilmez): `hub-fon`, `canta-kapali`, `canta-acik`, `serit`, `pof-0`, `pof-1`, `yildiz`, Kino'nun pozları.
- Kaynaklar `ekip/doktor/y2/kaynak/` içine bu adlarla gelir (`.png`, tuval ölçüsünde, şeffaf; `agiz-fon` opak). Sayfa başına en çok 8 çizim.

---

## Paket Doktor-Y2 → `assets/doktor/dis/` (99 çizim, 15 sayfa)

**Senaryo · dokuz adım:**

| # | Adım | Parmağın işi | Ekranda olan |
|---|---|---|---|
| 1 | Gıdıkla | Mino'nun çenesinin altında parmağını gezdirir | Mino ağzını sımsıkı kapatmış. Dudağı titrer, kıkırdamaya başlar (iki kare), sonunda "Aaaa!" diye ağzını kocaman açar. Parmak durursa yine kapanır. |
| 2 | Ağız aynası | Işıklı küçük aynayı dişlerin üstünde gezdirir | Işık halkası aynayı izler. Saklı kurabiye kırıntıları ışığın altında parlayıp belirir (iki kare), her biri "çın". |
| 3 | Dişleri say | Dişlere tek tek dokunur | Dokunulan diş parlar (iki kare) ve bir nota çalar; her dişte ses bir basamak yükselir, nota havaya süzülür. Kino sayar. |
| 4 | Macun | Üç tüpten birini seçer, fırçanın kıllarına boydan boya sürerek sıkar | Tüp sıkılır (basık kare), kılların üstünde macun şeridi üç kademede uzar. Tüp Mino'nun yüzüne sıkılırsa burnuna macun konar, Mino şaşırıp kıkırdar. |
| 5 | Fırçala | Fırçayı dişlerin üstünde ileri geri gezdirir | Köpük parmağın yolunda birikir (dört kademe), dişler birer birer temizlenir, baloncuklar yükselip patlar. Mino gözlerini kısıp kıkırdar. 5+ yaşta dilini çıkarır, dil de fırçalanır. |
| 6 | Su | Bardağı ağzına götürür ve tutar | Su üç karede akar, bardak dolu, yarım, boş olur. Mino'nun yanakları şişer. |
| 7 | Çalkala | Şişik yanaklara sırayla dokunur | Su bir yanaktan öbürüne geçer ("blup blup"). Sonunda Mino kâseye "pfff" diye püskürtür (üç kare), kâse üç kademede dolar, köpük gider. |
| 8 | İp | İp çubuğunu diş aralarında aşağı yukarı oynatır | İp gerilir; her aralıktan son minik kırıntı "pıt" diye fırlar (iki kare). |
| 9 | Gülüş | El aynasını Mino'nun yüzüne tutar | Dişler parıldar (üç kare), aynada gülen Mino görünür, kalpler yükselir; Mino poz verir. Masada: cebinden bir kurabiye çıkarır, Kino'ya uzatır, sonra fırçasını gösterir. |

**Yanlış hamleler (komik, cezasız):** macun yüze sıkılırsa burna konar; aynı yanağa iki kez dokununca su öbür yana geçmez, Mino'nun gözleri büyür; gıdıklama bırakılırsa ağız yine kapanır.

**Yaş:** 2–3: üç kırıntı, dört diş sayılır, altı diş fırçalanır, iki çalkalama, iki aralık. 4: beş kırıntı, altı diş, on diş, dört çalkalama, üç aralık. 5+: yedi kırıntı, sekiz diş, on iki diş ve dil, altı çalkalama, beş aralık.

### Yakın plan ölçüleri (2048 × 1152; bütün yakın katmanlar aynı hizada)
- **Baş:** ekseni x 860; yanak tüyleriyle x 320…1400. Kulakların ucu üst kenarda kesilir; çenenin en altı y ≤ 930. Burun (860, 505).
- **Açık ağız:** merkezi (860, 700). **Üst diş sırası x 610…1110, y 585…690; alt diş sırası x 630…1090, y 765…850.** Her sırada **altı diş, eşit genişlikte** (kod dişleri tek tek sayar ve temizler). Dil ortada, merkezi (860, 735).
- **Yanaklar (dokunulacak yer):** merkezleri (500, 640) ve (1220, 640).
- **Gıdıklanan yer:** çene ve yanakların altı, merkezi (860, 850).
- **Sağda havlu:** x 1430…2030, y 440…640; fırça üstünde yatar (kıllar solda, yukarı bakar).
- **Solda önde tükürme kâsesi:** x 40…420, y 650…920 (ayrı parça).
- İki köşe sakin kalır: alt kenar x 20…1520, y 940…1140 (alet şeridi), sağ alt x ≥ 1480, y ≥ 800 (Kino).

### Önce: stil anahtar karesi (1 çizim) → `ekip/doktor/y2/anahtar-agiz.png`
2048 × 1152, opak. Yakın planın bitmiş hâli: Mino'nun başı büyük, ağzı kocaman açık, dişlerde sarımsı bulaşık ve kurabiye kırıntıları, bir dişin üstünde köpük; sağda havlunun üstünde macunlu fırça; solda önde tükürme kâsesi; elde ışıklı ağız aynası dişlere tutulmuş. Yönetici onaylayınca parçalar.

### Sayfa 1 · Fon ve kâse (4) → `agiz-fon`, `tukur-kase-0`, `tukur-kase-1`, `tukur-kase-2`
- `agiz-fon` (2048 × 1152, opak): Mino'nun başının arkası: nane sedye yastığı, üstte lila duvar, lamba ışığı (Y1 `yakin-fon` ile aynı oda). Sağda nane-beyaz çizgili havlu (x 1430…2030, y 440…640). Baş ve kâse yok.
- `tukur-kase-0…2` (380 × 270): küçük nane rengi kâse; boş, yarı dolu, dolu (içinde köpüklü su). Üç karede kâse piksel piksel aynı.

### Sayfa 2 · Mino'nun başı I (8, şeffaf, 2048 × 1152, aynı baş) → `mino-yakin-kapali`, `mino-yakin-kapali-kirp`, `mino-yakin-dudak`, `mino-yakin-kikir-0`, `mino-yakin-kikir-1`, `mino-yakin-acik`, `mino-yakin-acik-kirp`, `mino-yakin-acik-kikir`
Önden, tam karşıdan. Açık ağızlı pozlarda ağız içi ve dil çizili, **dişler çizilmez** (ayrı katman).
- `kapali`: ağız sımsıkı kapalı, yanaklar hafif şiş, kaşlar çatık değil inatçı-sevimli. `kapali-kirp`: aynı, gözler kapalı.
- `dudak`: dudağın bir köşesi yukarı kıvrılmış, gülmemeye çalışıyor; gözler yana bakıyor.
- `kikir-0`, `kikir-1`: kıkırdıyor: ağız küçük açık, omuzlar ve yanak tüyleri iki karede hafif oynar, gözler kısık.
- `acik`: "Aaaa": ağız kocaman açık (yukarıdaki ölçülerle), gözler açık, yukarı bakıyor. `acik-kirp`: aynı, gözler kapalı.
- `acik-kikir`: `acik` ile ağız ve çene aynı; gözler gülerek kısık, yanaklar daha pembe.

### Sayfa 3 · Mino'nun başı II (8, şeffaf, 2048 × 1152, aynı baş) → `mino-yakin-acik-sasir`, `mino-yakin-dil`, `mino-yakin-sisik`, `mino-yakin-sisik-sol`, `mino-yakin-sisik-sag`, `mino-yakin-puf`, `mino-yakin-gulen`, `mino-yakin-gulen-kirp`
- `acik-sasir`: ağız açık, gözler kocaman, şaşı gibi burnunun ucuna bakıyor (burnuna macun konmuş; macun ayrı parça).
- `dil`: ağız açık, dil dışarı uzanmış (dil merkezi (860, 780)), gözler kapalı.
- `sisik`: ağız kapalı, iki yanak su dolu, şişik; gözler kocaman. `sisik-sol`: yalnız bize göre sol yanak şişik. `sisik-sag`: yalnız sağ yanak şişik.
- `puf`: dudaklar büzülmüş, bize göre sola (kâseye) doğru püskürtüyor; gözler sıkı kapalı.
- `gulen`: kocaman gülümseme, **bembeyaz dişler çizimin içinde**; gözler parlak. `gulen-kirp`: aynı, gözler kapalı.

### Sayfa 4 · Poz ve dişler (4, şeffaf, 2048 × 1152) → `mino-yakin-poz`, `disler-kirli`, `disler-temiz`, `disler-parlak`
- `poz`: aynı baş; bir gözünü kırpmış, patisi çenesinde, dişlerini gösteriyor (poz veriyor).
- `disler-temiz`: yalnız dişler (üst ve alt sıra, altışar diş, yukarıdaki ölçülerde); beyaz, hafif mavi gölgeli. Baş çizilmez.
- `disler-kirli`: **aynı dişler**, üstlerinde sarımsı bulaşık. Kırıntı çizilmez (ayrı parça). Bulaşık dışında `temiz` ile piksel piksel aynı.
- `disler-parlak`: aynı dişler, her birinde küçük beyaz parlama çizgisi.

### Sayfa 5 · Kırıntılar (6) → `kirinti-0`, `kirinti-1`, `kirinti-2`, `kirinti-3`, `kirinti-parla-0`, `kirinti-parla-1`
- `kirinti-0…2` (120 × 120): üç ayrı kurabiye kırıntısı (kahverengi, üstünde koyu damla çikolata), merkezde, 60–80 px. `kirinti-3`: minik kırıntı (30 px; ipten fırlayan).
- `kirinti-parla-0…1` (200 × 200): kırıntının çevresinde beliren sarı ışık çizgileri; küçük, büyük.

### Sayfa 6 · Masadaki Mino (8, şeffaf, 1000 × 940) → `mino-uzgun-0`, `mino-uzgun-1`, `mino-uzgun-kirp`, `mino-sevinc-0`, `mino-sevinc-1`, `mino-son-kurabiye`, `mino-son-uzat`, `mino-son-firca`
Önden, ayakta, boydan (Y1'deki Zıpzıp pozlarının eşi). Tuvalde gövde x 280…880, y 70…860; **baş merkezi (575, 300), ağız (575, 372)**; ayaklar y ≈ 859. Sekiz karede boy ve yer aynı.
- `uzgun-0`: bir patisi yanağında, ağzı sımsıkı kapalı. `uzgun-1`: aynı poz, kulaklar hafif düşük. `uzgun-kirp`: `uzgun-0` ile aynı, gözler kapalı.
- `sevinc-0`, `sevinc-1`: kocaman gülümseme, parlak beyaz dişler; bir patisiyle el sallıyor (0'da pati solda yukarıda, 1'de sağda).
- `son-kurabiye`: önlüğünün cebinden bir kurabiye çıkarmış, ona bakıyor (yaramaz gülüş). `son-uzat`: kurabiyeyi bize göre sağa (Kino'ya) uzatıyor. `son-firca`: öbür patisinde diş fırçası, gururla gösteriyor.

### Sayfa 7 · Aletler I (7, şeffaf, 600 × 600) → `agiz-aynasi`, `agiz-aynasi-isik`, `firca`, `firca-nane`, `firca-portakal`, `firca-muz`, `bardak-dolu`
- `agiz-aynasi`: küçük yuvarlak diş aynası, sapı aşağıda; **ayna yüzünün merkezi (300, 130), çapı 170**; sap y 560'a iner. `agiz-aynasi-isik`: aynı, ayna yüzünün çevresinde sıcak sarı ışık.
- `firca`: yatay diş fırçası, turkuaz sap; **kıl başlığı solda, kıllar yukarı bakıyor: kılların üst yüzü x 60…260, y 230**; sap sağa x 560'a uzanır. Macunsuz.
- `firca-nane`, `firca-portakal`, `firca-muz`: aynı fırça, kılların üstünde boydan boya macun (nane: açık yeşil-beyaz çizgili; portakal: turuncu; muz: açık sarı).
- `bardak-dolu`: şeffaf su bardağı, dolu; **ağız kenarının sol ucu (140, 150)** (su buradan dökülür).

### Sayfa 8 · Aletler II (6, şeffaf, 600 × 600) → `bardak-yari`, `bardak-bos`, `ip-cubugu`, `ip-cubugu-gergin`, `el-aynasi`, `el-aynasi-parlak`
- `bardak-yari`, `bardak-bos`: `bardak-dolu` ile aynı bardak; su yarıda, boş.
- `ip-cubugu`: Y biçiminde yuvarlak uçlu, yumuşak görünen ip çubuğu (turkuaz), iki ucunun arasında gergin beyaz ip; **ipin ortası (300, 90)**; sap aşağıda. Sivri uç yok. `ip-cubugu-gergin`: aynı, ip ortasından aşağı doğru hafif V yapmış (dişin arasında).
- `el-aynasi`: yuvarlak el aynası, sarı çerçeve, sap aşağıda; **ayna yüzünün merkezi (300, 220), çapı 300.** `el-aynasi-parlak`: aynı, camda parlama çizgileri ve çevresinde küçük yıldızlar.

### Sayfa 9 · Macun tüpleri (6, şeffaf, 300 × 600) → `macun-nane`, `macun-portakal`, `macun-muz`, `macun-nane-sikik`, `macun-portakal-sikik`, `macun-muz-sikik`
Dik tüp, **ağzı aşağıda, ucu (150, 570)**, kapağı yok. Üstünde tadın resmi (nane yaprağı, portakal dilimi, muz); yazı yok. `-sikik`: aynı tüp, gövdesi ortadan sıkılmış, ağzından küçük bir macun damlası çıkıyor.

### Sayfa 10 · Macun şeritleri I (8, şeffaf, 220 × 70) → `serit-nane-0`, `serit-nane-1`, `serit-nane-2`, `serit-portakal-0`, `serit-portakal-1`, `serit-portakal-2`, `serit-muz-0`, `serit-muz-1`
Fırçanın kıllarının üstüne konan macun şeridi, soldan başlar: `-0` üçte bir (70 px), `-1` üçte iki, `-2` boydan boya (200 px), ucunda küçük kıvrım. Renkler tüplerle aynı.

### Sayfa 11 · Macun ve ışık (6) → `serit-muz-2`, `burun-macun`, `isik-halka-0`, `isik-halka-1`, `dis-isik-0`, `dis-isik-1`
- `serit-muz-2` (220 × 70): yukarıdaki setin son karesi.
- `burun-macun` (200 × 200): burnun ucuna konmuş küçük macun topağı (beyaz, hafif nane çizgili), merkezde.
- `isik-halka-0…1` (400 × 400): aynanın ışığı: yumuşak sarı halka; ikinci karede biraz geniş (nabız).
- `dis-isik-0…1` (200 × 240): dokunulan dişin çevresinde parlama: küçük, büyük; ortası boş (diş görünür).

### Sayfa 12 · Notalar ve köpük (7) → `nota-0`, `nota-1`, `nota-2`, `dis-kopuk-0`, `dis-kopuk-1`, `dis-kopuk-2`, `dis-kopuk-3`
- `nota-0…2` (160 × 160): üç ayrı müzik notası, pastel (pembe, turkuaz, sarı), ince koyu kontur.
- `dis-kopuk-0…3` (300 × 300): diş macunu köpüğü, merkezi (150, 150) çevresinde büyür (genişlik 70, 130, 200, 270); açık mavi ince kontur, her yanı yuvarlak.

### Sayfa 13 · Baloncuk ve su (8) → `baloncuk-0`, `baloncuk-1`, `baloncuk-2`, `baloncuk-pat-0`, `baloncuk-pat-1`, `bardak-su-0`, `bardak-su-1`, `bardak-su-2`
- `baloncuk-0…2` (160 × 160): sabun baloncuğu büyür (çap 40, 80, 120); dördü de opak açık mavi, üstünde parlama.
- `baloncuk-pat-0…1` (200 × 200): patlama: halka, sonra birkaç damlacık.
- `bardak-su-0…2` (120 × 400): bardaktan ağza akan ince su; üç karede parlama çizgisi aşağı kayar, renk aynı, üst ve alt kenarda çizgi yok.

### Sayfa 14 · Püskürme, ip, parıltı (8) → `puf-su-0`, `puf-su-1`, `puf-su-2`, `ip-pit-0`, `ip-pit-1`, `dis-parilti-0`, `dis-parilti-1`, `dis-parilti-2`
- `puf-su-0…2` (500 × 400): ağızdan sola aşağı püsküren köpüklü su; **sağ üst köşe ağız**; çıkış, yayılma, damlalara dağılma.
- `ip-pit-0…1` (160 × 160): kısa beyaz "pıt" çizgileri (koyu konturlu); küçük, büyük.
- `dis-parilti-0…2` (240 × 240): dört köşeli beyaz-sarı diş parıltısı; küçük, büyük, sönerken.

### Sayfa 15 · Son (5) → `ayna-yansima`, `gulus-kalp-0`, `gulus-kalp-1`, `kurabiye`, `kurabiye-isirik`
- `ayna-yansima` (300 × 300): el aynasının camında görünen gülen Mino yüzü (yuvarlak kadraj, çap 280; parlak dişler).
- `gulus-kalp-0…1` (160 × 160): yükselen küçük kalp; küçük, büyük (pembe, ince kontur).
- `kurabiye`, `kurabiye-isirik` (200 × 200): damla çikolatalı kurabiye; bütün ve bir ısırık alınmış.

---

## Ses (kayıt bekliyor)
- **Mino (klonu yok; karar Barış'ta), 14 söz:** "Mmm! Açmam!", "Aa, doktor çantası!", "Hi hi hi! Gıdıklanıyorum!", "Aaaa!", "Kurabiyem orada kalmış!", "Dişlerim şarkı söylüyor!", "Mis gibi kokuyor!", "Burnuma macun geldi!", "Köpük köpük oldum!", "Glu glu glu!", "Pfff!", "Bir tane daha çıktı!", "Dişlerim pırıl pırıl!", "Bir kurabiye... Sonra yine fırça!"
- **Kino (kendi sesi), 2 söz:** "Bir, iki, üç... Sayalım!", "Tertemiz oldu!"
- **Efekt:** eski hâlin altı kaydı kullanılıyor (`assets/doktor/dis/ses/`); yeni hareketler için eklenecekler: gıdık kıkırtısı, diş notası (ksilofon), ip "pıt", püskürme "pfff", ayna "çın".
