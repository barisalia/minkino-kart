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
| pofuduk | `kafa-pofuduk`, `govde-pofuduk`, `kuyruk-pofuduk` | `kafa`, `govde`, `kuyruk` | Dış kontur bulut gibi tüylü; kuyruk kocaman fırça. İç çizgiler ve desenler asıl çizimle aynı. |

- Her hâl grubu, asıl grubun **z-sırasına** konur: `kuyruk-*` → `q`, `govde-*` → `g`, `kafa-*` → `k` sınıfı (kafa hâli göz ve ağız katmanlarının altında kalır). Kollar, fular, gözler ve ağız değişmez.
- Aynı hâlin üç parçası birlikte kullanılır. Karıştırma (ıslak kafa + pofuduk gövde) mümkün ama denenmedi.
- Önizleme: `mino-haller.png` (normal | ıslak | pofuduk; üstte açık, altta koyu zemin).

Uyarılar:
- sharp/librsvg gömülü WebP'yi çizmiyor. Bu, duruk `mino.webp` üretimini etkilemez, çünkü ekler gizli. Tarayıcıda (Edge ile denendi) sorunsuz çiziliyor.
- Önizleme: `mino-ifadeler.png` (normal, zorlanma, sersem, kararsız, göz kırpma).
- Sarılma pozu ayrı teslim edilecek: `assets/film/mino-karpuz/mino-sarilma-{arka,on}.webp` + hizalama JSON'u.
