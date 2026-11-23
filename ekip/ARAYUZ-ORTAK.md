# Arayüzü geri getirme — ortak çalışma

## 2026-11-06 — Codex → Claude
Barış iki referans görseldeki yatay arayüzü geri istiyor. Aynı klasörde çalıştığımızı doğruladı. İletişimi bu dosyanın sonuna tarih ve isimle ekleyelim; diğerinin notunu silmeyelim.

- Codex üstleniyor: yeni `uygulama/src/yatay-menu.ts`, `uygulama/src/yatay-menu.css`; ana menü ve kategori gezintisi. `uygulama/src/main.ts` içinde yeni menüyü bağlayacağım. Bu dosyaları eşzamanlı değiştirmeyelim.
- Claude'a önerilen görev: referanstaki kategori simgelerini mevcut çizimlerden bulmak/iyileştirmek ve film katalog ekranını aynı yatay mavi/krem tasarıma uyarlamak (`film/src/katalog.ts` ve ilgili CSS). Başlamadan dosya sahipliğini buraya yaz.
- Hedef: mavi zemin, koyu kontur, 2×2 mor Etkinlikler / kırmızı Kitaplar / sarı Oyunlar / yeşil Çizgi Filmler. Kategoride solda dört sekme, krem panelde üç sütun kapak; üstte logo, geri, yaş, ayarlar.
- Mevcut klasörde `.git` yok. Dosyalar silinmeyecek; eski menü uygulanışı saklanacak. Henüz Claude'dan yanıt alınmadı.

## 2026-11-06 — Codex, güncel stil kararı
Barış yeni Mino/Kino referansları verdi: temiz 2D vektör görünümü, kalın koyu kontur, düz canlı renk, minimum gölge; 3D/parlak plastik/doku istenmiyor. Eski rehberdeki glossy tarifi bu iş için geçerli değil. Dört kategori ikonunu Codex SVG çiziyor: assets/uygulama/kategoriler/. Claude ikon dosyalarını değiştirmeden önce buraya yazsın.


## 2026-11-06 — Codex, uygulama durumu
Ana menü yeni yatay-menu.ts/css üzerinden çalışıyor; eski ekranlar.ts korunuyor. 4 SVG ikon assets/uygulama/kategoriler içinde çizildi. Film kategorisi mevcut kapaklar ve film oynatıcı bağlantılarıyla çalışıyor; film/src dosyaları değiştirilmedi. Ana menü telefon uygulamasında yatay (src/kabuk/yon.ts), ilgili yön testleri güncellendi. Kitaplar kategorisi talep edildiği için KITAP_MENUDE açıldı; mobil derlemeye kitap sayfası dahil edilir. Yaş rozeti şimdilik menü tercihidir, oyunların kendi yaş ayarlarını değiştirmez. Kategori dönüşü sessionStorage ile korunur.
Barış: Kino ile Mino’nun hikâyesi ürünün temelidir. Referans: https://www.youtube.com/watch?v=YgFr32-mNog&t=14s — araçla video açılamadı, içerik izlenmedi. Yeni paylaşılan kapaklar düz 2D karakter görünümü için esas.
Kontrol: build geçti; 999 birim testi geçti, 1 atlandı (iki işçiyle). scripts/yatay-menu-kontrol.mjs menü/sekme/kapak/yaş kaydı ve telefon yatay/tablet/dikey uyumu doğruluyor. tests/screens/yatay-*.png çıktıları var. Claude henüz bu dosyaya cevap vermedi.

- 2026-11-06 Codex: Oyun kartları eski menünün gerçek katmanlı çizimlerine bağlandı (ekranlar.ts kartResmi artık export). Böylece Pasta Otobüsü, Mino/Kino Ne Giysin ve Sesli Maceralar yalnız arka plan/kategori simgesiyle görünmüyor. Yeni menü kartResmi kullanıyor. Pati, Restoran ve Orman bayrakları değiştirilmedi.
