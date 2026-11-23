# Doktor-K1 çizimlerini bağlama

Paket Doktor-K1'in ("Önce Kuzu", 68 çizim) çizimleri gelince tek komut:

```powershell
npx vite-node doktor/araclar/bagla.ts
```

Komut üç iş yapar ve hiçbir dosyayı silmez:

1. `ekip/doktor/k1-kaynak/` klasöründeki yeni dosyaları işler: zemini temizler, tuval boyutuna getirir, `assets/doktor/zipzip-diz/<ad>.webp` yazar.
2. `assets/doktor/zipzip-diz/` içindeki bütün K1 çizimlerini denetler. Astra çizimi doğrudan oraya yazdıysa da denetim çalışır.
3. `output/doktor/k1-onizleme/index.html` sayfasını üretir: her çizim %100 boyda, diziler sahnedeki hızla.

68 çizimin hepsi hedefte ve hatasızsa sahne kendiliğinden açılır: `doktor/index.html?sahne=once-kuzu`.

## Çizim gelince sıra

1. Komutu çalıştır. 68 kaynak yaklaşık 30 saniyede işlenir; yalnız denetim 10 saniye sürer.
2. `output/doktor/k1-onizleme/index.html` sayfasını aç.
3. **Sahne provası:** Zıpzıp masaya, Kino yere oturuyor mu; boylar birbirine ve odaya uyuyor mu. Uymuyorsa çizimi beklemeden Astra'ya ölçüyle yaz.
4. **Çizimler:** boyu %100 yap, her çizimde uzuvları say. Özetteki "Bakılacak çizimler" listesini bitir.
5. **Diziler ve ağızlar:** gerçek hızda oynat; kayan, sıçrayan ya da ağzıyla birlikte gövdesi oynayan çizimi not et.
6. **Nokta ölçme:** `zipzip-saklan-3` ve `-4`te Kuzu'nun göğsüne, `kino-egil-3`te açık avuca, `zipzip-yakin-dinle`de kalbe ve boş göğüs alanının köşelerine, fonda pencerenin köşelerine tıkla. Listedeki sayıları `doktor/src/once-kuzu/yerlesim.ts` içindeki `HEDEF` ve `PERDE` değerlerine yaz.
7. 68 çizim tamam ve hatasızsa sahneyi aç: `doktor/index.html?sahne=once-kuzu`. Baştan sona gerçek sesle oynat, videodan kare çıkar, yöneticiye bildir.

## Astra'dan ne gelirse ne olur

| Gelen | Nereye konur | Betik ne yapar |
|---|---|---|
| Bitmiş `.webp`, doğru tuvalde (brief'in istediği) | `assets/doktor/zipzip-diz/` | Yalnız denetler ve önizlemeye koyar. |
| Tek çizim, adı doğru, **macenta** zemin (`zipzip-tirman-0.png`) | `ekip/doktor/k1-kaynak/` | Macentayı siler, mor saçağı temizler, webp yazar. |
| Tek çizim, adı doğru, **şeffaf** zemin | kaynak klasörü | Saydamlığı korur, kırıntıyı siler, webp yazar. |
| Tuvalle aynı oranda ama başka çözünürlükte çizim | kaynak klasörü | Tuval boyutuna ölçekler. Büyüttüyse "bulanık olabilir" diye uyarır. |
| **Sayfa** (bir çağrının bütün pozları tek resimde) | kaynak klasörü, adı sayfa anahtarı: `a1.png` | Pozlara böler, her pozu tuvaline oturtur. Aşağıya bakın. |
| Beyaz ya da düz renk zemin | kaynak klasörü | Yazmaz. Şeffaf ya da macenta istenir. |
| Sıkı kırpılmış tek poz (oranı tuvalden farklı) | kaynak klasörü | Sayfadaki poz gibi oturtur: ölçeği sayfanın ayakta pozundan, yeri brief'in çapasından alır. Bilmediğini tahmin eder ve işaretler. |
| Ayrı pozlar alt klasörde (`zipzip-tirman/00.png` …, `a3/0.png` …) | kaynak klasörü | Klasör adı sayfa anahtarı ya da dizi önekidir; numara sayfadaki sıradır (0'dan başlar). Her dosya tek çizim gibi işlenir. |
| Tanımadığı ad | kaynak klasörü | Atlar ve söyler. |

Sayfa anahtarları brief'teki sırayla: `a1`…`a5` (Zıpzıp orta plan), `b1`…`b8` (yakın plan), `c1`…`c5` (Kino), `d1` stetoskop, `d2` fon, `d3` masa, `d4` perde. Dizi öneki de olur: `zipzip-tirman.png`, `kino-gul.png`.

Kaynak dosyası hedefteki çizimden eskiyse atlanır. Hepsini yeniden işlemek için:

```powershell
npx vite-node doktor/araclar/bagla.ts -- --zorla
```

Yalnız bir sayfa ya da çizim için:

```powershell
npx vite-node doktor/araclar/bagla.ts -- --yalniz a1,stetoskop --zorla
```

## Sayfa gelirse

- Izgarayı betik kendisi bulur (6 poz için 3 × 2 ya da 6 × 1). Bulamazsa dosya adına yazın: `a1@3x2.png`.
- Pozların sırası soldan sağa, yukarıdan aşağı; adlar brief'teki sırayla verilir.
- **Ölçek:** sayfada ayakta bir poz varsa (A1'de `zipzip-tirman-0` 1000 px, Kino sayfalarında ilk poz 1090 px) ölçek ondan hesaplanır. Oturuş ve yakın plan sayfalarında ayakta poz yoktur; betik aynı karakterin bilinen ölçeğini kullanır ve "ölçeği tahmin" diye işaretler.
- **Yer:** brief'in yerini verdiği pozlar (ayakta duranlar) doğru oturur. Öbürleri karakter ekseninde yer çizgisine konur ve "yeri tahmin" diye işaretlenir.
- **Hizalama:** karakter pozu, yere bastığı yerin ortasından (alt temas) hizalanır; kol ya da kuyruk yana uzanınca gövde kaymaz. Eşya ve yakın plan, kutusunun ortasından hizalanır.
- Tahminleri düzeltmek için kaynak klasörüne `yerlesim.json` yazın, sonra `--zorla` ile yeniden çalıştırın:

```json
{
  "olcek": { "zipzip": 2.26, "kino": 2.4 },
  "sayfa": { "a2": { "olcek": 2.3 } },
  "cizim": { "zipzip-tirman-3": { "capa": [640, 1180] } }
}
```

`capa`, pozun **alt-orta** noktasının tuvalde oturacağı pikseldir. Betiğin kullandığı değerler `output/doktor/k1-onizleme/yerlesim-kullanilan.json` dosyasına yazılır; oradan kopyalayıp düzeltin.

Sayfadaki poz küçükse (ortak arşivdeki 1774 × 887 sayfada bir poz en çok 440 px) tuvale oturması için iki kattan fazla büyütülür. Betik bunu uyarı olarak yazar; elit çıta için o sayfa tam çözünürlükte yeniden istenir.

## Önizleme sayfası

`output/doktor/k1-onizleme/index.html` dosyasını tarayıcıda açın.

- **Özet:** kaç çizim geldi, hangileri eksik, hangilerine bakılacak.
- **Sahne provası:** gelen çizimler oyundaki yer ve ölçekleriyle üst üste durur (oda, perde, masa, Kino, Zıpzıp; yakın planda göğüs çizimi). Plan ve poz seçilir; iPad ve telefonda görünen alan çerçeveyle gösterilir. İlk sayfa gelir gelmez ölçek ve oturuş buradan görülür; 68 çizimin hepsini beklemek gerekmez.
- **Diziler:** on bir hareket sahnedeki sürelerle oynar. "Üst üste" bütün pozları soluk gösterir: baş ölçüsü ve temas noktası sabit mi.
- **Ağız dizileri:** altı ağız sırayla. Yalnız ağız kıpırdamalı.
- **Aynı poz çiftleri:** brief'in "aynısı" dediği çizimler karşılaştırılır. Satıra tıklayınca ikisi sırayla yanıp söner, değişen yer kırmızı kutuyla gösterilir.
- **Çizimler:** her çizim tek başına. "Boy" seçicisinden **%100**'ü seçip uzuvları sayın.
- **Kılavuz çizgileri:** yer çizgisi, eksen, kalça, basamaklar ve koddaki tahmini hedef noktaları (Kuzu'nun göğsü, Kino'nun avucu, kalp).
- **Nokta ölçme:** çizimin üstünde gezince imlecin tuval pikseli sağ altta görünür. Tıklayınca nokta sol alttaki listeye yazılır. `doktor/src/once-kuzu/yerlesim.ts` içindeki `HEDEF` ve `PERDE` değerleri buradan ölçülür.
- "Masa" kutusu muayene masasını Zıpzıp'ın arkasına, sahnedeki yerine koyar.

Betik çıkış kodu olarak hata varsa 1, yoksa 0 döndürür. Ayrıntılı döküm `rapor.json` içindedir.

## %100 boyda kesit (uzuv sayımı için)

Önizleme sayfasının yanında, çizimi %100 boyda parça parça dosyaya yazan yardımcı:

```powershell
npx vite-node doktor/araclar/tam-boy.ts -- zipzip-tirman-0 zipzip-tirman-1
```

İki pozu taban hizasında yan yana koymak için `--yan` eklenir. Çıktı `output/doktor/k1-onizleme/tam-boy/` içindedir: `<ad>-genel.png` tuvalin tamamı ve kılavuzlar, `<ad>-1.png` … çizimin kendisi %100 boyda.

## Betiğin denetledikleri

- Tuval boyutu brief'tekiyle aynı mı (Zıpzıp 1300 × 1500, Kino 1300 × 1600, yakın plan 2048 × 1536, stetoskop 1600 × 1600, fon 2752 × 1536, masa 2000 × 1000, perde 900 × 1100).
- Dört köşe saydam mı; fon opak mı.
- Çizim tuvalin kenarına değiyor mu (kesilmiş uzuv). Yakın planda alt kenar serbesttir.
- Kenarda macenta saçak kaldı mı.
- Boş ya da neredeyse boş çizim.
- "Aynı poz" çiftlerinde değişen alan beklenenden büyük mü, çizimin geneline yayılmış mı.

## Betiğin yapmadıkları

- Uzuv saymaz, yüzü ve modeli denetlemez. Bunlar %100 boyda gözle yapılır.
- Beyaz zemini temizlemez (beyaz tüylü Kino'da güvenli değil).
- Sayfadan kesilen oturuş pozlarının yerini bilemez; tahmin eder ve işaretler.
- Çizimi olmayan yere yer tutucu koymaz. Eksik çizim önizlemede "Henüz gelmedi" diye yazıyla görünür.

## Dosyalar

- `bagla.ts`: komut. Resim okuma ve yazma, akış.
- `tam-boy.ts`: %100 boyda kesit üretir (yalnız okur).
- `k1-paket.ts`: 68 çizimin dökümü (sayfa, tuval, zemin, kılavuzlar, aynı poz çiftleri). Adlar ve ölçüler sahne kodundan gelir.
- `gorsel-mantik.ts`: piksel mantığı (zemin türü, macenta temizliği, kırıntı, sayfa bölme, denetim).
- `onizleme.ts`, `onizleme-sayfa.js`, `onizleme-sayfa.css`: önizleme sayfası.
- Birim testi: `tests/unit/doktor-bagla.test.ts`.
- Tip denetimi: `npx tsc -p node_modules/.doktor/tsconfig.arac.json` (bu dosya git'te değildir; yoksa kök `tsconfig.json`'u genişletip `types` içine `node`, `include` içine `doktor/araclar/*.ts` ve `doktor/src` yazın).

## "Zıpzıp'ın Dikenli Patisi" (Paket Doktor-Y1) araçları

Oyun: `doktor/index.html?oyun=vaka` (`doktor/src/vaka/`). Çizimler `assets/doktor/vaka/<ad>.webp`, ham kaynaklar `ekip/doktor/y1/kaynak/`.

| İş | Komut |
| --- | --- |
| Kaynakları tuvale oturt, webp yaz (hepsi ya da adı verilenler) | `npx vite-node doktor/araclar/y1-bagla.ts [-- kol-temiz mikrop-0]` |
| Bağlananları denetle, %100 kesit çıkar | `npx vite-node doktor/araclar/y1-denetle.ts -- --kesit hepsi` |
| Oyunu insan hızında oynat, sesli video ve kareler | `node doktor/araclar/video-vaka.mjs output/gosterim-19 1280x720 doktor http://localhost:5183/ 5+` |
| Aynısı, yalnız aşama görüntüleri | sonuna `"" --deneme` |

- Bağlama çizimi bozmaz: oran korunur, yalnız ölçeklenir ve yerine konur. Zıpzıp'ın beş pozu uzanan patinin ucundan, üzgün üç poz aynı pencereyle (gövde bir piksel oynamaz), kol çifti ve sargı aynı dönüşümle oturur.
- Çizim değişirse oyundaki noktalar (`doktor/src/vaka/veri.ts`: yuvalar, leke merkezleri, sargı aralığı, tepsi) çizimden yeniden ölçülür; `tests/unit/doktor-vaka.test.ts` bu sayıları tutar.
- Video ve e2e ağır testtir: `output/AGIR-TEST.txt` kilidi boşken, tek worker.
