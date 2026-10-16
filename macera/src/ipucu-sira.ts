/**
 * Sesli Maceralar'ın ipucu sırası (kalite denetimi 2026-10-16, K2; Barış'ın kuralı: "şunu tıkla" yok, ipucu geç ve
 * dolaylı). Görev yazısı (çip) ekranda gösterilmez; el hemen çıkmaz:
 *   adım başlar → anlatıcı durumu anlatır (çocuk dener, yanlışlar komik)
 *   25 sn: hedefin üstünde yumuşak bir hale (yer gösterir, "buna dokun" demez)
 *   40 sn: parmak (nasıl yapılacağını gösteren el)
 * Yanlış denemeler eli öne çekmez; iki yanlıştan sonra (adımın 12. saniyesinden önce değil) yalnız hale gelir.
 * Test modunda eski davranış sürer (e2e testleri ipucunu kısa sürede görür).
 */
import { h } from '../../src/ui/dom';

export const HALE_MS = 25_000;
export const EL_MS = 40_000;
/** iki yanlıştan sonra hale en erken bu kadar sonra */
export const YANLIS_HALE_MS = 12_000;

let adimBas = typeof performance !== 'undefined' ? performance.now() : 0;
/** Yeni bir görev adımı başladı (bölüm ekranı görev yazısı değişince çağırır). */
export function adimBasladi() {
  adimBas = performance.now();
}
/** Şu anki adımın başından beri geçen süre (ms). */
export const adimGecen = () => performance.now() - adimBas;

/**
 * Hedefin üstünde yumuşak, nabız gibi atan bir hale. kutu: hedefin ekrandaki kutusu (hedef kımıldarsa hale de
 * onunla gider). Döner: kaldır().
 */
export function hale(katman: HTMLElement, kutu: () => DOMRect): () => void {
  const el = h('i.mc-hale', { 'aria-hidden': 'true' });
  katman.append(el);
  let raf = 0;
  const yerlestir = () => {
    const a = kutu();
    const k = katman.getBoundingClientRect();
    const r = Math.max(30, Math.min(110, Math.max(a.width, a.height) * 0.6));
    el.style.left = `${(a.left + a.width / 2 - k.left).toFixed(0)}px`;
    el.style.top = `${(a.top + a.height / 2 - k.top).toFixed(0)}px`;
    el.style.setProperty('--r', `${Math.round(r)}px`);
    raf = requestAnimationFrame(yerlestir);
  };
  yerlestir();
  return () => {
    cancelAnimationFrame(raf);
    el.remove();
  };
}
