# Çocuklar: oturma pozu (Ada, Can, Elif)

Her `ekip/cocuk/<ad>.svg` dosyasına iki gizli katman eklendi (`sira`, `gizli` ve `donme` json'da güncel):

| Katman | Yerine geçtiği | Ne |
|---|---|---|
| `govde-oturma` | `govde` | Aynı gövde resmi (kucak zaten elbise/şort altında) |
| `bacak-oturma` | `bacak-sol` + `bacak-sag` | Kameraya doğru uzanan kısa bacaklar (vektör): giysi ucunun altından çıkan ten renkli kalın tüp + bize dönük ayakkabı TABANI (Ada kırmızı, Can beyaz, Elif pembe). Ayaklar yan yana, hafif dışa açık. Renkler bacak resminden örneklendi |

- **Kullanım:** `govde`, `bacak-sol`, `bacak-sag` gizlenir; `govde-oturma` ve `bacak-oturma` gösterilir. Bütün karakter (kafa, kollar, saç dahil) json `oturma.kayma` kadar (Ada 249, Can 195, Elif 235 birim) aşağı alınır, böylece ayakkabılar eski zeminde kalır. json `oturma` bölümünde `gizle`, `goster`, `kayma` yazıdır.
- Kafa, kollar, ağızlar aynı kalır (el sallama, konuşma, göz kapama çalışır).
- Betik: `ekip/illustrator/cocuk-oturma.cjs <ad> [dusme=0.30] [aci=18] [acilma=0.06]` (giysi alt ucu ayakta çizimden ölçülüp betiğe yazıldı: Ada 1595, Can 1500, Elif 1522). Tekrar çalıştırmak güvenli.
- Önizleme: `ekip/cocuk/oturma-onizleme.png` (her biri ayakta | oturma, açık ve koyu zemin).
- Kusur: bacak yalnız ayak tabanı ve kısa tüp olarak görünür (etek örter); diz ya da bağdaş değildir. Bağdaş için ayrı poz gerekir.

# Can: üzgün yüz
Gizli `goz-uzgun` (goz-sol + goz-sag yerine), `kas-uzgun` (kas yerine), `agiz-uzgun` (agiz yerine); hepsi `kafa`ya bağlı, json'a eklendi. Gözler: asıl göz resimleri üstüne dış köşeye sarkan ten renkli (#f3b79f) üst kapak, ıslak parlamalar, alt kapakta mavi ışıltı ve bir gözyaşı damlası. Kaşlar ikiye bölünüp iç uçlar yukarı gelecek biçimde ±15° döndürülmüş. Ağız: aşağı kıvrık dudak ve titrek alt dudak çizgisi. Önizleme: `ekip/cocuk/can-uzgun-onizleme.png`. Betik: `ekip/illustrator/can-uzgun.cjs` (tekrar çalıştırmak güvenli; Can iskeleti yeniden teslim edilirse yeniden çalıştırın).
