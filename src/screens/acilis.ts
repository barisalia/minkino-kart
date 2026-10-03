import { efekt, konus } from '../audio/ses';
import { kart } from '../engine/katalog';
import { durum } from '../engine/ilerleme';
import { h, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { minkinoLogo } from '../ui/logo';
import { gorselUrl, kartArkasi, kartEl } from '../ui/kart';
import { sesDugmesi, yuvarlakDugme } from '../ui/ortak';
import { ebeveynKapisi } from './ebeveyn';
import type { Ekran, Uygulama } from '../uygulama';

export function acilisEkrani(app: Uygulama): Ekran {
  // asıl MINKINO logosu: Kartlar açılışının krem zemininde kenarsız temiz sürüm
  const logo = minkinoLogo('sade');

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

  // Yan dal: Hafıza Oyunu (sağ alt köşe; biri kapalı biri açık iki küçük kart)
  const hafizaGiris = h(
    'button.hafiza-giris',
    { type: 'button', 'aria-label': 'Hafıza Oyunu' },
    h('span.hg-kartlar', {}, h('span.hg-kart.hg-arka', {}, kartArkasi()), kartEl('kedi', { sinif: 'hg-kart hg-on' })),
    h('span.hg-ad', {}, 'Hafıza'),
  );
  hafizaGiris.addEventListener('click', () => {
    efekt.secim();
    app.git(durum.i.yas ? 'temalar' : 'yas', durum.i.yas ? { mod: 'hafiza' } : { sonra: 'temalar', sonraParam: { mod: 'hafiza' } });
  });

  // Yelpazedeki kartlar canlı: dokununca zıplar ve adı söylenir
  const yelpaze = h('div.kart-yelpaze', {}, ...(['kedi', 'elma', 'araba'] as const).map((id) => {
    const k = kartEl(id);
    k.addEventListener('pointerdown', () => {
      efekt.dokunma();
      k.classList.remove('hop');
      void k.offsetWidth;
      k.classList.add('hop');
      const ad = kart(id)?.ad;
      if (ad) void konus(`${ad}!`);
    });
    k.addEventListener('animationend', (e) => {
      if (e.animationName === 'mk-yelpaze-hop') k.classList.remove('hop');
    });
    return k;
  }));

  const el = h(
    'div.acilis',
    {},
    h('div.kose-sol', {}, sol),
    h('div.kose-sag', {}, h('div.ust-grup', {}, app.secenekler.cikis ? ebeveyn : null, sesDugmesi())),
    yelpaze,
    h('div.logo', {}, logo, h('div.logo-serit', {}, 'KARTLAR')),
    h('div.acilis-alt', {}, oyna),
    minoGiris,
    hafizaGiris,
  );
  return { el };
}
