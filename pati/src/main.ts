import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './pati.css';
import './pati-v2.css';
import './pati-oda.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { anaMenuyeDon } from '../../src/uygulama';
import { oyunuBaslat } from './oyun';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

const kok = document.getElementById('pati');
// geri düğmesi ana menüye (site kökü) döner
if (kok) oyunuBaslat(kok, { cikis: anaMenuyeDon });
