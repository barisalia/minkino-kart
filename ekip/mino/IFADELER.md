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
