# Mino ifade ekleri (mino-final.svg içinde, gizli)

Kaynak: Gemini çizimleri (`minkino-film-gemini/karpuz/mino-*.png`). mino-final ile piksel piksel hizalı (ölçek 1.000, kaydırma 0); yalnız yüz değişiyor.
Her ek, yüzün ilgili bölgesinden kesilmiş tek bir WebP `<image>`. Kenarları, alttaki vektör kafayla dikişsiz birleşsin diye yumuşatıldı. Hepsi `display="none"`, 2048 tuvalde yerinde, **kafaya bağlı** (rig'de `k` grubunun içine, ağız ve gözlerin üstüne).

| İfade | Göster | Gizle | Not |
|---|---|---|---|
| zorlanma (yanak şişik) | `yanak-zorlanma`, `goz-zorlanma` | `goz-sol`, `goz-sag`, kod ağzı (`m-agiz`), kod yanakları (`m-yanak`) | İkisini birlikte kullanın; yanak katmanı ağzı ve burnu da içerir. |
| sersem (mutlu) | `yanak-sersem`, `goz-sersem`, `agiz-sersem` | `goz-sol`, `goz-sag`, `m-agiz`, `m-yanak` | Göz kapakları yarı kapalı, allık koyu. |
| kararsız | `kas-kararsiz`, `agiz-kararsiz` | `m-agiz` | Gözler normal kalır; bakış kodla sağa-sola kayar. Kaşlar asimetrik (biri kalkık). |
| göz kırpma | `goz-kirp` | `goz-sol` | Sol göz kapalı; ağız kodla kapalı gülümseme (ω). Katman yalnız kapak ve kirpik çizgisi; altında normal vektör yüz (kürk/krem sınırı) görünür. |

`yanak-zorlanma`, kafa silüetinden taşan yanakların dış konturunu da içerir: fuların üstünde, iki yanda. Kafa hattına kendi çiziminden bağlanır.

SVG sırası (alttan üste): `yanak-zorlanma, goz-zorlanma, yanak-sersem, goz-sersem, agiz-sersem, kas-kararsiz, agiz-kararsiz, goz-kirp`.

rig.mjs için örnek (k grubunun sonuna):

```js
<g class="m-ifade m-zorlanma">${sade(katman('yanak-zorlanma'))}${sade(katman('goz-zorlanma'))}</g>
```

## Hâl ekleri (tam vektör, gizli; aynı dönme noktaları)

| Hâl | Göster (asıl grubun yerine) | Gizle | Not |
|---|---|---|---|
| sırılsıklam | `kafa-islak`, `govde-islak`, `kuyruk-islak` | `kafa`, `govde`, `kuyruk` | Kafa %89 ve gövde %80 genişlikte (tabandan), kuyruk ince ip. Renkler koyulaşmış, damlalar ve ıslak parlamalar grubun içinde. |
| pofuduk | `kafa-pofuduk`, `govde-pofuduk`, `kuyruk-pofuduk` (+ isteğe bağlı `kol-sol-pofuduk`, `kol-sag-pofuduk`) | `kafa`, `govde`, `kuyruk` (+ `kol-sol`, `kol-sag`) | Kabarmış tüy: silüet ~%15 şişkin ve yuvarlak, yanaklarda ve tepede iri kıvrık tutamlar, gövde yanlarında tutamlar, kuyruk kocaman fırça; içte kısa tüy çizgileri, alt-sağda sert gölge. Yüz (gözler, ağız) aynı. |

- Her hâl grubu, asıl grubun **z-sırasına** konur: `kuyruk-*` → `q`, `govde-*` → `g`, `kol-sol-*` → `kl`, `kol-sag-*` → `kr`, `kafa-*` → `k` sınıfı (kafa hâli göz ve ağız katmanlarının altında kalır). Fular, gözler ve ağız değişmez.
- Aynı hâlin üç parçası birlikte kullanılır. Karıştırma (ıslak kafa + pofuduk gövde) mümkün ama denenmedi.
- Önizleme: `mino-haller.png` (normal | ıslak | pofuduk; üstte açık, altta koyu zemin).

Uyarılar:
- sharp/librsvg gömülü WebP'yi çizmiyor. Bu, duruk `mino.webp` üretimini etkilemez, çünkü ekler gizli. Tarayıcıda (Edge ile denendi) sorunsuz çiziliyor.
- Önizleme: `mino-ifadeler.png` (normal, zorlanma, sersem, kararsız, göz kırpma).
- Sarılma pozu ayrı teslim edilecek: `assets/film/mino-karpuz/mino-sarilma-{arka,on}.webp` + hizalama JSON'u.

## Burun ekleri (Ege 8. sahne; tam vektör, gizli)

Hepsi `display="none"`, 2048 tuvalde yerinde, gömülü görsel yok (yalnız vektör, küçük). Ağız: `agiz` katmanı ya da kod ağzı (`m-agiz`), hangisi kullanılıyorsa.

| İfade | Göster | Gizle | Not |
|---|---|---|---|
| burun kaşıntısı | `goz-kasinti`, `burun-kasinti`, `agiz-kasinti` | `goz-sol`, `goz-sag`, ağız | Yarı kapalı, iç uçta kalkık kapaklar. Gözler şaşı, burna bakıyor; pınarlarda birer yaş damlası. Burun %14 geniş, delikleri açık, üstünde kırışık; iki yanda ve üstte seğirme çizgileri. "Haa" yarı açık ağız. |
| burun tut | `yanak-burun-tut`, `goz-burun-tut`, `kol-sol-burun`, `kol-sag-burun`, `pati-burun` | `goz-sol`, `goz-sag`, ağız, `kol-sol`, `kol-sag` | Kocaman şişkin gözler (beyaz göz akı, küçük iris). Yanaklar kafa silüetinden taşar, allık koyu; sıkılmış dalgalı ağız yanak katmanının içinde. İki kol omuzdan dik kalkar, iki pati burnu kapatır. |
| hapşu | `kafa-hapsu`, `goz-hapsu`, `agiz-hapsu`, `puf-hapsu` | `kafa`, `goz-sol`, `goz-sag`, ağız | Gözler sıkıca kapalı (> <), kocaman açık ağız. `kafa-hapsu`: kulakları geriye yatık kafa (kulaklar ~35° dışa döner, %85, kafanın arkasında kalır). `puf-hapsu`: kafa çevresinde sarsıntı çizgileri (koyu kenarlı açık renk, gece sahnesinde de görünür), iki yanda püf bulutları, damlacıklar. |

Bağlama ve z-sırası:
- Kafaya bağlı, `k` grubunun sonuna: `goz-*`, `burun-kasinti`, `agiz-*`, `yanak-burun-tut`, `pati-burun`, `puf-hapsu`.
- `kafa-hapsu`: hâl grupları gibi `kafa` yerine, `k` sınıfının z-sırasına konur (göz ve ağız eklerinin altında kalır).
- `kol-sol-burun`, `kol-sag-burun`: gövdeye bağlı (dönme noktası omuz: (892,1312) / (1156,1312)), ama kafanın ve fuların **üstünde** çizilir. Omuz ucunda kontur yok; kol gövdenin turuncu yanına karışır. `pati-burun` bunların da üstünde olmalı. Bilek pati altında kaldığı için küçük kafa hareketlerinde kopukluk görünmez.
- Öneri: hapşu anında `puf-hapsu` için ölçek 0.85 → 1.05 "pat" (merkez ~(1024,1080)) ve kafaya kısa bir sarsıntı.
- SVG sırası (alttan üste): `goz-kasinti, burun-kasinti, agiz-kasinti, yanak-burun-tut, goz-burun-tut, kol-sol-burun, kol-sag-burun, pati-burun, kafa-hapsu, goz-hapsu, agiz-hapsu, puf-hapsu`.
- Önizleme: `mino-burun-ifadeleri.png` (normal | burun kaşıntısı | burun tut | hapşu; üstte açık, altta koyu zemin).
- Varsayılan çizim değişmedi: ekler gizliyken önceki SVG ile piksel farkı 0.

## Film 2 ekleri: Kino ve Elma Kulesi (tam vektör, gizli)

| İfade | Göster | Gizle | Not |
|---|---|---|---|
| üzgün | `kafa-uzgun`, `goz-uzgun`, `agiz-uzgun` | `kafa`, `goz-sol`, `goz-sag`, ağız | Kulaklar yana sarkık (kulak ortasından dışa ~62°, %92, kafanın arkasında). Dış köşesi düşük eğik kapak (yalvaran bakış), iç ucu kalkık kaşlar, alt kapakta ıslak parıltı. Küçük aşağı kıvrık ağız. Gözyaşı yok (3 yaş için yumuşak). |
| şaşkın | `goz-saskin`, `agiz-saskin` | `goz-sol`, `goz-sag`, ağız | Kule yıkılırken. Kocaman beyaz gözler, iri iris, yüksek kalkık kaşlar, küçük "o" ağız. |
| odak | `goz-odak`, `agiz-dil` | `goz-sol`, `goz-sag`, ağız | Elmayı dizerken. Kısık gözler, bakış içe, düz kaşlar. ω ağız, dilin ucu sağ köşeden dışarıda. |

- `kafa-uzgun`: hâl grupları gibi `kafa` yerine, `k` sınıfının z-sırasına konur (göz ve ağız eklerinin altında kalır). Öbür ekler kafaya bağlı, `k` grubunun sonuna.
- Omuz düşürme ve parmak ucunda uzanma kodla yapılır (kol, gövde dönüşü); ayrı çizim yok.
- SVG sırası (alttan üste, dosyanın sonunda): `kafa-uzgun, goz-uzgun, agiz-uzgun, goz-saskin, agiz-saskin, goz-odak, agiz-dil`.
- Önizleme: `mino-film2-ifadeler.png` (normal | üzgün | şaşkın | odak; üstte açık, altta koyu zemin).
- Varsayılan çizim değişmedi: ekler gizliyken önceki SVG ile piksel farkı 0.

## "Elektrikler Kesildi!" eki: avlanan Mino (tam vektör, gizli, kafaya bağlı)

| İfade | Göster | Gizle | Not |
|---|---|---|---|
| av | `goz-av`, `agiz-av` | `goz-sol`, `goz-sag`, ağız | Kısık ve odaklı gözler: içe doğru alçalan üst kapak, kalkık alt kapak. Amber iriste dikey yarık kedi göz bebeği, tek keskin parıltı. İç uca doğru inen kararlı kaşlar. Ağız sıkılmış, bir yanı hafif kalkık. |

- Kalçanın hafif havada olduğu eğilme kodla yapılır (gövde ve kuyruk dönüşü); ayrı çizim yok.
- SVG'de dosyanın sonunda: `goz-av, agiz-av`. Önizleme: `mino-av.png` (normal | av).
- Varsayılan çizim değişmedi (piksel farkı 0).

## Dudak senkronu ağızları (tam vektör, gizli, kafaya bağlı)

Kod (`src/audio/dudak-mantik.ts`, `src/mino/mino.ts`) altısı birlikte varsa bunları kullanır. Konuşurken kod ağzı (`m-agiz`) gizlenir, o anki şekil gösterilir. Kontur #030102, 12 px (mevcut ağızlarla aynı). Burun altı çizgisi (1024,958→988) şekillerin içinde.

| Katman | Ses | Not |
|---|---|---|
| `agiz-kapali` | M, B, P | Sıkılmış, hafif kavisli düz dudak. **Değişti:** önceki `agiz-kapali` (kapalı ω gülümseme) artık `agiz-gulumse`. |
| `agiz-az` | kısa, kısık heceler | ω'nın altında küçük açıklık |
| `agiz-orta` | A | Varsayılan ağzın daha açık hâli (ω + U), dil görünür |
| `agiz-yuvarlak` | O, U | Yuvarlak açık ağız (önceki `agiz-acik` ile aynı biçim) |
| `agiz-dis` | İ, E, S | Geniş yayvan ağız, üst diş sırası |
| `agiz-gulumse` | susma / dinlenme | Kapalı ω gülümseme |

- SVG sırası: `agiz-kapali` grubunun hemen arkasında `agiz-az, agiz-orta, agiz-yuvarlak, agiz-dis, agiz-gulumse`.
- Yeni katmanlar `scripts/mino/rig.mjs` yeniden çalıştırılınca iskelete girer.
- Önizleme: `ekip/film/dudak-agizlari.png` (üst satır Mino, alt satır Kino; varsayılan ağız gizli, gerçek SVG'den).

## Kalkık kollar (el sallama, çak, uzanma, alkış)

Asıl kollar kafanın altında durduğu için 100° üstünde kafanın arkasına giriyordu. İki yeni gizli katman bu sorunu çözer.

| Katman | Dönme noktası | Açı | Not |
|---|---|---|---|
| `kol-sol-yukari` | 840,1290 (`KOL_SOL`) | 40°–160° | Asıl kolun vektör kopyası ve kürk renkli omuz başı (#fa9e3c). Omzun sırtında yarım yay kontur var. |
| `kol-sag-yukari` | 1205,1290 (`KOL_SAG`) | −40°…−160° | Aynaya göre aynı yapı |

- SVG'nin **en sonundadır**: kafa, göz ve ağız katmanlarının da önünde çizilir. Alkışta ve 160°'de pati yanağın önüne gelir.
- Kullanım: açı yaklaşık 30°'yi geçince `kol-sol` / `kol-sag` gizlenir, `-yukari` katmanı gösterilir ve aynı açıyla döndürülür. Tek kol da olur (örnek: sol 150°, sağ −20°, el sallama).
- Varsayılan çizimde piksel farkı 0 (2048 çözünürlükte ölçüldü).
- Önizleme: `ekip/mino/mino-kol-yukari.png` (0°, 40°, 90°, 130°, 160°, tek kol 150°; açık ve koyu zemin).

## Oturma

| Katman | Yerine geçtiği | Not |
|---|---|---|
| `govde-oturma` | `govde` | Gövdenin y 1672 altı kesilir (bacaklar gider). Altta iki yana taşan kucak var, uyluk kıvrım çizgileri ve öne uzanan iki krem pati (parmak çizgili). Zemin ≈ y 1845 (ayaktayken 1895). |
| `kuyruk-oturma` | `kuyruk` | Aynı kuyruk. Kökü kalçanın arkasında, sağ yanda yere yatık kıvrılır: `translate(-110,40) rotate(40 1260 1680)`. |

- SVG sırası: `kuyruk-oturma` asıl kuyruğun, `govde-oturma` asıl gövdenin hemen arkasında. Kollar, fular ve kafa üstte kalır, kalkık kollarla birlikte kullanılabilir.
- Kullanım: `govde` ile `kuyruk` gizlenir, `-oturma` katmanları gösterilir. Zemine tam oturtmak için bütün karakter yaklaşık 50 px aşağı kaydırılır.
- Varsayılan çizimde piksel farkı 0.
- Önizleme: `ekip/mino/mino-oturma.png` (ayakta, oturma, oturma + el sallama, oturma + alkış; açık ve koyu zemin).

## Film 3: düşünüyor, işaret, sarılma

| Katman | Poz | Not |
|---|---|---|
| `kol-sag-dusun` | düşünüyor | Ekranda sağdaki kol dirsekten bükülür, pati çenenin altındadır. `kol-sag` yerine gösterilir. |
| `goz-dusun` | düşünüyor | Asıl gözler; iris yukarı-sola bakar. Sol kaş kalkık, sağ kaş düz. `goz-sol` ve `goz-sag` yerine gösterilir. |
| `agiz-dusun` | düşünüyor | Yana kaymış kapalı "hımm" ağzı. `agiz` yerine gösterilir. |
| `goz-bak-sag` / `goz-bak-sol` | işaret | Asıl gözler; iris ekranda sağa ya da sola kayar. İşaret eden kolla birlikte kullanılır: `kol-sag-yukari` −85° (sağa) ya da `kol-sol-yukari` +85° (sola). |
| `kol-sol-sarilma` + `kol-sag-sarilma` | sarılma | İki kol göğüste çaprazlanır, patiler ortada birleşir. `goz-kapali` + `agiz-gulumse` ile kullanılır. |

- Bakış gözleri asıl göz çiziminden yapıldı: iris ve göz bebeği göz açıklığına kırpılıp kaydırıldı. Parıltılar, kapak ve kirpikler yerinde kalır.
- Bükük kollar kavisli kürk tüpüdür (kontur 13 px), omuz başında yarım yay vardır. SVG'nin en sonunda yer alır.
- Varsayılan çizimde piksel farkı 0.
- Önizleme: `ekip/mino/mino-film3.png`.
- **İkili sarılma (Mino + Kino, yan yana):** Mino `kol-sag-yukari` −100°, Kino `kol-sol-yukari` +100°; ikisinde de `goz-kapali` + `agiz-gulumse`. Mino önce çizilir, kolu Kino'nun arkasına geçer. Kino sonra çizilir, kolu Mino'nun omzunun önüne gelir. Kino, Mino tuvalinde x+1000, y+60 (aynı ölçek). Önizleme: `ekip/film/mino-kino-sarilma.png`.

## Dedektif Mino (şapka + büyüteç, vektör/bit eşlem, gizli; kafaya bağlı)

Kaynak: Gemini `minkino-film-gemini/dedektif/mino-dedektif-1.png`; şapka ve büyüteç kolu çokgenle kesilip Mino'nun ölçüsüne oturtuldu. Betik: `node ekip/illustrator/dedektif-mino.cjs` (tekrar çalıştırmak güvenli; mino-final.svg yeniden yazılırsa yeniden çalıştırın). Önizleme: `ekip/mino/mino-dedektif-onizleme.png`.

| Katman | Ne | Not |
|---|---|---|
| `sapka-dedektif` | Kareli dedektif şapkası (kurdele kafası dahil) | Kafaya bağlı, **tüm katmanların en üstünde** (gözlerin, ağzın, kulakların üstünde). Merkezi yüz ortasında (985), alt kenar ≈ y 560. Kulaklar şapkanın iki yanında görünür kalır. |
| `goz-buyutec` | Mino'nun kendi sol gözü (kafa + göz basılı), cam dairesine kırpılı, 1.25x büyütülmüş | `kol-buyutec`'in **altında** durur. Cam merkezi (738,779), yarıçap ≈ 190. Sabit resim: bakış ve göz kırpma kodla değişmez. |
| `kol-buyutec` | Halka (cam içi şeffaf) + cam parlaması + sap + el + kol | Gövde çizgisinde ve fular ucunun altında biten bir kırpma var (kol gövdenin önünde, fular kolun önünde). Cam parlaması vektör, halka/sap/el Gemini çiziminden. |

Kullanım: **göster** `sapka-dedektif` + `goz-buyutec` + `kol-buyutec`; **gizle** `kol-sol` (asıl sol kol) ve `goz-sol` (büyütülmüş göz yerine). Sağ kol, sağ göz, ağız, kuyruk olduğu gibi kalır. Sıra (alttan üste): … `goz-buyutec`, `kol-buyutec`, `sapka-dedektif` (dosya sonunda bu sırayla).
- Şapkayı büyüteçsiz de kullanabilirsiniz (yalnız `sapka-dedektif`); büyüteç şapkasız da olur.
- Kol, cam göze hizalı olduğu için kafayla birlikte döner (`k` grubunda). Eli kafa dönmesinde çok oynamaz çünkü el boyun hizasında (y ≈ 1235).
- Büyüteç açıkken göz kırpma atlanmalı: camdaki göz sabit bir resimdir, `goz-kapali` camın içine girmez.
