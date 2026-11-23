# Kalite denetimi · 22 Kasım 2026 gecesi

Denetçi: Claude (Harf / Minik Doktor). Ölçüt: `ekip/KALITE-KURALLARI.md`. Hiçbir dosyaya dokunulmadı; yalnız bulgular.

**Nasıl bakıldı:** her iş telefon yatayda (844 × 390) bir kez oynandı, tek koşu (23:25–23:37). Ölçülenler: 64 px'ten küçük dokunma hedefi, boş yere dokunuşa karşılık, boşta çalışan animasyon, 1 sn'yi aşan sessizlik, sayfa hatası. Çizimlere ayrıca dosyadan bakıldı (göl masalı 8 kare, ilk öykü 5 kare).

**Eksik kalanlar (bulgu değil, denetimin sınırı):**
- İngilizce dersi şarkı adımında, göl masalı seçim sayfasında kesildi; ikisinin de sonu (veda, sonuç) görülmedi.
- Hikâye Defteri ve Kelebeğin Kanadı gerçek adresle açılmadı, test kipiyle oynandı; bu ikisinde süre ölçümleri güvenilir değil.
- İngilizce dersi sırasında sayfa bir kez yeniden yüklendi (geliştirme sunucusu, başka oturumun dosya kaydı); oyunun kusuru değil.
- Sesin içeriği dinlenmedi; yalnız sesin çalıp çalmadığı ölçüldü.

Hiçbir işte sayfa hatası çıkmadı.

## En önemli beş bulgu

| # | İş | Bulgu | Kural |
|---|---|---|---|
| 1 | İngilizce dersi, Hikâye Defteri, göl masalı, Kelebek | Oyun alanı telefonda ekranın yarısından küçük; iki yanda boş alan kalıyor | 8 |
| 2 | Kelebek, Keşfet, Hikâye Defteri | Asıl dokunulan şeyler 64 px'in çok altında (34, 30 ve 44 px) | 8 |
| 3 | Keşfet, Kelebek, Hikâye Defteri | Boşta ekranda hiçbir şey kıpırdamıyor; boş yere dokununca karşılık yok | 5, 7 |
| 4 | Hikâye Defteri | Son hamleden "okudun" ekranına 8 sn | 6 |
| 5 | Top Parkuru | Telefonda Ceren'in yüzü ekran kenarında yarıdan kesik | 7 |

## 1) Deneyler · Top Parkuru (menü → Dersler → Deneyler)

Genel: denetlenenlerin en iyisi. Sessizlik yok, boş dokunuşta Kino karşılık veriyor, parçasız kolda top kaçıyor ve Kino gülüyor (kural 9 tamam), küçük hedef yok.

| Sayfa / adım | Ne görüldü | Kural | Önerilen düzeltme |
|---|---|---|---|
| Parkur, kurarken ve koşuda | Ceren sağ kenarda, yüzü yarıdan kesik; zil de kurarken kadraj dışında | 7 | Telefon kadrajını 60–80 px sağa aç ya da Ceren'i kadrajın içine al |
| Parkur, tepsi | Tepsideki rampa parçası ince sarı çizgi gibi, yaklaşık 70 px; ne olduğu zor seçiliyor | 8 | Tepsideki parçayı yuvadaki boyuna yakın göster |
| Menü, ana ekran ve Dersler | "Adını dinle" hoparlörleri 30 × 30, ebeveyn ayarı ve "Ana menü" 34 × 34 | 8 | Dokunma kutusunu 64 px'e çıkar (çizim aynı kalabilir) |
| Menü | Boşta animasyon yok, boş yere dokununca karşılık yok | 5, 7 | Kartlara hafif soluk alma; boş dokunuşta küçük parıltı |

## 2) İngilizce · ilk adanın ilk dersi (Çiftlik 1)

Ekran görüntüsü: `denetim-22/1-ingilizce-sarki.jpg`

| Sayfa / adım | Ne görüldü | Kural | Önerilen düzeltme |
|---|---|---|---|
| Hayvan geçidi ve şarkı | Sahne ekranın yaklaşık yarısı (415 / 844 px); iki yan boş, sahne ortada da değil (yaklaşık 54 px sağda) | 8 | Sahneyi telefonda yüksekliğe değil ene göre büyüt, ortala |
| Şarkı | Söz şeridinde vurgulanan kelime ("Neigh!") şeridin dışına taşıyor | 12 | Vurguyu şeridin içinde tut |
| Şarkı | Adım en az 60 sn sürdü; çocuk dokunmasa da ilerlemiyor (ölçüm 60 sn'de kesildi) | 6 | Şarkıyı kısalt ya da arada katılım iste (hayvana dokun, sırası gelen ses) |
| Şarkı | Sahnedeki hayvanlar 41 × 41 | 8 | Dokunulacaksa 64 px; sahne büyüyünce kendiliğinden çözülür |
| "Bul" adımının başı | Adım açıldıktan 1,3 sn sonra ekranda yalnız iki küçük karakter var, gerisi boş | 6 | Kartları adımla birlikte getir |
| Bütün adımlar | Geri ve "yeniden dinle" düğmeleri 52 × 52 | 8 | 64 px |

## 3) İngilizce · göl masalı (açılır kitap)

| Sayfa / adım | Ne görüldü | Kural | Önerilen düzeltme |
|---|---|---|---|
| Kitap sayfaları | Açık kitap telefonda ekranın yaklaşık %38'i; yanlar boş. Yakın anlar tam ekran ve iyi | 8, 10 | Kitabı telefonda ekran yüksekliğine kadar büyüt |
| 1. sayfa | Sayfada 39 sn kalındı. Söyle adımı mikrofonsuz ortamda geç düşmüş olabilir; gerçek cihazda bakılmalı | 6 | Mikrofon yoksa ya da ses gelmezse 3–4 sn'de kendiliğinden geç |
| Açılış | Polly sol üstte ekranın dışına taşmış, yalnız alt yarısı görünüyor | 7 | Polly'yi ilk kareden kadraja al |
| Kitap sayfaları | Dokunulan şapka 47 × 33, ördek 38 × 52 | 8 | Dokunma kutusunu çizimden büyük tut |
| Çizimler (dosyadan) | Kino, inek, şapka sayfalar arasında tutarlı; Kino'nun lekesi sağda, fular lacivert. Renkler çok doygun (canlı mavi göl, parlak yeşil) | 12 | Barış'ın gözüyle bakılmalı: "sıcak pastel"e göre fazla canlı olabilir |

## 4) Türkçe · Keşfet (B harfi, 4 yaş)

Ekran görüntüsü: `denetim-22/3-turkce-kesfet.jpg`

| Sayfa / adım | Ne görüldü | Kural | Önerilen düzeltme |
|---|---|---|---|
| İki kart | Dokunulacak harfler ("b a l o n") 30 × 44 | 8 | Harf kutularını 64 px yap |
| İki kart | Boşta hiçbir animasyon yok; balık ve balon donuk, Ceren küçük ve köşede | 7 | Resimlere hafif hareket, Ceren'e göz kırpma |
| İki kart | Boş yere dokununca ses ya da hareket yok | 5 | Küçük parıltı ve Ceren'den tepki |
| Harf rafı | Harf düğmeleri 67 × 57, "A ile başla" 128 × 34; ikinci sıra ekranın altında kesik | 8 | Düğme boyunu 64'e çıkar; rafı telefon boyuna sığdır |
| Harf rafı | İlk 4,7 sn ses yok | 6 | Ceren açılışta bir cümleyle karşılasın |

## 5) Türkçe · Hikâye Defteri, "Anne ile bahçe"

Ekran görüntüsü: `denetim-22/2-turkce-oyku-sayfa.jpg`

| Sayfa / adım | Ne görüldü | Kural | Önerilen düzeltme |
|---|---|---|---|
| Öykü sayfaları | Resim ekranın yaklaşık üçte biri; iki yan ve alt boş. Slayt görünüşü | 8, 10 | Resmi tam ekran ya da açılır kitap yap; cümle şeridi resmin üstünde |
| Öykü sayfaları | Sözcük düğmeleri 44 px yüksek | 8 | 64 px |
| Öykü sayfaları | Resme dokununca karşılık yok; açılışta hiçbir animasyon yok | 5, 7 | Resimde dokununca kıpırdayan bir şey (lale, Anne) |
| Bitiş | Son sıralama dokunuşundan "okudun" ekranına 8,3 sn (test kipi) | 6 | 2 sn'ye indir |
| Bitiş ekranı | Küçük bir kart ve onay düğmesi; ekranın çoğu boş | 8 | Bitişi büyüt, sıradaki öyküyü iri göster |
| Çizimler (dosyadan) | Anne beş karede tutarlı. 1–3. sayfada beş lale, 4. sayfada tek lale | 15 | Bilerek yapıldıysa sorun değil; değilse 4. sayfaya öbür laleler |

## 6) Matematik · Kelebeğin Kanadı (4 yaş)

Ekran görüntüsü: `denetim-22/4-matematik-kelebek.jpg`

| Sayfa / adım | Ne görüldü | Kural | Önerilen düzeltme |
|---|---|---|---|
| Kelebek | Benek yerleri 34 × 34 | 8 | 64 px; kelebek büyüyünce kendiliğinden çözülür |
| Kelebek | Kelebek ekran eninin yaklaşık %27'si; gökyüzü boş, Lokum küçük | 8 | Kelebeği ekran yüksekliğine yakın büyüt |
| Kelebek | Boşta animasyon yok (1 sn ve 3,5 sn'de sıfır); kelebek ve Lokum donuk | 7 | Kanat ve anten kıpırtısı, Lokum'a göz kırpma |
| Kelebek | Boş yere dokununca karşılık yok | 5 | Küçük parıltı, Lokum'dan tepki |
| Giriş | `?yenitur=kelebek` gerçek kipte Ceren'in şekil dersini açtı; tur yalnız test kipinde açıldı | — | Turun gerçek akışta hangi sırada geldiği ayrıca doğrulanmalı |
