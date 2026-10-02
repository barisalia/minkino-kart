/**
 * Kalıcı kayıt aynası: oyunların bütün kayıtları (`minkino-*` anahtarları: ilerleme, albüm, müze, pazar, pasta …)
 * localStorage'da durur; uygulamada her yazım @capacitor/preferences'a da yansır. iOS WebView'ı depolama baskısında
 * localStorage'ı silerse açılışta Preferences'tan geri yüklenir.
 *
 * Saf mantık (test edilebilir); Capacitor'a bağlanan yer: src/kabuk/yerel.ts.
 */
import type { Depo } from '../engine/ilerleme';

/** Preferences benzeri asenkron depo */
export interface KaliciDepo {
  get(k: string): Promise<string | null>;
  set(k: string, v: string): Promise<void>;
  remove(k: string): Promise<void>;
  keys(): Promise<string[]>;
}

/** Aynalanan anahtarlar: bütün Minkino kayıtları */
export const kaliciMi = (k: string) => k.startsWith('minkino');

/**
 * İlerleme Depo arayüzü (src/engine/ilerleme.ts): okuma yerelden (anlık), yazma ve silme ikisine birden.
 * Kalıcı yazım hatası oyunu durdurmaz.
 */
export function aynaDepo(yerel: Depo, kalici: KaliciDepo): Depo {
  return {
    getItem: (k) => yerel.getItem(k),
    setItem(k, v) {
      yerel.setItem(k, v);
      if (kaliciMi(k)) void kalici.set(k, v).catch(() => undefined);
    },
    removeItem(k) {
      yerel.removeItem(k);
      if (kaliciMi(k)) void kalici.remove(k).catch(() => undefined);
    },
  };
}

/**
 * Kalıcıda olup yerelde olmayan kayıtları yerele geri yazar; kaç kayıt geri geldi.
 * `vardi`: kayıt sayfa açılırken yerelde var mıydı (oyun açılışta varsayılan kayıt yazmış olabilir: o sayılmaz).
 */
export async function geriYukle(yerel: Depo, kalici: KaliciDepo, vardi: (k: string) => boolean = (k) => yerel.getItem(k) !== null): Promise<number> {
  let n = 0;
  for (const k of (await kalici.keys()).filter(kaliciMi)) {
    if (vardi(k)) continue;
    const v = await kalici.get(k);
    if (v === null) continue;
    yerel.setItem(k, v);
    n++;
  }
  return n;
}

/** Yerelde olup kalıcıda olmayan (ya da farklı) kayıtları kalıcıya yazar: ayna kurulmadan önceki kayıtlar da korunsun */
export async function aynala(anahtarlar: string[], yerel: Depo, kalici: KaliciDepo): Promise<number> {
  let n = 0;
  for (const k of anahtarlar.filter(kaliciMi)) {
    const v = yerel.getItem(k);
    if (v === null || (await kalici.get(k)) === v) continue;
    await kalici.set(k, v);
    n++;
  }
  return n;
}
