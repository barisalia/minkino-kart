// Minik Doktor vakalarının ortak etkileri (yalnız kod: çizim üretmez, var olan çizimi canlandırır). Hepsi transform ve
// saydamlıkla çalışır; kurulum anında bir kez hazırlanır, oyun sırasında yeni katman ya da filtre istemez.
// Şimdilik "Mino'nun Kurabiyeli Dişleri" (dis/) kullanır; "Dikenli Pati"deki (vaka/sahne.ts) eşleriyle aynı kurallar.
import { SAHNE, type Kutu, type Nokta } from './veri';

const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };

/**
 * Elde tutulan aletin gölgesi: çizimin silueti küçük bir tuvale bir kez çizilir ve yumuşatılır; ekranda büyütülerek durur
 * (her karede filtre yok). `.vk-golge` sınıfıyla neredeyse saydam bekler; görünürlüğünü ele alınma animasyonu verir.
 */
export function golgeYap(r: HTMLImageElement, g: number, y: number): HTMLCanvasElement {
  const c = el('canvas', 'vk-golge'); c.width = Math.max(8, Math.round(g / 7)); c.height = Math.max(8, Math.round(y / 7));
  c.style.width = g + 'px'; c.style.height = y + 'px';
  const x = c.getContext('2d', { willReadFrequently: true })!;
  if (!r.naturalWidth) return c;
  x.drawImage(r, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height);
  let a = new Float32Array(c.width * c.height);
  for (let i = 0; i < a.length; i++) a[i] = d.data[i * 4 + 3];
  for (let tur = 0; tur < 2; tur++) {
    const b = a; a = new Float32Array(b.length);
    for (let yy = 0; yy < c.height; yy++) for (let xx = 0; xx < c.width; xx++) {
      let t = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = xx + i, Y = yy + j; if (X >= 0 && Y >= 0 && X < c.width && Y < c.height) t += b[Y * c.width + X]; }
      a[yy * c.width + xx] = t / 9;
    }
  }
  for (let i = 0; i < a.length; i++) { d.data[i * 4] = 43; d.data[i * 4 + 1] = 36; d.data[i * 4 + 2] = 64; d.data[i * 4 + 3] = Math.round(a[i] * 0.3); }
  x.putImageData(d, 0, 0);
  return c;
}

/**
 * Ekran sahneden (16:9) uzun ya da genişse kalan kenarda düz renkli boş bant kalmaz: görünümün kenarındaki pikseller
 * dışarı doğru uzar. Dört ince tuval; boyları CSS'ten (--ty, --td; vaka.css → .vk-tasma) gelir. Katmanlar alttan üste
 * verilir; kenardan bir piksel içerideki sıra alınır (kenar yumuşatmasının dışı).
 */
export function kenarUzat(gorunum: HTMLElement, katmanlar: readonly (readonly [HTMLImageElement | undefined, Kutu])[]): void {
  const kutu = el('div', 'vk-tasma');
  for (const kenar of ['ust', 'alt', 'sol', 'sag'] as const) {
    const yatay = kenar === 'ust' || kenar === 'alt';
    const c = el('canvas', 'vk-t-' + kenar); c.width = yatay ? SAHNE.g : 1; c.height = yatay ? 1 : SAHNE.y;
    const g = c.getContext('2d')!;
    const yer = kenar === 'ust' || kenar === 'sol' ? 1 : (yatay ? SAHNE.y : SAHNE.g) - 2;
    for (const [r, k] of katmanlar) {
      if (!r || !r.naturalWidth) continue;
      if (yatay) { if (yer >= k.ust && yer < k.ust + k.y) g.drawImage(r, 0, Math.floor(((yer - k.ust) / k.y) * r.naturalHeight), r.naturalWidth, 1, k.sol, 0, k.g, 1); }
      else if (yer >= k.sol && yer < k.sol + k.g) g.drawImage(r, Math.floor(((yer - k.sol) / k.g) * r.naturalWidth), 0, 1, r.naturalHeight, 0, k.ust, 1, k.y);
    }
    kutu.append(c);
  }
  gorunum.prepend(kutu);
}

/**
 * Yıldız parçacıkları (parıltı, yıldız yağmuru): Astra'nın yıldız çizimi, baştan boyalı bir havuzdan (`.vk-yildiz-p`).
 * Havuzdaki yıldız kendi başına neredeyse saydam durur; görünürlüğünü animasyon verir.
 */
export function yildizEtkisi(yildiz: () => HTMLImageElement, sure: (ms: number) => number, tasma: { yan: number; dik: number }) {
  const yeri = (q: Nokta, aci: number, k: number) => `translate(${(q.x - 50).toFixed(1)}px, ${(q.y - 50).toFixed(1)}px) rotate(${aci.toFixed(0)}deg) scale(${k.toFixed(3)})`;
  return {
    havuz: (kati: HTMLElement, adet: number): HTMLImageElement[] => Array.from({ length: adet }, () => { const r = yildiz(); kati.append(r); return r; }),
    /** p noktasından çevreye saçılır */
    sac(havuz: HTMLImageElement[], p: Nokta, adet: number, uzaklik = 210, boy = 64) {
      for (let i = 0; i < adet; i++) {
        const r = havuz.pop(); if (!r) return;
        const a = (i / adet) * Math.PI * 2 + Math.random() * 0.6, d = uzaklik * (0.65 + Math.random() * 0.5), k = (boy * (0.7 + Math.random() * 0.6)) / 100, don = (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 160);
        const uc = { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d };
        const geri = () => { havuz.push(r); };
        void r.animate([
          { transform: yeri(p, 0, k * 0.3), opacity: 1 },
          { transform: yeri({ x: p.x + (uc.x - p.x) * 0.85, y: p.y + (uc.y - p.y) * 0.85 }, don * 0.7, k), opacity: 1, offset: 0.55 },
          { transform: yeri({ x: uc.x, y: uc.y + 36 }, don, k * 0.5), opacity: 0 },
        ], { duration: sure(520 + Math.random() * 180), easing: 'cubic-bezier(.15,.7,.3,1)' }).finished.then(geri, geri);
      }
    },
    /** ekranın tamamına yukarıdan aşağı yağar */
    yagdir(havuz: HTMLImageElement[], adet: number) {
      for (let i = 0; i < adet; i++) {
        const r = havuz.pop(); if (!r) return;
        const x = -tasma.yan + 80 + Math.random() * (SAHNE.g + 2 * tasma.yan - 160), k = (54 + Math.random() * 70) / 100, don = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 340), kay = (Math.random() - 0.5) * 220;
        const geri = () => { havuz.push(r); };
        void r.animate([
          { transform: yeri({ x, y: -90 - tasma.dik }, 0, k), opacity: 1 },
          { transform: yeri({ x: x + kay, y: SAHNE.y + tasma.dik + 110 }, don, k), opacity: 1 },
        ], { duration: sure(1150 + Math.random() * 750), delay: sure(Math.random() * 320), easing: 'cubic-bezier(.4,0,.85,.75)' }).finished.then(geri, geri);
      }
    },
  };
}

/** Zıplama (kutlamadaki hasta): yukarı çıkar, inerken hafifçe basılır. */
export const ZIPLAMA_KARELERI: Keyframe[] = [
  { transform: 'translateY(0) scale(1)', easing: 'cubic-bezier(.2,.7,.4,1)' },
  { transform: 'translateY(-38px) scale(1.04)', offset: 0.45, easing: 'cubic-bezier(.6,0,.9,.4)' },
  { transform: 'translateY(0) scale(1.03, .975)', offset: 0.86, easing: 'ease-out' },
  { transform: 'translateY(0) scale(1)' },
];
