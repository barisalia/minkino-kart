// Görsel kalite denetimi: her oyunun ana ekranlarında görünen her resmin (img, CSS arka planı, SVG <image>, canvas)
// doğal boyutunu, ekranda çizildiği boyutu × cihaz piksel oranını, büyütme katsayısını ve en/boy bozulmasını ölçer.
//
// Kullanım (önce uygulama derlemesi ve sunucu):
//   npm run build:app
//   npx vite preview --port 4302 --strictPort
//   node scripts/denetim/gorsel-denetim.mjs            # bütün ekranlar × bütün cihazlar
//   node scripts/denetim/gorsel-denetim.mjs pasta okul  # yalnız adı bu sözcüklerle başlayan ekranlar
//
// DENETIM_CIHAZ=<ad> ile yalnız bir cihaz (paralel koşmak için; ozet.mjs hepsini birleştirir).
// Çıktı: tests/screens/denetim-sonuc[-cihaz].json (ham ölçümler) ve tests/screens/denetim-<ekran>-ipad-*.png
// (iPad Pro @2x tam çözünürlük ekran görüntüleri). İkisi de repoya girmez.
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const KOK = process.env.DENETIM_ADRES ?? 'http://localhost:4302/';

const CIHAZLAR = [
  { ad: 'iphone-yatay', w: 932, h: 430, dpr: 3, mobil: true },
  { ad: 'iphone-dikey', w: 430, h: 932, dpr: 3, mobil: true },
  { ad: 'ipad-yatay', w: 1366, h: 1024, dpr: 2, mobil: true, foto: true },
  { ad: 'ipad-dikey', w: 1024, h: 1366, dpr: 2, mobil: true, foto: true },
  { ad: 'android-tablet', w: 1280, h: 800, dpr: 2, mobil: true },
];

// [ad, adres, ek bekleme (ms), hazır seçici?]
const EKRANLAR = [
  ['menu', '?test=1'],
  ['kartlar-acilis', 'kartlar/?test=1'],
  ['kartlar-oyun', 'kartlar/?test=1&ekran=oyun&yas=4&tema=hayvanlar'],
  ['kartlar-oyun-meyveler', 'kartlar/?test=1&ekran=oyun&yas=5&tema=meyveler'],
  ['kartlar-album', 'kartlar/?test=1&ekran=album&yas=4'],
  ['pazar-acilis', 'pazar/?test=1'],
  ['pazar-oyun', 'pazar/?test=1&yas=5&ekran=pazar'],
  ['pazar-meyvesuyu', 'pazar/?test=1&yas=5&ekran=meyvesuyu'],
  ['canlan-acilis', 'canlan/?test=1&yas=5'],
  ['canlan-liste', 'canlan/?test=1&yas=5&ekran=liste'],
  ['canlan-ciz', 'canlan/?test=1&yas=5&ekran=ciz&resim=araba&mod=kopya'],
  ['canlan-muze', 'canlan/?test=1&yas=5&ekran=muze'],
  ['macera-acilis', 'macera/?test=1&yas=5'],
  ['macera-ege', 'macera/?test=1&ekran=bolum&yas=5&bolum=ege'],
  ['macera-banyo', 'macera/?test=1&ekran=bolum&yas=5&bolum=banyo'],
  ['macera-elektrik', 'macera/?test=1&ekran=bolum&yas=5&bolum=elektrik'],
  ['macera-salincak', 'macera/?test=1&ekran=bolum&yas=5&bolum=salincak'],
  ['film-katalog', 'film/?test=1'],
  ['film-mino-karpuz', 'film/?test=1&film=mino-karpuz', 4000],
  ['film-kino-kaydirak', 'film/?test=1&film=kino-kaydirak', 4000],
  // filmin içi: Oynat'a basılır, sahne oynarken ölçülür (pazar / park / ev arka planları)
  ['film-oynuyor-pazar', 'film/?test=1&film=mino-karpuz', 7000, null, 'button:has-text("Oynat")'],
  ['film-oynuyor-park', 'film/?test=1&film=kino-kaydirak', 7000, null, 'button:has-text("Oynat")'],
  ['film-oynuyor-ev', 'film/?test=1&film=kino-oyuncak', 7000, null, 'button:has-text("Oynat")'],
  ['okul-harita', 'okul/?test=1&sifirla=1&yas=5'],
  ['okul-bolge', 'okul/?test=1&yas=5&ekran=bolge'],
  ['okul-album', 'okul/?test=1&yas=5&ekran=album'],
  ...['kac-elma', 'sepete-koy', 'piknik', 'hangisinde-cok', 'merdiven', 'kuslar', 'rakam-ciz', 'sayi-karti', 'bir-fazla', 'kac-alkis'].map(
    (id) => [`okul-${id}`, `okul/?test=1&yas=5&tohum=4&etkinlik=${id}`, 2500],
  ),
  ['pasta-acilis', 'pasta/?test=1&sifirla=1'],
  ['pasta-gun1', 'pasta/?test=1&sifirla=1&ekran=gun&gun=1', 3000, '.ps-musteri.ps-hazir'],
  ['pasta-gun2-siparis', 'pasta/?test=1&sifirla=1&ekran=gun&gun=2', 3000, '.ps-musteri.ps-hazir'],
  ['dedektif-acilis', 'dedektif/?test=1&sifirla=1'],
  ['dedektif-giris', 'dedektif/?test=1&sifirla=1&adim=giris', 2500],
  ['dedektif-iz', 'dedektif/?test=1&sifirla=1&adim=iz', 2500],
  ['dedektif-tuy', 'dedektif/?test=1&sifirla=1&adim=tuy', 2500],
  ['dedektif-nerede', 'dedektif/?test=1&sifirla=1&adim=nerede', 2500],
  ['dedektif-final', 'dedektif/?test=1&sifirla=1&adim=final', 2500],
];

/** Sayfada çalışır: görünen bütün raster görselleri ölçer. */
async function topla(dpr) {
  const vw = innerWidth;
  const vh = innerHeight;
  const sonuc = [];
  const dogal = new Map();
  const boyut = (url) => {
    if (!dogal.has(url))
      dogal.set(
        url,
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
          i.onerror = () => res(null);
          i.src = url;
        }),
      );
    return dogal.get(url);
  };
  const vektor = (u) => /\.svg(\?|#|$)/i.test(u) || u.startsWith('data:image/svg');
  const kisa = (u) => {
    if (u.startsWith('data:')) {
      // gömülü resim: base64 gövdesinin FNV-1a karması (kaynak-bul.mjs repodaki dosyaya aynı karmayla bağlar)
      const g = u.slice(u.indexOf(',') + 1);
      let h = 0x811c9dc5;
      for (let i = 0; i < g.length; i++) h = Math.imul(h ^ g.charCodeAt(i), 0x01000193) >>> 0;
      return `data:${h.toString(16)}`;
    }
    try {
      return new URL(u, location.href).pathname;
    } catch {
      return u;
    }
  };
  const ekranda = (r) => r.width >= 2 && r.height >= 2 && r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh;
  const gorunur = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  // ata zinciri boyunca CSS dönüşümü ölçeği (dönme bağımsız)
  const olcekZinciri = (el) => {
    let sx = 1;
    let sy = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.transform && cs.transform !== 'none') {
        const m = new DOMMatrixReadOnly(cs.transform);
        sx *= Math.hypot(m.a, m.b);
        sy *= Math.hypot(m.c, m.d);
      }
      if (cs.scale && cs.scale !== 'none') {
        const p = cs.scale.split(/\s+/).map(Number);
        sx *= p[0];
        sy *= p[1] ?? p[0];
      }
      const z = Number(cs.zoom);
      if (z && z !== 1) {
        sx *= z;
        sy *= z;
      }
    }
    return { sx, sy };
  };
  const yolAl = (deger, alan) => {
    if (deger === 'auto') return null;
    if (deger.endsWith('%')) return (parseFloat(deger) / 100) * alan;
    return parseFloat(deger);
  };
  const katmanlar = (s) => {
    const p = [];
    let d = 0;
    let b = '';
    for (const c of s) {
      if (c === '(') d++;
      if (c === ')') d--;
      if (c === ',' && d === 0) {
        p.push(b.trim());
        b = '';
      } else b += c;
    }
    if (b.trim()) p.push(b.trim());
    return p;
  };
  const ekle = (o) => {
    const { nw, nh, dw, dh } = o;
    o.gerekW = Math.ceil(dw * dpr);
    o.gerekH = Math.ceil(dh * dpr);
    o.olcek = o.vektor || !nw ? 0 : +Math.max(o.gerekW / nw, o.gerekH / nh).toFixed(3);
    o.bozulma = o.vektor || !nw ? 0 : +Math.abs(dw / dh / (nw / nh) - 1).toFixed(3);
    o.alanOran = +((Math.min(o.rw, vw) * Math.min(o.rh, vh)) / (vw * vh)).toFixed(3);
    sonuc.push(o);
  };
  const bekleyen = [];

  // 1) <img>
  for (const el of document.images) {
    const r = el.getBoundingClientRect();
    if (!ekranda(r) || !gorunur(el)) continue;
    const src = el.currentSrc || el.src;
    if (!src) continue;
    const { sx, sy } = olcekZinciri(el);
    const bw = el.offsetWidth * sx || r.width;
    const bh = el.offsetHeight * sy || r.height;
    const nw = el.naturalWidth;
    const nh = el.naturalHeight;
    const fit = getComputedStyle(el).objectFit;
    let dw = bw;
    let dh = bh;
    if (nw && nh && fit !== 'fill') {
      let s = fit === 'cover' ? Math.max(bw / nw, bh / nh) : Math.min(bw / nw, bh / nh);
      if (fit === 'none') s = sx;
      if (fit === 'scale-down') s = Math.min(s, sx);
      dw = nw * s;
      dh = nh * s;
    }
    ekle({ tur: 'img', src: kisa(src), vektor: vektor(src), nw, nh, dw, dh, rw: r.width, rh: r.height, kural: `object-fit:${fit}`, sinif: el.className?.baseVal ?? el.className });
  }

  // 2) CSS arka planları (öğe + ::before/::after)
  for (const el of document.querySelectorAll('*')) {
    for (const ps of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, ps);
      const bi = cs.backgroundImage;
      if (!bi || !bi.includes('url(')) continue;
      if (ps && (cs.content === 'none' || cs.display === 'none')) continue;
      const r = el.getBoundingClientRect();
      if (!ekranda(r) || !gorunur(el)) continue;
      if (ps && (Number(cs.opacity) === 0 || cs.visibility === 'hidden')) continue;
      let { sx, sy } = olcekZinciri(el);
      let aw;
      let ah;
      if (ps) {
        aw = parseFloat(cs.width) + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        ah = parseFloat(cs.height) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        if (cs.transform && cs.transform !== 'none') {
          const m = new DOMMatrixReadOnly(cs.transform);
          sx *= Math.hypot(m.a, m.b);
          sy *= Math.hypot(m.c, m.d);
        }
        if (!(aw > 0 && ah > 0)) continue;
      } else {
        aw = el.clientWidth || el.offsetWidth || r.width;
        ah = el.clientHeight || el.offsetHeight || r.height;
        if (el instanceof SVGElement) {
          aw = r.width;
          ah = r.height;
          sx = sy = 1;
        }
      }
      const urller = katmanlar(bi);
      const boyutlar = katmanlar(cs.backgroundSize);
      urller.forEach((k, i) => {
        const m = k.match(/^url\(["']?(.*?)["']?\)$/);
        if (!m) return;
        const url = m[1];
        const bs = (boyutlar[i % boyutlar.length] ?? 'auto').trim();
        bekleyen.push(
          boyut(url).then((n) => {
            const nw = n?.w ?? 0;
            const nh = n?.h ?? 0;
            let dw;
            let dh;
            if (bs === 'cover' || bs === 'contain') {
              const s = bs === 'cover' ? Math.max(aw / nw, ah / nh) : Math.min(aw / nw, ah / nh);
              dw = nw * s;
              dh = nh * s;
            } else {
              const [a, b = 'auto'] = bs.split(/\s+/);
              let w = yolAl(a, aw);
              let h = yolAl(b, ah);
              if (w == null && h == null) {
                w = nw;
                h = nh;
              } else if (w == null) w = (h * nw) / nh;
              else if (h == null) h = (w * nh) / nw;
              dw = w;
              dh = h;
            }
            ekle({
              tur: ps ? `bg${ps}` : 'bg',
              src: kisa(url),
              vektor: vektor(url),
              nw,
              nh,
              dw: dw * sx,
              dh: dh * sy,
              rw: aw * sx,
              rh: ah * sy,
              kural: `background-size:${bs}`,
              sinif: (el.className?.baseVal ?? el.className) + (ps ?? ''),
            });
          }),
        );
      });
    }
  }

  // 3) SVG <image>
  for (const el of document.querySelectorAll('image')) {
    const r = el.getBoundingClientRect();
    if (!ekranda(r) || !gorunur(el)) continue;
    const url = el.href?.baseVal || el.getAttribute('href') || el.getAttribute('xlink:href');
    if (!url) continue;
    const ctm = el.getScreenCTM();
    let bb;
    try {
      bb = el.getBBox();
    } catch {
      continue;
    }
    if (!ctm || !bb.width) continue;
    const kx = Math.hypot(ctm.a, ctm.b);
    const ky = Math.hypot(ctm.c, ctm.d);
    const bw = bb.width * kx;
    const bh = bb.height * ky;
    const par = (el.getAttribute('preserveAspectRatio') ?? 'xMidYMid meet').trim();
    const abs = new URL(url, location.href).href;
    bekleyen.push(
      boyut(abs).then((n) => {
        const nw = n?.w ?? 0;
        const nh = n?.h ?? 0;
        let dw = bw;
        let dh = bh;
        if (par !== 'none' && nw) {
          const s = par.includes('slice') ? Math.max(bw / nw, bh / nh) : Math.min(bw / nw, bh / nh);
          dw = nw * s;
          dh = nh * s;
        }
        // grafik ögesinin kendi CSS/SVG dönüşümleri getScreenCTM'de; HTML atalarının CSS ölçeği de dahil
        let p = el.ownerSVGElement;
        while (p?.ownerSVGElement) p = p.ownerSVGElement;
        ekle({ tur: 'svg-image', src: kisa(abs), vektor: vektor(abs), nw, nh, dw, dh, rw: bw, rh: bh, kural: `pAR:${par}`, sinif: (p?.className?.baseVal ?? '') + ' > ' + (el.parentElement?.getAttribute('class') ?? '') });
      }),
    );
  }

  // 4) canvas (arka depo çözünürlüğü)
  for (const el of document.querySelectorAll('canvas')) {
    const r = el.getBoundingClientRect();
    if (!ekranda(r) || !gorunur(el)) continue;
    const { sx, sy } = olcekZinciri(el);
    ekle({ tur: 'canvas', src: `canvas.${el.className || el.id || '?'}`, vektor: false, nw: el.width, nh: el.height, dw: el.offsetWidth * sx, dh: el.offsetHeight * sy, rw: r.width, rh: r.height, kural: '', sinif: el.className });
  }
  await Promise.all(bekleyen);
  // dosya boyutları (sıkıştırma izi)
  const bayt = {};
  for (const e of performance.getEntriesByType('resource')) {
    try {
      bayt[new URL(e.name).pathname] = e.encodedBodySize || e.transferSize || 0;
    } catch {}
  }
  return { sonuc, bayt };
}

const secim = process.argv.slice(2);
// DENETIM_CIHAZ=ipad-yatay: yalnız o cihaz (birkaç süreç paralel koşabilsin); çıktı denetim-sonuc-<cihaz>.json
const cihazSecim = process.env.DENETIM_CIHAZ;
const cihazlar = cihazSecim ? CIHAZLAR.filter((c) => c.ad === cihazSecim) : CIHAZLAR;
const ekranlar = secim.length ? EKRANLAR.filter(([ad]) => secim.some((s) => ad.startsWith(s))) : EKRANLAR;
mkdirSync('tests/screens', { recursive: true });
const tarayici = await chromium.launch();
const kayitlar = [];
const hatalar = [];
for (const c of cihazlar) {
  const ctx = await tarayici.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: c.dpr, isMobile: c.mobil, hasTouch: true, locale: 'tr-TR' });
  for (const [ad, adres, bekle = 1800, secici, tikla] of ekranlar) {
    const page = await ctx.newPage();
    page.on('pageerror', (e) => hatalar.push(`${ad}/${c.ad}: ${e}`));
    try {
      await page.goto(KOK + adres, { waitUntil: 'load', timeout: 60000 });
      // bazı ekranlar (ses ön yüklemesi) ağı uzun süre meşgul tutar: sessizlik beklenir ama şart değil
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      if (tikla) await page.locator(tikla).first().click({ timeout: 15000 });
      if (secici) await page.locator(secici).first().waitFor({ timeout: 20000 }).catch(() => hatalar.push(`${ad}/${c.ad}: ${secici} gelmedi`));
      await page.waitForTimeout(bekle);
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
      const { sonuc, bayt } = await page.evaluate(topla, c.dpr);
      for (const s of sonuc) kayitlar.push({ ekran: ad, cihaz: c.ad, dpr: c.dpr, ...s, bayt: bayt[s.src] ?? null });
      if (c.foto) await page.screenshot({ path: `tests/screens/denetim-${ad}-${c.ad}.png` });
      console.log(`${c.ad} ${ad}: ${sonuc.length} görsel`);
    } catch (e) {
      hatalar.push(`${ad}/${c.ad}: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }
  await ctx.close();
}
await tarayici.close();
writeFileSync(`tests/screens/denetim-sonuc${cihazSecim ? '-' + cihazSecim : ''}.json`, JSON.stringify({ kayitlar, hatalar }, null, 1));
console.log(`toplam ${kayitlar.length} ölçüm; hata ${hatalar.length}`);
for (const h of hatalar) console.log('  ! ' + h);
