import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './pazar.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { oyunuBaslat } from './oyun';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

const kok = document.getElementById('mino-pazar');
if (kok) oyunuBaslat(kok);
