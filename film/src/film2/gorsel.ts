/**
 * Bölüm hattının kodla çizilen parçaları: battaniye tümseği (mekânın yorgan resmi bükülür), albüm ve tahta blok
 * (yer tutucu: Gemini çizimi gelince resim eşyası olur), tam ekran albüm yakın planı, dizi logosu (Gemini logosu
 * gelene kadar yuvarlak kalın yazı), bölüm adı, kapanış kartı ve jenerik. Kitin dili: çikolata kontur, düz dolgu,
 * beyaz parlama (film/src/oyunlu/cizim.ts).
 */
import { tasan } from '../kukla';
import { KONTUR, yuvarlakDikdortgen } from '../oyunlu/cizim';

const YAZI = 'Fredoka, system-ui, sans-serif';

/**
 * Battaniye tümseği: resim dikey dilimlerle çizilir, ortadaki dilimler yukarı uzar (altı yatakta sabit).
 * tumsek 0..1, merkez 0..1 (resmin eni boyunca), titre: anlık kıpırtı (hıçkırık, konuşma).
 */
export function battaniye(ctx: CanvasRenderingContext2D, img: HTMLImageElement, tumsek: number, merkez: number, titre: number, t: number) {
  const W = img.width, H = img.height, N = Math.ceil(W / 2);
  const nefes = 0.035 * Math.sin(2 * Math.PI * 0.32 * t);
  const kabar = Math.max(0, tumsek * (1 + nefes) + titre * 0.15);
  // bantlar: üst kenar (kontur) kalınlığı korunarak yukarı kayar, orta bant uzar, alt bant yerinde
  const a = H * 0.1, b = H * 0.62;
  for (let i = 0; i < N; i++) {
    const x0 = (i * W) / N, w = W / N;
    const u = (i + 0.5) / N;
    // yuvarlak tümsek (kosinüs çanı, yarı genişlik 0.3)
    const d = Math.abs(u - merkez) / 0.3;
    const ek = d >= 1 ? 0 : kabar * H * 0.55 * (0.5 + 0.5 * Math.cos(Math.PI * d)) ** 1.2;
    ctx.drawImage(img, x0, 0, w, a, x0, -ek, w + 0.5, a);
    ctx.drawImage(img, x0, a, w, b - a, x0, a - ek, w + 0.5, b - a + ek);
    ctx.drawImage(img, x0, b, w, H - b, x0, b, w + 0.5, H - b);
  }
}

/** fotoğraf albümü: (0,0) alt orta; ac 0 kapalı .. 1 açık; boy: kapalı albümün yüksekliği */
export function albumCiz(ctx: CanvasRenderingContext2D, boy: number, ac: number) {
  const c = boy * 0.045;
  const w = boy * 0.78;
  const kapak = '#c4553f', sirt = '#9c3e2e';
  ctx.lineJoin = 'round';
  if (ac < 0.5) {
    ctx.beginPath();
    yuvarlakDikdortgen(ctx, -w / 2, -boy, w, boy, boy * 0.07);
    ctx.fillStyle = kapak;
    ctx.fill();
    ctx.lineWidth = c;
    ctx.strokeStyle = KONTUR;
    ctx.stroke();
    ctx.fillStyle = sirt;
    ctx.fillRect(-w / 2 + c, -boy + c, w * 0.12, boy - 2 * c);
    // kapakta kalp
    ctx.beginPath();
    const kx = w * 0.05, ky = -boy * 0.55, r = boy * 0.12;
    ctx.moveTo(kx, ky + r);
    ctx.bezierCurveTo(kx - r * 1.6, ky - r * 0.2, kx - r * 0.6, ky - r * 1.3, kx, ky - r * 0.4);
    ctx.bezierCurveTo(kx + r * 0.6, ky - r * 1.3, kx + r * 1.6, ky - r * 0.2, kx, ky + r);
    ctx.fillStyle = '#ffd27a';
    ctx.fill();
    ctx.lineWidth = c * 0.7;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-w / 2 + w * 0.2, -boy + c * 2, w * 0.7, c * 1.2);
    return;
  }
  // açık: iki sayfa yan yana, yatık (kucakta)
  const W = w * 2 * (0.6 + 0.4 * ac), H = boy * 0.62;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -H * 0.06);
    ctx.quadraticCurveTo((s * W) / 4, -H * 0.12, (s * W) / 2, -H * 0.04);
    ctx.lineTo((s * W) / 2, -H);
    ctx.quadraticCurveTo((s * W) / 4, -H * 1.08, 0, -H * 1.02);
    ctx.closePath();
    ctx.fillStyle = '#fff6e2';
    ctx.fill();
    ctx.lineWidth = c;
    ctx.strokeStyle = KONTUR;
    ctx.stroke();
    // küçük fotoğraf
    ctx.fillStyle = s < 0 ? '#bfe3f2' : '#f7d6c4';
    ctx.fillRect(s < 0 ? -W * 0.4 : W * 0.12, -H * 0.82, W * 0.28, H * 0.5);
  }
}

/** tahta blok: (0,0) alt orta, k kenar */
export function blokCiz(ctx: CanvasRenderingContext2D, k: number, renk: string) {
  const c = k * 0.07;
  const d = k * 0.22;
  ctx.lineJoin = 'round';
  // üst yüz
  ctx.beginPath();
  ctx.moveTo(-k / 2, -k);
  ctx.lineTo(-k / 2 + d, -k - d * 0.7);
  ctx.lineTo(k / 2 + d, -k - d * 0.7);
  ctx.lineTo(k / 2, -k);
  ctx.closePath();
  ctx.fillStyle = renk;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
  ctx.lineWidth = c;
  ctx.strokeStyle = KONTUR;
  ctx.stroke();
  // yan yüz
  ctx.beginPath();
  ctx.moveTo(k / 2, -k);
  ctx.lineTo(k / 2 + d, -k - d * 0.7);
  ctx.lineTo(k / 2 + d, -d * 0.7);
  ctx.lineTo(k / 2, 0);
  ctx.closePath();
  ctx.fillStyle = renk;
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fill();
  ctx.stroke();
  // ön yüz
  ctx.beginPath();
  yuvarlakDikdortgen(ctx, -k / 2, -k, k, k, k * 0.08);
  ctx.fillStyle = renk;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-k * 0.22, -k * 0.75, k * 0.1, k * 0.06, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Tam ekran albüm yakın planı (ekleme çekim). fotoCiz: fotoğrafın içini çizer (x, y, en, boy; ekran pikseli).
 * yakin: büyütme (1 = bütün çift sayfa), odak fotoğrafın ortası.
 */
export function albumYakin(ctx: CanvasRenderingContext2D, W: number, H: number, sayfa: number, yakin: number, t: number, fotoCiz: (sayfa: number, x: number, y: number, w: number, h: number) => void) {
  // masa: sıcak ahşap
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#d9a066');
  g.addColorStop(1, '#b97c45');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const pw = W * 0.42, ph = H * 0.78;
  const fx = W * 0.5 - pw * 0.93, fy = H * 0.5 - ph * 0.36;
  const fw = pw * 0.84, fh = fw * 0.72;
  // odak: soldaki büyük fotoğrafın ortası
  const ox = fx + fw / 2, oy = fy + fh / 2;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(yakin, yakin);
  ctx.translate(-(W / 2 + (ox - W / 2) * (1 - 1 / yakin)), -(H / 2 + (oy - H / 2) * (1 - 1 / yakin)));
  // çift sayfa
  const c = W * 0.004;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  yuvarlakDikdortgen(ctx, W / 2 - pw - W * 0.012, H / 2 - ph / 2 - H * 0.012, pw * 2 + W * 0.024, ph + H * 0.024, W * 0.012);
  ctx.fillStyle = '#c4553f';
  ctx.fill();
  ctx.lineWidth = c;
  ctx.strokeStyle = KONTUR;
  ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.rect(s < 0 ? W / 2 - pw : W / 2, H / 2 - ph / 2, pw, ph);
    ctx.fillStyle = '#fff6e2';
    ctx.fill();
    ctx.stroke();
  }
  const kat = ctx.createLinearGradient(W / 2 - W * 0.03, 0, W / 2 + W * 0.03, 0);
  kat.addColorStop(0, 'rgba(120,70,40,0)');
  kat.addColorStop(0.5, 'rgba(120,70,40,0.28)');
  kat.addColorStop(1, 'rgba(120,70,40,0)');
  ctx.fillStyle = kat;
  ctx.fillRect(W / 2 - W * 0.03, H / 2 - ph / 2, W * 0.06, ph);
  // büyük fotoğraf (sol sayfa), hafif yamuk, beyaz kenar
  const foto = (x: number, y: number, w: number, h: number, aci: number, n: number) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(aci);
    const k = w * 0.05;
    ctx.shadowColor = 'rgba(80,40,20,0.3)';
    ctx.shadowBlur = W * 0.008;
    ctx.shadowOffsetY = W * 0.003;
    ctx.beginPath();
    yuvarlakDikdortgen(ctx, -w / 2 - k, -h / 2 - k, w + 2 * k, h + 2 * k, k * 0.6);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = c * 0.6;
    ctx.strokeStyle = 'rgba(64,19,18,0.35)';
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.save();
    ctx.clip();
    ctx.translate(-w / 2, -h / 2);
    fotoCiz(n, 0, 0, w, h);
    ctx.restore();
    ctx.restore();
  };
  foto(fx, fy, fw, fh, -0.03, sayfa);
  // sağ sayfa: küçük süs (yıldız ve kalp çıkartmaları)
  ctx.fillStyle = '#ffd27a';
  for (let i = 0; i < 5; i++) {
    const x = W / 2 + pw * (0.2 + 0.15 * i), y = H / 2 + ph * (0.28 - 0.05 * (i % 2));
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const a = (k * Math.PI) / 5 - Math.PI / 2, r = k % 2 ? W * 0.006 : W * 0.014;
      ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
  foto(W / 2 + pw * 0.16, H / 2 - ph * 0.38, pw * 0.62, pw * 0.62 * 0.72, 0.04, sayfa + 100);
  void t;
  ctx.restore();
}

// ---------------------------------------------------------------- yazılar
function yaziBas(ctx: CanvasRenderingContext2D, metin: string, x: number, y: number, boy: number, dolgu: string, kontur = KONTUR) {
  ctx.font = `700 ${Math.round(boy)}px ${YAZI}`;
  ctx.lineJoin = 'round';
  ctx.lineWidth = boy * 0.2;
  ctx.strokeStyle = kontur;
  ctx.strokeText(metin, x, y);
  ctx.lineWidth = boy * 0.08;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText(metin, x, y);
  ctx.fillStyle = dolgu;
  ctx.fillText(metin, x, y);
}

/**
 * Dizi logosu "Kino ve Ailesi" (Gemini logosu gelene kadar): "Kino" büyük yeşil, "ve Ailesi" küçük kırmızı.
 * u: belirme anından beri geçen sn; logoResmi varsa o çizilir.
 */
export function logoCiz(ctx: CanvasRenderingContext2D, W: number, H: number, u: number, cikis: number, logoResmi?: HTMLImageElement | null) {
  const kisa = Math.min(W, H * 16 / 9);
  const g = Math.min(1, cikis);
  ctx.save();
  ctx.globalAlpha = Math.max(0, g);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cx = W / 2, cy = H * 0.4;
  ctx.shadowColor = 'rgba(64,19,18,0.35)';
  ctx.shadowBlur = kisa * 0.012;
  ctx.shadowOffsetY = kisa * 0.006;
  if (logoResmi) {
    const s = tasan(Math.min(1, u / 0.7), 1.4);
    const w = kisa * 0.5 * s, h = (w * logoResmi.height) / logoResmi.width;
    ctx.drawImage(logoResmi, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
    return;
  }
  // "Kino": harf harf zıplayarak
  const boy = kisa * 0.13;
  ctx.font = `700 ${Math.round(boy)}px ${YAZI}`;
  const harfler = [...'Kino'];
  const enler = harfler.map((h) => ctx.measureText(h).width);
  const top = enler.reduce((a, b) => a + b, 0) + boy * 0.04 * (harfler.length - 1);
  let x = cx - top / 2;
  harfler.forEach((h, i) => {
    const s = tasan(Math.max(0, Math.min(1, (u - i * 0.09) / 0.45)), 1.8);
    if (s <= 0) {
      x += enler[i] + boy * 0.04;
      return;
    }
    ctx.save();
    ctx.translate(x + enler[i] / 2, cy);
    ctx.rotate(Math.sin(u * 2.2 + i * 1.3) * 0.035);
    ctx.scale(s, s);
    ctx.textAlign = 'center';
    yaziBas(ctx, h, 0, 0, boy, ['#7cc35b', '#6bb84f', '#7cc35b', '#6bb84f'][i]);
    ctx.restore();
    x += enler[i] + boy * 0.04;
  });
  // "ve Ailesi"
  const s2 = tasan(Math.max(0, Math.min(1, (u - 0.5) / 0.5)), 1.5);
  if (s2 > 0) {
    ctx.save();
    ctx.translate(cx, cy + boy * 0.62);
    ctx.scale(s2, s2);
    yaziBas(ctx, 've Ailesi', 0, 0, boy * 0.46, '#e5483f');
    ctx.restore();
  }
  ctx.restore();
}

/** bölüm adı: logonun altında krem şerit */
export function baslikCiz(ctx: CanvasRenderingContext2D, W: number, H: number, metin: string, u: number, cikis: number) {
  const kisa = Math.min(W, H * 16 / 9);
  const g = Math.min(1, u / 0.5, cikis);
  if (g <= 0) return;
  ctx.save();
  ctx.globalAlpha = g;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const y = H * 0.66 + (1 - g) * kisa * 0.02;
  const boy = kisa * 0.045;
  ctx.font = `700 ${Math.round(boy)}px ${YAZI}`;
  const en = ctx.measureText(metin).width + boy * 1.6;
  ctx.beginPath();
  yuvarlakDikdortgen(ctx, W / 2 - en / 2, y - boy * 0.85, en, boy * 1.7, boy * 0.85);
  ctx.fillStyle = '#fff4dd';
  ctx.fill();
  ctx.lineWidth = boy * 0.12;
  ctx.strokeStyle = KONTUR;
  ctx.stroke();
  ctx.fillStyle = '#6b3a1f';
  ctx.fillText(metin, W / 2, y + boy * 0.04);
  ctx.restore();
}

/** kapanış kartı / ara kart: krem zemin üstüne iki satıra kadar büyük yazı */
export function kartCiz(ctx: CanvasRenderingContext2D, W: number, H: number, metin: string, g: number) {
  if (g <= 0) return;
  const kisa = Math.min(W, H * 16 / 9);
  ctx.save();
  ctx.globalAlpha = g;
  ctx.fillStyle = '#fff4dd';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const boy = kisa * 0.05;
  ctx.font = `700 ${Math.round(boy)}px ${YAZI}`;
  const k = metin.split(' ');
  const satir: string[] = [];
  let s = '';
  for (const w of k) {
    const d = s ? `${s} ${w}` : w;
    if (ctx.measureText(d).width > W * 0.7 && s) {
      satir.push(s);
      s = w;
    } else s = d;
  }
  if (s) satir.push(s);
  satir.forEach((l, i) => {
    ctx.fillStyle = '#6b3a1f';
    ctx.fillText(l, W / 2, H / 2 + (i - (satir.length - 1) / 2) * boy * 1.35);
  });
  ctx.restore();
}

/** jenerik satırları (üst bant; alt ve orta YouTube bitiş ekranına boş kalır) */
export function jenerikCiz(ctx: CanvasRenderingContext2D, W: number, H: number, satirlar: string[], g: number, minkino?: HTMLImageElement | null) {
  if (g <= 0) return;
  const kisa = Math.min(W, H * 16 / 9);
  ctx.save();
  ctx.globalAlpha = g;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let y = H * 0.07;
  if (minkino) {
    const h = H * 0.13, w = (h * minkino.width) / minkino.height;
    ctx.drawImage(minkino, W / 2 - w / 2, y, w, h);
    y += h + H * 0.035;
  }
  satirlar.forEach((l, i) => {
    const boy = kisa * (i === 0 ? 0.032 : 0.022);
    ctx.font = `${i === 0 ? 700 : 600} ${Math.round(boy)}px ${YAZI}`;
    ctx.fillStyle = i === 0 ? '#6b3a1f' : '#8a5a3a';
    ctx.fillText(l, W / 2, y + boy * 0.6);
    y += boy * 1.55;
  });
  ctx.restore();
}

/**
 * YouTube bitiş ekranı alanları (1920×1080 oranında): abone ol düğmesi ve iki video kutusu. Jenerik bu alanlara
 * bir şey koymaz; ?kilavuz=1 önizlemede çizgiyle gösterilir (kayda girmez).
 */
export const BITIS_ALANLARI: { ad: string; x: number; y: number; w: number; h: number; daire?: boolean }[] = [
  // 16:9 karede 16:9 kutu: en ve boy oranı aynı
  { ad: 'video 1', x: 0.05, y: 0.46, w: 0.34, h: 0.34 },
  { ad: 'video 2', x: 0.61, y: 0.46, w: 0.34, h: 0.34 },
  { ad: 'abone ol', x: 0.445, y: 0.54, w: 0.11, h: 0.11 * (16 / 9), daire: true },
];
export function kilavuzCiz(ctx: CanvasRenderingContext2D, W: number, H: number, bitis: boolean) {
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 2;
  // başlık güvenli alanı (%90)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.strokeRect(W * 0.05, H * 0.05, W * 0.9, H * 0.9);
  if (bitis) {
    ctx.strokeStyle = 'rgba(255,40,40,0.85)';
    ctx.fillStyle = 'rgba(255,40,40,0.12)';
    ctx.font = `600 ${Math.round(H * 0.025)}px ${YAZI}`;
    for (const a of BITIS_ALANLARI) {
      ctx.beginPath();
      if (a.daire) ctx.ellipse((a.x + a.w / 2) * W, (a.y + a.h / 2) * H, (a.w / 2) * W, (a.h / 2) * H, 0, 0, Math.PI * 2);
      else ctx.rect(a.x * W, a.y * H, a.w * W, a.h * H);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,40,40,0.9)';
      ctx.fillText(a.ad, a.x * W + 8, a.y * H + H * 0.03);
      ctx.fillStyle = 'rgba(255,40,40,0.12)';
    }
  }
  ctx.restore();
}
