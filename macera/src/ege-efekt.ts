/**
 * Bölüm 2 efektleri (hepsi kodla; yalnız transform / opacity animasyonu):
 * parçacıklar (gözyaşı, mama, buhar, kalp, yıldız, Zzz, parıltı), ay göstergesi (sessizlikte dolar),
 * tavanda dönen yıldızlar (gece lambası), ninni yıldızları, gece penceresi (ay ve yıldızlar).
 */
import { h, sure } from '../../src/ui/dom';
import { AZ_HAREKET } from './oyuncu';

const r = (a: number, b: number) => a + Math.random() * (b - a);

/** Yerel koordinat (kabın %'si) */
function yerel(kap: HTMLElement, cx: number, cy: number): [number, number] {
  const k = kap.getBoundingClientRect();
  return [((cx - k.left) / Math.max(1, k.width)) * 100, ((cy - k.top) / Math.max(1, k.height)) * 100];
}

export const KALP_SVG =
  '<svg viewBox="0 0 40 36" aria-hidden="true"><path d="M20 34C8 25 2 18 2 11A9 9 0 0 1 20 7A9 9 0 0 1 38 11C38 18 32 25 20 34Z" fill="#ff7fa8" stroke="#8a2446" stroke-width="3" stroke-linejoin="round"/><ellipse cx="11" cy="11" rx="4" ry="2.6" fill="#ffd3e2" transform="rotate(-30 11 11)"/></svg>';
export const YILDIZ_SVG =
  '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2L25 14L38 15L28 24L31 37L20 30L9 37L12 24L2 15L15 14Z" fill="#ffe36e" stroke="#b07a12" stroke-width="2.5" stroke-linejoin="round"/></svg>';

export type ParcaTuru = 'yas' | 'mama' | 'buhar' | 'kalp' | 'yildiz' | 'z' | 'parilti' | 'nota';

/** Parçacık katmanı: dünyanın içinde (kamerayla birlikte), dokunmaya kapalı */
export class Parcaciklar {
  readonly el: HTMLElement;
  constructor() {
    this.el = h('div.eg-parca-katman');
  }
  private yap(tur: ParcaTuru, x: number, y: number, boy: number) {
    const ic = tur === 'kalp' ? KALP_SVG : tur === 'yildiz' ? YILDIZ_SVG : tur === 'z' ? 'Z' : tur === 'nota' ? '♪' : '';
    const e = h(`i.eg-p.eg-p-${tur}`, { style: `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--b:${boy.toFixed(1)}px`, html: ic });
    this.el.append(e);
    return e;
  }
  private son(e: HTMLElement, a: Animation) {
    a.onfinish = () => e.remove();
    a.oncancel = () => e.remove();
  }
  /** Gözyaşı: iki yana fırlayıp düşen damlalar */
  gozYasi(cx: number, cy: number, yon: -1 | 1, adet = 2) {
    if (AZ_HAREKET) adet = 1;
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const e = this.yap('yas', x, y, r(7, 11));
      const vx = yon * r(18, 46);
      this.son(
        e,
        e.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 },
            { transform: `translate(calc(-50% + ${vx * 0.5}px), calc(-50% - ${r(8, 18)}px)) scale(1)`, opacity: 1, offset: 0.3 },
            { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${r(40, 70)}px)) scale(0.8, 1.1)`, opacity: 0 },
          ],
          { duration: sure(r(650, 900)), delay: sure(i * 120), easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'backwards' },
        ),
      );
    }
  }
  /** Sıçrama (mama): parçacıklar yay çizip düşer */
  sicrat(cx: number, cy: number, tur: 'mama' | 'yas' = 'mama', adet = 8, guc = 1) {
    if (AZ_HAREKET) adet = Math.ceil(adet / 3);
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const e = this.yap(tur, x, y, r(6, 13));
      const a = r(-Math.PI * 0.95, -Math.PI * 0.05);
      const v = r(30, 90) * guc;
      const vx = Math.cos(a) * v;
      const vy = Math.sin(a) * v;
      this.son(
        e,
        e.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
            { transform: `translate(calc(-50% + ${vx * 0.55}px), calc(-50% + ${vy * 0.8}px)) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${vy * 0.2 + 60 * guc}px)) scale(0.7, 0.9)`, opacity: 0 },
          ],
          { duration: sure(r(520, 820)), easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' },
        ),
      );
    }
  }
  /** Yükselen buhar / Zzz / notalar / kalpler */
  yuksel(cx: number, cy: number, tur: 'buhar' | 'z' | 'kalp' | 'nota' | 'yildiz' = 'buhar', adet = 3, yayilma = 24) {
    if (AZ_HAREKET) adet = Math.ceil(adet / 2);
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const b = tur === 'buhar' ? r(22, 40) : tur === 'z' ? r(16, 26) + i * 4 : tur === 'kalp' ? r(16, 26) : r(14, 22);
      const e = this.yap(tur, x, y, b);
      const dx = tur === 'z' ? 14 + i * 12 : r(-yayilma, yayilma);
      const yuk = tur === 'z' ? 70 + i * 10 : r(70, 130);
      const ms = sure(tur === 'buhar' ? r(1500, 2200) : tur === 'z' ? 1800 : r(1200, 1700));
      const sal = tur === 'buhar' || tur === 'z' ? 8 : 16;
      this.son(
        e,
        e.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.3) rotate(0deg)', opacity: 0 },
            { transform: `translate(calc(-50% + ${dx * 0.3 + sal}px), calc(-50% - ${yuk * 0.3}px)) scale(${tur === 'buhar' ? 0.8 : 1}) rotate(-8deg)`, opacity: tur === 'buhar' ? 0.7 : 1, offset: 0.3 },
            { transform: `translate(calc(-50% + ${dx * 0.7 - sal}px), calc(-50% - ${yuk * 0.7}px)) scale(1) rotate(6deg)`, opacity: tur === 'buhar' ? 0.45 : 1, offset: 0.7 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% - ${yuk}px)) scale(${tur === 'buhar' ? 1.6 : 0.9}) rotate(0deg)`, opacity: 0 },
          ],
          { duration: ms, delay: sure(i * (tur === 'z' ? 380 : 140)), easing: 'ease-out', fill: 'backwards' },
        ),
      );
    }
  }
  /** Parıltı: merkezden saçılan yıldızcıklar */
  parilti(cx: number, cy: number, adet = 8, tur: 'yildiz' | 'kalp' | 'parilti' = 'parilti') {
    if (AZ_HAREKET) adet = Math.ceil(adet / 3);
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const e = this.yap(tur, x, y, tur === 'parilti' ? r(10, 16) : r(14, 22));
      const a = (i / adet) * Math.PI * 2 + r(-0.2, 0.2);
      const d = r(36, 70);
      this.son(
        e,
        e.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1) rotate(90deg)`, opacity: 1, offset: 0.6 },
            { transform: `translate(calc(-50% + ${Math.cos(a) * d * 1.2}px), calc(-50% + ${Math.sin(a) * d * 1.2}px)) scale(0.4) rotate(160deg)`, opacity: 0 },
          ],
          { duration: sure(900), delay: sure(i * 25), easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' },
        ),
      );
    }
  }
}

/** Çizgi roman yazısı ("HAPŞUU!", "hıpşu"): kap içinde, ekran koordinatında */
export function yansiYazi(kap: HTMLElement, cx: number, cy: number, metin: string, renk = '#ff8a3d', buyuk = false) {
  const [x, y] = yerel(kap, cx, cy);
  const e = h(`div.eg-yansi${buyuk ? '.buyuk' : ''}`, { style: `left:${x}%;top:${y}%;--r:${renk}` }, metin);
  kap.append(e);
  e.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.2) rotate(-12deg)', opacity: 0 },
      { transform: 'translate(-50%, -60%) scale(1.25) rotate(4deg)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%, -62%) scale(1) rotate(-3deg)', opacity: 1, offset: 0.7 },
      { transform: 'translate(-50%, -80%) scale(0.9) rotate(-3deg)', opacity: 0 },
    ],
    { duration: sure(buyuk ? 1500 : 1000), easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' },
  ).onfinish = () => e.remove();
}

/** Ay göstergesi (ekranın kenarında): sessizlikte hilalden dolunaya dolar */
export class AyGosterge {
  readonly el: HTMLElement;
  private golge: HTMLElement;
  constructor() {
    this.golge = h('i.eg-ay-golge');
    this.el = h('div.eg-ay-gosterge', { 'aria-hidden': 'true' }, h('i.eg-ay-disk', {}, this.golge), h('i.eg-ay-hale'));
    this.ayarla(0);
  }
  /** 0 hilal … 1 dolunay */
  ayarla(oran: number) {
    const o = Math.max(0, Math.min(1, oran));
    this.golge.style.transform = `translateX(${(-18 - o * 92).toFixed(1)}%)`;
    this.el.style.setProperty('--o', o.toFixed(3));
    this.el.classList.toggle('dolu', o >= 1);
  }
  sars() {
    this.el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: sure(420) });
  }
}

/** Gece lambasının tavana yansıttığı, yavaşça dönen yıldızlar (tek katman, tek dönüş animasyonu) */
export class TavanYildizlari {
  readonly el: HTMLElement;
  private renk = 0;
  constructor() {
    const yildiz: HTMLElement[] = [];
    for (let i = 0; i < 44; i++) {
      const a = i * 2.4;
      const d = 6 + ((i * 37) % 44);
      const x = 50 + Math.cos(a) * d;
      const y = 50 + Math.sin(a) * d;
      const b = 14 + ((i * 7) % 16);
      yildiz.push(h('i', { style: `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--b:${b}px;--g:${(i % 5) * 0.4}s`, html: i % 4 === 0 ? '<svg viewBox="0 0 40 36"><path d="M20 34C8 25 2 18 2 11A9 9 0 0 1 20 7A9 9 0 0 1 38 11C38 18 32 25 20 34Z"/></svg>' : '<svg viewBox="0 0 40 40"><path d="M20 2L25 14L38 15L28 24L31 37L20 30L9 37L12 24L2 15L15 14Z"/></svg>' }));
    }
    this.el = h('div.eg-tavan', { 'aria-hidden': 'true' }, h('div.eg-tavan-don', {}, ...yildiz));
  }
  ac(acik: boolean) {
    this.el.classList.toggle('acik', acik);
  }
  /** Rengi değiştir (lambaya dokununca) */
  renkDegistir() {
    this.renk = (this.renk + 1) % 4;
    this.el.dataset.renk = String(this.renk);
  }
}

/** Ekranın sol / sağ güvenli alan payı (px; çentik, yuvarlak köşe): env(safe-area-inset-*) gizli bir ölçü kutusundan */
function yanGuvenliAlan(): [number, number] {
  const o = h('div', { 'aria-hidden': 'true', style: 'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:0 env(safe-area-inset-right, 0px) 0 env(safe-area-inset-left, 0px)' });
  document.body.append(o);
  const c = getComputedStyle(o);
  const r: [number, number] = [parseFloat(c.paddingLeft) || 0, parseFloat(c.paddingRight) || 0];
  o.remove();
  return r;
}

/** Ninni yıldızları: doğru söylenen (ya da sallanan) her nota bir yıldız yakar */
export class NinniYildizlari {
  readonly el: HTMLElement;
  private yildizlar: HTMLElement[];
  constructor(adet: number) {
    // beşiğin üstünde bir kemer (gökkuşağı gibi): uçlar aşağıda, orta yukarıda
    this.yildizlar = Array.from({ length: adet }, (_, i) => {
      const u = i / Math.max(1, adet - 1);
      const a = Math.PI * (1 - u);
      const x = 50 + Math.cos(a) * 46;
      const y = 92 - Math.sin(a) * 80;
      return h('i.eg-ny', { style: `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%`, html: YILDIZ_SVG });
    });
    this.el = h('div.eg-ninni-yildiz', { 'aria-hidden': 'true' }, ...this.yildizlar);
  }
  /**
   * Kemeri beşiğin üstüne oturt (ekran kutuları; besik: beşiğin görünen çizimi, kap: yıldızların konduğu katman).
   * Kemer beşiğin ortasında; eni ekrana sığar (yanlarda 8 px pay), ekrandan taşmaz (yatay telefonda yakın çekim yan
   * şeritleri de kullanır, sahne bandı taşabilir: sınır ekranın kendisi).
   */
  yerles(besik: DOMRect, kap: DOMRect) {
    // çentikli yatay telefonda uç yıldızlar çentiğin / yuvarlak köşenin altına girmesin: güvenli alan payı da eklenir
    const [gSol, gSag] = yanGuvenliAlan();
    const solS = 8 + gSol;
    const sagS = innerWidth - 8 - gSag;
    const w = Math.max(40, Math.min(besik.width * 1.02, sagS - solS));
    const hh = besik.height * 0.62;
    const orta = besik.left + besik.width / 2;
    const sol = Math.max(solS, Math.min(sagS - w, orta - w / 2));
    const s = this.el.style;
    s.left = `${(sol - kap.left).toFixed(0)}px`;
    s.width = `${w.toFixed(0)}px`;
    s.top = `${(besik.top - kap.top - hh * 0.72).toFixed(0)}px`;
    s.height = `${hh.toFixed(0)}px`;
    s.right = 'auto';
    // yıldız boyu kemerin uzunluğuna göre (sıkışmasın)
    const yay = (Math.PI / 2) * (w + hh) * 0.75;
    s.setProperty('--ny-w', `${Math.max(16, Math.min(34, (yay / this.yildizlar.length) * 0.82)).toFixed(1)}px`);
  }
  /** Sıradaki vuruşun yıldızı atar (-1: hiçbiri) */
  simdi(i: number) {
    this.yildizlar.forEach((e, k) => {
      if (k !== i) return e.classList.remove('simdi');
      e.classList.remove('simdi');
      void e.offsetWidth;
      e.classList.add('simdi');
    });
  }
  /** Yeni deneme: yanan yıldızlar söner */
  sifirla() {
    this.yildizlar.forEach((e) => e.classList.remove('yandi', 'simdi'));
  }
  yak(i: number) {
    const e = this.yildizlar[i];
    if (!e || e.classList.contains('yandi')) return;
    e.classList.add('yandi');
    e.animate([{ transform: 'translate(-50%, -50%) scale(0.4)' }, { transform: 'translate(-50%, -50%) scale(1.5)' }, { transform: 'translate(-50%, -50%) scale(1)' }], { duration: sure(500), easing: 'cubic-bezier(.3,1.6,.5,1)' });
  }
  get yanan() {
    return this.yildizlar.filter((e) => e.classList.contains('yandi')).length;
  }
}
