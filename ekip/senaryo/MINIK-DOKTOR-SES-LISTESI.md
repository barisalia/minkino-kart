# Minik Doktor · ElevenLabs Seslendirme ve Efekt Listesi

> **Hazırlayan:** Antigravity (Neon 4.0) · 22 Kasım 2026  
> **Kural (`KULLANICI-KURALLARI.md` & `ekip/ses/ELEVENLABS-ORTAK.md`):**
> - Her satır **kendi ayrı ElevenLabs isteğinde** üretilir (asla toplu okutma yok).
> - Her replik **tek kısa cümle** (en çok 6–8 sözcük; asla 3 cümleyi geçmez).
> - Gülüş, kıkırdama, hapşırık ve hıçkırıklar **karakterin kendi onaylı sesiyle** ve köşeli parantez oyunculuk etiketiyle (`[giggles]`, `[laughs]`, `[happy]`) üretilir.
> - **Yasak sözcük sıfır:** `dokun`, `tıkla`, `bas`, `sürükle`, `şimdi şunu`, `yanlış`, `hatalı`, `hızlı ol`, `çabuk`, `kaybettin`, `aferin` hiçbir replikte geçmez!

---

## 0. Kritik Teknik Uyarı · Yeni ElevenLabs Hesabı (`content/elevenlabs-hesap.json`)

`content/elevenlabs-hesap.json` dosyasındaki güncel duruma göre 18 Kasım'da geçilen kredili workspace'te şu an yalnız **Kino (`6mhMoM3NBayFenTB48Qg`)**, **Ceren (`zTvNO0vkTf8t29oY6LlN`)** ve **Polly** tanımlıdır. Diğer karakterlerin mantıksal Voice ID'leri (`ekip/ses/ELEVENLABS-ORTAK.md`) içerik manifestinde sabit kalır; üretim öncesi iki yoldan biri seçilir:
- **Yol A (Önerilen, hızlı):** Mevcut onaylı oyun/film kayıtlarından `scripts/ses-hesabi.ts` eşlemesiyle önce **Zıpzıp** (canlı örnek için 1 klon!), ardından Faz 1 için **Lokum** ve **Bulut**, Faz 2 için **Mino, Dede, Mila (Bıdık Bebek), Baba, Anne** klonlanıp Barış'a dinletilir.
- **Yol B:** Eski ana ElevenLabs hesabına kredi yüklenirse `content/elevenlabs-hesap.json → esleme` boşaltılır ve bütün 20 karakterin orijinal Voice ID'si doğrudan çalışır.

**Kayıt klasörü:** `assets/ses/doktor/<kimlik>.mp3`

---

## 1. FAZ 0 · Canlı İlk Örnek ("Zıpzıp'ın Dizi" · TAMAMLANDI — 33 MP3 `assets/doktor/ses/` altında!)

> **Güncelleme (22 Kasım 03:10):** Harf oturumu canlı örneğin bütün ElevenLabs seslendirmelerini ve kısa efektlerini (`assets/doktor/ses/`, 33 MP3: `k-merhaba`, `k-kalp`, `k-kalp-tut`, `k-diz`, `k-buyutec`, `k-cimbiz`, `k-pamuk`, `k-bant`, `k-bant-sur`, `k-yildiz`, `k-damga`, `k-ipucu-kalp`, `k-ipucu-diz`, `k-ipucu-sira`, `k-son`; `z-giris`, `z-davul`, `z-yaprak`, `z-acimadi`, `z-serin`, `z-bant-yildiz`, `z-bant-kalp`, `z-bant-gokkusagi`, `z-bant-pati`, `z-yasasin`, `z-cesur`; `e-gum`, `e-pit`, `e-surt`, `e-bant`, `e-damga`, `e-zipla`, `e-buldu`) üretti ve Scribe ile denetledi. **Faz 0 yeniden üretilmez**; aşağıda yalnız Sürüm 1.2'deki ek vakalar (Faz 1 ve Faz 2) listelenmiştir.

---

## 2. FAZ 1 · Gün 1–2 Tam Dilim Ek Replikleri (24 replik — ~900 karakter)

| Kimlik | Konuşmacı (Voice ID) | Metin | An |
|---|---|---|---|
| `md-k-gunaydin` | `kino` | `[happy] Günaydın doktor! Kliniği açalım mı?` | Sabah kapı tabelası |
| `md-k-kuzu-giris` | `kino` | `Önce oyuncak Kuzu'ya bakalım mı?` | Vaka 1 açılış |
| `md-k-kuzu-hazir` | `kino` | `[happy] Kuzu hazır! Sıra arkadaşlarda!` | Vaka 1 bitiş |
| `md-k-bekleme` | `kino` | `Bakalım önce kim gelmek istiyor?` | Bekleme odası |
| `md-k-ates-normal` | `kino` | `Ateşi normalmiş, sadece biraz üşümüş.` | Vaka 3 yeşil termometre |
| `md-k-battaniye` | `kino` | `Yumuşacık battaniye onu hemen ısıtır.` | Vaka 3 battaniye |
| `md-k-ihlamur` | `kino` | `Ilık ıhlamur boğazına çok iyi gelir.` | Ihlamur köşesi |
| `md-k-defter` | `kino` | `[happy] Bugün harika çalıştık! Kliniğe ne alalım?` | Gün sonu Klinik Defteri |
| `md-k-gizli-kalp` | `kino` | `[giggles] Hihi, benim kalbim de hızlı atıyor!` | Gizli sürpriz #1 |
| `md-l-usudum` | `lokum` (`k4FgffsVVBqLkYX9lS2v`) | `Hapşu! Çok soğuk dondurma yedim, üşüdüm!` | Vaka 3 giriş |
| `md-l-isindim` | `lokum` | `[happy] Ohhh, sıcacık oldum! Hav!` | Vaka 3 battaniye + ıhlamur |
| `md-l-bogaz` | `lokum` | `Aaaa derken sesim komik çıkıyor!` | Vaka 8 giriş |
| `md-l-ses-geldi` | `lokum` | `[happy] Hav! Hav! Sesim geri geldi!` | Vaka 8 bitiş |
| `md-l-mandalina` | `lokum` | `Karnım gurulduyor, çok mandalina yedim!` | Vaka 10 giriş |
| `md-l-gidik` | `lokum` | `[laughs] Hihi, gıdıklandım! Karnım çok rahat!` | Vaka 10 karın masajı |
| `md-l-topuk` | `lokum` | `[giggles] Hihi, parmak ucuma kalktım!` | Boy ölçer sürprizi #7 |
| `md-b-bal` | `bulut` (`ZyHU3tm4hc4VPnxh6jni`) | `Bal kavanozuna çok yaklaştım!` | Vaka 4 giriş |
| `md-b-boynuz` | `bulut` | `[happy] Boynuzum pırıl pırıl oldu!` | Vaka 4 temizlik |
| `md-b-yun` | `bulut` | `[giggles] Yünüm de boyuma sayılıyor mu?` | Boy ölçer şakası |
| `md-b-kulak` | `bulut` | `[giggles] Kulağımın kenarı çok gıdıklanıyor!` | Vaka 5 giriş |
| `md-b-bocek-uctu` | `bulut` | `[happy] Güle güle uğur böceği! Artık gıdıklanmıyor!` | Vaka 5 yeşil yaprak sonrası |
| `md-k-kulak-guven` | `kino` | `Kulağa sert bir şey sokmayız, yaprak yaklaştıralım!` | Vaka 5 güvenli eğitim |
| `md-k-eksi` | `kino` | `[laughs] Ooo, biraz ekşi oldu galiba!` | Limon gizli sürprizi #8 |
| `md-k-karin-gur` | `kino` | `[giggles] Hihi, karnı gurulduyor!` | Stetoskop karın şakası #2 |

---

## 3. FAZ 2 · Gün 3–7+ Kalan Karakter Replikleri (24 replik — ~880 karakter)

| Kimlik | Konuşmacı (Voice ID) | Metin | An |
|---|---|---|---|
| `md-m-diken` | `mino` (`12iZbH1fuWoWnJWOJZ1W`) | `Çimende yürürken patime küçük diken battı!` | Vaka 6 giriş |
| `md-m-zipla` | `mino` | `[happy] Miyav! Artık yine zıplayabilirim!` | Vaka 6 bitiş |
| `md-m-dis` | `mino` | `Çok kurabiye yedim, dişlerim yapış yapış!` | Vaka 7 giriş |
| `md-m-aaa` | `mino` | `Aaaaa!` | Ağız feneri |
| `md-m-parlak` | `mino` | `[happy] Bak, dişlerim yıldız gibi parlıyor!` | Vaka 7 bitiş |
| `md-m-cingirak` | `mino` | `Yürüyünce karnımdan tıngır sesi geliyor!` | Vaka 14 giriş |
| `md-m-cepte` | `mino` | `[laughs] Miyav! Meğer çıngırağım cebimdeymiş!` | Vaka 14 röntgen sonu |
| `md-d-hickirik` | `dede` (`IDXxPYTQNZ9qnoBgBvbH`) | `Hık! Çayı hızlı içtim, hıçkırık tuttu!` | Vaka 9 giriş |
| `md-d-gecti` | `dede` | `[happy] Hıçkırığım geçti! Çok yaşa minik doktor!` | Vaka 9 bitiş |
| `md-mi-polen` | `seftali-patisi` / Mila (`srpMpX0gd4MeawzKMJwC`) | `Çiçek kokladım, gözüme toz kaçtı!` | Vaka 11 giriş |
| `md-mi-temiz` | `seftali-patisi` / Mila | `[giggles] Her yer pırıl pırıl oldu!` | Vaka 11 bitiş |
| `md-ba-ates` | `baba` (`BPGao31oIDrNIkpHSZGL`) | `Hapşu! Bahçede biraz ateşim çıktı doktor!` | Vaka 12 giriş |
| `md-ba-serin` | `baba` | `Ohhh, serin bezle hemen ferahladım!` | Vaka 12 serin bez |
| `md-ba-boy` | `baba` | `[laughs] Bakalım benden uzun kim varmış!` | Vaka 12 boy yarışı |
| `md-an-rutin` | `anne` (`WqGM7U04GnQsqgVyumSY`) | `[happy] Hasta değilim doktor, kontrole geldim!` | Vaka 13 giriş |
| `md-an-saglik` | `anne` | `[happy] Sağlıklı kalmak için kontrol harika!` | Vaka 13 bitiş |
| `md-k-fener-avuc` | `kino` | `Bak, ışığı önce avucuma tutuyorum; hiç yakmaz!` | Gizli sürpriz #3 (kitap!) |
| `md-k-el-isit` | `kino` | `Önce ellerimizi sürtüp ısıtalım!` | Vaka 10 karın öncesi (kitap!) |
| `md-k-ates-sicak` | `kino` | `Alnı biraz sıcakmış, serin bez iyi gelir.` | Vaka 12 kırmızı termometre |
| `md-k-rontgen` | `kino` | `Sihirli röntgenle içeride ne varmış bakalım!` | Gün 5 röntgen tanıtımı |
| `md-k-saksi-surpriz` | `kino` | `[giggles] Aaa, saksının altında küçük bir solucan var!` | Gizli sürpriz #4 |
| `md-k-serbest` | `kino` | `[happy] Serbest klinik açıldı! İstediğin dostu çağır!` | Gün 4 Serbest Klinik |
| `md-k-ipucu-genel-1` | `kino` | `[giggles] Hımm, bunu birazdan kullanalım!` | Genel nazik ipucu |
| `md-k-ipucu-genel-2` | `kino` | `Bak, arkadaşımız neyi gösteriyor?` | Genel nazik ipucu |

**Toplam ses bütçesi:** 62 kısa tek-cümle replik ≈ **2.290 karakter** (ekonomik, tamamı yasak sözcüksüz).

---

## 4. Dokunsal Ses Efektleri (Web Audio API — Sıfır Kredi, Sıfır Gecikme)

Tüm parmak anı efektleri `doktor/src/ses.ts` içinde sentezlenir (veya kısa temiz WAV/MP3 kliplerle desteklenir; konuşmanın %30–40 altında mikslenir):

| Efekt kodu | Kullanıldığı an | Ses karakteri |
|---|---|---|
| `gum` | Stetoskop kalp atışı | Yumuşak çift bas darbe (`lub-dub`, 55 Hz → 45 Hz); kalbe yaklaştıkça aralık `900 ms → 420 ms` hızlanır |
| `pit` | Yaprak/diken çıkışı, bant yapışma, damla düşüşü | Parlak yumuşak pop (`320 Hz → 780 Hz`, 90 ms) |
| `surt` | Islak pamuk & diş fırçalama | Yumuşak filtrelenmiş beyaz gürültü hışırtısı (parmak hızına bağlı gain!) |
| `bant` | Yara bandını parmakla düzleştirme | Hafif kâğıt/kumaş sürtünmesi + bitişte kristal ışıltı akoru (`C5-E5-G5`) |
| `bip` | Ateş ölçer ölçümü | Yumuşak oyuncak termometre `bip-bip` (yeşil: neşeli `C5-G5`; kırmızı: nazik uyarı `E5-E5`) |
| `buhar` | Serin bez alna konunca / ıhlamur karışınca | Yumuşak kısa `fısss` rahatlama nefesi (300 ms) |
| `blup` | Akvaryum baloncuğu & ağız çalkalama | Üçlü yükselen su baloncuğu (`260 → 440 → 620 Hz`) |
| `damga` | Sağlık karnesi mühürleme | Tok ahşap-lastik `PAT!` (110 Hz darbe + hafif yay tıkı) |
| `zipla` | Hasta sevinç zıplaması & kapanış şakası | Neşeli yukarı kayan yay sesi (`280 → 640 Hz`) + yumuşak zil |
| `vizz` | Uğur böceği yapraktan uçunca | İnce neşeli kanat vızıltısı (yükselen pitch) |
| `gurr` | Stetoskop karın şakası | Komik alçak karın gurultusu (`90 → 65 Hz` modülasyon) |
| `zil` | Sabah "Açık" kapı tabelası | Sıcak pirinç kapı çıngırağı |
