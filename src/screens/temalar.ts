import { efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { albumKartlari, TEMALAR } from '../engine/katalog';
import { durum } from '../engine/ilerleme';
import { temaDurumu } from '../engine/odul';
import type { Tema } from '../engine/types';
import { bekle, h, sure, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { kartEl } from '../ui/kart';
import { albumDugmesi, baslikBalon, sesDugmesi, yuvarlakDugme } from '../ui/ortak';
import { sinifOynat } from '../ui/hareket';
import { ebeveynKapisi } from './ebeveyn';
import type { Ekran, Uygulama } from '../uygulama';

export function paketEl(t: Tema, i = 0): HTMLElement {
  const sahip = new Set(durum.i.album);
  const kartlar = albumKartlari(t.id);
  const alinan = kartlar.filter((k) => sahip.has(k.id)).length;
  const d = temaDurumu(t, durum.i.album.length, durum.i.premium);
  const yildiz = durum.i.yas ? (durum.i.enIyi[`${durum.i.yas}-${t.id}`] ?? 0) : 0;

  const el = h(
    'button.paket',
    { style: `--r:${t.renk};--i:${i}`, 'data-tema': t.id, 'aria-label': t.ad, type: 'button' },
    kartEl(t.kapak, { sinif: 'paket-kapak' }),
    h(
      'div',
      { style: 'width:100%' },
      h('div.paket-ad', {}, t.ad),
      h('div.paket-ilerleme', {}, h('i', { style: `width:${kartlar.length ? (alinan / kartlar.length) * 100 : 0}%` })),
    ),
  );
  if (yildiz) {
    const y = h('div.paket-yildiz');
    for (let k = 0; k < 3; k++) y.append(svg(IKON.yildiz, k < yildiz ? '' : 'bos'));
    el.append(y);
  }
  if (!d.acik) {
    el.classList.add('kilitli');
    const rozet = h('div.kilit-rozet', {}, svg(d.sebep === 'abonelik' ? IKON.tac : IKON.kilit));
    if (d.sebep === 'abonelik') rozet.classList.add('tac');
    else rozet.append(h('small', {}, svg(IKON.album), String(d.kalan)));
    el.append(rozet);
  }
  return el;
}

export function temalarEkrani(app: Uygulama, param?: { yeniAcilan?: string }): Ekran {
  let kilit = false;
  const izgara = h('div.tema-izgara');
  TEMALAR.forEach((t, i) => {
    const el = paketEl(t, i);
    if (param?.yeniAcilan === t.id) el.classList.add('yeni-acildi');
    el.addEventListener('click', async () => {
      if (kilit) return;
      const d = temaDurumu(t, durum.i.album.length, durum.i.premium);
      if (!d.acik) {
        efekt.kilitli();
        void sinifOynat(el, 'titre', 500);
        void konus(d.sebep === 'abonelik' ? metin('tema_abonelik') : [`${t.ad}.`, metin('tema_kilitli', { kalan: d.kalan })]);
        return;
      }
      kilit = true;
      efekt.secim();
      el.classList.add('yeni-acildi');
      await Promise.all([konus(metin('tema_basla', { tema: t.ad })), bekle(sure(700))]);
      app.git('oyun', { tema: t.id });
    });
    izgara.append(el);
  });

  const album = albumDugmesi(() => app.git('album'));
  const ebeveyn = yuvarlakDugme(IKON.ebeveyn, 'Ebeveyn köşesi', async () => {
    if (await ebeveynKapisi(app)) app.git('ebeveyn');
  }, 'kucuk');

  const el = h(
    'div.temalar',
    {},
    h(
      'div.ust-cubuk',
      {},
      h('div.ust-grup', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), ebeveyn),
      h('div.ust-grup', {}, sesDugmesi(), album.el),
    ),
    baslikBalon('Kart Paketleri', metin('tema_sor')),
    h('div.kaydir', {}, izgara),
  );
  void konus(metin('tema_sor'));
  return { el };
}
