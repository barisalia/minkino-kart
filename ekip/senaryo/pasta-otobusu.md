# Oyun: Mino'nun Pasta Otobüsü (ilk sürüm)

> Durum: Barış onayladı (2026-10-02): "Sosisçi Buş gibi; tık tık yapacak, pişirecek, verecek; ama eğitici. Resimli sipariş güzel, resimden o şeyi yapsın, yapması basit olsun."
> Yaş: 4-7 (asıl 5-6). Yaş ayarı YOK.
> Önceki `mino-pastanesi.md` ve `pastane-cumleler.md` GEÇERSİZ.

## Fikir
Mino ile Kino'nun pembe bir pasta otobüsü var. Otobüs parka gelir, yan kapağı açılır, tezgâh ortaya çıkar. Müşteriler sıraya girer. Her müşterinin başının üstünde **resimli bir sipariş balonu** var. Çocuk **o resmin aynısını** yapar: tık tık hamur, kalıp, fırın, krema, süs, sonra teslim ve jeton.
**Eğitici yan siparişin içinde:** resme bakıp kopyalamak (dikkat), saymak (kaç kurabiye, kaç çilek), renk ve şekil, pişme zamanı (renk değişimi), para.

## Ekran (yatay, tek ekran)
```
[ Pencere: park, sırada 1-3 müşteri, balonlarında sipariş ]
------------------------------------------------------------
[HAMUR] [KALIPLAR ○ ☆ ♡] [FIRIN ▢▢▢] [KREMA ●●●] [SÜSLER 🍓🍫🍌] [SERVİS TABAĞI]
                     Mino tezgâhta · Kino fırının yanında · Kasa
```
Her şey tek dokunuşla çalışır. Sürükleme isteğe bağlı: tabak ya da kurabiye müşteriye sürüklenebilir, kurabiyeye dokunup müşteriye dokunmak da olur.

## Bir sipariş nasıl yapılır? (her biri 30-60 sn)
**Örnek sipariş balonu:** iki yıldız kurabiye, mavi kremalı, her birinin üstünde bir çilek. Yazı yok, resim var. Mino bir kez sesli okur: *"İki yıldız kurabiye, mavi kremalı, çilekli!"*

1. **Hamur:** Hamur kabına dokun, tepsiye bir hamur topu düşer. İki kurabiye için iki kez dokun (sayma).
2. **Kalıp:** Yıldız kalıbına dokun. Tepsideki hamur topları "pof" diye yıldız olur.
3. **Fırın:** Tepsiye dokun, fırının boş gözüne girer. Fırın camında kurabiyenin rengi değişir:
   - **beyaz** (çiğ) → **altın sarısı** (tam kıvamında; "ding!" ve parıltı, yaklaşık 6 sn) → **kahverengi** (yanık, 6 sn daha sonra; minik duman).
   - Altın sarısıyken dokununca çıkar.
   - Yanarsa Kino koşar ve yer: *"Çıtır çıtır!"* Ceza yok, sadece yeniden yapılır. Çocuk "pişme zamanını" gözüyle öğrenir.
4. **Krema:** Mavi krema şişesine dokun, kurabiyeler mavi olur.
5. **Süs:** Çilek kabına dokun. Her dokunuş bir çilek koyar (sayma). Fazla koyarsa son çilek kurabiyeden kayıp düşer, Kino yakalar.
6. **Servis:** Hazır tabağa ve sonra müşteriye dokun (ya da sürükle).
7. **Kontrol:** Müşteri tabağı balondaki resimle yan yana koyar.
   - **Tam aynıysa:** kalpler çıkar, müşteri sevinir, 3 jeton + 1 bahşiş jetonu.
   - **Biraz farklıysa:** müşteri yine yer ve sever. Ama balonla tabak arasında farklı olan şey bir an parlar (örneğin "çilek 1 değil 2"). Böylece çocuk farkı görür ve öğrenir. 2 jeton. Hiç ret, ağlama ya da kızma yok.
8. **Jeton:** Jetonlar tezgâha düşer, kasaya dokununca kumbaraya uçar. Mino sayar.

## Tempo
- **Aynı anda en çok 3 müşteri.** Bir kurabiye fırındayken bir sonrakinin hamurunu hazırlamak serbest. Çocuk plan yapmayı kendiliğinden öğrenir.
- **Sabır balonu:** Müşterinin yanında yavaşça dolan bir kalp. Dolarsa müşteri gitmez, sadece **uyuklar** ("Zzz"). Dokununca uyanır: *"Hı? Sıra bende mi?"* Hızlı servis **bahşiş** kazandırır. Ceza yok, sadece tatlı bir yarış hissi var.
- **Bir gün:** 6 müşteri, yaklaşık 4-5 dk.

## Kino: sakar çırak
- Yanık kurabiyeyi yer: *"Çıtır çıtır!"*
- Ara sıra süs kabından gizlice bir çilek aşırır. Çilek sayısı azalır, Mino: *"Bir çilek eksik! Kino!"* Kino'nun ağzı kırmızı. Kab yeniden dolar.
- Fırının önünde bekler, kurabiye pişince kuyruğu pervane olur: *"Pişti! Pişti!"*

## Günler (ilk sürüm: 3 gün)
Her gün **bir yeni şey** ekler, zorluk yavaşça artar.

| Gün | Yer | Ürün | Siparişler | Yeni şey |
|---|---|---|---|---|
| 1 | Park | kurabiye | 1 kurabiye, 1 şekil, 1 krema rengi | temel döngü, fırın zamanı |
| 2 | Park | kurabiye | 2-3 kurabiye, şekil + renk + süs sayısı (1-3) | sayma, süs |
| 3 | Okul önü | kurabiye + **cupcake** (krema yığını sayısı) | iki farklı ürün aynı siparişte; **mantık siparişi**: Ayı: *"Tavşanınkinden bir fazla çilek!"* Balonda tavşanın kurabiyesi ve yanında bir "+1" çilek resmi var | karşılaştırma, bir fazla |

**Akşam (her günün sonunda, 30 sn):**
- Kumbaraya dokun, Mino jetonları birlikte sayar.
- **Dükkân rafından bir şey al:** yeni kalıp (kalp ya da ay), yeni süs (muz, çikolata), yeni krema rengi, otobüs boyası, Mino'ya pastacı şapkası. Fiyatları jetonla gösterilir; çocuk "yeter mi?" diye sayar.
- Kino tezgâhta kırıntıları yerken uyur. Otobüsün kapağı kapanır.

## Müşteriler (hepsi hazır karakterler)
- **Gün 1:** tavşan, ördek, Can.
- **Gün 2:** ayı, Ada, Elif.
- **Gün 3:** okul önü, sırada çocuklar ve hayvanlar karışık.

Müşterinin sevdiği şey siparişine de yansır: tavşan havuç süslü, ayı ballı, ördek sarı kremalı (Gün 2'den itibaren süs olarak havuç dilimi ve bal damlası açılır).

## Öğrettikleri
| Beceri | Nerede |
|---|---|
| Dikkat, resmi kopyalama | sipariş balonu → tabak |
| Sayma (1-5) | hamur, süs, jeton |
| Renkler | krema |
| Şekiller | kalıplar |
| Zaman, sabır | fırındaki renk değişimi |
| Plan yapma | aynı anda birkaç sipariş |
| Karşılaştırma ("bir fazla") | Gün 3 mantık siparişleri |
| Para (basit) | jeton, akşam alışverişi |
| Nezaket | Mino: "Hoş geldin!", "Afiyet olsun!" |

## Cümleler (seslendirilecek; Mino = mevcut ses, Kino = kendi sesi)
- **Mino:**
  - "Pasta otobüsü geldi!"
  - "Hoş geldin!"
  - siparişi okuma, parçalı: "{sayı} {şekil} kurabiye, {renk} kremalı, {süs}lü!"
  - "Pişti! Çıkar!"
  - "Afiyet olsun!"
  - "Tam istediği gibi!"
  - "Biraz farklı, bak!"
  - "Bir çilek eksik! Kino!"
  - "Kumbarada kaç jeton var?"
  - "Ne alalım?"
  - "Bugünlük bu kadar!"
- **Kino:** "Çıtır çıtır!" · "Pişti! Pişti!" · "Hıhı… bir tane yedim." · "Zzz… kurabiye…"
- **Müşteri tepkileri** (her müşteriye 2): Tavşan "Mmm, havuç!" · Ayı "Ballı, nefis!" · Ördek "Vak, şahane!" · Can "Süper!" · Ada "Çok güzel!" · Elif "Tam istediğim!" · uyuklayan: "Hı? Sıra bende mi?" (balon)
- **Parça kayıtlar:**
  - {sayı}: mevcut
  - {şekil}: yuvarlak, yıldız, kalp
  - {renk}: pembe, mavi, sarı
  - {süs}: çilek, çikolata, muz
- Toplam yaklaşık 40 kayıt, yaklaşık 700 karakter.

## Çizim listesi (Gemini)
- **Otobüs:** dış görünüş (pembe, yanı açılır) ve iç tezgâh görünümü.
- **Park:** arka plan (park seti var).
- **İstasyonlar:** hamur kabı, 3 kalıp, 3 gözlü fırın (cam kapaklı), 3 krema şişesi, 3 süs kabı, servis tabağı, kasa, kumbara, jeton.
- **Kurabiye hâlleri** (her şekil için): hamur topu, çiğ şekil, altın, yanık, kremalı (3 renk), süs (çilek, çikolata, muz tanesi).
- **Cupcake** (Gün 3): kalıp, pişmiş, krema yığını.
- **Pozlar:** Mino pastacı şapkası ve önlük; Kino unlu yüz ve ağzı çilekli.
- **Kodla:** sipariş balonu (aynı kurabiye çizimlerinden oluşturulur), fırın zamanlayıcısı ve renk geçişi, sabır kalbi, jeton uçuşu.
