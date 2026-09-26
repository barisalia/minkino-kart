# Mino'nun son hâli: tasarımcı görevi (Adobe Illustrator)

**Öncelik: en yüksek.** Mino ana karakter; tüm oyunlarda görünüyor.

## Durum

Barış, Recraft pro vektörle çizilen yeni Mino'yu onayladı: `mino-a-kaynak.svg`, önizlemesi `mino-a-onizleme.png`. Tek eksik:

> "İlki güzel ama bir tık gölgelendirme olsaymış vücudunda, orası zayıf." (Barış)

Kafa iyi. **Gövde düz kalmış**, hacim yok.

## Yapılacak

### 1. Gövdeye hafif gölge (cel shading)

**Dozaj az olacak.** Barış parlak ve dokulu sürümü reddetti: "2D'den kopma."

- Tek ton daha koyu, **sert kenarlı** gölge şekilleri kullan (gradyan değil). Turuncu için yaklaşık `#E07A2E`, krem için yaklaşık `#E6CDB5`.
- Gölge nereye:
  - kafanın gövdeye düştüğü yer (boyun ve göğüs üstü, fuların altı),
  - gövdenin iki yanı,
  - kolların gövdeye değdiği iç kenarlar,
  - bacakların iç tarafı ve ayak tabanına yakın kısım,
  - kuyruğun alt kenarı.
- Göbekteki krem alanın yanlarına ince bir gölge koy; ortası açık kalsın.
- İstersen gövdeye 1-2 küçük parlaklık ekle (omuz üstü). Kafadaki parlaklıklardan daha az olsun.
- **Yapma:**
  - tüy ya da kıl dokusu,
  - yumuşak airbrush gradyan,
  - yeni çizgi ya da detay,
  - renk ve oran değişikliği.

Kafa, yüz ve gözlere dokunma.

### 2. Animasyon için katmanlara ayır (çok önemli)

Mino kodla canlandırılıyor: konuşurken ağız açılıyor, gözler kırpıyor, kafa sallanıyor, kuyruk sallanıyor, zıplıyor, dans ediyor.

Aşağıdaki grupları (layer / group) **tam bu adlarla** ayır. Her grup kendi başına tam çizilmiş olsun: kafa oynayınca altında boşluk görünmemeli, yani gövdenin boyun kısmı kafanın altına biraz uzasın.

| Grup adı | İçerik |
|---|---|
| `kuyruk` | Kuyruğun tamamı (en arkada) |
| `govde` | Gövde, bacaklar, ayaklar, göbek |
| `kol-sol` | Sol kol ve pati (izleyiciye göre sol) |
| `kol-sag` | Sağ kol ve pati |
| `fular` | Kırmızı fular |
| `kafa` | Kafa, kulaklar, yanaklar, burun (gözler ve ağız hariç) |
| `goz-sol`, `goz-sag` | Göz akı, iris, parlaklıklar, kirpikler |
| `agiz` | Ağız çizgisi, iç ağız, dil (kod bunu gizleyip kendi ağzını çizecek; yine de olsun) |

Katman sırası (arkadan öne): kuyruk, govde, kol-sol, kol-sag, fular, kafa, goz-sol, goz-sag, agiz.

### 3. Ek (varsa süre): göz kapağı ve ağız

- **`goz-kapali`:** iki gözün kapalı hâli, yay şeklinde iki çizgi.
- **`agiz-acik`:** "Aaa" diye açık ağız (iç ağız + dil).
- **`agiz-kapali`:** kapalı gülümseme (ω).

Bu üç gruba gözü kapalı katman (görünmez) olarak ekle.

## Teslim

Aşağıdaki dosyaları ekip dalıyla GitHub'a gönder ve ORTAK_NOTLAR'a bir satır yaz. Claude alıp iskeleti kurar, tüm oyunlarda eski Mino'nun yerine koyar.

- `ekip/mino/mino-final.svg`
  - Illustrator'da Export > SVG.
  - Styling: **Presentation Attributes**.
  - Object IDs: **Layer Names**.
  - "Minify" kapalı.
- `ekip/mino/mino-final.png`: 2048 px önizleme, şeffaf zemin.
