import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import './uygulama.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { geriDinle } from '../../src/kabuk/yon';
import { ekranKaydet, Uygulama } from '../../src/uygulama';
import { ayarlarEkrani, menuEkrani } from './ekranlar';

// Ana menü sitenin kökünde (/); seslendirme kayıtları kökteki ses/ klasöründe, diğer uygulamalarla ortak
sesKokuAyarla('./ses/');

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
  // açılış logosu (index.html → #acilis): menü ilk karesini çizince yumuşakça kaybolur
  const acilis = document.getElementById('acilis');
  if (acilis)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        acilis.classList.add('gitti');
        window.setTimeout(() => acilis.remove(), q.has('test') ? 0 : 500);
      }),
    );
  // Android geri tuşu: Ebeveyn Köşesi'nden menüye; menüdeyken kabuk uygulamadan çıkar (src/kabuk/yerel.ts)
  geriDinle(() => {
    if (app.aktifAd === 'menu') return false;
    app.git('menu');
    return true;
  });
}
