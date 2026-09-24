# İçerik (content/)

Yeni soru, kart veya tema eklemek **kod gerektirmez**: sadece bu klasördeki JSON dosyalarını düzenleyin.

| Dosya | Ne işe yarar |
|---|---|
| `kartlar.json` | Tüm kartların kataloğu (ad, görsel, ses, tür) |
| `temalar.json` | Tema paketleri (sıra, kapak kartı, açılma eşiği, ücretsiz mi) |
| `metinler.json` | Uygulamanın konuştuğu tüm genel cümleler (övgü, yönlendirme, menü) |
| `sorular/<yaş>/<tema>.json` | Her yaş × tema için soru listesi |

## Kart kataloğu (`kartlar.json`)

```json
{ "id": "kedi", "ad": "Kedi", "tema": "hayvanlar", "tur": "resim", "gorsel": "hayvanlar/kedi.webp", "ses": "Miyav miyav!" }
```

- `tur`: `resim` (görsel), `renk` (boya lekesi, `deger` = renk kodu), `sekil` (`deger` = daire/kare/ucgen/dikdortgen/yildiz/kalp/oval),
  `sayi` (`deger` = "0".."10"), `harf` (`deger` = büyük harf, `ornek` = o harfle başlayan resimli kart).
- `ses`: kart doğru bulunduğunda / albümde dokununca adından sonra söylenir.
- `album: false` olan kartlar oyunda kullanılır ama albümde yer almaz.
- `renk` (resimli kartlarda): nesnenin rengi (içerik yazarken yardımcı bilgi). `grup`: meyve/sebze, kara/hava/deniz.
- Görsel dosyası yoksa oyun otomatik olarak adı yazılı yer tutucu kart gösterir.

## Soru dosyası şeması

```json
{
  "yas": 3,
  "tema": "hayvanlar",
  "sorular": [
    {
      "tip": "BUL",
      "soru_metni": "Kedi hangisi?",
      "soru_ses": "Kedi hangisi? Kediyi bul!",
      "kartlar": ["kedi", "kopek"],
      "dogru": "kedi",
      "ipucu": "Kedi miyav der!"
    }
  ]
}
```

Ortak alanlar:

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `tip` | ✔ | `BUL`, `ESLESTIR`, `SAY`, `FARKLI`, `SIRADAKI`, `HAFIZA` |
| `soru_metni` | ✔ | Ekranda (5-6 yaş) görünen kısa soru |
| `soru_ses` | | Sesli okunan metin (yoksa `soru_metni` okunur). İleride `.mp3` dosya yolu da olabilir. |
| `kartlar` | ✔ | Alttaki seçenek kartları (HAFIZA'da çift olacak kartlar) |
| `dogru` | ✔* | Doğru seçenek: kart id'si **veya** seçenek sırası (0'dan başlar). HAFIZA'da yok. |
| `gosterge` | | Ortadaki büyük kart(lar) |
| `ipucu` | | Yanlış cevapta söylenen yardımcı cümle |
| `dogru_ses` | | (Kullanılmıyor — doğru cevapta sadece kısa bir övgü söylenir: "Aferin!") |
| `ikon` | | Soru balonundaki küçük ikon (kart id) |
| `odul` | | Bu soru için albüme verilecek kart (yoksa doğru cevabın kartı) |

### Kart gösterimi (kart referansı)

`kartlar` ve `gosterge` içindeki her öğe ya düz kart id'si (`"elma"`) ya da nesnedir:

```json
{ "kart": "elma", "adet": 3 }            // aynı kartta 3 elma
{ "kart": "top", "olcek": 0.5 }          // yarı boyutta top (küçük/büyük soruları)
{ "yazi": "KEDİ" }                       // sadece yazı olan kart (kelime okuma)
{ "kart": "kedi", "bicim": "golge" }     // gölge (siluet) — EŞLEŞTİR hedefi
{ "kart": "kedi", "bicim": "yuva" }      // kesik çizgili yuva — EŞLEŞTİR hedefi
{ "kart": "renk-kirmizi", "bicim": "renk" } // renk sepeti — EŞLEŞTİR hedefi
{ "kart": "elma", "adet": 5, "carpi": 2 } // 5 elma, 2'si üstü çizili (çıkarma)
```

Seçeneklerde aynı kart birden fazla kez geçiyorsa (`top` büyük/küçük gibi) `dogru` alanına **sıra numarası** yazın.

### Tiplere göre

- **BUL**: `kartlar` içinden `dogru` olanı bul. `gosterge` isteğe bağlı (örn. kelime kartı `{ "yazi": "KEDİ" }` veya harf kartı).
- **ESLESTIR**: `gosterge` = tek hedef (`bicim`: golge/yuva/renk). Çocuk doğru kartı hedefe sürükler.
- **SAY**: `gosterge` = sayılacak kart(lar) (`adet` ile). `kartlar` = sayı kartları (`sayi-3`). Toplama için iki gösterge + `"islem": "+"`;
  çıkarma için tek gösterge + `carpi` + `"islem": "-"`.
- **FARKLI**: `kartlar` = 4 kart, `dogru` = farklı olan.
- **SIRADAKI**: `gosterge` = örüntü dizisi (sonuna oyun otomatik "?" ekler), `kartlar` = seçenekler.
- **HAFIZA**: `kartlar` = çift sayısı kadar farklı kart (4 kart için 2, 6 için 3, 8 için 4 id). Oyun her birini ikiler ve karıştırır.

### Yaşa göre kurallar (testler bunları denetler)

| Yaş | Tipler | Seçenek sayısı | Diğer |
|---|---|---|---|
| 3 | BUL, ESLESTIR | 2 | Somut nesne tanıma |
| 4 | BUL, ESLESTIR, SAY, HAFIZA | 3 | SAY 1-5, HAFIZA 2 çift (4 kart) |
| 5 | hepsi | 4 | SAY 1-10, HAFIZA 3 çift (6 kart) |
| 6 | hepsi | 4 | toplama/çıkarma 10'a kadar, HAFIZA 4 çift (8 kart) |

**Kısa konuşma kuralı** (testler denetler — ElevenLabs uzun cümlelerde takılıyor, çocuklar da kısa cümleyi seviyor):
- `soru_ses`: tek kısa cümle, hedef en fazla 4 kelime; kesin sınır 6 kelime / 45 karakter.
- `ipucu`: en fazla 4 kelime / 30 karakter.
- `metinler.json` cümleleri: en fazla 30 karakter.

Her yaş × tema dosyasında en az 12 soru olmalı. Bir turda bu havuzdan rastgele 8 soru seçilir.
