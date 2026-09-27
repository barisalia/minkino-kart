# Ege düzeltmesi: "Şşş, Ege Uyuyor!" hikâyesi yeniden kuruldu (v2, denetimden geçti)

> Neden: Barış (ORTAK_NOTLAR, 2026-09-27) "çıngırak görevi hatalı", oyunu "saçma" buldu.
> Ölçü: `ekip/senarist-rehberi.md` §1. Her görev hikâyeden doğar, "bu görev neden burada?" sorusunun cevabı var, bir duygu eğrisi var, çocuğun sesinin ve hareketinin sonucu görünür.
> Üç bağımsız denetçiden geçti: Barış ölçüsü, çocuk ve mantık, kod. Bulguları işlendi.
> Bu belge `ege-uyuyor.md`'nin yerini alır; çakışırsa bu geçerli.

## 1. Ne yanlıştı?
1. **Hedef ile görevler çelişiyordu.** Amaç Ege'yi uyutmak. Oysa iki ayrı sahnede (kuklalar, cee-ee) bebeği güldürüp coşturuyorduk. Uyutmak istediğin bebeği neden iki kere heyecanlandırıyorsun?
2. **Görev listesi gibiydi (Uyuyan Orman hatası).** Dokuz görev art arda diziliyordu, aralarında "çünkü" yoktu.
3. **Çıngırak mantıksızdı.** Çocuk dilini şaklatınca çıngırağı Can sallıyordu. Çocuğun hareketi ile sonuç arasında bağ yoktu. Çıngırak da bebeği uyutmaz, uyandırır.
4. **Mino'nun burnu nedensiz kaşınıyordu.**
5. **Mantık açıkları:** Anne uyurken 5 yaşındaki Ada bebeği kucaklayıp taşıyor, sıcak mamayı getiriyordu. Ağlayan bebeğin karnı guruldayınca çocuklar gülüyordu.

## 2. Yeni omurga: "Ege ne istiyor?"
- **Tek hedef:** Anne dinlensin, Ege'ye biz bakalım. Mino: *"Anne dinlensin. Ege ne istiyor, bulalım!"*
- **İlerlemeyi Ege'nin yüzü gösterir.** Ekranda simge ya da liste yok. Her ihtiyacı Ege'nin kendi bedeni belli eder, çocuk bunu Ege'nin yüzünden ve hareketinden okur:
  - **ağlıyor** → karnı guruldar: *aç*
  - **doydu, susuyor ama surat asıyor**, sepete uzanıp "Ba! Ba!": *sıkılmış*
  - **kuklalarla kahkaha**: *oynadı*
  - **esniyor, gözünü ovuşturuyor**: *yoruldu* → yatak → ninni → **uyuyor**
- **Uyku, oyunun sonucu.** Ege çok güldüğü için yorulur. "Uyutacağımız bebeği neden güldürüyoruz?" sorusunun cevabı bu: oyun onu yordu.
- **Eğitici yanı (zorlamadan):** Bebeğin ne istediğini yüzünden anlamak. Empati.

**Duygu eğrisi:** gerilim (Ege ağlıyor, anne yorgun) → rahatlama (doydu) → **doruk: kahkaha** (kuklalar) → yavaşlama (yorgunluk, yatak, ninni) → **gerilim: şşş!** (tüy Mino'nun burnuna kayıyor) → tatlı final (fısıltı, sarılma).

## 3. Sahne listesi: kalan, değişen, çıkan

| Yeni # | Eski # | Durum | Sahne |
|---|---|---|---|
| 1 | 1 | **KALIR** (+ anne mamayı bırakır) | Anne çok yorgun: battaniye ört |
| 2 | 3 | **DEĞİŞİR** (ağlama ve ifade) | Ege aç: mama |
| 3 | 2 + 4 | **BİRLEŞİR** | Ege sıkılmış: sepette kuklalar, konuştur |
| 4 | 6 | **KALIR** (+ anne Ege'yi yatırır, + tüy) | Ege yoruldu: yatak hazırlığı |
| 5 | 7 | **KALIR** | Ninni |
| 6 | 8 | **DEĞİŞİR** (sebep: tüy) | Şşş! Tüy ve Mino'nun burnu |
| 7 | 9 | **KALIR** | Fısıltıyla iyi geceler |
| — | 2'nin çıngırak kısmı | **ÇIKAR** | Çıngırak (tık tık, ritim) |
| — | 5 | **ÇIKAR** | Cee-ee |

Süre yaklaşık 7,5 dakikadan yaklaşık **5,5 dakikaya** iner.

### Sahne 1: Anne çok yorgun (KALIR + küçük ek)
- **Neden burada:** Bütün hikâyenin sebebi. Anne çok yorgun, dinlenmesi lazım.
- **Yeni (mantık için):** Anne, kanepeye çökmeden önce Ege'yi mama sandalyesine oturtur ve mama kasesini önüne bırakır. Balon (seslendirilmez): *"Maması hazır… biraz soğusun."* Böylece sıcak mamayı bir büyük hazırlamış olur, çocuğun üflemesi de annenin "soğusun" sözüne bağlanır.
- **Çocuk:** Battaniyeyi anneye sürükler (mevcut kod).
- **Görünen sonuç:** Battaniye açılır, anne sokulur ve gülümser, kalpler çıkar (mevcut).
- **Sonunda:** Mino: *"Anne dinlensin. Ege ne istiyor, bulalım!"* (yeni; eski `plan` cümlesinin yerine). Ege ağlıyor.

### Sahne 2: Ege aç (DEĞİŞİR)
- **Neden burada:** Ağlayan bebekte ilk akla gelen açlık.
- **Açılış (değişir):** Ege hıçkırır, bir an susar. O sessizlikte karnı "gurrrl" diye ses çıkarır. Ege şaşkın şaşkın karnına bakar ("Ooo?"). **Kimse gülmez**, yalnız Mino şaşırır: *"Bu ses de ne? Ege acıkmış!"* (mevcut cümle). Ada ile Can'ın "hihi" balonları kalkar.
- **Çocuk (mevcut, aynen):** Önlüğü takar, kaşığı daldırır, **üfler**, Ege'ye verir, peçeteyle siler.
- **Görünen sonuç:**
  - Kase ortaya çıkınca Ege'nin ağlaması **sessizleşir**: burnunu çeker, gözü kasededir ("Am?"). Aç bebek yemeği görünce susar.
  - Üfledikçe buhar incelir.
  - Her kaşıkta "Am!" ve **bir gözyaşı kurur**.
  - Mama boyunca Ege **gülmez**: ifadeleri 'am' ve 'bakiyor'. Kahkaha kuklalara saklanır.
- **Sonunda:** Ege susmuştur ama **surat asar** (ifade: büzük). Sepete doğru uzanır: *"Ba! Ba!"* (balon).

### Sahne 3: Ege sıkılmış (BİRLEŞİR: eski 2'nin sepet araması + eski 4)
- **Neden burada:** Karnı tok ama huysuz. Sepete uzanıyor, çünkü oyun istiyor. Mino: *"Karnı doydu ama sıkılmış. Sepete bakalım!"* (yeni).
- **Girişler:** Can ve Elif bu sahneye birlikte gelir. Elif: *"Ben de oynarım!"* (mevcut balon).
- **Çocuk 1 (sepet, arama hikâyeye bağlandı):** Oyuncakları sepetten çıkarıp **Ege'ye gösterir**.
  - Küp, top ve kitap: Ege her birine başını çevirip "Hıh!" der, istemez.
  - Lastik ördek: "Vık!" diye öter, Ege "Ooo?" deyip yine surat asar.
  - En altta **iki kukla**: Ege'nin gözleri parlar.
  - Arama artık "Ege neyle oynamak ister?" sorusu. Sıkılmışlığı Ege'nin yüzü gösteriyor.
- **Çocuk 2 (kukla, eski sahne 4, her yaşta aynı):** Kuklayı sepetten doğrudan Ada'nın ve Can'ın eline sürükler. Önce normal sesle "aaa" denir.
  - **İnce ses** → civciv zıplar, **Ege başını civcive çevirip kıkırdar.**
  - **Kalın ses** → ayı sallanır, **Ege başını ayıya çevirir: "Ooo?"**, sonra güler.
  - Hangi kukla konuşursa Ege ona bakar. Birkaç turda kahkaha büyür.
- **Doruk:** Ege katıla katıla gülüyor, kalpler çıkıyor.
- **Şaka:** En büyük kahkahada anne kanepede kıpırdar: *"Hıı… beş dakika…"* (mevcut balon). Herkes donar, "Şşş!" deyip kıkırdar. Anne uyumaya devam eder. Böylece bölümün "şşş" motifi burada ekilir.

### Sahne 4: Ege yoruldu: yatak hazırlığı (KALIR + ekler)
- **Neden burada:** Çok güldü, yoruldu. Ege kocaman esner, gözünü ovuşturur. Mino: *"Çok güldü… Yoruldu!"* (yeni), ardından mevcut *"Ege esniyor. Uyku vakti!"* Tek esneme olur.
- **Yeni (mantık için):** Bebeği çocuklar taşımaz. Anne uykulu uykulu kalkar, Ege'yi sandalyeden alıp beşiğe yatırır (balon: *"Hadi yatağa…"*) ve kanepeye geri kıvrılır. Böylece bebeği bir büyük taşır.
- **Çocuk (mevcut):** Emzik, battaniye, gece lambası, perde (sıra serbest).
- **Görünen sonuç (mevcut):** "cup cup", battaniye beşiğe açılır, tavanda yıldızlar döner, oda loşlaşır.
- **Tüy (yeni):** Perde kapanırken perdeden **minik beyaz bir tüy** düşer. Süzülerek **Mino'nun kulağının ucuna konar.** Mino fark etmez, çocuk görür. Tüy ekrandan hiç çıkmaz, sahne boyunca Mino'nun kulağında durur.

### Sahne 5: Ninni (KALIR)
- **Neden burada:** Yatak hazır, Ege'nin gözleri ağır ama tam uyumuyor.
- **Çocuk (mevcut):** Önce Gemini ninnisi dinlenir ("Dandini dandini Ege…"). Sonra çocuk kısık sesle söyler ya da beşiği parmağıyla sallar.
- **Görünen sonuç (mevcut):**
  - Kısık seste her doğru nota tavanda bir yıldız yakar, beşik sallanır.
  - Ses yükselirse Ege **bir gözünü açıp** bakar ("Şşş, daha kısık!").
- **Sonunda:** Ege'nin gözleri kapanır. Mino'nun kulağındaki tüy hâlâ orada.

### Sahne 6: Şşş! Tüy ve Mino'nun burnu (DEĞİŞİR: sebebi görünüyor)
- **Neden burada:** Ege uyudu, şimdi en zor iş sessiz kalmak. Gerilim sahnesi.
- **Çocuk 1 (mevcut):** Hiç ses çıkarmaz, ay dolar. Ses çıkarsa Ege kıpırdar.
- **Kaşıntının sebebi:** Ay dolarken tüy **Mino'nun kulağından burnuna kayar.** Kamera tüye yaklaşır, Mino'nun gözleri şaşılaşır: *"Eyvah! Burnum kaşınıyor!"* (mevcut cümle).
- **Çocuk 2 (mevcut):** Mino'nun burnuna basılı tutar.
- **Görünen sonuç:**
  - Tutarsa: minik "hıpşu", tüy yere süzülür, Ege uykusunda gülümser.
  - Tutamazsa: "HAPŞUU!", tüy havaya fırlar, Ege uyanır. Kısa ninni ve kısa sessizlik yeniden gelir (mevcut).

### Sahne 7: İyi geceler (KALIR)
- **Neden burada:** İş bitti, anne uyanıyor.
- **Çocuk (mevcut):** Fısıltıyla "İyi geceler Ege!" der.
- **Görünen sonuç:** Fısıltıda Ege uykusunda gülümser. Anne: *"Aferin size…"*, herkes kanepede sarılır (Ada, Can, Elif), Mino kıvrılıp uyur. Yüksek sesle söylerse Ege kıpırdar, Ada "Şşş!" der.

## 4. Metin değişiklikleri (`content/macera-ege.json`)
**Silinecek:** `mino.plan`, `mino.surat`, `mino.cingirak_ara`, `mino.cingirak`, `mino.ritim`, `mino.sustu`, `mino.cee_giris`, `mino.cee`, `mino.yumusak`, `mino.hepsi`, `balon.ada.cingirak`, `balon.cee`.
**Yeni cümleler (seslendirilecek, toplam yaklaşık 105 karakter):**
```
mino.ne_istiyor: "Anne dinlensin. Ege ne istiyor, bulalım!"
mino.sikilmis:   "Karnı doydu ama sıkılmış. Sepete bakalım!"
mino.yoruldu:    "Çok güldü… Yoruldu!"
```
**Yeni balonlar (seslendirilmez):** `balon.anne_mama`: "Maması hazır… biraz soğusun." · `balon.anne_yatak`: "Hadi yatağa…" · `balon.ege.baba`: "Ba! Ba!"
Kalan cümleler aynen, yeniden seslendirme yok. Yeni 3 cümle, kayıt gelene kadar cihaz sesiyle çalar.

## 5. Kod notları (denetçinin dosya:satır bulgularıyla)
1. **Sıra:** sahne1 → sahne3 (mama) → [sepet + kukla] → sahne6 (yatak) → sahne7 (ninni) → sahne8 (tüy + burun) → sahne9. `sahne5` (cee-ee) ve `sahne2`'nin çıngırak kısmı çıkar.
2. **Ölü kod ve derleme:** `noUnusedLocals: true` açık. sahne5, elKapa, minoKulakKapa, ceeBekle, dinleTik, dinleSeri, egeRitim, ilgili sabitler ve importlar (ritimAyniMi, Alkis, CEE_TURLARI, EGE_RITIM, CeeTur) silinir. JSON anahtarları **aynı değişiklikte** silinir, `npx tsc` ile denenir. `ege-mantik.ts`'teki dışa aktarımlara dokunulmaz, birim testi kırılmaz.
3. **Ağlama ve mikrofon:**
   - Sorun: `S.aglama` her çaldığında `kulak.sustur(1500)` çağırıyor (ege-ses.ts:68). Mama boyunca ağlama sürerse üfleme duyulmaz.
   - Mama sahnesinde kase görününce `aglamaSessiz = true` yapılır. Daha sağlam yol: `sesliGorev()` (ege.ts:523-531) bunu her sesli görevde kendisi açıp kapatsın.
   - Kademe `aglat()` ile değil, kaşık sayısıyla doğrudan yazılır (kalıp ege.ts:1010-1012, 1236-1241). Mama sonunda `aglat(0)` ve ardından `ifade('buzuk')` çağrılır.
4. **Mama ifadeleri:**
   - Önlükte, kaşıkta ve silmede 'kikir' yerine 'am' ya da 'bakiyor' kullanılır (1226, 1249, 1289-1290, 1429-1430).
   - Gurultu anında Ada ile Can'ın hihi balonları kalkar (1159-1172).
5. **Sepet yerleşimi:**
   - Sorun: Sepet x 52'de (902-903), Ege'nin oturduğu mama sandalyesinin önünü kapatır.
   - Çözüm: Sepet sola alınır (x ~32-36; Mino'yla çakışmasın). `KENAR`, `kam` ile Ada ve Can'ın konumları yeniden verilir.
   - Kontrol: telefon dikey, telefon yatay ve tablette ekran görüntüsü.
6. **Kukla sepetten çıkar:**
   - Arama kısmı, kukla nesnelerini döndüren ayrı bir fonksiyona çıkar; `sahne4` bu nesneleri parametre olarak alır.
   - Kukla nesneleri `sepetOn`'dan önce DOM'a eklenir.
   - İpucu yedeğindeki `?? cing` (925) değişir.
   - Ayı kukla sepette w ~8 ile durur, eline götürülürken `tasi(..., w)` ile büyür.
   - Oyuncaklar kukla-tak'tan önce toplanır (1061-1077).
   - Oyuncak gösterme adımı: bırakılan her oyuncakta Ege'nin baş çevirmesi ve ifadesi mevcut ifadelerle yapılır ('hih', 'ooo'). Kuklada gözler parlar.
7. **Anne ekleri:**
   - Sahne 1'de kaseyi bırakma: kase zaten sahnede; anne ayakta pozuyla sandalyeye kısa bir yürüyüş ve balon.
   - Sahne 4'te Ege'yi yatırma: Ada'nın 'kucakta' taşıma kısmı (~1174, ~1916) çıkar. Ege'yi anne taşır: ayakta poz, beşiğe yürüme, sonra kanepeye dönüş.
   - Olmazsa en ucuz yedek: Ege mama sahnesinden sonra sandalyede uyuklar, anne uyanıp onu beşiğe taşırken ekran bir an kararır ("kes" geçişi).
8. **Can ve Elif:**
   - Can'ın girişi sepet sahnesinin başına taşınır. Mama sahnesinde Can'a verilen komutlar (1168-1170, 1188, 1463) silinir.
   - Elif, Can ile birlikte sepet sahnesine girer. Eski girişi cee-ee'deydi (1744-1753), orası çıkıyor.
   - Final sarılma konumları (2693, 2699-2701) aynı kalır.
9. **Tüy:**
   - Başlangıç: Perde kapanınca (2110-2119 civarı) `void` ile başlatılır, serbest sıradaki görevleri bekletmez.
   - Uçuş: Kodla çizilmiş minik beyaz bir şekil `sahne.on` katmanında uçar (kalıp 1436-1454) ve Mino'nun kulağına bağlanır (`minoEkran`, 508-512). Sahne 6'da `burun()` Mino'yu yerine oturttuktan **sonra** buruna kayar (2535).
   - Dokunma: `pointer-events: none`, çünkü e2e burnun ortasına basıyor (spec:279-280).
10. **e2e (`tests/e2e/macera-ege.spec.ts`):** `oyna()` yeniden sıralanır: battaniye → mama (123-178) → sepet + kukla. cingirak-bul, tik ve ritim kısımları (94-121) ile cee bloğu (204-218) silinir.
11. **Yaş ayarları aynen kalır** (ORTAK_NOTLAR "EGE DUZELTME" kolaylaştırmaları dahil). Kuklalar her yaşta aynı. Albüm kartı: "Ege'nin Ninnicisi".

**Önerilen çalışma sırası:**
1. Akışı değiştir, ölü kodu sil, tsc.
2. Sepet ve kuklayı birleştir, yerleşimi kur.
3. Ağlamayı sessizleştir, ifadeleri düzelt.
4. Anne eklerini yap.
5. Can ve Elif girişlerini taşı.
6. Tüyü ekle.
7. e2e sırasını düzelt.
8. 3 ve 5 yaş testlerini çalıştır, üç ekranda ekran görüntüsü al.
