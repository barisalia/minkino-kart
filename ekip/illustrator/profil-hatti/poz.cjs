// node poz.cjs <svg> <json> <out.png> "<pozlar>" [viewBox="x y w h"] [px yükseklik=900] [bg=#ffffff]
// pozlar: "dinlenme" | "evre-1" | "evre-3" | "ad:katman=aci;katman=aci;goster=a,b;gizle=c" ayraç '|' ile birden çok poz yan yana.
// Hazır pozlar: dinlenme, evre-1 (bacak-on -25, bacak-arka 25, kol-on 20), evre-3 (ters), evre-2/4 (yarım), kulak.
const fs = require('fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const [svgYol, jsonYol, out, pozlar = 'dinlenme', vb = '600 380 800 1580', H = '900', bg = '#ffffff'] = process.argv.slice(2);
const svg = fs.readFileSync(svgYol, 'utf8'), j = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
const HAZIR = {
  dinlenme: '', 'evre-1': 'bacak-on=-25;bacak-arka=25;kol-on=20;kol-arka=-20;kuyruk=8;kafa=-2', 'evre-2': 'bacak-on=-12;bacak-arka=12;kol-on=10;kol-arka=-10', 'evre-3': 'bacak-on=25;bacak-arka=-25;kol-on=-20;kol-arka=20;kuyruk=-8;kafa=2', 'evre-4': 'bacak-on=12;bacak-arka=-12;kol-on=-10;kol-arka=10',
  kulak: 'kulak-on=-12;kulak-arka=12;kafa=-4', kulak2: 'kulak-on=14;kulak-arka=-14;kafa=3', kuyruk: 'kuyruk=-18', 'goz-kapali': 'kafa=4;gizle=goz;goster=goz-kapali', 'agiz-acik': 'goster=agiz-acik;gizle=agiz',
};
const katmanlar = {}; // id -> iç svg
for (const id of j.sira) { const b = svg.indexOf(`<g id="${id}"`); if (b < 0) continue; const ic = svg.indexOf('>', b) + 1; katmanlar[id] = svg.slice(ic, svg.indexOf('</g>', ic)); }
function poz(tanim) {
  const ac = {}; let goster = [], gizle = [];
  for (const p of tanim.split(';')) { if (!p) continue; const [k, v] = p.split('='); if (k === 'goster') goster = v.split(','); else if (k === 'gizle') gizle = v.split(','); else ac[k] = +v; }
  const gizli = new Set((j.gizli || []).filter((x) => !goster.includes(x)).concat(gizle));
  let s = '';
  for (const id of j.sira) { if (!katmanlar[id] || gizli.has(id)) continue; const d = j.donme[id] || [0, 0]; const zincir = []; let c = id; while (c) { zincir.push(c); c = j.bagli && j.bagli[c]; }
    // en dıştaki ebeveyn önce: transform = rot(ebeveyn) rot(...) rot(kendi)
    let tf = ''; for (const z of zincir.reverse()) { const a = ac[z]; if (a) { const q = j.donme[z] || [0, 0]; tf += ` rotate(${a} ${q[0]} ${q[1]})`; } }
    s += `<g transform="${tf.trim()}">${katmanlar[id]}</g>`; }
  return s;
}
(async () => {
  const liste = pozlar.split('|').map((x) => x.trim()), [vx, vy, vw, vh] = vb.split(' ').map(Number), ph = +H, pw = Math.round(ph * vw / vh);
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: pw * liste.length, height: ph } });
  let html = `<body style="margin:0;background:${bg};display:flex">`;
  for (const l of liste) { const tanim = l in HAZIR ? HAZIR[l] : (l.includes(':') ? l.split(':').slice(1).join(':') : l); const ad = l.includes(':') ? l.split(':')[0] : l;
    html += `<div style="position:relative"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${pw}" height="${ph}" viewBox="${vb}">${poz(tanim)}</svg><div style="position:absolute;left:6px;top:4px;font:bold 14px Arial;color:#c00">${ad}</div></div>`; }
  await p.setContent(html); await p.waitForTimeout(1200); await p.screenshot({ path: out }); await b.close();
})();
