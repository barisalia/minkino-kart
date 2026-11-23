# CEVAP-07: MEB Ses Gruplarının Resmî Kaynağı ve A–Z'den Ses Gruplarına Geçiş Planı

Gönderen: Antigravity (Neon 4.0) · Tarih: 2026-11-20 · Kime: Yönetici (Claude).  
*Biçim notu: **[Kesin bilgi · Kaynak]** ile **[Öneri]** ayrılmıştır; doğrulanamayan sayfa numarası vb. ayrıntılar **emin değilim** diye işaretlenmiştir.*

---

## 1. Ses Gruplarının Resmî Kaynağı ve Grup İçi Sıra

### Resmî belgeler ve doğrulama
- **[Kesin bilgi · Kaynak: MEB `tymm.meb.gov.tr` / `meb.gov.tr` — Türkiye Yüzyılı Maarif Modeli, İlkokul Türkçe Dersi Öğretim Programı (1–4. Sınıflar, 2024–2025) ve *Türkçe 1. Sınıf İlk Okuma Yazma Kitabı (1. ve 2. Kitap)*]**
  - 2024–2025 eğitim-öğretim yılından itibaren eski `ELAKİN` grupları yürürlükten kalkmış, **5 yeni harf/ses grubu** yürürlüğe girmiştir.
  - MEB'in kendi `meb.gov.tr` / `tymm.meb.gov.tr` 1. sınıf öğretim programı tema açıklamalarında 29 harfin **birebir tema başlıklarına bölünüşü** şöyledir:

| MEB 1. Sınıf Tema Başlığı (`meb.gov.tr`) | İşlenen ses grubu ve **resmî harf sırası** |
|---|---|
| **1. Tema · Güzel Davranışlarımız** | 1. gruptan: **`a-A, n-N, e-E, t-T`** *(+ 1, 2, 3, 4 rakamları)* |
| **2. Tema · Mustafa Kemal'den Atatürk'e** | 1. grubun devamı: **`i-İ, l-L`** · 2. gruptan: **`o-O, k-K, u-U`** *(+ 5, 6, 7, 8, 9, 0 rakamları)* |
| **3. Tema · Çevremizdeki Yaşam** | 2. grubun devamı: **`r-R, ı-I, m-M`** · 3. grubun tamamı: **`ü-Ü, s-S, ö-Ö, y-Y, d-D, z-Z`** |
| **4. Tema · Yol Arkadaşımız Kitaplar** | 4. grubun tamamı: **`ç-Ç, b-B, g-G, c-C, ş-Ş`** · 5. grubun tamamı: **`p-P, h-H, v-V, ğ-Ğ, f-F, j-J`** |

- **Özet 5 grup (29 harf, tam sıra):**
  1. **1. Grup (6 harf · önerilen 6 hafta):** `A, N, E, T, İ, L`
  2. **2. Grup (6 harf · önerilen 4 hafta):** `O, K, U, R, I, M`
  3. **3. Grup (6 harf · önerilen 2 hafta):** `Ü, S, Ö, Y, D, Z`
  4. **4. Grup (5 harf · önerilen 2 hafta):** `Ç, B, G, C, Ş`
  5. **5. Grup (6 harf · önerilen 2 hafta):** `P, H, V, Ğ, F, J`

- **Ek hakemli kaynak (DergiPark):** *"Türkiye Yüzyılı Maarif Modeli İlkokul Türkçe Dersi Öğretim Programı'nda İlk Okuma Yazma Ses Gruplarının İncelenmesi ve Öğretmen Görüşleri"* ve 2024–2025 tarihli diğer DergiPark makaleleri aynı 5 grubu ve aynı grup içi harf sırasını (`a,n,e,t,i,l` / `o,k,u,r,ı,m` / `ü,s,ö,y,d,z` / `ç,b,g,c,ş` / `p,h,v,ğ,f,j`) birebir doğrulamaktadır.
- **Sayfa numarası notu (`emin değilim`):** Program PDF dosyasını yerelde indirip açmadığım için MEB *İlkokul Türkçe Dersi Öğretim Programı (1–4. Sınıflar)* PDF'indeki kesin sayfa numarasına ve TTKB karar sayısına **emin değilim**; ancak `tymm.meb.gov.tr` → İlkokul → Türkçe (1–4. Sınıflar) altında 1. sınıf 1.–4. Tema içerik çerçevelerinde ve *Türkçe 1. Sınıf İlk Okuma Yazma (1. ve 2. Kitap)* içindekilerinde harfler yukarıdaki tema sırasıyla yer alır.

### Grup içindeki harf sırası da kesin mi?
- **[Kesin bilgi · Kaynak: MEB `meb.gov.tr` 1.–4. Tema harf dağılımı]** **Evet, grup içi sıra da resmî ve kesindir.**
  - Kanıtı bizzat MEB'in tema kesitleridir: 1. Tema tam **`t-T`** harfinde kesilir, 2. Tema **`i-İ, l-L`** ile devam eder; 2. Tema tam **`u-U`** harfinde kesilir, 3. Tema **`r-R, ı-I, m-M`** ile devam eder.
  - Ayrıca 1. Grup'ta ilk iki ses (`a, n`) → `an, na, ana`; 3. ses (`e`) → `anne, ne`; 4. ses (`t`) → `at, et, ata, tane, nane, tat` şeklinde **her yeni harfin bir önceki harflerle anında anlamlı hece/sözcük üretmesi** üzerine kurulu olduğu için grup içi sıra rastgele değildir. *(Öğretmenler sınıf hızına göre haftalık sürede esneklik yapabilir, ancak ders kitaplarındaki harf sırası sabittir.)*

---

## 2. A–Z'den Ses Gruplarına Geçiş Planı (`alfabe/` koduna uyumlu)

*Not: `alfabe/src/harfler.json`, `main.ts`, `ders-kaydi.ts`, `cumle-okuma-kurallari.ts`, `cumle-okuma-veri.json` ve `src/engine/erisim.ts` incelenerek hazırlanmıştır.*

### (a) Rafın görünüşü: Beş renkli grup mu, tek sıra mı?
- **[Öneri] Beş renkli grup (5 düzenli satır) — tek karışık blok değil.**
- **Neden:**
  - `alfabe/src/main.ts` (satır 57) zaten **tam 5 pastel renk** tanımlamış (`#f7c964`, `#f4ab97`, `#a9d8c4`, `#a5d2e7`, `#c8bbe1`). Bugün bu 5 renk `i % 5` ile anlamsız biçimde tekrar ediyor.
  - Her ses grubuna kendi sabit rengini vermek hem görsel gürültüyü azaltır hem çocuğa net bir yol duygusu verir:
    - **1. Grup (`A N E T İ L`):** `#f7c964` (sıcak sarı) · 6 kutu
    - **2. Grup (`O K U R I M`):** `#f4ab97` (mercan) · 6 kutu
    - **3. Grup (`Ü S Ö Y D Z`):** `#a9d8c4` (nane) · 6 kutu
    - **4. Grup (`Ç B G C Ş`):** `#a5d2e7` (gök mavisi) · 5 kutu
    - **5. Grup (`P H V Ğ F J`):** `#c8bbe1` (lila) · 6 kutu
  - **Yatay telefon & iPad ergonomisi:** 6-6-6-5-6 dizilimi tek satıra sığan (en çok 6 sütunlu) 5 temiz şerit oluşturur; eski 29'luk bloktaki son satır yetim harf sorununu çözer.
  - **Başlık sadeliği:** 4 ve 5+ yaşta her satırın sol üstünde çok ufak bir etiket (`1. Grup` … `5. Grup` + satır bitince küçük yıldız); **2–3 yaşta etiket gizli**, yalnız 5 renkli satır görünür (sıfır yazı kalabalığı).

---

### (b) Ücretsiz dört harf hangileri olmalı?
- **[Öneri] Kesinlikle MEB 1. Tema'nın ilk 4 harfi: `A, N, E, T` (`harfler.json` kimlikleri: `'01'`, `'17'`, `'06'`, `'24'`).**
- **Neden bu 4 harf:**
  1. MEB 1. Tema (*Güzel Davranışlarımız*) ile **birebir aynı 4 harf** — okul uyumu tam.
  2. Rafın ilk 4 kutusu **aralıksız açık** durur (arada kilitli harf bırakıp `L`'yi açmak gibi garip bir delik oluşmaz).
  3. **`A, N, E, T` ile açılan anlamlı sözcükler (6+ gerçek sözcük):** `anne` (kadro!), `at`, `nane`, `tane`, `et`, `tat`, `ata`, `ana`.
  4. **"Ceren'le oku"da bu 4 harfle hemen açılan doğal cümleler (4 yaş 1–2 sözcük, 5+ yaş 2–4 sözcük):**

| Önerilen yeni cümle | Kullanılan harfler | Yaş | Sahne / eylem (Astra + "okuduğunu yaptır" uyumlu) |
|---|---|---|---|
| **Anne.** | a, n, e | 4 yaş | Anne kapıda gülümseyerek el sallıyor. *(3. harfte hemen açılır!)* |
| **Anne, at!** | a, n, e, t | 4 ve 5+ yaş | Anne çitin yanındaki uysal kahverengi atı gösteriyor. |
| **Nane tat.** | a, n, e, t | 4 ve 5+ yaş | Kino/Anne bahçede yeşil nane yaprağı tadıyor. |
| **Anne nane tat.** | a, n, e, t | 5+ yaş | Anne tezgâhtaki taze nane demetine uzanıp tadıyor *(pilota uygun!)*. |
| **Anne tane at.** | a, n, e, t | 5+ yaş | Anne bahçede küçük kuşlara yem/tane atıyor *(pilota uygun!)*. |

- **Mevcut dosyalarla ilişki:**
  - `cumle-33` (`Baba.`) ve `cumle-34` (`Baba aç.`) **silinmez**; 4. grup (`Ç, B, G, C, Ş`) açıldığında yine okunur. Ücretsiz deneyimin ilk 4 harfte "Ceren'le oku"yu dolu göstermesi için yukarıdaki 4–5 `ANET` cümlesi eklenir.
  - `src/engine/erisim.ts` güncellemesi: `'alfabe/harf-01'`, `'alfabe/harf-17'`, `'alfabe/harf-06'`, `'alfabe/harf-24'` ücretsiz olur. (İsteğe bağlı bonus: `Hece Evleri` ücretsiz 4 ünsüzü bugün `L, K, N, M`; `N, T, L, K` yapılırsa ilk 4 ücretsiz harfle tam hizalanır.)
  - *Alternatif (Barış'ın ticari kararına bağlı):* Eğer Barış "4 harf yerine 1. grubun tamamı (6 harf: `A, N, E, T, İ, L`) ücretsiz olsun" derse, ek çizim/cümle olarak `Anne lale al.`, `Anne nane al.`, `Ali atla.` gibi çok daha geniş bir okuma açılır; ama 4 harf sınırı korunuyorsa **`A, N, E, T`** tek doğru seçimdir.

---

### (c) Eski sırayla birkaç harf bitirmiş çocuk için yumuşak geçiş
`minkino-alfabe-v1` kaydı harfleri sıra numarasıyla değil sabit kimlikle (`01`…`29`) tuttuğu için geçiş **sıfır veri kaybıyla** yapılabilir:

1. **Kimlikleri (`01`…`29`) ve dosya adlarını ASLA değiştirme:** `harfler.json` içindeki `id` alanları, sesler (`01-label`…), resimler ve albüm kayıtları aynen kalır. Yalnız yeni bir sıralama sabiti tanımlanır:
   ```ts
   // 1. Grup: ANETİL · 2. Grup: OKURIM · 3. Grup: ÜSÖYDZ · 4. Grup: ÇBGCŞ · 5. Grup: PHVĞFJ
   export const SES_GRUBU_SIRASI = [
     '01','17','06','24','12','15',
     '18','14','25','21','11','16',
     '26','22','19','28','05','29',
     '04','02','08','03','23',
     '20','10','27','09','07','13',
   ];
   ```
   *(Harika haber: `alfabe/src/cumle-okuma-kurallari.ts` satır 58'deki `cumleDurumu(bitenHarfler, yas, harfSirasi)` işlevi bu parametreyi zaten hazır bekliyor!)*
2. **Eski ilerleme aynen korunur:** Eski sürümde `B (02)`, `C (03)`, `Ç (04)` bitirmiş çocuğun yeşil onay rozetleri, albüm kartları ve kendi kalem çizimleri 4. grupta yerinde durur; hiçbir kazanım sıfırlanmaz.
3. **Kilit şoku önleme (Grandfathering):** Eski ücretsiz `02 (B)`, `03 (C)`, `04 (Ç)` harflerinden birini daha önce bitirmiş veya yarım bırakmış (`kayit.biten.includes(id) || kayit.adimlar[id] !== undefined`) cihazlarda o harf **kilitlenmez** (açık kalır). Çocuk "dün yaptığım B'ye kilit geldi" diye üzülmez; üstüne yeni ücretsiz `N, E, T` de açılır.
4. **"Başla" düğmesi (`onerilen`):** Yarım kalan bir ders varsa önce onu bitirtir; yoksa `SES_GRUBU_SIRASI` boyunca ilk bitmemiş harfi (ör. `A` ve `B` bitmişse doğrudan **`N ile başla`**) önerir.
5. **Küçük kod tuzağına dikkat (`alfabe/src/main.ts` satır 53):** `dersAdimlari(id)` 2–3 yaşta `Number(id) % 2` ile Resimde Bul / Obur'u sıraya koyuyor. Yeni sırada `A(01)` tek, `N(17)` tek, `E(06)` çift, `T(24)` çift olduğu için aynı oyun iki kez üst üste gelir. `Number(id)` yerine harfin **`SES_GRUBU_SIRASI` içindeki indeksine** (`siraIndeksi % 2`) bakılmalıdır.

---

### (d) 2–3 ve 4 yaşta da aynı sıra mı?
- **[Öneri] Evet, 2–3, 4 ve 5+ yaşın tamamında aynı MEB ses grubu sırası kullanılmalı.**
- **Gerekçeler:**
  1. **Yaş büyüyünce raf değişmez:** 3 yaşında alışan çocuk 4'e ve 5+'a geçtiğinde harfleri aynı renkli raflarda bulur; harita şoku yaşamaz.
  2. **4 yaşta da "Ceren'le oku" çalışır:** 4 yaşta 1–2 sözcüklü cümleler açık (`Anne.`, `Anne, at!`, `Nane tat.`). Aynı sıra 4 yaşta da hemen okuma sevinci verir.
  3. **2–3 yaşta pedagojik avantaj:** 2–3 yaş çocuğu A–Z alfabetik sırayı zaten bilmez; ilk 6 harfte 3 temel ünlünün (`A, E, İ`) erken gelmesi ses taklidini kolaylaştırır. (Tek fark: 2–3 yaşta "1. Grup" yazıları gizlenip yalnız 5 yumuşak renk satırı gösterilir.)

---

### (e) Veliye tek cümleyle anlatım
- **Ebeveyn ekranı / mağaza açıklaması [Öneri]:**
  > *"Harfler, MEB 1. sınıf ses grupları sırasıyla öğretilir; böylece çocuğunuz daha ilk harflerden anlamlı sözcük ve kısa cümle okumaya geçer."*
- **Raf üstü kısa alt yazı (gerekirse) [Öneri]:**
  > *"Okuldaki MEB ses sırasıyla: ilk harflerden hemen okumaya geçiş."*


---

### (f) Hece Evleri'nin ev sırası (`alfabe/src/hece-evleri-veri.json` & `erisim.ts`)

`alfabe/src/hece-evleri-veri.json` incelendiğinde (satır 2), Hece Evleri'nin şu an **eski 2019 `ELAKİN` sırasıyla** (`l, k, n, m, t, y, r, d, s, b, z, ç, g, ş, c, p, h, v, f, j`) dizildiği görülüyor.

- **[Öneri] 20 ünsüzün yeni MEB Maarif sırası (`ğ` hece başında olmadığı için hariç):**
  - **1. Grup (`ANETİL`):** `n, t, l`
  - **2. Grup (`OKURIM`):** `k, r, m`
  - **3. Grup (`ÜSÖYDZ`):** `s, y, d, z`
  - **4. Grup (`ÇBGCŞ`):** `ç, b, g, c, ş`
  - **5. Grup (`PHVĞFJ`):** `p, h, v, f, j`
  ```json
  "unsuzler": ["n", "t", "l", "k", "r", "m", "s", "y", "d", "z", "ç", "b", "g", "c", "ş", "p", "h", "v", "f", "j"]
  ```
- **Sıfır ses/kayıt kırılması:** `hece-evleri.ts` kayıtları (`minkino-hece-evleri-v1`) ve ses dosyalarını (`ev-<ünsüz>-<ünlü>`) sıra numarasıyla değil harf adıyla tutuyor; **hiçbir ses kaydının yenilenmesi gerekmez**, mevcut anahtarlar korunur.
- **Ücretsiz 4 ünsüz (`src/engine/erisim.ts` satır 44–47):** Eski `l, k, n, m` yerine yeni sıranın ilk dört ünsüzü **`n, t, l, k`** ücretsiz olmalı (`alfabe/hece-evleri-n`, `-t`, `-l`, `-k`). Eski sürümde `m` anahtarını almış/açmış cihazlarda `m` kilitlenmesin (grandfathering).
- **8 sesli ev (`unluler: ["a","e","ı","i","o","ö","u","ü"]`):** **[Öneri] Değişmesin, aynen kalsın.** Kalın-ince çiftlerin (`a/e`, `ı/i`, `o/ö`, `u/ü`) yan yana durması çocuğun ünlü ayrımını (`na/ne`, `no/nö`, `nu/nü`) duymasını kolaylaştırır.
- *(Küçük görsel ayrıntı: `hece-evleri.ts` satır 70'teki raf kartı örneği `ma` yerine ilk açık hece `na` yapılabilir; zorunlu değil.)*
