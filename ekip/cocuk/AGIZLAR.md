# Çocuklar: dudak senkronu ağızları (Ada, Can, Elif, Deniz, Zeynep)

Her `ekip/cocuk/<ad>.svg` dosyasına altı gizli katman eklendi. Katmanlar `agiz-gulus` grubunun hemen arkasındadır. json'da `sira` ve `gizli`ye eklendiler; `bagli` değerleri `kafa`, `donme` noktaları çocuğun `agiz` noktasıdır.

| Katman | Ses | Nasıl yapıldı |
|---|---|---|
| `agiz-kapali` | M, B, P | Vektör; hafif kavisli dudak ve silik alt dudak gölgesi |
| `agiz-az` | kısa heceler | Vektör; küçük açık gülüş, üst dişler ve dil |
| `agiz-orta` | A | Çocuğun kendi büyük gülüş ağzı (`agiz`), %78 küçültülmüş |
| `agiz-yuvarlak` | O, U | Çocuğun kendi "o" ağzı (`agiz-acik`), %110 |
| `agiz-dis` | İ, E, S | Vektör; geniş ağız, üst ve alt diş sırası |
| `agiz-gulumse` | susma / dinlenme | Çocuğun kendi kapalı gülüşü (`agiz-gulus`) |

- Renkler her çocuğun kendi ağız resminden alındı (çizgi, ağız içi, dil). Ölçüler kapalı gülüşün boyundan çıkarıldı.
- Konuşurken `agiz` gizlenir, o anki şekil gösterilir. Kod (`src/audio/dudak-mantik.ts`) bu adları tanır.
- Varsayılan çizimlerde piksel farkı 0.
- Önizleme: `ekip/cocuk/cocuk-agizlar.png` (satırlar: Ada, Can, Elif, Deniz, Zeynep; üstte açık, altta koyu zemin).
