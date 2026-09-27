# Minkino için Program Önerileri

*27 Eylül 2026 · 6 kategori incelendi: video, 2D animasyon, görsel, ses ve müzik, oyun ve mağaza, pazarlama. Denetimde bulunan düzeltmeler rapora işlendi. Kaynağından teyit edilemeyen bilgiler "doğrulanamadı" diye işaretli.*

## 1. Kısa cevap

1. **Seedance konusunda net görüş:** Seedance 2.0 ve 2.5 bugün en güçlü video yapay zekâları arasında. Minkino'da iki işe yarar: sosyal medya fragmanına 2-3 etkileyici çekim eklemek ve yeni film sahnesini çizmeden önce hızlı bir taslak film (animatik) görmek.
   - **Oyun içi animasyon için uygun değil.** Uygulamadaki filmler kendi SVG motorumuzla kalmalı. Stil birebir korunuyor, dosya küçük kalıyor, çocuk dokununca karakter tepki veriyor.
   - **App Store tanıtım videosuna konamaz.** Apple orada yalnızca uygulamanın kendi ekran kaydını kabul ediyor.
   - **Türkçe konuşma listesinde Türkçe yok.** Video sessiz üretilir, ses ElevenLabs'ten eklenir.
2. **Video araçları nerede denenecek:** Zaten para ödediğimiz ElevenLabs'in "Görsel ve Video" bölümünde. Seedance 2.0 ve 2.5, Kling 3.0 ve Gemini Omni Flash orada, yeni hesap gerekmiyor. Dreamina veya CapCut uygulamasına Mino'nun ana çizimi **yüklenmesin**. Bu uygulamaların şartları hizmeti "ticari olmayan kullanım" için tanımlıyor ve yüklenen her şey için ByteDance'e süresiz kullanım hakkı veriyor.
3. **Mağaza ve tanıtım videosu 0 kredi tutar.** Filmler kendi motorumuzdan kare kare MP4'e dökülür; bu, ajanın bir günlük işi. Yapay zekâ klipleri bu videoya sadece sosyal medyada ve en fazla 2-3 çekim olarak eklenir.
4. **En görünür kalite artışı neredeyse bedava: dudak senkronu.**
   - ElevenLabs'in hizalama özelliği, elimizdeki seslerde hangi harfin ne zaman söylendiğini çıkarır.
   - Tasarımcı Mino ile Kino için 6'şar ağız şekli çizer. Böylece ağız söyleneni takip eder.
   - Rive gerekmiyor; Rive 25 Eylül'de iptal edildi ve bu karar doğru.
5. **Görsel tarafı:**
   - Recraft'ın yeni "stil kimliği" özelliği (V4 Styles) kullanılır.
   - Yeni pozlar için Nano Banana 2 kullanılır.
   - Seedance'in görsel kardeşi Seedream 5.0 Pro, Recraft içinde aynı krediyle denenebilir.
   - Karakteri animasyon parçalarına ayırmak için Layer.ai var.
6. **Müzik:**
   - Türkçe çocuk şarkısı için bir aylık Suno Pro alınır; sözleri bizim senarist yazar.
   - Menü müziği için Lyria veya Adobe kullanılır.
   - ElevenLabs Music uygulamanın içinde kullanılamaz, çünkü şartları buna izin vermiyor. Tanıtım videolarında kullanılabilir.

## 2. Kategori tabloları

### Video yapay zekâsı
| Program | Ne için | Fiyat | Karar |
|---|---|---|---|
| ElevenLabs Görsel ve Video | Birkaç video modelini tek hesaptan denemek; Türkçe ses ve dudak senkronu aynı yerde | Mevcut abonelik; seslendirmeyle aynı krediden düşer (video başına kredi doğrulanamadı) | **Dene** (ilk deneme yeri) |
| Seedance 2.0 / 2.5 | Fragman çekimi ve taslak film; birden çok referansla her klipte aynı Mino | Dışarıdan alınırsa 720p 5 sn yaklaşık 1,5 $. 2.5 yaklaşık 2 kat pahalı, en çok 720p ve 30 sn | 2.0 **Dene**, 2.5 **Sonra** |
| Kling 3.0 | Hareketli çekimler (koşma, zıplama) | Ücretsiz planda 30 üretim, ticari hak yok. Standard ilk ay 6,99 $, sonra 8,80 $/ay | **Dene** |
| Vidu Q3 | 2D animasyona özel; kalıcı "karakter profili" | Ücretsiz ~40 kredi/ay (filigranlı, ticari değil). Standard ~8 $/ay | **Dene** |
| Gemini Omni Flash / Veo 3.1 | Videoyu sohbetle düzeltmek; Veo Lite en ucuzu | Omni ~0,10 $/sn, Veo Lite 0,05 $/sn | Omni **Dene** (ElevenLabs içinden), Veo **Sonra** |
| Wan 2.2 / LTX-2 (açık kaynak) | Uzun vadede kendi Minkino stilimizle eğitilmiş model | Ücretsiz ama güçlü bir bilgisayar gerekir; LTX 10 M $ gelirin altında ücretsiz | **Sonra** |

**Gerek yok:** Sora (kapandı), Pika, Midjourney Video, Luma, MiniMax Hailuo, Runway (Seedance'e başka yoldan ulaşılamazsa düşünülür), Adobe Firefly video (Seedance ve Vidu yok; Kling ve Veo çıktılarına Adobe hukuki güvence vermiyor). Not: Wan 2.7 ve 3.0 açık kaynak değil.

### 2D animasyon ve dudak senkronu
| Program | Ne için | Fiyat | Karar |
|---|---|---|---|
| Kendi SVG film motorumuz | Uygulama içindeki filmler ve oyunlar; telefonda akıcı | 0 | **Hemen kullan** (devam) |
| ElevenLabs hizalama + zaman damgalı diyalog | Ağız söylenen kelimeye göre oynar; eski seslerin yeniden seslendirilmesi gerekmez | Mevcut abonelik (konuşmayı yazıya çevirme ücretiyle aynı) | **Hemen kullan** |
| Rhubarb Lip Sync | Metni olmayan seslerde (şarkı) ağız senkronu; yedek | Ücretsiz | **Dene** |
| Illustrator Turntable | Tek çizimden yan, arka ve 3/4 görünüm; çıktı vektör | Üretim başına 20 Adobe kredisi | **Dene** |
| Hedra Character-3 | Sosyal medya için "Mino konuşuyor" klibi | Ücretsiz planı filigranlı; ücretli ~15 $/ay (doğrulanamadı) | **Sonra** |
| Spine / Rive | Motorumuz ucuz telefonda takılırsa yedek | Spine 69 $ tek sefer; Rive Cadet 9 $/ay | **Sonra** |

**Gerek yok:** Moho, Cartoon Animator, Toon Boom Harmony, Live2D, DragonBones, ToonCrafter, LottieFiles, Character Animator, Adobe Animate (bakım modunda), Meta Animated Drawings (proje arşivlendi). Cavalry artık ücretsiz; tanıtım videosu aşamasında bakılabilir.

### Görsel ve karakter tutarlılığı
| Program | Ne için | Fiyat | Karar |
|---|---|---|---|
| Recraft V4 Styles (stil kimliği) | 5 onaylı görselden tek bir "Minkino stili" çıkarmak; nesne ve arka plan | Mevcut Recraft kredisi (stil başına kredi doğrulanamadı) | Nesne ve arka plan **Hemen kullan**, karakter **Dene** |
| Nano Banana 2 / Pro | Aynı karakterin yeni pozu ve ifadesi | NB2 0,067 $, Pro 0,134 $, Lite 0,034 $ / görsel | **Hemen kullan** (önce NB2) |
| Seedream 5.0 Pro | Poz denemesinde 4. aday; 10 referans görsel alır | Recraft kredisinden (karşılığı doğrulanamadı) | **Dene** |
| Layer.ai parça aracı | Karakteri parçalara ayırır, örtülü yerleri (Kino'nun boynu) tamamlar | 10 $/ay | **Dene** (önce ücretsiz deneme) |
| Firefly Custom Models | Mino'ya özel eğitilmiş model | Eğitim başına 500 Adobe kredisi | **Sonra** (kredi yetmeyebilir) |
| Scenario | Poz testi başarısız olursa Mino modeli (5-15 görselle) | Pro 45 $/ay | **Sonra** |

**Diğer kararlar:**
- Vektöre çevirme: Illustrator Image Trace **Hemen kullan**. Recraft vectorize ve Vectorizer.AI (9,99 $/ay) **Dene**.
- Minik Sanatçı'da FLUX klein 4B ile kalınır.

**Gerek yok:** Midjourney (otomasyonu yok; çizimlerin gizli kalması 60 $/ay'lık planı istiyor), Ideogram (model ücretsiz ama ticari kullanım yasak), Leonardo, Krea. GPT Image 2.5 **Sonra** (ayrı bir OpenAI hesabı gerekir).

### Ses ve müzik
| Program | Ne için | Fiyat | Karar |
|---|---|---|---|
| ElevenLabs v3 + Diyalog | Anlatıcı ve film diyalogları | Starter 6 $/ay (30 bin kredi), Creator 22 $/ay; 1 harf = 1 kredi | **Hemen kullan** |
| ElevenLabs Voice Design | Mino (ince) ve Kino (kalın) için kalıcı karakter sesleri | Mevcut abonelik | **Dene** |
| Suno Pro | Türkçe sözlü çocuk şarkısı | ~8-10 $/ay (doğrulanamadı), ayda 20 indirme | **Dene** (1 ay) |
| ACE-Step 1.5 | Suno'ya ücretsiz alternatif; bilgisayarda çalışır | Ücretsiz; güçlü bilgisayar gerekir | **Dene** (Suno ile yan yana dinlenir) |
| Lyria 3 / Adobe Generate Music | Menü ve ödül müziği; yalnız enstrümantal (Türkçe vokal yok) | Lyria parça başına 0,04-0,08 $ | **Dene** |
| Web Audio → Freesound CC0 → ElevenLabs efekt | Oyun efektleri, bu sırayla | 0 / 0 / üretim başına ~200 kredi | **Hemen kullan** |

**Sonra:**
- Gemini 3.8 Flash TTS: şartlı. Yalnız hazırlık aşamasında kullanılabilir; çok konuşmacılı modu yalnız hazır seslerle çalışıyor.
- ElevenLabs Music: uygulama içinde yasak, tanıtımda serbest.
- AIVA, Stable Audio, Zapsplat.

**Gerek yok:** Hume (Türkçe yok), OpenAI TTS, Azure, Cartesia, Fish Audio, Udio (indirme kapalı), Mubert, Soundraw, Epidemic Sound, Artlist, Sync Labs, ElevenLabs Dubbing.

### Oyun, paketleme ve mağaza
| Program | Ne için | Fiyat | Karar |
|---|---|---|---|
| Capacitor 8.5 | Web uygulamasını iOS ve Android'e paketler | Ücretsiz | **Hemen kullan** (Kasım'daki 9. sürüm beklenmesin) |
| Codemagic | Mac almadan iOS paketi çıkarmak | Kişisel hesapta ayda 500 dk ücretsiz, sonrası 0,095 $/dk | **Hemen kullan** |
| RevenueCat | Abonelik altyapısı | Aylık 2.500 $ gelire kadar ücretsiz, sonra brüt gelirin %1'i | **Hemen kullan** |
| Firebase Test Lab | Gerçek Android cihazlarda açılış ve çökme kontrolü | Ücretsiz: günde 5 gerçek cihaz | **Hemen kullan** |
| Kendi anonim sayacımız (Cloudflare) | "Oyun açıldı", "film bitti" gibi ölçümler; üçüncü taraf araç olmadan | 0 | **Hemen kullan** (Barış onayıyla) |
| Sentry | Hata takibi; yalnız test sürümünde, mağaza sürümünden çıkarılır | Ücretsiz plan | **Dene** |

**Mağaza kuralları:**
- Apple: Çocuk kategorisinde yaş bandı "5 ve altı" seçilir, ebeveyn kapısı zorunlu.
- Google Play: Kişisel geliştirici hesabında yayından önce 12 testçiyle 14 günlük kapalı test şart. Şirket hesabı bu şarttan muaf ama D-U-N-S numarası istiyor. Hesap türü baştan seçilmeli.
- Yeni film ve ses içeriği sonradan indirilebilir; yeni oyun kodu indirilemez.

**Gerek yok:** Phaser 4, Godot, GSAP (motorumuz zaten saat tutuyor), Firebase Analytics ve Crashlytics (çocuk kategorisinde ret riski), PostHog, Qonversion (tek abonelik aracı yeter), Rotato. **Sonra:** PixiJS, TelemetryDeck, BrowserStack, Adapty (yedek).

### Pazarlama ve ekip
| Program | Ne için | Fiyat | Karar |
|---|---|---|---|
| Kendi MP4 hattımız (Playwright saati veya HyperFrames + ffmpeg) | Reels, TikTok ve Shorts; Türkçe altyazı doğrudan senaryodan | 0 | **Hemen kullan** |
| Metricool (bu oturuma bağlı) | Paylaşım planlama, en iyi saat, ölçüm | Ücretsiz: 1 marka, ayda 20 gönderi | **Hemen kullan** (ajan taslak hazırlar, Barış yayınlar) |
| Adobe Express | Kapak, karusel, mağaza görseli | Illustrator planına dahil (ayda ~25 üretken kredi) | **Hemen kullan** (yapay zekâsız) |
| YouTube "Çocuklara özel" + YouTube Kids | Ücretsiz keşif kanalı | Ücretsiz | **Hemen kullan** |
| Apple Ads, App Store öne çıkarma başvurusu, Google Teacher Approved | Ebeveyne ulaşmak; uygulamaya araç eklemek gerekmez | Bütçe bizde; başvurular ücretsiz | **Sonra** (lansmanda) |
| CapCut | Hızlı trend kurgusu | Ücretsiz | **Sonra** (yüklenen içerik için süresiz lisans maddesi var) |

**App Store önizleme videosu şartları:** 15-30 sn, 886x1920, yalnız uygulamanın kendi görüntüsü. 60 sn'lik film olduğu gibi konamaz, 30 sn'lik bir kesit hazırlanır.

**Gerek yok:** Descript, Opus Clip, Submagic, Buffer, Later, Figma, Linear, Loom. **Sonra:** Canva, Notion, Frame.io (claude.ai sayfası aynı işi görür), AÇEV ve "İlk Öğretmenim Ailem" iş birlikleri (lansmandan sonra).

## 3. İlk 2 haftalık deneme planı
*Her deneme Barış'ın onayından sonra başlar. Hepsi için toplam tahmin: ~25-40 $ nakit, ~5 bin ElevenLabs kredisi ve video kredisi.*

1. **Video yarışı (ElevenLabs Video)**
   - **Ne ile:** Test paketi şunlardan oluşur: Mino'nun önden ve yandan Recraft görseli, Kino görseli, karpuz filminin arka planı ve 4-5 sn'lik Türkçe cümle ("Karpuz ne kadar büyük!"). Aynı paketle Seedance 2.0, Kling 3.0 ve Gemini Omni Flash'ta 5 sn'lik klipler üretilir: el sallama, karpuza yürüme, konuşma. Model başına en fazla 3 klip.
   - **Başarı:** 5 evet/hayır sorusu sorulur: kalın kahve kontur duruyor mu, 3D gölge var mı, yüz ve renk aynı kalıyor mu, pati ya da kulakta bozulma var mı, hareket sakin mi. 4 "evet" alan klip geçer.
   - **Maliyet:** Önce tek klip üretilip kaç kredi harcadığına bakılır. Üst sınır yaklaşık 15 $ karşılığı kredi.
   - **Kim:** Yönetici üretir, Adobe tasarımcı test görsellerini hazırlar.
2. **Dudak senkronu**
   - **Ne ile:** Mino Karpuz filmindeki 3 mevcut ses dosyası ElevenLabs hizalamasından geçirilir. Tasarımcı Mino ve Kino için 6'şar ağız şekli çizer, ajan bunları film motoruna bağlar.
   - **Başarı:** Barış filmi sessiz izlediğinde "ağız söyleneni takip ediyor" diyor ve telefonda akıcılık bozulmuyor.
   - **Maliyet:** Birkaç yüz kredi.
   - **Kim:** Adobe tasarımcı ve animatör (Claude Code ajanı).
3. **Kendi MP4 hattımız**
   - **Ne ile:** Mino Karpuz filmi kare kare kaydedilir; ses ve Türkçe altyazı eklenir. Dört çıktı hazırlanır: dikey (1080x1920), kare, yatay ve 30 sn'lik mağaza kesiti (886x1920).
   - **Başarı:** Konturlar net, ses ile görüntü uyumlu ve Apple'ın teknik şartları karşılanıyor.
   - **Maliyet:** 0.
   - **Kim:** Animatör (ajan); onayı Barış verir.
4. **Stil kimliği ve poz yarışı**
   - **Ne ile:** 5 onaylı görselden gizli bir "Minkino" stili oluşturulur. "Mino el sallıyor / şaşırmış / koşuyor / uyuyor" pozları Nano Banana 2, Seedream 5.0 Pro ve FLUX Kontext ile üretilir. Ardından Layer.ai ile bir Kino görseli parçalara ayrılır.
   - **Başarı:** 4 pozdan en az 3'ü "oyunda kullanılır" diye onaylanıyor ve Kino'nun boyun dolgusu sorunu tekrar etmiyor.
   - **Maliyet:** ~40 Recraft kredisi, ~2 $ ve Layer.ai için 0-10 $.
   - **Kim:** Gemini sorumlusu pozları, Adobe tasarımcı parçaları üstlenir.
5. **Karakter sesleri ve ilk şarkı**
   - **Ne ile:** ElevenLabs Voice Design'da Mino ve Kino sesleri gizli olarak oluşturulur ve 10 replik okutulur. Bir aylık Suno Pro ile 20-30 sn'lik "Mino ile Say" şarkısı yapılır; ACE-Step ile yan yana dinlenir.
   - **Başarı:** Mino ile Kino yalnız sesten ayırt ediliyor, Türkçe telaffuz doğru ve 3-4 yaşındaki bir çocuk kelimeleri anlıyor.
   - **Maliyet:** ~2 bin kredi ve ~10 $.
   - **Kim:** Senarist replikleri ve sözleri Barış'la konuştuktan sonra yazar; yönetici üretir.

## 4. Dikkat

1. **Ticari lisans:**
   - Ücretsiz planların çoğu ticari hak vermiyor: Kling, Vidu, Suno, Hedra ve Recraft'ın ücretsiz planı.
   - Dreamina ve CapCut'a yüklenen içerik için ByteDance'e süresiz hak veriliyor. Bu yüzden ana karakter çizimleri oraya yüklenmez.
   - ElevenLabs Music'i uygulama içinde kullanmak Enterprise plan gerektiriyor.
   - Adobe'nin ortak modellerinde (Kling, Veo) Adobe hukuki güvence vermiyor.
   - Satın almadan önce şartlar ve fiyat ödeme ekranında okunmalı.
2. **Çocuk verisi:**
   - **ACİL:** Minik Sanatçı sunucusu (`sunucu/sihir`), Cloudflare başarısız olursa çocuğun çizimini Gemini'ye, o da olmazsa Recraft'a gönderiyor. Gemini'nin şartları 18 yaş altına yönelik uygulamalarda kullanımı yasaklıyor, Apple da çizimi kişisel veri sayıyor.
   - **Öneri:** Yedekler kapatılsın, yalnız Cloudflare kalsın; Cloudflare çizimi saklamıyor ve eğitimde kullanmıyor. Cloudflare'de de yalnız klein 4B modeli kalsın; 9B'nin lisansı ürün içinde kullanıma izin vermiyor.
   - ElevenLabs ve Gemini yalnız hazırlık aşamasında kullanılır, uygulama çalışırken asla çağrılmaz.
   - Ses tariflerinde "child" ya da "kid" yazılmaz. Çocuk sesi hiçbir yere gitmez.
   - Mağaza sürümünde üçüncü taraf ölçüm aracı olmaz.
   - Yayından önce tek seferlik bir avukat kontrolü yapılır (KVKK ve COPPA).
3. **Stil tutarlılığı:**
   - Video modelleri ışık ve hacim ekliyor, zamanla 3D'ye kayıyor.
   - Uygulamanın içindeki her şey bizim çizimimiz ve SVG motorumuzla yapılır.
   - Yapay zekâ klibi her zaman bizim Recraft karemizden başlar, 4-5 sn'yi geçmez ve 5 soruluk kontrolden geçer.
   - Stilin tek kaynağı Recraft stil kimliğidir. Farklı araçlardan gelen görseller karıştırılmaz.

## 5. Kaynaklar
- **Video:** https://elevenlabs.io/video · https://fal.ai/seedance-2.5 · https://dreamina.capcut.com/clause/dreamina-terms-of-service · https://kling.ai/blog/kling-video-3-0-credit-cost-guide · https://platform.vidu.com/docs/pricing
- **Mağaza videosu:** https://developer.apple.com/app-store/app-previews/ · https://playwright.dev/docs/clock · https://github.com/heygen-com/hyperframes
- **Animasyon ve dudak senkronu:** https://elevenlabs.io/docs/overview/capabilities/forced-alignment · https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps · https://github.com/DanielSWolf/rhubarb-lip-sync · https://helpx.adobe.com/illustrator/desktop/use-generative-ai/view-artwork-from-any-angle.html
- **Görsel:** https://www.recraft.ai/blog/meet-recraft-v4-styles · https://ai.google.dev/gemini-api/docs/pricing · https://layer.ai/tools/layer--create-spine-components · https://www.scenario.com/pricing
- **Ses ve müzik:** https://elevenlabs.io/pricing · https://elevenlabs.io/eleven-music-model-specific-terms · https://elevenlabs.io/use-policy · https://suno.com/blog/suno-updates-tos · https://github.com/ace-step/ACE-Step-1.5
- **Oyun ve mağaza:** https://developer.apple.com/app-store/review/guidelines/ · https://support.google.com/googleplay/android-developer/answer/14151465?hl=en · https://www.revenuecat.com/pricing · https://docs.codemagic.io/billing/pricing/ · https://firebase.google.com/docs/test-lab/usage-quotas-pricing
- **Pazarlama ve kurallar:** https://metricool.com/pricing/ · https://support.google.com/youtube/answer/9528076?hl=en · https://ai.google.dev/gemini-api/terms · https://developers.cloudflare.com/workers-ai/platform/data-usage/

İlgili dosyalar: `C:\Users\Minkex\Desktop\Minkino Games\sunucu\sihir\src\index.js` (Gemini ve Recraft yedekleri), `C:\Users\Minkex\Desktop\Minkino Games\ORTAK_NOTLAR.md` (Rive iptal kararı, 2026-09-25).