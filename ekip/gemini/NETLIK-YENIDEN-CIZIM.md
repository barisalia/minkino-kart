# Netlik için yeniden çizim listesi (2026-10-16)

Bu listedeki görseller oyunda kaynak çözünürlüğünden büyük gösteriliyor ve bulanık çıkıyor. Ölçümler `src/ui/netlik.ts` ile yapıldı.

Kurallar:
- Her görsel aynı stilde, AYNI içerikle ama daha büyük çizilir. Mevcut görsel referans olarak yüklenir.
- Stil referansı: ekip/stil/onayli-stil-oda.png. Çıktı 2752x1536 (16:9).
- Tek sayfaya sığacaksa birden çok görsel tek sayfada çizilir.

| # | Oyun | Görsel (şu anki dosya) | Hedef | Kayıt yeri |
|---|---|---|---|---|
| 1 | Doğum Günü | flama (assets/parti-sahne, 512x192) | en az 2600 px en; tek sayfada tek flama | ekip/gemini/yeni/netlik/dg-flama.png |
| 2 | Doğum Günü | Mino parti pozları: alkış, dans, dans2, selam, mutlu, şaşkın, dilek, saklanıyor (~350x600) | poz başına en az 900 px boy; 2 sayfa × 4 poz | ekip/gemini/yeni/netlik/dg-mino-a.png, dg-mino-b.png |
| 3 | Doğum Günü | pasta-ust, kapi | 1,5 kat büyük; tek sayfa | ekip/gemini/yeni/netlik/dg-pasta-kapi.png |
| 4 | Tart (Pazar) | terazi-kefe | en az 1000 px en | ekip/gemini/yeni/netlik/tart-kefe.png |
| 5 | Elektrik | çekmece yakın çekimi (komodin ve çekmece; kapalı ve açık, iki kare) | tam sayfa | ekip/gemini/yeni/netlik/elektrik-cekmece-yakin.png |
| 6 | Salıncak | arka-on, dikey sürüm | 1536x2752 dikey | ekip/gemini/yeni/netlik/salincak-arka-dikey.png |
| 7 | Banyo | arkaplan, dikey sürüm | 1536x2752 dikey | ekip/gemini/yeni/netlik/banyo-arka-dikey.png |
| 8 | Pazar | arkaplan-genis | en az 3200 px en; iki yarı halinde çizilip birleştirilebilir | ekip/gemini/yeni/netlik/pazar-arka-sol.png, pazar-arka-sag.png |

## Durum (2026-10-16, kodcu)

- İşlendi ve oyunda: #1 flama, #3 pasta-üstü + kapı, #4 terazi kefesi, #5 Elektrik çekmece yakın çekimi, #6 Salıncak dikey ön çimen, #7 Banyo dikey arka plan. Betik: `node ekip/illustrator/netlik-isle.cjs [flama|pasta-kapi|kefe|komodin|salincak|banyo]`.
- Bekleniyor: #2 Mino parti pozları, #8 Pazar geniş arka plan.
- Hâlâ yakın çekimi sınırlayan (netlik.ts): Doğum Günü yatayda flama (~1.03 kat; pasta yakın çekimi 1.7 ister, flama en az ~4600 px en gerekir), dikeyde oda-dikey (~1.09); Elektrik ve Banyo oda çizimleri (1.0); Salıncak dikeyde uzak ve orta katman (~1.11).
