# ORTAK NOTLAR — Minkino Kartlar

Bu dosya oturumlar arası ortak defterdir. **Kural:** baştan yazılmaz; her oturum sadece en alta tarihli satırlar ekler.

- Canlı test linki (telefonda aç): https://barisalia.github.io/minkino-kart/
- Repo: https://github.com/barisalia/minkino-kart

---

## 2026-09-24 — Oturum 1 (başlangıç)

- 2026-09-24 Repo boştu; Vite + TypeScript (çerçevesiz) iskelet kuruldu. Klasörler: src/engine, src/screens, src/audio, src/ui, content/, assets/, tests/.
- 2026-09-24 Deploy: GitHub Actions (`.github/workflows/yayinla.yml`) her push'ta build alıp `gh-pages` dalına yayınlar.
- 2026-09-24 Görseller Recraft ile üretildi (70 görsel, 3 kredi/görsel: üretim + arka plan kaldırma). Bu bulut makinesinin ağ politikası `img.recraft.ai` adresini engellediği için görsel URL'leri `assets/recraft/*.json` dosyalarına yazıldı; GitHub Actions bunları indirip 512×512 WebP yapar ve repoya geri kaydeder (`scripts/gorsel-indir.mjs`).
- 2026-09-24 KARAR (Barış'ın mesajı üzerine): Oyun kitaplara/QR'a bağlı DEĞİL; kendi başına, abonelikle satılacak bir oyun. "Kitap kodu gir" kaldırıldı, ebeveyn köşesinde yalnızca "Minkino Premium" abonelik ekranı (şimdilik görünüm) var.
- 2026-09-24 KARAR (Barış'ın mesajı üzerine): Bu oyun ileride içinde çok sayıda oyun olan bir Minkino uygulamasına "tıkla-aç" mini oyun olarak eklenecek. Bu yüzden oyun kendi içinde kapalı bir modül: tek giriş noktası (`oyunuBaslat(kok, secenekler)`), tüm CSS `.mk-kok` altında, kayıt anahtarı `minkino-kartlar-v1`, ana uygulamaya dönüş için `cikis` geri çağrısı.
- 2026-09-24 Yapıldı (aşama 2-7): 7 ekran (açılış, yaş, kart paketleri, tur, tur sonu, albüm, ebeveyn köşesi), 6 soru tipi (BUL, EŞLEŞTİR, SAY, FARKLI OLAN, SIRADAKİ, HAFIZA), yıldız/albüm/paket açma ödülleri, yaş × tema için 352 soru (her dosyada 14-15 soru), Web Speech tr-TR konuşma (hız 0.92, ton 1.1), Web Audio sentez efektler (doğru, boing, uçuş, konfeti, yapışma, kart çevirme, kilit açılışı) ve hafif müzik, sessize alma düğmesi.
- 2026-09-24 Testler: 39 birim testi (içerik doğrulama + motor) ve 21 Playwright testi (390×844 ve 768×1024; tam tur akışı, her soru tipi, yanlış cevap, yanlış sürükleme, ebeveyn kapısı, 24 yaş×tema başlangıcı). Konsol hatası yok. Ekran görüntüleri: tests/screens/. Lighthouse mobil performans: 98.
- 2026-09-24 İçerik ayrı bir editör geçişinden geçti: 40 küçük düzeltme (belirsiz sorular, yanıltıcı ipuçları, TTS'e uygun harf sesleri).
- 2026-09-24 KARAR: Tur = 8 soru; en çok 1 HAFIZA, HAFIZA ilk soru olmaz, aynı tip arka arkaya gelmemeye çalışır; seçenek yerleri her seferinde karışır.
- 2026-09-24 KARAR: Yıldız = ilk denemede doğru oranı: %85+ → 3, %50+ → 2, altı → 1. Hiçbir zaman 0 yok, puan düşmez.
- 2026-09-24 KARAR: Her doğru cevap albüme bir kart verir (önce doğru cevabın kartı, o temada yoksa temadan eksik bir kart). Kart anında kaydedilir; turu yarıda bırakmak kazanılanı silmez.
- 2026-09-24 KARAR: Paket açılma eşikleri (albümdeki toplam kart): Taşıtlar 6, Renkler ve Şekiller 14, Sayılar 22, Harfler 30. Yani her tur ~1 yeni paket açar. content/temalar.json'dan değiştirilebilir.
- 2026-09-24 KARAR: Ebeveyn kapısı "12 + 7 = ?" tarzı (11-19 arası + 3-9 arası), tuş takımıyla yazılır.
- 2026-09-24 KARAR: HAFIZA başında kartlar ~2 sn açık gösterilip kapanır (küçük çocuklar için). EŞLEŞTİR'de kartı sürüklemek de, dokunmak da çalışır; 4,5 sn dokunulmazsa el animasyonu nasıl sürükleneceğini gösterir. 16 sn hareketsiz kalınırsa soru tekrar okunur.
- 2026-09-24 KARAR: Oyunda harf kartlarında örnek resim gösterilmez (cevabı ele vermesin); albümde gösterilir.
- 2026-09-24 KARAR: Uygulama logosu şimdilik yazı ile ("minkino" renkli harfler + KARTLAR şeridi). Gerçek Minkino logosu gelince değiştirilecek.
- 2026-09-24 DEPLOY DURUMU: GitHub Actions her push'ta derleyip `gh-pages` dalına yayınlıyor, ama GitHub Pages ayarı repoda kapalı ve Actions bunu kendi açamıyor (403). Barış'ın TEK SEFERLİK yapması gereken: GitHub → minkino-kart → Settings → Pages → "Build and deployment" → Source: "Deploy from a branch" → Branch: `gh-pages`, klasör `/ (root)` → Save. Sonra link: https://barisalia.github.io/minkino-kart/
- 2026-09-24 Geçici test linki (claude.ai, sadece Barış açabilir, tek dosyalık sürüm): https://claude.ai/artifact/RfdmjJFtmiNfZTxa5LC5Se
- 2026-09-24 Gömme: ana uygulamadan `import { oyunuBaslat } from './src/oyun'` → `oyunuBaslat(kok, { cikis })`. `cikis` verilirse açılışta ve ebeveyn köşesinde "Minkino'ya dön" düğmesi çıkar.
- 2026-09-24 GÖRSEL BEKLİYOR: Tüm oyun görselleri (70) Recraft ile üretildi, bekleyen yok. İsteğe bağlı: (1) gerçek Minkino logosu (SVG/PNG), (2) uygulama ikonu (şimdilik basit kart+yıldız çizimi), (3) beğenilmezse yeniden üretilebilecekler: fil (hortum yana bakıyor), ördek (ayaklar büyük), kiraz (iki kiraz; sayma sorularında kullanılmıyor).
- 2026-09-24 ONAY BEKLİYOR: (1) Abonelik modeli: ilk 2 paket ücretsiz, diğer 4 paket Premium. Altyapı hazır ama `src/engine/odul.ts` içindeki `ABONELIK_AKTIF = false` — şimdilik tüm paketler sadece kart toplayarak açılıyor, ödeme yok. (2) Paket açılma eşikleri (6/14/22/30 kart). (3) Ebeveyn kapısı zorluğu. (4) Tur başına 8 soru ve yıldız eşikleri.
- 2026-09-24 KALAN İŞLER: gerçek seslendirme kayıtları (metinler content/metinler.json ve soru dosyalarında; `soru_ses` alanına .mp3 yolu yazmak yeterli), gerçek müzik, Capacitor projesi (dist/ hazır, göreli yollar), mağaza ikonları ve açılış ekranı, Premium satın alma entegrasyonu (RevenueCat vb.), içerik için ikinci göz (özellikle 3-4 yaş seslendirme metinleri).

## 2026-09-24 — Oturum 1 (devam): seslendirme altyapısı

- 2026-09-24 Barış: "Cihaz sesi kötü, ElevenLabs ile seslendirelim." → ElevenLabs altyapısı kuruldu. Oyun her cümle parçası için önce `public/ses/manifest.json`'da kayıt arar, kayıt varsa Web Audio ile çalar, yoksa cihaz sesine düşer. Kayıtlar gelene kadar oyun eskisi gibi çalışır.
- 2026-09-24 Seslendirilecek: 1.051 benzersiz cümle, ~34.000 karakter (`src/audio/cumleler.ts` → `tumCumleler()`). Birleşik cümleler parçalara bölündü (övgü + kart adı + kart sesi), böylece her parça tek kayıt olur ve tekrar kullanılır.
- 2026-09-24 Üretim: `scripts/seslendir.ts` (ElevenLabs API). Bu bulut makinesinden api.elevenlabs.io engelli; üretim GitHub Actions'ta yapılır: `ELEVENLABS_API_KEY` repo secret'ı + `content/seslendirme.json` içinde `ses_id` girilince her push'ta eksik kayıtlar üretilir ve repoya eklenir. Ses/model değişirse hepsi yeniden üretilir. İçerik değişince sadece yeni cümleler üretilir.
- 2026-09-24 Ses seçimi için: `content/seslendirme.json` → `aday_sesler` listesine adaylar yazılıp "Yayınla" iş akışı `ses_ornek: true` ile çalıştırılınca `ses-deneme.html` sayfasında aynı 8 cümleyi her adayın sesiyle dinlemek mümkün.
- 2026-09-24 KARAR: Model `eleven_multilingual_v2` (Türkçede en tutarlı; 1000+ klipte ses rengi sabit kalmalı). Ayarlar: stability 0.45, similarity 0.8, style 0.35, speed 0.95. Biçim mp3 44.1kHz 64kbps (~20 MB toplam).
- 2026-09-24 BARIŞ'TAN BEKLENEN: (1) ElevenLabs hesabı + ücretli plan (ticari kullanım hakkı için şart), (2) ses seçimi (Voice Design ile Minkino'ya özel ses önerildi), (3) API anahtarını GitHub → Settings → Secrets and variables → Actions → `ELEVENLABS_API_KEY` olarak eklemek, (4) Voice ID'yi Claude'a yazmak.
- 2026-09-24 Seslendirme TAMAM: Barış Voice Design ile "hyped genç kadın çocuk programı sunucusu" sesini seçti (Voice ID `U5Yg9Cl0WUYCovjolhzm`, content/seslendirme.json). GitHub Actions 1.110 kaydı ~5 dakikada üretti (public/ses, 24 MB, multilingual v2). Oyun artık tüm cümleleri bu sesle söylüyor; kaydı olmayan yeni bir cümle olursa cihaz sesine düşer ve bir sonraki push'ta otomatik seslendirilir.
- 2026-09-24 claude.ai önizleme sayfası 16 MB sınırı yüzünden kayıtları 3 paket dosyasında taşıyor (`scripts/ses-paketle.mjs`; ilk paket 1,5 MB arayüz cümleleri, diğerleri arka planda iner). GitHub Pages / Capacitor sürümü tek tek dosyaları kullanır.
- 2026-09-24 GÜVENLİK: ElevenLabs API anahtarı sohbete yazıldı. İş bitince ElevenLabs'te bu anahtar silinip yenisi oluşturulmalı ve GitHub secret `ELEVENLABS_API_KEY` güncellenmeli.
- 2026-09-24 Barış geri bildirimi → düzeltmeler: (1) "Kırmızı olanı sürükle"de top kırmızı sayılıyordu ama görsel rengarenk; 5 renk sorusunda top/hediye (sarı kurdeleli) tek renkli nesnelerle değiştirildi, katalogda renkleri düzeltildi. (2) "Ham ham, çok lezzetli!" kaldırıldı; her meyve/sebzeye kendi kısa cümlesi yazıldı ("Limon! Ekşi mi ekşi!"). (3) Doğru cevaptaki takılma: övgü + kart adı + kart sesi artık TEK PARÇA kayıt (soruya göre sabit övgü), efektler konuşmadan önce çalıyor ve konuşma sırasında kısılıyor.
- 2026-09-24 Sorun: multilingual v2 kısa kelimelerde İngilizceye kayıyor ("Limon" → "lemon", "Aferin" bozuk). Karşılaştırma sayfası: https://claude.ai/artifact/4Cb6W8w8BcGsP3vFpx9j9E — A: v2 + Türkçe bağlam cümlesi, B: Eleven v3 + dil=tr, C: Flash v2.5 + dil=tr. ONAY BEKLİYOR: Barış'ın seçimi; sonra tam yeniden üretim (~53 bin karakter).
- 2026-09-24 Barış: "Yer yer çok hızlı, fazla yük binince bozuluyor." → Üretim artık sırayla (paralel değil, istekler arası 400 ms), hız 0.9, her kayıt harf/saniye ölçülüp 15'i aşarsa otomatik yeniden üretiliyor. Model seçilene kadar `otomatik: false` (kredi harcanmaz).
- 2026-09-24 KARAR (Barış): Karşılaştırmada B (Eleven v3 + dil=tr) seçildi; "diğerleri uzun cümlelerde sıçıyor". Tüm kayıtlar v3 ile yeniden üretiliyor (hız 0.9, sıralı, hız kontrolü). Güvenlik: `butce_karakter: 60000` — aşılırsa üretim durur, kalan cümleler eski kayıtla çalmaya devam eder (eski kayıtlar yenisi gelene kadar silinmez). Barış'ın bildirdiği kullanım: ~22 bin karakter (Creator: 100 bin/ay).
