# Sesli cümle değişiklik önerisi (Sesli Maceralar, K2)

Tarih: 2026-10-16. Hazırlayan: kodcu (kalite denetimi K2 paketi).

**ONAY BEKLİYOR (Barış).** Bu cümlelerin hiçbiri değiştirilmedi. Metin değişince kayıt yeniden üretilir (ElevenLabs kredisi).

## Neden

Barış'ın kuralı şu: çocuğa "şuna dokun" denmez. Çocuk gerçekten seçer ve dener, ipucu geç ve dolaylı gelir.

Kodda yapılanlar (metin değişmeden):
- Görev çipi ekrandan kalktı.
- El 40 sn'den önce çıkmıyor; 25 sn'de yalnız hedefin üstünde yumuşak bir hale çıkıyor.

Ama anlatıcı bazı adımlarda hedefi ve hareketi hâlâ açıkça söylüyor. Örnek: "Pili fenere tak.", "Başını okşa."

Öneri: anlatıcı yalnız **durumu** söylesin. Ne yapılacağını çocuk bulsun.

## Değiştirilmeyecekler

Sesle oynanan görevlerin cümleleri kalıyor: "Balona üfle!", "Alkışla!", "Kısık sesle çağır", "Hop de". Bunlar oyunun kendisi. Seçim yok; çocuk sesini kullanmayı öğreniyor.

Sıra hafızası ("Önce kulağım, sonra kuyruğum!") ve ritim ("Köpüklere ritimle dokun!") da kalıyor.

## Liste (33 cümle)

Kurallar:
- Önerilerin hepsi ≤ 30 karakter ve ≤ 6 kelime (`tests/unit/cumleler.test.ts`).
- Ses etiketleri ([laughs] vb.) seslendirme sırasında eklenir.

### Banyo (`content/macera-banyo.json`), 11 cümle

| # | Anahtar | Şimdi | Öneri (durum anlatır) |
|---|---|---|---|
| 1 | mino.hedef_kuyruk | Kino'nun kuyruğunu bul! | Kino'nun kuyruğu da çamur! |
| 2 | mino.hedef_pati | Şimdi benim patimi bul! | Benim patim de çamur oldu! |
| 3 | mino.doldu | Doldu! Musluğu kapat. | Küvet doldu! Su taşacak! |
| 4 | mino.bosa | Su boşa akıyor! Kapat! | Su boşa akıyor! |
| 5 | mino.kopurt | Kulaklarımı köpürt! | Kulaklarım hâlâ kirli! |
| 6 | mino.patilerim | Şimdi patilerim! | Patilerim de kirli! |
| 7 | mino.ekran | Ekran ıslandı! Sil! | Eyvah, ekran ıslandı! |
| 8 | mino.ayna | Ayna buğulanmış. Sil bakalım! | Ayna buğulandı, göremiyorum! |
| 9 | mino.tara | Tüylerimi tarar mısın? | Tüylerim karmakarışık oldu! |
| 10 | kino.sac | Saçıma dokun, şekil ver! | Köpükten saç olur mu? |
| 11 | kino.bul | Mino nerede? Bul onu! | Mino nereye saklandı? |

### Elektrikler Kesildi (`content/macera-elektrik.json`), 11 cümle

| # | Anahtar | Şimdi | Öneri |
|---|---|---|---|
| 12 | mino.oksa | Kino hâlâ titriyor. Başını okşa, sakinleşsin. | Kino hâlâ titriyor… |
| 13 | mino.yak | Düğmesine bas, yak! | Bu fener nasıl yanıyor? |
| 14 | mino.pil_yok | Yanmadı! Pili bitmiş. Pil bul! | Yanmadı! Pili bitmiş galiba. |
| 15 | mino.pil_tak | Pili fenere tak. | Bu pil nereye girer? |
| 16 | mino.isik | Işık yandı! Işığı yıldıza götür. | Işık yandı! Tavanda ne var? |
| 17 | mino.kino_tut | Şimdi ışığı Kino'ya tut! | Kino hâlâ karanlıkta! |
| 18 | mino.nereden | Bu ses nereden geldi? Işık tut! | Bu ses nereden geldi? |
| 19 | mino.sandalye | Önce sandalyeleri getir. | Çadır neyin üstüne kurulur? |
| 20 | mino.battaniye | Şimdi battaniyeyi üstüne ser. | Çadırın çatısı yok! |
| 21 | mino.mandal | Mandallarla tuttur. | Battaniye kayıyor! |
| 22 | mino.kapat | Feneri kapat, çekmeceye koy. | Fener hâlâ yanıyor… |

### Ege Uyuyor (`content/macera-ege.json`), 7 cümle

| # | Anahtar | Şimdi | Öneri |
|---|---|---|---|
| 23 | mino.battaniye | Anneye battaniyeyi ört. | Anne üşüyor galiba. |
| 24 | mino.onluk | Önce önlüğünü tak. | Mama üstüne dökülmesin! |
| 25 | mino.kasik | Kaşığı mamaya daldır. | Mama kasede bekliyor. |
| 26 | mino.ver | Şimdi Ege'ye ver. | Ege ağzını açtı! |
| 27 | mino.sil | Yüzü mama oldu. Peçeteyle sil. | Ege'nin yüzü mama oldu! |
| 28 | mino.kukla | Kuklaları çıkar! | Sepette ne var acaba? |
| 29 | mino.tut | Çabuk, burnumu tut! | Hapşıracağım! Ege uyanacak! |

### Salıncak Kimin? (`content/macera-salincak.json`), 2 cümle

| # | Anahtar | Şimdi | Öneri |
|---|---|---|---|
| 30 | mino.ters | Salıncağa oturarak binilir. Kino'yu çevir! | Kino ters bindi! Hı hı… |
| 31 | mino.sikisti | Kino sıkıştı! Çek onu! | Kino kaydırakta sıkıştı! |

### Doğum Günü (`content/macera.json`), 2 cümle

| # | Anahtar | Şimdi | Öneri |
|---|---|---|---|
| 32 | dogumgunu.balon_cizgi | Yeşile gelince dur, fazla şişirme! | Çok şişerse patlar mı? |
| 33 | dogumgunu.saklan | Şşş! Ada geliyor! Hemen saklanalım! | Şşş! Ada geliyor! |

## Maliyet ve sıra

- 33 cümle, ortalama ~22 karakter, toplam ~730 karakter. ElevenLabs v3 ile ~750-1.000 kredi tutar.
- Eski kayıtlar silinmez. Yeni metin CI'da eksik cümle olarak üretilir.
- Önerilen sıra:
  1. Barış listeyi onaylar ya da düzeltir. Senarist de bakarsa iyi olur ("senaristsiz içerik yok" kuralı).
  2. Kodcu `content/macera-*.json` dosyalarını değiştirir.
  3. Push edilince CI kayıtları üretir.
  4. Değişen her adımda çocuğun ≥3 anlamlı seçeneği olup olmadığına ayrıca bakılır. Gerekirse komik yanlış hedefler eklenir (Banyo ve Salıncak, K2'nin ikinci yarısı).
