# Mino ile Kino'nun Pasta Otobüsü (ad ve ortaklık değişikliği)

> Durum: TASARIM (2026-10-09). Kod yok; kodcuya iş tanımı.
> Barış oyunu seviyor. Bu yüzden **mekanik değişmez**: hamur → kalıp → fırın → krema → süs → servis, 3 gün, 3 fırın gözü, sırada en çok 2 müşteri, sade sürüm kuralları (`pasta-otobusu.md`, `pasta-otobusu-v2.md`, ORTAK_NOTLAR 2026-10-03 sade sürüm ve dizilim) aynen kalır.
> Yapılacak tek şey: otobüsü **ikisinin birlikte** işlettiği görünsün. Yeni adım yok, yeni bekleme yok, yeni düğme yok.

## 1. Değişiklikler (en azdan çoğa)

### 1a. Ad
- `content/pasta.json` → `arayuz.baslik_ust`: **"Mino ile Kino'nun"**, `baslik_alt`: "Pasta Otobüsü" (aynı kalır).
- Ana menü kartı adı (`uygulama/src/oyunlar.ts`) ve mağaza metinleri aynı ad.
- Açılış logosunda iki küçük yüz rozeti: solda Mino, sağda Kino (iskelet yüzleri, kodla kırpılır; yeni çizim yok).
- Seslendirme: açılış cümlesi "Pasta otobüsü geldi!" kalır (yeniden kayıt yok). Yeni tek cümle: Mino **"Mino ile Kino'nun Pasta Otobüsü!"** (yalnız açılış ekranında, logo belirince bir kez).

### 1b. Kino işte görünür (3 küçük iş, hepsi paralel, hiçbiri bekletmez)
| Ne | Şu an | Yeni | Bekleme |
|---|---|---|---|
| **Siparişi alır** | Mino "Hoş geldin!" der, siparişi okur | Müşteri gelince Kino pencereye bir hop atar, kulakları kalkar, balonun yanında patisini sallar: *"Hoş geldin!"* (Kino sesi, var olan `hosgeldin` yerine dönüşümlü: bir müşteriye Mino, bir müşteriye Kino). Siparişi yine Mino okur. | 0 sn: hop 0.4 sn, çocuk aynı anda hamura dokunabilir |
| **Servis eder** | Tabağa dokununca tabak yay çizerek müşteriye uçar | Tabak yine **aynı yolda, aynı sürede** uçar; Kino'nun patisi tabağın altındaymış gibi Kino yolun ilk yarısında yanından koşar ve pencerede "Buyurun!" der. Tabak Kino'yu beklemez. | 0 sn (uçuş süresi değişmez) |
| **Kutlar** | Mutlu müşteride kalpler ve jeton | Mino ile Kino **çak yapar** (iki pati havada buluşur, "şak!" sesi, 3 yıldız). Günün hedefi tutunca ikisi birlikte **zıplar**. | 0 sn: çocuk sıradaki işe hemen geçer; çak 0.5 sn ve üstüne dokunulamaz alan oluşturmaz |

Kino'nun eski komik işleri kalır: yanık kurabiyeyi yer ("Çıtır çıtır!"), düşen süsü yakalar, fırın pişince kuyruğu pervane olur.

### 1c. Akşam: birlikte sayma
- Şu an: Mino jetonları sayar, Kino tezgâhta uyur.
- Yeni: Kino jetonları **beşli kuleler** yapar (her 5 jetonda kule "tık" diye tamamlanır), Mino kuleleri sayar: "Beş! On! On beş!" (kayıtlar var: `parca.besli`). Sonra Kino yine kırıntıları yerken uyur. Eğitici kazanç: beşer sayma, ek süre yok (aynı animasyon süresi).

### 1d. Önlük ve şapka
- Kino'ya pastacı **önlüğü** ve küçük **pastacı şapkası** (Mino'nun şapkasıyla aynı aile, mavi şeritli). Gemini çizer, Adobe Kino iskeletinin `govde` ve `kafa` katmanına bağlar (`unluKino()` un lekesiyle birlikte durur). Liste: `ekip/gemini/IS-LISTESI-YENI.md` → Ek A.

## 2. Gerilemeyi önleme (Barış'ın şikâyetleri tekrar etmesin)
Her biri kodcunun e2e'sinde ayrı bir denetim olur (`tests/e2e/pasta.spec.ts`, 844×390 önce, sonra 390×844, 1024×768):

| Eski hata | Kural | Denetim |
|---|---|---|
| Bekleme ("bekliyorsun sıkıcı") | Kino'nun hiçbir animasyonu girdiyi kilitlemez; çocuğun bir sonraki dokunuşu her an çalışır | Her Kino animasyonu sırasında hamura dokunulur, tepsi çıkar |
| 3 fırından yalnız biri kullanılıyordu | 3 göz baştan açık kalır; Kino fırının önünde durmaz | Kino'nun kutusu hiçbir fırın gözünün dokunma alanıyla kesişmez |
| Küçük görseller | Kino eklenince istasyonlar küçülmez; Kino yalnız mevcut boşluğa (rafa, pencere kenarına) girer | İstasyon boyları değişiklikten önceki ekran görüntüsüyle piksel ölçüsünde aynı |
| Çapraz fırın | `firin-dik` kalır | — |
| Kolaylık = içerik kesmek | Bu iş içerik çıkarmaz | — |
| Dağınık sahne | Kino'nun yeni yeri tek: pencerenin sağı (yatay), üst kat (dikey). Aynı anda ekranda en çok 2 hareketli karakter + müşteriler | Ekran görüntüsünde Kino ile müşteri balonu çakışmaz |
| Görseller yüklenirken boş mutfak | Gün ekranı bütün görseller (Kino'nun önlüğü dahil) `decode()` edilmeden açılmaz; o sürede otobüs yolda (mevcut yolculuk animasyonu) | İlk karede tezgâh boş değil |
| Tekerlekler karakterlerin arkasında | Açılışta tekerlekler (`teker-1`, `teker-isik-1`) her zaman otobüs gövdesinin ve karakterlerin üstünde; Mino-Kino pencerede, gövdenin içinde | z sırası testi |
| Havada jetonlar | Jetonlar tezgâhın üst çizgisine **oturur**: temas gölgesi, son konumun alt kenarı = tezgâh çizgisi | Jeton alt kenarı ile tezgâh çizgisi arası ≤ 2 px |

## 3. Yeni cümleler (seslendirme, ~70 karakter)
- Mino: `baslik_soyle`: "Mino ile Kino'nun Pasta Otobüsü!"
- Kino: `hosgeldin`: "Hoş geldin!" · `buyurun`: "Buyurun!" · `cak`: "Çak!"

## 4. Bitti ölçütü
- Ad her yerde yeni (menü, açılış, mağaza metni).
- Kino üç işte görünüyor, hiçbir adım uzamadı (e2e: Gün 1'in süresi önceki ölçümden uzun değil).
- Yukarıdaki 9 gerileme denetimi geçiyor; 844×390 ve 390×844 ekran görüntüleri önce/sonra yan yana.
