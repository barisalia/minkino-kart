# Minkino — ekip ve ajan rehberi

Bu dosya bu repoda çalışan herkes (insan ya da yapay zekâ ajanı) içindir. İşe başlamadan önce baştan sona okunur.
Oturumlar arası karar defteri: [ORTAK_NOTLAR.md](ORTAK_NOTLAR.md) (yalnızca en alta, tarihli satır eklenir; eskisi silinmez).

## 1. Ürün ve ürün sahibi

- **Ürün sahibi: Barış.** Yazılımcı değil; kararları o verir. Ona teknik jargonla değil, sade Türkçeyle, kısa yazın. Yaptığınızı gösterin: link, ekran görüntüsü.
- **Minkino**: 3-6 yaş için Türkçe, eğitici, sesli mobil oyunlar. İleride tek bir Minkino uygulamasında (Capacitor ile iOS/Android) mini oyunlar olarak toplanacak, abonelikle satılacak.
- Hedef kalite: **premium çocuk kitabı / Disney Junior seviyesi**. Barış'ın en çok önem verdiği şey görselin kalitesi ve **stil tutarlılığı**. "Çalışıyor" yetmez; güzel görünmeli.

| Uygulama | Klasör | Ne |
|---|---|---|
| Minkino Kartlar (+ Mino kedi) | `index.html`, `src/` | Sesli kart oyunu: 6 soru tipi, yaş × tema, albüm; Mino konuşan kedi |
| Minik Sanatçı | `sanatci/` | Çocuk karalar → yapay zekâ "sihir" ile resme dönüşür (Cloudflare Worker `sunucu/sihir`) |
| Çiz Canlansın | `canlan/` | Resmi çiz, puan al, çizim canlanır (3 yaş iz, 4 nokta, 5 kopya, 6 hafıza) |
| Mikrofon testi | `ses-testi/` | Uyuyan Orman'ın ses analizinin deneme sayfası (üfleme, ince-kalın, alkış, ses şekli, sessizlik) |
| **Uyuyan Orman** | `orman/` | Sesle/nefesle/alkışla oynanan orman: 6 bölge × yaşa göre 3 görev, harita, şenlik, Nefes Balonu, Papağan, Birlikte çal |

**Canlı adresler** (her push'ta otomatik yayınlanır):
- https://minkino-site.barisalidogan.workers.dev/ → `/sanatci/`, `/canlan/`, `/ses-testi/`, `/orman/`
- GitHub Pages (`https://barisalia.github.io/minkino-kart/`) repoda henüz **kapalı**. Açmak için: Settings → Pages → Branch `gh-pages` → Save.

## 2. Çalıştırma

```bash
npm ci
npm run dev          # http://localhost:5173/ (orman: /orman/, test modu: ?test=1)
npm test             # vitest birim testleri (tests/unit)
npm run e2e          # Playwright (tests/e2e; 390×844 iphone + 768×1024 tablet), ekran görüntüleri tests/screens/
npm run build        # tsc + vite → dist/ (göreli yollar, Capacitor'a hazır)
npm run gorsel       # assets/recraft/*.json içindeki Recraft görsellerini indirip WebP yapar
```
- Node 20+. TypeScript strict; `npm run build` hatasız geçmeden push yok.
- Test modu `?test=1`: animasyon ve konuşma beklemeleri kısalır; `&ekran=…&yas=…` ile doğrudan ekrana gidilir (her uygulamanın `main.ts`'ine bakın).
- Mikrofon testleri Chromium'un sahte mikrofonuyla yapılır (`tests/e2e/ses-testi.spec.ts`: WAV üretip `--use-file-for-fake-audio-capture`).

## 3. Mimari (kısaca)

- Vite çok sayfalı (`vite.config.ts` → `input`), **çerçeve yok**; DOM `src/ui/dom.ts` içindeki `h('div.sinif', {…}, …çocuklar)` ile kurulur.
- Ekranlar: `ekranKaydet('ad', fabrika)` + `app.git('ad', param)` (`src/uygulama.ts`). Her ekran `{ el, kapat? }` döner; `kapat` içinde zamanlayıcı/mikrofon/rAF temizlenir.
- CSS her zaman kök sınıfın altında: `.mk-kok` (ortak), uygulama önekleri `cc-` (canlan), `st-` (ses-testi), `or-` (orman). Gömülünce başka uygulamayı bozmamalı.
- İçerik ve konuşma metinleri `content/*.json` içinde (kod değil). Kayıtlar `localStorage`, anahtarlar `minkino-*-v1`.
- Ses: `src/audio/` → konuşma (ElevenLabs kaydı varsa o, yoksa cihaz sesi), Web Audio sentez efektler, müzik. Tüm cümleler `src/audio/cumleler.ts` → `tumCumleler()` ile toplanır; yeni bir JSON eklerseniz oraya da ekleyin.
- **Kod dili Türkçe**: değişken, fonksiyon, yorum, commit mesajı Türkçe (ASCII harflerle: `ş→s`, `ı→i` …). Çevredeki kodun üslubuna uyun.

### Uyuyan Orman (`orman/src`)
- `kulak.ts`: mikrofon (ses kaydedilmez; kare kare analiz, 1 sn ortam ölçümü, ortam gürültüsü sürekli izlenir). **Sırayla konuşma kuralı**: karakter konuşurken ya da oyun ses çalarken dinlenmez (`kulak.sustur(ms)`).
- Analiz `ses-testi/src/analiz.ts` (FFT, YIN perde, üfleme, alkış, ses şekli, sessizlik, Türkçe `hecele`). Birim testleri `tests/unit/ses-testi.test.ts`.
- `gorev.ts`: görev arayüzü + mikrofon/dokunma uyarlayıcıları (`Ufleme`, `Alkis`, `Perde`). **Her sesli görevin dokunarak karşılığı olmak zorunda** (gürültülü ortam, mikrofon izni yok, konuşma güçlüğü). Oyun hiçbir koşulda kilitlenmez.
- `bolge-*.ts`: 6 bölge, her biri `xGorevleri(yas)` → 3 görev. `bolgeler.ts` harita konumları. `ekranlar.ts` açılış/izin/harita/bölge/şenlik, `ekstra.ts` Nefes Balonu/Papağan/Birlikte.
- Kurallar: kelime tanıma YOK, sesin şekli ölçülür; ritim tempoya değil aralara göre; bağırma görevleri kısa ve seyrek; ses hiçbir yere gönderilmez; sağlık/terapi iddiası yok.

## 4. Görseller (Recraft) — STİL KURALI

Barış'ın kuralı: **2D vektör, yüksek kalite, premium glossy cartoon, çocuk kitabı stili; yapay zekâ görseli gibi durmasın, net dursun.** Tutarlılık her şeyden önemli.

- Model: `recraftv4_1_raster`, `1:1`. (Vektör model sahnelerde gökyüzüne rastgele lekeler bırakıyor; kullanmayın.)
- **Karakter/nesne** kalıbı (beyaz zemin; indirme betiği zemini şeffaf yapar):
  > A single cute … , premium glossy cartoon style for a toddler picture book, soft shading and highlights, thick dark brown outline, simple rounded shapes. Centered, isolated on a plain white background, no text, no ground.
- **Arka plan** kalıbı (ortası boş kalır, karakterler üstüne gelir):
  > Empty background scene for a premium toddler picture book: … Premium glossy cartoon vector illustration, clean 2D vector art, modern Disney Junior / Nick Jr. preschool style, smooth flat color fills with soft gradients, glossy white highlights, crisp clean dark-brown outlines, simple rounded shapes, no texture, no brush strokes, no grain, no sketch lines, no painterly effects. … The whole center of the image is open empty space (space for a character). No animals, no characters, no text.
- Resimsi/dokulu/eskiz görünen, fotoğraf parçası (gerçekçi ay vb.) olan, yazı içeren sonuç **kullanılmaz**; yeniden üretilir.
- Akış: üretilen görselin adresi `assets/recraft/<grup>.json` dosyasına `"klasor/ad": "https://img.recraft.ai/…"` olarak yazılır → `npm run gorsel` (ya da CI) indirir: karakterler 512 WebP şeffaf, `sahne/` 768 ve `orman/` 1024 kare arka plan. Dosyayı yeniden indirmek için eski `.webp`'yi silin.
- Mevcut görsel setleri: `assets/hayvanlar`, `meyveler`, `tasitlar`, `renkler`, `canlan`, `sahne`, `orman`, `orman-karakter`. Önce var olanı kullanın, gerekmedikçe yenisini üretmeyin.
- Maliyet: görsel başına ~2 kredi. Toplu üretimden önce 1 örnek üretip stili kontrol edin.

## 5. Seslendirme ve ses efektleri (ElevenLabs) — KREDİ KURALI

- Anlatıcı: Barış'ın seçtiği genç kadın sesi, `content/seslendirme.json` (Eleven v3, dil `tr`, hız 0.9). Başka ses kullanmayın.
- **Metinler kısa**: arayüz cümlesi ≤ 30 karakter hedef, soru ≤ 6 kelime. Uzun cümle hem takılıyor hem kredi yakıyor (`tests/unit/cumleler.test.ts` sınırları denetler).
- Üretim yalnızca CI'da (`.github/workflows/yayinla.yml`): push'ta **eksik** cümleler seslendirilir (`public/ses`, `manifest.json`), bütçe sınırı var. Aynı metni değiştirmek yeniden kredi harcatır; gereksiz metin değişikliği yapmayın.
- Ses efektleri: `content/efektler.json` → `public/ses/efekt/<ad>.mp3` (saniyesi 40 kredi; 1-1.5 sn tutun). Mümkünse Web Audio sentezi (`src/audio/efekt.ts`) kullanın.
- **"Çok kredi harcama"** Barış'ın açık talimatı: büyük toplu üretimden önce tahmini krediyi söyleyip onay alın.

## 6. Sunucu ve yayın

- `yayinla.yml` (her push): Recraft indir → eksik seslendirme/efekt → birim testleri → build → Cloudflare'e (`sunucu/site`, `minkino-site`) ve `gh-pages`'e yayın. Üretilen dosyaları repoya `[skip ci]` commit'iyle geri yazar, bu yüzden push'tan önce `git pull` yapın.
- `sunucu.yml`: Minik Sanatçı'nın sihir Worker'ı (`sunucu/sihir`, Workers AI `flux-2-klein-4b`, günlük ücretsiz kota ~90 resim).
- GitHub secret adları: `ELEVENLABS_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, (isteğe bağlı) `GEMINI_API_KEY`, `RECRAFT_API_KEY`.

## 7. Güvenlik

- **API anahtarı asla repoya, koda, commit mesajına, loga yazılmaz.** Yerelde gerekiyorsa `.env` (git'e girmez) ya da ortam değişkeni.
- ElevenLabs anahtarı geçmişte bir sohbete yazıldı. **Değiştirilmesi (rotate) gerekiyor**: ElevenLabs'te eskisi silinip yenisi GitHub secret'a konmalı.
- Çocuk verisi: ses kaydedilmez/gönderilmez; çocuğun adı yalnızca cihazda (`localStorage`). Analitik/üçüncü parti SDK eklemeden önce Barış'a sorun.

## 8. Çalışma düzeni (yönetici ajan için)

1. **Dal durumu**: şu an repoda tek dal var: `claude/awesome-cori-kvcfd7` (bütün iş burada; `main` yok). İlk iş Barış'ın onayıyla bu daldan `main` açmak ve GitHub'da varsayılan dal yapmak. Sonra her iş kendi dalında (`ozellik/…`, `duzeltme/…`) yapılır ve PR ile `main`'e girer. `yayinla.yml` `main` ve `claude/**` dallarında çalışır.
2. **İşi bölerken**: bir PR = bir konu. İş tanımında hangi uygulama, hangi dosyalar, "bitti" ölçütü (test + ekran görüntüsü) yazsın.
3. **Her PR'ın kontrol listesi**:
   - `npm run build` ve `npm test` geçiyor; ilgili `npm run e2e` testi geçiyor, konsol hatası yok (`tests/e2e/yardimci.ts` → `hataTopla`).
   - Telefon (390×844) ve tablet (768×1024) ekran görüntüsü PR'da. Görsel iş ise önce/sonra.
   - Yeni konuşma metni kısa; yeni görsel stil kalıbına uygun; yeni sesli görevin dokunma karşılığı var.
   - Kredi harcayan bir şey varsa tahmini yazılmış ve onaylanmış.
   - `ORTAK_NOTLAR.md`'ye tarihli satır eklendi (KARAR / ONAY BEKLİYOR / KALAN İŞ).
4. **Barış'a rapor**: kısa Türkçe, link + görüntü; teknik ayrıntı değil sonuç. Onun kararını gerektiren her şey `ONAY BEKLİYOR:` diye not edilir.
5. **Kapsam**: istenenden fazlasını yapmayın ("sadece bunu yap"). Emin olmadığınız ürün kararlarını Barış'a sorun.

## 9. Açık işler (öncelik sırasıyla)

1. **Uyuyan Orman'ı gerçek cihazda denemek** (iPhone Safari, bir Android, bir iPad; mümkünse bir çocukla). Önce `/ses-testi/` sayfasında "Raporu kopyala" çıktıları toplanıp eşikler (`ses-testi/src/analiz.ts`, `orman/src/bolge-*.ts`) ayarlanmalı. iPhone'da mikrofon açıkken oyun sesinin kısılıp kısılmadığına bakılmalı.
2. Uyuyan Orman: yaş başına görev çeşitliliğini artırmak (şimdi bölge × yaş başına 3 görev), bölge uyanınca kısa müzik, final şenliğinde çocuğun ritmine eşlik eden müzik, gece modu (yalnız fısıltı/nefes).
3. Çiz Canlansın: puan eşiklerini gerçek çocuk çizimleriyle ayarlamak (`content/canlan.json` → `puan`).
4. GitHub Pages'i açmak (ya da yalnız Cloudflare ile devam kararı).
5. ElevenLabs anahtarını değiştirmek (bkz. Güvenlik).
6. Capacitor ile iOS/Android paketi, mağaza ikonları, açılış ekranı; tek Minkino kabuk uygulaması (oyunlar `oyunuBaslat(kok, { cikis })` gibi giriş noktalarıyla gömülür).
7. Abonelik (RevenueCat vb.); altyapı `src/engine/odul.ts` → `ABONELIK_AKTIF = false`.
8. Mino: ayrı karakter sesi, kol hareketleri (ORTAK_NOTLAR'daki ONAY BEKLİYOR maddeleri).

## 10. Bulut + yerel çalışma düzeni

- **Claude (bulut)** yalnızca `claude/awesome-cori-kvcfd7` dalında çalışır ve oraya push eder. **Yerel ekip** bu dala doğrudan push etmez; kendi dallarında çalışır (`ekip/<konu>`), GitHub'a push eder.
- Yerel ekip, bulutta yapılanları almak için: `git fetch origin && git merge origin/claude/awesome-cori-kvcfd7` (kendi dalına). CI'ın ürettiği görsel/ses commit'leri de bu yolla gelir.
- Claude, ekibin işini görmek/almak için ekibin GitHub'a push ettiği dalı okur; yerel bilgisayardaki push edilmemiş dosyaları göremez.
- Aynı dosyada aynı anda çalışmayın: iş bölüşümü `ORTAK_NOTLAR.md`'ye yazılır (kim, hangi uygulama/dosya). `ORTAK_NOTLAR.md`'ye yalnız en alta satır eklendiği için çakışma kolay çözülür: iki tarafın satırları da tutulur.
- Final: ekibin dalları ve bulut dalı PR ile `main`'de birleşir; yerelde `git pull` ile herkes son hâli alır.
