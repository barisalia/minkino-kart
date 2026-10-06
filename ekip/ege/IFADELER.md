# Ege yüz ifadeleri (ege.svg içinde, gizli)

Tasarımcı çizimi, **vektör** (Ege'nin kontur rengi #4A1A17, kaş #7A4A3E, ağız içi #6B2A26, dil #E8857A). Hepsi `display="none"`, 2048 tuvalde yerinde, **kafaya bağlı** (ege.json `bagli`). Kafa katmanında gözlerin, kaşların ve ağzın altı ten rengiyle düzgün doldurulmuştur: asıl katmanlar gizlenince yüz boş ve lekesiz kalır.

İfade = aşağıdaki "Gizle" katmanlarını gizle, "Göster" eklerini göster.

| İfade | Göster | Gizle |
|---|---|---|
| normal | (yok) | (yok) |
| ağlıyor ("ıngaa") | `goz-agliyor`, `agiz-agliyor` | `goz-sol`, `goz-sag`, `kas`, `agiz` |
| am (yemek) | `agiz-am` | `agiz` |
| mamalı | `agiz-am` (ya da `agiz`), `yanak-mamali` | `agiz` (am ile) |
| kıkırdıyor | `goz-kikir`, `agiz-kikir` | `goz-sol`, `goz-sag`, `agiz` |
| kahkaha | `goz-kikir`, `agiz-kahkaha` | `goz-sol`, `goz-sag`, `agiz` |
| şaşkın "Ooo" | `goz-saskin`, `agiz-saskin` | `goz-sol`, `goz-sag`, `kas`, `agiz` |
| dudak büzük | `agiz-buzuk` | `agiz` |
| esniyor | `goz-esniyor`, `agiz-esniyor` | `goz-sol`, `goz-sag`, `agiz` |
| uyuyor | `goz-uyku` (+ istenirse `agiz-uyku-gulus`) | `goz-sol`, `goz-sag` (+ `agiz`) |
| uykuda gülümsüyor | `goz-uyku`, `agiz-uyku-gulus` | `goz-sol`, `goz-sag`, `agiz` |
| bir göz açık | `goz-tek-acik` (+ örn. `agiz-kikir`) | `goz-sag` (+ `agiz`) |

Notlar:
- `goz-agliyor` ve `goz-saskin` kendi kaşlarını içerir (endişeli / kalkık), bu yüzden `kas` gizlenir. Diğerlerinde normal kaşlar kalır.
- `goz-agliyor` gözyaşı dereleri ve damlaları içerir. Damlalar kod ile ayrıca düşürülecekse bu ek olduğu gibi kalabilir.
- `goz-tek-acik`: sol göz (izleyiciye göre sol) açık kalır, sağ göz kapalı kavis.
- `yanak-mamali` yalnız lekelerdir; herhangi bir ağızla birlikte kullanılabilir.
- Mevcut `goz-kapali` (basit kapalı göz) da duruyor; uyku için `goz-uyku` (kirpikli) daha yumuşak.
- Dönme noktaları (ege.json): gözler 1033,668 · ağızlar 1026,846 · yanak 1026,860 (hepsi kafaya bağlı; kafa 1020,1020 etrafında döner).
- SVG sırası (alttan üste): `yanak-mamali`, göz ekleri, ağız ekleri — asıl yüz katmanlarının üstünde.
- Önizleme: `ege-ifadeler.png` (üstte açık, altta koyu zemin; normal + 10 ifade).

## Baş çevirme (3/4, sola / sağa)

Her kafaya bağlı katmanın iki yönlü sürümü var: `<katman>-sola` (yüz izleyicinin **soluna** döner) ve `<katman>-saga` (sağına). Toplam 42 gizli grup:
`kafa`, `kas`, `agiz`, `goz-sol`, `goz-sag`, `goz-kapali` ve 15 ifade ekinin tamamı (ör. `goz-kikir-saga`, `agiz-kahkaha-sola`).

Kural: baş dönükken, görünen her kafa katmanı **X** yerine **X-sola** (ya da **X-saga**) gösterilir. Örnek, sağa dönük kahkaha: `kafa-saga`, `kas-saga`, `goz-kikir-saga`, `agiz-kahkaha-saga` görünür; `kafa`, `kas`, `goz-sol`, `goz-sag`, `agiz` gizlenir.

- Kafa dış çizgisi aynı kalır; yüz (göz, kaş, burun, ağız, allık, saç tutamı) dönüş yönüne ~90 px kayar. Dönülen taraftaki göz daralır, karşı göz hafifçe açılır. Dönülen taraftaki kulak kafaya doğru daralır (arkaya kaçar), karşı kulak biraz genişler.
- Aynı dönme noktası (kafa 1020,1020), aynı bağlılık (kafa). Dönüş sırasında dönük hâlle normal arasında geçiş için iki kare yeterli (ön → yan); istenirse araya ara kare üretilebilir.
- Önizleme: `ege-bas-cevirme.png` (sütunlar: sola | ön | sağa; satırlar: normal, kıkır, kahkaha, şaşkın).

## Anne: konuşma iskeleti (`ekip/ege/anne.svg` + `anne.json`)

Kaynak `assets/ege/anne.webp` (428×1143, ayakta pozu). Aynı tuvalde, aynı piksel ölçeğindedir.

| Katman | Not |
|---|---|
| `govde` | anne.webp. Ağız bölgesi (x 162–266, y 438–466) üstten alta ara değerle ten rengine boyanmıştır (kayıpsız WebP). |
| `agiz` | Asıl ağız kırpıntısı (x 158, y 434, 112×36). Varsayılan görüntü anne.webp ile birebir aynıdır (tam çözünürlükte piksel farkı 0). |
| `agiz-kapali`, `agiz-az`, `agiz-orta`, `agiz-yuvarlak`, `agiz-dis` | Gizli vektör ağızlar. Çizgi #1e0000 (2.4 px), ağız içi #6e1f22, dil #e0707a, diş #fbf6f2. |
| `agiz-gulumse` | Gizli; asıl kapalı gülüşün kopyası (dinlenme ağzı). |

- Konuşurken `agiz` gizlenir ve o anki şekil gösterilir (çocuklarla aynı adlar).
- Hepsi `govde`ye bağlıdır; dönme noktası 213.5,452.
- Önizleme: `ekip/ege/anne-agizlar.png` (açık ve koyu zemin).
- Kanepe ve sarılma pozlarında (`anne-sariliyor.webp`, `anne-uyuyor-*`) konuşma ağzı henüz yoktur. Gerekirse aynı yöntemle eklenir.

### Anne: göz kırpma (`goz-kapali`, gizli)
- Hem `anne.svg` (ayakta) hem `anne-sariliyor.svg` (sarılma pozu; yeni, yalnız `govde` + `goz-kapali`) için gizli `goz-kapali` katmanı: kapalı, gülümseyen gözler (∩ yay + 3 kirpik; göz kapağı rengi göz akının yerini alır, blush korunur). Bölgenin yamasıdır (yama dışı şeffaf), `govde`ye bağlı, dönme noktası göz hizasının ortası (anne 213.5,412; sarılma 437.5,294.5).
- Kırpmak için: `goz-kapali` göster, ~120 ms sonra gizle. Varsayılan çizim değişmez (govde ve agiz dokunulmadı; tüm opak piksellerde fark 0).
- Önizleme: `ekip/ege/anne-goz-onizleme.png` (üst: ayakta, alt: sarılma; sütunlar: açık | kapalı | kapalı koyu zemin). Üretim: `node ekip/illustrator/anne-goz.cjs` (idempotent), ardından `node scripts/karakter/iskelet-al.mjs`.
