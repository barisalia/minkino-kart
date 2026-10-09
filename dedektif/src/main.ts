import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import '../../src/ui/buyutec.css';
import './dedektif.css';
import './vaka2.css';
import './vaka3.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { anaMenuyeDon } from '../../src/uygulama';
import { oyunuBaslat } from './oyun';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

const kok = document.getElementById('mino-dedektif');
// geri düğmesi ana menüye (site kökü) döner
if (kok) oyunuBaslat(kok, { cikis: anaMenuyeDon });
