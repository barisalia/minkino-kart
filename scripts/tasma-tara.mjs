// Ekrandan taşan / yarıya kesilen düğme taraması (18 Kasım 2026).
//
// Neden: iPad 1024×768, 1180×820, 1194×834 ve 16:10 tablet 1280×800 boylarında birkaç ekranda düğmeler sahnenin altında
// kesiliyor ya da tamamen ekran dışında kalıyordu (Harf yazma, Yaz ve hayvanı çağır, İngilizce selam, Pazar açılışı).
// Testler bunu yakalamıyor çünkü Playwright gizli kalan düğmeye de "force" ile basabiliyor.
//
// Kullanım (geliştirme sunucusu :5173 açıkken):
//   node scripts/tasma-tara.mjs                      → bütün oyunların açılış ekranı, 7 boy
//   node scripts/tasma-tara.mjs pazar,alfabe         → yalnız bu sayfalar
//   node scripts/tasma-tara.mjs pazar 1280x800       → tek boy
// Bir sorun bulunca ekran görüntüsünü test-results/tasma-tara/ içine yazar (depoya girmez).
// Sayılmayanlar: kaydırılabilen listede ekran dışında kalan öğeler (kayan raf, bölüm listesi).
// Bilerek kesilen öğeler de çıkar (ör. alttan kesik Ceren gövdesi, kamerayla gezilen oda): sonucu gözle yorumlayın.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const TUM = 'uygulama,alfabe,matematik,ingilizce,sef,kino-ile-sen-sec,hazirlik,kartlar,canlan,macera,pazar,pasta,pati,giysin,kitap,izle,dedektif,otobus,kino-otobus';
const sayfalar = (process.argv[2] ?? TUM).split(',');
const boylar = (process.argv[3] ?? '1024x768,1180x820,1194x834,1280x800,1366x1024,844x390,667x375').split(',').map((b) => b.split('x').map(Number));
const ADRES = process.env.E2E_ADRES ?? 'http://localhost:5173/';
const CIKTI = 'test-results/tasma-tara';
mkdirSync(CIKTI, { recursive: true });

const tara = (s) => s.evaluate(() => {
  const W = innerWidth, H = innerHeight, sonuc = [];
  const kayar = (o) => /auto|scroll/.test(o.overflow + o.overflowX + o.overflowY);
  const kirpan = (e) => {
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (o.overflow !== 'visible') return Object.assign(p.getBoundingClientRect().toJSON(), { kayar: kayar(o) });
    }
    return { left: 0, top: 0, right: W, bottom: H, kayar: document.scrollingElement.scrollHeight > H + 4 };
  };
  for (const e of document.querySelectorAll('button, a, [role=button]')) {
    const st = getComputedStyle(e);
    if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity < 0.05 || e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 6 || r.height < 6) continue;
    const k = kirpan(e);
    const L = Math.max(0, k.left), T = Math.max(0, k.top), R = Math.min(W, k.right), B = Math.min(H, k.bottom);
    const tasma = Math.max(L - r.left, T - r.top, r.right - R, r.bottom - B);
    const disarida = r.bottom <= T || r.top >= B || r.right <= L || r.left >= R;
    if (tasma > 4 && !(disarida && k.kayar)) {
      const ad = e.getAttribute('aria-label') ?? e.textContent?.trim() ?? '';
      sonuc.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}${ad ? ' [' + ad.slice(0, 24) + ']' : ''} ${Math.round(tasma)} px${disarida ? ' (tamamen dışarıda)' : ''}`);
    }
  }
  return [...new Set(sonuc)].slice(0, 6);
});

const tarayici = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
let sorunlu = 0;
for (const ad of sayfalar) {
  for (const [w, h] of boylar) {
    const s = await tarayici.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await s.addInitScript(() => localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5 })));
    try {
      await s.goto(new URL(ad + '/', ADRES).href, { timeout: 30000 });
      await s.waitForTimeout(2500);
      const bulunan = await tara(s);
      if (bulunan.length) {
        sorunlu++;
        console.log(ad.padEnd(16), `${w}×${h}`.padEnd(10), bulunan.join(' | '));
        await s.screenshot({ path: `${CIKTI}/${ad}-${w}x${h}.png` });
      }
    } catch (hata) {
      console.log(ad.padEnd(16), `${w}×${h}`.padEnd(10), 'AÇILMADI', String(hata).slice(0, 90));
    }
    await s.close();
  }
}
await tarayici.close();
console.log(sorunlu ? `\n${sorunlu} ekran/boy gözle bakılmalı (${CIKTI}/).` : '\nTaşan düğme yok.');
