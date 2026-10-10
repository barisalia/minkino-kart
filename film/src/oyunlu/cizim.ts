/**
 * Kodla çizilen küçük eşyalar (KARAKTER-KITI §8.4 "Kodla çizilenler" + E1 lavabo sayfası gelene kadar yer tutucular):
 * diş fırçası, macun, kum saati, köpük topu, su damlası, bezelye, basamak taburesi, parıltı, hayalet el, güneş huzmesi,
 * Kino'nun "Iii" dişleri. Kitin dili: kalın çikolata kontur (#401312), düz dolgu, beyaz parlama, yuvarlak uçlar.
 * Hepsi çağıranın dönüşümünde (yerel birimle) çizilir; ölçek ve konum çağıranın işi.
 */
export const KONTUR = '#401312';

function yol(ctx: CanvasRenderingContext2D, dolgu: string, cizgi: number, ciz: () => void) {
  ctx.beginPath();
  ciz();
  ctx.fillStyle = dolgu;
  ctx.fill();
  if (cizgi > 0) {
    ctx.lineWidth = cizgi;
    ctx.strokeStyle = KONTUR;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
export function yuvarlakDikdortgen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Diş fırçası: başı (kıllar) (0,0)'da, sap +x yönünde L uzunluğunda. Kıllar -y tarafında (yukarı).
 * renk: sap rengi (Kino yeşil, Lokum pembe). titre: kılların titreşimi (0..1).
 */
export function firca(ctx: CanvasRenderingContext2D, L: number, renk: string, titre = 0, t = 0) {
  const c = L * 0.028;
  const kalin = L * 0.1;
  // sap
  yol(ctx, renk, c, () => {
    ctx.moveTo(L * 0.2, -kalin * 0.28);
    ctx.quadraticCurveTo(L * 0.5, -kalin * 0.42, L * 0.97, -kalin * 0.55);
    ctx.arc(L * 0.97, 0, kalin * 0.55, -Math.PI / 2, Math.PI / 2);
    ctx.quadraticCurveTo(L * 0.5, kalin * 0.42, L * 0.2, kalin * 0.28);
    ctx.lineTo(-L * 0.05, kalin * 0.32);
    ctx.arc(-L * 0.05, 0, kalin * 0.32, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.closePath();
  });
  // sapta parlama
  ctx.beginPath();
  ctx.moveTo(L * 0.35, -kalin * 0.18);
  ctx.quadraticCurveTo(L * 0.6, -kalin * 0.3, L * 0.88, -kalin * 0.32);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = c * 0.9;
  ctx.stroke();
  // kıllar (beyaz, uçları açık mavi)
  const kx = -L * 0.12, kw = L * 0.3, kh = L * 0.11;
  ctx.save();
  ctx.translate(0, -kalin * 0.3);
  const dalga = titre ? Math.sin(t * 60) * kh * 0.08 * titre : 0;
  yol(ctx, '#ffffff', c, () => {
    ctx.moveTo(kx, 0);
    ctx.lineTo(kx + kw, 0);
    ctx.lineTo(kx + kw + dalga, -kh);
    ctx.lineTo(kx - dalga, -kh);
    ctx.closePath();
  });
  ctx.strokeStyle = 'rgba(120,170,210,0.55)';
  ctx.lineWidth = c * 0.6;
  for (let i = 1; i < 6; i++) {
    const x = kx + (kw * i) / 6;
    ctx.beginPath();
    ctx.moveTo(x, -c);
    ctx.lineTo(x + dalga * 0.6, -kh + c);
    ctx.stroke();
  }
  ctx.restore();
}

/** macun tüpü: merkez (0,0), boy L (yatay), sik: 0 düz .. 1 sıkılmış */
export function tup(ctx: CanvasRenderingContext2D, L: number, sik = 0) {
  const c = L * 0.035, h = L * 0.34 * (1 - 0.35 * sik);
  yol(ctx, '#fbfbf7', c, () => {
    ctx.moveTo(-L * 0.42, -h * 0.5);
    ctx.lineTo(-L * 0.5, -h * 0.62);
    ctx.lineTo(-L * 0.5, h * 0.62);
    ctx.lineTo(-L * 0.42, h * 0.5);
    ctx.quadraticCurveTo(0, h * (0.55 - 0.25 * sik), L * 0.32, h * 0.32);
    ctx.lineTo(L * 0.32, -h * 0.32);
    ctx.quadraticCurveTo(0, -h * (0.55 - 0.25 * sik), -L * 0.42, -h * 0.5);
    ctx.closePath();
  });
  // yeşil şerit
  ctx.fillStyle = '#6fc06a';
  ctx.fillRect(-L * 0.2, -h * 0.12, L * 0.36, h * 0.24);
  // kapak (kırmızı)
  yol(ctx, '#e5483f', c, () => yuvarlakDikdortgen(ctx, L * 0.31, -h * 0.3, L * 0.18, h * 0.6, c * 2));
}

/** fırçanın üstündeki macun: boy 0..1 (1 = kocaman kıvrım kıvrım kule), bezelye: küçük nokta */
export function macun(ctx: CanvasRenderingContext2D, r: number, boy: number) {
  const c = r * 0.12;
  const kat = Math.max(1, Math.round(1 + boy * 4));
  for (let i = 0; i < kat; i++) {
    const g = 1 - i / (kat + 1.5);
    const y = -r * 0.75 * i * (0.6 + boy * 0.4);
    const x = Math.sin(i * 1.7) * r * 0.25 * boy;
    yol(ctx, '#ffffff', c, () => ctx.ellipse(x, y, r * g * (0.9 + boy * 0.5), r * g * 0.62, 0, 0, Math.PI * 2));
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.08, r * g * 0.9, r * g * 0.22, 0, 0, Math.PI);
    ctx.strokeStyle = '#7fd0c8';
    ctx.lineWidth = c * 1.2;
    ctx.stroke();
  }
}

/**
 * Kum saati: alt orta (0,0)'da duran, w×h. p: akan kum oranı (0 dolu üst .. 1 bitti), akiyor: ince akış çizgisi.
 */
export function kumSaati(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, akiyor: boolean, t: number, parla = 0) {
  const c = w * 0.06;
  const kap = h * 0.11;
  const camW = w * 0.8, camH = h - 2 * kap;
  const ust = -h + kap, orta = -h / 2;
  const cam = () => {
    ctx.moveTo(-camW / 2, ust);
    ctx.lineTo(camW / 2, ust);
    ctx.bezierCurveTo(camW / 2, ust + camH * 0.32, w * 0.07, orta - camH * 0.06, w * 0.07, orta);
    ctx.bezierCurveTo(w * 0.07, orta + camH * 0.06, camW / 2, -kap - camH * 0.32, camW / 2, -kap);
    ctx.lineTo(-camW / 2, -kap);
    ctx.bezierCurveTo(-camW / 2, -kap - camH * 0.32, -w * 0.07, orta + camH * 0.06, -w * 0.07, orta);
    ctx.bezierCurveTo(-w * 0.07, orta - camH * 0.06, -camW / 2, ust + camH * 0.32, -camW / 2, ust);
    ctx.closePath();
  };
  if (parla > 0) {
    const g = ctx.createRadialGradient(0, orta, 0, 0, orta, h * 0.9);
    g.addColorStop(0, `rgba(255,236,150,${0.55 * parla})`);
    g.addColorStop(1, 'rgba(255,236,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-h, orta - h, 2 * h, 2 * h);
  }
  // cam (açık mavi, yarı saydam)
  yol(ctx, 'rgba(214,238,250,0.92)', 0, cam);
  // kum
  ctx.save();
  ctx.beginPath();
  cam();
  ctx.clip();
  const KUM = '#f1c25a', KUM_G = '#d99c3a';
  const ustKum = (1 - p) * camH * 0.4;
  if (ustKum > 0.5) {
    // üst hazne: aşağı daralan kum, yüzeyi ortada hafif çukur
    ctx.beginPath();
    const y0 = orta - camH * 0.02 - ustKum;
    ctx.moveTo(-camW, y0 - ustKum * 0.04);
    ctx.quadraticCurveTo(0, y0 + ustKum * 0.12, camW, y0 - ustKum * 0.04);
    ctx.lineTo(camW, orta);
    ctx.lineTo(-camW, orta);
    ctx.closePath();
    ctx.fillStyle = KUM;
    ctx.fill();
  }
  // alt hazne: büyüyen kum tepesi
  const altKum = p * camH * 0.4;
  if (altKum > 0.5) {
    ctx.beginPath();
    ctx.moveTo(-camW, -kap);
    ctx.lineTo(-camW, -kap - altKum * 0.45);
    ctx.quadraticCurveTo(0, -kap - altKum * 1.75, camW, -kap - altKum * 0.45);
    ctx.lineTo(camW, -kap);
    ctx.closePath();
    ctx.fillStyle = KUM;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-camW, -kap);
    ctx.lineTo(-camW, -kap - altKum * 0.2);
    ctx.quadraticCurveTo(0, -kap - altKum * 0.6, camW, -kap - altKum * 0.2);
    ctx.lineTo(camW, -kap);
    ctx.fillStyle = KUM_G;
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (akiyor && p < 1) {
    ctx.strokeStyle = KUM;
    ctx.lineWidth = w * 0.035;
    ctx.setLineDash([w * 0.05, w * 0.04]);
    ctx.lineDashOffset = -t * w * 0.9;
    ctx.beginPath();
    ctx.moveTo(0, orta - camH * 0.02);
    ctx.lineTo(0, -kap - altKum * 1.1);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
  // cam konturu ve parlama
  ctx.beginPath();
  cam();
  ctx.lineWidth = c;
  ctx.strokeStyle = KONTUR;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-camW * 0.3, ust + camH * 0.08);
  ctx.quadraticCurveTo(-camW * 0.36, ust + camH * 0.22, -w * 0.12, orta - camH * 0.12);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = c * 0.9;
  ctx.stroke();
  // ahşap kapaklar ve direkler
  for (const y of [-h, -kap]) yol(ctx, '#c98a4b', c, () => yuvarlakDikdortgen(ctx, -w / 2, y, w, kap, kap * 0.4));
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-w * 0.42, -h + kap * 0.2, w * 0.84, kap * 0.22);
  for (const x of [-w * 0.43, w * 0.36]) yol(ctx, '#b47438', c * 0.8, () => yuvarlakDikdortgen(ctx, x, ust, w * 0.07, camH, w * 0.03));
}

/** köpük topu: merkez (0,0), r yarıçap; nabiz 0..1 (parlayıp büyür), t zaman (kabarcıklar döner) */
export function kopukTopu(ctx: CanvasRenderingContext2D, r: number, t: number, nabiz = 0, parla = 0) {
  const c = r * 0.07;
  const b = 1 + 0.08 * nabiz;
  if (parla > 0) {
    const g = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.7);
    g.addColorStop(0, `rgba(255,248,200,${0.75 * parla})`);
    g.addColorStop(1, 'rgba(255,248,200,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  const kume: [number, number, number][] = [
    [0, 0, 0.62],
    [-0.45, 0.12, 0.42],
    [0.45, 0.1, 0.44],
    [-0.2, -0.38, 0.4],
    [0.25, -0.36, 0.38],
    [0.05, 0.42, 0.36],
  ];
  // önce kontur (hepsi), sonra dolgu: küme tek bulut gibi
  for (const pass of [0, 1]) {
    for (const [x, y, s] of kume) {
      const dx = Math.sin(t * 2.1 + x * 5) * r * 0.03, dy = Math.cos(t * 1.7 + y * 5) * r * 0.03;
      ctx.beginPath();
      ctx.arc((x * r + dx) * b, (y * r + dy) * b, s * r * b + (pass ? 0 : c), 0, Math.PI * 2);
      ctx.fillStyle = pass ? '#ffffff' : KONTUR;
      ctx.fill();
    }
  }
  // gölge ve parlamalar
  ctx.fillStyle = 'rgba(150,200,230,0.35)';
  ctx.beginPath();
  ctx.ellipse(r * 0.05 * b, r * 0.3 * b, r * 0.55 * b, r * 0.22 * b, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (const [x, y, s] of [
    [-0.2, -0.18, 0.13],
    [0.3, -0.42, 0.08],
  ]) {
    ctx.beginPath();
    ctx.arc(x * r * b, y * r * b, s * r, 0, Math.PI * 2);
    ctx.fill();
  }
  // dönen minik kabarcıklar
  for (let i = 0; i < 4; i++) {
    const a = t * (0.9 + i * 0.2) + i * 1.6;
    const R = r * (1.0 + 0.12 * Math.sin(t * 1.3 + i));
    const x = Math.cos(a) * R, y = Math.sin(a) * R * 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r * (0.08 + 0.03 * (i % 2)), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.lineWidth = c * 0.6;
    ctx.strokeStyle = 'rgba(64,19,18,0.7)';
    ctx.stroke();
  }
}

/** su damlası (sivri ucu hareket yönünün tersine): r boy */
export function damla(ctx: CanvasRenderingContext2D, r: number) {
  yol(ctx, '#a9dcf5', r * 0.18, () => {
    ctx.moveTo(0, -r * 1.6);
    ctx.bezierCurveTo(r * 0.6, -r * 0.6, r, -r * 0.1, r, r * 0.25);
    ctx.arc(0, r * 0.25, r, 0, Math.PI);
    ctx.bezierCurveTo(-r, -r * 0.1, -r * 0.6, -r * 0.6, 0, -r * 1.6);
  });
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-r * 0.35, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

/** bezelye balonu: "bezelye kadar" resmi (merkez, r) */
export function bezelyeBalonu(ctx: CanvasRenderingContext2D, r: number, g: number) {
  if (g <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, g * 1.5);
  ctx.scale(0.6 + 0.4 * g, 0.6 + 0.4 * g);
  yol(ctx, '#fffaf0', r * 0.08, () => ctx.arc(0, 0, r, 0, Math.PI * 2));
  yol(ctx, '#7cc35b', r * 0.07, () => ctx.arc(0, r * 0.05, r * 0.42, 0, Math.PI * 2));
  ctx.fillStyle = '#c7ef9f';
  ctx.beginPath();
  ctx.arc(-r * 0.14, -r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** iki basamaklı ahşap tabure: alt orta (0,0), genişlik w, yükseklik h */
export function tabure(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const c = w * 0.035;
  const AHSAP = '#d99a55', KOYU = '#b9773a';
  yol(ctx, KOYU, c, () => {
    ctx.rect(-w * 0.42, -h * 0.82, w * 0.12, h * 0.82);
    ctx.rect(w * 0.3, -h * 0.82, w * 0.12, h * 0.82);
  });
  yol(ctx, AHSAP, c, () => yuvarlakDikdortgen(ctx, -w / 2, -h, w, h * 0.2, h * 0.06));
  yol(ctx, AHSAP, c, () => yuvarlakDikdortgen(ctx, -w * 0.46, -h * 0.5, w * 0.92, h * 0.16, h * 0.05));
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(-w * 0.45, -h * 0.97, w * 0.9, h * 0.05);
}

/** dört köşeli parıltı */
export function parilti(ctx: CanvasRenderingContext2D, r: number, renk = '#fff6c8') {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const R = i % 2 ? r * 0.28 : r;
    ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * R, Math.sin(a) * R);
  }
  ctx.closePath();
  ctx.fillStyle = renk;
  ctx.fill();
  ctx.lineWidth = r * 0.12;
  ctx.strokeStyle = 'rgba(214,160,40,0.9)';
  ctx.stroke();
}

/** hayalet el (uygulamadaki minik el, src/ui/ikonlar.ts → IKON.el ile aynı çizim): işaret parmağı ucu (0,0) */
const EL = typeof Path2D !== 'undefined' ? new Path2D('M18 26V11a3 3 0 0 1 6 0v12m0-2a3 3 0 0 1 6 0v3m0-1a3 3 0 0 1 6 0v8c0 7-5 12-11 12s-9-3-12-8l-5-8a3 3 0 0 1 5-3l5 5') : null;
export function hayaletEl(ctx: CanvasRenderingContext2D, boy: number, saydam: number, bas = 0) {
  if (!EL || saydam <= 0) return;
  ctx.save();
  ctx.globalAlpha = saydam;
  const s = boy / 40;
  // parmak ucu (21, 9) noktası (0,0)'a gelsin
  ctx.scale(s * (1 - 0.06 * bas), s * (1 - 0.06 * bas));
  ctx.translate(-21, -9);
  ctx.shadowColor = 'rgba(107,58,31,0.35)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#fffaf2';
  ctx.fill(EL);
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = '#6b3a1f';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke(EL);
  ctx.restore();
  if (bas > 0) {
    ctx.save();
    ctx.globalAlpha = saydam * bas;
    ctx.beginPath();
    ctx.arc(0, 0, boy * 0.32 * (0.6 + 0.4 * bas), 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Kino'nun "Iii" ağzı (kit karesinde, kafanın içinde): geniş gülüş, üst ve alt diş sırası. dis: 12 dişin parlaklığı
 * (0 donuk krem .. 1 pırıl pırıl beyaz), sira: [üst 6, alt 6] soldan sağa. ac: 0..1 açıklık.
 */
export const DIS = {
  merkez: [712, 978] as [number, number],
  yariGen: 236,
  ustY: 930,
  altY: 1022,
  /** her diş sırası 6 diş */
  sayi: 6,
};
/** dişin (ya da sıranın) y'si gülüşün eğrisinde: uçlar yukarı kalkar */
export const gulusEgrisi = (dx: number) => -52 * Math.pow(dx / DIS.yariGen, 2);
export function disAgzi(ctx: CanvasRenderingContext2D, dis: number[], ac = 1, c = 8.5) {
  const [mx, my] = DIS.merkez;
  const w = DIS.yariGen;
  const ust = DIS.ustY - 52 * ac, alt = DIS.altY + 70 * ac;
  const sekil = () => {
    ctx.moveTo(mx - w, my - 64);
    ctx.bezierCurveTo(mx - w * 0.6, ust + 10, mx + w * 0.6, ust + 10, mx + w, my - 64);
    ctx.bezierCurveTo(mx + w * 0.92, alt - 30, mx + w * 0.4, alt, mx, alt);
    ctx.bezierCurveTo(mx - w * 0.4, alt, mx - w * 0.92, alt - 30, mx - w, my - 64);
    ctx.closePath();
  };
  yol(ctx, '#7a1f22', 0, sekil);
  ctx.save();
  ctx.beginPath();
  sekil();
  ctx.clip();
  // dil
  ctx.fillStyle = '#e9707a';
  ctx.beginPath();
  ctx.ellipse(mx, alt + 10, w * 0.5, 70 * ac + 20, 0, Math.PI, 0);
  ctx.fill();
  // dişler
  const disCiz = (i: number, ustSira: boolean) => {
    const g = dis[(ustSira ? 0 : 6) + i] ?? 0;
    const x0 = mx - w * 0.88 + (i * (w * 1.76)) / 6, x1 = x0 + (w * 1.76) / 6;
    const dx = (x0 + x1) / 2 - mx;
    const e = gulusEgrisi(dx);
    const renk = `rgb(${Math.round(236 + 19 * g)},${Math.round(226 + 27 * g)},${Math.round(196 + 55 * g)})`;
    ctx.beginPath();
    if (ustSira) yuvarlakDikdortgen(ctx, x0 + 3, my - 120 + e, x1 - x0 - 6, 120 - 6 + 4, 22);
    else yuvarlakDikdortgen(ctx, x0 + 6, my + 6 + e * 0.6, x1 - x0 - 12, 110, 22);
    ctx.fillStyle = renk;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(170,140,120,0.55)';
    ctx.stroke();
    if (g > 0.5) {
      ctx.fillStyle = `rgba(255,255,255,${(g - 0.5) * 2})`;
      ctx.beginPath();
      ctx.ellipse(x0 + (x1 - x0) * 0.32, (ustSira ? my - 60 : my + 40) + e * (ustSira ? 1 : 0.6), 7, 16, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  for (let i = 0; i < 6; i++) {
    disCiz(i, true);
    disCiz(i, false);
  }
  ctx.restore();
  ctx.beginPath();
  sekil();
  ctx.lineWidth = c;
  ctx.strokeStyle = KONTUR;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** dişin kit noktası (üst sıra 0..5, alt sıra 6..11): köpüğün izlediği yol ve parıltılar */
export function disNoktasi(i: number): [number, number] {
  const [mx, my] = DIS.merkez;
  const w = DIS.yariGen;
  const ust = i < 6;
  const j = ust ? i : i - 6;
  const x = mx - w * 0.88 + ((j + 0.5) * (w * 1.76)) / 6;
  const e = gulusEgrisi(x - mx);
  return [x, ust ? my - 58 + e : my + 58 + e * 0.6];
}

/** sabah güneşi huzmesi (dünya birimi; pencereden yatağa) */
export function gunesHuzmesi(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number], g0: number, g1: number, saydam: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  const gr = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
  gr.addColorStop(0, `rgba(255,236,170,${0.38 * saydam})`);
  gr.addColorStop(1, `rgba(255,236,170,${0.08 * saydam})`);
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.moveTo(a[0] + nx * g0, a[1] + ny * g0);
  ctx.lineTo(b[0] + nx * g1, b[1] + ny * g1);
  ctx.lineTo(b[0] - nx * g1, b[1] - ny * g1);
  ctx.lineTo(a[0] - nx * g0, a[1] - ny * g0);
  ctx.closePath();
  ctx.fill();
}

/** havlu (Kino yüzünü kurular): iki el arasında sarkan yeşil havlu, saçaklı */
export function havlu(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number], sark: number, c: number) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sark;
  yol(ctx, '#62b56a', c, () => {
    ctx.moveTo(a[0], a[1] - sark * 0.25);
    ctx.quadraticCurveTo(mx, my - sark * 0.6, b[0], b[1] - sark * 0.25);
    ctx.lineTo(b[0] + sark * 0.1, b[1] + sark * 0.7);
    ctx.quadraticCurveTo(mx, my + sark * 0.9, a[0] - sark * 0.1, a[1] + sark * 0.7);
    ctx.closePath();
  });
  ctx.strokeStyle = '#f2e7b8';
  ctx.lineWidth = c * 1.4;
  ctx.beginPath();
  ctx.moveTo(a[0] - sark * 0.05, a[1] + sark * 0.45);
  ctx.quadraticCurveTo(mx, my + sark * 0.62, b[0] + sark * 0.05, b[1] + sark * 0.45);
  ctx.stroke();
}
