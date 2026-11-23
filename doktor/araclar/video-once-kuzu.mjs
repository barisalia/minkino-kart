// "Önce Kuzu" sahnesini gerçek kipte (test kipi değil), gerçek sesle ve insan hızında parmak hareketleriyle çeker; sonra
// videodan kare çıkarır. Video, sahnenin bütün çizimleri çözüldükten sonraki ilk kareden başlar.
//
//   node doktor/araclar/video-once-kuzu.mjs <çıktı klasörü> <en>x<boy> <ad> [adres] [yaş]
//   örnek: node doktor/araclar/video-once-kuzu.mjs output/doktor/once-kuzu 1024x768 ipad-yatay http://localhost:5183/ 5+
//
// Önce kendi geliştirme sunucunu aç (adres onun kökü). Ağır test kilidi: output/AGIR-TEST.txt (varsa bekle).
// Çıktı: <ad>.mp4 (sesli), <ad>-kareler/kare-NNN.jpg (yarım saniyede bir, tam boy), <ad>-tabaka-N.jpg (12'şer kare).
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const req = createRequire(import.meta.url);
const { chromium } = req('@playwright/test');
const ffmpeg = req('ffmpeg-static');
const sharp = req('sharp');

const [cikti, boyut, ad, adres = 'http://localhost:5183/', yas = '5+'] = process.argv.slice(2);
if (!cikti || !boyut || !ad) { console.log('Kullanım: node doktor/araclar/video-once-kuzu.mjs <çıktı> <en>x<boy> <ad> [adres] [yaş]'); process.exit(2); }
const [w, h] = boyut.split('x').map(Number);
mkdirSync(cikti, { recursive: true });
const ham = path.join(os.tmpdir(), 'minkino-doktor-video-' + ad + '-' + Date.now());
mkdirSync(ham, { recursive: true });
const bekle = ms => new Promise(r => setTimeout(r, ms));

const b = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=no-user-gesture-required'] });
let kod = 0;
try {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: 'tr-TR', recordVideo: { dir: ham, size: { width: w, height: h } } });
  // sayfanın çıkardığı sesi kaydet: AudioContext'in çıkışına musluk
  await ctx.addInitScript(() => {
    const Asil = window.AudioContext;
    const kayitlar = [];
    window.__sesKayitlari = kayitlar;
    window.AudioContext = class extends Asil {
      constructor(...a) {
        super(...a);
        const gercek = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'destination').get.call(this);
        const musluk = this.createGain(); musluk.connect(gercek);
        const akis = this.createMediaStreamDestination(); musluk.connect(akis);
        const ton = this.createOscillator(), kisik = this.createGain();
        ton.frequency.value = 30; kisik.gain.value = 0.0002; ton.connect(kisik).connect(akis); ton.start();
        const rec = new MediaRecorder(akis.stream, { mimeType: 'audio/webm;codecs=opus' });
        const k = { bas: Date.now(), parcalar: [], rec };
        rec.ondataavailable = e => { if (e.data.size) k.parcalar.push(e.data); };
        rec.start(200); kayitlar.push(k);
        Object.defineProperty(this, 'destination', { get: () => musluk });
      }
    };
  });
  const p = await ctx.newPage();
  const t0 = Date.now();
  const hatalar = [];
  p.on('pageerror', e => { hatalar.push(e.message); console.log('SAYFA HATASI', e.message); });
  const adimSimdi = () => p.evaluate(() => document.getElementById('doktor').dataset.adim);
  const adim = (a, sure = 60000) => p.waitForFunction(x => document.getElementById('doktor').dataset.adim === x, a, { timeout: sure, polling: 50 });
  const nokta = n => p.evaluate(a => window.__onceKuzu.nokta(a), n);
  let fark = { x: 0, y: 0 }, parmak = { x: 0, y: 0 };
  /** parmağı noktaya koyar, basar; aletin ucuyla parmak arasındaki farkı ölçer */
  const tut = async m => {
    await p.mouse.move(m.x, m.y); await bekle(120); await p.mouse.down(); await p.mouse.move(m.x + 1, m.y + 1);
    parmak = { x: m.x + 1, y: m.y + 1 };
    await bekle(60);
    const u = await p.evaluate(() => window.__onceKuzu.uc());
    fark = u ? { x: u.x - parmak.x, y: u.y - parmak.y } : { x: 0, y: 0 };
  };
  /** aletin ucunu hedefe süre (ms) içinde, yumuşak bir eğriyle götürür */
  const git = async (q, sure = 700) => {
    const bas = { ...parmak }, son = { x: q.x - fark.x, y: q.y - fark.y };
    const n = Math.max(4, Math.round(sure / 16));
    for (let i = 1; i <= n; i++) {
      const t = i / n, e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      parmak = { x: bas.x + (son.x - bas.x) * e, y: bas.y + (son.y - bas.y) * e };
      await p.mouse.move(parmak.x, parmak.y);
      await bekle(16);
    }
  };

  await p.goto(`${adres}doktor/index.html?sahne=once-kuzu&kayit&yas=${encodeURIComponent(yas)}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await p.waitForFunction(() => ['hazir', 'eksik'].includes(document.getElementById('doktor').dataset.durum), null, { timeout: 120000 });
  if (await p.evaluate(() => document.getElementById('doktor').dataset.durum) === 'eksik') throw new Error('sahnenin çizimleri eksik; önce bagla.ts ile 68/68 olduğunu gör');
  await p.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
  const bas = Date.now();

  // 1) Kino stetoskobu uzatır: çocuk avuçtan alır, Kuzu'nun göğsüne götürür ve orada tutar
  await adim('k3-al');
  await bekle(1100);
  await tut(await nokta('avuc'));
  const kz = await nokta('kuzu');
  await git({ x: kz.x - 60, y: kz.y + 50 }, 900);
  await bekle(250);
  await git(kz, 500);
  await adim('k3-davul', 20000);
  await bekle(900);
  await p.mouse.up();

  // 2) yakın plan: stetoskop dinlenme yerinden alınır, göğse değer ("serinmiş"), sonra kalp aranır ve orada tutulur
  await adim('k4-dinle');
  await bekle(1200);
  await tut(await nokta('dinlenme'));
  const kalp = await nokta('kalp');
  await git({ x: kalp.x - 170, y: kalp.y + 70 }, 900);
  await adim('k4-kalp', 20000);
  await bekle(500);
  await git({ x: kalp.x - 120, y: kalp.y - 40 }, 800);
  await bekle(450);
  await git({ x: kalp.x - 40, y: kalp.y + 45 }, 700);
  await bekle(350);
  await git({ x: kalp.x + 12, y: kalp.y - 8 }, 600);
  await git(kalp, 300);
  await adim('k4-kikir', 20000);
  // kıkırdama ve iki replik boyunca kalpte kalır; serbest dinlemede biraz gezip geri gelir
  await adim('k4-serbest', 30000);
  await git({ x: kalp.x - 110, y: kalp.y + 30 }, 700);
  await bekle(300);
  await git(kalp, 600);
  await adim('k5-ac', 20000);
  await p.mouse.up();

  // 3) kapanış
  await adim('son', 30000);
  await bekle(1500);
  console.log('son adım:', await adimSimdi(), '· sayfa hatası:', hatalar.length);

  const sesler = await p.evaluate(async () => Promise.all(window.__sesKayitlari.map(async k => {
    if (k.rec.state !== 'inactive') { const d = new Promise(r => { k.rec.onstop = r; }); k.rec.stop(); await d; }
    const blob = new Blob(k.parcalar, { type: 'audio/webm' });
    const ikili = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < ikili.length; i += 0x8000) s += String.fromCharCode(...ikili.subarray(i, i + 0x8000));
    return { bas: k.bas, b64: btoa(s), boy: ikili.length };
  })));
  const v = p.video();
  await ctx.close();
  const video = path.join(ham, 'goruntu.webm');
  renameSync(await v.path(), video);
  const girdiler = ['-i', video], suzgec = [];
  sesler.filter(s => s.boy > 1000).forEach((s, i) => {
    const f = path.join(ham, 'ses-' + i + '.webm');
    writeFileSync(f, Buffer.from(s.b64, 'base64'));
    girdiler.push('-i', f);
    const gecik = Math.max(0, s.bas - t0);
    suzgec.push('[' + (i + 1) + ':a]aresample=async=1:first_pts=0,adelay=' + gecik + '|' + gecik + '[a' + i + ']');
  });
  const n = suzgec.length;
  const karis = n ? suzgec.join(';') + ';' + Array.from({ length: n }, (_, i) => '[a' + i + ']').join('') + 'amix=inputs=' + n + ':normalize=0[ses]' : '';
  const mp4 = path.join(cikti, ad + '.mp4');
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...girdiler, ...(n ? ['-filter_complex', karis, '-map', '0:v', '-map', '[ses]', '-c:a', 'aac', '-b:a', '160k'] : []),
    '-ss', String(Math.max(0, bas - t0) / 1000), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', '-shortest', mp4], { encoding: 'utf8' });
  if (r.status) { console.log('ffmpeg', r.stderr); kod = 1; }
  console.log('çekildi', mp4, '·', n, 'ses kaynağı · süre sn', ((Date.now() - bas) / 1000).toFixed(1));

  // kareler: yarım saniyede bir, tam boy; sonra 12'şer karelik tabakalar (4 × 3)
  const kareler = path.join(cikti, ad + '-kareler');
  rmSync(kareler, { recursive: true, force: true });
  mkdirSync(kareler, { recursive: true });
  const k = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'fps=2', '-q:v', '2', path.join(kareler, 'kare-%03d.jpg')], { encoding: 'utf8' });
  if (k.status) { console.log('ffmpeg kare', k.stderr); kod = 1; }
  const dosyalar = readdirSync(kareler).filter(f => f.endsWith('.jpg')).sort();
  const KW = 640, KH = Math.round((KW * h) / w);
  for (let s = 0; s * 12 < dosyalar.length; s++) {
    const parca = [];
    for (let i = 0; i < 12 && s * 12 + i < dosyalar.length; i++) {
      const f = dosyalar[s * 12 + i];
      const sn = ((s * 12 + i) / 2).toFixed(1);
      const etiket = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${KW}" height="${KH}"><rect x="0" y="0" width="92" height="30" fill="#000" opacity="0.6"/><text x="8" y="22" font-size="20" fill="#fff" font-family="Arial">${sn} sn</text></svg>`);
      parca.push({ input: await sharp(path.join(kareler, f)).resize(KW, KH).composite([{ input: etiket }]).jpeg({ quality: 88 }).toBuffer(), left: (i % 4) * KW, top: Math.floor(i / 4) * KH });
    }
    await sharp({ create: { width: KW * 4, height: KH * 3, channels: 3, background: '#111' } }).composite(parca).jpeg({ quality: 88 }).toFile(path.join(cikti, `${ad}-tabaka-${s + 1}.jpg`));
  }
  console.log('kare:', dosyalar.length, '· tabaka:', Math.ceil(dosyalar.length / 12));
  if (hatalar.length) kod = 1;
} catch (e) {
  console.log('ÇEKİM DURDU:', e.message);
  kod = 1;
} finally {
  await b.close();
  rmSync(ham, { recursive: true, force: true });
}
process.exit(kod);
