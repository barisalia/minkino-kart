import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './giysin.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { sesMotorunuAc } from '../../src/audio/motor';
import { anaMenuyeDon } from '../../src/uygulama';
import { oyunuBaslat } from './oyun';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');
// Kino oyun açılır açılmaz (dokunmadan) konuşur: ses motoru hemen kurulur. Uygulamada (Android WebView kullanıcı
// hareketi istemez) ilk cümle de gerçek kayıtla çalar; tarayıcıda motor ilk dokunuşta açılır, o zamana kadarki
// cümleler sessiz geçer (giysin/src/soz.ts — robotik cihaz sesi yok).
sesMotorunuAc();

const kok = document.getElementById('kino-giysin');
// geri düğmesi ana menüye (site kökü) döner
if (kok) oyunuBaslat(kok, { cikis: anaMenuyeDon });
