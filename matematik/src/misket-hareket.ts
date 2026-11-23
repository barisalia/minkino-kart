import { guzergah, yon, type Parca, type Nokta } from './misket-geometri';
import { calgiSesi } from '../../src/audio/bando';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { KAYMA, TOP_R } from './misket-cizim';
export type Yer = { kat: number; goz: number };

export function misketiYuvarla(
  svg: SVGSVGElement,
  plan: Parca[],
  topuKoy: (n: Nokta, aci: number) => void,
  bitir: (bos: Yer | null) => void,
) {
  const rota = guzergah(plan),
    hat = rota.hat;
  const notalar = [60, 64, 67, 69, 72, 76, 79, 81];
  let mesafe = 0,
    indis = 1,
    siradaki = 0,
    once = performance.now(),
    hiz = 135,
    aci = 0,
    anim = 0,
    // Rayın üst yanı (yürüyüş yönünün solu ya da sağı; çemberde içe döner): bir önceki normale yakın olan seçilir.
    nx = 0,
    ny = -1;
  const gecikmeler: number[] = [];
  const yakinIzle = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let kameraX = 0,
    kameraY = 0,
    kameraEn = 1120;
  function kamera(x: number, y: number, en: number) {
    kameraX = x;
    kameraY = y;
    kameraEn = en;
    svg.setAttribute('viewBox', [x, y, en, (en * 630) / 1120].join(' '));
  }
  function izle(n: Nokta, dt: number) {
    if (!yakinIzle) return;
    const yaklas = Math.min(1, mesafe / 330);
    const en = 1120 - 235 * yaklas * yaklas * (3 - 2 * yaklas),
      boy = (en * 630) / 1120;
    const x = Math.max(0, Math.min(1120 - en, n.x - en * 0.5));
    const y = Math.max(0, Math.min(630 - boy, n.y - boy * 0.46));
    const karisim = 1 - Math.exp(-4 * dt);
    kamera(kameraX + (x - kameraX) * karisim, kameraY + (y - kameraY) * karisim, en);
  }
  function geniseDon(sure: number) {
    if (!yakinIzle) return;
    const x = kameraX,
      y = kameraY,
      en = kameraEn,
      bas = performance.now();
    function acil(simdi: number) {
      const t = Math.min(1, (simdi - bas) / sure),
        kalan = 1 - t * t * (3 - 2 * t);
      kamera(x * kalan, y * kalan, 1120 - (1120 - en) * kalan);
      if (t < 1) anim = requestAnimationFrame(acil);
    }
    anim = requestAnimationFrame(acil);
  }
  function vurus(i: number) {
    const v = rota.isaretler[i];
    if (v.tur === 'cark' || v.tur === 'can') {
      const el = svg.querySelector(v.tur === 'cark' ? '.mk-cark' : '.mk-canlar')!;
      el.classList.remove('mk-hareket');
      void el.getBoundingClientRect();
      el.classList.add('mk-hareket');
      calgiSesi(v.tur === 'can' ? 3 : 4, v.tur === 'can' ? 81 : 72, 0.75);
    } else {
      const n = notalar[(v.goz + v.kat * 3) % notalar.length];
      calgiSesi(v.tur === 'vadi' ? 3 : 4, n, v.tur === 'ek' ? 0.25 : 0.65);
      if (v.tur === 'vadi') gecikmeler.push(window.setTimeout(() => calgiSesi(3, n + 4, 0.4), 110));
      if (v.tur !== 'ek')
        svg.querySelector('[data-ray="' + v.kat + ':' + v.goz + '"]')?.classList.add('mk-nota');
    }
  }
  function inis(bas: Nokta, bos: Yer | null) {
    const dx = bos ? yon(bos.kat) * 31 : 1049 - bas.x,
      dy = bos ? 48 : 426 - bas.y;
    if (bos)
      svg.querySelector('.mk-oniz')!.innerHTML =
        '<g transform="translate(' +
        (bas.x + dx) +
        ' ' +
        (bas.y + dy + 10) +
        ')"><path d="M-21 -3Q0 10 21 -3L17 7Q0 16 -17 7Z" fill="#f3be75" stroke="#463038" stroke-width="2.6"/></g>';
    const baslangic = performance.now();
    function dus(simdi: number) {
      const t = Math.min(1, (simdi - baslangic) / 390);
      topuKoy({ x: bas.x + dx * t, y: bas.y + dy * t * t - KAYMA }, aci + dx * t * 2);
      if (t < 1) anim = requestAnimationFrame(dus);
      else {
        if (bos) oyunSesi('kutu');
        else calgiSesi(3, 84, 1.1);
        bitir(bos);
        geniseDon(bos ? 690 : 1100);
      }
    }
    anim = requestAnimationFrame(dus);
  }
  function kare(simdi: number) {
    const dt = Math.min(0.05, (simdi - once) / 1000);
    once = simdi;
    const a = hat[indis - 1],
      b = hat[indis],
      egim = (b.n.y - a.n.y) / (b.mesafe - a.mesafe);
    hiz = Math.max(138, Math.min(282, hiz + (760 * egim + (187 - hiz) * 0.72) * dt));
    const adim = hiz * dt;
    mesafe = Math.min(rota.mesafe, mesafe + adim);
    while (indis < hat.length - 1 && hat[indis].mesafe < mesafe) indis++;
    const bas = hat[indis - 1],
      son = hat[indis],
      oran = (mesafe - bas.mesafe) / (son.mesafe - bas.mesafe);
    aci += (((adim / TOP_R) * 180) / Math.PI) * Math.sign(son.n.x - bas.n.x);
    const n = { x: bas.n.x + (son.n.x - bas.n.x) * oran, y: bas.n.y + (son.n.y - bas.n.y) * oran };
    const ddx = son.n.x - bas.n.x, ddy = son.n.y - bas.n.y, uz = Math.hypot(ddx, ddy) || 1;
    let ax = ddy / uz, ay = -ddx / uz;
    if (ax * nx + ay * ny < 0) { ax = -ax; ay = -ay; }
    nx += (ax - nx) * 0.5;
    ny += (ay - ny) * 0.5;
    const nu = Math.hypot(nx, ny) || 1;
    nx /= nu;
    ny /= nu;
    topuKoy({ x: n.x + nx * KAYMA, y: n.y + ny * KAYMA }, aci);
    izle(n, dt);
    while (siradaki < rota.isaretler.length && rota.isaretler[siradaki].mesafe <= mesafe) vurus(siradaki++);
    if (mesafe < rota.mesafe) anim = requestAnimationFrame(kare);
    else inis(hat.at(-1)!.n, rota.bos);
  }
  anim = requestAnimationFrame(kare);
  return () => {
    cancelAnimationFrame(anim);
    gecikmeler.forEach(clearTimeout);
  };
}
