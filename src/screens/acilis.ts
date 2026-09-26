import { efekt } from '../audio/ses';
import { durum } from '../engine/ilerleme';
import { h, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { gorselUrl, kartEl } from '../ui/kart';
import { sesDugmesi, yuvarlakDugme } from '../ui/ortak';
import { ebeveynKapisi } from './ebeveyn';
import type { Ekran, Uygulama } from '../uygulama';

const LOGO_RENK = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];

export function acilisEkrani(app: Uygulama): Ekran {
  const logo = h('div.logo-yazi', { 'aria-label': 'minkino' });
  [...'minkino'].forEach((c, i) =>
    logo.append(h('span', { style: `color:${LOGO_RENK[i]};--i:${i};--yon:${i % 2 ? 1 : -1}` }, c)),
  );

  const oyna = h('button.dugme.oyna-dugme', { 'aria-label': 'Oyna', type: 'button' }, svg(IKON.oyna));
  oyna.addEventListener('click', () => {
    efekt.secim();
    app.git(durum.i.yas ? 'temalar' : 'yas');
  });

  const ebeveyn = yuvarlakDugme(IKON.ebeveyn, 'Ebeveyn köşesi', async () => {
    if (await ebeveynKapisi(app)) app.git('ebeveyn');
  }, 'kucuk');

  const sol = app.secenekler.cikis
    ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => app.secenekler.cikis?.(), 'kucuk')
    : ebeveyn;

  // Mino'ya giriş: köşeden bakan kedi
  const minoUrl = gorselUrl({ id: 'mino', ad: 'Mino', tema: '', tur: 'resim', gorsel: 'karakter/mino.webp' });
  const minoGiris = h('button.mino-giris', { type: 'button', 'aria-label': 'Mino ile oyna' }, minoUrl ? h('img', { src: minoUrl, alt: '' }) : null, h('span', {}, 'Mino'));
  minoGiris.addEventListener('click', () => {
    efekt.secim();
    app.git('mino');
  });

  const el = h(
    'div.acilis',
    {},
    h('div.kose-sol', {}, sol),
    h('div.kose-sag', {}, h('div.ust-grup', {}, app.secenekler.cikis ? ebeveyn : null, sesDugmesi())),
    h('div.kart-yelpaze', {}, kartEl('kedi'), kartEl('elma'), kartEl('araba')),
    h('div.logo', {}, logo, h('div.logo-serit', {}, 'KARTLAR')),
    h('div.acilis-alt', {}, oyna),
    minoGiris,
  );
  return { el };
}
