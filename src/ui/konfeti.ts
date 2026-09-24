import { TEST_MODU } from './dom';

const RENKLER = ['#FFC72C', '#F0413F', '#3E9DF2', '#5DBE3F', '#FF8A2B', '#9B5CE0', '#FF7EB6'];

interface Parca {
  x: number; y: number; vx: number; vy: number; r: number; d: number; vd: number; renk: string; sekil: 0 | 1 | 2; omur: number;
}

let tuval: HTMLCanvasElement | null = null;
let parcalar: Parca[] = [];
let calisiyor = false;

function hazirla(kok: HTMLElement) {
  if (tuval && tuval.isConnected) return tuval;
  tuval = document.createElement('canvas');
  tuval.className = 'konfeti';
  kok.append(tuval);
  return tuval;
}

/** (x, y) noktasından renkli konfeti patlatır. */
export function konfetiPatlat(kok: HTMLElement, x: number, y: number, adet = 70, guc = 1) {
  if (TEST_MODU || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const t = hazirla(kok);
  const dpr = Math.min(2, devicePixelRatio || 1);
  if (t.width !== innerWidth * dpr) {
    t.width = innerWidth * dpr;
    t.height = innerHeight * dpr;
  }
  for (let i = 0; i < adet; i++) {
    const a = Math.random() * Math.PI * 2;
    const h = (4 + Math.random() * 9) * guc;
    parcalar.push({
      x, y,
      vx: Math.cos(a) * h,
      vy: Math.sin(a) * h - 6 * guc,
      r: 5 + Math.random() * 6,
      d: Math.random() * Math.PI,
      vd: (Math.random() - 0.5) * 0.4,
      renk: RENKLER[i % RENKLER.length],
      sekil: (i % 3) as 0 | 1 | 2,
      omur: 1,
    });
  }
  if (!calisiyor) {
    calisiyor = true;
    requestAnimationFrame(ciz);
  }
}

function yildiz(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
}

function ciz() {
  if (!tuval) return;
  const c = tuval.getContext('2d')!;
  const dpr = tuval.width / innerWidth;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of parcalar) {
    p.vy += 0.32;
    p.vx *= 0.985;
    p.x += p.vx;
    p.y += p.vy;
    p.d += p.vd;
    p.omur -= 0.009;
    c.save();
    c.globalAlpha = Math.max(0, Math.min(1, p.omur * 2));
    c.translate(p.x, p.y);
    c.rotate(p.d);
    c.fillStyle = p.renk;
    if (p.sekil === 0) c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
    else if (p.sekil === 1) {
      c.beginPath();
      c.arc(0, 0, p.r / 2.2, 0, Math.PI * 2);
      c.fill();
    } else yildiz(c, p.r / 1.6);
    c.restore();
  }
  parcalar = parcalar.filter((p) => p.omur > 0 && p.y < innerHeight + 40);
  if (parcalar.length) requestAnimationFrame(ciz);
  else {
    calisiyor = false;
    c.clearRect(0, 0, innerWidth, innerHeight);
  }
}
