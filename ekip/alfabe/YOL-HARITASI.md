# Harf Atölyesi → "Türkçe okumaya başlıyorum" · yol haritası

19 Kasım 2026 · Harf oturumu. Barış'ın vizyonu: Harf Atölyesi, çocuğa okumayı başlatan ve sevdiren her şeyiyle başlı başına, eksiksiz bir okuma uygulaması olacak.

Bu belgedeki çizgi dışına çıkılmaz:

- **Kısa ders düzeni:** Barış'ın "kısa düzen kalsın" kararı, 19 Kasım. Ders akışı değişmez; adımların içi geliştirilir.
- **Ayrı ses oyunları bölümü yok:** 14 Kasım'da "Ayrı 'Ses oyunları' bölümünü ve ders sonundaki ses oyunlarını kaldır" denildi. Ses becerileri derslerin içindedir.
- **Barış'a sorulacaklar:**
  - ders akışını bozan değişiklik,
  - `KULLANICI-KURALLARI.md` ile çelişki,
  - kilit ve fiyat.
- **Çizimler:** Yeni çizimi yalnız Astra yapar. Brief'te sayfa başına en çok 8 çizim olur; normalde 1–6. Fonlar ve sahneler kendi tam çözünürlüklü çağrısındadır.
- **Her yeni bölüm ve oyun kendi yeni görseliyle gelir** (Barış, 19 Kasım: "Astra senin görsel üretim motorun; görselsiz nasıl geliştireceksin"). "Var olan resim yeter" diye tasarlanmaz; aynı sahne ve aynı resim tekrar tekrar kullanılmaz. Brief'ler baştan ve toplu gider: Astra çizerken kod yazılır, çizim gelince kendiliğinden yerine oturur.
- **Astra paketleri:** `CLAUDE-ASTRA-MESAJLAR.md`, 19 Kasım.
  - H1 (yönetici, 18:43): resimli büyük harfler ve sihirli kalem.
  - H2–H7 (Harf ekibi, 18:50): resimli küçük harfler, cümle sahneleri, tekrar köşesi, ödüller, sözcük havuzu, derslerin yeni anları.
- **Ses:** Yeni Ceren sesi ElevenLabs ile serbest. Her sözcük, hece ve cümle ayrı istekle üretilir (15 Kasım kararı).

---

## 1. Bugün ne var

| Alan | Var olan | Durum |
|---|---|---|
| **29 harf dersi** | Yaşa göre üç yol: 2–3 yaş "boya · bul"; 4 yaş "keşfet · söyle · hayvan çağır · Resimde Bul"; 5+ "keşfet · söyle · büyük harf · mıknatıs · küçük harf · Resimde Bul". Ceren'in her harf için yönergeleri; ağız eşlemesi. | Tam. 5+ yazma adımı 19 Kasım'da **"Harf canlanır"** oldu: iz sürerken ışık; harf bitince renkle dolar ve sözcüğün resmi harften çıkar. Görselleri gelince resimli harfe dönüşür ve sihirli kalem izler: H1 büyük harfler, H2 küçük harfler. |
| **Hece** | Hece Oyunu: Hece Trambolini (zıpla · diz · zıpla) ve Manyetik Hece Bulmacası (3 sözcük, ileri seviye, "Dinle ve bul"). Hece Evleri: 20 ünsüz × 8 ünlü = 160 hece, anahtarlık. | Tam. Tekrarlar 18–19 Kasım'da kısaltıldı. |
| **Sözcük kurma** | Derste Mıknatıslar (her harfin bir sözcüğü). Pano'da ~34 sözcük. Trambolin'de 21 sözcük. | Var. Ama okuma hep **tek sözcükte** kalıyor. |
| **Cümle okuma** | — | **Yok.** |
| **Yazma** | 5+ büyük/küçük harf (Harf canlanır). 4 yaş Hayvan çağır. 2–3 yaş harf boyama. Albüm kartına çocuğun kendi yazısı. | Tam. |
| **Ses becerileri** | Derslerin içinde: Keşfet (ilk ses), Söyle (mikrofonla), Resimde Bul (baştaki ses), Obur (2–3 yaş, dinle-bul). | Tam (ayrı bölüm yok, kural gereği). |
| **Akıllı tekrar** | Trambolin ve Pano sözcük seçerken önce az görüleni seçiyor. | **Harf düzeyinde tekrar yok.** Öğrenilen harf bir daha karşısına çıkmıyor. |
| **Albüm ve ödüller** | Harf albümü (kalem rengiyle kart). Hece Evleri anahtarlığı (20 anahtar). | Var, ama **tamamlama ödülü yok**: 29 harf ya da 20 anahtar bitince bir şey olmuyor. |
| **Yaşa göre yollar** | 2–3, 4, 5+ ayrı ders ve oyun ayarları. | Tam. |
| **Veli görünümü** | "Büyükler için" ekranı var (`src/screens/ebeveyn.ts`): ayarlar, albüm. | **Harf Atölyesi ilerlemesi yok.** |

---

## 2. Eksikler ve önem sırası

Önem sırası, okumayı başlatmaya katkıya göre verildi. Her madde oynanabilir, test edilmiş ve iPad + telefon görüntüsüyle teslim edilir.

### 1 · Cümle okuma: "Ceren'le oku" (çözülebilir kısa cümleler)

- **Ne:** Çocuğun öğrendiği harflerden kurulan kısa cümleler: "Ali bal al." "Bu bir balık." Her sayfada bir resim ve bir cümle var.
- **Çocuk ne yapar:** Önce Ceren cümleyi parmakla izleyerek okur, sözcükler sırayla yanar. Sonra çocuk sözcüklere tek tek dokunur; her sözcük kendi kaydıyla okunur. En sonda çocuk cümlenin tamamına dokunur, cümle akıcı okunur ve resim canlanır.
- **Okunabilirlik:** Bir cümle yalnız çocuğun bitirdiği harflerden kurulur. Liste harf bittikçe açılır, sonra bir de yaşa göre süzülür:
  - 4 yaş: tek sözcük ve iki sözcüklü sözcük grupları.
  - 5+: iki ile dört sözcüklü cümleler.
- **Neden önce bu:** "Okumaya başlıyorum"un özü. Bugün okuma tek sözcükte bitiyor.
- **Yeri:** Rafta, Hece Oyunu ve Hece Evleri'nin yanında yeni bir giriş. **Barış'a sorulacak:** 14 Kasım'da "Hece Oyunu'nun altına yalnız bir yeni oyun eklenebilir" kararı vardı (gece çalışması için). Ders akışını değiştirmiyor.
- **Görsel:** Cümle sahneleri, kitap ve işaret çubuğu brief'ini bu bölümü üstlenen ayrı oturum (eski Şef oturumu) yazıyor; Harf ekibinin H3 brief'i 18:51'de geri çekildi.
- **Ses:** İlk sette her cümle için bir akıcı kayıt ve sözcük başına bir ayrı kayıt (~16 cümle, ~45 sözcük). Bunlara 3 yönerge eklenir: "Önce ben okuyayım", "Şimdi sen dokun", "Bütün cümleyi oku".
- **Taslak:** Kod sahneler gelmeden kurulur, çizim gelince kendiliğinden yerine oturur. Barış'a gösterilecek ilk sürüm sahnelerle olur.
- **Ayrı oturum:** Evet: yalnız yeni dosyalar, raf kartıyla bağlanır (A). Rafa bağlama satırını Barış'ın onayından sonra Harf oturumu ekler.

### 2 · Akıllı tekrar: "Bugünün tekrarı"

- **Ne:** Rafta öğrenilmiş harflerden 3–4 soruluk, 1 dakikalık karışık bir tur. Sorular karışık türde: ilk sesi bul, heceyi seç, sözcüğü kur. Seçim son görülme tarihine ve yanlış sayısına göre yapılır; zorlanılan harf daha sık gelir.
- **Neden:** Öğrenilen harf unutulmasın. Bugün bir harf bitince bir daha karşısına çıkmıyor.
- **Ders akışı:** Değişmez. Ayrı ve isteğe bağlı bir giriş; en az 3 harf bitince görünür.
- **Barış'a sorulacak:** Rafa yeni bir giriş ekliyor ve içinde "ilk sesi bul" gibi ses soruları var. Bu, 14 Kasım'daki "ayrı Ses oyunları bölümü olmasın" kararına yakın. Alternatif: tekrar ayrı bir giriş olmaz, bitmiş bir harfin dersine yeniden girildiğinde Keşfet adımının yerine 3 soruluk tekrar gelir (ders akışı yine değişir; o da sorulur).
- **Ayrı oturum:** Evet: yalnız yeni dosyalar, raf kartıyla bağlanır (B). Bağlama onaydan sonra.
- **Görsel (Astra H4, brief gitti):** "Hatırlama köşesi" fonu, hatırlama sandığı (kapalı ve açık), soru kartı, yıldız rozet, ilerleme taşı.
- **Ses:** Var olan kayıtlar yeter (hece, sözcük, yönergeler). Yeni: 2 yönerge ("Bugünün tekrarı!", "Hepsini hatırladın!").

### 3 · Veli için ilerleme

- **Ne:** "Büyükler için" ekranında bir Harf Atölyesi kartı. Gösterecekleri:
  - Öğrenilen harfler (29 kutu).
  - Hece Evleri anahtarları.
  - Kurulan ve okunan sözcükler.
  - Son 7 gün.
  - Zorlanılan harfler (yanlış sayısı).
- **Görsel ve ses:** Büyüklere dönük bir arayüz; çocuk görseli gerekmez. Harflerin küçük resimleri olarak H1 ve H2'nin resimli harfleri kullanılır.
- **Not:** Veri cihazda kalır, dışarı gönderilmez.
- **Ayrı oturum:** Evet: yalnız yeni dosya, "Büyükler için" ekranına tek çağrıyla bağlanır (C). Onay gerekmez.

### 4 · Tamamlama ödülleri

**Kod hazır, 20 Kasım.** `alfabe/src/kutlama.ts` ve `.css`; Ceren'in kayıtları `kutlama-harfler`, `kutlama-anahtarlar`, `kutlama-sertifika`. Test: `alfabe-kutlama.spec.ts`. Görüntüler: `output/alfabe/odul-kutlama/` (test kipi, yer tutucularla).

- Astra Harf-H5 çizimleri `assets/alfabe/odul/` altına gelince açılır; gelene kadar uygulamada görünmez.
- Test kipinde oynanır: `?test=1&kutlama=harfler` ya da `?test=1&kutlama=anahtarlar`.
- Akış: 29. harfin kartı albüme yapışınca, ya da Hece Evleri'nin 20. anahtarında:
  - Çocuğun kendi yazdığı harfler (ya da 20 ünsüz) panoya uçup dizilir.
  - Konfeti patlar, kupa yükselir, sertifika gelir ("29 harfi öğrendim!" ve tarih).
  - Dönüş düğmesi albüme ya da rafa götürür.

- **Ne:** Albüm 29 harfle dolunca bir sertifika sahnesi: Ceren ve sınıf kutluyor, çocuğun kendi yazdığı harflerden bir pano çıkıyor. Hece Evleri anahtarlığı dolunca da evlerin kapıları birlikte açılıp tekerleme şenliği oluyor.
- **Görsel (Astra H5, brief gitti):** kutlama sınıfı fonu, sertifika, kupa, üç konfeti karesi.
- **Ses:** 2–3 kutlama cümlesi.
- **Ayrı oturum:** Evet: yeni sahne dosyası, iki çağrı noktasıyla bağlanır (D). Astra çizimleri gelince.

### 5 · Kâğıt etkinliği gibi kalan adımlar

**Bitti, 20 Kasım 00:00.** Görüntüler: `output/alfabe/canlanma-anlari/`. Test: `alfabe-canlanma-anlari.spec.ts`. Ortak parçalar: `alfabe/src/canlanma.ts`. Astra çizimleri gelince kendiliğinden bağlanır.

- Keşfet: büyüteç harfin üstüne gelir, harf camın altında büyür, yıldıza oturur, "Bb" rozetine uçar.
- Mıknatıslar: her parça kıvılcımla kenetlenir; sözcük tamamlanınca ışık halkası açılır.
- 2–3 yaş boyama: üç renkli boya damlası düşer, harf zıplar, üstünde yıldızlardan gökkuşağı açılır. Astra'nın fırçası gelince boyarken parmağı izler.

İlk öneri (yerine yukarıdaki yapıldı), "Harf canlanır" ölçüsüyle, sırayla:

- **a. Keşfet:** İki sözcüğün ilk harfi bugün yalnız renk değiştiriyor. Önerilen: dokunulan harf karttan "uçup" büyük harfe dönüşsün ve dersin harfiyle birleşsin.
- **b. Mıknatıslar:** Sözcük kurulunca harfler kaynaşıp resmin içine aksın, resim bir an canlansın.
- **c. 2–3 yaş boyama bitişi:** Boyanan harften resim çıksın (Harf canlanır'ın küçük yaş sürümü).

Görsel (Astra H7, brief gitti):
- Keşfet: büyüteç ve harf yıldızı.
- Mıknatıslar: üç kare kıvılcım ve birleşme halkası.
- Boyama: üç kare boya damlası, fırça ve gökkuşağı yayı.

- **Ayrı oturum:** Hayır. Var olan ders dosyalarının içini değiştiriyor (`harfi-kesfet.ts`, `miknatis.ts`, `harf-boyama.ts`); çakışmasın diye Harf oturumunda kalır.

### 6 · Sözcük havuzunu genişletme

- **Ne:** Her harf için 3–5 resimli sözcük; Trambolin, Pano ve cümle okuma bunları kullanır. Bugün bazı harflerde tek sözcük var: Ğ, J, V.
- **Görsel (Astra H6, brief gitti):** 57 yeni sözcük resmi (800 × 800, 10 sayfa); her harfe iki yeni sözcük.
- **Ses:** Her sözcük ve hecesi için ayrı kayıt.
- **Ayrı oturum:** Kısmen. Liste, kayıtlar ve Astra brief'i ayrı oturumda hazırlanabilir: `ekip/alfabe/sozcuk-havuzu.json` + `assets/alfabe/ses/` altında yeni kayıtlar. Koda bağlamayı (`hece-sozlugu.ts`, `pano-sozcukleri.ts`, `kutu-ek-resimler.ts`) Harf oturumu yapar.

---

## 3. Sıra

1. **Bitti:** "Harf canlanır" (5+ yazma), 19 Kasım. Görüntüler: `output/alfabe/harf-canlanir/`.
2. **Onay beklemeden yapılacaklar** (ders akışı ve raf değişmez; çizimleri Astra'da, kod şimdiden kurulur):
   - **Bitti, 20 Kasım:** Kâğıt gibi kalan adımlar (5a Keşfet, 5b Mıknatıslar, 5c boyama bitişi).
   - Veli ilerlemesi (3): "Büyükler için" ekranında.
     - **20 Kasım 00:10:** başka bir oturum yazıyor (`alfabe/src/veli-ozet.ts`, `veli.css`).
     - Harf oturumu yalnız günlük kaydını ekledi: `alfabe/src/gunluk.ts`, anahtar `minkino-alfabe-gunluk-v1`. Günlük, her gün biten adım sayısını ve harf başına yanlış dokunuşları tutar (Keşfet, Mıknatıslar, Resimde Bul).
3. **Barış'a birlikte sorulacaklar:**
   - Cümle okuma (1) ve Bugünün tekrarı (2): ikisi de rafa yeni giriş ekliyor; tekrar, 14 Kasım'daki ses oyunları kararına yakın.
4. **Onay gelince:**
   - Cümle okuma: ilk sürüm var olan resimlerle, sonra Astra sahneleriyle.
   - Bugünün tekrarı.
5. **Astra brief'leriyle:** Ödüller (4) ve sözcük havuzu (6).

> Cümle okuma en önemli madde, ama rafa yeni giriş eklediği için Barış'ın sözü gerekiyor. Onay beklenirken onay gerektirmeyen maddeler yapılır.

---

## 4. Ayrı oturumlar için bağlantı noktaları ve arayüz

**Kural:** Ayrı oturum yalnız kendi yeni dosyalarına dokunur. Bağlama satırını (aşağıda "Harf oturumu ekler" yazanlar) Harf oturumu ekler; böylece `main.ts` ve ders dosyalarında iki oturum çakışmaz.

**Ortak araçlar** (yalnız kullanılır, değiştirilmez):

- **Ceren'in sesi:** `cerenKonus(id, sonra?, oynarken?)` ve `cerenSustur()` (`alfabe/src/konusma-dersi.ts`).
  - `assets/alfabe/ses/<id>.mp3` çalınır; yeni dosya glob ile kendiliğinden pakete girer.
  - Metni `alfabe/ses-metinleri.json`'a eklenir (CRLF dosya, satır sonu korunmalı).
  - Ağız eşlemesi canlı zarftan gelir; `agiz-zamanlari.json` girdisi isteğe bağlıdır.
- **Ceren'in yüzü:** `cerenYuzu(sinif?)` (HTML).
- **Resimler:** `resim(id)` (harf ve sözcük resmi), `kelimeResmi(sozcuk)` (`alfabe/src/kelime-resmi.ts`).
- **Kayıt:** `dersKaydiniOku` ve `dersKaydiniYaz` (`alfabe/src/ders-kaydi.ts`). Anahtar yaşa göre ayrılır: 5+ yaşta düz, öbürlerinde `-yas-2-3` ya da `-yas-4` eki.
- **Yaş:** `yasGrubu`, `kucukGrup`, `tamDers` (`alfabe/src/yas-grubu.ts`).
- **Boşta hatırlatma:** `bosBekleyici(hatirlat, [12000, 16000])` (`alfabe/src/bos-bekle.ts`).
- **Simgeler:** `IKON` (`src/ui/ikonlar.ts`).
- **Tıklama ve başarı sesleri:** `oyunSesi('birles' | 'geri' | 'miknatis' | 'kutu' | 'kagit' | 'parilti' | 'damla')` (`alfabe/src/oyun-sesi.ts`).

**A · Cümle okuma** (yeni: `alfabe/src/cumle-okuma.ts`, `cumle-okuma.css`, `cumleler.json`)

- Dışa açılacaklar, Hece Evleri kalıbıyla aynı:
  - `cumleOkumaKarti(): string`: rafın raf kartı HTML'i. `at-hece-karti` / `at-oyun-karti` sınıfları kullanılır, kendi sınıfı `.at-cumle-ac` olur.
  - `cumleOkumaKur(alan: HTMLElement, b: { oku; sustur; cikis: () => void; geri: HTMLButtonElement; baslik: HTMLElement; ilerleme: HTMLElement; bitenHarfler: string[] }): () => void`. Dönen işlev kapatır: ses, zamanlayıcı ve olaylar temizlenir.
- Çözülebilirlik kuralı: `bitenHarfler` (`harfler.json` id'leri) dışında harf içeren cümle gösterilmez.
- Kendi kaydı `minkino-cumle-okuma-v1`, `dersKaydiniYaz` üzerinden.
- Kayıt adları: cümle başına `cumle-<n>`, sözcük başına `cumle-soz-<sözcük>` (ASCII; ç→cc, ş→ss, ı→ii, ö→oo, ü→uu, ğ→gg).
- **Harf oturumu ekler:** `main.ts`'te rafa `cumleOkumaKarti()`, tıklamada `cumleOkumaKur(…, { bitenHarfler: kayit.biten })`, `ekran='cumle'` dönüşü.
- Test: `tests/e2e/alfabe-cumle-okuma.spec.ts` (iPad + telefon yatay).

**B · Bugünün tekrarı** (yeni: `alfabe/src/gunun-tekrari.ts`, `.css`)

- Dışa açılacaklar:
  - `gununTekrariKarti(bitenHarfler: string[]): string`: 3'ten az harf bitmişse boş döner.
  - `gununTekrariKur(alan, b: { oku; sustur; cikis; geri; baslik; ilerleme; bitenHarfler: string[] }): () => void`.
- İstatistik kaydı `minkino-alfabe-tekrar-v1`: `{ [harfId]: { son: zaman, yanlis: sayı } }`.
- Sorular var olan kayıtlarla kurulur: `mik-parca-*`, `pano-hece-*`, `kutu-ad-*`, `NN-label`.
- **Harf oturumu ekler:** `main.ts` bağlama satırları (A ile aynı kalıp).

**C · Veli ilerlemesi** (yeni: `src/screens/ebeveyn-harf.ts`)

- Dışa açılacak: `harfIlerlemesiKarti(): HTMLElement`. Yalnız okur, hiçbir şey yazmaz.
- Okunan kayıtlar (her biri yaş ekiyle, `-yas-2-3` / `-yas-4` / düz):
  - `minkino-alfabe-v1`: `{ biten: string[], adimlar, renkler, bekleyen }`;
  - `minkino-hece-evleri-v1`: `{ biten: string[] }`;
  - `minkino-hece-gorulen-sozcukler-v1`: `{ kez, son }`;
  - `minkino-hece-pano-kelimeler-v1`: `{ tur, sozler }`.
- **Bağlama:** `src/screens/ebeveyn.ts`'te tek satır, kartın eklenmesi. Bu dosyanın sahibi kim ise o ekler; Harf oturumu da ekleyebilir.

**D · Tamamlama ödülleri** (yeni: `alfabe/src/odul-sahnesi.ts`, `.css`)

- Dışa açılacak: `odulSahnesiKur(alan, b: { tur: 'album' | 'anahtar'; oku; bitir: () => void }): () => void`.
- **Harf oturumu ekler:** `main.ts → sonucGoster` (29. harf bittiğinde) ve `hece-evleri.ts → hatira` (20. anahtarda) çağrıları.
