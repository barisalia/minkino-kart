// Görsel netleştirme yardımcısı (Recraft crisp_upscale sonrası).
// Kullanım (NODE_PATH ana repo node_modules'a bakmalı):
//   node scripts/kalite/netlestir.mjs hazirla <varlik.webp> <cikti.png>
//       Şeffaf katmanda rengi kenardan dışarı taşırır (hale olmasın), uzakta nötr griye düzler; yükleme PNG'si yazar.
//   node scripts/kalite/netlestir.mjs bitir <eski.webp> <buyuk.png> <yeni.webp> [ref.png|-] [uzunKenar]
//       Büyütülmüş resmi eskinin TAM oranına getirir (uzun kenar en çok 4096), renk ortalamasını eskiye uydurur,
//       ref (hazirla çıktısı) verilirse yerel renk aktarımı yapar (düşük frekanslı renk asıldan),
//       şeffafsa alfa = eski alfanın lanczos3 büyütülmüşü + hafif seviye eğrisi; webp q86 yazar.
//   node scripts/kalite/netlestir.mjs karsilastir <eski.webp> <yeni.webp> <cikti.png> [x y w h (0-1 oran)]
//       Önce/sonra kırpması (2x gösterim). Şeffafsa koyu ve açık zeminde iki satır.
import { createRequire } from 'node:module';
import path from 'node:path';

// worktree'de node_modules yoksa NODE_PATH (ana repo) kullanılır
const gerek = createRequire(path.join(process.env.NODE_PATH || process.cwd(), 'x.js'));
let sharp;
try { sharp = createRequire(import.meta.url)('sharp'); } catch { sharp = gerek('./sharp'); }

const [, , komut, ...a] = process.argv;

async function ham(girdi) {
  const { data, info } = await sharp(girdi).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

async function hazirla(girdi, cikti) {
  const m = await sharp(girdi).metadata();
  if (!m.hasAlpha) {
    await sharp(girdi).png().toFile(cikti);
    return;
  }
  const { data, w, h } = await ham(girdi);
  const n = w * h;
  // 1) dış kenar bandı: saydam (<32) piksele 2 px'ten yakın olanlar. Bu banttaki yarı saydam pikseller çoğu kez
  //    beyazımsı zemin artığıdır; tohum sayılmaz (yoksa büyütücü kenarda açık renkli ince çizgi uydurur).
  let yakin = new Uint8Array(n);
  for (let i = 0; i < n; i++) yakin[i] = data[i * 4 + 3] < 32 ? 1 : 0;
  for (let t = 0; t < 2; t++) {
    const s = new Uint8Array(yakin);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (yakin[i]) continue;
      if ((x > 0 && yakin[i - 1]) || (x < w - 1 && yakin[i + 1]) || (y > 0 && yakin[i - w]) || (y < h - 1 && yakin[i + w])) s[i] = 1;
    }
    yakin = s;
  }
  // 2) tohumlar: tam opak ya da (görünür ve kenar bandında değil: gölge vb.) pikseller kendi rengini korur
  const renk = new Float32Array(n * 3);
  let dolu = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const al = data[i * 4 + 3];
    if (al >= 250 || (al >= 96 && !yakin[i])) {
      dolu[i] = 1;
      renk[i * 3] = data[i * 4]; renk[i * 3 + 1] = data[i * 4 + 1]; renk[i * 3 + 2] = data[i * 4 + 2];
    }
  }
  // 3) dalga cephesi: boş pikseller dolu komşularının ortalamasını alır (kontur rengi dışarı düzgün taşar)
  for (let tur = 0; tur < 32; tur++) {
    const yeni = new Uint8Array(dolu);
    let degisti = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (dolu[i]) continue;
      let r = 0, g = 0, b = 0, say = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= w) continue;
          const j = yy * w + xx;
          if (dolu[j]) { r += renk[j * 3]; g += renk[j * 3 + 1]; b += renk[j * 3 + 2]; say++; }
        }
      }
      if (say) { renk[i * 3] = r / say; renk[i * 3 + 1] = g / say; renk[i * 3 + 2] = b / say; yeni[i] = 1; degisti++; }
    }
    dolu = yeni;
    if (!degisti) break;
  }
  // 4) uzak kalan yerler: dolu alanın bulanık ortalaması, o da yoksa nötr gri
  const pre = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    if (!dolu[i]) continue;
    pre[i * 4] = renk[i * 3]; pre[i * 4 + 1] = renk[i * 3 + 1]; pre[i * 4 + 2] = renk[i * 3 + 2]; pre[i * 4 + 3] = 255;
  }
  const bul = await sharp(pre, { raw: { width: w, height: h, channels: 4 } }).blur(40).raw().toBuffer();
  const out = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) {
    if (dolu[i]) { out[i * 3] = renk[i * 3]; out[i * 3 + 1] = renk[i * 3 + 1]; out[i * 3 + 2] = renk[i * 3 + 2]; }
    else if (bul[i * 4 + 3] > 8) { out[i * 3] = bul[i * 4]; out[i * 3 + 1] = bul[i * 4 + 1]; out[i * 3 + 2] = bul[i * 4 + 2]; }
    else { out[i * 3] = 128; out[i * 3 + 1] = 128; out[i * 3 + 2] = 128; }
  }
  await sharp(out, { raw: { width: w, height: h, channels: 3 } }).png().toFile(cikti);
}

function hedefBoyut(w0, h0, uw, uh, uzun) {
  const r = w0 / h0;
  const sinir = Math.min(uzun || 4096, 4096);
  let W, H;
  if (w0 >= h0) {
    W = Math.min(sinir, uw);
    H = Math.round(W / r);
  } else {
    H = Math.min(sinir, uh);
    W = Math.round(H * r);
  }
  return { W, H };
}

async function ortalama(buf, w, h, maske) {
  const s = [0, 0, 0];
  let say = 0;
  for (let i = 0; i < w * h; i++) {
    if (maske && maske[i * 4 + 3] < 250) continue;
    s[0] += buf[i * 4]; s[1] += buf[i * 4 + 1]; s[2] += buf[i * 4 + 2];
    say++;
  }
  return s.map((v) => v / Math.max(1, say));
}

async function bitir(eski, buyuk, yeni, uzun, ref) {
  const m0 = await sharp(eski).metadata();
  const m1 = await sharp(buyuk).metadata();
  const { W, H } = hedefBoyut(m0.width, m0.height, m1.width, m1.height, uzun ? Number(uzun) : 0);
  const oranFark = Math.abs(m1.width / m1.height - m0.width / m0.height) / (m0.width / m0.height);
  if (oranFark > 0.01) throw new Error(`oran farki cok: ${(oranFark * 100).toFixed(2)}%`);
  let rgb = await sharp(buyuk).removeAlpha().resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer();
  // renk eşleme: eski ile yeninin küçültülmüşünü kıyasla (opak pikseller)
  const e = await ham(eski);
  const yk = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .resize(e.w, e.h, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
  const me = await ortalama(e.data, e.w, e.h, m0.hasAlpha ? e.data : null);
  const my = await ortalama(yk, e.w, e.h, m0.hasAlpha ? e.data : null);
  const kazanc = me.map((v, i) => v / Math.max(1, my[i]));
  const sapma = Math.max(...kazanc.map((k) => Math.abs(k - 1)));
  if (sapma > 0.006) {
    rgb = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
      .linear(kazanc, [0, 0, 0]).raw().toBuffer();
  }
  if (ref) {
    // yerel renk aktarımı: ince ayrıntı büyütülmüşten, düşük frekanslı renk asıldan (büyütücü dolguları açıyor,
    // konturları koyulaştırıyor; ortalama tutsa da resim "soluk" görünüyor). yeni = büyük + bul(asıl) - bul(büyük)
    const s = Math.max(1.2, 1.5 * (W / m0.width));
    const refB = await sharp(ref).removeAlpha().resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).blur(s).raw().toBuffer();
    const upB = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).blur(s).raw().toBuffer();
    const out = Buffer.alloc(rgb.length);
    for (let i = 0; i < rgb.length; i++) {
      const v = rgb[i] + refB[i] - upB[i];
      out[i] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
    rgb = out;
  }
  let son = sharp(rgb, { raw: { width: W, height: H, channels: 3 } });
  if (m0.hasAlpha) {
    // alfa: asıl alfanın lanczos3 büyütülmüşü; asıldaki 1 px'lik noktalı kenar kırıntıları büyüyünce kesik çizgi
    // gibi görünmesin diye hafifçe yumuşatılır, sonra seviye eğrisiyle (merkez 128, kontur yeri değişmez) netleşir
    // Yumuşak gölgesi olan katmanda (kenardan uzak yarı saydam alan) gölge silinmesin: yalnız hafif eğri.
    const a0 = await sharp(eski).extractChannel(3).raw().toBuffer();
    let icOrta = 0;
    const w0 = m0.width;
    for (let i = 0; i < a0.length; i++) {
      if (a0[i] <= 30 || a0[i] > 250) continue;
      let uc = false;
      for (const d of [-3, 3, -3 * w0, 3 * w0]) {
        const j = i + d;
        if (j >= 0 && j < a0.length && (a0[j] < 10 || a0[j] > 245)) { uc = true; break; }
      }
      if (!uc) icOrta++;
    }
    const yumusak = icOrta / a0.length > 0.002;
    const olcekA = W / m0.width;
    const duz = await sharp(eski).extractChannel(3).resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer();
    const yum = await sharp(duz, { raw: { width: W, height: H, channels: 1 } })
      .blur(Math.max(0.5, 0.45 * olcekA)).raw().toBuffer();
    // sert kenar = yakınında hem tam saydam hem tam opak piksel olan yer; eğri yalnız orada uygulanır
    // (yumuşak gölgelerin içi olduğu gibi kalır)
    const pencere = Math.max(3, Math.round(olcekA * 2) | 1);
    // libvips morfolojisi ikili resimle çalışır: saydam ve opak maskeleri ayrı ayrı genişletilir
    const ikili = (kosul) => { const b = Buffer.alloc(duz.length); for (let i = 0; i < duz.length; i++) b[i] = kosul(duz[i]) ? 255 : 0; return b; };
    // Not: sharp 0.35 dilate() tek kanallı raw girdide boş (3 kanallı, hep 0) döndürüyor; o yüzden JS ile yapılır
    const genislet = async (b) => {
      const r = pencere >> 1, t = new Uint8Array(b.length), o = new Uint8Array(b.length);
      for (let y = 0; y < H; y++) {
        let son = -1e9;
        for (let x = 0; x < W; x++) { if (b[y * W + x]) son = x; t[y * W + x] = x - son <= r ? 1 : 0; }
        son = 1e9;
        for (let x = W - 1; x >= 0; x--) { if (b[y * W + x]) son = x; if (son - x <= r) t[y * W + x] = 1; }
      }
      for (let x = 0; x < W; x++) {
        let son = -1e9;
        for (let y = 0; y < H; y++) { if (t[y * W + x]) son = y; o[y * W + x] = y - son <= r ? 1 : 0; }
        son = 1e9;
        for (let y = H - 1; y >= 0; y--) { if (t[y * W + x]) son = y; if (son - y <= r) o[y * W + x] = 1; }
      }
      return o;
    };
    const yakinSaydam = await genislet(ikili((v) => v < 10));
    const yakinOpak = await genislet(ikili((v) => v > 245));
    const alfa0 = Buffer.alloc(duz.length);
    for (let i = 0; i < duz.length; i++) {
      if (yakinSaydam[i] && yakinOpak[i]) {
        const v = (yum[i] - 128) * 2 + 128;
        alfa0[i] = v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
      } else alfa0[i] = duz[i];
    }
    if (yumusak) console.log('  (yumusak golgeli katman: golge ici korunur)');
    if (ref) {
      // yarı saydam kenar bandında büyütücünün uydurduğu açık renkli ince çizgi (çınlama) görünmesin:
      // bantta renk, asıl (taşırılmış kontur rengi) resmin düz büyütülmüşünden alınır
      const refU = await sharp(ref).removeAlpha().resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer();
      const r2 = Buffer.from(rgb);
      for (let i = 0; i < alfa0.length; i++) {
        const a = alfa0[i];
        if (a >= 250) continue;
        const t = a / 250; // 0: tamamen asıl renk, 1: büyütülmüş
        for (let c = 0; c < 3; c++) r2[i * 3 + c] = Math.round(rgb[i * 3 + c] * t * t + refU[i * 3 + c] * (1 - t * t));
      }
      son = sharp(r2, { raw: { width: W, height: H, channels: 3 } });
    }
    son = son.joinChannel(alfa0, { raw: { width: W, height: H, channels: 1 } });
  }
  await son.webp({ quality: 86, alphaQuality: 100, effort: 6 }).toFile(yeni);
  console.log(`${eski} ${m0.width}x${m0.height} -> ${W}x${H} kazanc=${kazanc.map((k) => k.toFixed(3)).join(',')}${sapma > 0.006 ? ' (duzeltildi)' : ''}`);
}

async function karsilastir(eski, yeni, cikti, x = 0.35, y = 0.35, cw = 0.3, ch = 0.3) {
  const m0 = await sharp(eski).metadata();
  const m1 = await sharp(yeni).metadata();
  const kx = Math.round(Number(x) * m1.width), ky = Math.round(Number(y) * m1.height);
  let kw = Math.round(Number(cw) * m1.width), kh = Math.round(Number(ch) * m1.height);
  // gösterim: en çok 900 px genişlik/panel
  const olcek = Math.min(1, 900 / kw, 700 / kh);
  const pw = Math.round(kw * olcek), ph = Math.round(kh * olcek);
  const yeniK = await sharp(yeni).extract({ left: kx, top: ky, width: kw, height: kh }).resize(pw, ph).png().toBuffer();
  const sx = m0.width / m1.width;
  const eskiK = await sharp(eski).extract({
    left: Math.round(kx * sx), top: Math.round(ky * sx),
    width: Math.max(1, Math.round(kw * sx)), height: Math.max(1, Math.round(kh * sx)),
  }).resize(pw, ph, { kernel: 'cubic', fit: 'fill' }).png().toBuffer();
  const zeminler = m0.hasAlpha ? [{ r: 40, g: 34, b: 48 }, { r: 250, g: 248, b: 240 }] : [null];
  const bosluk = 12;
  const tuvalW = pw * 2 + bosluk * 3, tuvalH = (ph + bosluk) * zeminler.length + bosluk;
  const parcalar = [];
  zeminler.forEach((z, i) => {
    const top = bosluk + i * (ph + bosluk);
    for (const [j, img] of [eskiK, yeniK].entries()) {
      const left = bosluk + j * (pw + bosluk);
      if (z) parcalar.push({ input: { create: { width: pw, height: ph, channels: 4, background: { ...z, alpha: 1 } } }, left, top });
      parcalar.push({ input: img, left, top });
    }
  });
  await sharp({ create: { width: tuvalW, height: tuvalH, channels: 4, background: { r: 128, g: 128, b: 128, alpha: 1 } } })
    .composite(parcalar).png().toFile(cikti);
  console.log('yazildi', cikti, `(${m0.width}x${m0.height} -> ${m1.width}x${m1.height})`);
}

if (komut === 'hazirla') await hazirla(a[0], a[1]);
else if (komut === 'bitir') await bitir(a[0], a[1], a[2], a[4], a[3] && a[3] !== '-' ? a[3] : null);
else if (komut === 'karsilastir') await karsilastir(...a);
else console.log('komut: hazirla | bitir | karsilastir');
