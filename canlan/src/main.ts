import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './canlan.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { durum, kaydetDurum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { yasEkrani } from '../../src/screens/yas';
import { ekranKaydet, Uygulama } from '../../src/uygulama';
import { acilisEkrani, cizEkrani, listeEkrani, sonucEkrani } from './ekranlar';
import { muzeEkrani } from './muze';
import { resim, yasModu, type Mod } from './resimler';

// Seslendirme kayıtları kart oyunuyla ortak (site kökündeki ses/ klasörü)
sesKokuAyarla('../ses/', './ses/');

ekranKaydet('acilis', acilisEkrani);
ekranKaydet('yas', yasEkrani);
ekranKaydet('liste', listeEkrani);
ekranKaydet('ciz', cizEkrani);
ekranKaydet('sonuc', sonucEkrani);
ekranKaydet('muze', muzeEkrani);

const kok = document.getElementById('ciz-canlansin');
if (kok) {
  const app = new Uygulama(kok);
  kok.classList.add('cc-kok');
  const q = new URLSearchParams(location.search);
  // ?onizleme=1: test gibi doğrudan ekrana gider ama gerçek hızda (animasyon kaydı / gösterim için)
  const kisayol = q.has('test') || q.has('onizleme');
  if (kisayol) {
    const y = Number(q.get('yas'));
    if (y >= 3 && y <= 6) {
      durum.i.yas = y as Yas;
      kaydetDurum();
    }
    (window as unknown as { __canlan: unknown }).__canlan = { app, resim };
  }
  const ekran = kisayol ? q.get('ekran') : null;
  if (ekran === 'ciz') app.git('ciz', { id: q.get('resim') ?? 'top', mod: (q.get('mod') as Mod) ?? yasModu(durum.i.yas) });
  else app.git(ekran ?? 'acilis');
}
