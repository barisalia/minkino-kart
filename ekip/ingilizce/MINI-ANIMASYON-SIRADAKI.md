# Mini animasyonlar · pilottan sonra (liste, sipariş değil)

Hazırlandı: 22 Kasım 2026. **Paket 33 (22 Kasım 05:46) bu listeden happy (Kino, hediye) ve jump (Zıpzıp, kep) aldı; yanına cat (Pamuk), hug (Lokum ve Kuzu), dance (Mila) ve read (Polly) eklendi. Kalan adaylar aşağıda.** Pilot Paket 30'da (şemsiye/rain, elma/apple, soğuk/cold, balon/big-small, uyku/sleep, merhaba/hello).
Pilot beğenilirse bu listeden ada ada sipariş yazılır. Her animasyon 4 pozdur (başlangıç, hazırlık, sürpriz, tepki), sayfa başına 2 animasyon (8 çizim).
Kural pilotla aynı: tek karakter, tek eşya, küçük bir sürpriz, yazı yok, onaylı kadro, insan figürü yok, çilek yok.
Kod tarafı hazır: `ingilizce/src/mini-animasyon-veri.ts` listesine bir satır eklenir, dört poz `assets/ingilizce/mini/<id>-0..3.webp` olarak gelir, başka iş yoktur.

Karakterleri karıştırdım: aynı adada aynı karakter iki kez yok. Kino sık çıkıyor, Lokum, Mino, Bulut, Zıpzıp ve Polly de dönüşümlü geliyor.

## Duygular (`duygular`)
| sözcük | karakter | şaka (4 poz) |
|---|---|---|
| happy | Kino | Hediye kutusunu sallar, kapağı kalkar, içinden kırmızı top zıplar; Kino kollarını açıp sevinir. |
| sad | Lokum | Kumdan kale yapar, kale çöker, dudağı titrer; kürekle tepeye minik bir bayrak diker, gülümser. |
| surprised | Mino | Kutuyu açar, içinden yaylı bir oyuncak fırlar; Mino'nun kulakları dikilir, gözleri kocaman; sonra güler. |
| sleepy | Bulut | Kitap okurken esner; kitap yüzüne kapanır; kitabın altından yalnız boynuzlar ve kulaklar görünür. |

## Hareketler (`hareketler`)
| sözcük | karakter | şaka |
|---|---|---|
| jump | Zıpzıp | Çömelir, havaya zıplar, şapkası daha yükseğe uçar; yere iner, şapka kafasına oturur. |
| clap | Kino | İki elini açar, alkışlar, iki el arasından minik bir kelebek havalanır; Kino şaşırıp güler. |
| eat | Bulut | Kocaman bir sandviçi ağzına götürür, ısırır, yanakları şişer, sandviçte ısırık izi. |
| drink | Lokum | Pipetle süt içer; bardak boşalır, pipetten "hüp" diye son yudum çeker, yanakları içe göçer; bıyık gibi süt izi. |

## Hava (`hava`)
| sözcük | karakter | şaka |
|---|---|---|
| wind | Mino | Rüzgârda fuları uçar; yakalamaya uzanır; fuları kuyruğuna dolanır; güler. |
| sun / hot | Zıpzıp | Güneşte terler, dondurma erir ve damlar; Zıpzıp çabucak yalar, yüzü dondurma olur. |

## Hayvan sesleri (`ciftlik`, `vahsi`)
Hayvanın kendisi kadromuzda olmadığı için karakter hayvanı izler. Hayvan, kelime kartındaki onaylı çizimle aynı stilde ve küçük çizilir. Hayvan eşya sayılır.
| sözcük | karakter | şaka |
|---|---|---|
| cow (moo) | Kino | İneğe çiçek uzatır; inek "moo" diye ağzını açar (yazısız); Kino'nun kulakları rüzgârla geriye savrulur; güler. |
| chicken | Lokum | Avucunda yem; tavuk gagalar, Lokum gıdıklanır, kıkırdar. (Ördek yok.) |
| frog | Mino | Nilüferin üstündeki kurbağaya eğilir; kurbağa zıplar, Mino'nun başına konar; Mino şaşı bakmadan yukarı bakar, güler. |
| lion (roar) | Zıpzıp | Kâğıt aslan maskesiyle iki patisi pençe "roar" yapar; maske kayar, yüzü çıkar; utanıp güler. |

## Oyuncaklar (`oyuncaklar`)
| sözcük | karakter | şaka |
|---|---|---|
| ball | Kino | Topa tekme atar, top tavana çarpar, geri gelip başına kibarca konar; Kino gözlerini kırpar. |
| kite | Bulut | Uçurtmayı koşarak kaldırır; uçurtma ipi boynuzuna dolanır; Bulut güler. |
| drum | Lokum | Davula vurur, kulakları her vuruşta havalanır; son vuruşta iki kulağı birden kalkar. |

## Yiyecekler ve Sofra (`yiyecekler`, `sofra`)
| sözcük | karakter | şaka |
|---|---|---|
| banana | Zıpzıp | Muzu soyar; kabuk başına şapka gibi düşer; Zıpzıp gülümser. |
| soup | Bulut | Kaşıkla çorbayı üfler; buhar burnunu gıdıklar; hapşırır, sonra güler. |
| cake | Lokum | Pastadaki tek mumu üfler; alev söner, yerinde minik duman halkası kalır; alkışlar. |

## Park ve Vücudum (`park`, `vucudum`)
| sözcük | karakter | şaka |
|---|---|---|
| slide | Kino | Kaydıraktan iner, sona gelince kuma oturur, kum havalanır; güler. Kaydırak eşya olarak tek parça çizilir. |
| swing | Mino | Salıncakta öne gider, kuyruğu bayrak gibi geride kalır; geri gelir, kuyruk öne savrulur. |
| teeth | Zıpzıp | Fırçalar, köpük bıyık olur; aynaya bakar gibi bize sırıtır, dişleri parlar. Parıltı küçük ve yazısızdır. |

Toplam 24 aday. İlk dalga için önerim duygular, hareketler ve hayvan sesleri (12 animasyon, 6 sayfa). Bu sözcükler eylemlidir, animasyon anlamı en çok burada taşır.
