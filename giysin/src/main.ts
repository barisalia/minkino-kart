import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './giysin.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { anaMenuyeDon } from '../../src/uygulama';
import { oyunuBaslat } from './oyun';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

const kok = document.getElementById('kino-giysin');
// geri düğmesi ana menüye (site kökü) döner
if (kok) oyunuBaslat(kok, { cikis: anaMenuyeDon });
