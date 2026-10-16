import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './kitap.css';
import { kayitlariHazirla, sesKokuAyarla } from '../../src/audio/kayit';
import { sayfaAcildi } from '../../src/ui/gecis';
import { anaMenuyeDon } from '../../src/uygulama';
import { Kitaplik } from './kitap';
import { KITAPLAR } from './kitaplar';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');
void kayitlariHazirla();

const kok = document.getElementById('kitap');
if (kok) {
  const k = new Kitaplik(KITAPLAR, anaMenuyeDon);
  kok.replaceChildren(k.el);
  sayfaAcildi(k.el);
}
