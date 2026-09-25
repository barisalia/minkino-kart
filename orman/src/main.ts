import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './orman.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { durum, kaydetDurum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { yasEkrani } from '../../src/screens/yas';
import { ekranKaydet, Uygulama } from '../../src/uygulama';
import { acilisEkrani, bolgeEkrani, buyuklerEkrani, haritaEkrani, izinEkrani, senlikEkrani } from './ekranlar';
import { birlikteEkrani, nefesEkrani, papaganEkrani } from './ekstra';
import { kayit, kaydet } from './ilerleme';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

ekranKaydet('acilis', acilisEkrani);
ekranKaydet('yas', yasEkrani);
ekranKaydet('harita', haritaEkrani);
ekranKaydet('izin', izinEkrani);
ekranKaydet('bolge', bolgeEkrani);
ekranKaydet('buyukler', buyuklerEkrani);
ekranKaydet('senlik', senlikEkrani);
ekranKaydet('nefes', nefesEkrani);
ekranKaydet('papagan', papaganEkrani);
ekranKaydet('birlikte', birlikteEkrani);

const kok = document.getElementById('uyuyan-orman');
if (kok) {
  const app = new Uygulama(kok);
  kok.classList.add('or-kok');
  const q = new URLSearchParams(location.search);
  if (q.has('test')) {
    const y = Number(q.get('yas'));
    if (y >= 3 && y <= 6) {
      durum.i.yas = y as Yas;
      kaydetDurum();
    }
    const u = q.get('uyanan');
    if (u !== null) {
      kayit.uyanan = u ? u.split(',') : [];
      kaydet();
    }
    (window as unknown as { __orman: unknown }).__orman = { app, kayit };
  }
  const ekran = q.has('test') ? q.get('ekran') : null;
  if (ekran === 'bolge' && q.has('mik')) app.git('izin', { sonra: 'bolge', param: { id: q.get('bolge') ?? 'ruzgar' } });
  else if (ekran === 'bolge') app.git('bolge', { id: q.get('bolge') ?? 'ruzgar' });
  else app.git(ekran ?? 'acilis');
}
