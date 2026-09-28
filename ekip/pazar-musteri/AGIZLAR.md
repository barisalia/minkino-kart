# Pazar hayvanları: dudak senkronu ağızları

Kod `src/audio/dudak-mantik.ts` şu altı adı tanır: `agiz-kapali`, `agiz-az`, `agiz-orta`, `agiz-yuvarlak`, `agiz-dis`, `agiz-gulumse`. Konuşurken `agiz` gizlenir, o anki şeklin katmanı gösterilir.

## Kürklü hayvanlar (önden iskelet): köpek, tavşan, ayı, inek, maymun
Her `ekip/pazar-musteri/<ad>.svg` dosyasına `agiz` grubunun hemen arkasına altı gizli vektör ağız eklendi. json'da `sira`, `gizli`, `bagli` (→ `kafa`) ve `donme` (= `agiz` noktası) güncel. Renkler ve çizgi kalınlığı her hayvanın kendi ağzından ölçüldü.

| Hayvan | Stil |
|---|---|
| köpek | kalın koyu hilal gülüş (kapalı = ince hilal, açıkta üst diş şeridi) |
| tavşan, ayı | burundan inen çizgi ve ω yay (ayıda dişli) |
| inek, maymun | tek yay gülüş, uçta küçük kanca; açıkta yay altına sarkan ağız |

- Eski ağızdan kafa katmanında kalan izler temizlendi (tavşanda burun altındaki leke, inekte ve maymunda ağız kırıntıları). Dinlenme çizimi değişmedi.
- Betik: `ekip/illustrator/pazar-agiz.cjs <ad> <svg> <json...>`. `teslim.ps1` SVG'yi yeniden yazarsa yeniden çalıştırılmalı (tekrar çalıştırmak güvenli).
- Önizleme: `ekip/film/agiz-pazar.png` (üstte açık, altta koyu zemin).

## Gagalı hayvanlar: ördek, kuş
Bunlarda ağız şekli ayrı katman değil, **gaganın açılma seviyesidir**. Kod (`karakter.ts`) alt gagayı (`gaga-alt`) menteşesinden döndürür, içi (`gaga-ic`) görünür. Açıklık: kapali 0, gulumse 0, dis 0.3, az 0.35, yuvarlak 0.7, orta 0.9.
- **Ördek:** `gaga`, `gaga-alt`, `gaga-ic` zaten vardı, değişiklik yok.
- **Kuş:** gaga tek parçaydı. Şimdi üst gaga (`gaga`), alt gaga (`gaga-alt`, menteşe 1025,600) ve koyu iç (`gaga-ic`) olmak üzere üç katman. İç, açılınca alt gaganın üstünde koyu bordo görünür. `kus.svg/.json` yeniden üretildi, dinlenme farkı 0.
- Önizleme: `ekip/film/gaga-seviye.png` (kapalı, 0.3, 0.35, 0.7, 0.9; üstte kuş, altta ördek).
