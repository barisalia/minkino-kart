# Uyuyan Orman — Rive animasyon iş listesi

Hedef: Uyuyan Orman'daki karakterler ve eşyalar **canlı, sesle anında tepki veren, premium 2D animasyonlar** olsun.
Stil **değişmeyecek**: mevcut parlak (glossy) çizgi film çizimleri aynen kalır; biz onlara kemik ve hareket veriyoruz.
Oyun kodu (mikrofon, görevler) Claude'da (bulut); animasyon dosyaları ekipte. Aradaki sözleşme bu belgedeki **girdi adları**dır: adlar birebir aynı olmalı, yoksa oyun animasyonu süremez.

## 1. Genel kurallar

| Konu | Kural |
|---|---|
| Araç | Rive editörü (rive.app). `.riv` dışa aktarımı yapabilen plan. |
| Kaynak çizim | Gemini iş listesindeki ifade/parça görselleri (`ekip/gemini-is-listesi.md`). Çizimler **raster (PNG) + mesh deformasyonu** ile kullanılır; yeniden çizilmez, stil birebir korunur. |
| Dosya | Karakter başına bir dosya: `assets/rive/<ad>.riv` (ör. `assets/rive/sincap.riv`). Artboard adı dosya adıyla aynı (`sincap`). |
| State machine | Her dosyada tek state machine, adı **`Durum`**. Oyun yalnız bunu çalıştırır. |
| Artboard | 800 × 800, şeffaf zemin. Karakterin ayakları alt kenarın ortasında (alttan %4 boşluk). Üstte %20 boşluk bırakın (zıplama/esneme taşmasın). Hiçbir şey artboard dışına taşmasın. |
| Görsel boyutu | İçerideki görseller en fazla 1024 px kenar, WebP/PNG. Dosya başına hedef **< 600 KB**. |
| Renk | Renk/gri geçişini **oyun yapar** (CSS filtresi). Animasyonda renk değiştirmeyin, tam renkli bırakın. |
| Akıcılık | 60 fps; döngüler dikişsiz (ilk ve son kare aynı). Yumuşak "ease" eğrileri; kalın çizgi film hissi: squash & stretch, overshoot, ikincil hareket (kuyruk, kulak, tüy gecikmeli takip eder). |
| Ses | Rive dosyasına ses koymayın; sesleri oyun çalar. |
| Teslim | Her dosyayla birlikte 5-10 sn'lik kısa önizleme videosu (Barış'a göstermek için; repoya değil ortak klasöre). |

## 2. Ortak girdiler (bütün ev sahibi karakterlerde)

| Girdi | Tür | Anlamı / beklenen hareket |
|---|---|---|
| `uyanik` | Boolean | `false`: **uyku döngüsü** (derin nefes, göğüs inip kalkar, kafa hafif düşük, ara sıra kulak/kuyruk seğirir; Zzz'yi oyun çizer). `true` olunca **uyanma geçişi** (≈1.2 sn: esneme, gerinme, gözler kırpışarak açılır, silkelenme) → **uyanık bekleme döngüsü** (nefes, 3-5 sn'de bir göz kırpma, hafif sallanma). |
| `dinliyor` | Boolean | Uyanıkken: dikkat pozu (kulaklar dik, gözler kocaman, kafa hafif yana). Çocuk konuşurken/üflerken açık. |
| `ses` | Number 0–100 | Anlık ses seviyesi (saniyede ~50 kez güncellenir). Küçük tepki: gözler biraz büyür, tüyler/kulak titrer. Uykudayken 60 üstü = uykuda kıpırdanma. Aşırıya kaçmasın. |
| `sevin` | Trigger | Görev başarısı: zıplama + kollar havada + kocaman gülüş (≈0.8 sn), sonra beklemeye döner. |
| `hmm` | Trigger | Olmadı ama sorun değil: kafa yana, kaş kalkık, dudak yana (≈0.6 sn). **Üzgün/kızgın değil**, sevimli. |
| `dokun` | Trigger | Çocuk karaktere dokununca: gıdıklanma/kıkırdama tepkisi (≈0.5 sn). |
| `kipir` | Trigger | Uykuda kıpırdanma (ses olunca): döner gibi yapar, mırıldanır, yine uyur (≈0.7 sn). |

## 3. Karakterler ve özel girdiler (öncelik sırasıyla)

| # | Dosya | Karakter | Özel girdiler |
|---|---|---|---|
| 1 | `sincap.riv` | Sincap (Rüzgar Tepesi) — **PİLOT** | `ruzgar` Number 0–100: çocuk üfledikçe kuyruk ve tüyler rüzgarla savrulur, gözlerini kısar. |
| 2 | `kus.riv` | Kuş (Kuş Ağacı) | `ucuyor` Boolean (kanat çırpma döngüsü), `kanat` Number 0–100 (çırpma hızı), `cik` Trigger (gaga açılıp ötme). |
| 3 | `dev.riv` | Uyuyan dev | **Hiç uyanmaz.** `uyanik` true = rengi gelir, uykuda gülümser, çiçekler başında açar. `derinlik` Number 0–100: nefesin derinliği (sessizlikte derin, seste sığ). `kipir` en önemli tepkisi. |
| 4 | `inek.riv`, `kopek.riv`, `kedi.riv` | Çiftlik Korosu | `soyle` Trigger: inek "möö" (kafa kalkar, ağız yuvarlak, uzun), köpek "hav hav" (iki kısa ağız açma, kuyruk sallama), kedi "miyav" (ağız açılır, kafa yukarı-aşağı). |
| 5 | `maymun.riv` | Maymun (Davul Köyü) | `davulVur` Trigger (iki eliyle önündeki davula vurur; davul oyunda ayrı çizilir, eller artboard'un alt %30'unda vurur), `dans` Boolean. |
| 6 | `baykus.riv` | Baykuş (Hece Mağarası) | `alkis` Trigger (kanatlarını çırparak bir kez alkışlar; hece gösterirken art arda tetiklenir, 0.35 sn içinde bitmeli). |
| 7 | `tavsan.riv` | Tavşan (Uyuyan Dev bölgesi) | `cikis` Number 0–100 (yuvadan başını çıkarma; 0 = içeride, 100 = tamamen dışarıda; yuva ağzı oyunda çizilir, tavşanın alt kısmı maskelenecek), `yuru` Boolean (parmak ucunda sessiz yürüyüş döngüsü), `saklan` Trigger. |
| 8 | `ayi.riv` | Ayı (Kuş Ağacı) | `homur` Boolean (kalın sesle homurdanma: omuzlar, ağız). |
| 9 | `papagan.riv` | Papağan | `konusuyor` Boolean (gaga hızlı açılıp kapanır, kafa sallanır), `dinliyor` (ortak). |

## 4. Eşyalar (karakterlerden sonra)

| Dosya | Girdiler |
|---|---|
| `mum.riv` | `guc` Number 0–100 (alev üflemeyle eğilir/incelir, titrer), `son` Trigger (alev söner + duman kıvrılarak yükselir), `yak` Trigger (yeniden yanar). |
| `karahindiba.riv` | `ruzgar` Number 0–100, `ucan` Number 0–100 (uçan tohum oranı; tohumlar tek tek kopup süzülür). |
| `ruzgar_gulu.riv` | `hiz` Number 0–100 (dönüş hızı, yavaşlarken yumuşak durma). |
| `balon.riv` | `dolu` Number 0–100 (şişme; esneme hissi), `uc` Trigger (ipi çözülür, sallanarak yükselir). |
| `yelkenli.riv` | `ruzgar` Number 0–100 (yelken şişer, tekne öne yatar), `carp` Trigger (küçük sarsıntı). |

Eşyaların çizimlerini Claude Recraft ile aynı stilde üretip `assets/recraft/` altına koyacak; ekip oradan alır.

## 5. Çalışma sırası

1. **Pilot: sincap.** Uyku → uyanma → bekleme → sevin/hmm/dokun, `ruzgar` girdisi. Önizleme videosu Barış'a gider; onay gelmeden diğerlerine geçilmez (stil ve hareket dili burada oturur).
2. Kuş, dev, çiftlik üçlüsü, maymun, baykuş, tavşan, ayı, papağan.
3. Eşyalar.

## 6. Teslim ve test

- `.riv` dosyaları `ekip/rive` dalında `assets/rive/` klasörüne konup GitHub'a gönderilir; Claude oyuna bağlar.
- Oyun `.riv` bulamazsa eski görsele döner, yani dosyalar tek tek gelebilir.
- Yerelde denemek için: Rive editöründe state machine'i "Play" ile çalıştırıp girdileri elle değiştirin; oyun da aynısını yapacak.
- Sorular: girdi adı değişikliği gerekirse önce Barış üzerinden Claude'a bildirin (sözleşme iki taraflı).
