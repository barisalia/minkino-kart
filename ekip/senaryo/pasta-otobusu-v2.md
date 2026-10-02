# Mino'nun Pasta Otobüsü · v2: derinleştirme

> Barış oynadı (2026-10-02): **"Çok basit, derinleştir; çocukların istediği kurabiye tipsiz."**
> Hedef: Sosisçi Buş (Hot Dog Bush) derinliği, ama 4-7 yaş için. Mevcut çekirdek kalıyor: sipariş balonu → hamur → kalıp → fırın → krema → süs → servis.
> Kurallar aynı:
> - Yaş ayarı yok.
> - "Kaybettin" yok; müşteri gitmez, sadece uyuklar.
> - Hata komik.
> - Her yeni şey **bir günde bir tane** açılır, böylece çocuk boğulmaz.

## 0. Üç ana sorun ve çözümü
| Sorun | Çözüm |
|---|---|
| **Ürünler tipsiz** (düz, kodla çizilmiş kurabiye) | Ürünler **Gemini'de çizilir**, katmanlı: taban, krema, süs. Krema **parmakla desen çizerek** sıkılır, serpinti **sallayarak** dökülür, kurabiyeye **yüz** yapılır. Her ürün "vay!" dedirtecek kadar güzel. |
| **Tek döngü, derinlik yok** | **Çok adımlı sipariş** (tatlı + içecek + paket), **paralel iş** (Kino'ya görev ver), **yükseltmeler** oyunu gerçekten değiştiriyor (2. fırın gözü, makineler). |
| **İlerleme hissi zayıf** | **10 gün**, her gün bir yenilik, **günlük hedef** ve 3 yıldız, **mekân** değişiyor (park → okul → plaj → karlı bahçe → şenlik). Hava, siparişi değiştiriyor. |

> Not (ekip kuralı): Önemli eşyalar kodla SVG çizilmez. **Gemini çizer, Adobe temizler, kodcu bağlar.** Kod yalnız katmanları (krema izi, serpinti taneleri, dolum seviyesi) yönetir.

---

## 1. Ürünler: güzellik ve çeşit

### 1a. Krema deseni: parmakla sık (Gün 1'den itibaren, temel)
- **Ekranda:** Krema torbasına dokununca kurabiyenin üstünde **kesik çizgiyle bir desen** belirir: siparişte hangisi isteniyorsa.
- **Desenler:** düz kaplama (tek dokunuş), **zigzag**, **dalga**, **noktalar**, **kalp**, **spiral** (Gün 5+).
- **Çocuk:** Parmağıyla deseni takip eder. Krema parmağın arkasından **kalın, parlak bir şerit** olarak çıkar (Çiz Canlansın'daki şablona çekme).
  - Zigzag ve dalga **çizgi çalışması**, yani okuma-yazmaya hazırlık. "Okula Hazırım!" ile örtüşür.
  - Noktalarda her nokta bir dokunuş (sayma: "4 nokta").
- **Dokunuş:** desen başına 1 sürükleme ya da 3-6 dokunuş.
- **Gemini:** krema şeridi doku çizgisi (beyaz parlak çizgili, 6 renk). Kodcu bunu parmak yolu boyunca döşer.

### 1b. Serpinti: salla (Gün 1)
- **Ekranda:** Serpinti kavanozları: renkli (gökkuşağı), pembe kalpler, yıldız şeker, çikolata parçası.
- **Çocuk:** Kavanoza dokunur, kavanoz kurabiyenin üstüne gelir; parmakla **sağa sola sallar**, taneler yağar. Az salla az, çok salla çok.
- Sipariş "bol serpinti" mi "az serpinti" mi resimden belli (taneli ikon 1 ya da 3).
- **Dokunuş:** 1 + sallama.
- **Gemini:** 4 kavanoz; serpinti taneleri (sprite: 8-10 tane şekil × renk).

### 1c. Yüzlü kurabiye (Gün 2)
- **Sipariş:** Kurabiyede bir **yüz ifadesi** var: gülen, şaşkın (O ağız), göz kırpan, dil çıkaran.
- **Çocuk:**
  - **Göz:** 2 çikolata damlası (2 dokunuş). Göz kırpan için bir göz yerine çizgi krema.
  - **Ağız:** krema ile gülümseme yayı ya da O dairesi (desen izleme).
  - **Yanak:** 2 pembe şeker (2 dokunuş).
- **Eğitici:** duyguları tanıma. Müşteri yüzü görünce aynı ifadeyi yapar (gülen kurabiye → müşteri güler). Çocuk yaptığı yüzün etkisini görür.
- **Gemini:** çikolata damlası, pembe yanak şekeri, şeker göz (beyaz + siyah).

### 1d. Kapkek (Gün 3)
- **Adımlar:**
  1. **kâğıt kalıp rengi** seç (1 dokunuş),
  2. **hamur doldur**: basılı tut, hamur yükselir, **çizgide bırak** (taşarsa Kino'nun burnuna sıçrar),
  3. fırın,
  4. **krema yığını**: basılı tut, krema kat kat yükselir. Sipariş 1, 2 ya da 3 kat ister (sayma).
  5. üstüne meyve ya da şeker.
- **Gemini:** 4 renk kâğıt kalıp, kapkek tabanı (çiğ ve pişmiş), krema katı (3 renk), üst süsler (çilek, kiraz, şeker yıldız).

### 1e. Donut (Gün 5)
- **Adımlar:**
  1. halka kalıp,
  2. fırın,
  3. **sır kasesine daldır**: donut'ı sürükleyip kaseye batır, çıkar; sır rengi siparişte,
  4. serpinti sal.
- **Gemini:** donut tabanı (çiğ, pişmiş), 4 sır rengi (pembe, çikolata, beyaz, mavi), sır kaseleri.

### 1f. Kurabiye sandviç (Gün 7)
- İki kurabiye pişir → birinin üstüne krema sık → öbürünü **üstüne sürükle, kapat**. Kenardan krema taşar, çok tatlı durur.
- **Gemini:** kenarından krema taşan sandviç hâli (3 krema rengi).

### 1g. Kapkek kulesi (Gün 8, doğum günü)
- 3 kapkek **büyükten küçüğe** üst üste dizilir (sıralama), tepeye **yaş kadar mum** konur (sayma), sonra müşteri üfler.
- **Gemini:** üç boy kapkek, mum (yanık ve sönük).

### 1h. Pasta dilimleme (Gün 9): kesirler
- Bütün yuvarlak pasta. Sipariş: **"Pastayı 4 arkadaşa böl."** Balonda 4 tabak resmi var.
- **Çocuk:** Pastanın üstünde parmakla **ortadan bir çizgi** çeker: 2 yarım. Sonra öbür yönde bir çizgi daha: 4 çeyrek. Dilimler tabaklara kayar.
- Kesik kılavuz çizgileri görünür; eğri çekilse bile kod dilimleri eşit böler.
- **Eğitici:** yarım, çeyrek, eşit paylaşma. Mino: *"İkiye böldük, yarım oldu!"*
- **Gemini:** bütün pasta (üstten), yarım ve çeyrek dilim, tabak.

---

## 2. Çok adımlı sipariş

### 2a. İçecekler (Gün 4) · "İçecek makinesi" yükseltmesi ile açılır
- **İçecekler:** süt, kakao, limonata.
- **Çocuk:**
  1. **bardak boyu** seç (küçük / büyük; 1 dokunuş),
  2. musluğun altına koy, **basılı tut**: bardak dolar; bardakta **çizgi** var, çizgide bırak (taşarsa Kino siler, ceza yok),
  3. **üst süs**: kakaoya 2 marşmelov ya da köpük; limonataya limon dilimi (sipariş kaç tane diyorsa, sayma).
- **Dokunuş:** 1 + basılı tut + 1-3.
- **Gemini:** 2 bardak boyu (boş), 3 içecek dolum rengi (kod seviyeyi maskeler), marşmelov, limon dilimi, köpük, içecek makinesi (3 musluklu).

### 2b. Sipariş balonu iki ya da üç kalemli olur
- Balonda yan yana ikonlar: **[tatlı] + [içecek]**, Gün 6'dan sonra + **[paket çantası]**.
- Tepside her kalem hazır oldukça balondaki ikonu **yeşil tikle** işaretlenir. Çocuk neyin kaldığını görür (plan yapma).

### 2c. Paketleme (Gün 6) · "Paket masası" yükseltmesi
- Balonda **çanta ikonu** varsa müşteri "götürecek".
- **Çocuk:**
  1. kutu rengini seç,
  2. tatlıyı kutuya sürükle,
  3. kapağa dokun,
  4. **kurdele**: kurdele rengine dokun, kutunun üstünde fiyonk olur.
- **Dokunuş:** 4.
- **Gemini:** 3 renk kutu (açık ve kapalı), 3 renk fiyonk, kese kâğıdı.

---

## 3. İlerleme: 10 gün, hedef, yıldız, yükseltme

### 3a. Günlük hedef ve yıldızlar
- **Gün başında** Mino bir hedef söyler, ekranın üstünde ikonla durur: *"Bugün 5 mutlu müşteri!"*
- **Mutlu müşteri** = sipariş tam aynı (kalpler çıkar).
- **Günün sonunda 1-3 yıldız:**
  - 1 yıldız: gün bitti (her zaman).
  - 2 yıldız: hedef tuttu.
  - 3 yıldız: hedef + hiç uyuyan müşteri yok.
- Yıldızlar **yükseltme** açar, jetonlar **süs** alır. İki para birimi çocuğu karıştırmasın diye yükseltmeler yıldızla, kozmetikler jetonla.

### 3b. Yükseltmeler (oyunu gerçekten değiştiren)
| Yükseltme | Açılır (yıldız) | Oyuna etkisi | Gemini |
|---|---|---|---|
| **2. fırın gözü** | Gün 2 sonu | Aynı anda 2 tepsi, paralel üretim başlar | fırın 2 gözlü hâli |
| **İçecek makinesi** | Gün 3 sonu | İçecek siparişleri açılır | makine |
| **Hamur makinesi** | Gün 4 sonu | "Kaç top?" sorusuna **rakama** dokununca o kadar hamur topu çıkar. Sayma kaybolmaz, rakam tanıma eklenir | makine + rakam tuşları |
| **Hızlı fırın** | Gün 5 sonu | Pişme %30 hızlı | fırın parlak yeni hâli |
| **Paket masası** | Gün 5 sonu | Paket siparişleri açılır | masa |
| **Büyük kavanozlar** | Gün 6 sonu | Serpinti ve un geç biter, Kino'ya daha az iş | büyük kavanoz seti |
| **3. fırın gözü** | Gün 8 sonu | Şenlik günü için | fırın 3 gözlü |

### 3c. Mekânlar (hava, siparişi değiştirir; mantık)
| Gün | Mekân | Hava ve müşteri | Siparişlere etkisi |
|---|---|---|---|
| 1-3 | **Park** | güneşli | kurabiye, kapkek |
| 4-5 | **Okul önü** | sabah | süt ve kurabiye; "paylaşmalık" çoklu siparişler |
| 6-7 | **Plaj** | çok sıcak | **limonata çok satılır**, çikolata erir (çikolata yok, meyveli tercih) |
| 8-9 | **Karlı bahçe** | soğuk | **kakao çok satılır**, sıcak tatlılar; müşteriler atkılı |
| 10 | **Şenlik** (park, süslü) | şenlik | büyük karma siparişler, doğum günü, pasta dilimleme |

Arka planlar hazır (park, okul, plaj, karlı bahçe; yönetici notu). Otobüs mekân değiştirirken kısa bir yolculuk animasyonu var: Kino camdan kafasını çıkarır, kulakları uçuşur.

### 3d. 10 günlük açılış tablosu
| Gün | Yeni | Hedef |
|---|---|---|
| 1 | Krema deseni (düz, zigzag) + serpinti | 3 mutlu müşteri |
| 2 | **Yüzlü kurabiye** | 4 mutlu |
| 3 | **Kapkek** (doldur, krema katı) | 4 mutlu |
| 4 | **İçecekler** + okul önü + Kino görevi: bulaşık | 5 mutlu |
| 5 | **Donut** + **acelesi olan müşteri** | 5 mutlu |
| 6 | **Paketleme** + plaj + **desen tamamlama** siparişi | 5 mutlu |
| 7 | **Kurabiye sandviç** + **kafası karışık müşteri** + Kino görevi: un çuvalı | 6 mutlu |
| 8 | **Doğum günü kapkek kulesi** (yaş kadar mum) + karlı bahçe + **para üstü** | 6 mutlu |
| 9 | **Pasta dilimleme** (yarım, çeyrek) + **Ege'nin annesi** | 6 mutlu |
| 10 | **Şenlik:** Pamuk + büyük karma siparişler, hepsi bir arada | 8 mutlu, sonunda kutlama ve "Usta Pastacı" rozeti |

---

## 4. Özel müşteriler (her biri bir ders + bir şaka)
| Müşteri | Gün | Ekranda | Öğrettiği |
|---|---|---|---|
| **Acelesi olan** (tavşan, saatli) | 5 | Balonda **saat ikonu**; sabır kalbi 2 kat hızlı dolar; hızlı servise **2 kat bahşiş** | önceliklendirme: "önce onu yapalım" |
| **Kafası karışık** (ördek) | 7 | Hamur aşamasında balon değişir: *"Şey… pembe miydi? Hayır, mavi!"* Değişiklik **krema öncesinde** gelir, çocuğun emeği boşa gitmez | esneklik, dikkat (değişen balonu fark etmek) |
| **Doğum günü** (Ada, Can, Elif) | 8 | Balonda pasta + **yaş kadar mum** (5 mum resmi) | sayma; mumları müşteri üfler |
| **Ege'nin annesi** | 9 | Balonda yumuşak kurabiye, **serpintinin üstü çizili** ikon: "Ege bebek, şekersiz" | işaret okuma (yasak işareti), bebeğe uygun yemek |
| **Pamuk** (Dedektif'ten) | 10 | Her şey **pembe**: pembe krema, pembe kurdele, kalp serpinti | tutarlılık; karakter evrenine bağ |
| **Desen sever** (kuş) | 6 | 4 kurabiyelik sipariş: **kırmızı-mavi-kırmızı-?** Çocuk örüntüyü tamamlar | örüntü (matematik) |
| **"Bir fazla" isteyen** (ayı) | 3+ | *"Tavşanınkinden bir fazla çilek!"* Balonda tavşanın kurabiyesi + "+1" | bir fazla |

**Para üstü (Gün 8+):** Tatlının yanında jetonla fiyat etiketi var (3 jeton). Müşteri 5 jeton verir. Çocuk kasadan **2 jeton** geri sürükler. Görsel yardım: fiyat kadar jeton gri gösterilir, kalanlar parlar. Yanlışta müşteri gülümseyip doğru sayıyı gösterir.

---

## 5. Kino'nun işleri: paralel görev
- **Görev panosu:** Ekranın sağ altında Kino'nun yanında 3 ikon: **bulaşık**, **un çuvalı**, **kavanoz doldur**. İkonlar ancak gerektiğinde parlar.
  - **Bulaşık (Gün 4):** Servis edilen tabaklar tezgâhın kenarında **üst üste birikir**. 4 tabak birikince temiz tabak kalmaz (servis bekler) ve kule komik şekilde sallanır. Çocuk "bulaşık" ikonuna dokununca Kino lavaboya koşar, 8 sn köpüklü yıkama yapar (köpük kafasında), temiz tabaklar geri gelir.
  - **Un çuvalı (Gün 7):** Hamur kabı boşalır (kab üstünde gösterge). Görev verilince Kino çuvalı sürükleyerek getirir, devrilir, un bulutu çıkar, bembeyaz olur. Kab dolar.
  - **Kavanoz doldur:** Serpinti kavanozu boşalınca.
- **Paralel his:** Kino işini yaparken çocuk sipariş yapmaya devam eder, Kino'nun üstünde küçük bir ilerleme halkası döner. Görev verilmezse ceza yok, sadece akış durur ve Kino *"Bana iş ver!"* diye el sallar.
- **Dokunuş:** görev başına 1.
- **Gemini:** Kino'nun lavaboda köpüklü pozu, çuval taşıma pozu, unlu bembeyaz Kino; tabak kulesi; un çuvalı.

---

## 6. Eğitici katman (özet)
| Beceri | Nerede |
|---|---|
| Sayma | hamur topları, noktalar, krema katı, mum, marşmelov ve limon, jeton |
| Rakam tanıma | hamur makinesi (Gün 4+) |
| Renk ve şekil | krema, kalıp, kutu, kurdele |
| Çizgi çalışması | krema desenleri (zigzag, dalga, spiral) |
| Duygular | yüzlü kurabiye |
| Örüntü | desen sever müşteri |
| Bir fazla | ayının siparişi |
| Kesirler | pasta dilimleme |
| Para üstü | Gün 8+ |
| Plan ve paralel iş | 2. fırın, çok kalemli sipariş, Kino görevleri |
| Hava ve mantık | plajda limonata, karda kakao |

---

## 7. MVP sırası (ilk 4-5 derinleştirme; Barış'ın "tipsiz" itirazı önce)
1. **Ürün güzelliği:** Gemini'den katmanlı kurabiye seti (4 şekil × çiğ/pişmiş/yanık), krema deseni (parmakla), serpinti (sallama), **yüzlü kurabiye**. *En büyük "vay" etkisi, en önce bu.*
2. **Günlük hedef + 3 yıldız + 2. fırın gözü:** derinlik ve "bir gün daha" isteği.
3. **İçecek istasyonu + iki kalemli sipariş:** bardak doldurma, çizgide durma.
4. **Kino görev panosu (bulaşık):** paralel iş hissi.
5. **Özel müşteriler:** doğum günü (mum), kafası karışık, Ege'nin annesi.

Sonra kapkek, donut, paketleme, mekânlar ve hava, desen tamamlama, pasta dilimleme, para üstü.

## 8. Gemini görsel listesi (MVP 1-5 için, öncelik sırasıyla)
1. **Kurabiye tabanları:** yuvarlak, yıldız, kalp, ayı kafası (çiğ, altın, yanık hâlleri). Kare 2048, beyaz zemin, üstten 3/4.
2. **Krema şeritleri:** 6 renk (pembe, mavi, sarı, beyaz, çikolata, yeşil); parlak, kalın çizgili.
3. **Serpinti:** 4 kavanoz + taneler (gökkuşağı çubuk, pembe kalp, sarı yıldız, çikolata).
4. **Yüz süsleri:** çikolata damlası, şeker göz, pembe yanak şekeri.
5. **2 gözlü fırın** (cam kapaklı, içi turuncu ışıklı).
6. **İçecek makinesi** (3 musluk: süt, kakao, limonata) + 2 bardak boyu + marşmelov + limon dilimi + köpük.
7. **Kino pozları:** lavaboda köpüklü, unlu bembeyaz, "Bana iş ver!" el sallama.
8. **Tabak kulesi** (1-4 tabak), lavabo.
9. **Doğum günü:** mum (yanık, sönük), küçük pasta.
10. **Yıldız ve hedef ikonları**, mutlu müşteri kalbi.
