"""Archive and verify the offline game, normally called by hazirlik-gosteri-paketle.mjs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256

root=Path(__file__).resolve().parents[1]
out=root/'output/hazirlik'
oyun=out/'Minkino-Anaokulu.html'
giris=out/'Yil-Sonu-Gosterisi.html'
hedef=out/'Minkino-Yil-Sonu-Oynanabilir.zip'
gecici=hedef.with_suffix('.yaziliyor')
if oyun.stat().st_size<1_000_000 or 'Minkino-Anaokulu.html?ders=gosteri' not in giris.read_text(encoding='utf8'):
    raise RuntimeError("Giriş ekranı ile oyun aynı klasörde olmalı.")
with ZipFile(gecici,'w',compression=ZIP_DEFLATED,compresslevel=6) as z:
    z.write(oyun,oyun.name)
    z.write(giris,giris.name)
    z.write(out/'Oyun-Odasi.html','Oyun-Odasi.html')
    z.writestr('Baslarken.txt', """Minkino • Okula Hazırlanalım

Ailece başlarken
Dosyaları aynı klasöre çıkarın. Minkino-Anaokulu.html dosyasını tarayıcıda açın.
Kino ile evde kıyafet seçin, sandviçinizi hazırlayın ve çantanızı alıp okula gidin.
Ana sınıfında çocuk oynamak istediği köşeye dokunabilir. Kulak simgesi
son yönergeyi tekrar eder. Konuşmalar, müzik ve çizimler paketin içindedir.

Oyun odası
Sınıftaki açık kapıya dokunun. Doğrudan oyun odasından başlamak için Oyun-Odasi.html dosyasını açabilirsiniz. Kısayol kendi ilerlemenizi ayrıca saklar. Kâğıt kayığı katlayıp su masasına götürdüğünüzde anne ördeğe dokunarak göleti açabilirsiniz.

Şekil masasında yelkenliyi seçip gövdesini, direğini ve yelkenini birleştirin. Gölette dönen rüzgâr oyuncağı ve açılır köprü sizi bekliyor. Kâğıt kayığı katlayıp damgaladıktan sonra damalı bayrakla şamandıra parkuruna geçebilirsiniz.
Öykü kitabının sağ üstündeki liman resmine dokunun. Mektubu bulun, köprüyü açın ve öykünün sonunu seçin. Kabuk masasında aynaya dokununca kolyenin öteki yarısını tamamlayabilirsiniz; biten kolyeler hediye albümüne gider. Beste defterinde döngü düğmesiyle kendi ritminizin üstüne çalabilirsiniz.

Yıl sonu gösterisi
Sınıftan sola geçin ve perdeyi açın. Mino davulunu, Bulut çanlarını çalar.
Sıra Kino ve Zıpzıp'a geldiğinde şiiri veya dansı seçin. Cebimdeki Tohum
şiirinde ritmi dinleyip yanan düğmeye dokunun. Dansta Zıpzıp'ın yaptığı hareketin resmine dokunun.
Seçiminizle on vuruşluk gösteri başlar. Yedi veya daha fazla puan
kupa kazandırır. Ceren Öğretmen kupayı sahnede verir. Gösteriden sonra eve dönüp günün hatırasını panoya asabilirsiniz.

Yalnız gösteriyi açmak için Yil-Sonu-Gosterisi.html dosyasını kullanın.
Bu kısayolun ilerlemesi okul gününden ayrı saklanır. Kaldığınız yerden devam
etmek için aynı tarayıcıda aynı dosyayı yeniden açın.
""".encode('utf-8-sig'))
with ZipFile(gecici) as z:
    if z.testzip() is not None or sha256(z.read(oyun.name)).digest()!=sha256(oyun.read_bytes()).digest():
        raise RuntimeError('Arşiv oyunla eşleşmedi.')
gecici.replace(hedef)
print(hedef.name,hedef.stat().st_size)
