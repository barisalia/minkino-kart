import { efekt, konus } from '../audio/ses';
import { buyukHarfBas, metin, sayiAdi } from '../audio/metin';
import { temaBul } from '../engine/katalog';
import { durum, kaydetDurum } from '../engine/ilerleme';
import { bekle, h, sure, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { konfetiPatlat } from '../ui/konfeti';
import { yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';
import { albumSayfasi } from './album';
import type { TurSonucu } from './oyun';
import { paketEl } from './temalar';

export function turSonuEkrani(app: Uygulama, p: TurSonucu): Ekran {
  const tema = temaBul(p.tema)!;
  let kapandi = false;
  const yildizlar = h('div.yildizlar');
  const yildizEl = [0, 1, 2].map(() => h('div.buyuk-yildiz', {}, svg(IKON.yildiz)));
  yildizlar.append(...yildizEl);

  const sayfa = albumSayfasi(tema, { yeni: p.yeniKartlar });
  const kaydir = h('div.kaydir', {}, sayfa);

  const tekrar = yuvarlakDugme(IKON.tekrar, 'Tekrar oyna', () => app.git('oyun', { tema: tema.id }));
  tekrar.style.setProperty('--r', '#FF8A2B');
  const yeniTema = yuvarlakDugme(IKON.izgara, 'Yeni tema', () => app.git('temalar', { yeniAcilan: p.acilanTemalar[0] }));
  yeniTema.style.setProperty('--r', '#3E9DF2');

  const el = h('div.tur-sonu', {}, yildizlar, kaydir, h('div.alt-dugmeler', {}, tekrar, yeniTema));

  void (async () => {
    await bekle(sure(250));
    if (kapandi) return;
    const r = yildizlar.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 2, 120, 1.2);
    efekt.konfeti();
    const cumle = `${metin('tur_sonu')} ${buyukHarfBas(metin('yildiz', { yildiz: sayiAdi(p.yildiz) }))} ${p.yeniKartlar.length ? metin('yeni_kartlar') : ''}`;
    const konusma = konus(cumle);
    for (let i = 0; i < p.yildiz; i++) {
      await bekle(sure(380));
      if (kapandi) return;
      yildizEl[i].classList.add('dolu');
      efekt.yildiz(i);
    }
    // Yeni kartlar albüme yapışıyor
    const yeniEl = sayfa.querySelector('.kart.yeni');
    yeniEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    p.yeniKartlar.forEach((_, i) => setTimeout(() => !kapandi && efekt.yapis(), sure(500 + i * 260 + 380)));
    await Promise.all([konusma, bekle(sure(600 + p.yeniKartlar.length * 260))]);
    if (kapandi) return;
    for (const id of p.acilanTemalar) {
      if (durum.i.kutlananTemalar.includes(id)) continue;
      durum.i.kutlananTemalar.push(id);
      kaydetDurum();
      await kutla(app, id);
      if (kapandi) return;
    }
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      app.kok.querySelector('.kutlama')?.remove();
    },
  };
}

/** Yeni paket açıldı kutlaması. Dokununca kapanır. */
function kutla(app: Uygulama, temaId: string): Promise<void> {
  const t = temaBul(temaId);
  if (!t) return Promise.resolve();
  return new Promise((coz) => {
    const paket = paketEl(t);
    const perde = h(
      'div.kutlama',
      { role: 'dialog', 'aria-label': 'Yeni paket açıldı' },
      h('div.isinlar'),
      h('div.kutlama-ic', {}, h('div', {}, 'Yeni paket açıldı!'), paket, h('div', { style: 'font-size:.7em;opacity:.7' }, 'Dokun ve devam et')),
    );
    app.kok.append(perde);
    efekt.kilitAcildi();
    const r = paket.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 2, 160, 1.4);
    void konus(metin('tema_acildi', { tema: t.ad }));
    const kapat = () => {
      perde.remove();
      coz();
    };
    perde.addEventListener('click', kapat);
  });
}
