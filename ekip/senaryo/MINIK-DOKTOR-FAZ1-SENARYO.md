# Minik Doktor · Sahne Sahne Oynanış Akışı & Uç Durum Matrisi (Gün 1–3)

> **Hazırlayan:** Antigravity (Neon 4.0) · 22 Kasım 2026  
> **Amaç:** Harf / kodcu oturumunun `MINIK-DOKTOR-ORNEK.md` ("Zıpzıp'ın Dizi") üstüne Sürüm 1.2'nin ilk üç gününü (`P1–P2`) tek bir tahmine bırakmadan kurabilmesi için kare kare akış, zamanlama, yanlış alet tepkileri ve gizli sürpriz tetikleyicileri.

---

## 1. Sabah Açılışı & Bekleme Odası (Gün 1–3 Ortak)

| An | Ekranda ne olur | Ses & Efekt | Uç durum / 2–3 yaş farkı |
|---|---|---|---|
| **0.0 sn** | `bekleme-odasi.png` açılır; giriş kapısında `tabela-kapali` (hilal ay) asılı. Kino kapı yanında el sallar. | `md-k-gunaydin` (*"Günaydın doktor! Kliniği açalım mı?"*) | 2–3 yaşta 5 sn dokunulmazsa tabela hafifçe sallanır; dokununca `tabela-acik` (güneş) 3D yatay dönüşle çevrilir + pirinç kapı zili `zil`! |
| **2.0 sn** | Günün hastaları (2–3 yaş: 2 hasta; 4/5+: 3 hasta) kapıdan seke seke girip nane koltuklara oturur. | Hafif ayak sekmesi + her hasta oturunca kısa mırıltı/gülümseme | **Seçim özgürlüğü:** Çocuk hangi hastaya dokunursa o kalkıp muayene odasına geçer. |
| **Bekleme odası etkileşimi** | Önceki günlerde açılan ödüller (`akvaryum`, `boy-olcer`, `kuzu-sepet`) her an dokunulabilir. | Akvaryum: `blup` + balık taklası; Kuzu: `mee!` + zıplama | Hasta seçilmeden önce sınırsız kez oynanabilir; akışı asla kilitlemez. |

---

## 2. Vaka 1 · Oyuncak Kuzu (Gün 1 Alıştırma — 45–60 sn)

> **Pedagojik amaç:** Çocuğa *"Alet tepsisinden al, üstüne götür, bırak"* kas hafızasını sıfır korkuyla ve `kitap-doktor.json` bağıyla öğretmek.

1. **Giriş:** Kino koltuğa kırmızı kurdeleli `kuzu-otur`u koyar: `md-k-kuzu-giris` (*"Önce oyuncak Kuzu'ya bakalım mı?"*).
2. **Adım 1 · Stetoskop (`D1`):**
   - Tepside 2–3 yaşta yalnız stetoskop; 4/5+'ta stetoskop + yara bandı.
   - Stetoskop Kuzu'nun göğsüne yaklaşınca yumuşak oyuncak davul `e-gum` çalar (1,2 sn tutulunca tamamlanır).
   - **Tepki:** Kuzu `kuzu-mutlu` olur, 15 px neşeyle zıplar + minik oyuncak `"Mee!"` efekti.
3. **Adım 2 (4 & 5+ yaş) · Yara Bandı (`D2`):**
   - Kuzu'nun kurdelesi altındaki patisine 4 banttan biri seçilip konur (çamur/yakın plan yok, doğrudan hızlı yapıştırma — alıştırma kısa kalır!).
4. **Adım 3 · Yıldız & (5+) Damga (`D12`):**
   - Göğse yıldız yapışır → 5+ yaşta Kuzu'nun kartına `PAT!` damga → `md-k-kuzu-hazir` (*"Kuzu hazır! Sıra arkadaşlarda!"*).

---

## 3. Vaka 2 · Zıpzıp'ın Dizi (Gün 1 — Canlı Örnek, Kuruldu!)

- Birebir `ekip/senaryo/MINIK-DOKTOR-ORNEK.md` ve `doktor/src/main.ts` akışı.
- **Ek 1.2 gizli sürprizi:** Stetoskop Zıpzıp'ın karnına (`y > 0.70`) tutulursa 1 kez komik `gurr` karın gurultusu + `md-k-karin-gur`; Kino'nun kendi göğsüne tutulursa `md-k-gizli-kalp` (*"Hihi, benim kalbim de hızlı atıyor!"*).

---

## 4. Vaka 3 · Lokum'un Soğuk Dondurma Üşümesi (Gün 2 — Claude v2 Düzeltmeli!)

> **Kesin tıbbi/pedagojik kural:** Lokum'un **ateşi YOK**, yalnız dondurmadan **üşümüş**. Ateş ölçer **YEŞİL (normal)** yanar; tedavi **battaniye + ılık ıhlamur**dur. **Serin bez bu vakada ASLA kullanılmaz!**

| Adım | Yaş | Etkileşim ve fizik | Ses & Duygu yayı | Yanlış alet / uç durum |
|---|---|---|---|---|
| **Giriş** | Tümü | `lokum-usumus` (`0.63 × Kino` boy, pembe tulum!) koltuğa oturur; hafifçe titrer (`dk-titrek`). | `md-l-usudum` (*"Hapşu! Çok soğuk dondurma yedim, üşüdüm!"*) | — |
| **1. Stetoskop** | 5+ | Kalpte 1,8 sn `e-gum` → Lokum ilk kez hafif gülümser (`lokum-rahat`a ara geçiş). | `k-kalp` | — |
| **2. Ateş Ölçer (`D3`)** | Tümü | Alın termometresi alna (`y ≈ 0.34`) 1,4 sn tutulur → `bip` (neşeli `C5-G5`) + termometre ekranı **YEŞİL (`ates-olcer-normal`)** parlar! | `md-k-ates-normal` (*"Ateşi normalmiş, sadece biraz üşümüş."*) | Çocuk önce battaniyeyi seçerse (4/5+): Kino gülümser (*"Hımm, önce alnına bir bakalım!"*); 2–3 yaşta sıradaki alet zaten tek başına tepside. |
| **3. Sıcak Battaniye (`D3`)** | Tümü | Çocuk `battaniye-katli`yi Lokum'un omuzlarına sürükleyip bırakır → `battaniye-sarili` ön katman yumuşakça sarılır, `dk-titrek` **durur**, Lokum `lokum-rahat` pozuna geçer! | `md-k-battaniye` → sarılınca Lokum mutlu mırıldanır. | — |
| **4. Ilık Ihlamur (`D4`)** | 4 & 5+ | Kısa alt/orta etkileşim: `ihlamur-demlik`ten `ihlamur-fincani`na ılık su dök (1 sn) → parmakla 2 daire karıştır (3 beyaz buhar yükselir!) → fincanı Lokum'a uzat (3 `blup/lıkır` yudum!). | `md-k-ihlamur` → 3. yudumda `md-l-isindim` (*"Ohhh, sıcacık oldum! Hav!"*) | **Gizli sürpriz #8:** Çocuk demlik yanındaki yarım limonu fincana sıkarsa Lokum 1 sn komik ekşi yüz yapıp kıkırdar (`md-k-eksi`), ceza yok, ıhlamuru yine neşeyle içer! |
| **Final** | Tümü | Yıldız çıkartması (+ 5+ damga) → `lokum-zipla` battaniyeden neşeyle zıplayıp kapıya koşar, dönüp `"Hav!"` diye zıplar. | `e-zipla` + `md-l-isindim` | — |

---

## 5. Vaka 4 · Bulut'un Boynuzunda Bal + Boy Ölçer (Gün 2)

| Adım | Yaş | Etkileşim | Duygu yayı & şaka |
|---|---|---|---|
| **Giriş** | Tümü | `bulut-utangac` oturur (göz bebekleri merkezde, kayısı tüy, lila tişört, turkuaz şort), boynuzunda minik altın bal damlası parlar. | `md-b-bal` (*"Bal kavanozuna çok yaklaştım!"*) |
| **1. Stetoskop** | 5+ | Kalpte 1,8 sn `e-gum`. | Utangaçlık azalır. |
| **2. Islak Pamuk (`D2` · Boynuz yakın plan)** | Tümü | Boynuza dokununca `boynuz-temiz` + `boynuz-bal` (`2048 × 1152`) yakın planı açılır. Çocuk ıslak pamukla balı ileri-geri sürterek %90 temizler → `boynuz-temiz` pırıl pırıl parlar! | `md-b-boynuz` (*"Boynuzum pırıl pırıl oldu!"*) · `bulut-guluyor` |
| **3. Zürafa Boy Ölçer (`D10`)** | 4 & 5+ | `bulut-ayakta` zürafa boy ölçerin önünde durur. Çocuk ahşap çubuğu yukarıdan indirip Bulut'un başının üstüne (boynuz/yün hizası!) koyar → tık sesi + renkli çizgi! | **Kitap kanonu şakası (`kitap-doktor.json`):** `md-b-yun` (*"Yünüm de boyuma sayılıyor mu?"*) |
| **Final** | Tümü | Yıldız göğse (+ 5+ damga) → `bulut-zipla` + kapı önünde kulaklarını sallayıp güler. | `e-zipla` |

---

## 6. Vaka 5 · Bulut'un Kulak Dış Tüyünde Uğur Böceği (Gün 3 — Claude v2 Güvenlik Düzeltmeli!)

> **Kesin güvenlik kuralı:** Kulağa **ASLA cımbız veya sert cisim sokulmaz!** Uğur böceği Bulut'un uzun kulağının **dış kenarındaki tüylerde** durur. Çocuk büyüteçle bulur, **yeşil yaprak (`yesil-yaprak-tut`)** yaklaştırır; böcek güvenle yaprağa yürüyüp pencereye uçar!

| Adım | Yaş | Etkileşim ve fizik | Ses & Güvenlik vurgusu | Yanlış alet (Cımbız!) uç durumu |
|---|---|---|---|---|
| **Giriş** | Tümü | `bulut-guluyor` oturur, kulağının dış kenarını hafifçe oynatır (gıdıklanma!). | `md-b-kulak` (*"Kulağımın kenarı çok gıdıklanıyor!"*) | — |
| **1. Büyüteç (`D5` · Kulak dış kenarı yakın plan)** | Tümü | Kulağa dokununca `kulak-bulut-temiz` + `kulak-ugur-bocegi` (`2048 × 1152`) açılır. Büyüteçle (`BUYUTEC_CAM` canlı mercek!) dış tüy taranınca kırmızı-siyah noktalı uğur böceği büyür ve neşeyle kıpırdar (`e-buldu`). | `md-k-kulak-guven` (*"Kulağa sert bir şey sokmayız, yaprak yaklaştıralım!"*) | **KRİTİK:** 4/5+ çocuk tepsiden yanlışlıkla **cımbızı** seçerse cımbız kulağa hiç yaklaşmaz, yumuşakça geri yaylanır ve Kino hemen `md-k-kulak-guven`i söyler! (Çocuk güvenliği oyunun kendisinde yaşar!) |
| **2. Yeşil Yaprak Kurtarma (`D5`)** | Tümü | Çocuk tepsiden `yesil-yaprak-tut`u sürükleyip uğur böceğinin hemen yanına (`< 85 px`) 0,6 sn sabit tutar → uğur böceği minik adımlarla yaprağın üstüne yürür → çocuk yaprağı pencereye/yukarı çekince böcek kanatlarını açıp `vizz` sesiyle kıvrılarak pencereden uçar! | `md-b-bocek-uctu` (*"Güle güle uğur böceği! Artık gıdıklanmıyor!"*) | 2–3 yaşta yaprak böceğe yaklaşınca böcek hemen yaprağa geçip kendiliğinden neşeyle uçar (tek hareket). |
| **3. Stetoskop** | 5+ | Kısa kalp dinleme (sakinleştiğini kontrol). | `e-gum` | — |
| **Final** | Tümü | Yıldız çıkartması (+ 5+ damga) → `bulut-zipla` pencereye doğru el sallar! | `e-zipla` | — |

---

## 7. Gün Sonu · Klinik Defteri (Gün 1 → Gün 2 Geçişi)

1. Günün son hastası kapıdan el sallayıp çıkınca `md-k-defter` çalar (*"Bugün harika çalıştık! Kliniğe ne alalım?"*).
2. **Klinik Defteri** ortada açılır (çizgili krem defter, yazısız):
   - **Sol sayfa:** Ertesi gün açılacak yeni aletin büyük resmi (Gün 1 sonu → Ateş ölçer & battaniye) + parlak yıldız ışığı.
   - **Sağ sayfa:** Biriken yıldızlarla alınabilecek 2 bekleme odası ödülü (Gün 1 sonu → **Renkli Balık Akvaryumu** [4 ★] vurgulu, 2. sırada **Zürafa Boy Ölçer** [4 ★]).
3. Çocuk ödüle dokununca yıldızlar neşeyle uçup gider, ekran bekleme odasına döner ve **Akvaryum** sol-ön yuvasına (`x = 160…580, y = 1320`) `pıt!` diye iner, balık ilk taklasını atar (`blup-blup!`)!
4. Sağ altta sıcak güneş simgeli **"Ertesi Gün"** düğmesi (≥ `80 × 80` px) açılır — çocuk isterse bekleme odasında akvaryumla oynar, isterse Gün 2'ye geçer!
