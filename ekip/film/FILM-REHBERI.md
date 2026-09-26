# Minkino Mini Filmler: animasyon ekibi rehberi

**Ne yapıyoruz:** Uygulamanın içinde oynayan, 60-120 saniyelik, 3-6 yaş için **eğitici mini çizgi filmler**. Kahraman Mino ve arkadaşları. Her film tek bir şey öğretir (renkler, sayılar, paylaşmak, el yıkamak, mevsimler…) ve sonunda çocuğa 1-2 soru sorar.

**Ekip yöneticisi:** yerel yönetici (bu klasördeki yönetici oturumu). Herkes ona bağlı çalışır, işini ona teslim eder. Ürün sahibi Barış; kararları o verir.

Önce şunları oku: [../../minkinogames1.md](../../minkinogames1.md) (genel kurallar), [../stil-rehberi.md](../stil-rehberi.md) (görsel stil), bu dosya.

---

## 1. Temel karar: film VİDEO DEĞİL, uygulamanın içinde canlı çalışır

Filmler MP4 olarak çizilmez. Karakterler **katmanlı SVG iskeletlerdir** (Mino gibi), film de bu iskeletleri bir zaman çizelgesiyle oynatan **film motorudur** (`film/`).

Neden:
- Mino ve arkadaşları oyunlarda nasıl görünüyorsa filmde de öyle görünür. Tek stil, tek karakter.
- Dosyalar çok küçük (bir film ~1-2 MB, video olsa 30-60 MB). İnternetsiz çalışır.
- Film durup çocuğa soru sorabilir, cevaba göre devam eder (eğitici kısım).
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
    { "soru": { "metin": "Hangisi kırmızı?", "secenekler": ["elma", "muz", "yaprak"], "dogru": "elma" } }
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
Öğrettiği: <tek cümle>          Yaş: 3-6        Süre: ~90 sn
Karakterler: Mino, …
Duygu eğrisi: merak → sorun → deneme/komik hata → çözüm → kutlama

## Sahne 1 — <yer>
Kamera: geniş plan, yavaşça Mino'ya yaklaşır
Olur: …
ANLATICI: "…"
MİNO: "…"
Ses/efekt: …

## Soru (final)
"Hangisi …?"  Seçenekler: … (doğru: …)  Doğruysa: …  Yanlışsa: (asla ceza yok) …
```

## 8. Kurallar

- Barış'a kısa, sade Türkçe; göster (video/görüntü), anlatma.
- Kredi harcayan her şey önce tahmin + onay.
- Bir oturum başka oturumun dosyasına dokunmaz; iş bölümü `ORTAK_NOTLAR.md`'ye yazılır.
- Kimse GitHub'a doğrudan göndermez; teslimler yöneticiye, yönetici gönderir.
- Doğum günü bölümü (`macera/`) bulut yöneticinin; film ekibi oraya dokunmaz.
