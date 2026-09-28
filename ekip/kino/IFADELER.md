# Kino yüz ifadeleri (kino-final.svg içinde, gizli)

Tasarımcı çizimi, **vektör**, Kino'nun dilinde: koyu dolgulu parlak gözler, kalın kahve kontur (#3A1210), pembe dil (#EC7683). Hepsi `display="none"`, 2048 tuvalde yerinde, **kafaya bağlı** (kino-final.json `bagli`). Kafa katmanında gözlerin ve ağzın altı temiz dolduruldu (göz lekesi dahil): asıl yüz katmanları gizlenince boş yüz lekesiz kalır. Kulak hareketleri iskeletten gelir; bu ekler yalnız yüzdür.

İfade = `goz-sol`, `goz-sag`, `agiz`, `dil` gizlenir, aşağıdaki ekler gösterilir.

| İfade | Göster | Not |
|---|---|---|
| normal | (asıl katmanlar) | |
| heyecan | `goz-heyecan`, `agiz-heyecan` | gözler kapalı gülen hilal, kocaman gülüş, dil dışarıda sarkık |
| sıcak ("Ay sıcak!") | `goz-sicak`, `agiz-sicak` | iri gözler (beyaz akı + küçük iris), kaşlar yukarıda, alında ter damlası, küçük "o" ağız |
| titreme | `goz-titreme`, `agiz-titreme` | sıkık gözler (>  <), endişeli kaşlar, takırdayan dişler (zikzak). Titreme hareketini kod verir (kafaya küçük hızlı sallantı) |
| keyif ("Ooh") | `goz-keyif`, `agiz-keyif` | yarı kapalı gözler, rahat ω gülümseme |
| uluma | `goz-uluma`, `agiz-uluma` | gözler kapalı, yuvarlak "uuu" ağız. Baş yukarı: kafa katmanını döndürün (ör. kafa −15°) |
| üzgün | `goz-uzgun`, `agiz-uzgun` | kaşlar içe (iç uçlar yukarı), ıslak parlak gözler, aşağı kıvrık ağız |
| şaşkın | `goz-saskin`, `agiz-saskin` | iri gözler, kalkık kaşlar, küçük ağız |

Ayrıca:
- `kopuk-sac`: başın üstünde köpükten kabarık "saç" (kabarcık yığını + uçuşan küçük kabarcıklar). Herhangi bir ifadeyle birlikte gösterilir, hiçbir şeyi gizlemez. Kafaya bağlı; SVG'de en üstte (kulakların da üstünde).
- Mevcut gizli ekler duruyor: `goz-kapali`, `agiz-acik`, `agiz-kapali`, `dil-disarida`.
- Kaşlar ayrı katman değil; kaş gereken ifadelerde (sıcak, titreme, üzgün, şaşkın) göz ekinin içinde.
- Dönme noktaları (kino-final.json): gözler 965,758 · ağızlar 915,990 · köpük 955,230 (hepsi kafaya bağlı; kafa 975,1180 etrafında döner).
- Önizleme: `kino-ifadeler.png` (üstte açık, altta koyu zemin).
- Not: Barış başka Kino tasarımı seçerse ekler yeniden çizilir; katman adları aynı kalır.

## Film 2 eki: kuyruğunu basıp tutan Kino (vektör, gizli)

| Hâl | Göster | Gizle | Not |
|---|---|---|---|
| kuyruğu patiyle bastırılmış | `pati-kuyruk` | `kuyruk` | Asıl kuyruk kalınlığında ve boyunda. Kökten bacağın sağından kıvrılıp yere iner. Kahverengi uç sağ arka patinin altında yassı ve ezik; yalnız patinin sağında ve altında görünür. Ucun sağında iki küçük sıkışma çizgisi var. |

- Katman gövdenin altında: SVG'de ve json `sira`da `kuyruk`un hemen arkasında. Pati gövde katmanında olduğu için kuyruğun üstünde kalır, "basıyor" görünür.
- Kök, eski kuyruğun kol ve bacak yanındaki kontur uçlarına oturur; `kuyruk` gizlenince bu uçlar açıkta kalmaz.
- Dönme noktası 1330,1620 (kök). Bağlı değil, `kuyruk` gibi üst düzey. Sallanma isteniyorsa kod ucu (1400,1885) çevresinde küçük titretir; kök dönmesi ±3°'yi geçmesin, yoksa pati altından kayar.
- Önizleme: `kino-pati-kuyruk.png` (solda normal, sağda pati-kuyruk).

## "Elektrikler Kesildi!" eki: korkmuş Kino (vektör, gizli)

| Hâl | Göster | Gizle | Not |
|---|---|---|---|
| korku | `kafa-korku`, `goz-korku`, `agiz-korku`, `kuyruk-korku` | `kulak-sol`, `kulak-sag`, `goz-sol`, `goz-sag`, `agiz`, `dil`, `kuyruk` | Kulaklar başa yapışık: asıl kulaklar kökten içe döner, %74 daralır, kafanın arkasına geçer. Yalnız yanlarda kahve şerit görünür. Gözler iri, koyu ve parlak; altta ıslak ışık, iç ucu kalkık endişeli kaşlar, iki yanda titreme çizgileri. Ağız küçük ve titrek dalgalı. Kuyruk bacak arasına sıkışık, kahve uç iki ayağın arasında görünür. |

- `kafa-korku`: SVG ve json `sira`da `kafa`nın hemen önünde (kafanın arkasında), kafaya bağlı, dönme noktası kafayla aynı (975,1180).
- `goz-korku`, `agiz-korku`: `agiz-saskin`ın arkasında, kafaya bağlı; dönme noktaları 965,758 ve 915,990.
- `kuyruk-korku`: `kuyruk` ve `pati-kuyruk`un arkasında, gövdenin altında (yalnız bacak arası görünür). Bağlı değil; dönme noktası 1052,1600.
- Büzülme (gövde hafif basık, kafa omuzlara gömülü) kodla yapılır.
- Önizleme: `kino-korku.png` (normal | korku). Varsayılan çizim değişmedi (piksel farkı 0).

## Dudak senkronu ağızları (vektör, gizli, kafaya bağlı)

Kod (`src/audio/dudak-mantik.ts`) altısı birlikte varsa bunları kullanır. Konuşurken `agiz` ve `dil` gizlenir, o anki şekil gösterilir. Kontur #3A1210 (ω 18 px, açık ağız 16 px, az 14 px); ağız içi #3A1210, dil #EC7683, dişler beyaz.

| Katman | Ses | Not |
|---|---|---|
| `agiz-kapali` | M, B, P | Sıkılmış, hafif kavisli düz dudak. **Değişti:** önceki `agiz-kapali` (görsel) bu vektörle değiştirildi. |
| `agiz-az` | kısa, kısık heceler | ω'nın altında küçük açıklık |
| `agiz-orta` | A | ω + derin açık ağız, dil görünür |
| `agiz-yuvarlak` | O, U | Yuvarlak "o" ağız (`agiz-uluma` biçiminin 10 px yukarısı) |
| `agiz-dis` | İ, E, S | Geniş ağız, dişler görünür |
| `agiz-gulumse` | susma / dinlenme | `agiz-keyif` ile aynı rahat ω |

- kino-final.json güncellendi: altısı `sira`da `agiz-kapali`nın arkasında, `gizli`de, `bagli` → `kafa`. Dönme noktası 915,990 (`agiz-kapali` eski noktasında, 910,930).
- Önizleme: `ekip/film/dudak-agizlari.png` (üst satır Mino, alt satır Kino).
