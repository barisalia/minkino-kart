# ✅ ONAYLANDI (Barış, 2026-10-16: "tamam yapın ilkini")

İlk kitap onaylandı. Örnek kitap "Mino'nun Balonu" İPTAL. Bunun yerine onaylı metin kullanılacak:
**ekip/senaryo/KITAP-MINO-KINO.md → §2 "Kino Okula Başlıyor"** (kapak + 14 sayfa + ebeveyn sayfası).
- Metin, resim tarifi, "canlanan" anlar ve saklı uğur böceği her sayfada yazılı. Metni DEĞİŞTİRME; sorun görürsen CEVAP-01'e yaz.
- Yazım rehberi: ekip/senaryo/CAILLOU-KITAP-REHBERI.md.
- Kararlar: başlık "Kino Okula Başlıyor"; okul önlüğü VAR (açık mavi, yakalı); öğretmen ceylan "Ceren Öğretmen"; Bulut kömür siyahı yüzlü, bembeyaz kabarık yünlü utangaç kuzu (ilk kez çizilecek, önce tek karakter sayfası).
- Görsel çıta (Barış): "premium 2D vector illustration, glossy cartoon finish with soft highlights, high-end toddler picture-book style" + onaylı stil referansı (ekip/stil/onayli-stil-oda.png) + karakter sayfası (ekip/film/seri-2/karakter/v6/aile-model.png). Ucuz ikon/sticker görünümü reddedilir.
- Sıra: (1) Bulut ve Ceren Öğretmen karakter sayfaları + kapak → Barış'a göster, onay → (2) 14 sayfa resim + canlanan anlar için çok pozlu sayfalar → (3) kitap bileşeni ve bağlama.
- Her aşamanın sonunda CEVAP-01.md'ye yaz; Barış görmeden bir sonraki aşamaya geçme.

# Antigravity'ye iş: Uygulamaya "Kitaplar" bölümü (3D hisli kitap)

Gönderen: Yönetici Minkino (Claude). Tarih: 2026-10-16.
İletişim bu klasörden yürür:
- Senin cevapların, soruların ve teslimlerin: `ekip/antigravity/CEVAP-01.md`.
- Benim yeni isteklerim: `ISTEK-02.md` ve devamı.
- Barış da aradan iletir.

## Ne istiyoruz
Minkino uygulamasına (2-7 yaş, Türkçe, telefon öncelikli) yeni bir **Kitaplar** bölümü:
- **Kitaplık:** Kitaplar rafta ya da vitrinde düz 2D kapak olarak durur.
- **Kitabı alma:** Çocuk bir kitaba dokununca kitap öne gelir ve 3D hissi kazanır: sırt, sayfa kalınlığı, zemin gölgesi, hafif eğilme.
- **Okuma:** Kapak açılır. Sayfalar parmakla sürüklenerek ya da dokunarak çevrilir, kıvrılma ve gölgeyle gerçek kitap hissi verir.
- **Sesli okuma:** İsteğe bağlı. Sayfadaki metin anlatıcı sesiyle okunur, okunan kelime vurgulanabilir.
- **Canlı resimler:** Sayfadaki resimler ara ara canlanır: göz kırpma, kuyruk sallama, poz değişimi. İllüstrasyon bu iş için parçalı ya da çok pozlu üretilir.

Önce bu kitap bileşenini tek bir örnek kitapla kusursuz yapalım. Kitap içeriğini senarist yazacak; ilk deneme için aşağıdaki örnek yeterli.

## Teknik çerçeve (uyulması şart)
- Proje: Vanilla TypeScript + Vite, framework yok. Mobil paket Capacitor (iOS/Android).
- Her oyun bir klasör ve sayfadan oluşur (ör. `pazar/`, `kino-otobus/`, `pati/`; giriş `<klasör>/index.html` + `<klasör>/src/`). Sen `kitap/` klasöründe çalış. Sayfayı `vite.config.ts` içindeki sayfa listesine ekle.
- Menü kartı ekleme (`uygulama/src/oyunlar.ts`) ve uygulamaya bağlama işini ben (Claude) yaparım. Kod kitap/ içinde kendi başına çalışsın.
- Three.js gibi ağır bir kütüphane yerine önce **CSS 3D transform + Canvas/SVG** tercih et. Sayfa çevirme 60 fps olsun; hedef orta seviye Android telefon.
- Önce telefon:
  - Yatay 844x390 ve 667x375, dikey 390x844. DPR3'te kusursuz olsun.
  - Kitap yatayda açık iki sayfa, dikeyde tek sayfa olarak görünür.
  - Dokunma hedefleri büyük olsun (çocuk parmağı).
- Netlik kuralı: Hiçbir görsel kaynak çözünürlüğünün üstüne büyütülmez. Ekrandaki CSS boyu × 3 ≤ doğal piksel. Örnek: ekranda 400 px genişlikte bir sayfa resmi için kaynak en az 1200 px olmalı. Ortak yardımcı: `src/ui/netlik.ts`.
- Kişisel veri, analitik ya da üçüncü taraf SDK yok. Okuma ilerlemesi yalnız cihazda saklanır (localStorage).
- Ses: Uygulamanın ortak ses sistemini kullan (`src/audio/`). Ses algılama eşiklerine dokunma.
- Commit: main'e küçük parçalar halinde.
  - Mesajlar Türkçe (ASCII olabilir).
  - .webm, .mp4 ve `tests/screens` commit edilmez.

## Görsel stil (çok önemli, Barış'ın onaylı stili)
- Düz 2D çizgi film. Kalın, düzgün koyu çikolata kahvesi kontur (#3B2416). Düz sıcak pastel dolgular, renk başına en çok bir sert kenarlı gölge tonu.
- **Yasak:** doku, gren, gradyan, parlama, boyalı görünüm, 3D render, "yapay zekâ görünümü", görselde yazı ya da harf.
- Stil referansları (her Gemini isteğinde yükle):
  - `ekip/stil/onayli-stil-oda.png`
  - `ekip/stil/onayli-stil-banyo.png`
  - `ekip/stil/onayli-stil-ozet.jpg`
- Karakterler:
  - Mino: Mino model sayfaları `ekip/mino/`, motor `src/mino/`.
  - Kino ve ailesi: `ekip/film/seri-2/karakter/v6/aile-model.png`.
- Barış'ın beğendiği örnek: `ekip/gemini/yeni/pati/findik-hareket-sayfasi.png`. Tek görselde aynı karakterin 8 pozu, aynı ölçek, beyaz zemin. Animasyon için bu yöntemi kullan: çok pozlu sayfa, poz değişimi ve squash-stretch.
  - **Parça döndürme (kukla gibi kol/kafa çevirme) Barış tarafından 3 kez reddedildi, kullanma.**
- Çözünürlük: Gemini çıktısı en az 2752x1536. Daha küçük gelirse kullanma.

## Çocuk deneyimi kuralları (Barış'ın temel kuralları)
- "Şuna dokun" diye yönlendirme yok. Çocuk keşfeder: sayfada dokununca tepki veren gizli küçük sürprizler olsun.
- Okuma modu seçimi: "Bana oku" ya da "Kendim bakayım".
- Ebeveyn alanı (ör. kitap satın alma) varsa uygulamanın mevcut ebeveyn kapısı kullanılır.

## İlk teslim (prototip)
1. `kitap/` sayfası. İçinde 3 kitaplı bir raf, bir kitabın 3D açılışı ve 8 sayfalık örnek kitapla sayfa çevirme.
2. Örnek kitap: "Mino'nun Balonu" (geçici). 8 sayfa, her sayfada bir resim ve 1-2 cümle. Resimler Gemini'den, onaylı stilde. Senaristin metni gelince değişir.
3. 844x390 ve 390x844 telefon ekran görüntüleri ve 15 sn'lik bir sayfa çevirme videosu (videoyu commit etme).
4. `CEVAP-01.md`: ne yaptın, hangi dosyalar, kalan işler.

Sorun olursa CEVAP-01.md'ye yaz. Kolay gelsin!
