# Kino: Minkino'nun ikinci ana karakteri (köpek)

**Barış'ın kararı (2026-09-27):** "Bir köpek karakter yap, Mino gibi ana karakterlerden biri olsun. Adı Kino. Kino'ya çok uğraşın, Adobe'de tasarlayın."
Mino + Kino = **Minkino**. İkili, markanın ta kendisi.

## 1. Kim bu Kino?
- **Mino'nun en yakın arkadaşı.** Mino bir kedi, Kino bir köpek yavrusu. İkisi her şeyde birbirinin tersi, o yüzden birlikte komik oluyorlar.

| | Mino (kedi) | Kino (köpek) |
|---|---|---|
| Karakter | Meraklı, atik, biraz titiz, planlı | Coşkulu, saf, biraz sakar, önce yapar sonra düşünür |
| Sevdiği | Temizlik, sıcak yer, baloncuk kovalamak | Çamur, su, top, herkese sarılmak |
| Sevmediği | Su, ıslanmak | Beklemek, sessiz durmak |
| Tepki | Kuyruğu ve kulaklarıyla konuşur | Kuyruğu pervane gibi döner, kulakları uçuşur |
| Yürüyüş | Hafif, parmak ucunda | Hoplayarak, biraz yalpalayarak, sonra kayıp düşer |

- **Konuşması:** kısa, heyecanlı, "Yaşasın!", "Hadi hadi hadi!". Cümle sonunda bazen minik bir "hav!".
- **Sesi:** Anlatıcıyla aynı ElevenLabs sesi, **daha kalın tonla** (Mino 1.12 hızla ince; Kino yaklaşık 0.92 önerilir). Ayrı karakter sesi Barış'ın kararına kalır.

## 2. Görünüş (Mino'nun yanında hemen ayırt edilmeli)
- **Renk:** krem-beyaz gövde, **çikolata kahvesi** uzun sarkık kulaklar, **bir gözünün çevresinde kahverengi yuvarlak leke** (Kino'nun imzası; siluetinden bile tanınmalı), sırtta bir küçük kahve leke, kuyruk ucu kahve.
- **Aksesuar:** **mavi fular** (Mino kırmızı, Kino mavi; ikisi yan yana tamamlanıyor).
- **Oran:** Mino'yla aynı boyda, aynı "büyük kafa + küçük gövde" oranında. Biraz daha tombul, patiler biraz daha iri (yavru köpek sakarlığı).
- **Gözler:** Mino gibi büyük, parlak, koyu kahve/siyah. Kirpik yok ya da çok az (Mino'dan ayrışsın).
- **Burun:** yuvarlak, parlak, koyu kahve. Dil sık sık dışarıda (mutlu köpek).
- **Kulaklar:** uzun, yumuşak, sarkık. **Animasyonun yıldızı**: koşarken uçuşur, üzülünce düşer, şaşırınca dikilir.
- **Dikkat:** Pazar oyunundaki köpekle (`assets/hayvanlar/kopek.webp`, açık kahve-beyaz) **karışmamalı**. Kino'nun göz lekesi ve mavi fuları bunu sağlar.

## 3. Üretim yolu (Mino'daki gibi)
1. **Recraft pro vektör** (`recraftv4_1_pro_vector`, 1:1, yaklaşık 12 kredi/deneme): önce **1 örnek**, beğenilirse 2 seçenek daha. Barış seçer.
   ```
   A single cute puppy character named Kino, best friend of an orange cat, full body, standing and facing the viewer, happy big smile with a little pink tongue out, big sparkling dark brown eyes, cream white fur, long floppy chocolate brown ears, one round chocolate brown patch around the left eye, small brown spot on the back, brown tail tip, a blue neckerchief tied at the neck, chubby round body, slightly big paws, premium glossy cartoon style for a toddler picture book, modern Disney Junior / Nick Jr. preschool style, soft shading and highlights, thick clean dark brown outline, simple rounded shapes. Centered, isolated on a plain white background, no text, no ground.
   ```
   Mino'nun yanına konup birlikte kontrol edilir: aynı çizgi kalınlığı, aynı parlaklık dozu, aynı oran.
2. **Adobe (Illustrator):** Mino'daki görevin aynısı (`ekip/mino/TASARIMCI-GOREVI.md`): gövdeye az dozda cel shading, sonra katmanlar.
   - Katman sırası (arkadan öne): `kuyruk, kulak-sol, govde, kol-sol, kol-sag, fular, kafa, kulak-sag?, goz-sol, goz-sag, dil, agiz`.
   - **Kulaklar ayrı katman olmalı** (Mino'da kulak kafaya bağlıydı; Kino'da kulak ayrı döner). Dönme noktası kulağın kafaya bağlandığı yer.
   - Göz lekesi `kafa` içinde kalır, gözle birlikte hareket etmez.
   - Gizli ekler: `goz-kapali`, `agiz-acik`, `agiz-kapali`, `dil-disarida`.
   - Teslim: `ekip/kino/kino-final.svg` + `kino-final.png` (2048, şeffaf) + dönme noktaları `kino-final.json`.
3. **Gemini (tarayıcı):** ifade seti. Mino'nun ifadelerine ek olarak Kino'ya özel: kulaklar dikilmiş şaşkın, kulaklar düşük üzgün, dil dışarıda nefes nefese, titreme (dişler takırdıyor), silkelenme (bulanık kulaklar), sırılsıklam.

## 4. İlk göründüğü yer
- **"Mino Banyo Yapmıyor!"** oyunu (senaryo: `ekip/senaryo/mino-banyo.md`, 2026-09-27 sabah teslim). Kino banyoya bayılıyor, Mino sudan kaçıyor.
- Sonra: filmler ve Sesli Maceralar'da Mino'nun yanında.
