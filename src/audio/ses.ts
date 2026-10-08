import { durum, kaydetDurum } from '../engine/ilerleme';
import { konusmaMotorunuAc } from './konusma';
import { seviyeleriUygula, sesMotorunuAc } from './motor';
import { muzikAyarUygula, muzikBaslat } from './muzik';

export { efekt } from './efekt';
export { KINO_SESI, konus, konusuyorMu, sus, tekrarSoyle } from './konusma';

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
  // Ebeveyn Köşesi'nden bir kanal değişti: hoparlör düğmesinin sakladığı eski seçim artık geçersiz
  if (!('sesOnce' in degisim) && ('muzik' in degisim || 'efekt' in degisim || 'konusma' in degisim)) delete durum.i.ayarlar.sesOnce;
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
/**
 * Çocuğun hoparlör düğmesi: sessize alırken ebeveynin kanal seçimini saklar, açarken ona döner (ör. ebeveyn yalnız
 * müziği kapattıysa ses açılınca müzik kapalı kalır). Saklı seçim yoksa üç kanal da açılır.
 */
export function sessizeAlDegistir(): boolean {
  const a = durum.i.ayarlar;
  const kapali = !tumSesKapaliMi();
  if (kapali) ayarDegistir({ muzik: false, efekt: false, konusma: false, sesOnce: { muzik: a.muzik, efekt: a.efekt, konusma: a.konusma } });
  else {
    const o = a.sesOnce;
    const geri = o && (o.muzik || o.efekt || o.konusma) ? o : { muzik: true, efekt: true, konusma: true };
    ayarDegistir({ ...geri, sesOnce: undefined });
  }
  return kapali;
}
