# İngilizceye Merhaba · Yol haritası

20 Kasım 2026. Barış'ın isteği (19 Kasım): "İngilizce uygulaması başlı başına bir İngilizce uygulaması olsun; çocuğa İngilizceyi başlatan, sevdiren, her detayı olan dersleri, etkinlikleri olsun. Elit olsun, tekrar etmesin, sürekli yeni oyunlar ve görseller olsun."

Kural: her yeni oyun ve bölüm kendi yeni Astra çizimiyle gelir. Ses ElevenLabs'ten, her söz ayrı istekle. Yalnız `ingilizce/` ve kendi testleri. Menüde açma, kilit ve fiyat Barış'ın kararı.

## Elde olan

| Bölüm | Durum |
|---|---|
| Ana ekran: Dersler · Oyunlar · Kelimelerim · Büyükler için | var |
| 12 ada, 96 kelime, adada 9 ders, üç seviye (kelime · cümle · konuşma) | var, çizim ve ses tam |
| **13–24. adalar** (20 Kasım gece, Barış: "İçeriği doldur"): Meyve ve Sebze, Hava, Doğa, Evim, Okul, Duygular, Şekil ve Boy, Sofra, Park, Vücudum, Günüm, Sayılar ve Renkler 2 · 96 kelime, adada 9 ders, üç seviye, hikâye (`ingilizce/src/icerik3.ts`) | içerik ve ses hazır; çizimler Astra'da (Paket 17–22, `CIZIM-ISLERI.md`), geldikçe ada ada açılır |
| Seviye 1 oyunları: Tanış (4 açılış), Bul, Kino'ya Öğret, Balon, Ne Eksik, Obur, Eşleştir, Söyle, şenlik sahnesi | var |
| Adaya özel oyunlar: Kaç Tane? (sayılar), Polly Diyor ki (hareketler), Kapıda Kim Var? (ailem) | var |
| Seviye 2–3: Anlat (4 açılış), Hangisi?, Doğru mu?, Cümle Kur, Polly'nin Postası, Cümle Hafızası, Polly'nin Dürbünü, Say ve Koy, Sen Söyle, Soru–Cevap, Sen Sor, Hikâye, Sıraya Diz | var |
| Günlük sözler (How are you? …), Günün Tekrarı (akıllı tekrar), Fener Avı | var |
| Kelimelerim (ünite sekmeli albüm), Büyükler için | var |

## Hayvanlar (20 Kasım, Barış: "1. derste 10–15, 2. derste 30, 3. derste 100 hayvan")

Çiftlik adasının ilk üç dersi hayvan dersleri oldu: **1. ders 12 hayvan** (Hayvan Geçidi → Bul → şarkı → Söyle), **2. ders +18 = 30** (ısınma → Geçit → Balon → Söyle), **3. ders +70 = 100** (Hayvanat Bahçesi: deniz, kuşlar, böcekler, orman, vahşi doğa, yavrular). Oyunlar'da Hayvanat Bahçesi kartı (3. ders bitince açılır). Katalog `icerik.ts` → EK_HAYVANLAR (84), HAYVAN_DERSI_1/2, HAYVAN_BOLUMLERI.

## Sıradaki işler (önem sırası)

| # | İş | Neden | Çizim (Astra) | Ses | Ayrı oturuma verilebilir mi |
|---|---|---|---|---|---|
| 1 | ✅ **Kino'yu Giydir** (20 Kasım, açık) (Kıyafetler adasına özel oyun + Oyunlar bölümü) | Kıyafetler adası şimdi genel oyunlarla geçiyor; "Put on the hat!" komutuyla Kino giyinir, sonunda fotoğrafı çekilir | Paket 12: Kino gövdesi (2 kare), 8 giysi katmanı, dolap fonu | Polly 9 söz, Ceren 1 yönerge | hayır (ders akışına bağlı) |
| 2 | ✅ **Masal Kitaplığı** (20 Kasım, açık) (ana ekrandan: 12 hikâye rafta, dokunulan kitap okunur, sözcükler yanar) | Hikâyeler yalnız 9. derste bir kez görülüyor; çocuk sevdiği masalı yeniden dinlemek ister | Paket 13: kitaplık fonu, 12 kitap kapağı | var olan kayıtlar; kapak adları 12 söz | evet |
| 3 | ✅ **Polly'nin Şarkıları** (ilk şarkı "The Cow Says" 20 Kasım'da açık; müziği Barış Gemini'den üretir) (adaya bir halk tekerlemesi: Old MacDonald, Head Shoulders Knees and Toes, Wheels on the Bus, Five Little Ducks, If You're Happy …) | İngilizceyi sevdiren en güçlü araç; telifsiz halk şarkıları | Paket 14: şarkı sahnesi, adaya göre dans eden karakter kareleri | ElevenLabs müzik denemesi; Barış'ın kulak onayı şart | evet |
| 4 | **Polly'nin Ağaç Evi** · **veli oturumunda (21 Kasım 2026):** biten her ada eve iki durumlu bir eşya getirir; dokununca Polly eylem cümlesi söyler, puan/mağaza yok (`ekranlar/agac-evi.ts`, `agac-evi-veri.ts`) | Uzun süreli bağlılık: çocuk her gün geri gelir | Paket 24: fon, Polly 2 poz, kart, 24 eşya × 2 durum | 51 kayıt tamam | kod ve ses tamam, çizim bekliyor |
| 5 | **Renkli Kino** (renkler + kıyafetler birleşir: "Put on the red hat!") | 2. seviye cümleleri oyunlaşır | Paket 12'nin renk eşleri | 8 × 8 söz yerine kalıp | hayır (1'e bağlı) |
| 6 | **Büyükler için**: haftalık özet, öğrenilen kelimeler listesi, evde söyleyebileceği 3 cümle | Veli güveni ve satın alma kararı | yok | yok | evet |

Her iş bitince: tablette ve yatay telefonda oynanır, testlenir, görüntüsü yöneticiye ve Barış'a gider.
