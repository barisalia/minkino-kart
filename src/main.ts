import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import './styles/ana.css';
import './styles/mino.css';
import { sesKokuAyarla } from './audio/kayit';
import { oyunuBaslat } from './oyun';
import { anaMenuyeDon } from './uygulama';

// Kartlar /kartlar/ adresinde; seslendirme kayıtları site kökündeki ses/ klasöründe (tek dosyalık önizlemede ./ses/)
sesKokuAyarla('../ses/', './ses/');

const kok = document.getElementById('minkino-kartlar');
// Açılıştaki geri düğmesi ana menüye (site kökü) döner
if (kok) oyunuBaslat(kok, { cikis: anaMenuyeDon });
