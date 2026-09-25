# Uyuyan Orman — Gemini (tarayıcı) görsel iş listesi

Bu işler tarayıcıdaki Gemini (görsel düzenleme / Nano Banana) ile yapılır; API kullanılmaz.
Amaç: **aynı karakterin tutarlı ifadelerini** üretmek (Claude animasyonu bu ifadeler arasında geçişle ve kodla yapar), bir de arka planları **katmanlara** ayırmak. (Rive iptal edildi; parça seti artık gerekmiyor.)
En önemli kural: **stil ve karakter birebir aynı kalacak.** Yeni karakter çizdirmiyoruz; var olanı düzenliyoruz.

## 0. Her istekte

1. Kaynak görseli indirip Gemini'ye **yükleyin** (aşağıdaki adresler; tarayıcıda açıp "farklı kaydet").
2. İsteğin başına her zaman bu cümleyi koyun (stil kilidi):
   > Keep exactly the same character, same art style, same colors, same thick dark-brown outlines, same glossy highlights, same proportions, same framing and position in the image. Premium glossy 2D cartoon vector style for a toddler picture book. Plain pure white background. No text.
3. Sonucu kaynakla yan yana koyup kontrol edin: yüz, renk, çizgi kalınlığı, oran değiştiyse **kullanmayın**, yeniden isteyin.
4. Dosyalar **PNG**, olabildiğince büyük (en az 1024 px). Beyaz zemin sonra silinir (Recraft/Photoshop "remove background" ya da Rive'da maske).
5. Kayıt: `ekip/gemini/<karakter>/<dosya>.png` olarak GitHub'a (ekip dalı). Çok büyükse 1024 px'e küçültüp gönderin.

## 1. Kaynak görseller

| Karakter | Kaynak |
|---|---|
| sincap | https://img.recraft.ai/3hLODN-4vaLw4K3Zhwy2qBD3rHHsNoZNQtN5F7jv71w/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/e10a9c35-b2cb-4c91-b06c-3545258bab21 |
| kus | https://img.recraft.ai/yJNSMVSz0JurxBfgcVtmyeQERnXKQEttV24pqu-xDzc/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/047b4913-e24d-40ad-9cc2-b73eda1d5069 |
| dev | https://img.recraft.ai/uNqpUFNqeztCBRl4jai368a5dJo8MtxWj3pKcZhOSq4/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/5ef56162-c9fa-4339-8907-aa589726c0f9 |
| inek | https://img.recraft.ai/WnUvJ_FY-rf4VDvstK-kkJit4sS4R6_ERIjZDcOiRto/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/671c36c0-74c3-4ce3-b8fa-42d86968a706 |
| kopek | https://img.recraft.ai/HBq_B5wn3GtcwBBYO5cS21tmFeNcS5AGWOkolAQoDZw/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/3664fb00-e251-4e11-b2c9-490ff912df03 |
| kedi | https://img.recraft.ai/Vo_qRMXwCIvzMHvAm-2eF6MXjyf6h_eGI-A7Dwg8jUE/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/a60c205f-233f-41fd-87e6-28b364fcefc9 |
| maymun | https://img.recraft.ai/SMN47vodvouZg5plmhRJxUnB5GZUJ9slj7PiugJwGwI/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/8ad1330e-7108-4b8a-a308-a2bbd4963007 |
| baykus | https://img.recraft.ai/hIWA3QHorakxgrfXCMTXTwlGhRNRys-YHT4cM-Ni5vM/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/45116c13-9b00-4fe1-9aa1-d2b1c989d5f5 |
| tavsan | https://img.recraft.ai/1n3NLOy0McAExW7SjcTWvRjWXOAmvxInqoWmgta4zaE/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/7c9ae8c4-91c5-4819-a406-21862900e53e |
| ayi | https://img.recraft.ai/4e6n86p4AKuXd1GS6MphKv_ffd3m9MzKxorznz9VvTU/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/ad53865d-5585-4bf5-87db-4f32bc1b10e8 |
| papagan | https://img.recraft.ai/9kgbn3S882hLTQ60SMWp4_Bls9MNlFwgb28jw3TlNAY/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/44573077-81f2-4621-9187-3d64da32cd27 |

## 2. İfade seti (her karakter için 6 görsel; aynı poz, sadece yüz değişir)

| Dosya | İstek (stil kilidinden sonra ekleyin) |
|---|---|
| `uyuyor.png` | Only change the face: eyes peacefully closed as if sleeping (curved closed eyelid lines), relaxed calm smile. |
| `esniyor.png` | Only change the face: a big cute yawn, eyes squeezed shut, mouth wide open in a round yawn. |
| `mutlu.png` | Only change the face: very happy, eyes open and sparkling, big open-mouth smile. |
| `dinliyor.png` | Only change the face and ears: curious and attentive, eyes wide open, ears perked up. |
| `hmm.png` | Only change the face: cute puzzled expression, one eyebrow raised, small sideways mouth. Not sad, not angry. |
| `goz-kirpma.png` | Only change the eyes: eyes half closed, mid-blink. |

**Dev** için `mutlu.png` farklıdır: "still sleeping with eyes closed, a big happy smile, a few more tiny flowers blooming on his head". Dev hiçbir görselde gözünü açmaz.
**Tavşan** için ek: `yuru-1.png`, `yuru-2.png`: "tiptoeing quietly, side view facing right, one foot raised / the other foot raised".
**Kuş** için ek: `kanat-yukari.png`, `kanat-asagi.png`: "wings raised up high / wings pushed down, flying pose".

## 3. Parça seti — İPTAL (Rive'dan vazgeçildi; yapmayın)

Rive'cı karakteri parçalardan kurar. Parçalar **orijinalle aynı ölçek ve konumda** olmalı ki üst üste konunca birebir tutsun.
Önerilen yol: parçaları Photoshop/Affinity'de orijinalden kesin; Gemini'yi yalnızca **gizli kalan yerleri tamamlamak** için kullanın:

| Dosya | İstek |
|---|---|
| `govde-kolsuz.png` | Remove both arms and paws completely and paint the body and belly behind them, as if the arms were not there. |
| `govde-kuyruksuz.png` | Remove the tail completely and paint the background/body behind it. |
| `kafa-yok.png` | Remove the head completely, keep only the body; paint the neck and shoulders cleanly where the head was. |
| `kafa-tek.png` | Show only the head (with ears), nothing else, same size and position. |
| `yuz-bos.png` | Remove the eyes, eyebrows and mouth, keep only the empty face with fur color and cheeks (for placing animated eyes and mouth). |

Parça listesi karaktere göre: kafa, gövde, sol/sağ kol, sol/sağ bacak (varsa), kuyruk, kulaklar, gözler (açık/kapalı), ağız (kapalı/açık/yuvarlak). Rive'cı neye ihtiyaç duyarsa buna göre ister.

## 4. Arka plan katmanları (derinlik hareketi için, 7 sahne)

Her sahne 3 katmana ayrılır; kaynaklar `assets/recraft/orman.json` içindeki `orman/…` adresleri.

| Dosya | İstek |
|---|---|
| `<sahne>-gok.png` | Keep only the sky (and clouds/moon/stars); remove everything else and extend the sky naturally where it was. |
| `<sahne>-orta.png` | Keep only the middle layer (distant hills, trees, buildings); make everything else plain pure white. |
| `<sahne>-on.png` | Keep only the closest foreground elements at the bottom (grass, flowers, rocks, crystals); make everything else plain pure white. |

Sahneler: `harita`, `ruzgar`, `kus`, `ciftlik`, `davul`, `hece`, `dev`. Bitince Claude'a haber verin; katmanları oyuna o bağlayacak.

## 5. Öncelik

1. **Sincap** ifade seti (pilot: Claude bununla animasyonu kurup Barış'a gösterir).
2. Dev, kuş (+ kanat yukarı/aşağı), inek, köpek, kedi, maymun, baykuş, tavşan (+ yürüme iki kare), ayı, papağan ifade setleri.
3. Arka plan katmanları.

Teslim: PNG'leri ortak klasöre koyun ve **GitHub'a da gönderin**: `ekip/gemini/<karakter>/<dosya>.png` (ekip dalı). Claude oradan alıp küçültür, zeminini siler ve oyuna koyar. Dosya adları tablodakiyle aynı olsun.
