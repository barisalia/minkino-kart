// Müşteri hayvanlarına (önden iskelet: ayı, inek, maymun, tavşan, kuş, ördek, köpek) üç yüz ifadesi: mutlu, saskin, uzgun.
// Hepsi gizli katman; src/karakter/karakter.ts → ifadeSetleri() adlarından tanır (goz-mutlu → goz-sol/goz-sag gizlenir,
// agiz-saskin → agiz gizlenir, gaga-alt-mutlu → gaga-alt gizlenir, kas-saskin → kas gizlenir). Gemini yok: her yüz
// hayvanın KENDİ çiziminden kurulur, böylece kontur kalınlığı ve rengi aynı kalır:
//   goz-mutlu   : hayvanın kendi kapalı göz çizgisi (goz-kapali) ters çevrilir → ^ ^ (biraz yukarıda)
//   goz-saskin  : kendi açık gözleri, her biri kendi ortasından ~%20 büyük (iri, yuvarlak)
//   goz-uzgun   : kendi gözleri; üst kısım ten rengi göz kapağıyla örtülür, kapak dış köşeye doğru düşer (raster, gözün
//                 kendi kontur rengiyle; kapak yalnız gözün içinde kalır)
//   kas-saskin  : kaşı olanlarda (ayı, köpek) kaş yukarı kalkar; kas-uzgun (ayı): iç uçlar kalkar
//   agiz-mutlu  : kendi açık gülüşü (pazar-agiz.cjs → agiz-orta), agiz-saskin: kendi "o" ağzı (agiz-yuvarlak),
//   agiz-uzgun  : ters kavis (hayvanın ağız rengi / kalınlığı)
//   gagalılar   : gaga-alt-mutlu (alt gaga açık, iç görünür), gaga-alt-saskin (az açık)
// Köpeğin mevcut üzgün yüzü (goz-uzgun, kas-uzgun, agiz-uzgun, düşük kulaklar) korunur.
// Tekrar çalıştırmak güvenli (aynı adlı katmanlar silinip yeniden yazılır). teslim.ps1 / pazar-agiz.cjs SVG'yi yeniden
// yazarsa SONRA bu betik çalıştırılır.
//   node ekip/illustrator/hayvan-ifade.cjs <ad> <svg> <json...>
//   (hepsi:) for a in ayi inek maymun tavsan kus ordek kopek; do node ekip/illustrator/hayvan-ifade.cjs $a assets/karakter-iskelet/$a.svg assets/karakter-iskelet/$a.json; done
const fs = require('fs');
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const [kim, svgYol, ...jsonlar] = process.argv.slice(2);
const f = (n) => Math.round(n * 10) / 10;

// ağız ölçüleri ve renkleri pazar-agiz.cjs'teki ölçümlerle aynı (her hayvanın kendi ağzından)
const AGIZ = {
  kopek: { stil: 'yay', L: [893, 950], R: [1163, 957], Cc: [1028, 1017], sw: 14, C: '#101010' },
  inek: { stil: 'yay', L: [888, 856], R: [1165, 836], Cc: [1022, 893], sw: 15, C: '#401010' },
  maymun: { stil: 'yay', L: [762, 800], R: [1092, 722], Cc: [925, 818], sw: 9, C: '#4a2510' },
  tavsan: { stil: 'omega', cx: 1025, y0: 1059, W: 112, D: 62, sw: 8, C: '#502020', filtrum: 24 },
  ayi: { stil: 'omega', cx: 1057, y0: 1012, W: 160, D: 80, sw: 12, C: '#501010', filtrum: 30 },
};
// hayvana özel: mutlu gözün yukarı kayması (göz boyunun oranı), şaşkın büyütme, üzgün kapak rengi yerine kontur rengi,
// mutlu ağız hangi konuşma ağzından (orta: dilli açık gülüş, dis: dişli gülüş)
const AYAR = {
  ayi: { mutluY: -0.05, saskin: 1.16, mutluAgiz: 'agiz-orta', mutluAgizS: 1.12 },
  inek: { mutluY: -0.12, saskin: 1.22, mutluAgiz: 'agiz-orta', mutluAgizS: 1, hale: '#9a9a9a' },
  maymun: { mutluY: -0.08, saskin: 1.14, mutluAgiz: 'agiz-orta', mutluAgizS: 1 },
  tavsan: { mutluY: -0.12, saskin: 1.16, mutluAgiz: 'agiz-orta', mutluAgizS: 1.05 },
  kus: { mutluY: -0.1, saskin: 1.14, gagaMutlu: 0.5, gagaSaskin: 0.35 },
  ordek: { mutluY: -0.08, saskin: 1.12, gagaMutlu: 0.9, gagaSaskin: 0.6 },
  kopek: { mutluY: -0.08, saskin: 1.16, mutluAgiz: 'agiz-orta', mutluAgizS: 1.05, uzgunVar: true },
}[kim];
if (!AYAR) throw new Error('bilinmeyen hayvan: ' + kim);

let t = fs.readFileSync(svgYol, 'utf8');
function grup(metin, g) {
  const bas = metin.indexOf(`<g id="${g}"`);
  if (bas < 0) return null;
  const ic = metin.indexOf('>', bas) + 1;
  let der = 1;
  const re = /<g\b[^>]*?(\/?)>|<\/g>/g;
  re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) {
    if (m[0] === '</g>') der--;
    else if (!m[1]) der++;
    if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 };
  }
  return null;
}
const icerik = (g) => {
  const r = grup(t, g);
  return r ? t.slice(r.ic, r.son).trim() : '';
};
const IMG = /<image x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)" xlink:href="data:image\/(\w+);base64,([^"]+)"/;
const kutu = (g) => {
  const m = icerik(g).match(IMG);
  return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4], tur: m[5], b64: m[6] } : null;
};
const disPay = (k) => ({ cx: k.x + k.w / 2, cy: k.y + k.h / 2 });
const etrafinda = (cx, cy, s, ic) => `<g transform="translate(${f(cx)},${f(cy)}) scale(${s}) translate(${f(-cx)},${f(-cy)})">${ic}</g>`;

/** Gözün kendi pikselleri: en koyu kontur rengi ve gözün çevresindeki ten (kafadan, göz yokken) */
async function gozResmi(k) {
  const { data, info } = await sharp(Buffer.from(k.b64, 'base64')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
}
/** Kafa (ya da kuşta gövde) resminde bir noktanın rengi */
async function tenRengi(noktalar) {
  const kaynak = kutu('kafa') ?? kutu('govde');
  const { data, info } = await sharp(Buffer.from(kaynak.b64, 'base64')).resize(Math.round(kaynak.w), Math.round(kaynak.h), { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const top = [0, 0, 0];
  let n = 0;
  for (const [x, y] of noktalar) {
    const px = Math.round(x - kaynak.x), py = Math.round(y - kaynak.y);
    if (px < 0 || py < 0 || px >= info.width || py >= info.height) continue;
    const i = (py * info.width + px) * 4;
    if (data[i + 3] < 200) continue;
    for (let c = 0; c < 3; c++) top[c] += data[i + c];
    n++;
  }
  return top.map((v) => Math.round(v / Math.max(1, n)));
}
const hex = (r) => '#' + r.map((v) => v.toString(16).padStart(2, '0')).join('');
const koyu = (r, k = 0.55) => r.map((v) => Math.round(v * k));

/**
 * Üzgün göz (raster): gözün üst kısmı ten rengiyle örtülür (yalnız gözün kendi pikselleri), kapak çizgisi iç köşede
 * yüksek, dış köşede alçak; çizgi gözün kontur rengiyle. yon: -1 sol göz (dış = sol), +1 sağ göz (dış = sağ).
 */
async function uzgunGoz(k, yon, ten, kontur, sw) {
  const { data, W, H } = await gozResmi(k);
  const olc = W / k.w; // kaynak piksel / çizim birimi
  const icY = 0.24 * H, disY = 0.62 * H; // kapak çizgisi (iç köşe yukarıda)
  const cizgiY = (x) => {
    const u = yon < 0 ? 1 - x / W : x / W; // 0 iç, 1 dış
    return icY + (disY - icY) * u + Math.sin(u * Math.PI) * 0.03 * H;
  };
  const out = Buffer.from(data);
  const kal = Math.max(2, sw * olc * 0.5);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (out[i + 3] === 0) continue;
      const cy = cizgiY(x);
      if (y < cy - kal) {
        out[i] = ten[0]; out[i + 1] = ten[1]; out[i + 2] = ten[2];
      } else if (y <= cy + kal) {
        out[i] = kontur[0]; out[i + 1] = kontur[1]; out[i + 2] = kontur[2];
      }
    }
  const png = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ lossless: true }).toBuffer();
  return `<image x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" xlink:href="data:image/webp;base64,${png.toString('base64')}"/>`;
}

/** Gözün en koyu (kontur) rengi: alfa tam, parlaklığı en düşük %3'lük piksellerin ortalaması */
async function konturRengi(k) {
  const { data, W, H } = await gozResmi(k);
  const p = [];
  for (let i = 0; i < W * H; i++) if (data[i * 4 + 3] > 240) p.push([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]);
  p.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const al = p.slice(0, Math.max(1, Math.round(p.length * 0.03)));
  return [0, 1, 2].map((c) => Math.round(al.reduce((s, q) => s + q[c], 0) / al.length));
}

(async () => {
  const E = {};
  const pivot = {};
  const gs = kutu('goz-sol'), gg = kutu('goz-sag'), gk = kutu('goz-kapali');
  const gozH = (gs.h + gg.h) / 2;
  const P = AGIZ[kim];
  const sw = P?.sw ?? 12;

  // ---- mutlu gözler: kendi kapalı göz çizgisi ters (^ ^)
  {
    const cy = gk.y + gk.h / 2, dy = AYAR.mutluY * gozH;
    const ters = `<g transform="translate(0,${f(2 * cy + dy)}) scale(1,-1)">${icerik('goz-kapali')}</g>`;
    // inek: göz koyu leke üstünde; çizgi açık bir hale ile okunur
    const hale = AYAR.hale
      ? `<g transform="translate(0,${f(2 * cy + dy)}) scale(1,-1)"><g style="filter:url(#hf-${kim})">${icerik('goz-kapali')}</g></g>`
      : '';
    const filtre = AYAR.hale
      ? `<filter id="hf-${kim}" x="-10%" y="-40%" width="120%" height="180%"><feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d"/><feFlood flood-color="${AYAR.hale}"/><feComposite in2="d" operator="in"/></filter>`
      : '';
    E['goz-mutlu'] = (filtre ? `<defs>${filtre}</defs>` : '') + hale + ters;
    pivot['goz-mutlu'] = [f(gk.x + gk.w / 2), f(cy + dy)];
  }
  // ---- şaşkın gözler: kendi gözleri, kendi ortalarından büyür
  {
    const s = AYAR.saskin;
    const a = disPay(gs), b = disPay(gg);
    E['goz-saskin'] = etrafinda(a.cx, a.cy, s, icerik('goz-sol')) + etrafinda(b.cx, b.cy, s, icerik('goz-sag'));
    pivot['goz-saskin'] = [f((a.cx + b.cx) / 2), f((a.cy + b.cy) / 2)];
  }
  // ---- üzgün gözler (köpekte zaten var)
  if (!AYAR.uzgunVar) {
    const tenSol = await tenRengi([[gs.x - 12, gs.y + gs.h * 0.3], [gs.x + gs.w + 12, gs.y + gs.h * 0.3], [gs.x + gs.w / 2, gs.y - 14]]);
    const tenSag = await tenRengi([[gg.x - 12, gg.y + gg.h * 0.3], [gg.x + gg.w + 12, gg.y + gg.h * 0.3], [gg.x + gg.w / 2, gg.y - 14]]);
    const kSol = await konturRengi(gs), kSag = await konturRengi(gg);
    // inek: koyu leke üstünde kapak çizgisi açık gri (yoksa görünmez)
    const kc = (k, ten) => (AYAR.hale ? [150, 150, 150] : ten[0] + ten[1] + ten[2] < 200 ? [150, 150, 150] : k);
    E['goz-uzgun'] = (await uzgunGoz(gs, -1, tenSol, kc(kSol, tenSol), sw)) + (await uzgunGoz(gg, 1, tenSag, kc(kSag, tenSag), sw));
    pivot['goz-uzgun'] = [f((gs.x + gg.x + gg.w) / 2), f(gs.y + gs.h / 2)];
    console.log(kim, 'ten', hex(tenSol), hex(tenSag), 'kontur', hex(kSol));
  }
  // ---- kaşlar (ayı, köpek: 'kas' katmanı)
  const kas = kutu('kas');
  if (kas) {
    E['kas-saskin'] = `<g transform="translate(0,${f(-0.16 * gozH)})">${icerik('kas')}</g>`;
    pivot['kas-saskin'] = [f(kas.x + kas.w / 2), f(kas.y + kas.h / 2)];
    if (!AYAR.uzgunVar) {
      // iki yarı, iç uçlar yukarı (can-uzgun.cjs gibi)
      const orta = kas.x + kas.w / 2;
      const yar = (id, x0, x1, mx, aci) =>
        `<clipPath id="${id}"><rect x="${f(x0)}" y="${f(kas.y - 80)}" width="${f(x1 - x0)}" height="${f(kas.h + 160)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(0,-10) rotate(${aci} ${f(mx)} ${f(kas.y + kas.h / 2)})">${icerik('kas')}</g></g>`;
      E['kas-uzgun'] = yar(`hu-${kim}-l`, kas.x - 40, orta, kas.x + kas.w * 0.25, -22) + yar(`hu-${kim}-r`, orta, kas.x + kas.w + 40, kas.x + kas.w * 0.75, 22);
      pivot['kas-uzgun'] = pivot['kas-saskin'];
    }
  }
  // ---- ağızlar
  if (P) {
    const ag = icerik(AYAR.mutluAgiz);
    const yu = icerik('agiz-yuvarlak');
    const [ax, ay] = JSON.parse(fs.readFileSync(jsonlar[0], 'utf8').replace(/^﻿/, '')).donme.agiz;
    E['agiz-mutlu'] = AYAR.mutluAgizS !== 1 ? etrafinda(ax, ay, AYAR.mutluAgizS, ag) : ag;
    E['agiz-saskin'] = yu;
    const cz = (d, w = sw) => `<path d="${d}" fill="none" stroke="${P.C}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (!AYAR.uzgunVar) {
      if (P.stil === 'yay') {
        const w = P.R[0] - P.L[0];
        const mx = P.Cc[0], my = (P.L[1] + P.R[1]) / 2 * 0.4 + P.Cc[1] * 0.6;
        const yw = w * 0.3, d = w * 0.09;
        E['agiz-uzgun'] = cz(`M${f(mx - yw)},${f(my + d)} Q${f(mx)},${f(my - d * 1.3)} ${f(mx + yw)},${f(my + d)}`, sw * 1.1);
      } else {
        const { cx, y0, W, D, filtrum } = P;
        const yw = W * 0.62, alt = y0 + D * 0.5;
        E['agiz-uzgun'] = cz(`M${cx},${f(y0 - filtrum)} L${cx},${f(y0 + D * 0.12)}`, sw * 0.9) + cz(`M${f(cx - yw)},${f(alt)} Q${cx},${f(y0 - D * 0.2)} ${f(cx + yw)},${f(alt)}`, sw * 1.1);
      }
    }
    for (const id of ['agiz-mutlu', 'agiz-saskin', 'agiz-uzgun']) if (E[id]) pivot[id] = [ax, ay];
  }
  // ---- gagalılar: alt gaga aşağı iner, iç (gaga-ic) görünür
  const ga = kutu('gaga-alt');
  if (ga && AYAR.gagaMutlu) {
    // konuşmadaki açılışın aynısı (karakter.ts: menteşe çevresinde boy 1+0.12a, aşağı 34a)
    const mn = JSON.parse(fs.readFileSync(jsonlar[0], 'utf8').replace(/^﻿/, '')).donme['gaga-alt'] ?? [ga.x + ga.w / 2, ga.y];
    const ac = (a) => `<g transform="translate(${mn[0]},${f(mn[1] + 34 * a)}) scale(1,${f(1 + 0.12 * a)}) translate(${-mn[0]},${-mn[1]})">${icerik('gaga-alt')}</g>`;
    E['gaga-alt-mutlu'] = ac(AYAR.gagaMutlu);
    E['gaga-alt-saskin'] = ac(AYAR.gagaSaskin);
    pivot['gaga-alt-mutlu'] = pivot['gaga-alt-saskin'] = [f(ga.x + ga.w / 2), f(ga.y)];
  }

  // ---- SVG'ye yaz (önceki kopyalar silinir)
  const idler = Object.keys(E);
  for (const id of idler) {
    const r = grup(t, id);
    if (r) t = t.slice(0, t.lastIndexOf('\n', r.bas)) + t.slice(r.bitis);
  }
  const son = t.lastIndexOf('</svg>');
  t = t.slice(0, son) + idler.map((id) => `  <g id="${id}" display="none">\n    ${E[id]}\n  </g>\n`).join('') + t.slice(son);
  fs.writeFileSync(svgYol, t);

  // ---- JSON: sıra (tabanın hemen arkasına), gizli, bağlı, dönme noktası
  const taban = (id) => (id.startsWith('goz-') ? 'goz-kapali' : id.startsWith('kas-') ? 'kas' : id.startsWith('gaga-alt-') ? 'gaga-alt' : 'agiz-gulumse');
  for (const y of jsonlar) {
    if (!fs.existsSync(y)) continue;
    const j = JSON.parse(fs.readFileSync(y, 'utf8').replace(/^﻿/, ''));
    j.sira = j.sira.filter((s) => !idler.includes(s));
    for (const id of idler) {
      let tb = taban(id);
      if (!j.sira.includes(tb)) tb = tb === 'agiz-gulumse' ? 'agiz' : tb;
      // aynı tabana eklenenler sırayla
      let i = j.sira.indexOf(tb);
      while (i + 1 < j.sira.length && idler.includes(j.sira[i + 1])) i++;
      j.sira.splice(i + 1, 0, id);
    }
    j.gizli = [...new Set([...(j.gizli || []), ...idler])];
    for (const id of idler) {
      const tb = id.startsWith('gaga-alt-') ? 'gaga-alt' : id.startsWith('kas-') ? 'kas' : id.startsWith('goz-') ? 'goz-sol' : 'agiz';
      const b = j.bagli[tb] ?? j.bagli['goz-sol'] ?? (j.sira.includes('kafa') ? 'kafa' : null);
      if (b) j.bagli[id] = b;
      j.donme[id] = pivot[id];
    }
    fs.writeFileSync(y, JSON.stringify(j, null, 2) + '\n');
  }
  console.log(kim, 'ok:', idler.join(', '));
})();
