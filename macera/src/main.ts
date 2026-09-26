import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import './macera.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { durum, kaydetDurum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { yasEkrani } from '../../src/screens/yas';
import { ekranKaydet, Uygulama } from '../../src/uygulama';
import { acilisEkrani, bolumEkrani, izinEkrani } from './ekranlar';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

ekranKaydet('acilis', acilisEkrani);
ekranKaydet('yas', yasEkrani);
ekranKaydet('izin', izinEkrani);
ekranKaydet('bolum', bolumEkrani);

const kok = document.getElementById('sesli-maceralar');
if (kok) {
  const app = new Uygulama(kok);
  kok.classList.add('mc-kok');
  const q = new URLSearchParams(location.search);
  // ?onizleme=1: test gibi doğrudan ekrana gider ama gerçek hızda (animasyon kaydı / gösterim için)
  const kisayol = q.has('test') || q.has('onizleme');
  if (kisayol) {
    const y = Number(q.get('yas'));
    if (y >= 3 && y <= 6) {
      durum.i.yas = y as Yas;
      kaydetDurum();
    }
    (window as unknown as { __macera: unknown }).__macera = { app };
  }
  app.git((kisayol && q.get('ekran')) || 'acilis');
}
