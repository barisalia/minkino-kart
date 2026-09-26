# Minkino görsel stil rehberi (Recraft + Gemini)

**Kural:** Her yeni görsel bu dosyadaki kalıplarla üretilir. Stil tutarlılığı her şeyden önce gelir.

Kalıbın dışına çıkmak gerekiyorsa önce Barış'a sorulur. Yeni bir kalıp işe yarıyorsa buraya eklenir.

## 1. Stil tanımı (Barış'ın ölçüsü)

"2D vector high quality, premium glossy cartoon vector, toddlers book style. Yapay zekâ görseli gibi durmasın, net ve normal dursun."

| Yap | Yapma |
|---|---|
| Temiz 2D çizgi film, düz renk dolgular | 3D render, plastik ya da oyuncak görünüm |
| Kalın, temiz **koyu kahverengi** kontur (siyah değil) | İnce, kırık ya da eskiz gibi çizgi |
| Hafif iki tonlu gölge (cel shading) | Ağır gradyan, fotoğraf gibi ışık |
| **Az sayıda** küçük parlak ışık lekesi (kafa üstü, kulak, yanak) | Her yere parlama, "cam gibi" yüzey |
| Yuvarlak, sade, sevimli şekiller | Kıl ya da tüy dokusu, kumaş dokusu, boya fırçası dokusu |
| Canlı ama yumuşak renkler | Neon, çok koyu ya da gri tonlar |
| Düz beyaz zemin (karakter ve eşyalarda) | Gölge, zemin çizgisi, sahne (karakter ve eşyalarda) |

**Dozaj notu (2026-09-26, Barış):** "Parlaklığı ve dokuyu çok atmışsın, daha az dozajda at. 2D'den çok kopma." Gemini ile parlatmada abartılan sürüm reddedildi.

## 2. Recraft ayarları

| İş | Model | Boyut | Not |
|---|---|---|---|
| Karakter, eşya | `recraftv4_1_raster` | 1:1 | 2 kredi. Arka plan otomatik silinir. |
| Ana karakter / maskot | `recraftv4_1_pro_vector` | 1:1 | 12 kredi. En temiz SVG. |
| Uzun eşya (flama, gölet) | `recraftv4_1_raster` | 2:1 | |
| Arka plan sahnesi | `recraftv4_1_raster` | 1:1 | Kenardan kenara, beyaz zemin yok. |
| Raster'ı vektöre çevirme | `vectorize_image` | | 1 kredi. |
| Poz ve ifade (aynı karakter) | Gemini (tarayıcı) ya da Recraft `image_edit` + `nano_banana_pro` | | Recraft'ta 40 kredi; tarayıcıda ücretsiz. |

Üretilen adres `assets/recraft/<grup>.json` dosyasına yazılır. Push'tan sonra GitHub Actions indirir, zemini siler, kırpar ve `assets/<grup>/<ad>.webp` olarak kaydeder.

## 3. Prompt kalıpları (kelimesi kelimesine kullanın, sadece `<…>` kısmını değiştirin)

### 3a. Karakter (çocuk ya da hayvan)

```
A single cute <little girl / little boy / animal> character named <Ad>, about 5 years old, full body, standing and facing the viewer, happy big smile, big sparkling <renk> eyes, rosy cheeks, <saç>, <kıyafet>, <ayakkabı>, premium glossy cartoon style for a toddler picture book, modern Disney Junior / Nick Jr. preschool style, soft shading and highlights, thick clean dark brown outline, simple rounded shapes. Centered, isolated on a plain white background, no text, no ground.
```

Örnekler: Ada, Can, Elif, Deniz, Zeynep (`assets/recraft/parti.json`).

### 3b. Eşya

```
A single cute <eşya ve ayrıntıları>, premium glossy cartoon style for a toddler picture book, soft shading and highlights, thick clean dark brown outline, simple rounded shapes. Centered, isolated on a plain white background, no text<, no face / no extra objects>.
```

Örnekler: pasta, mum, kapı, balon, roket.

- Yüz istemiyorsanız `no face` yazın.
- Başka bir eşyanın parçası olacaksa (ör. mumun alevi) ayrı üretin.

### 3c. Uzun eşya (2:1)

```
A single long horizontal <eşya>, premium glossy cartoon style for a toddler picture book, soft shading and highlights, thick clean dark brown outline, simple rounded shapes. Centered, very wide horizontal, isolated on a plain white background, no text.
```

### 3d. Arka plan sahnesi

```
Empty background scene for a premium toddler picture book: <mekân>. Soft glossy cartoon style, rich but gentle colors. <Mekânın ayrıntıları: kenarlardaki öğeler, zemin, gökyüzü>. The whole center of the image is open empty space (space for characters). No animals, no characters, no text.
```

Kural: Arka planın ortası boş kalır. Karakterler ve eşyalar ayrı çizilip üstüne konur.

### 3e. Ana karakter (maskot): Mino

- **Kaynak:** `karakter-kaynak/mino-yeni.svg`.
- **Kimlik:** turuncu tekir yavru kedi, krem ağız çevresi, göğüs, pati ve kuyruk ucu, kırmızı fular, iri kehribar gözler.

Yeni Mino pozu ya da ifadesi Gemini'de şöyle istenir. Önce kaynak görseli yükleyin, sonra:

```
Keep this exact kitten character: same design, proportions, colors, face, red neckerchief and tail. Keep it a clean flat 2D cartoon vector illustration with only light two-tone cel shading and a few small subtle highlights. No fur texture, no painterly or 3D rendering, no strong gradients. Thick clean dark brown outline. <yeni poz / ifade>. Full body, centered, plain pure white background, no text, no ground.
```

## 4. Gemini ile poz ve ifade (tasarımcılar)

1. Kaynak görseli yükleyin. Şapka ya da eşya gerekiyorsa ikinci görsel olarak ekleyin.
2. İsteğin **başına** stil kilidini koyun:

```
Keep exactly the same character, same art style, same colors, same thick dark-brown outlines, same glossy highlights, same proportions and size. Premium glossy 2D cartoon vector style for a toddler picture book. Full body, facing the viewer. Plain pure white background. No text.
```

3. Sonra pozu tek cümleyle anlatın. Ör.: "Same girl, very surprised: both hands on her cheeks, mouth a big round O."
4. Sonucu kaynakla **yan yana** kontrol edin. Şunlardan biri değiştiyse kullanmayın, yeniden üretin:
   - yüz,
   - saç,
   - kıyafet rengi,
   - kontur kalınlığı,
   - oran,
   - parlaklık dozu.
5. PNG olarak, en az 1024 px kaydedin → `ekip/gemini/<bölüm>/<karakter>/<poz>.png`.

## 5. Kalite kontrol listesi (her görselde)

- [ ] Kontur koyu kahverengi ve kalın mı, her yerde aynı kalınlıkta mı?
- [ ] Zemin düz beyaz mı? Gölge, zemin çizgisi ya da yazı var mı?
- [ ] Parlaklık az ve yerinde mi? Doku yok mu?
- [ ] Diğer karakterlerin yanına konunca aynı dünyadan mı görünüyor? (`tests/screens` ekran görüntüleriyle karşılaştırın)
- [ ] El, parmak, göz gibi yapay zekâ hataları var mı?
- [ ] Oranlar doğru mu? Kafa büyük, gövde küçük ve sevimli olmalı.
