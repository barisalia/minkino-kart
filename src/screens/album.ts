import { efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { albumKartlari, temaBul, TEMALAR } from '../engine/katalog';
import { durum } from '../engine/ilerleme';
import { temaDurumu } from '../engine/odul';
import type { Tema } from '../engine/types';
import { h, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { kartEl } from '../ui/kart';
import { sinifOynat } from '../ui/hareket';
import { baslikBalon, yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';

/** Bir temanın albüm sayfası: kazanılan kartlar renkli, diğerleri gri siluet. */
export function albumSayfasi(t: Tema, sec: { yeni?: string[] } = {}): HTMLElement {
  const sahip = new Set(durum.i.album);
  const yeni = sec.yeni ?? [];
  const kartlar = albumKartlari(t.id);
  const alinan = kartlar.filter((k) => sahip.has(k.id)).length;

  const izgara = h('div.album-izgara');
  kartlar.forEach((k) => {
    const var_ = sahip.has(k.id);
    const el = kartEl(k.id, { sinif: var_ ? 'var' : 'yok', ornek: true });
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', var_ ? k.ad : 'Bulunmamış kart');
    const yeniSira = yeni.indexOf(k.id);
    if (yeniSira >= 0) {
      el.classList.add('yeni');
      el.style.setProperty('--i', String(yeniSira));
    }
    el.addEventListener('click', () => {
      if (var_) {
        efekt.secim();
        void sinifOynat(el, 'ziplat', 500);
        void konus(`${k.ad}!${k.ses ? ' ' + k.ses : ''}`);
      } else {
        efekt.kilitli();
        void sinifOynat(el, 'sallan', 500);
        void konus(metin('album_gri'));
      }
    });
    izgara.append(el);
  });

  return h(
    'div.album-sayfa',
    { style: `--r:${t.renk}`, 'data-tema': t.id },
    h('div.album-baslik', {}, h('span', {}, t.ad), h('span.album-sayac', {}, svg(IKON.album), `${alinan} / ${kartlar.length}`)),
    izgara,
    alinan === 0 ? h('div.album-bos', {}, 'Oynadıkça kartlar burada birikecek!') : null,
  );
}

export function albumEkrani(app: Uygulama, param?: { tema?: string }): Ekran {
  let secili = temaBul(param?.tema ?? '') ?? TEMALAR[0];
  const sekmeler = h('div.album-sekmeler', { role: 'tablist' });
  const sayfaKutu = h('div');
  const kaydir = h('div.kaydir', {}, sayfaKutu);

  function goster(t: Tema, konusma = true) {
    secili = t;
    [...sekmeler.children].forEach((s) => s.classList.toggle('secili', (s as HTMLElement).dataset.tema === t.id));
    sayfaKutu.replaceChildren(albumSayfasi(t));
    kaydir.scrollTop = 0;
    if (konusma) {
      const bos = !albumKartlari(t.id).some((k) => durum.i.album.includes(k.id));
      void konus(`${t.ad}. ${bos ? metin('album_bos') : ''}`);
    }
  }

  TEMALAR.forEach((t) => {
    const acik = temaDurumu(t, durum.i.album.length, durum.i.premium).acik;
    const s = h('button.sekme', { style: `--r:${t.renk}`, 'data-tema': t.id, 'aria-label': t.ad, role: 'tab', type: 'button' }, kartEl(t.kapak));
    if (!acik) s.classList.add('kilitli');
    s.addEventListener('click', () => {
      efekt.sayfa();
      goster(t);
    });
    sekmeler.append(s);
  });

  const el = h(
    'div.album',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.geri()), h('div.orta', {}, baslikBalon('Albümüm', metin('album'))), h('div', { style: 'width:72px' })),
    sekmeler,
    kaydir,
  );
  goster(secili, false);
  void konus(metin('album'));
  return { el };
}
