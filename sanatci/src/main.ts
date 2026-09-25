import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './sanatci.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { ekranKaydet, Uygulama } from '../../src/uygulama';

// Seslendirme kayıtları kart oyunuyla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/');
import { acilisEkrani, bastirEkrani, cizEkrani, galeriEkrani, konuEkrani, sihirEkrani, sonucEkrani } from './ekranlar';

ekranKaydet('acilis', acilisEkrani);
ekranKaydet('ciz', cizEkrani);
ekranKaydet('konu', konuEkrani);
ekranKaydet('sihir', sihirEkrani);
ekranKaydet('sonuc', sonucEkrani);
ekranKaydet('galeri', galeriEkrani);
ekranKaydet('bastir', bastirEkrani);

const kok = document.getElementById('minik-sanatci');
if (kok) {
  const app = new Uygulama(kok);
  kok.classList.add('ms-kok');
  const q = new URLSearchParams(location.search);
  app.git(q.has('test') && q.get('ekran') ? q.get('ekran')! : 'acilis');
  if (q.has('test')) (window as unknown as { __sanatci: Uygulama }).__sanatci = app;
}
