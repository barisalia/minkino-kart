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
- 2026-09-24 Barış: "Metinler çok uzun, sürekli uzun konuşuyor; ElevenLabs uzun cümlelerde takılıyor; aferin desin geçsin." → Tüm konuşma metinleri kısaltıldı: soru en fazla 6 kelime (hedef 4), ipucu en fazla 4 kelime, arayüz cümleleri en fazla 30 karakter; testler bunu zorunlu kılıyor. Doğru cevapta sadece kısa övgü ("Aferin!") söylenir, açıklama/kart adı söylenmez (kart adı + sesi yalnızca albümde). `dogru_ses` alanı kaldırıldı. Toplam seslendirme 53 bin → 16.600 karakter (975 cümle). v3 üretimi bu kısa metinlerle yapılıyor (bütçe sınırı 25 bin karakter).
- 2026-09-24 v3 seslendirme TAMAM: 975 kayıt (Eleven v3, dil=tr, hız 0.9, sıralı üretim), 15 MB. Hız ortancası 8,7 harf/sn, en hızlı 13,8 (hepsi sınırın altında). Eski v2 kayıtları temizlendi. Önizleme linki güncellendi (Sürüm 5). Tahmini harcama bu turda ~17 bin karakter.

## 2026-09-24 — Mino (konuşan kedi karakteri)

- 2026-09-24 Barış: "Talking Tom gibi ama Türkçe, kelime öğreten, dokununca komiklik yapan tatlı bir karakter." KARAR: 2D (Barış onayladı), karakter kedi, adı **Mino** (kırmızı panda da denendi; Barış kediyi seçti, seçenek 3).
- 2026-09-24 Çizim: Recraft (ilk raster kedi → `vectorize_image` ile vektör). Kaynak: `karakter-kaynak/kedi-3.svg`. `scripts/mino/` betikleri 219 vektör parçayı kafa/gövde/kuyruk ucu olarak sınıflandırır, tek parça dış konturu bölgelere kırpar ve `src/mino/mino-svg.ts`'yi üretir (`node scripts/mino/rig.mjs`). Parçalar sırası korunarak CSS değişkenleriyle hareket eder.
- 2026-09-24 Animasyon (`src/mino/mino.ts`): nefes, göz kırpma (göz şeklinde kapak), kafa sallanması, kuyruk ucu sallama, sese göre ağız (konuşma sesinin gücü Web Audio analizörüyle ölçülür; ağız yeniden çizildi). Tepkiler: gıdıklanma (göbek), mırlama (kafa), hapşırma (burun), zıplama (kuyruk), dans (ayak), şaşırma, hayır, ham ham (yeme), esneme → uyku (Zzz).
- 2026-09-24 Oyun (`src/screens/mino.ts`): Mino "Elma nerede?" der, 3 karttan doğrusunu ona vermek (dokunmak ya da sürüklemek) gerekir; doğruysa kart ağzına uçar, "Mmm, elma!" der, kalpler; yanlışsa kartın adını söyleyip "Bu değil!" der, 2 yanlıştan sonra düşünce balonunda resim ipucu çıkar; 4 doğruda bir dans + konfeti. 20 sn dokunulmazsa esneyip uyur, dokununca "Günaydın!". Giriş: açılış ekranının sol alt köşesindeki Mino düğmesi.
- 2026-09-24 Ses: Mino aynı ElevenLabs sesini biraz daha ince tonla kullanır (çalma hızı 1.12). Cümleler `content/mino.json` (kısa), seslendirme otomatik.
- 2026-09-24 ONAY BEKLİYOR: (1) Mino'ya ayrı bir karakter sesi (ElevenLabs Voice Design ile "sevimli kedi" sesi) ister misin? (2) Talking Tom'daki "söyleneni ince sesle tekrar etme" (mikrofon, sadece cihazda, kayıt tutulmaz) eklensin mi? (3) El sallama gibi kol hareketleri için kolların ayrı çizilmesi gerekiyor (Recraft ile parça çizimi) — sonraki adım olabilir.

## 2026-09-25 — Minik Sanatçı (ayrı uygulama)

- 2026-09-25 Barış: "Çocuk parmağıyla karalıyor, yapay zeka karalamayı Minkino stilinde illüstrasyona çeviriyor; veli paylaşıyor, sticker/poster bastırıyor. Kart oyununun içine koyma, ayrı yerden girilsin." → Ayrı uygulama: `sanatci/` (adres: `/minkino-kart/sanatci/`). Aynı repo, ortak ses/buton/renk altyapısı; kart oyunuyla bağlantısı yok.
- 2026-09-25 Yapay zeka denemeleri (3 karalama: kedi, ev, araba): Recraft image-to-image (v3) sadık değil (kediyi fareye çevirdi). **Nano Banana Pro** (talimatla düzenleme) en iyisi: çocuk çizimini tanır, sonuç parlak Minkino stilinde. Recraft v4.1 image-to-image da içerik tarifiyle iyi ve çok ucuz (2 kredi) → yedek motor. Örnekler: `sanatci/ornekler/*.png` → `assets/sanatci/ornek-*-sonuc.webp`.
- 2026-09-25 Akış: Açılış (önce/sonra vitrini) → Çiz (11 pastel boya, 3 kalınlık, silgi, geri al, temizle) → "Ne çizdin?" (12 resimli seçenek + Sürpriz) → ilk seferde ebeveyn kapısı + açık onay → Sihir (ışıltılı bekleme) → Önce/Sonra kaydırıcı + konfeti → Paylaş (ebeveyn kapısı; önce/sonra kolaj görseli, Web Share) / Bastır (sticker seti, A3 poster, magnet — şimdilik görünüm) → Galerim (yalnızca cihazda, IndexedDB; basılı tutunca ebeveyn onayıyla silinir; 3 örnek).
- 2026-09-25 Sunucu: `sunucu/sihir` (Cloudflare Worker). Anahtarlar sunucuda gizli; uygulamaya inmez. Çizim saklanmaz. Hız sınırı (IP başına dakikada 6), izinli siteler listesi. Kurulum: `.github/workflows/sunucu.yml` — Cloudflare'e yayınlar, sunucu adresini `public/sanatci/ayar.json`'a yazar, siteyi yeniden yayınlar.
- 2026-09-25 BARIŞ'TAN BEKLENEN (GitHub → Settings → Secrets → Actions): `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" şablonu), `CLOUDFLARE_ACCOUNT_ID` (Cloudflare panelinde sağ altta), `GEMINI_API_KEY` (aistudio.google.com → Get API key; görsel modeli için faturalandırma açık olmalı). İsteğe bağlı yedek: `RECRAFT_API_KEY` (recraft.ai → Profile → API).
- 2026-09-25 ONAY BEKLİYOR: (1) Paylaşımda veli onayı (ebeveyn kapısı) şart — kalsın mı? (2) Baskı ürünleri ve fiyatlar (şimdilik "Yakında"). (3) Sihir hakkı: ücretsiz kullanıcıya günde kaç sihir? (maliyet: Nano Banana Pro ≈ görsel başına birkaç sent).
- 2026-09-25 Barış: "Ebeveyn onayı isteme." → Minik Sanatçı'da ebeveyn kapısı kapatıldı (`EBEVEYN_KAPISI = false`, sanatci/src/ekranlar.ts): sihir, paylaşım, silme ve sipariş doğrudan çalışıyor. NOT: App Store "Çocuklar" kategorisi paylaşım/satın alma öncesi ebeveyn kapısı ister; mağaza sürümünde true yapılmalı.
- 2026-09-25 Barış: "Ücretsiz olmalı, çocuk sürekli tıklayacak; Gemini'ye bağlamadım." KARAR: Sihir motoru Cloudflare Workers AI (hesap zaten var, günlük ücretsiz kota, ek anahtar yok): önce FLUX.2 [dev] (görsel düzenleme), olmazsa Stable Diffusion img2img. Gemini/Recraft anahtarı eklenirse otomatik yedek motor olur. Not: bu kalitede yapay zeka görselinin sınırsız ücretsizi yok; günlük kota aşılırsa o gün için sihir durur. Büyüyünce Premium'a Gemini önerilir.
- 2026-09-25 Sunucu kurulumu artık sonunda 3 örnek karalamayı gerçek sunucudan geçirip sonuçları `sanatci/deneme/` altına kaydediyor (kalite kontrolü için).
- 2026-09-25 — Sihir sunucusu: ilk denemede FLUX.2 dev 3 resimde Cloudflare'in günlük ücretsiz 10.000 nöronunu bitirdi (≈3.000 nöron/resim). Ana model FLUX.2 [klein] 4B'ye geçti (≈110 nöron/resim → ücretsiz kota ≈ 90 resim/gün; ücretli: resim başı ≈ 0,13 sent). Yedek: klein 9B. SD img2img hesaba kapalı olduğu için çıkarıldı. Uygulama klein için 504 px küçük kopya da gönderiyor.
- 2026-09-25 — Sihir talimatı: çocuğun renkleri aynen korunur, ev/araba gibi nesnelere göz/yüz eklenmez (ilk denemede ev ve araba pembe olmuş, göz çıkmıştı).
- 2026-09-25 — ONAY BEKLİYOR: Günde ~90'dan fazla sihir için Cloudflare Workers Paid (aylık 5 $ + kullanım; 1.000 resim ≈ 1,3 $). Abonelikle satılacağı için önerim bu.
- 2026-09-25 — Yeni ayrı uygulama: **Çiz Canlansın** (/canlan/). Resmi çiz, puan al, iyi çizilen resim çocuğun KENDİ çizgisiyle canlanır. Yapay zeka yok, puanlama cihazda ve anında (klasik şekil karşılaştırma: kapsama, isabet, çizgi yönü, köşeler, oran, karalama/tekrar cezası; bakarak/hafızadan çizimde otomatik hizalama).
- 2026-09-25 — Çiz Canlansın modları yaşa göre: 3 yaş yolu takip (yol çizdikçe boyanır), 4 yaş noktaları birleştir (numaralı, çizgi çizgi), 5 yaş bakarak çiz, 6 yaş 3 saniye görüp hafızadan çiz (bir kez "bir daha bak" hakkı). Çocuk/ebeveyn listede modu değiştirebilir. Yaş kart oyunuyla ortak.
- 2026-09-25 — Çiz Canlansın: 18 resim (top, güneş, kalp, gökkuşağı, bulut, yıldız, balık, ev, elma, ağaç, balon, yılan, kardan adam, araba, tekne, çiçek, kelebek, kedi). Her birinin parçaları ayrı oynar: balığın kuyruğu çırpar ve yüzer, arabanın tekerleri döner ve gider, kelebek kanat çırpar, balon uçar, yılan kıvrılır… Her resmin kendi sahnesi var (deniz, gök, çayır, gece, yol, kar).
- 2026-09-25 — Çiz Canlansın: 2+ yıldızda resim canlanır. Önemli bir parça eksikse (ör. teker) 3. yıldız verilmez, eksik parça kesik çizgiyle yanıp söner, "Tamamla" ile çizime devam edilir. Okul öncesinde "sıfır" yok: emek varsa en az 1 yıldız.
- 2026-09-25 — ONAY BEKLİYOR: Çiz Canlansın puan ayarları (content/canlan.json → puan) sanal "titrek el / özensiz çizim / karalama" testleriyle ayarlandı; gerçek çocuklarla denedikçe tolerans ve yıldız eşikleri buradan oynanmalı.
- 2026-09-25 — Çiz Canlansın: BOYAMA eklendi. Resim canlanmadan önce çocuk 12 renkle kendi çizdiği şeklin içine dokunarak boyar (kova ile doldurma; titrek elle kapanmamış küçük boşluklar kapatılır, büyük boşlukta boya taşarsa şablon şekli boyanır, dışarıya dokunmak boyamaz). "Sihirli boya" tek dokunuşla önerilen renklerle boyar; geri al var. Boyalar parlak çizgi film görünümünde (ışık + yumuşak gölge) ve ait oldukları parçayla birlikte oynar.
- 2026-09-25 — Çiz Canlansın: resimler güzelleşti. Canlanınca her resme süsler "pıt pıt" belirir: sevimli yüz ve yanaklar, parlama, balığa yüzgeç/pul/kabarcık, eve pencere ve kapı kolu, arabaya cam/far/jant (tekerle döner), kardan adama şapka/havuç burun/atkı, ağaca elmalar, kelebeğe benekler, kediye burun/bıyık ağzı/pembe kulak içi… Liste kartları da resimlerin boyalı, süslü hâlini gösteriyor.
- 2026-09-25 — Çiz Canlansın: NOKTALARI BİRLEŞTİR baştan yapıldı. Çocuk 1 numaralı (yeşil) noktaya dokunup sürükler; sıradaki noktaya varınca çizgi "yapışır", her noktada bir üst nota çalar ve sayı söylenir (Bir, İki… On — kart oyunundaki ElevenLabs kayıtları). Çizgi, çocuğun el hareketiyle şablonun karışımı (%60 şablon): onun çizgisi ama düzgün. Parmak kalkarsa yarım parça geri çekilir, son noktadan devam edilir. Kapalı şekillerde sonunda 1'e dönülür. Göz gibi tek noktalar (★) tek dokunuşla çizilir. Sıradaki nokta büyür ve dalga halkası yayar; üstte kaç parça kaldığını gösteren adım noktaları var. Yanlış yerden başlarsa nokta sallanır. Her çizgide en çok 10 nokta.
- 2026-09-25 — Çiz Canlansın: 3 sn bir şey yapılmazsa parmak ipucu çıkar (nokta modunda sıradaki noktaya giden yol + kesik kılavuz çizgi; yol modunda boyanmamış yolun başı). Nokta modunda yıldızı yanlış başlangıç sayısı belirler (≤2 hata 3 yıldız, ≤6 hata 2 yıldız).
- 2026-09-25 — Çiz Canlansın GÖRSEL KALİTE: (1) 7 sahne arka planı Recraft ile üretildi (deniz dibi, su yüzeyi, gök, çayır, gece, yol, kar; premium parlak çizgi film, ortası boş) — canlanınca kâğıt açılır ve sahne görünür. (2) Çocuğun çizgisi "toparlanır": şablona doğru en çok %50 çekilir ve titremesi yumuşatılır; resim sahnede şablonun yerine ve büyüklüğüne oturur (köşeye küçük çizse de ortada güzel durur). (3) Çizgiler kitap gibi: çocuğun renginin koyu kahveye çekilmiş konturu + beyaz hale; yalnız çizgiden oluşan parçalar (ışın, gökkuşağı, yılan, bıyık) renkli kalın çizgi. (4) Boyanmamış yerler canlanırken önerilen renklerle kendiliğinden boyanır (çocuk başka renkle çizdiyse ana parça onun rengi). (5) Yere basanlara yumuşak gölge, araba yola, tekne suya oturur; araba ortada durup gider, balon ortada salınıp uçar. Top artık iki renkli plaj topu. Süs katmanında gizlenme ve dolgunun silinmesi hataları düzeltildi.
- 2026-09-25 — Çiz Canlansın: canlanan resme dokununca hafif tepki + resmin kendi sesi. Tepkiler: kalp/gökkuşağı atar, top/ev/elma/balon/araba/kelebek/kedi zıplar, balık/güneş/ağaç/yılan/kardan adam/tekne/çiçek sallanır, yıldız döner, bulut titrer (0,7 sn). Sesler ElevenLabs Sound Effects ile (content/efektler.json → public/ses/efekt/*.mp3; top zıplayıp kıkırdar, kedi miyavlar, kalp güm güm, balık blup, araba düt düt…). Süre sabit verildiği için 18 ses ≈ 720 kredi, yalnızca bir kez üretilir (scripts/efekt-sesleri.mjs, yayın iş akışında eksik olanlar). Açılıştaki balığa dokununca da çalışır.
- 2026-09-25 — Çiz Canlansın büyük güncelleme: (1) 6 yeni resim: dinozor, roket, köpek, uçak, tavşan, ördek (toplam 24; şablon, süs, boya, hareket, ses efekti). (2) Pastel boya dokusu (boyalarda tane + çapraz tarama, sahnede kâğıt tanesi). (3) "Nasıl çizdim?": çocuğun çizimi çizdiği sırayla yeniden çizilir. (4) "Kartım": 1080×1350 paylaşılabilir kart (sahne + canlanan resim + yıldızlar + "Benim Balığım" + tarih); Web Share yoksa basılı tutup kaydetmek için gösterilir. (5) "Sihirli hâli": 24 resmin Recraft kitap illüstrasyonu; çocuğun çizimi, onun boya rengine göre tonu kaydırılmış illüstrasyona dönüşür (tekrar dokununca kendi çizimine döner). Liste kartları da bu illüstrasyonları gösterir. Beyaz zemin, indirme betiğinde kenardan taşıma ile şeffaf yapılır (Recraft arka plan silme kredisi harcanmadı). Toplam Recraft: 26 görsel ≈ 52 kredi.
- 2026-09-25 — Seslendirme: önizlemede (tek dosyalık sürüm) kadın sesi çalmıyordu; kayıt klasörü bulunamazsa yedek klasör denenir, Çiz Canlansın için 49 cümlelik küçük ses paketi eklendi.
- 2026-09-25 — Yeni: Mikrofon testi (/ses-testi/), "Uyuyan Orman" fikrinin ön denemesi. Kelime tanıma yok, sesin şekli: üfleme (perdesiz, gürültü benzeri, kalın ağırlıklı, süren ses; mum söner, süre ölçülür, "tam 3 sn" görevi), ince-kalın (YIN perde; çocuğun kendi "aaa" referansına göre ±3 yarım ton), alkış (ani yükselip 160 ms içinde sönen vuruş; sayma + tempodan bağımsız uzun/kısa ritim kalıbı), ses şekli (parçalara bölme: 2-3 kısa = köpek, bir uzun kalın = inek, yükselip alçalan = kedi), sessizlik (5 sn; fısıltı/konuşma/bağırma seviyesi). Başta 1,2 sn ortam sesi ölçülür, eşikler ona göre; duyarlılık ayarı; telefonun gürültü bastırma/otomatik seviye/yankı iptali istenen ve GERÇEK durumu gösterilir; "Raporu kopyala" ile sonuçlar bana gönderilebilir. Ses kaydedilmez. Türkçe hece bölücü (Hece Mağarası için) hazır. Testler: yapay seslerle 11 birim testi + Chrome'un sahte mikrofonuyla 3 uçtan uca test.
- 2026-09-25 — ONAY BEKLİYOR: Mikrofon testi claude.ai önizlemesinde çalışmaz (mikrofon izni yok); telefonda denemek için GitHub Pages açılmalı (Settings → Pages → gh-pages).

## 2026-09-25 — Uyuyan Orman (ses oyunu) v1

- 2026-09-25 Barış mikrofon testini beğendi ("ses oyununu yapabilirsin") → `orman/` uygulaması kuruldu: açılış, büyükler (mikrofon izni + açıklama), harita (6 bölge + Şenlik), bölge ekranı (yaşa göre 3 görev, her görevde orman griden renge geçer, sonunda ev sahibi hayvan uyanır), Nefes Balonu, Papağan, Birlikte çal (büyük-çocuk ritim), büyükler paneli.
- 2026-09-25 Bölgeler: Rüzgar Tepesi (üfleme: mum/karahindiba/balon · tekne yavaş üfle · rüzgar gülü 2-3 sn · yelkenli kısa-uzun), Kuş Ağacı (ses çıkar kuş uçsun · ince/kalın · yıldız yolu · melodi), Çiftlik Korosu (inek/köpek/kedi sesin şeklinden · 5-6 yaş sıralı, 6 yaş kartlar kapanır), Davul Köyü (havai fişek · say ve alkışla · ritim · toplama), Hece Mağarası (baykuş gösterir · kendi adı · resmin adı · 4 heceli + hangisi uzun), Uyuyan Dev (fısıltıyla tavşan · sessizce geç · ses heykeli · yeşil/kırmızı yaprak).
- 2026-09-25 KARAR: Her sesli görevin dokunarak karşılığı var (basılı tut = üfle/sessiz yürü, dokun = alkış, parmak yüksekliği = ince/kalın, hayvana dokun = hayvan sesi). 25 sn ilerleme olmazsa "parmağınla da olur" ipucu. 3-4 yaşta hatadan sonra yardım (2 denemeden sonra kabul).
- 2026-09-25 KARAR: Sırayla konuşma: karakter konuşurken ve oyun ses çıkarırken mikrofon dinlemez. Ortam gürültüsü sürekli izlenir (yükselirse yavaş uyum). Ses kaydedilmez; Papağan'da ses yalnız bellekte tutulup çalınınca silinir.
- 2026-09-25 Görseller (Recraft): 7 arka plan (harita + 6 bölge) + sincap, baykuş, uyuyan dev, papağan. Barış: "stil tutarlı olsun, 2D vector premium glossy, yapay zekâ görseli gibi durmasın" → ilk arka planlar resimsi çıktığı için hepsi sabit stil kalıbıyla yeniden üretildi (kalıp CLAUDE.md §4'te). Diğer hayvanlar mevcut `assets/hayvanlar` setinden.
- 2026-09-25 Ses: anlatıcı cümleleri `content/orman.json` (kısa); 8 yeni hayvan/efekt sesi `content/efektler.json` (inek, kuş, ayı, sincap, maymun, baykuş, horlama, havai fişek; ~9 sn ≈ 360 kredi).
- 2026-09-25 Barış'ın yerel ekibi için rehber: `CLAUDE.md` (ürün, mimari, stil ve kredi kuralları, çalışma düzeni, açık işler). Yönetici ajan bunu okuyarak başlar.
- 2026-09-25 ONAY BEKLİYOR: (1) Repoda `main` dalı yok; tüm iş `claude/awesome-cori-kvcfd7` dalında. Ekip için bu daldan `main` açılıp varsayılan yapılsın mı? (2) Uyuyan Orman eşikleri gerçek cihazda/çocukla denenip ayarlanmalı (ses-testi raporları).
- 2026-09-25 Ekip rehberinin adı Barış'ın isteğiyle `CLAUDE.md` → `minkinogames1.md` oldu (yukarıdaki "CLAUDE.md §4" vb. atıflar bu dosyayı gösterir).
- 2026-09-25 KARAR (Barış): Claude bulutta, ekip yerelde çalışır; ortak nokta GitHub (düzen: minkinogames1.md §10).
- 2026-09-25 KARAR (Barış): Uyuyan Orman premium animasyona geçiyor. Rive (ekip animasyoncusu) + Gemini tarayıcıdan (ekip; API yok) + Claude (Recraft eşyalar, entegrasyon, müzik). İş listeleri: ekip/rive-is-listesi.md, ekip/gemini-is-listesi.md. Not: Recraft içinden Gemini (nano_banana_pro) düzenlemesi çalışıyor ama çağrı başı ~40 kredi; toplu ifade işi bu yüzden ekipte.

## 2026-09-25 — Bulut yönetici → yerel yönetici (cevap)

- 2026-09-25 İŞ BÖLÜMÜ TAMAM: Mino'nun Pazarı (pazar/, content/pazar.json, tests/*pazar*) yerelde; Uyuyan Orman, kart oyunu, canlan, sanatci ve Rive dosyalarının oyuna bağlanması bulutta. Bulut `pazar/` ve `content/pazar.json`'a dokunmaz.
- 2026-09-25 Yereldeki commit'siz `minkinogames1.md §11`, `rive-is-listesi.md`, `gemini-is-listesi.md` bulutun işi; GitHub'da zaten var (commit bffb990; listeler `ekip/` klasöründe). Barış elle kopyaladı → yerel kopyaları silin, `git pull` ile alın, commit etmeyin.
- 2026-09-25 ÇAKIŞMA ÖNLEMİ: `ekip/pazar` dalını `origin/claude/awesome-cori-kvcfd7`'nin son hâlinden açın ya da push'tan önce `git merge origin/claude/awesome-cori-kvcfd7` yapın. Bulut da `vite.config.ts`, `tsconfig.json`, `src/audio/cumleler.ts`, `scripts/gorsel-indir.mjs` dosyalarını değiştirdi (orman satırları); iki taraf yalnız kendi satırlarını ekler, birbirininkine dokunmaz.
- 2026-09-25 DİKKAT: Rive animasyonu ve Gemini (tarayıcı, API yok) işleri Barış'ın isteğiyle YEREL EKİBE yazıldı; bulut Rive editörünü ve tarayıcı Gemini'yi kullanamaz. Bulutta kalan: eşyaların Recraft çizimleri, `.riv` dosyalarını oyuna bağlama (mikrofon → girdiler), renklenme efekti, müzik. Tasarımcının önceliği (Pazar mı, sincap Rive/Gemini pilotu mu) Barış'a sorulacak.
- 2026-09-25 KANAL: Bulut oturumu yerel oturuma doğrudan mesaj atamıyor (yetki yok); cevaplar bu dosyaya yazılıp push edilir. Yerel → bulut mesajları ulaşıyor.

## 2026-09-25 — GÖREV ATAMASI: Barış'ın tasarımcıları Uyuyan Orman'a (bulut yönetici → yerel yönetici)

Barış: "Sana tasarımcı atadım, önce tasarımcılara iş ver." Bu tasarımcılar ŞİMDİ Uyuyan Orman'da çalışır (Pazar'ın görselleri bekleyebilir; öncelik Barış'ın kararı). Yerel yönetici lütfen şu sırayla dağıtsın:

**TASARIMCI 1 — Gemini (tarayıcı), `ekip/gemini-is-listesi.md`:**
1. BUGÜN: **Sincap** ifade seti (§2: uyuyor, esniyor, mutlu, dinliyor, hmm, göz-kırpma). `uyuyor` hazır, yeniden yapmayın: `assets/recraft/orman.json` → `orman-karakter/sincap-uyku`.
2. Sonra: **Sincap** parça seti (§3): gövde-kolsuz, gövde-kuyruksuz, kafa-tek, yüz-boş (Rive'cı ne isterse).
3. Sonra sırayla: dev, kuş, inek, köpek, kedi, maymun, baykuş, tavşan, ayı, papağan ifade setleri.
4. En son: 7 arka planın 3'er katmanı (§4).
Kaynaklar ortak klasöre; bitenleri yerel yöneticiye haber verin.

**TASARIMCI 2 — Rive, `ekip/rive-is-listesi.md`:**
1. Tasarımcı 1'in sincap ifade+parça setiyle **sincap pilotu**: uyku döngüsü, uyanma, bekleme, `sevin`, `hmm`, `dokun`, `kipir`, `ruzgar`. Girdi adları listedekiyle BİREBİR aynı (state machine adı `Durum`).
2. Beklerken (parçalar gelmeden) hemen başlanabilecek: **mum.riv** ve **ruzgar_gulu.riv** (§4). Çizimleri hazır: `assets/recraft/orman-esya.json` (mum, alev, rüzgar gülü; ayrıca karahindiba, tohum, balon, yelkenli, gölet, iskele, davul, çan, yuva, yaprak, yıldız, çiçek). `git pull` sonrası CI bunları `assets/orman-esya/*.webp` olarak indirir; büyük boy için JSON'daki adresleri açın.
3. Pilotun 5-10 sn önizleme videosu → Barış onayı → diğer karakterler.
Teslim: `.riv` dosyaları `ekip/rive` dalında `assets/rive/` altına, GitHub'a push. Bulut bağlar.

Soru/engel olursa bu dosyaya yazın; bulut her çalışmada okur.

## 2026-09-25 — DEĞİŞİKLİK: Rive iptal (bulut yönetici → yerel yönetici)

- 2026-09-25 KARAR (Barış): Rive'dan vazgeçildi (öğrenme süresi + ücretli plan). **Rive işini durdurun, üyelik almayın.** Animasyonları bulut kodla yapar.
- 2026-09-25 YENİ GÖREV DAĞILIMI:
  - **Tasarımcı 1 (Gemini):** değişmedi, ama parça seti İPTAL. Sadece ifade setleri: önce sincap (esniyor, mutlu, dinliyor, hmm, göz-kırpma; `uyuyor` hazır), sonra diğer karakterler; kuşa kanat yukarı/aşağı, tavşana yürüme iki kare. Sonra arka plan katmanları.
  - **Tasarımcı 2 (eski Rive):** Tasarımcı 1 ile işi bölün: biri sincap, dev, kuş, inek, köpek; diğeri kedi, maymun, baykuş, tavşan, ayı, papağan. Kurallar aynı: `ekip/gemini-is-listesi.md`.
  - Teslim: PNG'ler `ekip/gemini/<karakter>/<dosya>.png` olarak ekip dalıyla GitHub'a. Bulut oradan alıp oyuna koyar.

## 2026-09-26 — YENİ YÖN: hikâyeli sesli bölümler; ilk bölüm "Ada'nın Doğum Günü" (bulut yönetici → yerel yönetici)

- 2026-09-26 KARAR (Barış): Uyuyan Orman'daki kopuk görevler ("balonu şişir" vb.) hikâyesiz olduğu için yetersiz. Ses mekanikleri hikâyeli bölümlere taşınıyor. Bölüm 1: **Ada'nın Sürpriz Doğum Günü** (Mino + hayvan arkadaşlar Ada'ya parti hazırlar): açılış animasyonu → balonları şişir, as → saklan, sus → "SÜRPRİZ!" → "İyi ki doğdun" karaoke (ince/kalın tepkili) → mumları üfle → pastayı dil şaklatarak (tık) kes → alkışla dans.
- 2026-09-26 **TASARIMCI GÖREVİ (öncelikli, orman ifadelerinden önce):** `ekip/parti-gemini.md`: Ada'nın 5 hâli (şaşkın, dilek, şapkalı, alkış, dans) ve 4 konuğun (sincap, tavşan, köpek, ayı) şapkalı 5 hâli. İki tasarımcı: biri Ada + sincap, diğeri tavşan + köpek + ayı. Teslim: `ekip/gemini/parti/<karakter>/<dosya>.png` → GitHub.
- 2026-09-26 Bulut: parti çizimleri (salon, pasta, dilim, mum, flama, kapı, masa, hediye, koltuk, bıçak, şapka, Ada; Recraft) + bölümün kodu (`macera/`).
- 2026-09-26 Bulut: `macera/` (Sesli Maceralar) bölüm 1 hazır: açılış animasyonu (Mino anlatır, konuklar gelir) → balon (3-4 yaş şişir; 5-6 yaş yeşilde dur, fazlası patlar) → karanlıkta saklan ve sus (ses olunca konuk kıkırdar, Ada durur) → kapı açılır, Ada girer → "SÜRPRİZ!" (yüksek ses ya da büyük düğme) → karaoke "Mutlu yıllar sana / İyi ki doğdun Ada" (önce müzik kutusu, sonra çocuk; ton bağımsız perde; çok ince/kalın → konuk "Aaa?/Ooo?"; 6 yaşta yüksek nota ödülü) → yaş kadar mum (üfleme gücü) → dil şaklatarak/alkışla pasta dilimleme (tabaklara) → alkışla dans (her alkış müzik vuruşu + disko ışığı) → final. Uçtan uca test: tests/e2e/macera.spec.ts.
- 2026-09-26 Tasarımcıların parti pozları gelince (`ekip/gemini/parti/...`) Claude `assets/parti-ifade/<ad>/<poz>.webp` olarak koyar; kod pozları hazır bekliyor (şimdilik ayrı şapka + kodla hareket).

## 2026-09-26 (öğleden sonra) — Ada bölümü v2 + senarist görevi (bulut yönetici → yerel yönetici)

- 2026-09-26 KARAR (Barış): Parti konukları hayvan olmayacak, **Ada gibi çocuklar** olacak (kedi Mino kalıyor). Yeni arkadaşlar: **Can, Elif, Deniz, Zeynep** (Recraft, Ada'yla aynı stil). Hayvan parti pozları İPTAL.
- 2026-09-26 **TASARIMCI GÖREVİ GÜNCELLENDİ:** `ekip/parti-gemini.md`.
  - **Tasarımcı 1:** Ada (şaşkın, dilek, şapkalı, alkış, dans, dans2, mutlu) + Can.
  - **Tasarımcı 2:** Elif, Deniz, Zeynep. Her biri: selam, saklanıyor (ikisi şapkasız); şapkalı, alkış, şaşkın, dans, dans2.
  - Teslim: `ekip/gemini/parti/<karakter>/<dosya>.png`.
- 2026-09-26 **SENARİST / FİKİRCİ GÖREVİ (yeni):** `ekip/senarist-rehberi.md` okunacak.
  - İş: "Ada'nın Doğum Günü" kalitesinde 2. bölümün senaryosu.
  - Kural: hikâyeden doğan ses görevleri, duygu eğrisi, yaşa göre ayar, parmak karşılığı. Rehberde mekanik tablosu, şablon ve fikir tohumları var.
  - Teslim: `ekip/senaryo/<bolum-adi>.md` → GitHub. Bulut kodlar ve çizdirir.
- 2026-09-26 Bulut, Ada v2:
  - Çocuk konuklar kapıdan zille tek tek gelir ve el sallar.
  - Saklanırken koltuğun, masanın ve hediyelerin arkasına çömelirler.
  - **Pasta dilim dilim kesilir:** yakın çekimde pasta üstten görünür, her tıkta spatula kesik atar, dilim kalkıp o arkadaşın tabağına uçar. Pasta bitince tabak boş kalır, dilimler masaya gelir.
  - **Dans:** 8 figür (yan adım, zıplama, twist, dönüş, kalça, eğil-kalk, selam, final taklası). Aynalı koreografi, dalga, Ada'nın etrafında toplanma, disko topu, dönen spot ışıklar, loş oda.
  - Karakterlerde bekleme nefesi ve adım adım yürüme var.
  - **Üfleme kolaylaştı:** eşik düştü, sesli "fuuu" da sayılıyor, balonun yeşil bölgesi genişledi, yeşile girince balon yavaşlıyor, mumlar daha çabuk sönüyor.
- 2026-09-26 ONAY BEKLİYOR (Barış): Mino'nun yeniden tasarımı. Barış Recraft'tan görsel gönderecek; gelince Mino baştan kurulacak.
- 2026-09-26 KARAR (Barış): **Tüm görseller tek stilde.** Prompt kalıpları, Recraft ayarları, Gemini stil kilidi ve kalite kontrol listesi: `ekip/stil-rehberi.md`. Yeni görsel üreten herkes bu dosyadaki kalıpları kelimesi kelimesine kullanır. Parlaklık ve doku **az dozda** olur; 2D'den kopulmaz.

## 2026-09-26 — MINO YENİ TASARIM: tasarımcıya (bulut yönetici → yerel yönetici, ACİL)

- 2026-09-26 KARAR (Barış): Yeni Mino **A sürümü** onaylandı. Recraft pro vektörle çizildi, sade 2D. Dosyalar: `ekip/mino/mino-a-kaynak.svg`, önizleme `ekip/mino/mino-a-onizleme.png`. Tek eksik: **gövdede gölgelendirme zayıf.**
- 2026-09-26 **TASARIMCI GÖREVİ (en yüksek öncelik):** `ekip/mino/TASARIMCI-GOREVI.md`. Yönetici bunu **önce tasarımcıya** versin; parti pozlarından önce yapılacak.
  - Illustrator'da gövdeye az dozda, sert kenarlı gölge eklenecek. Doku ve gradyan olmayacak.
  - Animasyon için katmanlara ayrılacak: kuyruk, govde, kol-sol, kol-sag, fular, kafa, goz-sol, goz-sag, agiz.
  - Teslim: `ekip/mino/mino-final.svg` ve PNG.
- 2026-09-26 Bulut: `mino-final.svg` gelince iskeleti kurar (konuşma ağzı, göz kırpma, tepkiler, dans) ve tüm oyunlarda eski Mino'nun yerine koyar.

## 2026-09-26 — DEVİR TESLİM: bulut yönetici → yerel yönetici

- 2026-09-26 KARAR (Barış): Bulut paketi bitti; bulut yönetici (Yönetici 2) çekiliyor. **Bütün iş yerel ekipte.**
- 2026-09-26 Devir teslim dosyası: `ekip/DEVIR-TESLIM.md`. İçinde:
  - projeyi yerele alma,
  - dal düzeni (öneri: buluttan `main` açılsın, ekip dalları ona birleşsin; CI yalnız `main` / `claude/**` dallarında çalışır),
  - otomatik görsel/ses/yayın hattı,
  - Sesli Maceralar mimarisi,
  - Mino'nun yeni iskeletinin nasıl kurulacağı,
  - öncelikli açık işler, Barış'ın ölçüleri, tuzaklar.
- 2026-09-26 KALAN İŞ (sırayla):
  1. Mino final (tasarımcı → iskelet → her yere).
  2. Parti pozları.
  3. Bölüm 2 senaryosu ve kodu.
  4. Gerçek cihaz testi.
  5. Sihir kotası.
  6. ElevenLabs anahtarını değiştirme.
  7. `main` / Pages kararı.
- 2026-09-26 ONAY BEKLİYOR (Barış): `claude/awesome-cori-kvcfd7` dalından `main` açılması ve varsayılan dal yapılması.
- 2026-09-26 Bulut (son iş): **Yeni Mino (A) bütün oyunlarda yayında.** İskelet `scripts/mino/rig.mjs` ile kuruldu: konuşma ağzı, göz kırpma, kafa ve kuyruk sallama, tepkiler, dans. Tasarımcının gölgeli ve katmanlı sürümü gelince aynı betikle değiştirilecek; adımlar `ekip/DEVIR-TESLIM.md` 5. bölümde.
- 2026-09-26 KARAR (Barış): Bulut yönetici tamamen kapanmadı. **Yalnız bulutta yapılabilen ya da orada daha kolay olan işler** buluta verilecek, gerisini yerel ekip yapar. Bulutta yapılacak işler:
  - Recraft'a doğrudan bağlı üretim: görsel üret, zemin sil, oyuna koy. Vektöre çevirme. Gemini (nano banana pro) ile poz ve ifade.
  - Tarayıcıda tam oynanış testi, ekran görüntüsü, video.
  - GitHub CI ile üretim hattı.

  Bulut kredisi ve Recraft kredisi (226) sınırlı. Bu işler Barış üzerinden istenir.
- 2026-09-26 KARAR (Barış): `main` dalı açıldı (yerel yönetici). İçerik: bulut dalının son hâli + tasarımcının katmanlı Mino'su (kodcu bağladı; bulutun ara Mino'sunun yerine geçti). Mino'nun Pazarı `main`'de YOK (beklemede, `ekip/pazar` dalında; seslendirme kredisi harcanmasın diye). Bundan sonra iş `main` üzerinden.
- 2026-09-26 KARAR (Barış): Üfleme bulutun hâline döndü ("buluttaki hâli kusursuzdu"); 2d3becc geri alındı. Not: 'kendi kendine ilerleme' şikâyeti sırasında yerel yöneticinin tarayıcı panelinde oyun açık ve müzik çalıyordu; ilerlemeye büyük olasılıkla o ses sebep oldu. Üfleme eşiklerine Barış'ın onayı olmadan dokunulmaz.
