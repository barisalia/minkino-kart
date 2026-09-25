/**
 * "Nasıl çizdim?" tekrarı ve paylaşılabilir resim kartı.
 */
import type { Cizgi } from '../../sanatci/src/tuval';
import { yolD } from './canlandir';
import { uzunluk } from './puan';

const NS = 'http://www.w3.org/2000/svg';
const sv = <K extends keyof SVGElementTagNameMap>(ad: K, a: Record<string, string | number> = {}) => {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
  return e;
};

/** Çocuğun çizimini çizdiği sırayla, hızlıca yeniden çizer (kâğıdın üstünde), sonra kaybolur. */
export function tekrarOynat(sahne: HTMLElement, cizgiler: Cizgi[]): Promise<void> {
  sahne.querySelector('.cc-tekrar-katman')?.remove();
  const s = sv('svg', { viewBox: '0 0 1 1', class: 'cc-tekrar-katman', 'aria-hidden': 'true' });
  s.append(sv('rect', { x: 0, y: 0, width: 1, height: 1, class: 'cc-tekrar-kagit' }));
  const L = cizgiler.map((c) => Math.max(0.02, uzunluk(c.noktalar)));
  const toplam = L.reduce((a, b) => a + b, 0);
  const SURE = Math.min(4.5, 1.2 + toplam * 0.9);
  let gecikme = 0.3;
  cizgiler.forEach((c, i) => {
    const sure = (L[i] / toplam) * SURE;
    const p = sv('path', {
      d: yolD(c.noktalar),
      fill: 'none',
      stroke: c.renk,
      'stroke-width': c.kalinlik,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      pathLength: 1,
      class: 'cc-tekrar-cizgi',
      style: `animation-duration:${sure.toFixed(2)}s;animation-delay:${gecikme.toFixed(2)}s`,
    });
    gecikme += sure + 0.12;
    s.append(p);
  });
  sahne.append(s);
  return new Promise((coz) =>
    setTimeout(() => {
      s.classList.add('bitti');
      setTimeout(() => {
        s.remove();
        coz();
      }, 600);
    }, (gecikme + 1) * 1000),
  );
}

/** Canlı SVG'yi (o anki kareyle) bağımsız bir resme çevirir: sınıf stilleri özniteliğe yazılır. */
function svgResmi(kaynak: SVGSVGElement, boyut: number): Promise<HTMLImageElement> {
  const k = kaynak.cloneNode(true) as SVGSVGElement;
  k.setAttribute('xmlns', NS);
  k.setAttribute('width', String(boyut));
  k.setAttribute('height', String(boyut));
  k.removeAttribute('class');
  k.querySelectorAll('.cc-hayalet').forEach((e) => e.remove());
  // kartta resim düz duruşunda: hareket dönüşümleri sıfırlanır (sahnedeki yeri kalır)
  k.querySelectorAll('.cc-tum, .cc-tepki, [data-parca], .cc-yer > g').forEach((e) => e.removeAttribute('transform'));
  k.querySelectorAll('.cc-alt').forEach((e) => {
    e.setAttribute('stroke', '#fff');
    e.setAttribute('opacity', '0.95');
  });
  k.querySelectorAll('.cc-alt, .cc-cizgi').forEach((e) => {
    e.setAttribute('fill', 'none');
    e.setAttribute('stroke-linecap', 'round');
    e.setAttribute('stroke-linejoin', 'round');
  });
  k.querySelectorAll('.cc-golge').forEach((e) => e.setAttribute('fill', 'rgba(40,20,0,0.18)'));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(k)], { type: 'image/svg+xml' }));
  return resimYukle(url).finally(() => setTimeout(() => URL.revokeObjectURL(url), 1000));
}

function resimYukle(url: string): Promise<HTMLImageElement> {
  return new Promise((coz, red) => {
    const i = new Image();
    i.onload = () => coz(i);
    i.onerror = red;
    i.src = url;
  });
}

function yildizYolu(x: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  x.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
  }
  x.closePath();
}

/** Paylaşılabilir kart (1080×1350 PNG): sahne + canlanan çizim + yıldızlar + "Benim Balığım". */
export async function kartYap(o: { svg: SVGSVGElement; sahneUrl?: string; baslik: string; yildiz: number }): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  await document.fonts?.ready;
  // zemin
  const zemin = x.createLinearGradient(0, 0, 0, H);
  zemin.addColorStop(0, '#fff8ea');
  zemin.addColorStop(1, '#ffe9c7');
  x.fillStyle = zemin;
  x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(90,54,23,0.06)';
  for (let i = 0; i < W; i += 36) for (let j = 0; j < H; j += 36) x.fillRect(i, j, 3, 3);
  // resim çerçevesi
  const [rx, ry, rs] = [80, 90, 920];
  const yuvarla = (px: number, py: number, w: number, h: number, r: number) => {
    x.beginPath();
    x.roundRect(px, py, w, h, r);
  };
  x.fillStyle = 'rgba(90,54,23,0.18)';
  yuvarla(rx, ry + 16, rs, rs, 56);
  x.fill();
  x.save();
  yuvarla(rx, ry, rs, rs, 56);
  x.clip();
  x.fillStyle = '#bfe6ff';
  x.fillRect(rx, ry, rs, rs);
  if (o.sahneUrl) {
    try {
      x.drawImage(await resimYukle(o.sahneUrl), rx, ry, rs, rs);
    } catch {
      /* sahnesiz */
    }
  }
  x.drawImage(await svgResmi(o.svg, rs), rx, ry, rs, rs);
  x.restore();
  x.lineWidth = 14;
  x.strokeStyle = '#5a3617';
  yuvarla(rx, ry, rs, rs, 56);
  x.stroke();
  // yıldızlar
  for (let i = 0; i < 3; i++) {
    const cx = W / 2 + (i - 1) * 120;
    const r = i === 1 ? 52 : 44;
    yildizYolu(x, cx, 1110 - (i === 1 ? 8 : 0), r);
    x.fillStyle = i < o.yildiz ? '#FFC72C' : '#eadcc3';
    x.fill();
    x.lineWidth = 8;
    x.lineJoin = 'round';
    x.strokeStyle = '#5a3617';
    x.stroke();
  }
  // başlık
  x.font = '700 86px Fredoka, "Arial Rounded MT Bold", system-ui, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineJoin = 'round';
  x.lineWidth = 16;
  x.strokeStyle = '#5a3617';
  x.strokeText(o.baslik, W / 2, 1240);
  x.fillStyle = '#FF8A2B';
  x.fillText(o.baslik, W / 2, 1240);
  x.font = '600 30px Fredoka, system-ui, sans-serif';
  x.fillStyle = 'rgba(90,54,23,0.6)';
  x.textAlign = 'right';
  x.fillText(`Minkino · ${new Date().toLocaleDateString('tr-TR')}`, W - 60, H - 34);
  return new Promise((coz) => c.toBlob((b) => coz(b!), 'image/png'));
}

/** Web Share ile paylaşır; olmazsa 'goster' (görseli basılı tutup kaydetmek için). */
export async function kartPaylas(b: Blob, ad: string): Promise<'paylasildi' | 'iptal' | 'goster'> {
  const dosya = new File([b], ad, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [dosya] })) {
    try {
      await nav.share({ files: [dosya], title: 'Çiz Canlansın', text: 'Benim resmim canlandı!' });
      return 'paylasildi';
    } catch {
      return 'iptal';
    }
  }
  return 'goster';
}
