# Kino ve Ailesi: ses istemleri ve replikler

Sesleri Barış üretiyor: ElevenLabs Voice Design ile ses tasarlanır, replikler Text to Speech'te **Eleven v3** modeliyle okunur.

- İstem İngilizce yazılır. Örnek metin Türkçe olur ve içinde ses etiketleri bulunur.
- Dosya adı replik kimliğidir (ör. `s1-kino1.mp3`). Dosyalar `ekip/ses/seri2-gelen/` klasörüne atılır.
- Ayarlar: Stability 35-45 (Creative/Natural), Similarity 75, Style 20-30.

## Ses etiketleri (v3)

Köşeli parantezli etiketler metnin içine yazılır, model onları seslendirir.

| Tür | Etiketler |
|---|---|
| Gülme | `[laughs]` `[giggles]` `[chuckles]` `[laughs harder]` |
| Nefes | `[sighs]` `[gasps]` `[exhales]` `[yawns]` `[sniffs]` |
| Ton | `[excited]` `[whispers]` `[curious]` `[happy]` `[sad]` `[surprised]` `[mischievously]` `[sleepy]` |
| Ses | `[sneezes]` `[gulps]` `[hums]` |

Kural: Her replikte en çok 1-2 etiket kullan; abartınca yapay duruyor. Kısa replikleri gerekirse 3-4 kez üret, en canlısını seç. Etiket tutmazsa yalnız o etiketi bırak, metni değiştirme.

---

## Ana aile

### Anlatıcı
> Warm, gentle female storyteller in her early 30s, native Turkish speaker with clear standard Istanbul Turkish. Soft, smiling, cozy bedtime-story tone like a preschool TV narrator. Calm medium pace, friendly and reassuring, never theatrical or sing-song. Clean studio recording, no background noise.

Örnek: *[softly] Sabahtı. Güneş, Kino'nun kulağına kadar gelmişti. [chuckles] Kino o sabah her şeyi kendisi yapmak istiyordu.*

### Kino (5 yaş)
> Cute 5-year-old boy cartoon character, native Turkish speaker. Bright, energetic, curious and a little bit proud, slightly high-pitched child voice with playful enthusiasm and natural giggles. Like a preschool animated series lead (Bluey / Caillou style). Clear pronunciation, not squeaky, not chipmunk. Clean studio recording.

Örnek: *[yawns] Günaydın, Lokum! [excited] Park mı? Yaşasın! [giggles] Ben büyüdüm artık, hepsini kendim yaparım!*

### Anne (Defne)

İlk istem tutmadı (Barış, 2026-10-10). B, C ve D seçenekleri:

- **B, genç ve tatlı:**
  > Young, sweet and bubbly Turkish mom in her late 20s, native Turkish speaker. Light, bright, youthful voice with a big warm smile, a little playful and teasing, like a cartoon mom in a preschool animated series. Cute and expressive but natural, quick lively rhythm. Not deep, not mature, not formal, not a news or narrator voice. Clean studio recording.
- **C, yumuşak ve şefkatli:**
  > Very gentle, tender Turkish mother around 30, native Turkish speaker. Soft, light, cuddly voice, speaking to her little son with love, slightly higher pitch, calm and comforting like a hug. Sweet and young-sounding, not dramatic, not husky, not low. Natural Istanbul Turkish. Clean studio recording.
- **D, neşeli ve enerjik:**
  > Cheerful, energetic Turkish mom in her early 30s, native Turkish speaker. Upbeat, sunny, musical voice with natural little laughs, playful with her kids, expressive cartoon timing. Medium-high pitch, clear and friendly, fun but warm. Natural Istanbul Turkish, not exaggerated. Clean studio recording.

Örnek: *[happy] Günaydın uykucu! Hadi bakalım, kalk! [chuckles] Bezelye kadar yeter canım… [excited] Aferin sana, pırıl pırıl oldu!*

### Lokum (2 yaş, erkek kardeş)
> Cute cartoon toddler, native Turkish speaker, just learning to talk. Cute baby talk, mispronounces words like a toddler, can't pronounce R yet, soft lisp. Very short words, giggly, high and soft, excited and squeaky-happy. Clean studio recording.

Örnek: *Abi! Abi! Daha! [laughs] Bana da! Yok! İstemiyoyum! [giggles]*

### Baba (Murat)
> Big, cuddly, sleepy Turkish dad in his mid 30s, native Turkish speaker. Warm soft baritone, slow and relaxed, yawns and laughs a lot, gentle giant, funny when he wakes up suddenly. Cartoon dad. Clean studio recording.

Örnek: *[yawns] Hıı… [surprised] Çay mı? Kalktım! [laughs] Kim simit ister, taze taze!*

### Babaanne Nazlı
> Warm, chubby, sweet Turkish grandmother in her late 60s, native Turkish speaker. Soft, cozy, loving voice, a bit slow, always offering food, gentle little chuckles. Cartoon granny, cute and kind, not shaky, not whispery. Natural Istanbul Turkish. Clean studio recording.

Örnek: *[happy] Sizin için yaptım, sıcacık! [chuckles] Gelin bakalım kuzularım, pişi var!*

### Dede Hasan
> Dry-humored, calm Turkish grandfather in his early 70s, native Turkish speaker. Slightly deep, slow, gravelly but warm voice, says few words with funny timing, melts with his grandkids. Cartoon grandpa, charming. Clean studio recording.

Örnek: *[sighs] Bak sen şu işe. [chuckles] Domatesler de sizin gibi büyümüş!*

### Mino
Uygulamadaki Mino sesi kullanılır; çocuk onu o sesten tanır.

---

## Kino'nun arkadaşları (yeni öneri, seri kitabına eklenecek)

### Bulut (kuzu, 5 yaş, utangaç oğlan)
> Shy, soft-spoken 5-year-old boy cartoon character, native Turkish speaker. Quiet, gentle, slightly hesitant voice, sweet and fluffy, giggles nervously. Not whiny. Preschool animation style. Clean studio recording.

Örnek: *[whispers] Ben de… ben de oynayabilir miyim? [giggles] Teşekkür ederim.*

### Zıpzıp (tavşan, 5 yaş, hızlı konuşan kız)
> Hyper, super fast-talking 5-year-old girl cartoon character, native Turkish speaker. High, bouncy, excited voice, talks without breathing, lots of giggles. Very cartoony and funny, but clear. Clean studio recording.

Örnek: *[excited] Hadi hadi hadi! Ben önce, sonra sen, sonra yine ben! [laughs harder]*

### Tombi (ayı yavrusu, 6 yaş, tok sesli oğlan)
> Chubby, slow and sleepy 6-year-old bear cub cartoon character, native Turkish speaker. Deep-ish for a kid, round, cozy, slow drawl, always hungry, lovable and funny. Clean studio recording.

Örnek: *[sighs] Ben acıktım… [curious] Bal var mı? Biraz… azıcık… bal? [gulps]*

### Vak (ördek yavrusu, 5 yaş, komik çatlak sesli oğlan)
> Funny, raspy, quacky 5-year-old duckling boy cartoon character, native Turkish speaker. Slightly cracked silly voice, confident show-off, big comic energy, like a classic cartoon sidekick. Clean studio recording.

Örnek: *[excited] Vak vak! Kim en hızlı? [laughs] Tabii ki ben!*

## Tek bölümlük yan karakterler

| Karakter | İstem | Örnek |
|---|---|---|
| Öğretmen | Kind, cheerful Turkish kindergarten teacher in her 30s, native Turkish speaker, bright clear voice, patient and encouraging, sing-song friendly. Clean studio recording. | *[happy] Günaydın çocuklar! Bugün resim yapıyoruz!* |
| Dişçi | Friendly, funny Turkish male dentist in his 40s, native Turkish speaker, warm and calming, playful jokes to relax kids. Clean studio recording. | *Ağzını aç bakalım… [surprised] Vay, ne güzel dişler! [chuckles]* |
| Bakkal amca | Jolly old Turkish shopkeeper uncle, native Turkish speaker, warm, loud and cheerful, neighborhood charm. Clean studio recording. | *[laughs] Hoş geldin aslanım! Ne lazımdı?* |

## Pati Dükkânı: Nehir abla
> Warm, calm young Turkish woman around 24, native Turkish speaker. Friendly big-sister voice, soft and smiling, gentle with animals, encouraging, says "ortağım" with love. Natural Istanbul Turkish. Clean studio recording.

Örnek: *[happy] Günaydın ortağım! [whispers] Bak, Fındık seni bekliyor. Yavaşça yaklaşalım…*

---

## Bölüm 1, ilk parça: 29 replik (etiketli, v3'e olduğu gibi yapıştır)

### Anlatıcı (8)
| Dosya | Metin |
|---|---|
| s1-anl1 | [softly] Sabahtı. Güneş, Kino'nun kulağına kadar gelmişti. |
| s1-anl2 | [chuckles] Kino o sabah her şeyi kendisi yapmak istiyordu. |
| s2-anl1 | Kum saati, Anne'nin dişçiden aldığı hediyeydi. |
| s2-anl2 | [happy] Dişler pırıl pırıldı. [chuckles] Lokum'un iki dişi bile. |
| o1-cagri | [excited] Köpüğün peşinden gidelim! |
| o1-yukari | [playfully] Yukarı, aşağı. |
| o1-yardim | [softly] Köpüğün üstünde kalalım. |
| o1-bitti | [excited] Pırıl pırıl! |

### Kino (11)
| Dosya | Metin |
|---|---|
| s1-kino1 | [yawns] Günaydın, Lokum! |
| s1-kino2 | [gasps] Park mı? [excited] Yaşasın! |
| s1-kino3 | [proudly] Ben büyüdüm artık! Hepsini kendim yaparım. |
| s2-kino1 | [surprised] Iı… [giggles] biraz çok oldu. |
| o1-bak | [excited] Bak, böyle! |
| o1-bitirim | [proudly] Ben bitiririm! |
| o1-hapsu | [sneezes] Hapşu! [giggles] |
| o1-bir | [excited] Bir! |
| o1-iki | [excited] İki! |
| o1-uc | [excited] Üç! |
| o1-dort | [excited] Dört! |

### Anne (5)
| Dosya | Metin |
|---|---|
| s1-anne1 | [happy] Günaydın! Bugün Babaanne'yle parka gidiyorsunuz. |
| s1-anne2 | [chuckles] Önce yüz, diş, giyinmek. |
| s2-anne1 | [laughs] Bezelye kadar yeter, canım. |
| s2-anne2 | [softly] Kum bitene kadar fırçala. |
| s2-anne3 | [laughs] Dişçi görse sevinirdi! |

### Lokum (5)
| Dosya | Metin |
|---|---|
| s1-lok1 | [excited] Abi! Abi! [giggles] |
| s1-lok2 | Abiii! |
| s2-lok1 | [laughs] Daha! |
| o1-pft | Pft! [giggles] |
| s2-lok2 | [happy] Iii! |
