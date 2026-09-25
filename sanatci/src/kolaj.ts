import type { Eser } from './depo';

function resim(b: Blob): Promise<HTMLImageElement> {
  return new Promise((coz, red) => {
    const i = new Image();
    i.onload = () => coz(i);
    i.onerror = red;
    i.src = URL.createObjectURL(b);
  });
}

function yuvarlakKutu(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** Paylaşım görseli (1080×1350): solda çocuğun çizimi, sağda sihirli hali, Minkino imzası. */
export async function kolajYap(e: Eser): Promise<Blob> {
  const [a, b] = await Promise.all([resim(e.cizim), resim(e.sonuc)]);
  const W = 1080, H = 1350;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#fff7e8');
  g.addColorStop(1, '#ffe3b8');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  await document.fonts?.ready;
  c.textAlign = 'center';
  c.fillStyle = '#5a3617';
  c.font = '700 64px Fredoka, sans-serif';
  c.fillText('Minik Sanatçı', W / 2, 110);

  const kutu = (img: HTMLImageElement, x: number, y: number, s: number, etiket: string, renk: string) => {
    c.save();
    c.shadowColor = 'rgba(90,54,23,.25)';
    c.shadowBlur = 24;
    c.shadowOffsetY = 10;
    yuvarlakKutu(c, x, y, s, s, 36);
    c.fillStyle = '#fff';
    c.fill();
    c.restore();
    c.save();
    yuvarlakKutu(c, x, y, s, s, 36);
    c.clip();
    c.drawImage(img, x + 16, y + 16, s - 32, s - 32);
    c.restore();
    yuvarlakKutu(c, x, y, s, s, 36);
    c.lineWidth = 8;
    c.strokeStyle = '#5a3617';
    c.stroke();
    c.fillStyle = renk;
    yuvarlakKutu(c, x + s / 2 - 150, y + s - 30, 300, 64, 32);
    c.fill();
    c.lineWidth = 6;
    c.stroke();
    c.fillStyle = '#fff';
    c.font = '600 34px Fredoka, sans-serif';
    c.fillText(etiket, x + s / 2, y + s + 14);
  };
  kutu(a, 70, 190, 420, 'Benim çizimim', '#FF8A2B');
  kutu(b, 590, 190, 420, 'Minkino sihri', '#9B5CE0');
  // Büyük sonuç
  kutu(b, 190, 700, 700, '', '#9B5CE0');
  c.fillStyle = '#5a3617';
  c.font = '600 40px Fredoka, sans-serif';
  c.fillText('minkino', W / 2, H - 50);
  return new Promise((coz) => cv.toBlob((bl) => coz(bl!), 'image/png'));
}

/** Web Share ile paylaşır; desteklenmiyorsa 'goster' döner (görseli basılı tutup kaydetmek için). */
export async function paylas(b: Blob, ad: string): Promise<'paylasildi' | 'iptal' | 'goster'> {
  const dosya = new File([b], ad, { type: b.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [dosya] })) {
    try {
      await nav.share({ files: [dosya], title: 'Minik Sanatçı', text: 'Çizimim Minkino sihriyle canlandı!' });
      return 'paylasildi';
    } catch {
      return 'iptal';
    }
  }
  return 'goster';
}
