import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import '../../src/karakter/karakter.css';
import './film.css';
import './katalog.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { anaMenuyeDon, ekranKaydet, Uygulama, type Ekran } from '../../src/uygulama';
import { h } from '../../src/ui/dom';
import { filmEkrani } from './ekranlar';
import { katalogEkrani } from './katalog';

// Seslendirme kayıtları diğer uygulamalarla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

// MP4 kaydı (scripts/film/mp4.mjs): çevrimdışı ses işleyici yalnız ?kayit=1'de yüklenir
if (new URLSearchParams(location.search).has('kayit')) void import('./kayit');

ekranKaydet('film', filmEkrani);
ekranKaydet('katalog', katalogEkrani);
// Kino ve Ailesi (Seri 2) bölüm oynatıcısı: menüde YOK (film2/katalog.ts → SERI2_MENUDE); deneme /film/?seri2=bolum-01.
// Kodu ayrı parça: yalnız bu ekran açılınca yüklenir.
ekranKaydet('seri2', (app, p?: { bolum?: string; oynat?: boolean }): Ekran => {
  const el = h('div', { style: 'display:contents' });
  let ic: Ekran | null = null;
  let kapandi = false;
  void import('./film2/ekran').then((m) => {
    if (kapandi) return;
    ic = m.seri2Ekrani(app, p);
    el.append(ic.el);
  });
  return {
    el,
    kapat() {
      kapandi = true;
      ic?.kapat?.();
    },
  };
});
// beklenmedik hatada "Baştan başla" açılışa döner: açılış = Çizgi Filmler ekranı
ekranKaydet('acilis', katalogEkrani);

const kok = document.getElementById('minkino-film');
if (kok) {
  // Çizgi Filmler ekranındaki geri düğmesi ana menüye (site kökü) döner; ?film=<ad> doğrudan o filmin kapağını açar
  const app = new Uygulama(kok, { cikis: anaMenuyeDon });
  kok.classList.add('fl-kok');
  const q = new URLSearchParams(location.search);
  app.git(q.has('seri2') ? 'seri2' : q.has('film') ? 'film' : 'katalog');
}
