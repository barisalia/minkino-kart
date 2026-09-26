# Devir teslim: bulut yönetici (Yönetici 2) → yerel yönetici

**Tarih:** 2026-09-26. Bulut oturumu kapanıyor; bundan sonra bütün işi yerel ekip yürütür.

Önce bu dosyayı, sonra şunları okuyun:
- [minkinogames1.md](../minkinogames1.md): genel rehber (çalıştırma, mimari, kurallar).
- [ekip/stil-rehberi.md](stil-rehberi.md): görsel stil ve prompt kalıpları.
- [ORTAK_NOTLAR.md](../ORTAK_NOTLAR.md): kararlar ve tarihçe.

---

## 1. İlk gün: projeyi yerele alın (30 dk)

```bash
# 1) Bulutun bütün işi bu dalda (kod + görseller + sesler + testler)
git fetch origin
git checkout claude/awesome-cori-kvcfd7
git pull

# 2) Kurulum ve deneme
npm ci
npx playwright install chromium     # uçtan uca testler için (bir kerelik)
npm run dev                         # http://localhost:5173/
npm test                            # 84 birim testi geçmeli
npm run e2e                         # uçtan uca testler (tests/screens/ altına ekran görüntüsü)
npm run build                       # dist/ oluşmalı, hata olmamalı
```

**Oyunlar (yerelde `npm run dev` ile):**

| Oyun | Yerel adres | Canlı adres |
|---|---|---|
| Kart oyunu + Mino | http://localhost:5173/ | https://minkino-site.barisalidogan.workers.dev/ |
| **Sesli Maceralar: Ada'nın Doğum Günü** | /macera/ | …/macera/ |
| Uyuyan Orman | /orman/ | …/orman/ |
| Minik Sanatçı | /sanatci/ | …/sanatci/ |
| Çiz Canlansın | /canlan/ | …/canlan/ |
| Mikrofon testi | /ses-testi/ | …/ses-testi/ |

- **Test modu:** adrese `?test=1&ekran=bolum&yas=5` eklenirse beklemeler kısalır ve doğrudan bölüme gidilir.
- **Mikrofon:** telefonda denemek için HTTPS gerekir. Canlı adresi kullanın ya da `npm run dev` çıktısındaki ağ adresini aynı Wi-Fi'da açın. Mikrofon localhost dışında HTTPS ister.

Bütün görseller (`assets/**/*.webp`), seslendirmeler ve efektler (`public/ses/`) repoda duruyor. İnternetsiz de çalışır.

## 2. Dal düzeni: ilk iş (Barış onayıyla)

- **Bugünkü durum:**
  - Bulutun bütün işi `claude/awesome-cori-kvcfd7` dalında.
  - Ekip kendi dallarında çalışıyor (ör. `ekip/pazar`).
  - `main` dalı **yok**.
- **Öneri:** `main` dalını buluttan açın, ekip dallarını ona birleştirin. Bundan sonra herkes `main` üzerinden çalışsın.

```bash
git checkout -b main origin/claude/awesome-cori-kvcfd7
git push -u origin main
# GitHub → Settings → Branches → Default branch: main
git merge origin/ekip/pazar        # (ve diğer ekip dalları)
```

- **Önemli:** Otomatik yayın (`.github/workflows/yayinla.yml`) yalnız `main` ve `claude/**` dallarına push'ta çalışır.
- `ekip/…` dallarına push edilen iş **yayınlanmaz**. Seslendirmesi ve Recraft görseli de **üretilmez**.
- Yayın ve üretim için iş `main`'e girmeli.

## 3. Otomatik boru hattı (GitHub Actions): ne yapar, nasıl kullanılır

Her push'ta (`main` / `claude/**`) şunlar sırayla olur:

1. **Görseller:**
   - `assets/recraft/*.json` içindeki Recraft adresleri indirilir.
   - Beyaz zemin silinir, kırpılır, `assets/<grup>/<ad>.webp` olarak kaydedilir.
   - `karakter/…` anahtarlarının SVG aslı `karakter-kaynak/` altına yazılır.
   - Zaten var olan dosya atlanır.
2. **Seslendirme:**
   - `content/*.json` içindeki yeni cümleler ElevenLabs ile seslendirilir → `public/ses/`.
   - Ne okunur, ne okunmaz: `src/audio/cumleler.ts` belirler.
3. **Efektler:** `content/efektler.json` içindeki yeni efektler üretilir (saniyesi 40 kredi).
4. Üretilen dosyalar `[skip ci]` commit'iyle repoya geri yazılır. **Bu yüzden push'tan sonra `git pull` yapın.**
5. Birim testleri çalışır, build alınır, Cloudflare'e (`minkino-site`) ve `gh-pages`'e yayınlanır.

**GitHub secret adları:** `ELEVENLABS_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `RECRAFT_API_KEY`, `GEMINI_API_KEY`. Değerleri asla koda, commit'e ya da sohbete yazmayın.

### Yeni görsel eklemek

Bulutta Recraft'a doğrudan bağlıydım. Yerelde Recraft web sitesini kullanın:

1. recraft.ai'de `ekip/stil-rehberi.md` kalıbıyla üretin. Model `Recraft V4.1`; ana karakterde `Pro Vector`.
2. Görselin adresini kopyalayın (`https://img.recraft.ai/...`).
3. Uygun JSON'a ekleyin, ör. `assets/recraft/parti.json` → `"parti/balon-mavi": "https://img.recraft.ai/..."`.
4. Push edin, CI indirip işler. Yerelde hemen görmek için `npm run gorsel` de aynı işi yapar.
   - Adres internete açık olmalı.
   - İndirmeden yerel dosyayla denemek için: `GORSEL_YEREL='{"parti/x":"/yol/x.png"}' node scripts/gorsel-indir.mjs`

### Yeni konuşma cümlesi eklemek

1. `content/<oyun>.json` dosyasına ekleyin. Kısa olsun, en fazla 10-12 kelime.
2. Push edin. CI yalnızca yeni cümleyi seslendirir.
3. Seslendirilmeyecek metinler (balon tepkileri gibi) için `src/audio/cumleler.ts` içindeki atlama listesine bakın.

## 4. Sesli Maceralar (`macera/`): mimari

| Dosya | Ne yapar |
|---|---|
| `macera/src/dogumgunu.ts` | Bölüm 1'in tamamı: sahne kurulumu, akış, 7 görev (balon, sessizlik, sürpriz, şarkı, mum, pasta, dans) |
| `macera/src/oyuncu.ts` | `Oyuncu` karakter sınıfı. Pozlar (`assets/parti-ifade/<ad>/<poz>.webp` varsa kullanılır), yürüme, zıplama, 8 dans figürü, konuşma balonu, şapka |
| `macera/src/sahne.ts` | Oda, kamera (yakınlaş/uzaklaş), ışık (karanlık/loş), disko rengi. Yerleşim `koy(el, {x, y, w, z})`; x ve y yüzde, y alttan |
| `macera/src/sarki.ts` | "Mutlu yıllar sana" melodisi, ton bağımsız nota değerlendirme |
| `macera/src/ekranlar.ts` | Açılış, mikrofon izni, bölüm ekranı (alt yazı, ipucu, büyük düğme, dokunma) |
| `orman/src/kulak.ts` | Mikrofon: konuşurken susma, ortam gürültüsü ayarı |
| `orman/src/gorev.ts` | Algılayıcılar: `Ufleme`, `Alkis`, `Perde`, `sesVar` |
| `ses-testi/src/analiz.ts` | Algılayıcıların eşikleri |
| `content/macera.json` | Tüm cümleler |
| `tests/e2e/macera.spec.ts` | Uçtan uca test: dokunarak baştan sona |

**Bölüm 2 eklemek:**
1. `macera/src/<bolum>.ts` dosyasını `dogumgunu.ts` örneğiyle yazın. Aynı `BolumArayuz`, `Sahne` ve `Oyuncu` kullanılır.
2. `content/macera.json` dosyasına cümleleri ekleyin.
3. `ekranlar.ts` açılışına bölüm kartını ekleyin.
4. Bir e2e testi yazın.

Senaryo senaristten gelecek: `ekip/senarist-rehberi.md` → `ekip/senaryo/<bolum>.md`.

## 5. Mino (ana karakter): yeni tasarım sırada

- **Onaylanan tasarım:** `ekip/mino/mino-a-kaynak.svg`.
- **Tasarımcı görevi:** `ekip/mino/TASARIMCI-GOREVI.md`. Illustrator'da gövdeye hafif gölge eklenecek ve animasyon katmanlarına ayrılacak. Teslim `ekip/mino/mino-final.svg`.
- **Mino'nun kodu:**
  - `src/mino/mino.ts` hareketleri yapar: nefes, göz kırpma, ağız, 10 tepki (zıpla, şaşır, dans…).
  - `src/mino/mino-svg.ts`, `scripts/mino/rig.mjs` ile **otomatik üretilir**.
- **Eski Mino'nun iskeleti nasıl kurulmuştu:**
  - Kaynak `karakter-kaynak/kedi-3.svg`.
  - Her path kafa, gövde ya da kuyruk grubuna atanmış (`scripts/mino/sinifla.mjs`, `parcalar.json`).
  - Büyük dış kontur bölgelere kırpılmış.
  - Göz kapakları göz şekliyle kırpılmış.
  - Ağız kodla çiziliyor.
  - Dönme noktaları `mino.ts` başındaki `BOYUN`, `KUYRUK`, `AYAK`, `AGIZ` sabitleri.
- **`mino-final.svg` gelince yapılacaklar:**
  1. Katman adları (`kafa`, `govde`, `kuyruk`, `kol-sol`, `kol-sag`, `fular`, `goz-sol`, `goz-sag`, `agiz`) doğrudan gruplara eşlenir. Path sınıflandırmasına gerek kalmaz; `rig.mjs` bu gruplara göre sadeleştirilir.
  2. `mino.ts` içinde `BOYUN`, `KUYRUK`, `AYAK`, `AGIZ` noktaları ve göz kapağı `--oy` değerleri yeni çizimin koordinatlarına göre güncellenir.
  3. `src/styles/mino.css` içindeki göz kapağı rengi yeni kürk rengiyle değiştirilir.
  4. Mino'yu kullanan her yerde (`src/screens`, `orman`, `macera`) ekran görüntüsüyle kontrol edilir: `npm run e2e`.
- **Pratik öneri:** önce yeni Mino'yu tek bir ekranda deneyin (Sesli Maceralar'da `new Mino()`). Hareketler oturunca her yere geçirin.

## 6. Açık işler (öncelik sırası)

1. **Mino final:** tasarımcı → iskelet → her yere (yukarıdaki 5. bölüm).
2. **Parti pozları** (`ekip/parti-gemini.md`): Ada ve 4 arkadaş. Gelen PNG'ler şöyle işlenir:
   - Zemin silinir, `scripts/gorsel-indir.mjs` içindeki `beyaziSil` ve `esyaKaydet` mantığıyla kırpılır.
   - `assets/parti-ifade/<ad>/<poz>.webp` olarak konur. Kod bu dosyaları kendiliğinden kullanır.
   - Önemli: yeni poz, `normal` çizimle **aynı en/boy oranında ve aynı hizada** olmalı (ayak tabanı altta), yoksa karakter zıplar.
3. **Bölüm 2:** senarist senaryoyu teslim edince kodlanır.
4. **Gerçek cihaz testi** (iPhone Safari, Android, iPad; mümkünse bir çocukla):
   - Üfleme, alkış, dil şaklatma ve şarkı eşikleri.
   - `/ses-testi/` sayfasındaki "Raporu kopyala" çıktılarıyla ayarlanır.
5. **Uyuyan Orman:** Barış hikâyesiz bulduğu için beklemede. Ses mekanikleri Sesli Maceralar'a taşındı.
6. **Minik Sanatçı'nın "sihir" sunucusu:** Cloudflare Workers AI günlük kotası doluyor (hata 4006). Barış'ın Cloudflare panelinden kullanımı kontrol etmesi ya da Workers Paid kararı gerekiyor.
7. **Güvenlik:** ElevenLabs anahtarı geçmişte sohbete yazıldı; **değiştirilmeli** (ElevenLabs'te yenisi üretilip GitHub secret'a konur).
8. `main` dalı ve GitHub Pages kararı (2. bölüm).

## 7. Barış'ın çalışma tarzı ve ölçüleri (önemli)

- **Kalite:**
  - "Ucuza kaçma, çöp iş istemiyorum; yapamıyorsan bana danış."
  - Her şey hikâyeye ve mantığa oturmalı: pasta yaş kadar dilime kesilir, dilimler arkadaşlara gider.
- **Stil:**
  - Premium parlak 2D çizgi film; parlaklık ve doku **az dozda**.
  - Yapay zekâ görseli gibi durmamalı.
  - Tek stil, tek kalıp: `ekip/stil-rehberi.md`.
- **Kredi:** ElevenLabs ve Recraft kredisini boşa harcamayın. Cümleler kısa olsun; Gemini ile düzenleme 40 kredi, önce tarayıcıda Gemini'yi deneyin.
- **Rapor:** kısa Türkçe, sonuç odaklı, ekran görüntüsü ya da link ile. Teknik ayrıntı değil.
- Onun kararını gerektiren her şey `ORTAK_NOTLAR.md` dosyasına `ONAY BEKLİYOR:` diye yazılır.
- Her önemli iş `ORTAK_NOTLAR.md` dosyasına tarihli satırla girer (KARAR / ONAY BEKLİYOR / KALAN İŞ).

## 8. Bilinen tuzaklar

- **Push'tan sonra `git pull`:** CI görsel ve ses commit'i ekliyor. Pull etmeden yeni push yaparsanız çakışır.
- **Konuşma ile mikrofon:** konuşma ve efekt çalarken mikrofon kısa süre susar (`kulak.sustur`). Yeni ses çalan kod da `kulak.sustur(ms)` çağırmalı, yoksa oyun kendi sesini "üfleme" ya da "alkış" sanar.
- **Dokunma karşılığı:** her sesli görevin parmakla bir karşılığı olmalı (`dokunma = { bas, birak }`). Mikrofon izni vermeyen aile de bitirebilmeli.
- **Test modu:** `?test=1` bütün beklemeleri 30 ms'ye indirir. Gerçek hızı görmek için parametresiz açın.
- **Yeni çizim oranı:** `Oyuncu` karakter kutusunu çizimin en/boy oranıyla kurar (`oran`). Yeni çizimde oranı `KONUK_CIZIM` içine yazın.
