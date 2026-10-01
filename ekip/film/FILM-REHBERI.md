# Minkino Çizgi Filmler: animasyon ekibi rehberi

**Ne yapıyoruz:** Uygulamanın içinde oynayan, **50-60 saniyelik**, 3-6 yaş için **eğitici kısa çizgi filmler**. Kahraman Mino ve arkadaşları. Her film tek bir şey öğretir (paylaşmak, renkler, sayılar, el yıkamak…). Hikâye sade; süs sürprizler yok. **Final sorusu yok**; film anlatıcının kısa bir öğüdüyle biter ("Paylaşmak güzeldir."). (Barış, 2026-09-26)

**Ekip yöneticisi:** yerel yönetici (bu klasördeki yönetici oturumu). Herkes ona bağlı çalışır, işini ona teslim eder. Ürün sahibi Barış; kararları o verir.

Önce şunları oku: [../../minkinogames1.md](../../minkinogames1.md) (genel kurallar), [../stil-rehberi.md](../stil-rehberi.md) (görsel stil), bu dosya.

---

## 1. Temel karar: film VİDEO DEĞİL, uygulamanın içinde canlı çalışır

Filmler MP4 olarak çizilmez. Karakterler **katmanlı SVG iskeletlerdir** (Mino gibi), film de bu iskeletleri bir zaman çizelgesiyle oynatan **film motorudur** (`film/`).

Neden:
- Mino ve arkadaşları oyunlarda nasıl görünüyorsa filmde de öyle görünür. Tek stil, tek karakter.
- Dosyalar çok küçük (bir film ~1-2 MB, video olsa 30-60 MB). İnternetsiz çalışır.
- İleride istenirse film durup çocukla etkileşebilir (şimdilik yok).
- Ağız, konuşma sesine göre kendiliğinden oynar (Mino'da çalışan yöntem).
- Gerekirse aynı motor ekran kaydıyla MP4'e de çevrilir (tanıtım, sosyal medya).

## 2. Ekip ve görevler

| Rol | Oturum | Ne yapar | Teslim |
|---|---|---|---|
| **Yönetici** | yönetici (yerel) | İşi böler, kontrol eder, Barış'a gösterir, GitHub'a gönderir | Barış'a rapor |
| **Senarist** | Senarist ve Fikirci | Film fikri, senaryo, sahne listesi (storyboard metni), öğretilecek konu | `ekip/film/senaryo/<film>.md` |
| **Adobe** | adobe | Illustrator: karakterleri ve eşyaları katmanlara ayırır (iskelet), arka planları derinlik katmanlarına böler, gölge/ışık | `ekip/film/cizim/<ad>.svg` |
| **Gemini** | gemini | Tarayıcı Gemini: aynı karakterin yeni poz ve ifadeleri (stil kilidiyle) | `...\minkino-film-gemini\<ad>\<poz>.png` |
| **Animatör** | animatör (yeni) | Film motorunu yazar; her filmi sahne dosyasından canlandırır: zamanlama, kamera, hareket, ağız, geçişler | `film/`, `content/film/<film>.json` |
| **Ses** | yönetici | Anlatıcı ve karakter cümleleri `content/film/*.json` içinde; seslendirmeyi CI üretir (ElevenLabs). Müzik ve efekt Web Audio ile | `public/ses/` (CI) |

Yeni görsel gerekiyorsa (arka plan, eşya) **Recraft** kullanılır (bu bilgisayarda bağlı). Kredi kuralı geçerli: önce tahmin, Barış onayı, önce tek örnek.

## 3. İş akışı (bir film)

1. **Fikir:** Senarist 3 fikir yazar (her biri 3-4 cümle: konu, öğrettiği, komik an, final sorusu). Yönetici Barış'a gösterir, Barış seçer.
2. **Senaryo + sahne listesi:** Senarist seçileni yazar (şablon aşağıda). Her sahne: yer, kimler var, ne olur, kim ne der, kamera.
3. **Malzeme listesi:** Yönetici senaryodan gereken karakter, poz, eşya, arka planı çıkarır; elde olanı işaretler, eksikleri Adobe/Gemini/Recraft'a dağıtır (kredi tahminiyle).
4. **Çizim:** Adobe iskeletleri ve katmanlı arka planları hazırlar; Gemini eksik ifadeleri üretir.
5. **Animatik:** Animatör sahneleri kaba zamanlamayla kurar (cihaz sesiyle, kredi harcamadan). Yönetici Barış'a video olarak gösterir. **Onay burada alınır**; seslendirme bundan sonra.
6. **Seslendirme:** Cümleler onaylanınca GitHub'a gider, CI seslendirir.
7. **Son hâl:** Animatör ağız, zamanlama, parıltı, müzik ve geçişleri bitirir. Test + telefon/tablet kaydı. Yönetici gösterir, onaylanınca yayına alır.

## 4. Kalite ölçüsü (Barış'ın ölçüsü)

- **Disney Junior / premium çocuk kitabı.** "Çalışıyor" yetmez; güzel ve **kendine özgü** olmalı. Hazır parçaları üst üste koymak değil, sahneye özel hareket.
- Karakterler **hiç donmaz**: nefes, göz kırpma, ağırlık aktarma, bakınma. Her harekette hazırlık (anticipation), abartı (squash & stretch), takip (follow-through: kuyruk, kulak, fular geriden gelir).
- Her karakterin **kendi yürüyüşü ve kişiliği** var (ördek paytak, tavşan hoplar, Mino meraklı ve atik).
- Kamera sinema gibi: yakın plan, geniş plan, yavaş yaklaşma, yumuşak geçişler. Sahne derinliği: önde, ortada, arkada katmanlar ayrı hızda kayar (parallax).
- Hikâye mantıklı olmalı: "bu neden oldu?" sorusunun cevabı filmde olmalı.
- Stil tek: parlak 2D çizgi film, kalın koyu kahve kontur, az dozda parlaklık, doku yok, 3D yok, yazı yok.
- Cümleler kısa (anlatıcı ≤ 10-12 kelime, karakter ≤ 6 kelime). Seslendirme kredisi.

## 5. Teknik standartlar

### Karakter iskeleti (Adobe → Animatör sözleşmesi)
- SVG, `viewBox` kare (2048), Presentation Attributes, `id` = katman adı, minify kapalı.
- Katman adları (varsa): `kuyruk, govde, bacak-sol, bacak-sag, kol-sol, kol-sag, aksesuar, kafa, kulak-sol, kulak-sag, goz-sol, goz-sag, agiz`. Hayvana göre `kanat-sol/sag`, `gaga`.
- Gizli ekler (`display="none"`): `goz-kapali`, `agiz-acik`, `agiz-kapali`, gerekirse `goz-mutlu`.
- Dudak senkronu ağızları (isteğe bağlı, gizli, kafaya bağlı): `agiz-kapali, agiz-az, agiz-orta, agiz-yuvarlak, agiz-dis, agiz-gulumse` (6'sı birlikte). Varsa konuşurken kod bunları kullanır (src/audio/dudak.ts), yoksa `agiz-acik` ölçeklenir. Mino'da `node scripts/mino/rig.mjs` yeniden çalıştırılınca eklenir.
- Her katman kendi konturuyla tam çizili; dönünce altında boşluk görünmez (boyun, omuz, kuyruk kökü uzatılır).
- Dönme noktaları dosyayla birlikte `ekip/film/cizim/<ad>.json` içinde: `{ "kafa": [x, y], "kol-sol": [x, y], … }`.
- Örnek: `ekip/mino/mino-final.svg` + `scripts/mino/rig.mjs` + `src/mino/mino.ts`.

### Arka plan
- Recraft arka plan kalıbıyla üretilir (stil rehberi), sonra Adobe **en az 3 derinlik katmanına** böler: `uzak` (gökyüzü, dağ), `orta` (binalar, ağaçlar), `on` (zemin, çalı). Şeffaf PNG/WebP, 2048 geniş.

### Sahne dosyası (Animatör)
`content/film/<film>.json`: sahneler, her sahnede zaman çizelgesi. Örnek biçim (animatör kesinleştirir):

```json
{
  "baslik": "Mino ve Kayıp Renkler",
  "ogretir": "renkler",
  "sahneler": [
    {
      "yer": "orman-cayir",
      "kamera": { "bas": [50, 55, 1], "son": [40, 50, 1.3], "sure": 6 },
      "oyuncular": { "mino": { "x": 30, "y": 10 } },
      "olaylar": [
        { "t": 0.0, "kim": "mino", "yap": "yuru", "x": 45 },
        { "t": 1.5, "kim": "anlatici", "soyle": "Bir sabah Mino uyandı." },
        { "t": 3.0, "kim": "mino", "yap": "sasir" },
        { "t": 3.2, "kim": "mino", "soyle": "Renkler nereye gitti?" }
      ]
    },
    { "ogut": "Paylaşmak güzeldir." }
  ]
}
```

- Konuşmalar `content/film/<film>.json` içinden seslendirme hattına girer; `src/audio/cumleler.ts` bu dosyaları da toplamalı.
- Motor yalnız `transform/opacity` kullanır; telefonda 60 fps; `prefers-reduced-motion` desteklenir.
- Test: her film için `?test=1` hızlı mod + Playwright ile baştan sona oynatma ve `.webm` kaydı (Barış'a gösterim).

## 6. Klasörler

```
ekip/film/FILM-REHBERI.md     bu dosya
ekip/film/senaryo/<film>.md    senaryolar
ekip/film/cizim/<ad>.svg|.json iskeletler ve dönme noktaları (Adobe)
ekip/film/malzeme/<film>.md    film başına malzeme listesi ve durumu (Yönetici)
film/                          film motoru ve oynatıcı sayfası (/film/)
content/film/<film>.json       sahne dosyaları ve cümleler
assets/film/<film>/…           filmin görselleri (webp)
```

## 7. Senaryo şablonu (Senarist)

```
# <Film adı>
Öğrettiği: <tek cümle>          Yaş: 3-6        Süre: ~60 sn
Karakterler: Mino, …
Duygu eğrisi: merak → sorun → komik an → çözüm → öğüt

## Sahne 1 — <yer>
Kamera: geniş plan, yavaşça Mino'ya yaklaşır
Olur: …
ANLATICI: "…"
MİNO: "…"
Ses/efekt: …

## Öğüt (final)
ANLATICI: "<kısa öğüt, ör. Paylaşmak güzeldir.>"   (soru yok)
```

## 8. Kurallar

- Barış'a kısa, sade Türkçe; göster (video/görüntü), anlatma.
- Kredi harcayan her şey önce tahmin + onay.
- Bir oturum başka oturumun dosyasına dokunmaz; iş bölümü `ORTAK_NOTLAR.md`'ye yazılır.
- Kimse GitHub'a doğrudan göndermez; teslimler yöneticiye, yönetici gönderir.
- Doğum günü bölümü (`macera/`) bulut yöneticinin; film ekibi oraya dokunmaz.

## 9. Sahne dosyası eklemeleri (film 3: Kino ve Kaydırak)

- **Jenerikler (üç filmde de):** oynatınca başlık kartı + `assets/muzik/film-acilis.mp3` (7,9 sn), sonra film; film ve öğüt kartından sonra `film-kapanis.mp3` (5 sn). Kartsız gösterim / ekran görüntüsü için `?kartsiz=1`. MP4 kaydı bunları ve müzikleri içerir; kayıt kapanış jeneriği bitince (`.fl-ekran[data-tamam]`) sona erer.
- **Dosya müziği:** `{ "kim": "muzik", "yap": "dosya", "ad": "film-merak", "ses": 0.5, "dongu": false, "gec": 0.4, "ustune": false }` (yeni dosya öncekini çapraz geçişle söndürür); `{ "yap": "dosya-dur", "sure": 2 }`. Adlar: `film-uzgun`, `film-kovalamaca`, `film-surpriz`, `film-kutlama`, `film-merak`, `film-fon-pazar`. Film dosyasında `"sentez": false` sentez müziği (nese…) başlatmaz.
- **Park:** `"arka": "park"` (kaydırak, kum havuzu) ya da `"park-salincak"`; `"ortaKaydir": 30` orta katmanı sağa kaydırır (kaydırak çalıların arkasında kalmasın). Çimen ve oyun aletleri oyuncularla aynı derinliktedir.
- **Yan görünüş oyuncusu:** oyuncuda `"yan": true` (`assets/karakter-iskelet/<tip>-profil`): yandan yürür / koşar (`git` + `"stil": "kos"`), `"stil": "yerinde"` olduğu yerde adım atar (merdiven), dururken nefes alır. Çizim sağa bakar (`yon: -1` sola). Ağzı ayrı oyuncudan oynatmak için `soyle` olayında `"agiz": "<oyuncu>"`.
- **Görünüm değişimi:** `{ "kim": "kinoy", "yap": "yerine", "hedef": "kino", "yon": 1 }` yan ↔ önden Kino (konum aktarılır). `{ "yap": "yer", x, y, don }` anında konum.
- **Önden Kino / karakter duruşları (`durus`):** `otur: 1` (+ `y: 2.2`), `yukSol` / `yukSag` (30-160° kalkık kol), `dusun: 1`, `bakan: -1 | 1`.
- **Mino duruşları (`durus`, aynı adlar):** `otur: 1` (kendiliğinden zemine iner, `y` gerekmez), `yukSol` / `yukSag` (kol açısı; 30°'yi geçince kalkık kol, en çok 160°), `dusun: 1`, `bakan: -1 | 1` (yalnız gözler; işaret için `yukSag: 85` / `yukSol: 85` ekleyin), `saril: 1` (kollar göğüste, gözler kapalı, gülümseme). Kodda: `mino.kol('sag', 150)`, `mino.otur(true)`, `mino.poz('dusun' | 'isaret-sag' | 'isaret-sol' | 'sarilma' | null)`.


## 10. Film 4 (Mino'nun Sepeti) eklemeleri

- **Yan görünüşte taşıma:** `al` / `birak` / `tasi` artık yan görünüş oyuncusunda da çalışır; parça adı profil iskeletinin katmanı: `agiz` (Kino elmayı ağzında taşır), `kol-on` / `kol-arka` (çocuğun ön / arka eli). Eşya önce `git` ile parçanın dünyadaki yerine uçar, sonra `al` (aynı yerde takılır).
- **Zemin y 4,5 + kamera y:** oyuncular kum havuzunun önünde durur. 16:9'da görüntünün altı dünyanın altına denk gelsin diye kamera y = 100 - 28,125 / z (ayaklar altyazının üstünde kalır; öteki oranlarda `tut` korur).
- **Sahne dosyası üreteçle** yazılabilir (hop, koşu+fren+toz, sepete atma gibi tekrarlı hareketler); JSON yine tek kaynak.

## 11. Çizgi Filmler ekranı (/film/ açılışı) ve kapaklar

- /film/ açılınca **Çizgi Filmler** seçme ekranı gelir (`film/src/katalog.ts`, `katalog.css`): her film büyük kapak kartı (kapak, ad, öğüt rozeti, süre, oynat). Karta dokununca film açılış kartı + jenerikle hemen başlar. `?film=<ad>` doğrudan o filmin kapağını (Oynat) açar; MP4 kaydı bunu kullanır. Filmdeki geri düğmesi bu ekrana döner.
- **Yeni film eklenince:** (1) `katalog.ts` → `SIRA` listesinin başına `{ ad, ogut, renk, yeni: true }` ekle, eskisinden `yeni`yi kaldır; (2) kapak üret: filmin en güzel karesi (karakterler büyük, yüzler görünür, altyazı/düğme yok), `npm run film:mp4 -- yatay --film=<ad> --ornek=<sn>` ile kare al, 16:9 960 px webp (sharp), ≤120 KB → `assets/film/kapak/<ad>.webp`; (3) ana menü kartı en yeni kapağı gösterir: `uygulama/src/oyunlar.ts` → film kartının `zemin` adı.
