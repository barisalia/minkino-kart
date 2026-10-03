// Dedektif poz ekleri (minkino-film-gemini/dedektif: kino-kayma, kino-utanc, mino-rahat, pamuk-surunme, pamuk-ozur, pamuk-el-salla) → şeffaf assets/dedektif/poz-<ad>.webp.
// kino-kayma: Kino halının üstünde kayıyor; halı silinir (Kino'nun dolgusu ve konturu kalır). Yöntem: Kino dolgusu tohumlardan (gövde, iki pati tabanı) koyu kontur engeline kadar yayılır;
// kontur pikselleri yalnız Kino dolgusuna 13 px içinde ise Kino'nundur (halının kendi konturu ve püskülleri uzakta kalır, silinir). Sonra genel kesme (gemini-esya.cjs).
// node poz-isle.cjs   (tekrar çalıştırmak güvenli; mevcut daha büyük dosyanın üstüne yazılmaz)
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const yaz = require('./guvenli-yaz.cjs');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/dedektif', ARA = path.join(os.tmpdir(), 'minkino-poz'), GIRDI = path.join(ARA, 'girdi'), CIKTI = path.join(ARA, 'cikti');
const ADLAR = ['kino-kayma', 'kino-utanc', 'mino-rahat', 'pamuk-surunme', 'pamuk-ozur', 'pamuk-el-salla'].filter((a) => fs.existsSync(`${G}/${a}.png`));

async function halisiz(ad) { // kino-kayma
  const { data, info } = await s(`${G}/${ad}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H, k = W / 1216;
  const luma = (i) => (data[i * 3] * 3 + data[i * 3 + 1] * 6 + data[i * 3 + 2]) / 10;
  const koyu = new Uint8Array(n); for (let i = 0; i < n; i++) koyu[i] = luma(i) < 55 ? 1 : 0;   // yalnız gerçek kontur (kahverengi leke/kulak luma ~80, dolgu sayılır)
  const q = new Int32Array(n);
  const yay = (tohumlar, izin) => { const m = new Uint8Array(n); let b = 0, e = 0; for (const i of tohumlar) if (i >= 0 && izin(i) && !m[i]) { m[i] = 1; q[e++] = i; }
    while (b < e) { const p = q[b++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || m[r] || !izin(r)) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; m[r] = 1; q[e++] = r; } } return m; };
  // 1) arka plan: kenardan akan beyaz
  const kenar = []; for (let x = 0; x < W; x++) { kenar.push(x, (H - 1) * W + x); } for (let y = 0; y < H; y++) { kenar.push(y * W, y * W + W - 1); }
  const bg = yay(kenar, (i) => Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) > 232);
  // 2) halı dolgusu: halı içindeki tohumlardan, koyu kontur engeline kadar (Kino'nun pati konturları da engel); yalnız halı yüksekliğinde (y > 975)
  const ypat = Math.round(975 * k), tohum = [[200, 1090], [720, 1090], [480, 1100], [160, 1060], [840, 1050]].map(([x, y]) => Math.round(y * k) * W + Math.round(x * k));
  const hali = yay(tohum, (i) => !koyu[i] && !bg[i] && ((i / W) | 0) >= ypat);
  // 3) Kino dolgusu = koyu olmayan, arka plan olmayan, halı dolgusu olmayan her şey (kafa, kulak, gövde, patiler ayrı kapalı bölgeler olduğundan tohumsuz)
  const K = new Uint8Array(n); for (let i = 0; i < n; i++) K[i] = !koyu[i] && !bg[i] && !hali[i] ? 1 : 0;
  // 3b) ince kalıntılar (halı konturunun yumuşak kenar pikselleri) Kino dolgusu sayılmasın: 2 px aşındır, küçük bileşenleri at, 3 px geri büyüt
  { const E = new Uint8Array(n); for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const i = y * W + x; if (!K[i]) continue; let ok = 1; for (let dy = -2; dy <= 2 && ok; dy++) for (let dx = -2; dx <= 2; dx++) if (!K[i + dy * W + dx]) { ok = 0; break; } E[i] = ok; }
    const et = new Int32Array(n).fill(-1), alan = []; for (let i = 0; i < n; i++) { if (!E[i] || et[i] >= 0) continue; let bb = 0, ee = 0; q[ee++] = i; et[i] = alan.length; while (bb < ee) { const pp = q[bb++], x = pp % W; for (const d of [-1, 1, -W, W]) { const r = pp + d; if (r < 0 || r >= n || et[r] >= 0 || !E[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = alan.length; q[ee++] = r; } } alan.push(ee); }
    const T = new Uint8Array(n); for (let i = 0; i < n; i++) if (E[i] && alan[et[i]] >= 1500) T[i] = 1;
    const Y = new Uint8Array(n); for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) { const i = y * W + x; if (!K[i]) continue; let v = 0; for (let dy = -3; dy <= 3 && !v; dy++) for (let dx = -3; dx <= 3; dx++) if (T[i + dy * W + dx]) { v = 1; break; } Y[i] = v; }
    for (let i = 0; i < n; i++) K[i] = Y[i]; }
  // 4) kontur: Kino dolgusuna R px içindeki koyu pikseller Kino'nundur; kalanlar (halı konturu, püsküller) silinir
  const R = Math.round(13 * k), uz = new Int16Array(n).fill(99); let b = 0, e = 0; for (let i = 0; i < n; i++) if (K[i]) { uz[i] = 0; q[e++] = i; }
  while (b < e) { const p = q[b++], x = p % W; if (uz[p] >= R) continue; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || uz[r] <= uz[p] + 1) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; if (!koyu[r] && !K[r]) continue; uz[r] = uz[p] + 1; q[e++] = r; } }
  // 5) kapalı delikler (göz bebeği gibi koyu çekirdekler) Kino'nundur: silüetin dışına (kenara) bağlanmayan her şey tutulur
  const M = new Uint8Array(n); for (let i = 0; i < n; i++) M[i] = K[i] || (koyu[i] && uz[i] <= R) ? 1 : 0;
  { const kenar2 = []; for (let x = 0; x < W; x++) { kenar2.push(x, (H - 1) * W + x); } for (let y = 0; y < H; y++) { kenar2.push(y * W, y * W + W - 1); }
    const dis = yay(kenar2, (i) => !M[i]); for (let i = 0; i < n; i++) if (!M[i] && !dis[i]) M[i] = 1; }
  const cik = Buffer.alloc(n * 3, 255); let silinen = 0;
  for (let i = 0; i < n; i++) { const tut = M[i]; if (tut) { cik[i * 3] = data[i * 3]; cik[i * 3 + 1] = data[i * 3 + 1]; cik[i * 3 + 2] = data[i * 3 + 2]; } else if (!bg[i]) silinen++; }
  console.log(ad + ': halı/püskül piksel silindi ' + silinen);
  await s(cik, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(GIRDI, ad + '.png'));
}

(async () => {
  fs.mkdirSync(GIRDI, { recursive: true }); fs.mkdirSync(CIKTI, { recursive: true });
  for (const a of ADLAR) { if (a === 'kino-kayma') await halisiz(a); else fs.copyFileSync(`${G}/${a}.png`, path.join(GIRDI, a + '.png')); }
  if (!ADLAR.length) return;
  execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', GIRDI, '--cikti', CIKTI, '--max', '0', '--ayar', JSON.stringify({ 'pamuk-ozur': { minOran: 0.00005 } }), ...ADLAR], { stdio: 'inherit' });
  for (const a of ADLAR) { const buf = fs.readFileSync(path.join(CIKTI, a + '.webp')); if (await yaz(`assets/dedektif/poz-${a}.webp`, buf)) console.log(`poz-${a}.webp yazıldı`); }
})();
