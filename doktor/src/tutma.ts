// Elde tutulan alet: parmağa basıldığı anda (gecikmesiz) tepsiden kalkar, parmağın biraz üstünde durur; aletin iş yapan
// ucu (stetoskobun göğüs ucu, büyütecin camı, cımbızın ağzı) parmağın altında kalmaz. Tek parmak bütün hareketi sahiplenir.
import { img, resim, type Cizim } from './varliklar';

export type Nokta = { x: number; y: number };
export const uzaklik = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
export const merkez = (el: Element): Nokta => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export interface TutmaTanimi {
  /** ilk örneğin çizimi (varliklar.ts); yeni sahneler resimAdresi ve oran verir */
  ad?: Cizim;
  resimAdresi?: string;
  /** çizimin en / boy oranı (resimAdresi ile) */
  oran?: number;
  /** baş aşağı tutulur (stetoskobun ucu üstte, hortumu ekranın altına uzanır); tut ve uc çevrilmiş çizime göredir */
  ters?: boolean;
  /** uzun kenarın piksel boyu */
  boyPx: number;
  tut: [number, number];
  uc: [number, number];
  /** parmaktan yukarı kaldırma (px); verilmezse ekran boyunun %6'sı, en çok 48 px */
  kaldir?: number;
  ayna?: boolean;
}
export interface TutmaOlaylari {
  tasi?(uc: Nokta, parmak: Nokta): void;
  /** true dönerse alet geri dönmez; olay sahibi bitir() çağırır */
  birak?(uc: Nokta, parmak: Nokta): boolean;
}
export interface Tutma {
  readonly el: HTMLDivElement;
  readonly resim: HTMLImageElement;
  readonly g: number;
  readonly y: number;
  /** parmak kalktı ya da alet geri gönderildi */
  readonly birakti: boolean;
  uc(): Nokta;
  /** aleti, ucu verilen noktaya gelecek biçimde koyar */
  ucaKoy(p: Nokta): void;
  /** geri: tepsiye döner · kaybol: tepsiye dönerken küçülüp söner · yerinde: hemen kalkar (yerine kalıcı kopya kondu) */
  bitir(nasil: 'geri' | 'kaybol' | 'yerinde'): Promise<void>;
}

let elKatmani: HTMLElement | null = null;
export function elKatmaniKur(kok: HTMLElement) {
  elKatmani = document.createElement('div');
  elKatmani.className = 'dk-el';
  kok.append(elKatmani);
}

/** Kaynak öğeden (tepsideki düğme) bir kopya kaldırır ve parmağı izler. olay verilmezse (klavye) parmak yoktur. */
export function tutmaBaslat(kaynak: HTMLElement, t: TutmaTanimi, ol: TutmaOlaylari, olay?: PointerEvent): Tutma {
  const r = t.ad ? resim(t.ad) : null;
  const oran = t.oran ?? (r ? r.naturalWidth / Math.max(1, r.naturalHeight) : 1);
  const g = oran >= 1 ? t.boyPx : t.boyPx * oran;
  const y = oran >= 1 ? t.boyPx / oran : t.boyPx;
  const kaldir = t.kaldir ?? Math.min(innerHeight * 0.06, 48);
  const el = document.createElement('div');
  el.className = 'dk-tutulan';
  el.style.width = g + 'px';
  el.style.height = y + 'px';
  const ic = document.createElement('div');
  ic.className = 'dk-tutulan-ic';
  ic.style.transformOrigin = t.tut[0] * 100 + '% ' + t.tut[1] * 100 + '%';
  const sinif = t.ters ? 'dk-ters' : t.ayna ? 'dk-ayna' : '';
  const resimEl = t.ad ? img(t.ad, sinif) : document.createElement('img');
  if (!t.ad) { resimEl.src = t.resimAdresi ?? ''; resimEl.alt = ''; resimEl.draggable = false; resimEl.className = sinif; }
  ic.append(resimEl);
  el.append(ic);
  elKatmani!.append(el);

  let sol = 0, ust = 0;
  const yerlestir = (p: Nokta) => {
    sol = p.x - t.tut[0] * g;
    ust = p.y - t.tut[1] * y - kaldir;
    el.style.transform = 'translate3d(' + sol + 'px,' + ust + 'px,0)';
  };
  const ucu = (): Nokta => ({ x: sol + t.uc[0] * g, y: ust + t.uc[1] * y });
  const kr = kaynak.getBoundingClientRect();
  const baslangic = olay ? { x: olay.clientX, y: olay.clientY } : { x: kr.left + kr.width / 2, y: kr.top + kr.height / 2 };
  yerlestir(baslangic);
  const kucuk = Math.min(kr.width / g, kr.height / y, 1);
  ic.animate([{ transform: 'scale(' + kucuk + ')' }, { transform: 'scale(1)' }], { duration: 120, easing: 'cubic-bezier(.2,.8,.3,1.2)' });
  kaynak.classList.add('dk-kalkti');

  let bitti = false;
  const id = olay?.pointerId;
  const tasi = (e: PointerEvent) => {
    if (bitti || e.pointerId !== id) return;
    yerlestir({ x: e.clientX, y: e.clientY });
    ol.tasi?.(ucu(), { x: e.clientX, y: e.clientY });
  };
  const birak = (e: PointerEvent) => {
    if (bitti || e.pointerId !== id) return;
    temizle();
    if (e.type === 'pointerup' && ol.birak?.(ucu(), { x: e.clientX, y: e.clientY })) return;
    void tutma.bitir('geri');
  };
  const temizle = () => {
    kaynak.removeEventListener('pointermove', tasi);
    kaynak.removeEventListener('pointerup', birak);
    kaynak.removeEventListener('pointercancel', birak);
    kaynak.removeEventListener('lostpointercapture', birak);
    if (id !== undefined && kaynak.hasPointerCapture(id)) kaynak.releasePointerCapture(id);
  };
  if (olay) {
    kaynak.setPointerCapture(olay.pointerId);
    kaynak.addEventListener('pointermove', tasi);
    kaynak.addEventListener('pointerup', birak);
    kaynak.addEventListener('pointercancel', birak);
    kaynak.addEventListener('lostpointercapture', birak);
  }

  const tutma: Tutma = {
    el, resim: resimEl, g, y,
    get birakti() { return bitti; },
    uc: ucu,
    ucaKoy(p) {
      sol = p.x - t.uc[0] * g;
      ust = p.y - t.uc[1] * y;
      el.style.transform = 'translate3d(' + sol + 'px,' + ust + 'px,0)';
    },
    async bitir(nasil) {
      if (!bitti) { bitti = true; temizle(); }
      if (!el.isConnected) return;
      if (nasil === 'yerinde') { el.remove(); kaynak.classList.remove('dk-kalkti'); return; }
      const hedef = kaynak.getBoundingClientRect();
      const olcek = Math.min(hedef.width / g, hedef.height / y, 1);
      const hx = hedef.left + hedef.width / 2 - g / 2, hy = hedef.top + hedef.height / 2 - y / 2;
      ic.style.transformOrigin = '50% 50%';
      const a = el.animate([{ transform: el.style.transform }, { transform: 'translate3d(' + hx + 'px,' + hy + 'px,0)' }],
        { duration: 240, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
      ic.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(' + (nasil === 'kaybol' ? olcek * 0.4 : olcek) + ')', opacity: nasil === 'kaybol' ? 0 : 1 }],
        { duration: 240, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
      await a.finished.catch(() => undefined);
      el.remove();
      kaynak.classList.remove('dk-kalkti');
    },
  };
  return tutma;
}

/** Bir öğeyi ekran noktasından ekran noktasına süzerek götürür (klavyeyle yapılan adımlar ve otomatik gösterim için). */
export function suz(t: Tutma, hedefUc: Nokta, sure = 520, adim?: (uc: Nokta) => void): Promise<void> {
  const bas = t.uc();
  const d = { x: hedefUc.x - bas.x, y: hedefUc.y - bas.y };
  return new Promise(r => {
    const t0 = performance.now();
    const kare = (an: number) => {
      const k = Math.min(1, (an - t0) / sure);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const p = { x: bas.x + d.x * e, y: bas.y + d.y * e };
      t.ucaKoy(p);
      adim?.(p);
      if (k < 1) requestAnimationFrame(kare); else r();
    };
    requestAnimationFrame(kare);
  });
}
