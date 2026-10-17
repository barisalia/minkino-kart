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

/**
 * Kitap yazısı (Fraunces, kitap/yazi/ içinde paketli): yazı boyu sayfaya sığdırılırken ölçülür, bu yüzden kitap yazı
 * yüklenince kurulur (yerel dosya, hemen gelir; en çok 1.5 sn beklenir, gelmezse yedek yazıyla açılır).
 */
const yazi = Promise.all(['400 20px', '600 20px', '700 20px'].map((f) => document.fonts.load(`${f} "Kitap Yazi"`, 'aşğıİçöüŞ'))).catch(() => []);
const kok = document.getElementById('kitap');
if (kok) {
  void Promise.race([yazi, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    const k = new Kitaplik(KITAPLAR, anaMenuyeDon);
    kok.replaceChildren(k.el);
    sayfaAcildi(k.el);
  });
}
