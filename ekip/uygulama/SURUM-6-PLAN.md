# Sürüm 6 planı · iki mağaza

Hazırlayan: Claude (yönetici), 22 Kasım 2026, 01:30. Barış'ın sözü: "Yarın gece Sürüm 6'yı iki yere vereceğim. Yarına kadar planlamayı yap, yarın görsellerle birlikte yaparız."

Durum: App Store'da 1.0 onaylandı ("Ready for Distribution"). Google Play onaylı. Yerelde 2334 dosyalık değişiklik bekliyor; hiçbiri commit edilmedi. Yükleme yalnız Barış "yükle" deyince.

## 1. Günün sırası (22 Kasım)

| Ne zaman | Ne | Kim |
|---|---|---|
| Sabah, Astra gelince | Önce Sürüm 6'nın üç küçük çizimi (Dersler simgesi, Deney kapağı, Deney'in ilk sahnesi), sonra bekleyen sıra | Astra |
| Gün boyu | Gelen her çizim %100 boyda sayılır, bağlanır, videosu çekilir. Yönetici kare kare bakar, temizini Barış'a gönderir | Dört oturum + yönetici |
| İçerik kapanışı (akşam, Barış'ın söyleyeceği saat; öneri 19:00) | O ana kadar çizimi tamamlanmamış bölüm gizli kalır, sonraki güncellemede kendiliğinden açılır. Kimse acele etmez; yarım iş çocuğa açılmaz | Yönetici |
| Kapanıştan sonra | Aşağıdaki "Derlemeden önce" listesi, tek oturum, sakin makine | Yönetici + bir oturum |
| Barış "yükle" deyince | Commit, push, iki derleme, mağaza adımları | Yönetici, Barış |

## 2. Sürüm 6'ya girenler (hazır, videosuna bakıldı)

- **Türkçe (Harf Atölyesi):** okul sırasıyla harf dersleri, "Ceren'le oku" (59 cümle, 6 resimli öykü, "Anladın mı?", Oku ve bul, Okuduğunu yaptır), Hece Evleri, Hece Köprüsü, Posta Kutusu, Harf Kurabiyesi, Resimli Sözlük, her harfe ikinci boyama, Resimde Bul'un ikinci seti, Trambolin 100 sözcük.
- **Matematik:** Ceren Öğretmen ile Sayılar 1–10, 21 yeni oyun ve Tahterevalli, her oyun üç gelişte başka soru, mola anı, veli kartları.
- **İngilizce** (menüde açılırsa, bkz. karar 1): 15 ada (12 + Meyve, Hava, Doğa), Ağaç Evi, Saklambaç, Fener Avı, Hayvanat Bahçesi, Polly's Riddles, Odd One Out, söylediğin sözcüğü dinleme, Evde 3 Cümle.
- **Genel:** hediye kodu düğmesi, kitaplarda ilk rafın telefonda görünmeme hatası (mağazadaki sürümde var), küçülen ses dosyaları, iPad yatay menü.

Çizimi gelirse kendiliğinden açılacaklar: İngilizce'nin dokuz adası, Polly'nin ABC'si (yalnız P harfi eksik), Alphabet Train, Renkli Kino; Matematik'te Bahçe Şenliği, Kelebeğin Kanadı, Meyve Grafiği; Türkçe'de öykü 7–10.

## 3. Barış'ın kararını bekleyenler (derlemeden önce)

1. **İngilizce ana menüde açılsın mı, kilidi ne olsun?** Önerim: açılsın, "Dersler"in içinde. Kilit kararı senin.
   **Karar (22 Kasım 02:35, Barış: "oyunu aç, İngilizce kısmını"):** açıldı. `INGILIZCE_MENUDE = true`; Dersler kapalıyken Etkinlikler'de Harf Atölyesi'nin yanında, Dersler açılırsa orada. Kilit değişmedi: kart ve ilk ada (Çiftlik) ücretsiz, öbür adalar abonelikle (`src/engine/erisim.ts`). **Paket boyu uyarısı:** İngilizce artık uygulama derlemesine giriyor; `assets/ingilizce` 162 MB (ses 67 MB, kelime çizimleri 33 MB). Android temel paket sınırı için derlemeden önce ölçülmeli.
2. **"Dersler" bölümü Sürüm 6'ya girsin mi?** Önerim: simgesi yarın gelir ve sen görüp beğenirsen girsin; gelmezse menü bugünkü gibi çıkar.
3. **Matematik'te Ceren derslerinin kilidi.** Şu an oyuncaklarının kilidinin arkasında.
4. **Çizimleri kalite 85'e küçültme** (yaklaşık 190 MB kazanç). Önerim: bu sürümde yapma; piksel okuyan oyunlar ayrı denenmeden riskli.

## 4. Derlemeden önce (içerik kapanışından sonra)

1. **iOS sürüm numarası 1.1 olmalı.** 1.0 onaylandığı için Apple aynı numarayla yeni derleme almaz. `ios/App/App.xcodeproj/project.pbxproj` içinde `MARKETING_VERSION = 1.0` iki yerde `1.1` yapılır. Derleme sayısını Codemagic kendi verir. Android'de sürüm adı ve kodu GitHub'ın sayacından gelir, dokunmak gerekmez.
2. Tip denetimi: kök `npx tsc --noEmit` ve Matematik için ayrı ayar dosyası (kök ayar `matematik/src`'yi kapsamıyor).
3. Birim testleri, sakin makinede, tek koşu.
4. `npm run build:app`; paket boyu ölçülür (17 Kasım: 566 MB; o günden beri çok içerik eklendi). Android temel paket 200 MB altında kalmalı.
5. Derlenmiş pakete karşı üç uygulamanın ve menünün uçtan uca testleri; taşma taraması (`node scripts/tasma-tara.mjs`).
6. Depo herkese açık: 100 MB üstü dosya yok, anahtar ya da şifre yok. 2334 dosya tek tek değil, klasör klasör gözden geçirilir.
7. Yönetici derlenmiş kopyada üç uygulamayı ve menüyü kendi açar, ekran görüntüsü alır.

## 5. "Yükle" dendikten sonra

1. Commit ve push. Android derlemesi GitHub'da kendiliğinden başlar; iOS için Codemagic'te "ios-testflight" çalıştırılır.
2. **Önce gerçek cihaz:** TestFlight ve Play iç testte telefonla 15 dakika. Bakılacaklar: İngilizce "Şimdi sen söyle" (bu özellik gerçek cihazda hiç denenmedi), mikrofon izni penceresi, hediye kodu, seslerin kalitesi, ilk açılış.
3. **App Store Connect (Barış):** sol üstteki "+" ile yeni sürüm 1.1 → derleme seçilir → "Yenilikler" metni → incelemeye gönder. Yaş derecelendirmesi (App Information → Age Ratings) bu sırada düzenlenebilir olur: **Parental Controls → YES** (ebeveyn kapısı, Ebeveyn Köşesi, yaş seçimi, ilerleme); Age Assurance ve öbür bütün sorular NO. 1.0 onaylıyken bu ekran kilitli, yalnız yeni sürüm açılınca değişir. Derece 4+ kalır.
4. **Google Play Console (Barış):** AAB yüklenir → sürüm notu → incelemeye gönder.

Uyarı: gerçek cihaz denemesi atlanırsa en riskli yer söz tanıma. Bozulursa oyun eski yola (ses var mı, yok mu) düşecek biçimde yazıldı, ama bu da cihazda görülmedi.

## 6. "Yenilikler" metni (öneri)

> Ceren Öğretmen'le üç ders büyüdü!
> Türkçe: okul sırasıyla harfler, okuma cümleleri ve altı resimli öykü.
> Matematik: 21 yeni oyun, her gelişte yeni soru.
> İngilizce: 15 ada, Polly'nin Ağaç Evi ve bilmeceleri; artık söylediğin sözcüğü dinliyoruz.
> Ayrıca hediye kodu desteği ve daha küçük uygulama boyutu.

(İngilizce menüde açılmazsa üçüncü satır çıkar, ilk satır "iki ders" olur.)

## 7. Yeni işler

### 7a. "Dersler" bölümü (ana menüde beşinci bölüm)

- Bugün dört bölüm var: Etkinlikler, Kitaplar, Oyunlar, Çizgi Filmler. Türkçe ve Matematik "Etkinlikler"in içinde, İngilizce gizli.
- Yeni düzen: **Dersler** = Türkçe (Harf Atölyesi), Matematik, İngilizce, Deney. Etkinlikler'de Okula Hazırlanalım, Çiz Canlansın, Bil Bakalım, Sesli Maceralar kalır.
- 2–3 yaş için ağır olmaz: üç dersin de 2–3 yaşta kısa, dokun-dinle kipi var. Bölümün adı küçüklerde de "Dersler" kalır; istenirse sonra değiştirilir.
- Gereken: Astra'dan bir simge (öbür dört simgeyle aynı çizgi), menünün beş bölümle yeni dizilişi, "Dersler" ses kaydı. Kod bir bayrağın arkasında kurulur; Barış görmeden menü değişmez.

### 7b. Ceren Öğretmen ile Deney Atölyesi (yeni ders)

- **Bir deney yaklaşık 3 dakika, dört adım:** merak et (Ceren sorar) → tahmin et → kendi elinle dene → gör ve söyle (Ceren tek cümleyle açıklar). Sonunda Deney Defteri'ne çıkartma ve veliye "Evde dene" kartı.
- **Yaşa göre:** 2–3 yaşta yalnız dene ve izle; 4 yaşta tahmin; 5+ yaşta iki gruba ayırma ve "neden?" sorusu.
- **İlk sekiz deney:** Batar mı, yüzer mi? · Renkleri karıştır · Mıknatıs neyi çeker? · Gölge büyür, küçülür · Buz nerede çabuk erir? · Tohum nasıl büyür? · Rampadan hangisi hızlı iner? · Bardaklarla müzik (su çok, ses kalın).
- **Sürüm 6'ya:** yalnız çizimi yarın gelip denetimden geçen deneyler girer (hedef ilk iki deney). Gelmezse ders gizli kalır, sonraki güncellemede açılır.

### 7c. Yeni oyun (Oyunlar bölümüne; 1.2 için)

Düzeltme (22 Kasım 01:50): Barış'ın istediği İngilizce oyunu değil, "Oyunlar" bölümüne yeni ve daha elit bir oyun. Eski Astra ile yapılan Minik Dostlarım (hayvan oyunu) ve öbür oyun "külüstür" kaldı; yenisi onların üstünde olacak. İlk yazdığım İngilizce oyun fikirleri (Balon Postası, Komik Cümleler) bu isteğin karşılığı değildi; İngilizce'nin kendi listesinde aday olarak durur.

**Karar (Barış, 22 Kasım 02:25): Minik Doktor · Minkino Kliniği.** Fikir ve senaryo Antigravity'den: `ekip/senaryo/MINIK-DOKTOR.md` (8 alet istasyonu, 12 vaka, bekleme odası ödülleri, üç yaş yolu, Astra MD1–MD6 yaklaşık 67 çizim). Yönetici üç düzeltme istedi (kanal, 22 Kasım 02:30). Kod ve çizim 1.1 mağazaya verildikten sonra başlar; yapacak oturum: Minik Şef'i kuran oturum (sef-elit), Dersler bölümünden sonra. Benim önerilerim (`YENI-OYUN-FIKRI.md`, Zıpzıp'ın Makinesi) yedekte kalır.

Hangisi olacağına Barış karar verir; çizim siparişi ondan sonra yazılır. Yarın Astra'nın işi 1.1; bu oyunun çizimi 1.1 çıktıktan sonra başlar.

## 9. Takvim ve reklam (Barış, 22 Kasım)

- **1.1:** 22 Kasım gecesi iki mağazaya. Ardından büyük reklam (yaklaşık 100.000 TL). Bu yüzden 1.1'de yeni gelen kullanıcının ilk beş dakikası kusursuz olmalı: açılış, yaş seçimi, ücretsiz içerik, abonelik ekranı.
- **1.2:** 1–5 Aralık civarı. Asıl geliştirmeler ve "tam takır" seviye bu sürümde: yeni oyun, Deney'in kalan deneyleri, İngilizce'nin kalan adaları.
- Derlemeden önce yönetici derlenmiş kopyada sıfırdan (ilk kez açan kullanıcı gibi) baştan sona yürür, videosunu çeker.

## 8. Kim ne yapıyor

| İş | Oturum |
|---|---|
| Deney Atölyesi: Astra siparişi, ders motoru, ilk iki deney, Ceren kayıtları | Matematik oturumu |
| Dersler bölümü (bayrak arkasında), menü dizilişi, ses kaydı | Minik Şef oturumu (Türkçe öyküler oturumu) |
| İngilizce: gelen ada çizimlerini bağlamak; yeni oyun (karar çıkınca) | Veli oturumu (İngilizce) |
| Türkçe: gelen çizimleri bağlamak | Harf oturumu |
| Videoları kare kare denetlemek, derleme listesi, Barış'a göstermek | Yönetici |
