# KİNO: FIRTINA GELİYOR! (Zamana Karşı Yarış)
*(Detroit: Become Human Tarzı — Anne-Babayı Ekrana Kilitleyen İnteraktif Bölüm Senaryosu)*

---

## 1. PROJE KİMLİĞİ VE "WOW" FAKTÖRÜ

* **Konsept:** Gökyüzü aniden kararır, gök gürler (*GÜM!*). Fırtınanın kopmasına tam **10 dakika** vardır! Bahçede unutulan eşyalar, açık kalan kapı, sırılsıklam olma tehlikesi ve ardından gelen elektrik kesintisi...
* **Neden Anne-Baba "WOW" Deyip Kendisi Oynamak İster?**
  1. **Gerçek Zaman Baskısı (Ticking Clock):** Her kararda arka plandaki gökyüzü daha da koyulaşır, rüzgâr hızı artar, ilk damlalar düşmeye başlar. Seyircinin kalbi hızlanır.
  2. **Derin Önceliklendirme İkilemi:** Çocuğun duygusu mu (Lokum'un çok sevdiği Kuzu oyuncağı), ailenin emeği mi (Baba'nın bahçede soğumaya bıraktığı taze ekmek tepsisi), yoksa arkadaşlık mı (Mino'nun açık bahçe kapısındaki bisikleti)?
  3. **Korkudan Eğlence Yaratma (Elektrik Kesintisi Perdesi):** Şimşek çakıp ışıklar gittiğinde, karanlık korkusunu **Gölge Tiyatrosuna** veya **Battaniye Kalesine** dönüştüren pedagojik bir zafer yaşanır.
  4. **Yüksek Tekrar Oynanabilirlik:** 4 Farklı Büyük Final + 3 Sürpriz Erken Son + Toplanabilir 4 Başarım Rozeti!

---

## 2. DETROIT HUD VE EKRAN SİSTEMİ (Çizer ve Yazılımcı İçin)

Ekranda gereksiz karmaşa yoktur; okul öncesi sadeliğinde ama *Detroit* ciddiyetinde çalışan bir HUD vardır:

* **Fırtına Barı (Ekranın Üstü):** 
  - Gökyüzü rengi: Sarı Güneş ➔ Mor Bulutlar ➔ Gece Karanlığı + Şimşek.
* **Karakter İlişki İbreleri (Seçim sonrası sağ üstte minik pencereler):**
  - `[Lokum Güveni ↑ / ↓]`
  - `[Kuzu Kurtarıldı mı? (Evet / Çamurlu / Islak)]`
  - `[Ekmek Tepsisi (Kurtarıldı / Islandı)]`
* **Animasyon Prodüksiyon Kolaylığı (`+Katman` Sistemi):**
  - **Ana Arka Plan 1:** Çınar Apartmanı Ön Bahçesi (Rüzgâr efekti üst katmanda overlay olarak döner).
  - **Ana Arka Plan 2:** Evin Salonu (Gündüz / Elektrik Kesintisi / Mum Işığı olmak üzere 3 ışık katmanı).
  - Karakterler tek bir taban pozdan türetilir; seçimlere göre eldeki nesne (Kuzu / Tepsi / Fener) katman olarak değişir.

---

## 3. KARAR AĞACI VE AKIŞ ŞEMASI (FLOWCHART)

```
                       [0. BAŞLANGIÇ: FIRTINA ALARMI]
                        (Rüzgâr uğuldar, ilk damlalar)
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
     [SEÇENEK A: KUZU'YA KOŞ]                       [SEÇENEK B: EKMEK TEPSİSİNE KOŞ]
     (Duygusal Karar: Lokum mutlu,                 (Sorumluluk Kararı: Ekmek kurtulur,
      ama ekmek tepsisi tehlikede)                   ama Kuzu kum havuzunda ıslanır)
              │                                               │
              ├───────────────┐                               ├───────────────┐
              ▼               ▼                               ▼               ▼
      [A1: Kapıyı Kapat] [A2: Mino'ya Seslen]         [B1: Kuzu'yu Kurtar] [B2: Hemen İçeri Kaç]
              │               │                               │               │
              └───────┬───────┘                               └───────┬───────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                              [PERDE 2: ELEKTRİK KESİLİYOR!]
                               (Şimşek çakar, ev kararır)
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
            [SEÇİM 1: FENERİ AL]     [SEÇİM 2: KALE KUR]    [SEÇİM 3: PENCEREYİ İZLE]
            (Dedektif Kino)          (Battaniye Sığınağı)    (Yağmur Müziği)
                      │                       │                       │
                      ▼                       ▼                       ▼
                 [FİNAL 1]               [FİNAL 2]               [FİNAL 3]
            "IŞIK DEDEKTİFLERİ"      "FIRTIINA KALESİ"       "YAĞMUR ORKESTRASI"
```

---

## 4. TAM SENARYO VE DİYALOGLAR

### GİRİŞ SAHNESİ: Uğuldayan Rüzgâr | 0:00–0:45
**Görsel:** Çınar Apartmanı’nın ön bahçesi. Birden kuvvetli bir rüzgâr çıkar (*VUŞŞŞ!*). Yerdeki kuru sarı çınar yaprakları havaya savrulur. Gökyüzü morarır. Ağaçlar sallanır. Uzaktan derinden bir gök gürültüsü duyulur: *GÜÜÜM…*  
Kino ve 2 yaşındaki kardeşi Lokum bahçededir. Lokum’un kulakları rüzgârda geriye yatar.  
Mutfak balkonundan Anne Defne telaşla seslenir:  
**Anne** — Çocuklar! Fırtına patlamak üzere, gök boşalacak! Hemen her şeyi toplayıp içeri gelin!  
**Anlatıcı** — Gökyüzü kararıyor, ilk yağmur damlaları düşmek üzereydi. Ama bahçede iki büyük tehlike vardı: Lokum’un çok sevdiği Kuzu kum havuzunda kalmıştı. Masanın üstünde ise Baba’nın yeni pişirdiği sıcacık ekmek tepsisi duruyordu!  

---

### 1. BÜYÜK KARAR: NEYİ ÖNCE KURTARACAKSIN? | 0:45

> **EKRANDA SEÇİM KARTLARI BELİRİR (Geri Sayım Barı: 10 Saniye):**
> 
> * **[KART A] KUZU’YU KURTAR:** Kum havuzuna koş, Lokum’un oyuncağını al. *(Öncelik: Kardeşin kalbi)*
> * **[KART B] EKMEK TEPSİSİNİ KURTAR:** Masaya koş, ağır tepsiyi içeri taşı. *(Öncelik: Aile emeği)*
> * **[KART C - GİZLİ CESUR SEÇİM] LOKUM’LA EL ELE VER:** Lokum’a görev ver, ikisini birden kurtarmayı dene!

---

#### [KART A SEÇİLİRSE] KUZU KURTARMA OPERASYONU
**Görsel:** Kino kum havuzuna doğru rüzgâra karşı koşar. Kuzu’yu kumların arasından kapar: *Pıt!* Kuzu tertemizdir. Lokum kapı önünde ellerini çırpar: *"Kuzu geldi!"*  
Ama o sırada gökyüzünden ilk iri damlalar düşmeye başlar: *Şıp… şıp…*  
Bahçe masasındaki ekmek tepsisinin üzerine damlalar düşmektedir!  
**Kino** — Kuzu güvende ama ekmekler ıslanıyor!  
Tam o sırada bahçe kapısından arkadaşı Mino geçer. Mino’nun kafasında sarı yağmurluğu vardır.  

> **2. KARAR (A Seçeneğinin Devamı):**
> * **[A1] MİNO’DAN YARDIM İSTE:** "Mino! Tepsiyi tut, birlikte içeri taşıyalım!" *(Takım çalışması)*
> * **[A2] KENDİN KOŞ:** Kuzu’yu Lokum’a at, bütün gücünle tepsiye koş! *(Bireysel kahramanlık)*

* **A1 Sonucu:** Mino ve Kino iki ucundan tutarak tepsiyi içeri sokarlar. Mino da fırtınadan kaçıp onlara misafir olur! *(Mino Ekibe Katıldı!)*
* **A2 Sonucu:** Kino tek başına koşar, tepsiyi kaldırırken iki ekmek çimlere yuvarlanır. Ekmekler biraz ıslanır ama çoğunu kurtarır.

---

#### [KART B SEÇİLİRSE] EKMEK TEPSİSİ OPERASYONU
**Görsel:** Kino doğruca bahçe masasına koşar. Ağır metal tepsiyi iki eliyle kavrar. Bacakları titreyerek antre kapısına doğru taşır: *"Çok ağırsınız ama sizi kurtaracağım!"* Tepsiyi antreye bırakır. Baba Murat kapıda görünür:  
**Baba** — Harikasın Kino! Ekmeğimizi kurtardın!  
Ama tam o sırada dışarıda yağmur hızlanır: *ŞORRR!*  
Kum havuzundaki Kuzu sırılsıklam çamura bulanmıştır! Lokum kapının önünde Kuzu’yu çamurlu görünce alt dudağı büzülür, ağlamaya başlar:  
**Lokum** — Kuzu banyo oldu! Kuzu üşüdü!  
Kino kardeşinin gözyaşlarını görünce içi cız eder.  

> **2. KARAR (B Seçeneğinin Devamı):**
> * **[B1] HEMEN KURTARMAYA ÇIK:** Yağmura aldırma, dışarı fırlayıp Kuzu’yu kap! *(Biraz ıslanacaksın ama Kuzu kurtulacak)*
> * **[B2] İÇERİDEN ÇÖZÜM BUL:** Şemsiyeyi al, kapıdan uzanarak Kuzu’yu çek. *(Akılcı çözüm)*

* **B1 Sonucu:** Kino sırılsıklam olur ama Kuzu’yu kucaklar. Anne havluyla ikisini birden sarar. Lokum abisine sarılır: *"Cesur abi!"*
* **B2 Sonucu:** Kino uzun saplı şemsiyeyle Kuzu’yu çeker, çamura batmadan alır. Banyoda Kuzu’ya saç kurutma makinesiyle kuaför yaparlar!

---

#### [KART C SEÇİLİRSE] "TAKIM ÇALIŞMASI" (Efsane Yol)
**Görsel:** Kino, Lokum’un yanına çömelir:  
**Kino** — Lokum, sen bir kaptansın! Sen koşup Kuzu’yu kucakla, ben tepsiyi alıyorum! Hazır mısın?  
**Lokum** *(gözleri parlayarak)* — Kaptan Lokum!  
İki kardeş aynı anda iki yöne koşar. Lokum kum havuzundan Kuzu’yu kapar, Kino tepsiyi alır. İlk sağanak tam tepelerine inerken ikisi aynı anda kapıdan içeri dalarlar! Kapı rüzgârda arkalarından *GÜMM* diye kapanır. İkisi de nefes nefese gülerler!  
**Başarım Açıldı:** 🏆 *"Çifte Kurtarma Ustaları"*

---

### PERDE 2: ELEKTRİK KESİLİYOR! | 2:00–3:00

**Görsel:** Dışarıda kıyamet kopmaktadır. Camlara vuran yağmur sesi: *ŞAKIR-ŞUKUR!* Rüzgâr pencereleri titretir.  
Ve birden gökyüzünde devasa mavi-beyaz bir şimşek çakar: **ÇAAAAAT!**  
Hemen ardından gök gürültüsü evi sarsar: **GÜÜÜÜÜÜÜM!**  
Ve evdeki tüm ışıklar bir anda söner: *Çıt.*  
Ev zifiri karanlık olur. Sadece şimşek çaktıkça duvarda canavar gibi titreyen dev mobilya gölgeleri görünür.  
Lokum korkuyla çığlık atar, salon masasındaki örtünün altına saklanır:  
**Lokum** *(titreyerek)* — Işık gitti! Canavar geldi!  
Baba mutfaktan seslenir:  
**Baba** — Korkmayın çocuklar! Fırtınadan elektrikler kesildi, ben sigortalara bakıyorum. Kino, kardeşinin yanından ayrılma!  

---

### 3. BÜYÜK KARAR: KARANLIKTA NE YAPACAKSIN? | 3:00

> **EKRANDA SEÇİM KARTLARI BELİRİR:**
> 
> * **[KART 1] FENER DEDEKTİFİ:** Çekmecedeki sarı feneri bul, duvardaki gölgelere ışık tut! *(Korkunun üstüne gitme yolu)*
> * **[KART 2] BATTANİYE KALESİ:** Masanın altındaki örtüyü indir, minderlerle karanlık geçirmeyen güvenli sığınak yap! *(Konfor ve kardeş şefkati)*
> * **[KART 3] YAĞMUR ORKESTRASI:** Cama yaklaş, gök gürültüsüne tencere kapağıyla eşlik et! *(Mizah ve ters köşe)*

---

### FİNALLER (HER KARAR FARKLI BİR MACERA BİTİRİR)

#### FİNAL 1: "IŞIK DEDEKTİFLERİ VE GÖLGE TİYATROSU" (Kart 1 Seçilirse)
Kino el yordamıyla çekmeceden sarı feneri çıkarır: *Tık!*  
Karanlığın ortasında bembeyaz güçlü bir ışık çemberi doğar.  
Kino feneri duvardaki o "korkunç canavar gölgesine" tutar. O da ne?! Canavar dedikleri şey, portmantodaki Kino’nun kendi montu ve tavşan kulaklı şapkasıdır!  
Kino iki elini fenerin önüne koyar, parmaklarını oynatır: Duvarda kocaman burnunu kıpırdatan bir tavşan gölgesi belirir!  
Lokum masanın altından kafasını çıkarır, kıkırdamaya başlar:  
**Lokum** — Tavşan! Havuç yiyor!  
Mino ve Baba da gelir. Mumları yakarlar. Bütün aile fırtına dinene kadar duvarda gölge tiyatrosu oynar.  
*Kazanılan Rozet:* 🏅 **Karanlık Avcısı**

#### FİNAL 2: "FIRTINA KALESİ VE SICAK KURABİYE" (Kart 2 Seçilirse)
Kino koltuktaki kareli kalın battaniyeyi çeker, yemek masasının dört köşesine gerer. Yere yumuşacık pofuduk minderleri dizer. Masanın altı sıcacık, küçük bir ışık mağarasına döner.  
Lokum ve Kuzu içeri sığınır. Kino da yanlarına girer, cebindeki küçük anahtarlık fenerini tepeye asar.  
Anne Defne fırından çıkan sıcak ekmeklerden tereyağlı dilimler getirir. Dışarıda şimşekler çakarken, içeride üçü birden masanın altında piknik yaparlar.  
Lokum başını abisinin omzuna yaslar:  
**Lokum** — Fırtına dışarıda kaldı. Biz kaledeyiz.  
*Kazanılan Rozet:* 🏅 **Sığınak Mimarı**

#### FİNAL 3: "GÖK GÜRÜLTÜSÜ ORKESTRASI" (Kart 3 Seçilirse)
Kino korkmak yerine mutfaktan iki küçük tencere kapağı alır. Cama doğru yürür:  
**Kino** — Gök gürültüsü bize bağırıyorsa, biz de ona şarkı söyleyelim!  
Şimşek çakar: *ÇAAAT!*  
Kino kapakları birbirine vurur: *ŞLAAANG!*  
Lokum masanın altından tahta kaşıkla katılır: *Tak-tak-tak!*  
Baba ıslık çalar, Anne şarkıya başlar. Fırtınanın korkunç gürültüsü, evin içindeki kahkaha dolu bir rock konserine dönüşür! Gök gürültüsü bile sanki onların ritmine ayak uydurur.  
*Kazanılan Rozet:* 🏅 **Fırtına Maestro'su**

---

## 5. ERKEN SONLAR (OYUNCU YANLIŞ / İLGİSİZ TERCİH YAPARSA)

1. **Erken Son 1: "Sırılsıklam Kedi Mino"**  
   *Nasıl Açılır:* İlk seçimde bahçedeki hiçbir şeyi umursamayıp kendi ayakkabısını bağlamaya dalarsa.  
   *Sonuç:* Yağmur aniden boşalır. Kino, Kuzu ve ekmekler sırılsıklam olur. Anne kapıyı açıp hepsini banyoya sokar. Çizgi film erken biter: "Bazen ayakkabıdan önce fırtınaya bakmak gerekir!"
2. **Erken Son 2: "Rüzgârla Uçan Şapka"**  
   *Nasıl Açılır:* Ekmek tepsisini bırakıp rüzgârda uçan eski bir gazeteyi kovalamaya kalkarsa.  
   *Sonuç:* Gazete bahçe duvarını aşar, Kino çamura saplanır. Baba gelip onu kucaklar. Görev başarısız olur, tekrar deneme ekranı gelir.

---

## 6. NEDEN BU FORMAT EKRANA KİLİTLER? (ANNE-BABA VE ÇOCUK İÇİN)

1. **Pasif İzleme Değil, Aktif Hayat Becerisi:** Çocuk sadece çizgi film izlemez; fırtınada neyin önce kurtarılacağını, panik anında ne yapılacağını, elektrik gidince korkmak yerine gölgeden oyun türetmeyi **bizzat seçerek yaşar**.
2. **Ebeveynin Katılım İştahı:** Anne-baba çocuğuyla yan yana otururken *"Dur Kino tepsiyi alsın yoksa ekmekler mahvolacak!"* veya *"Lokum'a koş, ağlamasın!"* diyerek oyuna dahil olur.
3. **Karakter İlişki Derinliği:** Kardeşlik bağı (Kino-Lokum), arkadaşlık dayanışması (Mino) ve ebeveyn güveni mükemmel bir dengede harmanlanmıştır. Sıfır klişe, yüzde yüz organik heyecan.
