# ÖNEMLİ · Minkino görsel üretim rehberi

**ElevenLabs ile karakter gülüşü.** Karakterin kayıtlı sesini seçin. Eleven v4 ve v3’te oyunculuk yönergesini köşeli parantezle ilgili ana yazın. Örneğin `Daha! [giggles]` kısa bir kıkırdama, `Yine! [laughs]` kahkaha içindir. Yalnızca tepki sesi gerekiyorsa kısa bir replikle birlikte üretip gülüşü ayrı klibe kesin. Kesilen klipte yalnızca istenen tepkinin duyulduğunu kontrol edin. Sesin girişini ilk gülme hareketine, bitişini nefesin veya sonraki repliğin başlangıcına göre ayarlayın. [ElevenLabs ses etiketi kılavuzu](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)

**Bulut · 14 Kasım 2026.** Bulut için her yeni çizime [ortak ön modelden](pozlar/bulut/on.png) başlayın. Kayısı tüyü, küçük koyu boynuzları, uzun kulakları, lila üstü ve turkuaz şortu koruyun. Önden bakışta iki göz bebeğini kendi göz akının merkezine hizalayın. Yana bakışta ikisini de aynı hedefe yöneltin. Önceki sahneden alınan yüzü yeni bir çizime kaynak yapmayın.

Her yeni proje sohbetinde önce Barış’ın [Ana Kurallar](../../../KULLANICI-KURALLARI.md#ana-kurallar) bölümünü okuyun. Ekibin uygulama önerilerini bu rehbere yazın.

Önce [görsel kataloğu açın](Katalog.html). Birinci format karakter model sayfasıdır. İkinci format YouTube kapağıdır. Katalogdaki her poz açıldığında tek üretimin asıl çözünürlüklü PNG dosyası gelir.

## Minkino karakter animasyonunda sheet kullanımı · 13 Kasım 2026

- Bir karakterin bir hareketini **tek ImageGen çağrısında tek sheet** olarak çiz. Sayı, karakterin son görüntüdeki kadrajına göre belirlenir. Yakın ve çok yakın çekimde 1–2, orta çekimde 4–6, uzak çekimde 8–10 poz kullan. Örneğin Kino’nun masanın altına girişi uzak planda, tek çağrıda 8 ardışık pozdur. 10 poz gereken uzak hareketi aynı sayfada üret.
- Sheet yalnızca karakter animasyonu içindir. Arka plan, tam sahne, sahne animasyonunun her ayrı çizimi, seçim kartı, kapak, ekran, model referansı ve diğer bağımsız görseller için her görseli kendi tam çözünürlüklü çağrısında çiz. Dekoru ve diğer karakterleri hareket sheet’ine gömme.
- Başlangıç, ağırlık aktarımı, temas ve bitiş pozlarını hareket sırasına koy. Her hücrede aynı karakter kimliği, kıyafet, bakış yönü, baş ölçüsü, palet ve ince siyah kontür korunsun. Renk alanları düz ve dokusuz olsun. Yerleştirirken aynı kamera ölçeğini ve yere basan pati/diz noktasını kullan. Çömelme ve oturma pozunu ayaktaki pozun yüksekliğine büyütme. Aynı plandaki diğer karakterler yerlerinde kalsın.
- Yeni üretimden önce ortak hareket arşivinde aynı karakter, açı, kıyafet ve eylemi ara. Uygun hareketi yeniden kullan. Yeni sette kaynak sheet’i, kare sırasını, bakış yönünü, temas noktasını, ölçeği ve zamanlamayı birlikte kaydet. Durma, dinleme, konuşma, gülme, yürüme, eğilme ve oturma gibi temel hareketleri ekipçe bu arşivden kullan.
- Kaynağı doğrulanmış YouTube referansı, önceki stil ve ses kuralları geçerlidir. Sheet’i bütün olarak, her pozu tek tek ve sahneyi oynatılacağı boyutta normal hızda kontrol et. Kayma, boy sıçraması, çift ağız, kopuk kontür, bozuk pati teması veya kirli doku görülürse o çizimi düzeltip sahneyi tekrar oynat.

## 1 · Karakter ve animasyon

- Film ve oyun ekibi, tekrar oynatılabilen oyunculuğu [ortak hareket kataloğuna](../../film/ortak-poz-arsivi/karakter-hareketleri/firtina-oyunculuk/Katalog.html) kaydeder. Kaynak pozlar, bakış yönü, hareket sırası ve oynatılan sheet birlikte tutulur. Beklemede dinleme, göz kırpma veya ağırlık aktarımı; neşede açıya uygun ayrı bir gülme kullanılır. Eylem anlatıldığında nesnenin önceki ve sonraki hâli ekranda okunur. Kapıdan geçildikten sonra konuşma, bekleme ve karar planları aynı iç mekânda sürer.

- Seçimli filmde kararı oynatın. Çocuk önce hedefi görüp duyar, dokunduğunda eylemi başlatır ve sonucunu aynı sahnede görür. Pati nesneye yaklaşırken, temas ederken ve bırakırken gereken pozları ayrı çizin. Bu hareketin okunması için planı gerektiği kadar uzatın. Finali normal hızda ses ve kontroller açıkken oynayarak doğrulayın.

- Karakter kimliği için [kaynak envanterinden](../../film/youtube-referans-2026-11-06/referans-envanteri.json) ilgili yayın karesini açın. Baş-gövde oranını, kulak ve yüz lekesinin tarafını, göz akını, burnu ve kıyafeti bu kareyle karşılaştırın. Ters yöne bakan pozu yeniden çizin. Yatay çevirme asimetrik yüz lekesini öbür tarafa taşır.
- Bağımsız model referanslarında **bir üretimde tek poz** çizin. Sayfayı ayrı yüksek çözünürlüklü çizimlerden dizin. Burada her karakterin ön, üç çeyrek ve profil pozu var. Yeni model sayfaları ekip için çalışma çizimleridir. Kullanıcı onayı ayrıca kaydedilir.
- Kino’nun turuncu lekesi, mavi fuları ve yüz oranı korunur. Mino turuncu tekir kedidir, Zıpzıp tilkidir. Mino konuştuğunda ElevenLabs’te Mino adına kaydedilen sesi kullanın. Zıpzıp erkek tilkidir, yaramazdır ve hızlı konuşur. Seslendirmede ElevenLabs hesabındaki “zıpzıp erkek” sesi kullanılır (zCieqqNJvrBIGmXON5an). Lokum, Kino’nun küçük kız kardeşidir. Lokum’un tüyü beyaz kalır. Açık fonlu sahnede arkasına tek parça soluk mavi duvar veya farklı açıklıkta bir yüzey yerleştirin. Mavi dış kontur veya ışıklı kenar eklemeyin.
- Baba Murat’ın alnında ben bulunmaz. Bulut için yeni tasarım kayısı rengi tüylü, küçük boynuzlu bir karakterdir. El yıkama şarkısındaki insan çocukları kadro dışındadır.
- Kamera hareketini aksiyondan önce belirleyin. Bir replik aynı planda sürerken karakterin boyu, konumu veya bakışı aniden sıçramasın. Hareketin başlangıcını, ortasını ve bitişini çizin. Yürüyüşte ağırlık bir ayaktan öbürüne geçsin. Konuşmada ağız kapandığında önceki ağızdan çizgi veya piksel kalmasın.
- Karakter animasyonunda yukarıdaki kadraj kuralını uygulayın. Bağımsız Pati kıyafetlerinin katalog sayfasında en fazla 6 çizim bulunur.
- Onaylı oyunculuk örneği [yorgan planıdır](../../film/kino-karanlik-10sn-v2/Kino-Karanlik-10sn-v2.mp4). Seçimli filmde [Yıldızın İlk Selamı](../../film/kino-golge-tiyatrosu/) içindeki ilk zil ve fener seçimini inceleyin. Her seçeneği kendi kadrajında çizin ve her dalı oynayın.
- Hareketli nesne ile gölgesi aynı poz ve zamanlamayı izler. Şeffaf karakter dosyasına zemin gölgesi boyamayın. Müzik ve efektler konuşmanın altından duyulsun. Karakterin ilk ve son sözcüklerini son ses miksinde dinleyin.

## 2 · YouTube kapağı

[Katalogdaki kapak örneğini](Katalog.html#kapak) ve [düzenlenebilir yerleşim şablonunu](Kapak-sablonu.svg) açın. Eski kanaldaki **Babanın Piknik Paketi** ve **Onu Ben Buldum!** kapaklarında üst solda küçük Minkino logosu, solda kısa ve renkli başlık, sağda büyük yüz ve hikâyeyi anlatan nesne bulunur. Bisiklet kapağında tek bakışta okunan eylem Kino’nun iki tekerlek üstünde kendi başına ilerlemesidir.

1. 16:9 çalışın. Başlıkta bölümün en anlaşılır eylemini iki veya üç kısa satıra bölün. Türkçe harfleri ve noktalama işaretlerini elle okuyun.
2. Başlığı ve logoyu ayrı katmanlarda tutun. Başlık harflerinde kalın siyah kenar kullanılabilir. Karakterin yüzünde ve eşyalarda ince siyah çizgi kullanın. Son kapakta kılavuzları kapatın.
3. Kadraja özel büyük karakter çizimi hazırlayın. Gidonu tutan pati ve pedala basan ayak gibi temaslar tek bakışta anlaşılmalı. Arka planda birkaç düz renk alanı yeterlidir.
4. Önce 320 × 180 boyutta başlığı, yüzü ve eylemi okuyun. Sonra tam çözünürlükte kulak kenarı, parmaklar, gözler ve nesne bağlantılarını inceleyin. Teslim dosyasını 1280 × 720 JPG olarak açıp son kez kontrol edin.

## Teslimden önce görseli açın

| Kontrol | Teslimi durduran kusur | Düzeltme |
|---|---|---|
| Yüz ve bakış | Göz bebekleri iki ayrı hedefe bakıyor, ağız çift görünüyor | Yüz pozunu yeniden çizin. Nihai kadrajda ilk, orta ve son pozu büyütün. |
| Siluet | Kulak ile kol arasında siyah dikdörtgen, omuzda zemin renginde yarık | Katmanın saydamlığını ve birleşimi düzeltin. Açık ve koyu fonda, sonra gerçek sahnede deneyin. |
| El ve eşya | El nesnenin içinden geçiyor, parmak sayısı pozlar arasında değişiyor | Tutuşu tek çizimde çözün. Zorsa kadrajı ve hareketi sadeleştirip yeniden çizin. |
| Sandviç testi | Ekmekte benek, kabukta gradyan, iç malzemede plastik parlaklık | Her malzemeyi düz renk, ince siyah dış çizgi ve gerekiyorsa tek keskin gölgeyle yeniden çizin. Karakterle yan yana kontrol edin. |
| Dekor ve doku | Yaprak, duvar, kumaş veya araç yüzeyi karakterden daha boyalı görünüyor | Rastgele dokuyu temizleyin. Büyük okunaklı şekiller ve az sayıda bilinçli iç çizgi kullanın. |
| Hareket | Ayak kayıyor, gölge sabit, ses sürerken karakter sıçrıyor | Pozu veya zamanlamayı düzeltin. Son MP4’te önce normal hızda, sonra hatanın iki yanındaki kareleri izleyin. |

**Kusurlu görseli teslim etmeyin.** İlgili pozu tekrar üretin, sahneye geri yerleştirin ve birleşmiş sonucu gerçek gösterim boyutunda yeniden kontrol edin. Kaynak PNG’nin temiz olması, son oyunda veya videoda birleşimin de temiz olduğunu göstermez.

Yürüyüş ve sakin dinleme planları için önce [ortak hareket arşivine](../../film/ortak-poz-arsivi/karakter-hareketleri/OKU.md) bakın. Göz kırpmasını bir dinleme anına, belirgin bir jesti repliğin anlamına bağlayın.

### Kino ile Lokum’un boy ölçeği

Aynı zemin ve kamera derinliğinde, dik dururken Kino 100 birim, Lokum 63 birimdir. Boyu ayağın bastığı yerden başın tepesine ölçün. Başlık, kaldırılmış pati ve hayali zemin gölgesi ölçüye girmez. Örneğin Kino 450 piksel ise Lokum 284 pikseldir. Kamera yakınlaşınca ikisini aynı katsayıyla büyütün. Kino diz çökünce Lokum’un ölçeği aynı kalır. Konuşanın yakın planını kamera ile kurun. İtfaiye filmindeki ortak oran dosyası [boy-oranlari.json](boy-oranlari.json).

[Yan yana boy karşılaştırması](kino-lokum-boy-olcegi.png)

İtfaiye bölümünde Tarık’ın aynı düzlemdeki baş genişliği 200 sahne birimidir (Kino’nun dik boyu 444). Ayakta, çömelirken ve diz üstünde her çizimi [baş ölçülerine](../../film/kino-itfaiye-ilk-dakika/rev-bas-olcu.json) göre ölçekleyin. Kurtarma planında Boncuk’un kulaktan kulağa genişliği 146 sahne birimi; sepetin kenarı ayrı ön katmandır.

[Yürüyüş dersi ve Ece’nin sekiz fazlı örneği](Yuruyus-dersi.md)

Bir anahtar poza baş genişliğiyle ölçek verildiğinde aradaki çizimler de aynı birimi kullanır. Kask planında Kino’nun ayak tabanı ortak kayıt noktasıdır. [Filmdeki geçiş kontrolü](../../film/kino-itfaiye-ilk-dakika/rev-gecis-kontrol.py) ara kareler dahil Tarık’ın ekrandaki başını ölçer ve Kino’nun kaydedilen ağız şekillerini repliğin zamanlarıyla karşılaştırır.

Barış, 12 Kasım 2026 tarihinde [Kino ve Kırmızı İtfaiye Arabası tam bölüm v5](../../film/kino-itfaiye-ilk-dakika/Kino-ve-Kirmizi-Itfaiye-Arabasi-Tam-v5.mp4) sürümünü bitmiş bölüm olarak kabul etti. Kino, Lokum ve Ece için [ortak hareket arşivindeki](../../film/ortak-poz-arsivi/karakter-hareketleri/OKU.md) uyumlu çizimleri kullanın. Kask ve kabin oyunculuğunun yüksek çözünürlüklü çizimleri [bölümün çizim klasöründe](../../film/kino-itfaiye-ilk-dakika/cizim/) bulunur. Filmde kullanılan poz ve kadrajı bolum.cjs üzerinden doğrulayın.


## Çizgi filmlerde plan süresi · 13 Kasım 2026

Çizgi filmlerde ve seçimli animasyonlarda her kamera planı, yalnızca olağanüstü bir anlatım gereği dışında, kesintisiz en az 2,5 saniye ekranda kalır. Süre her kesmeyle yeniden başlar. Beş saniyelik geniş plandan konuşanın yakın planına geçildiğinde, yakın planın da kendi 2,5 saniyesi vardır. Replik veya hareket daha fazla süre istiyorsa planı uzatın. Aynı kadrajdaki ağız, bakış ve hareket pozları normal hızında akar ve plan süresini sıfırlamaz. Teslimden önce son oynatımda ardışık kesmeler arasındaki süreyi kontrol edin.


## Seçimli çizgi filmi ilk üretimde kurma

Her kararı başta, çocuğun göreceği eylemle birlikte tasarla. Çizime geçmeden önce hareketin başlangıcını, temasını, bitişini, kamera açısını ve sonraki planda nesnenin nerede kalacağını belirle. İlk karardan son finale kadar aynı üretim standardını uygula. Kartı kendi kadrajında ayrı çiz; seçilince eylemi karakter sheet’leriyle oynat. Replik eylemin sonucunu söylüyorsa çocuk o hareketi önce görmeli. Bir dalı örnek dal kadar tamamladıktan sonra sonraki dala geç.
