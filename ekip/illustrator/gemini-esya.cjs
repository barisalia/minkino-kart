// Gemini beyaz zeminli eşya çizimleri → şeffaf, kırpılmış WebP (genel sürüm; dedektif-esya.cjs'in yöntemi).
// node gemini-esya.cjs --girdi <klasör> --cikti <klasör> [--desen <regex>] [--esit <regex>] [--arka <regex>] [--max 1024] [--ayar '{"ad":{"koyu":205,"sat":40,"minOran":0.02,"kes":[x0,y0,x1,y1]}}'] [ad ...]
//  --esit  : eşleşen dosyalar (örn. ^kurabiye) aynı tuvale ortalanır, ölçek korunur (Gemini'nin ölçeği); tuval = grubun en büyük kutusu.
//  --esit-hiza orta|alt : ortak tuvalde dikey hizalama (varsayılan orta; cupcake gibi aynı tabanlı aşamalar için alt: tabanlar hizalanır, yatayda ortalanır).
//  --arka  : eşleşen dosyalar kesilmez, arka plan olarak webp'e çevrilir (uzun kenar --arka-max, varsayılan 2048).
//  --arka-onek : arka plan çıktı adına eklenen önek (varsayılan 'arka-': tezgah-uzak-1 → arka-tezgah-uzak-1.webp).
//  --max   : kesilmiş eşyanın uzun kenarı bu değeri aşarsa küçültülür (varsayılan 1024; 0 = küçültme yok).
// Dosya başına ayar: delik (içi boş nesne: kapalı saf beyaz bölgeler şeffaf olur; delikMin px), kenarKapali (görüntü kenarına değen nesne), tohum [[x,y]] (zemin yalnız bu noktalardan akar), tuvalKoru (kırpma yok, tam tuval; arka planla üst üste binen katmanlar için), minOran, sat, koyu, kes.
// Yöntem: koyu veya doygun pikseller = çizim, 1 px şişirilip kenardan akıtılan dış bölge zemin; kapalı iç beyazlar (tabak, süt, tüy) kalır; kenar halesi iç renge göre alfadan çıkarılır.
// Beyaz/açık nesnelerde (tabak, kâse) çizgi açık griyse --ayar ile koyu eşiği yükseltin (örn. "koyu":205).
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const arg = (ad, v) => { const i = process.argv.indexOf('--' + ad); return i >= 0 ? process.argv[i + 1] : v; };
const GIRDI = arg('girdi'), CIKTI = arg('cikti'), DESEN = new RegExp(arg('desen', '.'), 'i'), ESIT = arg('esit') ? new RegExp(arg('esit'), 'i') : null, ARKA = arg('arka') ? new RegExp(arg('arka'), 'i') : null;
const ARKA_ONEK = arg('arka-onek', 'arka-'), ESIT_HIZA = arg('esit-hiza', 'orta');
const MAX = +arg('max', 1024), ARKA_MAX = +arg('arka-max', 2048), AYAR = JSON.parse(arg('ayar', '{}'));
const VARSAYILAN = { minOran: 0.01, sat: 55, koyu: 170, ek: 6 };
async function kes(dosya, ad, o) {
  let img = s(dosya).removeAlpha(); if (o.kes) img = img.extract({ left: o.kes[0], top: o.kes[1], width: o.kes[2] - o.kes[0], height: o.kes[3] - o.kes[1] });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  // 1) çizim (FG0) ve 1 px şişmiş hâli
  const fg0 = new Uint8Array(n); for (let i = 0; i < n; i++) { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); fg0[i] = mx - mn > o.sat || mn < o.koyu ? 1 : 0; }
  if (o.kenarKapali) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) fg0[y * W + x] = 1;   // görüntü kenarına değen nesne (tezgâh önü): kenar duvar sayılır, zemin tohumlardan akar
  const d1 = new Uint8Array(n); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!fg0[y * W + x]) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) d1[yy * W + xx] = 1; } }
  // 2) dış bölge: kenardan akan, şişmiş çizim dışı
  const dis = new Uint8Array(n), q = new Int32Array(n); let bas = 0, son = 0;
  if (o.tohum) { for (const [sx, sy] of o.tohum) { const i = sy * W + sx; if (!d1[i] && !dis[i]) { dis[i] = 1; q[son++] = i; } } }
  else for (let i = 0; i < n; i++) { const x = i % W, y = (i / W) | 0; if (!d1[i] && (x === 0 || y === 0 || x === W - 1 || y === H - 1)) { dis[i] = 1; q[son++] = i; } }
  while (bas < son) { const p = q[bas++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || dis[r] || d1[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; dis[r] = 1; q[son++] = r; } }
  // 3) siluet S = dış değil; küçük parçalar at
  const S = new Uint8Array(n); for (let i = 0; i < n; i++) S[i] = dis[i] ? 0 : 1;
  const et = new Int32Array(n).fill(-1); const alanlar = []; for (let i = 0; i < n; i++) { if (!S[i] || et[i] >= 0) continue; let b = 0, e = 0; q[e++] = i; et[i] = alanlar.length; while (b < e) { const p = q[b++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || et[r] >= 0 || !S[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = alanlar.length; q[e++] = r; } } alanlar.push(e); }
  const maxA = Math.max(...alanlar); for (let i = 0; i < n; i++) if (S[i] && alanlar[et[i]] < maxA * o.minOran) S[i] = 0;
  if (o.delik) { // içi boş nesneler (kalıp, halka): kapalı ve saf beyaz (min kanal > 243) bölgeler ≥ delikMin px ise zemin sayılır (sütün/porselen gibi krem/gri içler etkilenmez)
    const bi = new Uint8Array(n); for (let i = 0; i < n; i++) bi[i] = S[i] && Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) > 243 ? 1 : 0;
    const e2 = new Uint8Array(n); for (let i = 0; i < n; i++) { if (!bi[i] || e2[i]) continue; let b2 = 0, s2 = 0; q[s2++] = i; e2[i] = 1; const uye = [i];
      while (b2 < s2) { const pp = q[b2++], x = pp % W; for (const d of [-1, 1, -W, W]) { const r = pp + d; if (r < 0 || r >= n || e2[r] || !bi[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; e2[r] = 1; q[s2++] = r; uye.push(r); } }
      if (uye.length >= (o.delikMin || 600)) for (const pp of uye) S[pp] = 0; } }
  // 4) iç (3 px erozyon) ve genel koyu kontur rengi
  const ic = new Uint8Array(n); for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) { if (!S[y * W + x]) continue; let tam = 1; for (let dy = -3; dy <= 3 && tam; dy++) for (let dx = -3; dx <= 3; dx++) if (!S[(y + dy) * W + x + dx]) { tam = 0; break; } ic[y * W + x] = tam; }
  let kr = 0, kg = 0, kb = 0, kn = 0; for (let i = 0; i < n; i++) if (S[i] && !ic[i] && Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) < 100) { kr += data[i * 3]; kg += data[i * 3 + 1]; kb += data[i * 3 + 2]; kn++; }
  const KC = kn ? [kr / kn, kg / kn, kb / kn] : null;
  // 5) alfa ve renk: S içindeki iç bölge tam; kenar halkası (S içi 3 px + S dışı 2 px) beyazdan ayrıştırılır
  const near = (x, y, r, fn) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && fn(yy * W + xx)) return true; } return false; };
  const out = Buffer.alloc(n * 4); let minx = W, miny = H, maxx = 0, maxy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, p = i * 4;
    if (S[i] && ic[i]) { out[p] = data[i * 3]; out[p + 1] = data[i * 3 + 1]; out[p + 2] = data[i * 3 + 2]; out[p + 3] = 255; }
    else if (S[i] || near(x, y, 2, (j) => S[j])) {
      // yerel iç renk: 6 px içindeki ic piksellerin ortalaması
      let sr = 0, sg = 0, sb = 0, c = 0; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (ic[j]) { sr += data[j * 3]; sg += data[j * 3 + 1]; sb += data[j * 3 + 2]; c++; } }
      let Cin = c ? [sr / c, sg / c, sb / c] : KC; const cc = px(i);
      if (!S[i] || near(x, y, 2, (j) => !S[j])) { // dış halka: alfa ve renk, 5 px içindeki en koyu çizim pikselinden (kontur rengi; açık/koyu kontur fark etmez), yerel iç renkten değil
        let best = null, bs = 1e9; for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (!S[j]) continue; const sm = data[j * 3] + data[j * 3 + 1] + data[j * 3 + 2]; if (sm < bs) { bs = sm; best = [data[j * 3], data[j * 3 + 1], data[j * 3 + 2]]; } }
        if (best && Math.min(...best) > 200 && KC) best = KC; if (best) Cin = best; }
      if (!Cin) { if (S[i]) { out[p] = cc[0]; out[p + 1] = cc[1]; out[p + 2] = cc[2]; out[p + 3] = 255; } continue; }
      // ince çizgilerde yerel iç yok (c=0) → genel kontur rengi; yerel iç rengi çok açıksa da kontur rengine dön
      if (!c || Math.min(...Cin) > 200) Cin = KC || Cin;
      const a = []; for (let j = 0; j < 3; j++) if (255 - Cin[j] > 25) a.push(Math.max(0, Math.min(1, (255 - cc[j]) / (255 - Cin[j]))));
      let al; if (!a.length) al = S[i] ? 1 : 0; else { a.sort((u, v) => u - v); al = a[a.length >> 1]; }
      if (S[i] && al < 0.15 && Math.min(...cc) < 235) al = Math.max(al, 0.15);
      if (!S[i] && al < 0.2) continue; if (al > 0.97) al = 1;
      const kul = al >= 0.995 ? cc : Cin; out[p] = Math.round(kul[0]); out[p + 1] = Math.round(kul[1]); out[p + 2] = Math.round(kul[2]); out[p + 3] = Math.round(al * 255); }
    else continue;
    if (out[p + 3] > 8) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); } }
  const x0 = Math.max(0, minx - o.ek), y0 = Math.max(0, miny - o.ek), x1 = Math.min(W - 1, maxx + o.ek), y1 = Math.min(H - 1, maxy + o.ek);
  return { out, W, H, kutu: [x0, y0, x1, y1], parca: alanlar.length, kontur: !!KC };
}

(async () => {
  if (!GIRDI || !CIKTI) { console.log('kullanım: node gemini-esya.cjs --girdi <klasör> --cikti <klasör> [seçenekler] [ad ...]'); process.exit(1); }
  fs.mkdirSync(CIKTI, { recursive: true });
  const bayrakDegerleri = new Set(['--girdi', '--cikti', '--desen', '--esit', '--arka', '--max', '--arka-max', '--arka-onek', '--esit-hiza', '--ayar']);
  const adlar = process.argv.slice(2).filter((x, i, d) => !x.startsWith('--') && !bayrakDegerleri.has(d[i - 1]));
  let dosyalar = fs.readdirSync(GIRDI).filter((f) => /.(png|jpe?g|webp)$/i.test(f) && DESEN.test(f)).sort();
  if (adlar.length) dosyalar = dosyalar.filter((f) => adlar.includes(f.replace(/.[^.]+$/, '')));
  const esitGrup = [];
  for (const f of dosyalar) {
    const ad = f.replace(/.[^.]+$/, '');
    if (ARKA && ARKA.test(ad)) {
      const m = await s(path.join(GIRDI, f)).metadata(); const k = Math.min(1, ARKA_MAX / Math.max(m.width, m.height));
      const buf = await s(path.join(GIRDI, f)).removeAlpha().resize(Math.round(m.width * k), Math.round(m.height * k), { kernel: 'lanczos3' }).webp({ quality: 90, effort: 5 }).toBuffer();
      const cad = ad.startsWith(ARKA_ONEK) ? ad : ARKA_ONEK + ad; fs.writeFileSync(path.join(CIKTI, cad + '.webp'), buf); console.log(cad + ': arka plan', Math.round(m.width * k) + 'x' + Math.round(m.height * k), Math.round(buf.length / 1024) + ' KB'); continue;
    }
    const o = { ...VARSAYILAN, ...(AYAR[ad] || {}) };
    const r = await kes(path.join(GIRDI, f), ad, o);
    const [x0, y0, x1, y1] = o.tuvalKoru ? [0, 0, r.W - 1, r.H - 1] : r.kutu, w = x1 - x0 + 1, h = y1 - y0 + 1;
    const kirp = await s(r.out, { raw: { width: r.W, height: r.H, channels: 4 } }).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer();
    if (ESIT && ESIT.test(ad)) { esitGrup.push({ ad, kirp, w, h, parca: r.parca }); continue; }
    await yaz(ad, kirp, w, h, r.parca, r.kontur);
  }
  if (esitGrup.length) { // aynı tuval: en büyük genişlik ve yükseklik, ortalanmış; sonra tek ölçekle (gerekirse) küçültme
    const TW = Math.max(...esitGrup.map((e) => e.w)), TH = Math.max(...esitGrup.map((e) => e.h)); const olc = MAX && Math.max(TW, TH) > MAX ? MAX / Math.max(TW, TH) : 1;
    for (const e of esitGrup) {
      const tuval = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: e.kirp, left: Math.round((TW - e.w) / 2), top: ESIT_HIZA === 'alt' ? TH - e.h : Math.round((TH - e.h) / 2) }]).png().toBuffer();
      const son = olc < 1 ? await s(tuval).resize(Math.round(TW * olc), Math.round(TH * olc), { kernel: 'lanczos3' }).png().toBuffer() : tuval;
      const buf = await s(son).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer(); fs.writeFileSync(path.join(CIKTI, e.ad + '.webp'), buf);
      console.log(e.ad + ': ortak tuval ' + Math.round(TW * olc) + 'x' + Math.round(TH * olc) + ' (kendi ' + e.w + 'x' + e.h + '), ' + Math.round(buf.length / 1024) + ' KB');
    }
  }
})();
async function yaz(ad, kirp, w, h, parca, kontur) {
  const olc = MAX && Math.max(w, h) > MAX ? MAX / Math.max(w, h) : 1;
  const son = olc < 1 ? await s(kirp).resize(Math.round(w * olc), Math.round(h * olc), { kernel: 'lanczos3' }).png().toBuffer() : kirp;
  const buf = await s(son).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer(); fs.writeFileSync(path.join(CIKTI, ad + '.webp'), buf);
  console.log(ad + ': ' + Math.round(w * olc) + 'x' + Math.round(h * olc) + ', ' + Math.round(buf.length / 1024) + ' KB, parça ' + parca + (kontur ? '' : ', kontur yok'));
}
