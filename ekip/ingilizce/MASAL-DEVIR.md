# Masal devir notu · Claude (İngilizce yan oturum) → Barış'ın İngilizce oturumu

23 Kasım 2026, gece. Yönetici kararı: iki ayrı masal motoru olmasın; açılır kitabın yönü Barış'ın oturumunda (Astra'nın 41 gerçek çizimiyle kanıt sayfası). Ben `masal2` dosyalarına bundan sonra dokunmuyorum. Aşağıdakilerden işine yarayanı al; gerekmeyeni sil (Ana Kural: gereksiz olan çöpe).

## 1 · Metin (yönetici onaylı, esas)

`ekip/ingilizce/MASAL-GOL-V2.md` · "Kino at the Lake" güçlü hâli. Yedi sayfa:
1. Sevgili şapka: dokun.
2. İnek: "cow" söyle.
3. Rüzgâr: kaçan şapkayı yakala, göle düşer.
4. Kabarcık: muzlu ördek; Yes/No, doğrusu "No".
5. Kabarcık: yapraklı kurbağa; çocuk "No!" söyler.
6. Kabarcık: şapkalı ördek; "Yes", şapkayı Kino'nun başına sürükle (yakın an).
7. Herkesin şapkası: üç arkadaşa dokun.

Ek olarak:
- Masal Oyunu: 3 soru.
- Motor ihtiyaçları ve çizim parçaları listesi.

## 2 · Kayıtlar (19, Scribe ile doğrulandı) · `assets/ingilizce/ses/<id>.mp3`

| Kimlik | Konuşan | Söz |
|---|---|---|
| `tr/c-gol2-giris` | Ceren | Kino'nun çok sevdiği bir şapkası var. Bak bakalım ne olacak! |
| `en/g-gol2-1` | Polly | This is Kino. Kino has a blue hat. |
| `en/g-gol2-1b` | Polly | He loves his hat! |
| `en/g-gol2-2` | Polly | Kino walks to the lake. Look! A cow! |
| `en/g-gol2-2b` | Polly | Hello, cow! |
| `en/g-gol2-3` | Polly | Whoosh! The wind! Catch the hat! |
| `en/k-gol2-3` | Kino (İngilizce klon) | My hat! |
| `en/g-gol2-4` | Polly | Look! Bubbles! Who is there? |
| `en/k-gol2-sor` | Kino | Is this my hat? |
| `en/g-gol2-4b` | Polly | No! It's a banana! |
| `en/g-gol2-5` | Polly | More bubbles! Who is there? |
| `en/g-gol2-5b` | Polly | No! It's a leaf! |
| `en/g-gol2-6` | Polly | Big bubbles! Who is there? |
| `en/k-gol2-6` | Kino | My hat! Yay! |
| `en/g-gol2-6b` | Polly | Yes! Thank you, duck! |
| `en/g-gol2-7` | Polly | Now we all have hats! |
| `en/g-mq-gol2-1` | Polly | What color is Kino's hat? |
| `en/g-mq-gol2-2` | Polly | Who has a banana? |
| `en/g-mq-gol2-3` | Polly | What does the frog have? |

- Metinler `ingilizce/src/adimlar/masal2-veri.ts` içinde (`G2`, `gol2Giris`).
- Soru metinleri `ingilizce/src/masal-oyun.ts` → `MASAL_SORULARI.gol2`.
- Ses betiği (`scripts/ingilizce-ses.ts`) `masal2SesMetinleri()` ile bunları tanıyor.
- Kullanılan hazır kayıtlar:
  - `efekt/cow`, `efekt/duck`, `efekt/frog`;
  - `en/w-hat|cow|duck|banana|leaf` ve `-yavas` sürümleri;
  - `en/g-yes`, `en/g-no`, `en/g-listen`, `en/g-say-it`, `en/g-story-time`, `en/g-the-end`.

## 3 · Motor (Masal 2.0, açılır kitap) · dosyalar

- `ingilizce/src/adimlar/masal2.ts`: adım.
  - Masa + Astra'nın açık kitabı (`oyun/acik-kitap`) + 4:3 sahne.
  - Kamera: kitabın tamamı; okurken sayfaya süzülme; yakın an 2,3.
  - Katman kalkışı (yaylanarak, sırayla) ve sayfaya yatış.
  - Kıvrık köşeyle sayfa çevirme, kâğıt sesi (`hazirlik/ses/kres_kagit_ac`).
  - Polly kitabın kenarında anlatıcı.
- `ingilizce/src/adimlar/masal2-veri.ts`: veri tipleri ve masallar.
  - Masallar: `GOL2_MASALI` (v2), `GOL_MASALI` (v1), `KUMSAL_MASALI` (durdurulan Paket 37 taslağı).
  - Ses listesi: `masal2Sesleri`, `sozSesi`.
- `ingilizce/src/adimlar/masal2-hazir.ts`: hangi masal açılır. Adanın masallarından hazır olan ilki; taslakta hepsi.
- `ingilizce/src/adimlar/masal2.css`: önek `ing-m2-`.
- Bağlantılar:
  - `ingilizce/src/ekranlar/ders.ts`: `p.tur === 'masal'` dalı.
  - `ingilizce/src/ekranlar/masallar.ts`: raf adı ve masalın kendi kapağı.
  - `ingilizce/src/plan.ts`: `masal2` adımı; `masaloyun.soruKumesi` / `kapak`.
  - `ingilizce/src/adimlar/masaloyun.ts`: soru kümesi.

### Eklediğim etkileşimler

`Masal2Sayfa.etkilesimler`, sırayla oynanır. Tip açıklamaları `masal2-veri.ts` → `Etkilesim`.

| Tip | Ne yapar |
|---|---|
| `dokun` | Yer parlar; dokununca canlanır, geçişi varsa resim değişir. |
| `yakala` | Kaçan hedef. Katman her dokunuşta `kacis` noktasına "fırt" diye kaçar, Polly şaşırır; sonda `dusme` noktasına küçülerek düşer, `sonra` yeri canlanır. Yakalarken sahnenin yerleri kilitli. |
| `evethayir` | `soru` çalar, iki büyük düğme (yeşil ✓ Yes, kırmızı ✗ No). Doğruda `sonra` canlanır. Yanlışta düğme jöle gibi esner, Polly şaşırır, `yanlisSes` çalar, soru yinelenir. |
| `soyle` | Kelime ya da "yes" / "no". `onceki` (Kino'nun sorusu) varsa "Say it!" denmez. Sözcük etiketi ("No!") çocuk söyleyene dek durur. Söz tanıma, yedek yıldız. |
| `surukle` | Katman hedefe taşınır. Beklenirken yerlere dokunmak adımı atlatmaz. |
| `hepsi` | Listedeki yerlere sırası serbest dokunulur. |

Diğer eklemeler:
- Eski tekli etkileşimler sürüyor: `sec`, `soyle`, `surukle`, `oto`, `ana`.
- Dokunuşa 0 ms karşılık: `kodEfekt` (`pop` / `firt` / `sip`), canlanma, yıldızlar, Polly sevinir. Yanlışa komik karşılık.
- Sözcük öğretimi: dokunulan şeyin `kelime`si söylenir ve etiketi nesnenin hemen üstünde, küçük okla parlar.
- Dokunma hedefi en az 64 px: kamera etkileşimden önce yaklaşır; köşe 64 px.
- Katman alanları: `canlilik` (nefes, sallanma), `goz` (göz kırpma karesi), `cizimde` (yalnız o çizim ekrandayken görünür; gagadaki şapka).

Kod efektleri:
- `src/audio/efekt.ts`: `baloncuk()`, `firt()`, `sip()`.
- `ingilizce/src/ses.ts`: `tik.pop`, `tik.firt`, `tik.sip`.

## 4 · Testler

- Birim: `tests/unit/ingilizce-masal2.test.ts` (12 test: göl v1, kumsal, etkileşim verisi, göl v2).
- e2e: `tests/e2e/ingilizce.spec.ts`. Dördü iPad ve telefonda geçiyordu (23 Kasım 23:47):
  - "Masal Kitaplığı …";
  - "Masal 2.0 · Kino at the Lake …";
  - "Masal 2.0 motoru (taslak) … sürüklenir …";
  - "Masal 2.0 v2 · Kino at the Lake (taslak) …".
- Sürücü yardımcıları aynı dosyada:
  - `dersiOyna` içindeki `masal2` dalı: yakala, Yes/No, yıldız, sürükle, seç, parlayan yer.
  - `kameraDurunca()`: kamera durunca tıkla.
  - Bulunan iki gerçek hata ve düzeltmeleri `ORTAK_NOTLAR.md` 22–23 Kasım kayıtlarında. Mikrofon yuvası görünmez kutu olup dokunuş yutuyordu; seçte kendiliğinden yer cevap sayılıyordu.

## 5 · Çizim

- **Paket Masal-K1**, açılır kitap stil anahtar karesi (`CLAUDE-ASTRA-MESAJLAR.md` 22 Kasım 23:20). Barış'ın kanıt sayfasıyla yön netleştiyse yönetici kaldırabilir.
- **Paket 37** (Lokum at the Beach) durduruldu.

## 6 · Betikler (paylaşılan not klasörü)

Klasör: `C:\Users\Minkex\AppData\Local\Claude-Data\…\side-session-notes\local_29c3217d-…\`
- `masal2-gosterim.mjs`: gerçek hızda, sesli gösterim videosu. Ses ve görüntü sayfa çevirilerinden eşlenir. Video kuralı: yalnız yönetici isterse.
- `ingilizce-tempo.mjs`: ders tempo ölçümü. Video yok; 1 sn'den uzun uygulama boşluğu ve art arda aynı ses raporlanır.
