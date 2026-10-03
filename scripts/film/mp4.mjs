// Filmi MP4'e çevirir (kredi harcamaz): Playwright + ffmpeg. Ekran kaydı DEĞİL: sayfa sahte saatle (page.clock)
// kare kare ilerletilir, her karede CSS/WAAPI animasyonları da aynı zamana sarılır; kare atlaması olmaz.
// Ses: film kayıt modunda (?kayit=1) efekt / müzik / konuşma olayları zamanıyla günlüğe yazılır, sonra sayfada
// OfflineAudioContext ile aynı kodla işlenir (film/src/kayit.ts) ve videoya eklenir.
//
// Çalıştırma: npm run film:mp4            (dört çıktı)
//             npm run film:mp4 -- dikey   (yalnız istenenler: dikey, kare, yatay, appstore)
// Seçenek:    --film=mino-karpuz  --fps=30  --ornek=12.5 [--olcek=1.5 --png]  (kapak karesi: ekip/film/FILM-REHBERI.md §11)
// Çıktılar:   dist-video/<film>-<format>.mp4 (repoya girmez) + <film>-<format>.jpg (örnek kare)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const arg = process.argv.slice(2);
const secenek = (ad, varsayilan) => arg.find((a) => a.startsWith(`--${ad}=`))?.split('=')[1] ?? varsayilan;
const FILM = secenek('film', 'mino-karpuz');
const FPS = Number(secenek('fps', 30));
const CIKTI = 'dist-video';
const PORT = 4175;
// --ornek=5,30,58: video yerine yalnız bu saniyelerde kare (hızlı deneme): dist-video/ornek-<format>-<sn>.jpg
const ORNEK = secenek('ornek', '').split(',').filter(Boolean).map(Number);
// --olcek=1.5: kare aynı yerleşimde, piksel oranı 2 × ölçek (yatay 1920 → 2880 px; kapak için). --png: örnek kare PNG
const OLCEK = Number(secenek('olcek', 1)) || 1;
const PNG = arg.includes('--png');

// ffmpeg: npm paketi (ffmpeg-static) varsa o, yoksa sistemdeki
let FFMPEG = 'ffmpeg';
try {
  const m = await import('ffmpeg-static');
  if (m.default && fs.existsSync(m.default)) FFMPEG = m.default;
} catch {
  /* sistem ffmpeg */
}

// App Store kesiti: 3. ve 4. sahne (arkadaşlar gelir, karpuz paylaşılır, dans): en sıcak ve renkli 30 sn
const dosya = JSON.parse(fs.readFileSync(`content/film/${FILM}.json`, 'utf8'));
const sahneler = dosya.sahneler.filter((s) => s.sure);
// sahne geçişi 0.7 sn (iris / kararma); sonraki sahne 'kes' ise geçiş yok
// açılış kartı + film-acilis jeneriği (7,9 sn) filmden önce gelir; kapanış jeneriği (5 sn) öğüt kartından sonra
const ACILIS = 7.9;
const sahneBasi = (n) => ACILIS + sahneler.slice(0, n).reduce((t, s, i) => t + s.sure + (sahneler[i + 1]?.gecis === 'kes' ? 0 : 0.7), 0);
const FORMATLAR = {
  dikey: { w: 1080, h: 1920, kadraj: 'dolu' },
  kare: { w: 1080, h: 1080, kadraj: 'dolu' },
  yatay: { w: 1920, h: 1080 },
  appstore: { w: 886, h: 1920, kadraj: 'dolu', bas: sahneBasi(2), sure: 30 },
};
const istenen = arg.filter((a) => !a.startsWith('--'));
const secilen = istenen.length ? istenen : Object.keys(FORMATLAR);
for (const f of secilen) if (!FORMATLAR[f]) throw new Error(`Bilinmeyen format: ${f} (${Object.keys(FORMATLAR).join(', ')})`);
if (!fs.existsSync('dist/film/index.html')) throw new Error('Önce derleyin: npm run build (ya da npm run film:mp4 derleyip çalıştırır)');
fs.mkdirSync(CIKTI, { recursive: true });

// ---------------------------------------------------------------- yerel sunucu (dist)
const sunucu = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const hazir = async () => {
  for (let i = 0; i < 100; i++) {
    const ok = await new Promise((coz) => http.get(`http://localhost:${PORT}/film/`, (r) => coz(r.statusCode === 200)).on('error', () => coz(false)));
    if (ok) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('vite preview açılmadı');
};

function ffmpeg(args, girdi) {
  return new Promise((coz, hata) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: [girdi ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    p.on('error', hata);
    p.on('close', (k) => (k === 0 ? coz() : hata(new Error(`ffmpeg ${k}`))));
    if (girdi) girdi(p.stdin);
  });
}

async function kaydet(ad, f) {
  const bas = f.bas ?? 0;
  const DPR = 2;
  const PO = DPR * OLCEK;
  const tarayici = await chromium.launch();
  const sayfa = await (await tarayici.newContext({ viewport: { width: f.w / DPR, height: f.h / DPR }, deviceScaleFactor: PO, locale: 'tr-TR' })).newPage();
  const hatalar = [];
  sayfa.on('pageerror', (e) => hatalar.push(String(e)));
  await sayfa.clock.install({ time: 1_000_000 });
  const q = new URLSearchParams({ kayit: '1', sessiz: '1', film: FILM });
  if (f.kadraj) q.set('kadraj', f.kadraj);
  await sayfa.goto(`http://localhost:${PORT}/film/?${q}`);
  await sayfa.locator('.fl-oynat').waitFor();
  await sayfa.evaluate(() => document.fonts.ready);
  await sayfa.waitForFunction(() => (window).__filmKayit);
  // saat durur; film bundan sonra yalnız bizim adımımızla ilerler
  const simdi = await sayfa.evaluate(() => Date.now());
  await sayfa.clock.pauseAt(simdi + 100);
  // animasyon senkronu: her CSS/WAAPI animasyonu ilk görüldüğünde durdurulur, sonra sahte saate göre sarılır
  await sayfa.evaluate(() => {
    const m = new WeakMap();
    window.__animSenk = (now) => {
      for (const a of document.getAnimations()) {
        let b = m.get(a);
        if (b === undefined) {
          b = now - (a.currentTime ?? 0);
          m.set(a, b);
          a.pause();
        }
        a.currentTime = Math.max(0, (now - b) * (a.playbackRate || 1));
      }
    };
  });
  const t0 = await sayfa.evaluate(() => {
    document.querySelector('.fl-oynat').click();
    return performance.now() / 1000;
  });

  const dt = 1000 / FPS;
  if (ORNEK.length) {
    let gecen = 0;
    for (const sn of [...ORNEK].sort((a, b) => a - b)) {
      // sabit adımla o ana kadar ilerle (hareket ve kamera yumuşatması aynı kalsın)
      while (gecen < sn - 1e-6) {
        await sayfa.clock.runFor(dt);
        gecen += dt / 1000;
      }
      await sayfa.evaluate(() => window.__animSenk(performance.now()));
      await sayfa.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))));
      await sayfa.screenshot(PNG ? { path: path.join(CIKTI, `ornek-${ad}-${sn}.png`), type: 'png' } : { path: path.join(CIKTI, `ornek-${ad}-${sn}.jpg`), type: 'jpeg', quality: 88 });
    }
    await tarayici.close();
    console.log(`✓ örnek kareler: ${ad} (${ORNEK.join(', ')} sn)`);
    return;
  }
  const gecici = path.join(CIKTI, `.${FILM}-${ad}-goruntu.mp4`);
  let kare = 0;
  // tamam: kapanış jeneriği bitti (ekranda data-tamam); kayıt ondan ~1 sn sonra biter
  let tamam = -1;
  let ornek = null;
  // kesit başına kadar görüntüsüz ilerle
  if (bas > 0) await sayfa.clock.runFor(Math.round(bas * 1000));
  await ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', gecici], async (stdin) => {
    const yaz = (b) => new Promise((r) => (stdin.write(b) ? r() : stdin.once('drain', r)));
    for (;;) {
      if (kare > 0) await sayfa.clock.runFor(dt);
      const durum = await sayfa.evaluate(() => {
        window.__animSenk(performance.now());
        return !!document.querySelector('.fl-ekran[data-tamam]');
      });
      // yeni görseller (sahne değişince) yüklensin
      await sayfa.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))));
      const b = await sayfa.screenshot({ type: 'jpeg', quality: 92 });
      await yaz(b);
      kare++;
      const gecen = kare / FPS;
      if (!ornek && gecen >= (f.sure ? f.sure * 0.45 : ACILIS + 9.5)) ornek = b;
      if (durum && tamam < 0) tamam = kare;
      if (f.sure ? gecen >= f.sure : tamam >= 0 && kare - tamam >= FPS) break;
      if (gecen > 180) throw new Error('film bitmedi (180 sn)');
      if (kare % (FPS * 5) === 0) process.stdout.write(`  ${ad}: ${gecen.toFixed(0)} sn\r`);
    }
    stdin.end();
  });
  const sure = kare / FPS;
  // ses: günlükteki olaylar çevrimdışı işlenir (baştan; kesitte bas kadar kaydırılır)
  const wav64 = await sayfa.evaluate(([t0, uzunluk]) => window.__filmKayit.sesiIsle(t0, uzunluk), [t0, bas + sure]);
  const sesYolu = path.join(CIKTI, `.${FILM}-${ad}.wav`);
  fs.writeFileSync(sesYolu, Buffer.from(wav64, 'base64'));
  const cikti = path.join(CIKTI, `${FILM}-${ad}.mp4`);
  await ffmpeg(['-i', gecici, '-ss', String(bas), '-t', String(sure), '-i', sesYolu, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', cikti]);
  if (ornek) fs.writeFileSync(path.join(CIKTI, `${FILM}-${ad}.jpg`), ornek);
  fs.rmSync(gecici);
  fs.rmSync(sesYolu);
  await tarayici.close();
  console.log(`✓ ${cikti}  ${f.w}×${f.h}  ${sure.toFixed(1)} sn  ${(fs.statSync(cikti).size / 1e6).toFixed(1)} MB${hatalar.length ? '  HATA: ' + hatalar.join(' | ') : ''}`);
}

try {
  await hazir();
  for (const ad of secilen) await kaydet(ad, FORMATLAR[ad]);
} finally {
  sunucu.kill();
}
