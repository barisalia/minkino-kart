import { efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { durum, kaydetDurum } from '../engine/ilerleme';
import { YASLAR, type Yas } from '../engine/types';
import { bekle, h, sure } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { baslikBalon, yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';

const RENK: Record<Yas, string> = { 3: '#F0413F', 4: '#3E9DF2', 5: '#5DBE3F', 6: '#9B5CE0' };

export function yasEkrani(app: Uygulama, param?: { sonra?: 'ebeveyn' }): Ekran {
  let kilit = false;
  const izgara = h('div.yas-izgara');
  YASLAR.forEach((y, i) => {
    const mumlar = h('div.mumlar');
    for (let k = 0; k < y; k++) mumlar.append(h('i.mum'));
    const kart = h(
      'button.yas-kart',
      { style: `--r:${RENK[y]};--i:${i}`, 'aria-label': `${y} yaş`, 'data-yas': y, type: 'button' },
      mumlar,
      h('b', {}, String(y)),
    );
    kart.addEventListener('click', async () => {
      if (kilit) return;
      kilit = true;
      efekt.dogru();
      kart.classList.add('secildi');
      durum.i.yas = y;
      kaydetDurum();
      await Promise.all([konus(metin('yas_secildi', { yas: y })), bekle(sure(900))]);
      app.git(param?.sonra ?? 'temalar');
    });
    izgara.append(kart);
  });

  const el = h(
    'div.yas',
    {},
    h(
      'div.ust-cubuk',
      {},
      yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis')),
      h('div.orta', {}, baslikBalon('Kaç yaşındasın?', metin('yas_sor'))),
      h('div', { style: 'width:72px' }),
    ),
    izgara,
  );
  void konus(`${durum.i.album.length ? '' : metin('acilis') + ' '}${metin('yas_sor')}`);
  return { el };
}
