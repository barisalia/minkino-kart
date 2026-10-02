# Çocuklar: oturma pozu (Ada, Can, Elif)

Her `ekip/cocuk/<ad>.svg` dosyasına iki gizli katman eklendi (`sira`, `gizli` ve `donme` json'da güncel):

| Katman | Yerine geçtiği | Ne |
|---|---|---|
| `govde-oturma` | `govde` | Aynı gövde resmi (kucak zaten elbise/şort altında) |
| `bacak-oturma` | `bacak-sol` + `bacak-sag` | İki bacağın alt %40'ı (baldır + ayakkabı), ezilmeden etek hizasına çekilir, kalçadan 9° dışa döner, 40 px yana açılır |

- **Kullanım:** `govde`, `bacak-sol`, `bacak-sag` gizlenir; `govde-oturma` ve `bacak-oturma` gösterilir. Bütün karakter (kafa, kollar, saç dahil) json `oturma.kayma` kadar (Ada 383, Can 280, Elif 346 birim) aşağı alınır, böylece ayakkabılar eski zeminde kalır. json `oturma` bölümünde `gizle`, `goster`, `kayma` yazıdır.
- Kafa, kollar, ağızlar aynı kalır (el sallama, konuşma, göz kapama çalışır).
- Betik: `ekip/illustrator/cocuk-oturma.cjs <ad> [bant=0.40] [aci=9] [acilma=40]`. Önce eski katmanları siler, sonra yeniden ekler, tekrar çalıştırmak güvenli.
- Önizleme: `ekip/cocuk/oturma-onizleme.png` (her biri ayakta | oturma, açık ve koyu zemin).
- Kusur: ayakkabılar kısa görünür (bacak etek altında kısalmış hâliyle). Zemine oturma (kum havuzu) için bant 0.25 yapılabilir.

# Can: üzgün yüz
Gizli `goz-uzgun` (goz-sol + goz-sag yerine), `kas-uzgun` (kas yerine), `agiz-uzgun` (agiz yerine); hepsi `kafa`ya bağlı, json'a eklendi. Gözler: asıl göz resimleri üstüne dış köşeye sarkan ten renkli (#f3b79f) üst kapak, ıslak parlamalar, alt kapakta mavi ışıltı ve bir gözyaşı damlası. Kaşlar ikiye bölünüp iç uçlar yukarı gelecek biçimde ±15° döndürülmüş. Ağız: aşağı kıvrık dudak ve titrek alt dudak çizgisi. Önizleme: `ekip/cocuk/can-uzgun-onizleme.png`. Betik: `ekip/illustrator/can-uzgun.cjs` (tekrar çalıştırmak güvenli; Can iskeleti yeniden teslim edilirse yeniden çalıştırın).
