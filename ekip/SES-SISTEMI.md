# Ses sistemi: nasıl çalışır, neye dokunulmaz

**Barış onaylı (2026-09-26).** "Ses sistemi böyle olmalı." Sesli Maceralar'daki "Ada'nın Doğum Günü" bölümünün bu hâli (commit `eddd6aa` ve sonrası) **referans**. Yeni bölümler ve oyunlar aynı sistemi, aynı ayarlarla kullanır.

---

## 1. Kural (en önemlisi)

**Oyun yalnız çocuğun gerçekten yaptığı şeye tepki verir.** Konuşma, TV, müzik, "çıt" gibi kısa sesler ve ortam uğultusu **hiçbir görevi ilerletmez.**

- **Algılama eşiklerine dokunmayın:** `ses-testi/src/analiz.ts` (Üfleme, Alkış, Perde, Sessizlik bulucuları).
- **Görevi kolaylaştırmak istiyorsanız** oyunun kendi hızıyla oynayın, algılamayla değil:
  - balon ne kadar hızlı şişer (`balonSisir` içindeki şişme hızı),
  - yeşil bölge ne kadar geniş (`ALT`, `UST`),
  - mum ne çabuk söner (`biriken` eşiği),
  - kaç balon, kaç mum (yaşa göre).
- **Ne oldu, bir daha olmasın:**
  - "Kolaylaştıralım" diye algılama gevşetildi (sesli "fuuu" da sayılsın, eşik düşsün). Sonuç: konuşunca balon şişti.
  - Yerel ekip animasyon ekledi, üfleme "bozuldu" sanıldı. Asıl sebep algılamanın gevşek olmasıydı.
  - Bu yüzden ilk sürümün katı algılamasına dönüldü ve kilitlendi.

**Kilit:** `tests/unit/ses-kilidi.test.ts`.
- Konuşma, tıkırtı ve nefes testleri ile eşiklerin metni burada.
- Biri algılamayı değiştirirse test kırmızı olur. GitHub Actions testleri yayından önce çalıştırır, o sürüm **siteye çıkmaz.**
- Değiştirmek şartsa önce Barış'a sorun. Onay alınırsa kilit testini de bilerek güncelleyin ve ORTAK_NOTLAR'a yazın.

---

## 2. Parçalar (baştan sona)

```
Mikrofon ──► ses-testi/src/mikrofon.ts   (1024 örneklik kareler, ~21 ms; ses kaydedilmez)
          ──► ses-testi/src/analiz.ts    ozellikCikar(): ses yüksekliği (dB), düzlük (gürültü mü ton mu),
                                          kalın oran (400 Hz altı), perde (Hz ya da yok), alt pencereler
          ──► orman/src/kulak.ts         Kulak: ortam gürültüsünü sürekli ölçer (taban), oyun konuşurken susar,
                                          görev işleyicisine kareyi iletir (kulak.dinle(fn))
          ──► orman/src/gorev.ts         Görev algılayıcıları: Ufleme, Alkis, Perde, sesVar (+ dokunma karşılıkları)
          ──► macera/src/dogumgunu.ts    Bölüm: her görev bir algılayıcıyı dinler, oyunu ilerletir
```

| Algılayıcı | Neyi sayar | Neyi saymaz | Nerede |
|---|---|---|---|
| **Üfleme** (`UflemeBulucu`) | Perdesiz, gürültü gibi, kalın ağırlıklı, en az ~0.08 sn süren nefes | Konuşma, şarkı (perdeli), kısa tıkırtı, uğultu | Balon, mum |
| **Alkış / tık** (`Alkis`) | Ani, kısa vuruş: alkış, dil şaklatma | Uzun sesler, konuşma | Pasta kesme, dans |
| **Perde** (`notaDegerlendir`, `anlikFark`) | Çocuğun sesinin inceliği, kendi ilk "sol" notasına göre (ton bağımsız, oktav affedilir) | | Şarkı |
| **Sessizlik** (`sessizBekle`) | Tabanın 12 dB üstünde ses yoksa süre ilerler | | Saklanma |
| **Yüksek ses** (`surprizBekle`) | Tabanın 24 dB üstünde, 0.18 sn | | "SÜRPRİZ!" |

**Kulak kuralları:**
- Oyun ses çalarken mikrofon kısa süre susar: `kulak.sustur(ms)`. Konuşma, efekt, nota ve davul bunu kendileri yapar.
- **Yeni ses çalan her kod `kulak.sustur(ms)` çağırmalı,** yoksa oyun kendi sesini "üfleme" ya da "alkış" sanar.
- Ortam tabanı sürekli güncellenir (gürültülü odada eşik kendiliğinden yükselir).
- Her görevin parmakla karşılığı var: `dokunma = { bas, birak }`. Mikrofon izni vermeyen de oynar.

---

## 3. Yeni sesli görev eklerken (tarif)

1. Hikâyeden doğsun (`ekip/senarist-rehberi.md`).
2. Var olan algılayıcılardan birini kullanın. **Yeni eşik uydurmayın.**
3. Kalıp (balondan):

```ts
const u = new Ufleme(kulak.ayar, 0.5);        // 0.5: parmakla basılı tutunca verilen güç
await new Promise<void>((coz) => {
  const tik = (dt: number) => {
    u.tik(dt);
    if (u.aktif) dolu += dt * HIZ;            // kolaylık = HIZ; algılamaya dokunma
    if (dolu >= 1) { tikler.delete(tik); coz(); }
  };
  tikler.add(tik);
  kulak.dinle((o) => u.kare(o));
  dokunma = { bas: () => u.bas(), birak: () => u.birak() };
});
kulak.dinle(null);
dokunma = null;
```

4. Görev bitince: `kulak.dinle(null)` ve `dokunma = null`.
5. Test:
   - Dokunarak uçtan uca test yazın (`tests/e2e/macera.spec.ts`).
   - Mikrofonlu deneme: sahte mikrofon WAV'ı ile (`tests/e2e/ses-yardimci.ts` ve `orman.spec.ts` örneği). Konuşma sesi (ton) görevi **ilerletmemeli**.
6. **Gerçek telefonda deneyin:** konuşun, TV açın, "çıt" yapın; balon kıpırdamamalı. Sonra üfleyin; şişmeli.

---

## 4. Animasyonlar ve telefon

- Animasyonlar serbest ama hafif olsun: CSS ve WAAPI `transform`.
- Mikrofon analizi (ScriptProcessor) ana iş parçacığında çalışır. Telefonu boğacak işlerden kaçının:
  - sürekli JS döngüleri,
  - her karede yerleşim okuma (`offsetLeft`),
  - çok sayıda `will-change`,
  - ağır `filter` / `backdrop-filter` animasyonu.
- Yeni animasyondan sonra, telefonda üfleme ve alkışın aynı hızda çalıştığına bakın.
