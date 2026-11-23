// Tedaviden sonraki pozlarda çocuğun seçtiği bant deseni ve yıldız, Zıpzıp'ın çiziminin üstüne küçük çizimler olarak
// konur (bant-isaret-*, yildiz-*). Yerleri poza göre değişir (motor/oyun.ts → bindirme); katman yürürken birlikte kayar.
import { bindirme, oyun } from './oyun';
import type { Baglam, Kutu } from './yurutucu';

/** katman: Zıpzıp'ın katmanı; kutu: o katmanın kutusu; olcek: çizim pikselinin sahne birimi. Dönen işlev her karede çağrılır. */
export function bindirmeKur(b: Baglam<string>, katman: string, kutu: Kutu, olcek: number): () => void {
  const yap = (boy: number) => {
    const r = document.createElement('img');
    r.className = 'ok-bindirme'; r.alt = ''; r.draggable = false; r.hidden = true;
    r.style.width = boy * olcek + 'px';
    b.katman(katman).after(r);
    return r;
  };
  const bant = yap(110), yildiz = yap(150);
  let bantAd = '', yildizAd = '';
  return () => {
    const { poz, kayma } = b.durum(katman);
    const el = b.katman(katman);
    const gorunur = poz !== '' && !el.hidden;
    const sol = parseFloat(el.style.left) || kutu.sol, ust = parseFloat(el.style.top) || kutu.ust;
    const yer = bindirme(poz);
    for (const [r, secim, onek, nokta] of [[bant, oyun.bant, 'bant-isaret-', yer.bant], [yildiz, oyun.yildiz, 'yildiz-', yer.yildiz]] as const) {
      if (!gorunur || !secim) { r.hidden = true; continue; }
      const ad = onek + secim;
      if ((r === bant ? bantAd : yildizAd) !== ad) { r.src = b.adres(ad); if (r === bant) bantAd = ad; else yildizAd = ad; }
      r.hidden = false;
      r.style.left = sol + kayma + nokta[0] * olcek + 'px';
      r.style.top = ust + nokta[1] * olcek + 'px';
    }
  };
}
