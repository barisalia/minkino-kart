import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './mino-giysin.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { sesMotorunuAc } from '../../src/audio/motor';
import { anaMenuyeDon } from '../../src/uygulama';
import { oyunuBaslat } from './oyun';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');
// Mino açılışta (dokunmadan) konuşur: uygulamada ilk cümle de gerçek kayıtla çalar; tarayıcıda motor ilk dokunuşta açılır
sesMotorunuAc();

const kok = document.getElementById('mino-giysin');
if (kok) oyunuBaslat(kok, { cikis: anaMenuyeDon });
