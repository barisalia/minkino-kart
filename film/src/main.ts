import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './film.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { ekranKaydet, Uygulama } from '../../src/uygulama';
import { filmEkrani } from './ekranlar';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

// MP4 kaydı (scripts/film/mp4.mjs): çevrimdışı ses işleyici yalnız ?kayit=1'de yüklenir
if (new URLSearchParams(location.search).has('kayit')) void import('./kayit');

ekranKaydet('film', filmEkrani);
// beklenmedik hatada "Baştan başla" açılışa döner: açılış = film kapağı
ekranKaydet('acilis', filmEkrani);

const kok = document.getElementById('minkino-film');
if (kok) {
  const app = new Uygulama(kok);
  kok.classList.add('fl-kok');
  app.git('film');
}
