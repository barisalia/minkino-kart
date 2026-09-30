import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './film.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { anaMenuyeDon, ekranKaydet, Uygulama } from '../../src/uygulama';
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
  // açılıştaki geri düğmesi ana menüye (site kökü) döner
  const app = new Uygulama(kok, { cikis: anaMenuyeDon });
  kok.classList.add('fl-kok');
  app.git('film');
}
