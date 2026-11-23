# Minik Doktor · K1 bekleme odası parça brief'i (ekran seçilip stil anahtar karesi onaylanınca Astra'ya gider)

Claude (İngilizce yan oturumu → Minik Doktor), 23 Kasım 2026 gecesi. KALITE-KURALLARI madde 0'a göre yazıldı: ucuza kaçma, her hareketin kendi kareleri. Kod hazır, çizim bekliyor: `doktor/src/klinik/` (`doktor/index.html?oyun=klinik`).

Adlar, ölçüler ve kare dizileri kodla birebir. Birim testi (`tests/unit/doktor-klinik.test.ts`) bu dosyayı okuyup karşılaştırır.

**Sıra:**
1. Önce üç ekran seçeneği (`CLAUDE-ASTRA-MESAJLAR.md`, 23 Kasım 02:59): A bekleme bankları, B oyun halısı, C bahçe kliniği.
2. Yönetici birini seçer; seçilen ekran tek stil anahtar karesi olur.
3. Sonra bu parçalar.

**Seçilen ekran B, "oyun halısı"** (yönetici, 23 Kasım 05:12). Yerleşim sayıları Astra'nın B fonundan ölçtükleridir. Sayfa başına en çok 8 çizim.

**Ek (23 Kasım):** odada yedi hasta oturur, panoda on çıkartma yuvası vardır (iki sıra, beşer).
- Lokum (Y7, karnı guruldar) yedinci hastadır.
- Üç hasta ikinci kez gelir; her biri için kendi boşta döngüsü, "ben mi?" yüzü ve yürüyüşü çizilir:
  - Lokum, karnı geçince (Y7) kucağında söküğü açılmış oyuncak Kuzu'yla (Y8);
  - Bulut, ateşi geçince (Y3) kulağında uğur böceğiyle (Y9);
  - Mino, dişleri geçince (Y2) karnından "tıngır" sesiyle (Y10).

**Akış:**
1. Yedi hasta kendi derdiyle oturur ve boşta döner.
2. Sıradaki iki hasta ışıkla bekler. Çocuk birini seçer; hasta kalkar, kapıya yürür ve kapıdan geçer.
3. Vakası oynanır.
4. İyileşen hasta kapıdan mutlu çıkar, yerine yürüyüp oturur. Çıkartması başının üstünden panoya uçar.
5. Pano dolunca küçük kutlama olur: çıkartmalar sırayla parlar, herkes sevinir, yıldız ve konfeti yağar. Konfeti kodda.

**Ortak:**
- **Stil:** seçilen ekranın anahtar karesi; onaylı `anahtar-hub` ve Y1 renkleri. İnce koyu kontur, düz yumuşak renk, sıcak pastel, tek yumuşak gölge, doku yok.
- **Yasaklar:** insan figürü, çilek, kan, iğne, hap, makas, yazı ve rakam yok; saat yüzü yok.
- **Y1'den aynen kullanılanlar** (yeniden çizilmez): `yildiz`, `pof-1`.
- **Hasta kareleri:** hepsi aynı tuvalde, **420 × 460**, şeffaf. Ayaklar (ya da oturuşta oturağa değen yer) tuvalin alt ortasında, **(210, 460)**. Gövde tuvalin ortasında, kenarlarda 30 px boşluk.
  - Bir dizinin kareleri aynı hizada.
  - Değişmeyen parça piksel piksel aynı: aynı çizimden türet.
- **Yön:** yürüyüş kareleri sağa (kapıya doğru), dönüş kareleri sola bakar.
- **Arka sıra:** arka sıradaki hastaları kod %82 boyda gösterir; çizimler tek boy.
- **Modeller:**
  - Zıpzıp, Mino, Bulut: `ekip/kalite/minkino-gorsel-rehberi/pozlar/<ad>/on.png`.
  - Mila: `ekip/film/kino-bir-iki-uc-gum/cizim/Mila-Tek-Poz-Onizleme.png`.
  - Pamuk: `assets/dedektif-yeni/pamuk-onden.webp`.
  - Polly: `ekip/film/ortak-poz-arsivi/polly-agac-evi/polly-tunekte-sheet.png`.
  - Lokum: `ekip/kalite/minkino-gorsel-rehberi/pozlar/lokum/on.png` (pembe tulumlu; boyu Kino'nun 0,63'ü).
  - Önlüklü Kino: Y1'deki Kino.
- **Kaynaklar:** `ekip/doktor/k1/kaynak/` içine bu adlarla (`.png`). Tuvale oturtma ve webp bizde.

---

## Paket Doktor-K1 · bekleme odası → `assets/doktor/klinik/` (172 çizim)

### Yerleşim (2048 × 1152, seçenek B yakın kadraj; Astra'nın 23 Kasım 07:33 teslimde ölçtüğü)
- **Yedi minder** (minderle temas noktası):
  - arkada (%82 boy): Mino (560, 699), Pamuk (1490, 700);
  - ortada (%90 boy): Zıpzıp (380, 859), Polly (1660, 859);
  - önde (tam boy): Bulut (560, 1060), Mila (1490, 1060), Lokum (1030, 1090).
- **Yürüyüş:** kapı ortada olduğu için hastalar kapıya iki yandan yürür.
  - Yürüyüş kareleri sağa, dönüş kareleri sola bakar; öbür yöne giderken kod aynalar.
  - Lokum halının önünden kapıya doğru yürür.
- **Klinik kapısı** arkada ortada: açık kapı katmanı x 760…1290, y 150…660 (üstü panonun arkasında). Eşiği (1140, 660), kapının sağ yarısı; hasta burada kapıdan geçer (%72 boy).
- **Kino** B'deki gibi kapının sol yarısının önünde, iri: 360 × 500 kaynak %86 ölçekle, ayakları eşik hizasında.
- **Kamera:** ekran yükseklikten dolar; ortadaki 1720 px hep görünür, iPad'de kenarlar kırpılır. Karakterler minder ölçeğinin 1,14 katı.
- **Pano** kapının üstünde: x 745…1305, y 0…192. On yuvarlak yuva iki sırada: üst sıra y 50, alt sıra y 140; ikisinde de x 805, 910, 1025, 1140, 1245.
  - Vaka sırasıyla: Zıpzıp, Mino, Bulut, Mila, Pamuk; Polly, Lokum, Lokum'un Kuzu'su, Bulut'un uğur böceği, Mino'nun çıngırağı.

### Sayfa 1 · Oda ve kapı (2) → `klinik-fon`, `kapi-acik`
- **`klinik-fon`** (2048 × 1152, opak):
  - Seçilen ekranın kendisi, hastalar ve Kino olmadan.
  - Banklar ya da minderler boş; kapı kapalı.
  - Panonun on yuvası boş halka.
- **`kapi-acik`** (430 × 412, şeffaf): aynı kapı aralık, içerisi sıcak ışıklı. Fondaki kapalı kapının dış çerçevesine (x 805…1235, y 218…630) tam oturur.

### Sayfa 2 · Kapıdaki Kino (4, şeffaf, 360 × 500) → `kino-kapi-goster`, `kino-kapi-bekle-0`, `kino-kapi-bekle-1`, `kino-kapi-sevin`
- `kino-kapi-goster`: patisiyle içeriyi gösterip çağırıyor, ağzı açık.
- `kino-kapi-bekle-0`, `kino-kapi-bekle-1`: kapının yanında sakin bekleyiş, iki karede nefes alıp verir; göz kırpma ikinci karede.
- `kino-kapi-sevin`: iki patisi havada, sevinç.

### Hastaların kareleri (her hasta 18 çizim: iki sayfa ve mutlu oturuş; her vakanın bir çıkartması)
- **`<ad>-bekle-0` … `-4`:** boşta döngü, beş kare. Hasta derdiyle oturuyor; kod bu kareleri ileri geri, kendi sırasıyla döndürür.
  - **4. kare derdin vurgusudur** (hapşırık, damla, kahkaha): dokununca ve ara ara kendiliğinden gösterilir, efektiyle.
- **`<ad>-sec`:** çağrılınca "ben mi?" yüzü, gözler parlak, hafif doğrulmuş.
- **`<ad>-kalk-0`, `-1`:** oturaktan kalkış (yarı kalkmış, ayakta). Ters oynatınca oturuş.
- **`<ad>-yuru-0` … `-3`:** derdiyle kapıya yürüyüş, sağa doğru, dört karelik adım döngüsü.
- **`<ad>-cik-0` … `-3`:** iyileşmiş, mutlu dönüş, sola doğru, dört karelik zıplak adım. Dert yok:
  - sargı ve leke yok;
  - yanaklar normal;
  - Polly'nin tüyleri düzgün, şapkası başında.
- **`<ad>-mutlu-0`, `-1`:** iyileşmiş, yerinde mutlu oturuş, iki karede sallanır.
- **`cikartma-<vaka>`:** panodaki yuvarlak çıkartma (300 × 300, kodda 84 boyda). Hastanın mutlu yüzü, kalın beyaz kenar; yazı yok.

### Sayfa 3 · Zıpzıp I · bekleme (8, 420 × 460) → `zipzip-bekle-0`, `zipzip-bekle-1`, `zipzip-bekle-2`, `zipzip-bekle-3`, `zipzip-bekle-4`, `zipzip-sec`, `zipzip-kalk-0`, `zipzip-kalk-1`
- **Henüz tedavi olmadı:** patisi sargısız, dikenli; topallayan patisini göğsüne çekmiş tutuyor (Doktor-A1'deki gibi). Boşta döngü:
  - 0: dikenli patisini göğsüne çekmiş, üzgün;
  - 1: patisine üflüyor;
  - 2: patisini kaldırıp bakıyor;
  - 3: yüzü buruşuyor;
  - 4: vurgu, patisini sallıyor, gözleri sıkı kapalı, minik acı çizgileri.
- Kalkarken dikenli patiye basmamaya çalışır.

### Sayfa 4 · Zıpzıp II · yürüyüş (8, 420 × 460) → `zipzip-yuru-0`, `zipzip-yuru-1`, `zipzip-yuru-2`, `zipzip-yuru-3`, `zipzip-cik-0`, `zipzip-cik-1`, `zipzip-cik-2`, `zipzip-cik-3`
- **Yürüyüş:** topallayarak, dikenli pati göğsünde, havada.
- **Dönüş:** iki ayağıyla zıplayarak; patisinde minik renkli bant.

### Sayfa 5 · Mino I · bekleme (8, 420 × 460) → `mino-bekle-0`, `mino-bekle-1`, `mino-bekle-2`, `mino-bekle-3`, `mino-bekle-4`, `mino-sec`, `mino-kalk-0`, `mino-kalk-1`
- Dişi ağrıyor. Boşta döngü:
  - 0: patisi yanağında;
  - 1: yanağını ovuyor;
  - 2: yanağı hafif şiş, iki yana sallanıyor;
  - 3: gözleri sulu;
  - 4: vurgu, iki patisi yanaklarında, yüzü buruşuk, küçük inleme.

### Sayfa 6 · Mino II · yürüyüş (8, 420 × 460) → `mino-yuru-0`, `mino-yuru-1`, `mino-yuru-2`, `mino-yuru-3`, `mino-cik-0`, `mino-cik-1`, `mino-cik-2`, `mino-cik-3`
- **Yürüyüş:** yürürken patisi yanağında.
- **Dönüş:** kocaman pırıl pırıl gülüşle, kuyruğu havada.

### Sayfa 7 · Bulut I · bekleme (8, 420 × 460) → `bulut-bekle-0`, `bulut-bekle-1`, `bulut-bekle-2`, `bulut-bekle-3`, `bulut-bekle-4`, `bulut-sec`, `bulut-kalk-0`, `bulut-kalk-1`
- **Bulut boynuzlu keçi:** iki küçük kahverengi boynuz her karede, modeldeki gibi (köpeğe benzemesin).
- Ateşli. Yanakları kıpkırmızı, alnında ter damlası. Boşta döngü:
  - 0: yorgun oturuş;
  - 1: patisiyle kendini yelpazeliyor;
  - 2: ter damlası süzülüyor;
  - 3: dili dışarıda "of" yüzü;
  - 4: vurgu, damla düşüyor, yanakları en kırmızı.

### Sayfa 8 · Bulut II · yürüyüş (8, 420 × 460) → `bulut-yuru-0`, `bulut-yuru-1`, `bulut-yuru-2`, `bulut-yuru-3`, `bulut-cik-0`, `bulut-cik-1`, `bulut-cik-2`, `bulut-cik-3`
- **Yürüyüş:** ağır, sallanarak, kendini yelpazeleyerek.
- **Dönüş:** serin ve hafif, yanakları pembe; minik serinlik pırıltıları.

### Sayfa 9 · Mila I · bekleme (8, 420 × 460) → `mila-bekle-0`, `mila-bekle-1`, `mila-bekle-2`, `mila-bekle-3`, `mila-bekle-4`, `mila-sec`, `mila-kalk-0`, `mila-kalk-1`
- Yüzü ve patileri rengârenk boyalı. Boşta döngü:
  - 0: gülümsüyor;
  - 1: boyalı patisine bakıyor;
  - 2: gözleri kapalı kıkırdıyor;
  - 3: yanağını siliyor, leke yayılıyor;
  - 4: vurgu, kahkaha, omuzları kalkık.

### Sayfa 10 · Mila II · yürüyüş (8, 420 × 460) → `mila-yuru-0`, `mila-yuru-1`, `mila-yuru-2`, `mila-yuru-3`, `mila-cik-0`, `mila-cik-1`, `mila-cik-2`, `mila-cik-3`
- **Yürüyüş:** boyalı patilerini havada tutarak, kıkırdaya kıkırdaya.
- **Dönüş:** tertemiz, tüyleri parlak, dans eder gibi.

### Sayfa 11 · Pamuk I · bekleme (8, 420 × 460) → `pamuk-bekle-0`, `pamuk-bekle-1`, `pamuk-bekle-2`, `pamuk-bekle-3`, `pamuk-bekle-4`, `pamuk-sec`, `pamuk-kalk-0`, `pamuk-kalk-1`
- Burnu kıpkırmızı-pembe, gözleri sulu. Boşta döngü:
  - 0: burnu pembe, mahzun;
  - 1: burnu kıpırdıyor;
  - 2: gözleri kısılıyor ("hap");
  - 3: başı geriye ("hap…");
  - 4: vurgu, HAPŞU; başı öne, küçük pamuk bulutçuğu.

### Sayfa 12 · Pamuk II · yürüyüş (8, 420 × 460) → `pamuk-yuru-0`, `pamuk-yuru-1`, `pamuk-yuru-2`, `pamuk-yuru-3`, `pamuk-cik-0`, `pamuk-cik-1`, `pamuk-cik-2`, `pamuk-cik-3`
- **Yürüyüş:** burnunu çekerek, minik adımlarla.
- **Dönüş:** boynunda atkı, burnu normal, mırlar gibi gözleri kapalı.

### Sayfa 13 · Polly I · bekleme (8, 420 × 460) → `polly-bekle-0`, `polly-bekle-1`, `polly-bekle-2`, `polly-bekle-3`, `polly-bekle-4`, `polly-sec`, `polly-kalk-0`, `polly-kalk-1`
- Bir kanadı kabarık ve pıtraklı, şapkası elinde. Boşta döngü:
  - 0: kanadına bakıyor;
  - 1: gagasıyla düzeltmeye çalışıyor;
  - 2: kanat kabarıyor;
  - 3: şapkasını sallıyor;
  - 4: vurgu, tüyleri diken diken, şaşkın yüz.

### Sayfa 14 · Polly II · yürüyüş (8, 420 × 460) → `polly-yuru-0`, `polly-yuru-1`, `polly-yuru-2`, `polly-yuru-3`, `polly-cik-0`, `polly-cik-1`, `polly-cik-2`, `polly-cik-3`
- **Yürüyüş:** zıplayarak, kabarık kanat yana açık.
- **Dönüş:** şapkası başında, kanatları düzgün; kanat çırparak seke seke.

### Sayfa 15 · Lokum I · bekleme (8, 420 × 460) → `lokum-bekle-0`, `lokum-bekle-1`, `lokum-bekle-2`, `lokum-bekle-3`, `lokum-bekle-4`, `lokum-sec`, `lokum-kalk-0`, `lokum-kalk-1`
- Patileri karnında, karnı guruldar. Boşta döngü:
  - 0: karnını tutuyor;
  - 1: karnına bakıyor;
  - 2: karnı hafif şişip iniyor;
  - 3: yanakları pembe, utanıyor;
  - 4: vurgu, karnından ses çizgileri, kulakları havada.

### Sayfa 16 · Lokum II · yürüyüş (8, 420 × 460) → `lokum-yuru-0`, `lokum-yuru-1`, `lokum-yuru-2`, `lokum-yuru-3`, `lokum-cik-0`, `lokum-cik-1`, `lokum-cik-2`, `lokum-cik-3`
- **Yürüyüş:** patileri karnında, ağır ağır.
- **Dönüş:** kuyruğu sallanarak, seke seke.

### Sayfa 17 · Bulut'un ikinci derdi · uğur böceği (6, 420 × 460) → `bulut-bocek-bekle-0`, `bulut-bocek-bekle-1`, `bulut-bocek-bekle-2`, `bulut-bocek-bekle-3`, `bulut-bocek-bekle-4`, `bulut-bocek-sec`
- Ateşi geçmiş Bulut (yanaklar normal), uzun kulağının dış tüylerinde küçük kırmızı uğur böceği. Boşta döngü:
  - 0: kulağına bakıyor;
  - 1: kıkırdıyor;
  - 2: böcek kulağın başka yerine geçmiş;
  - 3: omuzlarını kaldırıp gıdıklanıyor;
  - 4: vurgu, kahkaha, kulağı titriyor.
- `sec`: "ben mi?" yüzü; böcek kulakta.

### Sayfa 18 · Bulut'un ikinci derdi · yürüyüş (4, 420 × 460) → `bulut-bocek-yuru-0`, `bulut-bocek-yuru-1`, `bulut-bocek-yuru-2`, `bulut-bocek-yuru-3`
- Kulağındaki böceği düşürmemek için yavaş, kıkırdayarak, sağa doğru.
- Kalkış, mutlu dönüş ve mutlu oturuş Bulut'un ilk kareleriyle aynı.

### Sayfa 19 · Lokum'un ikinci derdi · Kuzu (6, 420 × 460) → `lokum-kuzu-bekle-0`, `lokum-kuzu-bekle-1`, `lokum-kuzu-bekle-2`, `lokum-kuzu-bekle-3`, `lokum-kuzu-bekle-4`, `lokum-kuzu-sec`
- Karnı geçmiş Lokum, kucağında oyuncak Kuzu (yanı sökük, pamuğu taşmış, bir düğme gözü yok). Boşta döngü:
  - 0: Kuzu'ya sarılmış;
  - 1: Kuzu'nun pamuğunu iteliyor;
  - 2: dudakları titriyor;
  - 3: Kuzu'yu öpüyor;
  - 4: vurgu, Kuzu'yu havaya kaldırıp gösteriyor, pamuk taşıyor.
- `sec`: "ben mi?" yüzü; Kuzu kucağında.

### Sayfa 20 · Lokum'un ikinci derdi · yürüyüş (4, 420 × 460) → `lokum-kuzu-yuru-0`, `lokum-kuzu-yuru-1`, `lokum-kuzu-yuru-2`, `lokum-kuzu-yuru-3`
- Kuzu'yu sıkıca tutarak, sağa doğru.

### Sayfa 21 · Mino'nun ikinci derdi · çıngırak (6, 420 × 460) → `mino-cingirak-bekle-0`, `mino-cingirak-bekle-1`, `mino-cingirak-bekle-2`, `mino-cingirak-bekle-3`, `mino-cingirak-bekle-4`, `mino-cingirak-sec`
- Dişleri geçmiş Mino; mavi önlüklü elbisesi, karnının yanında küçük ses çizgileri (yazı yok). Boşta döngü:
  - 0: karnına bakıyor;
  - 1: kulak kabartıyor;
  - 2: hafifçe zıplıyor;
  - 3: patisi yanağında, şaşkın;
  - 4: vurgu, zıpladığında karnından ses çizgileri.
- `sec`: "ben mi?" yüzü.

### Sayfa 22 · Mino'nun ikinci derdi · yürüyüş (4, 420 × 460) → `mino-cingirak-yuru-0`, `mino-cingirak-yuru-1`, `mino-cingirak-yuru-2`, `mino-cingirak-yuru-3`
- Her adımda karnından ses çizgisi, şaşkın şaşkın, sağa doğru.

### Sayfa 23 · Mutlu oturuş I (6, 420 × 460) → `zipzip-mutlu-0`, `zipzip-mutlu-1`, `mino-mutlu-0`, `mino-mutlu-1`, `bulut-mutlu-0`, `bulut-mutlu-1`
- İyileşmiş, yerinde mutlu oturuş; iki karede sağa sola sallanır.

### Sayfa 24 · Mutlu oturuş II (8, 420 × 460) → `mila-mutlu-0`, `mila-mutlu-1`, `pamuk-mutlu-0`, `pamuk-mutlu-1`, `polly-mutlu-0`, `polly-mutlu-1`, `lokum-mutlu-0`, `lokum-mutlu-1`
- Sayfa 23 ile aynı.

### Sayfa 25 · Pano çıkartmaları I (5, 300 × 300) → `cikartma-zipzip`, `cikartma-mino`, `cikartma-bulut`, `cikartma-mila`, `cikartma-pamuk`
- Yuvarlak çıkartma: hastanın gülen yüzü, kalın beyaz kenar, hafif parlak.

### Sayfa 26 · Pano çıkartmaları II (5, 300 × 300) → `cikartma-polly`, `cikartma-lokum`, `cikartma-lokum-kuzu`, `cikartma-bulut-bocek`, `cikartma-mino-cingirak`
- `cikartma-lokum-kuzu`: gülen Lokum ve yamalı Kuzu. `cikartma-bulut-bocek`: gülen Bulut ve kulağında uğur böceği. `cikartma-mino-cingirak`: gülen Mino ve boynunda çıngırak.
- Onu da aynı boy ve aynı kenar kalınlığında.

### Sesler (bizde)
- **Kino'nun 12 sözü:** karşılama, yedi "Gel …, sıra sende!", "Biraz sabır", "Yine mi geldin?", "Yaşasın, iyileşti!", "Pano doldu!". Kino'nun klonuyla kaydedildi, Scribe ile denetlendi.
- **8 efekt:** zil, kapı açılışı, kapı kapanışı, adım, oturuş, panoya yapışan çıkartma, konfeti patlangıcı, Mino'nun inlemesi.
- Hastaların dert efektleri vakalarından:
  - Zıpzıp'ın "ay"ı;
  - Bulut'un damlası;
  - Mila'nın kıkırdaması;
  - Pamuk'un hapşırığı;
  - Polly'nin kabaran tüyü;
  - Lokum'un karnının gurultusu;
  - uğur böceğinin tıkırtısı;
  - Kuzu'nun "mee"si;
  - Mino'nun çıngırağı.
