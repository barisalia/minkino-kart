import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import './uygulama.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { ekranKaydet, Uygulama } from '../../src/uygulama';
import { ayarlarEkrani, menuEkrani } from './ekranlar';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

ekranKaydet('menu', menuEkrani);
ekranKaydet('ayarlar', ayarlarEkrani);

const kok = document.getElementById('minkino');
if (kok) {
  const app = new Uygulama(kok);
  kok.classList.add('ug-kok');
  const q = new URLSearchParams(location.search);
  // Test kısayolu: ?test=1&ekran=ayarlar
  if (q.has('test')) (window as unknown as { __uygulama: unknown }).__uygulama = { app };
  app.git((q.has('test') && q.get('ekran')) || 'menu');
}
