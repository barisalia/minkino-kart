# Pamuk ifadeleri ve ağızları (pamuk-final.svg içinde, gizli)

Hepsi vektör (Mino'daki gibi), `display="none"`, 2048 tuvalde yerinde, **kafaya bağlı** (`bagli: kafa`, dönme noktası gözler `goz-kapali` ile, ağız `agiz` ile aynı). Önizleme: `pamuk-final-ifadeler.png` (varsayılan, utanmış, üzgün, mutlu, orta ağız; açık ve koyu zemin).
Betikler (teslim.ps1 SVG'yi baştan yazarsa sırayla yeniden çalıştırılır, ikisi de tekrar çalıştırmaya güvenli):

```
node ekip/illustrator/pamuk-agiz.cjs
node ekip/illustrator/pamuk-ifade.cjs
```

## Dudak senkronu ağızları (asıl `agiz`'in yerine gösterilir)

`agiz-kapali`, `agiz-az`, `agiz-orta`, `agiz-yuvarlak`, `agiz-dis`, `agiz-gulumse`. Köşe ve burun-ağız çizgisi asıl ağızla aynı hizada (ω uçları 900,958 ve 1122,958; orta 1010,959).

## İfadeler (`pamuk-final.json` → `ifadeler`)

| İfade | Göster | Gizle | Not |
|---|---|---|---|
| utanmış | `yanak-utanmis`, `goz-utanmis`, `agiz-utanmis`, `kulak-sol-dusuk`, `kulak-sag-dusuk` | `goz-sol`, `goz-sag`, `agiz`, `kulak-sol`, `kulak-sag` | İri pembe yanaklar ve çizgiler, yarı kapalı aşağı bakan gözler, küçük dalgalı ağız, kulaklar yanlara düşük. |
| üzgün | `goz-uzgun`, `agiz-uzgun`, `kulak-sol-dusuk`, `kulak-sag-dusuk` | `goz-sol`, `goz-sag`, `agiz`, `kulak-sol`, `kulak-sag` | Kapaklar dış köşeden aşağı, ıslak parlama, alt gözyaşı çizgisi ve damla, aşağı kıvrık ağız, kulaklar düşük. |
| mutlu | `goz-mutlu`, `agiz-mutlu`, `yanak-mutlu` | `goz-sol`, `goz-sag`, `agiz` | ^ ^ gülen gözler, büyük açık gülüş (dil görünür), hafif allık. Kulaklar yerinde. |

## Notlar

- **Düşük kulaklar** (`kulak-sol-dusuk`, `kulak-sag-dusuk`): asıl kulak resimleri kafa kubbesinin merkezi (1005,830) etrafında ±24° döndürülmüş. Kulak katmanı başın dışında kalan hilal parçası olduğu için, kafa çizgisi boyunca kayarak kesik kenarı gizli tutar; kulak sap ucu yana ve aşağı iner. Asıl kulaklar (`kulak-sol/sag`) ifade gösterilirken gizlenir.
- **Kafa katmanı temizliği**: `kafa` resminin tepesinde kulak çizgilerinden kalan kısa çizikler (kubbe çizgisinin dışına taşan) vardı; varsayılan hâlde kulakların altında görünmüyordu ama kulaklar oynayınca ortaya çıkıyordu. `pamuk-ifade.cjs` bunları siler (açma işlemi, yalnız kafa tepesi). Kulaklar kafaya göre dönerken/oynarken artık temiz.
- Gözler utanmış ve üzgünde asıl göz resimlerinin kapak çizgisiyle kırpılmış hâlidir (göz iriliği ve parlaması aynı); mutlu gözlerde göz resmi yoktur, yalnız ^ çizgisi.
- Mino ve Kino'daki gibi bakış ve ağız kodla yönetilir; ifade grupları yalnız göster/gizle listesidir.
