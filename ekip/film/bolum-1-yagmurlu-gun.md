# Bölüm 1: Kino ve Yağmurlu Gün

> Durum: TASLAK (2026-10-09). Barış'la konuşulmadan animatiğe geçilmez.
> Biçim: uzun, sakin, gündelik hayat bölümü (Barış: "Caillou bölümleri gibi"). **Yalnız biçim alındı:** sıcak bir anlatıcı, okul öncesi bir çocuğun küçük bir günü, duyguların dürüstçe gösterilmesi, bir büyüğün yanında yumuşak bir çözüm. Karakter, olay ve ad alınmadı.
> Süre: **~5 dk 15 sn**, 4 perde + kapanış. Mevcut filmler 90-120 sn; bu bölüm aynı motorla, aynı sahne dosyası biçimiyle (`content/film/kino-yagmurlu-gun.json`), daha çok sahneyle yapılır.

## Künye
- **Konu:** Kino bugün Mino'yla parka gidecekti. Yağmur yağıyor. Kino önce üzülüyor, sonra kızıyor, sonra sıkılıyor. Annesi duygusunu anlıyor, birlikte minderden çadır kuruyorlar. Mino yağmurluğuyla geliyor. Yağmur dinince üçü su birikintilerinde zıplıyor.
- **Kahraman:** Kino. **Büyük:** Kino'nun annesi (YENİ karakter). **Arkadaş:** Mino.
- **Gösterdiği:** Planlar bozulunca üzülmek normaldir; üzüntü söylenir, sonra yeni bir oyun bulunur.
- **Duygu eğrisi:** heyecan → hayal kırıklığı → öfke → can sıkıntısı → anlaşılmak (sarılma) → merak → neşe → sıcak huzur.
- **Kapanış kartı:** *"Yağmurlu günlerin de kendi oyunu var."*

## Mekânlar (çoğu hazır)
| Yer | Dosya | Durum |
|---|---|---|
| Kino'nun oyun odası | `assets/film/ev` (`arka: "ev"`) | hazır. Yağmur başladıktan sonra pencere kadraja girmez (pencerede güneş var). |
| Oturma odası, yağmurlu pencere | `assets/film/yagmur` (koltuk, sehpa, ağaç kitaplık, minder yığını, şemsiyelik, yağmurlu pencere) | çizim hazır; **motora bağlanacak** (aşağıda "Motor işleri") |
| Minder çadırının içi | YENİ yakın plan arka plan | Gemini |
| Park, yağmurdan sonra | `assets/film/park` (`arka: "park"`) + ışık tonu + birikinti eşyaları | hazır; yalnız gökkuşağı yeni |

## Karakterler ve görünümler
| Karakter | Hazır | Yeni gereken |
|---|---|---|
| Kino (önden + profil) | iskelet, ifadeler: heyecan, üzgün, şaşkın, keyif, titreme, korku; profil yürüyüş/koşu | **kızgın** ifade (göz + ağız eki), **yüzüstü yatan** poz (minderde, çenesi patilerinde) |
| Kino yağmur giysileri | Kino Ne Giysin'den yağmurluk + çizme (`assets/giysin/giysi`) | yok |
| Mino | iskelet, duruşlar, yağmurluklu çizim (`assets/giysin/mino-yagmurluk`) | yok |
| **Kino'nun annesi** | — | YENİ: önden iskelet (Adobe), profil, sarılma pozu (Kino'yu kucaklarken), diz çökmüş/yere oturmuş duruş |

**Kino'nun annesi:** Kino'dan iri (Kino × 1.6), aynı tür ve aynı renk dili (beyaz tüy, kahve kulaklar, sırtında bir kahve benek; Kino'nun göz lekesi onda yok, böylece ikisi karışmaz), yumuşak gülümseme, **hardal sarısı hırka**. Sade, aksesuarsız. Sesi: anlatıcı sesinin sıcak ve bir tık kalın tonu (`content/seslendirme.json` → `karakter_sesleri.kino-anne`, ton 0.92). Ayrı bir ElevenLabs sesi istenirse para kararı Barış'ın.

## Sahne listesi

Saat sütunu bölüm içi zamandır (açılış jeneriği hariç). Kamera: `[x, y, z]` motorun kamera değerleri; aşağıda yalnız niyet yazılı, sayıları animatör koyar.
Müzik adları mevcut dosyalar: `film-merak`, `film-uzgun`, `film-surpriz`, `film-kutlama`, `film-kovalamaca`; sentez ruhları `nese`, `uzgun`, `yumusak`, `aydinlik`, `kapanis`.

---

### PERDE 1 · "Park günü" (0:00-1:05)

**Sahne 1 · Oyun odası, sabah (0:00-0:22)** · `arka: ev`, `isikTon: sabah`
- Kamera: geniş plan, yavaşça Kino'ya yaklaşır (push-in).
- Kino halının üstünde, bir **kova** ve **kürekle** (park için) çantasını dolduruyor; kuyruğu durmadan sallanıyor (heyecan).
- Müzik: `film-merak` düşük (0.4), neşeli.
- ANLATICI: "Bu Kino. Bugün çok heyecanlı."
- ANLATICI: "Çünkü bugün Mino'yla parka gidecek."
- Kino kovayı başına geçirir, çıkarır, güler (`tepki: zipla`). 
- KİNO: "Kaydırak! Kaydırak!"

**Sahne 2 · Oyun odası (0:22-0:42)**
- Kamera: Kino belden yukarı, yakın.
- Kino çantayı sırtına takar, kapıya doğru iki hop (`git`, `yay`).
- Ses: uzaktan ilk "tıp… tıp tıp" (yeni efekt `yagmur-bas`, hafif). Kino durur, kulakları kalkar (`ifade: saskin`).
- Işık yavaşça kararır (`kim: isik`, 0 → 0.35): bulut geçti.
- KİNO: "Bu ne sesi?"
- Kamera kesmez; Kino profilden **koşarak** sağa çıkar (`yerine` → `kinoy`, `stil: kos`). Pencere kadraja girmez.

**Sahne 3 · Oturma odası, yağmurlu pencere (0:42-1:05)** · `arka: yagmur`
- Kamera: pencerenin önünde Kino arkadan-yandan, sonra **yavaş push-in** Kino'nun yüzüne.
- Pencerede yağmur süzülüyor (yeni kod katmanı: camda damla izleri). Uzaktan yumuşak gök gürültüsü (`gum`, kısık).
- Kino burnunu cama yapıştırır; nefesi camı buğular (yeni küçük buğu lekesi, kod).
- Müzik: `film-merak` söner (`dosya-dur`, 2 sn). Sessizlik + yağmur.
- ANLATICI: "Ama dışarıda yağmur yağıyordu."
- KİNO (alçak): "Yağmur mu?"
- Kulaklar yavaşça düşer (`ifade: uzgun`, kulak `dusuk`).

---

### PERDE 2 · "Kino'nun duyguları" (1:05-2:10)

**Sahne 4 · Oturma odası (1:05-1:25)**
- Kamera: Kino'nun yüzü yakın plan (yalnız Kino).
- Müzik: `film-uzgun`, 0.35.
- KİNO: "Ama kaydırak…"
- ANLATICI: "Kino çok üzüldü. Gözleri doldu."
- Gözünde parlak bir damla (üzgün ifadenin ıslak gözleri), dudağı titrer (`titre`, küçük).

**Sahne 5 · Oturma odası (1:25-1:42)** · öfke
- Kamera: belden yukarı, hafif alttan (Kino büyük görünür, ama komik).
- Kino ayağını yere vurur, iki kez (`tepki`/`bas`, `ayak` efekti). Yeni **kızgın** ifade. Çantayı yere bırakır, kova yuvarlanır (`sek`, `yuvarlan`).
- KİNO: "Yağmur kötü! Hiç sevmiyorum!"
- ANLATICI: "Kino kızdı. Bu da olur."
- Kova minder yığınına "pof" diye çarpar (`pof`). Kino'nun öfkesi biraz söner; kovaya bakar.

**Sahne 6 · Minder yığını (1:42-2:10)** · can sıkıntısı
- Kamera: geniş plan, minder yığınının yanında, Kino yalnız ve küçük (yalnızlık hissi), sonra yavaşça yaklaşır.
- Kino minderlerin üstüne **yüzüstü** yatar (yeni yatan poz), çenesi patilerinde. Kuyruğu bir kez "pat" diye düşer.
- Ses: saatin tik takı (`tiktok`), yağmur.
- KİNO: "Of… Çok sıkıldım."
- ANLATICI: "Yağmur durmadı. Saat de hiç ilerlemiyordu."
- Kino ayaklarını sallar, bir minderi kafasına koyar, çıkarır. İç çeker (`huzun`).

---

### PERDE 3 · "Annem anlıyor" (2:10-3:40)

**Sahne 7 · Anne gelir (2:10-2:35)**
- Kamera: geniş plan; Anne soldan girer (profil yürüyüş, sakin).
- Müzik: `film-uzgun` söner, sentez `yumusak` başlar (`baslat`).
- Anne Kino'nun yanına **diz çöker** (oturuş duruşu), göz hizasına iner. Kamera ikisini aynı karede, yakın plan.
- ANNE: "Kino'cuğum, ne oldu?"
- KİNO (yüzünü saklar): "Parka gidemiyoruz."
- ANNE: "Parka gidemedin, üzüldün."
- Kino başını sallar (`tepki: evet`, yavaş).

**Sahne 8 · Sarılma (2:35-2:55)**
- Kamera: yavaş push-in, iki yüz kadrajı doldurur.
- ANNE: "Üzülmek olur. Gel, sarılalım."
- Anne Kino'yu kucaklar (yeni **sarılma pozu**: annenin kolları Kino'yu sarar). Kino gözlerini kapar (`keyif`).
- Ses: yumuşak `eri` efekti. Işık hafifçe ısınır (`isik` 0.35 → 0.25).
- ANLATICI: "Annesi sarılınca, Kino biraz rahatladı."
- KİNO (fısıltı): "Ama hâlâ sıkılıyorum."

**Sahne 9 · Fikir (2:55-3:15)**
- Kamera: belden yukarı ikili.
- Anne gülümser, minder yığınına bakar (`bak`), sonra koltuktaki battaniyeye.
- ANNE: "Yağmur oyunu bilir misin?"
- KİNO (`ifade: saskin`, kulaklar kalkar): "Yağmur oyunu mu?"
- ANNE: "Minderlerden çadır kuralım!"
- Müzik: `film-surpriz` kısa (0.5), sonra `film-kovalamaca` hafif ve neşeli.

**Sahne 10 · Çadır kurmak (3:15-3:40)** · montaj
- Kamera: geniş plan, sabit; hareket karakterlerde.
- Kino minderleri tek tek taşır (profil, `al`/`birak`; 3 minder, her biri ayrı renk: sarı, mavi, yeşil). Her konuşunda "pof" ve minder ezilip yaylanır.
- ANLATICI (sayar gibi): "Bir minder… iki minder… üç minder!"
- Anne battaniyeyi minderlerin üstüne serer (`battaniye-anne` eşyası, `git` + `salla`).
- Son minderi koyarken Kino'nun kafası battaniyenin altında kalır; sadece kuyruğu sallanır. Anne güler (`kikir`).
- Çadır tamam: yeni **minder çadırı** eşyası belirir (yığın + battaniye birleşik görsel, ön kenarı ayrı ön katman).
- KİNO (battaniyenin altından kafasını çıkarır): "Çadırımız oldu!"

---

### PERDE 4 · "Çadırda ve dışarıda" (3:40-4:50)

**Sahne 11 · Çadırın içi (3:40-4:05)** · `arka: cadir-ic` (YENİ yakın plan)
- Kamera: çadırın içi, sıcak loş ışık; Kino ve Anne yan yana oturur.
- Anne **fener** yakar (`assets/film/esya/fener`), battaniyenin duvarına yuvarlak ışık düşer.
- Anne elleriyle gölge yapar: duvarda **tavşan gölgesi** zıplar (gölge = mevcut tavşan çiziminin koyu siluet hâli, kodla). Kino güler (`heyecan`).
- KİNO: "Tavşan! Bir daha!"
- Kino patisiyle dener: duvarda biçimsiz bir gölge çıkar. Kino kafasını yana eğer.
- KİNO: "Bu… patates mi?"
- Anne kahkaha atar. Kino da güler. Müzik `nese`.

**Sahne 12 · Tık tık (4:05-4:20)**
- Ses: kapıda "tık tık" (`tik` iki kez).
- Kamera: kapı tarafı, oturma odasına geri (`arka: yagmur`). Mino **yağmurluğuyla** ve kapalı şemsiyesiyle girer, silkinir, damlalar uçuşur (`titre` + damla parçacıkları).
- MİNO: "Kino! Ben geldim!"
- KİNO (çadırdan fırlar): "Mino! Çadıra gel!"
- Mino çadıra koşar; ikisi içeri girer, çadır sallanır (`salla`), içeriden kıkırdamalar (`kikir`).

**Sahne 13 · Yağmur dindi (4:20-4:30)**
- Ses: yağmur yavaşça susar (yeni `yagmur-dur`). Işık açılır (`isik` → 0, `isikTon: sabah`). Pencereden içeri bir güneş huzmesi (kod: yumuşak açık şerit).
- Kamera: çadırın ağzından çıkan iki kafaya yakın plan.
- KİNO: "Ses kesildi!"
- ANNE: "Yağmur bitti. Çizmeler nerede?"
- KİNO (`heyecan`): "Çizmeler!"

**Sahne 14 · Park, birikintiler (4:30-4:50)** · `arka: park`, ıslak ton
- Kamera: geniş plan; gökte yeni **gökkuşağı** (uzak katmanda, yavaş belirir). Çimde 3 **su birikintisi** (`assets/giysin/esya-birikinti` ya da `film/esya/su-birikintisi`).
- Müzik: `film-kutlama`.
- Kino (yağmurluk + çizme) ve Mino (yağmurluk) koşarak gelir; Anne arkadan yürür.
- Kino birinci birikintiye zıplar: **ŞLAP!** Su sıçrar (`esya-sicrama` + yeni `sicrama` efekti). Mino ikinciye zıplar. Anne üçüncüsüne küçük bir adım atar: minik "şlap", hepsi güler.
- ANLATICI: "Şlap! Şlap! Şlap!"
- Kino kaydırağa koşar, kayar; kaydırak ıslak, Kino hızlıca kayıp birikintinin içine oturur (`kaydir` + `sicrama`). Kuyruğu ıslak, şaşkın yüz, sonra kocaman gülüş.
- KİNO: "Islak kaydırak daha hızlı!"

---

### KAPANIŞ · "Sıcak süt" (4:50-5:15)

**Sahne 15 · Oturma odası, akşamüstü (4:50-5:15)** · `arka: yagmur`, `isikTon: aksam`
- Kamera: çadırın önü, üçü battaniyeye sarınmış (Mino ve Kino yan yana, Anne arkada). Ellerinde **sıcak süt kupaları**, buhar tüter.
- Pencerede artık yağmur yok; cam damlaları yavaşça süzülür (kod katmanı, yalnız damlalar).
- Müzik: sentez `kapanis`.
- KİNO: "Anne, yağmurlu gün de güzelmiş."
- ANNE: "Hem de çok!"
- Mino esner, Kino'nun omzuna yaslanır. Kino gülümser (`keyif`). Kamera yavaşça geri çekilir (pull-out), çadırın tamamı ve pencere kadrajda.
- ANLATICI: "O gün Kino parka gidemedi. Ama yine de çok oynadı."

**Kapanış kartı (motorun mevcut kapanış kartı alanı):** *"Yağmurlu günlerin de kendi oyunu var."*

---

## Cümle listesi (seslendirilecek)
**Anlatıcı (10):** "Bu Kino. Bugün çok heyecanlı." · "Çünkü bugün Mino'yla parka gidecek." · "Ama dışarıda yağmur yağıyordu." · "Kino çok üzüldü. Gözleri doldu." · "Kino kızdı. Bu da olur." · "Yağmur durmadı. Saat de hiç ilerlemiyordu." · "Annesi sarılınca, Kino biraz rahatladı." · "Bir minder… iki minder… üç minder!" · "Şlap! Şlap! Şlap!" · "O gün Kino parka gidemedi. Ama yine de çok oynadı."
**Kino (17):** "Kaydırak! Kaydırak!" · "Bu ne sesi?" · "Yağmur mu?" · "Ama kaydırak…" · "Yağmur kötü! Hiç sevmiyorum!" · "Of… Çok sıkıldım." · "Parka gidemiyoruz." · "Ama hâlâ sıkılıyorum." · "Yağmur oyunu mu?" · "Çadırımız oldu!" · "Tavşan! Bir daha!" · "Bu… patates mi?" · "Mino! Çadıra gel!" · "Ses kesildi!" · "Çizmeler!" · "Islak kaydırak daha hızlı!" · "Anne, yağmurlu gün de güzelmiş."
**Anne (7):** "Kino'cuğum, ne oldu?" · "Parka gidemedin, üzüldün." · "Üzülmek olur. Gel, sarılalım." · "Yağmur oyunu bilir misin?" · "Minderlerden çadır kuralım!" · "Yağmur bitti. Çizmeler nerede?" · "Hem de çok!"
**Mino (1):** "Kino! Ben geldim!"
**Kart:** "Yağmurlu günlerin de kendi oyunu var."
Toplam 35 cümle + kart, ~880 karakter.

## Ses ve müzik
- Mevcut dosyalar yetiyor: `film-merak`, `film-uzgun`, `film-surpriz`, `film-kovalamaca`, `film-kutlama`, sentez `yumusak`, `nese`, `kapanis`. Yeni müzik gerekmez.
- Mevcut efektler: `gum`, `ayak`, `yuvarlan`, `pof`, `tiktok`, `huzun`, `eri`, `kikir`, `tik`, `kaydir`, `final`.
- **Yeni efektler (Web Audio sentezi, kredi yok):** `yagmur` (döngü, yumuşak beyaz gürültü + rastgele damla tıkları), `yagmur-dur` (yağmurun 3 sn'de sönmesi), `sicrama` (su "şlap": kısa gürültü patlaması + iki damla tıkı).

## Motor işleri (animatör, kod; çizim değil)
1. **`arka: "yagmur"`**: `assets/film/yagmur` (arka-uzak, arka-orta, arka-on) `ev` gibi bağlanır; `FILM_GORSEL` globuna `yagmur` eklenir (`tests/unit/film-arka.test.ts` güncellenir).
2. **Camda yağmur katmanı:** pencere alanında süzülen damla çizgileri (yalnız transform/opacity), `{ kim: "yagmur", yap: "basla" | "dur" }`.
3. **Buğu ve güneş huzmesi:** camda yumuşak beyaz leke (Kino'nun nefesi) ve pencereden içeri açık şerit; ikisi de kod.
4. **Gölge oyunu:** çadır içinde bir eşyanın siyah siluet hâli (`filter: brightness(0)`, saydam %55) battaniye duvarında.
5. **`arka: "cadir-ic"`**: tek katmanlı yakın plan arka plan (yeni çizim).
6. **Islak park tonu:** park sahnesine hafif soğuk/parlak ton (`isikTon: "yagmur"` yeni değer) ve gökkuşağı eşyası uzak katmanda.
7. **Bölüm biçimi:** katalog kartında süre "5 dk"; film 4 perdeyi tek dosyada oynatır; perdeler arası yumuşak iris. Uzun film olduğu için katalogda "Bölüm" rozeti.

## Yeni görseller (özet; istemler `ekip/gemini/IS-LISTESI-YENI.md` → bölüm C)
- Kino'nun annesi: önden (iskelet kaynağı), profil, sarılma pozu, diz çökmüş/oturmuş.
- Kino: kızgın ifade eki, yüzüstü yatan poz.
- Minder çadırı (eşya, ön kenar ayrı), çadırın içi (arka plan), gökkuşağı, iki sıcak süt kupası, üç renkli minder (taşınan eşya), kova + kürek seti (`esya-kova`, `esya-kurek` Giysin'den yeniden kullanılır: yeni değil).

**Yeniden kullanılan:** `ev`, `yagmur`, `park` arka planları; Kino ve Mino iskeletleri; Mino yağmurluk; Kino yağmurluk ve çizme (Giysin); battaniye (`assets/ege/battaniye-anne`); fener, su birikintisi, şemsiye, kaydırak; `esya-sicrama`; bütün müzikler.
