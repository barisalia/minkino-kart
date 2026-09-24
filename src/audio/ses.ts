import { durum, kaydetDurum } from '../engine/ilerleme';
import { konusmaMotorunuAc } from './konusma';
import { seviyeleriUygula, sesMotorunuAc } from './motor';
import { muzikAyarUygula, muzikBaslat } from './muzik';

export { efekt } from './efekt';
export { konus, konusuyorMu, sus } from './konusma';

let acildi = false;

/** İlk kullanıcı dokunuşunda çağrılır: Web Audio + konuşma + müzik başlar. */
export function sesiAc() {
  sesMotorunuAc();
  if (!acildi) {
    acildi = true;
    konusmaMotorunuAc();
    muzikBaslat();
  }
}

export function ayarDegistir(degisim: Partial<typeof durum.i.ayarlar>) {
  Object.assign(durum.i.ayarlar, degisim);
  kaydetDurum();
  seviyeleriUygula();
  muzikAyarUygula();
}

/** Tek düğmeyle sessize alma: müzik + efekt + konuşma. */
export function tumSesKapaliMi() {
  const a = durum.i.ayarlar;
  return !a.muzik && !a.efekt && !a.konusma;
}
export function sessizeAlDegistir(): boolean {
  const kapali = !tumSesKapaliMi();
  ayarDegistir({ muzik: !kapali, efekt: !kapali, konusma: !kapali });
  return kapali;
}
