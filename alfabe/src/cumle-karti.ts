// Harf rafında "Ceren'le oku" kartı (bağlantı noktası A, Barış'ın kararı 20 Kasım: rafa eklensin). Hece Oyunu ve Hece
// Evleri kartlarıyla aynı kart dilinde. Bölüm cümle okuma oturumunun (cumle-okuma.ts); burada yalnız raftaki kartın
// durumu gösterilir:
// - Açık: çocuğun okuyabileceği cümleler var. Örnek olarak ilk açık cümlenin sözcükleri kartta durur.
// - Boş: henüz hiçbir cümle açılmadı. Kart, en yakın cümlenin açılması için kalan harfleri sade harf taşlarıyla gösterir.
// 2–3 yaşta cümle bölümü açılmaz (cumle-okuma-kurallari.ts → yasaUygun); kart da görünmez.
// Kartın resmi Astra'dan (assets/alfabe/cumle/kart.webp, 20 Kasım geldi); yoksa kart yalnız sözcük taşlarıyla durur.
import { cumleDurumu, okunacaklar, sozcukleri, type CumleYasi } from './cumle-okuma-kurallari';
import { IKON } from '../../src/ui/ikonlar';
import './cumle-karti.css';

const kartResimleri = import.meta.glob<string>('../../assets/alfabe/cumle/kart.webp', { eager: true, query: '?url', import: 'default' });
const kartResmi = () => Object.values(kartResimleri)[0];

export type CumleKartDurumu = { acik: number; ornek: string[]; eksik: string[] };

/** Rafın gösterdiği durum: kaç cümle açık, kartta hangi sözcükler durur, boşsa hangi harfler kaldı. */
export function cumleKartDurumu(bitenHarfler: string[], yas: CumleYasi): CumleKartDurumu {
  const acik = okunacaklar(bitenHarfler, yas);
  if (acik.length) return { acik: acik.length, ornek: sozcukleri(acik[0].metin).slice(0, 2), eksik: [] };
  // Boşsa bölüm ekranıyla aynı hesap (cumle-okuma-kurallari.ts → cumleDurumu): ses grubu sırasında (harf-sirasi.ts)
  // en erken açılacak cümle ve onun için kalan harfler, öğretim sırasıyla.
  const d = cumleDurumu(bitenHarfler, yas);
  return { acik: 0, ornek: d.enYakin ? sozcukleri(d.enYakin.metin).slice(0, 2) : [], eksik: d.eksikHarfler };
}

/** Kartın HTML'i. 2–3 yaşta boş döner. dinle: Ceren'in kart kaydı varsa dinle düğmesi konur. */
export function cumleRafKarti(bitenHarfler: string[], yas: CumleYasi, dinle: boolean): string {
  if (yas === '2-3') return '';
  const d = cumleKartDurumu(bitenHarfler, yas), bos = !d.acik, resim = kartResmi();
  const etiket = 'Ceren’le oku' + (bos ? '. Önce ' + d.eksik.join(', ') + (d.eksik.length > 1 ? ' harflerini' : ' harfini') + ' öğrenelim.' : ', ' + d.acik + ' cümle');
  return '<div class="at-hece-karti at-cumle-karti" data-durum="' + (bos ? 'bos' : 'acik') + '">' +
    '<button type="button" class="at-oyun-karti at-cumle-ac" aria-label="' + etiket + '">' +
    // Astra'nın kart resmi (Ceren sözcük kutularını gösteriyor) gelince yalnız o; gelene kadar örnek cümlenin sözcükleri.
    '<span class="at-hece-ornek at-cumle-ornek' + (resim ? ' at-cumle-resimli' : '') + '" aria-hidden="true">' +
    (resim ? '<img src="' + resim + '" alt="">' : '<span>' + d.ornek.map(s => '<b>' + s + '</b>').join('') + '</span>') + '</span>' +
    '<span class="at-hece-yazi"><strong>Ceren’le oku</strong><small>' +
    (bos ? '<span class="at-cumle-once">Önce:</span>' + d.eksik.map(h => '<i class="at-cumle-harf">' + h + '</i>').join('')
      : 'Önce Ceren okur, sonra sen.') + '</small></span>' +
    '<span class="at-hece-oyna" aria-hidden="true">' + IKON.oyna + '</span></button>' +
    (dinle ? '<button type="button" class="at-hece-dinle at-ses at-cumle-dinle" aria-label="Ceren’den Ceren’le oku’yu dinle">' + IKON.hoparlor + '</button>' : '') +
    '</div>';
}
