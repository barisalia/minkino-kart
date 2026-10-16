/** Lokanta ana ekranı (iskelet; tam sürüm aşağıdaki commit'lerde) */
import { h } from '../../../src/ui/dom';
import type { Ekran, Uygulama } from '../../../src/uygulama';
import { istasyonAc } from '../istasyon/istasyon';
import { denemeIcin } from '../mini/deneme';
import { istasyonOyunlari } from '../mini/katalog';
import type { Istasyon } from '../mini/arayuz';
import { kayit } from '../kayit';
import { TARIFLER } from '../model';

export function lokantaEkrani(_app: Uygulama): Ekran {
  const el = h('div.rs-lokanta');
  const istasyonlar: Istasyon[] = ['tezgah', 'ocak', 'servis'];
  for (const ist of istasyonlar) {
    const d = h('button.rs-istasyon-dugme', { type: 'button', 'data-istasyon': ist }, ist);
    d.addEventListener('click', () => {
      const oyun = istasyonOyunlari(ist)[0] ?? denemeIcin(ist);
      istasyonAc(el, { oyun, girdi: { yas: kayit.yas ?? 'kucuk', malzemeler: TARIFLER.salata.malzemeler, tepsi: [] }, tepsiyeAlindi: () => undefined, geriDonuldu: () => undefined });
    });
    el.append(d);
  }
  return { el };
}
