// "Mino'nun Kurabiyeli Dişleri"ni gerçek kipte, gerçek sesle ve insan hızında parmak hareketleriyle baştan sona oynatır;
// video çeker, karelerini çıkarır (video-vaka.mjs'in eşi; kayıt ve ses hizalama bölümü aynıdır).
//
//   node doktor/araclar/video-dis.mjs <çıktı klasörü> <en>x<boy> <ad> [adres] [yaş] [ek sorgu]
//   deneme (geçici çizimlerle, video yerine yalnız aşama görüntüleri): … 5+ taslak --deneme
//
// Önce kendi geliştirme sunucunu aç. Ağır test kilidi: output/AGIR-TEST.txt (varsa bekle).
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const req = createRequire(import.meta.url);
const { chromium } = req('@playwright/test');
const ffmpeg = req('ffmpeg-static');
const sharp = req('sharp');

const arg = process.argv.slice(2).filter(a => !a.startsWith('--'));
const DENEME = process.argv.includes('--deneme');
const [cikti, boyut, ad, adres = 'http://localhost:5183/', yas = '5+', ek = ''] = arg;
if (!cikti || !boyut || !ad) { console.log('Kullanım: node doktor/araclar/video-vaka.mjs <çıktı> <en>x<boy> <ad> [adres] [yaş] [ek sorgu] [--deneme]'); process.exit(2); }
const [w, h] = boyut.split('x').map(Number);
mkdirSync(cikti, { recursive: true });
const ham = path.join(os.tmpdir(), 'minkino-vaka-video-' + ad + '-' + Date.now());
mkdirSync(ham, { recursive: true });
const bekle = ms => new Promise(r => setTimeout(r, ms));

const b = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=no-user-gesture-required'] });
let kod = 0;
try {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: 'tr-TR', ...(DENEME ? {} : { recordVideo: { dir: ham, size: { width: w, height: h } } }) });
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
  p.on('console', m => { if (m.type() === 'error') console.log('KONSOL', m.text().slice(0, 200)); });
  let bas = 0;
  const zamanlar = [];
  const asama = async a => { await p.waitForFunction(x => document.getElementById('doktor').dataset.asama === x, a, { timeout: 30000, polling: 50 }); zamanlar.push(a + ' ' + ((Date.now() - bas) / 1000).toFixed(1)); };
  const nokta = (n, i = 0) => p.evaluate(([a, k]) => window.__dis.nokta(a, k), [n, i]);
  const sayim = () => p.evaluate(() => window.__dis.sayim());
  let fark = { x: 0, y: 0 }, parmak = { x: 0, y: 0 }, goruntuNo = 0;
  const goruntu = async etiket => { if (DENEME) await p.screenshot({ path: path.join(cikti, `${ad}-${String(++goruntuNo).padStart(2, '0')}-${etiket}.png`) }); };
  const dokun = async m => { await p.mouse.move(m.x, m.y); await bekle(90); await p.mouse.down(); await bekle(70); await p.mouse.up(); };
  const tut = async m => {
    await p.mouse.move(m.x, m.y); await bekle(120); await p.mouse.down(); await p.mouse.move(m.x + 1, m.y + 1);
    parmak = { x: m.x + 1, y: m.y + 1 };
    await bekle(70);
    const u = await p.evaluate(() => window.__dis.uc());
    fark = u ? { x: u.x - parmak.x, y: u.y - parmak.y } : { x: 0, y: 0 };
  };
  // parmak hareketi gerçek zamana bağlı: süre, tarayıcının yavaşlığından etkilenmez
  const git = async (q, sure = 600) => {
    const ilk = { ...parmak }, son = { x: q.x - fark.x, y: q.y - fark.y }, s0 = Date.now();
    for (;;) {
      const t = Math.min(1, (Date.now() - s0) / sure), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      parmak = { x: ilk.x + (son.x - ilk.x) * e, y: ilk.y + (son.y - ilk.y) * e };
      await p.mouse.move(parmak.x, parmak.y);
      if (t >= 1) break;
      await bekle(8);
    }
  };
  const bekleKosul = async (kosul, sure = 8000) => { const s = Date.now(); while (Date.now() - s < sure) { if (await kosul()) return true; await bekle(50); } return false; };

  await p.goto(`${adres}doktor/index.html?oyun=dis&kayit&yas=${encodeURIComponent(yas)}${ek ? '&' + ek : ''}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await p.waitForFunction(() => ['hazir', 'eksik'].includes(document.getElementById('doktor').dataset.durum), null, { timeout: 180000 });
  if (await p.evaluate(() => document.getElementById('doktor').dataset.durum) === 'eksik') throw new Error('çizimler eksik: ' + await p.evaluate(() => document.getElementById('doktor').dataset.eksik));
  await p.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
  bas = Date.now();
  const S = await sayim();

  // 1) masa: Mino derdini söyler; çanta açılır, aletler çıkar
  await bekle(3600);
  await goruntu('masa');
  await dokun(await nokta('canta'));
  await bekle(2100);
  await goruntu('canta-acik');
  await dokun(await nokta('agiz-dugmesi'));
  await asama('fener');
  await bekle(350);
  await goruntu('yakin');

  // 2) fener: ağza tutulur, Mino "Aaaa" der; ışık dişlerde gezer
  await tut(await nokta('fener'));
  const agiz = await nokta('agiz');
  await git({ x: agiz.x - 60, y: agiz.y }, 520);
  await bekleKosul(async () => (await sayim()).agizAcik, 3000);
  await goruntu('aaa');
  await git({ x: agiz.x + 90, y: agiz.y - 30 }, 420);
  await git({ x: agiz.x - 40, y: agiz.y + 40 }, 420);
  await asama('macun');
  await p.mouse.up();
  await bekle(450);

  // 3) macun: bir tat seçilir, kılların üstünde boydan boya sürülerek sıkılır
  await tut(await nokta('tup', 1));
  const kilSol = await nokta('kil', 0), kilSag = await nokta('kil', 1);
  await git(kilSol, 560);
  await git({ x: (kilSol.x + kilSag.x) / 2, y: kilSol.y }, 320);
  await goruntu('macun-yarim');
  await git(kilSag, 320);
  await asama('firca');
  await p.mouse.up();
  await bekle(500);
  await goruntu('firca-hazir');

  // 4) fırça: her bölmede ileri geri
  await tut(await nokta('firca'));
  const olcek = await p.evaluate(() => window.__dis.olcek());
  let fircaGoruntu = false;
  for (let tur = 0; tur < 3 && (await sayim()).temiz < S.bolme - 1; tur++) for (let i = 0; i < S.bolme; i++) {
    const b = await nokta('bolme', i);
    await git({ x: b.x - 38 * olcek, y: b.y }, tur || i ? 200 : 520);
    for (let k = 0; k < 5; k++) await git({ x: b.x + (k % 2 ? -38 : 38) * olcek, y: b.y + (k % 2 ? 6 : -6) * olcek }, 110);
    if (!fircaGoruntu && i === 2) { fircaGoruntu = true; await goruntu('fircalarken'); }
    if ((await p.evaluate(() => window.__dis.asama())) !== 'firca') break;
  }
  await asama('bardak');
  await p.mouse.up();
  await bekle(550);
  await goruntu('disler-temiz');

  // 5) bardak: ağza tutulur, su dökülür; yanaklar şişer
  await tut(await nokta('bardak'));
  await git({ x: agiz.x, y: agiz.y - 20 * olcek }, 560);
  await asama('calkala');
  await bekle(350);
  await p.mouse.up();
  await goruntu('yanaklar-sisik');

  // 6) çalkalama: yanaklara sırayla dokunulur
  for (let k = 0; k < S.hedefCalkala; k++) { await dokun(await nokta('yanak', k % 2)); await bekle(260); }

  // 7) dişler parlar, masada kutlama
  await asama('kutlama');
  await bekle(1200);
  await goruntu('parlak');
  await asama('son');
  await bekle(600);
  await goruntu('son');
  console.log('aşama başlangıçları (sn):', zamanlar.join(' · '));
  console.log('son:', JSON.stringify(await sayim()), '· sayfa hatası:', hatalar.length, '· oyun süresi sn', ((Date.now() - bas) / 1000).toFixed(1));

  if (!DENEME) {
    const sesler = await p.evaluate(async () => Promise.all(window.__sesKayitlari.map(async k => {
      if (k.rec.state !== 'inactive') { const d = new Promise(r => { k.rec.onstop = r; }); k.rec.stop(); await d; }
      const blob = new Blob(k.parcalar, { type: 'audio/webm' });
      const ikili = new Uint8Array(await blob.arrayBuffer());
      let s = ''; for (let i = 0; i < ikili.length; i += 0x8000) s += String.fromCharCode(...ikili.subarray(i, i + 0x8000));
      return { bas: k.bas, b64: btoa(s), boy: ikili.length };
    })));
    const gorundu = await p.evaluate(() => window.__dis.gorunduAni());
    const v = p.video();
    await ctx.close();
    const video = path.join(ham, 'goruntu.webm');
    renameSync(await v.path(), video);
    // Videonun sıfırı (ilk karenin duvar saati) ölçülür: oyun sahneyi görünür yaptığı anı bildirir (gorunduAni);
    // videoda sahnenin ilk göründüğü kare bulunur. Sıfır = o an − o karenin süresi. Ses ve kesme noktası buna göre.
    const KG = 64, KY = 36;
    const kucuk = spawnSync(ffmpeg, ['-loglevel', 'error', '-t', '60', '-i', video, '-vf', `fps=25,scale=${KG}:${KY}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
    const ham3 = kucuk.stdout ?? Buffer.alloc(0);
    let ilkKare = -1;
    for (let k = 0; k * KG * KY * 3 < ham3.length; k++) {
      // sedyenin ortası: sahne görünmeden önce zemin rengi (kırmızısı baskın), görününce nane ya da gömleğin yeşil-mavisi
      const o = (k * KG * KY + Math.round(0.41 * KY) * KG + Math.round(0.48 * KG)) * 3;
      if (ham3[o + 1] > ham3[o] + 20) { ilkKare = k; break; }
    }
    if (ilkKare < 0 || !gorundu) throw new Error('videoda sahnenin göründüğü kare bulunamadı: ses eşlenemez');
    const sifir = gorundu - ilkKare * 40;
    console.log('video sıfırı sayfa açılışından', ((sifir - t0) / 1000).toFixed(2), 'sn sonra · sahne videonun', (ilkKare * 0.04).toFixed(2), 'saniyesinde göründü');
    const girdiler = ['-i', video], suzgec = [];
    sesler.filter(s => s.boy > 1000).forEach((s, i) => {
      const f = path.join(ham, 'ses-' + i + '.webm');
      writeFileSync(f, Buffer.from(s.b64, 'base64'));
      girdiler.push('-i', f);
      const gecik = Math.max(0, s.bas - sifir);
      suzgec.push('[' + (i + 1) + ':a]aresample=async=1:first_pts=0,adelay=' + gecik + '|' + gecik + '[a' + i + ']');
    });
    const n = suzgec.length;
    const karis = n ? suzgec.join(';') + ';' + Array.from({ length: n }, (_, i) => '[a' + i + ']').join('') + 'amix=inputs=' + n + ':normalize=0[ses]' : '';
    const mp4 = path.join(cikti, ad + '.mp4');
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...girdiler, ...(n ? ['-filter_complex', karis, '-map', '0:v', '-map', '[ses]', '-c:a', 'aac', '-b:a', '160k'] : []),
      '-ss', String(Math.max(0, bas - sifir) / 1000), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-movflags', '+faststart', '-shortest', mp4], { encoding: 'utf8' });
    if (r.status) { console.log('ffmpeg', r.stderr); kod = 1; }
    console.log('çekildi', mp4, '·', n, 'ses kaynağı');
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
        const sn = ((s * 12 + i) / 2).toFixed(1);
        const etiket = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${KW}" height="${KH}"><rect x="0" y="0" width="92" height="30" fill="#000" opacity="0.6"/><text x="8" y="22" font-size="20" fill="#fff" font-family="Arial">${sn} sn</text></svg>`);
        parca.push({ input: await sharp(path.join(kareler, dosyalar[s * 12 + i])).resize(KW, KH).composite([{ input: etiket }]).jpeg({ quality: 88 }).toBuffer(), left: (i % 4) * KW, top: Math.floor(i / 4) * KH });
      }
      await sharp({ create: { width: KW * 4, height: KH * 3, channels: 3, background: '#111' } }).composite(parca).jpeg({ quality: 88 }).toFile(path.join(cikti, `${ad}-tabaka-${s + 1}.jpg`));
    }
    console.log('kare:', dosyalar.length, '· tabaka:', Math.ceil(dosyalar.length / 12));
  }
  if (hatalar.length) kod = 1;
} catch (e) {
  console.log('ÇEKİM DURDU:', e.message.split('\n')[0]);
  kod = 1;
} finally {
  await b.close();
  rmSync(ham, { recursive: true, force: true });
}
process.exit(kod);
