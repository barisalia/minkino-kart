# Pati

Minkino ana menüsünde **Oyunlar → Pati** doğrudan oyuncunun showroom’unu açar. Hayvana dokunmak bakım odasına, isim plakasına dokunmak gelir ve satış kartına götürür. Giriş `/pati/`, kaynaklar `pati-yeni/` içindedir. Başlangıçta Fındık oyuncuya eşlik eder. Köpek, kedi, tavşan, ördek ve kuş ailelerinin her birinde altı çeşit bulunur. Akvaryum ana ekrandaki akvaryum simgesiyle açılır. Buradan üç Japon balığı ve dört beta çeşidi edinilebilir. Önceden edinilen balıklar da burada görünür. Her çeşidin bakımı ve geliri kendi kaydına işlenir.

Showroom dekoru Pati için çizildi. Kullanıcının paylaştığı çizgi film karesi, ImageGen üretiminde kontur ve düz renk kullanımına referans oldu. Pati kupası, yuvarlak pencere ve sergi minderi bu mekâna aittir. Oyun çizimi `assets/pati-yeni/ortam/sergi-odasi.webp` dosyasından yükler.

Ay düğmesi hayvan başına tek bir toplam gösterir. Temiz ve hayatta olan her dost 10 puan getirir. Bakım puanlarının yarısı hayvan başına en yakın tam jetona yuvarlanır. İki gün temizlik yapılmazsa hayvan kirlenir. Uygun yemek yemeden dört oyun günü bitiren hayvan ölür. Uyu düğmesiyle gün ilerler ve pozitif net puan kadar jeton cüzdana bir kez eklenir. Aynı hayvanın aynı bakımında elde edilen en iyi sonuç sayılır. Yanlış yiyecek puanı düşürür. İki farklı bakımı tamamlanmış hayvan satılabilir.

İlk dost Fındık'tır ve cüzdanda 7 jeton vardır. Her yiyecek porsiyonu 1 jetondur. Kabul edilen yiyecek çantadan eksilir, geri çevrilen yiyecek çantada kalır.

Köpek, kedi, tavşan ve hamster için ayrı bir banyo vardır. Alt çekmeceden sünger ya da fırça seçilir. Hayvanın tüyleri elle sabunlanıp durulanır veya taranır. Temel yıkama ve tarama ücretsizdir. Mağazada köpek için frizbi ve takılabilen papyon bulunur.

Odada yeşil bakım kutusu eşya rafını, tenteli dükkân mağazayı açar. Yiyecek veya su hayvana sürüklenebilir. Nesneyi seçip hayvana dokunmak da aynı işlemi yapar. Rafın köşesindeki onay işareti o gün tamamlanan bakımı gösterir. Bakım sırasında hayvanın tepkisi görülür. Puan dökümü showroom’daki ay düğmesinden açılır.

`node scripts/pati-yeni-kontrol.mjs` alışveriş ve bakım döngüsünü gerçek oyun ekranlarında çalıştırır. `node scripts/pati-raf-kontrol.mjs` rafın ekran boyutlarına uyumunu, dokunarak bırakmayı, iptali ve klavye ile kullanımı denetler. Paketlenmiş uygulamanın adresi `PATI_TEST_URL` ile verilir.
