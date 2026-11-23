# Masal 2.0 · "Kino at the Lake" · güçlü hâli (v2)

22 Kasım 2026 gecesi, Claude (İngilizce). İlk hâl Barış'a "zayıf, saçma" geldi: ince hikâye, tek dokunuş, slayt gibi görünüm.

Bu sürüm şu kurallara göre yazıldı:
- **Kalite kuralı 10 ve masal kuralı:** gerçek dert, merak, tekrar eden komik kalıp, her sayfada katılım, kısa ve gerçek İngilizce.
- **Biçim:** açılır kitap (UI-2 B) ve doruk anlarında yakın an (C).
- **Süre:** sayfa başına en çok 8–10 sn.

CEVAP-10 (Antigravity) gelince iyi fikirleri buraya katılacak.

## Özü

- **Dert:** Kino'nun en sevdiği mavi şapkayı rüzgâr göle uçurur. Kino üzülür; çocuk ona yardım eder.
- **Merak:** gölde kabarcıklar çıkar: "Kim var orada?"
- **Komik kalıp (üç kez):** gölden biri çıkar, başında bir şey vardır. Kino sorar: "Is this my hat?"
  - 1. kez: ördeğin başında muz ("No! It's a banana!").
  - 2. kez: kurbağanın başında yaprak ("No! It's a leaf!").
  - 3. kez: ördek, başında mavi şapka ("Yes! My hat!").
  - Çocuk ikinci kezde kalıbı yakalar ve "No!"yu kendisi bağırır.
- **Gülme:** sonda herkesin bir "şapkası" vardır. Kino mavi şapkasıyla; ördek muzu, kurbağa yaprağı takar. "Now we all have hats!"
- **Öğretilen sözcükler** (dokunuşta ad + sahnede parlayan sözcük): hat, blue, cow, wind, duck, banana, frog, leaf, yes, no. Hepsinin kartı ve sesi var.

## Kadro

- **Kino:** model sayfası `ekip/kalite/minkino-gorsel-rehberi/pozlar/kino/*`. Göz lekesi bize göre sağda, lacivert fular, mavi şapka.
- **Polly:** anlatıcı, kitabın sol üst kenarında oturur. Kimliği `kisi/polly-konus-0` ile aynı.
- **İnek:** siyah benekli, siyah toynaklı. Göl masalının onaylı ineği.
- **Ördek:** sarı, turuncu gagalı. Göl masalının onaylı ördeği.
- **Kurbağa:** yeşil, iri gözlü, gülen.
- İnsan figürü, çilek ve yazı yok.

## Sayfa sayfa

Okuma kuralları:
- Süreler: cümle + çocuğun hareketi + tepki.
- **Yeni kayıt** = ElevenLabs Polly (İngilizce) ya da Ceren (Türkçe); cümleler kısa, her biri kendi isteğinde.
- **Efekt dosyası:** `efekt/cow`, `efekt/duck`, `efekt/frog`.
- **Kod efekti** (Web Audio): kabarcık "pop", "fırt" (kaçış), "şıp" (suya düşme).

### 0 · Açılış (en çok 4 sn)
- Kitap masada kapalı durur. Çocuk kapağa dokunur, kitap açılır ve ilk sayfanın katmanları yaylanarak kalkar.
- Ceren (köşede, tek cümle; şapka henüz kaybolmadı, yönetici düzeltmesi): "Kino'nun çok sevdiği bir şapkası var. Bak bakalım ne olacak!"
  - Kayıt: `tr/c-gol2-giris`, yeni.
- Çocuk 1 sn içinde ne yapacağını görür: parlayan şapka.

### 1 · Sevgili şapka (≈ 7 sn)
- **Metin:** "This is Kino. Kino has a blue hat." (`en/g-gol2-1`)
- **Çocuk:** DOKUN, şapkaya.
- **Tepki:**
  - Şapka zıplar, "hat" sözcüğü üstünde parlar.
  - Kino şapkasını iki eliyle tutup güler ve kucaklar.
  - Polly: "He loves his hat!" (`en/g-gol2-1b`)
- **Duygu:** sevgi. Çocuk şapkanın Kino için değerli olduğunu görür.

### 2 · Göl yolunda inek (≈ 8 sn)
- **Metin:** "Kino walks to the lake. Look! A cow!" (`en/g-gol2-2`)
- **Çocuk:** SÖYLE, "cow". Söz tanıma; tanımazsa yıldız. Sözcük ineğin üstünde bekler.
- **Tepki:**
  - İnek başını kaldırır: "Moo!" (`efekt/cow`).
  - Kino ineğe el sallar.
  - Polly: "Hello, cow!" (`en/g-gol2-2b`)

### 3 · Rüzgâr, kaçan şapka (≈ 9 sn) · dert başlar
- **Metin:** "Whoosh! The wind! Catch the hat!" (`en/g-gol2-3`)
- **Çocuk:** YAKALA (yeni etkileşim: kaçan hedef). Şapka havada süzülür, çocuk dokunur:
  - 1. dokunuş: şapka "fırt!" diye kaçar.
  - 2. dokunuş: yine kaçar, Kino zıplar ama yetişemez.
  - 3. dokunuş: şapka göle "şıp!" diye düşer.
  - Çocuk kaybetmez; şapkanın düşmesi hikâyedir.
- **Tepki:**
  - Su halkaları açılır.
  - Kino'nun kulakları düşer, gözleri dolar.
  - Kino (Polly değil; Kino'nun klon sesi, kısa): "My hat!" (`en/k-gol2-3`). İngilizce kayıt; olmazsa Polly söyler.
- **Yakın an:** Kino'nun üzgün yüzü, 1,5 sn.

### 4 · Kabarcıklar · birinci kez (≈ 9 sn) · merak ve şaka
- **Metin:** "Look! Bubbles! Who is there?" (`en/g-gol2-4`)
- **Çocuk:** DOKUN, kabarcıklara.
- **Tepki:**
  - Kabarcıklar patlar ("pop" efekti), sudan ördek fırlar; başında muz.
  - Kino umutla: "Is this my hat?" (`en/g-gol2-sor`; üç sayfada aynı söz, kalıbın parçası).
- **Çocuk:** SEÇ, iki büyük düğme: "Yes" / "No".
  - Doğru cevap "No".
  - "Yes" derse muz kayıp ördeğin gözüne iner, ördek "Quack?" der, soru yinelenir. Komik, ceza yok.
- **Tepki:** Polly gülerek: "No! It's a banana!" (`en/g-gol2-4b`). "banana" parlar. Ördek omuz silker, "vak" diye dalar.

### 5 · Kabarcıklar · ikinci kez (≈ 8 sn) · kalıp tekrar
- **Metin:** "More bubbles! Who is there?" (`en/g-gol2-5`)
- **Çocuk:** DOKUN, kabarcıklara. Sudan kurbağa çıkar; başında nilüfer yaprağı.
- Kino: "Is this my hat?" (`en/g-gol2-sor`)
- **Çocuk:** SÖYLE, "No!". Çocuk kalıbı yakaladı; kendisi bağırır, söz tanıma "no".
- **Tepki:**
  - Kurbağa "Ribbit!" (`efekt/frog`), yaprağı şapka gibi oynatıp zıplar.
  - Polly: "No! It's a leaf!" (`en/g-gol2-5b`). "leaf" parlar.

### 6 · Üçüncü kez · bulduk (≈ 10 sn) · doruk
- **Metin:** "Big bubbles! Who is there?" (`en/g-gol2-6`)
- **Çocuk:** DOKUN, kabarcıklara. Ördek yeniden çıkar, bu kez başında mavi şapka.
- Kino: "Is this my hat?" (`en/g-gol2-sor`)
- **Çocuk:** SEÇ, "Yes".
- **Yakın an:** kamera sayfaya dalar. Ördek şapkayı gagasıyla uzatır, Kino'nun yüzü sevinçle aydınlanır.
- **Çocuk:** SÜRÜKLE, şapkayı ördeğin gagasından Kino'nun başına.
- **Tepki:**
  - Şapka Kino'nun başına "pıt" diye oturur, yıldızlar saçılır.
  - Kino zıplar.
  - Kino: "My hat!" (sevinçli, `en/k-gol2-6`).
  - Polly: "Yes! Thank you, duck!" (`en/g-gol2-6b`)

### 7 · Herkesin şapkası (≈ 8 sn) · gülme ve kapanış
- **Metin:** "Now we all have hats!" (`en/g-gol2-7`)
- Sahne:
  - Kino mavi şapkalı.
  - Ördek muzu, kurbağa yaprağı başına takmış.
  - İnek de başına küçük bir çiçek almış.
- **Çocuk:** DOKUN, her birine.
  - Ördek: "Quack!" + "banana".
  - Kurbağa: "Ribbit!" + "leaf".
  - İnek: "Moo!" + "cow".
  - Kino: güler + "hat".
- Üçüne dokunulunca hepsi birlikte zıplar. Polly: "The end!"
- **Bitiş sevinci en çok 2 sn**, sonra Masal Oyunu.

## Masal Oyunu (masaldan sonra, 3 soru)

Soruları Polly sorar, resimli seçenek, mikrofon yok:
1. "What color is Kino's hat?" → blue (red, yellow)
2. "Who has a banana?" → duck (frog, cow)
3. "What does the frog have?" → leaf (hat, banana)

## Motor için gerekenler

Bugünkü Masal 2.0 motoruna eklenecekler:
- **Kaçan hedef (YAKALA):** yer, dokununca belirli bir yola kaçar; n. dokunuşta sonuç olur.
- **Evet/Hayır seçimi:** sahnenin üstünde iki büyük düğme, ses ve sözcükle. Bugünkü "seç" yalnız sahnedeki yerler arasında seçtiriyor.
- **Söyle, "No"/"Yes":** söz tanımada "no" ve "yes" bekleyen kip.
- **Kod efektleri:** kabarcık "pop", "fırt", "şıp".
- **Kino'nun İngilizce kısa sözleri** (Kino klonu, `en/k-…`). Olmazsa Polly söyler.
- **Katmanlar:** sayfa zemini + 2–3 kâğıt katman + karakter pozları ayrı. Kalkışta katmanlar sırayla yaylanır.

Hazır olanlar:
- açılır kitap;
- kamera, yakın an;
- dokun, sürükle, söyle, seç;
- sözcük parlaması;
- kıvrık köşeyle sayfa çevirme;
- kâğıt sesi;
- dokunma hedefi 64 px.

## Çizim (anahtar kare onaylanınca)

Paket Masal-K1 yalnız stil anahtar karesidir. Onaylanınca parçaların brief'i yazılacak:
- Her sayfa için sayfa zemini ve 2–3 kâğıt katman: arka gök ve tepeler, orta göl ve sazlar, ön çimen ve çiçekler.
- Karakter pozları beyaz kâğıt kenarlı:
  - Kino: yürüyen, el sallayan, şapkasını kucaklayan, üzgün, sevinçle zıplayan; şapkalı ve şapkasız.
  - İnek: otlayan, başını kaldıran, çiçekli.
  - Ördek: muzlu, şapkalı, şapkayı uzatan.
  - Kurbağa: yapraklı.
  - Uçan şapka, kabarcıklar, su halkaları.
- Göz kırpma için kapalı göz kareleri.

## Kayıt listesi (yeni)

| Kimlik | Konuşan | Söz |
|---|---|---|
| `tr/c-gol2-giris` | Ceren | Kino'nun çok sevdiği bir şapkası var. Bak bakalım ne olacak! |
| `en/g-gol2-1` | Polly | This is Kino. Kino has a blue hat. |
| `en/g-gol2-1b` | Polly | He loves his hat! |
| `en/g-gol2-2` | Polly | Kino walks to the lake. Look! A cow! |
| `en/g-gol2-2b` | Polly | Hello, cow! |
| `en/g-gol2-3` | Polly | Whoosh! The wind! Catch the hat! |
| `en/k-gol2-3` | Kino | My hat! (üzgün) |
| `en/g-gol2-4` | Polly | Look! Bubbles! Who is there? |
| `en/g-gol2-sor` | Kino | Is this my hat? |
| `en/g-gol2-4b` | Polly | No! It's a banana! |
| `en/g-gol2-5` | Polly | More bubbles! Who is there? |
| `en/g-gol2-5b` | Polly | No! It's a leaf! |
| `en/g-gol2-6` | Polly | Big bubbles! Who is there? |
| `en/k-gol2-6` | Kino | My hat! (sevinçli) |
| `en/g-gol2-6b` | Polly | Yes! Thank you, duck! |
| `en/g-gol2-7` | Polly | Now we all have hats! |
| `en/g-mq-gol2-1…3` | Polly | Masal Oyunu soruları |

**Durum:** metin yönetici onaylı (22 Kasım 23:2x), esas metin budur; CEVAP-10 gelirse yalnız iyi bir ek fikir katılır.
