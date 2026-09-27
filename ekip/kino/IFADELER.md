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
