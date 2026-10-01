import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './film.css';
import './katalog.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { anaMenuyeDon, ekranKaydet, Uygulama } from '../../src/uygulama';
import { filmEkrani } from './ekranlar';
import { katalogEkrani } from './katalog';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

// MP4 kaydı (scripts/film/mp4.mjs): çevrimdışı ses işleyici yalnız ?kayit=1'de yüklenir
if (new URLSearchParams(location.search).has('kayit')) void import('./kayit');

ekranKaydet('film', filmEkrani);
ekranKaydet('katalog', katalogEkrani);
// beklenmedik hatada "Baştan başla" açılışa döner: açılış = Çizgi Filmler ekranı
ekranKaydet('acilis', katalogEkrani);

const kok = document.getElementById('minkino-film');
if (kok) {
  // Çizgi Filmler ekranındaki geri düğmesi ana menüye (site kökü) döner; ?film=<ad> doğrudan o filmin kapağını açar
  const app = new Uygulama(kok, { cikis: anaMenuyeDon });
  kok.classList.add('fl-kok');
  app.git(new URLSearchParams(location.search).has('film') ? 'film' : 'katalog');
}
