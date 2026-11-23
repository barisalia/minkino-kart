# Matematik denetimi · 23 Kasım 2026 gecesi

Denetçi: Claude (Matematik/Deney). Ölçüt: `ekip/KALITE-KURALLARI.md`, özellikle madde 0 ("ucuza kaçma").

**Nasıl bakıldı:**
- Betik, her adımı iPad (1024 × 768) ve telefon (844 × 390) yatayda gezdi. Görüntü ya da video alınmadı.
- Betik: `scratchpad/mat-denetim/denetle.mjs`, `rapor.mjs`. İlerleme için, ipucu alan hedefe dokunuyor; yoksa o ekranda en az dokunulana. Yazma adımında rakamın yolunu izliyor.
- Her ekran durumunda (ders + etkinlik + adım) ölçülenler:
  - boşta 3,5 sn: koşan animasyon ve karakterin kıpırdayıp kıpırdamadığı;
  - en uzun sessiz ve hareketsiz an;
  - 64 px'ten küçük hedef (görünmez genişletme denenerek);
  - telefonda oyun alanının ekran payı;
  - boş yere ve her dokunuşa 350 ms içinde tepki;
  - üstü örtülü hedef;
  - CSS ile kaydırılan tek resimler.
- Girişler:
  - Ceren'in altı dersi (Sayılar, Toplama, Şekiller, Örüntü, Ölçü, Onluk); test kipinde, seslendirme hızlandırılmadı.
  - Bahçe Şenliği yolu (test kipi; M8 çizimleri yok).
  - Tezgâh ve dört oyuncağın turları (üretim kipi, dersler bitmiş sayıldı, abonelik açık).
  - Top Şelalesi (eski misket).
  - Kelebeğin Kanadı (test kipi, zorlanan tur).

**Denetimin sınırları:**
- Oyuncak turlarında bot ilk turlarda takıldı; sürükleyerek kurulan işler var (Sayı masasının kulesi, Fener tiyatrosu, Ölçü'nün taşları). Bu yüzden turların çoğu yalnız ilk ekranıyla ölçüldü.
- Onluk dersinin abaküs adımı ve Şekiller dersinde telefondaki daire çizimi geçilemedi (sürükleme ve şekil izleme).
- Sesin içeriği dinlenmedi; yalnız çalıp çalmadığı ölçüldü.
- "Oyun alanı payı" kaba bir ölçü: sahnedeki görünür parçaların birleşik kutusu; arka plana çizilmiş nesne sayılmaz (Ölçü'nün taş turunda %9 çıkması bu yüzden belirsiz).
- 64 px halkası tam 64 olan hedefleri betik kenarından ölçtüğü için "küçük" sayıyor. Örnek: Sayılar'ın 52 px görünüp 64 px dokunulan rakamları, Kelebek'in benek yerleri. Aşağıda bunlar ayrıca belirtildi.

## En önemli bulgular (düzeltmeden önce)

| # | Nerede | Bulgu | Kural | Durum |
|---|---|---|---|---|
| 1 | Altı dersin hepsi, iki cihaz | Ceren boşta donuk; açılışta hiçbir şey kıpırdamıyor; soru anlarında 1,2–3,3 sn sessiz ve durgun | 6, 7 | Düzeltildi (Ceren nefes alır; göz ve tepki kareleri Harf-A1'le) |
| 2 | Top Şelalesi | Bilye (misket). Raylar telefonda 15–18 px yüksekliğinde çizgi, boş bağlantı 8 px; ray kurarken 5,6 sn sessiz ve durgun; boş dokunuşa tepki yok | 14, 8, 6, 5 | Düzeltildi (iri top, dokunma çizgisi ~64 px, boşta kıpırtı, boş dokunuşa hop) |
| 3 | Ders sıra düğmeleri | 34–60 px (Sayılar'da on rakam telefonda 34 px) | 8 | Düzeltildi (64 px; on rakam 52/56 px + 64 px halka) |
| 4 | Sayılar dersi telefonda | Oyun alanı ekranın %29–39'u; sayılan nesneler 45 px | 8 | Düzeltildi: sıra iri, nesneler %25 iri, halka 64 px; ölçü %52–70 |
| 5 | Turlar | Karakterlerin yalnız iki pozu; rakamlar ve nesneler tek resim, CSS'le kayıyor; doğruda yazı karakteriyle yıldız | 0, 7, 11 | Kod hazır, kareler Paket Matematik-A1'de (272 kare) |
| 6 | Şekil evi (Baba'nın Takım Çantası, Şekil Bahçesi) | Baba ve Kino donuk | 7 | A1'de (`-goz`, `-bos`, `-saskin`) |

## Açık kalanlar

- **Yan yana farklı iş yapan küçük hedefler** (önceki denetimin kararı: genişletilmez, Astra yerleşimine bağlı):
  - Sayı masası kulesinin raf kutuları telefonda 38 px;
  - Baba'nın Takım Çantası parçaları 51 px;
  - Top Şelalesi'nin bir birimlik ray yuvaları telefonda 48 px genişlik (on göz yan yana).
  - Çözüm önerisi: telefonda kamera boşluğa yaklaşsın (koşudaki kamera gibi) ya da raf iki sıraya insin. Ayrı bir iş.
- **Telefonda oyun alanı:**
  - Tezgâh %36: dört oyuncak yan yana, genişlik sınırlı.
  - Oyuncak turları %30–41: 16:9 sahne ve fon yerleşimi.
- **Çizimsiz dersler:** Karşılaştır ve Ölç (M4), Örüntü (M5), Sayılar 11–20 (M6), Toplama (M7), Bahçe Şenliği yolu (M8). 20 Kasım'dan beri Astra'da; denetim yer tutucularla yapıldı.
- **Çilek dosyası:** `assets/matematik/cilek.webp` diskte duruyor (kodda kullanılmıyor; çilek yasağı). Silinmesi yöneticinin kararı.
- **"Büyükler için" düğmesi** telefonda 44 px: yetişkin düğmesi, bilerek küçük.

## Bu gece düzeltilenler (kod; çizim beklemeden)

| Bulgu | Nerede | Düzeltme | Dosya |
|---|---|---|---|
| Ceren boşta donuk; açılışta ve soru anlarında hiçbir şey kıpırdamıyor (1,2–3,3 sn sessiz ve durgun) | Altı dersin hepsi, iki cihaz | Ceren her derste nefes alır. Harf-A1'in göz katmanları gelince 2,6–5,4 sn'de bir göz kırpar. Yanlışta "düşünme", alkışta sahnedeki rakam ve nesneler de sevinir (kareler gelince). | `ders-iskelet.ts`, `ceren-ders.css` |
| Ders sıra düğmeleri 34–60 px | Sayılar (10 rakam), Toplama, Şekiller, Örüntü, Ölçü, Onluk | Dört-altılık sıralar en az 64 px. Sayılar'ın on rakamı iPad'de 56 px + 8, telefonda 52 px + 12 aralık; dokunma halkaları komşusuna binmez. Telefonda dünya biraz iner, sıra Ceren'in boynuzlarının üstünde kalır. | `ceren-ders.css`, `ders-sekiller.css` |
| Derste dokunulan nesneler 38–55 px (armut, elma, boncuk, abaküs telleri ve boncukları, yolcular) | Sayılar, Onluk, Toplama | Ders düğmelerinin hepsine görünmez halka: en az 64 × 64. Halka düğmenin kendisine bağlı (`contain: layout`), yerleşim değişmez. Telefonda sayılan nesneler %25 iri. | `ceren-ders.css` |
| Bilye (misket) | Ölçü · 5+ parkur | İri top: yarıçap 13,5 → 22. Rayın üstünde, normali boyunca yuvarlanır; dönüşü yarıçapına göre. Çizimi A1'de (`top-selalesi/top`). Ad "Top Şelalesi"; dört Ceren sözü "top" diye yeniden kaydedildi (Scribe birebir). | `misket-cizim.ts`, `misket-hareket.ts`, `misket.ts`, `sozler.json` 89·91·92·93 |
| Raylar ve boş bağlantılar telefonda ~50 px; giriş düğmesi 44 px | Top Şelalesi | Görünmez dokunma çizgisi 80 → 104 birim (telefonda ~64 px; katlar 127 birim arayla çakışmaz); giriş ve devam düğmesi en az 64 px. | `misket.ts`, `misket.css` |
| Ray kurarken 5,6 sn sessiz ve durgun; boş dokunuşa tepki yok | Top Şelalesi | Raftaki top boşta nefes alır; boş yere dokununca hopalar ve "damla" sesi; yardım 6,5 sn yerine 3,5 sn sonra. | `misket.ts`, `misket.css` |
| Doğruda yıldızlar yazı karakteri (★) | Bütün turlar | A1'in yıldız patlaması (`efekt/yildiz-0…2`) gelince onun yerine geçer; yanlışta pof bulutu (`efekt/pof`), boş dokunuşta pırıltı (`efekt/nokta`). | `cila.ts`, `main.ts` |
| Karakterlerin yalnız iki pozu var; nesneler ve rakamlar tek resim, CSS ile kayıyor | Turlar ve dersler | Genel kare bağlayıcı: `<resim>-goz` göz kırpar, `-saskin` yanlışta, `-sevinc` doğruda, `-hop-0…2` dokununca, `-bos-0…1` boşta. Kare gelince kendiliğinden; resmin yalnız kaynağı değişir. | `a1-kareler.ts` (yeni), `main.ts` |

## Kapanış · 23 Kasım sabahı (04:40–08:55; tur denetimi dört kez, son ikisi yeni kodla)

**Ölçek:** 73 tur, telefon (844 × 390). Temiz tur sayısı:
- ilk koşu: 0;
- ikinci koşu: 23;
- üçüncü koşu: 29;
- 39 turun yeniden ölçümü (08:55): 32.

Kalan 36 turda tek bulgu var: telefonda alan payı %42–59 (aşağıda). Öteki 5 turda yalnız ölçüm kalıntıları kaldı.

| Bulgu (denetimde) | Durum | Ne yapıldı | Dosya |
|---|---|---|---|
| Telefonda oyun alanı %30–41 | Büyük ölçüde kapandı | Telefon kamerası: sahne, oyun parçalarını (resim, düğme, yazı, boyalı kutu, fonda çizili oyun yeri) ekranı dolduracak kadar büyür ve kayar. Kırpmaz; sürükleme 1:1 kalır; iPad'de kapalı. Resimlerin saydam payı sayılmaz; nefes alan pozda pompalamaz; sahneden çıkan karakteri izlemez. | `telefon-kamera.ts`, `stil.css` |
| Panodaki soru sayısı telefonda ekranın üstünden kesik (Sayı masası) | Kapandı | Yazılar da kameranın kutusunda | `telefon-kamera.ts` |
| Kaydırak: arkadaşlar ekran dışındaki kaydırağa yürüyordu | Kapandı | Fonda çizili kaydırak `.tk-alan` ile bildirildi; Mutfak/Kaydırak %36–49 → %58–78 | `main.ts` |
| Apartman %16, İstasyon %21 | Kapandı | Bina ve tren boyu oyun yeri olarak bildirildi | `main.ts` |
| Kule turu: kule büyürken kamera zıplıyor | Kapandı | Kulenin üstündeki 3 katlık boşluk oyun yeri | `sayi-oyuncaklari.ts` |
| KESİK (kek, iki kâse, saklambaç, kaydırak) | Kapandı | Kesikler gerçek değil: saydam pay ya da saklanma kutusu (betik artık opak kısmı ve ata kırpmasını ölçüyor); kaydırak gerçekti, düzeldi | `main.ts`, betik |
| Boşta hareketsiz: Manav, Ay tangramı, tur sonu hatıra ekranı | Kapandı | Manavda meyveler sırayla kıpırdar; tangramda aranan şekil sallanır, parçalar nefes alır; hatıra ekranı aşağıda | `stil.css`, `tangram.css` |
| Kelebek benek yerleri 21–46 px, bitişik | Kapandı (dokunuş) | Kanada dokunuş 70 px içindeki en yakın boş yere gider; doğru parıltısı orada | `main.ts` |
| Doğruda yazı karakteri yıldız (★) | Kapandı | CSS ile çizilmiş ışıklı beş köşe + ışık halkası; A1 karesi gelince o | `cila.ts`, `stil.css` |

**Premium cila (Barış "premium" der mi?):**
- Tur sonu hatıra ekranı: kart zıplayarak gelir, arkasında dönen ışık huzmeleri, üç parıltı dalgası, boşta süzülür; karta dokununca hoplar. Telefonda kamera kartı büyütür.
- Oyuncak açılış geçişi (menü → tur), kamera yaklaşması, Hızlı Gözler penceresi telefonda geniş.

**Açık kalan (tek tür): 36 turda telefon alan payı %42–59.**
- Bu turlarda içerik ekranın boyunu zaten dolduruyor: en düşük anda boyun %82–99'u.
- Payı düşüren, dikey düzenin (üstte pano, altta tezgâh) dar kalan eni: ekran eninin %33–70'i. İki yan fon.
- Kamera kırpmadan daha fazla büyütemez.
- Klasik masada telefonda tezgâh yukarı alındı (boy %82 → %78) ve kamera ekran genişliğine büyüyor; birkaç turu %60'ın üstüne taşıdı.
- En dar olanlar:
  - Şekil masası iki parça (en %37);
  - Çayır, balonlar göğe çıkıyor (%33);
  - Ay tangramı (%33);
  - Ölçü masası taş anı (%22–29; ölçülen kısa an).
- Kalıcı çözüm, düzeni telefonda yataya yaymak: pano solda, tezgâh sağda. Ortak iskelette (`.pano`/`.tezgah`) yapılabilir, ama 36 turun her birinin yerleşimini görerek denemek gerekir. Sabaha yetişmedi; ayrı iş olarak öneriyorum.

**09:00 · yönetici kararıyla telefon yerleşimi (yalnız telefon yatay, iPad aynı):**
- Klasik masa turlarında tezgâhın parçaları ortada kümelenmez: tezgâh boyunca yayılır ve irileşir (141 → 215 px). Panonun içeriği de yayılır.
- Kural: `stil.css` sonu, `[class='tezgah']`/`[class='pano']`.
- 36 turun yeniden ölçümü: her turun en iyi ekranı %42–64'ten %64–89'a çıktı. Örnekler: Şekil masası %80–88, Liman %77, Sayı masası %89.
- Hâlâ %60 altında kalanlar her turun bir iki anı:
  - turun ilk ekranı (kamera oturmadan önceki an);
  - Baba'nın atölyesi (%42);
  - Ölçü masasının taş anı (%20–41);
  - Çayır (%32–42);
  - Ay tangramı (%32);
  - Fener tiyatrosu (%55).
- Kesik çıkan tek parça: Sayı masasının açılış anında "daire" (kamera oturunca ekranda).

**Sonraki tur (not):**
- Özel düzenleri (Çayır, tiyatro, Baba'nın atölyesi, Ölçü taşları, tangram) telefonda yataya yaymak; her biri kendi sınıfında.
- Kameranın ilk ölçüsünü ekran kurulurken hemen yapmak (açılış anı).

**13:00–16:20 · telefon yerleşimi ikinci tur (yalnız telefon yatay, iPad aynı):**
- **Kamera:** İçerik köşe düğmelerine değmiyorsa üstteki 60 px'lik şerit ayrılmıyor. İlk ölçü ekranın ilk karesinde alınıyor. Kenar payı 3 px.
- **Ölçü masası yan yana:** solda kurdele ve iki kat iri taşlar, sağda taş kaynağı. Bu turlarda alan %20 → %60 üstü.
- **Dikey sıkılaştırma** (sahne boyunun %85–87'si → ~%80, kamera ekran genişliğine büyür):
  - Fener tiyatrosu ve Müzik köşesi;
  - Şekil bahçesi tabelası;
  - Baba'nın atölyesi: Baba biraz aşağı, kutular ayrık.
- **Hatıra kartı** telefonda iri.
- **Temiz tur:** 73 turdan 53.
- **Kalan 15 turda telefon alanı en düşük anda:**
  - Çayır, gökyüzüne çıkan balonlar: %37–42.
  - Kek fırını: %49–50. Annenin pozu sahne tabanına değiyor; pano fonda çizili.
  - Kaydırak, kesme tahtası, Ay tangramı: %40–65 arası, bir iki an.
  - Kalan 10 tur %56–59: elma bahçesi, babaanne mutfağı, piknik, liman, resim masası, iki masa ekranı, bir ölçü masası, manav.
- **Testler:**
  - Telefonda değişen 5 spec: 83 geçti. İki test yükleme kararsızlığıyla düştü, yeniden koşuda ikisi de geçti.
  - İki cihazdaki koşu bu turun ilk kısmından önce: 170/170.
  - Birim (kamera) 6/6.

**Bilerek bırakılan, ölçüm kalıntısı:**
- Top Şelalesi rayları 15–18 px: SVG kutusu görünmez 104 birimlik dokunma çizgisini saymıyor (telefonda ~64 px).
- Fındık, elma, tahterevalli küpleri 44–58 px: eşdeğer hedefler (hangisine dokunulsa aynı iş) ve 64 px halkalı; komşu halkalar üst üste binince betik "küçük" sayıyor.
- Tangram ince parçaları: 36 px içinde en yakına oturma var.

**Testler (sabah):**
- tsc temiz.
- Birim: telefon kamerası 5/5, A1 kareleri 3/3.
- e2e, worker 1, iki cihaz: telefon-kamera, yeni-turlar, konum-sira, yaş ve matematik.spec dosyalarında 156 geçti.
- 14 hata vardı. Hepsi iki eski kusurdan geliyordu, düzeltildi:
  - Spec'in yol oyuncusu Saklambaç ve Kaydırak turlarını bilmiyordu.
  - Hatıra testi "adım 9 son tur" sayıyordu.
- Yeniden koşu: Şekil ve Fener yolları 3–5 yaş, iki cihaz 12/12; hatıra testi 2/2.

## Ayrıntı · düzeltmeden önce (23 Kasım 03:03–03:52)

### misket
- Gezilen: ipad 4 ekran, takıldı: mk-makine · kur; telefon 4 ekran, takıldı: mk-makine · kur
- 64 px altı: N. sıradaki N. rayı çıkar (ipad 23, telefon 15); N. sıra N. boş bağlantı (ipad 13, telefon 8); Hazır parkuru tamamla (ipad 52, telefon 44); Kendi parkurunu kur (ipad 52, telefon 44); Diğer ölçü oyunlarına geç (ipad 47, telefon 44); Top Şelalesi parkurunu aç (ipad 47, telefon 44); Topu başlangıç çanağına koy (telefon 52); Kırmızı kolu çek ve topu gönde (telefon 48); Bir birimlik kısa ray (telefon 56); İki birimlik düz ray (telefon 60); İki birimlik müzikli vadi (telefon 60); Üç birimlik çember (telefon 60); Mavi topu al (telefon 47); Son ray değişikliğini geri al (telefon 54)
- Boşta hiç hareket yok: mk-makine · dustu; masa · pano
- 1 sn'den uzun sessiz ve durgun: mk-makine · kur 5.6 sn (ipad); mk-makine · kur 5.6 sn (telefon)
- Boş dokunuşa tepki yok: mk-makine · kur
- Telefonda oyun alanı %50'den küçük: masa · pano %37

### olcu
- Gezilen: ipad 12 ekran; telefon 12 ekran
- 64 px altı: büyük ve küçük (ipad 51, telefon 44); uzun ve kısa (ipad 51, telefon 44); çok ve az (ipad 51, telefon 44); ağır ve hafif (ipad 51, telefon 44)
- Boşta hiç hareket yok: cd-dunya · buyuk-kucuk/giris; cd-dunya · uzun-kisa/tanit; cd-dunya · cok-az/tanit
- Donuk karakter: ceren (cd-dunya · buyuk-kucuk/giris); ceren (cd-dunya · buyuk-kucuk/tanit); ceren (cd-dunya · uzun-kisa/tanit); ceren (cd-dunya · cok-az/tanit); ceren (cd-dunya · agir-hafif/tanit)
- 1 sn'den uzun sessiz ve durgun: cd-dunya · buyuk-kucuk/soru-0 2.0 sn (ipad); cd-dunya · buyuk-kucuk/soru-1 1.5 sn (ipad); cd-dunya · uzun-kisa/soru-0 1.3 sn (ipad); cd-dunya · uzun-kisa/soru-1 2.2 sn (ipad); cd-dunya · cok-az/soru-0 1.7 sn (ipad); cd-dunya · buyuk-kucuk/soru-0 1.9 sn (telefon); cd-dunya · buyuk-kucuk/soru-1 1.6 sn (telefon); cd-dunya · uzun-kisa/soru-0 1.3 sn (telefon); cd-dunya · uzun-kisa/soru-1 2.2 sn (telefon); cd-dunya · cok-az/soru-0 1.8 sn (telefon)

### onluk
- Gezilen: ipad 5 ekran, takıldı: cd-dunya · abakus/abakus; telefon 5 ekran, takıldı: cd-dunya · abakus/abakus
- 64 px altı: Boncuk (ipad 44, telefon 44); onluk (ipad 51, telefon 44); on üç (ipad 51, telefon 44); abaküs (ipad 51, telefon 44); yirmi (ipad 51, telefon 44); Üst tel: onluklar (ipad 46, telefon 38); Alt tel: birlikler (ipad 46, telefon 38)
- Boşta hiç hareket yok: cd-dunya · onluk/giris; cd-dunya · abakus/abakus
- Donuk karakter: ceren (cd-dunya · onluk/giris); ceren (cd-dunya · abakus/abakus)
- 1 sn'den uzun sessiz ve durgun: cd-dunya · onluk/diz 3.2 sn (ipad); cd-dunya · onluk/diz 3.3 sn (telefon)
- CSS ile kayan tek resim (çizilmiş kare adayı): rakam-1+rakam-0

### oruntu
- Gezilen: ipad 9 ekran; telefon 9 ekran
- 64 px altı: renk örüntüsü (ipad 51, telefon 44); şekil örüntüsü (ipad 51, telefon 44); ses örüntüsü (ipad 51, telefon 44); kendi örüntün (ipad 51, telefon 44)
- Boşta hiç hareket yok: cd-dunya · renk/giris; cd-dunya · kendi/hatira
- Donuk karakter: ceren (cd-dunya · renk/giris); ceren (cd-dunya · renk/tanit); ceren (cd-dunya · sekil/tanit); ceren (cd-dunya · ses/tanit); ceren (cd-dunya · kendi/kendi); ceren (cd-dunya · kendi/hatira)

### sayilar
- Gezilen: ipad 8 ekran, takıldı: cd-dunya · birlikte; telefon 8 ekran, takıldı: cd-dunya · birlikte
- 64 px altı: N (ipad 47, telefon 34); armut, N (ipad 55, telefon 45); Masaya bir boncuk koy (ipad 55, telefon 45); elma (ipad 55, telefon 45)
- Boşta hiç hareket yok: cd-dunya · giris; cd-dunya · birlikte; cd-dunya · sen
- Donuk karakter: ceren (cd-dunya · giris); ceren (cd-dunya · yaz); ceren (cd-dunya · birlikte); ceren (cd-dunya · sen)
- Telefonda oyun alanı %50'den küçük: cd-dunya · giris %29; cd-dunya · tanit %29; cd-dunya · cerenSayar %34; cd-dunya · aferin %29; cd-dunya · birlikte %33; cd-dunya · getir %39
- CSS ile kayan tek resim (çizilmiş kare adayı): rakam-1; elma; rakam-2

### sekiller
- Gezilen: ipad 10 ekran; telefon 10 ekran
- 64 px altı: daire (ipad 51, telefon 44); kare (ipad 51, telefon 44); üçgen (ipad 51, telefon 44); dikdörtgen (ipad 51, telefon 44)
- Boşta hiç hareket yok: cd-dunya · daire/giris; cd-dunya · dikdortgen/tanit; cd-dunya · kare/tanit
- Donuk karakter: ceren (cd-dunya · daire/giris); ceren (cd-dunya · dikdortgen/tanit); ceren (cd-dunya · dikdortgen/hatira); ceren (cd-dunya · kare/tanit)
- CSS ile kayan tek resim (çizilmiş kare adayı): daire; kare; ucgen; hatira-sekil-kutusu; dikdortgen

### tezgah
- Gezilen: ipad 1 ekran; telefon 1 ekran
- 64 px altı: üst düğme: Büyükler için (ipad 61, telefon 44)
- Telefonda oyun alanı %50'den küçük: atolye-tezgah · atolye-tezgahi %36
- CSS ile kayan tek resim (çizilmiş kare adayı): atolye-sayi; atolye-sekil; atolye-olcu; atolye-fener

### toplama
- Gezilen: ipad 13 ekran, takıldı: cd-dunya · eksik/eylem; telefon 13 ekran, takıldı: cd-dunya · eksik/eylem
- 64 px altı: bir fazla (ipad 51, telefon 44); beşe tamamla (ipad 51, telefon 44); eksilme (ipad 51, telefon 44); ona tamamla (ipad 51, telefon 44); köpek (telefon 63); penguen (telefon 63); koala (telefon 63); ayıcık (telefon 63); kedi (telefon 63)
- Boşta hiç hareket yok: cd-dunya · fazla/giris; cd-dunya · doldur/eylem; cd-dunya · eksik/sor
- Donuk karakter: ceren (cd-dunya · fazla/giris); ceren (cd-dunya · doldur/eylem); ceren (cd-dunya · doldur/dogru); ceren (cd-dunya · eksik/sor)
- 1 sn'den uzun sessiz ve durgun: cd-dunya · on/sor 1.0 sn (telefon)
- CSS ile kayan tek resim (çizilmiş kare adayı): rakam-2; rakam-3; rakam-4

## Ayrıntı · düzeltmeden sonra (23 Kasım 03:54–04:15, yeni kodla)

Sıra rakamları (52/56 px) ve sayılan nesneler (55–56 px) görünür ölçüdür; dokunma halkaları 64 px (betik kenarı ölçtüğü için listede kaldılar).

### kelebek
- Gezilen: ipad 2 ekran; telefon 3 ekran
- 64 px altı: Benek yeri N (ipad 30, telefon 17); Küçük üçgen (telefon 48); Şasi (telefon 27); Anten direği (telefon 14)
- Boşta hiç hareket yok: ay-yuzeyi · tg-panel
- Üstü örtülü hedef (parmak değmez): Benek yeri 1 (pano · koy)
- Telefonda oyun alanı %50'den küçük: ay-yuzeyi · tg-panel %31
- CSS ile kayan tek resim (çizilmiş kare adayı): kanat-sol+benek-mavi+benek-mavi; kanat-sol; lokum-kelebek-0+lokum-kelebek-1

### misket
- Gezilen: ipad 4 ekran; telefon 5 ekran
- 64 px altı: N. sıradaki N. rayı çıkar (ipad 23, telefon 15); N. sıra N. boş bağlantı (ipad 13, telefon 8); Hazır parkuru tamamla (ipad 52, telefon 44); Kendi parkurunu kur (ipad 52, telefon 44); Topu başlangıç çanağına koy (telefon 52); Kırmızı kolu çek ve topu gönde (telefon 48); Bir birimlik kısa ray (telefon 56); İki birimlik düz ray (telefon 60); İki birimlik müzikli vadi (telefon 60); Üç birimlik çember (telefon 60); Mavi topu al (telefon 47); Son ray değişikliğini geri al (telefon 54)
- Boşta hiç hareket yok: masa · pano
- Boş dokunuşa tepki yok: mk-makine · yuklu
- Üstü örtülü hedef (parmak değmez): Son ray değişikliğini geri al (mk-makine · akiyor); İki birimlik düz ray (mk-makine · akiyor); İki birimlik müzikli vadi (mk-makine · akiyor); Üç birimlik çember (mk-makine · akiyor)
- Telefonda oyun alanı %50'den küçük: masa · pano %37

### olcu
- Gezilen: ipad 12 ekran; telefon 12 ekran

### onluk
- Gezilen: ipad 5 ekran, takıldı: cd-dunya · abakus/abakus; telefon 5 ekran, takıldı: cd-dunya · abakus/abakus
- 64 px altı: Boncuk (ipad 44, telefon 44); Üst tel: onluklar (ipad 46, telefon 38); Alt tel: birlikler (ipad 46, telefon 38)

### oruntu
- Gezilen: ipad 4 ekran; telefon 4 ekran

### oyuncak-fener
- Gezilen: ipad 1 ekran, takıldı: tiyatro · pano; telefon 1 ekran, takıldı: tiyatro · pano
- Boşta hiç hareket yok: tiyatro · pano
- Üstü örtülü hedef (parmak değmez): Güneş (tiyatro · pano); Ay (tiyatro · pano); Yıldız (tiyatro · pano); Fener 2 (tiyatro · pano); Fener 3 (tiyatro · pano)
- Telefonda oyun alanı %50'den küçük: tiyatro · pano %32

### oyuncak-olcu
- Gezilen: ipad 2 ekran, takıldı: masa · pano; telefon 2 ekran, takıldı: masa · pano
- Boşta hiç hareket yok: masa · pano; manav-tezgahi · pano
- Telefonda oyun alanı %50'den küçük: masa · pano %9; manav-tezgahi · pano %36

### oyuncak-sayi
- Gezilen: ipad 1 ekran, takıldı: kule-masasi · kule-meydani; telefon 1 ekran, takıldı: kule-masasi · kule-meydani
- 64 px altı: Kutuyu buraya bırak (ipad 50, telefon 34); N numaralı kutu (ipad 52, telefon 38)
- Boşta hiç hareket yok: kule-masasi · kule-meydani
- Telefonda oyun alanı %50'den küçük: kule-masasi · kule-meydani %36

### oyuncak-sekil
- Gezilen: ipad 5 ekran, takıldı: pano · yildiz/bul; telefon 5 ekran, takıldı: pano · yildiz/bul
- 64 px altı: Topu evin soluna koy. (telefon 53); Topu evin üstüne koy. (telefon 53); Topu evin sağına koy. (telefon 53); Küçük mavi daire (telefon 51); Büyük kırmızı kare (telefon 51); Büyük kırmızı daire (telefon 51); Küçük mavi kare (telefon 51); Küçük kırmızı kare (telefon 51); Büyük mavi daire (telefon 51)
- Boşta hiç hareket yok: liman · pano; masa · pano; baba-atolyesi · pano; pano · yildiz/bul
- Donuk karakter: baba-takim-0 (baba-atolyesi · pano); kino-sekil-0 (pano · yildiz/tanit); kino-sekil-0 (pano · yildiz/bul)
- 1 sn'den uzun sessiz ve durgun: baba-atolyesi · pano 1.0 sn (ipad)
- Telefonda oyun alanı %50'den küçük: liman · pano %30; masa · pano %35; baba-atolyesi · pano %41
- CSS ile kayan tek resim (çizilmiş kare adayı): yildiz

### sayilar
- Gezilen: ipad 8 ekran; telefon 8 ekran, takıldı: cd-dunya · sen
- 64 px altı: N (ipad 56, telefon 52); armut, N (ipad 55, telefon 56); Masaya bir boncuk koy (ipad 55); elma (ipad 55, telefon 56)
- CSS ile kayan tek resim (çizilmiş kare adayı): rakam-1; elma; rakam-2

### sekiller
- Gezilen: ipad 10 ekran; telefon 3 ekran, takıldı: cd-dunya · daire/ciz
- CSS ile kayan tek resim (çizilmiş kare adayı): daire; kare; ucgen; hatira-sekil-kutusu; dikdortgen

### tezgah
- Gezilen: ipad 1 ekran; telefon 1 ekran
- 64 px altı: üst düğme: Büyükler için (ipad 61, telefon 44)
- Telefonda oyun alanı %50'den küçük: atolye-tezgah · atolye-tezgahi %36
- CSS ile kayan tek resim (çizilmiş kare adayı): atolye-sayi; atolye-sekil; atolye-olcu; atolye-fener

### toplama
- Gezilen: ipad 15 ekran; telefon 9 ekran, takıldı: cd-dunya · eksik/sor
- 64 px altı: köpek (telefon 63); penguen (telefon 63); koala (telefon 63); ayıcık (telefon 63); kedi (telefon 63)
- Üstü örtülü hedef (parmak değmez): kedi (cd-dunya · eksik/eylem); koala (cd-dunya · eksik/eylem); köpek (cd-dunya · eksik/sor); penguen (cd-dunya · eksik/sor); ayıcık (cd-dunya · eksik/dogru); penguen (cd-dunya · eksik/dogru); köpek (cd-dunya · eksik/dogru)
- CSS ile kayan tek resim (çizilmiş kare adayı): rakam-2; rakam-3; rakam-4

### yol
- Gezilen: ipad 9 ekran; telefon 9 ekran
- 64 px altı: N (ipad 56, telefon 52); armut, N (ipad 55, telefon 56); Masaya bir boncuk koy (ipad 55); elma (ipad 55, telefon 56)
- Üstü örtülü hedef (parmak değmez): 1 (cd-dunya · giris)
- CSS ile kayan tek resim (çizilmiş kare adayı): rakam-1; elma; rakam-2; armut; rakam-3
