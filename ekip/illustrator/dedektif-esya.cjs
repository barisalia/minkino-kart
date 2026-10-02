// Gemini dedektif çizimleri (beyaz zemin, bazıları kart karesi/gölge/çerçeve içinde) → şeffaf, kırpılmış WebP: assets/dedektif/<ad>.webp
// Yöntem: koyu veya doygun pikseller = çizim (FG0); 1 px şişirilip kenardan akıtılan "dış" bölge zemindir (kapalı iç beyazlar çizimde kalır).
// Açık gri/pembe/mavi gölgeler ve beyaz kart kareleri doygunluk ve koyuluk eşiğinin altında kaldığı için dışarıda kalır.
// Kenar halkasında beyaz, çizimin iç rengine (erozyonla bulunan) göre alfadan çıkarılır; ince çizgilerde kontur rengi (genel koyu renk) kullanılır.
// node dedektif-esya.cjs [ad ...]   (ad verilmezse hepsi). Çıktı yoksa klasör oluşturulur; tekrar çalıştırmak güvenli.
const fs = require('fs');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/dedektif/', OUT = 'assets/dedektif/';
// ayar: kes [x0,y0,x1,y1] (önce kırp: çerçeve içi), minOran (en büyük parçaya oranla bu kadarın altındaki parçalar atılır), sat (doygunluk eşiği), koyu (koyuluk eşiği), ek (kırpma payı px)
const AYAR = {
  'kart-sari-kelebek': { kes: [90, 90, 935, 935] },
  'kart-sut-kasesi': { minOran: 0.02 },
  'ipucu-sari-kanat-tozu': { minOran: 0.0002 },
  'kart-kedi-beyaz': { minOran: 0.004 },
  'kart-kedi-siyah': { minOran: 0.004 },
  'kart-kedi-turuncu': { minOran: 0.004 },
  'lamba-dik': { minOran: 0.02 },
  'pamuk-b': { minOran: 0.01 },
};
const VARSAYILAN = { minOran: 0.01, sat: 55, koyu: 170, ek: 6 };
const DOSYALAR = fs.readdirSync(G).filter((f) => /^(kart-|ipucu-|lamba-|pamuk-b)/.test(f) && f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''));

async function isle(ad) {
  const o = { ...VARSAYILAN, ...(AYAR[ad] || {}) };
  let img = s(G + ad + '.png').removeAlpha(); if (o.kes) img = img.extract({ left: o.kes[0], top: o.kes[1], width: o.kes[2] - o.kes[0], height: o.kes[3] - o.kes[1] });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  // 1) çizim (FG0) ve 1 px şişmiş hâli
  const fg0 = new Uint8Array(n); for (let i = 0; i < n; i++) { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); fg0[i] = mx - mn > o.sat || mn < o.koyu ? 1 : 0; }
  const d1 = new Uint8Array(n); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!fg0[y * W + x]) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) d1[yy * W + xx] = 1; } }
  // 2) dış bölge: kenardan akan, şişmiş çizim dışı
  const dis = new Uint8Array(n), q = new Int32Array(n); let bas = 0, son = 0;
  for (let i = 0; i < n; i++) { const x = i % W, y = (i / W) | 0; if (!d1[i] && (x === 0 || y === 0 || x === W - 1 || y === H - 1)) { dis[i] = 1; q[son++] = i; } }
  while (bas < son) { const p = q[bas++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || dis[r] || d1[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; dis[r] = 1; q[son++] = r; } }
  // 3) siluet S = dış değil; küçük parçalar at
  const S = new Uint8Array(n); for (let i = 0; i < n; i++) S[i] = dis[i] ? 0 : 1;
  const et = new Int32Array(n).fill(-1); const alanlar = []; for (let i = 0; i < n; i++) { if (!S[i] || et[i] >= 0) continue; let b = 0, e = 0; q[e++] = i; et[i] = alanlar.length; while (b < e) { const p = q[b++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || et[r] >= 0 || !S[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = alanlar.length; q[e++] = r; } } alanlar.push(e); }
  const maxA = Math.max(...alanlar); for (let i = 0; i < n; i++) if (S[i] && alanlar[et[i]] < maxA * o.minOran) S[i] = 0;
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
      if (!Cin) { if (S[i]) { out[p] = cc[0]; out[p + 1] = cc[1]; out[p + 2] = cc[2]; out[p + 3] = 255; } continue; }
      // ince çizgilerde yerel iç yok (c=0) → genel kontur rengi; yerel iç rengi çok açıksa da kontur rengine dön
      if (!c || Math.min(...Cin) > 200) Cin = KC || Cin;
      const a = []; for (let j = 0; j < 3; j++) if (255 - Cin[j] > 25) a.push(Math.max(0, Math.min(1, (255 - cc[j]) / (255 - Cin[j]))));
      let al; if (!a.length) al = S[i] ? 1 : 0; else { a.sort((u, v) => u - v); al = a[a.length >> 1]; }
      if (S[i] && al < 0.15 && Math.min(...cc) < 235) al = Math.max(al, 0.15);
      if (!S[i] && al < 0.04) continue; if (al > 0.97) al = 1;
      const kul = al >= 0.995 ? cc : Cin; out[p] = Math.round(kul[0]); out[p + 1] = Math.round(kul[1]); out[p + 2] = Math.round(kul[2]); out[p + 3] = Math.round(al * 255); }
    else continue;
    if (out[p + 3] > 8) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); } }
  const x0 = Math.max(0, minx - o.ek), y0 = Math.max(0, miny - o.ek), x1 = Math.min(W - 1, maxx + o.ek), y1 = Math.min(H - 1, maxy + o.ek);
  fs.mkdirSync(OUT, { recursive: true });
  const webp = await s(out, { raw: { width: W, height: H, channels: 4 } }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  fs.writeFileSync(OUT + ad + '.webp', webp);
  return `${ad}: ${x1 - x0 + 1}x${y1 - y0 + 1}, ${Math.round(webp.length / 1024)} KB, parça ${alanlar.length}${KC ? '' : ', kontur yok'}`;
}
(async () => { const liste = process.argv.length > 2 ? process.argv.slice(2) : DOSYALAR; for (const ad of liste) console.log(await isle(ad)); })();
