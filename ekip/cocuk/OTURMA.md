# Çocuklar: bağdaş oturma pozu (Ada, Can, Elif)

Kaynak: Gemini'nin önden bağdaş çizimleri (`cocuk-poz/<ad>-otur-1.png`), beyaz zemini silinmiş hâli `ekip/cocuk/kaynak/<ad>-otur.webp` (2048 tuval, kayıpsız).
Her `ekip/cocuk/<ad>.svg` dosyasına iki gizli katman eklendi (`sira`, `gizli`, `donme` json'da güncel):

| Katman | Ne |
|---|---|
| `govde-oturma` | Gemini çiziminden gövde + kollar + kucak (çene hizasından kucağın alt kenarına). Kollar dizlerin üstünde. Üstü asıl kafanın altında kalır |
| `bacak-oturma` | Aynı çizimin alt kısmı: çaprazlanmış bacaklar ve ayakkabılar (gövdenin önünde çizilir) |

- **Ölçek ve hizalama:** kafa genişliği asıl kafa katmanıyla eşit (Ada ×1.118, Can ×1.054, Elif ×1.052), çene noktası asıl çeneye oturtuldu. Kafa, saç topuzları, ağız/göz/kaş katmanları asıl iskeletten gelir.
- **Kullanım:** json `oturma` bölümü: `gizle` (govde, bacak-sol, bacak-sag, kol-sol, kol-sag) gizlenir, `goster` (govde-oturma, bacak-oturma) gösterilir; bütün karakter `oturma.kayma` kadar aşağı alınır (Ada 296, Can −39, Elif −5; zemin = ayakta durmadaki tabanlar).
- **Elif:** gövde katmanının üstü 150 px yumuşakça solar; sırttaki uzun saç için asıl `sac-arka` katmanı görünür kalır.
- **Kollar:** oturunca kol-sol/kol-sag Gemini çiziminden gelir (diz üstünde eller); el sallama ya da kol açısı bu pozda yoktur.
- **Betik:** `node ekip/illustrator/cocuk-otur-gemini.cjs <ad>` (tekrar çalıştırmak güvenli). Önizleme: `ekip/cocuk/oturma-onizleme.png` (ayakta | oturma, açık ve koyu zemin).
- **Kusur:** Can'ın çene altında ince bir kesim izi var; Gemini görseli ile asıl iskelet yüzü hafif farklı boyutta.

# Can: üzgün yüz
Gizli `goz-uzgun` (goz-sol + goz-sag yerine), `kas-uzgun` (kas yerine), `agiz-uzgun` (agiz yerine); hepsi `kafa`ya bağlı. Gözler: asıl göz resimleri üstüne dış köşeye sarkan ten renkli üst kapak, ıslak parlamalar, alt kapakta mavi ışıltı, bir gözyaşı damlası. Kaşlar ikiye bölünüp iç uçlar yukarı gelecek biçimde ±15° döndürülmüş. Ağız: aşağı kıvrık dudak ve titrek alt dudak. Önizleme: `ekip/cocuk/can-uzgun-onizleme.png`. Betik: `ekip/illustrator/can-uzgun.cjs` (Can iskeleti yeniden teslim edilirse yeniden çalıştırın).
