# Minkino kalite kuralları (bütün ekip, her işten önce oku)

Yönetici, 22 Kasım 2026 gecesi. Bu kurallar bugün Barış'ın reddettiği ya da düzelttirdiği işlerden çıkarıldı. Çıta: premium, elit, dünyanın en iyisi. Bunu tutmayan iş bitmiş sayılmaz.

## 0 · TEMEL KURAL: UCUZA KAÇMA (Barış, 23 Kasım 00:20)

Barış'ın sözü: "Görsel stiliniz, senaryonuz kötü değil. Sorununuz şu: ucuza kaçıyorsunuz. Hemen bitirip teslim etme derdindesiniz. Dünyanın en elit oyununu yapıyoruz; başka işi kabul etmiyorum, çöpe gidiyor."

- **Sınırsız zamanın varmış gibi çalış.** Sıra şöyle:
  1. Astra'dan bir kerede 100–200 kaliteli çizim ve animasyon karesi iste.
  2. Sahneyi ince ince kurgula.
  3. UI'ları hazırla.
  4. UI'ya animasyonları, tıklamaları, her ayrıntıyı kur.
- **Astra sınırsız üretiyor.** 3 çizim isteyip geçme. Her hareketin kendi animasyon karelerini, efekt parçalarını ve ara pozlarını iste. Oyun başına yüzlerce kare normaldir.
- **İlk çalışan hâl başlangıçtır, bitiş değildir.** Hep sor: "Bunu uzatayım mı? İkinci bölüm ekleyeyim mi? Buraya animasyon, efekt, UI ekleyeyim mi? Çocuk tıklayınca burada ne olsun?" Ve yap. Örnek: sabun yalnız sürüklenen bir resim olmaz. Köpürür, kabarcıklar büyüyüp patlar, köpük deride birikir, su akıp köpüğü götürür.
- **Ham hâli gösterme.** Ara video, ara görüntü, "tamam bitti" raporu yok. Bütünüyle elit olmayan işi yöneticiye "bitti" diye getirme; geliştirmeye devam et.
- **Zamanı işe harca.** Bir saatte bir görsel yapıp onun videosunu çekmek boş iştir.
- RAM sorunu yok; gerektiği kadar kullan.

## Çalışma biçimi

1. **Zamanı işe harca, kanıta değil (bkz. madde 0).**
   - Her adımda video ya da ekran görüntüsü çekme. Doğrulamayı kod içinde yap: tsc, birim testi, yalnız değişen özelliğin spec'i.
   - Video yalnız büyük bir iş bütünüyle bitince ve yönetici isteyince çekilir: bir kez, kısa, gerçek hızda, sesli.
2. Tam takım koşma, build alma. Ağır test aynı anda tek oturumda; kilidi yalnız koşu süresince tut.
3. Önce ekran seçeneği, sonra kod.
   - Yeni bir oyun ya da büyük bir bölüm için Astra'dan ekran örneği istenir; yön seçilmeden kod ve asıl çizim başlamaz.
   - Asıl çizimden önce bizim stilde tek bir stil anahtar karesi çizilir.
4. Akış kuralını değiştirmeden önce `KULLANICI-KURALLARI.md`'de eski kararı ara.

## Oyun hissi (Barış'ın "tak tak" kuralı)

5. Her dokunuşa 0 ms'de karşılık ver: ses, küçük canlanma, parıltı ve karakter tepkisi.
6. Boş bekleme yok.
   - 1 sn'den uzun sessizlik ya da hareketsizlik olmasın.
   - Açılışta çocuk 1 sn içinde ne yapacağını görsün.
   - Bitiş sevinci en çok 2 sn sürsün.
7. Karakterler aynı kadrajda canlı olsun: göz kırpar, tepki verir.
   - Donuk "çıkartma" karakter ve ayrı pencereye hapsedilmiş yüz olmaz.
   - Yakın planda da kimin iyileştiğini ya da sevindiğini görürüz.
8. Ekran dolu ve iri olsun.
   - Oyun alanı ekranın büyük kısmını kaplasın, parçalar iri dursun.
   - iPad 4:3'te de, telefonda da boş bant kalmasın.
   - Dokunma hedefi en az 64 px.
9. Yanlış cevaba ceza yok; yanlış hamle komik bir sonuç versin.
10. Masal ve hikâye slayt gibi olmaz.
    - Tam ekran ya da açılır kitap.
    - Her sayfada katılım: dokun, sürükle, söyle ya da seç.
    - Gerçek bir dert, merak ve bir gülme anı olsun.
    - İngilizce cümleler kısa ve gerçek olsun.

## Çizim ve stil

11. Görseli yalnız Astra üretir.
    - Kodla çizim yok, eski çizimi kırpma ya da yapıştırma yok.
    - Her sahne kendi çizimidir.
    - CSS ve canvas etkisi (parıltı, sarsıntı, ölçek) serbest.
12. Bizim stil: temiz 2D, ince koyu kontur, yumuşak düz renkler, sıcak pastel, tek yumuşak gölge. Parlak "sticker" görünüşü yok.
13. Karakterler model sayfasıyla birebir.
    - Kino'nun göz lekesi bize göre sağda; fuları lacivert.
    - Lokum pembe tulumlu. Baba'da ben yok.
    - Bulut boynuzlu keçi, Zıpzıp erkek tilki. Ceren açık kahve keçi, yeşil yelekli, turuncu fularlı.
    - Kadro geniş: Mila, Pamuk, Kuzu, Polly de var.
14. Yasaklar:
    - İnsan figürü yok; resim içinde resim ve insan biçimli oyuncak da dahil.
    - Çilek yok.
    - Kan, iğne, hap, bilye yok.
15. Bir hikâyedeki aynı karakter ve eşya her sayfada aynı olsun: inek hep siyah benekli, şapka hep fiyonksuz.
16. Gelen her çizimi %100 boyda aç: uzuvları say, modelle karşılaştır, kenarlara ve saçağa bak. Kusurlu çizim oyuna girmez; dosya adıyla Astra'ya geri yazılır.
17. Adlarda "Atölye" yok: Türkçe, Matematik, İngilizce, Deneyler.

## Teslim

18. Bitmiş saymadan önce kendine sor: "Barış bunu görse 'premium' der mi?" Demezse bitmemiştir.
19. Rapor kısa olsun: ne bitti, ne kaldı. Boş durum yazısı yazma.
