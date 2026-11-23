// "Zıpzıp'ın Dikenli Patisi"ni gerçek kipte, gerçek sesle ve insan hızında parmak hareketleriyle baştan sona oynatır;
// video çeker, karelerini çıkarır. Video, sahnenin bütün çizimleri çözüldükten sonraki ilk kareden başlar.
//
//   node doktor/araclar/video-vaka.mjs <çıktı klasörü> <en>x<boy> <ad> [adres] [yaş] [ek sorgu]
//   örnek: node doktor/araclar/video-vaka.mjs output/gosterim-19 1280x720 doktor http://localhost:5183/ 5+
//   deneme (geçici çizimlerle, video yerine yalnız aşama görüntüleri): … 5+ taslak --deneme
//
// Önce kendi geliştirme sunucunu aç. Ağır test kilidi: output/AGIR-TEST.txt (varsa bekle).
// Çıktı: <ad>.mp4 (sesli), <ad>-kareler/kare-NNN.jpg (yarım saniyede bir), <ad>-tabaka-N.jpg (12'şer kare).
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
  const nokta = (n, i = 0) => p.evaluate(([a, k]) => window.__vaka.nokta(a, k), [n, i]);
  const sayim = () => p.evaluate(() => window.__vaka.sayim());
  let fark = { x: 0, y: 0 }, parmak = { x: 0, y: 0 }, goruntuNo = 0;
  const goruntu = async etiket => { if (DENEME) await p.screenshot({ path: path.join(cikti, `${ad}-${String(++goruntuNo).padStart(2, '0')}-${etiket}.png`) }); };
  const dokun = async m => { await p.mouse.move(m.x, m.y); await bekle(90); await p.mouse.down(); await bekle(70); await p.mouse.up(); };
  const tut = async m => {
    await p.mouse.move(m.x, m.y); await bekle(120); await p.mouse.down(); await p.mouse.move(m.x + 1, m.y + 1);
    parmak = { x: m.x + 1, y: m.y + 1 };
    await bekle(70);
    const u = await p.evaluate(() => window.__vaka.uc());
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

  await p.goto(`${adres}doktor/index.html?oyun=vaka&kayit&yas=${encodeURIComponent(yas)}${ek ? '&' + ek : ''}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await p.waitForFunction(() => ['hazir', 'eksik'].includes(document.getElementById('doktor').dataset.durum), null, { timeout: 180000 });
  if (await p.evaluate(() => document.getElementById('doktor').dataset.durum) === 'eksik') throw new Error('çizimler eksik: ' + await p.evaluate(() => document.getElementById('doktor').dataset.eksik));
  await p.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
  bas = Date.now();
  const S = await sayim();

  // Uzun akış (Paket Doktor-A1): açık olan aşamalar oynanır. Yardımcılar: alt sahnelerin noktaları ve sayımları.
  const V = (f, ...a) => p.evaluate(([n, g]) => window.__vaka[n](...g), [f, a]);
  const alt = (s, n, i = 0) => V('alt', s, n, i), altSayim = s => V('altSayim', s), durum = () => V('durum');
  const simdi = () => p.evaluate(() => document.getElementById('doktor').dataset.asama);
  const acik = await V('acik');
  const olcekG = await V('olcek');
  /** parmağı bir yere koyar ve basar (alet değil: pati, sabun, havlu, çıkartma gibi sürüklenen parçalar) */
  const basili = async m => { await p.mouse.move(m.x, m.y); await bekle(140); await p.mouse.down(); parmak = { ...m }; fark = { x: 0, y: 0 }; await bekle(60); };
  const birak = async () => { await p.mouse.up(); fark = { x: 0, y: 0 }; };

  // 0) geliş: Zıpzıp topallayarak girer; üç dokunuşta sedyeye zıplar
  if (acik.giris) {
    await bekleKosul(async () => { const d = await durum(); return !!d.gelis && !d.gelis.yuruyor; }, 12000);
    await bekle(500);
    await goruntu('gelis');
    for (let i = 0; i < 3; i++) { await dokun(await nokta('gelis')); await bekle(i < 2 ? 780 : 500); }
    await asama('giris');
  }
  // 1) masa: Zıpzıp derdini söyler; çanta açılır, aletler çıkar
  await bekle(acik.giris ? 1700 : 3900);
  await goruntu('masa');
  await dokun(await nokta('canta'));
  await bekle(1900);
  await goruntu('canta-acik');

  // 1b) lavabo: doktorun el yıkaması
  if (acik.lavabo) {
    await dokun(await nokta('lavabo-dugmesi'));
    await asama('lavabo-ac');
    await bekle(900);
    // yanlış hamle: musluk açılmadan sabuna dokunulur (sabun kayar, aynadaki Kino güler)
    await dokun(await alt('lavabo', 'sabun'));
    await bekle(1000);
    await dokun(await alt('lavabo', 'kol'));
    await asama('lavabo-islat');
    await bekle(700);
    await goruntu('lavabo-su');
    // patiler suyun altına
    const pati0 = await alt('lavabo', 'pati');
    await basili(pati0);
    await git({ x: (await alt('lavabo', 'sol-pati-suda')).x, y: pati0.y }, 700);
    await asama('lavabo-sabun');
    await bekle(350);
    await birak();
    await bekle(450);
    // sabun patilerde gezdirilir
    await basili(await alt('lavabo', 'sabun'));
    for (let k = 0; k < 40 && (await simdi()) === 'lavabo-sabun'; k++) { const h = await alt('lavabo', k % 2 ? 'sol-pati' : 'sag-pati'); await git({ x: h.x, y: h.y + (k % 3) * 28 * olcekG }, 430); }
    await asama('lavabo-ov');
    await birak();
    await goruntu('lavabo-kopuk');
    await bekle(900);
    // ovuştur: patilerin üstünde ileri geri
    const orta = await alt('lavabo', 'pati');
    await basili(orta);
    for (let k = 0; k < 60 && (await simdi()) === 'lavabo-ov'; k++) await git({ x: orta.x + (k % 2 ? -115 : 115) * olcekG, y: orta.y + (k % 4 < 2 ? -12 : 12) * olcekG }, 250);
    await asama('lavabo-durula');
    await birak();
    await bekle(500);
    // durula: önce bir pati, sonra öbürü suyun altına
    await basili(await alt('lavabo', 'pati'));
    for (let k = 0; k < 12 && (await simdi()) === 'lavabo-durula'; k++) { const h = await alt('lavabo', k % 2 ? 'sag-pati-suda' : 'sol-pati-suda'); await git(h, 600); await bekleKosul(async () => (await simdi()) !== 'lavabo-durula', 850); }
    await asama('lavabo-kapat');
    await birak();
    await goruntu('lavabo-durulandi');
    await bekle(450);
    await dokun(await alt('lavabo', 'kol'));
    await asama('lavabo-kurula');
    await bekle(900);
    // havluyla kurula: satır satır
    await basili(await alt('lavabo', 'havlu'));
    const kb = await alt('lavabo', 'kuru-bas');
    for (let sira = 0; sira < 6 && (await simdi()) === 'lavabo-kurula'; sira++) {
      const yy = kb.y + (40 + (sira % 4) * 78) * olcekG;
      await git({ x: kb.x + (sira % 2 ? 620 : 0) * olcekG, y: yy }, 260);
      await git({ x: kb.x + (sira % 2 ? 0 : 620) * olcekG, y: yy }, 520);
    }
    await asama('lavabo-bitti');
    await birak();
    await goruntu('lavabo-bitti');
    await asama('canta');
    await bekle(700);
  }
  // 1c) göğüs: stetoskop kalbin üstünde tutulur
  if (acik.gogus) {
    await dokun(await nokta('gogus-dugmesi'));
    await asama('gogus');
    await bekle(1600);
    const st = await alt('gogus', 'stetoskop');
    await basili(st);
    await p.mouse.move(st.x + 1, st.y + 1); parmak = { x: st.x + 1, y: st.y + 1 };
    const baslik = await alt('gogus', 'baslik'), kalp = await alt('gogus', 'kalp'), kenar = await alt('gogus', 'gogus-kenari');
    const hedef = q => ({ x: st.x + 1 + q.x - baslik.x, y: st.y + 1 + q.y - baslik.y });
    await git(hedef(kenar), 800);
    await bekle(700);
    await goruntu('gogus-uzak');
    await git(hedef({ x: (kenar.x + kalp.x) / 2, y: (kenar.y + kalp.y) / 2 }), 600);
    await bekle(500);
    await git(hedef(kalp), 600);
    await goruntu('gogus-kalp');
    await bekleKosul(async () => { const g = await altSayim('gogus'); return !g || g.tamam; }, 9000);
    await bekle(300);
    await birak();
    await asama('canta');
    await bekle(700);
  }
  await dokun(await nokta('pati'));
  await asama('buyutec');
  await bekle(350);
  await goruntu('yakin');
  // yanlış hamle: sırası gelmeden spreye dokunulur (boşa "fıs", Zıpzıp güler)
  await dokun(await nokta('alet', 1));
  await bekle(1000);

  // 2) büyüteç: kolda gezinir, mikropları bulur
  await tut(await nokta('alet', 0));
  for (let i = 0; i < S.mikrop; i++) {
    const m = await nokta('mikrop', i);
    await git({ x: m.x - 50, y: m.y + 40 }, i ? 460 : 360);
    await git(m, 240);
    await bekleKosul(async () => (await sayim()).bulunan > i, 3000);
    if (i === 0) await goruntu('mercek');
    await bekle(260);
  }
  await asama('sprey');
  await p.mouse.up();
  await bekle(600);
  await goruntu('mikroplar');

  // 3) köpük: her mikroba sıkılır, pof
  await tut(await nokta('alet', 1));
  // köpükle ovma: köpük ağzın biraz önüne düşer; uç, mikrobun sağ üstünde küçük daireler çizer (tur başına 0,45 sn)
  const olcekK = await p.evaluate(() => window.__vaka.olcek());
  for (let i = 0; i < S.mikrop; i++) {
    const mk = await nokta('mikrop', i);
    await git({ x: mk.x + 75 * olcekK, y: mk.y - 30 * olcekK }, 380);
    let goruntulendi = i > 0;
    for (let s0 = Date.now(), bakis = 0; Date.now() - s0 < 8000;) {
      const a = ((Date.now() - s0) / 450) * Math.PI * 2;
      parmak = { x: mk.x + (30 + Math.cos(a) * 45) * olcekK - fark.x, y: mk.y + (-30 + Math.sin(a) * 35) * olcekK - fark.y };
      await p.mouse.move(parmak.x, parmak.y);
      await bekle(8);
      if (Date.now() - bakis < 90) continue;
      bakis = Date.now();
      if (!goruntulendi && Date.now() - s0 > 500) { goruntulendi = true; await goruntu('kopuk'); }
      if ((await sayim()).giden > i) break;
    }
    await bekle(200);
  }
  await asama('cimbiz');
  await p.mouse.up();
  await bekle(600);
  await goruntu('temiz');

  // 4) cımbız: dikeni tutar, narince çeker, tepsiye bırakır
  await tut(await nokta('alet', 2));
  // sıra sağdan sola: elin yolu öbür dikenlerin ucundan geçmesin; biri kaçarsa kalanlar bitene dek sürer
  let ilkDiken = true;
  const dikenSirasi = S.diken === 3 ? [0, 2, 1] : [0, 1];
  for (let tur = 0; tur < 4 && (await sayim()).cikan < S.diken; tur++) for (const i of dikenSirasi) {
    const uc = await nokta('diken', i);
    if (!uc) continue;
    const once = (await sayim()).cikan;
    await git(uc, 440);
    await bekle(140);
    const yon = await nokta('diken-yon', i);
    await git({ x: uc.x + (yon.x - uc.x) * 0.12, y: uc.y + (yon.y - uc.y) * 0.12 }, 300);
    if (ilkDiken) await goruntu('diken-direniyor');
    await git({ x: uc.x + (yon.x - uc.x) * 0.5, y: uc.y + (yon.y - uc.y) * 0.5 }, 320);
    if (!(await bekleKosul(async () => (await sayim()).cikan > once, 1500))) continue;
    await bekle(90);
    const tepsi = await nokta('tepsi');
    await git({ x: tepsi.x, y: tepsi.y - 20 + once * 14 }, 480);
    await bekle(180);
    if (ilkDiken) await goruntu('tepside');
    ilkDiken = false;
  }
  await p.mouse.up();
  if (acik.pamuk) {
    // 4b) ıslak pamuk: kâseye daldır, kolu sil; kirlenince çalkala
    await asama('pamuk');
    await bekle(900);
    await basili(await nokta('pamuk'));
    const kase = await nokta('kase');
    await git(kase, 600);
    await bekleKosul(async () => (await durum()).pamuk.islak, 2000);
    await bekle(250);
    await goruntu('pamuk-islak');
    for (let i = 0; i < 36 && (await simdi()) === 'pamuk'; i++) {
      await git(await nokta('pamuk-hucre', i), 170);
      if ((await durum()).pamuk?.kir === 3) { await bekle(200); await git(kase, 520); await bekleKosul(async () => (await durum()).pamuk.kir === 0, 1500); await bekle(200); }
    }
    await birak();
    await goruntu('pamuk-bitti');
  }
  await asama('sargi');
  await bekle(700);

  // 5) sargı: rulo kolun çevresinde döner
  await tut(await nokta('alet', 3));
  const m = await nokta('sargi');
  const olcek = await p.evaluate(() => window.__vaka.olcek());
  let goruntulendi = false;
  // tur başına 1,15 sn; açı geçen süreden hesaplanır
  for (let s0 = Date.now(), bakis = 0; Date.now() - s0 < 20000;) {
    const a = -Math.PI / 2 + ((Date.now() - s0) / 1150) * Math.PI * 2;
    parmak = { x: m.x + Math.cos(a) * 250 * olcek - fark.x, y: m.y + Math.sin(a) * 210 * olcek - fark.y };
    await p.mouse.move(parmak.x, parmak.y);
    await bekle(8);
    if (Date.now() - bakis < 100) continue;
    bakis = Date.now();
    const s = await sayim();
    if (!goruntulendi && s.sargi > 0.5) { goruntulendi = true; await goruntu('sargi-yarim'); }
    if (s.sargi >= 1) break;
  }
  await asama('bant');
  await p.mouse.up();
  await bekle(900);
  await goruntu('bantlar');

  // 6) desenli bant sargının üstüne
  await tut(await nokta('bant', 1));
  await git(await nokta('sargi'), 620);
  await bekle(120);
  await p.mouse.up();
  await bekle(450);
  await goruntu('bant-yapisti');
  if ((await durum()).bant > 0) {
    const bn = await nokta('sargi');
    await basili({ x: bn.x - 120 * olcek, y: bn.y });
    for (let k = 0; k < 12 && (await durum()).bant > 0; k++) await git({ x: bn.x + (k % 2 ? -120 : 120) * olcek, y: bn.y + (k % 2 ? 6 : -6) * olcek }, 360);
    await birak();
    await goruntu('bant-duz');
  }
  if (acik.defter) {
    // 6b) çıkartma defteri: çıkartmalar yuvalara, sonra pati damgası
    await asama('defter');
    await bekle(1900);
    await goruntu('defter');
    // yanlış hamle: çıkartmalardan önce damgaya dokunulur (damga "tak tak" zıplar)
    await dokun(await alt('defter', 'damga'));
    await bekle(900);
    const hedefC = (await altSayim('defter')).hedef;
    for (let i = 0; i < hedefC; i++) {
      const c = await alt('defter', 'cikartma', [2, 5, 0][i] ?? i), yv = await alt('defter', 'yuva', i);
      await basili(c);
      await git({ x: c.x - 60 * olcek, y: c.y + 40 * olcek }, 320);
      await git({ x: yv.x, y: yv.y + 10 * olcek }, 760);
      await bekle(120);
      await birak();
      await bekle(650);
    }
    await bekleKosul(async () => (await simdi()) === 'defter-damga', 4000);
    await bekle(500);
    const dm = await alt('defter', 'damga');
    await basili(dm);
    await p.mouse.move(dm.x + 1, dm.y + 1); parmak = { x: dm.x + 1, y: dm.y + 1 };
    const ucD = await alt('defter', 'damga-ucu'), dh = await alt('defter', 'damga-hedefi');
    await git({ x: dm.x + 1 + dh.x - ucD.x, y: dm.y + 1 + dh.y - ucD.y }, 800);
    await bekle(150);
    await birak();
    await goruntu('defter-damga');
  }

  // 7) masada kutlama, yıldız
  await asama('kutlama');
  await bekle(1200);
  await goruntu('kutlama');
  await asama('son');
  await bekle(3600);
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
    const gorundu = await p.evaluate(() => window.__vaka.gorunduAni());
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
    const N = KG * KY * 3;
    // sahne görününce nane yeşili (sedye, Kino'nun tişörtü) gelir: yeşili kırmızısından belirgin fazla piksel oranı %3'ü geçen ilk kare
    for (let k = 0; (k + 1) * N <= ham3.length; k++) {
      let yesil = 0;
      for (let i = 0; i < N; i += 3) if (ham3[k * N + i + 1] > ham3[k * N + i] + 20) yesil++;
      if (yesil / (N / 3) > 0.03) { ilkKare = k; break; }
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
    const kareler6 = path.join(cikti, ad + '-kareler6');
    rmSync(kareler6, { recursive: true, force: true });
    mkdirSync(kareler6, { recursive: true });
    spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'fps=6,scale=480:-2', '-q:v', '4', path.join(kareler6, 'k-%05d.jpg')], { encoding: 'utf8' });
    // görüntüde 1 sn'den uzun donma ve seste 1 sn'den uzun sessizlik
    const tara = spawnSync(ffmpeg, ['-hide_banner', '-i', mp4, '-vf', 'freezedetect=n=-55dB:d=1', '-af', 'silencedetect=n=-45dB:d=1', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
    const satirlar = (tara.stderr || '').split('\n').filter(s => /freeze_start|freeze_duration|silence_start|silence_duration/.test(s)).map(s => s.replace(/^\[[^\]]+\]\s*/, '').trim());
    writeFileSync(path.join(cikti, ad + '-tarama.txt'), satirlar.join('\n') + '\n');
    console.log('donma / sessizlik satırı:', satirlar.length, '→', ad + '-tarama.txt');
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
