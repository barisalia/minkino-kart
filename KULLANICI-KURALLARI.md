# Ana Kurallar

**Telefonda bütün Minkino oyunları yatay oynanır · 15 Kasım 2026.** Oyun menüsünü, sahneleri ve dokunma hedeflerini yatay telefon için tasarla. Teslimden önce oyunu yatay telefon boyutunda oyna ve telefon önizlemesini bu yönde göster.

**Barış’ın 13 Kasım 2026 tarihli talimatı. Bu projede her yeni sohbetin başında, ilk yanıtı vermeden önce bu bölümü okuyun.** Görsel kurallar çizgi filmlerde, oyunlarda, kitaplarda, kapaklarda ve diğer bütün görsel üretimlerde geçerlidir.

1. **En önemli kural temiz 2D çizimdir.** Çocuklar için canlı, parlak renkler, ince siyah konturlar ve elle çizilmiş hissi veren vektörel yüzeyler kullanın. Aynı çizgi dili karakterden arka plandaki en küçük eşyaya kadar bütün kareye ait olmalı.
2. **Her renk alanının sınırı okunmalı.** Örneğin denizin gövdesi tek bir mavi tonunda olabilir. Bir gölge gerekiyorsa onu kenarı belirgin, düz bir renk alanı olarak çizin. Halının üzerine serpiştirilmiş ince siyah izler, rastgele benekler ve bulanık gölge geçişleri yüzeyi kirletir. Ayrıntıyı temiz çizmek için yeniden deneyin. Hâlâ uymuyorsa ayrıntıyı kaldırın. **Dokusu kirli, yapay zekâ hissi veren veya Minkino’nun stilinden çıkan bir görseli teslim etmeyin.**
3. **Görüntü ve ses tutarlı olmalı.** Kino, Mino ve diğer karakterlerin tanımlanmış görünüşlerini ve seslerini koruyun. Aynı kadrajda hareket ederken baş ölçüsü ve eşyanın karaktere göre boyu sabit kalmalı. Oturunca gövde doğal olarak alçalır. Pati yere veya bir eşyaya değdiğinde temas noktası kaymamalı.
4. **Bir karakterin bir hareketini tek ImageGen çağrısında bir sheet’e çizin.** Poz sayısını son kadraja göre seçin. Çok yakın ayrıntıda 1–2, yakın çekimde 2 veya 4, orta çekimde 4–6, uzak çekimde 8–10 ardışık poz kullanın. Başlangıç, ağırlık aktarımı, temas ve bitiş okunmalı. Dekoru ve diğer karakterleri ayrı tutun. Fon, tam sahne, kapak, kart ve diğer bağımsız görselleri kendi tam çözünürlüklü çağrılarında üretin.
5. **Aktif hareketi duruma göre saniyede 6–12 pozla oynatın.** Bu sayı hareketin sürdüğü süre için geçerlidir. Sakin bir planda pozu tutun ve duyguyu anlatan küçük bir hareketi yeri geldiğinde oynatın. Su hafifçe dalgalanabilir, Kino dinlerken gözünü kırpabilir, gerildiğinde patisini sıkıp gevşetebilir. Jestler arasında doğal duraklar bırakın.
6. **İyi hareketleri tekrar kullanın.** Üretimden önce ortak arşivde karakter, kıyafet, açı ve eyleme bakın. Yeni bir yürüyüş, konuşma, göz kırpma veya başka bir hareket hazırladığınızda kaynak sheet’i, poz sırasını, yönü, temas noktasını, ölçeği ve zamanlamayı birlikte kaydedin. Son sahneyi gösterileceği boyutta ve normal hızda izleyin. Sıçrama, kayma veya kopuk temas görürseniz düzeltip yeniden oynatın.

**Bulut’un göz ve model tutarlılığı · 14 Kasım 2026.** Bulut için her yeni çizime [ortak ön modelden](ekip/kalite/minkino-gorsel-rehberi/pozlar/bulut/on.png) başlayın. Kayısı tüyü, küçük koyu boynuzları, uzun kulakları, lila üstü ve turkuaz şortu koruyun. Önden bakışta iki göz bebeğini kendi göz akının merkezine hizalayın. Yana bakışta ikisini de aynı hedefe yöneltin. Önceki sahneden alınan yüzü yeni bir çizime kaynak yapmayın.

**Lokum’un yeni arkadaşı Şeftali Patisi · 14 Kasım 2026.** Karakteri çizerken kullanıcının son mesajında seçtiği [oturan ön modeli](ekip/film/seftali-patisi/model/on.png) esas alın. Lokum yaşındaki yavru kedinin önden bakıldığında soldaki kulağında lila leke, sağdaki kulağının önünde kalp detaylı nane yeşili çıtçıt vardır. Kulak içleri canlı pembe, patiler krem, gözler kestane rengidir. İki küçük süt dişini ve şeftali işlemeli sarı tulumu koruyun. Karakterin sahnedeki sağ ve sol tarafı açı değiştikçe doğal olarak görünür; pozu aynalayıp tokayı karşı tarafa taşımayın. Sesi ElevenLabs’taki Bıdık Bebek’tir.

## Minik Şef arayüzü

Tarif, malzeme ve işlem ikonlarını ayrı ayrı ImageGen ile üret. Küçük oyun boyutunda anlaşılır tek siluet, temiz siyah kontür ve düz renk alanları kullan. İkonları kodla çizme.

## Önceki kararlar ve bölüm notları

**Meyve seçimi · 15 Kasım 2026.** Yeni çizimlerde ve etkinliklerde çilek kullanmayın. Matematik Atölyesi’ndeki mevcut çileğin yüzeyini sadeleştirin. Kırmızı renk alanı düz ve dokusuz olsun, birkaç küçük çekirdek izi yeterli.

**Harf atölyesi · 14 Kasım 2026.** Sesli tekrarda Ceren ile çocuğun yüz yüze olduğu [birinci düzen](ekip/etkinlik/alfabe/ui-secimi/02-soyle-yuz-yuze.png) seçildi. Çocuk söylerken karttaki büyük harf [ikinci tasarımdaki gibi](ekip/etkinlik/alfabe/ui-secimi/02-soyle-harf-doluyor.png) alttan yukarı dolar. Ceren’in konuşma animasyonu ses kaydını izler; dinlerken ağzı kapalıdır. Yazma için [yan yana iki alanlı birinci düzen](ekip/etkinlik/alfabe/ui-secimi/03-yaz-beraber.png) seçildi. Ceren solda kalem yolunu gösterir, çocuk sağda aynı harfi çizer. Harf kutusunda [birinci düzen](ekip/etkinlik/alfabe/ui-secimi/04-kutu-masa.png) kullanılır. Üç resim solda, harfi taşıyan kırmızı kutu sağdadır. Kullanıcının son kararıyla bu etkinliğin kalan arayüzlerini ekip kendi seçip uygular.

**Harf dersleri ve Hece Oyunu · 14 Kasım 2026.** Önce her harfin kendi dersini zenginleştir. Ayrı “Ses oyunları” bölümünü ve ders sonundaki ses oyunlarını kaldır. “Hece Oyunu” harflerin altında, adı büyük yazılan ayrı bir girişten açılır. Hece çalışmasını da Ceren’in sınıfında, Minkino’nun sade ve temiz 2D çizimleriyle hazırla. Gece çalışmasında Hece Oyunu’nun altına yalnız bir yeni oyun eklenebilir. Geri kalan geliştirmeler mevcut derslere ve oyunlara yapılır. Çocuğun dokunduğu her hece Türkçe sözcükte duyulduğu gibi okunur. “Limon”un ikinci hecesi “mon”dur.

**Hece oyunlarının seslendirmesi · 15 Kasım 2026.** Her sözcüğü, heceyi ve yönergeyi Ceren’in sesiyle ayrı bir ElevenLabs isteğinde üret. Bir toplu okumayı parçalara bölme. “Raket”, “ra” ve “ket” üç ayrı kayıttır. Yönergede adı geçen düğmenin resmi ekrandakiyle aynı olmalıdır.

Ekip, ilgili işe başlarken bu dosyayı okur. Burada kullanıcının doğrudan verdiği talimatlar ve açıkça onayladığı örnekler yer alır. Yeni bir karar geldiğinde kapsamı ve kaynağıyla buraya yazılır. Kullanıcı bir tercihini değiştirdiğinde ilgili madde güncellenir. Ekibin teknik önerileri ve denemeleri ekip rehberinde kendi adıyla tutulur.

**Eski kararları bulmak için:** [Bölüm bölüm eski talimatlar ve düzeltmeler](#eski-bölümlerden-gelen-kararlar) aşağıda. Önceki yazılı kayıtlar [proje talimatlarında](AGENTS.md), [Ortak Notlar’da](ORTAK_NOTLAR.md) ve [görsel rehberde](ekip/kalite/minkino-gorsel-rehberi/OKU.md) duruyor. 18 Ekim 2026 öncesindeki çizgi film ve görsel üretim notları tarihsel kayıttır. Aynı konuda daha yeni bir kullanıcı düzeltmesi varsa o uygulanır.

## Eski bölümlerden gelen kararlar

**Anaokulu, yıl sonu gösterisi ve eve dönüş · 14 Kasım 2026.** Gösteri salonuna ana sınıfının solundan girilir. Önce Kino’nun arkadaşları sahneye çıkar; son gösteri Kino ile Zıpzıp’ındır. Çocuk şarkı veya dansı kendisi seçer. Müzikli oyun 3–4 yaşın oynayacağı düzeyde olmalı; sahnede yaptığı hareketler ve anlamlı seçimleri puana katılmalı. Mino davul gösterisinden 4, ardından Bulut el çanı gösterisinden 6 puan alır. Şarkıda da dansta da Kino ile Zıpzıp 7–10 puanla kupayı kazanır. Kendi puanları korunur ve aile eve dönüşte kazandıkları dala göre tepki verir. Eve dönüşteki karakterler okul ile aynı görünmelidir. Nihai şarkıları kullanıcı Gemini ile hazırlayacak; gelene kadar geçici müzik kullanılır.

**Yıl sonu gösterisi için son düzeltme · 14 Kasım 2026.** Şarkıda gerçek Türkçe sözler ve arkada işitilen bir ritim olacak. Sürekli “la” söyleyen ses örnekleri kullanılmayacak. Gösteri sırasında soru kartları çıkmayacak. Çocuk şarkıda ritmi çalar, dansta Zıpzıp’ın gösterdiği harekete katılır. Dans daha hızlı akar. Çocuk Zıpzıp’ın beş figüründen gördüğüne dokunduğunda Kino aynı harekete hemen katılır. Kino’nun vokalinde hecelerin doğal vurgusu korunur.


**Anaokulu gösterisi ve sınıf kapıları · 14 Kasım 2026.** Güncel gösteride çocuk dans ile Kino ve Zıpzıp’ın birlikte okuduğu şiir arasında seçim yapar. Öğretmen kazananlara kupayı sahnede verir, konfeti teslim anında patlar. Askılık sahnesinde Kino yalnız görünür. Sınıf, oyun odası ve gösteri salonu arasındaki kapı ikonları ayrı ayrı ImageGen ile, ince siyah konturlu ve düz renkli çizilir.

**Anaokulu sınıfında dokunma ipuçları · 14 Kasım 2026.** Karakterlerin ve eşyaların ince siyah konturunu koruyun. Kullanıcı, siluetin dışına eklenen yanıp sönen açık renkli kenarı montaj gibi göründüğü için reddetti.

Kaynak, Barış’ın “Çizgi film işlerini devral” sohbetindeki istek ve düzeltmeleridir. Aşağıdaki bölüm adları, kararın ilk hangi çalışmada görüldüğünü belirtir. [Orijinal sohbet](codex://threads/01a1adda-6503-7292-84c8-b85a0cd1c4ea)

**İlk yapım tarifi ve Karanlık bölümü**

- Önce yayımlanmış videodan gerçek bir kare açın. Karakterin kimliğini koruyun. Eski videodaki şaşı bakışı, zayıf animasyonu veya yapay dokuyu yeni çizime taşımayın. İlk tarifte karakter hareketleri arka plansız çizilir, sahneye uygun dekor ayrıca hazırlanır. [Kaynak video kareleri](ekip/film/youtube-referans-2026-11-06/referans-envanteri.json)
- Kadrajı eyleme göre seçin. Yüzdeki tepki önemliyse yaklaşın. Kamera Kino’dayken cümlesi sürüyorsa aynı hareket devam etsin. Poz birden eski hâline dönmesin. Karakteri konuştururken ağzı piksel piksel görünmemeli, önceki ağız çizgisi altta kalmamalı.
- Tek görselle yapılan ekonomik planı arada kullanabilirsiniz. Oyunculuğu taşıyan planlara gerektiği kadar çizim ayırın. Özellikle yatağın, yorganın ve patinin birbirine temas ettiği yerleri aynı perspektifte kurun. Barış ilk 10 saniyenin temiz çizgisini, renklerini ve çocuksu havasını beğendi. Devamında ve finalde de aynı kaliteyi istedi. [Onaylanan açılış](ekip/film/kino-karanlik-10sn-v2/Kino-Karanlik-10sn-v2.mp4)
- Mont kıpırdayınca duvardaki gölgesi de onunla hareket etmeli. Dede pencereyi açarken pati, kanat ve pencerenin hareketi birbirine uymalı. Anne aynı konuşmada bir kısık bir normal duyulmamalı.

**Bisiklet bölümü**

- Evin dışını, sokağı ve uzağı da iç mekândaki mavi perdeli pencereyle aynı düz, temiz 2D çizgide kurun. Gerekirse daha sade bir kadraj veya yakın çekim kullanın. Ağaç, çimen ve cephedeki boyalı yüzeyler bölümün çizgisini bozuyor.
- El, kol, omuz ve baş birleşimlerinde kesik çizgi, aradan sızan ten/fon rengi veya siyah parça kalmamalı. Kulakla kol arasından dekor görünmeli. Zemindeki gölgeyi karakter pozuna yapıştırmayın.
- Yayına gönderilmesi istenen bölümün kapağını da hazırlayın. Gerçek eski thumbnail’leri açıp kanalın kapak düzenini örnek alın. Karakter model sayfası birinci format, kapak ikinci formattır. [Bisiklet kapağı](ekip/film/kino-bisiklet-bolum/Kino-Bisiklet-YouTube-Kapak.jpg)

**Kırmızı Kapının Arkası**

- Bu bölümün senaryosundaki Mert için Zıpzıp veya mevcut kadrodan uygun bir karakter kullanılmasını Barış istedi.
- İlk iki dakikadan sonraki sahnelerde de oyunculuk sürmeli. Zıpzıp uzun süre aynı pozda beklememeli. Hareketini repliğine göre çizin. Zıpzıp erkek tilkidir ve hızlı konuşur. ElevenLabs’te kendisi için kayıtlı sesi kullanın.
- Anne konuşurken ağız pozu repliğin tamamında çalışmalı. Bölüm açılışına istenmemiş yazı eklemeyin. [Yazısız sürüm ve kapak için yayın yazışması](CLAUDE-ASTRA-MESAJLAR.md)

**Kırmızı İtfaiye Arabası**

- Aynı düzlemde Kino ve Lokum’un birbirine göre boyu sabit kalmalı. Barış ortak bir ölçü belirleyip kaydetmeyi istedi. Ekip bu ölçüyü ayrı dosyaya kaydetti. [Kino ve Lokum’un ölçü dosyası](ekip/kalite/minkino-gorsel-rehberi/boy-oranlari.json)
- Kabine oturan Kino’nun alt gövdesi görünür biçimde koltuğa oturmalı. Koltuk kopuk görünmemeli. Poz değişince itfaiyeci kaybolmamalı veya büyümemeli. Kedi sepete girerken aynı boyda kalmalı, sepetin kenarı doğru anda önüne geçmeli.
- Ağız hareketini son dosyadan kontrol edin. Bu bölümde Barış özellikle 0:59’daki kaybolup geri gelen görseli, 1:31’de konuşurken eski pozda kalan Kino’yu, 2:20’deki yürüyüşü ve çocuk sesini, 3:14 civarındaki hareketsiz ağızları ve 3:42’de kedinin sepete girişini işaretledi.
- İyi çıkan yatay yürüyüşü yönüyle saklayıp yeniden kullanın. Ağırlık aktarımı ve ayak basışı anlaşılmalı. Yürüyüşü öğrenirken edinilen örnekleri de arşivleyin. [Yürüyüş çalışması](ekip/kalite/minkino-gorsel-rehberi/Yuruyus-dersi.md) · [Kabul edilen itfaiye bölümü](ekip/film/kino-itfaiye-ilk-dakika/Kino-ve-Kirmizi-Itfaiye-Arabasi-Tam-v5.mp4)

**Yola Kaçan Top ve Mavi Fincan**

- Topu sıfırdan, sahneyle aynı çizgide üretin. Sonradan üstü boyanmış gibi görünmesin. Stadyumun çimi ve tribünü de karakterlerle aynı dokuya sahip olmalı. Atlas’ın sesi çocuksu olmalı.
- Mavi Fincan için Barış özellikle anlatıcıyı, sesleri, tempoyu, Kino’nun hareketinin kopmasını ve eşyaların boy değiştirmesini eleştirdi. Bir eşya yerine konduğunda hareketi ve sonucu görüntüden anlaşılmalı. Bu bölüm reddedildi.

**Kitap, ses ve ekip teslimi**

- Doktor kitabına özel düzeltmede kötü çizilmiş yemek bölümlerinin çıkarılması, doktor kısmının uzatılması ve kitaba yeni bir açılış sayfası hazırlanması istendi.
- Kitap düzeltmesinde ilk sayfalar kaldırılıyorsa hikâyenin başlangıcını yeniden kurun. Gerçek açılımda görselin altında gereksiz boşluk bırakmayın. Parmak gösteren pozda parmaklar açık seçik okunmalı. Yiyecekler de yanındaki karakter kadar sade ve temiz çizilmeli.
- Mino konuştuğunda ElevenLabs’te Mino adına eklenen sesi kullanın. BGM için Barış’ın [müzik klasörü](music/) kullanılabilir. Gereken özel ses ekipte üretilemiyorsa Barış’a hangi sesin gerektiğini söyleyin.
- Senaryoyu Barış getirdiğinde çizime uygun değişiklik yapılabilir. İstenen ilk 10 saniye, 30 saniye veya ilk dakika o işe ait teslim kapsamıdır. Bölümün tamamı istendiğinde beğenilen açılıştaki kalite devam etmelidir.

## Hareketin hızı ve sakin sahneler

13 Kasım 2026 · Kullanıcının çizgi film sohbetindeki kararı: “duruma göre saniyede 6 ila 12 poz arası takılabilirsiniz.”

- **Hareket sürdüğü sırada saniyede 6–12 poz** kullanın. Hızı sahnedeki eyleme göre seçin. Karakter durup dinlediğinde pozu gerektiği kadar tutabilirsiniz. Kadraja göre bir sheet’e çizilen poz sayısı ile bu pozların ekranda oynama hızı ayrı kararlardır.
- Sakin sahnelerde, arada bir o anı anlatan küçük bir hareket kullanın. Su hafifçe dalgalanabilir, Kino dinlerken gözünü kırpabilir veya gerildiğinde patisini sıkıp gevşetebilir. Kısa bir döngüyü sahneye uygun anda oynatın. Aynı jesti sürekli tekrarlamak oyunculuğu mekanikleştirir.
- Uygun hareketi sonraki sahnelerde kullanmak üzere kaydedin. Önce ortak arşivde karakter, açı, kıyafet ve eyleme bakın. Yeni hareketin kaynak sheet’ini, kare sırasını, yönünü, temas noktasını, ölçeğini ve zamanlamasını birlikte saklayın. [Ortak hareket arşivi](ekip/film/ortak-poz-arsivi/karakter-hareketleri/OKU.md)

## Çizim, kadraj ve devamlılık

Kaynak: Kullanıcının 13 Kasım 2026 proje talimatları ve çizgi film düzeltmeleri.

- Bir karakterin bir hareketini tek ImageGen çağrısında tek sheet olarak çizin. Çok yakında 1–2, orta planda 4–6, uzakta 8–10 ardışık poz kullanın. Dekor ve diğer karakterler ayrı kalır. Fon, tam sahne, sahne animasyonunun her bağımsız çizimi, model referansı, kart, kapak ve ekran kendi tam çözünürlüklü çağrısında çizilir. Bağımsız Pati kıyafeti kataloğunda sayfa başına en fazla 6, diğer bağımsız çizim kataloglarında en fazla 8 çizim bulunur.
- Hareketin başlangıcını, ağırlık aktarımını, teması ve bitişi çizin. Yürüyüşte iki ayağın sıralı basışı okunmalı. Kino çömeldiğinde baş ölçüsünü ve yere basan pati veya dizin konumunu koruyun. Aynı derinlikte Kino ile Lokum’un boy oranı, diğer karakterlerin ve eldeki eşyanın büyüklüğü poz değişince sıçramamalı.
- Kamerayı eyleme göre kurun. Konuşurken bakış, ağız ve gövde hareketi aynı kadrajda akmalı. Her kamera planı olağanüstü bir anlatım gereği dışında en az 2,5 saniye sürer. Replik veya hareket gerektiriyorsa uzatın.
- Hareketi ve gölgesini birlikte oynatın. Baş, omuz, pati ve ağız birleşimlerini, gözleri ve eşya temasını kontrol edin. Normal hızda kopma, çift ağız, kayma veya boy sıçraması görülürse pozu düzeltip planı yeniden oynatın. Kusurlu çizimi teslim etmeyin.
- Önemli oyunculukta yeterli ara çizim kullanın. Ekonomik sahneler yer yer kullanılabilir. Kullanıcının onayladığı yorgan planı oyunculuk ve görüntü kalitesi örneğidir. [Onaylanan 10 saniye](ekip/film/kino-karanlik-10sn-v2/Kino-Karanlik-10sn-v2.mp4)

## Karakterler, stil, ses ve kapak

Kaynak: Kullanıcının karakter düzeltmeleri, yayın talimatları ve onayladığı görsel örnekler.

- Karakter kimliğini yayımlanmış Minkino YouTube karesi veya gerçek video kapağıyla doğrulayın. Üretimden önce kaynağı açın. Yüzü, gözleri, kulakları, lekeleri, oranları ve kıyafeti koruyun. Reddedilen eski uygulama çizimlerini referans almayın. [Kaynak envanteri](ekip/film/youtube-referans-2026-11-06/referans-envanteri.json)
- İsimleri koruyun. Zıpzıp erkek, yaramaz ve hızlı konuşan tilkidir. Lokum’un beyaz tüyünü uygun fonla ayırın. Bulut kayısı tonundadır. Baba’nın alın benini kaldırın. El yıkamadaki iki insan çocuğu kadro dışındadır.
- Karakter, evin dışı, fon, araç, oyuncak ve yiyecek aynı temiz vektörel 2D dilde çizilir. Düz, dokusuz renk alanları ve ince siyah dış kontür kullanın. Gerekirse tek düz gölge ekleyin. Yiyeceğin yüzeyini ve karaktere göre çizgi kalınlığını son gösterim boyutunda ayrıca inceleyin. Bisiklet bölümündeki mavi perdeli pencere ve bahçe yolu çevreler için onaylı örneklerdir.
- Mino ve Zıpzıp için ElevenLabs’te kendilerine ayrılmış sesleri kullanın. Çocuk karakterin sesi yaşına uymalı. Konuşma düzeyi anlaşılır ve tutarlı olmalı. Ağız hareketi söze oturmalı. Uygun sahnelerde proje müzik klasöründen BGM ve eyleme uygun ses efektleri kullanın.
- YouTube kapağını kanalın gerçek eski kapaklarındaki ikinci formata göre hazırlayın. Bölümün başına kendiliğinden yazı eklemeyin.

## Kitap, hikâye ve seçimli yapımlar

Kaynak: Kullanıcının kitap, senaryo ve seçimli çizgi film talimatları.

- “Kino Kurabiye Yapıyor” kitaplar için kalite örneğidir. Yeni kitaplarda ön ve arka kapakla birlikte 14 çift iç sayfa hazırlayın. Açılışta karakterin somut bir isteği olsun. Karşılaştığı güçlük ve yaptığı seçim sonuca bağlansın. Eski karakter şakalarını kendiliğinden yeni senaryoya eklemeyin.
- İki sayfalık açılımda görseli yazısız üretin. Büyük yazı görselin hemen altından başlayıp karşı sayfaya akmalı. Kısa repliği bölmeyin. Anlatıcı siyah, konuşmalar karaktere göre renklidir.
- Seçimli filmde çocuk karardan önce amacı duyar. Seçimden sonra eylemi ve sonucunu görür. Yanlış seçimin neden işe yaramadığı anlaşılmalı. Çocuk aynı soruya döner ve önceki kararları korunur. Kartları kadraja özel çizin. Her dalı başlangıç, temas, bitiş ve nesnenin sonraki konumuyla planlayıp gerçek oyun boyutunda oynayın.
- İlk zil/fener kararı onaylı örnektir. Bütün dallarda aynı standardı sürdürün. Okul öncesi oyunda çocuk yaptığı işi görebilmeli ve sonucunu sonraki sahnede kullanabilmeli. [Yıldızın İlk Selamı](ekip/film/kino-golge-tiyatrosu/)

## Minik Şef · 14 Kasım 2026
Bulut’un restoranda dört repliğinde kullanılan Tombi sesini kullanıcı onayladı. İçecek tezgâhı boya karışımını öğretir. Sarı ile mavi yeşil, kırmızı ile beyaz pembe olur.
İçecek tezgâhında seçilebilen dört renk kırmızı, sarı, mavi ve beyazdır. Karıştırma ve dökme büyük resimli düğmelerle yapılır.

## Harf Atölyesi oyunları · 15 Kasım 2026

Harfle Hayvan Çağır etkinliğinde çocuk harfi eliyle yazar. Büyük harf o harfle başlayan hayvanı, küçük harf yavrusunu çağırır. Yazma yardımı yaş grubuna göre değişir.

Obur Harf Canavarı, eski kutunun yerini alır. Çocuğun sürüklediği karta bakar, doğru kartı yer ve yanlış kartı geri verir. Nesne ve harf yedirme görevleri yaşa göre zorlaşır. Ünlüleri istemeden önce öğretin. Aynı yeme repliğini sürekli tekrar etmeyin.

Hece Trambolini’nde her hece ayrı bir sıçrayış ve ayrı bir Türkçe ses kaydıyla eşleşir. Manyetik Hece Bulmacası’nda aynı anda üç resim ve ortak bir karışık hece havuzu vardır. Dört yaş için iki heceli, 5+ yaş için iki ve üç heceli sözcükleri kullanın.
