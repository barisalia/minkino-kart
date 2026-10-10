/**
 * Kesme kukla kiti üretici (Kino ailesi: Anne, Baba, Lokum). Yöntem Kino kitiyle aynı
 * (ekip/karakter/kino-yeni/kit-kur.cjs): her parçanın çizgisi dolgularının altına 17 px koyu fırçayla çizilir
 * (görünen çizgi 8.5 px, Kino ile birebir); kollar ve bacaklar iki geçişli çizilir (dolgu katmanı: eklem çizgisi yok).
 *
 * Ölçek: bütün aile Kino'nun karesiyle AYNI birimde çizilir (1 birim her kitte aynı boy). Sahnede hepsi aynı
 * ölçekle basılınca boylar tablodaki gibi çıkar (assets/karakter/aile-boy.json), çizgi kalınlığı da aynı kalır.
 *
 * uret({ ad, W, H, zemin, parcalar, sira, kumeler, yuvaVarsayilan, cikti, onizleme, aciklama, kur, yuzKutu })
 *   parcalar: [{ ad, katman, pivot, ust, sinir?, kume?, yuva? }]
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CIZGI = 17;
const OL = 'rgb(64,19,18)';

function svgIcerik(p, onek) {
  const klip = new Map();
  const kid = (k) => {
    if (!k) return '';
    const key = k.join('|');
    if (!klip.has(key)) klip.set(key, `${onek}-k${klip.size}`);
    return ` clip-path="url(#${klip.get(key)})"`;
  };
  const kalem = `fill="${OL}" stroke="${OL}" stroke-width="${CIZGI}" stroke-linejoin="round" stroke-linecap="round"`;
  const iz = (e) => (e.iz ? ` stroke="${e.f}" stroke-width="${e.iz}" stroke-linejoin="round"` : '');
  const sirali = [...p.katman.filter((e) => e.alt), ...p.katman.filter((e) => !e.alt)];
  const bloklar = [];
  for (const e of sirali) {
    const anahtar = `${!!e.alt}|${e.k ? e.k.join('|') : ''}`;
    const son = bloklar[bloklar.length - 1];
    if (son && son.anahtar === anahtar) son.e.push(e);
    else bloklar.push({ anahtar, k: e.k, e: [e] });
  }
  let tam = '', yalniz = '';
  for (const bl of bloklar) {
    const cz = bl.e.filter((e) => e.c).map((e) => (e.kc ? `<g${kid(e.kc)}><path d="${e.d}"/></g>` : `<path d="${e.d}"/>`)).join('');
    const dl = bl.e.map((e) => `<path d="${e.d}" fill="${e.f}"${iz(e)}/>`).join('');
    tam += `<g${kid(bl.k)}>${cz ? `<g ${kalem}>${cz}</g>` : ''}${dl}</g>`;
    yalniz += `<g${kid(bl.k)}>${dl}</g>`;
  }
  const tumu = 'M-9000 -9000H9000V9000H-9000Z';
  const defs = [...klip.entries()]
    .map(([key, id]) => {
      const yol = (d) => (d.startsWith('!') ? `<path clip-rule="evenodd" d="${tumu}${d.slice(1)}"/>` : d.startsWith('~') ? `<path clip-rule="evenodd" d="${d.slice(1)}"/>` : `<path d="${d}"/>`);
      return `<clipPath id="${id}">${key.split('|').map(yol).join('')}</clipPath>`;
    })
    .join('');
  return { defs: defs ? `<defs>${defs}</defs>` : '', cizgi: `<g>${tam}</g>`, yalniz: `<g>${yalniz}</g>` };
}
const svgSar = (vb, ic, olcek = 1) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb.join(' ')}" width="${Math.round(vb[2] * olcek)}" height="${Math.round(vb[3] * olcek)}">${ic}</svg>`;

async function rgba(svg) {
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
function kutuBul({ data, w, h }, esik = 2) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > esik) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1];
}
function uzaklik(maske, w, h) {
  const INF = 1e12, M = Math.max(w, h), f = new Float64Array(M), d = new Float64Array(M), v = new Int32Array(M), z = new Float64Array(M + 1);
  const out = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = maske[i] ? 0 : INF;
  const tek = (n) => {
    let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  };
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = out[y * w + x]; tek(h); for (let y = 0; y < h; y++) out[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = out[y * w + x]; tek(w); for (let x = 0; x < w; x++) out[y * w + x] = d[x]; }
  return out;
}
/** Dolgu katmanı: dış çizgisiz, iç çizgiler duruyor (Kino kitindeki dolguYap) */
function dolguYap(tam, yalniz, w, h, r = 7) {
  const n = w * h, m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = yalniz[i * 4 + 3] > 127 ? 1 : 0;
  const d1 = uzaklik(m, w, h);
  const genis = new Uint8Array(n);
  for (let i = 0; i < n; i++) genis[i] = d1[i] <= r * r ? 0 : 1;
  const d2 = uzaklik(genis, w, h);
  const out = Buffer.from(yalniz);
  const ic = (r + 1.5) * (r + 1.5);
  for (let i = 0; i < n; i++) {
    if (d2[i] > ic && yalniz[i * 4 + 3] < 250) { out[i * 4] = tam[i * 4]; out[i * 4 + 1] = tam[i * 4 + 1]; out[i * 4 + 2] = tam[i * 4 + 2]; out[i * 4 + 3] = tam[i * 4 + 3]; }
  }
  return out;
}

async function uret(o) {
  const { ad, W, H, zemin, parcalar, sira, kumeler, yuvaVarsayilan, cikti, onizleme } = o;
  fs.mkdirSync(cikti, { recursive: true });
  fs.mkdirSync(onizleme, { recursive: true });
  const yalnizParca = process.env.PARCA ? process.env.PARCA.split(',') : null;
  const bilgi = {};
  const ic = {};
  for (const p of parcalar) {
    const i = svgIcerik(p, p.ad);
    ic[p.ad] = i;
    if (yalnizParca && !yalnizParca.includes(p.ad)) continue;
    const kaba = await rgba(svgSar([0, 0, W, H], i.defs + i.cizgi, 0.25));
    const k = kutuBul(kaba);
    if (!k) throw new Error(`boş parça: ${p.ad}`);
    if (k[0] === 0 || k[1] === 0 || k[2] >= kaba.w || k[3] >= kaba.h) console.warn(`UYARI: ${p.ad} karenin kenarına değiyor`);
    const vb = [Math.max(0, k[0] * 4 - 8), Math.max(0, k[1] * 4 - 8), 0, 0];
    vb[2] = Math.min(W, k[2] * 4 + 8) - vb[0];
    vb[3] = Math.min(H, k[3] * 4 + 8) - vb[1];
    const svg = svgSar(vb, i.defs + i.cizgi);
    fs.writeFileSync(path.join(cikti, `${p.ad}.svg`), svg);
    const tam = await rgba(svg);
    await sharp(tam.data, { raw: { width: tam.w, height: tam.h, channels: 4 } }).webp({ lossless: true, effort: 5 }).toFile(path.join(cikti, `${p.ad}.webp`));
    const b = { resim: `${p.ad}.webp`, kutu: vb, pivot: p.pivot, ust: p.ust };
    if (p.sinir) b.sinir = p.sinir;
    if (p.yuva) b.yuva = p.yuva;
    if (p.kume) {
      const yalniz = await rgba(svgSar(vb, i.defs + i.yalniz));
      const dol = dolguYap(tam.data, yalniz.data, tam.w, tam.h);
      await sharp(dol, { raw: { width: tam.w, height: tam.h, channels: 4 } }).webp({ lossless: true, effort: 5 }).toFile(path.join(cikti, `${p.ad}.dolgu.webp`));
      b.kume = p.kume;
      b.dolgu = `${p.ad}.dolgu.webp`;
    }
    bilgi[p.ad] = b;
    console.log(p.ad.padEnd(18), vb.join(','));
  }
  if (yalnizParca) {
    // yalnız önizleme: eski json'daki kutular korunur
    const eski = JSON.parse(fs.readFileSync(path.join(cikti, `${ad}.json`), 'utf8'));
    for (const p of parcalar) if (!bilgi[p.ad]) bilgi[p.ad] = eski.parcalar[p.ad];
  }

  const siraDuz = [];
  for (const s of sira) {
    if (typeof s === 'string') {
      const varyant = parcalar.filter((p) => p.yuva === s).map((p) => p.ad);
      siraDuz.push(...(varyant.length ? varyant : [s]));
    } else siraDuz.push(...kumeler[s.kume]);
  }
  const yuvalar = {};
  for (const p of parcalar) if (p.yuva) (yuvalar[p.yuva] ??= { varsayilan: yuvaVarsayilan[p.yuva], secenekler: [] }).secenekler.push(p.ad);
  const gizli = parcalar.filter((p) => (p.yuva && yuvaVarsayilan[p.yuva] !== p.ad) || p.gizli).map((p) => p.ad);

  // ---------- dinlenme duruşu (iki geçişli) ----------
  let govde = '';
  for (const s of sira) {
    if (typeof s === 'string') {
      if (yuvalar[s]) { const i = ic[yuvaVarsayilan[s]]; govde += i.defs + i.cizgi; continue; }
      if (gizli.includes(s)) continue;
      govde += ic[s].defs + ic[s].cizgi;
    } else {
      for (const a of kumeler[s.kume]) govde += ic[a].defs + ic[a].cizgi;
      for (const a of kumeler[s.kume]) {
        const b = bilgi[a];
        const veri = (await sharp(path.join(cikti, b.dolgu)).png().toBuffer()).toString('base64');
        govde += `<image x="${b.kutu[0]}" y="${b.kutu[1]}" width="${b.kutu[2]}" height="${b.kutu[3]}" xlink:href="data:image/png;base64,${veri}"/>`;
      }
    }
  }
  // figürün tepesi (boy ölçümü: tepe → zemin)
  const olc = await rgba(svgSar([0, 0, W, H], govde, 0.5));
  const kt = kutuBul(olc, 60);
  const tepe = kt[1] * 2;
  const iskelet = {
    ad,
    aciklama: o.aciklama,
    kur: o.kur,
    boyut: [W, H],
    zemin,
    tepe,
    birim: 'Kino C (kino-yeni) ile aynı birim: aynı ölçekle basılınca boylar assets/karakter/aile-boy.json tablosundaki gibi',
    cizgi: { renk: '#401312', kalinlik: CIZGI / 2 },
    parcalar: bilgi,
    cizim: sira.map((s) => (typeof s === 'string' ? (yuvalar[s] ? { yuva: s } : s) : { kume: s.kume, parcalar: kumeler[s.kume] })),
    yuvalar,
    sira: siraDuz,
    gizli,
    bagli: Object.fromEntries(parcalar.filter((p) => p.ust).map((p) => [p.ad, p.ust])),
    donme: Object.fromEntries(parcalar.map((p) => [p.ad, p.pivot])),
  };
  fs.writeFileSync(path.join(cikti, `${ad}.json`), JSON.stringify(iskelet, null, 1));
  const zeminRenk = '<rect width="100%" height="100%" fill="rgb(252,251,249)"/>';
  const cizgiZ = `<line x1="0" x2="${W}" y1="${zemin}" y2="${zemin}" stroke="#7ab" stroke-width="4"/><line x1="0" x2="${W}" y1="${tepe}" y2="${tepe}" stroke="#7ab" stroke-width="4"/>`;
  await sharp(Buffer.from(svgSar([0, 0, W, H], `<rect width="${W}" height="${H}" fill="rgb(252,251,249)"/>${cizgiZ}${govde}`))).resize({ height: 1400 }).png().toFile(path.join(onizleme, 'dinlenme.png'));
  // tam çözünürlük (yakın inceleme için, depoya girmez): TAM=1
  if (process.env.TAM) await sharp(Buffer.from(svgSar([0, 0, W, H], `<rect width="${W}" height="${H}" fill="rgb(252,251,249)"/>${govde}`))).png().toFile(path.join(onizleme, 'dinlenme-tam.png'));
  console.log(`tepe ${tepe}, zemin ${zemin}, boy ${zemin - tepe}`);

  // ---------- yüz seti sayfası ----------
  if (o.yuzKutu && o.yuzParcalar) {
    const tamIc = (a) => ic[a].defs + ic[a].cizgi;
    const karolar = [];
    for (const yuva of Object.keys(yuvaVarsayilan)) {
      for (const sec of yuvalar[yuva].secenekler) {
        const s = { ...yuvaVarsayilan, [yuva]: sec };
        const icerik = zeminRenk + o.yuzParcalar(s).map(tamIc).join('');
        const olcek = 330 / o.yuzKutu[2];
        karolar.push({ ad: sec, png: await sharp(Buffer.from(svgSar(o.yuzKutu, icerik, olcek))).png().toBuffer(), w: Math.round(o.yuzKutu[2] * olcek), h: Math.round(o.yuzKutu[3] * olcek) });
      }
    }
    const KWd = karolar[0].w, KH = karolar[0].h + 30, SUT = 6;
    const parcaGorsel = [];
    for (let i = 0; i < karolar.length; i++) {
      const x = (i % SUT) * KWd, y = Math.floor(i / SUT) * KH;
      parcaGorsel.push({ input: karolar[i].png, left: x, top: y });
      parcaGorsel.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${KWd}" height="30"><text x="${KWd / 2}" y="20" font-size="18" font-family="sans-serif" text-anchor="middle" fill="#401312">${karolar[i].ad}</text></svg>`), left: x, top: y + KH - 30 });
    }
    await sharp({ create: { width: KWd * SUT, height: KH * Math.ceil(karolar.length / SUT), channels: 3, background: '#ffffff' } }).composite(parcaGorsel).png().toFile(path.join(onizleme, 'yuz-setleri.png'));
  }
  return iskelet;
}

module.exports = { uret, svgIcerik, svgSar, rgba, kutuBul, CIZGI };
